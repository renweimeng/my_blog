"use client";

import { Network } from "lucide-react";
import type { MetricState, PlvMatrix } from "./types";

function colorFor(value: number) {
  if (value > 0.78) return `rgba(251, 113, 133, ${0.35 + value * 0.45})`;
  if (value > 0.58) return `rgba(250, 204, 21, ${0.25 + value * 0.45})`;
  if (value > 0.38) return `rgba(34, 211, 238, ${0.24 + value * 0.45})`;
  return `rgba(30, 64, 175, ${0.32 + value * 0.4})`;
}

export function PLVHeatmapPanel({ matrix, metrics }: { matrix: PlvMatrix; metrics: MetricState }) {
  const flat = matrix.flat();
  const average = flat.reduce((sum, value) => sum + value, 0) / flat.length;
  const thetaPlv = Math.max(0, average - metrics.plvDrop * 0.12 + 0.04);
  const alphaPlv = Math.max(0, average + 0.04 - metrics.plvDrop * 0.08);
  const stability = Math.max(0, 1 - metrics.plvDrop * 0.82);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Network className="size-4 text-cyan-300" />
            脑际同步 PLV 热力图
          </div>
          <p className="mt-1 text-xs text-slate-400">Subject A × Subject B 脑区同步矩阵</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-right">
          <div className="text-[10px] text-cyan-100/72">平均 PLV</div>
          <div className="font-mono text-lg font-black text-cyan-100">{average.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_110px]">
        <div className="grid grid-cols-8 gap-1 rounded-2xl border border-white/10 bg-slate-950/48 p-2">
          {matrix.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square rounded-md border border-white/5 transition-all duration-500"
                style={{ background: colorFor(value), boxShadow: value > 0.75 ? `0 0 10px ${colorFor(value)}` : undefined }}
                title={`A${rowIndex + 1} - B${colIndex + 1}: ${value.toFixed(2)}`}
              />
            )),
          )}
        </div>

        <div className="relative min-h-32 rounded-2xl border border-white/10 bg-slate-950/48 p-2">
          <svg viewBox="0 0 100 130" className="h-full w-full">
            <ellipse cx="30" cy="48" rx="18" ry="28" fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.45)" />
            <ellipse cx="70" cy="48" rx="18" ry="28" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.45)" />
            {[18, 30, 42, 58, 70, 82].map((x, index) => (
              <circle key={x} cx={x} cy={index < 3 ? 40 + index * 13 : 40 + (index - 3) * 13} r="2.6" fill={index < 3 ? "#22d3ee" : "#a78bfa"} />
            ))}
            <line x1="30" y1="40" x2="70" y2="40" stroke="#22d3ee" strokeOpacity={stability} strokeWidth="1.7" />
            <line x1="30" y1="53" x2="70" y2="66" stroke="#fbbf24" strokeOpacity={thetaPlv} strokeWidth="1.5" />
            <line x1="30" y1="66" x2="70" y2="53" stroke="#fb7185" strokeOpacity={1 - stability * 0.35} strokeWidth="1.3" />
            <text x="12" y="112" fill="rgba(203,213,225,0.8)" fontSize="8">脑区连接示意</text>
          </svg>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-white/[0.045] p-2 text-slate-300">Theta PLV <b className="float-right font-mono text-cyan-100">{thetaPlv.toFixed(2)}</b></div>
        <div className="rounded-xl bg-white/[0.045] p-2 text-slate-300">Alpha PLV <b className="float-right font-mono text-emerald-100">{alphaPlv.toFixed(2)}</b></div>
        <div className="col-span-2 rounded-xl bg-white/[0.045] p-2 text-slate-300">同步稳定性指数 <b className="float-right font-mono text-violet-100">{stability.toFixed(2)}</b></div>
      </div>
    </section>
  );
}
