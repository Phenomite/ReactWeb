import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  BarChart3,
  Download,
  Filter,
  LayoutGrid,
  List,
  Medal,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { type KeyboardEvent, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TenantCard } from '@/components/TenantCard';
import { TenantDetailModal } from '@/components/TenantDetailModal';
import { TenantLeaderboardChart } from '@/components/TenantLeaderboardChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TOTAL_TELEMETRY_SIGNALS } from '@/constants';
import { useHeaderSlot } from '@/context/HeaderSlotContext';
import { useRealtime } from '@/context/RealtimeContext';
import { useToast } from '@/context/ToastContext';
import { usePagination } from '@/hooks/usePagination';
import { cn, getActiveSignalCount, getTierForScore } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';
import type {
  TenantRecord,
  TenantScoreTier,
  TenantSortField,
  TenantSortOrder,
  TenantStatusBubbles,
  ViewDefinition,
} from '@/types';

interface TopLeaderCardProps {
  tenant: TenantRecord;
  idx: number;
  onInspect: (id: string) => void;
  m: typeof APP_STRINGS.VIEWS.MICROSOFT;
}

const TopLeaderCard = memo(({ tenant, idx, onInspect, m }: TopLeaderCardProps) => {
  const handleClick = useCallback(() => {
    onInspect(tenant.id);
  }, [onInspect, tenant.id]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onInspect(tenant.id);
      }
    },
    [onInspect, tenant.id],
  );

  const isFirst = idx === 0;
  const isSecond = idx === 1;

  return (
    <Card
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${m.BTN_INSPECT} ${tenant.name}`}
      className={cn(
        'group relative flex min-h-[72px] cursor-pointer select-none items-center justify-between overflow-hidden px-4 py-2.5 transition-all duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.99]',
        isFirst
          ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-400/40 hover:border-amber-400 dark:border-amber-800 dark:bg-amber-950/20'
          : isSecond
            ? 'border-border bg-muted/50 hover:border-border/80'
            : 'border-orange-200 bg-orange-50/30 hover:border-orange-300 dark:border-orange-900/40 dark:bg-orange-950/20',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Rank badge */}
        <div className="shrink-0">
          {isFirst ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 font-black text-amber-800 text-sm shadow-2xs dark:bg-amber-950/80 dark:text-amber-300">
                  <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                  #1
                </span>
              </TooltipTrigger>
              <TooltipContent>{m.TOOLTIP_RANK_1}</TooltipContent>
            </Tooltip>
          ) : isSecond ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 font-black text-foreground text-sm shadow-2xs">
                  <Medal className="h-3.5 w-3.5" aria-hidden="true" />
                  #2
                </span>
              </TooltipTrigger>
              <TooltipContent>{m.TOOLTIP_RANK_2}</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100 px-2.5 py-1 font-black text-orange-800 text-sm shadow-2xs dark:bg-orange-950/80 dark:text-orange-300">
                  <Award className="h-3.5 w-3.5" aria-hidden="true" />
                  #3
                </span>
              </TooltipTrigger>
              <TooltipContent>{m.TOOLTIP_RANK_3}</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Tenant details */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h4
              title={tenant.name}
              className="max-w-[65%] shrink-0 truncate font-bold text-base text-foreground transition-colors group-hover:text-accent sm:max-w-[70%]"
            >
              {tenant.name}
            </h4>
            <span
              title={tenant.domain}
              className="hidden min-w-0 shrink truncate font-mono text-muted-foreground text-xs sm:inline"
            >
              {tenant.domain}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground text-xs">
            <span
              title={tenant.domain}
              className="min-w-0 max-w-[120px] truncate font-mono text-muted-foreground text-xs sm:hidden"
            >
              {tenant.domain}
            </span>
            <span className="hidden sm:inline">{tenant.industry}</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {getActiveSignalCount(tenant.statusBubbles)}/{TOTAL_TELEMETRY_SIGNALS} {m.LABEL_TELEMETRY_SUFFIX}
            </span>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="shrink-0 pl-3 text-right">
        <span className="font-black font-mono text-2xl text-foreground">{tenant.overallScore}%</span>
        <p className="font-semibold text-muted-foreground text-xs">{m.LABEL_OVERALL_SCORE}</p>
      </div>
    </Card>
  );
});
TopLeaderCard.displayName = 'TopLeaderCard';

interface TenantTableRowProps {
  tenant: TenantRecord;
  onInspect: (id: string) => void;
  m: typeof APP_STRINGS.VIEWS.MICROSOFT;
}

const TenantTableRow = memo(({ tenant, onInspect, m }: TenantTableRowProps) => {
  const handleInspect = useCallback(() => {
    onInspect(tenant.id);
  }, [onInspect, tenant.id]);

  return (
    <tr className="transition-colors hover:bg-muted/50">
      <td className="px-4 py-3 font-bold font-mono text-muted-foreground text-sm">#{tenant.rank}</td>
      <td className="px-4 py-3">
        <p className="font-bold text-foreground text-sm">{tenant.name}</p>
        <p className="font-mono text-muted-foreground text-xs">{tenant.domain}</p>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="font-black font-mono text-base text-foreground">{tenant.overallScore}%</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1.5">
          <span
            title={m.LABEL_BUBBLE_SENTINEL}
            className={cn('h-2.5 w-2.5 rounded-full', tenant.statusBubbles.sentinel ? 'bg-emerald-500' : 'bg-muted')}
          />
          <span
            title={m.LABEL_BUBBLE_MDE}
            className={cn('h-2.5 w-2.5 rounded-full', tenant.statusBubbles.mde ? 'bg-emerald-500' : 'bg-muted')}
          />
          <span
            title={m.LABEL_BUBBLE_MDI}
            className={cn('h-2.5 w-2.5 rounded-full', tenant.statusBubbles.mdi ? 'bg-emerald-500' : 'bg-muted')}
          />
          <span
            title={m.LABEL_BUBBLE_LOG}
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              tenant.statusBubbles.logAnalytics ? 'bg-emerald-500' : 'bg-muted',
            )}
          />
        </div>
      </td>
      <td className="px-4 py-3 text-right font-mono text-foreground text-sm">{tenant.categories.device}%</td>
      <td className="px-4 py-3 text-right font-mono text-foreground text-sm">{tenant.categories.identities}%</td>
      <td className="px-4 py-3 text-right font-mono text-foreground text-sm">{tenant.categories.apps}%</td>
      <td className="px-4 py-3 text-right font-mono text-foreground text-sm">{tenant.categories.data}%</td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={handleInspect}
          className="cursor-pointer font-bold text-accent text-sm hover:underline"
        >
          {m.BTN_INSPECT}
        </button>
      </td>
    </tr>
  );
});
TenantTableRow.displayName = 'TenantTableRow';

// Renders the gamified Microsoft Secure Score multi-tenant leaderboard
const MicrosoftView = memo(() => {
  const { showToast } = useToast();
  const { setHeaderSlot } = useHeaderSlot();
  const { tenants } = useRealtime();
  const m = APP_STRINGS.VIEWS.MICROSOFT;

  // View state & tab selection
  const [activeTab, setActiveTab] = useState<'tiles' | 'charts' | 'table'>('tiles');
  const [searchQuery, setSearchQuery] = useState('');
  const [telemetryFilter, setTelemetryFilter] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<TenantScoreTier>('all');
  const [sortField, setSortField] = useState<TenantSortField>('overallScore');
  const [sortOrder, setSortOrder] = useState<TenantSortOrder>('desc');
  const [page, setPage] = usePagination(1);
  const [pageSize, setPageSize] = useState(12);

  const handleTabChange = useCallback((val: string) => {
    setActiveTab(val as 'tiles' | 'charts' | 'table');
  }, []);

  // Selected tenant ID for detailed modal inspection
  const [inspectingTenantId, setInspectingTenantId] = useState<string | null>(null);

  // Dynamically resolve inspecting tenant from live real-time tenants store
  const inspectingTenant = useMemo(() => {
    if (!inspectingTenantId) return null;
    return tenants.find((t) => t.id === inspectingTenantId) ?? null;
  }, [tenants, inspectingTenantId]);

  const handleInspectTenant = useCallback((tenant: TenantRecord | null) => {
    setInspectingTenantId(tenant ? tenant.id : null);
  }, []);

  // Global KPI aggregates across all tenants
  const globalKpis = useMemo(() => {
    if (tenants.length === 0) return { avgScore: 0, fullTelemetryCount: 0, fullTelemetryPct: 0, topTenant: null };

    const totalScore = tenants.reduce((sum, t) => sum + t.overallScore, 0);
    const avgScore = Number((totalScore / tenants.length).toFixed(1));

    const fullTelemetryCount = tenants.filter(
      (t) => getActiveSignalCount(t.statusBubbles) === TOTAL_TELEMETRY_SIGNALS,
    ).length;

    const fullTelemetryPct = Number(((fullTelemetryCount / tenants.length) * 100).toFixed(0));
    const topTenant = tenants[0] ?? null;

    return { avgScore, fullTelemetryCount, fullTelemetryPct, topTenant };
  }, [tenants]);

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

    const filtered = tenants.filter((tenant) => {
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
  }, [tenants, searchQuery, telemetryFilter, selectedTier, sortField, sortOrder]);

  // Paginated records for tile and table views
  const totalPages = Math.max(1, Math.ceil(processedTenants.length / pageSize));
  const paginatedTenants = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedTenants.slice(start, start + pageSize);
  }, [processedTenants, page, pageSize]);

  // Curried filter change handler: binds a state setter and returns a curried function that updates state and resets page to 1
  const handleFilterChange = useCallback(
    <T,>(setter: (val: T) => void) =>
      (value: T) => {
        setter(value);
        setPage(1);
      },
    [setPage],
  );

  // Stable memoized change handlers preserving referential equality for child component props
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilterChange(setSearchQuery)(e.target.value);
    },
    [handleFilterChange],
  );

  const handleTelemetryFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleFilterChange(setTelemetryFilter)(e.target.value);
    },
    [handleFilterChange],
  );

  const handleTierFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleFilterChange(setSelectedTier)(e.target.value as TenantScoreTier);
    },
    [handleFilterChange],
  );

  const handleSortFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleFilterChange(setSortField)(e.target.value as TenantSortField);
    },
    [handleFilterChange],
  );

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleFilterChange(setPageSize)(Number(e.target.value));
    },
    [handleFilterChange],
  );

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setTelemetryFilter('all');
    setSelectedTier('all');
    setSortField('overallScore');
    setSortOrder('desc');
    setPage(1);
  }, [setPage]);

  // Export 200 tenants dataset as JSON
  const handleExportData = useCallback(() => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(processedTenants, null, 2))}`;
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

  const handleInspectTopTenant = useCallback(() => {
    if (globalKpis.topTenant) {
      setInspectingTenantId(globalKpis.topTenant.id);
    }
  }, [globalKpis.topTenant]);

  const handleTopTenantKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && globalKpis.topTenant) {
        e.preventDefault();
        setInspectingTenantId(globalKpis.topTenant.id);
      }
    },
    [globalKpis.topTenant],
  );

  const handleInspectTenantById = useCallback((id: string) => {
    setInspectingTenantId(id);
  }, []);

  const handleCloseInspectModal = useCallback(() => {
    setInspectingTenantId(null);
  }, []);

  const handleToggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, [setPage]);

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1));
  }, [setPage, totalPages]);

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
            <Shield className="h-4 w-4 text-blue-500" aria-hidden="true" />
            <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
              {m.HEADING_OVERVIEW_POSTURE}
            </h3>
          </div>

          <div className="flex flex-col space-y-2">
            {/* Tile 1: Total Tenants */}
            <Card
              onClick={handleInspectTopTenant}
              onKeyDown={handleTopTenantKeyDown}
              tabIndex={0}
              role="button"
              aria-label={`${m.BTN_INSPECT} ${globalKpis.topTenant?.name}`}
              className="flex min-h-[72px] cursor-pointer select-none items-center justify-between px-4 py-2.5 transition-all hover:border-amber-400 hover:shadow-2xs focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.99]"
            >
              <div className="min-w-0 pr-2">
                <span className="font-bold text-foreground text-sm">{m.HEADING_MANAGED_COUNT}</span>
                <p className="truncate text-muted-foreground text-xs">
                  {m.HEADING_TOP_TENANT}:{' '}
                  <strong className="font-semibold text-amber-600 dark:text-amber-400">
                    {globalKpis.topTenant?.name ?? APP_STRINGS.COMMON.TXT_NONE}
                  </strong>
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-black font-mono text-2xl text-foreground">{tenants.length}</span>
                <p className="font-semibold text-muted-foreground text-xs">{m.LABEL_FLEET_UNITS}</p>
              </div>
            </Card>

            {/* Tile 2: Terrain Average Score */}
            <Card className="flex min-h-[72px] items-center justify-between px-4 py-2.5 transition-colors hover:border-border">
              <div className="min-w-0 pr-2">
                <span className="font-bold text-foreground text-sm">{m.HEADING_GLOBAL_AVERAGE}</span>
                <p className="truncate text-muted-foreground text-xs">{m.TXT_TERRAIN_COVERAGE}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-black font-mono text-2xl text-foreground">{globalKpis.avgScore}%</span>
                <p className="font-semibold text-muted-foreground text-xs">{m.LABEL_BENCHMARK}</p>
              </div>
            </Card>

            {/* Tile 3: Full Security Stack Adoption */}
            <Card className="flex min-h-[72px] items-center justify-between px-4 py-2.5 transition-colors hover:border-border">
              <div className="min-w-0 pr-2">
                <span className="font-bold text-foreground text-sm">{m.HEADING_FULL_TELEMETRY}</span>
                <p className="truncate text-muted-foreground text-xs">
                  {globalKpis.fullTelemetryCount} {m.TXT_PAGINATION_OF} {tenants.length} {m.TXT_FULL_STACK_STATUS}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-black font-mono text-2xl text-blue-600 dark:text-blue-400">
                  {globalKpis.fullTelemetryPct}%
                </span>
                <p className="font-semibold text-muted-foreground text-xs">{m.LABEL_ADOPTION_RATE}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Leaderboard Top 3 (Height Aligned with Left Overview) */}
        <div className="flex flex-col space-y-2 lg:col-span-7">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
              {m.HEADING_TOP_THREE_LEADERBOARD}
            </h3>
          </div>

          <div className="flex flex-col space-y-2">
            {tenants.slice(0, 3).map((tenant, idx) => (
              <TopLeaderCard key={tenant.id} tenant={tenant} idx={idx} onInspect={handleInspectTenantById} m={m} />
            ))}
          </div>
        </div>
      </div>

      {/* View Layout Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full gap-3.5">
        <div className="flex border-border border-b pb-2">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="tiles" className="gap-2 px-3.5 py-1.5 font-semibold text-sm">
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              <span>{m.TAB_TILES}</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2 px-3.5 py-1.5 font-semibold text-sm">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              <span>{m.TAB_CHARTS}</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2 px-3.5 py-1.5 font-semibold text-sm">
              <List className="h-4 w-4" aria-hidden="true" />
              <span>{m.TAB_TABLE}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Action Toolbar, Search & Filter Controls */}
        <Card className="p-3">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={m.INPUT_SEARCH_TENANTS}
                className="w-full rounded-lg border border-border bg-muted/60 py-2 pr-3.5 pl-9 text-foreground text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Telemetry Bubble Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <select
                  value={telemetryFilter}
                  onChange={handleTelemetryFilterChange}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm"
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
                onChange={handleTierFilterChange}
                className="rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm"
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
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <select
                  value={sortField}
                  onChange={handleSortFieldChange}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm"
                >
                  <option value="overallScore">
                    {sortOrder === 'desc' ? m.OPT_SORT_SCORE_DESC : m.OPT_SORT_SCORE_ASC}
                  </option>
                  <option value="rank">{sortOrder === 'asc' ? m.OPT_SORT_RANK_ASC : m.OPT_SORT_RANK_DESC}</option>
                  <option value="name">{sortOrder === 'asc' ? m.OPT_SORT_NAME_ASC : m.OPT_SORT_NAME_DESC}</option>
                  <option value="device">
                    {sortOrder === 'desc' ? m.OPT_SORT_DEVICE_DESC : m.OPT_SORT_DEVICE_ASC}
                  </option>
                  <option value="identities">
                    {sortOrder === 'desc' ? m.OPT_SORT_IDENTITIES_DESC : m.OPT_SORT_IDENTITIES_ASC}
                  </option>
                  <option value="apps">{sortOrder === 'desc' ? m.OPT_SORT_APPS_DESC : m.OPT_SORT_APPS_ASC}</option>
                  <option value="data">{sortOrder === 'desc' ? m.OPT_SORT_DATA_DESC : m.OPT_SORT_DATA_ASC}</option>
                </select>
              </div>

              {/* Sort Order Toggle */}
              <button
                type="button"
                onClick={handleToggleSortOrder}
                title={`Toggle sort order: currently ${orderLabel}`}
                aria-label={`Toggle sort order: currently ${orderLabel}`}
                className="flex cursor-pointer select-none items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 font-semibold text-foreground text-sm hover:bg-muted active:scale-95"
              >
                {sortOrder === 'desc' ? (
                  <ArrowDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ArrowUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
        <TabsContent value="tiles" className="mt-0 space-y-3.5">
          {processedTenants.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground text-xs">{m.TXT_NO_TENANTS}</Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {paginatedTenants.map((tenant) => (
                <TenantCard key={tenant.id} tenant={tenant} onInspect={handleInspectTenant} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {processedTenants.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-border border-t pt-2.5 sm:flex-row">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>
                  {m.TXT_PAGINATION_SHOWING} <strong className="text-foreground">{(page - 1) * pageSize + 1}</strong> -{' '}
                  <strong className="text-foreground">{Math.min(page * pageSize, processedTenants.length)}</strong>{' '}
                  {m.TXT_PAGINATION_OF} <strong className="text-foreground">{processedTenants.length}</strong>{' '}
                  {m.TXT_PAGINATION_TENANTS}
                </span>

                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="rounded-md border border-border bg-card px-2.5 py-1 text-foreground text-sm"
                >
                  <option value={12}>12 / {m.TXT_PAGE.toLowerCase()}</option>
                  <option value={24}>24 / {m.TXT_PAGE.toLowerCase()}</option>
                  <option value={48}>48 / {m.TXT_PAGE.toLowerCase()}</option>
                  <option value={tenants.length || 1000}>{m.OPT_LIMIT_ALL}</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Button onClick={handlePreviousPage} disabled={page <= 1} variant="secondary">
                  &larr; {m.BTN_PREVIOUS}
                </Button>

                <span className="px-3 font-semibold text-foreground text-sm">
                  {m.TXT_PAGE} {page} {m.TXT_PAGINATION_OF} {totalPages}
                </span>

                <Button onClick={handleNextPage} disabled={page >= totalPages} variant="secondary">
                  {m.BTN_NEXT} &rarr;
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: LEADERBOARD CHART */}
        <TabsContent value="charts" className="mt-0">
          <TenantLeaderboardChart
            tenants={processedTenants}
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
            onInspectTenant={handleInspectTenant}
          />
        </TabsContent>

        {/* TAB 3: LIST TABLE */}
        <TabsContent value="table" className="mt-0">
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-border border-b bg-muted/60 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">{m.TH_RANK}</th>
                    <th className="px-4 py-3">{m.TH_TENANT}</th>
                    <th className="px-4 py-3 text-center">{m.TH_SCORE}</th>
                    <th className="px-4 py-3 text-center">{m.LABEL_BUBBLES_SECTION}</th>
                    <th className="px-4 py-3 text-right">
                      <div>{m.CAT_DEVICE}</div>
                      <span className="font-normal text-[11px] text-muted-foreground normal-case">
                        ({m.CAT_DEVICE_DESC})
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <div>{m.CAT_IDENTITIES}</div>
                      <span className="font-normal text-[11px] text-muted-foreground normal-case">
                        ({m.CAT_IDENTITIES_DESC})
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <div>{m.CAT_APPS}</div>
                      <span className="font-normal text-[11px] text-muted-foreground normal-case">
                        ({m.CAT_APPS_DESC})
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <div>{m.CAT_DATA}</div>
                      <span className="font-normal text-[11px] text-muted-foreground normal-case">
                        ({m.CAT_DATA_DESC})
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right">{m.TH_ACTION}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedTenants.map((tenant) => (
                    <TenantTableRow key={tenant.id} tenant={tenant} onInspect={handleInspectTenantById} m={m} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Tenant Inspection Modal */}
      <TenantDetailModal
        tenant={inspectingTenant}
        isOpen={Boolean(inspectingTenant)}
        onClose={handleCloseInspectModal}
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
