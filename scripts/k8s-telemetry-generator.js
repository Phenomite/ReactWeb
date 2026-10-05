#!/usr/bin/env bun

/**
 * In-Cluster Telemetry Generator Script
 *
 * Simulates real-time enterprise telemetry variations across all tenants.
 * Can be run:
 *  - Inside Kubernetes as a CronJob scheduled every minute (* * * * *) with --once
 *  - Inside Kubernetes as a standalone Daemon Deployment running a 60s loop
 *  - Locally via 'pnpm run telemetry:cron'
 */

import fs from 'node:fs';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
const INTERVAL_MS = Number.parseInt(process.env.UPDATE_INTERVAL_MS || '60000', 10);
const RUN_ONCE = process.argv.includes('--once');
const HEALTH_FILE = process.env.HEALTH_FILE || '/tmp/healthy';

console.log('[Telemetry Generator] Target Backend URL:', BACKEND_URL);
console.log('[Telemetry Generator] Mode:', RUN_ONCE ? 'One-Shot' : `Continuous Loop (${INTERVAL_MS / 1000}s)`);

async function runBatchUpdate() {
	const startTime = Date.now();
	try {
		// 1. Verify backend health
		const healthRes = await fetch(`${BACKEND_URL}/healthz`, { signal: AbortSignal.timeout(5000) });
		if (!healthRes.ok) {
			throw new Error(`Backend not healthy: HTTP ${healthRes.status}`);
		}

		// 2. Dispatch batch update to backend
		const batchRes = await fetch(`${BACKEND_URL}/api/internal/batch-update-tenants`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Updater-Source': 'k8s-telemetry-generator',
			},
			body: JSON.stringify({
				updatedBy: 'k8s-telemetry-cron',
			}),
			signal: AbortSignal.timeout(10000),
		});

		if (!batchRes.ok) {
			const errBody = await batchRes.text();
			throw new Error(`Batch update failed: HTTP ${batchRes.status} - ${errBody}`);
		}

		const data = await batchRes.json();
		const durationMs = Date.now() - startTime;
		console.log(`[${new Date().toISOString()}] Successfully updated ${data.updatedCount} tenants in ${durationMs}ms.`);
		try {
			fs.writeFileSync(HEALTH_FILE, Math.floor(Date.now() / 1000).toString(), 'utf8');
		} catch {
			// Non-fatal if running outside container without write permissions
		}
		return true;
	} catch (err) {
		console.error(`[${new Date().toISOString()}] Batch update error:`, err.message);
		return false;
	}
}

async function main() {
	if (RUN_ONCE) {
		const ok = await runBatchUpdate();
		process.exit(ok ? 0 : 1);
	} else {
		// Initial run on startup
		await runBatchUpdate();

		// Periodic loop every minute
		const timer = setInterval(async () => {
			await runBatchUpdate();
		}, INTERVAL_MS);

		function cleanup() {
			console.log('[Telemetry Generator] Terminating generator gracefully...');
			clearInterval(timer);
			process.exit(0);
		}

		process.on('SIGTERM', cleanup);
		process.on('SIGINT', cleanup);
	}
}

main();
