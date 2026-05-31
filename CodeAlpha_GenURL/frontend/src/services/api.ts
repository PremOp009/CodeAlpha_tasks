/**
 * API service layer for communicating with the Flask backend.
 */

import axios from 'axios';
import type { ShortenResponse, HistoryItem } from '../types';

const BASE_URL = 'https://codealpha-genurl.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Shorten a URL — optionally with a custom alias.
 */
export async function shortenUrl(
  url: string,
  customAlias?: string
): Promise<ShortenResponse> {
  const payload: Record<string, string> = { url };
  if (customAlias && customAlias.trim()) {
    payload.custom_alias = customAlias.trim();
  }
  const response = await api.post<ShortenResponse>('/shorten', payload);
  return response.data;
}

/**
 * Fetch the full URL history (most recent first).
 */
export async function getHistory(limit = 50): Promise<HistoryItem[]> {
  const response = await api.get<HistoryItem[]>('/history', {
    params: { limit },
  });
  return response.data;
}

/**
 * Health check — returns true if backend is reachable.
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}

export { BASE_URL };
