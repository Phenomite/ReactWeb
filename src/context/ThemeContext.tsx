import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { THEME_CONFIG, THEME_OPTIONS } from '@/constants';
import type { ThemeMode, ThemeOption } from '@/types';

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  availableThemes: readonly ThemeOption[];
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const { STORAGE_KEY, MODE_DARK, MODE_LIGHT, MODE_OCEAN, QUERY_PREFERS_DARK, AVAILABLE_THEMES } = THEME_CONFIG;

function isValidTheme(value: string | null): value is ThemeMode {
  return AVAILABLE_THEMES.includes(value as ThemeMode);
}

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidTheme(saved)) {
      return saved;
    }
    const prefersDark = window.matchMedia?.(QUERY_PREFERS_DARK).matches ?? false;
    return prefersDark ? MODE_DARK : MODE_LIGHT;
  } catch {
    return MODE_LIGHT;
  }
}

// Manages semantic multi-theme state, persistence, and DOM attribute synchronization
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  // Subscribes to system dark mode preference changes when no explicit theme is saved
  useEffect(() => {
    const media = window.matchMedia(QUERY_PREFERS_DARK);
    const onChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          setThemeState(e.matches ? MODE_DARK : MODE_LIGHT);
        }
      } catch {
        // Ignore storage access errors
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Synchronizes HTML root element attributes and localStorage on theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    const isDark = theme === MODE_DARK || theme === MODE_OCEAN;
    root.classList.toggle('dark', isDark);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore localStorage write failures in sandboxed contexts
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setThemeState((prev) => (prev === MODE_DARK || prev === MODE_OCEAN ? MODE_LIGHT : MODE_DARK));
  }, []);

  const darkMode = theme === MODE_DARK || theme === MODE_OCEAN;

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme,
      availableThemes: THEME_OPTIONS,
      darkMode,
      toggleDarkMode,
    }),
    [theme, setTheme, darkMode, toggleDarkMode],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

// Custom hook providing access to theme state and mutators
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
