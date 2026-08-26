#!/usr/bin/env node
/**
 * Privacy guard — fails when tracked files leak operator-identifying data.
 *
 * This repository is built from a live memory database, so evaluation
 * reports and debugging notes can accidentally embed real home paths,
 * machine user names, or verbatim fragments of private conversations.
 * Those must never reach a published artifact.
 *
 * Scope: files tracked by git (staged content when --staged is passed).
 * Exit 1 on any finding, with the file, line, and rule that matched.
 *
 * Usage:
 *   node scripts/check-privacy.cjs            # scan tracked worktree files
 *   node scripts/check-privacy.cjs --staged   # scan staged changes only
 */

const { execFileSync } = require('node:child_process');
const { readFileSync, statSync } = require('node:fs');

const STAGED = process.argv.includes('--staged');

/**
 * Home-directory segments that are unmistakably illustrative. Anything
 * outside this set is treated as a real account name and rejected, so a
 * genuine operator handle can never pass as "probably a fixture".
 */
const PLACEHOLDER_USERS = new Set([
  'user',
  'username',
  'you',
  'youruser',
  'your_username',
  'me',
  'someone',
  'test',
  'tester',
  'testuser',
  'dev',
  'developer',
  'example',
  'foo',
  'foo.bar',
  'bar',
  'alice',
  'bob',
  'jane',
  'john',
  'john.doe',
  'jane.doe',
  // Canonical apostrophe fixture for shell/PowerShell quote escaping.
  "o'brien",
  // CI and container accounts, not people.
  'node',
  'runner',
  'root',
  'ubuntu',
  'linuxbrew',
  'public',
  'default',
  'tmp',
]);

function isPlaceholderUser(segment) {
  const s = segment.toLowerCase();
  if (s.startsWith('<') || s.startsWith('$') || s.startsWith('{') || s.startsWith('%')) {
    return true;
  }
  return PLACEHOLDER_USERS.has(s);
}

/**
 * Each rule is deliberately narrow: broad patterns produce noise that
 * trains people to ignore the check.
 */
const RULES = [
  {
    id: 'home-path',
    description: 'absolute macOS/Linux home path with a real account name',
    pattern: /\/(?:Users|home)\/([A-Za-z0-9._$<{%-]{1,32})/g,
    accept: (m) => isPlaceholderUser(m[1]),
  },
  {
    id: 'windows-home-path',
    description: 'absolute Windows user profile path with a real account name',
    pattern: /[A-Za-z]:\\Users\\([A-Za-z0-9._$<{%'-]{1,32})/g,
    accept: (m) => isPlaceholderUser(m[1]),
  },
  {
    id: 'private-key-block',
    description: 'PEM private key block',
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
  },
  {
    id: 'live-token',
    description: 'provider token that looks live (not an obvious fixture)',
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|xox[baprs]-[0-9A-Za-z-]{20,}|AIza[0-9A-Za-z_-]{35})\b/g,
  },
];

/**
 * Paths whose whole purpose is to exercise redaction logic; they must be
 * allowed to contain fixture-shaped secrets. Keep this list short and
 * justified — every entry is a hole in the guard.
 */
const ALLOWLIST = [
  /^tests\/telemetry\//,
  /^tests\/shared\/oauth-token\.test\.ts$/,
  /^docs\/public\/usage\/private-tags\.mdx$/,
  /^openclaw\/test-install\.sh$/,
  /^scripts\/check-privacy\.cjs$/,
  /^CHANGELOG\.md$/,
];

const BINARY_EXT =
  /\.(png|jpe?g|gif|webp|ico|svg|pdf|zip|gz|tgz|bz2|xz|mp4|mov|mp3|wav|woff2?|ttf|eot|node|wasm|db|sqlite3?|npz|bundle)$/i;

function trackedFiles() {
  const args = STAGED
    ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR']
    : ['ls-files'];
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\n')
    .filter(Boolean);
}

function readCandidate(file) {
  if (BINARY_EXT.test(file)) return null;
  try {
    if (STAGED) {
      return execFileSync('git', ['show', `:${file}`], {
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
      });
    }
    // Skip oversized generated bundles; they are build output, not prose.
    if (statSync(file).size > 2 * 1024 * 1024) return null;
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function main() {
  const findings = [];

  for (const file of trackedFiles()) {
    if (ALLOWLIST.some((rx) => rx.test(file))) continue;
    const content = readCandidate(file);
    if (content == null || content.includes('\u0000')) continue;

    const lines = content.split('\n');
    for (const rule of RULES) {
      let reported = false;
      for (let i = 0; i < lines.length && !reported; i += 1) {
        rule.pattern.lastIndex = 0;
        let match;
        while ((match = rule.pattern.exec(lines[i])) !== null) {
          if (rule.accept && rule.accept(match)) continue;
          findings.push({
            file,
            line: i + 1,
            rule: rule.id,
            description: rule.description,
            sample: match[0].slice(0, 60),
          });
          reported = true;
          break;
        }
      }
    }
  }

  if (findings.length === 0) {
    console.log(
      `privacy: OK — no operator-identifying data in ${STAGED ? 'staged changes' : 'tracked files'}`
    );
    return;
  }

  console.error(`privacy: ${findings.length} finding(s)\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    rule:  ${f.rule} — ${f.description}`);
    console.error(`    match: ${f.sample}\n`);
  }
  console.error(
    'Replace real paths/quotes with placeholders such as /Users/<user>, or add a\n' +
      'justified entry to ALLOWLIST in scripts/check-privacy.cjs.'
  );
  process.exit(1);
}

main();
