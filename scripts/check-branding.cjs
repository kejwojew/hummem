#!/usr/bin/env node
/**
 * Branding guard — fails when the upstream project's name reaches a surface a
 * user reads, clicks, or copies.
 *
 * This project is a derivative that now stands on its own. Making the rename
 * stick is not a one-time cleanup: a stray `docs.claude-mem.ai` link, an
 * install command naming the upstream marketplace, or a package field pointing
 * at the upstream repository silently sends users to a different codebase.
 * Those regressions are invisible in review because they look like ordinary
 * strings.
 *
 * The guard is deny-by-default: the legacy name is forbidden everywhere except
 * where it is required to be correct. Every exemption is an explicit rule with
 * a stated reason, so the allowlist is auditable rather than a growing pile of
 * silenced findings.
 *
 * Usage:
 *   node scripts/check-branding.cjs           # scan tracked files
 *   node scripts/check-branding.cjs --staged  # scan staged content
 *   node scripts/check-branding.cjs --json    # machine-readable findings
 */

const { execFileSync } = require('node:child_process');
const { readFileSync, statSync } = require('node:fs');

const STAGED = process.argv.includes('--staged');
const AS_JSON = process.argv.includes('--json');

/**
 * Patterns that must never appear outside an exempt path.
 *
 * Deliberately narrow. `CLAUDE_MEM_*` environment identifiers are NOT listed:
 * they are the documented deprecated namespace and the on-disk settings schema,
 * both of which are supported on purpose (see COMPATIBILITY.md). Flagging them
 * would make the guard fire ~900 times and train people to ignore it.
 */
const RULES = [
  {
    id: 'upstream-docs-domain',
    pattern: /\bdocs\.claude-mem\.ai\b/g,
    why: 'documentation domain serving another project',
    fix: 'link to docs/public/<page>.mdx in this repository',
  },
  {
    id: 'upstream-site-domain',
    pattern: /\bclaude-mem\.ai\b/g,
    why: "another project's website",
    fix: 'use https://github.com/kejwojew/hummem',
  },
  {
    id: 'upstream-repo',
    pattern: /\bthedotmack\/claude-mem\b/g,
    why: 'upstream repository — clone/issue/install links land users elsewhere',
    fix: 'use kejwojew/hummem, or cite it explicitly as an upstream reference',
  },
  {
    id: 'upstream-package-name',
    // `npx claude-mem`, `claude-mem install`, `"name": "claude-mem"`.
    pattern: /(?:npx\s+claude-mem\b|(?<![\w./-])claude-mem\s+(?:install|start|stop|restart|status|doctor|uninstall)\b|"name":\s*"claude-mem")/g,
    why: 'invokes the upstream package rather than this one',
    fix: 'use hummem',
  },
  {
    id: 'upstream-marketplace-add',
    pattern: /marketplace\s+add\s+thedotmack\/claude-mem/g,
    why: 'installs the upstream plugin instead of this one',
    fix: 'use kejwojew/hummem',
  },
];

/**
 * Paths exempt from the rules above, each with the reason it is exempt.
 *
 * Adding an entry here is a decision, not a formality: it declares that the
 * legacy name is *correct* in that file. If the reason does not survive being
 * written down, the finding should be fixed instead.
 */
const ALLOWLIST = [
  {
    pattern: /^CHANGELOG\.md$/,
    reason: 'generated; historical entries describe releases genuinely made under the old name',
  },
  {
    pattern: /^NOTICE$/,
    reason: 'Apache-2.0 attribution to the original authors must name the original work',
  },
  {
    pattern: /^(PROVENANCE|MIGRATION|COMPATIBILITY)\.md$/,
    reason: 'these documents exist to describe the relationship to the upstream project',
  },
  {
    pattern: /^docs\/public\/architecture-evolution\.mdx$/,
    reason: 'historical architecture record describing releases made under the old name',
  },
  {
    pattern: /^docs\/public\/architecture\/pm2-to-bun-migration\.mdx$/,
    reason: 'historical migration record from before the rename',
  },
  {
    pattern: /^(plans|\.plan|\.claude)\//,
    reason: 'planning archives are a historical record, not user-facing documentation',
  },
  {
    pattern: /^scripts\/check-branding\.cjs$/,
    reason: 'this file necessarily contains the patterns it forbids',
  },
  {
    pattern: /^plugin\/(scripts|sqlite|ui)\//,
    reason: 'build output regenerated from src/; fix the source, not the bundle',
  },
  {
    pattern: /^(dist|node_modules)\//,
    reason: 'build output',
  },
  {
    pattern: /^plugin\/vendor\//,
    reason: 'vendored third-party source',
  },
];

/**
 * Line-level exemptions for references that are *correct* where they appear.
 *
 * Preferred over path exemptions: exempting a whole file would also hide a
 * future regression elsewhere in it. Each entry states why the legacy name is
 * the right thing to write on that line.
 */
const LINE_EXEMPTIONS = [
  {
    // Legacy on-disk plugin-cache directories, still searched so an install
    // predating the rename keeps resolving. Renaming the string would break
    // discovery of real directories on real machines.
    pattern: /plugins\/cache\/thedotmack\/claude-mem|cache\/claude-mem-local\/claude-mem/,
    reason: 'legacy plugin-cache path that still exists on migrated installs',
  },
  {
    // Citing an upstream issue by number. The number has no counterpart here,
    // so rewriting the URL would manufacture a dead link.
    pattern: /(?:see |Closes |upstream report at )[^\n]*thedotmack\/claude-mem[#/ ]?\d+/i,
    reason: 'citation of an upstream issue that has no counterpart in this repository',
  },
  {
    // Prose describing coexistence with, or migration from, the upstream
    // install. Naming it is the entire point of the sentence.
    pattern: /(?:alongside|legacy|migrat\w+|upstream|predating)[^\n]*claude-mem|claude-mem[^\n]*(?:install on 377|legacy)/i,
    reason: 'prose describing coexistence with or migration from the upstream install',
  },
  {
    // Test fixtures asserting that legacy identifiers are still recognised.
    pattern: /CLAUDE_MEM_REPO|assert_contains[^\n]*claude-mem/,
    reason: 'fixture asserting legacy identifiers remain recognised',
  },
];

function lineExemptionFor(line) {
  return LINE_EXEMPTIONS.find((entry) => entry.pattern.test(line));
}

const BINARY_EXT =
  /\.(png|jpe?g|gif|webp|ico|svg|pdf|zip|gz|tgz|bz2|xz|mp4|mov|mp3|wav|woff2?|ttf|eot|node|wasm|db|sqlite3?|npz|bundle|lock)$/i;

function exemptionFor(file) {
  return ALLOWLIST.find((entry) => entry.pattern.test(file));
}

function candidateFiles() {
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
    if (statSync(file).size > 2 * 1024 * 1024) return null;
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function main() {
  const findings = [];
  let scanned = 0;
  let exempted = 0;
  let exemptedLines = 0;

  for (const file of candidateFiles()) {
    if (exemptionFor(file)) {
      exempted += 1;
      continue;
    }
    const content = readCandidate(file);
    if (content == null || content.includes('\u0000')) continue;
    scanned += 1;

    const lines = content.split('\n');
    for (const rule of RULES) {
      for (let i = 0; i < lines.length; i += 1) {
        rule.pattern.lastIndex = 0;
        const match = rule.pattern.exec(lines[i]);
        if (!match) continue;
        if (lineExemptionFor(lines[i])) {
          exemptedLines += 1;
          continue;
        }
        findings.push({
          file,
          line: i + 1,
          rule: rule.id,
          why: rule.why,
          fix: rule.fix,
          sample: match[0].slice(0, 70),
        });
        break; // one finding per rule per file keeps output actionable
      }
    }
  }

  if (AS_JSON) {
    console.log(JSON.stringify({ scanned, exempted, exemptedLines, findings }, null, 2));
    process.exit(findings.length === 0 ? 0 : 1);
  }

  if (findings.length === 0) {
    console.log(
      `branding: OK — no upstream references in ${scanned} files ` +
        `(${exempted} files, ${exemptedLines} lines exempt by allowlist)`
    );
    return;
  }

  console.error(`branding: ${findings.length} finding(s)\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    rule:  ${f.rule} — ${f.why}`);
    console.error(`    found: ${f.sample}`);
    console.error(`    fix:   ${f.fix}\n`);
  }
  console.error(
    'If a reference is genuinely required to be correct (legal attribution,\n' +
      'migration guidance, historical record), add a justified entry to\n' +
      'ALLOWLIST in scripts/check-branding.cjs rather than weakening a rule.'
  );
  process.exit(1);
}

main();
