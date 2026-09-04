import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { TOAST_CONFIG } from '@/constants';
import type { ToastContextType, ToastMessage, ToastType } from '@/types';

// Toast context container
const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

// Manages transient notification messages and auto-dismiss timers
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dismisses a specific toast notification by unique ID
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Adds a new toast message and registers automatic timeout dismissal
  const showToast = useCallback(
    (title: string, options?: { description?: string; type?: ToastType; durationMs?: number }): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const durationMs = options?.durationMs ?? TOAST_CONFIG.DEFAULT_DURATION_MS;
      const newToast: ToastMessage = {
        id,
        title,
        description: options?.description,
        type: options?.type ?? 'info',
        durationMs,
      };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }

      return id;
    },
    [dismissToast]
  );

  const contextValue = useMemo<ToastContextType>(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  );

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
}

// Custom hook to trigger application toast notifications
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

