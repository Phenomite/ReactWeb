import { memo, useCallback } from 'react';
import { Settings, Palette, Bell, BellRing, Check, Keyboard } from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAccent } from '@/context/AccentContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import type { ViewDefinition, AccentColor } from '@/types';

// Renders the settings preferences and personalization view
export const SettingsView = memo(() => {
  const { accent, setAccent, options } = useAccent();
  const { showToast } = useToast();

  const handleSelectAccent = useCallback(
    (newAccent: AccentColor, label: string) => {
      setAccent(newAccent);
      showToast(`${APP_STRINGS.TOAST.TXT_ACCENT_CHANGED} ${label}`, { type: 'success' });
    },
    [setAccent, showToast]
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

      {/* Accent Color Palette Customizer */}
      <Card className="p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Palette className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {APP_STRINGS.VIEWS.SETTINGS.HEADING_APPEARANCE}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {APP_STRINGS.VIEWS.SETTINGS.TXT_APPEARANCE_DESC}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {options.map((opt) => {
            const isSelected = opt.id === accent;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectAccent(opt.id, opt.label)}
                className={cn(
                  'flex cursor-pointer select-none flex-col items-center justify-center gap-2.5 rounded-xl border p-4 text-xs font-semibold transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600',
                  isSelected
                    ? 'border-slate-900 bg-slate-50 shadow-xs dark:border-white dark:bg-slate-800/80 text-slate-900 dark:text-white ring-2 ring-slate-900/10 dark:ring-white/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50 dark:text-slate-400'
                )}
              >
                <div className="relative flex items-center justify-center">
                  <span
                    className="h-7 w-7 rounded-full shadow-inner"
                    style={{ backgroundColor: opt.colorHex }}
                  />
                  {isSelected && (
                    <Check className="absolute h-4 w-4 text-white drop-shadow-md" aria-hidden="true" />
                  )}
                </div>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Feedback System */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {APP_STRINGS.VIEWS.SETTINGS.HEADING_FEEDBACK}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.SETTINGS.TXT_FEEDBACK_DESC}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {APP_STRINGS.VIEWS.SETTINGS.TXT_FEEDBACK_NOTE}
            </p>
            <Button onClick={handleTriggerTestToast} icon={BellRing} variant="secondary">
              {APP_STRINGS.VIEWS.SETTINGS.BTN_TEST_TOAST}
            </Button>
          </div>
        </Card>

        {/* Shortcuts Quick Reference */}
        <Card className="p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Keyboard className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {APP_STRINGS.VIEWS.SETTINGS.HEADING_KEYBOARD_CARD}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.SETTINGS.TXT_KEYBOARD_DESC}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">{APP_STRINGS.COMMAND_PALETTE.HEADING_TITLE}</span>
              <kbd className="font-mono font-semibold text-slate-700 dark:text-slate-300">{APP_STRINGS.VIEWS.SETTINGS.KBD_PALETTE}</kbd>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">{APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_THEME}</span>
              <kbd className="font-mono font-semibold text-slate-700 dark:text-slate-300">{APP_STRINGS.VIEWS.SETTINGS.KBD_THEME}</kbd>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{APP_STRINGS.VIEWS.SETTINGS.LABEL_ALL_SHORTCUTS}</span>
              <kbd className="font-mono font-semibold text-slate-700 dark:text-slate-300">{APP_STRINGS.VIEWS.SETTINGS.KBD_HELP}</kbd>
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
