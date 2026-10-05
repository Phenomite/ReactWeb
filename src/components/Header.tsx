import { Keyboard, Menu, Moon, Search, Sun } from 'lucide-react';
import { memo } from 'react';
import { RealtimeBadge } from '@/components/RealtimeBadge';
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
export const Header = memo(
  ({
    activeViewTitle,
    darkMode,
    onToggleDarkMode,
    onOpenSidebar,
    onOpenCommandPalette,
    onOpenShortcuts,
  }: HeaderProps) => {
    const { customTitle, customActions } = useHeaderSlot();

    return (
      <header className="flex h-16 shrink-0 items-center justify-between border-border border-b bg-card/80 px-6 backdrop-blur-xs">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex h-9 w-9 shrink-0 cursor-pointer select-none items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:scale-95 md:hidden"
            aria-label={APP_STRINGS.HEADER.BTN_OPEN_SIDEBAR_ARIA_LABEL}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="select-none truncate font-semibold text-foreground text-sm">
            {customTitle ?? activeViewTitle}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {customActions}
          <RealtimeBadge />
          {/* Command palette search trigger */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label={APP_STRINGS.HEADER.BTN_COMMAND_PALETTE_ARIA_LABEL}
            className="flex h-9 cursor-pointer select-none items-center gap-2 rounded-lg border border-border bg-muted/70 px-3 text-muted-foreground text-xs transition-all hover:border-border hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring active:scale-95"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="hidden sm:inline">{APP_STRINGS.HEADER.INPUT_SEARCH_PLACEHOLDER}</span>
            <kbd className="hidden rounded border border-border bg-card px-1.5 py-0.5 font-mono font-semibold text-[10px] text-muted-foreground shadow-2xs sm:inline">
              {APP_STRINGS.HEADER.KBD_SEARCH_SHORTCUT}
            </kbd>
          </button>

          {/* Keyboard shortcuts trigger */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:scale-95"
            aria-label={APP_STRINGS.HEADER.BTN_SHORTCUTS_ARIA_LABEL}
          >
            <Keyboard className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Theme mode toggle button */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:scale-95"
            aria-label={APP_STRINGS.HEADER.BTN_TOGGLE_THEME_ARIA_LABEL}
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </header>
    );
  },
);
