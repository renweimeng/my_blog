"use client";

import { ArrowUpRight, BrainCircuit, Layers3, ListTree, Orbit, Route, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { layerMetas } from "@/data/knowledgeGraph";
import { cn } from "@/lib/utils/cn";
import type { KnowledgeNode } from "@/types/knowledge";

interface DetailPanelProps {
  selectedNode: KnowledgeNode | null;
  directPrerequisites: KnowledgeNode[];
  directUnlocks: KnowledgeNode[];
  learningOrder: KnowledgeNode[];
  recentNodes: KnowledgeNode[];
  pathDepth: number;
  allPrerequisiteCount: number;
  onSelectNode: (nodeId: string) => void;
}

function LinkCloud({
  title,
  items,
  emptyText,
  onSelectNode,
}: {
  title: string;
  items: KnowledgeNode[];
  emptyText: string;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-white/88">{title}</p>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNode(item.id)}
              className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/78 transition hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-cyan-100"
            >
              {item.name}
              <ArrowUpRight className="size-3" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs leading-5 text-white/42">{emptyText}</p>
      )}
    </div>
  );
}

export function DetailPanel({
  selectedNode,
  directPrerequisites,
  directUnlocks,
  learningOrder,
  recentNodes,
  pathDepth,
  allPrerequisiteCount,
  onSelectNode,
}: DetailPanelProps) {
  const layerMeta = selectedNode
    ? layerMetas.find((item) => item.key === selectedNode.layer)
    : null;

  if (!selectedNode) {
    return (
      <aside className="space-y-4">
        <Card className="border-white/12 bg-slate-950/78 text-white shadow-[0_25px_70px_rgba(3,12,31,0.22)] backdrop-blur-md">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
              <Sparkles className="size-3.5" />
              右侧详情面板
            </div>
            <CardTitle className="text-2xl leading-tight">点击任意节点，查看它真正依赖的“知识地基”</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-7 text-white/72">
            <p>
              这张图不是普通的树，而是一张分层 DAG。你看到的高层目标，其实都建立在一整片下层知识网络之上。
            </p>
            <div className="grid gap-3">
              {[
                { id: "D10", label: "试试：Transformer" },
                { id: "A09", label: "试试：智能体 Agent 与工具调用" },
                { id: "A06", label: "试试：医学 AI" },
              ].map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="outline"
                  className="justify-start rounded-2xl border-white/12 bg-white/6 text-left text-white hover:bg-white/10"
                  onClick={() => onSelectNode(item.id)}
                >
                  <BrainCircuit className="size-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/12 bg-slate-950/72 text-white shadow-[0_20px_55px_rgba(3,12,31,0.2)] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">最近浏览</CardTitle>
          </CardHeader>
          <CardContent>
            {recentNodes.length ? (
              <div className="flex flex-wrap gap-2">
                {recentNodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => onSelectNode(node.id)}
                    className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/76 transition hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-cyan-100"
                  >
                    {node.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/45">你点击过的节点会出现在这里，方便来回比较知识路径。</p>
            )}
          </CardContent>
        </Card>
      </aside>
    );
  }

  return (
    <aside className="space-y-4">
      <Card className="border-white/12 bg-slate-950/78 text-white shadow-[0_25px_70px_rgba(3,12,31,0.22)] backdrop-blur-md">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-cyan-400/12 text-cyan-100">
              {layerMeta?.label ?? selectedNode.layer}
            </Badge>
            <Badge variant="outline" className="border-white/12 text-white/70">
              难度 {selectedNode.difficulty}/5
            </Badge>
            <Badge variant="outline" className="border-white/12 text-white/70">
              全部前置知识 {allPrerequisiteCount} 个
            </Badge>
          </div>
          <CardTitle className="text-2xl leading-tight">{selectedNode.name}</CardTitle>
          <p className="text-sm leading-7 text-white/72">{selectedNode.summary}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
                <Layers3 className="size-3.5" /> 当前路径深度
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{pathDepth}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
                <Route className="size-3.5" /> 推荐顺序长度
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{learningOrder.length}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <p className="text-sm font-medium text-white/90">为什么它重要</p>
            <p className="mt-3 text-sm leading-7 text-white/68">{selectedNode.whyImportant}</p>
          </div>

          <LinkCloud
            title="直接前置知识"
            items={directPrerequisites}
            emptyText="这是一个很底层的起点节点，没有更基础的直接前置知识。"
            onSelectNode={onSelectNode}
          />

          <LinkCloud
            title="上层可解锁节点"
            items={directUnlocks}
            emptyText="当前还没有更上层节点把它直接作为前置知识。"
            onSelectNode={onSelectNode}
          />
        </CardContent>
      </Card>

      <Card className="border-white/12 bg-slate-950/72 text-white shadow-[0_20px_55px_rgba(3,12,31,0.2)] backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListTree className="size-4.5" />
            推荐学习顺序
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {learningOrder.map((node, index) => (
              <li
                key={node.id}
                className={cn(
                  "rounded-2xl border border-white/10 bg-white/6 p-3 transition",
                  node.id === selectedNode.id && "border-cyan-300/35 bg-cyan-400/10"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectNode(node.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/75">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white">{node.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/52">{node.layer}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-white/12 bg-slate-950/72 text-white shadow-[0_20px_55px_rgba(3,12,31,0.2)] backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Orbit className="size-4.5" />
            最近浏览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {recentNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => onSelectNode(node.id)}
                className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/76 transition hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-cyan-100"
              >
                {node.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
