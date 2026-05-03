import apiClient from '../api/client';

export const getTrackingInfo = async (trackingId: string) => {
  const response = await apiClient.get(`/tracking-service/api/v1/track/${trackingId}`);
  return response.data;
};

/**
 * Uploads delivery proof images.
 * Leverages Axios's automatic FormData serialization.
 */
export const uploadDeliveryProof = async (trackingId: string, file: File) => {
  return apiClient.postForm(`/tracking-service/api/v1/upload/${trackingId}`, {
    file: file
  }, {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        console.log(`Upload Progress: ${Math.round((progressEvent.loaded * 100) / progressEvent.total)}%`);
      }
    }
  });
};