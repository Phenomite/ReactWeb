import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { ACCENT_CONFIG, ACCENT_OPTIONS } from '@/constants';
import type { AccentColor, AccentOption } from '@/types';

interface AccentContextType {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  activeOption: AccentOption;
  options: AccentOption[];
}

const AccentContext = createContext<AccentContextType | undefined>(undefined);

const { STORAGE_KEY, DEFAULT_ACCENT } = ACCENT_CONFIG;

function isValidAccent(value: string | null): value is AccentColor {
  return ACCENT_OPTIONS.some((opt) => opt.id === value);
}

function getInitialAccent(): AccentColor {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (isValidAccent(saved)) {
    return saved;
  }
  return DEFAULT_ACCENT;
}

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>(getInitialAccent);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem(STORAGE_KEY, accent);
  }, [accent]);

  const setAccent = useCallback((newAccent: AccentColor) => {
    setAccentState(newAccent);
  }, []);

  const activeOption = useMemo<AccentOption>(() => {
    const found = ACCENT_OPTIONS.find((opt) => opt.id === accent);
    return found ?? (ACCENT_OPTIONS[0] as AccentOption);
  }, [accent]);

  const contextValue = useMemo<AccentContextType>(
    () => ({ accent, setAccent, activeOption, options: ACCENT_OPTIONS }),
    [accent, setAccent, activeOption]
  );

  return <AccentContext.Provider value={contextValue}>{children}</AccentContext.Provider>;
}

export function useAccent(): AccentContextType {
  const context = useContext(AccentContext);
  if (!context) {
    throw new Error('useAccent must be used within an AccentProvider');
  }
  return context;
}

