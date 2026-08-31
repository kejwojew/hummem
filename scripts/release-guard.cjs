#!/usr/bin/env node
/**
 * Refuse to publish from a developer machine.
 *
 * `npm run release:*` used to call `np`, which bumps the version AND publishes.
 * Since 2026-08-31 publishing belongs to CI: .github/workflows/npm-publish.yml
 * fires on a `v*` tag and runs build → clean-room smoke → npm publish with the
 * NPM_TOKEN repository secret.
 *
 * Leaving the old scripts in place would keep a second, silent path to the
 * registry: whoever ran one would race the workflow for the same version
 * number, and the loser fails on an already-published version. Worse, a local
 * publish skips the clean-room smoke test the workflow runs, so it can ship a
 * package whose dependency closure was never verified.
 *
 * This guard is deliberately a hard failure rather than a warning — the
 * mistake it prevents is irreversible (a published version cannot be reissued
 * under the same number).
 */

const RELEASE_STEPS = `
Release is driven by the version tag, not by npm:

  1. Bump the version in all eight manifests (see the version-bump skill)
  2. npm run build-and-sync
  3. git commit -am "chore: bump version to X.Y.Z"
  4. git tag -a vX.Y.Z -m "Version X.Y.Z"
  5. git push origin main && git push origin vX.Y.Z   <- this publishes

Then confirm it landed:

  gh run list --workflow npm-publish.yml --limit 1
  npm view hummem@X.Y.Z version
`;

console.error('\x1b[31m%s\x1b[0m', 'refusing to publish from a local machine');
console.error(RELEASE_STEPS);
process.exit(1);
