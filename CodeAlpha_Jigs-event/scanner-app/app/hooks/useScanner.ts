/**
 * useScanner hook — manages QR scanning logic with cooldown, vibration, and history.
 */
import { useState, useRef, useCallback } from 'react';
import { Vibration, Platform } from 'react-native';
import { parseQRData, verifyTicket } from '../services/ticketService';
import {
  TicketVerifyResult,
  ScanHistoryItem,
  SCANNER_CONFIG,
} from '../utils/constants';

interface UseScannerReturn {
  isProcessing: boolean;
  lastResult: TicketVerifyResult | null;
  scanHistory: ScanHistoryItem[];
  handleBarCodeScanned: (data: string) => Promise<TicketVerifyResult | null>;
  clearLastResult: () => void;
  clearHistory: () => void;
  canScan: boolean;
}

export const useScanner = (): UseScannerReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<TicketVerifyResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [canScan, setCanScan] = useState(true);
  const lastScanTime = useRef<number>(0);
  const lastScannedData = useRef<string>('');

  /**
   * Process a scanned QR code barcode.
   */
  const handleBarCodeScanned = useCallback(async (data: string): Promise<TicketVerifyResult | null> => {
    const now = Date.now();

    // Cooldown check — prevent rapid duplicate scans
    if (now - lastScanTime.current < SCANNER_CONFIG.SCAN_COOLDOWN_MS) {
      return null;
    }

    // Same QR scanned again within cooldown
    if (data === lastScannedData.current && now - lastScanTime.current < SCANNER_CONFIG.SCAN_COOLDOWN_MS * 2) {
      return null;
    }

    // Already processing
    if (isProcessing) return null;

    lastScanTime.current = now;
    lastScannedData.current = data;
    setIsProcessing(true);
    setCanScan(false);

    try {
      // Parse QR data to extract ticket ID
      const ticketId = parseQRData(data);

      if (!ticketId) {
        const failResult: TicketVerifyResult = {
          valid: false,
          reason: 'invalid_qr',
          error: 'Invalid QR code format. This is not a Jigs Events ticket.',
        };
        setLastResult(failResult);
        vibrateError();

        addToHistory({
          ticketId: 'Unknown',
          attendeeName: 'Unknown',
          eventName: 'N/A',
          isValid: false,
          reason: 'Invalid QR format',
        });

        return failResult;
      }

      // Verify with backend
      const result = await verifyTicket(ticketId);
      setLastResult(result);

      if (result.valid) {
        vibrateSuccess();
        addToHistory({
          ticketId: result.ticket_id,
          attendeeName: result.attendee,
          eventName: result.event,
          isValid: true,
        });
      } else {
        vibrateError();
        addToHistory({
          ticketId: ticketId,
          attendeeName: result.attendee || 'Unknown',
          eventName: result.event || 'N/A',
          isValid: false,
          reason: result.error,
        });
      }

      return result;
    } catch (error: any) {
      const failResult: TicketVerifyResult = {
        valid: false,
        reason: 'network_error',
        error: 'Failed to verify ticket. Check your connection.',
      };
      setLastResult(failResult);
      vibrateError();
      return failResult;
    } finally {
      setIsProcessing(false);
      // Re-enable scanning after cooldown
      setTimeout(() => {
        setCanScan(true);
      }, SCANNER_CONFIG.SCAN_COOLDOWN_MS);
    }
  }, [isProcessing]);

  /**
   * Add a scan result to the local history.
   */
  const addToHistory = (item: Omit<ScanHistoryItem, 'id' | 'scannedAt'>) => {
    const historyItem: ScanHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      scannedAt: new Date(),
    };
    setScanHistory((prev) => [historyItem, ...prev].slice(0, 100)); // Keep last 100
  };

  /**
   * Success vibration pattern.
   */
  const vibrateSuccess = () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 100, 50, 100]); // Double tap
    } else {
      Vibration.vibrate(100);
    }
  };

  /**
   * Error vibration pattern.
   */
  const vibrateError = () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 300, 100, 300]); // Long double buzz
    } else {
      Vibration.vibrate(400);
    }
  };

  const clearLastResult = useCallback(() => {
    setLastResult(null);
    setCanScan(true);
  }, []);

  const clearHistory = useCallback(() => {
    setScanHistory([]);
  }, []);

  return {
    isProcessing,
    lastResult,
    scanHistory,
    handleBarCodeScanned,
    clearLastResult,
    clearHistory,
    canScan,
  };
};
