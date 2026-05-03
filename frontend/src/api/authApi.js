import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosClient.post('/gateway/auth/login', credentials);
    return response.data;
  },
  signup: async (userData) => {
    const response = await axiosClient.post('/gateway/auth/signup', userData);
    return response.data;
  },
  verifyEmail: async (data) => {
    const response = await axiosClient.post('/gateway/auth/verify-email', data);
    return response.data;
  },
  verify2FA: async (data) => {
    const response = await axiosClient.post('/gateway/auth/verify-2fa', data);
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await axiosClient.post('/gateway/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token, newPassword) => {
    const response = await axiosClient.post('/gateway/auth/reset-password', { token, newPassword });
    return response.data;
  },
  forceChangePassword: async (data) => {
    const response = await axiosClient.post('/gateway/auth/force-change-password', data);
    return response.data;
  },
  // Admin User Management
  getUsers: async (page = 0, size = 10, role = '') => {
    const url = `/gateway/auth/admin/users?page=${page}&size=${size}${role ? `&role=${role}` : ''}`;
    const response = await axiosClient.get(url);
    return response.data;
  },
  getUserActivity: async (id) => {
    const response = await axiosClient.get(`/gateway/auth/admin/users/${id}/activity`);
    return response.data;
  },
  toggleSuspend: async (id) => {
    const response = await axiosClient.patch(`/gateway/auth/admin/users/${id}/suspend`);
    return response.data;
  },
  inviteAdmin: async (payload) => {
    const response = await axiosClient.post('/gateway/auth/admin/users/invite', payload);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/gateway/auth/admin/users/${id}`);
    return response.data;
  }
};
