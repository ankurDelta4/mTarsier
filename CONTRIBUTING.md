# Contributing to mTarsier

Thanks for your interest in contributing! mTarsier is open source and welcomes contributions of all kinds — bug fixes, new client support, marketplace additions, UI improvements, and docs.

## Before You Start

- **For small fixes** (typos, bug fixes, minor UI tweaks) — open a PR directly.
- **For larger changes** (new features, architectural changes, new clients) — open an issue first so we can align before you invest time.

## Setting Up Locally

### Prerequisites

- [Rust](https://rustup.rs) 1.77+
- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io)
- Tauri v2 system dependencies — [see Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Steps

```bash
# Clone the repo
git clone https://github.com/mcp360/mtarsier.git
cd mtarsier

# Install frontend dependencies
pnpm install

# Build the tsr sidecar binary (required once before dev)
cd src-tauri && bash scripts/prepare-sidecar.sh && cd ..

# Start dev mode
pnpm tauri dev
```

> Re-run `prepare-sidecar.sh` any time you change Rust code in the CLI binary.

## Project Structure

```
src/                    # React frontend (TypeScript + Tailwind v4)
  pages/                # Full-page views
  components/           # UI components
  store/                # Zustand state stores
  lib/                  # Client registry, utilities
  data/                 # Marketplace server definitions
src-tauri/src/          # Rust backend
  commands/             # Tauri commands (config, clients, audit, etc.)
  bin/tsr.rs            # CLI binary entry point
```

## Code Conventions

### Frontend (TypeScript / React)

- Use Tailwind CSS design tokens — never hardcode hex colors
- Keep components under 150 lines — extract if larger
- Wrap all `invoke()` calls in try/catch
- Use Zustand stores for shared state; local `useState` for component-only state

### Rust

- Never use `unwrap()` — use `?` or `map_err`
- All Tauri commands must return `Result<T, String>`
- New commands must be registered in both `commands/mod.rs` **and** `lib.rs`
- Handle `~` path expansion for macOS, Windows, and Linux

## Adding a New MCP Client

1. Add an entry to `src/lib/clients.ts` → `CLIENT_REGISTRY`
2. Provide `configPath`, `configPathWin`, `configPathLinux`, `configKey`, `configFormat`, and `detection`
3. Verify detection works on at least macOS or Windows
4. Test config read/write in the Config page

## Adding a Marketplace Server

1. Add an entry to `src/data/marketplace.ts` → `MARKETPLACE_SERVERS`
2. Include `id`, `name`, `description`, `publisher`, `category`, `installCommand`, and optionally `docsUrl`
3. Use `{MCP360_TOKEN}` as a placeholder for API keys where applicable

## Pull Requests

- Keep PRs focused — one thing per PR
- Test your change manually before submitting
- Fill in the PR template

## Reporting Issues

- Bugs → use the [Bug Report](https://github.com/mcp360/mtarsier/issues/new) issue template
- New client requests → [Client Request](https://github.com/mcp360/mtarsier/issues/new?template=client-request.md)
- New server requests → [Server Request](https://github.com/mcp360/mtarsier/issues/new?template=server-request.md)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
