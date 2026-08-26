🌐 Ini adalah terjemahan otomatis. Koreksi dari komunitas sangat dipersilakan!

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

<h4 align="center">Sistem kompresi memori persisten yang dibangun untuk <a href="https://claude.com/claude-code" target="_blank">Claude Code</a>.</h4>

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
  <a href="#mulai-cepat">Mulai Cepat</a> •
  <a href="#cara-kerja">Cara Kerja</a> •
  <a href="#alat-pencarian-mcp">Alat Pencarian</a> •
  <a href="#dokumentasi">Dokumentasi</a> •
  <a href="#konfigurasi">Konfigurasi</a> •
  <a href="#pemecahan-masalah">Pemecahan Masalah</a> •
  <a href="#lisensi">Lisensi</a>
</p>

<p align="center">
  Claude-Mem secara mulus mempertahankan konteks di seluruh sesi dengan secara otomatis menangkap observasi penggunaan alat, menghasilkan ringkasan semantik, dan membuatnya tersedia untuk sesi mendatang. Ini memungkinkan Claude untuk mempertahankan kontinuitas pengetahuan tentang proyek bahkan setelah sesi berakhir atau tersambung kembali.
</p>

---

## Mulai Cepat

Instal dengan satu perintah:

```bash
npx hummem install
```

Atau instal untuk OpenCode:

```bash
npx hummem install --ide opencode
```

Atau instal untuk Antigravity CLI ([panduan pengaturan](https://github.com/kejwojew/hummem/blob/main/docs/public/antigravity-cli/setup.mdx)):

```bash
npx hummem install --ide antigravity
```

Atau instal dari plugin marketplace di dalam Claude Code:

```bash
/plugin marketplace add kejwojew/hummem

/plugin install claude-mem
```

Restart Claude Code. Konteks dari sesi sebelumnya akan secara otomatis muncul di sesi baru.

> **Catatan:** Claude-Mem juga dipublikasikan di npm, tetapi `npm install -g claude-mem` hanya menginstal **SDK/library saja** — ini tidak mendaftarkan plugin hooks atau menyiapkan layanan worker. Selalu instal melalui `npx hummem install` atau perintah `/plugin` di atas.

### 🦞 OpenClaw Gateway

Instal claude-mem sebagai plugin memori persisten pada gateway [OpenClaw](https://openclaw.ai) dengan satu perintah:

```bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash
```

Installer ini menangani dependensi, pengaturan plugin, konfigurasi penyedia AI, startup worker, dan feed observasi real-time opsional ke Telegram, Discord, Slack, dan lainnya. Lihat [Panduan Integrasi OpenClaw](https://github.com/kejwojew/hummem/blob/main/docs/public/openclaw-integration.mdx) untuk detail.

**Fitur Utama:**

- 🧠 **Memori Persisten** - Konteks bertahan di seluruh sesi
- 📊 **Progressive Disclosure** - Pengambilan memori berlapis dengan visibilitas biaya token
- 🔍 **Pencarian Berbasis Skill** - Query riwayat proyek Anda dengan mem-search skill
- 🖥️ **Web Viewer UI** - Stream memori real-time di URL worker yang dicetak saat startup
- 💻 **Claude Desktop Skill** - Cari memori dari percakapan Claude Desktop
- 🔒 **Kontrol Privasi** - Gunakan tag `<private>` untuk mengecualikan konten sensitif dari penyimpanan
- ⚙️ **Konfigurasi Konteks** - Kontrol yang detail atas konteks apa yang diinjeksikan
- 🤖 **Operasi Otomatis** - Tidak memerlukan intervensi manual
- 🔗 **Kutipan** - Referensi observasi masa lalu dengan ID melalui worker API atau lihat semua di web viewer

---

## Dokumentasi

📚 **[Lihat Dokumentasi Lengkap](https://github.com/kejwojew/hummem#readme)** - Jelajahi di situs web resmi

### Memulai

- **[Panduan Instalasi](https://github.com/kejwojew/hummem/blob/main/docs/public/installation.mdx)** - Mulai cepat & instalasi lanjutan
- **[Panduan Penggunaan](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/getting-started.mdx)** - Bagaimana Claude-Mem bekerja secara otomatis
- **[Alat Pencarian](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx)** - Query riwayat proyek Anda dengan bahasa alami

### Praktik Terbaik

- **[Context Engineering](https://github.com/kejwojew/hummem/blob/main/docs/public/context-engineering.mdx)** - Prinsip optimisasi konteks agen AI
- **[Progressive Disclosure](https://github.com/kejwojew/hummem/blob/main/docs/public/progressive-disclosure.mdx)** - Filosofi di balik strategi priming konteks Claude-Mem

### Arsitektur

- **[Ringkasan](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx)** - Komponen sistem & aliran data
- **[Evolusi Arsitektur](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture-evolution.mdx)** - Perjalanan dari v3 ke v5
- **[Arsitektur Hooks](https://github.com/kejwojew/hummem/blob/main/docs/public/hooks-architecture.mdx)** - Bagaimana Claude-Mem menggunakan lifecycle hooks
- **[Referensi Hooks](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/hooks.mdx)** - 7 skrip hook dijelaskan
- **[Worker Service](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/worker-service.mdx)** - HTTP API & manajemen Bun
- **[Database](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/database.mdx)** - Skema SQLite & pencarian FTS5
- **[Arsitektur Pencarian](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/search-architecture.mdx)** - Pencarian hybrid dengan database vektor Chroma

### Konfigurasi & Pengembangan

- **[Konfigurasi](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** - Variabel environment & pengaturan
- **[Pengembangan](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** - Membangun, testing, kontribusi
- **[Release Branches](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)** - Alur branch stable, core-dev, dan community-edge
- **[Pemecahan Masalah](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** - Masalah umum & solusi

---

## Cara Kerja

**Komponen Inti:**

1. **5 Lifecycle Hooks** - SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd (6 skrip hook)
2. **Smart Install** - Pemeriksa dependensi yang di-cache (skrip pre-hook, bukan lifecycle hook)
3. **Worker Service** - HTTP API lokal dengan web viewer UI dan endpoint pencarian, dikelola oleh Bun
4. **SQLite Database** - Menyimpan sesi, observasi, ringkasan
5. **mem-search Skill** - Query bahasa alami dengan progressive disclosure
6. **Chroma Vector Database** - Pencarian hybrid semantik + keyword untuk pengambilan konteks yang cerdas

Lihat [Ringkasan Arsitektur](https://github.com/kejwojew/hummem/blob/main/docs/public/architecture/overview.mdx) untuk detail.

---

## Alat Pencarian MCP

Claude-Mem menyediakan pencarian memori cerdas melalui **4 alat MCP** yang mengikuti pola alur kerja **3 lapis** yang hemat token:

**Alur Kerja 3 Lapis:**

1. **`search`** - Dapatkan indeks ringkas dengan ID (~50-100 token/hasil)
2. **`timeline`** - Dapatkan konteks kronologis di sekitar hasil yang menarik
3. **`get_observations`** - Ambil detail lengkap HANYA untuk ID yang telah difilter (~500-1.000 token/hasil)

**Cara Kerja:**
- Claude menggunakan alat MCP untuk mencari memori Anda
- Mulai dengan `search` untuk mendapatkan indeks hasil
- Gunakan `timeline` untuk melihat apa yang terjadi di sekitar observasi tertentu
- Gunakan `get_observations` untuk mengambil detail lengkap untuk ID yang relevan
- **Penghematan token ~10x** dengan memfilter sebelum mengambil detail

**Alat MCP yang Tersedia:**

1. **`search`** - Cari indeks memori dengan query teks lengkap, filter berdasarkan tipe/tanggal/proyek
2. **`timeline`** - Dapatkan konteks kronologis di sekitar observasi atau query tertentu
3. **`get_observations`** - Ambil detail observasi lengkap berdasarkan ID (selalu batch beberapa ID)

**Contoh Penggunaan:**

```typescript
// Langkah 1: Cari untuk indeks
search(query="authentication bug", type="bugfix", limit=10)

// Langkah 2: Tinjau indeks, identifikasi ID yang relevan (mis., #123, #456)

// Langkah 3: Ambil detail lengkap
get_observations(ids=[123, 456])
```

Lihat [Panduan Alat Pencarian](https://github.com/kejwojew/hummem/blob/main/docs/public/usage/search-tools.mdx) untuk contoh detail.

---

## Release Branches

Rilis stabil dikirim dari `main` dan dipublikasikan ke npm. `core-dev` dan
`community-edge` adalah branch yang dijalankan dari source untuk perbaikan reliabilitas awal dan
integrasi komunitas. Lihat **[Release Branches](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx)**
untuk alur branch dan instruksi menjalankan versi non-stable.

---

## Persyaratan Sistem

- **Node.js**: 20.0.0 atau lebih tinggi
- **Claude Code**: Versi terbaru dengan dukungan plugin
- **Bun**: JavaScript runtime dan process manager (otomatis diinstal jika tidak ada)
- **uv**: Python package manager untuk pencarian vektor (otomatis diinstal jika tidak ada)
- **SQLite 3**: Untuk penyimpanan persisten (terbundel)

---
### Catatan Pengaturan Windows

Jika Anda melihat error seperti:

```powershell
npm : The term 'npm' is not recognized as the name of a cmdlet
```

Pastikan Node.js dan npm sudah terinstal dan ditambahkan ke PATH Anda. Unduh installer Node.js terbaru dari https://nodejs.org dan restart terminal Anda setelah instalasi.

---

## Konfigurasi

Pengaturan dikelola di `~/.claude-mem/settings.json` (otomatis dibuat dengan default saat pertama kali dijalankan). Konfigurasi model AI, port worker, direktori data, level log, dan pengaturan injeksi konteks.

Lihat **[Panduan Konfigurasi](https://github.com/kejwojew/hummem/blob/main/docs/public/configuration.mdx)** untuk semua pengaturan dan contoh yang tersedia.

### Konfigurasi Mode & Bahasa

Claude-Mem mendukung beberapa mode alur kerja dan bahasa melalui pengaturan `CLAUDE_MEM_MODE`.

Opsi ini mengontrol keduanya:
- Perilaku alur kerja (mis. code, chill, investigation)
- Bahasa yang digunakan dalam observasi yang dihasilkan

#### Cara Konfigurasi

Edit file pengaturan Anda di `~/.claude-mem/settings.json`:

```json
{
  "CLAUDE_MEM_MODE": "code--zh"
}
```

Mode didefinisikan di `plugin/modes/`. Untuk melihat semua mode yang tersedia secara lokal:

```bash
ls ~/.claude/plugins/marketplaces/thedotmack/plugin/modes/
```

#### Mode yang Tersedia

| Mode | Deskripsi |
|------------|-------------------------|
| `code` | Mode Bahasa Inggris default |
| `code--zh` | Mode Bahasa Mandarin Sederhana |
| `code--ja` | Mode Bahasa Jepang |

Mode khusus bahasa mengikuti pola `code--[lang]` di mana `[lang]` adalah kode bahasa ISO 639-1 (mis., `zh` untuk Mandarin, `ja` untuk Jepang, `es` untuk Spanyol).

> Catatan: `code--zh` (Mandarin Sederhana) sudah terintegrasi secara bawaan — tidak diperlukan instalasi tambahan atau pembaruan plugin.

#### Setelah Mengubah Mode

Restart Claude Code untuk menerapkan konfigurasi mode baru.
---

## Pengembangan

Lihat **[Panduan Pengembangan](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx)** untuk instruksi build, testing, dan alur kerja kontribusi.

---

## Pemecahan Masalah

Jika mengalami masalah, jelaskan masalah ke Claude dan troubleshoot skill akan secara otomatis mendiagnosis dan memberikan perbaikan.

Lihat **[Panduan Pemecahan Masalah](https://github.com/kejwojew/hummem/blob/main/docs/public/troubleshooting.mdx)** untuk masalah umum dan solusi.

---

## Laporan Bug

Buat laporan bug yang komprehensif dengan generator otomatis:

```bash
cd ~/.claude/plugins/marketplaces/thedotmack
npm run bug-report
```

## Kontribusi

Kontribusi sangat dipersilakan! Silakan:

1. Fork repositori
2. Buat branch fitur
3. Buat perubahan Anda dengan tes
4. Perbarui dokumentasi
5. Kirim Pull Request

Claude-Mem dikirim dari tiga branch: `main` (stable), `core-dev`, dan
`community-edge`. Hanya `main` yang dipublikasikan ke npm; yang lainnya dijalankan dari
source. Lihat [Release Branches](https://github.com/kejwojew/hummem/blob/main/docs/public/branches.mdx) untuk
strategi dan instruksi menjalankan secara lokal.

Lihat [Panduan Pengembangan](https://github.com/kejwojew/hummem/blob/main/docs/public/development.mdx) untuk alur kerja kontribusi.

---

## Lisensi

Claude-Mem dilisensikan di bawah Apache License 2.0.

Kami memilih Apache-2.0 karena memori agentik yang tahan lama seharusnya mudah untuk disematkan dalam
alat pengembang, agen lokal, server MCP, sistem enterprise, stack robotika,
dan production agent harness.

Lihat file [LICENSE](LICENSE) untuk detail lengkap. Lihat [docs/license.md](docs/license.md)
dan [docs/ip-boundary.md](docs/ip-boundary.md) untuk cakupan lisensi dan batas
open/commercial.

**Catatan tentang Ragtime**: Direktori `ragtime/` dilisensikan di bawah **Apache License 2.0**. Lihat [ragtime/LICENSE](ragtime/LICENSE) untuk detail.

---

## Dukungan

- **Dokumentasi**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kejwojew/hummem/issues)
- **Repositori**: [github.com/kejwojew/hummem](https://github.com/kejwojew/hummem)

---

**Built with Claude Agent SDK** | **Works with Claude Code** | **Made with TypeScript**

---

### Bagaimana dengan CMEM?

CMEM adalah token yang dibuat oleh pihak ketiga tetapi secara resmi diakui oleh pencipta Claude-Mem (Alex Newman, @thedotmack). Token ini berperan sebagai katalisator komunitas untuk pertumbuhan dan wahana untuk membawa CMEM kepada para developer dan pekerja pengetahuan yang paling membutuhkannya.

Official BASE CA: 0x76b1967eec0ccaeb001bbbb2b40dc4badba31ba3