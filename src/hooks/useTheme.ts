import { useState, useEffect, useCallback } from 'react';
import { APP_STRINGS } from '@/constants/strings';

// Detects initial theme from localStorage or OS system preference
function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(APP_STRINGS.THEME.STORAGE_KEY);
  if (saved === APP_STRINGS.THEME.MODE_DARK) return true;
  if (saved === APP_STRINGS.THEME.MODE_LIGHT) return false;
  return window.matchMedia?.(APP_STRINGS.THEME.QUERY_PREFERS_DARK).matches ?? false;
}

// Manages dark mode state, system media query sync, and localStorage persistence
export function useTheme() {
  const [darkMode, setDarkMode] = useState<boolean>(getInitialTheme);

  // Subscribes to system dark mode preference changes when no explicit theme is saved
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia(APP_STRINGS.THEME.QUERY_PREFERS_DARK);
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(APP_STRINGS.THEME.STORAGE_KEY)) setDarkMode(e.matches);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Synchronizes HTML root class and localStorage when darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(APP_STRINGS.THEME.MODE_DARK, darkMode);
    localStorage.setItem(APP_STRINGS.THEME.STORAGE_KEY, darkMode ? APP_STRINGS.THEME.MODE_DARK : APP_STRINGS.THEME.MODE_LIGHT);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  return { darkMode, toggleDarkMode };
}
