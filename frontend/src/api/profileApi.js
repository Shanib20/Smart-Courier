import axiosClient from './axiosClient';

const BASE_URL = '/gateway/auth/profile';

export const profileApi = {
  getProfile: async () => {
    const response = await axiosClient.get(BASE_URL);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosClient.put(BASE_URL, data);
    return response.data;
  },

  updatePassword: async (data) => {
    const response = await axiosClient.put(`${BASE_URL}/password`, data);
    return response.data;
  },

  toggle2FA: async (enabled) => {
    const response = await axiosClient.put(`${BASE_URL}/2fa?enabled=${enabled}`);
    return response.data;
  },
  updateNotifications: async (settings) => {
    const response = await axiosClient.put(`${BASE_URL}/notifications`, settings);
    return response.data;
  },

  updateProfilePhoto: async (photoBase64) => {
    const response = await axiosClient.post(`${BASE_URL}/photo`, { photoBase64 });
    return response.data;
  },

  addAddress: async (data) => {
    const response = await axiosClient.post(`${BASE_URL}/addresses`, data);
    return response.data;
  },

  updateAddress: async (id, data) => {
    const response = await axiosClient.put(`${BASE_URL}/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await axiosClient.delete(`${BASE_URL}/addresses/${id}`);
    return response.data;
  },
  deleteAccount: async (password) => {
    const response = await axiosClient.delete(`${BASE_URL}`, { data: { password } });
    return response.data;
  }
};
