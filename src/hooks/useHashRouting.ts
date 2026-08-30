import { useState, useEffect, useCallback } from 'react';
import type { ViewDefinition } from '@/types/views';
import { getViewByHash, DEFAULT_VIEW } from '@/constants/views';

// Synchronizes active view selection with the browser URL location hash
export function useHashRouting() {
  const [activeView, setActiveView] = useState<ViewDefinition>(() =>
    typeof window !== 'undefined' ? getViewByHash(window.location.hash) : DEFAULT_VIEW
  );

  // Syncs route on mount and assigns default hash if empty
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.hash || window.location.hash === '#') window.location.hash = DEFAULT_VIEW.hash;
    setActiveView(getViewByHash(window.location.hash));
  }, []);

  // Listens to browser hashchange events to update the active view
  useEffect(() => {
    const handleHashChange = () => setActiveView(getViewByHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigates to a specific view by updating window.location.hash
  const navigateToView = useCallback((view: ViewDefinition) => {
    if (window.location.hash !== view.hash) window.location.hash = view.hash;
    else setActiveView(view);
  }, []);

  return { activeView, navigateToView };
}
