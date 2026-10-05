import { Building2, CogIcon, Copy, Database, Home, Palette, Search, Settings, Terminal } from 'lucide-react';
import { memo, useCallback } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ALL_TENANTS, APP_VERSION } from '@/constants';
import { useAccent } from '@/context/AccentContext';
import { useRealtime } from '@/context/RealtimeContext';
import { useToast } from '@/context/ToastContext';
import { copyCurrentUrl } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';
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
	const { activeOption } = useAccent();
	const { isLive, activeVisitors } = useRealtime();
	const { showToast } = useToast();
	const greeting = getGreeting();

	const handleCopyLink = useCallback(() => {
		copyCurrentUrl(showToast);
	}, [showToast]);

	const handleOpenSettings = useCallback(() => {
		window.location.hash = APP_STRINGS.VIEWS.SETTINGS.NAV_HASH;
	}, []);

	const handleOpenDebug = useCallback(() => {
		window.location.hash = APP_STRINGS.VIEWS.DEBUG.NAV_HASH;
	}, []);

	const handleOpenPalette = useCallback(() => {
		const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
		window.dispatchEvent(event);
	}, []);

	return (
		<div className="space-y-6">
			{/* Top Dynamic Greeting Banner */}
			<Card
				heading={`${greeting}!`}
				description={APP_STRINGS.VIEWS.HOMEPAGE.TXT_DESCRIPTION}
				icon={Home}
				headerRight={
					<span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-accent dark:bg-slate-800">
						<CogIcon className="h-3.5 w-3.5" aria-hidden="true" />
						<span>Version {APP_VERSION}</span>
					</span>
				}
			/>

			{/* Live Status Pulse Grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{/* Card 1: Managed Tenants */}
				<Card className="p-4">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
							<Building2 className="h-4 w-4" aria-hidden="true" />
						</div>
						<div>
							<p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
								{APP_STRINGS.VIEWS.HOMEPAGE.LABEL_MANAGED_TENANTS}
							</p>
							<p className="text-xs font-bold text-slate-900 dark:text-white">
								{ALL_TENANTS.length} {APP_STRINGS.VIEWS.MICROSOFT.LABEL_FLEET_UNITS}
							</p>
						</div>
					</div>
				</Card>

				{/* Card 2: Live Real-Time Database */}
				<Card className="p-4">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
							<Database className="h-4 w-4" aria-hidden="true" />
						</div>
						<div>
							<p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
								{APP_STRINGS.REALTIME.LABEL_DB_ENGINE}
							</p>
							<p className="text-xs font-bold text-slate-900 dark:text-white">
								{isLive
									? `${APP_STRINGS.REALTIME.VALUE_DB_ENGINE} (${activeVisitors})`
									: APP_STRINGS.REALTIME.LABEL_OFFLINE}
							</p>
						</div>
					</div>
				</Card>

				{/* Card 3: Theme Accent */}
				<Card className="p-4">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
							<Palette className="h-4 w-4" aria-hidden="true" />
						</div>
						<div>
							<p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
								{APP_STRINGS.VIEWS.HOMEPAGE.LABEL_STATUS_ACCENT}
							</p>
							<p className="text-xs font-bold text-slate-900 dark:text-white">{activeOption.label}</p>
						</div>
					</div>
				</Card>

				{/* Card 4: Keyboard Hotkey */}
				<Card className="p-4">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
							<Terminal className="h-4 w-4" aria-hidden="true" />
						</div>
						<div>
							<p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
								{APP_STRINGS.SHORTCUTS.TXT_FOOTER_NOTE}
							</p>
							<p className="text-xs font-bold text-slate-900 dark:text-white">
								{APP_STRINGS.VIEWS.HOMEPAGE.TXT_HOTKEY_PALETTE}
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
						{APP_STRINGS.VIEWS.HOMEPAGE.TXT_QUICK_ACTIONS_DESC}
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
					<Button onClick={handleOpenPalette} icon={Search} variant="secondary" className="justify-start">
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
