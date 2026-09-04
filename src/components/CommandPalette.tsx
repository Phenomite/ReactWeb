import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  Search,
  Home,
  Settings,
  Bug,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Copy,
  Trash2,
  Palette,
  X,
  Shield,
  Download,
  Sparkles,
} from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSecurityIncidents } from '@/context/SecurityIncidentContext';
import { ACCENT_OPTIONS } from '@/constants';
import { cn } from '@/lib/utils';
import type { CommandItem, AccentColor } from '@/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentAccent: AccentColor;
  onSelectAccent: (accent: AccentColor) => void;
}

// Global modal command launcher providing fuzzy search and hotkey actions
export const CommandPalette = memo(({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  currentAccent,
  onSelectAccent,
}: CommandPaletteProps) => {
  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const { exportSentinelLog, simulateThreatSignal } = useSecurityIncidents();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open and reset query
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Copy current URL action
  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    showToast(APP_STRINGS.TOAST.TXT_URL_COPIED, { type: 'success' });
    onClose();
  }, [showToast, onClose]);

  // Navigate helper
  const navigateTo = useCallback(
    (hash: string) => {
      window.location.hash = hash;
      onClose();
    },
    [onClose]
  );

  // Clear storage helper
  const handleClearStorage = useCallback(() => {
    localStorage.clear();
    showToast(APP_STRINGS.TOAST.TXT_STORAGE_CLEARED, { type: 'info' });
    onClose();
    window.location.reload();
  }, [showToast, onClose]);

  // Build commands list
  const commands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-home',
        title: APP_STRINGS.VIEWS.HOMEPAGE.NAV_TITLE,
        category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_NAVIGATION,
        icon: Home,
        shortcut: 'G H',
        action: () => navigateTo(APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH),
      },
      {
        id: 'nav-microsoft',
        title: APP_STRINGS.VIEWS.MICROSOFT.NAV_TITLE,
        category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_NAVIGATION,
        icon: Shield,
        shortcut: 'G M',
        action: () => navigateTo(APP_STRINGS.VIEWS.MICROSOFT.NAV_HASH),
      },
      {
        id: 'nav-settings',
        title: APP_STRINGS.VIEWS.SETTINGS.NAV_TITLE,
        category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_NAVIGATION,
        icon: Settings,
        shortcut: 'G S',
        action: () => navigateTo(APP_STRINGS.VIEWS.SETTINGS.NAV_HASH),
      },
    ];

    if (isAuthenticated) {
      list.push({
        id: 'nav-debug',
        title: APP_STRINGS.VIEWS.DEBUG.NAV_TITLE,
        category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_NAVIGATION,
        icon: Bug,
        shortcut: 'G D',
        action: () => navigateTo(APP_STRINGS.VIEWS.DEBUG.NAV_HASH),
      });
    }

    if (!isAuthenticated) {
      list.push({
        id: 'nav-login',
        title: APP_STRINGS.VIEWS.LOGIN.NAV_TITLE,
        category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_NAVIGATION,
        icon: LogIn,
        shortcut: 'G L',
        action: () => navigateTo(APP_STRINGS.VIEWS.LOGIN.NAV_HASH),
      });
    }

    // Appearance
    list.push({
      id: 'action-theme',
      title: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_APPEARANCE,
      icon: darkMode ? Sun : Moon,
      shortcut: 'T',
      action: () => {
        onToggleDarkMode();
        showToast(
          darkMode ? APP_STRINGS.TOAST.TXT_THEME_LIGHT : APP_STRINGS.TOAST.TXT_THEME_DARK,
          { type: 'info' }
        );
        onClose();
      },
    });

    // Accent colors
    ACCENT_OPTIONS.forEach((opt) => {
      list.push({
        id: `accent-${opt.id}`,
        title: `Set Accent: ${opt.label}${opt.id === currentAccent ? ' (Active)' : ''}`,
        category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_APPEARANCE,
        icon: Palette,
        action: () => {
          onSelectAccent(opt.id);
          showToast(`${APP_STRINGS.TOAST.TXT_ACCENT_CHANGED} ${opt.label}`, { type: 'success' });
          onClose();
        },
      });
    });

    // Quick Actions
    list.push({
      id: 'action-copy-url',
      title: 'Copy Current Page URL',
      category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_ACTIONS,
      icon: Copy,
      action: handleCopyUrl,
    });

    if (isAuthenticated) {
      list.push({
        id: 'action-logout',
        title: APP_STRINGS.SIDEBAR.BTN_LOGOUT_TEXT,
        category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_ACTIONS,
        icon: LogOut,
        action: () => {
          logout();
          showToast(APP_STRINGS.TOAST.TXT_LOGGED_OUT, { type: 'info' });
          navigateTo(APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH);
        },
      });
    }

    list.push({
      id: 'action-export-sentinel',
      title: 'Export Microsoft Sentinel Security Log',
      category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_ACTIONS,
      icon: Download,
      action: () => {
        exportSentinelLog();
        onClose();
      },
    });

    list.push({
      id: 'action-simulate-threat',
      title: 'Simulate Defender Security Alert',
      category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_ACTIONS,
      icon: Sparkles,
      action: () => {
        simulateThreatSignal();
        onClose();
      },
    });

    list.push({
      id: 'action-clear-storage',
      title: 'Reset Local Storage Cache',
      category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_ACTIONS,
      icon: Trash2,
      action: handleClearStorage,
    });

    return list;
  }, [
    isAuthenticated,
    darkMode,
    currentAccent,
    navigateTo,
    onToggleDarkMode,
    showToast,
    onClose,
    onSelectAccent,
    handleCopyUrl,
    logout,
    handleClearStorage,
    exportSentinelLog,
    simulateThreatSignal,
  ]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return commands;
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(trimmed) ||
        cmd.category.toLowerCase().includes(trimmed)
    );
  }, [commands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length > 0
            ? (prev - 1 + filteredCommands.length) % filteredCommands.length
            : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          selected.action();
        }
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  // Keep selected item scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={APP_STRINGS.COMMAND_PALETTE.HEADING_TITLE}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div
        onKeyDown={handleKeyDown}
        className="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Search Input Bar */}
        <div className="flex h-14 items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={APP_STRINGS.COMMAND_PALETTE.INPUT_SEARCH_PLACEHOLDER}
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={APP_STRINGS.COMMAND_PALETTE.BTN_CLOSE_ARIA_LABEL}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              {APP_STRINGS.COMMAND_PALETTE.TXT_NO_RESULTS}
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  data-selected={isSelected ? 'true' : 'false'}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex w-full cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-colors',
                    isSelected
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                        isSelected
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {cmd.title}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {cmd.category}
                      </span>
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
          <span>{APP_STRINGS.COMMAND_PALETTE.TXT_FOOTER_HINT}</span>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] dark:border-slate-800 dark:bg-slate-800">
              Esc
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
});

