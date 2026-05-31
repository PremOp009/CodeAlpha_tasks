/**
 * Authentication service — login, logout, token management via expo-secure-store.
 */
import * as SecureStore from 'expo-secure-store';
import api from './api';
import {
  API_ENDPOINTS,
  STORAGE_KEYS,
  LoginResponse,
  User,
  AuthTokens,
  ALLOWED_ROLES,
} from '../utils/constants';

/**
 * Login with email + password. Validates role before storing tokens.
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await api.post(API_ENDPOINTS.LOGIN, { email, password });

  const user: User = data.user;

  // Role gate — only allowed roles can use the scanner
  if (!ALLOWED_ROLES.includes(user.role as any)) {
    throw new Error(
      `Access denied. Your role "${user.role}" is not authorized to use the scanner app. ` +
      `Only organizers, admins, and scanner staff can log in.`
    );
  }

  // Store tokens securely
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.access);
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

  return {
    access: data.access,
    refresh: data.refresh,
    user,
  };
};

/**
 * Logout — blacklist refresh token and clear local storage.
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      await api.post(API_ENDPOINTS.LOGOUT, { refresh: refreshToken });
    }
  } catch {
    // Ignore server-side logout errors
  } finally {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  }
};

/**
 * Get stored tokens (for auto-login check).
 */
export const getStoredTokens = async (): Promise<AuthTokens | null> => {
  try {
    const access = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    const refresh = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    if (access && refresh) {
      return { access, refresh };
    }
  } catch {
    // Retrieval failed
  }
  return null;
};

/**
 * Get stored user data.
 */
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    if (userData) {
      return JSON.parse(userData) as User;
    }
  } catch {
    // Parse failed
  }
  return null;
};

/**
 * Fetch fresh profile from server (validates token is still valid).
 */
export const getProfile = async (): Promise<User> => {
  const { data } = await api.get(API_ENDPOINTS.PROFILE);
  return data as User;
};
