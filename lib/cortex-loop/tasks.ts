export type GridPoint = [number, number];
export function findPath(
  blocks: GridPoint[],
  start: GridPoint = [0, 0],
  goal: GridPoint = [6, 6],
): GridPoint[] {
  const blocked = new Set(blocks.map((p) => p.join(",")));
  const queue: GridPoint[][] = [[start]],
    visited = new Set([start.join(",")]);
  while (queue.length) {
    const route = queue.shift()!;
    const [x, y] = route[route.length - 1];
    if (x === goal[0] && y === goal[1]) return route;
    for (const [dx, dy] of [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ]) {
      const next: GridPoint = [x + dx, y + dy],
        key = next.join(",");
      if (
        next[0] < 0 ||
        next[1] < 0 ||
        next[0] > 6 ||
        next[1] > 6 ||
        blocked.has(key) ||
        visited.has(key)
      )
        continue;
      visited.add(key);
      queue.push([...route, next]);
    }
  }
  return [];
}

export const roomBlocks: GridPoint[] = [
  [2, 0],
  [2, 1],
  [2, 2],
  [2, 3],
  [4, 3],
  [4, 4],
  [4, 5],
];
export const taskNames = [
  ["观察", "Observe"],
  ["检索", "Retrieve"],
  ["计算", "Calculate"],
  ["验证", "Verify"],
  ["提交", "Submit"],
] as const;

export function agentPlan(fault: string, resilient: boolean): string[] {
  if (fault === "none")
    return ["observe", "retrieve", "calculate", "verify", "submit"];
  if (!resilient)
    return ["observe", "retrieve", "error", "retrieve", "error", "loop"];
  return [
    "observe",
    "retrieve",
    "error",
    "detect",
    fault === "permission" ? "request" : "fallback",
    "retrieve",
    "calculate",
    "verify",
    "submit",
  ];
}
