import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path resolution with environment override for Kubernetes PVC
const DB_DIR = process.env.DATA_DIR || join(__dirname, '../data');
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}
const DB_PATH = process.env.DATABASE_URL || join(DB_DIR, 'reactweb.db');

export const db = new DatabaseSync(DB_PATH);

// Configure SQLite for high concurrency and zero-loss durability
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

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

  CREATE INDEX IF NOT EXISTS idx_tenants_score ON tenants (overallScore DESC);
  CREATE INDEX IF NOT EXISTS idx_tenants_rank ON tenants (rank ASC);

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

  CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
  CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON incidents (timestamp DESC);

  CREATE TABLE IF NOT EXISTS site_metrics (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt INTEGER NOT NULL
  );
`);

// Migration safety: Ensure version and lastUpdatedBy columns exist on pre-existing tables
try {
  const columns = db.prepare('PRAGMA table_info(tenants)').all().map((c) => c.name);
  if (!columns.includes('version')) {
    db.exec("ALTER TABLE tenants ADD COLUMN version INTEGER NOT NULL DEFAULT 1");
  }
  if (!columns.includes('lastUpdatedBy')) {
    db.exec("ALTER TABLE tenants ADD COLUMN lastUpdatedBy TEXT NOT NULL DEFAULT 'system'");
  }
} catch {
  // Columns already present
}

// Prepared statements
const stmtInsertTenant = db.prepare(`
  INSERT INTO tenants (
    id, name, domain, industry, region, seatCount,
    sentinel, mde, mdi, logAnalytics,
    device, identities, apps, data,
    overallScore, rank, version, lastUpdatedBy, updatedAt
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?
  )
`);

const stmtSelectAllTenants = db.prepare(`
  SELECT * FROM tenants ORDER BY rank ASC
`);

const stmtSelectTenantById = db.prepare(`
  SELECT * FROM tenants WHERE id = ?
`);

const stmtRecalculateRanks = db.prepare(`
  WITH Ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY overallScore DESC) as newRank
    FROM tenants
  )
  UPDATE tenants
  SET rank = (SELECT newRank FROM Ranked WHERE Ranked.id = tenants.id)
`);

const stmtSelectAllIncidents = db.prepare(`
  SELECT * FROM incidents ORDER BY timestamp DESC
`);

const stmtInsertIncident = db.prepare(`
  INSERT INTO incidents (
    id, title, severity, status, category, source, timestamp, description, recommendation
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

const stmtUpdateIncidentStatus = db.prepare(`
  UPDATE incidents
  SET status = ?
  WHERE id = ?
`);

const stmtCountTenants = db.prepare('SELECT COUNT(*) as count FROM tenants');
const stmtCountIncidents = db.prepare('SELECT COUNT(*) as count FROM incidents');

// Map database row to TenantRecord format
function rowToTenant(row) {
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

// Seed initial tenants and incidents if database is empty
export function seedDatabaseIfEmpty() {
  const tenantCount = stmtCountTenants.get().count;
  if (tenantCount === 0) {
    const tenantsJsonPath = join(__dirname, '../src/data/tenants.json');
    if (existsSync(tenantsJsonPath)) {
      const rawData = JSON.parse(readFileSync(tenantsJsonPath, 'utf8'));
      const now = Date.now();
      db.exec('BEGIN IMMEDIATE;');
      for (const t of rawData) {
        stmtInsertTenant.run(
          t.id,
          t.name,
          t.domain,
          t.industry,
          t.region,
          t.seatCount,
          t.statusBubbles?.sentinel ? 1 : 0,
          t.statusBubbles?.mde ? 1 : 0,
          t.statusBubbles?.mdi ? 1 : 0,
          t.statusBubbles?.logAnalytics ? 1 : 0,
          t.categories?.device ?? 0,
          t.categories?.identities ?? 0,
          t.categories?.apps ?? 0,
          t.categories?.data ?? 0,
          t.overallScore,
          t.rank,
          1,
          'system_seed',
          now
        );
      }
      db.exec('COMMIT;');
      console.log(`[Database] Seeded ${rawData.length} tenant records into SQLite.`);
    }
  }

  const incidentCount = stmtCountIncidents.get().count;
  if (incidentCount === 0) {
    const initialIncidents = [
      {
        id: 'inc-101',
        title: 'Suspicious Credential Velocity on Client Login',
        severity: 'high',
        status: 'active',
        category: 'Identity & Access',
        source: 'Auth PBKDF2 Engine',
        timestamp: Date.now() - 1000 * 60 * 18,
        description: 'Multiple rapid cryptographic derivation attempts detected without matching registered salt parameters.',
        recommendation: 'Enforce exponential derivation delay and inspect origin IP reputation.',
      },
      {
        id: 'inc-102',
        title: 'Local Storage Security Boundary Reset',
        severity: 'medium',
        status: 'investigating',
        category: 'Data Integrity',
        source: 'Storage Management API',
        timestamp: Date.now() - 1000 * 60 * 65,
        description: 'Complete cache flush invoked via client administration trigger outside of scheduled maintenance windows.',
        recommendation: 'Verify authenticated administrator audit trail and validate session token signature.',
      },
      {
        id: 'inc-103',
        title: 'Unauthorized Protected Anchor Navigation Trapped',
        severity: 'low',
        status: 'resolved',
        category: 'Route Authorization Guard',
        source: 'Client Hash Router',
        timestamp: Date.now() - 1000 * 60 * 180,
        description: 'Unauthenticated browser navigation to #debug route intercepted and redirected to guest access notice.',
        recommendation: 'Route guard functioning normally; no further administrative action required.',
      },
    ];

    db.exec('BEGIN IMMEDIATE;');
    for (const inc of initialIncidents) {
      stmtInsertIncident.run(
        inc.id,
        inc.title,
        inc.severity,
        inc.status,
        inc.category,
        inc.source,
        inc.timestamp,
        inc.description,
        inc.recommendation
      );
    }
    db.exec('COMMIT;');
    console.log(`[Database] Seeded ${initialIncidents.length} security incident records into SQLite.`);
  }
}

// Read queries
export function getAllTenants() {
  const rows = stmtSelectAllTenants.all();
  return rows.map(rowToTenant);
}

export function getTenantById(id) {
  const row = stmtSelectTenantById.get(id);
  return row ? rowToTenant(row) : null;
}

// Multi-admin safe tenant update with optimistic concurrency control
export function publishTenantUpdate(id, updates = {}, expectedVersion = null, updatedBy = 'admin') {
  db.exec('BEGIN IMMEDIATE;');
  try {
    const existing = stmtSelectTenantById.get(id);
    if (!existing) {
      db.exec('ROLLBACK;');
      return { notFound: true };
    }

    // Check optimistic concurrency conflict
    if (expectedVersion !== null && expectedVersion !== undefined && existing.version !== expectedVersion) {
      db.exec('ROLLBACK;');
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
      updates.statusBubbles?.sentinel !== undefined
        ? updates.statusBubbles.sentinel
          ? 1
          : 0
        : existing.sentinel;
    const nextMde =
      updates.statusBubbles?.mde !== undefined
        ? updates.statusBubbles.mde
          ? 1
          : 0
        : existing.mde;
    const nextMdi =
      updates.statusBubbles?.mdi !== undefined
        ? updates.statusBubbles.mdi
          ? 1
          : 0
        : existing.mdi;
    const nextLog =
      updates.statusBubbles?.logAnalytics !== undefined
        ? updates.statusBubbles.logAnalytics
          ? 1
          : 0
        : existing.logAnalytics;

    const nextVersion = (existing.version || 1) + 1;
    const now = Date.now();

    const stmtUpdate = db.prepare(`
      UPDATE tenants
      SET overallScore = ?,
          device = ?,
          identities = ?,
          apps = ?,
          data = ?,
          seatCount = ?,
          sentinel = ?,
          mde = ?,
          mdi = ?,
          logAnalytics = ?,
          version = ?,
          lastUpdatedBy = ?,
          updatedAt = ?
      WHERE id = ?
    `);

    stmtUpdate.run(
      nextScore,
      nextDevice,
      nextIdentities,
      nextApps,
      nextData,
      nextSeatCount,
      nextSentinel,
      nextMde,
      nextMdi,
      nextLog,
      nextVersion,
      updatedBy,
      now,
      id
    );

    stmtRecalculateRanks.run();
    db.exec('COMMIT;');

    return {
      success: true,
      tenant: getTenantById(id),
    };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

// Legacy simple score update
export function updateTenantScore(id, overallScore, categories = {}, updatedBy = 'system') {
  const result = publishTenantUpdate(id, { overallScore, categories }, null, updatedBy);
  return result.tenant || null;
}

// Batch update from in-cluster telemetry generators or CronJobs
export function batchUpdateTenants(updates = null, updatedBy = 'k8s-telemetry-generator') {
  db.exec('BEGIN IMMEDIATE;');
  try {
    const now = Date.now();
    let updatedCount = 0;

    const stmtUpdate = db.prepare(`
      UPDATE tenants
      SET overallScore = ?,
          device = ?,
          identities = ?,
          apps = ?,
          data = ?,
          sentinel = ?,
          mde = ?,
          mdi = ?,
          logAnalytics = ?,
          version = version + 1,
          lastUpdatedBy = ?,
          updatedAt = ?
      WHERE id = ?
    `);

    if (Array.isArray(updates) && updates.length > 0) {
      for (const u of updates) {
        const existing = stmtSelectTenantById.get(u.id);
        if (!existing) continue;

        const score = typeof u.overallScore === 'number' ? u.overallScore : existing.overallScore;
        const dev = u.categories?.device ?? existing.device;
        const iden = u.categories?.identities ?? existing.identities;
        const app = u.categories?.apps ?? existing.apps;
        const dat = u.categories?.data ?? existing.data;

        const sent = u.statusBubbles?.sentinel !== undefined ? (u.statusBubbles.sentinel ? 1 : 0) : existing.sentinel;
        const mde = u.statusBubbles?.mde !== undefined ? (u.statusBubbles.mde ? 1 : 0) : existing.mde;
        const mdi = u.statusBubbles?.mdi !== undefined ? (u.statusBubbles.mdi ? 1 : 0) : existing.mdi;
        const log = u.statusBubbles?.logAnalytics !== undefined ? (u.statusBubbles.logAnalytics ? 1 : 0) : existing.logAnalytics;

        stmtUpdate.run(score, dev, iden, app, dat, sent, mde, mdi, log, updatedBy, now, u.id);
        updatedCount += 1;
      }
    } else {
      // Automatic realistic random perturbation across all tenants (random number generator simulation)
      const allRows = stmtSelectAllTenants.all();
      for (const row of allRows) {
        // Random score adjustment [-1.5, +1.5]
        const delta = Math.round((Math.random() * 3 - 1.5) * 10) / 10;
        const newScore = Math.min(100, Math.max(10, Math.round((row.overallScore + delta) * 10) / 10));

        // Category adjustments
        const newDev = Math.min(100, Math.max(10, Math.round((row.device + (Math.random() * 2 - 1)) * 10) / 10));
        const newIden = Math.min(100, Math.max(10, Math.round((row.identities + (Math.random() * 2 - 1)) * 10) / 10));
        const newApp = Math.min(100, Math.max(10, Math.round((row.apps + (Math.random() * 2 - 1)) * 10) / 10));
        const newData = Math.min(100, Math.max(10, Math.round((row.data + (Math.random() * 2 - 1)) * 10) / 10));

        // Rare toggle of telemetry signal (5% chance)
        const sent = Math.random() < 0.05 ? (row.sentinel ? 0 : 1) : row.sentinel;
        const mde = Math.random() < 0.05 ? (row.mde ? 0 : 1) : row.mde;
        const mdi = Math.random() < 0.05 ? (row.mdi ? 0 : 1) : row.mdi;
        const log = Math.random() < 0.05 ? (row.logAnalytics ? 0 : 1) : row.logAnalytics;

        stmtUpdate.run(newScore, newDev, newIden, newApp, newData, sent, mde, mdi, log, updatedBy, now, row.id);
        updatedCount += 1;
      }
    }

    stmtRecalculateRanks.run();
    db.exec('COMMIT;');

    return {
      updatedCount,
      tenants: getAllTenants(),
      timestamp: now,
    };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function getAllIncidents() {
  return stmtSelectAllIncidents.all();
}

export function addIncident(incident) {
  const id = incident.id || `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = incident.timestamp || Date.now();
  stmtInsertIncident.run(
    id,
    incident.title,
    incident.severity || 'medium',
    incident.status || 'active',
    incident.category || 'General',
    incident.source || 'Sentinel Engine',
    timestamp,
    incident.description || '',
    incident.recommendation || ''
  );
  return {
    id,
    title: incident.title,
    severity: incident.severity || 'medium',
    status: incident.status || 'active',
    category: incident.category || 'General',
    source: incident.source || 'Sentinel Engine',
    timestamp,
    description: incident.description || '',
    recommendation: incident.recommendation || '',
  };
}

export function updateIncidentStatus(id, status) {
  stmtUpdateIncidentStatus.run(status, id);
  return { id, status };
}

// Data-agnostic record updater scaling across any database table in SQLite
export function updateGenericRecord(tableName, id, updates = {}, expectedVersion = null, updatedBy = 'admin') {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    throw new Error('Invalid table identifier');
  }

  // Delegate domain-specific tenants table to its specialized handler with rank recalculation
  if (tableName === 'tenants') {
    const res = publishTenantUpdate(id, updates, expectedVersion, updatedBy);
    return {
      ...res,
      record: res.tenant,
    };
  }

  db.exec('BEGIN IMMEDIATE;');
  try {
    const columnsInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
    if (!columnsInfo || columnsInfo.length === 0) {
      db.exec('ROLLBACK;');
      return { notFound: true, error: `Table '${tableName}' does not exist` };
    }

    const columnSet = new Set(columnsInfo.map((c) => c.name));
    const existing = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(id);

    if (!existing) {
      db.exec('ROLLBACK;');
      return { notFound: true };
    }

    // Verify optimistic concurrency version if version column exists
    if (columnSet.has('version') && expectedVersion !== null && expectedVersion !== undefined) {
      if (existing.version !== expectedVersion) {
        db.exec('ROLLBACK;');
        return {
          conflict: true,
          current: existing,
        };
      }
    }

    const assignments = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && columnSet.has(key)) {
        assignments.push(`${key} = ?`);
        params.push(value);
      }
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

    if (assignments.length > 0) {
      params.push(id);
      db.prepare(`UPDATE ${tableName} SET ${assignments.join(', ')} WHERE id = ?`).run(...params);
    }

    db.exec('COMMIT;');

    const updated = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(id);
    return {
      success: true,
      record: updated,
    };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function getDatabaseStats() {
  const tenantCount = stmtCountTenants.get().count;
  const incidentCount = stmtCountIncidents.get().count;
  const avgRow = db.prepare('SELECT AVG(overallScore) as avgScore FROM tenants').get();
  return {
    tenantCount,
    incidentCount,
    avgScore: avgRow?.avgScore ? Math.round(avgRow.avgScore * 10) / 10 : 0,
    dbPath: DB_PATH,
  };
}
