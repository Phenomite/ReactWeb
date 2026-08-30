import { APP_STRINGS } from '../strings';

export const SettingsView = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {APP_STRINGS.views.settings.heading}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {APP_STRINGS.views.settings.description}
      </p>
    </div>
  );
};
