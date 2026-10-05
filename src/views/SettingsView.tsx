import { Bell, BellRing, Check, Keyboard, Moon, Palette, Settings, Sun, Waves } from 'lucide-react';
import { memo, useCallback } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { THEME_OPTIONS } from '@/constants';
import { useAccent } from '@/context/AccentContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';
import type { AccentColor, ThemeMode, ThemeOption, ViewDefinition } from '@/types';

interface AccentButtonProps {
  opt: { id: AccentColor; label: string; colorHex: string };
  isSelected: boolean;
  onSelect: (id: AccentColor, label: string) => void;
}

const THEME_ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  ocean: Waves,
};

interface ThemeButtonProps {
  opt: ThemeOption;
  isSelected: boolean;
  onSelect: (id: ThemeMode) => void;
}

const ThemeButton = memo(({ opt, isSelected, onSelect }: ThemeButtonProps) => {
  const handleClick = useCallback(() => {
    onSelect(opt.id);
  }, [onSelect, opt.id]);

  const Icon = THEME_ICONS[opt.id];

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex cursor-pointer select-none items-center justify-between rounded-xl border p-4 font-semibold text-xs transition-all focus-visible:outline-2 focus-visible:outline-ring active:scale-95',
        isSelected
          ? 'border-primary bg-primary/10 text-foreground shadow-xs ring-2 ring-primary/20'
          : 'border-border bg-card text-muted-foreground hover:bg-muted',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <span>{opt.label}</span>
      </div>
      {isSelected && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
    </button>
  );
});
ThemeButton.displayName = 'ThemeButton';

const AccentButton = memo(({ opt, isSelected, onSelect }: AccentButtonProps) => {
  const handleClick = useCallback(() => {
    onSelect(opt.id, opt.label);
  }, [onSelect, opt.id, opt.label]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex cursor-pointer select-none flex-col items-center justify-center gap-2.5 rounded-xl border p-4 font-semibold text-xs transition-all focus-visible:outline-2 focus-visible:outline-ring active:scale-95',
        isSelected
          ? 'border-primary bg-primary/10 text-foreground shadow-xs ring-2 ring-primary/20'
          : 'border-border bg-card text-muted-foreground hover:bg-muted',
      )}
    >
      <div className="relative flex items-center justify-center">
        <span className="h-7 w-7 rounded-full shadow-inner" style={{ backgroundColor: opt.colorHex }} />
        {isSelected && <Check className="absolute h-4 w-4 text-white drop-shadow-md" aria-hidden="true" />}
      </div>
      <span>{opt.label}</span>
    </button>
  );
});
AccentButton.displayName = 'AccentButton';

// Renders the settings preferences and personalization view
const SettingsView = memo(() => {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent, options } = useAccent();
  const { showToast } = useToast();

  const handleSelectTheme = useCallback(
    (newTheme: ThemeMode) => {
      setTheme(newTheme);
      const msg =
        newTheme === 'dark'
          ? APP_STRINGS.TOAST.TXT_THEME_DARK
          : newTheme === 'ocean'
            ? APP_STRINGS.TOAST.TXT_THEME_OCEAN
            : APP_STRINGS.TOAST.TXT_THEME_LIGHT;
      showToast(msg, { type: 'success' });
    },
    [setTheme, showToast],
  );

  const handleSelectAccent = useCallback(
    (newAccent: AccentColor, label: string) => {
      setAccent(newAccent);
      showToast(`${APP_STRINGS.TOAST.TXT_ACCENT_CHANGED} ${label}`, { type: 'success' });
    },
    [setAccent, showToast],
  );

  const handleTriggerTestToast = useCallback(() => {
    showToast(APP_STRINGS.VIEWS.SETTINGS.TXT_TEST_TOAST_MESSAGE, {
      type: 'success',
      description: APP_STRINGS.VIEWS.SETTINGS.TXT_TEST_TOAST_DESC,
    });
  }, [showToast]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card
        heading={APP_STRINGS.VIEWS.SETTINGS.HEADING_PAGE}
        description={APP_STRINGS.VIEWS.SETTINGS.TXT_DESCRIPTION}
        icon={Settings}
      />

      {/* Semantic Theme Mode Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-3 border-border border-b pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Sun className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">{APP_STRINGS.VIEWS.SETTINGS.HEADING_THEME}</h3>
            <p className="text-muted-foreground text-xs">{APP_STRINGS.VIEWS.SETTINGS.TXT_THEME_DESC}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEME_OPTIONS.map((opt) => (
            <ThemeButton key={opt.id} opt={opt} isSelected={opt.id === theme} onSelect={handleSelectTheme} />
          ))}
        </div>
      </Card>

      {/* Accent Color Palette Customizer */}
      <Card className="p-6">
        <div className="flex items-center gap-3 border-border border-b pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Palette className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">{APP_STRINGS.VIEWS.SETTINGS.HEADING_APPEARANCE}</h3>
            <p className="text-muted-foreground text-xs">{APP_STRINGS.VIEWS.SETTINGS.TXT_APPEARANCE_DESC}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {options.map((opt) => (
            <AccentButton key={opt.id} opt={opt} isSelected={opt.id === accent} onSelect={handleSelectAccent} />
          ))}
        </div>
      </Card>

      {/* Feedback System */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3 border-border border-b pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">{APP_STRINGS.VIEWS.SETTINGS.HEADING_FEEDBACK}</h3>
              <p className="text-muted-foreground text-xs">{APP_STRINGS.VIEWS.SETTINGS.TXT_FEEDBACK_DESC}</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <p className="text-muted-foreground text-xs">{APP_STRINGS.VIEWS.SETTINGS.TXT_FEEDBACK_NOTE}</p>
            <Button onClick={handleTriggerTestToast} icon={BellRing} variant="secondary">
              {APP_STRINGS.VIEWS.SETTINGS.BTN_TEST_TOAST}
            </Button>
          </div>
        </Card>

        {/* Shortcuts Quick Reference */}
        <Card className="p-6">
          <div className="flex items-center gap-3 border-border border-b pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Keyboard className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">{APP_STRINGS.VIEWS.SETTINGS.HEADING_KEYBOARD_CARD}</h3>
              <p className="text-muted-foreground text-xs">{APP_STRINGS.VIEWS.SETTINGS.TXT_KEYBOARD_DESC}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-xs">
            <div className="flex justify-between border-border border-b py-1">
              <span className="text-muted-foreground">{APP_STRINGS.COMMAND_PALETTE.HEADING_TITLE}</span>
              <kbd className="font-mono font-semibold text-foreground">{APP_STRINGS.VIEWS.SETTINGS.KBD_PALETTE}</kbd>
            </div>
            <div className="flex justify-between border-border border-b py-1">
              <span className="text-muted-foreground">{APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_THEME}</span>
              <kbd className="font-mono font-semibold text-foreground">{APP_STRINGS.VIEWS.SETTINGS.KBD_THEME}</kbd>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{APP_STRINGS.VIEWS.SETTINGS.LABEL_ALL_SHORTCUTS}</span>
              <kbd className="font-mono font-semibold text-foreground">{APP_STRINGS.VIEWS.SETTINGS.KBD_HELP}</kbd>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

// Colocated Settings view routing metadata
export const settingsView: ViewDefinition = {
  id: APP_STRINGS.VIEWS.SETTINGS.NAV_ID,
  title: APP_STRINGS.VIEWS.SETTINGS.NAV_TITLE,
  hash: APP_STRINGS.VIEWS.SETTINGS.NAV_HASH,
  icon: Settings,
  component: SettingsView,
};
