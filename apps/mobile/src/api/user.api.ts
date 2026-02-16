import apiClient from './client';

export const userApi = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data: Record<string, unknown>) => apiClient.put('/users/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/users/change-password', { currentPassword, newPassword }),
  searchBarbers: (params: Record<string, unknown>) => apiClient.get('/users/barbers/search', { params })
};
