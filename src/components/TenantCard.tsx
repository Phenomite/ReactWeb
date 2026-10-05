import {
  Award,
  Building2,
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  Laptop,
  Medal,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';
import { type KeyboardEvent, memo, useCallback } from 'react';
import { Card } from '@/components/Card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TOTAL_TELEMETRY_SIGNALS } from '@/constants';
import { cn, getActiveSignalCount, getTierForScore } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';
import type { TenantRecord } from '@/types';

interface TenantCardProps {
  tenant: TenantRecord;
  onInspect: (tenant: TenantRecord) => void;
}

// Renders the rank badge for podium leaders (#1, #2, #3) and standard ranks
function renderRankBadge(rank: number) {
  const m = APP_STRINGS.VIEWS.MICROSOFT;
  if (rank === 1) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-100 px-2 py-0.5 font-black text-amber-800 text-xs shadow-2xs dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
            <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>#1</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>{m.TOOLTIP_RANK_1}</TooltipContent>
      </Tooltip>
    );
  }
  if (rank === 2) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-200 px-2 py-0.5 font-black text-slate-800 text-xs shadow-2xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <Medal className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" aria-hidden="true" />
            <span>#2</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>{m.TOOLTIP_RANK_2}</TooltipContent>
      </Tooltip>
    );
  }
  if (rank === 3) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-orange-100 px-2 py-0.5 font-black text-orange-800 text-xs shadow-2xs dark:border-orange-800 dark:bg-orange-950/80 dark:text-orange-300">
            <Award className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
            <span>#3</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>{m.TOOLTIP_RANK_3}</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <span className="inline-flex items-center rounded-lg bg-muted px-2 py-0.5 font-bold text-muted-foreground text-xs">
      #{rank}
    </span>
  );
}

// Telemetry status bubble pill component
interface StatusBubbleProps {
  label: string;
  enabled: boolean;
  tooltipText: string;
}

const StatusBubble = memo(({ label, enabled, tooltipText }: StatusBubbleProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        className={cn(
          'inline-flex cursor-default select-none items-center gap-1.5 rounded-full border px-2 py-0.5 font-semibold text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring',
          enabled
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/70 dark:text-emerald-300'
            : 'border-border bg-muted/60 text-muted-foreground',
        )}
      >
        {enabled ? (
          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        ) : (
          <XCircle className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span>{label}</span>
      </span>
    </TooltipTrigger>
    <TooltipContent>{tooltipText}</TooltipContent>
  </Tooltip>
));

StatusBubble.displayName = 'StatusBubble';

// Category score progress bar row
interface CategoryBarProps {
  label: string;
  subtitle: string;
  score: number;
  icon: typeof Laptop;
  colorClass: string;
}

const CategoryBar = memo(({ label, subtitle, score, icon: Icon, colorClass }: CategoryBarProps) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="truncate font-semibold text-foreground">{label}</span>
        <span className="truncate text-muted-foreground">({subtitle})</span>
      </div>
      <span className="font-bold font-mono text-foreground text-xs">{score}%</span>
    </div>
    <div
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label} secure score: ${score}%`}
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className={cn('h-full rounded-full transition-all duration-300', colorClass)}
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </div>
  </div>
));

CategoryBar.displayName = 'CategoryBar';

// Renders an individual tenant score tile with status bubbles above categories
export const TenantCard = memo(({ tenant, onInspect }: TenantCardProps) => {
  const tier = getTierForScore(tenant.overallScore);
  const m = APP_STRINGS.VIEWS.MICROSOFT;

  const handleClick = useCallback(() => {
    onInspect(tenant);
  }, [onInspect, tenant]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onInspect(tenant);
      }
    },
    [onInspect, tenant],
  );

  return (
    <Card
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${m.BTN_INSPECT} ${tenant.name}`}
      className={cn(
        'group relative flex cursor-pointer select-none flex-col justify-between overflow-hidden p-3.5 transition-all duration-200 hover:border-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.99]',
        tenant.rank <= 3 && 'ring-1 ring-amber-400/40 dark:ring-amber-500/30',
      )}
    >
      {/* Top Header: Rank, Organization Info & Overall Score */}
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              {renderRankBadge(tenant.rank)}
              <span className={cn('rounded border px-2 py-0.5 font-bold text-xs tracking-tight', tier.badgeClass)}>
                {tier.label}
              </span>
            </div>

            <h3
              title={tenant.name}
              className="truncate font-bold text-base text-foreground transition-colors group-hover:text-accent"
            >
              {tenant.name}
            </h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
              <span className="flex items-center gap-1 truncate font-mono text-xs">
                <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                {tenant.domain}
              </span>
              <span className="flex items-center gap-1 truncate text-xs">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                {tenant.industry}
              </span>
              <span className="flex items-center gap-1 truncate text-xs">
                <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                {tenant.seatCount.toLocaleString()} {m.LABEL_USERS}
              </span>
            </div>
          </div>

          {/* Gamified Overall Score Pill Meter */}
          <div className="flex shrink-0 flex-col items-end">
            <div
              className={cn(
                'flex h-12 w-12 flex-col items-center justify-center rounded-xl border font-black font-mono shadow-2xs transition-transform group-hover:scale-105',
                tier.badgeClass,
              )}
            >
              <span className="text-sm leading-none">{tenant.overallScore}</span>
              <span className="font-bold text-[10px] leading-tight opacity-75">%</span>
            </div>
            <span className="mt-1 font-medium text-muted-foreground text-xs">{m.LABEL_OVERALL_SCORE}</span>
          </div>
        </div>

        {/* Status Bubbles Row: explicitly positioned ABOVE secure score categories */}
        <div className="mt-3 rounded-lg border border-border bg-muted/50 p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
              {m.LABEL_BUBBLES_SECTION}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {getActiveSignalCount(tenant.statusBubbles)}/{TOTAL_TELEMETRY_SIGNALS} {m.STATUS_ACTIVE}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <StatusBubble
              label={m.LABEL_BUBBLE_SENTINEL}
              enabled={tenant.statusBubbles.sentinel}
              tooltipText={tenant.statusBubbles.sentinel ? m.TOOLTIP_SENTINEL_ON : m.TOOLTIP_SENTINEL_OFF}
            />
            <StatusBubble
              label={m.LABEL_BUBBLE_MDE}
              enabled={tenant.statusBubbles.mde}
              tooltipText={tenant.statusBubbles.mde ? m.TOOLTIP_MDE_ON : m.TOOLTIP_MDE_OFF}
            />
            <StatusBubble
              label={m.LABEL_BUBBLE_MDI}
              enabled={tenant.statusBubbles.mdi}
              tooltipText={tenant.statusBubbles.mdi ? m.TOOLTIP_MDI_ON : m.TOOLTIP_MDI_OFF}
            />
            <StatusBubble
              label={m.LABEL_BUBBLE_LOG}
              enabled={tenant.statusBubbles.logAnalytics}
              tooltipText={tenant.statusBubbles.logAnalytics ? m.TOOLTIP_LOG_ON : m.TOOLTIP_LOG_OFF}
            />
          </div>
        </div>

        {/* Secure Score Categories: Device, Identities, Apps, Data */}
        <div className="mt-2.5 space-y-1.5">
          <CategoryBar
            label={m.CAT_DEVICE}
            subtitle={m.CAT_DEVICE_DESC}
            score={tenant.categories.device}
            icon={Laptop}
            colorClass="bg-blue-500 dark:bg-blue-400"
          />
          <CategoryBar
            label={m.CAT_IDENTITIES}
            subtitle={m.CAT_IDENTITIES_DESC}
            score={tenant.categories.identities}
            icon={Users}
            colorClass="bg-violet-500 dark:bg-violet-400"
          />
          <CategoryBar
            label={m.CAT_APPS}
            subtitle={m.CAT_APPS_DESC}
            score={tenant.categories.apps}
            icon={Cloud}
            colorClass="bg-amber-500 dark:bg-amber-400"
          />
          <CategoryBar
            label={m.CAT_DATA}
            subtitle={m.CAT_DATA_DESC}
            score={tenant.categories.data}
            icon={Database}
            colorClass="bg-emerald-500 dark:bg-emerald-400"
          />
        </div>
      </div>
    </Card>
  );
});

TenantCard.displayName = 'TenantCard';
