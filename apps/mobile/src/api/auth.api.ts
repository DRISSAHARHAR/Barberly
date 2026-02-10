import apiClient from './client';

export interface RegisterData {
  phone: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'BARBER';
}

export interface LoginData {
  phone: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) => apiClient.post('/auth/register', data),
  verifyOTP: (userId: string, code: string) => apiClient.post('/auth/verify-otp', { userId, code }),
  resendOTP: (userId: string) => apiClient.post('/auth/resend-otp', { userId }),
  login: (data: LoginData) => apiClient.post('/auth/login', data),
  refreshToken: (refreshToken: string) => apiClient.post('/auth/refresh-token', { refreshToken }),
  logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),
  forgotPassword: (phone: string) => apiClient.post('/auth/forgot-password', { phone }),
  resetPassword: (phone: string, code: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { phone, code, newPassword })
};
