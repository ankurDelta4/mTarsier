import { useState } from "react";
import type { TransportType } from "../../types/config";
import type { ParsedServer } from "../../lib/parseMcpPaste";
import TransportSelector from "./TransportSelector";
import StdioForm from "./StdioForm";
import HttpForm from "./HttpForm";
import type { HttpFormData } from "./HttpForm";
import type { AuthData } from "./AuthSection";
import RemoteMcpForm from "./RemoteMcpForm";
import PasteJsonMode from "./PasteJsonMode";

function detectAuthFromData(data: Record<string, unknown>): { auth: AuthData; cleanHeaders: Record<string, string> } {
  const cleanHeaders = { ...(data.headers as Record<string, string> ?? {}) };
  const authHeader = cleanHeaders["Authorization"];
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/);
    if (match) {
      delete cleanHeaders["Authorization"];
      return { auth: { type: "bearer", bearerToken: match[1] }, cleanHeaders };
    }
  }
  if (data.auth && typeof data.auth === "object" && !Array.isArray(data.auth)) {
    const a = data.auth as Record<string, unknown>;
    return {
      auth: {
        type: "oauth",
        clientId: String(a.CLIENT_ID ?? ""),
        clientSecret: String(a.CLIENT_SECRET ?? ""),
        scopes: Array.isArray(a.scopes) ? (a.scopes as string[]).join(",") : "",
      },
      cleanHeaders,
    };
  }
  return { auth: { type: "none" }, cleanHeaders };
}

function buildOAuthBlock(auth: AuthData): { CLIENT_ID: string; CLIENT_SECRET: string; scopes: string[] } {
  return {
    CLIENT_ID: auth.clientId ?? "",
    CLIENT_SECRET: auth.clientSecret ?? "",
    scopes: auth.scopes ? auth.scopes.split(",").map((s) => s.trim()).filter(Boolean) : [],
  };
}

interface Props {
  name: string;
  data: Record<string, unknown>;
  supportedTransports: TransportType[];
  onSave: (name: string, data: Record<string, unknown>) => void;
  onClose: () => void;
}

function isRemoteMcp(data: Record<string, unknown>): boolean {
  return (
    data.command === "npx" &&
    Array.isArray(data.args) &&
    (data.args as string[]).includes("mcp-remote")
  );
}

function detectTransport(data: Record<string, unknown>): TransportType {
  if (isRemoteMcp(data)) return "remote-mcp";
  if (data.url) {
    return String(data.url).includes("/sse") ? "sse" : "streamable-http";
  }
  return "stdio";
}

function extractRemoteMcpUrl(data: Record<string, unknown>): string {
  const args = data.args as string[];
  const idx = args.indexOf("mcp-remote");
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : "";
}

function extractRemoteMcpToken(data: Record<string, unknown>): string {
  const args = data.args as string[];
  const idx = args.indexOf("--header");
  if (idx >= 0 && idx + 1 < args.length) {
    const match = String(args[idx + 1]).match(/^Authorization:\s*Bearer\s+(.+)$/);
    if (match) return match[1];
  }
  return "";
}

function buildRemoteMcpArgs(url: string, authToken: string): string[] {
  const args = ["-y", "mcp-remote", url];
  if (authToken.trim()) {
    args.push("--header", `Authorization: Bearer ${authToken.trim()}`);
  }
  return args;
}

function fillFromData(
  d: Record<string, unknown>,
  set: {
    setTransport: (t: TransportType) => void;
    setCommand: (v: string) => void;
    setArgs: (v: string[]) => void;
    setEnv: (v: Record<string, string>) => void;
    setHttpState: (v: HttpFormData) => void;
    setHttpInitialAuth: (v: AuthData) => void;
    setRemoteUrl: (v: string) => void;
    setRemoteAuthToken: (v: string) => void;
  }
) {
  const synthetic = { command: d.command, args: d.args } as Record<string, unknown>;
  if (isRemoteMcp(synthetic)) {
    set.setTransport("remote-mcp");
    set.setRemoteUrl(extractRemoteMcpUrl(d));
    set.setRemoteAuthToken(extractRemoteMcpToken(d));
  } else if ("url" in d) {
    const t = String(d.url ?? "").includes("/sse") ? "sse" : "streamable-http";
    set.setTransport(t);
    const { auth, cleanHeaders } = detectAuthFromData(d);
    set.setHttpInitialAuth(auth);
    set.setHttpState({
      url: String(d.url ?? ""),
      headers: cleanHeaders,
      bearerToken: auth.type === "bearer" ? auth.bearerToken : undefined,
      auth: auth.type === "oauth" ? buildOAuthBlock(auth) : undefined,
    });
  } else {
    set.setTransport("stdio");
    set.setCommand(String(d.command ?? ""));
    set.setArgs(Array.isArray(d.args) ? d.args.map(String) : []);
    set.setEnv((d.env as Record<string, string>) ?? {});
  }
}

function EditServerDialog({ name, data, supportedTransports, onSave, onClose }: Props) {
  const [mode, setMode] = useState<"form" | "paste">("form");
  const [parsed, setParsed] = useState<ParsedServer[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pasteError, setPasteError] = useState<string | null>(null);

  const [transport, setTransport] = useState<TransportType>(detectTransport(data));
  const [command, setCommand] = useState((data.command as string) ?? "");
  const [args, setArgs] = useState<string[]>((data.args as string[]) ?? []);
  const [env, setEnv] = useState<Record<string, string>>((data.env as Record<string, string>) ?? {});
  const [remoteUrl, setRemoteUrl] = useState(isRemoteMcp(data) ? extractRemoteMcpUrl(data) : "");
  const [remoteAuthToken, setRemoteAuthToken] = useState(isRemoteMcp(data) ? extractRemoteMcpToken(data) : "");

  const [httpState, setHttpState] = useState<HttpFormData>(() => {
    const { auth, cleanHeaders } = detectAuthFromData(data);
    return {
      url: (data.url as string) ?? "",
      headers: cleanHeaders,
      bearerToken: auth.type === "bearer" ? auth.bearerToken : undefined,
      auth: auth.type === "oauth" ? buildOAuthBlock(auth) : undefined,
    };
  });
  const [httpInitialAuth, setHttpInitialAuth] = useState<AuthData>(() => detectAuthFromData(data).auth);

  const setters = { setTransport, setCommand, setArgs, setEnv, setHttpState, setHttpInitialAuth, setRemoteUrl, setRemoteAuthToken };

  const handleSave = () => {
    let newData: Record<string, unknown>;
    if (transport === "stdio") {
      newData = { command, args: args.length > 0 ? args : undefined };
      if (Object.keys(env).length > 0) newData.env = env;
    } else if (transport === "remote-mcp") {
      newData = { command: "npx", args: buildRemoteMcpArgs(remoteUrl, remoteAuthToken) };
    } else {
      const finalHeaders = { ...httpState.headers };
      if (httpState.bearerToken?.trim()) finalHeaders["Authorization"] = `Bearer ${httpState.bearerToken.trim()}`;
      newData = { url: httpState.url };
      if (Object.keys(finalHeaders).length > 0) newData.headers = finalHeaders;
      if (httpState.auth) newData.auth = httpState.auth;
    }
    onSave(name, newData);
  };

  const handleImport = (server: ParsedServer) => {
    fillFromData(server.data, setters);
    setMode("form");
  };

  const toggleSelected = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleModeToggle = () => {
    setMode((m) => (m === "form" ? "paste" : "form"));
    setParsed([]);
    setSelected(new Set());
    setPasteError(null);
  };

  const isSaveValid = transport !== "remote-mcp" || remoteUrl.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-lg p-5 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <h3 className="text-sm font-semibold">
          Edit: <span className="font-mono text-primary">{name}</span>
        </h3>

        {mode === "paste" ? (
          <div className="flex flex-col gap-3">
            <PasteJsonMode onParsed={(servers) => {
              setParsed(servers);
              setSelected(new Set());
              setPasteError(null);
            }} />
            {parsed.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-text-muted">Multiple servers found — select one to import:</p>
                {parsed.map((s, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2.5 rounded-md border border-border bg-base px-3 py-2 cursor-pointer hover:border-primary/30"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggleSelected(i)}
                      className="accent-primary shrink-0"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-medium text-primary font-mono">{s.name}</span>
                      <span className="text-xs text-text-muted font-mono truncate">
                        {typeof s.data.url === "string" ? s.data.url : `${s.data.command ?? ""} ${Array.isArray(s.data.args) ? (s.data.args as string[]).join(" ") : ""}`.trim()}
                      </span>
                    </div>
                  </label>
                ))}
                {selected.size > 1 && (
                  <p className="text-xs text-amber-400">Select only one server to import for editing.</p>
                )}
              </div>
            )}
            {pasteError && <p className="text-xs text-amber-400">{pasteError}</p>}
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 block">Transport</label>
              <TransportSelector
                value={transport}
                onChange={setTransport}
                supportedTransports={supportedTransports}
              />
            </div>

            {transport === "stdio" ? (
              <StdioForm
                command={command}
                args={args}
                env={env}
                onChange={(d) => { setCommand(d.command); setArgs(d.args); setEnv(d.env); }}
              />
            ) : transport === "remote-mcp" ? (
              <RemoteMcpForm
                url={remoteUrl}
                authToken={remoteAuthToken}
                onChange={(d) => { setRemoteUrl(d.url); setRemoteAuthToken(d.authToken); }}
              />
            ) : (
              <HttpForm
                url={httpState.url}
                headers={httpState.headers}
                initialAuth={httpInitialAuth}
                onChange={setHttpState}
              />
            )}
          </>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleModeToggle}
            className="px-3 py-1.5 text-xs text-text-muted hover:text-text border border-border rounded-md"
          >
            {mode === "form" ? "Paste JSON" : "← Form"}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-text-muted hover:text-text border border-border rounded-md"
            >
              Cancel
            </button>
            {mode === "paste" ? (
              <button
                type="button"
                disabled={parsed.length === 0 || (parsed.length === 1 ? false : selected.size !== 1)}
                onClick={() => {
                  const server = parsed.length === 1 ? parsed[0] : parsed[selected.values().next().value as number];
                  if (server) handleImport(server);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-primary text-base rounded-md hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={!isSaveValid}
                className="px-3 py-1.5 text-xs font-medium bg-primary text-base rounded-md hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditServerDialog;
