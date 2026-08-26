import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  copyFileSync,
  renameSync,
  rmSync,
  chmodSync,
  constants as fsConstants,
  statfsSync,
} from 'fs';
import { join, resolve, sep } from 'path';
import { homedir } from 'os';
import { DATABASE_FILENAME, LEGACY_DATABASE_FILENAME } from './database-path.js';

/**
 * Migration of a legacy `~/.claude-mem` data directory to `~/.hummem`.
 *
 * This is the highest-risk operation the project performs: the source
 * directory holds the user's entire memory, sometimes approaching a gigabyte,
 * plus API credentials. It also frequently contains state that makes a naive
 * copy actively wrong rather than merely inefficient:
 *
 *   - A running worker leaves uncommitted transactions in the SQLite `-wal`
 *     file. Copying the database out from under a live writer is the standard
 *     way to produce a corrupt SQLite file, so a live writer aborts migration.
 *
 *   - `settings.json` usually pins `CLAUDE_MEM_DATA_DIR` to the *legacy*
 *     absolute path. Copied verbatim, the migrated install reads that key and
 *     silently keeps using the old directory — the migration appears to
 *     succeed while changing nothing.
 *
 *   - `.env` carries provider API keys. Its permissions must never be widened
 *     in transit.
 *
 * Every operation is planned before anything is written, so `--dry-run` shows
 * exactly what a real run would do.
 */

/** Files that indicate a live writer and must not be carried across. */
const RUNTIME_STATE_FILENAMES = [
  'worker.pid',
  '.server-beta.pid',
  '.server-beta.port',
  '.server-beta.runtime.json',
];

/** Runtime state matched by shape rather than exact name. */
const RUNTIME_STATE_PATTERNS = [/^worker-\d+\.pid$/, /^supervisor(-\d+)?\.json$/];

/** Entries that are regenerated and not worth copying. */
const SKIPPED_ENTRIES = ['logs'];

export type MigrationBlockerKind =
  | 'source-missing'
  | 'worker-running'
  | 'target-not-empty'
  | 'insufficient-space'
  | 'same-directory';

export interface MigrationBlocker {
  kind: MigrationBlockerKind;
  message: string;
  /** What the user can do about it, in their own terms. */
  remediation: string;
}

export interface MigrationPlanEntry {
  name: string;
  kind: 'file' | 'directory';
  bytes: number;
  /** Why this entry is skipped, when it is. */
  skipped?: string;
  /** Extra handling this entry receives beyond a plain copy. */
  note?: string;
}

export interface MigrationPlan {
  sourceDir: string;
  targetDir: string;
  mode: 'copy' | 'move';
  entries: MigrationPlanEntry[];
  totalBytes: number;
  copiedBytes: number;
  blockers: MigrationBlocker[];
  /** True when there is nothing left to do because migration already ran. */
  alreadyMigrated: boolean;
  /**
   * Advisory notes that do not prevent migration but change what a careful
   * user would do first.
   */
  warnings: string[];
}

export interface MigrationResult {
  plan: MigrationPlan;
  performed: boolean;
  migratedEntries: string[];
  rewroteDataDirSetting: boolean;
  errors: Array<{ entry: string; message: string }>;
  /**
   * Post-migration verification. `verified` is false when any migrated entry
   * does not match its source, which is the signal not to delete anything.
   */
  verified: boolean;
  mismatches: string[];
}

export interface MigrationOptions {
  sourceDir?: string;
  targetDir?: string;
  /** `copy` keeps the source intact (default); `move` reclaims the space. */
  mode?: 'copy' | 'move';
  /** Injected for tests; defaults to a real PID liveness probe. */
  isProcessAlive?: (pid: number) => boolean;
  /** Injected for tests; defaults to reading the filesystem. */
  freeBytes?: (path: string) => number | null;
}

function defaultIsProcessAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error: unknown) {
    // EPERM means the process exists but belongs to another user.
    return (error as NodeJS.ErrnoException)?.code === 'EPERM';
  }
}

function isRuntimeStateEntry(name: string): boolean {
  return (
    RUNTIME_STATE_FILENAMES.includes(name) ||
    RUNTIME_STATE_PATTERNS.some((rx) => rx.test(name))
  );
}

function directorySize(path: string): number {
  let total = 0;
  let entries: string[];
  try {
    entries = readdirSync(path);
  } catch {
    return 0;
  }
  for (const entry of entries) {
    const full = join(path, entry);
    try {
      const stat = statSync(full);
      total += stat.isDirectory() ? directorySize(full) : stat.size;
    } catch {
      // Vanished mid-scan; size is an estimate, not a contract.
    }
  }
  return total;
}

/**
 * Detect a live writer holding the legacy directory.
 *
 * Two independent signals, because either alone misses real cases: a PID file
 * left by a worker, and Chroma's writer lock. A stale PID file is not a
 * blocker — only a PID that is actually alive.
 */
function detectLiveWriters(
  sourceDir: string,
  isAlive: (pid: number) => boolean
): string[] {
  const holders: string[] = [];

  let entries: string[] = [];
  try {
    entries = readdirSync(sourceDir);
  } catch {
    return holders;
  }

  for (const entry of entries) {
    if (!entry.endsWith('.pid')) continue;
    try {
      const raw = readFileSync(join(sourceDir, entry), 'utf-8').trim();
      // Either a bare PID or a JSON record carrying one.
      const pid = raw.startsWith('{') ? Number(JSON.parse(raw)?.pid) : Number(raw);
      if (Number.isFinite(pid) && isAlive(pid)) {
        holders.push(`${entry} (pid ${pid})`);
      }
    } catch {
      // Unreadable or malformed PID file proves nothing.
    }
  }

  // Chroma keeps its own writer lock alongside the vector store. Accept either
  // a JSON record or a bare PID: the format has varied across versions, and
  // failing to parse must not read as "nothing is running".
  const chromaLock = join(sourceDir, 'chroma', '.claude-mem-chroma-writer.lock');
  if (existsSync(chromaLock)) {
    let raw = '';
    try {
      raw = readFileSync(chromaLock, 'utf-8').trim();
    } catch {
      raw = '';
    }

    let pid = Number.NaN;
    if (raw.startsWith('{')) {
      try {
        pid = Number(JSON.parse(raw)?.pid);
      } catch {
        pid = Number.NaN;
      }
    } else {
      pid = Number(raw);
    }

    if (Number.isFinite(pid) && isAlive(pid)) {
      holders.push(`chroma writer lock (pid ${pid})`);
    } else if (!Number.isFinite(pid)) {
      // A lock file exists but names no process we can check. Treat it as
      // occupied: a false alarm costs the user one `stop`, while a false
      // all-clear can corrupt the vector store.
      holders.push('chroma writer lock (unreadable — assuming a live writer)');
    }
  }

  return holders;
}

/**
 * Whether the SQLite write-ahead log suggests an unclean or active database.
 *
 * A `-wal` file containing data means transactions were committed but not yet
 * checkpointed into the main file. That is normal while a writer is attached
 * and after an unclean shutdown, and in both cases copying only the main file
 * would lose those transactions. Sidecars are migrated together, so this is
 * not a blocker — but it is worth stating, because a user who sees it and
 * assumes the database is quiescent may skip stopping their worker.
 */
function hasPendingWal(sourceDir: string): number {
  for (const name of [
    `${LEGACY_DATABASE_FILENAME}-wal`,
    `${DATABASE_FILENAME}-wal`,
  ]) {
    try {
      const size = statSync(join(sourceDir, name)).size;
      if (size > 0) return size;
    } catch {
      // Absent sidecar means nothing pending for that database.
    }
  }
  return 0;
}

function freeBytesOn(path: string): number | null {
  // statfsSync is absent on older runtimes and some platforms; treat an
  // unavailable probe as "unknown" rather than as "no space".
  if (typeof statfsSync !== 'function') return null;
  try {
    const info = statfsSync(path);
    return Number(info.bavail) * Number(info.bsize);
  } catch {
    return null;
  }
}

/**
 * Build the migration plan without touching disk.
 *
 * Blockers are collected rather than thrown so the caller can present every
 * problem at once instead of making the user rediscover them one run at a time.
 */
export function planDataDirMigration(options: MigrationOptions = {}): MigrationPlan {
  const sourceDir = resolve(options.sourceDir ?? join(homedir(), '.claude-mem'));
  const targetDir = resolve(options.targetDir ?? join(homedir(), '.hummem'));
  const mode = options.mode ?? 'copy';
  const isAlive = options.isProcessAlive ?? defaultIsProcessAlive;
  const free = options.freeBytes ?? freeBytesOn;

  const blockers: MigrationBlocker[] = [];
  const entries: MigrationPlanEntry[] = [];

  if (sourceDir === targetDir) {
    blockers.push({
      kind: 'same-directory',
      message: `source and target are the same directory (${sourceDir})`,
      remediation: 'Nothing to migrate. Unset HUMMEM_DATA_DIR if you meant to use the default.',
    });
    return {
      sourceDir, targetDir, mode, entries, totalBytes: 0, copiedBytes: 0,
      blockers, alreadyMigrated: false, warnings: [],
    };
  }

  if (!existsSync(sourceDir)) {
    blockers.push({
      kind: 'source-missing',
      message: `no legacy data directory at ${sourceDir}`,
      remediation:
        'Nothing to migrate — hummem starts with an empty memory. ' +
        'If your data lives elsewhere, pass --from <path>.',
    });
    return {
      sourceDir, targetDir, mode, entries, totalBytes: 0, copiedBytes: 0,
      blockers, alreadyMigrated: false, warnings: [],
    };
  }

  const liveWriters = detectLiveWriters(sourceDir, isAlive);
  if (liveWriters.length > 0) {
    blockers.push({
      kind: 'worker-running',
      message: `a process is still writing to ${sourceDir}: ${liveWriters.join(', ')}`,
      remediation:
        'Stop it first — copying a SQLite database out from under a live writer ' +
        'can corrupt it. When migrating, run `claude-mem stop` for the legacy ' +
        'install (or `hummem stop`), close any IDE session using memory, then ' +
        're-run this command.',
    });
  }

  // A target holding a database already is not something to merge into.
  const targetHasDatabase =
    existsSync(join(targetDir, DATABASE_FILENAME)) ||
    existsSync(join(targetDir, LEGACY_DATABASE_FILENAME));
  if (targetHasDatabase) {
    blockers.push({
      kind: 'target-not-empty',
      message: `${targetDir} already contains a database`,
      remediation:
        'Migration never overwrites an existing memory. Inspect both directories ' +
        'and remove or rename the one you do not want, then re-run.',
    });
  }

  let totalBytes = 0;
  let copiedBytes = 0;

  for (const name of readdirSync(sourceDir).sort()) {
    const full = join(sourceDir, name);
    let isDirectory = false;
    let bytes = 0;
    try {
      const stat = statSync(full);
      isDirectory = stat.isDirectory();
      bytes = isDirectory ? directorySize(full) : stat.size;
    } catch {
      continue;
    }
    totalBytes += bytes;

    const entry: MigrationPlanEntry = {
      name,
      kind: isDirectory ? 'directory' : 'file',
      bytes,
    };

    if (isRuntimeStateEntry(name)) {
      entry.skipped = 'runtime state belonging to the old install';
    } else if (SKIPPED_ENTRIES.includes(name)) {
      entry.skipped = 'regenerated automatically';
    } else if (name === LEGACY_DATABASE_FILENAME) {
      entry.note = `renamed to ${DATABASE_FILENAME}`;
      copiedBytes += bytes;
    } else if (name.startsWith(`${LEGACY_DATABASE_FILENAME}-`)) {
      // -wal / -shm must travel with the database they belong to.
      const suffix = name.slice(LEGACY_DATABASE_FILENAME.length);
      entry.note = `renamed to ${DATABASE_FILENAME}${suffix}`;
      copiedBytes += bytes;
    } else if (name === 'settings.json') {
      entry.note = 'CLAUDE_MEM_DATA_DIR rewritten to the new location';
      copiedBytes += bytes;
    } else if (name === '.env') {
      entry.note = 'permissions preserved (contains provider credentials)';
      copiedBytes += bytes;
    } else {
      copiedBytes += bytes;
    }

    entries.push(entry);
  }

  // Only a copy needs room for a second set of bytes.
  if (mode === 'copy') {
    const available = free(targetDir) ?? free(homedir());
    if (available !== null && available < copiedBytes) {
      blockers.push({
        kind: 'insufficient-space',
        message:
          `need ~${formatBytes(copiedBytes)} but only ${formatBytes(available)} is free`,
        remediation:
          'Free some space, or re-run with --move to relocate the files instead ' +
          'of duplicating them.',
      });
    }
  }

  const warnings: string[] = [];
  const walBytes = hasPendingWal(sourceDir);
  if (walBytes > 0 && blockers.every((b) => b.kind !== 'worker-running')) {
    // No live writer was detected, yet the write-ahead log holds committed
    // transactions. Either a worker exited uncleanly, or one is running that
    // left no PID file this code can see. Say so rather than let the user
    // assume the database is quiescent.
    warnings.push(
      `the write-ahead log holds ${formatBytes(walBytes)} of committed data — ` +
        'it will be migrated with the database, but make sure nothing is still ' +
        'running before you apply'
    );
  }

  return {
    sourceDir,
    targetDir,
    mode,
    entries,
    totalBytes,
    copiedBytes,
    blockers,
    alreadyMigrated: false,
    warnings,
  };
}

/** Human-readable byte count for plan output and error messages. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

/**
 * Copy one file so that the destination path never holds a partial result.
 *
 * Writing directly to the final path means an interruption — power loss, a
 * signal, a full disk — leaves a truncated file that looks complete to
 * `existsSync`. A later resume then skips it and the user silently keeps a
 * corrupt vector store or database.
 *
 * Copying to a sibling temporary name and renaming into place makes the
 * destination appear atomically: it is either absent or whole. Rename within
 * one directory is atomic on every filesystem this runs on.
 */
function copyFileAtomic(from: string, to: string, mode: number): void {
  const temp = `${to}.hummem-partial-${process.pid}`;
  try {
    copyFileSync(from, temp, fsConstants.COPYFILE_FICLONE);
    chmodSync(temp, mode & 0o777);

    // Verify before publishing: a short write here is the failure this whole
    // dance exists to catch, and it is cheap to detect.
    const copied = statSync(temp).size;
    const original = statSync(from).size;
    if (copied !== original) {
      throw new Error(
        `short copy: ${copied} of ${original} bytes reached ${to}`
      );
    }

    renameSync(temp, to);
  } catch (error) {
    try {
      rmSync(temp, { force: true });
    } catch {
      // Best effort: the original error is the one worth reporting.
    }
    throw error;
  }
}

function copyRecursive(from: string, to: string): void {
  const stat = statSync(from);
  if (!stat.isDirectory()) {
    // Preserve the source mode so a 0600 credentials file cannot become 0644.
    copyFileAtomic(from, to, stat.mode);
    return;
  }
  mkdirSync(to, { recursive: true });
  chmodSync(to, stat.mode & 0o777);
  for (const entry of readdirSync(from)) {
    copyRecursive(join(from, entry), join(to, entry));
  }
}

/**
 * Whether a destination entry can be trusted as an already-migrated copy.
 *
 * `existsSync` alone is not enough: an entry left behind by an interrupted run
 * exists but may be truncated. Comparing sizes catches exactly that, without
 * the cost of hashing a multi-hundred-megabyte vector store on every resume.
 *
 * Anything that does not match is treated as incomplete and recopied, because
 * re-copying a good file is cheap and keeping a bad one is not.
 */
function isCompleteCopy(from: string, to: string): boolean {
  let sourceStat;
  let targetStat;
  try {
    sourceStat = statSync(from);
    targetStat = statSync(to);
  } catch {
    return false;
  }

  if (sourceStat.isDirectory() !== targetStat.isDirectory()) return false;

  if (!sourceStat.isDirectory()) {
    return sourceStat.size === targetStat.size;
  }

  // A directory is complete only when every child is.
  let entries: string[];
  try {
    entries = readdirSync(from);
  } catch {
    return false;
  }
  return entries.every((entry) => isCompleteCopy(join(from, entry), join(to, entry)));
}

function transfer(from: string, to: string, mode: 'copy' | 'move'): void {
  if (mode === 'move') {
    try {
      // A rename never has a window where the data exists nowhere.
      renameSync(from, to);
      return;
    } catch {
      // Cross-device rename fails; fall through to copy-then-remove.
    }
  }

  copyRecursive(from, to);

  if (mode === 'move') {
    // Deleting the source is the only irreversible step in this module, so it
    // happens strictly after the copy has been verified complete. A failed
    // verification keeps both sides: the user still has their memory, and the
    // partial destination is reported rather than silently trusted.
    if (!isCompleteCopy(from, to)) {
      throw new Error(
        `refusing to remove ${from}: the copy at ${to} is incomplete`
      );
    }
    rmSync(from, { recursive: true, force: true });
  }
}

/**
 * Rewrite the migrated settings file so it points at the new directory.
 *
 * Without this the migrated install reads `CLAUDE_MEM_DATA_DIR` out of its own
 * settings, resolves the legacy path, and keeps writing there — the migration
 * looks successful while changing nothing.
 */
function rewriteDataDirSetting(settingsPath: string, sourceDir: string, targetDir: string): boolean {
  let parsed: Record<string, unknown>;
  let raw: string;
  try {
    raw = readFileSync(settingsPath, 'utf-8');
    parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch {
    return false;
  }

  const flat = (parsed.env && typeof parsed.env === 'object'
    ? (parsed.env as Record<string, unknown>)
    : parsed) as Record<string, unknown>;

  let changed = false;
  for (const key of ['CLAUDE_MEM_DATA_DIR', 'HUMMEM_DATA_DIR']) {
    const value = flat[key];
    if (typeof value !== 'string' || value.length === 0) continue;
    const normalized = resolve(value.replace(/^~(?=$|\/)/, homedir()));
    // Rewrite only a pointer at the directory being migrated. A deliberate
    // pointer somewhere else is the user's choice and is left alone.
    if (normalized === sourceDir || normalized.startsWith(sourceDir + sep)) {
      flat[key] = normalized === sourceDir
        ? targetDir
        : targetDir + normalized.slice(sourceDir.length);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(settingsPath, JSON.stringify(parsed, null, 2) + '\n');
  }
  return changed;
}

/**
 * Execute a plan. Refuses to act when the plan reports blockers.
 *
 * Entry-level failures are collected rather than aborting the run: a single
 * unreadable log file should not strand a user with a half-migrated memory.
 */
export function performDataDirMigration(options: MigrationOptions = {}): MigrationResult {
  const plan = planDataDirMigration(options);
  const result: MigrationResult = {
    plan,
    performed: false,
    migratedEntries: [],
    rewroteDataDirSetting: false,
    errors: [],
    verified: false,
    mismatches: [],
  };

  if (plan.blockers.length > 0) return result;

  mkdirSync(plan.targetDir, { recursive: true });

  for (const entry of plan.entries) {
    if (entry.skipped) continue;

    const from = join(plan.sourceDir, entry.name);
    let targetName = entry.name;
    if (entry.name === LEGACY_DATABASE_FILENAME) {
      targetName = DATABASE_FILENAME;
    } else if (entry.name.startsWith(`${LEGACY_DATABASE_FILENAME}-`)) {
      targetName = DATABASE_FILENAME + entry.name.slice(LEGACY_DATABASE_FILENAME.length);
    }
    const to = join(plan.targetDir, targetName);

    // Idempotence with verification. A previous run may have been interrupted
    // mid-copy, leaving a truncated file that exists but is unusable; skipping
    // it on the strength of existsSync alone is how a resume silently keeps
    // corrupt data. Recopy anything that does not match the source.
    if (existsSync(to)) {
      if (isCompleteCopy(from, to)) continue;
      try {
        rmSync(to, { recursive: true, force: true });
      } catch (error: unknown) {
        // Cannot clear the stale entry, so the copy below would silently do
        // nothing. Record it: an unexplained mismatch at the end is worse than
        // a named failure here.
        result.errors.push({
          entry: entry.name,
          message: `could not replace incomplete ${targetName}: ` +
            (error instanceof Error ? error.message : String(error)),
        });
        continue;
      }
    }

    try {
      transfer(from, to, plan.mode);
      result.migratedEntries.push(targetName);
    } catch (error: unknown) {
      result.errors.push({
        entry: entry.name,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const migratedSettings = join(plan.targetDir, 'settings.json');
  if (existsSync(migratedSettings)) {
    result.rewroteDataDirSetting = rewriteDataDirSetting(
      migratedSettings,
      plan.sourceDir,
      plan.targetDir
    );
  }

  // Verify what was actually written rather than trusting that the copies
  // succeeded. In copy mode the source is still there, so a mismatch is
  // recoverable — but only if the user is told about it.
  for (const entry of plan.entries) {
    if (entry.skipped) continue;
    const from = join(plan.sourceDir, entry.name);
    let targetName = entry.name;
    if (entry.name === LEGACY_DATABASE_FILENAME) {
      targetName = DATABASE_FILENAME;
    } else if (entry.name.startsWith(`${LEGACY_DATABASE_FILENAME}-`)) {
      targetName = DATABASE_FILENAME + entry.name.slice(LEGACY_DATABASE_FILENAME.length);
    }
    // A moved source is gone by design; nothing left to compare against.
    if (plan.mode === 'move' && !existsSync(from)) continue;

    // settings.json is rewritten on purpose, so a size difference there is
    // expected rather than evidence of a bad copy.
    if (targetName === 'settings.json') continue;

    if (!isCompleteCopy(from, join(plan.targetDir, targetName))) {
      result.mismatches.push(targetName);
    }
  }

  result.verified = result.mismatches.length === 0 && result.errors.length === 0;

  result.performed = true;
  return result;
}

export interface LegacyMemoryNotice {
  /** Bytes that would be migrated, excluding skipped entries. */
  bytes: number;
  /** Directory holding the un-migrated memory. */
  sourceDir: string;
  /** Present when something would stop a migration right now. */
  blocker?: MigrationBlocker;
}

/**
 * Describe un-migrated memory sitting beside the active data directory, or
 * `null` when there is nothing worth telling the user.
 *
 * Extracted from the diagnostics command so the decision — including the
 * "legacy directory exists but holds only skippable files" case — is testable
 * without the bundled plugin layout that command requires.
 */
export function describeUnmigratedMemory(
  options: MigrationOptions = {}
): LegacyMemoryNotice | null {
  const sourceDir = resolve(options.sourceDir ?? join(homedir(), '.claude-mem'));
  const targetDir = resolve(options.targetDir ?? join(homedir(), '.hummem'));

  if (sourceDir === targetDir || !existsSync(sourceDir)) return null;

  const plan = planDataDirMigration({ ...options, sourceDir, targetDir });

  // A directory holding only logs and stale PID files is not memory the user
  // needs to act on; saying so would be noise on every run.
  if (!plan.entries.some((entry) => !entry.skipped)) return null;

  return {
    bytes: plan.copiedBytes,
    sourceDir,
    blocker: plan.blockers[0],
  };
}
