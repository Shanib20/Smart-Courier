import axiosClient from './axiosClient';

export const adminApi = {
  getDashboard: async () => {
    const response = await axiosClient.get('/gateway/admin/dashboard');
    return response.data;
  },
  getReports: async () => {
    const response = await axiosClient.get('/gateway/admin/reports');
    return response.data;
  },
  getHealth: async () => {
    const response = await axiosClient.get('/gateway/admin/system/health');
    return response.data;
  },
  getRecentActivity: async () => {
    const response = await axiosClient.get('/gateway/admin/recent-activity');
    return response.data;
  },
  getAnalytics: async (range = 7) => {
    const response = await axiosClient.get(`/gateway/deliveries/analytics/summary?range=${range}`);
    return response.data;
  },
  getAdminDeliveries: async () => {
    const response = await axiosClient.get('/gateway/admin/deliveries');
    return response.data;
  },
  resolveDelivery: async (id, action) => {
    const response = await axiosClient.put(`/gateway/admin/deliveries/${id}/resolve?action=${action}`);
    return response.data;
  },
  createHub: async (payload) => {
    const response = await axiosClient.post('/gateway/admin/hubs', payload);
    return response.data;
  },
  getHubs: async () => {
    const response = await axiosClient.get('/gateway/admin/hubs');
    return response.data;
  },
  deactivateHub: async (id) => {
    const response = await axiosClient.put(`/gateway/admin/hubs/${id}/deactivate`);
    return response.data;
  }
};
