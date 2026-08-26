import { existsSync, renameSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';

/**
 * Database filename resolution and one-time rename of the legacy file.
 *
 * The SQLite database was named after the upstream project. Renaming it is
 * cosmetic to the code — every access goes through a resolved path — but it is
 * the single most visible artifact a user sees when they open the data
 * directory, so leaving it stale undermines every other rename.
 *
 * The rename is the one operation in this project that can destroy user data,
 * so the rules here are deliberately conservative:
 *
 *   - Never overwrite an existing canonical database.
 *   - Move SQLite's `-wal` / `-shm` sidecars with the main file, or not at all.
 *   - Prefer `renameSync` (atomic within a filesystem) over copy-then-delete.
 *   - On any failure, keep using the legacy file rather than failing to start.
 *
 * A user losing memory is far worse than a user seeing an old filename.
 */

/** Canonical database filename. */
export const DATABASE_FILENAME = 'hummem.db';

/** Filename used before the project became independent. */
export const LEGACY_DATABASE_FILENAME = 'claude-mem.db';

/**
 * Whether this directory is the conventional home of a legacy install.
 *
 * Compared by resolved path rather than by name so a symlinked or relative
 * spelling of the same directory is still recognised.
 */
function isLegacyDataDir(dataDir: string, home: string = homedir()): boolean {
  return resolve(dataDir) === resolve(join(home, '.claude-mem'));
}

/** SQLite sidecar suffixes that must travel with the main database file. */
const SIDECAR_SUFFIXES = ['-wal', '-shm'] as const;

export interface DatabaseMigrationResult {
  /** Path callers should open. */
  path: string;
  /** What the resolver did. */
  action: 'canonical' | 'migrated' | 'legacy-retained' | 'none';
  /** Human-readable reason, for logging and `doctor`. */
  detail?: string;
}

/**
 * Resolve the database path inside `dataDir`, renaming the legacy file when it
 * is safe to do so.
 *
 * Idempotent and safe to call on every startup: once the canonical file
 * exists, this is a single `existsSync` check.
 *
 * @param dataDir Resolved data directory.
 * @param migrate When false, report what would happen without touching disk.
 */
export function resolveDatabasePath(
  dataDir: string,
  // `home` is injectable because homedir() reads the OS account record rather
  // than $HOME, so a test cannot otherwise exercise the legacy-directory guard.
  { migrate = true, home = homedir() }: { migrate?: boolean; home?: string } = {}
): DatabaseMigrationResult {
  const canonicalPath = join(dataDir, DATABASE_FILENAME);
  const legacyPath = join(dataDir, LEGACY_DATABASE_FILENAME);

  const canonicalExists = existsSync(canonicalPath);
  const legacyExists = existsSync(legacyPath);

  // Steady state after migration, and the common case on every startup.
  if (canonicalExists && !legacyExists) {
    return { path: canonicalPath, action: 'canonical' };
  }

  // Both present. Something already created a canonical database — a fresh
  // install alongside an old one, a restored backup, a half-finished manual
  // move. Overwriting either one could destroy memory, so touch neither and
  // let the user decide.
  if (canonicalExists && legacyExists) {
    return {
      path: canonicalPath,
      action: 'canonical',
      detail:
        `both ${DATABASE_FILENAME} and ${LEGACY_DATABASE_FILENAME} exist in ${dataDir}; ` +
        `using ${DATABASE_FILENAME} and leaving the legacy file untouched. ` +
        'Remove or merge it manually once you have confirmed which one you want.',
    };
  }

  // Nothing to migrate: a fresh install creates the canonical file.
  if (!legacyExists) {
    return { path: canonicalPath, action: 'none' };
  }

  // Refuse to rename inside a directory that still belongs to a legacy
  // install. Someone who points HUMMEM_DATA_DIR at ~/.claude-mem to share one
  // memory has not asked to retire the other project — renaming its database
  // out from under it leaves that install unable to find its own data, and it
  // silently creates an empty replacement instead. Read the legacy file in
  // place; `hummem migrate` is the supported way to move.
  if (isLegacyDataDir(dataDir, home)) {
    return {
      path: legacyPath,
      action: 'legacy-retained',
      detail:
        `${dataDir} is a legacy data directory shared with another install; ` +
        `using ${LEGACY_DATABASE_FILENAME} in place rather than renaming it. ` +
        'Run `hummem migrate` to move your memory to its own directory.',
    };
  }

  if (!migrate) {
    return {
      path: legacyPath,
      action: 'legacy-retained',
      detail: `would rename ${LEGACY_DATABASE_FILENAME} to ${DATABASE_FILENAME}`,
    };
  }

  // Only the legacy file exists — the migration case.
  try {
    // Move sidecars first. A `-wal` file holds committed transactions not yet
    // checkpointed into the main file; separating it from its database can
    // lose those transactions or make the pair unopenable. Moving them before
    // the main file means a crash mid-migration leaves the legacy database
    // discoverable and intact rather than half-renamed.
    const movedSidecars: Array<[string, string]> = [];
    try {
      for (const suffix of SIDECAR_SUFFIXES) {
        const from = `${legacyPath}${suffix}`;
        if (!existsSync(from)) continue;
        const to = `${canonicalPath}${suffix}`;
        renameSync(from, to);
        movedSidecars.push([to, from]);
      }
      renameSync(legacyPath, canonicalPath);
    } catch (error) {
      // Put the sidecars back so the legacy database stays consistent.
      for (const [movedTo, originalFrom] of movedSidecars) {
        try {
          renameSync(movedTo, originalFrom);
        } catch {
          // Best effort: the throw below reports the original failure, which
          // is the actionable one.
        }
      }
      throw error;
    }

    return {
      path: canonicalPath,
      action: 'migrated',
      detail: `renamed ${LEGACY_DATABASE_FILENAME} to ${DATABASE_FILENAME} in ${dataDir}`,
    };
  } catch (error) {
    // A read-only volume, a permission problem, or a cross-device data dir.
    // Keep working against the legacy file: a stale filename is cosmetic,
    // failing to start is not.
    return {
      path: legacyPath,
      action: 'legacy-retained',
      detail:
        `could not rename ${LEGACY_DATABASE_FILENAME} to ${DATABASE_FILENAME} ` +
        `(${error instanceof Error ? error.message : String(error)}); ` +
        'continuing with the legacy filename',
    };
  }
}

/**
 * Resolve the database path without performing or reporting a migration.
 *
 * For read-only callers (diagnostics, external scripts) that must not mutate
 * the data directory as a side effect of looking at it.
 */
export function peekDatabasePath(dataDir: string): string {
  const canonicalPath = join(dataDir, DATABASE_FILENAME);
  if (existsSync(canonicalPath)) return canonicalPath;
  const legacyPath = join(dataDir, LEGACY_DATABASE_FILENAME);
  if (existsSync(legacyPath)) return legacyPath;
  return canonicalPath;
}
