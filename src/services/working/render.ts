// Per-prompt injection rendering for working memory. The block makes empty or
// stale state visible to the agent's eyes on every prompt — the structural
// defense against "forgot to write" (the slot limit alone only fires on
// overflow). Pure functions so the hook path stays trivially testable.
//
// The injection renders INTENT entries only. The observer journal stays in
// the DB and the /api/working response (debugging), but never enters the
// prompt — decided 2026-08-19 after live sessions showed a journal-only
// block reads as command spam: "Bash: python tools/dork.py …" says nothing
// about what was concluded or what is next, and working memory that is not
// small and meaningful is not working memory.
//
// TWO OUTPUTS, TWO CHANNELS (2026-08-29). renderWorkingMemory returns the
// state block and the nudge separately because they are different kinds of
// text and the caller routes them to different tags:
//   - `block` is reference material → <claude-mem-context> (background).
//   - `nudge` is an instruction to act now → <system-reminder>.
// Both tags are in tag-stripping.ts TAG_NAMES, so neither is fed back into
// distillation. Merging them again would put the instruction back inside the
// block the agent is told to treat as background — the exact delivery-channel
// failure this split exists to fix (an agent ignored ~20 consecutive
// reminders while obeying every hard rule it got through an instruction
// channel).
//
// The nudge carries a LIVE COUNTER for the same reason it did before
// e2dd1e4c7: a static line becomes invisible boilerplate within hours. The
// counter reads journal rows, which the caller already fetches — counting
// them is free and does NOT put them in the prompt.
import type { WorkingEntry } from './store.js';

export interface WorkingRenderPayload {
  entries: WorkingEntry[];
}

export interface WorkingRenderResult {
  /** Reference block for <claude-mem-context>, or null when no live intent. */
  block: string | null;
  /** Instruction for <system-reminder>, or null when nothing needs saying. */
  nudge: string | null;
}

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * An intent slot older than this reads as "current state" while describing a
 * world that has moved on. One working day: long enough that a slot written
 * this morning is not nagged about, short enough that yesterday's plan cannot
 * masquerade as today's.
 *
 * This threshold is also what keeps a SINGLE stale slot from silencing the
 * nudge for the rest of the slot's 7-day TTL — the bug that let one project
 * run a week of prompts with a dead hypothesis and no reminder (observed
 * live: project `search`, slot written 2026-08-21, silent until expiry).
 */
export const STALE_INTENT_AFTER_MS = 8 * HOUR_MS;

function formatTimeHHMM(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(11, 16);
}

const MINUTE_MS = 60_000;

/**
 * Age, coarsened to the largest useful unit. Minutes are spelled out rather
 * than collapsed into "just now": a 40-minute-old slot is frequently the one
 * that has already gone wrong, and the whole point of this pass is that the
 * agent must never mistake an older state for the current one.
 */
function formatAge(ageMs: number): string {
  if (ageMs >= DAY_MS) {
    const days = Math.floor(ageMs / DAY_MS);
    return `${days}d ago`;
  }
  const hours = Math.floor(ageMs / HOUR_MS);
  if (hours >= 1) return `${hours}h ago`;
  const minutes = Math.floor(ageMs / MINUTE_MS);
  return minutes >= 1 ? `${minutes}m ago` : 'just now';
}

/**
 * Timestamp for a task section. A bare HH:MM (the pre-2026-08-29 format) made
 * a week-old slot render as "(updated 08:52)" — indistinguishable from one
 * written minutes ago, so stale state read as current. Anything not from the
 * last 24h therefore carries its date AND its age.
 */
function formatStamp(epochMs: number, now: number): string {
  const ageMs = Math.max(0, now - epochMs);
  if (ageMs < DAY_MS) {
    return `updated ${formatTimeHHMM(epochMs)} (${formatAge(ageMs)})`;
  }
  const date = new Date(epochMs).toISOString().slice(0, 10);
  return `updated ${date} ${formatTimeHHMM(epochMs)} (${formatAge(ageMs)})`;
}

/**
 * Nudge for "no intent recorded anywhere". The journal count makes the line
 * change on every prompt, which is what keeps it visible; the explicit call
 * signature removes the pre-call schema lookup that made the tool feel
 * expensive in the moment (cost now, benefit only after a compaction).
 */
export function noIntentNudge(journalCount: number): string {
  const workDone = journalCount > 0
    ? ` ${journalCount} tool ${journalCount === 1 ? 'call has' : 'calls have'} been journaled since.`
    : '';
  return [
    `Working memory holds no intent for this project.${workDone}`,
    'If working_set is in your toolset, record the current hypothesis or next step before you answer —',
    'working_set(key: "hypothesis", value: "<one line>"). One line is enough.',
    'Skip only if nothing in this session needs to survive a context compaction.',
  ].join(' ');
}

/**
 * Nudge for "every live slot is stale". Rendering the block alone is not
 * enough here: the block looks like current state, so the correction has to
 * arrive on the instruction channel next to it.
 */
export function staleIntentNudge(oldestAgeMs: number, staleCount: number): string {
  const slots = staleCount === 1 ? 'slot is' : 'slots are';
  return [
    `Every working-memory ${slots} stale (oldest ${formatAge(oldestAgeMs)}) — it describes an earlier state of this task, not the current one.`,
    'Refresh it with working_set(key, value), or drop what no longer holds with working_drop(key), before treating it as current.',
  ].join(' ');
}

function renderTaskSection(taskKey: string, intents: WorkingEntry[], now: number): string {
  const lastUpdated = Math.max(...intents.map(entry => entry.updated_at_epoch));
  const lines = [`## Working Memory — task: ${taskKey} (${formatStamp(lastUpdated, now)})`];
  for (const entry of intents) {
    // Per-entry staleness, not just per-task: a task whose newest slot is
    // fresh can still carry a week-old slot next to it, and the section stamp
    // (computed from the NEWEST entry) would vouch for both.
    const stale = now - entry.updated_at_epoch >= STALE_INTENT_AFTER_MS
      ? ` _[stale, ${formatAge(now - entry.updated_at_epoch)}]_`
      : '';
    lines.push(`- [intent] ${entry.key}: ${entry.value}${stale}`);
  }
  return lines.join('\n');
}

/**
 * Render the injection. Journal rows are never rendered (see the file header)
 * but ARE counted for the nudge.
 *
 * Nudge policy:
 *   - no intent at all      → noIntentNudge (with the live journal counter)
 *   - every intent is stale → staleIntentNudge
 *   - at least one fresh    → no nudge; the block speaks for itself
 */
export function renderWorkingMemory(
  payload: WorkingRenderPayload,
  now: number = Date.now(),
): WorkingRenderResult {
  const intents = payload.entries.filter(entry => entry.kind === 'intent');
  const journalCount = payload.entries.filter(entry => entry.kind === 'journal').length;

  if (intents.length === 0) {
    return { block: null, nudge: noIntentNudge(journalCount) };
  }

  const byTask = new Map<string, WorkingEntry[]>();
  for (const entry of intents) {
    const bucket = byTask.get(entry.task_key) ?? [];
    bucket.push(entry);
    byTask.set(entry.task_key, bucket);
  }

  const block = [...byTask.keys()]
    .sort()
    .map(taskKey =>
      renderTaskSection(
        taskKey,
        byTask.get(taskKey)!.sort((a, b) => a.key.localeCompare(b.key)),
        now,
      ))
    .join('\n\n');

  const staleEntries = intents.filter(
    entry => now - entry.updated_at_epoch >= STALE_INTENT_AFTER_MS,
  );
  const allStale = staleEntries.length === intents.length;
  const oldestAgeMs = allStale
    ? Math.max(...staleEntries.map(entry => now - entry.updated_at_epoch))
    : 0;

  return {
    block,
    nudge: allStale ? staleIntentNudge(oldestAgeMs, staleEntries.length) : null,
  };
}
