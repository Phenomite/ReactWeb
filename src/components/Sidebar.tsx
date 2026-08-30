import { Cuboid, Moon, Sun, X } from 'lucide-react';
import { APP_STRINGS } from '../strings';
import { APP_VIEWS, type ViewDefinition } from '../views';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeViewId: string;
  onSelectView: (view: ViewDefinition) => void;
}

export const Sidebar = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  activeViewId,
  onSelectView,
}: SidebarProps) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Aside Sidebar Container (w-72) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Container 1: Top Left Aside Sidebar Heading (matches main header height) */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex select-none items-center gap-2.5 text-slate-900 dark:text-white">
            <Cuboid className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span className="text-lg font-bold tracking-tight">
              {APP_STRINGS.sidebar.heading}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded-lg text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-90 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={APP_STRINGS.sidebar.closeLabel}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Container 2: Aside Sidebar Navigation Body (no section title, non-draggable text, animated) */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav aria-label={APP_STRINGS.sidebar.navigationLabel} className="space-y-1">
            {APP_VIEWS.map((view) => {
              const Icon = view.icon;
              const isActive = activeViewId === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => onSelectView(view)}
                  aria-label={view.title}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex w-full cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{view.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Aside Sidebar Bottom Container: On/Off Switch Toggle */}
        <div className="shrink-0 border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex select-none items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              {darkMode ? (
                <Moon className="h-4 w-4 text-blue-400" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" />
              )}
              <span>{APP_STRINGS.sidebar.darkModeLabel}</span>
            </div>

            {/* Accessible On/Off Switch with click animation */}
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={onToggleDarkMode}
              aria-label={APP_STRINGS.sidebar.toggleThemeLabel}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer select-none rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-95 ${
                darkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
