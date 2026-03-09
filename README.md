# mTarsier

**Full visibility for your MCP ecosystem.**

mTarsier is an open-source desktop app that makes adopting the [Model Context Protocol](https://modelcontextprotocol.io) easy. It detects every MCP client you have installed, lets you edit their configs in one place, and helps you discover and install new MCP servers — all without touching a config file manually.

Named after the Tarsier — a primate with 180° vision that sees everything around it.

> Official desktop companion to [MCP360](https://mcp360.ai) — a unified MCP gateway for 100+ tools.

---

## Features

- **Dashboard** — overview of all detected clients and installed servers
- **Client detection** — automatically detects which MCP clients are installed on your machine
- **Config editor** — read and write config files for every client with syntax highlighting and JSON validation
- **Marketplace** — browse and install MCP servers into any client in a few clicks
- **CLI tool** — `tsr` command for managing MCP servers from your terminal
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
| Claude Code | CLI | `~/.claude.json` |
| GitHub Copilot CLI | CLI | `~/.copilot/mcp-config.json` |
| Gemini CLI | CLI | `~/.gemini/settings.json` |
| Codex CLI | CLI | `~/.codex/config.toml` |
| Claude (web) | Web | Remote only |
| ChatGPT (web) | Web | Remote only |

---

## Installation

### Download

Grab the latest release for your platform from the [Releases](https://github.com/mcp360/mtarsier/releases) page:

- **macOS** — `.dmg`
- **Windows** — `.msi`
- **Linux** — `.AppImage` / `.deb`

### Homebrew (coming soon)

```bash
brew install mcp360/tap/tsr
```

---

## CLI — `tsr`

mTarsier ships a CLI tool called `tsr` for managing MCP servers from your terminal.

**Install it from the app:** Settings → CLI Tool → Install tsr CLI

Or build from source (see below) — the binary ends up at `src-tauri/target/debug/tsr`.

```bash
tsr --help

tsr list                        # list all MCP servers across configured clients
tsr clients                     # list detected MCP clients
tsr config <client-id>          # show config path for a client
tsr config <client-id> --edit   # open config in $EDITOR
tsr add <name> <url>            # add a new MCP server
tsr ping <name>                 # ping a server
tsr install <mcp-name>          # install an MCP from the marketplace
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
# Clone
git clone https://github.com/mcp360/mtarsier.git
cd mtarsier

# Install frontend dependencies
pnpm install

# Prepare the tsr sidecar binary (required once before dev)
cd src-tauri && bash scripts/prepare-sidecar.sh && cd ..

# Run in development
pnpm tauri dev

# Build for production
pnpm tauri build
```

The `prepare-sidecar.sh` script builds the `tsr` binary and copies it to `src-tauri/binaries/tsr-{target-triple}` so Tauri can bundle it with the app. It runs automatically during `tauri build` via `beforeBundleCommand`.

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

Contributions are welcome. Please open an issue before submitting a large pull request.

```bash
# After making changes, verify the build
pnpm tauri build
```

---

## License

MIT — see [LICENSE](LICENSE)

---

## Conservation

Named after the Tarsier, one of the world's smallest primates. Tarsiers are endangered.
We support conservation efforts — [learn more](https://www.iucnredlist.org/search?query=tarsius).
