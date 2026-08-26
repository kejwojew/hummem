import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  statSync,
  rmSync,
  chmodSync,
} from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  planDataDirMigration,
  performDataDirMigration,
  formatBytes,
  describeUnmigratedMemory,
} from '../../src/shared/data-dir-migration.js';

let root: string;
let source: string;
let target: string;

/** Nothing is alive unless a test says so. */
const noProcessAlive = () => false;
/** Plenty of room unless a test says otherwise. */
const plentyOfSpace = () => 1024 ** 4;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'hummem-migrate-'));
  source = join(root, '.claude-mem');
  target = join(root, '.hummem');
  mkdirSync(source, { recursive: true });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

/** A legacy data directory shaped like the ones observed in the wild. */
function seedLegacyDir(overrides: { settings?: Record<string, unknown> } = {}) {
  writeFileSync(join(source, 'claude-mem.db'), 'sqlite-main');
  writeFileSync(join(source, 'claude-mem.db-wal'), 'uncommitted-transactions');
  writeFileSync(join(source, 'claude-mem.db-shm'), 'shared-memory');
  writeFileSync(
    join(source, 'settings.json'),
    JSON.stringify(
      overrides.settings ?? {
        CLAUDE_MEM_DATA_DIR: source,
        CLAUDE_MEM_WORKER_PORT: '37791',
      },
      null,
      2
    )
  );
  writeFileSync(join(source, '.env'), 'ANTHROPIC_API_KEY=secret\n');
  chmodSync(join(source, '.env'), 0o600);
  mkdirSync(join(source, 'chroma'), { recursive: true });
  writeFileSync(join(source, 'chroma', 'chroma.sqlite3'), 'vectors');
  mkdirSync(join(source, 'logs'), { recursive: true });
  writeFileSync(join(source, 'logs', 'worker-2026-08-26.log'), 'noise');
}

const base = () => ({
  sourceDir: source,
  targetDir: target,
  isProcessAlive: noProcessAlive,
  freeBytes: plentyOfSpace,
});

describe('planning', () => {
  it('reports nothing to do when there is no legacy directory', () => {
    rmSync(source, { recursive: true, force: true });
    const plan = planDataDirMigration(base());
    expect(plan.blockers.map((b) => b.kind)).toEqual(['source-missing']);
    expect(plan.blockers[0].remediation).toContain('Nothing to migrate');
  });

  it('refuses when source and target are the same directory', () => {
    const plan = planDataDirMigration({ ...base(), targetDir: source });
    expect(plan.blockers.map((b) => b.kind)).toEqual(['same-directory']);
  });

  it('plans a database rename together with its sidecars', () => {
    seedLegacyDir();
    const plan = planDataDirMigration(base());
    const byName = Object.fromEntries(plan.entries.map((e) => [e.name, e]));
    expect(byName['claude-mem.db'].note).toContain('hummem.db');
    expect(byName['claude-mem.db-wal'].note).toContain('hummem.db-wal');
    expect(byName['claude-mem.db-shm'].note).toContain('hummem.db-shm');
  });

  it('skips runtime state belonging to the old install', () => {
    seedLegacyDir();
    writeFileSync(join(source, 'worker.pid'), '4242');
    writeFileSync(join(source, 'supervisor-37791.json'), '{"processes":{}}');
    const plan = planDataDirMigration(base());
    const skipped = plan.entries.filter((e) => e.skipped).map((e) => e.name);
    expect(skipped).toContain('worker.pid');
    expect(skipped).toContain('supervisor-37791.json');
    expect(skipped).toContain('logs');
  });

  it('does not count skipped entries toward the space requirement', () => {
    seedLegacyDir();
    const plan = planDataDirMigration(base());
    expect(plan.copiedBytes).toBeLessThan(plan.totalBytes);
  });
});

describe('live writer protection', () => {
  it('blocks when a pid file names a running process', () => {
    // Copying a SQLite database out from under a live writer is the standard
    // way to corrupt it, so this must be a hard stop.
    seedLegacyDir();
    writeFileSync(join(source, 'worker.pid'), String(process.pid));
    const plan = planDataDirMigration({ ...base(), isProcessAlive: () => true });
    expect(plan.blockers.map((b) => b.kind)).toContain('worker-running');
    expect(plan.blockers[0].message).toContain('worker.pid');
  });

  it('blocks when the chroma writer lock names a running process', () => {
    seedLegacyDir();
    writeFileSync(
      join(source, 'chroma', '.claude-mem-chroma-writer.lock'),
      JSON.stringify({ pid: process.pid })
    );
    const plan = planDataDirMigration({ ...base(), isProcessAlive: () => true });
    expect(plan.blockers.map((b) => b.kind)).toContain('worker-running');
  });

  it('ignores a stale pid file whose process is gone', () => {
    seedLegacyDir();
    writeFileSync(join(source, 'worker.pid'), '999999');
    const plan = planDataDirMigration(base());
    expect(plan.blockers).toEqual([]);
  });

  it('refuses to perform a migration that has blockers', () => {
    seedLegacyDir();
    writeFileSync(join(source, 'worker.pid'), String(process.pid));
    const result = performDataDirMigration({ ...base(), isProcessAlive: () => true });
    expect(result.performed).toBe(false);
    expect(existsSync(join(target, 'hummem.db'))).toBe(false);
  });
});

describe('performing the migration', () => {
  it('renames the database and carries its sidecars across', () => {
    seedLegacyDir();
    const result = performDataDirMigration(base());
    expect(result.performed).toBe(true);
    expect(readFileSync(join(target, 'hummem.db'), 'utf8')).toBe('sqlite-main');
    expect(readFileSync(join(target, 'hummem.db-wal'), 'utf8')).toBe(
      'uncommitted-transactions'
    );
    expect(readFileSync(join(target, 'hummem.db-shm'), 'utf8')).toBe('shared-memory');
  });

  it('copies the vector store directory recursively', () => {
    seedLegacyDir();
    performDataDirMigration(base());
    expect(readFileSync(join(target, 'chroma', 'chroma.sqlite3'), 'utf8')).toBe('vectors');
  });

  it('leaves the source intact in copy mode', () => {
    seedLegacyDir();
    performDataDirMigration(base());
    expect(existsSync(join(source, 'claude-mem.db'))).toBe(true);
    expect(readFileSync(join(source, 'claude-mem.db'), 'utf8')).toBe('sqlite-main');
  });

  it('reclaims the source in move mode', () => {
    seedLegacyDir();
    performDataDirMigration({ ...base(), mode: 'move' });
    expect(existsSync(join(source, 'claude-mem.db'))).toBe(false);
    expect(readFileSync(join(target, 'hummem.db'), 'utf8')).toBe('sqlite-main');
  });

  it('does not carry runtime state into the new directory', () => {
    seedLegacyDir();
    writeFileSync(join(source, 'worker.pid'), '999999');
    performDataDirMigration(base());
    expect(existsSync(join(target, 'worker.pid'))).toBe(false);
    expect(existsSync(join(target, 'logs'))).toBe(false);
  });

  it('preserves restrictive permissions on the credentials file', () => {
    // .env carries provider API keys; migration must not widen access.
    if (process.platform === 'win32') return;
    seedLegacyDir();
    performDataDirMigration(base());
    expect(statSync(join(target, '.env')).mode & 0o777).toBe(0o600);
  });
});

describe('settings rewriting', () => {
  it('repoints a data-dir setting that pinned the legacy directory', () => {
    // The trap: copied verbatim, this key makes the migrated install read the
    // old directory again, so migration appears to succeed while doing nothing.
    seedLegacyDir();
    const result = performDataDirMigration(base());
    expect(result.rewroteDataDirSetting).toBe(true);
    const migrated = JSON.parse(readFileSync(join(target, 'settings.json'), 'utf8'));
    expect(migrated.CLAUDE_MEM_DATA_DIR).toBe(target);
  });

  it('rewrites a nested path under the legacy directory', () => {
    seedLegacyDir({ settings: { CLAUDE_MEM_DATA_DIR: join(source, 'nested') } });
    performDataDirMigration(base());
    const migrated = JSON.parse(readFileSync(join(target, 'settings.json'), 'utf8'));
    expect(migrated.CLAUDE_MEM_DATA_DIR).toBe(join(target, 'nested'));
  });

  it('leaves a deliberate pointer elsewhere untouched', () => {
    const elsewhere = join(root, 'custom-memory');
    seedLegacyDir({ settings: { CLAUDE_MEM_DATA_DIR: elsewhere } });
    const result = performDataDirMigration(base());
    expect(result.rewroteDataDirSetting).toBe(false);
    const migrated = JSON.parse(readFileSync(join(target, 'settings.json'), 'utf8'));
    expect(migrated.CLAUDE_MEM_DATA_DIR).toBe(elsewhere);
  });

  it('preserves other settings verbatim', () => {
    seedLegacyDir();
    performDataDirMigration(base());
    const migrated = JSON.parse(readFileSync(join(target, 'settings.json'), 'utf8'));
    expect(migrated.CLAUDE_MEM_WORKER_PORT).toBe('37791');
  });

  it('handles the nested env schema', () => {
    seedLegacyDir({ settings: { env: { CLAUDE_MEM_DATA_DIR: source } } });
    performDataDirMigration(base());
    const migrated = JSON.parse(readFileSync(join(target, 'settings.json'), 'utf8'));
    expect(migrated.env.CLAUDE_MEM_DATA_DIR).toBe(target);
  });
});

describe('safety', () => {
  it('never overwrites a target that already holds a database', () => {
    seedLegacyDir();
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, 'hummem.db'), 'existing-memory');
    const plan = planDataDirMigration(base());
    expect(plan.blockers.map((b) => b.kind)).toContain('target-not-empty');
    const result = performDataDirMigration(base());
    expect(result.performed).toBe(false);
    expect(readFileSync(join(target, 'hummem.db'), 'utf8')).toBe('existing-memory');
  });

  it('blocks a copy that would not fit', () => {
    seedLegacyDir();
    const plan = planDataDirMigration({ ...base(), freeBytes: () => 1 });
    const blocker = plan.blockers.find((b) => b.kind === 'insufficient-space');
    expect(blocker?.remediation).toContain('--move');
  });

  it('does not require free space for a move', () => {
    seedLegacyDir();
    const plan = planDataDirMigration({ ...base(), mode: 'move', freeBytes: () => 1 });
    expect(plan.blockers.map((b) => b.kind)).not.toContain('insufficient-space');
  });

  it('proceeds when free space cannot be determined', () => {
    seedLegacyDir();
    const plan = planDataDirMigration({ ...base(), freeBytes: () => null });
    expect(plan.blockers).toEqual([]);
  });

  it('is safe to run twice', () => {
    seedLegacyDir();
    const first = performDataDirMigration(base());
    expect(first.migratedEntries).toContain('hummem.db');

    // The second run sees a populated target and stops rather than merging.
    const second = performDataDirMigration(base());
    expect(second.performed).toBe(false);
    expect(readFileSync(join(target, 'hummem.db'), 'utf8')).toBe('sqlite-main');
  });

  it('resumes a partial migration without duplicating work', () => {
    seedLegacyDir();
    // Simulate an interrupted run: settings arrived, the database did not.
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, 'settings.json'), '{"CLAUDE_MEM_WORKER_PORT":"1"}');

    const result = performDataDirMigration(base());
    expect(result.performed).toBe(true);
    expect(readFileSync(join(target, 'hummem.db'), 'utf8')).toBe('sqlite-main');
    // The pre-existing file is left as-is rather than clobbered.
    expect(result.migratedEntries).not.toContain('settings.json');
  });
});

describe('formatBytes', () => {
  it('renders magnitudes a human can act on', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(927 * 1024 * 1024)).toBe('927.0 MB');
  });
});

describe('describeUnmigratedMemory', () => {
  it('says nothing when there is no legacy directory', () => {
    rmSync(source, { recursive: true, force: true });
    expect(describeUnmigratedMemory(base())).toBeNull();
  });

  it('says nothing when source and target are the same directory', () => {
    seedLegacyDir();
    expect(describeUnmigratedMemory({ ...base(), targetDir: source })).toBeNull();
  });

  it('says nothing when the legacy directory holds only skippable files', () => {
    // Logs and stale runtime state are not memory the user must act on;
    // reporting them would be noise on every diagnostics run.
    mkdirSync(join(source, 'logs'), { recursive: true });
    writeFileSync(join(source, 'logs', 'worker.log'), 'noise');
    writeFileSync(join(source, 'worker.pid'), '999999');
    expect(describeUnmigratedMemory(base())).toBeNull();
  });

  it('reports the size that would actually be migrated', () => {
    seedLegacyDir();
    const notice = describeUnmigratedMemory(base());
    expect(notice).not.toBeNull();
    expect(notice!.sourceDir).toBe(source);
    expect(notice!.bytes).toBeGreaterThan(0);
    expect(notice!.blocker).toBeUndefined();
  });

  it('surfaces a blocker so the advice is not misleading', () => {
    // Telling someone to run migrate when it would refuse wastes their time.
    seedLegacyDir();
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, 'hummem.db'), 'existing');
    const notice = describeUnmigratedMemory(base());
    expect(notice!.blocker?.kind).toBe('target-not-empty');
  });

  it('surfaces a live writer as the blocker', () => {
    seedLegacyDir();
    writeFileSync(join(source, 'worker.pid'), String(process.pid));
    const notice = describeUnmigratedMemory({ ...base(), isProcessAlive: () => true });
    expect(notice!.blocker?.kind).toBe('worker-running');
  });
});
