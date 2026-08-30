import { useCallback, memo } from 'react';
import { Bug, ShieldAlert, Cpu, Terminal, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { APP_STRINGS } from '@/constants/strings';
import { useAuth } from '@/context/AuthContext';
import { APP_VIEWS } from '@/constants/views';

// Diagnostic tile row component
const MetricRow = ({ label, value, isLast = false, valueClassName = 'font-mono text-slate-900 dark:text-slate-200' }: { label: string; value: string; isLast?: boolean; valueClassName?: string }) => (
  <div className={`flex justify-between py-1.5 ${isLast ? '' : 'border-b border-slate-100 dark:border-slate-800/60'}`}>
    <span className="text-slate-500">{label}</span>
    <span className={`font-medium ${valueClassName}`}>{value}</span>
  </div>
);

// Protected view displaying runtime environment diagnostics and application state
export const DebugView = memo(() => {
  const { isAuthenticated, username, logout } = useAuth();

  const handleGoToLogin = useCallback(() => {
    window.location.hash = APP_STRINGS.VIEWS.LOGIN.NAV_HASH;
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    window.location.hash = APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH;
  }, [logout]);

  const handleClearStorage = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

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
          <button
            type="button"
            onClick={handleGoToLogin}
            className="mt-5 flex cursor-pointer select-none items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-amber-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            {APP_STRINGS.VIEWS.DEBUG.BTN_LOGIN_PROMPT}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Bug className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{APP_STRINGS.VIEWS.DEBUG.HEADING_PAGE}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">{APP_STRINGS.VIEWS.DEBUG.TXT_DESCRIPTION}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Authenticated: {username}</span>
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* System & Framework */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
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
        </div>

        {/* Application State */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Terminal className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{APP_STRINGS.VIEWS.DEBUG.HEADING_ACTIVE_STATE}</h3>
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <MetricRow label={APP_STRINGS.VIEWS.DEBUG.LABEL_ACTIVE_ANCHOR} value={window.location.hash || '#homepage'} valueClassName="font-mono text-blue-600 dark:text-blue-400" />
            <MetricRow label={APP_STRINGS.VIEWS.DEBUG.LABEL_AUTH_STATE} value={APP_STRINGS.VIEWS.DEBUG.LABEL_AUTH_ACTIVE} valueClassName="font-mono text-emerald-600 dark:text-emerald-400" />
            <MetricRow label={APP_STRINGS.VIEWS.DEBUG.LABEL_REGISTERED_VIEWS} value={`${APP_VIEWS.length} views`} />
            <MetricRow label="Session Duration" value="7 Days" isLast />
          </div>
        </div>
      </div>

      {/* Diagnostics Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Debug Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleClearStorage}
            className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all duration-150 hover:bg-slate-100 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Local Storage</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-xs transition-all duration-150 hover:bg-rose-100 active:scale-95 focus-visible:outline-2 focus-visible:outline-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign Out & Lock Debug</span>
          </button>
        </div>
      </div>
    </div>
  );
});
