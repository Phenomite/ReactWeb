import { createServer } from 'node:http';
import {
  seedDatabaseIfEmpty,
  getAllTenants,
  getTenantById,
  updateTenantScore,
  publishTenantUpdate,
  batchUpdateTenants,
  getAllIncidents,
  addIncident,
  updateIncidentStatus,
  updateGenericRecord,
  getDatabaseStats,
} from './db.js';

// Configuration
const PORT = Number.parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const ENABLE_SIMULATOR = process.env.ENABLE_SIMULATOR !== 'false';

// Seed database on startup
seedDatabaseIfEmpty();

// Active SSE client subscriptions
const activeClients = new Set();

// Rate limiter storage: IP -> { tokens: number, lastRefill: number }
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  record.count += 1;
  rateLimitMap.set(ip, record);
  return record.count <= RATE_LIMIT_MAX;
}

// DevSecOps Security Headers
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Broadcast real-time SSE event to all connected browser visitors
export function broadcastEvent(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of activeClients) {
    try {
      client.write(payload);
    } catch {
      activeClients.delete(client);
    }
  }
}

// Simulated enterprise threat signals
const SIMULATED_ALERTS = [
  {
    title: 'Anomalous Cross-Origin PostMessage Telemetry Probe',
    severity: 'high',
    category: 'Cross-Context Isolation',
    source: 'Browser Window Messaging Guard',
    description: 'An untrusted origin attempted to post structured messages without meeting COOP same-origin constraints.',
    recommendation: 'Verify targetOrigin validation on window.addEventListener handlers.',
  },
  {
    title: 'Repeated PBKDF2 Web Crypto Salt Mismatch Ingestion',
    severity: 'critical',
    category: 'Credential Defense',
    source: 'Client Auth Engine',
    description: 'Automated rapid-fire hash verification attempts flagged with randomized salt parameters.',
    recommendation: 'Apply IP rate-limiting and enforce multi-factor authentication policies.',
  },
  {
    title: 'Local Storage State Manipulation Flagged',
    severity: 'medium',
    category: 'Data Integrity',
    source: 'Storage Event Listener',
    description: 'Direct console manipulation of session storage token detected outside normal application hooks.',
    recommendation: 'Audit client-side state transitions and rotate signed session key.',
  },
  {
    title: 'Sentinel Threat Intelligence Feeds Sync Completed',
    severity: 'info',
    category: 'Threat Intelligence',
    source: 'Azure Sentinel Connector',
    description: 'Successfully ingested 42 new IOC signatures from Microsoft Threat Intelligence.',
    recommendation: 'No action required; signatures active in tenant firewall rules.',
  },
];

// Helper to parse JSON body with strict length limit (64KB)
function parseJsonBody(req, maxLength = 65536) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > maxLength) {
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Create native HTTP server
export const server = createServer(async (req, res) => {
  setSecurityHeaders(res);

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rate limit protection on mutating requests
  if (method === 'POST' || method === 'PATCH') {
    if (!checkRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too Many Requests', retryAfter: 60 }));
      return;
    }
  }

  try {
    // Kubernetes Liveness Probe
    if (pathname === '/healthz' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
      return;
    }

    // Kubernetes Readiness Probe
    if (pathname === '/readyz' && method === 'GET') {
      try {
        getDatabaseStats();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ready', clientsConnected: activeClients.size }));
      } catch {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'unavailable' }));
      }
      return;
    }

    // Real-Time SSE Stream Endpoint
    if (pathname === '/api/events' && method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      // Send initial keep-alive comment
      res.write(': connected\n\n');

      // Register client
      activeClients.add(res);

      // Send initial data snapshot
      const initialPayload = {
        tenants: getAllTenants(),
        incidents: getAllIncidents(),
        stats: getDatabaseStats(),
        activeVisitors: activeClients.size,
        serverTime: Date.now(),
      };
      res.write(`event: init\ndata: ${JSON.stringify(initialPayload)}\n\n`);

      // Broadcast updated visitor count to all visitors
      broadcastEvent('visitors', {
        activeVisitors: activeClients.size,
        timestamp: Date.now(),
      });

      // Cleanup on disconnect
      req.on('close', () => {
        activeClients.delete(res);
        broadcastEvent('visitors', {
          activeVisitors: activeClients.size,
          timestamp: Date.now(),
        });
      });
      return;
    }

    // API Status Endpoint
    if (pathname === '/api/status' && method === 'GET') {
      const stats = getDatabaseStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'online',
          engine: 'Node.js + SQLite WAL',
          uptime: process.uptime(),
          activeVisitors: activeClients.size,
          database: stats,
          timestamp: Date.now(),
        })
      );
      return;
    }

    // Tenants Collection
    if (pathname === '/api/tenants' && method === 'GET') {
      const tenants = getAllTenants();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tenants));
      return;
    }

    // Single Tenant
    const tenantMatch = pathname.match(/^\/api\/tenants\/([^/]+)$/);
    if (tenantMatch && method === 'GET') {
      const tenantId = tenantMatch[1];
      const tenant = getTenantById(tenantId);
      if (!tenant) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Tenant Not Found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tenant));
      return;
    }

    // Data-Agnostic Entity Update (with Optimistic Concurrency Control & Real-Time Broadcast)
    const genericPatchMatch = pathname.match(/^\/api\/([a-zA-Z0-9_]+)\/([^/]+)$/);
    if (genericPatchMatch && method === 'PATCH' && genericPatchMatch[2] !== 'pulse' && genericPatchMatch[2] !== 'simulate') {
      const resource = genericPatchMatch[1];
      const entityId = genericPatchMatch[2];
      const body = await parseJsonBody(req);
      const adminUser = req.headers['x-admin-user'] || body.updatedBy || 'admin';
      const expectedVersion = typeof body.expectedVersion === 'number' ? body.expectedVersion : null;

      const result = updateGenericRecord(resource, entityId, body, expectedVersion, adminUser);

      if (result.notFound) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `${resource} item not found` }));
        return;
      }

      if (result.conflict) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Conflict',
            message: `${resource} item was concurrently modified by another administrator`,
            current: result.current,
            currentTenant: result.current,
          })
        );
        return;
      }

      const updatedRecord = result.record || result.tenant;

      // Broadcast generic event over SSE so all open browser tabs update dynamically
      broadcastEvent('data_updated', {
        resource,
        id: entityId,
        data: updatedRecord,
        timestamp: Date.now(),
      });

      // Backward-compatible entity-specific broadcasts
      if (resource === 'tenants') {
        broadcastEvent('tenant_updated', updatedRecord);
      } else if (resource === 'incidents') {
        broadcastEvent('incident_status_updated', updatedRecord);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, resource, data: updatedRecord, tenant: updatedRecord }));
      return;
    }

    // High-Throughput Batch Update for In-Cluster Scripts & CronJobs
    if (pathname === '/api/internal/batch-update-tenants' && method === 'POST') {
      const body = await parseJsonBody(req);
      const updatedBy = body.updatedBy || req.headers['x-updater-source'] || 'k8s-telemetry-generator';
      const result = batchUpdateTenants(body.updates, updatedBy);

      // Broadcast batch event over SSE so all open browser tabs update instantly
      broadcastEvent('tenants_batch_updated', {
        updatedCount: result.updatedCount,
        timestamp: result.timestamp,
        updatedBy,
        tenants: result.tenants,
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'success',
          updatedCount: result.updatedCount,
          timestamp: result.timestamp,
        })
      );
      return;
    }

    // Legacy Update Tenant Score (with Real-Time Broadcast)
    const scoreMatch = pathname.match(/^\/api\/tenants\/([^/]+)\/score$/);
    if (scoreMatch && method === 'PATCH') {
      const tenantId = scoreMatch[1];
      const body = await parseJsonBody(req);
      const overallScore = Number.parseFloat(body.overallScore);
      if (Number.isNaN(overallScore) || overallScore < 0 || overallScore > 100) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'overallScore must be a number between 0 and 100' }));
        return;
      }

      const updated = updateTenantScore(tenantId, overallScore, body.categories || {});
      if (!updated) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Tenant Not Found' }));
        return;
      }

      // Broadcast update to all connected browsers
      broadcastEvent('tenant_updated', updated);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updated));
      return;
    }

    // Incidents Collection
    if (pathname === '/api/incidents' && method === 'GET') {
      const incidents = getAllIncidents();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(incidents));
      return;
    }

    // Create Incident (with Real-Time Broadcast)
    if (pathname === '/api/incidents' && method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.title) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'title is required' }));
        return;
      }
      const created = addIncident(body);

      // Broadcast real-time incident event to all connected visitors
      broadcastEvent('incident_created', created);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(created));
      return;
    }

    // Simulate Incident (with Real-Time Broadcast)
    if (pathname === '/api/incidents/simulate' && method === 'POST') {
      const template = SIMULATED_ALERTS[Math.floor(Math.random() * SIMULATED_ALERTS.length)];
      const incident = {
        ...template,
        timestamp: Date.now(),
      };
      const created = addIncident(incident);

      // Broadcast to all connected visitors
      broadcastEvent('incident_created', created);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(created));
      return;
    }

    // Update Incident Status (with Real-Time Broadcast)
    const incidentStatusMatch = pathname.match(/^\/api\/incidents\/([^/]+)\/status$/);
    if (incidentStatusMatch && method === 'PATCH') {
      const incidentId = incidentStatusMatch[1];
      const body = await parseJsonBody(req);
      if (!['active', 'investigating', 'resolved'].includes(body.status)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid status' }));
        return;
      }
      const updated = updateIncidentStatus(incidentId, body.status);

      // Broadcast to all connected visitors
      broadcastEvent('incident_status_updated', updated);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updated));
      return;
    }

    // Manual Telemetry Pulse Trigger
    if (pathname === '/api/telemetry/pulse' && method === 'POST') {
      const tenants = getAllTenants();
      if (tenants.length > 0) {
        // Randomly select one tenant and gently nudge score (+/- 1-2 points)
        const randomTenant = tenants[Math.floor(Math.random() * tenants.length)];
        const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1);
        const newScore = Math.min(100, Math.max(20, Math.round((randomTenant.overallScore + delta) * 10) / 10));
        const updated = updateTenantScore(randomTenant.id, newScore);
        if (updated) {
          broadcastEvent('tenant_updated', updated);
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'pulse_dispatched', activeVisitors: activeClients.size }));
      return;
    }

    // Default Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
  } catch (err) {
    console.error('[API Error]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

// Periodic heartbeat keepalive (every 15s) to sustain SSE connections through firewalls
const heartbeatTimer = setInterval(() => {
  for (const client of activeClients) {
    try {
      client.write(': heartbeat\n\n');
    } catch {
      activeClients.delete(client);
    }
  }
}, 15000);

// Gentle background telemetry simulator: keeps the leaderboard dynamic and alive for visitors
let simulatorTimer = null;
if (ENABLE_SIMULATOR) {
  simulatorTimer = setInterval(() => {
    if (activeClients.size > 0) {
      const tenants = getAllTenants();
      if (tenants.length > 0) {
        const randomTenant = tenants[Math.floor(Math.random() * tenants.length)];
        const delta = (Math.random() > 0.45 ? 0.5 : -0.5);
        const newScore = Math.min(100, Math.max(20, Math.round((randomTenant.overallScore + delta) * 10) / 10));
        const updated = updateTenantScore(randomTenant.id, newScore);
        if (updated) {
          broadcastEvent('tenant_updated', updated);
        }
      }
    }
  }, 25000);
}

// Graceful shutdown handling
function handleShutdown() {
  console.log('[Server] Shutting down gracefully...');
  clearInterval(heartbeatTimer);
  if (simulatorTimer) clearInterval(simulatorTimer);
  for (const client of activeClients) {
    try {
      client.end();
    } catch {}
  }
  activeClients.clear();
  server.close(() => {
    console.log('[Server] Closed all connections.');
    process.exit(0);
  });
}

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

server.listen(PORT, HOST, () => {
  console.log(`[Server] Secure Real-Time Backend running on http://${HOST}:${PORT}`);
  console.log(`[Server] Real-time SSE event stream available at /api/events`);
});
