"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { knowledgeEdges, knowledgeNodeMap, knowledgeNodes } from "@/data/knowledgeGraph";
import { FloatingPanel } from "@/components/knowledge-tree/FloatingPanel";
import { GraphCanvas } from "@/components/knowledge-tree/GraphCanvas";
import { DetailPanel } from "@/components/knowledge-tree/DetailPanel";
import { Toolbar } from "@/components/knowledge-tree/Toolbar";
import {
  getAllPrerequisites,
  getDirectPrerequisites,
  getDirectUnlockNodes,
  getHighlightedEdges,
  getLearningOrder,
  getPathDepth,
  getRelatedSubgraphIds,
  searchKnowledgeNodes,
} from "@/lib/knowledge-tree/graph";
import { useKnowledgeTreeStore } from "@/store/useKnowledgeTreeStore";
import type { KnowledgeNode } from "@/types/knowledge";

export function KnowledgeTreeApp() {
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const {
    selectedNodeId,
    filterLayer,
    searchKeyword,
    pathOnly,
    recentNodeIds,
    selectNode,
    setFilterLayer,
    setSearchKeyword,
    setPathOnly,
    togglePathOnly,
    resetExplorer,
  } = useKnowledgeTreeStore();

  const [searchStatus, setSearchStatus] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === workspaceRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const selectedNode = useMemo(
    () => (selectedNodeId ? knowledgeNodeMap.get(selectedNodeId) ?? null : null),
    [selectedNodeId]
  );

  const relatedNodeIds = useMemo(
    () => (selectedNodeId ? getRelatedSubgraphIds(selectedNodeId) : new Set<string>()),
    [selectedNodeId]
  );

  const highlightedEdgeIds = useMemo(
    () => (selectedNodeId ? getHighlightedEdges(selectedNodeId) : new Set<string>()),
    [selectedNodeId]
  );

  const visibleNodeIds = useMemo(() => {
    if (pathOnly && selectedNodeId) {
      const pathIds = getRelatedSubgraphIds(selectedNodeId);
      if (filterLayer === "全部") return pathIds;
      const filteredPath = new Set(
        Array.from(pathIds).filter((id) => {
          const node = knowledgeNodeMap.get(id);
          return node?.layer === filterLayer || id === selectedNodeId;
        })
      );
      return filteredPath.size > 0 ? filteredPath : pathIds;
    }

    if (filterLayer === "全部") {
      return new Set(knowledgeNodes.map((node) => node.id));
    }

    return new Set(
      knowledgeNodes
        .filter((node) => node.layer === filterLayer)
        .map((node) => node.id)
    );
  }, [filterLayer, pathOnly, selectedNodeId]);

  const visibleNodes = useMemo(
    () => knowledgeNodes.filter((node) => visibleNodeIds.has(node.id)),
    [visibleNodeIds]
  );

  const visibleEdges = useMemo(
    () =>
      knowledgeEdges.filter(
        (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
      ),
    [visibleNodeIds]
  );

  const directPrerequisites = useMemo(
    () => (selectedNodeId ? getDirectPrerequisites(selectedNodeId) : []),
    [selectedNodeId]
  );

  const allPrerequisites = useMemo(
    () => (selectedNodeId ? getAllPrerequisites(selectedNodeId) : []),
    [selectedNodeId]
  );

  const learningOrder = useMemo(
    () => (selectedNodeId ? getLearningOrder(selectedNodeId) : []),
    [selectedNodeId]
  );

  const directUnlocks = useMemo(
    () => (selectedNodeId ? getDirectUnlockNodes(selectedNodeId) : []),
    [selectedNodeId]
  );

  const pathDepth = useMemo(
    () => (selectedNodeId ? getPathDepth(selectedNodeId) : 0),
    [selectedNodeId]
  );

  const recentNodes = useMemo(
    () =>
      recentNodeIds
        .map((id) => knowledgeNodeMap.get(id))
        .filter((node): node is KnowledgeNode => Boolean(node)),
    [recentNodeIds]
  );

  function focusNode(nodeId: string, revealAll = false) {
    const node = knowledgeNodeMap.get(nodeId);
    if (!node) return;

    if (revealAll || (filterLayer !== "全部" && node.layer !== filterLayer)) {
      setFilterLayer("全部");
    }

    if (revealAll && pathOnly) {
      setPathOnly(false);
    }

    selectNode(nodeId);
  }

  function handleSearch() {
    const query = searchKeyword.trim();
    if (!query) {
      setSearchStatus("请先输入一个中文关键词或节点名。");
      return;
    }

    const results = searchKnowledgeNodes(query);
    if (results.length === 0) {
      setSearchStatus("没有找到匹配节点，可以试试标签关键词，比如“优化”“部署”“多模态”。");
      return;
    }

    const bestMatch = results[0];
    focusNode(bestMatch.id, true);
    setSearchStatus(`已定位到「${bestMatch.name}」，共找到 ${results.length} 个候选结果。`);
  }

  async function handleToggleFullscreen() {
    if (document.fullscreenElement === workspaceRef.current) {
      await document.exitFullscreen();
      return;
    }

    await workspaceRef.current?.requestFullscreen();
  }

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <div
        ref={workspaceRef}
        className="relative min-h-[calc(100vh-9rem)] overflow-hidden border-y border-white/10 bg-slate-950/65 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      >
        <GraphCanvas
          nodes={visibleNodes}
          edges={visibleEdges}
          selectedNodeId={selectedNodeId}
          highlightedNodeIds={relatedNodeIds}
          highlightedEdgeIds={highlightedEdgeIds}
          fullscreen={isFullscreen}
          onSelectNode={(nodeId) => {
            focusNode(nodeId, false);
            const node = knowledgeNodeMap.get(nodeId);
            if (node) {
              setSearchStatus(`已聚焦「${node.name}」，右侧已同步显示学习路径与节点说明。`);
            }
          }}
        />

        <div className="pointer-events-none absolute inset-0 z-30">
          <FloatingPanel
            title="知识树工作台"
            subtitle="搜索、筛选、重置与路径控制都浮在图谱之上。"
            width={780}
            initialX={22}
            initialY={18}
            className="max-w-[calc(100vw-1.5rem)]"
          >
            <Toolbar
              searchKeyword={searchKeyword}
              searchStatus={searchStatus}
              filterLayer={filterLayer}
              pathOnly={pathOnly}
              visibleCount={visibleNodes.length}
              totalCount={knowledgeNodes.length}
              selectedName={selectedNode?.name}
              floating
              isFullscreen={isFullscreen}
              onSearchKeywordChange={setSearchKeyword}
              onSearch={handleSearch}
              onFilterChange={setFilterLayer}
              onTogglePathOnly={togglePathOnly}
              onToggleFullscreen={handleToggleFullscreen}
              onReset={() => {
                resetExplorer();
                setSearchStatus("图谱已重置：清空高亮并恢复默认全图视角。");
              }}
            />
          </FloatingPanel>

          <FloatingPanel
            title="节点详情"
            subtitle="可拖拽、可折叠；需要时把它挪开，图谱就能整屏操作。"
            width={430}
            dock="right"
            initialY={18}
            initiallyMinimized={false}
            className="max-w-[calc(100vw-1.5rem)]"
          >
            <DetailPanel
              selectedNode={selectedNode}
              directPrerequisites={directPrerequisites}
              directUnlocks={directUnlocks}
              learningOrder={learningOrder}
              recentNodes={recentNodes}
              pathDepth={pathDepth}
              allPrerequisiteCount={allPrerequisites.length}
              onSelectNode={(nodeId) => {
                focusNode(nodeId, true);
                const node = knowledgeNodeMap.get(nodeId);
                if (node) {
                  setSearchStatus(`已从面板跳转到「${node.name}」。`);
                }
              }}
            />
          </FloatingPanel>
        </div>
      </div>
    </div>
  );
}
