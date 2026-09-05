import { memo } from 'react';
import { Keyboard, X, Command } from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { Button } from '@/components/Button';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutEntry {
  keys: string[];
  label: string;
}

const SHORTCUT_LIST: ShortcutEntry[] = [
  { keys: ['Ctrl', 'K'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_PALETTE },
  { keys: ['?'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_SHORTCUTS },
  { keys: ['T'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_THEME },
  { keys: ['G', 'H'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_GO_HOME },
  { keys: ['G', 'M'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_GO_MICROSOFT },
  { keys: ['G', 'S'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_GO_SETTINGS },
  { keys: ['G', 'D'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_GO_DEBUG },
  { keys: ['G', 'L'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_GO_LOGIN },
  { keys: ['Esc'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_CLOSE },
];

// Modal cheatsheet dialog detailing all global keyboard hotkeys
export const ShortcutsModal = memo(({ isOpen, onClose }: ShortcutsModalProps) => {
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={APP_STRINGS.SHORTCUTS.HEADING_TITLE}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Keyboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {APP_STRINGS.SHORTCUTS.HEADING_TITLE}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {APP_STRINGS.SHORTCUTS.TXT_DESCRIPTION}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={APP_STRINGS.SHORTCUTS.BTN_CLOSE_ARIA_LABEL}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Shortcuts Table */}
        <div className="mt-4 space-y-2">
          {SHORTCUT_LIST.map((entry) => (
            <div
              key={entry.label}
              className="flex items-center justify-between py-1.5 text-xs"
            >
              <span className="text-slate-600 dark:text-slate-300">{entry.label}</span>
              <div className="flex items-center gap-1">
                {entry.keys.map((k) => (
                  <kbd
                    key={k}
                    className="min-w-6 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-center font-mono text-[11px] font-semibold text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <Command className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
            <span>{APP_STRINGS.SHORTCUTS.TXT_FOOTER_NOTE}</span>
          </div>
          <Button onClick={onClose} variant="secondary">
            {APP_STRINGS.SHORTCUTS.BTN_CLOSE}
          </Button>
        </div>
      </div>
    </div>
  );
});

