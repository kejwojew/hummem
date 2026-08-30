import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  injectContextIntoMarkdownFile,
  CONTEXT_TAG_OPEN,
  CONTEXT_TAG_CLOSE,
  CONTEXT_TAG_NAME,
  LEGACY_CONTEXT_TAG_NAME,
  CONTEXT_RULES_BASENAME,
  LEGACY_CONTEXT_RULES_BASENAME,
  findTaggedBlock,
  hasTaggedBlock,
  replaceTaggedBlock,
  stripTaggedBlock,
  writeRulesFile,
  rulesFileCandidates,
} from '../src/utils/context-injection';
import { TAG_NAMES } from '../src/utils/tag-stripping';

const LEGACY_OPEN = `<${LEGACY_CONTEXT_TAG_NAME}>`;
const LEGACY_CLOSE = `</${LEGACY_CONTEXT_TAG_NAME}>`;

describe('Context Injection', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `context-injection-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('tag constants', () => {
    it('exports correct open and close tags', () => {
      expect(CONTEXT_TAG_OPEN).toBe('<hummem-context>');
      expect(CONTEXT_TAG_CLOSE).toBe('</hummem-context>');
    });

    // Injected memory that is not stripped comes back as a fresh observation
    // on the next distillation pass. Both spellings must stay strippable.
    it('both spellings are in the strip list', () => {
      expect(TAG_NAMES).toContain(CONTEXT_TAG_NAME);
      expect(TAG_NAMES).toContain(LEGACY_CONTEXT_TAG_NAME);
    });
  });

  describe('inject into new file', () => {
    it('creates a new file with context tags when file does not exist', () => {
      const filePath = join(tempDir, 'CLAUDE.md');

      injectContextIntoMarkdownFile(filePath, 'Hello world');

      expect(existsSync(filePath)).toBe(true);
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain(CONTEXT_TAG_OPEN);
      expect(content).toContain('Hello world');
      expect(content).toContain(CONTEXT_TAG_CLOSE);
    });

    it('creates parent directories if they do not exist', () => {
      const filePath = join(tempDir, 'nested', 'deep', 'CLAUDE.md');

      injectContextIntoMarkdownFile(filePath, 'test content');

      expect(existsSync(filePath)).toBe(true);
    });

    it('writes content wrapped in context tags', () => {
      const filePath = join(tempDir, 'CLAUDE.md');
      const contextContent = '# Recent Activity\n\nSome memory data here.';

      injectContextIntoMarkdownFile(filePath, contextContent);

      const content = readFileSync(filePath, 'utf-8');
      const expected = `${CONTEXT_TAG_OPEN}\n${contextContent}\n${CONTEXT_TAG_CLOSE}\n`;
      expect(content).toBe(expected);
    });
  });

  describe('headerLine support', () => {
    it('prepends headerLine when creating a new file', () => {
      const filePath = join(tempDir, 'AGENTS.md');
      const headerLine = '# Claude-Mem Memory Context';

      injectContextIntoMarkdownFile(filePath, 'context data', headerLine);

      const content = readFileSync(filePath, 'utf-8');
      expect(content.startsWith(headerLine)).toBe(true);
      expect(content).toContain(CONTEXT_TAG_OPEN);
      expect(content).toContain('context data');
    });

    it('places a blank line between headerLine and context tags', () => {
      const filePath = join(tempDir, 'AGENTS.md');
      const headerLine = '# My Header';

      injectContextIntoMarkdownFile(filePath, 'data', headerLine);

      const content = readFileSync(filePath, 'utf-8');
      expect(content).toBe(`${headerLine}\n\n${CONTEXT_TAG_OPEN}\ndata\n${CONTEXT_TAG_CLOSE}\n`);
    });

    it('does not use headerLine when file already exists', () => {
      const filePath = join(tempDir, 'AGENTS.md');
      writeFileSync(filePath, '# Existing Content\n\nSome stuff.\n');

      injectContextIntoMarkdownFile(filePath, 'new context', '# Should Not Appear');

      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain('# Existing Content');
      expect(content).not.toContain('# Should Not Appear');
      expect(content).toContain('new context');
    });
  });

  describe('replace existing context section', () => {
    it('replaces content between existing context tags', () => {
      const filePath = join(tempDir, 'CLAUDE.md');
      const initialContent = [
        '# Project Instructions',
        '',
        `${CONTEXT_TAG_OPEN}`,
        'Old context data',
        `${CONTEXT_TAG_CLOSE}`,
        '',
        '## Other stuff',
      ].join('\n');
      writeFileSync(filePath, initialContent);

      injectContextIntoMarkdownFile(filePath, 'New context data');

      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain('New context data');
      expect(content).not.toContain('Old context data');
      expect(content).toContain('# Project Instructions');
      expect(content).toContain('## Other stuff');
    });

    it('preserves content before and after the context section', () => {
      const filePath = join(tempDir, 'CLAUDE.md');
      const before = '# Header\n\nSome instructions.\n\n';
      const after = '\n\n## Footer\n\nMore content.\n';
      const initialContent = `${before}${CONTEXT_TAG_OPEN}\nold\n${CONTEXT_TAG_CLOSE}${after}`;
      writeFileSync(filePath, initialContent);

      injectContextIntoMarkdownFile(filePath, 'replaced');

      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain('# Header');
      expect(content).toContain('Some instructions.');
      expect(content).toContain('## Footer');
      expect(content).toContain('More content.');
      expect(content).toContain('replaced');
      expect(content).not.toContain('old');
    });
  });

  describe('append to existing file', () => {
    it('appends context section to file without existing tags', () => {
      const filePath = join(tempDir, 'CLAUDE.md');
      writeFileSync(filePath, '# My Project\n\nInstructions here.\n');

      injectContextIntoMarkdownFile(filePath, 'appended context');

      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain('# My Project');
      expect(content).toContain('Instructions here.');
      expect(content).toContain(CONTEXT_TAG_OPEN);
      expect(content).toContain('appended context');
      expect(content).toContain(CONTEXT_TAG_CLOSE);
    });

    it('separates appended section with a blank line', () => {
      const filePath = join(tempDir, 'CLAUDE.md');
      writeFileSync(filePath, '# Header');

      injectContextIntoMarkdownFile(filePath, 'data');

      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain(`# Header\n\n${CONTEXT_TAG_OPEN}`);
    });

    it('trims trailing whitespace before appending', () => {
      const filePath = join(tempDir, 'CLAUDE.md');
      writeFileSync(filePath, '# Header\n\n\n   \n');

      injectContextIntoMarkdownFile(filePath, 'data');

      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain(`# Header\n\n${CONTEXT_TAG_OPEN}`);
    });
  });

  // The rename is only safe because the block is REPLACED in place: the first
  // write after an upgrade finds the pre-rename block and overwrites it. If
  // legacy READ support were dropped, the old block would not be found, a
  // second block would be appended, and the user would carry two context
  // blocks forever.
  describe('legacy tag migration', () => {
    it('finds a legacy block', () => {
      const found = findTaggedBlock(`a\n${LEGACY_OPEN}\nold\n${LEGACY_CLOSE}\nb`);
      expect(found).not.toBeNull();
      expect(found!.tagName).toBe(LEGACY_CONTEXT_TAG_NAME);
    });

    it('prefers the canonical block when both are present', () => {
      const found = findTaggedBlock(
        `${CONTEXT_TAG_OPEN}\nnew\n${CONTEXT_TAG_CLOSE}\n${LEGACY_OPEN}\nold\n${LEGACY_CLOSE}`,
      );
      expect(found!.tagName).toBe(CONTEXT_TAG_NAME);
    });

    it('rewrites a legacy block into the canonical tag — the whole point', () => {
      const result = replaceTaggedBlock(
        `# Header\n\n${LEGACY_OPEN}\nold context\n${LEGACY_CLOSE}\n\n## Footer`,
        'fresh context',
      );
      expect(result).toContain(CONTEXT_TAG_OPEN);
      expect(result).toContain('fresh context');
      expect(result).not.toContain(LEGACY_OPEN);
      expect(result).not.toContain('old context');
      expect(result).toContain('# Header');
      expect(result).toContain('## Footer');
    });

    it('leaves exactly ONE block after migrating — no duplication', () => {
      const filePath = join(tempDir, 'CLAUDE.md');
      writeFileSync(filePath, `# P\n\n${LEGACY_OPEN}\nold\n${LEGACY_CLOSE}\n`);

      injectContextIntoMarkdownFile(filePath, 'migrated');
      const content = readFileSync(filePath, 'utf-8');

      expect(content.split(CONTEXT_TAG_OPEN).length - 1).toBe(1);
      expect(content).not.toContain(LEGACY_OPEN);
      expect(content).not.toContain(LEGACY_CLOSE);
    });

    it('is stable across repeated writes after migrating', () => {
      const filePath = join(tempDir, 'CLAUDE.md');
      writeFileSync(filePath, `${LEGACY_OPEN}\nold\n${LEGACY_CLOSE}\n`);

      injectContextIntoMarkdownFile(filePath, 'v1');
      injectContextIntoMarkdownFile(filePath, 'v1');
      const content = readFileSync(filePath, 'utf-8');

      expect(content.split(CONTEXT_TAG_OPEN).length - 1).toBe(1);
    });

    // Pairing indexOf(open) of one spelling with indexOf(close) of another
    // would compute a bogus range and corrupt the file on write.
    it('ignores a mismatched tag pair rather than computing a bogus range', () => {
      expect(findTaggedBlock(`${CONTEXT_TAG_OPEN}\nbody\n${LEGACY_CLOSE}`)).toBeNull();
    });

    it('ignores a closing tag that precedes its opening tag', () => {
      expect(findTaggedBlock(`${CONTEXT_TAG_CLOSE}\nbody\n${CONTEXT_TAG_OPEN}`)).toBeNull();
    });

    it('strips either spelling', () => {
      expect(stripTaggedBlock(`x\n${LEGACY_OPEN}\nc\n${LEGACY_CLOSE}\ny`)).toBe('x\n\ny');
      expect(stripTaggedBlock(`x\n${CONTEXT_TAG_OPEN}\nc\n${CONTEXT_TAG_CLOSE}\ny`)).toBe('x\n\ny');
      expect(stripTaggedBlock('no block here')).toBe('no block here');
    });

    it('detects either spelling', () => {
      expect(hasTaggedBlock(`${LEGACY_OPEN}\nc\n${LEGACY_CLOSE}`)).toBe(true);
      expect(hasTaggedBlock(`${CONTEXT_TAG_OPEN}\nc\n${CONTEXT_TAG_CLOSE}`)).toBe(true);
      expect(hasTaggedBlock('plain file')).toBe(false);
    });
  });

  // A filename does NOT heal itself: writing the canonical basename next to a
  // legacy one leaves both on disk, and Cursor/Windsurf apply every rules
  // file — the user would get their context twice on every prompt.
  describe('rules file migration', () => {
    it('writes the canonical basename and deletes the legacy file', () => {
      const rulesDir = join(tempDir, '.cursor', 'rules');
      mkdirSync(rulesDir, { recursive: true });
      const legacyFile = join(rulesDir, `${LEGACY_CONTEXT_RULES_BASENAME}.mdc`);
      writeFileSync(legacyFile, 'stale rules content');

      const written = writeRulesFile(rulesDir, '.mdc', 'fresh rules content');

      expect(written).toBe(join(rulesDir, `${CONTEXT_RULES_BASENAME}.mdc`));
      expect(existsSync(written)).toBe(true);
      expect(readFileSync(written, 'utf-8')).toBe('fresh rules content');
      expect(existsSync(legacyFile)).toBe(false);
    });

    it('works when no legacy file exists', () => {
      const rulesDir = join(tempDir, '.windsurf', 'rules');
      const written = writeRulesFile(rulesDir, '.md', 'content');

      expect(existsSync(written)).toBe(true);
      expect(existsSync(join(rulesDir, `${LEGACY_CONTEXT_RULES_BASENAME}.md`))).toBe(false);
    });

    it('leaves no temp file behind', () => {
      const rulesDir = join(tempDir, '.cursor', 'rules');
      const written = writeRulesFile(rulesDir, '.mdc', 'content');
      expect(existsSync(`${written}.tmp`)).toBe(false);
    });

    // Uninstall has to clean both, or a pre-rename install keeps injecting
    // context after the user asked for removal.
    it('offers both spellings for cleanup, canonical first', () => {
      const candidates = rulesFileCandidates('/tmp/rules', '.mdc');
      expect(candidates[0]).toContain(`${CONTEXT_RULES_BASENAME}.mdc`);
      expect(candidates[1]).toContain(`${LEGACY_CONTEXT_RULES_BASENAME}.mdc`);
    });
  });

  describe('idempotency', () => {
    it('produces same result when called twice with same content', () => {
      const filePath = join(tempDir, 'CLAUDE.md');

      injectContextIntoMarkdownFile(filePath, 'stable content');
      const firstWrite = readFileSync(filePath, 'utf-8');

      injectContextIntoMarkdownFile(filePath, 'stable content');
      const secondWrite = readFileSync(filePath, 'utf-8');

      expect(secondWrite).toBe(firstWrite);
    });

    it('updates content when called with different data', () => {
      const filePath = join(tempDir, 'CLAUDE.md');

      injectContextIntoMarkdownFile(filePath, 'version 1');
      injectContextIntoMarkdownFile(filePath, 'version 2');

      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain('version 2');
      expect(content).not.toContain('version 1');
    });
  });
});
