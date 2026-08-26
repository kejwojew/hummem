🌐 Dies ist eine automatisierte Übersetzung. Korrekturen aus der Community sind willkommen!

<h1 align="center">
  <br>
  <a href="https://github.com/kejwojew/hummem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/kejwojew/hummem/main/docs/public/hummem-logo-for-dark-mode.webp">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/kejwojew/hummem/main/docs/public/hummem-logo-for-light-mode.webp">
      <img src="https://raw.githubusercontent.com/kejwojew/hummem/main/docs/public/hummem-logo-for-light-mode.webp" alt="hummem" width="400">
    </picture>
  </a>
  <br>
  <a href="https://vercel.com/open-source-program">
    <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge-2026.svg" />
  </a>
</h1>

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

<h4 align="center">Persistentes Speicherkomprimierungssystem, entwickelt für <a href="https://claude.com/claude-code" target="_blank">Claude Code</a>.</h4>

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
  <a href="#schnellstart">Schnellstart</a> •
  <a href="#wie-es-funktioniert">Wie es funktioniert</a> •
  <a href="#mcp-suchwerkzeuge">Suchwerkzeuge</a> •
  <a href="#dokumentation">Dokumentation</a> •
  <a href="#konfiguration">Konfiguration</a> •
  <a href="#fehlerbehebung">Fehlerbehebung</a> •
  <a href="#lizenz">Lizenz</a>
</p>

<p align="center">
  Claude-Mem bewahrt nahtlos Kontext über Sitzungen hinweg, indem es automatisch Beobachtungen zur Tool-Nutzung erfasst, semantische Zusammenfassungen generiert und diese für zukünftige Sitzungen verfügbar macht. Dies ermöglicht es Claude, die Kontinuität des Wissens über Projekte aufrechtzuerhalten, auch nachdem Sitzungen beendet wurden oder die Verbindung wiederhergestellt wird.
</p>

---

## Schnellstart

Installation mit einem einzigen Befehl:

```bash
npx hummem install
```

Oder Installation für OpenCode:

```bash
npx hummem install --ide opencode
```

Oder Installation für Antigravity CLI ([Einrichtungsanleitung](https://github.com/kejwojew/hummem/blob/main/docs/public/antigravity-cli/setup.mdx)):

```bash
npx hummem install --ide antigravity
```

Oder Installation über den Plugin-Marketplace innerhalb von Claude Code:

```bash
/plugin marketplace add kejwojew/hummem

/plugin install claude-mem
```

Starten Sie Claude Code neu. Kontext aus vorherigen Sitzungen wird automatisch in neuen Sitzungen angezeigt.

> **Hinweis:** Claude-Mem ist auch auf npm veröffentlicht, aber `npm install -g claude-mem` installiert **nur das SDK/die Bibliothek** — es registriert weder die Plugin-Hooks noch richtet es den Worker-Dienst ein. Installieren Sie immer über `npx hummem install` oder die oben genannten `/plugin`-Befehle.

### 🦞 OpenClaw Gateway

Installieren Sie claude-mem als persistentes Speicher-Plugin auf [OpenClaw](https://openclaw.ai)-Gateways mit einem einzigen Befehl:

```bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash
```

Der Installer übernimmt Abhängigkeiten, Plugin-Einrichtung, KI-Anbieter-Konfiguration, Worker-Start und optionale Echtzeit-Beobachtungs-Feeds zu Telegram, Discord, Slack und mehr. Details finden Sie im [OpenClaw-Integrationsleitfaden](https://github.com/kejwojew/hummem/blob/main/docs/public/openclaw-integration.mdx).

**Hauptmerkmale:**

- 🧠 **Persistenter Speicher** - Kontext bleibt über Sitzungen hinweg erhalten
- 📊 **Progressive Offenlegung** - Schichtweiser Speicherabruf mit Sichtbarkeit der Token-Kosten
- 🔍 **Skill-basierte Suche** - Durchsuchen Sie Ihre Projekthistorie mit dem mem-search Skill
- 🖥️ **Web-Viewer-UI** - Echtzeit-Speicherstream unter der beim Start ausgegebenen Worker-URL
- 💻 **Claude Desktop Skill** - Durchsuchen Sie den Speicher aus Claude Desktop-Konversationen
- 🔒 **Datenschutzkontrolle** - Verwenden Sie `<private>`-Tags, um sensible Inhalte von der Speicherung auszuschließen
- ⚙️ **Kontextkonfiguration** - Feinkörnige Kontrolle darüber, welcher Kontext eingefügt wird
- 🤖 **Automatischer Betrieb** - Keine manuelle Intervention erforderlich
- 🔗 **Zitate** - Referenzieren Sie vergangene Beobachtungen mit IDs über die Worker-API oder sehen Sie alle im Web-Viewer

---

## Dokumentation

📚 **[Vollständige Dokumentation anzeigen](https://github.com/kejwojew/hummem#readme)** - Auf der offiziellen Website durchsuchen

### Erste Schritte

- **[Installationsanleitung](https://github.com/kejwojew/hummem/blob/main/docs/public/installation.mdx)** - Schnellstart & erweiterte Installation
- **[Nutzungsanleitung](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/getting-started.mdx)** - Wie Claude-Mem automatisch funktioniert
- **[Suchwerkzeuge](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx)** - Durchsuchen Sie Ihre Projekthistorie mit natürlicher Sprache

### Best Practices

- **[Context Engineering](https://github.com/kejwojew/hummem/blob/main/docs/public/context-engineering.mdx)** - Prinzipien der Kontextoptimierung für KI-Agenten
- **[Progressive Disclosure](https://github.com/kejwojew/hummem/blob/main/docs/public/progressive-disclosure.mdx)** - Philosophie hinter Claude-Mems Kontext-Priming-Strategie

### Architektur

- **[Übersicht](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx)** - Systemkomponenten & Datenfluss
- **[Architekturentwicklung](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture-evolution.mdx)** - Die Reise von v3 zu v5
- **[Hooks-Architektur](https://github.com/kejwojew/hummem/blob/main/docs/public/hooks-architecture.mdx)** - Wie Claude-Mem Lifecycle-Hooks verwendet
- **[Hooks-Referenz](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/hooks.mdx)** - 7 Hook-Skripte erklärt
- **[Worker Service](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/worker-service.mdx)** - HTTP API & Bun-Verwaltung
- **[Datenbank](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/database.mdx)** - SQLite-Schema & FTS5-Suche
- **[Such-Architektur](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/search-architecture.mdx)** - Hybride Suche mit Chroma-Vektordatenbank

### Konfiguration & Entwicklung

- **[Konfiguration](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** - Umgebungsvariablen & Einstellungen
- **[Entwicklung](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** - Erstellen, Testen, Beitragen
- **[Release-Branches](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)** - Ablauf der Branches Stable, core-dev und community-edge
- **[Fehlerbehebung](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** - Häufige Probleme & Lösungen

---

## Wie es funktioniert

**Kernkomponenten:**

1. **5 Lifecycle-Hooks** - SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd (6 Hook-Skripte)
2. **Smart Install** - Gecachter Abhängigkeitsprüfer (Pre-Hook-Skript, kein Lifecycle-Hook)
3. **Worker Service** - Lokale HTTP-API mit Web-Viewer-UI und Such-Endpunkten, verwaltet von Bun
4. **SQLite-Datenbank** - Speichert Sitzungen, Beobachtungen, Zusammenfassungen
5. **mem-search Skill** - Natürlichsprachliche Abfragen mit progressiver Offenlegung
6. **Chroma-Vektordatenbank** - Hybride semantische + Stichwortsuche für intelligenten Kontextabruf

Siehe [Architekturübersicht](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx) für Details.

---

## MCP-Suchwerkzeuge

Claude-Mem bietet intelligente Speichersuche durch **4 MCP-Tools** nach einem token-effizienten **3-Schichten-Workflow-Muster**:

**Der 3-Schichten-Workflow:**

1. **`search`** - Kompakten Index mit IDs abrufen (~50-100 Token/Ergebnis)
2. **`timeline`** - Chronologischen Kontext um interessante Ergebnisse herum abrufen
3. **`get_observations`** - Vollständige Details NUR für gefilterte IDs abrufen (~500-1.000 Token/Ergebnis)

**Funktionsweise:**
- Claude nutzt MCP-Tools, um Ihren Speicher zu durchsuchen
- Beginnen Sie mit `search`, um einen Index der Ergebnisse zu erhalten
- Verwenden Sie `timeline`, um zu sehen, was um bestimmte Beobachtungen herum geschah
- Verwenden Sie `get_observations`, um vollständige Details für relevante IDs abzurufen
- **~10-fache Token-Ersparnis** durch Filtern vor dem Abrufen der Details

**Verfügbare MCP-Tools:**

1. **`search`** - Speicherindex mit Volltextabfragen durchsuchen, gefiltert nach Typ/Datum/Projekt
2. **`timeline`** - Chronologischen Kontext um eine bestimmte Beobachtung oder Abfrage herum abrufen
3. **`get_observations`** - Vollständige Beobachtungsdetails anhand von IDs abrufen (immer mehrere IDs gebündelt abrufen)

**Beispielverwendung:**

```typescript
// Schritt 1: Nach Index suchen
search(query="authentication bug", type="bugfix", limit=10)

// Schritt 2: Index überprüfen, relevante IDs identifizieren (z. B. #123, #456)

// Schritt 3: Vollständige Details abrufen
get_observations(ids=[123, 456])
```

Siehe [Suchwerkzeuge-Anleitung](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx) für detaillierte Beispiele.

---

## Release-Branches

Stabile Releases werden von `main` ausgeliefert und auf npm veröffentlicht. `core-dev` und
`community-edge` sind aus dem Quellcode betriebene Branches für frühe Zuverlässigkeitskorrekturen und
Community-Integrationen. Siehe **[Release-Branches](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)**
für den Branch-Ablauf und Anweisungen zum Ausführen der nicht-stabilen Versionen.

---

## Systemanforderungen

- **Node.js**: 20.0.0 oder höher
- **Claude Code**: Neueste Version mit Plugin-Unterstützung
- **Bun**: JavaScript-Laufzeitumgebung und Prozessmanager (wird automatisch installiert, falls fehlend)
- **uv**: Python-Paketmanager für Vektorsuche (wird automatisch installiert, falls fehlend)
- **SQLite 3**: Für persistente Speicherung (enthalten)

---
### Hinweise zur Einrichtung unter Windows

Wenn folgender Fehler angezeigt wird:

```powershell
npm : The term 'npm' is not recognized as the name of a cmdlet
```

Stellen Sie sicher, dass Node.js und npm installiert und zu Ihrem PATH hinzugefügt wurden. Laden Sie den neuesten Node.js-Installer von https://nodejs.org herunter und starten Sie Ihr Terminal nach der Installation neu.

---

## Konfiguration

Einstellungen werden in `~/.claude-mem/settings.json` verwaltet (wird beim ersten Start automatisch mit Standardwerten erstellt). Konfigurieren Sie KI-Modell, Worker-Port, Datenverzeichnis, Log-Level und Kontext-Injektionseinstellungen.

Siehe die **[Konfigurationsanleitung](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** für alle verfügbaren Einstellungen und Beispiele.

### Modus- & Sprachkonfiguration

Claude-Mem unterstützt mehrere Workflow-Modi und Sprachen über die Einstellung `CLAUDE_MEM_MODE`.

Diese Option steuert sowohl:
- Das Workflow-Verhalten (z. B. code, chill, investigation)
- Die Sprache, die in generierten Beobachtungen verwendet wird

#### Konfiguration

Bearbeiten Sie Ihre Einstellungsdatei unter `~/.claude-mem/settings.json`:

```json
{
  "CLAUDE_MEM_MODE": "code--zh"
}
```

Modi sind in `plugin/modes/` definiert. Um alle lokal verfügbaren Modi anzuzeigen:

```bash
ls ~/.claude/plugins/marketplaces/thedotmack/plugin/modes/
```

#### Verfügbare Modi

| Modus | Beschreibung |
|------------|-------------------------|
| `code` | Standardmodus (Englisch) |
| `code--zh` | Modus für vereinfachtes Chinesisch |
| `code--ja` | Modus für Japanisch |

Sprachspezifische Modi folgen dem Muster `code--[lang]`, wobei `[lang]` der ISO-639-1-Sprachcode ist (z. B. `zh` für Chinesisch, `ja` für Japanisch, `es` für Spanisch).

> Hinweis: `code--zh` (vereinfachtes Chinesisch) ist bereits integriert — es ist keine zusätzliche Installation oder Plugin-Aktualisierung erforderlich.

#### Nach der Änderung des Modus

Starten Sie Claude Code neu, um die neue Moduskonfiguration anzuwenden.
---

## Entwicklung

Siehe die **[Entwicklungsanleitung](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** für Build-Anweisungen, Tests und Beitrags-Workflow.

---

## Fehlerbehebung

Wenn Sie Probleme haben, beschreiben Sie das Problem Claude, und der troubleshoot Skill wird automatisch diagnostizieren und Lösungen bereitstellen.

Siehe die **[Fehlerbehebungsanleitung](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** für häufige Probleme und Lösungen.

---

## Fehlerberichte

Erstellen Sie umfassende Fehlerberichte mit dem automatisierten Generator:

```bash
cd ~/.claude/plugins/marketplaces/thedotmack
npm run bug-report
```

## Mitwirken

Beiträge sind willkommen! Bitte:

1. Forken Sie das Repository
2. Erstellen Sie einen Feature-Branch
3. Nehmen Sie Ihre Änderungen mit Tests vor
4. Aktualisieren Sie die Dokumentation
5. Reichen Sie einen Pull Request ein

Claude-Mem wird aus drei Branches ausgeliefert: `main` (stabil), `core-dev` und
`community-edge`. Nur `main` wird auf npm veröffentlicht; die anderen werden aus dem
Quellcode ausgeführt. Siehe [Release-Branches](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx) für die
Strategie und Anweisungen zur lokalen Ausführung.

Siehe [Entwicklungsanleitung](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx) für den Beitrags-Workflow.

---

## Lizenz

Claude-Mem ist unter der Apache License 2.0 lizenziert.

Wir haben uns für Apache-2.0 entschieden, weil dauerhafter agentenbasierter Speicher leicht
in Entwicklertools, lokale Agenten, MCP-Server, Unternehmenssysteme, Robotik-Stacks
und produktive Agenten-Harnesses eingebettet werden können sollte.

Siehe die Datei [LICENSE](LICENSE) für vollständige Details. Siehe [docs/license.md](docs/license.md)
und [docs/ip-boundary.md](docs/ip-boundary.md) für den Lizenzumfang und die
Grenze zwischen offen und kommerziell.

**Hinweis zu Ragtime**: Das Verzeichnis `ragtime/` ist unter der **Apache License 2.0** lizenziert. Siehe [ragtime/LICENSE](ragtime/LICENSE) für Details.

---

## Support

- **Dokumentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kejwojew/hummem/issues)
- **Repository**: [github.com/kejwojew/hummem](https://github.com/kejwojew/hummem)

---

**Erstellt mit Claude Agent SDK** | **Funktioniert mit Claude Code** | **Gemacht mit TypeScript**

---

### Was ist mit CMEM?

CMEM ist ein Token, der von einem Drittanbieter erstellt, aber offiziell vom Schöpfer von Claude-Mem (Alex Newman, @thedotmack) unterstützt wird. Der Token dient als Community-Katalysator für Wachstum und als Vehikel, um CMEM zu den Entwicklern und Wissensarbeitern zu bringen, die ihn am dringendsten benötigen.

Offizielle BASE CA: 0x76b1967eec0ccaeb001bbbb2b40dc4badba31ba3