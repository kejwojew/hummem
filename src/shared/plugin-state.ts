import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { logger } from '../utils/logger.js';
import { parseJsonWithBom } from './atomic-json.js';

// hummem's own enabledPlugins keys: `hummem@hummem` from the marketplace
// install, `hummem@thedotmack` from the npx installer. The legacy
// `claude-mem@thedotmack` key is deliberately absent: hummem runs alongside a
// legacy claude-mem install, so disabling claude-mem must not silence hummem.
export const PLUGIN_SETTINGS_KEYS = ['hummem@hummem', 'hummem@thedotmack'] as const;

export function isPluginDisabledInClaudeSettings(): boolean {
  try {
    const claudeConfigDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
    const settingsPath = join(claudeConfigDir, 'settings.json');
    if (!existsSync(settingsPath)) return false;
    const raw = readFileSync(settingsPath, 'utf-8');
    const settings = parseJsonWithBom<Record<string, any>>(raw);
    const states = PLUGIN_SETTINGS_KEYS.map(key => settings?.enabledPlugins?.[key]);
    // A stale `false` left by one install must not override another enabled one.
    return states.includes(false) && !states.includes(true);
  } catch (error: unknown) {
    logger.error('CONFIG', 'Failed to read Claude settings', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}
