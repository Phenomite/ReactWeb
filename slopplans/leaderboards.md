# Implementation Plan: Toast Duration Extension & Microsoft Secure Score 200-Tenant Gamified Leaderboard

Extend the application toast notification durations and completely transform the Microsoft Security view into a gamified, interactive Secure Score ranking system evaluating 200 realistic enterprise tenants stored in JSON.

## User Review Required

> [!IMPORTANT]
> - **Toast Duration**: The default toast duration will be increased from **3.5 seconds (3,500 ms)** to **7.0 seconds (7,000 ms)**, accompanied by pause-on-hover capability and an animated progress indicator so users have ample time to read notices.
> - **Microsoft View Replacement**: The existing MSRC CVE radar and mock incident triage in `MicrosoftView.tsx` will be replaced with the comprehensive 200-tenant Secure Score Gamification Hub and Leaderboard, fully satisfying the prompt's specifications.

## Proposed Changes

### Core Configuration & Toast System

#### [MODIFY] [constants.ts](src/constants.ts)
- Update `TOAST_CONFIG.DEFAULT_DURATION_MS` from `3500` to `7000`.

#### [MODIFY] [ToastContainer.tsx](src/components/ToastContainer.tsx)
- Add pause-on-hover interaction (`onMouseEnter` / `onMouseLeave`) to individual toasts.
- Add an animated countdown indicator bar at the bottom of each toast card, visually communicating the remaining display duration.

---

### Data Models & 200 Tenants Dataset

#### [NEW] [tenants.json](src/data/tenants.json)
- Store an array of 200 realistic enterprise tenant records with:
  - Unique tenant ID, name (e.g. Contoso Global, Fabrikam Cloud, Woodgrove Financial, etc.), domain, industry, and seat count.
  - **4 Service Status Bubbles**:
    - `sentinel`: boolean (Microsoft Sentinel)
    - `mde`: boolean (Microsoft Defender for Endpoint)
    - `mdi`: boolean (Microsoft Defender for Identity)
    - `logAnalytics`: boolean (Azure Log Analytics Audit Logging)
  - **4 Secure Score Categories**:
    - `device`: score percentage (MDE driven)
    - `identities`: score percentage (from Entra)
    - `apps`: score percentage (Defender for Cloud Apps)
    - `data`: score percentage (governance through Purview)
  - **Overall Score**: Weighted composite score (0-100%) and calculated rank (#1 to #200).

#### [MODIFY] [types.ts](src/types.ts)
- Export interfaces: `TenantStatusBubbles`, `TenantScoreCategories`, `TenantRecord`, `TenantFilterOptions`, and `TenantSortOption`.

---

### UI Components & Microsoft View Transformation

#### [NEW] [TenantCard.tsx](src/components/TenantCard.tsx)
- Reusable tile component rendering:
  - Header: Rank badge (#1, #2, #3 podium badges with gold/silver/bronze styling or standard rank badge), organization name, primary domain, industry, and overall score pill.
  - **Status Bubbles Row (positioned directly above the score categories)**:
    - 4 distinct service bubbles with active/inactive indicators:
      - Sentinel
      - MDE
      - MDI
      - Audit Logging
  - **Secure Score Categories**:
    - Device (`MDE driven`)
    - Identities (`from Entra`)
    - Apps (`Defender for Cloud Apps`)
    - Data (`governance through Purview`)
    - Each with its progress bar, score %, and visual indicator.
  - Quick action to open full tenant inspection modal.

#### [NEW] [TenantLeaderboardChart.tsx](src/components/TenantLeaderboardChart.tsx)
- Custom interactive SVG/Tailwind chart component featuring:
  - **Score Distribution Histogram**: Tier breakdown (Diamond 90%+, Gold 80-89%, Silver 70-79%, Bronze 50-69%, Critical <50%) with clickable bars that filter the tile list.
  - **Top 15 Leaderboard Bar Chart**: Horizontal bar chart comparing top tenants by Overall Score with hover tooltips and category breakdown.
  - **Category Benchmark Gauges**: Average performance across Device, Identities, Apps, and Data.

#### [NEW] [TenantDetailModal.tsx](src/components/TenantDetailModal.tsx)
- Modal dialog opened when clicking a tenant tile or chart item, displaying detailed gamification badges, recommended score improvement actions, and integration statuses.

#### [MODIFY] [MicrosoftView.tsx](src/views/MicrosoftView.tsx)
- Replace previous incident/CVE layout with:
  - Top Gamification Banner & Global KPI stats (Top 3 Podium, Average Score, Telemetry Adoption Rates).
  - Interactive Charting & Tier Distribution.
  - Search and Filter Toolbar (by Name, Domain, Industry, Service Bubbles, and Score Tiers).
  - Responsive Grid of Tenant Tiles (with page size selection and pagination for all 200 tenants).
  - Alternative Leaderboard Table view toggle for quick scanning.

#### [MODIFY] [strings.ts](src/strings.ts)
- Update `APP_STRINGS.VIEWS.MICROSOFT` to include component-first strings for tenant ranking, status bubbles, score categories, gamification tiers, filters, and charts.

---

## Verification Plan

### Automated Tests & Linting
- Run `pnpm run lint` (`tsc --noEmit`) to guarantee strict TypeScript compliance with zero errors.
- Run `pnpm run build` to verify production bundle generation and asset compilation.

### Manual & Interactive Verification
- Launch local development server (`pnpm dev`) or preview.
- Verify toast notifications:
  - Test toast triggers from Settings and theme toggle; ensure they stay visible for 7 seconds.
  - Hover over a toast to verify pause-on-hover behavior and visual countdown progress bar.
- Verify Microsoft View:
  - Inspect ranking across 200 tenants.
  - Confirm status bubbles (Sentinel, MDE, MDI, Audit Logging) appear above the secure score categories on each tile.
  - Confirm all 4 categories (Device, Identities, Apps, Data) are accurately represented with progress bars.
  - Test gamified charting (distribution histogram and leaderboard chart).
  - Test search, sorting, and filter toggles.
  - Verify dark mode rendering and responsive mobile layout.
