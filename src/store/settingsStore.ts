import { create } from "zustand";

export type StatusBarStyle = "A" | "B" | "C" | "none";

export interface CustomSkillsPath {
  id: string;
  label: string;
  path: string;
}

const STORAGE_KEY = "mtarsier-settings";

interface StoredSettings {
  statusBarStyle: StatusBarStyle;
  auditLogsEnabled: boolean;
  customSkillsPaths: CustomSkillsPath[];
}

function load(): StoredSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        statusBarStyle: parsed.statusBarStyle || "C",
        auditLogsEnabled: parsed.auditLogsEnabled !== undefined ? parsed.auditLogsEnabled : true,
        customSkillsPaths: Array.isArray(parsed.customSkillsPaths) ? parsed.customSkillsPaths : [],
      };
    }
  } catch {}
  return { statusBarStyle: "C", auditLogsEnabled: true, customSkillsPaths: [] };
}

function save(state: StoredSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    statusBarStyle: state.statusBarStyle,
    auditLogsEnabled: state.auditLogsEnabled,
    customSkillsPaths: state.customSkillsPaths,
  }));
}

interface SettingsStore extends StoredSettings {
  setStatusBarStyle: (style: StatusBarStyle) => void;
  setAuditLogsEnabled: (enabled: boolean) => void;
  addCustomSkillsPath: (entry: CustomSkillsPath) => void;
  removeCustomSkillsPath: (id: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...load(),

  setStatusBarStyle: (statusBarStyle) => {
    const next = { ...get(), statusBarStyle };
    save(next);
    set({ statusBarStyle });
  },

  setAuditLogsEnabled: (auditLogsEnabled) => {
    const next = { ...get(), auditLogsEnabled };
    save(next);
    set({ auditLogsEnabled });
  },

  addCustomSkillsPath: (entry) => {
    const customSkillsPaths = [...get().customSkillsPaths, entry];
    save({ ...get(), customSkillsPaths });
    set({ customSkillsPaths });
  },

  removeCustomSkillsPath: (id) => {
    const customSkillsPaths = get().customSkillsPaths.filter((p) => p.id !== id);
    save({ ...get(), customSkillsPaths });
    set({ customSkillsPaths });
  },
}));
