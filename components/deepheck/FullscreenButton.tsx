"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export function FullscreenButton() {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  async function toggle() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.13)] transition hover:border-cyan-200/50 hover:bg-cyan-300/18"
    >
      {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
      {fullscreen ? "退出全屏" : "全屏监测"}
    </button>
  );
}
