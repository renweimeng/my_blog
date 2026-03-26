"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node as FlowNode } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { KnowledgeNode, Layer } from "@/types/knowledge";

export type KnowledgeFlowNodeData = {
  node: KnowledgeNode;
  isSelected: boolean;
  isRelated: boolean;
  isDimmed: boolean;
};

export type KnowledgeFlowNode = FlowNode<KnowledgeFlowNodeData, "knowledgeNode">;

const layerToneMap: Record<Layer, string> = {
  AI应用领域: "from-sky-500/20 via-cyan-400/16 to-blue-500/12 border-sky-400/45 text-sky-100",
  深度学习算法: "from-violet-500/20 via-fuchsia-400/16 to-sky-400/12 border-violet-400/45 text-violet-100",
  计算机硬件与系统: "from-amber-500/20 via-orange-400/16 to-rose-400/12 border-amber-400/45 text-amber-100",
  物理与信号: "from-emerald-500/18 via-teal-400/15 to-cyan-400/12 border-emerald-400/45 text-emerald-100",
  数学基础: "from-slate-300/25 via-slate-200/12 to-slate-400/10 border-slate-300/40 text-slate-100",
};

export function KnowledgeNodeCard({ data }: NodeProps<KnowledgeFlowNode>) {
  const tone = layerToneMap[data.node.layer];

  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-200/80 !bg-slate-900/90"
      />
      <div
        className={cn(
          "relative w-[220px] rounded-[26px] border bg-slate-950/80 p-4 shadow-[0_20px_50px_rgba(3,12,31,0.22)] backdrop-blur-md transition-all duration-300",
          "before:absolute before:inset-0 before:rounded-[24px] before:bg-gradient-to-br before:opacity-100 before:transition-opacity before:content-['']",
          tone,
          data.isSelected && "scale-[1.02] border-cyan-300/80 shadow-[0_24px_70px_rgba(56,189,248,0.28)]",
          data.isRelated && !data.isSelected && "border-cyan-300/45 shadow-[0_12px_36px_rgba(56,189,248,0.16)]",
          data.isDimmed && "opacity-30 saturate-50"
        )}
      >
        <div className="relative z-10 flex items-start justify-between gap-2">
          <Badge className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white/88">
            {data.node.layer}
          </Badge>
          <span className="text-xs font-medium text-white/55">{data.node.id}</span>
        </div>

        <div className="relative z-10 mt-3 space-y-2">
          <h3 className="text-[15px] font-semibold leading-snug text-white">{data.node.name}</h3>
          <p className="line-clamp-2 text-xs leading-5 text-white/66">{data.node.summary}</p>
        </div>

        <div className="relative z-10 mt-3 flex items-center justify-between text-xs text-white/60">
          <span>前置 {data.node.prerequisites.length} 个</span>
          <span>难度 {data.node.difficulty}/5</span>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-0 z-20 w-[250px] -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-2xl border border-white/10 bg-slate-950/95 p-3 opacity-0 shadow-[0_22px_50px_rgba(2,6,23,0.45)] transition-all duration-200 group-hover:translate-y-[calc(-100%-18px)] group-hover:opacity-100">
          <p className="text-sm font-semibold text-white">{data.node.name}</p>
          <p className="mt-1 text-xs text-cyan-200/85">所属层级：{data.node.layer}</p>
          <p className="mt-2 text-xs leading-5 text-white/72">{data.node.summary}</p>
          <p className="mt-2 text-[11px] text-white/50">直接前置知识数量：{data.node.prerequisites.length}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-200/80 !bg-slate-900/90"
      />
    </div>
  );
}
