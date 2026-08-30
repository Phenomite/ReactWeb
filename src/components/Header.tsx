import { memo, useCallback } from 'react';
import { Menu, Moon, Sun, LogOut, LogIn } from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';

interface HeaderProps {
  activeViewTitle: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSidebar: () => void;
}

// Renders the main top navigation bar matching the sidebar heading height (h-16)
export const Header = memo(({ activeViewTitle, darkMode, onToggleDarkMode, onOpenSidebar }: HeaderProps) => {
  const { isAuthenticated, logout } = useAuth();

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
          className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-95 md:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={APP_STRINGS.HEADER.BTN_OPEN_SIDEBAR_ARIA_LABEL}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="select-none text-sm font-semibold text-slate-800 dark:text-slate-200">{activeViewTitle}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme mode toggle button */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={APP_STRINGS.HEADER.BTN_TOGGLE_THEME_ARIA_LABEL}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" /> : <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />}
        </button>

        {/* Authentication action: Login when unauthenticated, Logout when authenticated */}
        {!isAuthenticated ? (
          <Button onClick={handleGoToLogin} icon={LogIn} aria-label={APP_STRINGS.HEADER.BTN_LOGIN_ARIA_LABEL}>
            {APP_STRINGS.HEADER.BTN_LOGIN_TEXT}
          </Button>
        ) : (
          <Button onClick={handleLogout} variant="danger" icon={LogOut} aria-label={APP_STRINGS.HEADER.BTN_LOGOUT_ARIA_LABEL}>
            {APP_STRINGS.HEADER.BTN_LOGOUT_TEXT}
          </Button>
        )}
      </div>
    </header>
  );
});
