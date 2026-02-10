import { Gender, UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { comparePassword, hashPassword } from '../utils/password';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        barberProfile: {
          include: {
            services: true,
            availability: true,
            portfolio: true
          }
        }
      }
    });

    if (!user) throw new Error('Utilisateur non trouvé');

    const { password, otpCode, ...profile } = user;
    void password;
    void otpCode;
    return profile;
  }

  async updateClientProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
      dateOfBirth?: Date;
      gender?: Gender;
      address?: string;
      city?: string;
      coordinates?: { lat: number; lng: number };
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) throw new Error('Utilisateur non trouvé');

    return prisma.profile.update({
      where: { userId },
      data: {
        ...data,
        coordinates: data.coordinates ?? undefined
      }
    });
  }

  async updateBarberProfile(
    userId: string,
    data: {
      businessName?: string;
      description?: string;
      experience?: number;
      workRadius?: number;
      basePrice?: number;
      isAvailable?: boolean;
      avatar?: string;
      address?: string;
      city?: string;
      coordinates?: { lat: number; lng: number };
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { barberProfile: true, profile: true }
    });

    if (!user || user.role !== UserRole.BARBER) throw new Error('Profil barbier non trouvé');

    if (data.avatar || data.address || data.city || data.coordinates) {
      await prisma.profile.update({
        where: { userId },
        data: {
          avatar: data.avatar,
          address: data.address,
          city: data.city,
          coordinates: data.coordinates ?? undefined
        }
      });
    }

    return prisma.barberProfile.update({
      where: { userId },
      data: {
        businessName: data.businessName,
        description: data.description,
        experience: data.experience,
        workRadius: data.workRadius,
        basePrice: data.basePrice,
        isAvailable: data.isAvailable
      }
    });
  }

  async addService(barberId: string, data: { name: string; description?: string; price: number; duration: number; category: string }) {
    return prisma.barberService.create({ data: { barberId, ...data } });
  }

  async updateService(
    serviceId: string,
    barberId: string,
    data: Partial<{ name: string; description: string; price: number; duration: number; category: string }>
  ) {
    const service = await prisma.barberService.findFirst({ where: { id: serviceId, barberId } });
    if (!service) throw new Error('Service non trouvé');

    return prisma.barberService.update({ where: { id: serviceId }, data });
  }

  async deleteService(serviceId: string, barberId: string) {
    await prisma.barberService.deleteMany({ where: { id: serviceId, barberId } });
    return { message: 'Service supprimé' };
  }

  async updateAvailability(
    barberId: string,
    availabilities: Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>
  ) {
    await prisma.availability.deleteMany({ where: { barberId } });
    return prisma.availability.createMany({ data: availabilities.map((a) => ({ ...a, barberId })) });
  }

  async addPortfolioImage(barberId: string, imageUrl: string, caption?: string) {
    const count = await prisma.portfolioImage.count({ where: { barberId } });

    return prisma.portfolioImage.create({
      data: { barberId, imageUrl, caption, order: count }
    });
  }

  async deletePortfolioImage(imageId: string, barberId: string) {
    await prisma.portfolioImage.deleteMany({ where: { id: imageId, barberId } });
    return { message: 'Image supprimée' };
  }

  async searchBarbers(filters: {
    lat?: number;
    lng?: number;
    radius?: number;
    city?: string;
    minRating?: number;
    maxPrice?: number;
    service?: string;
  }) {
    const where: Record<string, unknown> = {
      role: UserRole.BARBER,
      status: UserStatus.ACTIVE,
      barberProfile: {
        isAvailable: true
      }
    };

    if (filters.city) {
      where.profile = { city: { contains: filters.city, mode: 'insensitive' } };
    }

    const barbers = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        barberProfile: {
          include: {
            services: filters.maxPrice
              ? {
                  where: { price: { lte: filters.maxPrice } }
                }
              : true,
            portfolio: { take: 3 }
          }
        }
      },
      take: 20
    });

    return barbers.map((b) => {
      const { password, ...safe } = b;
      void password;
      return safe;
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new Error('Mot de passe actuel incorrect');

    const hashedNewPassword = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedNewPassword } });

    await prisma.session.deleteMany({ where: { userId } });

    return { message: 'Mot de passe changé avec succès' };
  }
}

export const userService = new UserService();
