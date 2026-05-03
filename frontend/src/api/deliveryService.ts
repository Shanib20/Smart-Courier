import apiClient from './client';

export const createDelivery = async (deliveryData: any) => {
  const response = await apiClient.post('/delivery-service/deliveries', deliveryData);
  return response.data;
};

export const getMyDeliveries = async () => {
  const response = await apiClient.get('/delivery-service/deliveries/my');
  return response.data;
};

export const getDeliveryByTracking = async (trackingNumber: string) => {
  const response = await apiClient.get(`/delivery-service/deliveries/track/${trackingNumber}`);
  return response.data;
};

export const updateDeliveryStatus = async (id: string, status: string) => {
  const response = await apiClient.put(`/delivery-service/deliveries/${id}/status`, { status });
  return response.data;
};