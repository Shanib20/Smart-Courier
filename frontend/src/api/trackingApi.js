import axiosClient from './axiosClient';

export const trackingApi = {
  getTrackingEvents: async (trackingNumber) => {
    const response = await axiosClient.get(`/gateway/tracking/${trackingNumber}`);
    return response.data;
  },
  addTrackingEvent: async (payload) => {
    const response = await axiosClient.post('/gateway/tracking/events', payload);
    return response.data;
  },
  uploadDocument: async (file, trackingNumber) => {
    // Determine the path based on user instructions: POST /gateway/tracking/documents/upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('trackingNumber', trackingNumber);
    
    // Do not set Content-Type, let Axios handle the boundary configuration automatically
    const response = await axiosClient.post('/gateway/tracking/documents/upload', formData);
    return response.data;
  },
  getDocuments: async (trackingNumber) => {
    const response = await axiosClient.get(`/gateway/tracking/documents/${trackingNumber}`);
    return response.data;
  },
  addProof: async (payload) => {
    const response = await axiosClient.post('/gateway/tracking/proof', payload);
    return response.data;
  },
  getProof: async (trackingNumber) => {
    const response = await axiosClient.get(`/gateway/tracking/proof/${trackingNumber}`);
    return response.data;
  }
};
