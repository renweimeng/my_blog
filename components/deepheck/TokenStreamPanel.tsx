"use client";

import { AlertTriangle, MessageSquareText, ScanLine } from "lucide-react";
import type { MetricState, TokenState } from "./types";

function tokenClass(risk: number, active: boolean) {
  const base = "relative mb-1 mr-1 inline-flex rounded-md px-1.5 py-0.5 transition-all duration-300";
  if (risk > 0.68) {
    return `${base} bg-rose-500/26 text-rose-50 shadow-[0_0_18px_rgba(244,63,94,0.35)] ${active ? "ring-2 ring-rose-200/70 animate-pulse" : ""}`;
  }
  if (risk > 0.42) {
    return `${base} bg-amber-400/20 text-amber-50 shadow-[0_0_14px_rgba(245,158,11,0.18)] ${active ? "ring-2 ring-amber-200/65 animate-pulse" : ""}`;
  }
  return `${base} bg-cyan-300/6 text-slate-100 ${active ? "ring-2 ring-cyan-200/60 animate-pulse" : ""}`;
}

export function TokenStreamPanel({ tokenState, metrics }: { tokenState: TokenState; metrics: MetricState }) {
  const visibleTokens = tokenState.tokens.slice(0, tokenState.cursor);
  const activeIndex = tokenState.cursor - 1;
  const highCount = visibleTokens.filter((token) => token.risk > 0.68).length;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-[0_20px_80px_rgba(2,6,23,0.32)] backdrop-blur-2xl">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <MessageSquareText className="size-4 text-cyan-300" />
              LLM 回答流与 Token 级风险定位
            </div>
            <p className="mt-1 text-xs text-slate-400">神经语义对齐 · Token Trigger 锁相 · 在线预警</p>
          </div>
          <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-right">
            <div className="text-[10px] text-rose-200/80">当前 Token 风险</div>
            <div className="font-mono text-xl font-black text-rose-100">{metrics.tokenRisk.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="rounded-2xl border border-cyan-100/10 bg-slate-950/48 p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200/80">
            <ScanLine className="size-3.5" />
            输入问题
          </div>
          <p className="text-sm leading-6 text-slate-100">{tokenState.question}</p>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/44 p-4 text-base leading-8 text-slate-100">
          {visibleTokens.map((token, index) => (
            <span key={`${token.text}-${index}`} className={tokenClass(token.risk, index === activeIndex)} title={`风险概率 ${token.risk.toFixed(2)}`}>
              {token.text}
            </span>
          ))}
          <span className="ml-1 inline-flex h-5 w-2 animate-pulse rounded-sm bg-cyan-200/80 align-middle" />
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Token 时间轴</span>
          <span className="inline-flex items-center gap-1 text-rose-200"><AlertTriangle className="size-3.5" /> 高风险片段 {highCount}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tokenState.tokens.map((token, index) => {
            const visible = index < tokenState.cursor;
            const active = index === activeIndex;
            const color = token.risk > 0.68 ? "bg-rose-400" : token.risk > 0.42 ? "bg-amber-300" : "bg-cyan-300";
            return (
              <span
                key={`${token.text}-${index}-dot`}
                className={`h-2.5 rounded-full transition-all duration-300 ${visible ? color : "bg-white/10"} ${active ? "w-7 shadow-[0_0_16px_currentColor]" : "w-2.5"}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
