import { useCallback, memo } from 'react';
import { Bug, ShieldAlert, Cpu, Terminal, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { APP_STRINGS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import type { ViewDefinition } from '@/types';

// Diagnostic tile row component
const MetricRow = ({ label, value, isLast = false, valueClassName }: { label: string; value: string; isLast?: boolean; valueClassName?: string }) => (
  <div className={cn('flex justify-between py-1.5', !isLast && 'border-b border-slate-100 dark:border-slate-800/60')}>
    <span className="text-slate-500">{label}</span>
    <span className={cn('font-mono font-medium text-slate-900 dark:text-slate-200', valueClassName)}>{value}</span>
  </div>
);

// Protected view displaying runtime environment diagnostics and application state
export const DebugView = memo(() => {
  const { isAuthenticated, username, logout } = useAuth();

  const handleGoToLogin = useCallback(() => { window.location.hash = APP_STRINGS.VIEWS.LOGIN.NAV_HASH; }, []);
  const handleLogout = useCallback(() => { logout(); window.location.hash = APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH; }, [logout]);
  const handleClearStorage = useCallback(() => { localStorage.clear(); window.location.reload(); }, []);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-900 dark:text-amber-200">{APP_STRINGS.VIEWS.DEBUG.HEADING_UNAUTHORIZED}</h2>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{APP_STRINGS.VIEWS.DEBUG.TXT_UNAUTHORIZED_MESSAGE}</p>
            </div>
          </div>
          <Button onClick={handleGoToLogin} variant="warning" className="mt-5">
            {APP_STRINGS.VIEWS.DEBUG.BTN_LOGIN_PROMPT}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card
        heading={APP_STRINGS.VIEWS.DEBUG.HEADING_PAGE}
        description={APP_STRINGS.VIEWS.DEBUG.TXT_DESCRIPTION}
        icon={Bug}
        headerRight={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Authenticated: {username}</span>
          </span>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{APP_STRINGS.VIEWS.DEBUG.HEADING_SYSTEM_INFO}</h3>
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <MetricRow label="Framework" value="React 19.x" />
            <MetricRow label="Build Tool" value="Vite 8.x" />
            <MetricRow label="CSS Engine" value="Tailwind CSS v4" />
            <MetricRow label="Routing Mode" value="Anchor Hash" isLast />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Terminal className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{APP_STRINGS.VIEWS.DEBUG.HEADING_ACTIVE_STATE}</h3>
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <MetricRow label={APP_STRINGS.VIEWS.DEBUG.LABEL_ACTIVE_ANCHOR} value={window.location.hash || '#homepage'} valueClassName="text-blue-600 dark:text-blue-400" />
            <MetricRow label={APP_STRINGS.VIEWS.DEBUG.LABEL_AUTH_STATE} value={APP_STRINGS.VIEWS.DEBUG.LABEL_AUTH_ACTIVE} valueClassName="text-emerald-600 dark:text-emerald-400" />
            <MetricRow label={APP_STRINGS.VIEWS.DEBUG.LABEL_REGISTERED_VIEWS} value="4 views" />
            <MetricRow label="Session Duration" value="7 Days" isLast />
          </div>
        </Card>
      </div>

      {/* Diagnostics Actions */}
      <Card className="p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Debug Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleClearStorage} variant="secondary" icon={RefreshCw}>
            Reset Local Storage
          </Button>
          <Button onClick={handleLogout} variant="danger" icon={LogOut}>
            Sign Out & Lock Debug
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
