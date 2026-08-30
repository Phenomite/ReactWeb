import { useState, useCallback, memo, type FormEvent, type ChangeEvent } from 'react';
import { ShieldCheck, LogIn, LogOut, ArrowRight, User, Key, CheckCircle2 } from 'lucide-react';
import { APP_STRINGS } from '../strings';
import { useAuth } from '../lib/auth';

export const LoginView = memo(() => {
  const { isAuthenticated, username, login, logout } = useAuth();
  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');

  const handleUsernameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputUser(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputPass(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    login(inputUser || 'Developer');
    window.location.hash = APP_STRINGS.views.debug.hash;
  }, [inputUser, login]);

  const handleLogout = useCallback(() => {
    logout();
    window.location.hash = APP_STRINGS.views.homepage.hash;
  }, [logout]);

  const handleGoToDebug = useCallback(() => {
    window.location.hash = APP_STRINGS.views.debug.hash;
  }, []);

  if (isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {APP_STRINGS.views.login.heading}
              </h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {APP_STRINGS.views.debug.authenticatedTrue}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {APP_STRINGS.views.login.loggedInGreeting}{' '}
              <strong className="text-slate-900 dark:text-white">{username}</strong> ({APP_STRINGS.views.login.roleDeveloper}).
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
              className="flex cursor-pointer select-none items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-blue-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span>{APP_STRINGS.views.login.goToDebug}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition-all duration-150 hover:bg-slate-100 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{APP_STRINGS.views.login.logoutButton}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <LogIn className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {APP_STRINGS.views.login.heading}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {APP_STRINGS.views.login.description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {APP_STRINGS.views.login.usernameLabel}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={inputUser}
                onChange={handleUsernameChange}
                placeholder={APP_STRINGS.views.login.usernamePlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {APP_STRINGS.views.login.passwordLabel}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Key className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                type="password"
                value={inputPass}
                onChange={handlePasswordChange}
                placeholder={APP_STRINGS.views.login.passwordPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {APP_STRINGS.views.login.authNotice}
          </p>

          <button
            type="submit"
            className="flex w-full cursor-pointer select-none items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-blue-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            <span>{APP_STRINGS.views.login.submitButton}</span>
          </button>
        </form>
      </div>
    </div>
  );
});

LoginView.displayName = 'LoginView';

export default LoginView;
