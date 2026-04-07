import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useClientStore } from "../../store/clientStore";
import { CLIENT_REGISTRY, getConfigurableClients } from "../../lib/clients";
import { cn } from "../../lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FlowServer {
  name: string;
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
}

interface FlowSkill {
  name: string;
  description: string;
  content: string;
}

interface FlowClient {
  id: string;
  name: string;
  servers: FlowServer[];
  skills: FlowSkill[];
}

interface FlowExport {
  version: string;
  exported_at: string;
  clients: FlowClient[];
}

interface FlowImportResult {
  imported_servers: number;
  imported_skills: number;
  skipped_clients: string[];
  skipped_servers: string[];
  errors: string[];
}

interface McpServerEntry { name: string }
interface Props { onClose: () => void }

type ImportTab = "mcp" | "skills";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function serverSummary(s: FlowServer): string {
  if (s.command) return `${s.command}${s.args?.length ? ` ${s.args.join(" ")}` : ""}`;
  if (s.url) return s.url;
  return "";
}

function ClientDropdown({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ id: string; label: string }>;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full pl-2.5 pr-7 py-1.5 text-xs bg-base border border-border rounded-md text-text
          focus:outline-none focus:border-primary/60 cursor-pointer hover:border-primary/40 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ImportFlowDialog({ onClose }: Props) {
  const detectedClients = useClientStore((s) => s.clients);
  const mcpTargets = getConfigurableClients();
  const skillsTargets = CLIENT_REGISTRY.filter((c) => c.supportsSkills && c.configPath);

  const [tab, setTab] = useState<ImportTab>("mcp");
  const [flowData, setFlowData] = useState<FlowExport | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mcpTarget, setMcpTarget] = useState("");
  const [skillsTarget, setSkillsTarget] = useState("");
  const [existingNames, setExistingNames] = useState<Set<string>>(new Set());

  const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<FlowImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const clientsWithServers = flowData?.clients.filter((c) => c.servers.length > 0) ?? [];
  const clientsWithSkills = flowData?.clients.filter((c) => c.skills.length > 0) ?? [];
  const allServers = clientsWithServers.flatMap((c) => c.servers);
  const allSkills = clientsWithSkills.flatMap((c) => c.skills);

  const mcpOptions = mcpTargets.map((c) => {
    const det = detectedClients.find((d) => d.meta.id === c.id);
    const count = det?.serverCount;
    const label = det?.installed
      ? `${c.name}${count != null ? `  (${count} server${count !== 1 ? "s" : ""})` : ""}`
      : `${c.name}  (not detected)`;
    return { id: c.id, label };
  });

  const skillsOptions = skillsTargets.map((c) => {
    const det = detectedClients.find((d) => d.meta.id === c.id);
    return { id: c.id, label: det?.installed ? c.name : `${c.name}  (not detected)` };
  });

  async function handlePickFile() {
    setLoadError(null);
    setFlowData(null);
    setImportResult(null);
    setImportError(null);
    setMcpTarget("");
    setSkillsTarget("");
    try {
      const raw = await invoke<string | null>("import_tsr");
      if (!raw) return;
      const parsed = JSON.parse(raw) as FlowExport;
      if (!parsed.version || !Array.isArray(parsed.clients)) {
        setLoadError("Invalid flow file — missing version or clients array.");
        return;
      }
      setFlowData(parsed);
      setSelectedServers(new Set(parsed.clients.flatMap((c) => c.servers.map((s) => s.name))));
      setSelectedSkills(new Set(parsed.clients.flatMap((c) => c.skills.map((s) => s.name))));
    } catch (e) {
      setLoadError(String(e));
    }
  }

  useEffect(() => {
    if (!mcpTarget) { setExistingNames(new Set()); return; }
    const meta = mcpTargets.find((c) => c.id === mcpTarget);
    if (!meta?.configPath || !meta.configKey) { setExistingNames(new Set()); return; }
    invoke<McpServerEntry[]>("read_mcp_servers", {
      configPath: meta.configPath,
      configKey: meta.configKey,
      configFormat: meta.configFormat,
    })
      .then((entries) => setExistingNames(new Set(entries.map((e) => e.name))))
      .catch(() => setExistingNames(new Set()));
  }, [mcpTarget]);

  function toggleServer(name: string) {
    setSelectedServers((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  }
  function toggleSkill(name: string) {
    setSelectedSkills((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  }

  async function handleImport() {
    const hasMcp = selectedServers.size > 0 && !!mcpTarget;
    const hasSkills = selectedSkills.size > 0 && !!skillsTarget;
    if (!hasMcp && !hasSkills) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      let totalServers = 0, totalSkills = 0;
      const skippedClients: string[] = [], skippedServers: string[] = [], errors: string[] = [];

      const sameTarget = mcpTarget && skillsTarget && mcpTarget === skillsTarget;

      if (hasMcp) {
        const r = await invoke<FlowImportResult>("import_flow", {
          content: JSON.stringify({
            ...flowData,
            clients: flowData!.clients.map((c) => ({
              ...c,
              servers: c.servers.filter((s) => selectedServers.has(s.name)),
              skills: sameTarget ? c.skills.filter((s) => selectedSkills.has(s.name)) : [],
            })),
          }),
          targetClientId: mcpTarget,
          installSkills: !!sameTarget && hasSkills,
        });
        totalServers += r.imported_servers;
        totalSkills += r.imported_skills;
        skippedClients.push(...r.skipped_clients);
        skippedServers.push(...r.skipped_servers);
        errors.push(...r.errors);
      }

      if (hasSkills && !sameTarget) {
        const r = await invoke<FlowImportResult>("import_flow", {
          content: JSON.stringify({
            ...flowData,
            clients: flowData!.clients.map((c) => ({
              ...c,
              servers: [],
              skills: c.skills.filter((s) => selectedSkills.has(s.name)),
            })),
          }),
          targetClientId: skillsTarget,
          installSkills: true,
        });
        totalSkills += r.imported_skills;
        skippedClients.push(...r.skipped_clients);
        errors.push(...r.errors);
      }

      if (!hasMcp && hasSkills && !skillsTarget) return;

      setImportResult({
        imported_servers: totalServers,
        imported_skills: totalSkills,
        skipped_clients: [...new Set(skippedClients)],
        skipped_servers: [...new Set(skippedServers)],
        errors,
      });
    } catch (e) {
      setImportError(String(e));
    } finally {
      setImporting(false);
    }
  }

  const canImport = (selectedServers.size > 0 && !!mcpTarget) || (selectedSkills.size > 0 && !!skillsTarget);
  const importLabel = [
    selectedServers.size > 0 && mcpTarget ? `${selectedServers.size} server${selectedServers.size !== 1 ? "s" : ""}` : null,
    selectedSkills.size > 0 && skillsTarget ? `${selectedSkills.size} skill${selectedSkills.size !== 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" + ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-lg w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h3 className="text-sm font-semibold">Import Flow</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text rounded p-0.5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* File picker */}
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <button
            onClick={handlePickFile}
            className="w-full py-2 text-xs border border-dashed border-border rounded-md text-text-muted
              hover:border-primary/30 hover:text-primary transition-colors"
          >
            {flowData ? "Choose a different file…" : "Choose flow file (.json / .tsr)…"}
          </button>
          {loadError && <p className="text-xs text-red-400 mt-2">{loadError}</p>}
        </div>

        {/* Tabs — only shown after file loaded */}
        {flowData && (
          <>
            <div className="flex gap-1 px-5 border-b border-border flex-shrink-0">
              {(["mcp", "skills"] as ImportTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "text-xs px-3 py-2 border-b-2 -mb-px transition-colors",
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-text-muted hover:text-text"
                  )}
                >
                  {t === "mcp" ? (
                    <span>MCP Servers <span className="ml-1 text-[10px] opacity-70">{selectedServers.size}/{allServers.length}</span></span>
                  ) : (
                    <span>Skills <span className="ml-1 text-[10px] opacity-70">{selectedSkills.size}/{allSkills.length}</span></span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">

              {/* Target client + select all bar */}
              <div className="px-5 py-3 border-b border-border flex-shrink-0 space-y-2">
                {tab === "mcp" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                        Import into
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allServers.length > 0 && selectedServers.size === allServers.length}
                          onChange={(e) => setSelectedServers(
                            e.target.checked ? new Set(allServers.map((s) => s.name)) : new Set()
                          )}
                          className="accent-primary"
                        />
                        <span className="text-[10px] text-text-muted">Select all</span>
                      </label>
                    </div>
                    <ClientDropdown
                      value={mcpTarget}
                      onChange={setMcpTarget}
                      options={mcpOptions}
                      placeholder="Pick a client…"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                        Install into
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allSkills.length > 0 && selectedSkills.size === allSkills.length}
                          onChange={(e) => setSelectedSkills(
                            e.target.checked ? new Set(allSkills.map((s) => s.name)) : new Set()
                          )}
                          className="accent-primary"
                        />
                        <span className="text-[10px] text-text-muted">Select all</span>
                      </label>
                    </div>
                    <ClientDropdown
                      value={skillsTarget}
                      onChange={setSkillsTarget}
                      options={skillsOptions}
                      placeholder="Pick a client…"
                    />
                  </>
                )}
              </div>

              {/* Items list */}
              <div className="px-4 py-2">
                {tab === "mcp" && (
                  allServers.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-6">No MCP servers in this flow file.</p>
                  ) : (
                    clientsWithServers.map((client) => (
                      <div key={client.id}>
                        <p className="text-[10px] font-medium text-text-muted/60 uppercase tracking-wider px-1 pt-3 pb-1.5">
                          from {client.name}
                        </p>
                        <div className="space-y-1.5">
                          {client.servers.map((s) => {
                            const conflict = existingNames.has(s.name);
                            const summary = serverSummary(s);
                            return (
                              <label
                                key={s.name}
                                className={cn(
                                  "flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors",
                                  selectedServers.has(s.name) ? "border-primary/30 bg-primary/5" : "border-border hover:bg-surface-hover"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedServers.has(s.name)}
                                  onChange={() => toggleServer(s.name)}
                                  className="mt-0.5 accent-primary flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-xs font-mono font-medium text-text truncate">{s.name}</p>
                                    {conflict && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 bg-amber-500/20 text-amber-400">
                                        already exists
                                      </span>
                                    )}
                                  </div>
                                  {summary && (
                                    <p className="text-[11px] text-text-muted font-mono truncate mt-0.5">{summary}</p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )
                )}

                {tab === "skills" && (
                  allSkills.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-6">No skills in this flow file.</p>
                  ) : (
                    clientsWithSkills.map((client) => (
                      <div key={client.id}>
                        <p className="text-[10px] font-medium text-text-muted/60 uppercase tracking-wider px-1 pt-3 pb-1.5">
                          from {client.name}
                        </p>
                        <div className="space-y-1.5">
                          {client.skills.map((s) => (
                            <label
                              key={s.name}
                              className={cn(
                                "flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors",
                                selectedSkills.has(s.name) ? "border-primary/30 bg-primary/5" : "border-border hover:bg-surface-hover"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selectedSkills.has(s.name)}
                                onChange={() => toggleSkill(s.name)}
                                className="mt-0.5 accent-primary flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-mono font-medium text-text truncate">{s.name}</p>
                                {s.description && (
                                  <p className="text-[11px] text-text-muted truncate mt-0.5">{s.description}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </>
        )}

        {/* Import result */}
        {importResult && (
          <div className="px-5 py-3 border-t border-border flex-shrink-0">
            <div className="rounded border border-primary/20 bg-primary/5 p-3 space-y-1">
              <p className="text-xs text-primary font-medium">Import complete</p>
              <p className="text-xs text-text-muted">
                {importResult.imported_servers} server(s) and {importResult.imported_skills} skill(s) imported
              </p>
              {importResult.skipped_servers.length > 0 && (
                <p className="text-xs text-text-muted">
                  Skipped (already exist): {importResult.skipped_servers.join(", ")}
                </p>
              )}
              {importResult.errors.length > 0 && (
                <p className="text-xs text-red-400">{importResult.errors.join("; ")}</p>
              )}
            </div>
          </div>
        )}

        {importError && (
          <div className="px-5 py-2 flex-shrink-0">
            <p className="text-xs text-red-400">{importError}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-text-muted hover:text-text border border-border rounded-md"
          >
            {importResult ? "Close" : "Cancel"}
          </button>
          {!importResult && (
            <button
              onClick={handleImport}
              disabled={importing || !canImport}
              className="px-3.5 py-1.5 text-xs font-medium bg-primary text-base rounded-md hover:bg-primary-dim
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importing ? "Importing…" : importLabel ? `Import ${importLabel}` : "Import"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
