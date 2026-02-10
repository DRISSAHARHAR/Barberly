import { prisma } from '../config/database';
import { comparePassword, hashPassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    });

    const tokens = generateTokens(user.id, user.email);

    return { user, tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = generateTokens(user.id, user.email);

    return { user, tokens };
  }
}

export const authService = new AuthService();
