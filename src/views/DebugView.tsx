import { useCallback, memo } from 'react';
import { Bug, ShieldAlert, Cpu, Terminal, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { cn, resetLocalStorageAndReload } from '@/lib/utils';
import { APP_VIEWS } from '@/views/views';
import type { ViewDefinition } from '@/types';

// Diagnostic tile row component
const MetricRow = ({
  label,
  value,
  isLast = false,
  valueClassName,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  valueClassName?: string;
}) => (
  <div className={cn('flex justify-between py-1.5', !isLast && 'border-b border-slate-100 dark:border-slate-800/60')}>
    <span className="text-slate-500">{label}</span>
    <span className={cn('font-mono font-medium text-slate-900 dark:text-slate-200', valueClassName)}>{value}</span>
  </div>
);

// Protected view displaying runtime environment diagnostics and application state
export const DebugView = memo(() => {
  const { isAuthenticated, username, logout } = useAuth();
  const { showToast } = useToast();
  const d = APP_STRINGS.VIEWS.DEBUG;

  const handleGoToLogin = useCallback(() => {
    window.location.hash = APP_STRINGS.VIEWS.LOGIN.NAV_HASH;
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    showToast(APP_STRINGS.TOAST.TXT_LOGGED_OUT, { type: 'info' });
    window.location.hash = APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH;
  }, [logout, showToast]);

  const handleClearStorage = useCallback(() => {
    resetLocalStorageAndReload(showToast);
  }, [showToast]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-900 dark:text-amber-200">{d.HEADING_UNAUTHORIZED}</h2>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{d.TXT_UNAUTHORIZED_MESSAGE}</p>
            </div>
          </div>
          <Button onClick={handleGoToLogin} variant="warning" className="mt-5">
            {d.BTN_LOGIN_PROMPT}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card
        heading={d.HEADING_PAGE}
        description={d.TXT_DESCRIPTION}
        icon={Bug}
        headerRight={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{d.TXT_AUTH_USER_PREFIX}{username}</span>
          </span>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{d.HEADING_SYSTEM_INFO}</h3>
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <MetricRow label={d.LABEL_FRAMEWORK} value={d.VAL_FRAMEWORK} />
            <MetricRow label={d.LABEL_BUILD_TOOL} value={d.VAL_BUILD_TOOL} />
            <MetricRow label={d.LABEL_CSS_ENGINE} value={d.VAL_CSS_ENGINE} />
            <MetricRow label={d.LABEL_ROUTING_MODE} value={d.VAL_ROUTING_MODE} isLast />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Terminal className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{d.HEADING_ACTIVE_STATE}</h3>
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <MetricRow
              label={d.LABEL_ACTIVE_ANCHOR}
              value={window.location.hash || APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH}
              valueClassName="text-blue-600 dark:text-blue-400"
            />
            <MetricRow
              label={d.LABEL_AUTH_STATE}
              value={d.LABEL_AUTH_ACTIVE}
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />
            <MetricRow
              label={d.LABEL_REGISTERED_VIEWS}
              value={`${APP_VIEWS.length} views`}
            />
            <MetricRow
              label={d.LABEL_SESSION_DURATION}
              value={d.VAL_SESSION_DURATION}
              isLast
            />
          </div>
        </Card>
      </div>

      {/* Diagnostics Actions */}
      <Card className="p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {d.HEADING_DEBUG_ACTIONS}
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleClearStorage} variant="secondary" icon={RefreshCw}>
            {APP_STRINGS.COMMAND_PALETTE.CMD_RESET_STORAGE}
          </Button>
          <Button onClick={handleLogout} variant="danger" icon={LogOut}>
            {d.BTN_LOGOUT_LOCK}
          </Button>
        </div>
      </Card>
    </div>
  );
});

// Colocated Debug view routing metadata
export const debugView: ViewDefinition = {
  id: APP_STRINGS.VIEWS.DEBUG.NAV_ID,
  title: APP_STRINGS.VIEWS.DEBUG.NAV_TITLE,
  hash: APP_STRINGS.VIEWS.DEBUG.NAV_HASH,
  icon: Bug,
  component: DebugView,
  requiresAuth: true,
};
