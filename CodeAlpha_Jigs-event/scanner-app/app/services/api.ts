/**
 * Axios API client with JWT authentication interceptors.
 * Automatically attaches Bearer token and refreshes on 401.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { DEFAULT_API_BASE_URL, STORAGE_KEYS, API_ENDPOINTS } from '../utils/constants';

let cachedBaseUrl: string | null = null;

/**
 * Get the configured API base URL (from SecureStore or default).
 */
export const getBaseUrl = async (): Promise<string> => {
  if (cachedBaseUrl) return cachedBaseUrl;
  
  // During development, always use the default (which we updated to the host IP).
  // This prevents cached 'localhost' values in SecureStore from breaking the app.
  if (__DEV__) {
    cachedBaseUrl = DEFAULT_API_BASE_URL;
    return cachedBaseUrl;
  }

  try {
    const stored = await SecureStore.getItemAsync(STORAGE_KEYS.API_BASE_URL);
    cachedBaseUrl = stored || DEFAULT_API_BASE_URL;
  } catch {
    cachedBaseUrl = DEFAULT_API_BASE_URL;
  }
  return cachedBaseUrl;
};

/**
 * Update the base URL (called from Settings screen).
 */
export const setBaseUrl = async (url: string): Promise<void> => {
  const normalized = url.endsWith('/') ? url : url + '/';
  await SecureStore.setItemAsync(STORAGE_KEYS.API_BASE_URL, normalized);
  cachedBaseUrl = normalized;
  api.defaults.baseURL = normalized;
};

// ─── Create Axios instance ───────────────────────────────────────────────────────
const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Ensure base URL is up-to-date
    const baseUrl = await getBaseUrl();
    config.baseURL = baseUrl;

    // Attach token (skip for login/register)
    const skipAuth = [API_ENDPOINTS.LOGIN, 'auth/register'].some(
      (ep) => config.url?.includes(ep)
    );

    if (!skipAuth) {
      try {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Token retrieval failed — continue without auth
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 with token refresh ─────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401 and not already retrying
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh-token request itself, or the login request
    if (
      originalRequest.url?.includes(API_ENDPOINTS.TOKEN_REFRESH) ||
      originalRequest.url?.includes(API_ENDPOINTS.LOGIN)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(
        `${await getBaseUrl()}${API_ENDPOINTS.TOKEN_REFRESH}`,
        { refresh: refreshToken }
      );

      const newAccessToken = data.access;
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

      if (data.refresh) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
      }

      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      // Clear tokens on refresh failure (force re-login)
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
