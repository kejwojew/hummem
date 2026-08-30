
import { logger } from './logger.js';

export const TAG_NAMES = [
  'private',
  // Context block, canonical spelling. Injected memory MUST be stripped from
  // transcripts before distillation or it returns as fresh observations.
  'hummem-context',
  // Pre-rename spelling (see context-injection.ts). Never written any more,
  // but stripped forever: transcripts recorded before the rename still carry
  // it, as does any file that has not been rewritten yet.
  'claude-mem-context',
  'system_instruction',
  'system-instruction',
  'persisted-output',
  'system-reminder',
] as const;
type TagName = (typeof TAG_NAMES)[number];

/**
 * Context-block tag names, tied to the strip list by construction.
 *
 * context-injection.ts owns the spellings; this annotation is what guarantees
 * both are actually stripped. Rename the tag there without updating this list
 * and the build fails, instead of silently feeding every injected context
 * block back into the observation pipeline.
 */
export const CONTEXT_TAG_NAMES: ReadonlyArray<Extract<TagName, 'hummem-context' | 'claude-mem-context'>> =
  ['hummem-context', 'claude-mem-context'];

/**
 * Wrapper for injected text that must ACT on the model rather than inform it
 * (the working-memory nudge). Derived from TAG_NAMES instead of written as a
 * literal: everything injected must be strippable, or injected memory comes
 * back as a fresh observation on the next distillation pass. The Extract<>
 * annotation makes that dependency structural — drop 'system-reminder' from
 * TAG_NAMES and this fails to typecheck instead of silently self-ingesting.
 */
const SYSTEM_REMINDER_TAG: Extract<TagName, 'system-reminder'> = 'system-reminder';
export const SYSTEM_REMINDER_OPEN = `<${SYSTEM_REMINDER_TAG}>`;
export const SYSTEM_REMINDER_CLOSE = `</${SYSTEM_REMINDER_TAG}>`;

const STRIP_REGEX = new RegExp(
  `<(${TAG_NAMES.join('|')})\\b[^>]*>[\\s\\S]*?</\\1>`,
  'g'
);

/**
 * Standalone matcher for the reminder tag, used by the transcript readers that
 * scrub one tag rather than all of them (transcript-parser.ts,
 * ObservationCompiler.ts).
 *
 * Built from SYSTEM_REMINDER_TAG rather than written as a literal, for the
 * same reason as the OPEN/CLOSE constants above: a literal here is a third
 * copy of the tag name that the Extract<> guard does not cover, so a rename
 * would update the two guarded constants, leave this one on the old spelling,
 * and compile cleanly while silently letting reminders through into
 * distillation.
 *
 * `\b[^>]*>` mirrors STRIP_REGEX so both paths accept a tag carrying
 * attributes. Previously this one required a bare `<system-reminder>`, so a
 * host that ever emitted attributes would be scrubbed by one path and not the
 * other.
 */
export const SYSTEM_REMINDER_REGEX = new RegExp(
  `<${SYSTEM_REMINDER_TAG}\\b[^>]*>[\\s\\S]*?</${SYSTEM_REMINDER_TAG}>`,
  'g',
);

const MAX_TAG_COUNT = 100;

export function stripTags(input: string): { stripped: string; counts: Record<TagName, number> } {
  const counts: Record<TagName, number> = Object.fromEntries(
    TAG_NAMES.map(name => [name, 0])
  ) as Record<TagName, number>;

  STRIP_REGEX.lastIndex = 0; 

  let total = 0;
  const stripped = input.replace(STRIP_REGEX, (_, name: TagName) => {
    counts[name] = (counts[name] ?? 0) + 1;
    total += 1;
    return '';
  });

  if (total > MAX_TAG_COUNT) {
    logger.warn('SYSTEM', 'tag count exceeds limit', undefined, {
      tagCount: total,
      maxAllowed: MAX_TAG_COUNT,
      contentLength: input.length,
    });
  }

  return { stripped: stripped.trim(), counts };
}

export function stripMemoryTags(content: string): string {
  return stripTags(content).stripped;
}

const PROTOCOL_ONLY_TAGS = ['task-notification'] as const;

const PROTOCOL_ONLY_REGEX = new RegExp(
  `^\\s*<(${PROTOCOL_ONLY_TAGS.join('|')})\\b[^>]*>(?:(?!<\\1\\b|</\\1\\b)[\\s\\S])*</\\1>\\s*$`,
);

const MAX_PROTOCOL_PAYLOAD_BYTES = 256 * 1024;

export function isInternalProtocolPayload(text: string): boolean {
  if (!text) return false;
  if (text.length > MAX_PROTOCOL_PAYLOAD_BYTES) return false;
  return PROTOCOL_ONLY_REGEX.test(text);
}
