/**
 * `npx hummem doctor` — a minimal diagnostic that probes every layer an
 * operator would otherwise check by hand (#2548). Read-only: it never mutates
 * state. Exits 0 when all REQUIRED checks pass, 1 otherwise, so it is CI/script
 * friendly.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { styleText } from 'node:util';
import { isPluginInstalled, marketplaceDirectory, readPluginVersion } from '../utils/paths.js';
import { getBunVersion, getUvVersion, isInstallCurrent } from '../install/setup-runtime.js';
import { SettingsDefaultsManager } from '../../shared/SettingsDefaultsManager.js';
import { resolveDataDir } from '../../shared/paths.js';
import { detectLegacyEnv } from '../../shared/legacy-env.js';
import { describeUnmigratedMemory, formatBytes } from '../../shared/data-dir-migration.js';
import {
  peekDatabasePath,
  DATABASE_FILENAME,
  LEGACY_DATABASE_FILENAME,
} from '../../shared/database-path.js';

type CheckStatus = 'ok' | 'warn' | 'fail';

interface CheckResult {
  name: string;
  status: CheckStatus;
  detail: string;
  /** When false, a 'fail' does not affect the overall exit code. */
  required: boolean;
}

function probeVersion(bin: 'bun' | 'uv'): string | null {
  try {
    return bin === 'bun' ? getBunVersion() : getUvVersion();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.warn(`[doctor] Failed to probe \`${bin} --version\`:`, err);
    return null;
  }
}

async function probeWorkerHealth(workerHost: string, workerPort: string): Promise<{ status: CheckStatus; detail: string }> {
  const workerUrl = `http://${workerHost}:${workerPort}`;
  const res = await fetch(`${workerUrl}/api/health`, {
    signal: AbortSignal.timeout(3000),
  });
  if (res.ok) {
    return { status: 'ok', detail: `healthy at ${workerUrl}` };
  }
  return { status: 'warn', detail: `reachable but unhealthy (HTTP ${res.status}) at ${workerUrl}` };
}

export async function runDoctorCommand(): Promise<void> {
  const checks: CheckResult[] = [];
  const dataDir = resolveDataDir();

  // 0. Data directory and database. First because almost every "my memory is
  // empty" report is really "hummem is reading a different directory than you
  // think", and that is invisible without printing the resolved path.
  checks.push({
    name: 'Data directory',
    status: 'ok',
    detail: dataDir,
    required: false,
  });

  // Reported with the read-only peek: running diagnostics must never trigger
  // the legacy-database rename as a side effect of looking.
  const dbPath = peekDatabasePath(dataDir);
  const dbExists = existsSync(dbPath);
  const legacyDbPath = join(dataDir, LEGACY_DATABASE_FILENAME);
  const legacyDbPresent = existsSync(legacyDbPath);
  const canonicalDbPresent = existsSync(join(dataDir, DATABASE_FILENAME));

  let dbStatus: CheckStatus = dbExists ? 'ok' : 'warn';
  let dbDetail = dbExists ? dbPath : `not created yet at ${dbPath} — starts empty on first run`;

  if (canonicalDbPresent && legacyDbPresent) {
    // Deliberate refusal to overwrite, but the user must be told: one of these
    // two databases is being ignored.
    dbStatus = 'warn';
    dbDetail =
      `both ${DATABASE_FILENAME} and ${LEGACY_DATABASE_FILENAME} exist; using ${DATABASE_FILENAME}. ` +
      'Inspect both and remove the one you do not want — see MIGRATION.md';
  } else if (legacyDbPresent && !canonicalDbPresent) {
    dbStatus = 'warn';
    dbDetail = `legacy ${LEGACY_DATABASE_FILENAME} in use — it is renamed automatically on next start`;
  }

  checks.push({ name: 'Database', status: dbStatus, detail: dbDetail, required: false });

  // 0b. Un-migrated memory sitting beside the active data directory.
  //
  // Without this, a user who installed hummem but never migrated sees a clean
  // report and an empty memory, with nothing connecting the two. The legacy
  // directory is right there, and the fix is one command.
  const unmigrated = describeUnmigratedMemory({
    sourceDir: join(homedir(), '.claude-mem'),
    targetDir: dataDir,
  });
  if (unmigrated) {
    const size = formatBytes(unmigrated.bytes);
    checks.push({
      name: 'Legacy memory',
      status: 'warn',
      detail: unmigrated.blocker
        ? `${size} in ${unmigrated.sourceDir} not migrated — ${unmigrated.blocker.message}`
        : `${size} in ${unmigrated.sourceDir} not migrated — run \`hummem migrate\` to preview`,
      required: false,
    });
  }

  // 1. Bun (required — hooks run on Bun).
  const bunVersion = probeVersion('bun');
  checks.push({
    name: 'Bun runtime',
    status: bunVersion ? 'ok' : 'fail',
    detail: bunVersion ? `v${bunVersion.replace(/^v/, '')}` : 'not found on PATH — install: https://bun.sh',
    required: true,
  });

  // 2. uv (warn-only — only needed for vector search).
  const uvVersion = probeVersion('uv');
  checks.push({
    name: 'uv (vector search)',
    status: uvVersion ? 'ok' : 'warn',
    detail: uvVersion ? uvVersion : 'not found — vector/semantic search disabled until installed',
    required: false,
  });

  // 3. Plugin installed in the marketplace.
  const installed = isPluginInstalled();
  checks.push({
    name: 'Plugin installed',
    status: installed ? 'ok' : 'fail',
    detail: installed ? marketplaceDirectory() : 'run `npx hummem install`',
    required: true,
  });

  // 4. Marketplace runtime root materialized.
  const marketplaceDir = marketplaceDirectory();
  const marketplaceNodeModules = join(marketplaceDir, 'node_modules');
  const marketplaceMarker = join(marketplaceDir, '.install-version');
  const depsPresent = existsSync(marketplaceNodeModules);
  const markerPresent = existsSync(marketplaceMarker);
  const marketplaceCurrent = installed && isInstallCurrent(marketplaceDir, readPluginVersion());
  const marketplaceDetail = marketplaceCurrent
    ? 'node_modules and install marker present'
    : !depsPresent
      ? 'node_modules missing — run `npx hummem repair`'
      : !markerPresent
        ? 'install marker missing — run `npx hummem repair`'
        : 'install marker stale — run `npx hummem repair`';
  checks.push({
    name: 'Marketplace runtime',
    status: installed ? (marketplaceCurrent ? 'ok' : 'fail') : 'warn',
    detail: marketplaceDetail,
    required: installed,
  });

  // 5. Worker health.
  const workerHost = SettingsDefaultsManager.get('CLAUDE_MEM_WORKER_HOST');
  const workerPort = SettingsDefaultsManager.get('CLAUDE_MEM_WORKER_PORT');
  let workerStatus: CheckStatus = 'fail';
  let workerDetail = `no response at http://${workerHost}:${workerPort} — start with \`npx hummem start\``;
  try {
    const worker = await probeWorkerHealth(workerHost, workerPort);
    workerStatus = worker.status;
    workerDetail = worker.detail;
  } catch {
    // leave as fail
  }
  checks.push({
    name: 'Worker daemon',
    status: workerStatus,
    detail: workerDetail,
    required: false, // worker can be intentionally stopped; don't hard-fail
  });

  // 6. Deprecated environment variables. The legacy names still work, so this
  // is never a failure — but a shadowed variable (both names set) is the most
  // confusing state a user can be in, and it is invisible without this report.
  const legacyEnv = detectLegacyEnv();
  if (legacyEnv.length > 0) {
    const shadowed = legacyEnv.filter((e) => e.shadowed);
    const detail =
      shadowed.length > 0
        ? `${legacyEnv.length} set; ${shadowed.length} overridden by a HUMMEM_* equivalent and having no effect: ` +
          shadowed.map((e) => e.legacyName).join(', ')
        : `${legacyEnv.length} set (still honoured): ` +
          legacyEnv.map((e) => e.legacyName).join(', ');
    checks.push({
      name: 'Deprecated env vars',
      status: 'warn',
      detail: `${detail} — rename to HUMMEM_*; see MIGRATION.md`,
      required: false,
    });
  }

  // 7. Last recorded install error (surface remediation if present).
  const lastErrorPath = join(dataDir, 'last-install-error.json');
  if (existsSync(lastErrorPath)) {
    let detail = `present at ${lastErrorPath}`;
    try {
      const record = JSON.parse(readFileSync(lastErrorPath, 'utf-8'));
      if (record && typeof record === 'object') {
        detail = `${record.categoryId ?? 'error'}: ${record.remediation ?? detail}`;
      }
    } catch {
      // keep generic detail
    }
    checks.push({
      name: 'Last install error',
      status: 'warn',
      detail,
      required: false,
    });
  }

  const icon = (s: CheckStatus): string =>
    s === 'ok' ? styleText('green', '✓') : s === 'warn' ? styleText('yellow', '!') : styleText('red', '✗');

  console.log(styleText('bold', '\nhummem doctor\n'));
  for (const c of checks) {
    console.log(`  ${icon(c.status)} ${c.name.padEnd(22)} ${styleText('dim', c.detail)}`);
  }

  const hardFailures = checks.filter((c) => c.required && c.status === 'fail');
  console.log('');
  if (hardFailures.length === 0) {
    console.log(styleText('green', 'All required checks passed.'));
    process.exit(0);
  } else {
    console.log(styleText('red', `${hardFailures.length} required check(s) failed — see remediation above.`));
    process.exit(1);
  }
}
