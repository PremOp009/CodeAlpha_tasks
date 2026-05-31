/**
 * Shared TypeScript interfaces and types for the URL Shortener app.
 */

/** Response from POST /shorten */
export interface ShortenResponse {
  short_url: string;
  short_code: string;
  clicks: number;
  already_exists: boolean;
}

/** One item in the /history response */
export interface HistoryItem {
  id: number;
  original_url: string;
  short_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
}

/** Stats response from GET /stats/<short_code> */
export interface StatsResponse extends HistoryItem {}

/** Error response from the API */
export interface ApiError {
  error: string;
}

/** Combined result stored in component state after shortening */
export interface ShortenResult extends ShortenResponse {
  original_url: string;
}

/** Notification toast types */
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
