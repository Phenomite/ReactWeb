# Implementation Specification: Microsoft Security Leaderboard

This specification details the architecture, design, data models, requirements, and concrete tasks to implement
the Microsoft Security Leaderboard View (`#microsoft`) as it currently exists in this codebase.

---

## 1. Overview & Intent

The Microsoft Security view provides an interactive security posture dashboard evaluating tenants stored in
a local JSON file. The interface transforms Secure Scores and Telemetry settings into a clear hierarchy featuring:

- Dynamic Header Slot injection (replacing default title with view heading and export action button).
- Side-by-side height-aligned Posture Overview (3 metrics) and Top 3 Leaderboard cards.
- 3 distinct layout tabs: **Tiles** (primary grid), **Leaderboard** (interactive rankings), and **List**
  (a dense tabular view).
- Filter, search, and bi-directional sort toolbar with dynamic order toggle.
- Value-agnostic dataset sizing (dynamic tenant counts, views, and signal denominators).
- Reusable modal dialog for deep tenant inspection supporting backdrop outside-click and Escape key dismissal.
- Adherence to technical user terminology and iconography.
- All string constants centralised.

---

## 2. Proposed File Inventory & Architecture

You may find better organization of directories, but this is what is used for this project:

```text
src/
├── components/
│   ├── TenantCard.tsx             # Interactive tenant tile with status bubbles above categories
│   ├── TenantDetailModal.tsx      # Inspection dialog with outside-click dismiss & useEscapeKey
│   └── TenantLeaderboardChart.tsx # Horizontal bar ranking, score histogram & category benchmarks
├── constants.ts                   # Canonical ALL_TENANTS export, TOTAL_TELEMETRY_SIGNALS, TIER_CONFIG
├── context/
│   └── HeaderSlotContext.tsx      # Teleports view heading and export button into main app header
├── data/
│   └── tenants.json               # Canonical dataset of enterprise tenants
├── hooks/
│   └── useEscapeKey.ts            # Standardized Escape keydown listener hook
├── lib/
│   └── utils.ts                   # Allocation-free getActiveSignalCount & getTierForScore helpers
├── strings.ts                     # Centralized APP_STRINGS.VIEWS.MICROSOFT string constants
├── types.ts                       # TypeScript models (TenantRecord, StatusBubbles, Categories, Tiers)
└── views/
    └── MicrosoftView.tsx          # Top-level view shell, layout tabs, toolbar, grid, table & pagination
```

---

## 3. Data Models & Constants

### 3.1 TypeScript Definitions (`src/types.ts`)

```typescript
export interface TenantStatusBubbles {
  sentinel: boolean;     // Microsoft Sentinel
  mde: boolean;          // Microsoft Defender for Endpoint
  mdi: boolean;          // Microsoft Defender for Identity
  logAnalytics: boolean; // Azure Log Analytics Audit Logging
}

export interface TenantScoreCategories {
  device: number;        // Device (Defender XDR)
  identities: number;    // Identities (Entra)
  apps: number;          // Apps (Defender for Cloud Apps)
  data: number;          // Data (Purview)
}

export interface TenantRecord {
  id: string;
  name: string;
  domain: string;
  industry: string;
  region: string;
  seatCount: number;
  statusBubbles: TenantStatusBubbles;
  categories: TenantScoreCategories;
  overallScore: number;
  rank: number;
}

export type TenantSortField =
  | 'overallScore'
  | 'device'
  | 'identities'
  | 'apps'
  | 'data'
  | 'name'
  | 'rank';

export type TenantSortOrder = 'asc' | 'desc';

export type TenantScoreTier = 'all' | 'diamond' | 'gold' | 'silver' | 'bronze' | 'critical';
```

### 3.2 Canonical Dataset & Tier Constants (`src/constants.ts`)

```typescript
import rawTenantsData from '@/data/tenants.json';

export const ALL_TENANTS: TenantRecord[] = rawTenantsData as TenantRecord[];

export const TOTAL_TELEMETRY_SIGNALS = 4;

export interface ScoreTierDefinition {
  id: Exclude<TenantScoreTier, 'all'>;
  min: number;
  badgeClass: string;
  barColor: string;
}

export const TIER_CONFIG: readonly ScoreTierDefinition[] = [
  {
    id: 'diamond',
    min: 90,
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 ' +
      'dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    barColor: 'bg-emerald-500',
  },
  {
    id: 'gold',
    min: 80,
    badgeClass:
      'bg-blue-50 text-blue-700 border-blue-200 ' +
      'dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    barColor: 'bg-blue-500',
  },
  {
    id: 'silver',
    min: 70,
    badgeClass:
      'bg-violet-50 text-violet-700 border-violet-200 ' +
      'dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
    barColor: 'bg-violet-500',
  },
  {
    id: 'bronze',
    min: 50,
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200 ' +
      'dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    barColor: 'bg-amber-500',
  },
  {
    id: 'critical',
    min: 0,
    badgeClass:
      'bg-rose-50 text-rose-700 border-rose-200 ' +
      'dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    barColor: 'bg-rose-500',
  },
] as const;
```

---

## 4. Shared Utilities & Custom Hooks

### 4.1 Allocation-Free Telemetry Counter (`src/lib/utils.ts`)

Instead of creating temporary arrays with `.filter(Boolean).length`, compute active signals in $O(1)$:

```typescript
export function getActiveSignalCount(bubbles: TenantStatusBubbles): number {
  return (
    (bubbles.sentinel ? 1 : 0) +
    (bubbles.mde ? 1 : 0) +
    (bubbles.mdi ? 1 : 0) +
    (bubbles.logAnalytics ? 1 : 0)
  );
}
```

### 4.2 Centralized Score Tier Resolver (`src/lib/utils.ts`)

Maps a numeric score to its corresponding threshold configuration and localized label:

```typescript
export function getTierForScore(score: number): ScoreTierDefinition & { label: string } {
  const m = APP_STRINGS.VIEWS.MICROSOFT;
  const tier = TIER_CONFIG.find((t) => score >= t.min) ?? TIER_CONFIG[TIER_CONFIG.length - 1]!;
  const labelMap: Record<Exclude<TenantScoreTier, 'all'>, string> = {
    diamond: m.TIER_DIAMOND,
    gold: m.TIER_GOLD,
    silver: m.TIER_SILVER,
    bronze: m.TIER_BRONZE,
    critical: m.TIER_CRITICAL,
  };
  return {
    ...tier,
    label: labelMap[tier.id],
  };
}
```

### 4.3 Standardized Modal Escape Listener (`src/hooks/useEscapeKey.ts`)

```typescript
import { useEffect } from 'react';

export function useEscapeKey(isActive: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onEscape]);
}
```

---

## 5. UI Architecture & View Components

### 5.1 Main View Shell (`src/views/MicrosoftView.tsx`)

#### A. Header Slot Integration

The component consumes `useHeaderSlot()` and mounts an effect on render:

- View Title: `m.HEADING_PAGE` (`Terrain Posture Scores`).
- Actions: Primary Export Button (`Download` icon) invoking `handleExportData`, saving
  `m.FILE_EXPORT_TENANTS_JSON` (`microsoft-tenant-secure-scores.json`).
- Cleans up slot on unmount with `setHeaderSlot(null)`.

#### B. Side-by-Side Posture Overview & Top 3 Leaderboard

Uses a responsive 12-column grid (`grid grid-cols-1 gap-3 lg:grid-cols-12`):

- **Left Column (`lg:col-span-5`) - Posture Overview**:
  - Contains section heading `m.HEADING_OVERVIEW_POSTURE` with `Shield` icon.
  - Stack of 3 height-aligned cards (`h-[68px]`, `px-3.5 py-2`):
    1. **Total Tenants** (`HEADING_MANAGED_COUNT`): Shows dynamic `{ALL_TENANTS.length}` and the current leader
       name (`HEADING_TOP_TENANT`). Clickable to inspect #1 leader.
    2. **Terrain Average Score** (`HEADING_GLOBAL_AVERAGE`): Global arithmetic mean percentage and benchmark tag.
    3. **Full Security Stack Adoption** (`HEADING_FULL_TELEMETRY`): Count and percentage of tenants with all 4
       signals active (`{fullTelemetryCount} of {ALL_TENANTS.length}`).
- **Right Column (`lg:col-span-7`) - Top 3 Leaderboard**:
  - Section heading `m.HEADING_TOP_THREE_LEADERBOARD` with `Trophy` icon.
  - Stack of 3 height-aligned cards (`h-[68px]`, `px-3.5 py-2`):
    - **#1 Leader**: `Trophy` icon, gold border/accent (`border-amber-300 bg-amber-50/40 ring-1 ring-amber-400/40`).
    - **#2 Runner-Up**: `Medal` icon, silver styling (`border-slate-300 bg-slate-100/50`).
    - **#3 Podium**: `Award` icon, bronze styling (`border-orange-200 bg-orange-50/30`).
    - Displays: Organization name (prioritized with domain ellipsis on narrow viewports), primary domain, industry,
      active signals count (`X/4 Telemetry`), and overall score %.
    - Clicking anywhere on any of these cards opens `TenantDetailModal` for that tenant.

#### C. View Navigation Tabs

Row of 3 buttons with active underline indicator:

1. `Tiles` (`LayoutGrid` icon, tab ID `'tiles'`) - Primary tile view.
2. `Leaderboard` (`BarChart3` icon, tab ID `'charts'`) - Gamified charts view.
3. `Directory` (`List` icon, tab ID `'table'`) - Tabular spreadsheet view.

#### D. Toolbar, Search, Filtering & Sorting

A compact surface card (`p-3`) housing:

- **Search Field**: Real-time filtering matching name, domain, industry, and region.
- **Telemetry Filter**: Options for `All Tenants`, `All Capabilities (4 Active)`, `Sentinel Active`, `MDE Active`,
  `MDI Active`, and `Audit Logging Active`.
- **Score League Filter**: Options for `All Leagues`, `Diamond (90%+)`, `Gold (80-89%)`, `Silver (70-79%)`,
  `Bronze (50-69%)`, and `Critical Attention (<50%)`.
- **Sort By Selector**: Options for Overall Score, Leaderboard Rank, Tenant Name, Device, Identities, Apps, and Data.
- **Sort Order Toggle**: Tactile button (`active:scale-[0.98]`) toggling direction with `ArrowDown`/`ArrowUp` and
  dynamic label (`Highest First`, `Lowest First`, `A to Z`, `Z to A`, `Rank #1 - #n`, `Rank #n - #1`).
- **Reset All Filters Button**: Displayed conditionally when any non-default filter/search is active.

#### E. Primary Tile Grid (`tab === 'tiles'`)

- Rendered in a responsive 3-column grid (`grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3`).
- Maps over `paginatedTenants` rendering `TenantCard`.
- Pagination footer displays `Showing X - Y of Z tenants`, page size selector (`12`, `24`, `48`, `All Tenants`),
  and Previous/Next buttons.

#### F. Directory Table View (`tab === 'table'`)

- Clean, compact spreadsheet table with columns:
  `Rank`, `Tenant & Domain`, `Score`, `Active Telemetry Signals`, `Device`, `Identities`, `Apps`, `Data`, `Action`.
- Telemetry column renders 4 small colored dots (emerald when active, slate when inactive) with tooltips.
- Action column contains an `Inspect` text button opening the detail modal.

---

### 5.2 Tenant Tile Card (`src/components/TenantCard.tsx`)

Each tenant tile is fully clickable (`role="button"`, `tabIndex={0}`, tactile feedback `active:scale-[0.99]`).

#### Card Structure

1. **Header Row**:
   - Rank badge: #1 (`Trophy`, tooltip: `Gold (#1)`), #2 (`Medal`, tooltip: `Silver (#2)`),
     #3 (`Award`, tooltip: `Bronze (#3)`), or `#N`.
   - Tier pill: Resolved via `getTierForScore(tenant.overallScore)` (e.g. `Diamond Tier`, `Gold Tier`).
   - Tenant title: Truncated bold heading with hover accent color.
   - Metadata line: Single flex-wrap line containing Domain (`Globe`), Industry (`Building2`), and Users count
     (`Users`, formatted as `{seatCount} Users`).
   - Overall Score Pill: Square-rounded meter in upper-right corner with large score number and `%`.
2. **Active Telemetry Signals Section (Positioned ABOVE Categories)**:
   - Header with section title `Active Telemetry Signals` and count
     `{getActiveSignalCount(tenant.statusBubbles)}/{TOTAL_TELEMETRY_SIGNALS} Active`.
   - 4 Status Bubbles:
     - `Sentinel`: Connected & Ingesting / Inactive.
     - `MDE`: Enrolled / Not Deployed.
     - `MDI`: Active Sensor / Inactive.
     - `Audit Logging`: Stream Active / Disabled.
3. **Domain Posture Vector Breakdown (4 Progress Bars)**:
   - Device (`Defender XDR`, blue).
   - Identities (`Entra`, violet).
   - Apps (`Defender for Cloud Apps`, amber).
   - Data (`Purview`, emerald).
   - Each with icon, label, descriptor subtitle, score %, and animated progress track.

---

### 5.3 Tenant Detail Modal (`src/components/TenantDetailModal.tsx`)

#### Requirements

- **Outside-Click Dismissal**: A dedicated backdrop `div` (`fixed inset-0 bg-slate-900/60 backdrop-blur-xs`) with
  `onClick={onClose}` immediately closes the modal when clicking outside the dialog card.
- **Escape Key Dismissal**: Binds `useEscapeKey(isOpen, onClose)`.
- **Responsive Vertical Anchoring**: Outer dialog uses `overflow-y-auto` with `my-auto` centering on the card and
  `max-h-[calc(100vh-2rem)]` (header/footer `shrink-0`, body `flex-1 min-h-0 overflow-y-auto`), ensuring the header
  is never obscured when resizing vertically.
- **Header**: Trophy rank badge, industry, name, domain, region, users count, and close "X" button.
- **Composite Score Banner**:
  - Title: `Terrain Security Posture Composite`.
  - Big score percentage.
  - Posture evaluation badge:
    - $\ge 80\%$: `Optimal Defense Posture` (green).
    - $60\% - 79\%$: `Degraded Defense Posture` (amber).
    - $< 60\%$: `Critical Breach Vulnerability` (rose).
  - Active Telemetry badge: `{activeSignalsCount} / {TOTAL_TELEMETRY_SIGNALS}`.
- **Telemetry Signals Grid**:
  - 4 cards mapped declaratively from `bubbleConfigs`:
    - Sentinel: `Ingesting SIEM` / `Not Connected`.
    - MDE: `EDR Active` / `No Sensor`.
    - MDI: `Identity Defense` / `Sensor Inactive`.
    - Audit Logging: `Audit Streaming` / `Logs Disabled`.
- **Domain Posture Vector Breakdown**:
  - 4 category progress bars mapped declaratively from `categoryConfigs`.
  - Device category features explicit sub-status indicators for `MDE Sensor: Active/Missing` and
    `Defender for Servers: Enrolled/Pending Deployment`.
- **Action Recommendations**:
  - Technical checklist (`ListChecks` icon) suggesting concrete actions based on missing signals or scores below 92%:
    - Missing MDE: `Deploy Defender for Servers under the Device (Defender XDR) category...`
    - MDE active but device < 92%: `Expand Defender for Servers Plan 2 coverage under Device (Defender XDR)...`
    - Missing MDI: `Deploy Microsoft Defender for Identity (MDI) sensors under Identities (Entra)...`
    - Missing Sentinel: `Connect Microsoft Sentinel workspace...`
    - Missing Audit: `Enable Azure Log Analytics Audit Logging under Data (Purview)...`
    - All 4 active & device $\ge 92\%$: `Full telemetry stack enabled!...`
- **Footer**: "Close Details" secondary button.

---

### 5.4 Gamified Leaderboard & Charts (`src/components/TenantLeaderboardChart.tsx`)

Rendered within the `Leaderboard` tab (`activeTab === 'charts'`):

1. **Enterprise Leaderboard Rankings (Bar Chart)**:
   - Takes `displayedTenants` respecting current search and filter criteria.
   - Header features a top limit selector (`15`, `30`, `50`, `All Tenants`) and
     `displayedTenants.length of tenants.length`.
   - Horizontal score bars with gradient styling (gold-to-emerald for top 3, blue-to-indigo for remaining).
   - Shows rank, tenant name, overall score %, and quick telemetry pill count (`X/4`).
   - Clicking any bar triggers tenant inspection.
2. **League & Score Tier Distribution (Histogram)**:
   - Grouped into Diamond, Gold, Silver, Bronze, and Critical Attention buckets via `TIER_CONFIG`.
   - Interactive buttons: Clicking a bucket filters the active score tier across the entire view.
3. **Average Category Benchmarks**:
   - Calculates arithmetic means across all tenants for Device, Identities, Apps, and Data.
   - Renders progress gauge bars with exact percentage values.

---

## 6. String Constants Reference (`src/strings.ts`)

All user-facing strings reside in `APP_STRINGS.VIEWS.MICROSOFT`. Key dictionary definitions include:

```typescript
const MICROSOFT = {
  NAV_ID: 'microsoft',
  NAV_TITLE: 'Microsoft Security',
  NAV_HASH: '#microsoft',
  HEADING_PAGE: 'Terrain Posture Scores',

  TAB_TILES: 'Tiles',
  TAB_CHARTS: 'Leaderboard',
  TAB_TABLE: 'Directory',

  LABEL_BUBBLES_SECTION: 'Active Telemetry Signals',
  LABEL_BUBBLE_SENTINEL: 'Sentinel',
  LABEL_BUBBLE_MDE: 'MDE',
  LABEL_BUBBLE_MDI: 'MDI',
  LABEL_BUBBLE_LOG: 'Audit Logging',

  CAT_DEVICE: 'Device',
  CAT_DEVICE_DESC: 'Defender XDR',
  CAT_IDENTITIES: 'Identities',
  CAT_IDENTITIES_DESC: 'Entra',
  CAT_APPS: 'Apps',
  CAT_APPS_DESC: 'Defender for Cloud Apps',
  CAT_DATA: 'Data',
  CAT_DATA_DESC: 'Purview',

  HEADING_RECOMMENDED_ACTIONS: 'Recommended Actions to Boost Score',
  LABEL_REC_MDE_CATEGORY: 'Device (Defender XDR)',
  TXT_REC_MDE_SERVERS:
    'Deploy Defender for Servers under the Device (Defender XDR) category to protect ' +
    'hybrid server infrastructure and unmanaged VMs (+16.5% device score).',
  TXT_REC_MDE_SERVERS_EXPAND:
    'Expand Defender for Servers Plan 2 coverage under the Device (Defender XDR) category ' +
    'for active server vulnerability assessment (+7.5% device score).',
  TXT_REC_MDI:
    'Deploy Microsoft Defender for Identity (MDI) sensors under the Identities (Entra) ' +
    'category (+14.2% identities score).',
  TXT_REC_SENTINEL:
    'Connect Microsoft Sentinel workspace for automated threat triage and ' +
    'incident synchronization (+11.8% overall score).',
  TXT_REC_AUDIT:
    'Enable Azure Log Analytics Audit Logging under the Data (Purview) category ' +
    'for complete audit trail retention (+9.5% data score).',
  TXT_REC_FULL_STACK:
    'Full telemetry stack enabled! Focus on automated Conditional Access policy ' +
    'enforcement and continuous server posture management.',

  HEADING_OVERVIEW_POSTURE: 'Posture Overview & Metrics',
  HEADING_TOP_THREE_LEADERBOARD: 'Leaderboard Top 3',
  HEADING_GLOBAL_AVERAGE: 'Tenant Average Score',
  HEADING_FULL_TELEMETRY: 'Full Security Stack Adoption',
  HEADING_TOP_TENANT: 'Current Leader',
  HEADING_MANAGED_COUNT: 'Total Tenants',
  HEADING_TIER_DISTRIBUTION: 'League & Score Tier Distribution',
  HEADING_TOP_CHART: 'Enterprise Leaderboard Rankings',
  HEADING_CATEGORY_BENCHMARKS: 'Average Category Benchmarks',

  LABEL_LIMIT_TOP: 'Show',
  OPT_LIMIT_15: 'Top 15 (Default)',
  OPT_LIMIT_30: 'Top 30',
  OPT_LIMIT_50: 'Top 50',
  OPT_LIMIT_ALL: 'All Tenants',
  LABEL_USERS: 'Users',
  LABEL_BENCHMARK: 'Benchmark',
  LABEL_ADOPTION_RATE: 'Adoption Rate',
  LABEL_OVERALL_SCORE: 'Overall Score',
  LABEL_TELEMETRY_SUFFIX: 'Telemetry',
  LABEL_FLEET_UNITS: 'Tenants',

  TXT_TERRAIN_COVERAGE: 'Across Managed Tenants',
  TXT_FULL_STACK_STATUS: 'Full Stack Telemetry',

  INPUT_SEARCH_TENANTS: 'Search tenants by name, domain, industry...',
  LABEL_SORT_BY: 'Sort by',
  LABEL_FILTER_TELEMETRY: 'Telemetry Filter',
  LABEL_FILTER_TIER: 'Score League',

  OPT_SORT_SCORE_DESC: 'Overall Score (Highest First)',
  OPT_SORT_SCORE_ASC: 'Overall Score (Lowest First)',
  OPT_SORT_RANK_ASC: 'Leaderboard Rank (1 - #)',
  OPT_SORT_RANK_DESC: 'Leaderboard Rank (# - 1)',
  OPT_SORT_NAME_ASC: 'Tenant Name (A - Z)',
  OPT_SORT_NAME_DESC: 'Tenant Name (Z - A)',
  OPT_SORT_DEVICE_DESC: 'Device (Defender XDR) (Highest First)',
  OPT_SORT_DEVICE_ASC: 'Device (Defender XDR) (Lowest First)',
  OPT_SORT_IDENTITIES_DESC: 'Identities (Entra) (Highest First)',
  OPT_SORT_IDENTITIES_ASC: 'Identities (Entra) (Lowest First)',
  OPT_SORT_APPS_DESC: 'Apps (Defender for Cloud Apps) (Highest First)',
  OPT_SORT_APPS_ASC: 'Apps (Defender for Cloud Apps) (Lowest First)',
  OPT_SORT_DATA_DESC: 'Data (Purview) (Highest First)',
  OPT_SORT_DATA_ASC: 'Data (Purview) (Lowest First)',

  BTN_SORT_ORDER_DESC: 'Highest First',
  BTN_SORT_ORDER_ASC: 'Lowest First',
  BTN_SORT_ORDER_RANK_ASC: 'Rank #1 - #n',
  BTN_SORT_ORDER_RANK_DESC: 'Rank #n - #1',
  BTN_SORT_ORDER_NAME_ASC: 'A to Z',
  BTN_SORT_ORDER_NAME_DESC: 'Z to A',

  OPT_FILTER_ALL: 'All Tenants',
  OPT_FILTER_FULL_STACK: 'All Capabilities (4 Active)',
  OPT_FILTER_SENTINEL: 'Sentinel Active',
  OPT_FILTER_MDE: 'MDE Active',
  OPT_FILTER_MDI: 'MDI Active',
  OPT_FILTER_AUDIT: 'Audit Logging Active',

  OPT_TIER_ALL: 'All Leagues',
  OPT_TIER_DIAMOND: 'Diamond (90%+)',
  OPT_TIER_GOLD: 'Gold (80-89%)',
  OPT_TIER_SILVER: 'Silver (70-79%)',
  OPT_TIER_BRONZE: 'Bronze (50-69%)',
  OPT_TIER_CRITICAL: 'Critical Attention (<50%)',

  BTN_VIEW_TILES: 'Tile View',
  BTN_VIEW_TABLE: 'Table View',
  BTN_RESET_FILTERS: 'Reset All Filters',
  BTN_INSPECT_TENANT: 'Inspect Tenant',
  BTN_INSPECT: 'Inspect',
  BTN_CLOSE_MODAL: 'Close Details',
  BTN_EXPORT_TENANTS: 'Export Leaderboard (JSON)',
  BTN_EXPORT_SHORT: 'Export',
  BTN_PREVIOUS: 'Previous',
  BTN_NEXT: 'Next',
  TXT_EXPORT_SUCCESS: 'Leaderboard ranking dataset exported successfully',
  TXT_NO_TENANTS: 'No Microsoft tenants match the selected filters or search terms.',

  TXT_PAGINATION_SHOWING: 'Showing',
  TXT_PAGINATION_OF: 'of',
  TXT_PAGINATION_TENANTS: 'tenants',
  TXT_PAGE: 'Page',
  TH_RANK: 'Rank',
  TH_TENANT: 'Tenant & Domain',
  TH_SCORE: 'Score',
  TH_ACTION: 'Action',

  HEADING_COMPOSITE_SCORE: 'Terrain Security Posture Composite',
  TXT_POSTURE_SUPERIOR: 'Optimal Defense Posture',
  TXT_POSTURE_MODERATE: 'Degraded Defense Posture',
  TXT_POSTURE_CRITICAL: 'Critical Breach Vulnerability',
  LABEL_ACTIVE_TELEMETRY: 'Active Telemetry',
  STATUS_SENTINEL_ON: 'Ingesting SIEM',
  STATUS_SENTINEL_OFF: 'Not Connected',
  STATUS_MDE_ON: 'EDR Active',
  STATUS_MDE_OFF: 'No Sensor',
  STATUS_MDI_ON: 'Identity Defense',
  STATUS_MDI_OFF: 'Sensor Inactive',
  STATUS_LOG_ON: 'Audit Streaming',
  STATUS_LOG_OFF: 'Logs Disabled',
  HEADING_CATEGORY_BREAKDOWN: 'Domain Posture Vector Breakdown',
  LABEL_MDE_SENSOR: 'MDE Sensor',
  LABEL_DEFENDER_SERVERS: 'Defender for Servers',
  STATUS_ACTIVE: 'Active',
  STATUS_MISSING: 'Missing',
  STATUS_ENROLLED: 'Enrolled',
  STATUS_PENDING: 'Pending Deployment',
  LABEL_REC_IDENTITIES_CATEGORY: 'Identities (Entra)',
  LABEL_REC_SIEM_CATEGORY: 'Sentinel (SIEM)',
  LABEL_REC_AUDIT_CATEGORY: 'Data (Purview)',
  TXT_CLICK_TO_INSPECT: 'Select vector to inspect posture',
  TOOLTIP_SENTINEL_ON: 'Microsoft Sentinel: Connected & Ingesting',
  TOOLTIP_SENTINEL_OFF: 'Microsoft Sentinel: Inactive',
  TOOLTIP_MDE_ON: 'Microsoft Defender for Endpoint: Enrolled',
  TOOLTIP_MDE_OFF: 'Microsoft Defender for Endpoint: Not Deployed',
  TOOLTIP_MDI_ON: 'Microsoft Defender for Identity: Active Sensor',
  TOOLTIP_MDI_OFF: 'Microsoft Defender for Identity: Inactive',
  TOOLTIP_LOG_ON: 'Azure Log Analytics Audit Logging: Stream Active',
  TOOLTIP_LOG_OFF: 'Azure Log Analytics Audit Logging: Disabled',
  TOOLTIP_RANK_1: 'Gold (#1)',
  TOOLTIP_RANK_2: 'Silver (#2)',
  TOOLTIP_RANK_3: 'Bronze (#3)',
  TIER_DIAMOND: 'Diamond Tier',
  TIER_GOLD: 'Gold Tier',
  TIER_SILVER: 'Silver Tier',
  TIER_BRONZE: 'Bronze Tier',
  TIER_CRITICAL: 'Critical Attention Posture',
  FILE_EXPORT_TENANTS_JSON: 'microsoft-tenant-secure-scores.json',
  FILE_EXPORT_SENTINEL_JSON_PREFIX: 'microsoft-sentinel-incidents-',
} as const;
```

---

## 7. Verification & Implementation Checklist

To re-implement or verify this functionality cleanly:

1. **Verify Canonical Data & Types**:
   - Ensure `src/data/tenants.json` contains valid tenant objects matching `TenantRecord`.
   - Ensure `ALL_TENANTS`, `TOTAL_TELEMETRY_SIGNALS`, and `TIER_CONFIG` are exported from `src/constants.ts`.
2. **Utilities & Custom Hooks**:
   - Implement `getActiveSignalCount` and `getTierForScore` in `src/lib/utils.ts`.
   - Implement `useEscapeKey` in `src/hooks/useEscapeKey.ts`.
3. **Strings Consolidation**:
   - Ensure all keys listed in Section 6 exist in `src/strings.ts` under `APP_STRINGS.VIEWS.MICROSOFT`.
4. **Component Implementation**:
   - Build `TenantCard.tsx` with status bubbles positioned directly above category bars.
   - Build `TenantDetailModal.tsx` with outside-click backdrop div, `useEscapeKey`, and declarative mappings.
   - Build `TenantLeaderboardChart.tsx` with bar chart limit dropdown, score league histogram, and category benchmarks.
   - Build `MicrosoftView.tsx` with HeaderSlot injection, height-aligned Overview and Top 3 Leaderboard, 3 tabs,
     filter/sort toolbar, and pagination.
5. **Quality Gates**:
   - Execute `pnpm run lint` (`tsc --noEmit`) to confirm zero compilation or type errors.
   - Execute `pnpm build` to confirm production asset bundle creation.
   - Execute `pnpm run md:lint` to verify markdown syntax compliance.
