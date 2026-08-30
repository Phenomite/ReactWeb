import { memo } from 'react';
import { APP_STRINGS } from '@/constants/strings';

// Renders the default homepage landing view card
export const HomepageView = memo(() => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
    <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {APP_STRINGS.VIEWS.HOMEPAGE.HEADING_PAGE}
    </h2>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
      {APP_STRINGS.VIEWS.HOMEPAGE.TXT_DESCRIPTION}
    </p>
  </div>
));
