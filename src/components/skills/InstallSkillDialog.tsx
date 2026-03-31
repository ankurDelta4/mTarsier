import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useClientStore } from "../../store/clientStore";
import { getSkillableClients } from "../../store/skillStore";
import type { SkillSearchResult } from "./RegistrySkillCard";

interface Props {
  skill: SkillSearchResult;
  onClose: () => void;
  onInstall: (clientIds: string[]) => Promise<void>;
  defaultClientIds?: string[];
}

export default function InstallSkillDialog({
  skill,
  onClose,
  onInstall,
  defaultClientIds = [],
}: Props) {
  const { clients: clientStates } = useClientStore();
  const detectedMetas = clientStates.filter((cs) => cs.installed).map((cs) => cs.meta);
  const clients = getSkillableClients(detectedMetas);
  const initialSelection = defaultClientIds.filter((id) => clients.some((c) => c.id === id));
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelection.length > 0 ? initialSelection : clients.map((c) => c.id))
  );
  const [installing, setInstalling] = useState(false);
  const [installStep, setInstallStep] = useState<"downloading" | "copying" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const waitForNextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const handleInstall = async () => {
    if (selected.size === 0) {
      setError("Select at least one client");
      return;
    }
    setInstalling(true);
    setInstallStep("downloading");
    setError(null);

    // Set up timer to switch to copying phase
    const copyTimer = setTimeout(() => {
      setInstallStep("copying");
    }, 1500);

    try {
      // Ensure loading UI paints before install work starts.
      await waitForNextFrame();
      await onInstall(Array.from(selected));
      clearTimeout(copyTimer);
      onClose();
    } catch (e) {
      clearTimeout(copyTimer);
      const errorMsg = String(e);
      // Extract meaningful error message
      const cleanError = errorMsg
        .replace("Error: ", "")
        .replace(/^Error:\s*/i, "");
      setError(cleanError);
    } finally {
      setInstalling(false);
      setInstallStep(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Install Skill</h2>
          <button
            onClick={onClose}
            disabled={installing}
            className="text-text-muted hover:text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={installing ? "Installation in progress" : "Close"}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {installing && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="relative">
                  <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-primary font-medium block">
                    {installStep === "downloading"
                      ? "Downloading skill from registry..."
                      : installStep === "copying"
                      ? `Copying to ${selected.size} client${selected.size !== 1 ? "s" : ""}...`
                      : "Installing skill..."}
                  </span>
                  {installStep && (
                    <span className="text-[10px] text-primary/60 block mt-0.5">
                      {installStep === "downloading"
                        ? "Downloading from GitHub"
                        : `Updating client director${selected.size !== 1 ? "ies" : "y"}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-colors ${installStep === "downloading" ? "bg-primary animate-pulse" : "bg-primary/30"}`} />
                  <span className="text-[10px] text-text-muted">Download</span>
                </div>
                <div className="flex-1 h-px bg-border mx-2" />
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-colors ${installStep === "copying" ? "bg-primary animate-pulse" : "bg-primary/30"}`} />
                  <span className="text-[10px] text-text-muted">Copy</span>
                </div>
                <div className="flex-1 h-px bg-border mx-2" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/30" />
                  <span className="text-[10px] text-text-muted">Done</span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-base p-3 space-y-0.5">
            <p className="text-xs font-semibold text-text">{skill.name}</p>
            {skill.source && (
              <p className="text-[10px] font-mono text-text-muted/60 truncate">{skill.source}</p>
            )}
            {skill.installs != null && skill.installs > 0 && (
              <p className="text-[10px] text-text-muted/40">{skill.installs.toLocaleString()} installs</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Install to</p>
              <button
                onClick={() =>
                  setSelected(
                    selected.size === clients.length
                      ? new Set()
                      : new Set(clients.map((c) => c.id))
                  )
                }
                className="text-[10px] text-primary hover:underline"
              >
                {selected.size === clients.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="space-y-1.5">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className={cn(
                    "w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors flex items-center gap-2",
                    selected.has(c.id)
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-text-muted hover:border-border-hover hover:text-text"
                  )}
                >
                  <span className="flex-1">{c.name}</span>
                  <span className="text-[10px] text-text-muted/40 font-mono truncate max-w-[120px]">{c.skillsPath}</span>
                  {selected.has(c.id) && (
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-text-muted/40 leading-relaxed">
            Downloads skill from GitHub and copies to each selected client's skills directory.
          </p>

          {error && <p className="text-[11px] text-red-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={installing}
            className="text-xs px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleInstall}
            disabled={installing || selected.size === 0}
            className="text-xs font-medium px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {installing && (
              <span className="inline-block w-3.5 h-3.5 border-2 border-primary/35 border-t-primary rounded-full animate-spin" />
            )}
            {installing
              ? `Installing to ${selected.size} client${selected.size !== 1 ? "s" : ""}…`
              : `Install to ${selected.size} client${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
