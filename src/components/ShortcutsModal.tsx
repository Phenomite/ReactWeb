import { Command, Keyboard, X } from 'lucide-react';
import { memo, useCallback } from 'react';
import { Button } from '@/components/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { APP_STRINGS } from '@/strings';

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
  { keys: ['Esc'], label: APP_STRINGS.SHORTCUTS.LABEL_SHORTCUT_CLOSE },
];

// Modal cheatsheet dialog detailing all global keyboard hotkeys
export const ShortcutsModal = memo(({ isOpen, onClose }: ShortcutsModalProps) => {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="w-full max-w-md p-6">
        <DialogHeader className="flex flex-row items-center justify-between border-border border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Keyboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="font-bold text-base text-foreground">
                {APP_STRINGS.SHORTCUTS.HEADING_TITLE}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                {APP_STRINGS.SHORTCUTS.TXT_DESCRIPTION}
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              onClick={onClose}
              aria-label={APP_STRINGS.SHORTCUTS.BTN_CLOSE_ARIA_LABEL}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Shortcuts Table */}
        <div className="space-y-2">
          {SHORTCUT_LIST.map((entry) => (
            <div key={entry.label} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-foreground">{entry.label}</span>
              <div className="flex items-center gap-1">
                {entry.keys.map((k) => (
                  <kbd
                    key={k}
                    className="min-w-6 rounded-md border border-border bg-muted px-2 py-1 text-center font-mono font-semibold text-[11px] text-foreground shadow-2xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-border border-t pt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Command className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>{APP_STRINGS.SHORTCUTS.TXT_FOOTER_NOTE}</span>
          </div>
          <DialogClose asChild>
            <Button onClick={onClose} variant="secondary">
              {APP_STRINGS.SHORTCUTS.BTN_CLOSE}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ShortcutsModal.displayName = 'ShortcutsModal';
