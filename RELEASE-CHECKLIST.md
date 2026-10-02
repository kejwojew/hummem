# Release checklist

Steps that cannot be performed from an automated environment, either because
they write outside the repository or because they publish irreversibly.

Each step states what it does, how to verify it worked, and how to undo it.

---

## 0. Current state

At the time this list was written:

| | |
| --- | --- |
| Version | `1.0.0`, unpublished |
| Data directory | migrated to `~/.hummem` (12194 observations, verified by checksum) |
| Legacy directory | `~/.claude-mem` intact, untouched |
| Backup | `~/.claude-mem.backup-<date>`, verified byte-for-byte |
| Installed plugin | pre-rename build under `~/.claude/plugins/marketplaces/thedotmack` |
| Worker | stopped, write-ahead log checkpointed |

The installed plugin is **older than the migration work**. It resolves
`claude-mem.db` and knows nothing about `~/.hummem`, so starting it before
step 2 would write to the legacy directory.

---

## 1. Tighten credential permissions

`.env` holds provider API keys and is world-readable in all three copies.

```bash
chmod 600 ~/.hummem/.env ~/.claude-mem/.env ~/.claude-mem.backup-*/.env
```

**Verify:** `stat -f '%Sp %N' ~/.hummem/.env` shows `-rw-------`.

**Undo:** not needed; tightening permissions breaks nothing.

---

## 2. Install the rebuilt plugin

The repository's `plugin/` now contains the migration-aware runtime, but the
copy under `~/.claude/plugins/` is the old build.

```bash
cd <repo>
npm run build-and-sync
```

This rebuilds, rsyncs into the marketplace directory, and restarts the worker.

**Verify:**

```bash
grep -c 'hummem\.db' ~/.claude/plugins/marketplaces/*/plugin/scripts/worker-service.cjs
```

Must be at least `1`. If it prints `0`, the sync did not land and the worker is
still running old code.

**Undo:** the previous bundle is recoverable from git history; nothing under
`~/.hummem` is modified by this step.

---

## 3. Start the worker and confirm it uses the new directory

```bash
npx hummem start     # once published; before that, run the plugin script directly
```

**Verify:**

```bash
lsof -nP -iTCP -sTCP:LISTEN | grep 378        # a port in the 378xx band
lsof ~/.hummem/hummem.db                      # the worker holds the new database
lsof ~/.claude-mem/claude-mem.db              # must be empty
```

The third check is the important one: if anything holds the legacy database,
the worker is running pre-migration code and new memory is going to the old
directory. Stop it and repeat step 2.

**Undo:** stop the worker. No data is lost either way — both directories exist.

---

## 4. Confirm memory is readable end to end

Open a session and query memory, or check directly:

```bash
sqlite3 ~/.hummem/hummem.db 'SELECT COUNT(*) FROM observations;'
```

Expect the count recorded above. A materially smaller number means the worker
created a fresh database somewhere else — check step 3 before continuing.

---

## 5. Retire the legacy directory (only after several days of use)

There is no rush: `~/.claude-mem` costs disk space and nothing else. Keep it
until you are confident the new install is behaving.

```bash
rm -rf ~/.claude-mem
```

Keep the dated backup for longer than this.

**Undo:** restore from `~/.claude-mem.backup-<date>`.

---

## 6. Publish to npm — AUTOMATED since 2026-08-31

Releases `1.0.0` through `1.0.4` were published by hand from a maintainer
machine. They no longer are: `.github/workflows/npm-publish.yml` fires on any
`v*` tag and runs build → `smoke:clean-room` → `npm publish`, authenticating
with the `NPM_TOKEN` repository secret (granular token, package-scoped, "bypass
2FA" enabled, no IP allow-list — a GitHub-hosted runner has no stable address).

Publishing is therefore a consequence of pushing the tag:

```bash
git push origin main && git push origin vX.Y.Z
```

**Do not run `npm publish`, `np`, or `npm run release:*` locally.** They
publish too, and racing the workflow for the same version number means one of
them fails on an already-published version.

**Verify:**

```bash
gh run list --workflow npm-publish.yml --limit 1
npm view hummem@X.Y.Z version    # should print X.Y.Z
```

**Confirm the secret still exists** before a release (tokens expire):

```bash
gh secret list --repo kejwojew/hummem   # expect NPM_TOKEN
```

Irreversible: a published version cannot be reissued under the same number.
`npm unpublish hummem@X.Y.Z` works only within 72 hours, and the name stays
reserved regardless. If the workflow fails *after* `npm publish` succeeded, the
fix is a version bump, not a re-run.

---

## 7. Optional cleanup

**Stale shell aliases.** Both files pin a plugin version that no longer exists:

```bash
grep -n 'claude-mem/10\.5\.2' ~/.zshrc ~/.bashrc
```

Either repoint them at the current version or delete the lines, since the
command is now `hummem`.

**The public upstream fork.** `kejwojew/claude-mem` still exists on GitHub as a
fork. Deleting or archiving it is a decision only you can make; nothing in this
project depends on it.

---

## Known issues not addressed

- **19 failing tests** predate all of this work (`worker-json-status`,
  `ProcessManager` start-token, `cursor-extraction`, and one sandbox `EPERM`).
  They were verified against a pre-work baseline and are unrelated to the
  rename or the migration.
- **`doctor` cannot run from a source checkout** — it requires the bundled
  plugin layout. Run it from an installed plugin.
