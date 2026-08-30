import type { UserCredentialRecord } from '@/types';

// Extensible client-side credential registry for authorized users
export const AUTH_USER_REGISTRY: Record<string, UserCredentialRecord> = {
  admin: {
    id: 'usr_admin',
    username: 'admin',
    displayName: 'Admin',
    saltHex: '87b880683d1e1c14f6358c000f55dbd4',
    hashHex: 'e22f996854f8d016166257a91a47df5da5d7708dc49e4e05914675568f48f4d9',
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
