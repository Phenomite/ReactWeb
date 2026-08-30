import { memo } from 'react';
import { Home } from 'lucide-react';
import { APP_STRINGS } from '@/constants';
import { Card } from '@/components/Card';
import type { ViewDefinition } from '@/types';

// Renders the default homepage landing view card
export const HomepageView = memo(() => (
  <Card heading={APP_STRINGS.VIEWS.HOMEPAGE.HEADING_PAGE} description={APP_STRINGS.VIEWS.HOMEPAGE.TXT_DESCRIPTION} />
));

// Colocated Homepage view routing metadata
export const homepageView: ViewDefinition = {
  id: APP_STRINGS.VIEWS.HOMEPAGE.NAV_ID,
  title: APP_STRINGS.VIEWS.HOMEPAGE.NAV_TITLE,
  hash: APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH,
  icon: Home,
  component: HomepageView,
};
