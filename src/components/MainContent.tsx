import { memo } from 'react';
import type { ViewDefinition } from '@/types/views';

interface MainContentProps {
  activeView: ViewDefinition;
}

// Renders the primary scrollable body container with the active view component
export const MainContent = memo(({ activeView }: MainContentProps) => {
  const ActiveComponent = activeView.component;
  return (
    <main className="flex-1 overflow-y-auto p-6 text-slate-800 dark:text-slate-200">
      <ActiveComponent />
    </main>
  );
});
