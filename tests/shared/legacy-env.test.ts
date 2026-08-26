import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import {
  readEnv,
  detectLegacyEnv,
  withCanonicalEnv,
  legacyNameFor,
  canonicalNameFor,
  resetLegacyEnvWarnings,
  enableLegacyEnvWarnings,
  getUsedLegacyEnvNames,
} from '../../src/shared/legacy-env.js';

/**
 * Env-restoration discipline: every test mutating process.env captures the
 * prior value and restores it, so a failure cannot leak into sibling suites.
 */
const TOUCHED = [
  'HUMMEM_DATA_DIR',
  'CLAUDE_MEM_DATA_DIR',
  'HUMMEM_WORKER_PORT',
  'CLAUDE_MEM_WORKER_PORT',
  'HUMMEM_SUPPRESS_LEGACY_ENV_WARNING',
];

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = {};
  for (const key of TOUCHED) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  resetLegacyEnvWarnings();
});

afterEach(() => {
  for (const key of TOUCHED) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  resetLegacyEnvWarnings();
});

describe('name translation', () => {
  it('maps a canonical name to its legacy form', () => {
    expect(legacyNameFor('HUMMEM_DATA_DIR')).toBe('CLAUDE_MEM_DATA_DIR');
  });

  it('maps a legacy name to its canonical form', () => {
    expect(canonicalNameFor('CLAUDE_MEM_WORKER_PORT')).toBe('HUMMEM_WORKER_PORT');
  });

  it('returns undefined for names outside either namespace', () => {
    expect(legacyNameFor('PATH')).toBeUndefined();
    expect(canonicalNameFor('PATH')).toBeUndefined();
  });
});

describe('readEnv precedence', () => {
  it('returns the canonical value when only it is set', () => {
    process.env.HUMMEM_DATA_DIR = '/canonical';
    expect(readEnv('HUMMEM_DATA_DIR')).toBe('/canonical');
  });

  it('falls back to the legacy value when the canonical is unset', () => {
    process.env.CLAUDE_MEM_DATA_DIR = '/legacy';
    expect(readEnv('HUMMEM_DATA_DIR')).toBe('/legacy');
  });

  it('lets the canonical name win when both are set', () => {
    // The critical case: an operator setting the new variable to fix something
    // must not be overridden by a stale value in a shell profile.
    process.env.HUMMEM_DATA_DIR = '/canonical';
    process.env.CLAUDE_MEM_DATA_DIR = '/legacy';
    expect(readEnv('HUMMEM_DATA_DIR')).toBe('/canonical');
  });

  it('returns undefined when neither is set', () => {
    expect(readEnv('HUMMEM_DATA_DIR')).toBeUndefined();
  });

  it('distinguishes an empty string from unset', () => {
    process.env.HUMMEM_DATA_DIR = '';
    expect(readEnv('HUMMEM_DATA_DIR')).toBe('');
  });

  it('reads from an injected environment without touching process.env', () => {
    expect(readEnv('HUMMEM_WORKER_PORT', { CLAUDE_MEM_WORKER_PORT: '37800' })).toBe('37800');
    expect(process.env.HUMMEM_WORKER_PORT).toBeUndefined();
  });
});

describe('deprecation recording', () => {
  it('records a legacy variable once, however many times it is read', () => {
    process.env.CLAUDE_MEM_DATA_DIR = '/legacy';
    readEnv('HUMMEM_DATA_DIR');
    readEnv('HUMMEM_DATA_DIR');
    readEnv('HUMMEM_DATA_DIR');
    expect(getUsedLegacyEnvNames()).toEqual(['CLAUDE_MEM_DATA_DIR']);
  });

  it('records nothing when the canonical name is used', () => {
    process.env.HUMMEM_DATA_DIR = '/canonical';
    readEnv('HUMMEM_DATA_DIR');
    expect(getUsedLegacyEnvNames()).toEqual([]);
  });

  it('records nothing when reading an explicitly injected environment', () => {
    // Building a child's environment is not the parent's deprecation to report.
    readEnv('HUMMEM_DATA_DIR', { CLAUDE_MEM_DATA_DIR: '/legacy' });
    expect(getUsedLegacyEnvNames()).toEqual([]);
  });

  it('stays silent until an entry point opts in', () => {
    // Hooks never opt in: they are spawned per tool call, their stderr is read
    // as evidence of failure, and the notice is unactionable mid-session.
    const write = spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      process.env.CLAUDE_MEM_DATA_DIR = '/legacy';
      readEnv('HUMMEM_DATA_DIR');
      expect(write).not.toHaveBeenCalled();
    } finally {
      write.mockRestore();
    }
  });

  it('flushes names recorded before the opt-in', () => {
    // DATA_DIR resolves at import time, long before any entry point runs.
    const write = spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      process.env.CLAUDE_MEM_DATA_DIR = '/legacy';
      readEnv('HUMMEM_DATA_DIR');
      enableLegacyEnvWarnings();
      expect(write).toHaveBeenCalledTimes(1);
      const line = String(write.mock.calls[0][0]);
      expect(line).toContain('CLAUDE_MEM_DATA_DIR');
      expect(line).toContain('HUMMEM_DATA_DIR');
    } finally {
      write.mockRestore();
    }
  });

  it('can be suppressed entirely', () => {
    const write = spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      process.env.HUMMEM_SUPPRESS_LEGACY_ENV_WARNING = '1';
      process.env.CLAUDE_MEM_DATA_DIR = '/legacy';
      expect(readEnv('HUMMEM_DATA_DIR')).toBe('/legacy');
      enableLegacyEnvWarnings();
      expect(write).not.toHaveBeenCalled();
    } finally {
      write.mockRestore();
    }
  });
});

describe('detectLegacyEnv', () => {
  it('reports legacy variables with their canonical replacement', () => {
    const found = detectLegacyEnv({ CLAUDE_MEM_WORKER_PORT: '37800', PATH: '/bin' });
    expect(found).toHaveLength(1);
    expect(found[0]).toEqual({
      legacyName: 'CLAUDE_MEM_WORKER_PORT',
      canonicalName: 'HUMMEM_WORKER_PORT',
      shadowed: false,
    });
  });

  it('flags a legacy variable whose value can never take effect', () => {
    const found = detectLegacyEnv({
      CLAUDE_MEM_WORKER_PORT: '37800',
      HUMMEM_WORKER_PORT: '37900',
    });
    expect(found[0].shadowed).toBe(true);
  });

  it('emits no deprecation warning — reporting is not using', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    try {
      process.env.CLAUDE_MEM_DATA_DIR = '/legacy';
      detectLegacyEnv();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});

describe('withCanonicalEnv', () => {
  it('mirrors a legacy variable into its canonical name for child processes', () => {
    const out = withCanonicalEnv({ CLAUDE_MEM_WORKER_PORT: '37800' });
    expect(out.HUMMEM_WORKER_PORT).toBe('37800');
    expect(out.CLAUDE_MEM_WORKER_PORT).toBe('37800');
  });

  it('mirrors a canonical variable into its legacy name for older bundled code', () => {
    const out = withCanonicalEnv({ HUMMEM_WORKER_PORT: '37900' });
    expect(out.CLAUDE_MEM_WORKER_PORT).toBe('37900');
  });

  it('never overwrites a value the caller set explicitly', () => {
    const out = withCanonicalEnv({
      HUMMEM_WORKER_PORT: '37900',
      CLAUDE_MEM_WORKER_PORT: '37800',
    });
    expect(out.HUMMEM_WORKER_PORT).toBe('37900');
    expect(out.CLAUDE_MEM_WORKER_PORT).toBe('37800');
  });

  it('leaves unrelated variables untouched', () => {
    const out = withCanonicalEnv({ PATH: '/bin', HOME: '/home/dev' });
    expect(out).toEqual({ PATH: '/bin', HOME: '/home/dev' });
  });
});
