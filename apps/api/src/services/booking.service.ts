import { BookingPaymentMethod, BookingServiceMode, BookingStatus, PaymentStatus, UserRole } from '@prisma/client';
import { prisma } from '../config/database';

export class BookingService {
  async createBooking(clientId: string, data: {
    barberId: string;
    serviceType: string;
    serviceMode: BookingServiceMode;
    paymentMethod: BookingPaymentMethod;
    price: number;
    scheduledAt: Date;
    address?: string;
    notes?: string;
  }) {
    const barber = await prisma.user.findUnique({ where: { id: data.barberId } });

    if (!barber || barber.role !== UserRole.BARBER) {
      throw new Error('Barbier non trouvé');
    }

    if (data.serviceMode === BookingServiceMode.HOME && !data.address) {
      throw new Error('Adresse requise pour une réservation à domicile');
    }

    const booking = await prisma.booking.create({
      data: {
        clientId,
        barberId: data.barberId,
        status: BookingStatus.PENDING,
        serviceType: data.serviceType,
        serviceMode: data.serviceMode,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        price: data.price,
        scheduledAt: data.scheduledAt,
        address: data.address,
        notes: data.notes
      }
    });

    return booking;
  }

  async listMyBookings(userId: string, role: UserRole) {
    const where = role === UserRole.BARBER ? { barberId: userId } : { clientId: userId };

    return prisma.booking.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: true
          }
        },
        barber: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: true,
            barberProfile: true
          }
        }
      }
    });
  }

  async updateBookingStatus(bookingId: string, userId: string, role: UserRole, status: BookingStatus) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error('Réservation non trouvée');

    if (role === UserRole.BARBER && booking.barberId !== userId) {
      throw new Error('Accès non autorisé');
    }

    if (role === UserRole.CLIENT && booking.clientId !== userId) {
      throw new Error('Accès non autorisé');
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });
  }

  async updatePaymentStatus(bookingId: string, paymentStatus: PaymentStatus) {
    return prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus } });
  }
}

export const bookingService = new BookingService();
