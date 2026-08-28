# hummem

> **hummem** is persistent memory for AI coding assistants — durable context across sessions.
> It stores its data in `~/.hummem` and runs its worker on the 378xx port band.
>
> Migrating from claude-mem? See [MIGRATION.md](MIGRATION.md): your memory is picked up
> automatically, and both can run side by side while you verify.

<p align="center">
  <a href="docs/i18n/README.zh.md">🇨🇳 中文</a> •
  <a href="docs/i18n/README.zh-tw.md">🇹🇼 繁體中文</a> •
  <a href="docs/i18n/README.ja.md">🇯🇵 日本語</a> •
  <a href="docs/i18n/README.pt.md">🇵🇹 Português</a> •
  <a href="docs/i18n/README.pt-br.md">🇧🇷 Português</a> •
  <a href="docs/i18n/README.ko.md">🇰🇷 한국어</a> •
  <a href="docs/i18n/README.es.md">🇪🇸 Español</a> •
  <a href="docs/i18n/README.de.md">🇩🇪 Deutsch</a> •
  <a href="docs/i18n/README.fr.md">🇫🇷 Français</a> •
  <a href="docs/i18n/README.he.md">🇮🇱 עברית</a> •
  <a href="docs/i18n/README.ar.md">🇸🇦 العربية</a> •
  <a href="docs/i18n/README.ru.md">🇷🇺 Русский</a> •
  <a href="docs/i18n/README.pl.md">🇵🇱 Polski</a> •
  <a href="docs/i18n/README.cs.md">🇨🇿 Čeština</a> •
  <a href="docs/i18n/README.nl.md">🇳🇱 Nederlands</a> •
  <a href="docs/i18n/README.tr.md">🇹🇷 Türkçe</a> •
  <a href="docs/i18n/README.uk.md">🇺🇦 Українська</a> •
  <a href="docs/i18n/README.vi.md">🇻🇳 Tiếng Việt</a> •
  <a href="docs/i18n/README.tl.md">🇵🇭 Tagalog</a> •
  <a href="docs/i18n/README.id.md">🇮🇩 Indonesia</a> •
  <a href="docs/i18n/README.th.md">🇹🇭 ไทย</a> •
  <a href="docs/i18n/README.hi.md">🇮🇳 हिन्दी</a> •
  <a href="docs/i18n/README.bn.md">🇧🇩 বাংলা</a> •
  <a href="docs/i18n/README.ur.md">🇵🇰 اردو</a> •
  <a href="docs/i18n/README.ro.md">🇷🇴 Română</a> •
  <a href="docs/i18n/README.sv.md">🇸🇪 Svenska</a> •
  <a href="docs/i18n/README.it.md">🇮🇹 Italiano</a> •
  <a href="docs/i18n/README.el.md">🇬🇷 Ελληνικά</a> •
  <a href="docs/i18n/README.hu.md">🇭🇺 Magyar</a> •
  <a href="docs/i18n/README.fi.md">🇫🇮 Suomi</a> •
  <a href="docs/i18n/README.da.md">🇩🇰 Dansk</a> •
  <a href="docs/i18n/README.no.md">🇳🇴 Norsk</a>
</p>

<h4 align="center">Persistent memory compression system for AI coding assistants.</h4>

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License">
  </a>
  <a href="package.json">
    <img src="https://img.shields.io/badge/version-13.4.0-green.svg" alt="Version">
  </a>
  <a href="package.json">
    <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg" alt="Node">
  </a>
  <a href="https://github.com/thedotmack/awesome-claude-code">
    <img src="https://awesome.re/mentioned-badge.svg" alt="Mentioned in Awesome Claude Code">
  </a>
</p>


<br>

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/kejwojew/hummem">
        <picture>
          <img
            src="https://raw.githubusercontent.com/kejwojew/hummem/main/docs/public/cm-preview.gif"
            alt="hummem preview"
            width="500"
          >
        </picture>
      </a>
    </td>  </tr>
</table>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#mcp-search-tools">Search Tools</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  hummem seamlessly preserves context across sessions by automatically capturing tool usage observations, generating semantic summaries, and making them available to future sessions. This enables your assistant to maintain continuity of knowledge about projects even after sessions end or reconnect.
</p>

---

## Quick Start

Install with a single command:

```bash
npx hummem install
```

Or install for OpenCode:

```bash
npx hummem install --ide opencode
```

Or install for Antigravity CLI ([setup guide](https://github.com/kejwojew/hummem/blob/main/docs/public/antigravity-cli/setup.mdx)):

```bash
npx hummem install --ide antigravity
```

Or install for Kimi Code CLI:

```bash
npx hummem install --ide kimi
```

Or install from the plugin marketplace inside Claude Code:

```bash
/plugin marketplace add kejwojew/hummem

/plugin install hummem
```

Restart Claude Code. Context from previous sessions will automatically appear in new sessions.

> **Note:** hummem is also published on npm, but `npm install -g hummem` installs the **SDK/library only** — it does not register the plugin hooks or set up the worker service. Always install via `npx hummem install` or the `/plugin` commands above.

### 🦞 OpenClaw Gateway

Install hummem as a persistent memory plugin on [OpenClaw](https://openclaw.ai) gateways with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/kejwojew/hummem/main/openclaw/install.sh | bash
```

The installer handles dependencies, plugin setup, AI provider configuration, worker startup, and optional real-time observation feeds to Telegram, Discord, Slack, and more. See the [OpenClaw Integration Guide](https://github.com/kejwojew/hummem/blob/main/docs/public/openclaw-integration.mdx) for details.

**Key Features:**

- 🧠 **Persistent Memory** - Context survives across sessions
- 📊 **Progressive Disclosure** - Layered memory retrieval with token cost visibility
- 🔍 **Skill-Based Search** - Query your project history with mem-search skill
- 🖥️ **Web Viewer UI** - Real-time memory stream at the worker URL printed on startup
- 💻 **Claude Desktop Skill** - Search memory from Claude Desktop conversations
- 🔒 **Privacy Control** - Use `<private>` tags to exclude sensitive content from storage
- ⚙️ **Context Configuration** - Fine-grained control over what context gets injected
- 🤖 **Automatic Operation** - No manual intervention required
- 🔗 **Citations** - Reference past observations with IDs through the worker API or view all in the web viewer

---

## Documentation

📚 **[View Full Documentation](https://github.com/kejwojew/hummem#readme)** - Browse on official website

### Getting Started

- **[Installation Guide](https://github.com/kejwojew/hummem/blob/main/docs/public/installation.mdx)** - Quick start & advanced installation
- **[Usage Guide](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/getting-started.mdx)** - How Claude-Mem works automatically
- **[Search Tools](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx)** - Query your project history with natural language
- **[Cloud Sync](https://github.com/kejwojew/hummem/blob/main/docs/public/cloud-sync.mdx)** - Back up your memories to a sync server — no daemon, the worker syncs on write

### Best Practices

- **[Context Engineering](https://github.com/kejwojew/hummem/blob/main/docs/public/context-engineering.mdx)** - AI agent context optimization principles
- **[Progressive Disclosure](https://github.com/kejwojew/hummem/blob/main/docs/public/progressive-disclosure.mdx)** - Philosophy behind Claude-Mem's context priming strategy

### Architecture

- **[Overview](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx)** - System components & data flow
- **[Architecture Evolution](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture-evolution.mdx)** - The journey from v3 to v5
- **[Hooks Architecture](https://github.com/kejwojew/hummem/blob/main/docs/public/hooks-architecture.mdx)** - How Claude-Mem uses lifecycle hooks
- **[Hooks Reference](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/hooks.mdx)** - 7 hook scripts explained
- **[Worker Service](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/worker-service.mdx)** - HTTP API & Bun management
- **[Database](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/database.mdx)** - SQLite schema & FTS5 search
- **[Search Architecture](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/search-architecture.mdx)** - Hybrid search with Chroma vector database

### Configuration & Development

- **[Configuration](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** - Environment variables & settings
- **[Development](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** - Building, testing, contributing
- **[Release Branches](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)** - Stable, core-dev, and community-edge branch flow
- **[Troubleshooting](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** - Common issues & solutions

---

## How It Works

**Core Components:**

1. **5 Lifecycle Hooks** - SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd (6 hook scripts)
2. **Smart Install** - Cached dependency checker (pre-hook script, not a lifecycle hook)
3. **Worker Service** - Local HTTP API with web viewer UI and search endpoints, managed by Bun
4. **SQLite Database** - Stores sessions, observations, summaries
5. **mem-search Skill** - Natural language queries with progressive disclosure
6. **Chroma Vector Database** - Hybrid semantic + keyword search for intelligent context retrieval

See [Architecture Overview](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx) for details.

---

## MCP Search Tools

Claude-Mem provides intelligent memory search through **4 MCP tools** following a token-efficient **3-layer workflow pattern**:

**The 3-Layer Workflow:**

1. **`search`** - Get compact index with IDs (~50-100 tokens/result)
2. **`timeline`** - Get chronological context around interesting results
3. **`get_observations`** - Fetch full details ONLY for filtered IDs (~500-1,000 tokens/result)

**How It Works:**
- Claude uses MCP tools to search your memory
- Start with `search` to get an index of results
- Use `timeline` to see what was happening around specific observations
- Use `get_observations` to fetch full details for relevant IDs
- **~10x token savings** by filtering before fetching details

**Available MCP Tools:**

1. **`search`** - Search memory index with full-text queries, filters by type/date/project
2. **`timeline`** - Get chronological context around a specific observation or query
3. **`get_observations`** - Fetch full observation details by IDs (always batch multiple IDs)

**Example Usage:**

```typescript
// Step 1: Search for index
search(query="authentication bug", type="bugfix", limit=10)

// Step 2: Review index, identify relevant IDs (e.g., #123, #456)

// Step 3: Fetch full details
get_observations(ids=[123, 456])
```

See [Search Tools Guide](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx) for detailed examples.

---

## Release Branches

Stable releases ship from `main` and are published to npm. `core-dev` and
`community-edge` are source-run branches for early reliability fixes and
community integrations. See **[Release Branches](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)**
for the branch flow and non-stable run instructions.

---

## System Requirements

- **Node.js**: 20.0.0 or higher
- **Claude Code**: Latest version with plugin support
- **Bun**: JavaScript runtime and process manager (auto-installed if missing)
- **uv**: Python package manager for vector search (auto-installed if missing)
- **SQLite 3**: For persistent storage (bundled)

---
### Windows Setup Notes

If you see an error like:

```powershell
npm : The term 'npm' is not recognized as the name of a cmdlet
```

Make sure Node.js and npm are installed and added to your PATH. Download the latest Node.js installer from https://nodejs.org and restart your terminal after installation.

---

## Configuration

Settings are managed in `~/.hummem/settings.json` (auto-created with defaults on first run). Configure AI model, worker port, data directory, log level, and context injection settings.

See the **[Configuration Guide](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** for all available settings and examples.

### Mode & Language Configuration

Claude-Mem supports multiple workflow modes and languages via the `CLAUDE_MEM_MODE` setting.

This option controls both:
- The workflow behavior (e.g. code, chill, investigation)
- The language used in generated observations

#### How to Configure

Edit your settings file at `~/.hummem/settings.json`:

```json
{
  "CLAUDE_MEM_MODE": "code--zh"
}
```

Modes are defined in `plugin/modes/`. To see all available modes locally:

```bash
ls ~/.claude/plugins/marketplaces/thedotmack/plugin/modes/
```

#### Available Modes

| Mode | Description |
|------------|-------------------------|
| `code` | Default English mode |
| `code--zh` | Simplified Chinese mode |
| `code--ja` | Japanese mode |

Language-specific modes follow the pattern `code--[lang]` where `[lang]` is the ISO 639-1 language code (e.g., `zh` for Chinese, `ja` for Japanese, `es` for Spanish).

> Note: `code--zh` (Simplified Chinese) is already built-in — no additional installation or plugin update is required.

#### After Changing Mode

Restart Claude Code to apply the new mode configuration.
---

## Development

See the **[Development Guide](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** for build instructions, testing, and contribution workflow.

---

## Troubleshooting

If experiencing issues, describe the problem to Claude and the troubleshoot skill will automatically diagnose and provide fixes.

See the **[Troubleshooting Guide](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** for common issues and solutions.

---

## Bug Reports

Create comprehensive bug reports with the automated generator:

```bash
cd ~/.claude/plugins/marketplaces/thedotmack
npm run bug-report
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Update documentation
5. Submit a Pull Request

Claude-Mem ships from three branches: `main` (stable), `core-dev`, and
`community-edge`. Only `main` is published to npm; the others are run from
source. See [Release Branches](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx) for the
strategy and local run instructions.

See [Development Guide](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx) for contribution workflow.

---

## License

Claude-Mem is licensed under the Apache License 2.0.

We chose Apache-2.0 because durable agentic memory should be easy to embed in
developer tools, local agents, MCP servers, enterprise systems, robotics stacks,
and production agent harnesses.

See the [LICENSE](LICENSE) file for full details. See [docs/license.md](docs/license.md)
and [docs/ip-boundary.md](docs/ip-boundary.md) for licensing scope and the
open/commercial boundary.

**Note on Ragtime**: The `ragtime/` directory is licensed under the **Apache License 2.0**. See [ragtime/LICENSE](ragtime/LICENSE) for details.

---

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kejwojew/hummem/issues)
- **Repository**: [github.com/kejwojew/hummem](https://github.com/kejwojew/hummem)
- **Migrating from claude-mem**: [MIGRATION.md](MIGRATION.md)
- **Project lineage**: [PROVENANCE.md](PROVENANCE.md)

---

**Built with Claude Agent SDK** | **Works with Claude Code** | **Made with TypeScript**
