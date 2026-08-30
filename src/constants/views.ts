import { Home, Settings, Bug, LogIn } from 'lucide-react';
import { HomepageView } from '@/views/HomepageView';
import { SettingsView } from '@/views/SettingsView';
import { DebugView } from '@/views/DebugView';
import { LoginView } from '@/views/LoginView';
import { APP_STRINGS } from '@/constants/strings';
import type { ViewDefinition } from '@/types/views';

// Centralized view list definitions and routing metadata
export const APP_VIEWS: ViewDefinition[] = [
  {
    id: APP_STRINGS.VIEWS.HOMEPAGE.NAV_ID,
    title: APP_STRINGS.VIEWS.HOMEPAGE.NAV_TITLE,
    hash: APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH,
    icon: Home,
    component: HomepageView,
  },
  {
    id: APP_STRINGS.VIEWS.SETTINGS.NAV_ID,
    title: APP_STRINGS.VIEWS.SETTINGS.NAV_TITLE,
    hash: APP_STRINGS.VIEWS.SETTINGS.NAV_HASH,
    icon: Settings,
    component: SettingsView,
  },
  {
    id: APP_STRINGS.VIEWS.DEBUG.NAV_ID,
    title: APP_STRINGS.VIEWS.DEBUG.NAV_TITLE,
    hash: APP_STRINGS.VIEWS.DEBUG.NAV_HASH,
    icon: Bug,
    component: DebugView,
    requiresAuth: true,
  },
  {
    id: APP_STRINGS.VIEWS.LOGIN.NAV_ID,
    title: APP_STRINGS.VIEWS.LOGIN.NAV_TITLE,
    hash: APP_STRINGS.VIEWS.LOGIN.NAV_HASH,
    icon: LogIn,
    component: LoginView,
    hideWhenAuth: true,
  },
];

export const DEFAULT_VIEW = APP_VIEWS[0];

// Filters view array by authentication state and visibility flags
export function getVisibleViews(isAuthenticated: boolean): ViewDefinition[] {
  return APP_VIEWS.filter((view) => {
    if (view.requiresAuth && !isAuthenticated) return false;
    if (view.hideWhenAuth && isAuthenticated) return false;
    return true;
  });
}

// Returns matching view by anchor hash or returns the default view
export function getViewByHash(hash: string): ViewDefinition {
  const normalized = hash.toLowerCase();
  const matched = APP_VIEWS.find((v) => v.hash.toLowerCase() === normalized || `#${v.id.toLowerCase()}` === normalized);
  return matched || DEFAULT_VIEW;
}
