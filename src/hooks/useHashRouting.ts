import { useState, useEffect, useCallback } from 'react';
import type { ViewDefinition } from '@/types';
import { getViewByHash, DEFAULT_VIEW } from '@/views/views';

// Synchronizes active view selection with the browser URL location hash
export function useHashRouting() {
  const [activeView, setActiveView] = useState<ViewDefinition>(() => getViewByHash(window.location.hash));

  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') window.location.hash = DEFAULT_VIEW.hash;
    const sync = () => setActiveView(getViewByHash(window.location.hash));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const navigateToView = useCallback((view: ViewDefinition) => {
    if (window.location.hash !== view.hash) window.location.hash = view.hash;
    else setActiveView(view);
  }, []);

  return { activeView, navigateToView };
}
