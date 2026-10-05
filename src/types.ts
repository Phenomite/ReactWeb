import type { ComponentType } from 'react';

// Unified view definition with routing metadata and component
export interface ViewDefinition {
  id: string;
  title: string;
  hash: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType;
  hideInSidebar?: boolean;
}

// Toast notification message format
export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string | undefined;
  type: ToastType;
  durationMs?: number | undefined;
}

// Toast notification context state and triggers
export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (title: string, options?: { description?: string; type?: ToastType; durationMs?: number }) => string;
  dismissToast: (id: string) => void;
}

// Supported application theme mode options
export type ThemeMode = 'light' | 'dark' | 'ocean';

export interface ThemeOption {
  id: ThemeMode;
  label: string;
}

// Curated accent color identifiers
export type AccentColor = 'blue' | 'violet' | 'emerald' | 'rose' | 'amber';

export interface AccentOption {
  id: AccentColor;
  label: string;
  colorHex: string;
  activeClass: string;
}

// Command palette searchable action item
export interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

// Security incident severity levels and lifecycle status
type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IncidentStatus = 'active' | 'investigating' | 'resolved';

// Client-side security incident telemetry record
export interface SecurityIncident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: string;
  source: string;
  timestamp: number;
  description: string;
  recommendation: string;
}

// Security incident context state and methods
export interface SecurityIncidentContextType {
  incidents: SecurityIncident[];
  unresolvedCount: number;
  logIncident: (incident: Omit<SecurityIncident, 'id' | 'timestamp'>) => void;
  updateStatus: (id: string, status: IncidentStatus) => void;
  simulateThreatSignal: () => void;
  exportSentinelLog: () => void;
}

// Security service telemetry bubbles present above score categories
export interface TenantStatusBubbles {
  sentinel: boolean; // Microsoft Sentinel
  mde: boolean; // Microsoft Defender for Endpoint
  mdi: boolean; // Microsoft Defender for Identity
  logAnalytics: boolean; // Azure Log Analytics Audit Logging
}

// Microsoft Secure Score category breakdowns
export interface TenantScoreCategories {
  device: number; // Device (Defender XDR)
  identities: number; // Identities (Entra)
  apps: number; // Apps (Defender for Cloud Apps)
  data: number; // Data (Purview)
}

// Tenant record for Microsoft Secure Score leaderboard
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
  version?: number;
  lastUpdatedBy?: string;
  updatedAt?: number;
}

// Tenant sorting fields and directions
export type TenantSortField = 'overallScore' | 'device' | 'identities' | 'apps' | 'data' | 'name' | 'rank';
export type TenantSortOrder = 'asc' | 'desc';

// Score gamification leagues / tiers
export type TenantScoreTier = 'all' | 'diamond' | 'gold' | 'silver' | 'bronze' | 'critical';

// Real-time SSE connection lifecycle state
export type RealtimeConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'offline';

// Configuration options for data-agnostic entity updates
export interface DataUpdateOptions<T = Record<string, unknown>> {
  /** Expected version for Optimistic Concurrency Control (OCC) */
  expectedVersion?: number | undefined;
  /** HTTP method: 'PATCH' (default), 'POST', or 'PUT' */
  method?: 'PATCH' | 'POST' | 'PUT' | undefined;
  /** Custom API endpoint override */
  endpoint?: string | undefined;
  /** Optimistic updater callback applied to local state before server response */
  optimisticUpdate?: ((current: T[]) => T[]) | undefined;
  /** Custom toast message on success (or false to suppress notification) */
  successMessage?: string | false | undefined;
  /** Admin username or caller attribution */
  updatedBy?: string | undefined;
}

// Standardized result payload returned by data-agnostic update operations
export interface DataUpdateResult<T = Record<string, unknown>> {
  success: boolean;
  data?: T | undefined;
  conflict?: boolean | undefined;
  current?: T | undefined;
  error?: string | undefined;
}

// Real-time synchronizer context state and dispatch methods
export interface RealtimeContextType {
  status: RealtimeConnectionStatus;
  isLive: boolean;
  activeVisitors: number;
  tenants: TenantRecord[];
  incidents: SecurityIncident[];
  entities: Record<string, Record<string, unknown>>;
  lastSyncTime: number | null;
  /** Data-agnostic update function that scales to any database entity */
  updateData: <T = Record<string, unknown>>(
    resource: string,
    id: string,
    updates: Partial<T> | Record<string, unknown>,
    options?: DataUpdateOptions<T>,
  ) => Promise<DataUpdateResult<T>>;
  /** Retrieve all records for any resource collection dynamically */
  getResourceData: <T = unknown>(resource: string) => T[];
  /** Retrieve a single record from any resource collection dynamically */
  getResourceRecord: <T = unknown>(resource: string, id: string) => T | undefined;
  updateTenantScore: (id: string, score: number, categories?: Partial<TenantScoreCategories>) => Promise<boolean>;
  publishTenantUpdate: (
    id: string,
    updates: Partial<TenantRecord>,
    expectedVersion?: number | undefined,
  ) => Promise<{ success: boolean; conflict?: boolean | undefined; current?: TenantRecord | undefined }>;
  simulateThreatSignal: () => Promise<boolean>;
  updateIncidentStatus: (id: string, status: IncidentStatus) => Promise<boolean>;
  triggerTelemetryPulse: () => Promise<boolean>;
}
