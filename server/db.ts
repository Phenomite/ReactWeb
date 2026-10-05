import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { SecurityIncident, TenantRecord, TenantScoreCategories, TenantStatusBubbles } from '../src/types';

// Database path resolution with environment override for Kubernetes PVC
const DB_DIR = process.env['DATA_DIR'] || join(import.meta.dir, '../data');
mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = process.env['DATABASE_URL'] || join(DB_DIR, 'reactweb.db');

const TABLE_IDENTIFIER_REGEX = /^[a-zA-Z0-9_]+$/;

const db = new Database(DB_PATH, { create: true });

// Configure SQLite for high concurrency and zero-loss durability
db.run('PRAGMA journal_mode = WAL;');
db.run('PRAGMA synchronous = NORMAL;');
db.run('PRAGMA foreign_keys = ON;');
db.run('PRAGMA busy_timeout = 5000;');

db.run(`
  CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    industry TEXT NOT NULL,
    region TEXT NOT NULL,
    seatCount INTEGER NOT NULL,
    sentinel INTEGER NOT NULL DEFAULT 0,
    mde INTEGER NOT NULL DEFAULT 0,
    mdi INTEGER NOT NULL DEFAULT 0,
    logAnalytics INTEGER NOT NULL DEFAULT 0,
    device REAL NOT NULL DEFAULT 0,
    identities REAL NOT NULL DEFAULT 0,
    apps REAL NOT NULL DEFAULT 0,
    data REAL NOT NULL DEFAULT 0,
    overallScore REAL NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    lastUpdatedBy TEXT NOT NULL DEFAULT 'system',
    updatedAt INTEGER NOT NULL
  );
`);

db.run('CREATE INDEX IF NOT EXISTS idx_tenants_score ON tenants (overallScore DESC);');
db.run('CREATE INDEX IF NOT EXISTS idx_tenants_rank ON tenants (rank ASC);');

db.run(`
  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    category TEXT NOT NULL,
    source TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL
  );
`);

db.run('CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);');
db.run('CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON incidents (timestamp DESC);');

db.run(`
  CREATE TABLE IF NOT EXISTS site_metrics (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt INTEGER NOT NULL
  );
`);

// Migration safety: Ensure version and lastUpdatedBy columns exist on pre-existing tables
try {
  const columns = (db.query('PRAGMA table_info(tenants)').all() as Array<{ name: string }>).map((c) => c.name);
  if (!columns.includes('version')) {
    db.run('ALTER TABLE tenants ADD COLUMN version INTEGER NOT NULL DEFAULT 1');
  }
  if (!columns.includes('lastUpdatedBy')) {
    db.run("ALTER TABLE tenants ADD COLUMN lastUpdatedBy TEXT NOT NULL DEFAULT 'system'");
  }
} catch {
  // Columns already present
}

// Cached statements via db.query()
const stmtInsertTenant = db.query(`
  INSERT INTO tenants (
    id, name, domain, industry, region, seatCount,
    sentinel, mde, mdi, logAnalytics,
    device, identities, apps, data,
    overallScore, rank, version, lastUpdatedBy, updatedAt
  ) VALUES (
    $id, $name, $domain, $industry, $region, $seatCount,
    $sentinel, $mde, $mdi, $logAnalytics,
    $device, $identities, $apps, $data,
    $overallScore, $rank, $version, $lastUpdatedBy, $updatedAt
  )
`);

const stmtSelectAllTenants = db.query(`
  SELECT * FROM tenants ORDER BY rank ASC
`);

const stmtSelectTenantById = db.query(`
  SELECT * FROM tenants WHERE id = ?
`);

const stmtRecalculateRanks = db.query(`
  WITH Ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY overallScore DESC) as newRank
    FROM tenants
  )
  UPDATE tenants
  SET rank = (SELECT newRank FROM Ranked WHERE Ranked.id = tenants.id)
`);

const stmtSelectAllIncidents = db.query(`
  SELECT * FROM incidents ORDER BY timestamp DESC
`);

const stmtSelectIncidentById = db.query(`
  SELECT * FROM incidents WHERE id = ?
`);

const stmtInsertIncident = db.query(`
  INSERT INTO incidents (
    id, title, severity, status, category, source, timestamp, description, recommendation
  ) VALUES (
    $id, $title, $severity, $status, $category, $source, $timestamp, $description, $recommendation
  )
`);

const stmtUpdateIncidentStatus = db.query(`
  UPDATE incidents
  SET status = ?
  WHERE id = ?
`);

const stmtUpdateTenant = db.query(`
  UPDATE tenants
  SET overallScore = $overallScore,
      device = $device,
      identities = $identities,
      apps = $apps,
      data = $data,
      seatCount = $seatCount,
      sentinel = $sentinel,
      mde = $mde,
      mdi = $mdi,
      logAnalytics = $logAnalytics,
      version = $version,
      lastUpdatedBy = $lastUpdatedBy,
      updatedAt = $updatedAt
  WHERE id = $id
`);

const stmtBatchUpdateTenant = db.query(`
  UPDATE tenants
  SET overallScore = $overallScore,
      device = $device,
      identities = $identities,
      apps = $apps,
      data = $data,
      sentinel = $sentinel,
      mde = $mde,
      mdi = $mdi,
      logAnalytics = $logAnalytics,
      version = version + 1,
      lastUpdatedBy = $lastUpdatedBy,
      updatedAt = $updatedAt
  WHERE id = $id
`);

const stmtCountTenants = db.query('SELECT COUNT(*) as count FROM tenants');
const stmtCountIncidents = db.query('SELECT COUNT(*) as count FROM incidents');
const stmtAvgScore = db.query('SELECT AVG(overallScore) as avgScore FROM tenants');

interface RawTenantRow {
  id: string;
  name: string;
  domain: string;
  industry: string;
  region: string;
  seatCount: number;
  sentinel: number;
  mde: number;
  mdi: number;
  logAnalytics: number;
  device: number;
  identities: number;
  apps: number;
  data: number;
  overallScore: number;
  rank: number;
  version: number;
  lastUpdatedBy: string;
  updatedAt: number;
}

interface RawIncidentRow {
  id: string;
  title: string;
  severity: SecurityIncident['severity'];
  status: SecurityIncident['status'];
  category: string;
  source: string;
  timestamp: number;
  description: string;
  recommendation: string;
}

// Map database row to TenantRecord format
function rowToTenant(row: RawTenantRow): TenantRecord {
  return {
    id: row.id,
    name: row.name,
    domain: row.domain,
    industry: row.industry,
    region: row.region,
    seatCount: row.seatCount,
    statusBubbles: {
      sentinel: Boolean(row.sentinel),
      mde: Boolean(row.mde),
      mdi: Boolean(row.mdi),
      logAnalytics: Boolean(row.logAnalytics),
    },
    categories: {
      device: row.device,
      identities: row.identities,
      apps: row.apps,
      data: row.data,
    },
    overallScore: row.overallScore,
    rank: row.rank,
    version: row.version ?? 1,
    lastUpdatedBy: row.lastUpdatedBy ?? 'system',
    updatedAt: row.updatedAt,
  };
}

const seedTenantsTx = db.transaction((tenants: TenantRecord[], now: number) => {
  for (const t of tenants) {
    stmtInsertTenant.run({
      $id: t.id,
      $name: t.name,
      $domain: t.domain,
      $industry: t.industry,
      $region: t.region,
      $seatCount: t.seatCount,
      $sentinel: t.statusBubbles.sentinel ? 1 : 0,
      $mde: t.statusBubbles.mde ? 1 : 0,
      $mdi: t.statusBubbles.mdi ? 1 : 0,
      $logAnalytics: t.statusBubbles.logAnalytics ? 1 : 0,
      $device: t.categories.device,
      $identities: t.categories.identities,
      $apps: t.categories.apps,
      $data: t.categories.data,
      $overallScore: t.overallScore,
      $rank: t.rank,
      $version: 1,
      $lastUpdatedBy: 'system_seed',
      $updatedAt: now,
    });
  }
});

const seedIncidentsTx = db.transaction((incidents: SecurityIncident[]) => {
  for (const inc of incidents) {
    stmtInsertIncident.run({
      $id: inc.id,
      $title: inc.title,
      $severity: inc.severity,
      $status: inc.status,
      $category: inc.category,
      $source: inc.source,
      $timestamp: inc.timestamp,
      $description: inc.description,
      $recommendation: inc.recommendation,
    });
  }
});

// Seed initial tenants and incidents if database is empty
export async function seedDatabaseIfEmpty(): Promise<void> {
  const countRow = stmtCountTenants.get() as { count: number } | undefined;
  const tenantCount = countRow?.count ?? 0;
  if (tenantCount === 0) {
    const tenantsJsonPath = join(import.meta.dir, '../src/data/tenants.json');
    const tenantsFile = Bun.file(tenantsJsonPath);
    if (await tenantsFile.exists()) {
      const rawData = (await tenantsFile.json()) as TenantRecord[];
      const now = Date.now();
      seedTenantsTx.immediate(rawData, now);
    }
  }

  const incidentCountRow = stmtCountIncidents.get() as { count: number } | undefined;
  const incidentCount = incidentCountRow?.count ?? 0;
  if (incidentCount === 0) {
    const initialIncidents: SecurityIncident[] = [
      {
        id: 'inc-101',
        title: 'Anomalous API Rate Threshold Exceeded',
        severity: 'high',
        status: 'active',
        category: 'Traffic Anomaly',
        source: 'Rate Limiter Service',
        timestamp: Date.now() - 1000 * 60 * 18,
        description: 'Multiple rapid mutation requests detected from external IP violating rate limit threshold.',
        recommendation: 'Inspect source IP address and verify rate-limiting rules.',
      },
      {
        id: 'inc-102',
        title: 'Local Storage Security Boundary Reset',
        severity: 'medium',
        status: 'investigating',
        category: 'Data Integrity',
        source: 'Storage Management API',
        timestamp: Date.now() - 1000 * 60 * 65,
        description:
          'Complete cache flush invoked via client administration trigger outside of scheduled maintenance windows.',
        recommendation: 'Verify administrator audit trail and inspect state persistence.',
      },
      {
        id: 'inc-103',
        title: 'Ingress TLS Certificate Renewal Scheduled',
        severity: 'low',
        status: 'resolved',
        category: 'Transport Security',
        source: 'Certificate Manager',
        timestamp: Date.now() - 1000 * 60 * 180,
        description: 'Edge TLS certificate renewal automatically negotiated via ACME challenge before 30-day window.',
        recommendation: 'Certificate successfully renewed; no further administrative action required.',
      },
    ];

    seedIncidentsTx.immediate(initialIncidents);
  }
}

// Read queries
export function getAllTenants(): TenantRecord[] {
  const rows = stmtSelectAllTenants.all() as RawTenantRow[];
  return rows.map(rowToTenant);
}

export function getTenantById(id: string): TenantRecord | null {
  const row = stmtSelectTenantById.get(id) as RawTenantRow | undefined;
  return row ? rowToTenant(row) : null;
}

interface TenantUpdatePayload {
  overallScore?: number;
  seatCount?: number;
  statusBubbles?: Partial<TenantStatusBubbles>;
  categories?: Partial<TenantScoreCategories>;
}

interface TenantUpdateResult {
  success?: boolean;
  notFound?: boolean;
  conflict?: boolean;
  current?: TenantRecord | null;
  tenant?: TenantRecord | null;
}

const publishTenantTx = db.transaction(
  (id: string, updates: TenantUpdatePayload, expectedVersion: number | null, updatedBy: string): TenantUpdateResult => {
    const existing = stmtSelectTenantById.get(id) as RawTenantRow | undefined;
    if (!existing) {
      return { notFound: true };
    }

    // Check optimistic concurrency conflict
    if (expectedVersion !== null && expectedVersion !== undefined && existing.version !== expectedVersion) {
      return {
        conflict: true,
        current: rowToTenant(existing),
      };
    }

    const nextScore = typeof updates.overallScore === 'number' ? updates.overallScore : existing.overallScore;
    const nextDevice = updates.categories?.device ?? existing.device;
    const nextIdentities = updates.categories?.identities ?? existing.identities;
    const nextApps = updates.categories?.apps ?? existing.apps;
    const nextData = updates.categories?.data ?? existing.data;
    const nextSeatCount = typeof updates.seatCount === 'number' ? updates.seatCount : existing.seatCount;

    const nextSentinel =
      updates.statusBubbles?.sentinel !== undefined ? (updates.statusBubbles.sentinel ? 1 : 0) : existing.sentinel;
    const nextMde = updates.statusBubbles?.mde !== undefined ? (updates.statusBubbles.mde ? 1 : 0) : existing.mde;
    const nextMdi = updates.statusBubbles?.mdi !== undefined ? (updates.statusBubbles.mdi ? 1 : 0) : existing.mdi;
    const nextLog =
      updates.statusBubbles?.logAnalytics !== undefined
        ? updates.statusBubbles.logAnalytics
          ? 1
          : 0
        : existing.logAnalytics;

    const hasChanges =
      nextScore !== existing.overallScore ||
      nextDevice !== existing.device ||
      nextIdentities !== existing.identities ||
      nextApps !== existing.apps ||
      nextData !== existing.data ||
      nextSeatCount !== existing.seatCount ||
      nextSentinel !== existing.sentinel ||
      nextMde !== existing.mde ||
      nextMdi !== existing.mdi ||
      nextLog !== existing.logAnalytics;

    // Save write if no actual fields were updated
    if (!hasChanges) {
      return {
        success: true,
        tenant: rowToTenant(existing),
      };
    }

    const nextVersion = (existing.version || 1) + 1;
    const now = Date.now();

    stmtUpdateTenant.run({
      $overallScore: nextScore,
      $device: nextDevice,
      $identities: nextIdentities,
      $apps: nextApps,
      $data: nextData,
      $seatCount: nextSeatCount,
      $sentinel: nextSentinel,
      $mde: nextMde,
      $mdi: nextMdi,
      $logAnalytics: nextLog,
      $version: nextVersion,
      $lastUpdatedBy: updatedBy,
      $updatedAt: now,
      $id: id,
    });

    if (nextScore !== existing.overallScore) {
      stmtRecalculateRanks.run();
    }

    return {
      success: true,
      tenant: getTenantById(id),
    };
  },
);

// Multi-operator safe tenant update with optimistic concurrency control
function publishTenantUpdate(
  id: string,
  updates: TenantUpdatePayload = {},
  expectedVersion: number | null = null,
  updatedBy = 'admin',
): TenantUpdateResult {
  return publishTenantTx.immediate(id, updates, expectedVersion, updatedBy);
}

// Legacy simple score update
export function updateTenantScore(
  id: string,
  overallScore: number,
  categories: Partial<TenantScoreCategories> = {},
  updatedBy = 'system',
): TenantRecord | null {
  const result = publishTenantUpdate(id, { overallScore, categories }, null, updatedBy);
  return result.tenant ?? null;
}

export interface BatchTenantItem {
  id: string;
  overallScore?: number;
  categories?: Partial<TenantScoreCategories>;
  statusBubbles?: Partial<TenantStatusBubbles>;
}

export interface BatchUpdateResult {
  updatedCount: number;
  tenants: TenantRecord[];
  timestamp: number;
}

const batchUpdateTx = db.transaction(
  (updates: BatchTenantItem[] | null, updatedBy: string, now: number): { updatedCount: number } => {
    let updatedCount = 0;

    if (Array.isArray(updates)) {
      if (updates.length === 0) {
        return { updatedCount: 0 };
      }

      for (const u of updates) {
        const existing = stmtSelectTenantById.get(u.id) as RawTenantRow | undefined;
        if (!existing) continue;

        const score = typeof u.overallScore === 'number' ? u.overallScore : existing.overallScore;
        const dev = u.categories?.device ?? existing.device;
        const iden = u.categories?.identities ?? existing.identities;
        const app = u.categories?.apps ?? existing.apps;
        const dat = u.categories?.data ?? existing.data;

        const sent = u.statusBubbles?.sentinel !== undefined ? (u.statusBubbles.sentinel ? 1 : 0) : existing.sentinel;
        const mde = u.statusBubbles?.mde !== undefined ? (u.statusBubbles.mde ? 1 : 0) : existing.mde;
        const mdi = u.statusBubbles?.mdi !== undefined ? (u.statusBubbles.mdi ? 1 : 0) : existing.mdi;
        const log =
          u.statusBubbles?.logAnalytics !== undefined ? (u.statusBubbles.logAnalytics ? 1 : 0) : existing.logAnalytics;

        const hasChange =
          score !== existing.overallScore ||
          dev !== existing.device ||
          iden !== existing.identities ||
          app !== existing.apps ||
          dat !== existing.data ||
          sent !== existing.sentinel ||
          mde !== existing.mde ||
          mdi !== existing.mdi ||
          log !== existing.logAnalytics;

        if (!hasChange) {
          continue;
        }

        stmtBatchUpdateTenant.run({
          $overallScore: score,
          $device: dev,
          $identities: iden,
          $apps: app,
          $data: dat,
          $sentinel: sent,
          $mde: mde,
          $mdi: mdi,
          $logAnalytics: log,
          $lastUpdatedBy: updatedBy,
          $updatedAt: now,
          $id: u.id,
        });
        updatedCount += 1;
      }
    } else {
      // Automatic realistic random perturbation across all tenants
      const allRows = stmtSelectAllTenants.all() as RawTenantRow[];
      for (const row of allRows) {
        const delta = Math.round((Math.random() * 3 - 1.5) * 10) / 10;
        const newScore = Math.min(100, Math.max(10, Math.round((row.overallScore + delta) * 10) / 10));

        const newDev = Math.min(100, Math.max(10, Math.round((row.device + (Math.random() * 2 - 1)) * 10) / 10));
        const newIden = Math.min(100, Math.max(10, Math.round((row.identities + (Math.random() * 2 - 1)) * 10) / 10));
        const newApp = Math.min(100, Math.max(10, Math.round((row.apps + (Math.random() * 2 - 1)) * 10) / 10));
        const newData = Math.min(100, Math.max(10, Math.round((row.data + (Math.random() * 2 - 1)) * 10) / 10));

        const sent = Math.random() < 0.05 ? (row.sentinel ? 0 : 1) : row.sentinel;
        const mde = Math.random() < 0.05 ? (row.mde ? 0 : 1) : row.mde;
        const mdi = Math.random() < 0.05 ? (row.mdi ? 0 : 1) : row.mdi;
        const log = Math.random() < 0.05 ? (row.logAnalytics ? 0 : 1) : row.logAnalytics;

        stmtBatchUpdateTenant.run({
          $overallScore: newScore,
          $device: newDev,
          $identities: newIden,
          $apps: newApp,
          $data: newData,
          $sentinel: sent,
          $mde: mde,
          $mdi: mdi,
          $logAnalytics: log,
          $lastUpdatedBy: updatedBy,
          $updatedAt: now,
          $id: row.id,
        });
        updatedCount += 1;
      }
    }

    if (updatedCount > 0) {
      stmtRecalculateRanks.run();
    }
    return { updatedCount };
  },
);

// Batch update from in-cluster telemetry generators or CronJobs
export function batchUpdateTenants(
  updates: BatchTenantItem[] | null = null,
  updatedBy = 'k8s-telemetry-generator',
): BatchUpdateResult {
  const now = Date.now();
  const { updatedCount } = batchUpdateTx.immediate(updates, updatedBy, now);

  return {
    updatedCount,
    tenants: getAllTenants(),
    timestamp: now,
  };
}

export function getAllIncidents(): SecurityIncident[] {
  const rows = stmtSelectAllIncidents.all() as RawIncidentRow[];
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    severity: row.severity,
    status: row.status,
    category: row.category,
    source: row.source,
    timestamp: row.timestamp,
    description: row.description,
    recommendation: row.recommendation,
  }));
}

export function addIncident(incident: Partial<SecurityIncident>): SecurityIncident {
  const id = incident.id || `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = incident.timestamp || Date.now();
  const severity = incident.severity || 'medium';
  const status = incident.status || 'active';
  const category = incident.category || 'General';
  const source = incident.source || 'Sentinel Engine';
  const title = incident.title || 'Untitled Incident';
  const description = incident.description || '';
  const recommendation = incident.recommendation || '';

  stmtInsertIncident.run({
    $id: id,
    $title: title,
    $severity: severity,
    $status: status,
    $category: category,
    $source: source,
    $timestamp: timestamp,
    $description: description,
    $recommendation: recommendation,
  });

  return {
    id,
    title,
    severity,
    status,
    category,
    source,
    timestamp,
    description,
    recommendation,
  };
}

const updateIncidentStatusTx = db.transaction(
  (id: string, status: SecurityIncident['status']): { id: string; status: SecurityIncident['status'] } | null => {
    const existing = stmtSelectIncidentById.get(id) as RawIncidentRow | undefined;
    if (!existing) {
      return null;
    }
    if (existing.status === status) {
      return { id, status };
    }
    stmtUpdateIncidentStatus.run(status, id);
    return { id, status };
  },
);

export function updateIncidentStatus(
  id: string,
  status: SecurityIncident['status'],
): { id: string; status: SecurityIncident['status'] } | null {
  return updateIncidentStatusTx.immediate(id, status);
}

export interface GenericUpdateResult {
  success?: boolean;
  notFound?: boolean;
  conflict?: boolean;
  error?: string;
  current?: Record<string, unknown> | TenantRecord | null;
  record?: Record<string, unknown> | TenantRecord | null;
  tenant?: TenantRecord | null;
}

// Data-agnostic record updater scaling across any database table in SQLite
export function updateGenericRecord(
  tableName: string,
  id: string,
  updates: Record<string, unknown> = {},
  expectedVersion: number | null = null,
  updatedBy = 'admin',
): GenericUpdateResult {
  if (!TABLE_IDENTIFIER_REGEX.test(tableName)) {
    throw new Error('Invalid table identifier');
  }

  if (tableName === 'tenants') {
    const res = publishTenantUpdate(id, updates as TenantUpdatePayload, expectedVersion, updatedBy);
    return {
      ...res,
      record: res.tenant ?? null,
    };
  }

  const columnsInfo = db.query(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  if (columnsInfo.length === 0) {
    return { notFound: true, error: `Table '${tableName}' does not exist` };
  }

  const columnSet = new Set(columnsInfo.map((c) => c.name));
  interface GenericRecordRow {
    version?: number;
    [key: string]: unknown;
  }

  const updateGenericTx = db.transaction((): GenericUpdateResult => {
    const existing = db.query(`SELECT * FROM ${tableName} WHERE id = ?`).get(id) as GenericRecordRow | undefined;

    if (!existing) {
      return { notFound: true };
    }

    if (columnSet.has('version') && expectedVersion !== null && expectedVersion !== undefined) {
      if (existing.version !== expectedVersion) {
        return {
          conflict: true,
          current: existing,
        };
      }
    }

    const assignments: string[] = [];
    const params: SQLQueryBindings[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && columnSet.has(key) && TABLE_IDENTIFIER_REGEX.test(key)) {
        if (existing[key] !== value) {
          assignments.push(`${key} = ?`);
          params.push(value as SQLQueryBindings);
        }
      }
    }

    // If nothing changed, return existing record early to save unnecessary write and version bump
    if (assignments.length === 0) {
      return {
        success: true,
        record: existing,
      };
    }

    if (columnSet.has('version')) {
      assignments.push('version = version + 1');
    }
    if (columnSet.has('updatedAt')) {
      assignments.push('updatedAt = ?');
      params.push(Date.now());
    }
    if (columnSet.has('lastUpdatedBy')) {
      assignments.push('lastUpdatedBy = ?');
      params.push(updatedBy);
    }

    params.push(id);
    // Use db.prepare() instead of db.query() for dynamic SQL to avoid polluting Bun's statement cache
    db.prepare(`UPDATE ${tableName} SET ${assignments.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.query(`SELECT * FROM ${tableName} WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
    return {
      success: true,
      record: updated ?? null,
    };
  });

  return updateGenericTx.immediate();
}

export interface DatabaseStats {
  tenantCount: number;
  incidentCount: number;
  avgScore: number;
  dbPath: string;
}

export function getDatabaseStats(): DatabaseStats {
  const tenantRow = stmtCountTenants.get() as { count: number } | undefined;
  const incidentRow = stmtCountIncidents.get() as { count: number } | undefined;
  const avgRow = stmtAvgScore.get() as { avgScore: number | null } | undefined;

  return {
    tenantCount: tenantRow?.count ?? 0,
    incidentCount: incidentRow?.count ?? 0,
    avgScore: avgRow?.avgScore ? Math.round(avgRow.avgScore * 10) / 10 : 0,
    dbPath: DB_PATH,
  };
}
