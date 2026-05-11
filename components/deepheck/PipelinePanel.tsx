"use client";

import { GitBranch } from "lucide-react";

const pipeline = [
  "EEG 数据流接入",
  "滑动窗口切片",
  "伪迹抑制",
  "ERP/PSD/PLV 特征提取",
  "神经语义对齐",
  "交叉注意融合",
  "Token 风险输出",
  "回答级风险评分",
];

export function PipelinePanel() {
  return (
    <section className="h-full rounded-2xl border border-cyan-100/12 bg-slate-950/72 p-2.5 shadow-[0_16px_46px_rgba(2,6,23,0.34)] backdrop-blur-2xl">
      <div className="mb-2 flex items-center gap-2 text-xs font-black text-white">
        <GitBranch className="size-3.5 text-cyan-300" />
        在线处理流水线
      </div>
      <div className="relative h-[54px] overflow-hidden rounded-xl border border-white/10 bg-slate-950/48 p-2">
        <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-[deepheck-flow_2.6s_linear_infinite] bg-gradient-to-r from-transparent via-cyan-300/18 to-transparent" />
        <div className="relative flex h-full flex-nowrap items-center gap-1.5 overflow-hidden">
          {pipeline.map((node, index) => (
            <div key={node} className="flex min-w-0 shrink items-center gap-1.5">
              <span className="truncate rounded-lg border border-cyan-100/12 bg-cyan-300/8 px-2 py-1.5 text-[10px] font-semibold text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.06)]">
                {node}
              </span>
              {index < pipeline.length - 1 && <span className="text-cyan-300/50">→</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
