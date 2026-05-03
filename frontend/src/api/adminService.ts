import apiClient from './client';

export const getDashboardStats = async () => {
  const response = await apiClient.get('/admin-service/admin/dashboard');
  return response.data;
};

export const getAllHubs = async () => {
  const response = await apiClient.get('/admin-service/admin/hubs');
  return response.data;
};