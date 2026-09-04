import { useEffect, useRef } from 'react';
import { APP_STRINGS } from '@/strings';

interface UseKeyboardShortcutsOptions {
  onToggleCommandPalette: () => void;
  onToggleShortcutsModal: () => void;
  onToggleDarkMode: () => void;
}

// Global keyboard shortcuts handler for productivity navigation and palette triggers
export function useKeyboardShortcuts({
  onToggleCommandPalette,
  onToggleShortcutsModal,
  onToggleDarkMode,
}: UseKeyboardShortcutsOptions) {
  const pendingSequenceRef = useRef<string | null>(null);
  const sequenceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Cmd+K or Ctrl+K anywhere (even from inputs)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleCommandPalette();
        return;
      }

      // If user is actively typing in a form input, skip single-key shortcuts
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (isInput) return;

      // Question mark ('?' or Shift + '/') toggles keyboard shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        onToggleShortcutsModal();
        return;
      }

      // 't' key toggles dark/light theme
      if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onToggleDarkMode();
        return;
      }

      // Handle 'g' two-key jump sequence
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        pendingSequenceRef.current = 'g';
        if (sequenceTimerRef.current !== null) {
          window.clearTimeout(sequenceTimerRef.current);
        }
        sequenceTimerRef.current = window.setTimeout(() => {
          pendingSequenceRef.current = null;
        }, 1000);
        return;
      }

      if (pendingSequenceRef.current === 'g') {
        pendingSequenceRef.current = null;
        if (sequenceTimerRef.current !== null) {
          window.clearTimeout(sequenceTimerRef.current);
        }

        const nextKey = e.key.toLowerCase();
        if (nextKey === 'h') {
          e.preventDefault();
          window.location.hash = APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH;
        } else if (nextKey === 'm') {
          e.preventDefault();
          window.location.hash = APP_STRINGS.VIEWS.MICROSOFT.NAV_HASH;
        } else if (nextKey === 's') {
          e.preventDefault();
          window.location.hash = APP_STRINGS.VIEWS.SETTINGS.NAV_HASH;
        } else if (nextKey === 'd') {
          e.preventDefault();
          window.location.hash = APP_STRINGS.VIEWS.DEBUG.NAV_HASH;
        } else if (nextKey === 'l') {
          e.preventDefault();
          window.location.hash = APP_STRINGS.VIEWS.LOGIN.NAV_HASH;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimerRef.current !== null) {
        window.clearTimeout(sequenceTimerRef.current);
      }
    };
  }, [onToggleCommandPalette, onToggleShortcutsModal, onToggleDarkMode]);
}

