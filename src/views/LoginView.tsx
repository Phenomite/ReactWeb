import { useState, useCallback, memo, type SubmitEvent, type ChangeEvent } from 'react';
import { ShieldCheck, LogIn, LogOut, ArrowRight, User, Key, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSecurityIncidents } from '@/context/SecurityIncidentContext';
import { Card } from '@/components/Card';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import type { ViewDefinition } from '@/types';

// Renders the authentication form and active user session card
export const LoginView = memo(() => {
  const { isAuthenticated, username, login, logout } = useAuth();
  const { showToast } = useToast();
  const { logIncident } = useSecurityIncidents();
  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserChange = useCallback((e: ChangeEvent<HTMLInputElement>) => { setInputUser(e.target.value); setErrorMessage(null); }, []);
  const handlePassChange = useCallback((e: ChangeEvent<HTMLInputElement>) => { setInputPass(e.target.value); setErrorMessage(null); }, []);

  // Submits credentials for PBKDF2 validation and redirects to debug on success
  const handleSubmit = useCallback(async (e: SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    const success = await login(inputUser, inputPass);
    setIsLoading(false);
    if (success) {
      showToast(APP_STRINGS.TOAST.TXT_LOGGED_IN, { type: 'success' });
      window.location.hash = APP_STRINGS.VIEWS.DEBUG.NAV_HASH;
    } else {
      logIncident({
        title: 'Authentication Attempt Rejected',
        severity: 'medium',
        status: 'active',
        category: 'Identity & Access',
        source: 'PBKDF2 Web Crypto Engine',
        description: `Failed login attempt for username "${inputUser}" with invalid credentials.`,
        recommendation: 'Verify user credentials or investigate potential brute-force activity.',
      });
      setErrorMessage(APP_STRINGS.VIEWS.LOGIN.TXT_INVALID_CREDENTIALS);
    }
  }, [inputUser, inputPass, login, showToast, logIncident]);

  const handleLogout = useCallback(() => {
    logout();
    showToast(APP_STRINGS.TOAST.TXT_LOGGED_OUT, { type: 'info' });
    window.location.hash = APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH;
  }, [logout, showToast]);

  const handleGoToDebug = useCallback(() => { window.location.hash = APP_STRINGS.VIEWS.DEBUG.NAV_HASH; }, []);
  const handleClearStorage = useCallback(() => {
    localStorage.clear();
    showToast(APP_STRINGS.TOAST.TXT_STORAGE_CLEARED, { type: 'info' });
    window.location.reload();
  }, [showToast]);

  // Renders authenticated session status card
  if (isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg">
        <Card
          heading={APP_STRINGS.VIEWS.LOGIN.HEADING_PAGE}
          icon={ShieldCheck}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          headerRight={<span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{APP_STRINGS.VIEWS.DEBUG.LABEL_AUTH_ACTIVE}</span>}
        >
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
            <Button onClick={handleGoToDebug} iconRight={ArrowRight}>
              {APP_STRINGS.VIEWS.LOGIN.BTN_GO_TO_DEBUG}
            </Button>
            <Button onClick={handleLogout} variant="secondary" icon={LogOut}>
              {APP_STRINGS.VIEWS.LOGIN.BTN_LOGOUT}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Renders unauthenticated login form
  return (
    <div className="mx-auto max-w-lg">
      <Card heading={APP_STRINGS.VIEWS.LOGIN.HEADING_PAGE} description={APP_STRINGS.VIEWS.LOGIN.TXT_DESCRIPTION} icon={LogIn}>
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField label={APP_STRINGS.VIEWS.LOGIN.LABEL_USERNAME} value={inputUser} onChange={handleUserChange} placeholder={APP_STRINGS.VIEWS.LOGIN.INPUT_PLACEHOLDER_USERNAME} icon={User} required />
          <InputField label={APP_STRINGS.VIEWS.LOGIN.LABEL_PASSWORD} type="password" value={inputPass} onChange={handlePassChange} placeholder={APP_STRINGS.VIEWS.LOGIN.INPUT_PLACEHOLDER_PASSWORD} icon={Key} required />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{APP_STRINGS.VIEWS.LOGIN.TXT_AUTH_NOTICE}</p>
          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" disabled={isLoading} icon={LogIn} className="w-full">
              {isLoading ? 'Verifying...' : APP_STRINGS.VIEWS.LOGIN.BTN_SUBMIT}
            </Button>
            <Button onClick={handleClearStorage} variant="secondary" icon={RotateCcw} aria-label={APP_STRINGS.VIEWS.LOGIN.BTN_CLEAR_STORAGE_ARIA_LABEL} className="w-full">
              {APP_STRINGS.VIEWS.LOGIN.BTN_CLEAR_STORAGE}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
});

// Colocated Login view routing metadata
export const loginView: ViewDefinition = {
  id: APP_STRINGS.VIEWS.LOGIN.NAV_ID,
  title: APP_STRINGS.VIEWS.LOGIN.NAV_TITLE,
  hash: APP_STRINGS.VIEWS.LOGIN.NAV_HASH,
  icon: LogIn,
  component: LoginView,
  hideInSidebar: true,
};
