---
name: version-bump
description: Automated semantic versioning and release workflow for Claude Code plugins. Handles version increments across package.json, marketplace.json, plugin.json manifests, build verification, git tagging, GitHub releases, and changelog generation. NPM publishing (so `npx hummem@X.Y.Z` resolves) happens automatically in CI when the version tag is pushed — never publish by hand.
---

# Version Bump & Release Workflow

**IMPORTANT:** Plan and write detailed release notes before starting.

**CRITICAL:** Commit EVERYTHING (including build artifacts). At the end of this workflow, NOTHING should be left uncommitted or unpushed. Run `git status` at the end to verify.

## Preparation

1.  **Analyze**: Determine if the change is **PATCH** (bug fixes), **MINOR** (features), or **MAJOR** (breaking).
2.  **Environment**: Identify repository owner/name from `git remote -v`.
3.  **Paths — every file that carries the version string**:
    - `package.json` — **the npm/npx-published version** (`npx hummem@X.Y.Z` resolves from this)
    - `plugin/package.json` — bundled plugin runtime deps
    - `.claude-plugin/marketplace.json` — version inside `plugins[0].version`
    - `.claude-plugin/plugin.json` — top-level Claude-plugin manifest
    - `plugin/.claude-plugin/plugin.json` — bundled Claude-plugin manifest
    - `.codex-plugin/plugin.json` — Codex-plugin manifest
    - `plugin/.codex-plugin/plugin.json` — bundled Codex-plugin manifest
    - `openclaw/openclaw.plugin.json` — OpenClaw plugin manifest

    Verify coverage before editing: `git grep -l "\"version\": \"<OLD>\""` should list all eight. If a new manifest has been added since this doc was last updated, update this list.

## Workflow

1.  **Update**: Increment the version string in every path above. Do NOT touch `CHANGELOG.md` — it's regenerated.
2.  **Verify**: `git grep -n "\"version\": \"<NEW>\""` — confirm all eight files match. `git grep -n "\"version\": \"<OLD>\""` — should return zero hits.
3.  **Build and sync**: `npm run build-and-sync` to regenerate artifacts, sync the local marketplace copy, restart the worker, and clear the queue. Do not use plain `npm run build` for release validation because it can leave the local marketplace/worker out of sync.
4.  **Commit**: `git add -A && git commit -m "chore: bump version to X.Y.Z"`.
5.  **Tag**: `git tag -a vX.Y.Z -m "Version X.Y.Z"`.
6.  **Push**: `git push origin main && git push origin vX.Y.Z`.
7.  **Publish to npm — AUTOMATIC, triggered by the tag push in step 6.**
    `.github/workflows/npm-publish.yml` fires on any `v*` tag and runs build →
    `smoke:clean-room` → `npm publish`, authenticating with the `NPM_TOKEN`
    repository secret (configured 2026-08-31; `gh secret list` to confirm it is
    still present).

    **Do NOT run `npm publish` locally**, and do not run `np` / `npm run
    release:*` — those publish too, and doing so races the workflow for the
    same version number. Publishing is a consequence of the tag, nothing else.

    Watch the run and confirm it landed:
    ```bash
    gh run list --workflow npm-publish.yml --limit 1
    gh run watch <run-id>            # optional, follow it live
    npm view hummem@X.Y.Z version    # should print X.Y.Z
    ```
    If the workflow fails, read the failing step before retrying: a version
    already on the registry cannot be republished, so a partial failure after
    `npm publish` succeeded needs a version bump rather than a re-run.
8.  **GitHub release**: `gh release create vX.Y.Z --title "vX.Y.Z" --notes "RELEASE_NOTES"`.
9.  **Changelog**: Regenerate via the project's changelog script:
    ```bash
    npm run changelog:generate
    ```
    (Runs `node scripts/generate-changelog.js`, which pulls releases from the GitHub API and rewrites `CHANGELOG.md`.)
10. **Sync changelog**: Commit and push the updated `CHANGELOG.md`.
11. **Notify**: Run the Discord notification from `~/Scripts/claude-mem/`, where the `.env` with Discord webhook details lives:
    ```bash
    cd ~/Scripts/claude-mem/ && npm run discord:notify vX.Y.Z
    ```
    Do this even when the release worktree does not have a local `.env`.
12. **Finalize**: `git status` — working tree must be clean.

## Checklist

- [ ] All eight config files have matching versions
- [ ] `git grep` for old version returns zero hits
- [ ] `npm run build-and-sync` succeeded
- [ ] Git tag created and pushed
- [ ] **npm publish ran in CI off the tag** — never by hand (`gh run list --workflow npm-publish.yml --limit 1`), and `npm view hummem@X.Y.Z version` confirms it (so `npx hummem@X.Y.Z` resolves)
- [ ] GitHub release created with notes
- [ ] `CHANGELOG.md` updated and pushed
- [ ] Discord notification run from `~/Scripts/claude-mem/`
- [ ] `git status` shows clean tree
