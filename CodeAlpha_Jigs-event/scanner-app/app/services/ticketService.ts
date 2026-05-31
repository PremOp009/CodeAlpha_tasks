/**
 * Ticket verification service — sends scanned QR data to backend for validation.
 */
import api from './api';
import { API_ENDPOINTS, TicketVerifyResult } from '../utils/constants';

/**
 * Parse the QR code data to extract the ticket_id.
 *
 * Supports two formats:
 *  1. Existing: "JIGS-TICKET:JIGS-XXXXXXXX|EVENT:Event Title"
 *  2. Simple:   "JIGS-XXXXXXXX" (direct ticket ID)
 */
export const parseQRData = (rawData: string): string | null => {
  if (!rawData || typeof rawData !== 'string') return null;

  const trimmed = rawData.trim();

  // Format 1: Full QR string — extract ticket_id after "JIGS-TICKET:"
  if (trimmed.startsWith('JIGS-TICKET:')) {
    const pipeIdx = trimmed.indexOf('|');
    const ticketId = pipeIdx > 0
      ? trimmed.substring(12, pipeIdx)
      : trimmed.substring(12);
    return ticketId.trim() || null;
  }

  // Format 2: Direct ticket ID (e.g., "JIGS-A1B2C3D4")
  if (trimmed.startsWith('JIGS-')) {
    return trimmed;
  }

  // Format 3: Try parsing as JSON  { "ticket_id": "..." }
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.ticket_id) return parsed.ticket_id;
  } catch {
    // Not JSON — ignore
  }

  // Unknown format
  return null;
};

/**
 * Verify a ticket via the backend API.
 */
export const verifyTicket = async (ticketId: string): Promise<TicketVerifyResult> => {
  try {
    const { data } = await api.post(API_ENDPOINTS.VERIFY_TICKET, {
      ticket_id: ticketId,
    });
    return data as TicketVerifyResult;
  } catch (error: any) {
    // The backend returns structured error responses for invalid tickets
    if (error.response?.data) {
      return error.response.data as TicketVerifyResult;
    }

    // Network or unexpected error
    return {
      valid: false,
      reason: 'network_error',
      error: error.message || 'Unable to connect to server. Check your network.',
    };
  }
};
