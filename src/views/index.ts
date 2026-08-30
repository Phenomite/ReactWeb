import type { ComponentType } from 'react';
import { Home, Settings, Bug, LogIn } from 'lucide-react';
import { HomepageView } from './HomepageView';
import { SettingsView } from './SettingsView';
import { DebugView } from './DebugView';
import { LoginView } from './LoginView';
import { APP_STRINGS } from '../strings';

export interface ViewDefinition {
  id: string;
  title: string;
  hash: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType;
  requiresAuth?: boolean;
  hideInNav?: boolean;
}

// Registry containing all application views and routing metadata
export const APP_VIEWS: ViewDefinition[] = [
  {
    id: APP_STRINGS.views.homepage.id,
    title: APP_STRINGS.views.homepage.title,
    hash: APP_STRINGS.views.homepage.hash,
    icon: Home,
    component: HomepageView,
  },
  {
    id: APP_STRINGS.views.settings.id,
    title: APP_STRINGS.views.settings.title,
    hash: APP_STRINGS.views.settings.hash,
    icon: Settings,
    component: SettingsView,
  },
  {
    id: APP_STRINGS.views.debug.id,
    title: APP_STRINGS.views.debug.title,
    hash: APP_STRINGS.views.debug.hash,
    icon: Bug,
    component: DebugView,
    requiresAuth: true,
  },
  {
    id: APP_STRINGS.views.login.id,
    title: APP_STRINGS.views.login.title,
    hash: APP_STRINGS.views.login.hash,
    icon: LogIn,
    component: LoginView,
  },
];

export const DEFAULT_VIEW = APP_VIEWS[0];

// Filters view array by authentication requirement
export function getVisibleViews(isAuthenticated: boolean): ViewDefinition[] {
  return APP_VIEWS.filter((view) => {
    if (view.requiresAuth && !isAuthenticated) return false;
    return true;
  });
}

// Returns matching view by anchor hash or returns the default view
export function getViewByHash(hash: string): ViewDefinition {
  const normalizedHash = hash.toLowerCase();
  const matched = APP_VIEWS.find(
    (view) => view.hash.toLowerCase() === normalizedHash || `#${view.id.toLowerCase()}` === normalizedHash
  );
  return matched || DEFAULT_VIEW;
}
