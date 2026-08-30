import type { UserCredentialRecord } from '@/types';

// Extensible client-side credential registry for authorized users
export const AUTH_USER_REGISTRY: Record<string, UserCredentialRecord> = {
  root: {
    id: 'usr_root',
    username: 'root',
    displayName: 'Root Administrator',
    saltHex: '87b880683d1e1c14f6358c000f55dbd4',
    hashHex: 'e23843d507eb99332c5cc8501b3d92ea9f4879326731e8344595efa2e81eedf0',
    iterations: 100000,
    role: 'admin',
  },
};

// Fallback salt and iteration count used to simulate derivation on unknown usernames
export const DUMMY_SALT_HEX = 'e0d1b4c798a2f356417b809cfdae1234';
export const DUMMY_ITERATIONS = 100000;

// Session validity duration configured for 7 days (1 week) in milliseconds
export const AUTH_SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

// Theme configuration constants
export const THEME_CONFIG = {
  STORAGE_KEY: 'theme',
  MODE_DARK: 'dark',
  MODE_LIGHT: 'light',
  QUERY_PREFERS_DARK: '(prefers-color-scheme: dark)',
} as const;

// Authentication storage constants
export const AUTH_CONFIG = {
  STORAGE_KEY_SESSION: 'app_auth_session',
} as const;
