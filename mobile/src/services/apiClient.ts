import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebase/config';

// Detect default backend host
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Physical Android device connects to host machine via LAN IP
  if (Platform.OS === 'android') {
    return 'http://172.16.17.113:8000';
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
      return headers;
    }
  } catch (e) {
    // Continue to AsyncStorage fallback
  }

  try {
    const stored = await AsyncStorage.getItem('@voltflow_user_profile');
    if (stored) {
      const u = JSON.parse(stored);
      if (u && u.id) {
        headers['Authorization'] = `Bearer demo-token:${u.id}`;
        return headers;
      }
    }
  } catch (e) {
    // ignore
  }

  headers['Authorization'] = 'Bearer demo-token';
  return headers;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();

  const config: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorDetail = errorJson.detail;
        }
      } catch {
        // use default statusText
      }
      const error: any = new Error(errorDetail);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (err: any) {
    // Re-throw with status if available
    throw err;
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};
