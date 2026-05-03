import axiosClient from './axiosClient';

export const deliveryApi = {
  createDelivery: async (payload) => {
    const response = await axiosClient.post('/gateway/deliveries', payload);
    return response.data;
  },
  getMyDeliveries: async (page = 0, size = 10) => {
    const response = await axiosClient.get(`/gateway/deliveries/my?page=${page}&size=${size}`);
    return response.data;
  },
  getDeliveryById: async (id) => {
    const response = await axiosClient.get(`/gateway/deliveries/${id}`);
    return response.data;
  },
  trackByNumber: async (trackingNumber) => {
    const response = await axiosClient.get(`/gateway/deliveries/track/${trackingNumber}`);
    return response.data;
  },
  cancelDelivery: async (id) => {
    const response = await axiosClient.put(`/gateway/deliveries/${id}/cancel`);
    return response.data;
  },
  getAllDeliveries: async (page = 0, size = 10, query = '') => {
    const url = `/gateway/deliveries/all?page=${page}&size=${size}${query ? `&query=${encodeURIComponent(query)}` : ''}`;
    const response = await axiosClient.get(url);
    return response.data;
  },
  updateDeliveryStatus: async (id, statusData) => {
    const response = await axiosClient.put(`/gateway/deliveries/${id}/status`, statusData);
    return response.data;
  },
  updateDelivery: async (id, payload) => {
    const response = await axiosClient.put(`/gateway/deliveries/${id}`, payload);
    return response.data;
  },
  getQuote: async (fromPincode, toPincode, weight) => {
    const response = await axiosClient.get(`/gateway/deliveries/pricing/quote?fromPincode=${fromPincode}&toPincode=${toPincode}&weight=${weight}`);
    return response.data;
  },
  sendReceipt: async (id) => {
    const response = await axiosClient.post(`/gateway/deliveries/${id}/receipt`);
    return response.data;
  },
  // Hub Management
  getAllHubs: async (page = 0, size = 10, query = '') => {
    const url = `/gateway/deliveries/hubs?page=${page}&size=${size}${query ? `&query=${encodeURIComponent(query)}` : ''}`;
    const response = await axiosClient.get(url);
    return response.data;
  },
  getActiveHubs: async () => {
    const response = await axiosClient.get('/gateway/deliveries/hubs/active');
    return response.data;
  },
  createHub: async (payload) => {
    const response = await axiosClient.post('/gateway/deliveries/hubs', payload);
    return response.data;
  },
  toggleHubStatus: async (id) => {
    const response = await axiosClient.put(`/gateway/deliveries/hubs/${id}/toggle`);
    return response.data;
  },
  deleteHub: async (id) => {
    const response = await axiosClient.delete(`/gateway/deliveries/hubs/${id}`);
    return response.data;
  }
};
