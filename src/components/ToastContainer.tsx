import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { APP_STRINGS } from '@/strings';
import { cn } from '@/lib/utils';
import type { ToastMessage, ToastType } from '@/types';

// Visual styles and icons per toast notification type
const TOAST_TYPE_CONFIG: Record<
  ToastType,
  { icon: typeof Info; iconClass: string; barClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500 dark:text-emerald-400',
    barClass: 'bg-emerald-500 dark:bg-emerald-400',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500 dark:text-blue-400',
    barClass: 'bg-blue-500 dark:bg-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500 dark:text-amber-400',
    barClass: 'bg-amber-500 dark:bg-amber-400',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-rose-500 dark:text-rose-400',
    barClass: 'bg-rose-500 dark:bg-rose-400',
  },
};

// Individual toast item with pause-on-hover countdown timer and visual progress bar
const ToastItem = memo(({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) => {
  const totalMs = toast.durationMs ?? 5000;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const [isHovered, setIsHovered] = useState(false);
  const lastTickRef = useRef<number>(Date.now());

  // Handle countdown with pause on hover
  useEffect(() => {
    if (totalMs <= 0) return;

    lastTickRef.current = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (!isHovered) {
        setRemainingMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            clearInterval(interval);
            onDismiss(toast.id);
            return 0;
          }
          return next;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [totalMs, isHovered, onDismiss, toast.id]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    lastTickRef.current = Date.now();
    setIsHovered(false);
  }, []);

  const config = TOAST_TYPE_CONFIG[toast.type];
  const IconComponent = config.icon;
  const progressRatio = totalMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)) : 100;

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'pointer-events-auto relative flex flex-col overflow-hidden rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3',
        'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
      )}
    >
      <div className="flex items-start gap-3 p-3.5 pb-3">
        <div className="shrink-0 pt-0.5">
          <IconComponent className={cn('h-4 w-4', config.iconClass)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-[11px] leading-normal text-slate-600 dark:text-slate-400">
              {toast.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label={APP_STRINGS.TOAST.BTN_DISMISS_ARIA_LABEL}
          className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Visual countdown progress bar with pause indicator */}
      {totalMs > 0 && (
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
          <div
            className={cn('h-full transition-all duration-75 ease-linear', config.barClass)}
            style={{ width: `${progressRatio}%` }}
          />
        </div>
      )}
    </div>
  );
});

ToastItem.displayName = 'ToastItem';

// Renders floating accessible toast notification stack
export const ToastContainer = memo(() => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label={APP_STRINGS.TOAST.CONTAINER_ARIA_LABEL}
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex max-w-sm w-full flex-col gap-2.5 p-2 sm:p-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';

