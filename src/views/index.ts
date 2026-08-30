import type { ComponentType } from 'react';
import { Home, Settings } from 'lucide-react';
import { HomepageView } from './HomepageView';
import { SettingsView } from './SettingsView';
import { APP_STRINGS } from '../strings';

export interface ViewDefinition {
  id: string;
  title: string;
  hash: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType;
}

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
];

export const DEFAULT_VIEW = APP_VIEWS[0];

export function getViewByHash(hash: string): ViewDefinition {
  const normalizedHash = hash.toLowerCase();
  const matched = APP_VIEWS.find(
    (view) => view.hash.toLowerCase() === normalizedHash || `#${view.id.toLowerCase()}` === normalizedHash
  );
  return matched || DEFAULT_VIEW;
}
