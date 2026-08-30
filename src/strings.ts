export const APP_STRINGS = {
  app: {
    title: 'Boilerplate App',
  },
  sidebar: {
    heading: 'Boilerplate App',
    navigationLabel: 'Main navigation',
    closeLabel: 'Close sidebar',
    darkModeLabel: 'Dark Mode',
    toggleThemeLabel: 'Toggle dark mode',
  },
  header: {
    openSidebarLabel: 'Open sidebar',
    toggleThemeLabel: 'Toggle dark mode',
  },
  views: {
    homepage: {
      id: 'homepage',
      title: 'Homepage',
      hash: '#homepage',
      heading: 'Welcome to the Homepage',
      description: 'This is the default landing view of the application boilerplate.',
    },
    settings: {
      id: 'settings',
      title: 'Settings',
      hash: '#settings',
      heading: 'Settings',
      description: 'Configure and customize your application settings and preferences.',
    },
  },
  theme: {
    storageKey: 'theme',
    dark: 'dark',
    light: 'light',
    prefersDarkQuery: '(prefers-color-scheme: dark)',
  },
} as const;
