import type { ViewDefinition } from '@/types';
import { debugView } from '@/views/DebugView';
import { homepageView } from '@/views/HomepageView';
import { microsoftView } from '@/views/MicrosoftView';
import { settingsView } from '@/views/SettingsView';

// Central view registry aggregating all colocated view definitions
export const APP_VIEWS: ViewDefinition[] = [homepageView, microsoftView, settingsView, debugView];

export const DEFAULT_VIEW = homepageView;

// Filters view array for sidebar display
export function getVisibleViews(): ViewDefinition[] {
  return APP_VIEWS.filter((v) => !v.hideInSidebar);
}

// Returns matching view by anchor hash or returns the default view
export function getViewByHash(hash: string): ViewDefinition {
  const normalized = hash.toLowerCase();
  return (
    APP_VIEWS.find((v) => v.hash.toLowerCase() === normalized || `#${v.id.toLowerCase()}` === normalized) ||
    DEFAULT_VIEW
  );
}
