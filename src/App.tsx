import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { APP_STRINGS } from './strings';
import { getViewByHash, DEFAULT_VIEW, type ViewDefinition } from './views';

export function App() {
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

  // Ensure default anchor is set to #homepage on initial load if empty
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = DEFAULT_VIEW.hash;
      }
      setActiveView(getViewByHash(window.location.hash));
    }
  }, []);

  // Listen to browser hash changes (e.g. back/forward or programmatic navigation)
  useEffect(() => {
    const handleHashChange = () => {
      setActiveView(getViewByHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Apply dark mode class to root HTML
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

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

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
      {/* Container 1 & 2: Aside Sidebar (w-72 with Cuboid icon heading and view navigation) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        activeViewId={activeView.id}
        onSelectView={handleSelectView}
      />

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Container 3: Main Header (height lines up with aside header) */}
        <Header
          activeViewTitle={activeView.title}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Container 4: Main Body Section */}
        <MainContent activeView={activeView} />
      </div>
    </div>
  );
}

export default App;
