/**
 * Jigs Events Scanner — Constants & Theme Configuration
 */

// ─── API Configuration ──────────────────────────────────────────────────────────
export const DEFAULT_API_BASE_URL = 'https://jigs-event.onrender.com/api/';

export const API_ENDPOINTS = {
  LOGIN: 'auth/login',
  LOGOUT: 'auth/logout',
  PROFILE: 'auth/profile',
  TOKEN_REFRESH: 'auth/token/refresh',
  VERIFY_TICKET: 'verify-ticket',
} as const;

// ─── Secure Storage Keys ─────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'jigs_access_token',
  REFRESH_TOKEN: 'jigs_refresh_token',
  USER_DATA: 'jigs_user_data',
  API_BASE_URL: 'jigs_api_base_url',
} as const;

// ─── Color Palette ───────────────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  background: '#0B0B12',
  backgroundAlt: '#111827',
  surface: '#1A1A2E',
  surfaceLight: '#232342',
  surfaceBorder: '#2A2A4A',

  // Accents
  primary: '#8B5CF6',
  primaryLight: '#C084FC',
  accent: '#FF8DC7',
  accentGlow: 'rgba(139, 92, 246, 0.3)',

  // Status
  success: '#22C55E',
  successGlow: 'rgba(34, 197, 94, 0.25)',
  successDark: '#166534',
  error: '#EF4444',
  errorGlow: 'rgba(239, 68, 68, 0.25)',
  errorDark: '#991B1B',
  warning: '#F59E0B',
  warningGlow: 'rgba(245, 158, 11, 0.25)',

  // Text
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#0B0B12',

  // Scanner
  scannerBracket: '#8B5CF6',
  scannerLine: '#C084FC',
  scannerGlow: 'rgba(192, 132, 252, 0.4)',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────────
export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    hero: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────────
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Scanner Config ──────────────────────────────────────────────────────────────
export const SCANNER_CONFIG = {
  SCAN_COOLDOWN_MS: 3000,       // Prevent rapid duplicate scans
  AUTO_RETURN_MS: 4000,         // Auto-return to scanner after result
  SCAN_AREA_SIZE: 260,          // Scanner frame size in px
  BRACKET_SIZE: 30,             // Corner bracket length
  BRACKET_THICKNESS: 4,         // Corner bracket width
} as const;

// ─── Allowed Roles ───────────────────────────────────────────────────────────────
export const ALLOWED_ROLES = ['organizer', 'admin', 'scanner_staff'] as const;

// ─── Types ───────────────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'organizer' | 'scanner_staff' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  profile_image?: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface TicketVerifySuccess {
  valid: true;
  ticket_id: string;
  status: string;
  attendee: string;
  email: string;
  event: string;
  event_date: string;
  event_time: string;
  venue: string;
  checked_in_at: string;
  ticket_type: string;
  seat_info: string;
}

export interface TicketVerifyFailure {
  valid: false;
  reason?: string;
  error: string;
  attendee?: string;
  event?: string;
  event_date?: string;
  checked_in_at?: string;
}

export type TicketVerifyResult = TicketVerifySuccess | TicketVerifyFailure;

export interface ScanHistoryItem {
  id: string;
  ticketId: string;
  attendeeName: string;
  eventName: string;
  scannedAt: Date;
  isValid: boolean;
  reason?: string;
}
