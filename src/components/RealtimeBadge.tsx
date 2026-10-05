import { Database, Users, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { useRealtime } from '@/context/RealtimeContext';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { cn } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';

// Renders database connection status badge with details dialog
export const RealtimeBadge = memo(() => {
  const { status, isLive, activeVisitors, lastSyncTime } = useRealtime();
  const [modalOpen, setModalOpen] = useState(false);
  const r = APP_STRINGS.REALTIME;

  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  useEscapeKey(modalOpen, handleCloseModal);

  const isOnline = isLive;
  const hoverLabel = isOnline
    ? `${r.TXT_SERVER_ONLINE} (${activeVisitors} ${r.LABEL_ACTIVE_VISITORS})`
    : r.TXT_SERVER_OFFLINE;

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        title={hoverLabel}
        aria-label={hoverLabel}
        className={cn(
          'flex h-9 cursor-pointer select-none items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-600',
          isOnline
            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100/80 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60'
            : status === 'connecting'
              ? 'border-amber-200 bg-amber-50/80 text-amber-700 hover:bg-amber-100/80 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-950/60'
              : 'border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/60',
        )}
      >
        <span className="relative flex h-2 w-2">
          {isOnline && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={cn(
              'relative inline-flex h-2 w-2 rounded-full',
              isOnline ? 'bg-emerald-500' : status === 'connecting' ? 'bg-amber-500' : 'bg-rose-500',
            )}
          />
        </span>
        {isOnline ? (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-200/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300">
            <Users className="h-3 w-3" aria-hidden="true" />
            <span>{activeVisitors}</span>
          </span>
        ) : (
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">{r.LABEL_STATUS_OFFLINE}</span>
        )}
      </button>

      {/* Real-time Architecture Inspector Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="realtime-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={handleCloseModal}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    isOnline
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400',
                  )}
                >
                  <Database className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id="realtime-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                      {r.MODAL_HEADING_REALTIME}
                    </h3>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase',
                        isOnline
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/90 dark:text-rose-300',
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', isOnline ? 'bg-emerald-500' : 'bg-rose-500')} />
                      <span>{isOnline ? r.LABEL_STATUS_ONLINE : r.LABEL_STATUS_OFFLINE}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{r.MODAL_TXT_DESCRIPTION}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label={APP_STRINGS.COMMON.BTN_CLOSE_ARIA_LABEL}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              {/* Server Status Row */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                <span className="font-medium text-slate-600 dark:text-slate-400">{r.LABEL_SERVER_STATUS}</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 font-bold',
                    isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', isOnline ? 'bg-emerald-500' : 'bg-rose-500')} />
                  <span>{isOnline ? r.LABEL_STATUS_ONLINE : r.LABEL_STATUS_OFFLINE}</span>
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                <span className="font-medium text-slate-600 dark:text-slate-400">{r.LABEL_ACTIVE_VISITORS}</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{activeVisitors}</span>
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                <span className="font-medium text-slate-600 dark:text-slate-400">{r.LABEL_LAST_SYNC}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : r.LABEL_PENDING}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                {APP_STRINGS.COMMON.BTN_CLOSE}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
