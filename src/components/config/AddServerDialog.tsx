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

interface Props {
  supportedTransports: TransportType[];
  onAdd: (name: string, data: Record<string, unknown>) => void;
  onClose: () => void;
}

function buildRemoteMcpArgs(url: string, authToken: string): string[] {
  const args = ["-y", "mcp-remote", url];
  if (authToken.trim()) {
    args.push("--header", `Authorization: Bearer ${authToken.trim()}`);
  }
  return args;
}

function serverSummary(data: Record<string, unknown>): string {
  if (typeof data.url === "string") return data.url;
  const cmd = typeof data.command === "string" ? data.command : "";
  const argList = Array.isArray(data.args) ? (data.args as string[]).join(" ") : "";
  return argList ? `${cmd} ${argList}` : cmd;
}

function AddServerDialog({ supportedTransports, onAdd, onClose }: Props) {
  const defaultTransport = supportedTransports[0] ?? "stdio";
  const [mode, setMode] = useState<"form" | "paste">("form");
  const [parsed, setParsed] = useState<ParsedServer[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [name, setName] = useState("");
  const [transport, setTransport] = useState<TransportType>(defaultTransport);
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState<string[]>([]);
  const [env, setEnv] = useState<Record<string, string>>({});
  const [httpState, setHttpState] = useState<HttpFormData>({ url: "", headers: {} });
  const [httpInitialAuth, setHttpInitialAuth] = useState<AuthData>({ type: "none" });
  const [remoteUrl, setRemoteUrl] = useState("");
  const [remoteAuthToken, setRemoteAuthToken] = useState("");

  const handleAddFromForm = () => {
    if (!name.trim()) return;
    let data: Record<string, unknown>;
    if (transport === "stdio") {
      data = { command, args: args.length > 0 ? args : undefined };
      if (Object.keys(env).length > 0) data.env = env;
    } else if (transport === "remote-mcp") {
      data = { command: "npx", args: buildRemoteMcpArgs(remoteUrl, remoteAuthToken) };
    } else {
      const finalHeaders = { ...httpState.headers };
      if (httpState.bearerToken?.trim()) finalHeaders["Authorization"] = `Bearer ${httpState.bearerToken.trim()}`;
      data = { url: httpState.url };
      if (Object.keys(finalHeaders).length > 0) data.headers = finalHeaders;
      if (httpState.auth) data.auth = httpState.auth;
    }
    onAdd(name.trim(), data);
  };

  const handleImport = () => {
    if (parsed.length !== 1) return;
    const d = parsed[0].data;
    if (parsed[0].name) setName(parsed[0].name);
    if ("url" in d) {
      setTransport("sse");
      const { auth, cleanHeaders } = detectAuthFromData(d);
      setHttpInitialAuth(auth);
      setHttpState({
        url: String(d.url ?? ""),
        headers: cleanHeaders,
        bearerToken: auth.type === "bearer" ? auth.bearerToken : undefined,
        auth: auth.type === "oauth" ? { CLIENT_ID: auth.clientId ?? "", CLIENT_SECRET: auth.clientSecret ?? "", scopes: auth.scopes ? auth.scopes.split(",").map((s) => s.trim()).filter(Boolean) : [] } : undefined,
      });
    } else {
      setTransport("stdio");
      setCommand(String(d.command ?? ""));
      setArgs(Array.isArray(d.args) ? d.args.map(String) : []);
      setEnv((d.env as Record<string, string>) ?? {});
    }
    setMode("form");
  };

  const handleAddSelected = () => {
    parsed.filter((_, i) => selected.has(i)).forEach((s) => onAdd(s.name, s.data));
    onClose();
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
  };

  const isMultiple = parsed.length > 1;
  const isFormValid = name.trim() && (transport !== "remote-mcp" || remoteUrl.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-lg p-5 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <h3 className="text-sm font-semibold">Add MCP Server</h3>

        {mode === "paste" ? (
          <div className="flex flex-col gap-3">
            <PasteJsonMode onParsed={(servers) => {
              setParsed(servers);
              setSelected(new Set(servers.map((_, i) => i)));
            }} />

            {isMultiple && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-text-muted">{parsed.length} servers found — select which to add:</p>
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
                      <span className="text-xs text-text-muted font-mono truncate">{serverSummary(s.data)}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Server Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-server"
                autoFocus
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-base border border-border rounded-md text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
              />
            </div>
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
            {mode === "form" ? (
              <button
                type="button"
                onClick={handleAddFromForm}
                disabled={!isFormValid}
                className="px-3 py-1.5 text-xs font-medium bg-primary text-base rounded-md hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Server
              </button>
            ) : isMultiple ? (
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={handleAddSelected}
                className="px-3 py-1.5 text-xs font-medium bg-primary text-base rounded-md hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {selected.size > 0 ? `(${selected.size})` : ""}
              </button>
            ) : (
              <button
                type="button"
                disabled={parsed.length === 0}
                onClick={handleImport}
                className="px-3 py-1.5 text-xs font-medium bg-primary text-base rounded-md hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddServerDialog;
