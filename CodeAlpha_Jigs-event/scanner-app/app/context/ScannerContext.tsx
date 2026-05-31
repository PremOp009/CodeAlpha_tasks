/**
 * ScannerContext — Shares scanner state (history, processing) across screens.
 */
import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { Vibration, Platform } from 'react-native';
import { parseQRData, verifyTicket } from '../services/ticketService';
import {
  TicketVerifyResult,
  ScanHistoryItem,
  SCANNER_CONFIG,
} from '../utils/constants';

interface ScannerContextType {
  isProcessing: boolean;
  lastResult: TicketVerifyResult | null;
  scanHistory: ScanHistoryItem[];
  handleBarCodeScanned: (data: string) => Promise<TicketVerifyResult | null>;
  clearLastResult: () => void;
  clearHistory: () => void;
  canScan: boolean;
}

const ScannerContext = createContext<ScannerContextType>({
  isProcessing: false,
  lastResult: null,
  scanHistory: [],
  handleBarCodeScanned: async () => null,
  clearLastResult: () => {},
  clearHistory: () => {},
  canScan: true,
});

export const useScannerContext = () => useContext(ScannerContext);

interface ScannerProviderProps {
  children: ReactNode;
}

export const ScannerProvider: React.FC<ScannerProviderProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<TicketVerifyResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [canScan, setCanScan] = useState(true);
  const lastScanTime = useRef<number>(0);
  const lastScannedData = useRef<string>('');

  const handleBarCodeScanned = useCallback(async (data: string): Promise<TicketVerifyResult | null> => {
    const now = Date.now();

    if (now - lastScanTime.current < SCANNER_CONFIG.SCAN_COOLDOWN_MS) {
      return null;
    }

    if (data === lastScannedData.current && now - lastScanTime.current < SCANNER_CONFIG.SCAN_COOLDOWN_MS * 2) {
      return null;
    }

    if (isProcessing) return null;

    lastScanTime.current = now;
    lastScannedData.current = data;
    setIsProcessing(true);
    setCanScan(false);

    try {
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
      setTimeout(() => {
        setCanScan(true);
      }, SCANNER_CONFIG.SCAN_COOLDOWN_MS);
    }
  }, [isProcessing]);

  const addToHistory = (item: Omit<ScanHistoryItem, 'id' | 'scannedAt'>) => {
    const historyItem: ScanHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      scannedAt: new Date(),
    };
    setScanHistory((prev) => [historyItem, ...prev].slice(0, 100));
  };

  const vibrateSuccess = () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 100, 50, 100]);
    } else {
      Vibration.vibrate(100);
    }
  };

  const vibrateError = () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 300, 100, 300]);
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

  return (
    <ScannerContext.Provider
      value={{
        isProcessing,
        lastResult,
        scanHistory,
        handleBarCodeScanned,
        clearLastResult,
        clearHistory,
        canScan,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
};
