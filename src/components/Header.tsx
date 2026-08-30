import { memo, useCallback } from 'react';
import { Menu, Moon, Sun, ShieldCheck, LogOut, LogIn } from 'lucide-react';
import { APP_STRINGS } from '@/constants/strings';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  activeViewTitle: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSidebar: () => void;
}

// Renders the main top navigation bar matching the sidebar heading height (h-16)
export const Header = memo(({ activeViewTitle, darkMode, onToggleDarkMode, onOpenSidebar }: HeaderProps) => {
  const { isAuthenticated, username, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
    window.location.hash = APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH;
  }, [logout]);

  const handleGoToLogin = useCallback(() => {
    window.location.hash = APP_STRINGS.VIEWS.LOGIN.NAV_HASH;
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-95 md:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={APP_STRINGS.HEADER.BTN_OPEN_SIDEBAR_ARIA_LABEL}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="select-none text-sm font-semibold text-slate-800 dark:text-slate-200">{activeViewTitle}</span>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>{username || APP_STRINGS.HEADER.BADGE_DEFAULT_USER}</span>
          </span>
        )}

        {/* Theme mode toggle button */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={APP_STRINGS.HEADER.BTN_TOGGLE_THEME_ARIA_LABEL}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" /> : <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />}
        </button>

        {/* Authentication action: Login when unauthenticated, Logout when authenticated */}
        {!isAuthenticated ? (
          <button
            type="button"
            onClick={handleGoToLogin}
            className="flex h-9 cursor-pointer select-none items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-medium text-blue-700 transition-all duration-150 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-95 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
            aria-label={APP_STRINGS.HEADER.BTN_LOGIN_ARIA_LABEL}
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden xs:inline">{APP_STRINGS.HEADER.BTN_LOGIN_TEXT}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 cursor-pointer select-none items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-700 transition-all duration-150 hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-rose-600 active:scale-95 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
            aria-label={APP_STRINGS.HEADER.BTN_LOGOUT_ARIA_LABEL}
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden xs:inline">{APP_STRINGS.HEADER.BTN_LOGOUT_TEXT}</span>
          </button>
        )}
      </div>
    </header>
  );
});
