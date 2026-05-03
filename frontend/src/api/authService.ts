import apiClient from './client';

export const login = async (credentials: any) => {
  const response = await apiClient.post('/auth-service/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_role', response.data.role);
  }
  return response.data;
};

export const signup = async (userData: any) => {
  const response = await apiClient.post('/auth-service/auth/signup', userData);
  return response.data;
};

export const logout = () => {
  localStorage.clear();
};