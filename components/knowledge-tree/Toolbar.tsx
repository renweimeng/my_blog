"use client";

import { Compass, GitBranch, Maximize2, Minimize2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LayerFilter } from "@/components/knowledge-tree/LayerFilter";
import { SearchBar } from "@/components/knowledge-tree/SearchBar";
import { cn } from "@/lib/utils/cn";
import type { LayerFilterOption } from "@/types/knowledge";

interface ToolbarProps {
  searchKeyword: string;
  searchStatus: string;
  filterLayer: LayerFilterOption;
  pathOnly: boolean;
  visibleCount: number;
  totalCount: number;
  selectedName?: string;
  floating?: boolean;
  isFullscreen: boolean;
  onSearchKeywordChange: (value: string) => void;
  onSearch: () => void;
  onFilterChange: (value: LayerFilterOption) => void;
  onTogglePathOnly: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
}

export function Toolbar({
  searchKeyword,
  searchStatus,
  filterLayer,
  pathOnly,
  visibleCount,
  totalCount,
  selectedName,
  floating = false,
  isFullscreen,
  onSearchKeywordChange,
  onSearch,
  onFilterChange,
  onTogglePathOnly,
  onReset,
  onToggleFullscreen,
}: ToolbarProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        floating
          ? "rounded-[1.5rem] border border-white/10 bg-transparent p-3 shadow-none sm:p-4"
          : "rounded-[2rem] border border-white/15 bg-slate-950/78 p-6 shadow-[0_30px_80px_rgba(3,12,31,0.28)] backdrop-blur-md sm:p-7"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_70%)]" />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium tracking-[0.16em] text-cyan-100 uppercase">
              <Sparkles className="size-3.5" />
              自顶向下学习法知识大树
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                先看山顶，再反推山路
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
                点击任何高层目标，系统会递归找出它所依赖的所有前置知识，并给出一条从数学基础一路走到应用目标的推荐学习顺序。
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-xl flex-col gap-3">
            <SearchBar
              value={searchKeyword}
              status={searchStatus}
              onChange={onSearchKeywordChange}
              onSearch={onSearch}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={pathOnly ? "default" : "outline"}
                className={pathOnly ? "rounded-full" : "rounded-full border-white/15 bg-slate-950/45 text-white/80 hover:bg-white/10"}
                onClick={onTogglePathOnly}
              >
                <GitBranch className="size-4" />
                仅查看当前学习路径
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-white/15 bg-slate-950/45 text-white/80 hover:bg-white/10"
                onClick={onReset}
              >
                <RotateCcw className="size-4" />
                重置图谱
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-white/15 bg-slate-950/45 text-white/80 hover:bg-white/10"
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                {isFullscreen ? "退出全屏" : "全屏模式"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-white">按层筛选</p>
              <p className="mt-1 text-xs text-white/55">可以只看某一层，也可以结合“仅查看当前学习路径”观察依赖闭包。</p>
            </div>
            <LayerFilter value={filterLayer} onChange={onFilterChange} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-white/58">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <Compass className="size-4" />
            当前可见节点 {visibleCount} / {totalCount}
          </span>
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            默认支持拖拽画布、缩放和自动居中
          </span>
          {selectedName ? (
            <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-cyan-100">
              当前聚焦：{selectedName}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
