import { Bug, Copy, Download, Home, Moon, Palette, Settings, Shield, ShieldAlert, Sun, Trash2 } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { ACCENT_OPTIONS } from '@/constants';
import { useSecurityIncidents } from '@/context/SecurityIncidentContext';
import { useToast } from '@/context/ToastContext';
import { copyCurrentUrl, resetLocalStorageAndReload } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';
import type { AccentColor, CommandItem as CommandItemDef } from '@/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentAccent: AccentColor;
  onSelectAccent: (accent: AccentColor) => void;
}

interface AccentCommandItemProps {
  opt: (typeof ACCENT_OPTIONS)[number];
  currentAccent: AccentColor;
  onSelect: (opt: (typeof ACCENT_OPTIONS)[number]) => void;
}

const AccentCommandItem = memo(({ opt, currentAccent, onSelect }: AccentCommandItemProps) => {
  const handleSelect = useCallback(() => {
    onSelect(opt);
  }, [onSelect, opt]);

  return (
    <CommandItem value={`accent color ${opt.label}`} onSelect={handleSelect}>
      <Palette className="mr-2 h-4 w-4" aria-hidden="true" />
      <span>
        {APP_STRINGS.COMMAND_PALETTE.CMD_SET_ACCENT_PREFIX}
        {opt.label}
        {opt.id === currentAccent ? APP_STRINGS.COMMAND_PALETTE.TXT_ACTIVE_SUFFIX : ''}
      </span>
    </CommandItem>
  );
});
AccentCommandItem.displayName = 'AccentCommandItem';

// Global modal command launcher using shadcn Command and cmdk headless combobox
export const CommandPalette = memo(
  ({ isOpen, onClose, darkMode, onToggleDarkMode, currentAccent, onSelectAccent }: CommandPaletteProps) => {
    const { showToast } = useToast();
    const { exportSentinelLog, simulateThreatSignal } = useSecurityIncidents();

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!open) onClose();
      },
      [onClose],
    );

    // Copy current URL action
    const handleCopyUrl = useCallback(() => {
      copyCurrentUrl();
      showToast(APP_STRINGS.TOAST.TXT_URL_COPIED, { type: 'success' });
      onClose();
    }, [showToast, onClose]);

    // Navigate helper
    const navigateTo = useCallback(
      (hash: string) => {
        window.location.hash = hash;
        onClose();
      },
      [onClose],
    );

    // Clear storage helper
    const handleClearStorage = useCallback(() => {
      showToast(APP_STRINGS.TOAST.TXT_STORAGE_CLEARED, { type: 'info' });
      onClose();
      resetLocalStorageAndReload();
    }, [showToast, onClose]);

    const handleToggleTheme = useCallback(() => {
      onToggleDarkMode();
      showToast(darkMode ? APP_STRINGS.TOAST.TXT_THEME_LIGHT : APP_STRINGS.TOAST.TXT_THEME_DARK, { type: 'info' });
      onClose();
    }, [darkMode, onToggleDarkMode, showToast, onClose]);

    const handleExport = useCallback(() => {
      exportSentinelLog();
      onClose();
    }, [exportSentinelLog, onClose]);

    const handleSimulateThreat = useCallback(() => {
      simulateThreatSignal();
      onClose();
    }, [simulateThreatSignal, onClose]);

    const handleSelectAccentOption = useCallback(
      (opt: (typeof ACCENT_OPTIONS)[number]) => {
        onSelectAccent(opt.id);
        showToast(`${APP_STRINGS.TOAST.TXT_ACCENT_CHANGED} ${opt.label}`, { type: 'success' });
        onClose();
      },
      [onSelectAccent, showToast, onClose],
    );

    const navigationItems = useMemo<CommandItemDef[]>(
      () => [
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
        {
          id: 'nav-debug',
          title: APP_STRINGS.VIEWS.DEBUG.NAV_TITLE,
          category: APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_NAVIGATION,
          icon: Bug,
          shortcut: 'G D',
          action: () => navigateTo(APP_STRINGS.VIEWS.DEBUG.NAV_HASH),
        },
      ],
      [navigateTo],
    );

    return (
      <CommandDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title={APP_STRINGS.COMMAND_PALETTE.HEADING_TITLE}
        description="Search commands, navigate views, or adjust preferences"
      >
        <CommandInput placeholder={APP_STRINGS.COMMAND_PALETTE.INPUT_SEARCH_PLACEHOLDER} />
        <CommandList>
          <CommandEmpty>{APP_STRINGS.COMMAND_PALETTE.TXT_NO_RESULTS}</CommandEmpty>

          {/* Navigation Group */}
          <CommandGroup heading={APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_NAVIGATION}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.id} value={`${item.title} navigation`} onSelect={item.action}>
                  <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>{item.title}</span>
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          {/* Appearance Group */}
          <CommandGroup heading={APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_APPEARANCE}>
            <CommandItem value={`theme ${darkMode ? 'light' : 'dark'}`} onSelect={handleToggleTheme}>
              {darkMode ? (
                <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {darkMode ? APP_STRINGS.COMMAND_PALETTE.CMD_THEME_LIGHT : APP_STRINGS.COMMAND_PALETTE.CMD_THEME_DARK}
              </span>
              <CommandShortcut>T</CommandShortcut>
            </CommandItem>

            {ACCENT_OPTIONS.map((opt) => (
              <AccentCommandItem
                key={opt.id}
                opt={opt}
                currentAccent={currentAccent}
                onSelect={handleSelectAccentOption}
              />
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Actions Group */}
          <CommandGroup heading={APP_STRINGS.COMMAND_PALETTE.TXT_CATEGORY_ACTIONS}>
            <CommandItem value="copy current share url link" onSelect={handleCopyUrl}>
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>{APP_STRINGS.COMMAND_PALETTE.CMD_COPY_URL}</span>
            </CommandItem>

            <CommandItem value="export sentinel audit incident log json" onSelect={handleExport}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>{APP_STRINGS.COMMAND_PALETTE.CMD_EXPORT_SENTINEL}</span>
            </CommandItem>

            <CommandItem value="simulate threat signal perturbation" onSelect={handleSimulateThreat}>
              <ShieldAlert className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>{APP_STRINGS.COMMAND_PALETTE.CMD_SIMULATE_ALERT}</span>
            </CommandItem>

            <CommandItem value="reset clear local storage cache" onSelect={handleClearStorage}>
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>{APP_STRINGS.COMMAND_PALETTE.CMD_RESET_STORAGE}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>

        {/* Footer Hint */}
        <div className="flex items-center justify-between border-border border-t bg-muted/60 px-4 py-2 text-[11px] text-muted-foreground">
          <span>{APP_STRINGS.COMMAND_PALETTE.TXT_FOOTER_HINT}</span>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-card px-1 font-mono text-[10px] text-muted-foreground">
              {APP_STRINGS.COMMAND_PALETTE.KBD_ESC}
            </kbd>
          </div>
        </div>
      </CommandDialog>
    );
  },
);

CommandPalette.displayName = 'CommandPalette';
