import { useState, useCallback, memo, type FormEvent, type ChangeEvent } from 'react';
import { ShieldCheck, LogIn, LogOut, ArrowRight, User, Key, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { APP_STRINGS } from '@/constants/strings';
import { useAuth } from '@/context/AuthContext';

// Renders the authentication form and active user session card
export const LoginView = memo(() => {
  const { isAuthenticated, username, login, logout } = useAuth();
  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserChange = useCallback((e: ChangeEvent<HTMLInputElement>) => { setInputUser(e.target.value); setErrorMessage(null); }, []);
  const handlePassChange = useCallback((e: ChangeEvent<HTMLInputElement>) => { setInputPass(e.target.value); setErrorMessage(null); }, []);

  // Submits credentials for PBKDF2 validation and redirects to debug on success
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    const success = await login(inputUser, inputPass);
    setIsLoading(false);
    if (success) window.location.hash = APP_STRINGS.VIEWS.DEBUG.NAV_HASH;
    else setErrorMessage(APP_STRINGS.VIEWS.LOGIN.TXT_INVALID_CREDENTIALS);
  }, [inputUser, inputPass, login]);

  const handleLogout = useCallback(() => { logout(); window.location.hash = APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH; }, [logout]);
  const handleGoToDebug = useCallback(() => { window.location.hash = APP_STRINGS.VIEWS.DEBUG.NAV_HASH; }, []);
  const handleClearStorage = useCallback(() => { localStorage.clear(); window.location.reload(); }, []);

  // Renders authenticated session status card
  if (isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{APP_STRINGS.VIEWS.LOGIN.HEADING_PAGE}</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{APP_STRINGS.VIEWS.DEBUG.LABEL_AUTH_ACTIVE}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {APP_STRINGS.VIEWS.LOGIN.TXT_LOGGED_IN_GREETING} <strong className="text-slate-900 dark:text-white">{username}</strong>.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              <span>Debug view is unlocked in your sidebar.</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGoToDebug}
              className="flex cursor-pointer select-none items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-blue-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <span>{APP_STRINGS.VIEWS.LOGIN.BTN_GO_TO_DEBUG}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition-all duration-150 hover:bg-slate-100 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{APP_STRINGS.VIEWS.LOGIN.BTN_LOGOUT}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renders unauthenticated login form
  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <LogIn className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{APP_STRINGS.VIEWS.LOGIN.HEADING_PAGE}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{APP_STRINGS.VIEWS.LOGIN.TXT_DESCRIPTION}</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{APP_STRINGS.VIEWS.LOGIN.LABEL_USERNAME}</label>
            <div className="relative">
              <User className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={inputUser}
                onChange={handleUserChange}
                placeholder={APP_STRINGS.VIEWS.LOGIN.INPUT_PLACEHOLDER_USERNAME}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{APP_STRINGS.VIEWS.LOGIN.LABEL_PASSWORD}</label>
            <div className="relative">
              <Key className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="password"
                value={inputPass}
                onChange={handlePassChange}
                placeholder={APP_STRINGS.VIEWS.LOGIN.INPUT_PLACEHOLDER_PASSWORD}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">{APP_STRINGS.VIEWS.LOGIN.TXT_AUTH_NOTICE}</p>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer select-none items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>{isLoading ? 'Verifying...' : APP_STRINGS.VIEWS.LOGIN.BTN_SUBMIT}</span>
            </button>
            <button
              type="button"
              onClick={handleClearStorage}
              aria-label={APP_STRINGS.VIEWS.LOGIN.BTN_CLEAR_STORAGE_ARIA_LABEL}
              className="flex w-full cursor-pointer select-none items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-600 shadow-xs transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{APP_STRINGS.VIEWS.LOGIN.BTN_CLEAR_STORAGE}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
