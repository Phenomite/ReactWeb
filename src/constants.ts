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

// Centralized application string constants following component-first naming conventions
export const APP_STRINGS = {
  APP: {
    HEADING_TITLE: 'Boilerplate App',
  },
  SIDEBAR: {
    HEADING_TITLE: 'Boilerplate App',
    NAV_MAIN_ARIA_LABEL: 'Main navigation',
    BTN_CLOSE_ARIA_LABEL: 'Close sidebar',
    LABEL_DARK_MODE: 'Dark Mode',
    SWITCH_THEME_ARIA_LABEL: 'Toggle dark mode',
  },
  HEADER: {
    BTN_OPEN_SIDEBAR_ARIA_LABEL: 'Open sidebar',
    BTN_TOGGLE_THEME_ARIA_LABEL: 'Toggle dark mode',
    BADGE_DEFAULT_USER: 'User',
    BTN_LOGIN_TEXT: 'Sign In',
    BTN_LOGIN_ARIA_LABEL: 'Navigate to login page',
    BTN_LOGOUT_TEXT: 'Sign Out',
    BTN_LOGOUT_ARIA_LABEL: 'Sign out of application',
  },
  VIEWS: {
    HOMEPAGE: {
      NAV_ID: 'homepage',
      NAV_TITLE: 'Homepage',
      NAV_HASH: '#homepage',
      HEADING_PAGE: 'Welcome to the Homepage',
      TXT_DESCRIPTION: 'This is the default landing view of the application boilerplate.',
    },
    SETTINGS: {
      NAV_ID: 'settings',
      NAV_TITLE: 'Settings',
      NAV_HASH: '#settings',
      HEADING_PAGE: 'Settings',
      TXT_DESCRIPTION: 'Configure and customize your application settings and preferences.',
    },
    LOGIN: {
      NAV_ID: 'login',
      NAV_TITLE: 'Login',
      NAV_HASH: '#login',
      HEADING_PAGE: 'User Authentication',
      TXT_DESCRIPTION: 'Enter your credentials to access protected diagnostic views.',
      LABEL_USERNAME: 'Username',
      LABEL_PASSWORD: 'Password',
      INPUT_PLACEHOLDER_USERNAME: 'Enter username',
      INPUT_PLACEHOLDER_PASSWORD: 'Enter password',
      BTN_SUBMIT: 'Sign In',
      BTN_LOGOUT: 'Sign Out',
      BTN_GO_TO_DEBUG: 'Open Debug View',
      TXT_AUTH_NOTICE: 'Please provide your authorized credentials to proceed.',
      TXT_INVALID_CREDENTIALS: 'Invalid username or password. Please try again.',
      TXT_LOGGED_IN_GREETING: 'You are authenticated as',
      BTN_CLEAR_STORAGE: 'Clear Local Storage',
      BTN_CLEAR_STORAGE_ARIA_LABEL: 'Clear stored session and preferences from local storage',
    },
    DEBUG: {
      NAV_ID: 'debug',
      NAV_TITLE: 'Debug',
      NAV_HASH: '#debug',
      HEADING_PAGE: 'Debug & Runtime Diagnostics',
      TXT_DESCRIPTION: 'Protected view for inspecting runtime state, environment variables, and system metrics.',
      HEADING_UNAUTHORIZED: 'Authentication Required',
      TXT_UNAUTHORIZED_MESSAGE: 'You must be authenticated to access the diagnostics dashboard.',
      BTN_LOGIN_PROMPT: 'Go to Login',
      HEADING_SYSTEM_INFO: 'System & Framework',
      HEADING_ACTIVE_STATE: 'Application State',
      LABEL_ACTIVE_ANCHOR: 'Active URL Anchor',
      LABEL_AUTH_STATE: 'Authentication Status',
      LABEL_AUTH_ACTIVE: 'Active (True)',
      LABEL_REGISTERED_VIEWS: 'Registered Views Count',
    },
  },
  THEME: {
    STORAGE_KEY: 'theme',
    MODE_DARK: 'dark',
    MODE_LIGHT: 'light',
    QUERY_PREFERS_DARK: '(prefers-color-scheme: dark)',
  },
  AUTH: {
    STORAGE_KEY_SESSION: 'app_auth_session',
  },
} as const;

