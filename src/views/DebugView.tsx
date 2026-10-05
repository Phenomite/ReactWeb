import { Bug, Cpu, RefreshCw, Terminal } from 'lucide-react';
import { memo, useCallback } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useToast } from '@/context/ToastContext';
import { cn, resetLocalStorageAndReload } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';
import type { ViewDefinition } from '@/types';
import { APP_VIEWS } from '@/views/views';

// Diagnostic tile row component
const MetricRow = ({
	label,
	value,
	isLast = false,
	valueClassName,
}: {
	label: string;
	value: string;
	isLast?: boolean;
	valueClassName?: string;
}) => (
	<div className={cn('flex justify-between py-1.5', !isLast && 'border-b border-slate-100 dark:border-slate-800/60')}>
		<span className="text-slate-500">{label}</span>
		<span className={cn('font-mono font-medium text-slate-900 dark:text-slate-200', valueClassName)}>{value}</span>
	</div>
);

// Diagnostics view displaying runtime environment diagnostics and application state
export const DebugView = memo(() => {
	const { showToast } = useToast();
	const d = APP_STRINGS.VIEWS.DEBUG;

	const handleClearStorage = useCallback(() => {
		resetLocalStorageAndReload(showToast);
	}, [showToast]);

	return (
		<div className="space-y-6">
			{/* Top Banner */}
			<Card heading={d.HEADING_PAGE} description={d.TXT_DESCRIPTION} icon={Bug} />

			{/* Metrics Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card className="p-5">
					<div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
						<Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
						<h3 className="text-sm font-semibold text-slate-900 dark:text-white">{d.HEADING_SYSTEM_INFO}</h3>
					</div>
					<div className="mt-4 space-y-1 text-xs">
						<MetricRow label={d.LABEL_FRAMEWORK} value={d.VAL_FRAMEWORK} />
						<MetricRow label={d.LABEL_BUILD_TOOL} value={d.VAL_BUILD_TOOL} />
						<MetricRow label={d.LABEL_RUNTIME} value={d.VAL_RUNTIME} />
						<MetricRow label={d.LABEL_CSS_ENGINE} value={d.VAL_CSS_ENGINE} />
						<MetricRow label={d.LABEL_ROUTING_MODE} value={d.VAL_ROUTING_MODE} isLast />
					</div>
				</Card>

				<Card className="p-5">
					<div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
						<Terminal className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
						<h3 className="text-sm font-semibold text-slate-900 dark:text-white">{d.HEADING_ACTIVE_STATE}</h3>
					</div>
					<div className="mt-4 space-y-1 text-xs">
						<MetricRow
							label={d.LABEL_ACTIVE_ANCHOR}
							value={window.location.hash || APP_STRINGS.VIEWS.HOMEPAGE.NAV_HASH}
							valueClassName="text-blue-600 dark:text-blue-400"
						/>
						<MetricRow label={d.LABEL_REGISTERED_VIEWS} value={`${APP_VIEWS.length} views`} />
						<MetricRow
							label={d.LABEL_GATEWAY}
							value={d.VAL_GATEWAY}
							valueClassName="text-emerald-600 dark:text-emerald-400"
							isLast
						/>
					</div>
				</Card>
			</div>

			{/* Diagnostics Actions */}
			<Card className="p-5">
				<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
					{d.HEADING_DEBUG_ACTIONS}
				</h3>
				<div className="flex flex-wrap gap-3">
					<Button onClick={handleClearStorage} variant="secondary" icon={RefreshCw}>
						{APP_STRINGS.COMMAND_PALETTE.CMD_RESET_STORAGE}
					</Button>
				</div>
			</Card>
		</div>
	);
});

// Colocated Debug view routing metadata
export const debugView: ViewDefinition = {
	id: APP_STRINGS.VIEWS.DEBUG.NAV_ID,
	title: APP_STRINGS.VIEWS.DEBUG.NAV_TITLE,
	hash: APP_STRINGS.VIEWS.DEBUG.NAV_HASH,
	icon: Bug,
	component: DebugView,
};
