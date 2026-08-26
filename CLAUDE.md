# hummem: AI Development Instructions

hummem is a memory layer for AI coding assistants providing persistent memory across sessions. It captures tool usage, compresses observations using the Claude Agent SDK, and injects relevant context into future sessions. It stores data in `~/.hummem` and runs its worker on the 378xx port band (default `37800 + uid % 100`, Kimi-dedicated instance 37892).

Legacy compatibility (`~/.claude-mem`, `CLAUDE_MEM_*` variables, `claude-mem.db`) is retained for migrating installs and lets hummem run alongside a legacy claude-mem install on 377xx. See `MIGRATION.md` and `COMPATIBILITY.md`; project lineage is recorded in `PROVENANCE.md`.

## Build

```bash
npm run build-and-sync        # Build, sync to marketplace, restart worker
```

## File Locations

- **Source**: `<project-root>/src/`
- **Built Plugin**: `<project-root>/plugin/`
- **Installed Plugin**: `~/.claude/plugins/marketplaces/thedotmack/`
- **Database**: `~/.hummem/hummem.db` (a legacy `claude-mem.db` is renamed on first start)
- **Chroma**: `~/.hummem/chroma/`

## Requirements

- **Bun** (all platforms - auto-installed if missing)
- **uv** (all platforms - auto-installed if missing, provides Python for Chroma)
- Node.js

## Documentation

**Public Docs**: https://github.com/kejwojew/hummem#readme (Mintlify)
**Source**: `docs/public/` - MDX files, edit `docs.json` for navigation
**Deploy**: Auto-deploys from GitHub on push to main

## Important

No need to edit the changelog ever, it's generated automatically.
