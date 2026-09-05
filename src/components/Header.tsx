import { memo } from 'react';
import { Menu, Moon, Sun, Search, Keyboard } from 'lucide-react';
import { useHeaderSlot } from '@/context/HeaderSlotContext';
import { APP_STRINGS } from '@/strings';

interface HeaderProps {
  activeViewTitle: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
}

// Renders the main top navigation bar matching the sidebar heading height (h-16)
export const Header = memo(({
  activeViewTitle,
  darkMode,
  onToggleDarkMode,
  onOpenSidebar,
  onOpenCommandPalette,
  onOpenShortcuts,
}: HeaderProps) => {
  const { customTitle, customActions } = useHeaderSlot();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 shrink-0 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-95 md:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={APP_STRINGS.HEADER.BTN_OPEN_SIDEBAR_ARIA_LABEL}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="truncate select-none text-sm font-semibold text-slate-800 dark:text-slate-200">
          {customTitle ?? activeViewTitle}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {customActions}
        {/* Command palette search trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label={APP_STRINGS.HEADER.BTN_COMMAND_PALETTE_ARIA_LABEL}
          className="flex h-9 cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-xs text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="hidden sm:inline">{APP_STRINGS.HEADER.INPUT_SEARCH_PLACEHOLDER}</span>
          <kbd className="hidden rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400 shadow-2xs sm:inline dark:bg-slate-900 dark:text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Keyboard shortcuts trigger */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={APP_STRINGS.HEADER.BTN_SHORTCUTS_ARIA_LABEL}
        >
          <Keyboard className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Theme mode toggle button */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={APP_STRINGS.HEADER.BTN_TOGGLE_THEME_ARIA_LABEL}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" /> : <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />}
        </button>
      </div>
    </header>
  );
});
