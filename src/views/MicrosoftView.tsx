import { useState, useMemo, useCallback, useEffect, memo } from 'react';
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
import { useHeaderSlot } from '@/context/HeaderSlotContext';
import { APP_STRINGS } from '@/strings';
import { cn, getActiveSignalCount, getTierForScore } from '@/lib/utils';
import { ALL_TENANTS, TOTAL_TELEMETRY_SIGNALS } from '@/constants';
import type {
  ViewDefinition,
  TenantRecord,
  TenantSortField,
  TenantSortOrder,
  TenantScoreTier,
  TenantStatusBubbles,
} from '@/types';

// Renders the gamified Microsoft Secure Score multi-tenant leaderboard
export const MicrosoftView = memo(() => {
  const { showToast } = useToast();
  const { setHeaderSlot } = useHeaderSlot();
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

  // Global KPI aggregates across all tenants
  const globalKpis = useMemo(() => {
    if (ALL_TENANTS.length === 0) return { avgScore: 0, fullTelemetryCount: 0, fullTelemetryPct: 0, topTenant: null };

    const totalScore = ALL_TENANTS.reduce((sum, t) => sum + t.overallScore, 0);
    const avgScore = Number((totalScore / ALL_TENANTS.length).toFixed(1));

    const fullTelemetryCount = ALL_TENANTS.filter(
      (t) => getActiveSignalCount(t.statusBubbles) === TOTAL_TELEMETRY_SIGNALS
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

      // Telemetry signals filter
      if (telemetryFilter === 'full') {
        if (getActiveSignalCount(tenant.statusBubbles) !== TOTAL_TELEMETRY_SIGNALS) return false;
      } else if (
        telemetryFilter in tenant.statusBubbles &&
        !tenant.statusBubbles[telemetryFilter as keyof TenantStatusBubbles]
      ) {
        return false;
      }

      // Score League Tier filter
      if (selectedTier !== 'all') {
        if (getTierForScore(tenant.overallScore).id !== selectedTier) return false;
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
    downloadAnchor.setAttribute('download', m.FILE_EXPORT_TENANTS_JSON);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(m.TXT_EXPORT_SUCCESS, {
      type: 'success',
      description: `${m.TXT_PAGINATION_SHOWING} ${processedTenants.length} ${m.LABEL_FLEET_UNITS.toLowerCase()}.`,
    });
  }, [processedTenants, showToast, m]);

  // Synchronize view title and export button with main application header slot
  useEffect(() => {
    setHeaderSlot({
      title: m.HEADING_PAGE,
      actions: (
        <Button onClick={handleExportData} icon={Download} variant="secondary" className="h-9 py-1 text-xs">
          <span className="hidden sm:inline">{m.BTN_EXPORT_TENANTS}</span>
          <span className="sm:hidden">{m.BTN_EXPORT_SHORT}</span>
        </Button>
      ),
    });
    return () => {
      setHeaderSlot(null);
    };
  }, [setHeaderSlot, handleExportData, m.HEADING_PAGE, m.BTN_EXPORT_TENANTS, m.BTN_EXPORT_SHORT]);

  return (
    <div className="space-y-3.5">
      {/* Side-by-Side Posture Overview (Left) & Top 3 Leaderboard (Right) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Left Column: Posture Overview (3 Tiles, Height Aligned) */}
        <div className="flex flex-col space-y-2 lg:col-span-5">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {m.HEADING_OVERVIEW_POSTURE}
            </h3>
          </div>

          <div className="flex flex-col space-y-2">
            {/* Tile 1: Total Tenants */}
            <Card
              onClick={() => globalKpis.topTenant && setInspectingTenant(globalKpis.topTenant)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && globalKpis.topTenant) {
                  e.preventDefault();
                  setInspectingTenant(globalKpis.topTenant);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${m.BTN_INSPECT} ${globalKpis.topTenant?.name}`}
              className="flex h-[68px] cursor-pointer select-none items-center justify-between px-3.5 py-2 transition-all hover:border-amber-400 hover:shadow-2xs active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-blue-600 dark:hover:border-amber-600"
            >
              <div className="min-w-0 pr-2">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {m.HEADING_MANAGED_COUNT}
                </span>
                <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                  {m.HEADING_TOP_TENANT}:{' '}
                  <strong className="font-semibold text-amber-600 dark:text-amber-400">
                    {globalKpis.topTenant?.name ?? APP_STRINGS.COMMON.TXT_NONE}
                  </strong>
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-mono text-xl font-black text-slate-900 dark:text-white">
                  {ALL_TENANTS.length}
                </span>
                <p className="text-[9px] font-medium text-slate-400">{m.LABEL_FLEET_UNITS}</p>
              </div>
            </Card>

            {/* Tile 2: Terrain Average Score */}
            <Card className="flex h-[68px] items-center justify-between px-3.5 py-2 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
              <div className="min-w-0 pr-2">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {m.HEADING_GLOBAL_AVERAGE}
                </span>
                <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                  {m.TXT_TERRAIN_COVERAGE}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-mono text-xl font-black text-slate-900 dark:text-white">
                  {globalKpis.avgScore}%
                </span>
                <p className="text-[9px] font-medium text-slate-400">{m.LABEL_BENCHMARK}</p>
              </div>
            </Card>

            {/* Tile 3: Full Security Stack Adoption */}
            <Card className="flex h-[68px] items-center justify-between px-3.5 py-2 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
              <div className="min-w-0 pr-2">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {m.HEADING_FULL_TELEMETRY}
                </span>
                <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                  {globalKpis.fullTelemetryCount} {m.TXT_PAGINATION_OF} {ALL_TENANTS.length} {m.TXT_FULL_STACK_STATUS}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-mono text-xl font-black text-blue-600 dark:text-blue-400">
                  {globalKpis.fullTelemetryPct}%
                </span>
                <p className="text-[9px] font-medium text-slate-400">{m.LABEL_ADOPTION_RATE}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Leaderboard Top 3 (Height Aligned with Left Overview) */}
        <div className="flex flex-col space-y-2 lg:col-span-7">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {m.HEADING_TOP_THREE_LEADERBOARD}
            </h3>
          </div>

          <div className="flex flex-col space-y-2">
            {ALL_TENANTS.slice(0, 3).map((tenant, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;

              return (
                <Card
                  key={tenant.id}
                  onClick={() => setInspectingTenant(tenant)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setInspectingTenant(tenant);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${m.BTN_INSPECT} ${tenant.name}`}
                  className={cn(
                    'group relative flex h-[68px] cursor-pointer select-none items-center justify-between overflow-hidden px-3.5 py-2 transition-all duration-200 hover:shadow-md active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-blue-600',
                    isFirst
                      ? 'border-amber-300 bg-amber-50/40 hover:border-amber-400 dark:border-amber-800 dark:bg-amber-950/20 ring-1 ring-amber-400/40'
                      : isSecond
                        ? 'border-slate-300 bg-slate-100/50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/40'
                        : 'border-orange-200 bg-orange-50/30 hover:border-orange-300 dark:border-orange-900/40 dark:bg-orange-950/20'
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    {/* Rank badge */}
                    <div className="shrink-0">
                      {isFirst ? (
                        <span
                          title={m.TOOLTIP_RANK_1}
                          className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800 shadow-2xs dark:bg-amber-950/80 dark:text-amber-300"
                        >
                          <Trophy className="h-3 w-3" aria-hidden="true" />
                          #1
                        </span>
                      ) : isSecond ? (
                        <span
                          title={m.TOOLTIP_RANK_2}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-800 shadow-2xs dark:bg-slate-800 dark:text-slate-200"
                        >
                          <Medal className="h-3 w-3" aria-hidden="true" />
                          #2
                        </span>
                      ) : (
                        <span
                          title={m.TOOLTIP_RANK_3}
                          className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 text-xs font-black text-orange-800 shadow-2xs dark:bg-orange-950/80 dark:text-orange-300"
                        >
                          <Award className="h-3 w-3" aria-hidden="true" />
                          #3
                        </span>
                      )}
                    </div>

                    {/* Tenant details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <h4
                          title={tenant.name}
                          className="shrink-0 max-w-[65%] truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-accent sm:max-w-[70%] dark:text-white"
                        >
                          {tenant.name}
                        </h4>
                        <span
                          title={tenant.domain}
                          className="hidden min-w-0 shrink truncate font-mono text-[10px] text-slate-400 sm:inline"
                        >
                          {tenant.domain}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400">
                        <span
                          title={tenant.domain}
                          className="min-w-0 max-w-[110px] truncate font-mono text-[10px] text-slate-400 sm:hidden"
                        >
                          {tenant.domain}
                        </span>
                        <span className="hidden sm:inline">{tenant.industry}</span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
                          {getActiveSignalCount(tenant.statusBubbles)}/{TOTAL_TELEMETRY_SIGNALS} {m.LABEL_TELEMETRY_SUFFIX}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Score */}
                  <div className="shrink-0 pl-3 text-right">
                    <span className="font-mono text-xl font-black text-slate-900 dark:text-white">
                      {tenant.overallScore}%
                    </span>
                    <p className="text-[9px] font-medium text-slate-400">{m.LABEL_OVERALL_SCORE}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* View Layout Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('tiles')}
          className={cn(
            'flex cursor-pointer select-none items-center gap-1.5 border-b-2 px-4 py-2 text-xs font-bold transition-colors',
            activeTab === 'tiles'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{m.TAB_TILES}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={cn(
            'flex cursor-pointer select-none items-center gap-1.5 border-b-2 px-4 py-2 text-xs font-bold transition-colors',
            activeTab === 'charts'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{m.TAB_CHARTS}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={cn(
            'flex cursor-pointer select-none items-center gap-1.5 border-b-2 px-4 py-2 text-xs font-bold transition-colors',
            activeTab === 'table'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <List className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{m.TAB_TABLE}</span>
        </button>
      </div>

      {/* Action Toolbar, Search & Filter Controls */}
      <Card className="p-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              placeholder={m.INPUT_SEARCH_TENANTS}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-1.5">
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

      {/* TAB 1: TILE VIEW (Default) */}
      {activeTab === 'tiles' && (
        <div className="space-y-3.5">
          {processedTenants.length === 0 ? (
            <Card className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
              {m.TXT_NO_TENANTS}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-2.5 sm:flex-row dark:border-slate-800">
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
                  <option value={12}>12 / {m.TXT_PAGE.toLowerCase()}</option>
                  <option value={24}>24 / {m.TXT_PAGE.toLowerCase()}</option>
                  <option value={48}>48 / {m.TXT_PAGE.toLowerCase()}</option>
                  <option value={ALL_TENANTS.length || 1000}>{m.OPT_LIMIT_ALL}</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  variant="secondary"
                >
                  &larr; {m.BTN_PREVIOUS}
                </Button>

                <span className="px-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {m.TXT_PAGE} {page} {m.TXT_PAGINATION_OF} {totalPages}
                </span>

                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  variant="secondary"
                >
                  {m.BTN_NEXT} &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEADERBOARD CHART */}
      {activeTab === 'charts' && (
        <TenantLeaderboardChart
          tenants={processedTenants}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          onInspectTenant={setInspectingTenant}
        />
      )}

      {/* TAB 3: LIST TABLE */}
      {activeTab === 'table' && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">{m.TH_RANK}</th>
                  <th className="px-4 py-3">{m.TH_TENANT}</th>
                  <th className="px-4 py-3 text-center">{m.TH_SCORE}</th>
                  <th className="px-4 py-3 text-center">{m.LABEL_BUBBLES_SECTION}</th>
                  <th className="px-4 py-3 text-right">
                    <div>{m.CAT_DEVICE}</div>
                    <span className="text-[9px] font-normal normal-case text-slate-400">({m.CAT_DEVICE_DESC})</span>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <div>{m.CAT_IDENTITIES}</div>
                    <span className="text-[9px] font-normal normal-case text-slate-400">({m.CAT_IDENTITIES_DESC})</span>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <div>{m.CAT_APPS}</div>
                    <span className="text-[9px] font-normal normal-case text-slate-400">({m.CAT_APPS_DESC})</span>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <div>{m.CAT_DATA}</div>
                    <span className="text-[9px] font-normal normal-case text-slate-400">({m.CAT_DATA_DESC})</span>
                  </th>
                  <th className="px-4 py-3 text-right">{m.TH_ACTION}</th>
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
                          title={m.LABEL_BUBBLE_SENTINEL}
                          className={cn(
                            'h-2 w-2 rounded-full',
                            tenant.statusBubbles.sentinel ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          )}
                        />
                        <span
                          title={m.LABEL_BUBBLE_MDE}
                          className={cn(
                            'h-2 w-2 rounded-full',
                            tenant.statusBubbles.mde ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          )}
                        />
                        <span
                          title={m.LABEL_BUBBLE_MDI}
                          className={cn(
                            'h-2 w-2 rounded-full',
                            tenant.statusBubbles.mdi ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          )}
                        />
                        <span
                          title={m.LABEL_BUBBLE_LOG}
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
                        {m.BTN_INSPECT}
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
