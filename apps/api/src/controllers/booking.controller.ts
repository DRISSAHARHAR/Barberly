import { BookingPaymentMethod, BookingServiceMode, BookingStatus, PaymentStatus, UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { bookingService } from '../services/booking.service';

export class BookingController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { barberId, serviceType, serviceMode, paymentMethod, price, scheduledAt, address, notes } = req.body;

      const booking = await bookingService.createBooking(req.user.userId, {
        barberId,
        serviceType,
        serviceMode: serviceMode as BookingServiceMode,
        paymentMethod: paymentMethod as BookingPaymentMethod,
        price: Number(price),
        scheduledAt: new Date(scheduledAt),
        address,
        notes
      });

      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  }

  async myBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const bookings = await bookingService.listMyBookings(req.user.userId, req.user.role as UserRole);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { bookingId } = req.params;
      const { status } = req.body;

      const updated = await bookingService.updateBookingStatus(
        bookingId,
        req.user.userId,
        req.user.role as UserRole,
        status as BookingStatus
      );

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async updatePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { paymentStatus } = req.body;

      const updated = await bookingService.updatePaymentStatus(bookingId, paymentStatus as PaymentStatus);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
