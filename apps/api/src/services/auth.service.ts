import crypto from 'crypto';
import { UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { comparePassword, hashPassword } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  async register(data: {
    phone: string;
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }]
      }
    });

    if (existingUser) {
      throw new Error('Cet email ou numéro de téléphone est déjà utilisé');
    }

    const hashedPassword = await hashPassword(data.password);
    const otpCode = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
        status: UserStatus.PENDING,
        otpCode,
        otpExpiresAt,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName
          }
        },
        ...(data.role === UserRole.BARBER && {
          barberProfile: {
            create: {
              businessName: `${data.firstName} ${data.lastName}`
            }
          }
        })
      },
      include: {
        profile: true,
        barberProfile: true
      }
    });

    await this.sendOTP(user.phone, otpCode);

    return {
      userId: user.id,
      message: "Inscription réussie. Veuillez vérifier votre téléphone pour l'OTP."
    };
  }

  async verifyOTP(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error('Utilisateur non trouvé');
    if (user.otpCode !== code) throw new Error('Code OTP invalide');
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) throw new Error('Code OTP expiré');

    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        status: UserStatus.ACTIVE,
        otpCode: null,
        otpExpiresAt: null
      }
    });

    return { message: 'Compte vérifié avec succès' };
  }

  async resendOTP(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error('Utilisateur non trouvé');
    if (user.isVerified) throw new Error('Compte déjà vérifié');

    const otpCode = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({ where: { id: userId }, data: { otpCode, otpExpiresAt } });
    await this.sendOTP(user.phone, otpCode);

    return { message: 'Nouveau code OTP envoyé' };
  }

  async login(phone: string, password: string, deviceInfo?: { device?: string; ipAddress?: string }) {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { profile: true, barberProfile: true }
    });

    if (!user) throw new Error('Numéro de téléphone ou mot de passe incorrect');
    if (!user.isVerified) throw new Error('Compte non vérifié. Veuillez vérifier votre OTP.');
    if (user.status === UserStatus.SUSPENDED) throw new Error('Compte suspendu');
    if (user.status === UserStatus.BANNED) throw new Error('Compte banni');

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) throw new Error('Numéro de téléphone ou mot de passe incorrect');

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        device: deviceInfo?.device,
        ipAddress: deviceInfo?.ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const session = await prisma.session.findUnique({ where: { token: refreshToken } });

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Session invalide');
      }

      const newTokens = generateTokens({
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      });

      await prisma.session.update({
        where: { token: refreshToken },
        data: {
          token: newTokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return newTokens;
    } catch (_error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  async logout(refreshToken: string) {
    await prisma.session.deleteMany({ where: { token: refreshToken } });
    return { message: 'Déconnexion réussie' };
  }

  async logoutAll(userId: string) {
    await prisma.session.deleteMany({ where: { userId } });
    return { message: 'Déconnexion de tous les appareils réussie' };
  }

  async forgotPassword(phone: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw new Error('Numéro de téléphone non trouvé');

    const resetCode = this.generateOTP();
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: resetCode,
        otpExpiresAt: resetExpiresAt
      }
    });

    await this.sendOTP(user.phone, resetCode, 'reset');

    return { message: 'Code de réinitialisation envoyé' };
  }

  async resetPassword(phone: string, code: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw new Error('Utilisateur non trouvé');
    if (user.otpCode !== code) throw new Error('Code invalide');
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) throw new Error('Code expiré');

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpiresAt: null
      }
    });

    await prisma.session.deleteMany({ where: { userId: user.id } });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private async sendOTP(phone: string, code: string, type: 'verification' | 'reset' = 'verification') {
    console.log(`📱 OTP ${type} pour ${phone}: ${code}`);
  }

  private sanitizeUser(user: Record<string, unknown>) {
    const { password, otpCode, ...safeUser } = user;
    void password;
    void otpCode;
    return safeUser;
  }
}

export const authService = new AuthService();
