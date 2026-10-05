import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';
import type { ToastMessage, ToastType } from '@/types';

// Visual styles and icons per toast notification type
const TOAST_TYPE_CONFIG: Record<ToastType, { icon: typeof Info; iconClass: string; barClass: string }> = {
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

  const handlePointerEnter = useCallback(() => setIsHovered(true), []);
  const handlePointerLeave = useCallback(() => {
    lastTickRef.current = Date.now();
    setIsHovered(false);
  }, []);

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  const config = TOAST_TYPE_CONFIG[toast.type];
  const IconComponent = config.icon;
  const progressRatio = totalMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)) : 100;

  return (
    <div
      role="status"
      aria-live="polite"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={cn(
        'fade-in slide-from-bottom-3 pointer-events-auto relative flex animate-in flex-col overflow-hidden rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200',
        'border-border bg-popover/95 text-popover-foreground',
      )}
    >
      <div className="flex items-start gap-3 p-3.5 pb-3">
        <div className="shrink-0 pt-0.5">
          <IconComponent className={cn('h-4 w-4', config.iconClass)} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 pr-1">
          <p className="font-semibold text-foreground text-xs leading-tight">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-[11px] text-muted-foreground leading-normal">{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={APP_STRINGS.TOAST.BTN_DISMISS_ARIA_LABEL}
          className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:scale-95"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Visual countdown progress bar with pause indicator */}
      {totalMs > 0 && (
        <div className="h-1 w-full bg-muted">
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
    <section
      aria-label={APP_STRINGS.TOAST.CONTAINER_ARIA_LABEL}
      className="pointer-events-none fixed right-5 bottom-5 z-50 flex w-full max-w-sm flex-col gap-2.5 p-2 sm:p-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </section>
  );
});

ToastContainer.displayName = 'ToastContainer';
