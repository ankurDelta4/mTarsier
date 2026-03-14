export type ParsedServer = {
  name: string;
  data: Record<string, unknown>;
};

export type ParseResult =
  | { ok: true; servers: ParsedServer[] }
  | { ok: false; error: string };

// All known config wrapper keys across clients
const WRAPPER_KEYS = ["mcpServers", "mcp", "servers", "mcp_servers"] as const;

/** Validates a single server entry has the required fields in the correct shape. */
function validateEntry(entry: Record<string, unknown>): string | null {
  const hasCommand = "command" in entry;
  const hasUrl = "url" in entry;

  if (!hasCommand && !hasUrl)
    return 'Missing required field "command" (stdio) or "url" (http/sse)';
  if (hasCommand && typeof entry.command !== "string")
    return '"command" must be a string';
  if (hasUrl && typeof entry.url !== "string")
    return '"url" must be a string';
  if ("args" in entry && !Array.isArray(entry.args))
    return '"args" must be an array';
  if ("env" in entry && (typeof entry.env !== "object" || Array.isArray(entry.env) || entry.env === null))
    return '"env" must be an object';
  if ("auth" in entry && (typeof entry.auth !== "object" || Array.isArray(entry.auth) || entry.auth === null))
    return '"auth" must be an object';
  return null;
}

function extractFromMap(map: unknown): ParseResult | null {
  if (typeof map !== "object" || map === null || Array.isArray(map)) return null;
  const servers: ParsedServer[] = [];
  for (const [name, value] of Object.entries(map as Record<string, unknown>)) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
      continue;
    const entry = value as Record<string, unknown>;
    const err = validateEntry(entry);
    if (err) return { ok: false, error: `Server "${name}": ${err}` };
    servers.push({ name, data: entry });
  }
  return servers.length > 0 ? { ok: true, servers } : null;
}

export function parseMcpPaste(text: string): ParseResult {
  let obj: Record<string, unknown>;
  try {
    const parsed = JSON.parse(text.trim());
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return { ok: false, error: "Expected a JSON object" };
    obj = parsed as Record<string, unknown>;
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  // 1. Config wrapper: { mcpServers: { ... } }, { mcp: { ... } }, etc.
  for (const key of WRAPPER_KEYS) {
    if (key in obj) {
      const result = extractFromMap(obj[key]);
      if (result) return result;
    }
  }

  // 2. Bare entry: { "command": "npx", "args": [...] }
  if ("command" in obj || "url" in obj) {
    const err = validateEntry(obj);
    if (err) return { ok: false, error: err };
    return { ok: true, servers: [{ name: "", data: obj }] };
  }

  // 3. Named wrapper: { "server-name": { "command": "..." } }
  const result = extractFromMap(obj);
  if (result) return result;

  return { ok: false, error: 'Could not detect MCP server format. Expected "command" or "url" field.' };
}
