🌐 Ceci est une traduction automatisée. Les corrections de la communauté sont les bienvenues !

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

<h4 align="center">Système de compression de mémoire persistante conçu pour <a href="https://claude.com/claude-code" target="_blank">Claude Code</a>.</h4>

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
  <a href="#démarrage-rapide">Démarrage rapide</a> •
  <a href="#comment-ça-fonctionne">Comment ça fonctionne</a> •
  <a href="#outils-de-recherche-mcp">Outils de recherche</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#dépannage">Dépannage</a> •
  <a href="#licence">Licence</a>
</p>

<p align="center">
  Claude-Mem préserve de manière transparente le contexte d'une session à l'autre en capturant automatiquement les observations d'utilisation des outils, en générant des résumés sémantiques et en les rendant disponibles pour les sessions futures. Cela permet à Claude de maintenir la continuité des connaissances sur les projets même après la fin des sessions ou la reconnexion.
</p>

---

## Démarrage rapide

Installez avec une seule commande :

```bash
npx claude-mem install
```

Ou installez pour OpenCode :

```bash
npx claude-mem install --ide opencode
```

Ou installez pour Antigravity CLI ([guide d'installation](https://github.com/kejwojew/hummem/blob/main/docs/public/antigravity-cli/setup.mdx)) :

```bash
npx claude-mem install --ide antigravity
```

Ou installez depuis la marketplace de plugins à l'intérieur de Claude Code :

```bash
/plugin marketplace add kejwojew/hummem

/plugin install claude-mem
```

Redémarrez Claude Code. Le contexte des sessions précédentes apparaîtra automatiquement dans les nouvelles sessions.

> **Remarque :** Claude-Mem est également publié sur npm, mais `npm install -g claude-mem` installe **uniquement le SDK/la bibliothèque** — cela n'enregistre pas les hooks du plugin et ne configure pas le service worker. Installez toujours via `npx claude-mem install` ou les commandes `/plugin` ci-dessus.

### 🦞 OpenClaw Gateway

Installez claude-mem comme plugin de mémoire persistante sur les passerelles [OpenClaw](https://openclaw.ai) avec une seule commande :

```bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash
```

L'installateur gère les dépendances, la configuration du plugin, la configuration du fournisseur d'IA, le démarrage du worker, ainsi que des flux d'observation optionnels en temps réel vers Telegram, Discord, Slack, et plus encore. Consultez le [Guide d'intégration OpenClaw](https://github.com/kejwojew/hummem/blob/main/docs/public/openclaw-integration.mdx) pour plus de détails.

**Fonctionnalités clés :**

- 🧠 **Mémoire persistante** - Le contexte survit d'une session à l'autre
- 📊 **Divulgation progressive** - Récupération de mémoire en couches avec visibilité du coût en tokens
- 🔍 **Recherche basée sur les compétences** - Interrogez l'historique de votre projet avec la compétence mem-search
- 🖥️ **Interface Web de visualisation** - Flux de mémoire en temps réel à l'URL du worker affichée au démarrage
- 💻 **Compétence Claude Desktop** - Recherchez dans la mémoire depuis les conversations Claude Desktop
- 🔒 **Contrôle de la confidentialité** - Utilisez les balises `<private>` pour exclure le contenu sensible du stockage
- ⚙️ **Configuration du contexte** - Contrôle précis sur le contexte injecté
- 🤖 **Fonctionnement automatique** - Aucune intervention manuelle requise
- 🔗 **Citations** - Référencez les observations passées avec des ID via l'API du worker ou visualisez-les toutes dans l'interface web

---

## Documentation

📚 **[Voir la documentation complète](https://github.com/kejwojew/hummem#readme)** - Parcourir sur le site officiel

### Pour commencer

- **[Guide d'installation](https://github.com/kejwojew/hummem/blob/main/docs/public/installation.mdx)** - Démarrage rapide et installation avancée
- **[Guide d'utilisation](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/getting-started.mdx)** - Comment Claude-Mem fonctionne automatiquement
- **[Outils de recherche](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx)** - Interrogez l'historique de votre projet en langage naturel

### Bonnes pratiques

- **[Ingénierie du contexte](https://github.com/kejwojew/hummem/blob/main/docs/public/context-engineering.mdx)** - Principes d'optimisation du contexte pour les agents IA
- **[Divulgation progressive](https://github.com/kejwojew/hummem/blob/main/docs/public/progressive-disclosure.mdx)** - Philosophie derrière la stratégie d'amorçage du contexte de Claude-Mem

### Architecture

- **[Vue d'ensemble](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx)** - Composants du système et flux de données
- **[Évolution de l'architecture](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture-evolution.mdx)** - Le parcours de la v3 à la v5
- **[Architecture des hooks](https://github.com/kejwojew/hummem/blob/main/docs/public/hooks-architecture.mdx)** - Comment Claude-Mem utilise les hooks de cycle de vie
- **[Référence des hooks](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/hooks.mdx)** - Explication des 7 scripts de hooks
- **[Service Worker](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/worker-service.mdx)** - API HTTP et gestion Bun
- **[Base de données](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/database.mdx)** - Schéma SQLite et recherche FTS5
- **[Architecture de recherche](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/search-architecture.mdx)** - Recherche hybride avec la base de données vectorielle Chroma

### Configuration et développement

- **[Configuration](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** - Variables d'environnement et paramètres
- **[Développement](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** - Compilation, tests, contribution
- **[Branches de publication](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)** - Flux des branches stable, core-dev et community-edge
- **[Dépannage](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** - Problèmes courants et solutions

---

## Comment ça fonctionne

**Composants principaux :**

1. **5 hooks de cycle de vie** - SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd (6 scripts de hooks)
2. **Installation intelligente** - Vérificateur de dépendances en cache (script pré-hook, pas un hook de cycle de vie)
3. **Service Worker** - API HTTP locale avec interface web de visualisation et points de terminaison de recherche, géré par Bun
4. **Base de données SQLite** - Stocke les sessions, observations, résumés
5. **Compétence mem-search** - Requêtes en langage naturel avec divulgation progressive
6. **Base de données vectorielle Chroma** - Recherche hybride sémantique + mots-clés pour une récupération de contexte intelligente

Voir la [Vue d'ensemble de l'architecture](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx) pour plus de détails.

---

## Outils de recherche MCP

Claude-Mem fournit une recherche de mémoire intelligente via **4 outils MCP** suivant un modèle de flux de travail à **3 couches**, économe en tokens :

**Le flux de travail à 3 couches :**

1. **`search`** - Obtenir un index compact avec des ID (~50-100 tokens/résultat)
2. **`timeline`** - Obtenir le contexte chronologique autour de résultats intéressants
3. **`get_observations`** - Récupérer les détails complets UNIQUEMENT pour les ID filtrés (~500-1 000 tokens/résultat)

**Comment ça fonctionne :**
- Claude utilise les outils MCP pour rechercher dans votre mémoire
- Commencez par `search` pour obtenir un index des résultats
- Utilisez `timeline` pour voir ce qui se passait autour d'observations spécifiques
- Utilisez `get_observations` pour récupérer les détails complets des ID pertinents
- **Économie de tokens d'environ 10x** en filtrant avant de récupérer les détails

**Outils MCP disponibles :**

1. **`search`** - Recherche dans l'index de mémoire avec des requêtes en texte intégral, filtres par type/date/projet
2. **`timeline`** - Obtenir le contexte chronologique autour d'une observation ou d'une requête spécifique
3. **`get_observations`** - Récupérer les détails complets d'observations par ID (toujours regrouper plusieurs ID)

**Exemple d'utilisation :**

```typescript
// Étape 1 : Rechercher un index
search(query="authentication bug", type="bugfix", limit=10)

// Étape 2 : Examiner l'index, identifier les ID pertinents (ex. #123, #456)

// Étape 3 : Récupérer les détails complets
get_observations(ids=[123, 456])
```

Voir le [Guide des outils de recherche](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx) pour des exemples détaillés.

---

## Branches de publication

Les versions stables sont publiées depuis `main` et diffusées sur npm. `core-dev` et
`community-edge` sont des branches exécutées depuis les sources pour les corrections de fiabilité
précoces et les intégrations communautaires. Voir **[Branches de publication](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)**
pour le flux des branches et les instructions d'exécution non stables.

---

## Configuration système requise

- **Node.js** : 20.0.0 ou supérieur
- **Claude Code** : Dernière version avec support des plugins
- **Bun** : Runtime JavaScript et gestionnaire de processus (installé automatiquement si manquant)
- **uv** : Gestionnaire de packages Python pour la recherche vectorielle (installé automatiquement si manquant)
- **SQLite 3** : Pour le stockage persistant (inclus)

---
### Remarques sur l'installation Windows

Si vous voyez une erreur du type :

```powershell
npm : The term 'npm' is not recognized as the name of a cmdlet
```

Assurez-vous que Node.js et npm sont installés et ajoutés à votre PATH. Téléchargez le dernier programme d'installation de Node.js depuis https://nodejs.org et redémarrez votre terminal après l'installation.

---

## Configuration

Les paramètres sont gérés dans `~/.claude-mem/settings.json` (créé automatiquement avec les valeurs par défaut au premier lancement). Configurez le modèle IA, le port du worker, le répertoire de données, le niveau de journalisation et les paramètres d'injection de contexte.

Voir le **[Guide de configuration](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** pour tous les paramètres disponibles et des exemples.

### Configuration du mode et de la langue

Claude-Mem prend en charge plusieurs modes de flux de travail et langues via le paramètre `CLAUDE_MEM_MODE`.

Cette option contrôle à la fois :
- Le comportement du flux de travail (ex. code, chill, investigation)
- La langue utilisée dans les observations générées

#### Comment configurer

Modifiez votre fichier de paramètres à `~/.claude-mem/settings.json` :

```json
{
  "CLAUDE_MEM_MODE": "code--zh"
}
```

Les modes sont définis dans `plugin/modes/`. Pour voir tous les modes disponibles localement :

```bash
ls ~/.claude/plugins/marketplaces/thedotmack/plugin/modes/
```

#### Modes disponibles

| Mode | Description |
|------------|-------------------------|
| `code` | Mode anglais par défaut |
| `code--zh` | Mode chinois simplifié |
| `code--ja` | Mode japonais |

Les modes spécifiques à une langue suivent le modèle `code--[lang]` où `[lang]` est le code de langue ISO 639-1 (ex. `zh` pour le chinois, `ja` pour le japonais, `es` pour l'espagnol).

> Remarque : `code--zh` (chinois simplifié) est déjà intégré — aucune installation supplémentaire ni mise à jour du plugin n'est nécessaire.

#### Après avoir changé de mode

Redémarrez Claude Code pour appliquer la nouvelle configuration de mode.
---

## Développement

Voir le **[Guide de développement](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** pour les instructions de compilation, les tests et le flux de contribution.

---

## Dépannage

Si vous rencontrez des problèmes, décrivez le problème à Claude et la compétence troubleshoot diagnostiquera automatiquement et fournira des solutions.

Voir le **[Guide de dépannage](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** pour les problèmes courants et les solutions.

---

## Rapports de bugs

Créez des rapports de bugs complets avec le générateur automatisé :

```bash
cd ~/.claude/plugins/marketplaces/thedotmack
npm run bug-report
```

## Contribuer

Les contributions sont les bienvenues ! Veuillez :

1. Forker le dépôt
2. Créer une branche de fonctionnalité
3. Effectuer vos modifications avec des tests
4. Mettre à jour la documentation
5. Soumettre une Pull Request

Claude-Mem est diffusé depuis trois branches : `main` (stable), `core-dev`, et
`community-edge`. Seule `main` est publiée sur npm ; les autres sont exécutées depuis
les sources. Voir [Branches de publication](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx) pour la
stratégie et les instructions d'exécution locale.

Voir le [Guide de développement](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx) pour le flux de contribution.

---

## Licence

Claude-Mem est distribué sous la licence Apache License 2.0.

Nous avons choisi Apache-2.0 car une mémoire agentique durable doit pouvoir être facilement intégrée
dans les outils de développement, les agents locaux, les serveurs MCP, les systèmes d'entreprise, les
piles robotiques, et les infrastructures d'agents en production.

Voir le fichier [LICENSE](LICENSE) pour tous les détails. Voir [docs/license.md](docs/license.md)
et [docs/ip-boundary.md](docs/ip-boundary.md) pour la portée de la licence et la frontière
entre open source et commercial.

**Remarque sur Ragtime** : Le répertoire `ragtime/` est sous licence **Apache License 2.0**. Voir [ragtime/LICENSE](ragtime/LICENSE) pour plus de détails.

---

## Support

- **Documentation** : [docs/](docs/)
- **Issues** : [GitHub Issues](https://github.com/kejwojew/hummem/issues)
- **Dépôt** : [github.com/thedotmack/claude-mem](https://github.com/kejwojew/hummem)
- **Compte X officiel** : [@Claude_Memory](https://x.com/Claude_Memory)
- **Discord officiel** : [Rejoindre Discord](https://discord.com/invite/J4wttp9vDu)
- **Auteur** : Alex Newman ([@thedotmack](https://github.com/thedotmack))

---

**Construit avec Claude Agent SDK** | **Fonctionne avec Claude Code** | **Fait avec TypeScript**

---

### Et le CMEM dans tout ça ?

CMEM est un token créé par un tiers mais officiellement adopté par le créateur de Claude-Mem (Alex Newman, @thedotmack). Le token agit comme un catalyseur communautaire de croissance et un vecteur pour faire connaître CMEM aux développeurs et travailleurs du savoir qui en ont le plus besoin.

CA officiel BASE : 0x76b1967eec0ccaeb001bbbb2b40dc4badba31ba3