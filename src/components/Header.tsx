import { memo } from 'react';
import { Menu, Moon, Sun, ShieldCheck } from 'lucide-react';
import { APP_STRINGS } from '../strings';
import { useAuth } from '../lib/auth';

interface HeaderProps {
  activeViewTitle: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSidebar: () => void;
}

export const Header = memo(({
  activeViewTitle,
  darkMode,
  onToggleDarkMode,
  onOpenSidebar,
}: HeaderProps) => {
  const { isAuthenticated, username } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-95 md:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={APP_STRINGS.header.openSidebarLabel}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="select-none text-sm font-semibold text-slate-800 dark:text-slate-200">
          {activeViewTitle}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>{username || APP_STRINGS.header.userBadge}</span>
          </span>
        )}

        <button
          type="button"
          onClick={onToggleDarkMode}
          className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={APP_STRINGS.header.toggleThemeLabel}
        >
          {darkMode ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-150 hover:rotate-12" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform duration-150 hover:-rotate-12 dark:text-slate-300" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
