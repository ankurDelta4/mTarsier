import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Sidebar from "../components/Sidebar";
import { useClientDetection } from "../hooks/useClientDetection";
import { useClientStore } from "../store/clientStore";

function AppLayout() {
  useClientDetection();

  const detectAll = useClientStore((s) => s.detectAll);

  useEffect(() => {
    getCurrentWindow().setTitle("");
  }, []);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const setupListener = async () => {
      const unlisten = await getCurrentWindow().onFocusChanged(({ payload: focused }) => {
        if (!focused) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => { detectAll(); }, 1000);
      });
      return unlisten;
    };

    const unlistenPromise = setupListener();
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [detectAll]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <div
        data-tauri-drag-region
        className="h-8 w-full flex-shrink-0 flex items-center justify-center"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <span
          className="text-text-muted select-none pointer-events-none"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", fontSize: "13px", fontWeight: 800 }}
        >mTarsier</span>
      </div>
      <div className="flex-1 px-2 pb-2 overflow-hidden">
        <div className="flex h-full w-full overflow-hidden rounded-xl border border-border bg-base">
          <Sidebar />
          <main className="relative flex-1 min-w-0 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
