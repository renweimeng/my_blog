"use client";

import { Gauge, TrendingUp } from "lucide-react";
import { metricColor } from "./dataGenerator";
import type { MetricState } from "./types";

function Stat({ label, value, tone = "text-cyan-100" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.045] p-2">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className={`mt-0.5 font-mono text-xs font-black ${tone}`}>{value}</div>
    </div>
  );
}

export function RiskGaugePanel({ metrics }: { metrics: MetricState }) {
  const score = Math.round(metrics.answerRisk);
  const color = metricColor(metrics.answerRisk);
  const circumference = 2 * Math.PI * 58;
  const dash = (score / 100) * circumference;
  const label = score >= 65 ? "高风险" : score >= 30 ? "中风险" : "低风险";

  return (
    <section className={`rounded-3xl border bg-white/[0.055] p-3 shadow-[0_20px_70px_rgba(2,6,23,0.32)] backdrop-blur-2xl transition ${score >= 65 ? "border-rose-300/28 shadow-rose-950/30" : "border-white/10"}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Gauge className="size-4 text-cyan-300" />
            实时幻觉风险评分
          </div>
          <p className="mt-1 text-xs text-slate-400">回答级融合评分 · 平滑递推</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold" style={{ color }}>{label}</span>
      </div>

      <div className="grid items-center gap-3 lg:grid-cols-[128px_1fr]">
        <div className="relative mx-auto size-32">
          <svg viewBox="0 0 140 140" className="size-32 -rotate-90">
            <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="none"
              stroke={color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              className="transition-all duration-700 ease-out"
              style={{ filter: `drop-shadow(0 0 12px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-mono text-3xl font-black text-white">{score}</div>
              <div className="text-xs font-semibold text-slate-400">/ 100</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Token 级风险均值" value={metrics.tokenRisk.toFixed(2)} tone="text-rose-100" />
          <Stat label="当前前缀风险" value={metrics.prefixRisk.toFixed(2)} tone="text-amber-100" />
          <Stat label="脑际同步下降指数" value={metrics.plvDrop.toFixed(2)} tone="text-violet-100" />
          <Stat label="N400 异常幅值" value={`${metrics.n400.toFixed(1)} μV`} tone="text-cyan-100" />
          <Stat label="P600 重分析强度" value={`${metrics.p600.toFixed(1)} μV`} tone="text-fuchsia-100" />
          <Stat label="当前 Trial" value={`#${metrics.trial}`} tone="text-emerald-100" />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/42 px-3 py-1.5 text-[11px] text-slate-300">
        <TrendingUp className="size-4" style={{ color }} />
        在线预警阈值随 Token 风险、ERP 异常和脑际同步下降动态校准
      </div>
    </section>
  );
}
