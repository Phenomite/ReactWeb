import { memo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Laptop,
  Users,
  Cloud,
  Database,
  CheckCircle2,
  XCircle,
  Building2,
  Globe,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { APP_STRINGS } from '@/strings';
import { cn } from '@/lib/utils';
import type { TenantRecord } from '@/types';

interface TenantCardProps {
  tenant: TenantRecord;
  onInspect: (tenant: TenantRecord) => void;
}

// Visual tier styling based on tenant overall score
function getTierDetails(score: number) {
  if (score >= 90) {
    return {
      label: 'Diamond Tier',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      barColor: 'bg-emerald-500',
    };
  }
  if (score >= 80) {
    return {
      label: 'Gold Tier',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      barColor: 'bg-blue-500',
    };
  }
  if (score >= 70) {
    return {
      label: 'Silver Tier',
      badgeClass: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
      barColor: 'bg-violet-500',
    };
  }
  if (score >= 50) {
    return {
      label: 'Bronze Tier',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      barColor: 'bg-amber-500',
    };
  }
  return {
    label: 'Critical Risk',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    barColor: 'bg-rose-500',
  };
}

// Renders the rank badge for podium leaders (#1, #2, #3) and standard ranks
function renderRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <span
        title="Rank #1 Leader"
        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800 shadow-2xs dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-300"
      >
        <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>#1</span>
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        title="Rank #2 Runner Up"
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-800 shadow-2xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      >
        <Medal className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" aria-hidden="true" />
        <span>#2</span>
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        title="Rank #3 Podium"
        className="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-orange-100 px-2 py-0.5 text-xs font-black text-orange-800 shadow-2xs dark:border-orange-800 dark:bg-orange-950/80 dark:text-orange-300"
      >
        <Award className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
        <span>#3</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
  <span
    title={tooltipText}
    className={cn(
      'inline-flex select-none items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9.5px] font-semibold transition-colors',
      enabled
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/70 dark:text-emerald-300'
        : 'border-slate-200 bg-slate-100/70 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
    )}
  >
    {enabled ? (
      <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
    ) : (
      <XCircle className="h-2.5 w-2.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
    )}
    <span>{label}</span>
  </span>
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
  <div className="space-y-0.5">
    <div className="flex items-center justify-between text-[10.5px]">
      <div className="flex items-center gap-1 min-w-0">
        <Icon className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <span className="truncate font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="truncate text-[9.5px] text-slate-400 dark:text-slate-500">({subtitle})</span>
      </div>
      <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
        {score}%
      </span>
    </div>
    <div
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label} secure score: ${score}%`}
      className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
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
  const tier = getTierDetails(tenant.overallScore);
  const m = APP_STRINGS.VIEWS.MICROSOFT;

  return (
    <Card
      onClick={() => onInspect(tenant)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onInspect(tenant);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Inspect posture for ${tenant.name}`}
      className={cn(
        'group relative flex cursor-pointer select-none flex-col justify-between overflow-hidden p-3.5 transition-all duration-200 hover:border-accent hover:shadow-md active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-blue-600',
        tenant.rank <= 3 && 'ring-1 ring-amber-400/40 dark:ring-amber-500/30'
      )}
    >
      {/* Top Header: Rank, Organization Info & Overall Score */}
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {renderRankBadge(tenant.rank)}
              <span
                className={cn(
                  'rounded border px-1.5 py-0.2 text-[9.5px] font-bold tracking-tight',
                  tier.badgeClass
                )}
              >
                {tier.label}
              </span>
            </div>

            <h3
              title={tenant.name}
              className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-accent dark:text-white"
            >
              {tenant.name}
            </h3>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10.5px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 truncate font-mono text-[10px]">
                <Globe className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
                {tenant.domain}
              </span>
              <span className="flex items-center gap-1 truncate text-[10px]">
                <Building2 className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
                {tenant.industry}
              </span>
              <span className="flex items-center gap-1 truncate text-[10px]">
                <Users className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
                {tenant.seatCount.toLocaleString()} Users
              </span>
            </div>
          </div>

          {/* Gamified Overall Score Pill Meter */}
          <div className="flex shrink-0 flex-col items-end">
            <div
              className={cn(
                'flex h-11 w-11 flex-col items-center justify-center rounded-xl border font-mono font-black shadow-2xs transition-transform group-hover:scale-105',
                tier.badgeClass
              )}
            >
              <span className="text-xs leading-none">{tenant.overallScore}</span>
              <span className="text-[8.5px] font-bold leading-tight opacity-75">%</span>
            </div>
            <span className="mt-1 text-[8.5px] font-medium text-slate-400 dark:text-slate-500">
              Overall Score
            </span>
          </div>
        </div>

        {/* Status Bubbles Row: explicitly positioned ABOVE secure score categories */}
        <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2 dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {m.LABEL_BUBBLES_SECTION}
            </span>
            <span className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400">
              {[
                tenant.statusBubbles.sentinel,
                tenant.statusBubbles.mde,
                tenant.statusBubbles.mdi,
                tenant.statusBubbles.logAnalytics,
              ].filter(Boolean).length}
              /4 Active
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <StatusBubble
              label={m.LABEL_BUBBLE_SENTINEL}
              enabled={tenant.statusBubbles.sentinel}
              tooltipText={
                tenant.statusBubbles.sentinel
                  ? 'Microsoft Sentinel: Connected & Ingesting'
                  : 'Microsoft Sentinel: Inactive'
              }
            />
            <StatusBubble
              label={m.LABEL_BUBBLE_MDE}
              enabled={tenant.statusBubbles.mde}
              tooltipText={
                tenant.statusBubbles.mde
                  ? 'Microsoft Defender for Endpoint: Enrolled'
                  : 'Microsoft Defender for Endpoint: Not Deployed'
              }
            />
            <StatusBubble
              label={m.LABEL_BUBBLE_MDI}
              enabled={tenant.statusBubbles.mdi}
              tooltipText={
                tenant.statusBubbles.mdi
                  ? 'Microsoft Defender for Identity: Active Sensor'
                  : 'Microsoft Defender for Identity: Inactive'
              }
            />
            <StatusBubble
              label={m.LABEL_BUBBLE_LOG}
              enabled={tenant.statusBubbles.logAnalytics}
              tooltipText={
                tenant.statusBubbles.logAnalytics
                  ? 'Azure Log Analytics Audit Logging: Stream Active'
                  : 'Azure Log Analytics Audit Logging: Disabled'
              }
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

