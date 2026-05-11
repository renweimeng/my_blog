"use client";

import { LineChart } from "lucide-react";
import type { ErpPoint, MetricState } from "./types";

function pathFrom(points: ErpPoint[], key: keyof Pick<ErpPoint, "subjectA" | "subjectB" | "average">) {
  const width = 360;
  const height = 150;
  const xScale = (time: number) => ((time + 200) / 1000) * width;
  const yScale = (value: number) => height / 2 - value * 11;
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${xScale(point.time).toFixed(1)},${yScale(point[key]).toFixed(1)}`)
    .join(" ");
}

function BandBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] text-slate-400">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(8, Math.min(100, value))}%`, background: color, boxShadow: `0 0 16px ${color}` }}
        />
      </div>
    </div>
  );
}

export function ERPPanel({ points, metrics }: { points: ErpPoint[]; metrics: MetricState }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-3 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <LineChart className="size-4 text-cyan-300" />
            ERP / 频段响应分析
          </div>
          <p className="mt-1 text-xs text-slate-400">N400 语义违例响应 · P600 重分析响应</p>
        </div>
        <div className="flex gap-2 text-[10px] text-slate-300">
          <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-cyan-300" />A</span>
          <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-violet-300" />B</span>
          <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-amber-300" />Dyadic</span>
        </div>
      </div>

      <svg viewBox="0 0 360 150" className="h-32 w-full rounded-2xl border border-white/10 bg-slate-950/48">
        <defs>
          <linearGradient id="erpN400" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(34,211,238,0.06)" />
            <stop offset="1" stopColor="rgba(244,63,94,0.14)" />
          </linearGradient>
          <linearGradient id="erpP600" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(168,85,247,0.08)" />
            <stop offset="1" stopColor="rgba(245,158,11,0.12)" />
          </linearGradient>
        </defs>
        <rect x="180" y="0" width="72" height="150" fill="url(#erpN400)" />
        <rect x="252" y="0" width="108" height="150" fill="url(#erpP600)" />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={i * 60} y1="0" x2={i * 60} y2="150" stroke="rgba(255,255,255,0.06)" />)}
        {Array.from({ length: 5 }, (_, i) => <line key={`h-${i}`} x1="0" y1={i * 37.5} x2="360" y2={i * 37.5} stroke="rgba(255,255,255,0.06)" />)}
        <text x="185" y="14" fill="rgba(251,113,133,0.9)" fontSize="9" fontWeight="700">N400 300-500ms</text>
        <text x="260" y="136" fill="rgba(251,191,36,0.9)" fontSize="9" fontWeight="700">P600 500-800ms</text>
        <path d={pathFrom(points, "subjectA")} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
        <path d={pathFrom(points, "subjectB")} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
        <path d={pathFrom(points, "average")} fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <BandBar label="Theta" value={metrics.theta} color="#22d3ee" />
        <BandBar label="Alpha" value={metrics.alpha} color="#34d399" />
        <BandBar label="Beta" value={metrics.beta} color="#a78bfa" />
        <BandBar label="Gamma" value={metrics.gamma} color="#fb7185" />
      </div>
    </section>
  );
}
