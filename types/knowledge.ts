export type Layer =
  | "数学基础"
  | "物理与信号"
  | "计算机硬件与系统"
  | "深度学习算法"
  | "AI应用领域";

export type LayerFilterOption = "全部" | Layer;

export interface KnowledgeNode {
  id: string;
  name: string;
  layer: Layer;
  layerOrder: number;
  summary: string;
  whyImportant: string;
  prerequisites: string[];
  difficulty: number;
  tags: string[];
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
}

export interface LayerMeta {
  key: Layer;
  label: string;
  shortLabel: string;
  order: number;
  accent: string;
  glow: string;
  description: string;
}
