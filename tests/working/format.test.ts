// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'bun:test';
import { formatJournalLine } from '../../src/services/working/journal.js';
import {
  renderWorkingMemory,
  noIntentNudge,
  staleIntentNudge,
  STALE_INTENT_AFTER_MS,
} from '../../src/services/working/render.js';
import { TAG_NAMES, SYSTEM_REMINDER_OPEN, stripMemoryTags } from '../../src/utils/tag-stripping.js';
import type { WorkingEntry } from '../../src/services/working/store.js';

describe('formatJournalLine', () => {
  it('renders file tools as "<Tool> <path>"', () => {
    expect(formatJournalLine('Read', { file_path: 'src/x.ts' })).toBe('Read src/x.ts');
    expect(formatJournalLine('Edit', { file_path: 'tests/y.ts' })).toBe('Edit tests/y.ts');
    expect(formatJournalLine('Write', { file_path: '/tmp/z.md' })).toBe('Write /tmp/z.md');
    expect(formatJournalLine('NotebookEdit', { notebook_path: 'nb.ipynb' })).toBe('NotebookEdit nb.ipynb');
  });

  it('renders successful Bash calls with the command', () => {
    expect(formatJournalLine('Bash', { command: 'bun test' }, { exitCode: 0 }))
      .toBe('Bash: bun test');
    expect(formatJournalLine('Bash', { command: 'git status' }))
      .toBe('Bash: git status');
  });

  it('marks failed Bash calls with the exit code', () => {
    expect(formatJournalLine('Bash', { command: 'bun test' }, { exitCode: 1 }))
      .toBe('Bash failed: bun test (exit 1)');
    // Claude Code string-shaped error response.
    expect(formatJournalLine('Bash', { command: 'bun build' }, 'Exit code 2\n...'))
      .toBe('Bash failed: bun build (exit 2)');
    expect(formatJournalLine('Bash', { command: 'make' }, { interrupted: true }))
      .toBe('Bash failed: make (interrupted)');
  });

  it('collapses multiline commands into one line', () => {
    expect(formatJournalLine('Bash', { command: 'cd x &&\nbun test' }))
      .toBe('Bash: cd x && bun test');
  });

  it('renders search and agent tools with their key argument', () => {
    expect(formatJournalLine('Grep', { pattern: 'TODO' })).toBe('Grep TODO');
    expect(formatJournalLine('Glob', { pattern: '**/*.ts' })).toBe('Glob **/*.ts');
    expect(formatJournalLine('Task', { description: 'explore routes' })).toBe('Agent: explore routes');
    expect(formatJournalLine('WebSearch', { query: 'bun sqlite' })).toBe('WebSearch bun sqlite');
  });

  it('falls back to a truncated JSON summary for unknown tools', () => {
    expect(formatJournalLine('CustomTool', { foo: 'bar' })).toBe('CustomTool: {"foo":"bar"}');
    expect(formatJournalLine('CustomTool')).toBe('CustomTool');
  });

  it('caps line length', () => {
    const line = formatJournalLine('Bash', { command: 'x'.repeat(500) });
    expect(line.length).toBeLessThanOrEqual(120);
  });
});

const entry = (over: Partial<WorkingEntry>): WorkingEntry => ({
  id: 1,
  project: 'proj',
  task_key: 'default',
  key: 'k',
  kind: 'intent',
  value: 'v',
  source: 'agent',
  created_at_epoch: 0,
  updated_at_epoch: 0,
  expires_at_epoch: Number.MAX_SAFE_INTEGER,
  ...over,
});

const NOW = new Date('2026-08-29T12:00:00Z').getTime();
const fresh = (over: Partial<WorkingEntry> = {}) =>
  entry({ updated_at_epoch: NOW - 60_000, ...over });

describe('renderWorkingMemory', () => {
  it('an empty set yields no block and the no-intent nudge', () => {
    const { block, nudge } = renderWorkingMemory({ entries: [] }, NOW);
    expect(block).toBeNull();
    expect(nudge).toContain('working_set');
  });

  it('renders intents sorted by key; journal rows stay out of the prompt', () => {
    const { block } = renderWorkingMemory({
      entries: [
        fresh({ id: 1, key: 'next', value: 'run tests' }),
        fresh({ id: 2, key: 'hypothesis', value: 'cache bug' }),
        fresh({ id: 3, key: 'journal:1', kind: 'journal', source: 'observer', value: 'Read src/x.ts' }),
        fresh({ id: 4, key: 'journal:2', kind: 'journal', source: 'observer', value: 'Bash failed: bun test (exit 1)' }),
      ],
    }, NOW);

    expect(block).toContain('- [intent] hypothesis: cache bug');
    expect(block).toContain('- [intent] next: run tests');
    expect(block!.indexOf('hypothesis')).toBeLessThan(block!.indexOf('next'));
    expect(block).not.toContain('Read src/x.ts');
    expect(block).not.toContain('[journal]');
  });

  it('a fresh set produces NO nudge — the block speaks for itself', () => {
    const { block, nudge } = renderWorkingMemory({
      entries: [fresh({ key: 'a', value: '1' })],
    }, NOW);
    expect(block).not.toBeNull();
    expect(nudge).toBeNull();
  });

  it('a journal-only set yields no block and a nudge carrying the live count', () => {
    const { block, nudge } = renderWorkingMemory({
      entries: [
        fresh({ id: 1, key: 'journal:1', kind: 'journal', source: 'observer', value: 'Read src/x.ts' }),
        fresh({ id: 2, key: 'journal:2', kind: 'journal', source: 'observer', value: 'Read src/y.ts' }),
      ],
    }, NOW);
    expect(block).toBeNull();
    expect(nudge).toContain('2 tool calls');
  });

  // Regression guard for the salience revert: c911ecfbe added a live counter
  // precisely because a static line goes invisible, and e2dd1e4c7 dropped it
  // as a side effect. The nudge text must keep changing as work accumulates.
  it('the no-intent nudge text changes as journal volume grows', () => {
    expect(noIntentNudge(3)).not.toBe(noIntentNudge(7));
    expect(noIntentNudge(1)).toContain('1 tool call has');
    expect(noIntentNudge(4)).toContain('4 tool calls have');
  });

  it('groups multiple tasks into separate sections', () => {
    const { block } = renderWorkingMemory({
      entries: [
        fresh({ task_key: 'default', key: 'a', value: '1' }),
        fresh({ task_key: 'bugfix', key: 'b', value: '2' }),
      ],
    }, NOW);
    expect(block).toContain('## Working Memory — task: bugfix');
    expect(block).toContain('## Working Memory — task: default');
    expect(block!.indexOf('task: bugfix')).toBeLessThan(block!.indexOf('task: default'));
  });
});

describe('stale intent handling', () => {
  const staleAt = NOW - STALE_INTENT_AFTER_MS - 60_000;

  // The week-long silence bug: one live slot suppressed the reminder for its
  // whole 7-day TTL (observed live on project `search`).
  it('an all-stale set still renders the block AND nudges', () => {
    const { block, nudge } = renderWorkingMemory({
      entries: [fresh({ key: 'old', value: 'last week plan', updated_at_epoch: staleAt })],
    }, NOW);
    expect(block).toContain('- [intent] old: last week plan');
    expect(nudge).not.toBeNull();
    expect(nudge).toContain('stale');
  });

  it('marks the stale entry inline so the block cannot pass as current state', () => {
    const { block } = renderWorkingMemory({
      entries: [
        fresh({ id: 1, key: 'old', value: 'yesterday', updated_at_epoch: staleAt }),
        fresh({ id: 2, key: 'new', value: 'today' }),
      ],
    }, NOW);
    expect(block).toContain('- [intent] old: yesterday _[stale,');
    expect(block).toContain('- [intent] new: today');
    expect(block).not.toContain('today _[stale');
  });

  // Previously a single fresh slot silenced the warning for its stale
  // neighbours — the original bug (one live slot muting the reminder for a
  // week) in miniature: one FRESH slot muting it for the dead ones, which were
  // then visible only on the background channel.
  it('a fresh slot does NOT silence the warning about its stale neighbours', () => {
    const { nudge } = renderWorkingMemory({
      entries: [
        fresh({ id: 1, key: 'old', value: 'x', updated_at_epoch: staleAt }),
        fresh({ id: 2, key: 'new', value: 'y' }),
      ],
    }, NOW);
    expect(nudge).not.toBeNull();
    // Named, not counted: an unaddressed "some slots are stale" is exactly the
    // kind of nagging an agent learns to filter out.
    expect(nudge).toContain('old');
    expect(nudge).not.toContain('new');
  });

  it('names the stale keys oldest-first and summarises the overflow', () => {
    const { nudge } = renderWorkingMemory({
      entries: [
        fresh({ id: 1, key: 'k1', value: 'a', updated_at_epoch: staleAt }),
        fresh({ id: 2, key: 'k2', value: 'b', updated_at_epoch: staleAt - 1000 }),
        fresh({ id: 3, key: 'k3', value: 'c', updated_at_epoch: staleAt - 2000 }),
        fresh({ id: 4, key: 'k4', value: 'd', updated_at_epoch: staleAt - 3000 }),
        fresh({ id: 5, key: 'still-warm', value: 'e' }),
      ],
    }, NOW);
    // Oldest first, so a truncated list names the slots most likely to be wrong.
    expect(nudge).toContain('k4, k3, k2');
    expect(nudge).toContain('+1 more');
    expect(nudge).not.toContain('still-warm');
  });

  it('stays silent when every slot is fresh', () => {
    const { nudge } = renderWorkingMemory({
      entries: [
        fresh({ id: 1, key: 'a', value: 'x' }),
        fresh({ id: 2, key: 'b', value: 'y' }),
      ],
    }, NOW);
    expect(nudge).toBeNull();
  });

  // A bare HH:MM made a week-old slot read as "(updated 08:52)" — current.
  it('stamps anything older than a day with its date and age', () => {
    const { block } = renderWorkingMemory({
      entries: [fresh({ key: 'a', value: '1', updated_at_epoch: NOW - 7 * 86_400_000 })],
    }, NOW);
    expect(block).toContain('2026-08-22');
    expect(block).toContain('7d ago');
  });

  it('keeps the compact HH:MM stamp within the last day', () => {
    const { block } = renderWorkingMemory({
      entries: [fresh({ key: 'a', value: '1', updated_at_epoch: NOW - 2 * 3_600_000 })],
    }, NOW);
    expect(block).toContain('updated 10:00');
    expect(block).toContain('2h ago');
  });

  // The clock is rendered from toISOString(); unlabelled, a slot written at
  // 09:13 local showing as 06:13 reads as a wrong time rather than a zone.
  it('labels the clock as UTC', () => {
    const { block } = renderWorkingMemory({
      entries: [fresh({ key: 'a', value: '1', updated_at_epoch: NOW - 2 * 3_600_000 })],
    }, NOW);
    expect(block).toContain('10:00 UTC');
  });

  it('the stale nudge names the age and the recovery calls', () => {
    const text = staleIntentNudge(3 * 86_400_000, 2);
    expect(text).toContain('3d ago');
    expect(text).toContain('working_set');
    expect(text).toContain('working_drop');
  });
});

// The nudge rides <system-reminder> so it reads as an instruction rather than
// background reference. That tag MUST stay strippable, or every injected
// reminder comes back as a fresh observation on the next distillation pass.
describe('nudge delivery channel', () => {
  it('system-reminder is a stripped tag', () => {
    expect(TAG_NAMES).toContain('system-reminder');
    expect(SYSTEM_REMINDER_OPEN).toBe('<system-reminder>');
  });

  it('a wrapped nudge is fully removed before distillation', () => {
    const wrapped = `before\n<system-reminder>\n${noIntentNudge(5)}\n</system-reminder>\nafter`;
    const stripped = stripMemoryTags(wrapped);
    expect(stripped).not.toContain('working_set');
    expect(stripped).toContain('before');
    expect(stripped).toContain('after');
  });
});
