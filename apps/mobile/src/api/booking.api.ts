import apiClient from './client';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BookingServiceMode = 'HOME' | 'SALON';
export type BookingPaymentMethod = 'CASH' | 'ONLINE';

export const bookingApi = {
  create: (data: {
    barberId: string;
    serviceType: string;
    serviceMode: BookingServiceMode;
    paymentMethod: BookingPaymentMethod;
    price: number;
    scheduledAt: string;
    address?: string;
    notes?: string;
  }) => apiClient.post('/bookings', data),
  myBookings: () => apiClient.get('/bookings/me'),
  updateStatus: (bookingId: string, status: BookingStatus) => apiClient.patch(`/bookings/${bookingId}/status`, { status })
};
