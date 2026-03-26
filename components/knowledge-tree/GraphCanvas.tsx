"use client";

import { memo, useEffect, useMemo, type ComponentType } from "react";
import {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge as FlowEdge,
  type Node as FlowNode,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import { layerMetas, knowledgeNodeMap, knowledgeNodes } from "@/data/knowledgeGraph";
import {
  getKnowledgeLayout,
  KNOWLEDGE_NODE_HEIGHT,
  KNOWLEDGE_NODE_WIDTH,
} from "@/lib/knowledge-tree/layout";
import { KnowledgeNodeCard, type KnowledgeFlowNodeData } from "@/components/knowledge-tree/KnowledgeNodeCard";
import { cn } from "@/lib/utils/cn";
import type { KnowledgeEdge, KnowledgeNode, Layer } from "@/types/knowledge";

const nodeTypes: NodeTypes = {
  knowledgeNode: KnowledgeNodeCard as ComponentType<NodeProps>,
};

const staticLayout = getKnowledgeLayout(knowledgeNodes);

const minimapColors: Record<Layer, string> = {
  AI应用领域: "#38bdf8",
  深度学习算法: "#a855f7",
  计算机硬件与系统: "#f59e0b",
  物理与信号: "#10b981",
  数学基础: "#94a3b8",
};

interface GraphCanvasProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  selectedNodeId: string | null;
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
  onSelectNode: (nodeId: string) => void;
  fullscreen?: boolean;
  className?: string;
}

function GraphCanvasInner({
  nodes,
  edges,
  selectedNodeId,
  highlightedNodeIds,
  highlightedEdgeIds,
  onSelectNode,
  fullscreen = false,
  className,
}: GraphCanvasProps) {
  const { fitView, setCenter, getNode } = useReactFlow();

  const flowNodes = useMemo<FlowNode<KnowledgeFlowNodeData>[]>(() => {
    return nodes.map((node) => {
      const position = staticLayout.get(node.id) ?? { x: 0, y: 0 };
      const isSelected = node.id === selectedNodeId;
      const isRelated = highlightedNodeIds.has(node.id);
      const isDimmed = Boolean(selectedNodeId) && !isSelected && !isRelated;

      return {
        id: node.id,
        type: "knowledgeNode",
        position,
        draggable: false,
        selectable: false,
        data: {
          node,
          isSelected,
          isRelated,
          isDimmed,
        },
        zIndex: isSelected ? 25 : isRelated ? 16 : 4,
      };
    });
  }, [nodes, selectedNodeId, highlightedNodeIds]);

  const flowEdges = useMemo<FlowEdge[]>(() => {
    return edges.map((edge) => {
      const isHighlighted = highlightedEdgeIds.has(edge.id);
      const dimmed = Boolean(selectedNodeId) && !isHighlighted;
      return {
        ...edge,
        type: "smoothstep",
        animated: isHighlighted,
        zIndex: isHighlighted ? 18 : 2,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: isHighlighted ? "#67e8f9" : "rgba(148, 163, 184, 0.38)",
        },
        style: {
          stroke: isHighlighted ? "#67e8f9" : "rgba(148, 163, 184, 0.34)",
          strokeWidth: isHighlighted ? 2.8 : 1.15,
          opacity: dimmed ? 0.16 : isHighlighted ? 1 : 0.56,
        },
      };
    });
  }, [edges, selectedNodeId, highlightedEdgeIds]);

  const nodeIdsKey = useMemo(() => nodes.map((node) => node.id).join("|"), [nodes]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (selectedNodeId) {
        const selectedFlowNode = getNode(selectedNodeId);
        if (selectedFlowNode) {
          const width = selectedFlowNode.measured?.width ?? KNOWLEDGE_NODE_WIDTH;
          const height = selectedFlowNode.measured?.height ?? KNOWLEDGE_NODE_HEIGHT;
          setCenter(
            selectedFlowNode.position.x + width / 2,
            selectedFlowNode.position.y + height / 2,
            {
              zoom: 0.98,
              duration: 720,
            }
          );
          return;
        }
      }

      fitView({
        duration: 720,
        padding: 0.16,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [fitView, getNode, nodeIdsKey, selectedNodeId, setCenter]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_28%),radial-gradient(circle_at_right,rgba(168,85,247,0.1),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.9))]",
        fullscreen ? "h-screen min-h-screen" : "h-[calc(100vh-9rem)] min-h-[860px]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 grid grid-rows-5 gap-4 p-4">
        {layerMetas.map((meta) => (
          <div
            key={meta.key}
            className="rounded-[1.75rem] border border-white/6 bg-white/[0.015] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            style={{
              background: `linear-gradient(90deg, ${meta.glow}, transparent 72%), rgba(255,255,255,0.018)`,
            }}
          >
            <div className="p-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-3 py-1.5 text-xs font-medium text-white/76 backdrop-blur-sm">
                <span className="size-2 rounded-full" style={{ backgroundColor: minimapColors[meta.key] }} />
                {meta.label}
              </div>
              <p className="mt-2 max-w-sm text-xs leading-5 text-white/42">{meta.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 z-10">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.38}
          maxZoom={1.75}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          onNodeClick={(_, node) => onSelectNode(node.id)}
          proOptions={{ hideAttribution: true }}
          className="bg-transparent"
        >
          <Background color="rgba(148, 163, 184, 0.14)" gap={28} size={1} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => minimapColors[knowledgeNodeMap.get(node.id)?.layer ?? "数学基础"]}
            maskColor="rgba(3,12,31,0.8)"
            className="!m-4 !overflow-hidden !rounded-2xl !border !border-white/10 !bg-slate-950/85"
          />
          <Controls className="!m-4 !overflow-hidden !rounded-2xl !border !border-white/10 !bg-slate-950/90 [&>button]:!border-0 [&>button]:!bg-slate-950/90 [&>button]:!text-white [&>button:hover]:!bg-white/10" />
        </ReactFlow>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-full border border-white/10 bg-slate-950/72 px-3 py-2 text-xs text-white/62 backdrop-blur-md">
        提示：现在图谱就是主舞台。直接拖动画布、缩放视角；面板都可以拖走或缩小。
      </div>
    </div>
  );
}

export const GraphCanvas = memo(function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
});
