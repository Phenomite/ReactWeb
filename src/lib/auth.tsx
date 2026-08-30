import { useState, useEffect, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';
import { APP_STRINGS } from '../strings';

export interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(APP_STRINGS.auth.storageKey) === 'true';
    }
    return false;
  });

  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(APP_STRINGS.auth.userStorageKey) || null;
    }
    return null;
  });

  // Stores authentication flags and username in localStorage and updates component state
  const login = useCallback((name: string) => {
    const validName = name.trim() || 'Developer';
    setIsAuthenticated(true);
    setUsername(validName);
    localStorage.setItem(APP_STRINGS.auth.storageKey, 'true');
    localStorage.setItem(APP_STRINGS.auth.userStorageKey, validName);
  }, []);

  // Removes authentication keys from localStorage and resets state to unauthenticated
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem(APP_STRINGS.auth.storageKey);
    localStorage.removeItem(APP_STRINGS.auth.userStorageKey);
  }, []);

  // Subscribes to window storage events to synchronize authentication across browser tabs
  useEffect(() => {
    const syncAuth = () => {
      const auth = localStorage.getItem(APP_STRINGS.auth.storageKey) === 'true';
      const user = localStorage.getItem(APP_STRINGS.auth.userStorageKey);
      setIsAuthenticated(auth);
      setUsername(user);
    };

    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  // Memoizes context value object to prevent unnecessary re-renders of consumer components
  const value = useMemo(
    () => ({ isAuthenticated, username, login, logout }),
    [isAuthenticated, username, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
