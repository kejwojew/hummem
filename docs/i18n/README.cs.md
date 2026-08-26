🌐 Toto je automatický překlad. Komunitní opravy jsou vítány!

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

<h4 align="center">Systém trvalé komprese paměti vytvořený pro <a href="https://claude.com/claude-code" target="_blank">Claude Code</a>.</h4>

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
  <a href="#rychlý-start">Rychlý start</a> •
  <a href="#jak-to-funguje">Jak to funguje</a> •
  <a href="#vyhledávací-nástroje-mcp">Vyhledávací nástroje</a> •
  <a href="#dokumentace">Dokumentace</a> •
  <a href="#konfigurace">Konfigurace</a> •
  <a href="#řešení-problémů">Řešení problémů</a> •
  <a href="#licence">Licence</a>
</p>

<p align="center">
  Claude-Mem bezproblémově zachovává kontext napříč sezeními tím, že automaticky zaznamenává pozorování použití nástrojů, generuje sémantické souhrny a zpřístupňuje je budoucím sezením. To Claude umožňuje udržovat kontinuitu znalostí o projektech i po ukončení sezení nebo jeho opětovném navázání.
</p>

---

## Rychlý start

Nainstalujte jedním příkazem:

```bash
npx hummem install
```

Nebo instalace pro OpenCode:

```bash
npx hummem install --ide opencode
```

Nebo instalace pro Antigravity CLI ([návod k nastavení](https://github.com/kejwojew/hummem/blob/main/docs/public/antigravity-cli/setup.mdx)):

```bash
npx hummem install --ide antigravity
```

Nebo instalace z tržiště pluginů uvnitř Claude Code:

```bash
/plugin marketplace add kejwojew/hummem

/plugin install claude-mem
```

Restartujte Claude Code. Kontext z předchozích sezení se automaticky objeví v nových sezeních.

> **Poznámka:** Claude-Mem je také publikován na npm, ale `npm install -g claude-mem` nainstaluje **pouze SDK/knihovnu** — neregistruje háčky pluginu ani nenastaví worker službu. Vždy instalujte pomocí `npx hummem install` nebo výše uvedených příkazů `/plugin`.

### 🦞 OpenClaw Gateway

Nainstalujte claude-mem jako plugin trvalé paměti na gateway [OpenClaw](https://openclaw.ai) jediným příkazem:

```bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash
```

Instalátor se stará o závislosti, nastavení pluginu, konfiguraci AI poskytovatele, spuštění workeru a volitelné feedy pozorování v reálném čase do Telegramu, Discordu, Slacku a dalších. Podrobnosti najdete v [Průvodci integrací OpenClaw](https://github.com/kejwojew/hummem/blob/main/docs/public/openclaw-integration.mdx).

**Klíčové vlastnosti:**

- 🧠 **Trvalá paměť** - Kontext přetrvává napříč sezeními
- 📊 **Postupné odhalování** - Vrstvené vyhledávání paměti s viditelností nákladů na tokeny
- 🔍 **Vyhledávání založené na dovednostech** - Dotazujte se na historii projektu pomocí dovednosti mem-search
- 🖥️ **Webové uživatelské rozhraní** - Tok paměti v reálném čase na adrese URL workeru vypsané při spuštění
- 💻 **Dovednost pro Claude Desktop** - Vyhledávejte v paměti z konverzací Claude Desktop
- 🔒 **Kontrola soukromí** - Použijte značky `<private>` k vyloučení citlivého obsahu z úložiště
- ⚙️ **Konfigurace kontextu** - Jemně odstupňovaná kontrola nad tím, jaký kontext se vkládá
- 🤖 **Automatický provoz** - Není vyžadován žádný manuální zásah
- 🔗 **Citace** - Odkazujte na minulá pozorování pomocí ID přes API workeru nebo zobrazte vše ve webovém prohlížeči

---

## Dokumentace

📚 **[Zobrazit kompletní dokumentaci](https://github.com/kejwojew/hummem#readme)** - Procházet na oficiálních stránkách

### Začínáme

- **[Průvodce instalací](https://github.com/kejwojew/hummem/blob/main/docs/public/installation.mdx)** - Rychlý start a pokročilá instalace
- **[Průvodce použitím](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/getting-started.mdx)** - Jak Claude-Mem funguje automaticky
- **[Vyhledávací nástroje](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx)** - Dotazujte se na historii projektu pomocí přirozeného jazyka

### Osvědčené postupy

- **[Context Engineering](https://github.com/kejwojew/hummem/blob/main/docs/public/context-engineering.mdx)** - Principy optimalizace kontextu AI agenta
- **[Postupné odhalování](https://github.com/kejwojew/hummem/blob/main/docs/public/progressive-disclosure.mdx)** - Filozofie strategie přípravy kontextu Claude-Mem

### Architektura

- **[Přehled](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx)** - Systémové komponenty a tok dat
- **[Evoluce architektury](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture-evolution.mdx)** - Cesta z v3 na v5
- **[Architektura háčků](https://github.com/kejwojew/hummem/blob/main/docs/public/hooks-architecture.mdx)** - Jak Claude-Mem používá lifecycle hooks
- **[Reference háčků](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/hooks.mdx)** - Vysvětlení 7 hook skriptů
- **[Worker Service](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/worker-service.mdx)** - HTTP API a správa Bun
- **[Databáze](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/database.mdx)** - SQLite schéma a FTS5 vyhledávání
- **[Architektura vyhledávání](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/search-architecture.mdx)** - Hybridní vyhledávání s vektorovou databází Chroma

### Konfigurace a vývoj

- **[Konfigurace](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** - Proměnné prostředí a nastavení
- **[Vývoj](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** - Sestavení, testování, přispívání
- **[Vydávací větve](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)** - Tok větví stable, core-dev a community-edge
- **[Řešení problémů](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** - Běžné problémy a řešení

---

## Jak to funguje

**Hlavní komponenty:**

1. **5 Lifecycle Hooks** - SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd (6 hook skriptů)
2. **Chytrá instalace** - Kontrola cachovaných závislostí (pre-hook skript, ne lifecycle hook)
3. **Worker Service** - Lokální HTTP API s webovým prohlížečem a vyhledávacími endpointy, spravováno pomocí Bun
4. **SQLite databáze** - Ukládá sezení, pozorování, souhrny
5. **mem-search dovednost** - Dotazy v přirozeném jazyce s postupným odhalováním
6. **Chroma vektorová databáze** - Hybridní sémantické + klíčové vyhledávání pro inteligentní vyhledávání kontextu

Podrobnosti najdete v [Přehledu architektury](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx).

---

## Vyhledávací nástroje MCP

Claude-Mem poskytuje inteligentní vyhledávání v paměti prostřednictvím **4 nástrojů MCP** podle vzoru **3vrstvého pracovního postupu** šetřícího tokeny:

**3vrstvý pracovní postup:**

1. **`search`** - Získání kompaktního indexu s ID (~50-100 tokenů/výsledek)
2. **`timeline`** - Získání chronologického kontextu kolem zajímavých výsledků
3. **`get_observations`** - Získání úplných podrobností POUZE pro vyfiltrovaná ID (~500-1 000 tokenů/výsledek)

**Jak to funguje:**
- Claude používá nástroje MCP k vyhledávání ve vaší paměti
- Začněte s `search`, abyste získali index výsledků
- Použijte `timeline` k zobrazení toho, co se dělo kolem konkrétních pozorování
- Použijte `get_observations` k získání úplných podrobností pro relevantní ID
- **Úspora tokenů až ~10x** díky filtrování před získáváním podrobností

**Dostupné nástroje MCP:**

1. **`search`** - Vyhledávání v indexu paměti pomocí fulltextových dotazů, filtrování podle typu/data/projektu
2. **`timeline`** - Získání chronologického kontextu kolem konkrétního pozorování nebo dotazu
3. **`get_observations`** - Získání úplných podrobností pozorování podle ID (vždy dávkově s více ID)

**Příklad použití:**

```typescript
// Krok 1: Vyhledání indexu
search(query="authentication bug", type="bugfix", limit=10)

// Krok 2: Prohlédnutí indexu, identifikace relevantních ID (např. #123, #456)

// Krok 3: Získání úplných podrobností
get_observations(ids=[123, 456])
```

Podrobné příklady najdete v [Průvodci vyhledávacími nástroji](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx).

---

## Vydávací větve

Stabilní vydání jsou publikována z větve `main` a zveřejněna na npm. `core-dev` a
`community-edge` jsou větve spouštěné ze zdrojového kódu určené pro včasné opravy
spolehlivosti a komunitní integrace. Podrobnosti o toku větví a pokyny ke spuštění
nestabilních verzí najdete v **[Vydávacích větvích](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)**.

---

## Systémové požadavky

- **Node.js**: 20.0.0 nebo vyšší
- **Claude Code**: Nejnovější verze s podporou pluginů
- **Bun**: JavaScript runtime a správce procesů (automaticky nainstalován, pokud chybí)
- **uv**: Python správce balíčků pro vektorové vyhledávání (automaticky nainstalován, pokud chybí)
- **SQLite 3**: Pro trvalé úložiště (součástí balíčku)

---
### Poznámky k nastavení pro Windows

Pokud se zobrazí chyba jako:

```powershell
npm : The term 'npm' is not recognized as the name of a cmdlet
```

Ujistěte se, že Node.js a npm jsou nainstalované a přidané do vaší proměnné PATH. Stáhněte nejnovější instalátor Node.js z https://nodejs.org a po instalaci restartujte terminál.

---

## Konfigurace

Nastavení jsou spravována v `~/.claude-mem/settings.json` (automaticky vytvořeno s výchozími hodnotami při prvním spuštění). Konfigurujte AI model, port workeru, datový adresář, úroveň logování a nastavení vkládání kontextu.

Všechna dostupná nastavení a příklady najdete v **[Průvodci konfigurací](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)**.

### Konfigurace režimu a jazyka

Claude-Mem podporuje více pracovních režimů a jazyků prostřednictvím nastavení `CLAUDE_MEM_MODE`.

Tato volba ovládá jak:
- Chování pracovního postupu (např. code, chill, investigation)
- Jazyk používaný ve vygenerovaných pozorováních

#### Jak nakonfigurovat

Upravte svůj soubor nastavení v `~/.claude-mem/settings.json`:

```json
{
  "CLAUDE_MEM_MODE": "code--zh"
}
```

Režimy jsou definovány v `plugin/modes/`. Chcete-li zobrazit všechny dostupné režimy lokálně:

```bash
ls ~/.claude/plugins/marketplaces/thedotmack/plugin/modes/
```

#### Dostupné režimy

| Režim | Popis |
|------------|-------------------------|
| `code` | Výchozí anglický režim |
| `code--zh` | Zjednodušená čínština |
| `code--ja` | Japonština |

Jazykově specifické režimy se řídí vzorem `code--[lang]`, kde `[lang]` je kód jazyka podle ISO 639-1 (např. `zh` pro čínštinu, `ja` pro japonštinu, `es` pro španělštinu).

> Poznámka: `code--zh` (zjednodušená čínština) je již vestavěn — není potřeba žádná další instalace ani aktualizace pluginu.

#### Po změně režimu

Restartujte Claude Code, aby se použila nová konfigurace režimu.
---

## Vývoj

Podrobné pokyny k sestavení, testování a pracovnímu postupu pro přispívání najdete v **[Průvodci vývojem](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)**.

---

## Řešení problémů

Pokud zaznamenáváte problémy, popište problém Claude a dovednost troubleshoot automaticky diagnostikuje a poskytne opravy.

Běžné problémy a řešení najdete v **[Průvodci řešením problémů](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)**.

---

## Hlášení chyb

Vytvořte komplexní hlášení chyby pomocí automatického generátoru:

```bash
cd ~/.claude/plugins/marketplaces/thedotmack
npm run bug-report
```

## Přispívání

Příspěvky jsou vítány! Prosím:

1. Forkněte repositář
2. Vytvořte feature branch
3. Proveďte změny s testy
4. Aktualizujte dokumentaci
5. Odešlete Pull Request

Claude-Mem je vydáván ze tří větví: `main` (stabilní), `core-dev` a
`community-edge`. Na npm je publikována pouze `main`; ostatní se spouštějí ze
zdrojového kódu. Podrobnosti o strategii a pokyny ke spuštění lokálně najdete
ve [Vydávacích větvích](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx).

Pracovní postup pro přispívání najdete v [Průvodci vývojem](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx).

---

## Licence

Claude-Mem je licencován pod licencí Apache License 2.0.

Zvolili jsme Apache-2.0, protože trvalá agentní paměť by měla být snadno
vložitelná do vývojářských nástrojů, lokálních agentů, MCP serverů, podnikových
systémů, robotických stacků a produkčních harnessů pro agenty.

Úplné podrobnosti najdete v souboru [LICENSE](LICENSE). Viz [docs/license.md](docs/license.md)
a [docs/ip-boundary.md](docs/ip-boundary.md) pro rozsah licencování a hranici
mezi open source a komerčním využitím.

**Poznámka k Ragtime**: Adresář `ragtime/` je licencován pod licencí **Apache License 2.0**. Podrobnosti najdete v [ragtime/LICENSE](ragtime/LICENSE).

---

## Podpora

- **Dokumentace**: [docs/](docs/)
- **Problémy**: [GitHub Issues](https://github.com/kejwojew/hummem/issues)
- **Repositář**: [github.com/kejwojew/hummem](https://github.com/kejwojew/hummem)

---

**Vytvořeno pomocí Claude Agent SDK** | **Funguje s Claude Code** | **Vyrobeno s TypeScript**

---

### Co je to CMEM?

CMEM je token vytvořený třetí stranou, ale oficiálně přijatý tvůrcem Claude-Mem (Alex Newman, @thedotmack). Token funguje jako komunitní katalyzátor růstu a prostředek, jak přiblížit CMEM vývojářům a znalostním pracovníkům, kteří ho nejvíce potřebují.

Oficiální BASE CA: 0x76b1967eec0ccaeb001bbbb2b40dc4badba31ba3