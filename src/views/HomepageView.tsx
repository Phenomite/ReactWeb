import { useCallback, memo } from 'react';
import {
  Home,
  CogIcon,
  ShieldCheck,
  ShieldAlert,
  Palette,
  Copy,
  Settings,
  Terminal,
  Search,
} from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useAccent } from '@/context/AccentContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import type { ViewDefinition } from '@/types';

// Renders dynamic time-aware greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return APP_STRINGS.VIEWS.HOMEPAGE.GREETING_MORNING;
  if (hour < 18) return APP_STRINGS.VIEWS.HOMEPAGE.GREETING_AFTERNOON;
  return APP_STRINGS.VIEWS.HOMEPAGE.GREETING_EVENING;
}

// Renders the Living Dashboard landing view
export const HomepageView = memo(() => {
  const { isAuthenticated, username } = useAuth();
  const { activeOption } = useAccent();
  const { showToast } = useToast();
  const greeting = getGreeting();

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    showToast(APP_STRINGS.TOAST.TXT_URL_COPIED, { type: 'success' });
  }, [showToast]);

  const handleOpenSettings = useCallback(() => {
    window.location.hash = APP_STRINGS.VIEWS.SETTINGS.NAV_HASH;
  }, []);

  const handleOpenDebug = useCallback(() => {
    window.location.hash = isAuthenticated
      ? APP_STRINGS.VIEWS.DEBUG.NAV_HASH
      : APP_STRINGS.VIEWS.LOGIN.NAV_HASH;
  }, [isAuthenticated]);

  return (
    <div className="space-y-6">
      {/* Top Dynamic Greeting Banner */}
      <Card
        heading={`${greeting}${username ? `, ${username}` : ''}!`}
        description={APP_STRINGS.VIEWS.HOMEPAGE.TXT_DESCRIPTION}
        icon={Home}
        headerRight={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-accent dark:bg-slate-800">
            <CogIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Version 0.0.2</span>
          </span>
        }
      />

      {/* Live Status Pulse Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                isAuthenticated
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {isAuthenticated ? (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.HOMEPAGE.LABEL_STATUS_AUTH}
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {isAuthenticated
                  ? `${APP_STRINGS.VIEWS.HOMEPAGE.TXT_STATUS_AUTHENTICATED} (${username})`
                  : APP_STRINGS.VIEWS.HOMEPAGE.TXT_STATUS_NOT_AUTHENTICATED}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Palette className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.HOMEPAGE.LABEL_STATUS_ACCENT}
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {activeOption.label}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Terminal className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Productivity Hotkeys
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Ctrl + K Palette
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Launch Actions */}
      <Card className="p-6">
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {APP_STRINGS.VIEWS.HOMEPAGE.HEADING_QUICK_ACTIONS}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fast navigation and handy shortcuts to optimize your workflow.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Button onClick={handleOpenSettings} icon={Settings} variant="secondary" className="justify-start">
            {APP_STRINGS.VIEWS.HOMEPAGE.BTN_QUICK_SETTINGS}
          </Button>
          <Button onClick={handleCopyLink} icon={Copy} variant="secondary" className="justify-start">
            {APP_STRINGS.VIEWS.HOMEPAGE.BTN_QUICK_COPY_LINK}
          </Button>
          <Button onClick={handleOpenDebug} icon={Terminal} variant="secondary" className="justify-start">
            {APP_STRINGS.VIEWS.HOMEPAGE.BTN_QUICK_DEBUG}
          </Button>
          <Button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
              window.dispatchEvent(event);
            }}
            icon={Search}
            variant="secondary"
            className="justify-start"
          >
            {APP_STRINGS.VIEWS.HOMEPAGE.BTN_QUICK_PALETTE}
          </Button>
        </div>
      </Card>
    </div>
  );
});

// Colocated Homepage view routing metadata
export const homepageView: ViewDefinition = {
  id: APP_STRINGS.VIEWS.HOMEPAGE.NAV_ID,
  title: APP_STRINGS.VIEWS.HOMEPAGE.NAV_TITLE,
  hash: APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH,
  icon: Home,
  component: HomepageView,
};
