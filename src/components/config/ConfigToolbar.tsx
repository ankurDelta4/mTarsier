import { useConfigStore } from "../../store/configStore";
import ModeSwitcher from "./ModeSwitcher";
import ScopeSelector from "./ScopeSelector";

function ConfigToolbar() {
  const {
    selectedClient,
    activeScope,
    mode,
    isDirty,
    isSaving,
    saveConfig,
    formatJson,
    toggleBackupPanel,
    showBackupPanel,
    setScope,
  } = useConfigStore();

  // In easy mode, EasyModeEditor handles auto-save — no manual Save needed here.

  if (!selectedClient) return null;

  const showScope = !!selectedClient.supportsScopes;
  const showLocalScopeWarning =
    selectedClient.id === "claude-code" && activeScope === "local";

  return (
    <div className="border-b border-border">
    <div className="flex items-center justify-between px-6 py-3 bg-base-light/50 gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-semibold flex-shrink-0">{selectedClient.name}</h2>
          {showScope && <ScopeSelector />}
        </div>
        <p className="text-[11px] text-text-muted font-mono truncate mt-0.5">
          {selectedClient.configPath}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <ModeSwitcher />
        {mode === "edit" && (
          <>
            <button
              onClick={formatJson}
              className="px-3 py-1.5 text-xs text-text-muted hover:text-text bg-surface hover:bg-surface-hover border border-border rounded-md transition-colors"
            >
              Format
            </button>
          </>
        )}
        <button
          onClick={toggleBackupPanel}
          className={`px-2.5 py-1.5 text-xs border rounded-md transition-colors ${
            showBackupPanel
              ? "bg-primary/10 text-primary border-primary/30"
              : "text-text-muted hover:text-text bg-surface hover:bg-surface-hover border-border"
          }`}
        >
          Backups
        </button>
        {mode !== "easy" && (
          <button
            onClick={saveConfig}
            disabled={isSaving || !isDirty}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              isDirty
                ? "bg-primary text-base hover:bg-primary-dim"
                : "bg-surface text-text-muted border border-border cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving..." : "Save"}
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-base" />}
          </button>
        )}
      </div>
    </div>
    {showLocalScopeWarning && (
      <div className="flex items-center gap-2 px-6 py-2 bg-amber/8 border-t border-amber/20 text-[11px] text-amber">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span>
          Servers here are only visible when Claude Code runs from your home directory.{" "}
          <button
            onClick={() => setScope("user")}
            className="underline underline-offset-2 hover:text-amber-300 transition-colors"
          >
            Switch to Global scope
          </button>{" "}
          for servers available everywhere.
        </span>
      </div>
    )}
    </div>
  );
}

export default ConfigToolbar;
