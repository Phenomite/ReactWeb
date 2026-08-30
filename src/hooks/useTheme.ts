import { useState, useEffect, useCallback } from 'react';
import { THEME_CONFIG } from '@/constants';

const { STORAGE_KEY, MODE_DARK, MODE_LIGHT, QUERY_PREFERS_DARK } = THEME_CONFIG;

// Detects initial theme from localStorage or OS system preference
function getInitialTheme(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved === MODE_DARK;
  return window.matchMedia?.(QUERY_PREFERS_DARK).matches ?? false;
}

// Manages dark mode state, system media query sync, and localStorage persistence
export function useTheme() {
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  // Subscribes to system dark mode preference changes when no explicit theme is saved
  useEffect(() => {
    const media = window.matchMedia(QUERY_PREFERS_DARK);
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) setDarkMode(e.matches);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Synchronizes HTML root class and localStorage when darkMode changes
  useEffect(() => {
    document.documentElement.classList.toggle(MODE_DARK, darkMode);
    localStorage.setItem(STORAGE_KEY, darkMode ? MODE_DARK : MODE_LIGHT);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  return { darkMode, toggleDarkMode };
}
