import { memo } from 'react';
import { Cuboid, Moon, Sun, X, ShieldCheck } from 'lucide-react';
import { APP_STRINGS } from '@/constants/strings';
import { getVisibleViews } from '@/constants/views';
import type { ViewDefinition } from '@/types/views';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeViewId: string;
  onSelectView: (view: ViewDefinition) => void;
}

// Renders the aside sidebar container (w-72) with header, dynamic view navigation, and dark mode switch
export const Sidebar = memo(({ isOpen, onClose, darkMode, onToggleDarkMode, activeViewId, onSelectView }: SidebarProps) => {
  const { isAuthenticated, username } = useAuth();
  const visibleViews = getVisibleViews(isAuthenticated);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden" onClick={onClose} aria-hidden="true" />}

      {/* Aside container: fixed on mobile, static w-72 on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top-left heading container (h-16) with Cuboid icon */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex select-none items-center gap-2.5 text-slate-900 dark:text-white">
            <Cuboid className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span className="text-lg font-bold tracking-tight">{APP_STRINGS.SIDEBAR.HEADING_TITLE}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={APP_STRINGS.SIDEBAR.BTN_CLOSE_ARIA_LABEL}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* View list navigation buttons */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav aria-label={APP_STRINGS.SIDEBAR.NAV_MAIN_ARIA_LABEL} className="space-y-1">
            {visibleViews.map((view) => {
              const Icon = view.icon;
              const isActive = activeViewId === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => onSelectView(view)}
                  aria-label={view.title}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} aria-hidden="true" />
                    <span>{view.title}</span>
                  </div>
                  {view.requiresAuth && (
                    <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                      Dev
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom section: active user badge and theme switch */}
        <div className="shrink-0 border-t border-slate-200 p-4 space-y-3 dark:border-slate-800">
          {isAuthenticated && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">{username || APP_STRINGS.HEADER.BADGE_DEFAULT_USER}</span>
            </div>
          )}

          <div className="flex select-none items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              {darkMode ? <Moon className="h-4 w-4 text-blue-400" aria-hidden="true" /> : <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" />}
              <span>{APP_STRINGS.SIDEBAR.LABEL_DARK_MODE}</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={onToggleDarkMode}
              aria-label={APP_STRINGS.SIDEBAR.SWITCH_THEME_ARIA_LABEL}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer select-none rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-95 ${
                darkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
});
