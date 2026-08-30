import { useCallback, memo } from 'react';
import { Bug, ShieldAlert, Cpu, Terminal, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { APP_STRINGS } from '../strings';
import { useAuth } from '../lib/auth';
import { APP_VIEWS } from './index';

export const DebugView = memo(() => {
  const { isAuthenticated, username, logout } = useAuth();

  const handleGoToLogin = useCallback(() => {
    window.location.hash = APP_STRINGS.views.login.hash;
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    window.location.hash = APP_STRINGS.views.homepage.hash;
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
              <h2 className="text-base font-bold text-amber-900 dark:text-amber-200">
                {APP_STRINGS.views.debug.unauthorizedTitle}
              </h2>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                {APP_STRINGS.views.debug.unauthorizedMessage}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoToLogin}
              className="flex cursor-pointer select-none items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-amber-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <span>{APP_STRINGS.views.debug.loginPromptButton}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Renders header banner with view heading and authentication status badge */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Bug className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {APP_STRINGS.views.debug.heading}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {APP_STRINGS.views.debug.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Authenticated: {username}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Renders grid displaying runtime metadata and active application state */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Renders framework and build tool metadata */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {APP_STRINGS.views.debug.systemInfoTitle}
            </h3>
          </div>
          <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Framework</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-200">React 19.x</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Build Tool</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-200">Vite 6 / 8</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">CSS Engine</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-200">Tailwind CSS v4</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Routing Mode</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-200">Anchor Hash</span>
            </div>
          </div>
        </div>

        {/* Renders active URL anchor, auth status, and view count */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Terminal className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {APP_STRINGS.views.debug.activeStateTitle}
            </h3>
          </div>
          <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">{APP_STRINGS.views.debug.activeAnchor}</span>
              <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{window.location.hash || '#homepage'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">{APP_STRINGS.views.debug.authState}</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">Active (True)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">{APP_STRINGS.views.debug.registeredViews}</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-200">{APP_VIEWS.length} views</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">User Agent</span>
              <span className="font-mono truncate max-w-[160px] text-slate-700 dark:text-slate-300">Browser Environment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Renders action controls to reset storage and sign out */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Debug Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleClearStorage}
            className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all duration-150 hover:bg-slate-100 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Local Storage</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-xs transition-all duration-150 hover:bg-rose-100 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign Out & Lock Debug</span>
          </button>
        </div>
      </div>
    </div>
  );
});

DebugView.displayName = 'DebugView';

export default DebugView;
