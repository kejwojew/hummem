🌐 Dette er en automatisk oversættelse. Fællesskabsrettelser er velkomne!

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

<h4 align="center">Vedvarende hukommelseskomprimeringssystem bygget til <a href="https://claude.com/claude-code" target="_blank">Claude Code</a>.</h4>

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
  <a href="#hurtig-start">Hurtig Start</a> •
  <a href="#sådan-virker-det">Sådan Virker Det</a> •
  <a href="#mcp-søgeværktøjer">Søgeværktøjer</a> •
  <a href="#dokumentation">Dokumentation</a> •
  <a href="#konfiguration">Konfiguration</a> •
  <a href="#fejlfinding">Fejlfinding</a> •
  <a href="#licens">Licens</a>
</p>

<p align="center">
  Claude-Mem bevarer problemfrit kontekst på tværs af sessioner ved automatisk at fange observationer af værktøjsbrug, generere semantiske resuméer og gøre dem tilgængelige for fremtidige sessioner. Dette gør det muligt for Claude at opretholde kontinuitet i viden om projekter, selv efter sessioner afsluttes eller genopretter forbindelse.
</p>

---

## Hurtig Start

Installer med en enkelt kommando:

```bash
npx hummem install
```

Eller installer til OpenCode:

```bash
npx hummem install --ide opencode
```

Eller installer til Antigravity CLI ([opsætningsguide](https://github.com/kejwojew/hummem/blob/main/docs/public/antigravity-cli/setup.mdx)):

```bash
npx hummem install --ide antigravity
```

Eller installer fra plugin-markedspladsen inde i Claude Code:

```bash
/plugin marketplace add kejwojew/hummem

/plugin install claude-mem
```

Genstart Claude Code. Kontekst fra tidligere sessioner vil automatisk vises i nye sessioner.

> **Bemærk:** Claude-Mem er også udgivet på npm, men `npm install -g claude-mem` installerer kun **SDK'et/biblioteket** — det registrerer ikke plugin-hooks eller opsætter worker-servicen. Installer altid via `npx hummem install` eller `/plugin`-kommandoerne ovenfor.

### 🦞 OpenClaw Gateway

Installer claude-mem som et vedvarende hukommelsesplugin på [OpenClaw](https://openclaw.ai)-gateways med en enkelt kommando:

```bash
curl -fsSL https://raw.githubusercontent.com/kejwojew/hummem/main/openclaw/install.sh | bash
```

Installationsprogrammet håndterer afhængigheder, plugin-opsætning, konfiguration af AI-udbyder, worker-opstart og valgfrie realtidsobservationsfeeds til Telegram, Discord, Slack og mere. Se [OpenClaw-integrationsguiden](https://github.com/kejwojew/hummem/blob/main/docs/public/openclaw-integration.mdx) for detaljer.

**Nøglefunktioner:**

- 🧠 **Vedvarende Hukommelse** - Kontekst overlever på tværs af sessioner
- 📊 **Progressiv Afsløring** - Lagdelt hukommelseshentning med synlighed af token-omkostninger
- 🔍 **Færdighedsbaseret Søgning** - Forespørg din projekthistorik med mem-search-færdighed
- 🖥️ **Web Viewer UI** - Realtids hukommelsesstream på den worker-URL, der udskrives ved opstart
- 💻 **Claude Desktop-færdighed** - Søg i hukommelsen fra Claude Desktop-samtaler
- 🔒 **Privatkontrol** - Brug `<private>`-tags til at ekskludere følsomt indhold fra lagring
- ⚙️ **Kontekstkonfiguration** - Finjusteret kontrol over hvilken kontekst der indsprøjtes
- 🤖 **Automatisk Drift** - Ingen manuel indgriben påkrævet
- 🔗 **Citationer** - Henvis til tidligere observationer med ID'er via worker-API'et eller se dem alle i web viewer

---

## Dokumentation

📚 **[Se Fuld Dokumentation](https://github.com/kejwojew/hummem#readme)** - Gennemse på den officielle hjemmeside

### Kom Godt I Gang

- **[Installationsguide](https://github.com/kejwojew/hummem/blob/main/docs/public/installation.mdx)** - Hurtig start & avanceret installation
- **[Brugervejledning](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/getting-started.mdx)** - Sådan fungerer Claude-Mem automatisk
- **[Søgeværktøjer](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx)** - Forespørg din projekthistorik med naturligt sprog

### Bedste Praksis

- **[Kontekst-engineering](https://github.com/kejwojew/hummem/blob/main/docs/public/context-engineering.mdx)** - AI-agent kontekstoptimeringsprincipper
- **[Progressiv Afsløring](https://github.com/kejwojew/hummem/blob/main/docs/public/progressive-disclosure.mdx)** - Filosofien bag Claude-Mems kontekst-priming-strategi

### Arkitektur

- **[Oversigt](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx)** - Systemkomponenter & dataflow
- **[Arkitekturudvikling](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture-evolution.mdx)** - Rejsen fra v3 til v5
- **[Hooks-arkitektur](https://github.com/kejwojew/hummem/blob/main/docs/public/hooks-architecture.mdx)** - Hvordan Claude-Mem bruger livscyklus-hooks
- **[Hooks-reference](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/hooks.mdx)** - 7 hook-scripts forklaret
- **[Worker Service](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/worker-service.mdx)** - HTTP API & Bun-administration
- **[Database](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/database.mdx)** - SQLite-skema & FTS5-søgning
- **[Søgearkitektur](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/search-architecture.mdx)** - Hybrid søgning med Chroma vektordatabase

### Konfiguration & Udvikling

- **[Konfiguration](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** - Miljøvariabler & indstillinger
- **[Udvikling](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** - Bygning, testning, bidrag
- **[Release-grene](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)** - Flowet for stable, core-dev og community-edge-grene
- **[Fejlfinding](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** - Almindelige problemer & løsninger

---

## Sådan Virker Det

**Kernekomponenter:**

1. **5 Livscyklus-hooks** - SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd (6 hook-scripts)
2. **Smart Installation** - Cached dependency checker (pre-hook-script, ikke en livscyklus-hook)
3. **Worker Service** - Lokalt HTTP API med web viewer UI og søge-endpoints, administreret af Bun
4. **SQLite Database** - Gemmer sessioner, observationer, resuméer
5. **mem-search-færdighed** - Naturlige sprogforespørgsler med progressiv afsløring
6. **Chroma Vector Database** - Hybrid semantisk + søgeordssøgning for intelligent konteksthentning

Se [Arkitekturoversigt](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx) for detaljer.

---

## MCP Søgeværktøjer

Claude-Mem leverer intelligent hukommelsessøgning gennem **4 MCP-værktøjer**, der følger et token-effektivt **3-lags workflowmønster**:

**De 3 Workflowlag:**

1. **`search`** - Få et kompakt indeks med ID'er (~50-100 tokens/resultat)
2. **`timeline`** - Få kronologisk kontekst omkring interessante resultater
3. **`get_observations`** - Hent fulde detaljer KUN for filtrerede ID'er (~500-1.000 tokens/resultat)

**Sådan Virker Det:**
- Claude bruger MCP-værktøjer til at søge i din hukommelse
- Start med `search` for at få et indeks over resultater
- Brug `timeline` til at se, hvad der skete omkring specifikke observationer
- Brug `get_observations` til at hente fulde detaljer for relevante ID'er
- **~10x besparelse i tokens** ved at filtrere før detaljer hentes

**Tilgængelige MCP-værktøjer:**

1. **`search`** - Søg i hukommelsesindekset med fuldtekstforespørgsler, filtrer efter type/dato/projekt
2. **`timeline`** - Få kronologisk kontekst omkring en specifik observation eller forespørgsel
3. **`get_observations`** - Hent fulde observationsdetaljer efter ID'er (batch altid flere ID'er sammen)

**Eksempel på Brug:**

```typescript
// Trin 1: Søg efter indeks
search(query="authentication bug", type="bugfix", limit=10)

// Trin 2: Gennemgå indekset, identificer relevante ID'er (f.eks. #123, #456)

// Trin 3: Hent fulde detaljer
get_observations(ids=[123, 456])
```

Se [Søgeværktøjsguide](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx) for detaljerede eksempler.

---

## Release-grene

Stable releases udsendes fra `main` og publiceres til npm. `core-dev` og
`community-edge` er kildekørte grene til tidlige pålidelighedsrettelser og
community-integrationer. Se **[Release-grene](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)**
for grenflowet og instruktioner til kørsel af ikke-stabile versioner.

---

## Systemkrav

- **Node.js**: 20.0.0 eller højere
- **Claude Code**: Seneste version med plugin-support
- **Bun**: JavaScript runtime og procesmanager (auto-installeres, hvis manglende)
- **uv**: Python package manager til vektorsøgning (auto-installeres, hvis manglende)
- **SQLite 3**: Til vedvarende lagring (bundtet)

---
### Windows-opsætningsnoter

Hvis du ser en fejl som:

```powershell
npm : The term 'npm' is not recognized as the name of a cmdlet
```

Sørg for, at Node.js og npm er installeret og tilføjet til din PATH. Download den nyeste Node.js-installer fra https://nodejs.org og genstart din terminal efter installationen.

---

## Konfiguration

Indstillinger administreres i `~/.claude-mem/settings.json` (auto-oprettet med standardindstillinger ved første kørsel). Konfigurer AI-model, worker-port, datakatalog, log-niveau og indstillinger for kontekstindsprøjtning.

Se **[Konfigurationsguide](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** for alle tilgængelige indstillinger og eksempler.

### Tilstands- & Sprogkonfiguration

Claude-Mem understøtter flere workflow-tilstande og sprog via indstillingen `CLAUDE_MEM_MODE`.

Denne indstilling styrer både:
- Workflow-adfærden (f.eks. code, chill, investigation)
- Sproget, der bruges i genererede observationer

#### Sådan Konfigurerer Du

Rediger din indstillingsfil på `~/.claude-mem/settings.json`:

```json
{
  "CLAUDE_MEM_MODE": "code--zh"
}
```

Tilstande er defineret i `plugin/modes/`. For at se alle tilgængelige tilstande lokalt:

```bash
ls ~/.claude/plugins/marketplaces/thedotmack/plugin/modes/
```

#### Tilgængelige Tilstande

| Tilstand | Beskrivelse |
|------------|-------------------------|
| `code` | Standard engelsk tilstand |
| `code--zh` | Forenklet kinesisk tilstand |
| `code--ja` | Japansk tilstand |

Sprogspecifikke tilstande følger mønsteret `code--[lang]`, hvor `[lang]` er ISO 639-1-sprogkoden (f.eks. `zh` for kinesisk, `ja` for japansk, `es` for spansk).

> Bemærk: `code--zh` (forenklet kinesisk) er allerede indbygget — der kræves ingen yderligere installation eller plugin-opdatering.

#### Efter Ændring af Tilstand

Genstart Claude Code for at anvende den nye tilstandskonfiguration.
---

## Udvikling

Se **[Udviklingsguide](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** for bygningsinstruktioner, testning og bidragsworkflow.

---

## Fejlfinding

Hvis du oplever problemer, beskriv problemet til Claude, og troubleshoot-færdigheden vil automatisk diagnosticere og levere rettelser.

Se **[Fejlfindingsguide](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** for almindelige problemer og løsninger.

---

## Fejlrapporter

Opret omfattende fejlrapporter med den automatiserede generator:

```bash
cd ~/.claude/plugins/marketplaces/thedotmack
npm run bug-report
```

## Bidrag

Bidrag er velkomne! Venligst:

1. Fork repositoriet
2. Opret en feature-branch
3. Lav dine ændringer med tests
4. Opdater dokumentation
5. Indsend en Pull Request

Claude-Mem udsendes fra tre grene: `main` (stable), `core-dev` og
`community-edge`. Kun `main` publiceres til npm; de andre køres fra
kildekode. Se [Release-grene](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx) for
strategien og instruktioner til lokal kørsel.

Se [Udviklingsguide](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx) for bidragsworkflow.

---

## Licens

Claude-Mem er licenseret under Apache License 2.0.

Vi valgte Apache-2.0, fordi holdbar agentisk hukommelse bør være nem at indlejre i
udviklerværktøjer, lokale agenter, MCP-servere, virksomhedssystemer, robotik-stacks
og produktionsagent-harnesser.

Se filen [LICENSE](LICENSE) for fulde detaljer. Se [docs/license.md](docs/license.md)
og [docs/ip-boundary.md](docs/ip-boundary.md) for licensomfang og
grænsen mellem open source og kommercielt.

**Bemærkning om Ragtime**: Mappen `ragtime/` er licenseret under **Apache License 2.0**. Se [ragtime/LICENSE](ragtime/LICENSE) for detaljer.

---

## Support

- **Dokumentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kejwojew/hummem/issues)
- **Repository**: [github.com/kejwojew/hummem](https://github.com/kejwojew/hummem)

---

**Bygget med Claude Agent SDK** | **Fungerer med Claude Code** | **Lavet med TypeScript**

---

### Hvad Med CMEM?

CMEM er en token skabt af en tredjepart, men officielt anerkendt af skaberen af Claude-Mem (Alex Newman, @thedotmack). Tokenet fungerer som en katalysator for fællesskabsvækst og et redskab til at bringe CMEM til de udviklere og videnarbejdere, der har mest brug for det.

Officiel BASE CA: 0x76b1967eec0ccaeb001bbbb2b40dc4badba31ba3