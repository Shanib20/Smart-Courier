import axiosClient from './axiosClient';

export const notificationApi = {
  getNotifications: async (page = 0, size = 10) => {
    const response = await axiosClient.get(`/gateway/auth/notifications?page=${page}&size=${size}`);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await axiosClient.get('/gateway/auth/notifications/unread-count');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await axiosClient.put(`/gateway/auth/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await axiosClient.put('/gateway/auth/notifications/mark-all-read');
    return response.data;
  }
};
