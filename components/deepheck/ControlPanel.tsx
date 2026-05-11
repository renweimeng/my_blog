"use client";

import { Pause, Play, RadioTower, SlidersHorizontal } from "lucide-react";
import type { ChannelDensity, RiskMode, ViewMode } from "./types";

const riskModes: Array<{ value: RiskMode; label: string; tone: string }> = [
  { value: "stable", label: "稳定阅读", tone: "border-cyan-300/35 text-cyan-100" },
  { value: "mild", label: "轻度异常", tone: "border-amber-300/35 text-amber-100" },
  { value: "high", label: "高风险片段", tone: "border-rose-300/40 text-rose-100" },
];

const viewModes: Array<{ value: ViewMode; label: string }> = [
  { value: "standard", label: "标准视图" },
  { value: "dense", label: "高密度视图" },
  { value: "presentation", label: "汇报展示视图" },
];

const densityModes: Array<{ value: ChannelDensity; label: string }> = [
  { value: "compact", label: "紧凑" },
  { value: "standard", label: "标准" },
  { value: "expanded", label: "扩展" },
];

export function ControlPanel({
  paused,
  onPausedChange,
  riskMode,
  onRiskModeChange,
  viewMode,
  onViewModeChange,
  density,
  onDensityChange,
  showA,
  showB,
  onShowAChange,
  onShowBChange,
}: {
  paused: boolean;
  onPausedChange: (value: boolean) => void;
  riskMode: RiskMode;
  onRiskModeChange: (value: RiskMode) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  density: ChannelDensity;
  onDensityChange: (value: ChannelDensity) => void;
  showA: boolean;
  showB: boolean;
  onShowAChange: (value: boolean) => void;
  onShowBChange: (value: boolean) => void;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-3 shadow-[0_18px_60px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <SlidersHorizontal className="size-4 text-cyan-300" />
          监测控制台
        </div>
        <button
          type="button"
          onClick={() => onPausedChange(!paused)}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/12 px-3 py-1.5 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/20"
        >
          {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          {paused ? "继续监测" : "暂停监测"}
        </button>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.3fr_1fr_0.9fr]">
        <div>
          <div className="mb-2 text-[11px] font-semibold text-slate-400">风险模式</div>
          <div className="flex flex-wrap gap-2">
            {riskModes.map((mode) => (
              <button
                type="button"
                key={mode.value}
                onClick={() => onRiskModeChange(mode.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${mode.tone} ${riskMode === mode.value ? "bg-white/16 shadow-[0_0_22px_rgba(34,211,238,0.12)]" : "bg-white/[0.035] hover:bg-white/10"}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold text-slate-400">视图密度</div>
          <select
            value={viewMode}
            onChange={(event) => onViewModeChange(event.target.value as ViewMode)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-100 outline-none ring-cyan-300/30 transition focus:ring-2"
          >
            {viewModes.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold text-slate-400">通道密度</div>
          <select
            value={density}
            onChange={(event) => onDensityChange(event.target.value as ChannelDensity)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-100 outline-none ring-cyan-300/30 transition focus:ring-2"
          >
            {densityModes.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs text-slate-300">
        <RadioTower className="size-4 text-emerald-300" />
        <button
          type="button"
          onClick={() => onShowAChange(!showA)}
          className={`rounded-full px-3 py-1.5 font-semibold transition ${showA ? "bg-cyan-300/18 text-cyan-100" : "bg-white/[0.05] text-slate-400"}`}
        >
          Subject A
        </button>
        <button
          type="button"
          onClick={() => onShowBChange(!showB)}
          className={`rounded-full px-3 py-1.5 font-semibold transition ${showB ? "bg-violet-300/18 text-violet-100" : "bg-white/[0.05] text-slate-400"}`}
        >
          Subject B
        </button>
        <span className="ml-auto text-[11px] text-slate-500">64 导联 · ERP/PSD/PLV 在线融合</span>
      </div>
    </section>
  );
}
