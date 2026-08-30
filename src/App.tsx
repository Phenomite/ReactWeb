import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';
import { AuthProvider } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useHashRouting } from '@/hooks/useHashRouting';
import type { ViewDefinition } from '@/types/views';

// Renders the 4-container application layout shell
function AppLayout() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { activeView, navigateToView } = useHashRouting();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleSelectView = useCallback((view: ViewDefinition) => {
    navigateToView(view);
    setSidebarOpen(false);
  }, [navigateToView]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Containers 1 & 2: Top-left heading & Aside Sidebar (w-72) */}
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
        {/* Container 3: Main Header (h-16) */}
        <Header
          activeViewTitle={activeView.title}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenSidebar={handleOpenSidebar}
        />

        {/* Container 4: Main Body View Section */}
        <MainContent activeView={activeView} />
      </div>
    </div>
  );
}

// Top-level root application provider container
export function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
