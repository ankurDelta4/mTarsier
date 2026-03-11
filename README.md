# mTarsier

[![mTarsier — MCP Management, without the chaos.](https://raw.githubusercontent.com/mcp360/mTarsier/main/src/assets/mtarsier-readme-banner.svg)](https://mcp360.ai/mtarsier)

**MCP Management, without the chaos.**

mTarsier is an open-source platform for managing MCP servers and clients — so Claude, Cursor, VS Code and every AI tool you use always has the right MCP connections, without the chaos.

> Named after the Tarsier — a primate with 180° vision that sees everything around it.

---

## Features

- **Unified Dashboard** — all MCP servers across every client in one view
- **Client Detection** — auto-detects Claude Desktop, Cursor, Windsurf, VS Code, and more
- **Config Editor** — read/write config files with syntax highlighting and live JSON validation
- **Marketplace** — browse and install MCP servers into any client in a few clicks
- **CLI Tool** — `tsr` command for terminal-based management
- **Auto-backup** — backs up configs before every change with one-click rollback
- **Multi-theme** — dark biopunk, light, and system themes

---

## Supported Clients

| Client | Type | Config |
|---|---|---|
| Claude Desktop | Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| ChatGPT Desktop | Desktop | Web-managed |
| Codex | Desktop | `~/.codex/config.toml` |
| GitHub Copilot (VS Code) | IDE | `~/Library/Application Support/Code/User/mcp.json` |
| Cursor | IDE | `~/.cursor/mcp.json` |
| Windsurf | IDE | `~/.codeium/windsurf/mcp_config.json` |
| VS Code | IDE | `~/Library/Application Support/Code/User/mcp.json` |
| Antigravity | IDE | `~/.antigravity/mcp.json` |
| Claude Code | CLI | `~/.claude.json` |
| GitHub Copilot CLI | CLI | `~/.copilot/mcp-config.json` |
| Gemini CLI | CLI | `~/.gemini/settings.json` |
| Codex CLI | CLI | `~/.codex/config.toml` |
| Open Code | CLI | `~/.opencode/config.json` |
| Claude (web) | Web | Remote only |
| ChatGPT (web) | Web | Remote only |

---

## Installation

Grab the latest release from the [Releases](https://github.com/mcp360/mTarsier/releases/latest) page:

| Platform | File |
|---|---|
| macOS Apple Silicon | `mTarsier_*_aarch64.dmg` |
| macOS Intel | `mTarsier_*_x64.dmg` |
| Windows | `mTarsier_*_x64-setup.exe` |
| Linux | `mTarsier_*_amd64.AppImage` / `mTarsier_*_amd64.deb` |

### Homebrew (coming soon)

```bash
brew install mcp360/tap/tsr
```

---

## CLI — `tsr`

Install from the app: **Settings → CLI Tool → Install tsr CLI**

```bash
$ tsr list
  filesystem      → Claude Desktop, Cursor, Windsurf
  brave-search    → Claude Desktop
  github          → Cursor, Windsurf

$ tsr clients
  ✓  claude-desktop   ~/Library/Application Support/Claude/...
  ✓  cursor           ~/.cursor/mcp.json
  ✓  windsurf         ~/.codeium/windsurf/mcp_config.json

$ tsr install brave-search   # install from marketplace
$ tsr config cursor --edit   # open config in $EDITOR
$ tsr ping <name>            # ping a server
```

> Full command implementations are in progress.

---

## Building from Source

### Prerequisites

- [Rust](https://rustup.rs) (1.77+)
- [Node.js](https://nodejs.org) (20+)
- [pnpm](https://pnpm.io)
- Tauri v2 system dependencies — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Steps

```bash
git clone https://github.com/mcp360/mTarsier.git
cd mTarsier
pnpm install

# Prepare the tsr sidecar binary (required once before dev)
cd src-tauri && bash scripts/prepare-sidecar.sh && cd ..

pnpm tauri dev    # development
pnpm tauri build  # production
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop framework | Tauri v2 |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Build | Vite |
| Backend | Rust |
| CLI | `tsr` (Rust + clap) |

---

## Contributing

Contributions are welcome. Please open an issue before submitting a large pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Maintainers:** [@0fficialRohit](https://x.com/0fficialRohit) · [@rege_dev](https://x.com/rege_dev)

---

## License

MIT — see [LICENSE](LICENSE)

---

## Conservation

Tarsier, one of the world's smallest and most endangered primates — [learn more](https://www.iucnredlist.org/search?query=tarsius).
