🌐 Esta é uma tradução automatizada. Correções da comunidade são bem-vindas!

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

<h4 align="center">Sistema de compressão de memória persistente construído para <a href="https://claude.com/claude-code" target="_blank">Claude Code</a>.</h4>

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
  <a href="#início-rápido">Início Rápido</a> •
  <a href="#como-funciona">Como Funciona</a> •
  <a href="#ferramentas-de-busca-mcp">Ferramentas de Busca</a> •
  <a href="#documentação">Documentação</a> •
  <a href="#configuração">Configuração</a> •
  <a href="#solução-de-problemas">Solução de Problemas</a> •
  <a href="#licença">Licença</a>
</p>

<p align="center">
  Claude-Mem preserva o contexto perfeitamente entre sessões, capturando automaticamente observações de uso de ferramentas, gerando resumos semânticos e disponibilizando-os para sessões futuras. Isso permite que o Claude mantenha a continuidade do conhecimento sobre projetos mesmo após o término ou a reconexão das sessões.
</p>

---

## Início Rápido

Instale com um único comando:

```bash
npx hummem install
```

Ou instale para o OpenCode:

```bash
npx hummem install --ide opencode
```

Ou instale para o Antigravity CLI ([guia de configuração](https://github.com/kejwojew/hummem/blob/main/docs/public/antigravity-cli/setup.mdx)):

```bash
npx hummem install --ide antigravity
```

Ou instale a partir do marketplace de plugins dentro do Claude Code:

```bash
/plugin marketplace add kejwojew/hummem

/plugin install claude-mem
```

Reinicie o Claude Code. O contexto de sessões anteriores aparecerá automaticamente em novas sessões.

> **Observação:** o Claude-Mem também é publicado no npm, mas `npm install -g claude-mem` instala **apenas o SDK/biblioteca** — ele não registra os hooks do plugin nem configura o serviço worker. Sempre instale via `npx hummem install` ou pelos comandos `/plugin` acima.

### 🦞 OpenClaw Gateway

Instale o claude-mem como um plugin de memória persistente em gateways [OpenClaw](https://openclaw.ai) com um único comando:

```bash
curl -fsSL https://raw.githubusercontent.com/kejwojew/hummem/main/openclaw/install.sh | bash
```

O instalador cuida das dependências, da configuração do plugin, da configuração do provedor de IA, da inicialização do worker e de feeds opcionais de observação em tempo real para Telegram, Discord, Slack e outros. Consulte o [Guia de Integração com o OpenClaw](https://github.com/kejwojew/hummem/blob/main/docs/public/openclaw-integration.mdx) para mais detalhes.

**Principais Recursos:**

- 🧠 **Memória Persistente** - O contexto sobrevive entre sessões
- 📊 **Divulgação Progressiva** - Recuperação de memória em camadas com visibilidade de custo de tokens
- 🔍 **Busca Baseada em Skill** - Consulte o histórico do seu projeto com a skill mem-search
- 🖥️ **Interface Web de Visualização** - Fluxo de memória em tempo real na URL do worker exibida na inicialização
- 💻 **Skill para Claude Desktop** - Busque memória em conversas do Claude Desktop
- 🔒 **Controle de Privacidade** - Use tags `<private>` para excluir conteúdo sensível do armazenamento
- ⚙️ **Configuração de Contexto** - Controle refinado sobre qual contexto é injetado
- 🤖 **Operação Automática** - Nenhuma intervenção manual necessária
- 🔗 **Citações** - Referencie observações passadas com IDs através da API do worker ou visualize todas no visualizador web

---

## Documentação

📚 **[Ver Documentação Completa](https://github.com/kejwojew/hummem#readme)** - Navegue no site oficial

### Começando

- **[Guia de Instalação](https://github.com/kejwojew/hummem/blob/main/docs/public/installation.mdx)** - Início rápido e instalação avançada
- **[Guia de Uso](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/getting-started.mdx)** - Como o Claude-Mem funciona automaticamente
- **[Ferramentas de Busca](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx)** - Consulte o histórico do seu projeto com linguagem natural

### Melhores Práticas

- **[Engenharia de Contexto](https://github.com/kejwojew/hummem/blob/main/docs/public/context-engineering.mdx)** - Princípios de otimização de contexto para agentes de IA
- **[Divulgação Progressiva](https://github.com/kejwojew/hummem/blob/main/docs/public/progressive-disclosure.mdx)** - Filosofia por trás da estratégia de preparação de contexto do Claude-Mem

### Arquitetura

- **[Visão Geral](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx)** - Componentes do sistema e fluxo de dados
- **[Evolução da Arquitetura](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture-evolution.mdx)** - A jornada da v3 à v5
- **[Arquitetura de Hooks](https://github.com/kejwojew/hummem/blob/main/docs/public/hooks-architecture.mdx)** - Como o Claude-Mem usa hooks de ciclo de vida
- **[Referência de Hooks](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/hooks.mdx)** - 7 scripts de hook explicados
- **[Serviço Worker](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/worker-service.mdx)** - API HTTP e gerenciamento do Bun
- **[Banco de Dados](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/database.mdx)** - Schema SQLite e busca FTS5
- **[Arquitetura de Busca](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/search-architecture.mdx)** - Busca híbrida com banco de dados vetorial Chroma

### Configuração e Desenvolvimento

- **[Configuração](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** - Variáveis de ambiente e configurações
- **[Desenvolvimento](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** - Build, testes e contribuição
- **[Branches de Release](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)** - Fluxo das branches stable, core-dev e community-edge
- **[Solução de Problemas](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** - Problemas comuns e soluções

---

## Como Funciona

**Componentes Principais:**

1. **5 Hooks de Ciclo de Vida** - SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd (6 scripts de hook)
2. **Instalação Inteligente** - Verificador de dependências em cache (script pré-hook, não um hook de ciclo de vida)
3. **Serviço Worker** - API HTTP local com interface de visualização web e endpoints de busca, gerenciado pelo Bun
4. **Banco de Dados SQLite** - Armazena sessões, observações, resumos
5. **Skill mem-search** - Consultas em linguagem natural com divulgação progressiva
6. **Banco de Dados Vetorial Chroma** - Busca híbrida semântica + palavra-chave para recuperação inteligente de contexto

Veja [Visão Geral da Arquitetura](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx) para detalhes.

---

## Ferramentas de Busca MCP

O Claude-Mem fornece busca inteligente de memória através de **4 ferramentas MCP** seguindo um padrão de fluxo de trabalho em **3 camadas**, eficiente em termos de tokens:

**O Fluxo de Trabalho em 3 Camadas:**

1. **`search`** - Obtenha um índice compacto com IDs (~50-100 tokens/resultado)
2. **`timeline`** - Obtenha o contexto cronológico em torno de resultados interessantes
3. **`get_observations`** - Busque detalhes completos APENAS para os IDs filtrados (~500-1.000 tokens/resultado)

**Como Funciona:**
- O Claude usa ferramentas MCP para buscar na sua memória
- Comece com `search` para obter um índice de resultados
- Use `timeline` para ver o que estava acontecendo em torno de observações específicas
- Use `get_observations` para buscar detalhes completos dos IDs relevantes
- **Economia de tokens de ~10x** ao filtrar antes de buscar os detalhes

**Ferramentas MCP Disponíveis:**

1. **`search`** - Busca no índice de memória com consultas de texto completo, filtros por tipo/data/projeto
2. **`timeline`** - Obtenha o contexto cronológico em torno de uma observação ou consulta específica
3. **`get_observations`** - Busque detalhes completos de observações por IDs (sempre agrupe múltiplos IDs)

**Exemplo de Uso:**

```typescript
// Etapa 1: Buscar o índice
search(query="authentication bug", type="bugfix", limit=10)

// Etapa 2: Revisar o índice, identificar IDs relevantes (ex.: #123, #456)

// Etapa 3: Buscar os detalhes completos
get_observations(ids=[123, 456])
```

Veja o [Guia de Ferramentas de Busca](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx) para exemplos detalhados.

---

## Branches de Release

Os releases estáveis são publicados a partir da branch `main` e disponibilizados no npm. As branches `core-dev` e
`community-edge` são branches executadas a partir do código-fonte para correções de confiabilidade antecipadas e
integrações da comunidade. Veja **[Branches de Release](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)**
para o fluxo das branches e instruções de execução não estável.

---

## Requisitos do Sistema

- **Node.js**: 20.0.0 ou superior
- **Claude Code**: Versão mais recente com suporte a plugins
- **Bun**: Runtime JavaScript e gerenciador de processos (instalado automaticamente se ausente)
- **uv**: Gerenciador de pacotes Python para busca vetorial (instalado automaticamente se ausente)
- **SQLite 3**: Para armazenamento persistente (incluído)

---
### Notas de Configuração para Windows

Se você vir um erro como:

```powershell
npm : The term 'npm' is not recognized as the name of a cmdlet
```

Certifique-se de que o Node.js e o npm estejam instalados e adicionados ao seu PATH. Baixe o instalador mais recente do Node.js em https://nodejs.org e reinicie seu terminal após a instalação.

---

## Configuração

As configurações são gerenciadas em `~/.claude-mem/settings.json` (criado automaticamente com valores padrão na primeira execução). Configure o modelo de IA, a porta do worker, o diretório de dados, o nível de log e as configurações de injeção de contexto.

Veja o **[Guia de Configuração](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** para todas as configurações disponíveis e exemplos.

### Configuração de Modo e Idioma

O Claude-Mem oferece suporte a múltiplos modos de fluxo de trabalho e idiomas através da configuração `CLAUDE_MEM_MODE`.

Essa opção controla:
- O comportamento do fluxo de trabalho (ex.: code, chill, investigation)
- O idioma usado nas observações geradas

#### Como Configurar

Edite seu arquivo de configurações em `~/.claude-mem/settings.json`:

```json
{
  "CLAUDE_MEM_MODE": "code--zh"
}
```

Os modos são definidos em `plugin/modes/`. Para ver todos os modos disponíveis localmente:

```bash
ls ~/.claude/plugins/marketplaces/thedotmack/plugin/modes/
```

#### Modos Disponíveis

| Modo | Descrição |
|------------|-------------------------|
| `code` | Modo padrão em inglês |
| `code--zh` | Modo em chinês simplificado |
| `code--ja` | Modo em japonês |

Os modos específicos de idioma seguem o padrão `code--[lang]`, onde `[lang]` é o código de idioma ISO 639-1 (ex.: `zh` para chinês, `ja` para japonês, `es` para espanhol).

> Observação: o `code--zh` (chinês simplificado) já vem integrado — nenhuma instalação adicional ou atualização de plugin é necessária.

#### Após Alterar o Modo

Reinicie o Claude Code para aplicar a nova configuração de modo.
---

## Desenvolvimento

Veja o **[Guia de Desenvolvimento](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** para instruções de build, testes e fluxo de contribuição.

---

## Solução de Problemas

Se estiver enfrentando problemas, descreva o problema para o Claude e a skill troubleshoot diagnosticará automaticamente e fornecerá correções.

Veja o **[Guia de Solução de Problemas](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** para problemas comuns e soluções.

---

## Relatos de Bug

Crie relatos de bug abrangentes com o gerador automatizado:

```bash
cd ~/.claude/plugins/marketplaces/thedotmack
npm run bug-report
```

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do repositório
2. Crie uma branch de feature
3. Faça suas alterações com testes
4. Atualize a documentação
5. Envie um Pull Request

O Claude-Mem é distribuído a partir de três branches: `main` (estável), `core-dev` e
`community-edge`. Apenas a `main` é publicada no npm; as demais são executadas a partir do
código-fonte. Veja [Branches de Release](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx) para a
estratégia e instruções de execução local.

Veja o [Guia de Desenvolvimento](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx) para o fluxo de contribuição.

---

## Licença

O Claude-Mem é licenciado sob a Apache License 2.0.

Escolhemos a Apache-2.0 porque a memória agêntica duradoura deve ser fácil de incorporar em
ferramentas de desenvolvimento, agentes locais, servidores MCP, sistemas empresariais, stacks de robótica
e harnesses de agentes em produção.

Veja o arquivo [LICENSE](LICENSE) para todos os detalhes. Veja [docs/license.md](docs/license.md)
e [docs/ip-boundary.md](docs/ip-boundary.md) para o escopo de licenciamento e a
fronteira entre o aberto e o comercial.

**Nota sobre o Ragtime**: o diretório `ragtime/` é licenciado sob a **Apache License 2.0**. Veja [ragtime/LICENSE](ragtime/LICENSE) para detalhes.

---

## Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kejwojew/hummem/issues)
- **Repositório**: [github.com/kejwojew/hummem](https://github.com/kejwojew/hummem)

---

**Construído com Claude Agent SDK** | **Funciona com Claude Code** | **Feito com TypeScript**

---

### E o CMEM?

CMEM é um token criado por terceiros, mas oficialmente adotado pelo criador do Claude-Mem (Alex Newman, @thedotmack). O token funciona como um catalisador comunitário de crescimento e um veículo para levar o CMEM aos desenvolvedores e profissionais do conhecimento que mais precisam dele.

CA Oficial na BASE: 0x76b1967eec0ccaeb001bbbb2b40dc4badba31ba3