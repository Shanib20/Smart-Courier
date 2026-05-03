import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Points to the API Gateway
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include Auth token from Auth Service
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export default apiClient;