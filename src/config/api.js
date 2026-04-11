import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Backend base URL (must include /api path).
 * Priority:
 * 1. EXPO_PUBLIC_API_URL (from .env or EAS build secrets)
 * 2. extra.apiUrl from app.config.js
 * 3. Dev defaults: Android emulator → 10.0.2.2, iOS simulator → localhost
 *
 * Physical device on LAN: create mobile-app/.env with:
 * EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:5000/api
 */
const pickUrl = (v) =>
  typeof v === 'string' && v.trim().length > 0 ? v.trim().replace(/\/$/, '') : null;

const getApiUrl = () => {
  const resolved = pickUrl(process.env.EXPO_PUBLIC_API_URL) || pickUrl(Constants.expoConfig?.extra?.apiUrl);
  if (resolved) {
    return resolved;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  }

  // Release APK: set EXPO_PUBLIC_API_URL at build time (see mobile-app/.env.example)
  console.warn(
    '[api] EXPO_PUBLIC_API_URL is not set. Set it in EAS env or .env before building a release APK.'
  );
  return 'http://10.0.2.2:5000/api';
};

const API_URL = getApiUrl();

if (__DEV__) {
  console.log('API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
    }

    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        url: API_URL,
        platform: Platform.OS,
      });
      error.message = `Cannot connect to server. Check backend is running and API URL matches your setup.\nCurrent: ${API_URL}`;
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
