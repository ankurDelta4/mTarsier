import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "../../store/settingsStore";

export function CustomSkillsSection() {
  const { customSkillsPaths, addCustomSkillsPath, removeCustomSkillsPath } = useSettingsStore();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setAdding(true);
    setError(null);
    try {
      const folder = await invoke<string | null>("pick_folder");
      if (!folder) return;
      const path = folder;
      const id = `custom::${path}`;
      if (customSkillsPaths.some((p) => p.id === id)) {
        setError("This path is already added.");
        return;
      }
      const parts = path.replace(/\\/g, "/").split("/");
      const label = parts[parts.length - 1] || path; // folder name
      addCustomSkillsPath({ id, label, path });
    } catch (e) {
      setError(String(e));
    } finally {
      setAdding(false);
    }
  }

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
        Custom Skills Paths
      </h2>
      <p className="text-xs text-text-muted mb-4">
        Add any folder on your machine as a skills source. It will appear as a client on the Skills page.
      </p>

      <div className="max-w-2xl rounded-lg border border-border bg-surface p-4 space-y-3">
        {customSkillsPaths.length > 0 && (
          <ul className="space-y-2">
            {customSkillsPaths.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-base px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text truncate">{entry.label}</p>
                  <p className="text-[11px] text-text-muted font-mono truncate mt-0.5">{entry.path}</p>
                </div>
                <button
                  onClick={() => removeCustomSkillsPath(entry.id)}
                  className="flex-shrink-0 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleAdd}
          disabled={adding}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-primary/40 text-primary/80 text-sm
            hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {adding ? "Picking folder…" : "Add folder"}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </section>
  );
}
