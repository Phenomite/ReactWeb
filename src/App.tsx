import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { APP_STRINGS } from './strings';
import { getViewByHash, DEFAULT_VIEW, type ViewDefinition } from './views';
import { AuthProvider } from './lib/auth';

function AppLayout() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(APP_STRINGS.theme.storageKey);
      if (savedTheme === APP_STRINGS.theme.dark) return true;
      if (savedTheme === APP_STRINGS.theme.light) return false;
      return window.matchMedia(APP_STRINGS.theme.prefersDarkQuery).matches;
    }
    return false;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewDefinition>(() => {
    if (typeof window !== 'undefined') {
      return getViewByHash(window.location.hash);
    }
    return DEFAULT_VIEW;
  });

  // Assigns default window location hash on initial load if unset
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = DEFAULT_VIEW.hash;
      }
      setActiveView(getViewByHash(window.location.hash));
    }
  }, []);

  // Subscribes to window hashchange events to synchronize active view state
  useEffect(() => {
    const handleHashChange = () => {
      setActiveView(getViewByHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Synchronizes the root document element classList and localStorage with darkMode state
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add(APP_STRINGS.theme.dark);
      localStorage.setItem(APP_STRINGS.theme.storageKey, APP_STRINGS.theme.dark);
    } else {
      root.classList.remove(APP_STRINGS.theme.dark);
      localStorage.setItem(APP_STRINGS.theme.storageKey, APP_STRINGS.theme.light);
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const handleOpenSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleSelectView = useCallback((view: ViewDefinition) => {
    if (window.location.hash !== view.hash) {
      window.location.hash = view.hash;
    } else {
      setActiveView(view);
    }
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar aside (w-72) with heading, view list, and theme toggle */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        activeViewId={activeView.id}
        onSelectView={handleSelectView}
      />

      {/* Main container column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Main header matching sidebar heading height (h-16) */}
        <Header
          activeViewTitle={activeView.title}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenSidebar={handleOpenSidebar}
        />

        {/* Primary body view container */}
        <MainContent activeView={activeView} />
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
