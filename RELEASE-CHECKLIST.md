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

## 6. Publish to npm — DONE

`hummem@1.0.0` is published and verified: downloaded from the registry,
`.claude-plugin/marketplace.json` present, CLI reports `1.0.0`, and the bundled
worker creates `hummem.db` in a fresh data directory.

Irreversible: the package name is claimed permanently, and a published version
cannot be reissued under the same number.

```bash
npm login
npm publish        # runs prepublishOnly: build + postinstall + privacy + branding guards
```

**If publishing is rejected for two-factor authentication**, either pass a
one-time code directly:

```bash
npm publish --otp=<6-digit code>
```

or create a granular access token on npmjs.com with "bypass 2FA" enabled, so
publishing works non-interactively:

```bash
npm config set //registry.npmjs.org/:_authToken=<token>
npm publish
```

**Only if npm reports `EPERM` about root-owned cache files**, take ownership of
the cache and retry. Do not run this pre-emptively:

```bash
sudo chown -R "$(id -u):$(id -g)" ~/.npm
```

**Verify:** `npm view hummem version` prints `1.0.0`.

**Undo:** `npm unpublish hummem@1.0.0` works only within 72 hours, and the name
stays reserved regardless.

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
