#!/usr/bin/env bun
/**
 * Developer In-Namespace Database Mutation CLI
 *
 * Enables developers within the cluster namespace (or local dev environment)
 * to modify records in the live running server database, with immediate real-time SSE
 * propagation across all connected visitors.
 *
 * Usage:
 *   bun scripts/dev-modify-db.js --tenant tenant-067 --score 98.5 --as alice
 *   bun scripts/dev-modify-db.js --collection incidents --id inc-1 --field status --value resolved --as bob
 *   pnpm run dev:modify -- --tenant tenant-001 --score 95 --as charlie
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3001';

// Parse command-line flags
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: BACKEND_URL,
    collection: 'tenants',
    id: '',
    score: null,
    field: null,
    value: null,
    user: 'admin',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--tenant' && args[i + 1]) {
      options.collection = 'tenants';
      options.id = args[++i];
    } else if (arg === '--collection' && args[i + 1]) {
      options.collection = args[++i];
    } else if (arg === '--id' && args[i + 1]) {
      options.id = args[++i];
    } else if (arg === '--score' && args[i + 1]) {
      options.score = Number.parseFloat(args[++i]);
    } else if (arg === '--field' && args[i + 1]) {
      options.field = args[++i];
    } else if (arg === '--value' && args[i + 1]) {
      options.value = args[++i];
    } else if ((arg === '--as' || arg === '--user') && args[i + 1]) {
      options.user = args[++i];
    } else if (arg === '--url' && args[i + 1]) {
      options.url = args[++i];
    }
  }

  return options;
}

async function main() {
  const opts = parseArgs();

  if (!opts.id) {
    console.error('Error: Target record ID is required. Use --tenant <id> or --id <id>');
    console.error('Example: bun scripts/dev-modify-db.js --tenant tenant-067 --score 98.5 --as alice');
    process.exit(1);
  }

  console.log(`[Developer DB CLI] Connecting to server at ${opts.url}...`);
  console.log(`[Developer DB CLI] Developer Identity: ${opts.user}`);
  console.log(`[Developer DB CLI] Target Resource: ${opts.collection}/${opts.id}`);

  // Build updates payload
  const updates = {};
  if (opts.collection === 'tenants') {
    if (opts.score !== null) updates.overallScore = opts.score;
  }
  if (opts.field && opts.value !== null) {
    updates[opts.field] = opts.value;
  }
  if (Object.keys(updates).length === 0) {
    // Default demo nudge
    updates.overallScore = 97.5;
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Admin-User': opts.user,
  };

  try {
    const res = await fetch(`${opts.url}/api/${opts.collection}/${encodeURIComponent(opts.id)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });

    if (res.status === 403 || res.status === 401) {
      const err = await res.json().catch(() => ({}));
      console.error(`[ACCESS DENIED] HTTP ${res.status}: ${err.message || 'Access denied.'}`);
      process.exit(1);
    }

    if (res.status === 409) {
      const conflict = await res.json();
      console.error(
        `[OCC CONFLICT] Record was concurrently updated by another admin. Current version: v${conflict.current?.version}`,
      );
      process.exit(1);
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[ERROR] HTTP ${res.status}: ${errText}`);
      process.exit(1);
    }

    const result = await res.json();
    const record = result.data || result.tenant || result;

    console.log('\n======================================================');
    console.log('✓ Database Mutation Successfully Committed to SQLite');
    console.log('======================================================');
    console.log(`Resource:        ${opts.collection}/${opts.id}`);
    console.log(`Modified By:     ${record.lastUpdatedBy || opts.user}`);
    console.log(`Record Version:  v${record.version || 'N/A'}`);
    if (record.overallScore !== undefined) console.log(`Overall Score:   ${record.overallScore}`);
    if (record.rank !== undefined) console.log(`Leaderboard Rank: #${record.rank}`);
    if (record.status !== undefined) console.log(`Status:          ${record.status}`);
    console.log('------------------------------------------------------');
    console.log('⚡ Real-time SSE event broadcast dispatched to ALL active visitor browsers.');
    console.log('======================================================\n');
  } catch (err) {
    console.error('[Connection Error]', err.message);
    process.exit(1);
  }
}

main();
