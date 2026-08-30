import { useState, useEffect, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';
import type { AuthContextType } from '@/types/auth';
import { APP_STRINGS } from '@/constants/strings';
import { verifyCredentials, createSession, validateSession } from '@/lib/crypto';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provides authentication state and session handlers across the application tree
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Verifies stored session signature on mount and cross-tab storage events
  const syncSession = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(APP_STRINGS.AUTH.STORAGE_KEY_SESSION);
    const valid = await validateSession(raw);
    setIsAuthenticated(Boolean(valid));
    setUsername(valid ? valid.displayName || valid.username : null);
    if (!valid && raw) localStorage.removeItem(APP_STRINGS.AUTH.STORAGE_KEY_SESSION);
  }, []);

  useEffect(() => {
    syncSession();
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, [syncSession]);

  // Authenticates credentials via PBKDF2 and creates a 7-day signed session token
  const login = useCallback(async (name: string, pass: string): Promise<boolean> => {
    const user = await verifyCredentials(name, pass);
    if (!user) return false;
    const session = await createSession(user);
    localStorage.setItem(APP_STRINGS.AUTH.STORAGE_KEY_SESSION, JSON.stringify(session));
    setIsAuthenticated(true);
    setUsername(session.displayName || session.username);
    return true;
  }, []);

  // Clears session storage and resets authentication state to unauthenticated
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem(APP_STRINGS.AUTH.STORAGE_KEY_SESSION);
  }, []);

  const value = useMemo(() => ({ isAuthenticated, username, login, logout }), [isAuthenticated, username, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Accesses authentication state and session methods
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
