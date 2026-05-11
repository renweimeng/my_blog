"use client";

import Link from "next/link";
import { Activity, BrainCircuit, Clock3, Radio, ShieldCheck, Wifi } from "lucide-react";
import { FullscreenButton } from "./FullscreenButton";
import type { MetricState } from "./types";

export function HeaderStatusBar({
  metrics,
  locale,
  currentTime,
}: {
  metrics: MetricState;
  locale: string;
  currentTime: string;
}) {
  const statusItems = [
    { icon: Wifi, label: "系统状态", value: "在线监测中", tone: "text-emerald-300" },
    { icon: Radio, label: "EEG 数据流", value: "Subject A / B 已连接", tone: "text-cyan-300" },
    { icon: Activity, label: "Token Trigger", value: "同步中", tone: "text-violet-300" },
    { icon: ShieldCheck, label: "采样率", value: "1000 Hz", tone: "text-sky-300" },
    { icon: Clock3, label: "推理延迟", value: `${Math.round(metrics.latency)} ms`, tone: "text-amber-300" },
  ];

  return (
    <header className="shrink-0 border-b border-cyan-100/10 bg-slate-950/78 px-4 py-3 shadow-[0_18px_60px_rgba(2,6,23,0.46)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-[280px] items-center gap-3">
          <Link
            href={`/${locale}/projects`}
            className="grid size-11 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/12 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.2)] transition hover:bg-cyan-300/18"
            aria-label="返回工程项目"
          >
            <BrainCircuit className="size-6" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-[0.02em] text-white md:text-2xl">Deepheck 在线实时监测系统</h1>
              <span className="hidden rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-200 sm:inline-flex">ACTIVE</span>
            </div>
            <p className="mt-0.5 text-xs text-cyan-100/62">双人脑电神经语义对齐监测</p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Icon className={`size-3.5 ${item.tone}`} />
                  {item.label}
                </div>
                <div className={`mt-0.5 text-xs font-semibold ${item.tone}`}>{item.value}</div>
              </div>
            );
          })}
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-right backdrop-blur-xl">
            <div className="text-[10px] text-slate-400">当前时间</div>
            <div className="mt-0.5 font-mono text-xs font-semibold text-white">{currentTime}</div>
          </div>
          <FullscreenButton />
        </div>
      </div>
    </header>
  );
}
