# Provenance

hummem is a persistent memory system for AI coding assistants. It began as a
derivative of [claude-mem](https://github.com/thedotmack/claude-mem) and is now
developed as an independent project with its own memory model, data layout,
release line, and roadmap.

This document exists so the lineage is verifiable rather than implied. It is a
factual record, not a marketing position.

## License and attribution

The original work is licensed under the Apache License, Version 2.0.

- `LICENSE` — the Apache 2.0 license text, retained unchanged.
- `NOTICE` — required attribution to the original authors, retained and
  extended rather than replaced.

Apache 2.0 permits derivative works and rebranding. It also requires that the
license and attribution notices survive. Both obligations are met here: the
upstream copyright is preserved in `NOTICE`, and this file records what changed.

## Divergence point

| Fact | Value |
| --- | --- |
| Upstream project | `thedotmack/claude-mem` |
| Upstream baseline at divergence | `v13.6.1` |
| First independent commit | `3ed25bf8`, 2026-06-17 |
| Independent development window | 2026-06-17 → present |

Full history is retained in this repository. Every commit remains attributable
to its original author via standard git tooling:

```bash
git shortlog -sne          # contributions by author
git log --author=<name>    # a single author's commits
```

## Scope of independent work

Independent development accounts for roughly **36,000 added and 7,500 removed
lines** across 62 commits at the time of the standalone release. The upstream
foundation accounts for the remaining ~2,378 commits.

The independent work is not cosmetic. It introduced the memory model that
distinguishes this project from its origin:

**Memory strength and reinforcement**

- ACT-R based memory strength for observations, with retrieval practice and
  reconsolidation.
- Strength-weighted context injection.
- Surfacing observability and retrieval feedback.

**Semantic layer**

- Distillation of episodic observations into durable semantic facts.
- Semantic dedup judge (`ADD` / `INCREMENT` / `CONFLICT`).
- Provenance auditing and temporal belief queries — "what did I believe then".

**Retrieval quality**

- A measured memory-quality evaluation harness with an e5 embedding pilot.
- Relevance-floor plumbing for semantic injection, calibrated against a live
  embedding distribution.
- Cross-project semantic injection.
- Relevance annotation with drop verdicts.

**Retention and correctness**

- Explicit deletion policy with erasure cascade.
- Observer hardening, echo detection, and a groundedness metric.
- Task-scoped working memory: slots, journal, and per-prompt injection.

**Runtime and packaging**

- A vendored embedding-function fork for multilingual retrieval.
- Kimi Code integration: hooks, MCP, and a dedicated worker.
- Independent data directory, port band, and package identity.

## Relationship to upstream today

There is no upstream synchronization. This repository does not track
`thedotmack/claude-mem`, does not merge from it, and does not publish under its
name. Bugs found here are fixed here; they are not assumed to exist upstream,
and upstream fixes are not assumed to apply.

Users migrating from the original project should read `MIGRATION.md`.
