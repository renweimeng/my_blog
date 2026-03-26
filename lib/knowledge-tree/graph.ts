import { knowledgeEdges, knowledgeNodeMap, knowledgeNodes } from "@/data/knowledgeGraph";
import type { KnowledgeEdge, KnowledgeNode } from "@/types/knowledge";

function sortNodes(a: KnowledgeNode, b: KnowledgeNode) {
  if (a.layerOrder !== b.layerOrder) return a.layerOrder - b.layerOrder;
  if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
  return a.id.localeCompare(b.id, "zh-CN");
}

export function getDirectPrerequisites(nodeId: string, nodeMap = knowledgeNodeMap): KnowledgeNode[] {
  const node = nodeMap.get(nodeId);
  if (!node) return [];
  return node.prerequisites
    .map((id) => nodeMap.get(id))
    .filter((item): item is KnowledgeNode => Boolean(item))
    .sort(sortNodes);
}

export function getRelatedSubgraphIds(nodeId: string, nodeMap = knowledgeNodeMap): Set<string> {
  const visited = new Set<string>();

  function dfs(currentId: string) {
    if (visited.has(currentId)) return;
    visited.add(currentId);
    const current = nodeMap.get(currentId);
    if (!current) return;
    current.prerequisites.forEach(dfs);
  }

  dfs(nodeId);
  return visited;
}

export function getAllPrerequisites(nodeId: string, nodeMap = knowledgeNodeMap): KnowledgeNode[] {
  const subgraphIds = getRelatedSubgraphIds(nodeId, nodeMap);
  subgraphIds.delete(nodeId);
  return Array.from(subgraphIds)
    .map((id) => nodeMap.get(id))
    .filter((item): item is KnowledgeNode => Boolean(item))
    .sort(sortNodes);
}

export function getHighlightedEdges(nodeId: string, nodeMap = knowledgeNodeMap): Set<string> {
  const closure = getRelatedSubgraphIds(nodeId, nodeMap);
  const highlighted = new Set<string>();

  closure.forEach((id) => {
    const node = nodeMap.get(id);
    if (!node) return;
    node.prerequisites.forEach((prerequisiteId) => {
      if (closure.has(prerequisiteId)) {
        highlighted.add(`${prerequisiteId}->${id}`);
      }
    });
  });

  return highlighted;
}

export function getLearningOrder(nodeId: string, nodeMap = knowledgeNodeMap): KnowledgeNode[] {
  const subgraphIds = getRelatedSubgraphIds(nodeId, nodeMap);
  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  subgraphIds.forEach((id) => {
    indegree.set(id, 0);
    dependents.set(id, []);
  });

  subgraphIds.forEach((id) => {
    const node = nodeMap.get(id);
    if (!node) return;
    node.prerequisites.forEach((prerequisiteId) => {
      if (!subgraphIds.has(prerequisiteId)) return;
      indegree.set(id, (indegree.get(id) ?? 0) + 1);
      dependents.get(prerequisiteId)?.push(id);
    });
  });

  const queue = Array.from(subgraphIds)
    .filter((id) => (indegree.get(id) ?? 0) === 0)
    .map((id) => nodeMap.get(id))
    .filter((item): item is KnowledgeNode => Boolean(item))
    .sort(sortNodes);

  const result: KnowledgeNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    result.push(current);

    const nextIds = dependents.get(current.id) ?? [];
    nextIds.forEach((nextId) => {
      indegree.set(nextId, (indegree.get(nextId) ?? 0) - 1);
      if ((indegree.get(nextId) ?? 0) === 0) {
        const nextNode = nodeMap.get(nextId);
        if (nextNode) {
          queue.push(nextNode);
          queue.sort(sortNodes);
        }
      }
    });
  }

  return result;
}

export function getDirectUnlockNodes(nodeId: string): KnowledgeNode[] {
  return knowledgeNodes
    .filter((node) => node.prerequisites.includes(nodeId))
    .sort((a, b) => {
      if (a.layerOrder !== b.layerOrder) return a.layerOrder - b.layerOrder;
      return a.id.localeCompare(b.id, "zh-CN");
    });
}

export function getPathDepth(nodeId: string, nodeMap = knowledgeNodeMap): number {
  const memo = new Map<string, number>();

  function dfs(currentId: string): number {
    if (memo.has(currentId)) return memo.get(currentId) ?? 1;
    const node = nodeMap.get(currentId);
    if (!node || node.prerequisites.length === 0) {
      memo.set(currentId, 1);
      return 1;
    }
    const depth = Math.max(...node.prerequisites.map(dfs)) + 1;
    memo.set(currentId, depth);
    return depth;
  }

  return dfs(nodeId);
}

export function searchKnowledgeNodes(query: string): KnowledgeNode[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return knowledgeNodes
    .filter((node) => {
      const haystacks = [
        node.name,
        node.summary,
        node.whyImportant,
        node.layer,
        ...node.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystacks.includes(normalized);
    })
    .sort((a, b) => {
      const aScore = Number(a.name.toLowerCase().includes(normalized)) * 4 + Number(a.tags.some((tag) => tag.toLowerCase().includes(normalized))) * 2;
      const bScore = Number(b.name.toLowerCase().includes(normalized)) * 4 + Number(b.tags.some((tag) => tag.toLowerCase().includes(normalized))) * 2;
      if (aScore !== bScore) return bScore - aScore;
      return sortNodes(a, b);
    });
}

export function getEdgeById(edgeId: string): KnowledgeEdge | undefined {
  return knowledgeEdges.find((edge) => edge.id === edgeId);
}
