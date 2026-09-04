import { memo } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { APP_STRINGS } from '@/strings';
import { cn } from '@/lib/utils';
import type { ToastType } from '@/types';

// Visual styles and icons per toast notification type
const TOAST_TYPE_CONFIG: Record<ToastType, { icon: typeof Info; iconClass: string; borderClass: string }> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500 dark:text-emerald-400',
    borderClass: 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/60 dark:bg-emerald-950/80',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500 dark:text-blue-400',
    borderClass: 'border-blue-200 bg-blue-50/90 dark:border-blue-900/60 dark:bg-blue-950/80',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500 dark:text-amber-400',
    borderClass: 'border-amber-200 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/80',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-rose-500 dark:text-rose-400',
    borderClass: 'border-rose-200 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/80',
  },
};

// Renders floating accessible toast notification stack
export const ToastContainer = memo(() => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex max-w-sm w-full flex-col gap-2.5 p-2 sm:p-0"
    >
      {toasts.map((toast) => {
        const config = TOAST_TYPE_CONFIG[toast.type];
        const IconComponent = config.icon;

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3',
              'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
            )}
          >
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
              onClick={() => dismissToast(toast.id)}
              aria-label={APP_STRINGS.TOAST.BTN_DISMISS_ARIA_LABEL}
              className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
});

