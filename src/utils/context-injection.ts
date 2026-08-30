// The context block written into agent-visible markdown (CLAUDE.md, AGENTS.md,
// WARP.md, IDE rules files) and into per-prompt hook injections.
//
// RENAME, 2026-08-29: the canonical tag is `hummem-context`. The former
// `claude-mem-context` survives from the upstream project this one forked from
// (see PROVENANCE.md) and is still READ so existing files heal themselves.
//
// Why a rename is safe here, and why it is a rename rather than a second
// permanent format: the block is REPLACED in place, never appended blindly.
// Every writer locates the existing block by its tags and overwrites that
// range. So the first injection after an upgrade finds the legacy block,
// replaces it with the canonical one, and the legacy tag is gone from that
// file for good. Dropping legacy READ support is what would be unsafe: the
// old block would not be found, a second block would be appended next to it,
// and the user would carry two context blocks forever.
//
// The legacy tag is therefore never written and always read. Same shape as
// the claude-mem.db → hummem.db migration (MIGRATION.md): one-time content
// migration on first write, permanent tolerance on read.
import path from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, renameSync } from 'fs';
import { toBmpSafe } from './bmp-safe.js';
import { logger } from './logger.js';

export const CONTEXT_TAG_NAME = 'hummem-context';
/** Read-only. Never write this — see the file header. */
export const LEGACY_CONTEXT_TAG_NAME = 'claude-mem-context';

export const CONTEXT_TAG_OPEN = `<${CONTEXT_TAG_NAME}>`;
export const CONTEXT_TAG_CLOSE = `</${CONTEXT_TAG_NAME}>`;

/**
 * Basename of the IDE rules file each integration writes (Cursor `.mdc`,
 * Windsurf/Roo/Antigravity `.md`).
 *
 * Unlike the tag, a filename does NOT heal itself: writing
 * `hummem-context.mdc` next to an existing `claude-mem-context.mdc` leaves
 * both on disk, and Cursor/Windsurf apply every rules file, so the agent
 * would receive its memory context twice on every prompt. Renaming the file
 * therefore requires deleting the legacy one — see writeRulesFile().
 */
export const CONTEXT_RULES_BASENAME = 'hummem-context';
export const LEGACY_CONTEXT_RULES_BASENAME = 'claude-mem-context';

/** Canonical first: a file already migrated must not be re-scanned as legacy. */
const TAG_NAMES_BY_PREFERENCE = [CONTEXT_TAG_NAME, LEGACY_CONTEXT_TAG_NAME] as const;

export interface TaggedBlockRange {
  /** Index of the first character of the opening tag. */
  start: number;
  /** Index one past the last character of the closing tag. */
  end: number;
  /** Which spelling was found. */
  tagName: string;
}

/**
 * Locate an existing context block, canonical spelling preferred.
 *
 * Opening and closing tags must MATCH: a stray `</claude-mem-context>` after a
 * canonical `<hummem-context>` is not a block. Pairing the two independently
 * (indexOf(open) with indexOf(close) of a different spelling) would compute a
 * bogus range and corrupt the file on write.
 */
export function findTaggedBlock(content: string): TaggedBlockRange | null {
  if (!content) return null;

  for (const tagName of TAG_NAMES_BY_PREFERENCE) {
    const open = `<${tagName}>`;
    const close = `</${tagName}>`;
    const start = content.indexOf(open);
    if (start === -1) continue;
    // Search for the closing tag AFTER the opening one so a malformed file
    // (close before open) is treated as "no block" instead of a negative range.
    const closeIdx = content.indexOf(close, start + open.length);
    if (closeIdx === -1) continue;
    return { start, end: closeIdx + close.length, tagName };
  }
  return null;
}

/** True when the content carries a context block in either spelling. */
export function hasTaggedBlock(content: string): boolean {
  return findTaggedBlock(content) !== null;
}

/**
 * Replace the existing block with `inner` wrapped in the CANONICAL tags, or
 * append a new block when none exists. A legacy block found here is replaced
 * by the canonical spelling — this is the migration.
 */
export function replaceTaggedBlock(existingContent: string, inner: string): string {
  const wrapped = `${CONTEXT_TAG_OPEN}\n${inner}\n${CONTEXT_TAG_CLOSE}`;
  if (!existingContent) return wrapped;

  const found = findTaggedBlock(existingContent);
  if (!found) {
    // No trailing newline: this returns a STRING, and callers that write a
    // whole file add their own (see injectContextIntoMarkdownFile). Adding one
    // here would give in-memory composers a stray blank line.
    return `${existingContent.trimEnd()}\n\n${wrapped}`;
  }
  return existingContent.slice(0, found.start) + wrapped + existingContent.slice(found.end);
}

/**
 * Remove the context block (either spelling) from the content — the uninstall
 * / cleanup path. Returns the content unchanged when there is no block.
 */
export function stripTaggedBlock(content: string): string {
  const found = findTaggedBlock(content);
  if (!found) return content;
  const before = content.slice(0, found.start).trimEnd();
  const after = content.slice(found.end).trimStart();
  if (!before) return after;
  if (!after) return before;
  return `${before}\n\n${after}`;
}

export function injectContextIntoMarkdownFile(
  filePath: string,
  contextContent: string,
  headerLine?: string,
): void {
  const parentDirectory = path.dirname(filePath);
  mkdirSync(parentDirectory, { recursive: true });

  // #2787: strip astral (surrogate-pair) code points so a Claude Code context
  // truncation can't split a pair into a lone surrogate and brick the session.
  const safeContent = toBmpSafe(contextContent);

  if (existsSync(filePath)) {
    const existingContent = readFileSync(filePath, 'utf-8');
    const appending = !hasTaggedBlock(existingContent);
    const updated = replaceTaggedBlock(existingContent, safeContent);
    // A block appended to the end of a file gets a trailing newline; an
    // in-place replacement keeps whatever the file already had after it.
    writeFileSync(filePath, appending ? `${updated}\n` : updated, 'utf-8');
    return;
  }

  const wrapped = `${CONTEXT_TAG_OPEN}\n${safeContent}\n${CONTEXT_TAG_CLOSE}`;
  writeFileSync(filePath, headerLine ? `${headerLine}\n\n${wrapped}\n` : `${wrapped}\n`, 'utf-8');
}

/**
 * Write an IDE rules file under the canonical basename and remove the legacy
 * one, so the agent never sees two always-applied context files.
 *
 * Ordering is deliberate: write the new file to a temp name, rename it into
 * place (atomic), and only THEN unlink the legacy file. An interruption can
 * leave the legacy file present alongside the new one — duplicated context,
 * recoverable on the next write — but can never leave the user with no
 * context at all. A failed unlink is logged rather than thrown for the same
 * reason: losing the freshly written context to satisfy cleanup would be the
 * worse trade.
 *
 * @returns the path written
 */
export function writeRulesFile(
  rulesDir: string,
  extension: string,
  content: string,
): string {
  mkdirSync(rulesDir, { recursive: true });

  const rulesFile = path.join(rulesDir, `${CONTEXT_RULES_BASENAME}${extension}`);
  const tempFile = `${rulesFile}.tmp`;
  writeFileSync(tempFile, content);
  renameSync(tempFile, rulesFile);

  removeLegacyRulesFile(rulesDir, extension);
  return rulesFile;
}

/**
 * Delete the pre-rename rules file if present. Separate from writeRulesFile so
 * uninstall paths can call it without writing anything.
 */
export function removeLegacyRulesFile(rulesDir: string, extension: string): boolean {
  const legacyFile = path.join(rulesDir, `${LEGACY_CONTEXT_RULES_BASENAME}${extension}`);
  if (!existsSync(legacyFile)) return false;
  try {
    unlinkSync(legacyFile);
    logger.debug('SYSTEM', 'Removed pre-rename context rules file', { legacyFile });
    return true;
  } catch (error) {
    logger.warn(
      'SYSTEM',
      'Could not remove the pre-rename context rules file; context may appear twice until it is deleted by hand',
      { legacyFile },
      error instanceof Error ? error : new Error(String(error)),
    );
    return false;
  }
}

/**
 * Both spellings of a rules file path, canonical first. Uninstall paths must
 * clean up BOTH: an install made before the rename still has the legacy name
 * on disk, and leaving it behind would keep injecting context after the user
 * asked for removal.
 */
export function rulesFileCandidates(rulesDir: string, extension: string): string[] {
  return [
    path.join(rulesDir, `${CONTEXT_RULES_BASENAME}${extension}`),
    path.join(rulesDir, `${LEGACY_CONTEXT_RULES_BASENAME}${extension}`),
  ];
}
