# Compatibility policy

This document states exactly which legacy names hummem still honours, why, and
what would have to happen before any of them is removed. It exists so that
"still supported" is a commitment rather than an accident of implementation.

For step-by-step migration instructions, see `MIGRATION.md`.

---

## Principles

1. **Nothing that holds user data is removed on a schedule.** Memory is not
   reproducible; a user who upgrades after a long gap must not lose it.
2. **Deprecation warns before it breaks.** A name is announced as deprecated in
   at least one release before removal is even considered.
3. **The canonical name always wins.** Where both a canonical and a legacy name
   are set, the canonical one takes effect. Setting the new name must never be
   silently defeated by a stale value.
4. **Removal requires a major version.** No legacy support disappears in a minor
   or patch release.

---

## Supported legacy surfaces

### Environment variables — supported, deprecated

Every `CLAUDE_MEM_*` variable is honoured as a fallback for its `HUMMEM_*`
equivalent.

| Property | Behaviour |
| --- | --- |
| Precedence | `HUMMEM_*` wins when both are set |
| Warning | once per variable per process, on stderr |
| Suppression | `HUMMEM_SUPPRESS_LEGACY_ENV_WARNING=1` |
| Removal | not before a future major release |

Hook processes suppress the warning automatically: they are spawned per tool
call, and a deprecation notice there is noise the user cannot act on
mid-session. `hummem doctor` reports the same information at a moment when it is
actionable.

### `settings.json` keys — supported, not deprecated

On-disk settings keys are spelled `CLAUDE_MEM_*` and **this is not scheduled to
change**. Renaming the schema would invalidate every existing settings file for
no user-visible benefit.

`HUMMEM_*` keys are also accepted in the same file. If both spellings are
present for one setting, the canonical one wins.

### Legacy data directory — supported

`~/.claude-mem` is consulted when:

- `CLAUDE_MEM_DATA_DIR` is set and `HUMMEM_DATA_DIR` is not, or
- a `settings.json` exists there and none exists in `~/.hummem`.

hummem never moves, rewrites, or deletes `~/.claude-mem`. A claude-mem install
may still be using it.

### Legacy database filename — migrated once

A `claude-mem.db` found in the active data directory is renamed to `hummem.db`,
with its `-wal`/`-shm` sidecars, subject to the safety rules in `MIGRATION.md`.

The migration never overwrites an existing `hummem.db` and never deletes
anything. If it cannot complete, hummem keeps using the legacy filename rather
than refusing to start.

This support is permanent for practical purposes: the code path is small, and
removing it would strand any archive restored from a pre-rename backup.

### Legacy plugin and MCP identities — cleanup only

Older installs registered themselves as `claude-mem@thedotmack` and an MCP
server named `claude-mem`. hummem registers `hummem@thedotmack` and `hummem`,
and removes the stale entries it recognises during install.

hummem does not preserve the old identities. Two entries pointing at two
different workers is a worse outcome than one clean registration.

---

## What is *not* supported

- **Running one database from two projects simultaneously.** Pointing
  `HUMMEM_DATA_DIR` at `~/.claude-mem` while a claude-mem worker is also running
  gives two writers on one SQLite file. Nothing prevents it; nothing makes it
  safe.
- **Publishing under the upstream package name.** hummem is published as
  `hummem` only.
- **Upstream synchronization.** hummem does not track, merge from, or backport
  to `thedotmack/claude-mem`. Bugs found here are fixed here.

---

## Removal process

Should a legacy surface ever be removed, in order:

1. It is documented as deprecated here and in `MIGRATION.md`.
2. It emits a runtime warning naming its replacement.
3. It survives at least one full major release cycle in that state.
4. Removal ships in a major version, with the migration path in the release
   notes.

Steps 1–3 are already satisfied for the `CLAUDE_MEM_*` environment namespace as
of 1.0.0. No removal date is scheduled.

---

## Reporting a compatibility break

If an upgrade breaks a documented legacy surface, that is a bug — open an issue
at <https://github.com/kejwojew/hummem/issues> with the output of:

```bash
npx hummem doctor
env | grep -E '^(HUMMEM|CLAUDE_MEM)_'
```

Redact any API keys before posting.
