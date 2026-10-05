#!/usr/bin/env bun
/**
 * Developer In-Namespace Database Mutation CLI
 *
 * Enables developers within the cluster namespace (or local dev environment)
 * to modify records in the live running server database, with immediate real-time SSE
 * propagation across all connected visitors.
 *
 * Usage:
 *   bun scripts/dev-modify-db.ts --tenant tenant-067 --score 98.5 --as alice
 *   bun scripts/dev-modify-db.ts --collection incidents --id inc-1 --field status --value resolved --as bob
 *   pnpm run dev:modify -- --tenant tenant-001 --score 95 --as charlie
 */

const BACKEND_URL = process.env['BACKEND_URL'] || 'http://127.0.0.1:3001';

interface CliOptions {
  url: string;
  collection: string;
  id: string;
  score: number | null;
  field: string | null;
  value: string | null;
  user: string;
}

// Parse command-line flags
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
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
    const nextArg = args[i + 1];
    if (arg === '--tenant' && nextArg) {
      options.collection = 'tenants';
      options.id = nextArg;
      i++;
    } else if (arg === '--collection' && nextArg) {
      options.collection = nextArg;
      i++;
    } else if (arg === '--id' && nextArg) {
      options.id = nextArg;
      i++;
    } else if (arg === '--score' && nextArg) {
      options.score = Number.parseFloat(nextArg);
      i++;
    } else if (arg === '--field' && nextArg) {
      options.field = nextArg;
      i++;
    } else if (arg === '--value' && nextArg) {
      options.value = nextArg;
      i++;
    } else if ((arg === '--as' || arg === '--user') && nextArg) {
      options.user = nextArg;
      i++;
    } else if (arg === '--url' && nextArg) {
      options.url = nextArg;
      i++;
    }
  }

  return options;
}

async function main(): Promise<void> {
  const opts = parseArgs();

  if (!opts.id) {
    console.error('Error: Target record ID is required. Use --tenant <id> or --id <id>');
    console.error('Example: bun scripts/dev-modify-db.ts --tenant tenant-067 --score 98.5 --as alice');
    process.exit(1);
  }

  interface DevRecordUpdates {
    overallScore?: number;
    [key: string]: unknown;
  }
  const updates: DevRecordUpdates = {};
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
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      console.error(`[ACCESS DENIED] HTTP ${res.status}: ${err.message || 'Access denied.'}`);
      process.exit(1);
    }

    if (res.status === 409) {
      const conflict = (await res.json()) as { current?: { version?: number } };
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

    const result = (await res.json()) as { data?: unknown; tenant?: unknown };
    const record = result.data || result.tenant || result;
    process.stdout.write(
      `[Success] Successfully updated ${opts.collection}/${opts.id}: ${JSON.stringify(record, null, 2)}\n`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Connection Error]', message);
    process.exit(1);
  }
}

main();
