import { memo } from 'react';
import { Settings } from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { Card } from '@/components/Card';
import type { ViewDefinition } from '@/types';

// Renders the settings preferences view card
export const SettingsView = memo(() => (
  <Card heading={APP_STRINGS.VIEWS.SETTINGS.HEADING_PAGE} description={APP_STRINGS.VIEWS.SETTINGS.TXT_DESCRIPTION} />
));

// Colocated Settings view routing metadata
export const settingsView: ViewDefinition = {
  id: APP_STRINGS.VIEWS.SETTINGS.NAV_ID,
  title: APP_STRINGS.VIEWS.SETTINGS.NAV_TITLE,
  hash: APP_STRINGS.VIEWS.SETTINGS.NAV_HASH,
  icon: Settings,
  component: SettingsView,
};
