import { memo, useMemo, useState } from 'react';
import { Trophy, BarChart3, PieChart, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/Card';
import { APP_STRINGS } from '@/strings';
import { cn, getActiveSignalCount, getTierForScore } from '@/lib/utils';
import { TIER_CONFIG, TOTAL_TELEMETRY_SIGNALS } from '@/constants';
import type { TenantRecord, TenantScoreTier } from '@/types';

interface TenantLeaderboardChartProps {
  tenants: TenantRecord[];
  selectedTier: TenantScoreTier;
  onSelectTier: (tier: TenantScoreTier) => void;
  onInspectTenant: (tenant: TenantRecord) => void;
}

export const TenantLeaderboardChart = memo(({
  tenants,
  selectedTier,
  onSelectTier,
  onInspectTenant,
}: TenantLeaderboardChartProps) => {
  const m = APP_STRINGS.VIEWS.MICROSOFT;
  const [topLimit, setTopLimit] = useState<number>(15);

  // Directly slice the processed tenants to honor the active filter and sort order
  const displayedTenants = useMemo(() => {
    return tenants.slice(0, topLimit);
  }, [tenants, topLimit]);

  // Distribution buckets across all available tenants driven by TIER_CONFIG
  const distribution = useMemo(() => {
    const counts: Record<string, number> = { diamond: 0, gold: 0, silver: 0, bronze: 0, critical: 0 };
    tenants.forEach((t) => {
      const tier = getTierForScore(t.overallScore);
      counts[tier.id] = (counts[tier.id] ?? 0) + 1;
    });

    const total = tenants.length || 1;
    const tierLabels: Record<string, string> = {
      diamond: m.OPT_TIER_DIAMOND,
      gold: m.OPT_TIER_GOLD,
      silver: m.OPT_TIER_SILVER,
      bronze: m.OPT_TIER_BRONZE,
      critical: m.OPT_TIER_CRITICAL,
    };

    return TIER_CONFIG.map((t) => ({
      id: t.id as TenantScoreTier,
      label: tierLabels[t.id] ?? t.id,
      count: counts[t.id] ?? 0,
      pct: ((counts[t.id] ?? 0) / total) * 100,
      color: t.barColor,
    }));
  }, [tenants, m]);

  // Category aggregate benchmarks across all tenants
  const categoryBenchmarks = useMemo(() => {
    if (tenants.length === 0) return { device: 0, identities: 0, apps: 0, data: 0 };
    const sums = tenants.reduce(
      (acc, t) => {
        acc.device += t.categories.device;
        acc.identities += t.categories.identities;
        acc.apps += t.categories.apps;
        acc.data += t.categories.data;
        return acc;
      },
      { device: 0, identities: 0, apps: 0, data: 0 }
    );
    const count = tenants.length;
    return {
      device: Number((sums.device / count).toFixed(1)),
      identities: Number((sums.identities / count).toFixed(1)),
      apps: Number((sums.apps / count).toFixed(1)),
      data: Number((sums.data / count).toFixed(1)),
    };
  }, [tenants]);

  const benchmarkRows = [
    { label: `${m.CAT_DEVICE} (${m.CAT_DEVICE_DESC})`, score: categoryBenchmarks.device, color: 'bg-blue-500' },
    { label: `${m.CAT_IDENTITIES} (${m.CAT_IDENTITIES_DESC})`, score: categoryBenchmarks.identities, color: 'bg-violet-500' },
    { label: `${m.CAT_APPS} (${m.CAT_APPS_DESC})`, score: categoryBenchmarks.apps, color: 'bg-amber-500' },
    { label: `${m.CAT_DATA} (${m.CAT_DATA_DESC})`, score: categoryBenchmarks.data, color: 'bg-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Chart 1: Leaderboard Horizontal Bar Chart */}
      <Card className="p-5 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {m.HEADING_TOP_CHART}
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {displayedTenants.length} {m.TXT_PAGINATION_OF} {tenants.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label htmlFor="top-limit-select" className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {m.LABEL_LIMIT_TOP}:
              </label>
              <select
                id="top-limit-select"
                value={topLimit}
                onChange={(e) => setTopLimit(Number(e.target.value))}
                aria-label={m.LABEL_LIMIT_TOP}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value={15}>{m.OPT_LIMIT_15}</option>
                <option value={30}>{m.OPT_LIMIT_30}</option>
                <option value={50}>{m.OPT_LIMIT_50}</option>
                <option value={1000}>{m.OPT_LIMIT_ALL}</option>
              </select>
            </div>
            <span className="hidden text-xs text-slate-400 sm:inline">{m.TXT_CLICK_TO_INSPECT}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {displayedTenants.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {m.TXT_NO_TENANTS}
            </div>
          ) : (
            displayedTenants.map((tenant) => {
              const isTopThree = tenant.rank <= 3;
              return (
                <div
                  key={tenant.id}
                  onClick={() => onInspectTenant(tenant)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onInspectTenant(tenant);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${m.BTN_INSPECT} ${tenant.name}`}
                  className="group flex cursor-pointer select-none items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/60 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  {/* Rank indicator */}
                  <span
                    title={
                      tenant.rank === 1
                        ? m.TOOLTIP_RANK_1
                        : tenant.rank === 2
                          ? m.TOOLTIP_RANK_2
                          : tenant.rank === 3
                            ? m.TOOLTIP_RANK_3
                            : undefined
                    }
                    className={cn(
                      'w-6 shrink-0 text-center font-mono text-xs font-black',
                      tenant.rank === 1 && 'text-amber-600 dark:text-amber-400',
                      tenant.rank === 2 && 'text-slate-500 dark:text-slate-300',
                      tenant.rank === 3 && 'text-orange-600 dark:text-orange-400',
                      tenant.rank > 3 && 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    #{tenant.rank}
                  </span>

                  {/* Name */}
                  <div className="w-36 shrink-0 truncate text-xs font-semibold text-slate-800 transition-colors group-hover:text-accent sm:w-48 dark:text-slate-200">
                    {tenant.name}
                  </div>

                  {/* Score Bar */}
                  <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                    <div
                      className={cn(
                        'h-full rounded-md transition-all duration-300',
                        isTopThree
                          ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      )}
                      style={{ width: `${tenant.overallScore}%` }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center font-mono text-[10px] font-black text-slate-700 dark:text-slate-300">
                      {tenant.overallScore}%
                    </span>
                  </div>

                  {/* Quick telemetry badge count */}
                  <span className="hidden shrink-0 items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 sm:inline-flex dark:bg-slate-800 dark:text-slate-400">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                    {getActiveSignalCount(tenant.statusBubbles)}/{TOTAL_TELEMETRY_SIGNALS}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Right Column: Score Distribution Histogram & Category Benchmarks */}
      <div className="space-y-6">
        {/* Chart 2: League & Score Tier Distribution */}
        <Card className="p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <PieChart className="h-4 w-4 text-accent" aria-hidden="true" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {m.HEADING_TIER_DISTRIBUTION}
            </h3>
          </div>

          <div className="mt-4 space-y-3">
            {distribution.map((bucket) => {
              const isSelected = selectedTier === bucket.id;
              return (
                <button
                  key={bucket.id}
                  type="button"
                  onClick={() => onSelectTier(isSelected ? 'all' : bucket.id)}
                  aria-label={`${bucket.label}: ${bucket.count} ${m.LABEL_FLEET_UNITS}`}
                  className={cn(
                    'w-full cursor-pointer select-none rounded-lg p-2 text-left transition-all active:scale-[0.98]',
                    isSelected
                      ? 'bg-accent-soft ring-1 ring-accent'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  )}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {bucket.label}
                    </span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                      {bucket.count} <span className="text-[10px] text-slate-400">({bucket.pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={cn('h-full rounded-full transition-all duration-300', bucket.color)}
                      style={{ width: `${bucket.pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Chart 3: Category Average Benchmarks */}
        <Card className="p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <BarChart3 className="h-4 w-4 text-blue-500" aria-hidden="true" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {m.HEADING_CATEGORY_BENCHMARKS}
            </h3>
          </div>

          <div className="mt-4 space-y-2.5 text-xs">
            {benchmarkRows.map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600 dark:text-slate-400">{row.label}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {row.score}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn('h-full rounded-full', row.color)}
                    style={{ width: `${row.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
});

TenantLeaderboardChart.displayName = 'TenantLeaderboardChart';
