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

### 2. Bring your memory across

```bash
npx hummem migrate            # preview — nothing is written
npx hummem migrate --apply    # perform it
```

Stop any running claude-mem worker first; the command refuses to copy a
database that is still being written to. Full details below.

### 3. Start it

```bash
npx hummem start
```

### 4. Check the result

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

hummem defaults to `~/.hummem` and never touches `~/.claude-mem` on its own —
that directory may still belong to a claude-mem install you have not retired.

Use the migrate command to carry your memory across:

```bash
npx hummem migrate            # show exactly what would happen
npx hummem migrate --apply    # do it
```

It is a dry run by default. The preview lists every entry, its size, and any
special handling, so nothing is a surprise.

**Do not copy the directory by hand.** A plain `cp -a` walks into three traps
that the command handles for you:

1. **The settings self-reference.** `settings.json` usually pins
   `CLAUDE_MEM_DATA_DIR` to the old absolute path. Copied verbatim, the migrated
   install reads that key and keeps writing to `~/.claude-mem` — the migration
   looks like it worked while changing nothing. The command rewrites the key.
2. **A running worker.** If anything is still writing to the directory, copying
   the SQLite database can corrupt it. The command detects live PID files and
   the Chroma writer lock, and refuses until you stop them.
3. **Runtime state.** PID files and supervisor registries from the old install
   are meaningless in the new directory and confuse startup. They are skipped,
   as are logs, which are regenerated.

The database and its `-wal`/`-shm` sidecars are renamed to `hummem.db` in
transit, and `.env` keeps its permissions — it holds provider API keys.

#### Options

| Flag | Effect |
| --- | --- |
| *(none)* | Dry run: print the plan and exit |
| `--apply` | Perform the migration |
| `--move` | Relocate instead of copying, reclaiming the disk space |
| `--yes` | Confirm the deletion that `--move` performs |
| `--from <dir>` | Source directory (default `~/.claude-mem`) |
| `--to <dir>` | Target directory (default `~/.hummem`) |

#### What protects you

- **Nothing is written until you pass `--apply`.** The dry run is the default.
- **Files are copied atomically.** Each one is written to a temporary name and
  renamed into place, so an interruption can never leave a half-written file
  that a later run mistakes for a finished one.
- **A resumed run verifies before it skips.** An entry that already exists is
  compared against its source and recopied if it does not match.
- **Every entry is verified after copying.** A mismatch is reported and the
  command exits non-zero, with your original data untouched.
- **`--move` deletes only after verification succeeds**, and only when you pass
  `--yes`. It is the one irreversible step in the command.
- **A live writer stops the migration.** An unreadable Chroma lock counts as
  occupied: a false alarm costs you one `stop`, a false all-clear can corrupt
  the vector store.

Copy mode is the default, so your old directory stays intact while you verify.
A memory directory can approach a gigabyte, mostly vector store; if you are
short on disk, `--move` avoids needing room for a second copy.

The command never overwrites an existing memory. If `~/.hummem` already holds a
database, it stops and tells you to decide which one you want.

#### If you would rather not move anything

You can point hummem at the existing directory:

```bash
export HUMMEM_DATA_DIR=~/.claude-mem
```

hummem then reads `claude-mem.db` **in place** and does not rename it, so the
other install keeps working. This is supported, with two caveats:

- Both projects share one SQLite database. Do not run both workers at once.
- You gain none of the isolation the separate directory provides — a problem in
  one install is a problem in both.

Migrating is the better default; this is for verifying before you commit.

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
was. Run `npx hummem doctor` to see which one, then run `npx hummem migrate` to
bring your memory across. Nothing was deleted.

**`migrate` says a process is still writing.**
A worker, an MCP server, or a Chroma process still holds the old directory. Run
`claude-mem stop`, close any IDE session using memory, and check for stragglers
with `pgrep -fl 'worker-service|chroma-mcp'`. This refusal is deliberate:
copying a SQLite database out from under a live writer can corrupt it.

**`migrate` says there is not enough space.**
Copy mode needs room for a second copy of your memory, which is mostly the
vector store. Re-run with `--move` to relocate the files instead of duplicating
them.

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
