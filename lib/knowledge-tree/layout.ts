import { layerDisplayOrder } from "@/data/knowledgeGraph";
import type { KnowledgeNode } from "@/types/knowledge";

export const KNOWLEDGE_NODE_WIDTH = 220;
export const KNOWLEDGE_NODE_HEIGHT = 118;
export const KNOWLEDGE_CANVAS_WIDTH = 1960;
export const KNOWLEDGE_CANVAS_HEIGHT = 1760;

const HORIZONTAL_GAP = 30;
const ROW_GAP = 26;
const TOP_PADDING = 88;
const BAND_HEIGHT = 304;

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

export function getKnowledgeLayout(nodes: KnowledgeNode[]) {
  const positions = new Map<string, { x: number; y: number }>();

  layerDisplayOrder.forEach((layer, bandIndex) => {
    const layerNodes = nodes.filter((node) => node.layer === layer);
    const rowSize = layerNodes.length > 7 ? Math.ceil(layerNodes.length / 2) : layerNodes.length;
    const rows = chunk(layerNodes, rowSize);
    const bandTop = TOP_PADDING + bandIndex * BAND_HEIGHT;

    rows.forEach((row, rowIndex) => {
      const rowWidth = row.length * KNOWLEDGE_NODE_WIDTH + Math.max(0, row.length - 1) * HORIZONTAL_GAP;
      const startX = (KNOWLEDGE_CANVAS_WIDTH - rowWidth) / 2;
      const y = bandTop + 54 + rowIndex * (KNOWLEDGE_NODE_HEIGHT + ROW_GAP);

      row.forEach((node, columnIndex) => {
        positions.set(node.id, {
          x: startX + columnIndex * (KNOWLEDGE_NODE_WIDTH + HORIZONTAL_GAP),
          y,
        });
      });
    });
  });

  return positions;
}
