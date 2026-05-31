/**
 * ToastNotification Component
 * Animated floating notifications for success, error, and info messages.
 */

import React, { useEffect } from 'react';
import type { Toast } from '../types';

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-400">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-400">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-mid-brown">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const bgMap = {
  success: 'bg-emerald-950/80 border-emerald-700/40',
  error:   'bg-red-950/80 border-red-700/40',
  info:    'bg-dark-brown/80 border-mid-brown/40',
};

interface SingleToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const SingleToast: React.FC<SingleToastProps> = ({ toast, onDismiss }) => {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`toast backdrop-blur-xl border ${bgMap[toast.type]}
                  text-light-cream cursor-pointer select-none`}
      onClick={() => onDismiss(toast.id)}
      role="alert"
    >
      {iconMap[toast.type]}
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
        className="ml-2 text-warm-beige/50 hover:text-warm-beige transition-colors"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      className="fixed top-6 right-4 sm:right-6 z-50
                 flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;
