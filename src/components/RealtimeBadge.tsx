import { Database, Users, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRealtime } from '@/context/RealtimeContext';
import { cn } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';

// Renders database connection status badge with details dialog
export const RealtimeBadge = memo(() => {
  const { isLive, activeVisitors, lastSyncTime } = useRealtime();
  const [modalOpen, setModalOpen] = useState(false);
  const r = APP_STRINGS.REALTIME;

  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  const handleOpenChange = useCallback((open: boolean) => {
    setModalOpen(open);
  }, []);

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
          'flex h-8 cursor-pointer select-none items-center gap-2 rounded-lg border px-2.5 font-semibold text-xs shadow-2xs transition-all focus-visible:outline-2 focus-visible:outline-ring active:scale-95',
          isOnline
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300',
        )}
      >
        <span className="relative flex h-2 w-2">
          {isOnline && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={cn('relative inline-flex h-2 w-2 rounded-full', isOnline ? 'bg-emerald-500' : 'bg-rose-500')}
          />
        </span>
        <span className="font-bold font-mono text-[11px]">
          {isOnline ? r.LABEL_STATUS_ONLINE : r.LABEL_STATUS_OFFLINE}
        </span>
        {isOnline && (
          <span className="hidden items-center gap-1 border-emerald-300 border-l pl-2 font-bold text-[10px] text-emerald-800 sm:flex dark:border-emerald-800 dark:text-emerald-300">
            <Users className="h-3 w-3" aria-hidden="true" />
            <span>{activeVisitors}</span>
          </span>
        )}
      </button>

      {/* Real-time Architecture Inspector Modal */}
      <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false} className="w-full max-w-md p-6">
          <DialogHeader className="flex flex-row items-center justify-between border-border border-b pb-4">
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
                  <DialogTitle className="font-bold text-foreground text-sm">{r.MODAL_HEADING_REALTIME}</DialogTitle>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide',
                      isOnline
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/90 dark:text-rose-300',
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', isOnline ? 'bg-emerald-500' : 'bg-rose-500')} />
                    <span>{isOnline ? r.LABEL_STATUS_ONLINE : r.LABEL_STATUS_OFFLINE}</span>
                  </span>
                </div>
                <DialogDescription className="text-muted-foreground text-xs">
                  {r.MODAL_TXT_DESCRIPTION}
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={APP_STRINGS.COMMON.BTN_CLOSE_ARIA_LABEL}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogClose>
          </DialogHeader>

          <div className="my-4 space-y-3">
            {/* Server Status Row */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-xs">
              <span className="font-medium text-muted-foreground">{r.LABEL_SERVER_STATUS}</span>
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

            <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-xs">
              <span className="font-medium text-muted-foreground">{r.LABEL_ACTIVE_VISITORS}</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{activeVisitors}</span>
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-xs">
              <span className="font-medium text-muted-foreground">{r.LABEL_LAST_SYNC}</span>
              <span className="font-semibold text-foreground">
                {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : r.LABEL_PENDING}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end">
            <DialogClose asChild>
              <Button variant="secondary" onClick={handleCloseModal}>
                {APP_STRINGS.COMMON.BTN_CLOSE}
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

RealtimeBadge.displayName = 'RealtimeBadge';
