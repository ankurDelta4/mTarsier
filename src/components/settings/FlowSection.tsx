import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ImportFlowDialog } from "./ImportFlowDialog";

export function FlowSection() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    setExportDone(false);
    try {
      const json = await invoke<string>("export_flow");
      const saved = await invoke<boolean>("export_tsr", {
        content: json,
        filename: "mtarsier-flow.json",
      });
      if (saved) setExportDone(true);
    } catch (e) {
      setExportError(String(e));
    } finally {
      setExporting(false);
    }
  };

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
        Flow
      </h2>
      <p className="text-xs text-text-muted mb-4">
        Export or import your entire setup — all clients, MCP servers, and skills — as a single file.
      </p>

      <div className="max-w-2xl rounded-lg border border-border bg-surface p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-text">App Flow</h3>
            <p className="mt-1 text-xs text-text-muted">
              Transfer your full MCP setup between machines or share it with others.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-3 py-1.5 rounded border border-primary/40 text-primary/80 text-sm
              hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? "Exporting…" : "Export"}
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="px-3 py-1.5 rounded border border-border text-text-muted text-sm
              hover:border-text-muted hover:text-text transition-colors"
          >
            Import
          </button>
        </div>

        {exportDone && <p className="text-xs text-primary">Flow exported successfully.</p>}
        {exportError && <p className="text-xs text-red-400">{exportError}</p>}
      </div>

      {showImport && <ImportFlowDialog onClose={() => setShowImport(false)} />}
    </section>
  );
}
