// src/utils/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: 'https://your-django-api.com/api/', // Update with your API base URL
  timeout: 10000,
});

// Secure Token Management: Function to get the stored token
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Request interceptor to add the Authorization header with the token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      // Ensure headers exist and are an instance of AxiosHeaders
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      } else if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = AxiosHeaders.from(config.headers);
      }
      config.headers.set('Authorization', `Token ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhance Error Handling: Response interceptor to catch errors globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized! Token may have expired.');
      await SecureStore.deleteItemAsync('userToken');
      // Optionally, handle logout or redirect logic here.
    }
    return Promise.reject(error);
  }
);

export default api;
