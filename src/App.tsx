import { useCallback, useState } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { Header } from '@/components/Header';
import { ShortcutsModal } from '@/components/ShortcutsModal';
import { ToastContainer } from '@/components/ToastContainer';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AccentProvider, useAccent } from '@/context/AccentContext';
import { HeaderSlotProvider } from '@/context/HeaderSlotContext';
import { RealtimeProvider } from '@/context/RealtimeContext';
import { SecurityIncidentProvider } from '@/context/SecurityIncidentContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { useHashRouting } from '@/hooks/useHashRouting';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { APP_STRINGS } from '@/strings';
import type { ViewDefinition } from '@/types';
import { Sidebar } from '@/views/Sidebar';

// Renders the 4-container application layout shell
function AppLayout() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { accent, setAccent } = useAccent();
  const { showToast } = useToast();
  const { activeView, navigateToView } = useHashRouting();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleOpenCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const handleCloseCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

  const handleOpenShortcuts = useCallback(() => setShortcutsModalOpen(true), []);
  const handleCloseShortcuts = useCallback(() => setShortcutsModalOpen(false), []);

  const handleToggleDarkMode = useCallback(() => {
    toggleDarkMode();
    showToast(darkMode ? APP_STRINGS.TOAST.TXT_THEME_LIGHT : APP_STRINGS.TOAST.TXT_THEME_DARK, { type: 'info' });
  }, [darkMode, toggleDarkMode, showToast]);

  const handleSelectView = useCallback(
    (view: ViewDefinition) => {
      navigateToView(view);
      setSidebarOpen(false);
    },
    [navigateToView],
  );

  // Wire global keyboard shortcuts
  useKeyboardShortcuts({
    onToggleCommandPalette: useCallback(() => setCommandPaletteOpen((prev) => !prev), []),
    onToggleShortcutsModal: useCallback(() => setShortcutsModalOpen((prev) => !prev), []),
    onToggleDarkMode: handleToggleDarkMode,
  });

  const ActiveComponent = activeView.component;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Containers 1 & 2: Top-left heading & Aside Sidebar (w-72) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        activeViewId={activeView.id}
        onSelectView={handleSelectView}
      />

      {/* Main container column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Container 3: Main Header (h-16) */}
        <Header
          activeViewTitle={activeView.title}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onOpenSidebar={handleOpenSidebar}
          onOpenCommandPalette={handleOpenCommandPalette}
          onOpenShortcuts={handleOpenShortcuts}
        />

        {/* Container 4: Main Body View Section */}
        <main className="flex-1 overflow-y-auto p-3 text-foreground">
          <ActiveComponent />
        </main>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={handleCloseCommandPalette}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        currentAccent={accent}
        onSelectAccent={setAccent}
      />

      {/* Global Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={handleCloseShortcuts} />

      {/* Floating Accessible Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

// Top-level root application provider container
export function App() {
  return (
    <ThemeProvider>
      <AccentProvider>
        <ToastProvider>
          <RealtimeProvider>
            <SecurityIncidentProvider>
              <HeaderSlotProvider>
                <TooltipProvider delayDuration={150}>
                  <AppLayout />
                </TooltipProvider>
              </HeaderSlotProvider>
            </SecurityIncidentProvider>
          </RealtimeProvider>
        </ToastProvider>
      </AccentProvider>
    </ThemeProvider>
  );
}
