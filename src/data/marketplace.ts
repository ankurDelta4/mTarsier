export type McpCategory =
  | "Developer"
  | "Web"
  | "Data"
  | "Productivity"
  | "AI"
  | "Search"
  | "Automation";

export interface MarketplaceServer {
  id: string;
  name: string;
  description: string;
  publisher: string;
  category: McpCategory;
  command: string;
  args: string[];
  /** Direct SSE/Streamable-HTTP URL for clients that support native remote transport.
   *  Supports the same {param} substitution syntax as args. */
  remoteUrl?: string;
  apiKeys?: { key: string; label: string; hint?: string; required: boolean }[];
  params?: { key: string; label: string; placeholder: string; required: boolean; hint?: string; secret?: boolean }[];
  featured?: boolean;
  official?: boolean;
  docsUrl?: string;
  /** Demo / tutorial videos shown in the card player */
  videos?: { id: string; title: string; type?: "video" | "short" }[];
}

export const CATEGORIES: McpCategory[] = [
  "Developer",
  "Web",
  "Data",
  "Productivity",
  "AI",
  "Search",
  "Automation",
];

export const MARKETPLACE_SERVERS: MarketplaceServer[] = [
  // ── Developer ──────────────────────────────────────────────────────────────
  {
    id: "filesystem",
    name: "Filesystem",
    description:
      "Read and write files on your local filesystem with configurable path-level access control.",
    publisher: "Anthropic",
    category: "Developer",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "{path}"],
    params: [
      {
        key: "path",
        label: "Directory Path",
        placeholder: "/Users/you/projects",
        required: true,
      },
    ],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    videos: [
      { id: "9_6CDKmxumI", title: "This MCP server can manipulate your Desktop - Just 5 minutes to setup", type: "video" as const },
      { id: "8qcH9tboULU", title: "Claude MCP - Filesystem Server | Claude can manage your system files", type: "video" as const },
      { id: "pi4IixtFZhc", title: "Using MCP to provide an LLM access to the filesystem on Fedora Linux", type: "video" as const },
      { id: "lzbbPBLPtdY", title: "Top 10 MCP Use Cases - Using Claude & Model Context Protocol", type: "video" as const },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description:
      "Search repos, read files, manage issues and pull requests via the GitHub API.",
    publisher: "Anthropic",
    category: "Developer",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    apiKeys: [
      {
        key: "GITHUB_PERSONAL_ACCESS_TOKEN",
        label: "GitHub Personal Access Token",
        hint: "Create at github.com/settings/tokens",
        required: true,
      },
    ],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    videos: [
      { id: "OXcS09qn1rc", title: "Github MCP Server in VS Code : Everything Explained with Examples [Demo]", type: "video" as const },
      { id: "0vbdWqVd1aU", title: "Improve Productivity with Claude Code and GitHub MCP", type: "video" as const },
      { id: "S_7bbWWbzW0", title: "2 Cool Ways to use Github MCP", type: "short" as const },
      { id: "LwqUp4Dc1mQ", title: "Extending AI Agents: A live demo of the GitHub MCP Server", type: "video" as const },
    ],
  },
  {
    id: "mcp360",
    name: "MCP360",
    description:
      "Unified MCP gateway giving instant access to 100+ tools through a single API key — integrate once, access everything.",
    publisher: "MCP360",
    category: "AI",
    command: "npx",
    args: ["mcp-remote", "https://connect.mcp360.ai/v1/mcp360/mcp?token={MCP360_TOKEN}"],
    remoteUrl: "https://connect.mcp360.ai/v1/mcp360/mcp?token={MCP360_TOKEN}",
    params: [
      {
        key: "MCP360_TOKEN",
        label: "MCP360 API Key",
        placeholder: "mcp360_...",
        required: true,
        hint: "Generate at dashboard.mcp360.ai",
        secret: true,
      },
    ],
    featured: true,
    docsUrl: "https://mcp360.ai/docs",
    videos: [
      { id: "7y8lzoaI_04", title: "MCP made EASY: 3 REAL MCP Workflows That ACTUALLY Make Money (MCP360)", type: "video" as const },
      { id: "7yr-Z95oPUI", title: "Bulk Lead & Email Verification Using AI MCP360 | Full Automation Demo", type: "video" as const },
      { id: "_ATqVSwubW4", title: "Amazon Price Monitoring System with N8N x MCP360", type: "video" as const },
    ],
  },
  {
    id: "git",
    name: "Git",
    description:
      "Read git repository history, diffs, and logs from local repos.",
    publisher: "Anthropic",
    category: "Developer",
    command: "uvx",
    args: ["mcp-server-git"],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    videos: [  ],
  },
  {
    id: "sentry",
    name: "Sentry",
    description:
      "Query Sentry issues, events, and performance data across your projects.",
    publisher: "Sentry",
    category: "Developer",
    command: "uvx",
    args: ["mcp-server-sentry"],
    apiKeys: [
      {
        key: "SENTRY_AUTH_TOKEN",
        label: "Sentry Auth Token",
        hint: "Generate at sentry.io → Settings → Auth Tokens",
        required: true,
      },
    ],
    docsUrl: "https://github.com/getsentry/sentry-mcp",
    videos: [
      { id: "smQ1NRhmvng", title: "It broke... lets fix it with Sentry MCP and Seer (Live Debugging)", type: "video" as const },
      { id: "YsuHW258Yl8", title: "Debugging With Sentry's MCP", type: "video" as const },
      { id: "-GMmoXbU004", title: "Configuring and Using the Sentry MCP Server", type: "video" as const },
      { id: "wnma-S_NT40", title: "Sentry MCP Server Overview", type: "short" as const },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    description:
      "Manage Workers, KV, R2, D1, and more on Cloudflare via browser OAuth.",
    publisher: "Cloudflare",
    category: "Developer",
    command: "npx",
    args: ["mcp-remote@latest", "https://modelcontextprotocol.cloudflare.com/sse"],
    docsUrl: "https://developers.cloudflare.com/mcp-server",
    videos: [
      { id: "vGajZpl_9yA", title: "Getting Started with the Cloudflare MCP server and Anthropic's Claude (Workers/KV Demo)", type: "video" as const },
      { id: "CoQvJ6Yrc8k", title: "The QUICKEST Way to Create MCP Servers (n8n + cloudflare)", type: "video" as const },
      { id: "Pjc8cC8zVRY", title: "Build your own remote MCP Server with Cloudflare", type: "video" as const },
    ],
  },
  {
    id: "desktop-commander",
    name: "Desktop Commander",
    description:
      "Execute terminal commands, manage processes, and edit files on your desktop.",
    publisher: "wonderwhy-er",
    category: "Developer",
    command: "npx",
    args: ["-y", "@wonderwhy-er/desktop-commander@latest"],
    docsUrl: "https://github.com/wonderwhy-er/DesktopCommanderMCP",
    videos: [
      { id: "eiucsyr8B5w", title: "I Let Claude AI Organize 1,000+ Files on My Desktop (Desktop Commander MCP)", type: "video" as const },
      { id: "KddUrxF_TmE", title: "Claude + Desktop Commander MCP = Self improving coding agent", type: "video" as const },
      { id: "ZG3SdmP4EUs", title: "Desktop Commander: An MCP Server for AI PC Control (Testing Use Cases)", type: "video" as const },
    ],
  },

  {
    id: "figma",
    name: "Figma",
    description:
      "Read Figma design files, extract component properties, styles, variables, and assets for development handoff.",
    publisher: "Figma",
    category: "Developer",
    command: "npx",
    args: ["-y", "figma-developer-mcp", "--stdio"],
    apiKeys: [
      {
        key: "FIGMA_API_KEY",
        label: "Figma Personal Access Token",
        hint: "Create at figma.com → Settings → Security → Personal Access Tokens",
        required: true,
      },
    ],
    docsUrl: "https://github.com/figma/figma-developer-mcp",
    videos: [
      { id: "yO3Wr7DEWF0", title: "The OFFICIAL Figma MCP Server - TUTORIAL & DEMO", type: "video" as const },
      { id: "jr7lupPmYEg", title: "Figma tutorial: How to set up Figma remote MCP server", type: "video" as const },
      { id: "Cq-7lFMNESk", title: "How to setup the desktop Figma MCP server in your code editors", type: "video" as const },
      { id: "s7BZz03icnY", title: "What is the Figma MCP server? (Deep Dive)", type: "video" as const },
    ],
  },
  {
    id: "excalidraw",
    name: "Excalidraw",
    description:
      "Create and update collaborative whiteboard diagrams, flowcharts, and sketches using Excalidraw.",
    publisher: "Excalidraw",
    category: "Developer",
    featured: true,
    command: "npx",
    args: ["-y", "excalidraw-mcp"],
    docsUrl: "https://github.com/excalidraw/excalidraw-mcp",
    videos: [
      { id: "2YW5Q3tCl2Q", title: "How to Use Excalidraw MCP in Claude AI | Claude MCP + Excalidraw = Instant AI Architecture Diagrams", type: "video" as const },
      { id: "RRN7AF7QIew", title: "Cursor Drawing Real-Time Diagrams with MCP Excalidraw", type: "video" as const }
      ],
  },
  {
    id: "jfrog",
    name: "JFrog",
    description:
      "Search Artifactory repositories, manage artifacts, and query Xray security vulnerability scan results.",
    publisher: "JFrog",
    category: "Developer",
    command: "npx",
    args: ["-y", "@jfrog/mcp-server"],
    apiKeys: [
      {
        key: "JFROG_URL",
        label: "JFrog Platform URL",
        hint: "Your JFrog instance URL (e.g. https://yourcompany.jfrog.io)",
        required: true,
      },
      {
        key: "JFROG_ACCESS_TOKEN",
        label: "JFrog Access Token",
        hint: "Generate at your JFrog instance → User Profile → Access Tokens",
        required: true,
      },
    ],
    docsUrl: "https://github.com/jfrog/mcp-jfrog",
    videos: [
      { id: "onVR0w-h9FI", title: "JFrog MCP server example", type: "video" as const },
    ],
  },
  {
    id: "snyk",
    name: "Snyk",
    description:
      "Scan code, open-source dependencies, containers, and IaC for security vulnerabilities.",
    publisher: "Snyk",
    category: "Developer",
    command: "npx",
    args: ["-y", "snyk-mcp"],
    apiKeys: [
      {
        key: "SNYK_TOKEN",
        label: "Snyk Auth Token",
        hint: "Get your token at app.snyk.io → Account Settings",
        required: true,
      },
    ],
    docsUrl: "https://github.com/snyk/snyk-mcp",
    videos: [
      { id: "50tkvZhOVqM", title: "How to Add MCP Servers to VS Code (with GitHub Copilot)", type: "video" as const },
      { id: "exGudnPb9Bo", title: "How to Add MCP Servers to Windsurf (Snyk Official Demo)", type: "video" as const },
      { id: "sHQrgZ5IsTA", title: "Secure at Inception for AI with Snyk (Snyk MCP in Cursor Deep Dive)", type: "video" as const },
    ],
  },

  // ── Web ────────────────────────────────────────────────────────────────────
  {
    id: "fetch",
    name: "Fetch",
    description:
      "Fetch web pages and convert them to Markdown for easy AI consumption and analysis.",
    publisher: "Anthropic",
    category: "Web",
    command: "uvx",
    args: ["mcp-server-fetch"],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    videos: [
      { id: "wZw1k72Oe4k", title: "Claude MCP - Fetch Server | Browse Web | Episode #3", type: "video" as const },
      { id: "aD0PlBawA8M", title: "MCP Use Case: Manage Documentation Drift with Fetch MCP Server + ToolHive", type: "video" as const },
      { id: "_cw563mJMVg", title: "How to set up the Fetch MCP Server in Amazon Kiro", type: "video" as const },
    ],
  },
  {
    id: "puppeteer",
    name: "Puppeteer",
    description:
      "Control a headless Chrome browser for web scraping and UI automation.",
    publisher: "Anthropic",
    category: "Web",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    videos: [
      { id: "kYdD4Eu7AEw", title: "Automation Testing with Claude AI - Puppeteer MCP Server", type: "video" as const },
      { id: "cJmZAoVZbvM", title: "2 minutes to set up a local Puppeteer MCP Server", type: "short" as const },
      { id: "h62k37-p-44", title: "Power BI Interface Testing with MCP", type: "video" as const },
    ],
  },
  {
    id: "playwright",
    name: "Playwright",
    description:
      "Automate browsers for testing and scraping across Chrome, Firefox, and WebKit.",
    publisher: "Microsoft",
    category: "Web",
    command: "npx",
    args: ["-y", "@playwright/mcp@latest"],
    featured: true,
    docsUrl: "https://github.com/microsoft/playwright-mcp",
    videos: [
      { id: "U5Hsa6s2EqE", title: "Playwright MCP Severs Explained: Automation and Testing", type: "video" as const },
      { id: "AaCj939XIQ4", title: "How to Generate Playwright Tests using MCP + Copilot", type: "video" as const },
      { id: "exsikHe20D8", title: "Install an MCP Server in VS Code", type: "video" as const },
      { id: "Sh9D3lQs3A8", title: "Automate debugging with the Playwright MCP server", type: "video" as const },
    ],
  },

  // ── AI ─────────────────────────────────────────────────────────────────────
  {
    id: "llm-prompt-tracker",
    name: "LLM Prompt Tracker",
    description:
      "Track and compare prompt visibility and rankings across AI platforms — ChatGPT, Claude, Perplexity, Grok, and Gemini.",
    publisher: "MCP360",
    category: "AI",
    command: "npx",
    args: ["mcp-remote", "https://connect.mcp360.ai/v1/llm-prompt-tracker/mcp?token={MCP360_TOKEN}"],
    remoteUrl: "https://connect.mcp360.ai/v1/llm-prompt-tracker/mcp?token={MCP360_TOKEN}",
    params: [
      {
        key: "MCP360_TOKEN",
        label: "MCP360 API Key",
        placeholder: "mcp360_...",
        required: true,
        hint: "Generate at dashboard.mcp360.ai",
        secret: true,
      },
    ],
    docsUrl: "https://mcp360.ai/mcps/llm-prompt-tracker",
  },
  {
    id: "memory",
    name: "Memory",
    description:
      "Persistent knowledge graph memory with entity and relation tracking across conversations.",
    publisher: "Anthropic",
    category: "AI",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
    featured: true,
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    videos: [
      { id: "qeru0ZdudD4", title: "Unlock Claude's Memory: Knowledge Graph MCP Server Tutorial", type: "video" as const },
    ],
  },
  {
    id: "sequential-thinking",
    name: "Sequential Thinking",
    description:
      "Dynamic, reflective problem solving through structured, adaptive thought sequences.",
    publisher: "Anthropic",
    category: "AI",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
    videos: [
      { id: "R-5ucM-5P5o", title: "Sequential Thinking MCP Server Makes Claude Even More Powerful than Perplexity!", type: "video" as const },
      { id: "RnIOTEF7Zqg", title: "Model Context Protocol (MCP) Server setup in Cursor", type: "video" as const },
      { id: "BLbQWePxlX4", title: "How to Set Up MCP Servers in VSCode for Copilot", type: "video" as const },
    ],
  },
  {
    id: "context7",
    name: "Context7",
    description:
      "Fetch up-to-date library documentation and code examples directly from the source.",
    publisher: "Upstash",
    category: "AI",
    command: "npx",
    args: ["-y", "@upstash/context7-mcp@latest"],
    docsUrl: "https://github.com/upstash/context7",
    videos: [
      { id: "WkngXqlFlbI", title: "Context7 MCP Tutorial | Upstash AI Agent for Accurate Docs & Code", type: "video" as const },
      { id: "Tk4y63IsA4s", title: "Make AI Use Live Documentation with Context7 MCP", type: "video" as const },
      { id: "323l56VqJQw", title: "Context7 MCP Tutorial: Get Instant RAG for Your AI Coders", type: "video" as const },
    ],
  },

  // ── Data ───────────────────────────────────────────────────────────────────
  {
    id: "postgres",
    name: "PostgreSQL",
    description:
      "Query PostgreSQL databases with schema inspection and safe read-only SQL execution.",
    publisher: "Anthropic",
    category: "Data",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres", "{database_url}"],
    params: [
      {
        key: "database_url",
        label: "Database URL",
        placeholder: "postgresql://user:pass@localhost/mydb",
        required: true,
      },
    ],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    videos: [
      { id: "egcukU_-oHM", title: "The pgEdge MCP Server for PostgreSQL", type: "video" as const },
      { id: "tbrR21I3jJI", title: "Hunting dbt Bugs with Postgres MCP and Cursor AI", type: "video" as const },
      { id: "Dol454jBeKQ", title: "How To Use Postgres MCP and Playwright MCP Server with Salesforce", type: "video" as const },
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    description:
      "Manage Supabase projects, query databases, and invoke Edge Functions via MCP.",
    publisher: "Supabase",
    category: "Data",
    command: "npx",
    args: ["-y", "@supabase/mcp-server-supabase@latest"],
    apiKeys: [
      {
        key: "SUPABASE_ACCESS_TOKEN",
        label: "Supabase Access Token",
        hint: "Generate at app.supabase.com → Account → Access Tokens",
        required: true,
      },
    ],
    docsUrl: "https://github.com/supabase-community/supabase-mcp",
    videos: [
      { id: "98bQdapCtq4", title: "My new FAVORITE way to use Supabase", type: "video" as const },
      { id: "wa9-d63velk", title: "Supabase MCP with Cursor — Step-by-step Guide", type: "video" as const },
      { id: "9P41KXJFwxc", title: "Windsurf + Supabase MCP", type: "video" as const },
    ],
  },

  {
    id: "redis",
    name: "Redis",
    description:
      "Interact with Redis — get/set keys, manage streams, search indexes, and run commands against your cache.",
    publisher: "Redis",
    category: "Data",
    command: "npx",
    args: ["-y", "@redis/mcp-server"],
    apiKeys: [
      {
        key: "REDIS_URL",
        label: "Redis Connection URL",
        hint: "Connection string, e.g. redis://user:pass@localhost:6379",
        required: true,
      },
    ],
    docsUrl: "https://github.com/redis/mcp-redis",
  },
  {
    id: "posthog",
    name: "PostHog",
    description:
      "Query product analytics — events, funnels, session recordings, feature flags, and A/B test results.",
    publisher: "PostHog",
    category: "Data",
    command: "npx",
    args: ["-y", "posthog-mcp"],
    apiKeys: [
      {
        key: "POSTHOG_API_KEY",
        label: "PostHog Personal API Key",
        hint: "Create at app.posthog.com → Settings → Personal API Keys",
        required: true,
      },
    ],
    docsUrl: "https://github.com/PostHog/mcp-server",
    videos: [
      { id: "l7IXtdDZCYA", title: "How to use the PostHog MCP in v0 by Vercel (Feature Flags & A/B Testing)", type: "video" as const },
      { id: "HTOpmfb0UG4", title: "PostHog MCP + Replit: How PostHog AI debugged my production error", type: "video" as const },
      { id: "V3RDy-1PbBI", title: "(A Better) Agentic CRO via MCP Using PostHog", type: "video" as const },
      { id: "bddwtGnUUC8", title: "Claude Code + MCP + Posthog is a dream for product managers", type: "video" as const },
    ],
  },
  {
    id: "datadog",
    name: "Datadog",
    description:
      "Query metrics, logs, traces, monitors, dashboards, and incidents from your Datadog observability stack.",
    publisher: "Datadog",
    category: "Data",
    command: "npx",
    args: ["-y", "@datadog/mcp-server"],
    apiKeys: [
      {
        key: "DD_API_KEY",
        label: "Datadog API Key",
        hint: "Find at app.datadoghq.com → Organization Settings → API Keys",
        required: true,
      },
      {
        key: "DD_APP_KEY",
        label: "Datadog Application Key",
        hint: "Find at app.datadoghq.com → Organization Settings → Application Keys",
        required: true,
      },
    ],
    docsUrl: "https://github.com/DataDog/datadog-mcp-server",
    videos: [
      { id: "zpRf97Pw8QE", title: "Debug live production issues with the Datadog Cursor extension", type: "video" as const },
      { id: "41z_6J0CbEc", title: "Real-Time Telemetry in Development: Using MCP and Datadog for AI-Assisted Coding", type: "video" as const },
      { id: "qSSxK0jpXfk", title: "Using the Datadog MCP with Devin", type: "short" as const },
    ],
  },
  {
    id: "grafana",
    name: "Grafana",
    description:
      "Query Grafana dashboards, panels, alerts, datasources, and Grafana OnCall schedules.",
    publisher: "Grafana Labs",
    category: "Data",
    command: "npx",
    args: ["-y", "@grafana/mcp-server"],
    apiKeys: [
      {
        key: "GRAFANA_URL",
        label: "Grafana Instance URL",
        hint: "Your Grafana URL (e.g. https://grafana.yourcompany.com)",
        required: true,
      },
      {
        key: "GRAFANA_API_KEY",
        label: "Grafana Service Account Token",
        hint: "Create at your Grafana instance → Administration → Service Accounts",
        required: true,
      },
    ],
    docsUrl: "https://github.com/grafana/mcp-grafana",
    videos: [
      { id: "UNyYgCNpx4A", title: "Visualize Grafana data with MCP Server | Cursor AI | Claude | Zed | Tutorial", type: "video" as const },
      { id: "U7uMnRBODjY", title: "Step by Step Setup of Grafana MCP Server | Automating Dashboards, Alerts with MCP & Agents", type: "video" as const },
      { id: "6b94tox6Wk0", title: "Grafana Campfire 🔥 - Using the Grafana MCP Server (Grafana Community Call)", type: "video" as const },
    ],
  },

  // ── Search ─────────────────────────────────────────────────────────────────
  {
    id: "brave-search",
    name: "Brave Search",
    description:
      "Search the web with Brave's independent index — privacy-respecting, no filter bubbles.",
    publisher: "Anthropic",
    category: "Search",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    apiKeys: [
      {
        key: "BRAVE_API_KEY",
        label: "Brave Search API Key",
        hint: "Get your key at brave.com/search/api",
        required: true,
      },
    ],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    videos: [
      { id: "b1J0jaS6mTQ", title: "7 MCP Servers That Turn AI Into a Real Developer Assistant", type: "video" as const },
      { id: "RxXS_FpJyGM", title: "The NEW N8N MCP is an Absolute Game-Changer (Brave Search MCP)", type: "video" as const },
      { id: "CFz2eDjRfqU", title: "How to Add MCP Servers to Kiro (Amazon)", type: "video" as const },
    ],
  },
  {
    id: "google-maps",
    name: "Google Maps",
    description:
      "Geocoding, directions, place search, and distance matrix via the Google Maps API.",
    publisher: "Google",
    category: "Search",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-google-maps"],
    apiKeys: [
      {
        key: "GOOGLE_MAPS_API_KEY",
        label: "Google Maps API Key",
        hint: "Create at console.cloud.google.com",
        required: true,
      },
    ],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps",
    videos: [
      { id: "mO0pCU7pkeQ", title: "Improving OpenAI Agents with GoogleMaps MCP", type: "video" as const },
      { id: "EF6LLGR9k0I", title: "Build Your First MCP Server with Google Maps & VS Code", type: "video" as const },
      { id: "tzrwxLNHtRY", title: "Model Context Protocol Clearly Explained | MCP Beyond the Hype", type: "video" as const },
    ],
  },

  {
    id: "onpage-seo",
    name: "OnPage SEO Checker",
    description:
      "Comprehensive on-page SEO analysis — check title tags, meta descriptions, headings, images, links, mobile optimization, performance, and structured data.",
    publisher: "MCP360",
    category: "Search",
    command: "npx",
    args: ["mcp-remote", "https://connect.mcp360.ai/v1/onpage-seo/mcp?token={MCP360_TOKEN}"],
    remoteUrl: "https://connect.mcp360.ai/v1/onpage-seo/mcp?token={MCP360_TOKEN}",
    params: [
      {
        key: "MCP360_TOKEN",
        label: "MCP360 API Key",
        placeholder: "mcp360_...",
        required: true,
        hint: "Generate at dashboard.mcp360.ai",
        secret: true,
      },
    ],
    docsUrl: "https://mcp360.ai/mcps/onpage-seo",
  },
  {
    id: "keyword-research",
    name: "Keyword Research Tools",
    description:
      "Get global search volumes and related keyword suggestions for SEO and content planning.",
    publisher: "MCP360",
    category: "Search",
    command: "npx",
    args: ["mcp-remote", "https://connect.mcp360.ai/v1/keyword-research/mcp?token={MCP360_TOKEN}"],
    remoteUrl: "https://connect.mcp360.ai/v1/keyword-research/mcp?token={MCP360_TOKEN}",
    params: [
      {
        key: "MCP360_TOKEN",
        label: "MCP360 API Key",
        placeholder: "mcp360_...",
        required: true,
        hint: "Generate at dashboard.mcp360.ai",
        secret: true,
      },
    ],
    docsUrl: "https://mcp360.ai/mcps/keyword-research",
  },

  // ── Productivity ───────────────────────────────────────────────────────────
  {
    id: "slack",
    name: "Slack",
    description:
      "Read channels, post messages, and search Slack workspaces via the Slack API.",
    publisher: "Anthropic",
    category: "Productivity",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    apiKeys: [
      {
        key: "SLACK_BOT_TOKEN",
        label: "Slack Bot Token",
        hint: "From api.slack.com → Apps → OAuth & Permissions",
        required: true,
      },
      {
        key: "SLACK_TEAM_ID",
        label: "Slack Team ID",
        hint: "Found in your workspace URL (e.g. T01234ABC)",
        required: true,
      },
    ],
    official: true,
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    videos: [
      { id: "v41T64yiy8w", title: "Build a Slack AI agent with MCP server that sends replies/DMs and so much more", type: "video" as const },
      { id: "nlehKmz5Myg", title: "Security Advisory: Anthropic's Slack MCP Server Can Leak Your Data", type: "video" as const },
      { id: "DWe5kHY5TGQ", title: "Slack MCP in Action: With Zencoder", type: "video" as const },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "Read pages, search databases, and retrieve blocks from your Notion workspace.",
    publisher: "Notion",
    category: "Productivity",
    command: "npx",
    args: ["-y", "@notionhq/notion-mcp-server"],
    apiKeys: [
      {
        key: "NOTION_API_KEY",
        label: "Notion API Key",
        hint: "Create an integration at notion.so/my-integrations",
        required: true,
      },
    ],
    docsUrl: "https://github.com/makenotion/notion-mcp-server",
    videos: [
      { id: "-NJ4A6rQm_s", title: "MCP + Notion: The Ultimate PM Workflow Tutorial", type: "video" as const },
      { id: "-fCN0tqgHV8", title: "How to Setup a Notion MCP Server with VS Code and GitHub Copilot", type: "video" as const },
      { id: "xVwLy523L0g", title: "Augment Tutorial: Seamless Notion Integration via URL", type: "video" as const },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    description:
      "Query and update Linear issues, projects, and teams from your workspace.",
    publisher: "Linear",
    category: "Productivity",
    command: "npx",
    args: ["-y", "@linear/mcp-server"],
    apiKeys: [
      {
        key: "LINEAR_API_KEY",
        label: "Linear API Key",
        hint: "Generate at linear.app → Settings → API",
        required: true,
      },
    ],
    docsUrl: "https://github.com/linear/linear-mcp",
    videos: [
      { id: "G_1SQFu_bZY", title: "10X Your Vibe Coding With One MCP Server", type: "video" as const },
      { id: "FbQpNMq4FOc", title: "Touchlab Linear MCP Server", type: "video" as const },
      { id: "ln7tQzrB7r8", title: "Linear MCP: an AI Project Manager", type: "video" as const },
    ],
  },

  // ── Automation ─────────────────────────────────────────────────────────────
  {
    id: "stripe",
    name: "Stripe",
    description:
      "Manage Stripe payments, customers, subscriptions, and webhook events programmatically.",
    publisher: "Stripe",
    category: "Automation",
    command: "npx",
    args: ["-y", "@stripe/mcp-server"],
    apiKeys: [
      {
        key: "STRIPE_SECRET_KEY",
        label: "Stripe Secret Key",
        hint: "Find at dashboard.stripe.com → Developers → API Keys",
        required: true,
      },
    ],
    docsUrl: "https://github.com/stripe/agent-toolkit",
    videos: [
      { id: "rtGlC0-GuJw", title: "Multiple Ways to Use MCPs with Stripe", type: "video" as const },
      { id: "QLwJKW9Qv9c", title: "Build a Complete Stripe MCP Server with AI Agent Integration | n8n Tutorial", type: "video" as const },
      { id: "uVVk3pR4XdU", title: "How To Connect Stripe MCP to Claude (Step-by-step)", type: "video" as const },
    ],
  },
];
