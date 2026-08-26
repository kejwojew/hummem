/**
 * Legacy environment-variable compatibility.
 *
 * Every tunable in this project is namespaced `HUMMEM_*`. Installations that
 * predate the rename set the same tunables as `CLAUDE_MEM_*`, and those
 * variables are baked into hook commands, shell profiles, container images and
 * CI configuration that this code cannot reach or rewrite.
 *
 * Rather than scatter `process.env.A ?? process.env.B` across the codebase,
 * every legacy name is resolved here, in one place, under one precedence rule:
 *
 *   1. `HUMMEM_<KEY>`      — canonical, always wins
 *   2. `CLAUDE_MEM_<KEY>`  — deprecated, honoured with a one-time warning
 *
 * The canonical name winning matters: an operator who sets the new variable to
 * fix something must not be silently overridden by a stale value left in a
 * shell profile years ago.
 *
 * This module is deliberately dependency-free so the earliest boot paths
 * (path resolution, hook shims) can use it before anything else initializes.
 */

/** Prefix of the canonical namespace. */
export const CANONICAL_PREFIX = 'HUMMEM_';

/** Prefix of the deprecated namespace retained for migration. */
export const LEGACY_PREFIX = 'CLAUDE_MEM_';

/**
 * Names already warned about, so a variable read on a hot path cannot emit
 * one line per read. Module-level state is correct here: the lifetime that
 * matters is the process.
 */
const warned = new Set<string>();

/** Test seam — lets a suite assert the warning fires exactly once. */
export function resetLegacyEnvWarnings(): void {
  warned.clear();
}

function shouldWarn(): boolean {
  // Hooks speak JSON on stdout and are spawned per tool call; a deprecation
  // notice there is noise the user cannot act on mid-session. Suppressing is
  // safe because the same variable is reported by `hummem doctor`.
  return process.env.HUMMEM_SUPPRESS_LEGACY_ENV_WARNING !== '1';
}

function warnOnce(legacyName: string, canonicalName: string): void {
  if (warned.has(legacyName) || !shouldWarn()) return;
  warned.add(legacyName);
  // stderr, never stdout: CLI commands promise machine-readable JSON on stdout.
  console.warn(
    `[hummem] ${legacyName} is deprecated; use ${canonicalName}. ` +
      'The legacy name still works — see MIGRATION.md.'
  );
}

/**
 * Translate a canonical variable name to its deprecated equivalent, or
 * `undefined` when the name has no legacy form.
 */
export function legacyNameFor(canonicalName: string): string | undefined {
  if (!canonicalName.startsWith(CANONICAL_PREFIX)) return undefined;
  return LEGACY_PREFIX + canonicalName.slice(CANONICAL_PREFIX.length);
}

/**
 * Translate a deprecated variable name to its canonical equivalent, or
 * `undefined` when the name is not in the legacy namespace.
 */
export function canonicalNameFor(legacyName: string): string | undefined {
  if (!legacyName.startsWith(LEGACY_PREFIX)) return undefined;
  return CANONICAL_PREFIX + legacyName.slice(LEGACY_PREFIX.length);
}

/**
 * Read a setting by its canonical `HUMMEM_*` name, falling back to the
 * deprecated `CLAUDE_MEM_*` name.
 *
 * Returns `undefined` when neither is set, so callers can distinguish "unset"
 * from "set to empty string" — several tunables treat `''` as a real value.
 *
 * @param canonicalName Full canonical name, e.g. `HUMMEM_WORKER_PORT`.
 * @param env Environment to read; injectable for tests.
 */
export function readEnv(
  canonicalName: string,
  env: NodeJS.ProcessEnv = process.env
): string | undefined {
  const canonical = env[canonicalName];
  if (canonical !== undefined) return canonical;

  const legacyName = legacyNameFor(canonicalName);
  if (!legacyName) return undefined;

  const legacy = env[legacyName];
  if (legacy !== undefined) {
    // Only warn for the live process environment. A caller passing an explicit
    // env object is usually building a child process's environment, where the
    // deprecation belongs to that child, not to us.
    if (env === process.env) warnOnce(legacyName, canonicalName);
    return legacy;
  }

  return undefined;
}

/**
 * Report which legacy variables are currently set, for `doctor`-style output.
 * Reading this never emits a deprecation warning — it *is* the report.
 */
export function detectLegacyEnv(
  env: NodeJS.ProcessEnv = process.env
): Array<{ legacyName: string; canonicalName: string; shadowed: boolean }> {
  const found: Array<{ legacyName: string; canonicalName: string; shadowed: boolean }> = [];
  for (const legacyName of Object.keys(env)) {
    if (!legacyName.startsWith(LEGACY_PREFIX)) continue;
    const canonicalName = canonicalNameFor(legacyName)!;
    found.push({
      legacyName,
      canonicalName,
      // `shadowed` means the canonical name is also set, so the legacy value
      // has no effect — the most confusing state to be in, hence reported.
      shadowed: env[canonicalName] !== undefined,
    });
  }
  return found.sort((a, b) => a.legacyName.localeCompare(b.legacyName));
}

/**
 * Materialize canonical names into an environment object destined for a child
 * process, preserving the legacy names already present.
 *
 * Spawned children include bundled hooks and vendored Python. Emitting both
 * namespaces means a child running older bundled code still finds the value it
 * expects, while new code reads the canonical name.
 */
export function withCanonicalEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const result = { ...env };
  for (const [name, value] of Object.entries(env)) {
    if (value === undefined) continue;
    const canonicalName = canonicalNameFor(name);
    if (canonicalName && result[canonicalName] === undefined) {
      result[canonicalName] = value;
    }
    const legacyName = legacyNameFor(name);
    if (legacyName && result[legacyName] === undefined) {
      result[legacyName] = value;
    }
  }
  return result;
}
