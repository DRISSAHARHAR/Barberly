import { Router } from 'express';
import { BookingStatus } from '@prisma/client';
import { bookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, bookingController.create.bind(bookingController));
router.get('/me', authenticate, bookingController.myBookings.bind(bookingController));
router.patch('/:bookingId/status', authenticate, bookingController.updateStatus.bind(bookingController));
router.patch('/:bookingId/payment', authenticate, authorize('ADMIN'), bookingController.updatePayment.bind(bookingController));

router.get('/meta', (_req, res) => {
  res.json({
    statuses: Object.values(BookingStatus),
    serviceModes: ['HOME', 'SALON'],
    paymentMethods: ['CASH', 'ONLINE']
  });
});

export default router;
