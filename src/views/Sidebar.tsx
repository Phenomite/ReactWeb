import { memo, useCallback } from 'react';
import { Cuboid, X, LogIn, LogOut } from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { getVisibleViews } from '@/views/views';
import type { ViewDefinition } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { UserBadge } from '@/components/UserBadge';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeViewId: string;
  onSelectView: (view: ViewDefinition) => void;
}

// Sidebar top-left brand header with Cuboid icon and mobile close button
const SidebarHeader = memo(({ onClose }: { onClose: () => void }) => (
  <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
    <div className="flex select-none items-center gap-2.5 font-bold text-slate-900 dark:text-white">
      <Cuboid className="h-5 w-5 text-accent" aria-hidden="true" />
      <span className="text-lg tracking-tight">{APP_STRINGS.SIDEBAR.HEADING_TITLE}</span>
    </div>
    <button
      type="button"
      onClick={onClose}
      aria-label={APP_STRINGS.SIDEBAR.BTN_CLOSE_ARIA_LABEL}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
));

// Sidebar navigation button item with active state and badge
const SidebarNavItem = memo(({ view, isActive, onSelect }: { view: ViewDefinition; isActive: boolean; onSelect: (v: ViewDefinition) => void }) => {
  const Icon = view.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(view)}
      aria-label={view.title}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-600',
        isActive
          ? 'bg-accent-soft text-accent font-semibold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-accent' : 'text-slate-500 dark:text-slate-400')} aria-hidden="true" />
        <span>{view.title}</span>
      </div>
      {view.requiresAuth && (
        <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
          ADMIN
        </span>
      )}
    </button>
  );
});

// Main sidebar container rendering header, view navigation, user identity badge, and theme switch
export const Sidebar = memo(({ isOpen, onClose, darkMode, onToggleDarkMode, activeViewId, onSelectView }: SidebarProps) => {
  const { isAuthenticated, username, role, logout } = useAuth();
  const visibleViews = getVisibleViews(isAuthenticated);

  const handleLogout = useCallback(() => {
    logout();
    window.location.hash = APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH;
    onClose();
  }, [logout, onClose]);

  const handleGoToLogin = useCallback(() => {
    window.location.hash = APP_STRINGS.VIEWS.LOGIN.NAV_HASH;
    onClose();
  }, [onClose]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:translate-x-0 dark:border-slate-800 dark:bg-slate-900',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarHeader onClose={onClose} />
        <nav aria-label={APP_STRINGS.SIDEBAR.NAV_MAIN_ARIA_LABEL} className="flex-1 space-y-1 overflow-y-auto p-4">
          {visibleViews.map((view) => (
            <SidebarNavItem key={view.id} view={view} isActive={activeViewId === view.id} onSelect={onSelectView} />
          ))}
        </nav>
        <div className="shrink-0 space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
          {isAuthenticated && <UserBadge username={username} role={role} />}
          {!isAuthenticated ? (
            <Button
              onClick={handleGoToLogin}
              icon={LogIn}
              aria-label={APP_STRINGS.SIDEBAR.BTN_LOGIN_ARIA_LABEL}
              className="w-full"
            >
              {APP_STRINGS.SIDEBAR.BTN_LOGIN_TEXT}
            </Button>
          ) : (
            <Button
              onClick={handleLogout}
              variant="danger"
              icon={LogOut}
              aria-label={APP_STRINGS.SIDEBAR.BTN_LOGOUT_ARIA_LABEL}
              className="w-full"
            >
              {APP_STRINGS.SIDEBAR.BTN_LOGOUT_TEXT}
            </Button>
          )}
          <ThemeSwitch darkMode={darkMode} onToggle={onToggleDarkMode} />
        </div>
      </aside>
    </>
  );
});
