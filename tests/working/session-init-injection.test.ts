// SPDX-License-Identifier: Apache-2.0
//
// Working-memory injection in the session-init (UserPromptSubmit) handler.
// Uses the same subprocess pattern as session-init-semantic-global-limit.test.ts:
// the handler is driven with injected dependencies and the worker is mocked.

import { afterAll, beforeEach, describe, expect, it, spyOn } from 'bun:test';

import { logger } from '../../src/utils/logger.js';

let loggerSpies: ReturnType<typeof spyOn>[] = [];

const originalInternalEnv = process.env.CLAUDE_MEM_INTERNAL;

beforeEach(() => {
  delete process.env.CLAUDE_MEM_INTERNAL;
  loggerSpies.forEach(spy => spy.mockRestore());
  loggerSpies = [
    spyOn(logger, 'info').mockImplementation(() => {}),
    spyOn(logger, 'debug').mockImplementation(() => {}),
    spyOn(logger, 'warn').mockImplementation(() => {}),
    spyOn(logger, 'error').mockImplementation(() => {}),
    spyOn(logger, 'failure').mockImplementation(() => {}),
  ];
});

afterAll(() => {
  if (originalInternalEnv === undefined) {
    delete process.env.CLAUDE_MEM_INTERNAL;
  } else {
    process.env.CLAUDE_MEM_INTERNAL = originalInternalEnv;
  }
  loggerSpies.forEach(spy => spy.mockRestore());
});

const LONG_PROMPT = 'Please continue debugging the failing worker route from earlier.';

function runSessionInit(workingBehavior: string): { exitCode: number | null; stdout: string; stderr: string } {
  const env = { ...process.env };
  delete env.CLAUDE_MEM_INTERNAL;
  const script = `
    const { sessionInitHandler, setSessionInitDependenciesForTesting } = await import('./src/cli/handlers/session-init.ts');
    setSessionInitDependenciesForTesting({
      loadFromFileOnce: () => ({ CLAUDE_MEM_EXCLUDED_PROJECTS: '', CLAUDE_MEM_WORKING_ENABLED: 'true' }),
      resolveRuntimeContext: () => ({ runtime: 'worker' }),
      shouldTrackProject: () => true,
      executeWithWorkerFallback: async (apiPath, method, body) => {
        if (apiPath === '/api/sessions/init') return { sessionDbId: 7, promptNumber: 3 };
        if (apiPath.startsWith('/api/working')) {
          ${workingBehavior}
        }
        throw new Error('Unexpected worker call: ' + apiPath);
      },
      isWorkerFallback: () => false,
    });
    const result = await sessionInitHandler.execute({
      sessionId: 'session-working-inject',
      cwd: '/tmp/session-init-working-test',
      platform: 'claude',
      prompt: ${JSON.stringify(LONG_PROMPT)},
    });
    process.stdout.write(JSON.stringify({ result }));
  `;

  const run = Bun.spawnSync({
    cmd: [process.execPath, '--eval', script],
    cwd: process.cwd(),
    env,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  return {
    exitCode: run.exitCode,
    stdout: new TextDecoder().decode(run.stdout),
    stderr: new TextDecoder().decode(run.stderr),
  };
}

function parseResult(stdout: string): any {
  return JSON.parse(stdout).result;
}

describe('sessionInitHandler working-memory injection', () => {
  it('injects the rendered block when entries exist', () => {
    const behavior = `const now = Date.now();
    return {
      entries: [{
        id: 1, project: 'session-init-working-test', task_key: 'default', key: 'hypothesis',
        kind: 'intent', value: 'route order bug', source: 'agent',
        created_at_epoch: now, updated_at_epoch: now, expires_at_epoch: 9999999999999
      }, {
        id: 2, project: 'session-init-working-test', task_key: 'default', key: 'journal:1',
        kind: 'journal', value: 'Read src/routes.ts', source: 'observer',
        created_at_epoch: now, updated_at_epoch: now, expires_at_epoch: 9999999999999
      }],
      tokens: 5, limits: { maxKeys: 8, maxTokens: 1000, journalSize: 5, ttlDays: 7 }
    };`;
    const run = runSessionInit(behavior);

    expect(run.stderr).toBe('');
    expect(run.exitCode).toBe(0);

    const result = parseResult(run.stdout);
    const additional = result.hookSpecificOutput.additionalContext as string;
    expect(additional).toContain('## Working Memory — task: default');
    expect(additional).toContain('- [intent] hypothesis: route order bug');
    // Journal rows never enter the prompt (they stay in DB/API) — decided
    // after live sessions showed a journal-only block reads as command spam.
    expect(additional).not.toContain('- [journal]');
    // Fresh intent ⇒ the block carries itself, no instruction needed.
    expect(additional).not.toContain('<system-reminder>');
  });

  it('sends the empty-set nudge on the instruction channel, not the context block', () => {
    const run = runSessionInit(`return { entries: [], tokens: 0, limits: { maxKeys: 8, maxTokens: 1000, journalSize: 5, ttlDays: 7 } };`);

    expect(run.stderr).toBe('');
    expect(run.exitCode).toBe(0);

    const result = parseResult(run.stdout);
    const ctx = result.hookSpecificOutput.additionalContext as string;
    expect(ctx).toContain('working_set');
    // The nudge is an instruction: it must ride <system-reminder>, NOT the
    // background <claude-mem-context> block the agent treats as reference.
    expect(ctx).toContain('<system-reminder>');
    expect(ctx).toContain('</system-reminder>');
    const reminderStart = ctx.indexOf('<system-reminder>');
    expect(ctx.indexOf('working_set')).toBeGreaterThan(reminderStart);
    // With no memory to show there is no context block at all.
    expect(ctx).not.toContain('<claude-mem-context>');
  });

  it('keeps block and nudge in separate top-level tags when state is stale', () => {
    const behavior = `const stale = Date.now() - 48 * 3600 * 1000;
    return {
      entries: [{
        id: 1, project: 'session-init-working-test', task_key: 'default', key: 'old',
        kind: 'intent', value: 'two day old plan', source: 'agent',
        created_at_epoch: stale, updated_at_epoch: stale, expires_at_epoch: 9999999999999
      }],
      tokens: 5, limits: { maxKeys: 8, maxTokens: 1000, journalSize: 5, ttlDays: 7 }
    };`;
    const run = runSessionInit(behavior);

    expect(run.exitCode).toBe(0);
    const ctx = parseResult(run.stdout).hookSpecificOutput.additionalContext as string;

    expect(ctx).toContain('- [intent] old: two day old plan');
    expect(ctx).toContain('_[stale,');
    // Nesting the reminder inside the context block would re-file the
    // instruction as background reference — the exact bug being fixed.
    expect(ctx).toContain('</claude-mem-context>');
    expect(ctx.indexOf('</claude-mem-context>')).toBeLessThan(ctx.indexOf('<system-reminder>'));
  });

  it('is fail-open: a worker error leaves the hook result intact', () => {
    const run = runSessionInit(`throw new Error('worker exploded');`);

    expect(run.exitCode).toBe(0);

    const result = parseResult(run.stdout);
    expect(result.continue).toBe(true);
    expect(result.hookSpecificOutput).toBeUndefined();
  });

  it('shows the block for a short prompt even though the nudge is gated', () => {
    const env = { ...process.env };
    delete env.CLAUDE_MEM_INTERNAL;
    const script = `
      const { sessionInitHandler, setSessionInitDependenciesForTesting } = await import('./src/cli/handlers/session-init.ts');
      const stale = Date.now() - 48 * 3600 * 1000;
      setSessionInitDependenciesForTesting({
        loadFromFileOnce: () => ({ CLAUDE_MEM_EXCLUDED_PROJECTS: '', CLAUDE_MEM_WORKING_ENABLED: 'true' }),
        resolveRuntimeContext: () => ({ runtime: 'worker' }),
        shouldTrackProject: () => true,
        executeWithWorkerFallback: async (apiPath) => {
          if (apiPath === '/api/sessions/init') return { sessionDbId: 7, promptNumber: 3 };
          if (apiPath.startsWith('/api/working')) return {
            entries: [{
              id: 1, project: 'p', task_key: 'default', key: 'old', kind: 'intent',
              value: 'stale plan', source: 'agent',
              created_at_epoch: stale, updated_at_epoch: stale, expires_at_epoch: 9999999999999
            }],
            tokens: 5, limits: {}
          };
          throw new Error('Unexpected worker call: ' + apiPath);
        },
        isWorkerFallback: () => false,
      });
      const result = await sessionInitHandler.execute({
        sessionId: 'session-working-short-block',
        cwd: '/tmp/session-init-working-test',
        platform: 'claude',
        prompt: 'yes',
      });
      process.stdout.write(JSON.stringify({ result }));
    `;
    const run = Bun.spawnSync({
      cmd: [process.execPath, '--eval', script],
      cwd: process.cwd(),
      env,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(run.exitCode).toBe(0);
    const ctx = JSON.parse(new TextDecoder().decode(run.stdout))
      .result.hookSpecificOutput.additionalContext as string;
    // Current state is never withheld because the prompt was short...
    expect(ctx).toContain('- [intent] old: stale plan');
    // ...but a one-word follow-up does not earn an instruction to go write.
    expect(ctx).not.toContain('<system-reminder>');
  });

  it('skips the reminder for short prompts', () => {
    const env = { ...process.env };
    delete env.CLAUDE_MEM_INTERNAL;
    const script = `
      const { sessionInitHandler, setSessionInitDependenciesForTesting } = await import('./src/cli/handlers/session-init.ts');
      setSessionInitDependenciesForTesting({
        loadFromFileOnce: () => ({ CLAUDE_MEM_EXCLUDED_PROJECTS: '', CLAUDE_MEM_WORKING_ENABLED: 'true' }),
        resolveRuntimeContext: () => ({ runtime: 'worker' }),
        shouldTrackProject: () => true,
        executeWithWorkerFallback: async (apiPath) => {
          if (apiPath === '/api/sessions/init') return { sessionDbId: 7, promptNumber: 3 };
          if (apiPath.startsWith('/api/working')) return { entries: [], tokens: 0, limits: {} };
          throw new Error('Unexpected worker call: ' + apiPath);
        },
        isWorkerFallback: () => false,
      });
      const result = await sessionInitHandler.execute({
        sessionId: 'session-working-short',
        cwd: '/tmp/session-init-working-test',
        platform: 'claude',
        prompt: 'short',
      });
      process.stdout.write(JSON.stringify({ result }));
    `;
    const run = Bun.spawnSync({
      cmd: [process.execPath, '--eval', script],
      cwd: process.cwd(),
      env,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(run.exitCode).toBe(0);
    const result = JSON.parse(new TextDecoder().decode(run.stdout)).result;
    expect(result.continue).toBe(true);
    expect(result.hookSpecificOutput).toBeUndefined();
  });
});
