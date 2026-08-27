import {
  existsSync,
  readFileSync,
} from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
export { ensureDirectoryExists, writeJsonFileAtomic } from '../../shared/atomic-json.js';

export const IS_WINDOWS = process.platform === 'win32';

export function claudeConfigDirectory(): string {
  return process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
}

/**
 * Marketplace identifier, which is also the on-disk directory name.
 *
 * Claude Code names the directory after `marketplace.json`'s `name` field, so
 * this constant and that manifest must agree. They previously did not: the
 * manifest was renamed to `hummem` while these paths still said `thedotmack`,
 * which would have left a fresh install unable to find its own plugin.
 */
export const MARKETPLACE_ID = 'hummem';

/** Directory name used before the project became independent. */
export const LEGACY_MARKETPLACE_ID = 'thedotmack';

/**
 * Resolve the marketplace directory, preferring the canonical name but falling
 * back to the legacy one when only that exists.
 *
 * An install performed before the rename has its plugin under the old
 * directory, and the paths baked into IDE hook commands point there. Reporting
 * the canonical name unconditionally would strand those installs.
 */
export function marketplaceDirectory(): string {
  const root = join(claudeConfigDirectory(), 'plugins', 'marketplaces');
  const canonical = join(root, MARKETPLACE_ID);
  if (existsSync(canonical)) return canonical;
  const legacy = join(root, LEGACY_MARKETPLACE_ID);
  if (existsSync(legacy)) return legacy;
  return canonical;
}

export function pluginsDirectory(): string {
  return join(claudeConfigDirectory(), 'plugins');
}

export function knownMarketplacesPath(): string {
  return join(pluginsDirectory(), 'known_marketplaces.json');
}

export function installedPluginsPath(): string {
  return join(pluginsDirectory(), 'installed_plugins.json');
}

export function claudeSettingsPath(): string {
  return join(claudeConfigDirectory(), 'settings.json');
}

export function pluginCacheDirectory(version: string): string {
  const cache = join(pluginsDirectory(), 'cache');
  const canonical = join(cache, MARKETPLACE_ID, 'hummem', version);
  if (existsSync(canonical)) return canonical;
  const legacy = join(cache, LEGACY_MARKETPLACE_ID, 'hummem', version);
  if (existsSync(legacy)) return legacy;
  return canonical;
}

export function npmPackageRootDirectory(): string {
  const currentFilePath = fileURLToPath(import.meta.url);
  const root = join(dirname(currentFilePath), '..', '..');
  if (!existsSync(join(root, 'package.json'))) {
    throw new Error(
      `npmPackageRootDirectory: expected package.json at ${root}. ` +
      `Bundle structure may have changed — update the path walk.`,
    );
  }
  return root;
}

export function npmPackagePluginDirectory(): string {
  return join(npmPackageRootDirectory(), 'plugin');
}

export function readPluginVersion(): string {
  const pluginJsonPath = join(npmPackagePluginDirectory(), '.claude-plugin', 'plugin.json');
  if (existsSync(pluginJsonPath)) {
    try {
      const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));
      if (pluginJson.version) return pluginJson.version;
    } catch {
      // Fall through to package.json
    }
  }

  const packageJsonPath = join(npmPackageRootDirectory(), 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.version) return packageJson.version;
    } catch {
      // Unable to read
    }
  }

  return '0.0.0';
}

export function isPluginInstalled(): boolean {
  const marketplaceDir = marketplaceDirectory();
  return existsSync(join(marketplaceDir, 'plugin', '.claude-plugin', 'plugin.json'));
}

export { readJsonSafe } from '../../utils/json-utils.js';
