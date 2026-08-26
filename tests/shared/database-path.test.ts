import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  resolveDatabasePath,
  peekDatabasePath,
  DATABASE_FILENAME,
  LEGACY_DATABASE_FILENAME,
} from '../../src/shared/database-path.js';

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), 'hummem-dbpath-'));
});

afterEach(() => {
  try {
    chmodSync(dataDir, 0o755);
  } catch {
    // directory may already be writable or gone
  }
  rmSync(dataDir, { recursive: true, force: true });
});

const canonical = () => join(dataDir, DATABASE_FILENAME);
const legacy = () => join(dataDir, LEGACY_DATABASE_FILENAME);

describe('fresh install', () => {
  it('resolves to the canonical filename with nothing to migrate', () => {
    const result = resolveDatabasePath(dataDir);
    expect(result.path).toBe(canonical());
    expect(result.action).toBe('none');
  });
});

describe('steady state', () => {
  it('returns the canonical file without touching disk', () => {
    writeFileSync(canonical(), 'db');
    const result = resolveDatabasePath(dataDir);
    expect(result.path).toBe(canonical());
    expect(result.action).toBe('canonical');
    expect(readFileSync(canonical(), 'utf8')).toBe('db');
  });
});

describe('migration', () => {
  it('renames a legacy database to the canonical name', () => {
    writeFileSync(legacy(), 'memories');

    const result = resolveDatabasePath(dataDir);

    expect(result.action).toBe('migrated');
    expect(result.path).toBe(canonical());
    expect(existsSync(legacy())).toBe(false);
    // The bytes must survive verbatim — this is the user's memory.
    expect(readFileSync(canonical(), 'utf8')).toBe('memories');
  });

  it('moves the -wal and -shm sidecars with the database', () => {
    // A -wal file holds committed transactions not yet checkpointed into the
    // main file. Separating them loses data or makes the pair unopenable.
    writeFileSync(legacy(), 'db');
    writeFileSync(`${legacy()}-wal`, 'wal');
    writeFileSync(`${legacy()}-shm`, 'shm');

    resolveDatabasePath(dataDir);

    expect(readFileSync(`${canonical()}-wal`, 'utf8')).toBe('wal');
    expect(readFileSync(`${canonical()}-shm`, 'utf8')).toBe('shm');
    expect(existsSync(`${legacy()}-wal`)).toBe(false);
    expect(existsSync(`${legacy()}-shm`)).toBe(false);
  });

  it('migrates cleanly when no sidecars are present', () => {
    writeFileSync(legacy(), 'db');
    const result = resolveDatabasePath(dataDir);
    expect(result.action).toBe('migrated');
    expect(existsSync(`${canonical()}-wal`)).toBe(false);
  });

  it('is idempotent across repeated startups', () => {
    writeFileSync(legacy(), 'memories');

    expect(resolveDatabasePath(dataDir).action).toBe('migrated');
    expect(resolveDatabasePath(dataDir).action).toBe('canonical');
    expect(resolveDatabasePath(dataDir).action).toBe('canonical');
    expect(readFileSync(canonical(), 'utf8')).toBe('memories');
  });
});

describe('both files present', () => {
  it('never overwrites an existing canonical database', () => {
    // The dangerous case: a fresh install alongside an old one, a restored
    // backup, or a half-finished manual move. Destroying either is worse than
    // doing nothing.
    writeFileSync(canonical(), 'new');
    writeFileSync(legacy(), 'old');

    const result = resolveDatabasePath(dataDir);

    expect(result.path).toBe(canonical());
    expect(result.action).toBe('canonical');
    expect(readFileSync(canonical(), 'utf8')).toBe('new');
    expect(readFileSync(legacy(), 'utf8')).toBe('old');
    expect(result.detail).toContain('leaving the legacy file untouched');
  });
});

describe('dry run', () => {
  it('reports the pending rename without performing it', () => {
    writeFileSync(legacy(), 'memories');

    const result = resolveDatabasePath(dataDir, { migrate: false });

    expect(result.action).toBe('legacy-retained');
    expect(result.path).toBe(legacy());
    expect(existsSync(legacy())).toBe(true);
    expect(existsSync(canonical())).toBe(false);
  });
});

describe('failure handling', () => {
  it('keeps using the legacy file when the rename cannot be performed', () => {
    if (process.platform === 'win32' || process.getuid?.() === 0) return;

    writeFileSync(legacy(), 'memories');
    chmodSync(dataDir, 0o500); // r-x: entries readable, renames denied

    const result = resolveDatabasePath(dataDir);

    // A stale filename is cosmetic; failing to start is not.
    expect(result.action).toBe('legacy-retained');
    expect(result.path).toBe(legacy());
    expect(result.detail).toContain('continuing with the legacy filename');

    chmodSync(dataDir, 0o755);
    expect(readFileSync(legacy(), 'utf8')).toBe('memories');
  });
});

describe('peekDatabasePath', () => {
  it('finds a legacy database without migrating it', () => {
    writeFileSync(legacy(), 'db');
    expect(peekDatabasePath(dataDir)).toBe(legacy());
    expect(existsSync(legacy())).toBe(true);
    expect(existsSync(canonical())).toBe(false);
  });

  it('prefers the canonical database when both exist', () => {
    writeFileSync(canonical(), 'new');
    writeFileSync(legacy(), 'old');
    expect(peekDatabasePath(dataDir)).toBe(canonical());
  });

  it('returns the canonical path when neither exists', () => {
    expect(peekDatabasePath(dataDir)).toBe(canonical());
  });
});

describe('legacy directory protection', () => {
  it('reads a legacy database in place instead of renaming it', () => {
    // Pointing HUMMEM_DATA_DIR at ~/.claude-mem shares one memory between two
    // installs. Renaming the database there leaves the other install unable to
    // find its own data, and it silently creates an empty replacement.
    const home = mkdtempSync(join(tmpdir(), 'hummem-home-'));
    const legacyDir = join(home, '.claude-mem');
    mkdirSync(legacyDir, { recursive: true });
    writeFileSync(join(legacyDir, LEGACY_DATABASE_FILENAME), 'shared-memory');

    const savedHome = process.env.HOME;
    process.env.HOME = home;
    try {
      const result = resolveDatabasePath(legacyDir, { home });
      expect(result.action).toBe('legacy-retained');
      expect(result.path).toBe(join(legacyDir, LEGACY_DATABASE_FILENAME));
      expect(existsSync(join(legacyDir, DATABASE_FILENAME))).toBe(false);
      expect(readFileSync(join(legacyDir, LEGACY_DATABASE_FILENAME), 'utf8')).toBe(
        'shared-memory'
      );
      expect(result.detail).toContain('hummem migrate');
    } finally {
      if (savedHome === undefined) delete process.env.HOME;
      else process.env.HOME = savedHome;
      rmSync(home, { recursive: true, force: true });
    }
  });

  it('still renames inside an ordinary data directory', () => {
    const home = mkdtempSync(join(tmpdir(), 'hummem-home-'));
    const ordinary = join(home, 'somewhere-else');
    mkdirSync(ordinary, { recursive: true });
    writeFileSync(join(ordinary, LEGACY_DATABASE_FILENAME), 'memories');

    const savedHome = process.env.HOME;
    process.env.HOME = home;
    try {
      expect(resolveDatabasePath(ordinary, { home }).action).toBe('migrated');
      expect(readFileSync(join(ordinary, DATABASE_FILENAME), 'utf8')).toBe('memories');
    } finally {
      if (savedHome === undefined) delete process.env.HOME;
      else process.env.HOME = savedHome;
      rmSync(home, { recursive: true, force: true });
    }
  });
});
