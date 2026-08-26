# Migrating from claude-mem

hummem began as a derivative of [claude-mem](https://github.com/thedotmack/claude-mem)
and is now developed independently (see `PROVENANCE.md`). If you previously ran
claude-mem, this document covers everything that changed and what you have to do
about it.

**Short version:** for most people, nothing. Install hummem, start it, and your
existing memory is picked up and migrated automatically. Old environment
variables keep working.

---

## What changes, at a glance

| | claude-mem | hummem |
| --- | --- | --- |
| Package / CLI | `claude-mem` | `hummem` |
| Data directory | `~/.claude-mem` | `~/.hummem` |
| Database file | `claude-mem.db` | `hummem.db` |
| Environment prefix | `CLAUDE_MEM_*` | `HUMMEM_*` (old names still work) |
| Worker port band | `377xx` | `378xx` |
| MCP server name | `claude-mem` | `hummem` |
| Version line | `13.x` | starts again at `1.0.0` |

The version reset is not a downgrade. hummem starts its own release line
because it no longer shares a release history with the project it came from.

---

## Migrating

### 1. Install

```bash
npx hummem install
```

You do **not** need to uninstall claude-mem first. hummem uses a different data
directory, a different port band, and a different plugin identity, so the two can
coexist while you verify the move.

### 2. Start it

```bash
npx hummem start
```

On first start hummem resolves its data directory and database. If it finds a
legacy database it migrates it — see below.

### 3. Check the result

```bash
npx hummem doctor
```

`doctor` reports the active data directory, worker health, and any deprecated
environment variables it found.

---

## What migrates automatically

### The database

If your data directory contains a `claude-mem.db` and no `hummem.db`, the file
is renamed to `hummem.db` on startup, together with its `-wal` and `-shm`
sidecars.

The migration is deliberately conservative:

- It **never overwrites** an existing `hummem.db`. If both files are present,
  hummem uses `hummem.db`, leaves the legacy file untouched, and reports it in
  `doctor` — you decide which one you want.
- SQLite sidecars move with the database or not at all. A `-wal` file holds
  committed transactions that are not yet in the main file, so splitting the
  pair would lose data.
- It uses an atomic rename, not a copy-and-delete.
- If the rename fails — read-only volume, permissions — hummem logs the reason
  and keeps using the legacy filename. A stale filename is cosmetic; refusing to
  start is not.

No data is deleted at any point.

### The data directory

hummem defaults to `~/.hummem`. It does **not** move `~/.claude-mem` for you,
because that directory may still be in use by a claude-mem install you have not
retired yet.

To carry your existing memory across, point hummem at the old directory:

```bash
export HUMMEM_DATA_DIR=~/.claude-mem
```

or copy it once:

```bash
cp -a ~/.claude-mem ~/.hummem
```

Copy rather than move while you are still verifying. Once hummem has run against
`~/.hummem`, its database is named `hummem.db`, so the two directories will not
be confused with each other.

### Settings

`settings.json` keys are unchanged. They are still spelled `CLAUDE_MEM_*` on
disk, because renaming them would invalidate every existing settings file. If
you prefer, you may write `HUMMEM_*` keys instead — both spellings are accepted,
and the canonical one wins if you set both.

---

## Environment variables

Every tunable now has a canonical `HUMMEM_*` name. The old `CLAUDE_MEM_*` names
still work.

```
1. HUMMEM_<NAME>       canonical — always wins
2. CLAUDE_MEM_<NAME>   deprecated — honoured, warns once per process
```

The canonical name winning is deliberate: if you set the new variable to fix
something, a stale value in an old shell profile must not silently override you.

Renaming is a mechanical prefix swap:

```bash
# before
export CLAUDE_MEM_DATA_DIR=~/memory
export CLAUDE_MEM_WORKER_PORT=37810

# after
export HUMMEM_DATA_DIR=~/memory
export HUMMEM_WORKER_PORT=37810
```

To find what you still have set:

```bash
npx hummem doctor          # reports deprecated variables it can see
env | grep '^CLAUDE_MEM_'  # your current shell
```

`doctor` also flags the confusing case where **both** names are set — the legacy
value then has no effect at all, which is otherwise invisible.

### Silencing the deprecation warning

The warning is printed once per variable per process, on stderr. To suppress it
while you finish migrating:

```bash
export HUMMEM_SUPPRESS_LEGACY_ENV_WARNING=1
```

Hook processes suppress it automatically — they are spawned per tool call and
cannot show you anything actionable mid-session.

---

## Running both at once

hummem is designed to coexist with a legacy install so you can verify before you
commit:

| Resource | claude-mem | hummem |
| --- | --- | --- |
| Data directory | `~/.claude-mem` | `~/.hummem` |
| Worker port | `37700 + uid % 100` | `37800 + uid % 100` |
| Kimi worker port | `37791` | `37892` |
| Plugin identity | `claude-mem@thedotmack` | `hummem@thedotmack` |
| MCP server key | `claude-mem` | `hummem` |

Because the port bands differ, both workers can run simultaneously without
fighting over a socket.

Two caveats:

- If you set `HUMMEM_DATA_DIR=~/.claude-mem`, both projects share one database.
  Do not run both workers in that configuration.
- IDE integrations that key on the MCP server name will show both entries. Remove
  the `claude-mem` entry when you retire the old install.

---

## Retiring claude-mem

Once you are satisfied hummem has your memory:

```bash
npx claude-mem uninstall      # if the old CLI is still installed
rm -rf ~/.claude-mem          # only after you have verified the data moved
```

Check `~/.hummem/hummem.db` exists and `npx hummem doctor` is clean **before**
deleting anything. There is no undo.

---

## Troubleshooting

**`doctor` shows an unexpected data directory.**
Precedence is: `HUMMEM_DATA_DIR`, then `CLAUDE_MEM_DATA_DIR`, then a
`settings.json` key found in `~/.hummem` or `~/.claude-mem`, then `~/.hummem`.
A variable exported in a shell profile is the usual culprit.

**My memory looks empty after switching.**
hummem is almost certainly reading a different data directory than claude-mem
was. Run `npx hummem doctor` to see which one, then either point
`HUMMEM_DATA_DIR` at the old directory or copy it across. Nothing was deleted.

**Both `hummem.db` and `claude-mem.db` exist.**
Deliberate: hummem refuses to overwrite an existing database. It is using
`hummem.db`. Inspect both, then remove the one you do not want.

**The worker will not start after installing alongside claude-mem.**
Check for a port collision — hummem uses `378xx`, claude-mem uses `377xx`. If
you set `HUMMEM_WORKER_PORT` or `CLAUDE_MEM_WORKER_PORT` by hand, make sure the
two do not resolve to the same value.

---

## Compatibility policy

See `COMPATIBILITY.md` for which legacy names are supported, and for how long.
