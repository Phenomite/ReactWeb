import { useState, useMemo, useCallback, memo } from 'react';
import {
  Shield,
  ShieldCheck,
  Trophy,
  BarChart3,
  LayoutGrid,
  List,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Award,
  Medal,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TenantCard } from '@/components/TenantCard';
import { TenantLeaderboardChart } from '@/components/TenantLeaderboardChart';
import { TenantDetailModal } from '@/components/TenantDetailModal';
import { useToast } from '@/context/ToastContext';
import { APP_STRINGS } from '@/strings';
import { cn } from '@/lib/utils';
import rawTenantsData from '@/data/tenants.json';
import type {
  ViewDefinition,
  TenantRecord,
  TenantSortField,
  TenantSortOrder,
  TenantScoreTier,
} from '@/types';

const ALL_TENANTS = rawTenantsData as TenantRecord[];

// Renders the gamified Microsoft Secure Score multi-tenant leaderboard
export const MicrosoftView = memo(() => {
  const { showToast } = useToast();
  const m = APP_STRINGS.VIEWS.MICROSOFT;

  // View state & tab selection
  const [activeTab, setActiveTab] = useState<'tiles' | 'charts' | 'table'>('tiles');
  const [searchQuery, setSearchQuery] = useState('');
  const [telemetryFilter, setTelemetryFilter] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<TenantScoreTier>('all');
  const [sortField, setSortField] = useState<TenantSortField>('overallScore');
  const [sortOrder, setSortOrder] = useState<TenantSortOrder>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Selected tenant for detailed modal inspection
  const [inspectingTenant, setInspectingTenant] = useState<TenantRecord | null>(null);

  // Global KPI aggregates across all 200 tenants
  const globalKpis = useMemo(() => {
    if (ALL_TENANTS.length === 0) return { avgScore: 0, fullTelemetryCount: 0, fullTelemetryPct: 0, topTenant: null };

    const totalScore = ALL_TENANTS.reduce((sum, t) => sum + t.overallScore, 0);
    const avgScore = Number((totalScore / ALL_TENANTS.length).toFixed(1));

    const fullTelemetryCount = ALL_TENANTS.filter(
      (t) =>
        t.statusBubbles.sentinel &&
        t.statusBubbles.mde &&
        t.statusBubbles.mdi &&
        t.statusBubbles.logAnalytics
    ).length;

    const fullTelemetryPct = Number(((fullTelemetryCount / ALL_TENANTS.length) * 100).toFixed(0));
    const topTenant = ALL_TENANTS[0] ?? null;

    return { avgScore, fullTelemetryCount, fullTelemetryPct, topTenant };
  }, []);

  // Dynamic human-readable label for sort order toggle
  const orderLabel = useMemo(() => {
    if (sortField === 'name') {
      return sortOrder === 'asc' ? m.BTN_SORT_ORDER_NAME_ASC : m.BTN_SORT_ORDER_NAME_DESC;
    }
    if (sortField === 'rank') {
      return sortOrder === 'asc' ? m.BTN_SORT_ORDER_RANK_ASC : m.BTN_SORT_ORDER_RANK_DESC;
    }
    return sortOrder === 'desc' ? m.BTN_SORT_ORDER_DESC : m.BTN_SORT_ORDER_ASC;
  }, [sortField, sortOrder, m]);

  // Filtered & sorted tenant records
  const processedTenants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = ALL_TENANTS.filter((tenant) => {
      // Search matching
      if (q) {
        const matchesName = tenant.name.toLowerCase().includes(q);
        const matchesDomain = tenant.domain.toLowerCase().includes(q);
        const matchesIndustry = tenant.industry.toLowerCase().includes(q);
        const matchesRegion = tenant.region.toLowerCase().includes(q);
        if (!matchesName && !matchesDomain && !matchesIndustry && !matchesRegion) {
          return false;
        }
      }

      // Telemetry bubbles filter
      if (telemetryFilter === 'full') {
        const hasAll =
          tenant.statusBubbles.sentinel &&
          tenant.statusBubbles.mde &&
          tenant.statusBubbles.mdi &&
          tenant.statusBubbles.logAnalytics;
        if (!hasAll) return false;
      } else if (telemetryFilter === 'sentinel' && !tenant.statusBubbles.sentinel) {
        return false;
      } else if (telemetryFilter === 'mde' && !tenant.statusBubbles.mde) {
        return false;
      } else if (telemetryFilter === 'mdi' && !tenant.statusBubbles.mdi) {
        return false;
      } else if (telemetryFilter === 'logAnalytics' && !tenant.statusBubbles.logAnalytics) {
        return false;
      }

      // Tier filter
      if (selectedTier !== 'all') {
        if (selectedTier === 'diamond' && tenant.overallScore < 90) return false;
        if (selectedTier === 'gold' && (tenant.overallScore < 80 || tenant.overallScore >= 90)) return false;
        if (selectedTier === 'silver' && (tenant.overallScore < 70 || tenant.overallScore >= 80)) return false;
        if (selectedTier === 'bronze' && (tenant.overallScore < 50 || tenant.overallScore >= 70)) return false;
        if (selectedTier === 'critical' && tenant.overallScore >= 50) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'overallScore') {
        comparison = a.overallScore - b.overallScore;
      } else if (sortField === 'device') {
        comparison = a.categories.device - b.categories.device;
      } else if (sortField === 'identities') {
        comparison = a.categories.identities - b.categories.identities;
      } else if (sortField === 'apps') {
        comparison = a.categories.apps - b.categories.apps;
      } else if (sortField === 'data') {
        comparison = a.categories.data - b.categories.data;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'rank') {
        comparison = a.rank - b.rank;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, telemetryFilter, selectedTier, sortField, sortOrder]);

  // Paginated records for tile and table views
  const totalPages = Math.max(1, Math.ceil(processedTenants.length / pageSize));
  const paginatedTenants = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedTenants.slice(start, start + pageSize);
  }, [processedTenants, page, pageSize]);

  // Reset page when filters change
  const handleFilterChange = useCallback((setter: (val: any) => void, value: any) => {
    setter(value);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setTelemetryFilter('all');
    setSelectedTier('all');
    setSortField('overallScore');
    setSortOrder('desc');
    setPage(1);
  }, []);

  // Export 200 tenants dataset as JSON
  const handleExportData = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(processedTenants, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'microsoft-tenant-secure-scores.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(m.TXT_EXPORT_SUCCESS, {
      type: 'success',
      description: `Exported ${processedTenants.length} tenants with category scores and telemetry signals.`,
    });
  }, [processedTenants, showToast, m.TXT_EXPORT_SUCCESS]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card
        heading={m.HEADING_PAGE}
        description={m.TXT_DESCRIPTION}
        icon={Shield}
        headerRight={
          <div className="flex items-center gap-2">
            <Button onClick={handleExportData} icon={Download} variant="secondary">
              {m.BTN_EXPORT_TENANTS}
            </Button>
          </div>
        }
      />

      {/* Gamification KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Metric 1: Global Average */}
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {m.HEADING_GLOBAL_AVERAGE}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {globalKpis.avgScore}%
            </p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Across 200 Tenants
            </span>
          </div>
        </Card>

        {/* Metric 2: Champion (#1) */}
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {m.HEADING_TOP_TENANT}
          </span>
          <div className="mt-1 flex items-baseline gap-2 min-w-0">
            <p className="truncate text-xl font-black text-amber-600 dark:text-amber-400">
              {globalKpis.topTenant?.overallScore ?? 0}%
            </p>
            <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
              {globalKpis.topTenant?.name ?? 'None'}
            </span>
          </div>
        </Card>

        {/* Metric 3: Full Security Stack Adoption */}
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {m.HEADING_FULL_TELEMETRY}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {globalKpis.fullTelemetryPct}%
            </p>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ({globalKpis.fullTelemetryCount} Tenants)
            </span>
          </div>
        </Card>

        {/* Metric 4: Total Managed Tenants */}
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {m.HEADING_MANAGED_COUNT}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {ALL_TENANTS.length}
            </p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              100% Monitored
            </span>
          </div>
        </Card>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {m.HEADING_PODIUM}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ALL_TENANTS.slice(0, 3).map((tenant, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;

            return (
              <Card
                key={tenant.id}
                className={cn(
                  'relative overflow-hidden p-5 transition-transform hover:scale-[1.01]',
                  isFirst
                    ? 'border-amber-300 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20 ring-1 ring-amber-400/40'
                    : isSecond
                      ? 'border-slate-300 bg-slate-100/50 dark:border-slate-700 dark:bg-slate-900/40'
                      : 'border-orange-200 bg-orange-50/30 dark:border-orange-900/40 dark:bg-orange-950/20'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {isFirst ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                          Rank #1 Leader
                        </span>
                      ) : isSecond ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          <Medal className="h-3.5 w-3.5" aria-hidden="true" />
                          Rank #2 Runner Up
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 text-xs font-black text-orange-800 dark:bg-orange-950/80 dark:text-orange-300">
                          <Award className="h-3.5 w-3.5" aria-hidden="true" />
                          Rank #3 Podium
                        </span>
                      )}
                    </div>

                    <h4 className="truncate font-bold text-slate-900 dark:text-white">
                      {tenant.name}
                    </h4>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {tenant.domain}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                      {tenant.overallScore}%
                    </span>
                    <p className="text-[10px] text-slate-400">Overall Score</p>
                  </div>
                </div>

                {/* Status Bubbles count */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px] dark:border-slate-800">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {[
                        tenant.statusBubbles.sentinel,
                        tenant.statusBubbles.mde,
                        tenant.statusBubbles.mdi,
                        tenant.statusBubbles.logAnalytics,
                      ].filter(Boolean).length}
                      /4 Active Telemetry
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingTenant(tenant)}
                    className="cursor-pointer font-bold text-accent hover:underline active:scale-95"
                  >
                    View &rarr;
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* View Layout Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('tiles')}
          className={cn(
            'flex cursor-pointer select-none items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors',
            activeTab === 'tiles'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          <span>{m.TAB_TILES}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={cn(
            'flex cursor-pointer select-none items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors',
            activeTab === 'charts'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          <span>{m.TAB_CHARTS}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={cn(
            'flex cursor-pointer select-none items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors',
            activeTab === 'table'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <List className="h-4 w-4" aria-hidden="true" />
          <span>{m.TAB_TABLE}</span>
        </button>
      </div>

      {/* Action Toolbar, Search & Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              placeholder={m.INPUT_SEARCH_TENANTS}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Telemetry Bubble Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <select
                value={telemetryFilter}
                onChange={(e) => handleFilterChange(setTelemetryFilter, e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">{m.OPT_FILTER_ALL}</option>
                <option value="full">{m.OPT_FILTER_FULL_STACK}</option>
                <option value="sentinel">{m.OPT_FILTER_SENTINEL}</option>
                <option value="mde">{m.OPT_FILTER_MDE}</option>
                <option value="mdi">{m.OPT_FILTER_MDI}</option>
                <option value="logAnalytics">{m.OPT_FILTER_AUDIT}</option>
              </select>
            </div>

            {/* Score Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => handleFilterChange(setSelectedTier, e.target.value as TenantScoreTier)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">{m.OPT_TIER_ALL}</option>
              <option value="diamond">{m.OPT_TIER_DIAMOND}</option>
              <option value="gold">{m.OPT_TIER_GOLD}</option>
              <option value="silver">{m.OPT_TIER_SILVER}</option>
              <option value="bronze">{m.OPT_TIER_BRONZE}</option>
              <option value="critical">{m.OPT_TIER_CRITICAL}</option>
            </select>

            {/* Sort Field Selector */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <select
                value={sortField}
                onChange={(e) => handleFilterChange(setSortField, e.target.value as TenantSortField)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="overallScore">
                  {sortOrder === 'desc' ? m.OPT_SORT_SCORE_DESC : m.OPT_SORT_SCORE_ASC}
                </option>
                <option value="rank">
                  {sortOrder === 'asc' ? m.OPT_SORT_RANK_ASC : m.OPT_SORT_RANK_DESC}
                </option>
                <option value="name">
                  {sortOrder === 'asc' ? m.OPT_SORT_NAME_ASC : m.OPT_SORT_NAME_DESC}
                </option>
                <option value="device">
                  {sortOrder === 'desc' ? m.OPT_SORT_DEVICE_DESC : m.OPT_SORT_DEVICE_ASC}
                </option>
                <option value="identities">
                  {sortOrder === 'desc' ? m.OPT_SORT_IDENTITIES_DESC : m.OPT_SORT_IDENTITIES_ASC}
                </option>
                <option value="apps">
                  {sortOrder === 'desc' ? m.OPT_SORT_APPS_DESC : m.OPT_SORT_APPS_ASC}
                </option>
                <option value="data">
                  {sortOrder === 'desc' ? m.OPT_SORT_DATA_DESC : m.OPT_SORT_DATA_ASC}
                </option>
              </select>
            </div>

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title={`Toggle sort order: currently ${orderLabel}`}
              aria-label={`Toggle sort order: currently ${orderLabel}`}
              className="flex cursor-pointer select-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {sortOrder === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              )}
              <span>{orderLabel}</span>
            </button>

            {/* Reset Filters */}
            {(searchQuery || telemetryFilter !== 'all' || selectedTier !== 'all' || sortField !== 'overallScore') && (
              <Button onClick={handleResetFilters} icon={RotateCcw} variant="secondary">
                {m.BTN_RESET_FILTERS}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* TAB 1: TILE-BASED VIEW (PRIMARY) */}
      {activeTab === 'tiles' && (
        <div className="space-y-6">
          {processedTenants.length === 0 ? (
            <Card className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
              {m.TXT_NO_TENANTS}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paginatedTenants.map((tenant) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  onInspect={setInspectingTenant}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {processedTenants.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {m.TXT_PAGINATION_SHOWING}{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {(page - 1) * pageSize + 1}
                  </strong>{' '}
                  -{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {Math.min(page * pageSize, processedTenants.length)}
                  </strong>{' '}
                  {m.TXT_PAGINATION_OF}{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {processedTenants.length}
                  </strong>{' '}
                  {m.TXT_PAGINATION_TENANTS}
                </span>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <option value={12}>12 / page</option>
                  <option value={24}>24 / page</option>
                  <option value={48}>48 / page</option>
                  <option value={200}>All 200</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  variant="secondary"
                >
                  &larr; Previous
                </Button>

                <span className="px-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {m.TXT_PAGE} {page} {m.TXT_PAGINATION_OF} {totalPages}
                </span>

                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  variant="secondary"
                >
                  Next &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GAMIFIED LEADERBOARD CHARTS */}
      {activeTab === 'charts' && (
        <TenantLeaderboardChart
          tenants={processedTenants}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          onInspectTenant={setInspectingTenant}
        />
      )}

      {/* TAB 3: DIRECTORY SPREADSHEET TABLE */}
      {activeTab === 'table' && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Tenant & Domain</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">{m.LABEL_BUBBLES_SECTION}</th>
                  <th className="px-4 py-3 text-right">{m.CAT_DEVICE}</th>
                  <th className="px-4 py-3 text-right">{m.CAT_IDENTITIES}</th>
                  <th className="px-4 py-3 text-right">{m.CAT_APPS}</th>
                  <th className="px-4 py-3 text-right">{m.CAT_DATA}</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-600 dark:text-slate-400">
                      #{tenant.rank}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-white">{tenant.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">{tenant.domain}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {tenant.overallScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          title="Sentinel"
                          className={cn(
                            'h-2 w-2 rounded-full',
                            tenant.statusBubbles.sentinel ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          )}
                        />
                        <span
                          title="MDE"
                          className={cn(
                            'h-2 w-2 rounded-full',
                            tenant.statusBubbles.mde ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          )}
                        />
                        <span
                          title="MDI"
                          className={cn(
                            'h-2 w-2 rounded-full',
                            tenant.statusBubbles.mdi ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          )}
                        />
                        <span
                          title="Audit Logging"
                          className={cn(
                            'h-2 w-2 rounded-full',
                            tenant.statusBubbles.logAnalytics ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          )}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{tenant.categories.device}%</td>
                    <td className="px-4 py-3 text-right font-mono">{tenant.categories.identities}%</td>
                    <td className="px-4 py-3 text-right font-mono">{tenant.categories.apps}%</td>
                    <td className="px-4 py-3 text-right font-mono">{tenant.categories.data}%</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectingTenant(tenant)}
                        className="cursor-pointer font-bold text-accent hover:underline text-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detailed Tenant Inspection Modal */}
      <TenantDetailModal
        tenant={inspectingTenant}
        isOpen={Boolean(inspectingTenant)}
        onClose={() => setInspectingTenant(null)}
      />
    </div>
  );
});

MicrosoftView.displayName = 'MicrosoftView';

// Colocated Microsoft view routing metadata
export const microsoftView: ViewDefinition = {
  id: APP_STRINGS.VIEWS.MICROSOFT.NAV_ID,
  title: APP_STRINGS.VIEWS.MICROSOFT.NAV_TITLE,
  hash: APP_STRINGS.VIEWS.MICROSOFT.NAV_HASH,
  icon: Shield,
  component: MicrosoftView,
};
