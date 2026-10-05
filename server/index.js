import {
	addIncident,
	batchUpdateTenants,
	getAllIncidents,
	getAllTenants,
	getDatabaseStats,
	getTenantById,
	seedDatabaseIfEmpty,
	updateGenericRecord,
	updateIncidentStatus,
	updateTenantScore,
} from './db.js';

// Configuration
const PORT = Number.parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const ENABLE_SIMULATOR = process.env.ENABLE_SIMULATOR !== 'false';

// Seed database on startup
seedDatabaseIfEmpty();

// Active SSE client subscriptions (ReadableStreamDefaultController set)
const activeClients = new Set();
const textEncoder = new TextEncoder();

// Rate limiter storage: IP -> { count: number, resetAt: number }
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
const SECURITY_HEADERS = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'X-XSS-Protection': '1; mode=block',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	'Access-Control-Allow-Origin': CORS_ORIGIN,
	'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, X-Namespace-Secret, X-Updater-Source, X-Admin-User',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
	return Response.json(data, {
		status,
		headers: {
			...SECURITY_HEADERS,
			...extraHeaders,
		},
	});
}

// Broadcast real-time SSE event to all connected browser visitors
export function broadcastEvent(event, data) {
	const payload = textEncoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
	for (const client of activeClients) {
		try {
			client.enqueue(payload);
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
		description:
			'An untrusted origin attempted to post structured messages without meeting COOP same-origin constraints.',
		recommendation: 'Verify targetOrigin validation on window.addEventListener handlers.',
	},
	{
		title: 'Anomalous API Rate Threshold Exceeded',
		severity: 'critical',
		category: 'Traffic Anomaly',
		source: 'Rate Limiter Service',
		description: 'Automated rapid mutation requests flagged from external IP violating rate limit window.',
		recommendation: 'Inspect source IP address and verify edge rate-limiting rules.',
	},
	{
		title: 'Local Storage State Manipulation Flagged',
		severity: 'medium',
		category: 'Data Integrity',
		source: 'Storage Event Listener',
		description: 'Direct console modification of local storage keys detected outside normal application hooks.',
		recommendation: 'Audit client-side state transitions and verify stored preference schema.',
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

// Helper to safely parse JSON body from standard Request
async function parseJsonBody(req) {
	try {
		return await req.json();
	} catch {
		return {};
	}
}

// Start native Bun HTTP server
export const server = Bun.serve({
	port: PORT,
	hostname: HOST,
	idleTimeout: 0,

	async fetch(req, serverInstance) {
		const ip = req.headers.get('x-forwarded-for') || serverInstance.requestIP(req)?.address || '127.0.0.1';
		const url = new URL(req.url);
		const pathname = url.pathname;
		const method = req.method;

		// Handle CORS preflight
		if (method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: SECURITY_HEADERS,
			});
		}

		// Rate limit protection on mutating requests
		if (method === 'POST' || method === 'PATCH') {
			if (!checkRateLimit(ip)) {
				return jsonResponse({ error: 'Too Many Requests', retryAfter: 60 }, 429);
			}
		}

		try {
			// Kubernetes Liveness Probe
			if (pathname === '/healthz' && method === 'GET') {
				return jsonResponse({ status: 'ok', uptime: process.uptime() });
			}

			// Kubernetes Readiness Probe
			if (pathname === '/readyz' && method === 'GET') {
				try {
					getDatabaseStats();
					return jsonResponse({ status: 'ready', clientsConnected: activeClients.size });
				} catch {
					return jsonResponse({ status: 'unavailable' }, 503);
				}
			}

			// Real-Time SSE Stream Endpoint
			if (pathname === '/api/events' && method === 'GET') {
				let clientController = null;
				const stream = new ReadableStream({
					start(controller) {
						clientController = controller;
						activeClients.add(controller);

						// Send initial keep-alive comment
						controller.enqueue(textEncoder.encode(': connected\n\n'));

						// Send initial data snapshot
						const initialPayload = {
							tenants: getAllTenants(),
							incidents: getAllIncidents(),
							stats: getDatabaseStats(),
							activeVisitors: activeClients.size,
							serverTime: Date.now(),
						};
						controller.enqueue(textEncoder.encode(`event: init\ndata: ${JSON.stringify(initialPayload)}\n\n`));

						// Broadcast updated visitor count to all visitors
						broadcastEvent('visitors', {
							activeVisitors: activeClients.size,
							timestamp: Date.now(),
						});
					},
					cancel() {
						if (clientController) {
							activeClients.delete(clientController);
							broadcastEvent('visitors', {
								activeVisitors: activeClients.size,
								timestamp: Date.now(),
							});
						}
					},
				});

				return new Response(stream, {
					headers: {
						...SECURITY_HEADERS,
						'Content-Type': 'text/event-stream',
						'Cache-Control': 'no-cache, no-transform',
						Connection: 'keep-alive',
						'X-Accel-Buffering': 'no',
					},
				});
			}

			// API Status Endpoint
			if (pathname === '/api/status' && method === 'GET') {
				const stats = getDatabaseStats();
				return jsonResponse({
					status: 'online',
					engine: `Bun ${Bun.version} + SQLite WAL`,
					uptime: process.uptime(),
					activeVisitors: activeClients.size,
					database: stats,
					timestamp: Date.now(),
				});
			}

			// Tenants Collection
			if (pathname === '/api/tenants' && method === 'GET') {
				const tenants = getAllTenants();
				return jsonResponse(tenants);
			}

			// Single Tenant
			const tenantMatch = pathname.match(/^\/api\/tenants\/([^/]+)$/);
			if (tenantMatch && method === 'GET') {
				const tenantId = tenantMatch[1];
				const tenant = getTenantById(tenantId);
				if (!tenant) {
					return jsonResponse({ error: 'Tenant Not Found' }, 404);
				}
				return jsonResponse(tenant);
			}

			// Data-Agnostic Entity Update (with Optimistic Concurrency Control & Real-Time Broadcast)
			const genericPatchMatch = pathname.match(/^\/api\/([a-zA-Z0-9_]+)\/([^/]+)$/);
			if (
				genericPatchMatch &&
				method === 'PATCH' &&
				genericPatchMatch[2] !== 'pulse' &&
				genericPatchMatch[2] !== 'simulate'
			) {
				const resource = genericPatchMatch[1];
				const entityId = genericPatchMatch[2];
				const body = await parseJsonBody(req);
				const adminUser =
					(typeof req.headers?.get === 'function' ? req.headers.get('x-admin-user') : req.headers?.['x-admin-user']) ||
					'system';
				const expectedVersion = typeof body.expectedVersion === 'number' ? body.expectedVersion : null;

				const result = updateGenericRecord(resource, entityId, body, expectedVersion, adminUser);

				if (result.notFound) {
					return jsonResponse({ error: `${resource} item not found` }, 404);
				}

				if (result.conflict) {
					return jsonResponse(
						{
							error: 'Conflict',
							message: `${resource} item was concurrently modified by another administrator`,
							current: result.current,
							currentTenant: result.current,
						},
						409,
					);
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

				return jsonResponse({ success: true, resource, data: updatedRecord, tenant: updatedRecord });
			}

			// High-Throughput Batch Update for In-Cluster Scripts & CronJobs
			if (pathname === '/api/internal/batch-update-tenants' && method === 'POST') {
				const body = await parseJsonBody(req);
				const updatedBy =
					body.updatedBy ||
					(typeof req.headers?.get === 'function' ? req.headers.get('x-admin-user') : req.headers?.['x-admin-user']) ||
					'k8s-telemetry-generator';
				const result = batchUpdateTenants(body.updates, updatedBy);

				// Broadcast batch event over SSE so all open browser tabs update instantly
				broadcastEvent('tenants_batch_updated', {
					updatedCount: result.updatedCount,
					timestamp: result.timestamp,
					updatedBy,
					tenants: result.tenants,
				});

				return jsonResponse({
					status: 'success',
					updatedCount: result.updatedCount,
					timestamp: result.timestamp,
				});
			}

			// Legacy Update Tenant Score (with Real-Time Broadcast)
			const scoreMatch = pathname.match(/^\/api\/tenants\/([^/]+)\/score$/);
			if (scoreMatch && method === 'PATCH') {
				const tenantId = scoreMatch[1];
				const body = await parseJsonBody(req);
				const overallScore = Number.parseFloat(body.overallScore);
				if (Number.isNaN(overallScore) || overallScore < 0 || overallScore > 100) {
					return jsonResponse({ error: 'overallScore must be a number between 0 and 100' }, 400);
				}

				const adminUser =
					(typeof req.headers?.get === 'function' ? req.headers.get('x-admin-user') : req.headers?.['x-admin-user']) ||
					'system';
				const updated = updateTenantScore(tenantId, overallScore, body.categories || {}, adminUser);
				if (!updated) {
					return jsonResponse({ error: 'Tenant Not Found' }, 404);
				}

				// Broadcast update to all connected browsers
				broadcastEvent('tenant_updated', updated);

				return jsonResponse(updated);
			}

			// Incidents Collection
			if (pathname === '/api/incidents' && method === 'GET') {
				const incidents = getAllIncidents();
				return jsonResponse(incidents);
			}

			// Create Incident (with Real-Time Broadcast)
			if (pathname === '/api/incidents' && method === 'POST') {
				const body = await parseJsonBody(req);
				if (!body.title) {
					return jsonResponse({ error: 'title is required' }, 400);
				}
				const created = addIncident(body);

				// Broadcast real-time incident event to all connected visitors
				broadcastEvent('incident_created', created);

				return jsonResponse(created, 201);
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

				return jsonResponse(created, 201);
			}

			// Update Incident Status (with Real-Time Broadcast)
			const incidentStatusMatch = pathname.match(/^\/api\/incidents\/([^/]+)\/status$/);
			if (incidentStatusMatch && method === 'PATCH') {
				const incidentId = incidentStatusMatch[1];
				const body = await parseJsonBody(req);
				if (!['active', 'investigating', 'resolved'].includes(body.status)) {
					return jsonResponse({ error: 'Invalid status' }, 400);
				}
				const updated = updateIncidentStatus(incidentId, body.status);

				// Broadcast to all connected visitors
				broadcastEvent('incident_status_updated', updated);

				return jsonResponse(updated);
			}

			// Manual Telemetry Pulse Trigger
			if (pathname === '/api/telemetry/pulse' && method === 'POST') {
				const tenants = getAllTenants();
				if (tenants.length > 0) {
					// Randomly select one tenant and gently nudge score (+/- 1-2 points)
					const randomTenant = tenants[Math.floor(Math.random() * tenants.length)];
					const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1);
					const newScore = Math.min(100, Math.max(20, Math.round((randomTenant.overallScore + delta) * 10) / 10));
					const adminUser =
						(typeof req.headers?.get === 'function'
							? req.headers.get('x-admin-user')
							: req.headers?.['x-admin-user']) || 'system';
					const updated = updateTenantScore(randomTenant.id, newScore, {}, adminUser);
					if (updated) {
						broadcastEvent('tenant_updated', updated);
					}
				}
				return jsonResponse({ status: 'pulse_dispatched', activeVisitors: activeClients.size });
			}

			// Default Not Found
			return jsonResponse({ error: 'Endpoint Not Found' }, 404);
		} catch (err) {
			console.error('[API Error]', err);
			return jsonResponse({ error: 'Internal Server Error' }, 500);
		}
	},
});

// Periodic heartbeat keepalive (every 15s) to sustain SSE connections through firewalls
const heartbeatTimer = setInterval(() => {
	const payload = textEncoder.encode(': heartbeat\n\n');
	for (const client of activeClients) {
		try {
			client.enqueue(payload);
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
				const delta = Math.random() > 0.45 ? 0.5 : -0.5;
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
			client.close();
		} catch {}
	}
	activeClients.clear();
	server.stop(true);
	console.log('[Server] Closed all connections.');
	process.exit(0);
}

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

console.log(`[Server] Secure Real-Time Backend running on http://${HOST}:${PORT} (Bun ${Bun.version})`);
console.log(`[Server] Real-time SSE event stream available at /api/events`);
