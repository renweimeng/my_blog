"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LayerFilterOption } from "@/types/knowledge";

const DEFAULT_EXAMPLE_NODE_ID = "A09";

type KnowledgeTreeStore = {
  selectedNodeId: string | null;
  filterLayer: LayerFilterOption;
  searchKeyword: string;
  pathOnly: boolean;
  recentNodeIds: string[];
  selectNode: (nodeId: string | null) => void;
  setFilterLayer: (layer: LayerFilterOption) => void;
  setSearchKeyword: (keyword: string) => void;
  setPathOnly: (value: boolean) => void;
  togglePathOnly: () => void;
  resetExplorer: () => void;
};

export const useKnowledgeTreeStore = create<KnowledgeTreeStore>()(
  persist(
    (set) => ({
      selectedNodeId: DEFAULT_EXAMPLE_NODE_ID,
      filterLayer: "全部",
      searchKeyword: "",
      pathOnly: false,
      recentNodeIds: [DEFAULT_EXAMPLE_NODE_ID],
      selectNode: (nodeId) =>
        set((state) => {
          if (!nodeId) return { selectedNodeId: null };
          return {
            selectedNodeId: nodeId,
            recentNodeIds: [nodeId, ...state.recentNodeIds.filter((id) => id !== nodeId)].slice(0, 8),
          };
        }),
      setFilterLayer: (filterLayer) => set({ filterLayer }),
      setSearchKeyword: (searchKeyword) => set({ searchKeyword }),
      setPathOnly: (pathOnly) => set({ pathOnly }),
      togglePathOnly: () => set((state) => ({ pathOnly: !state.pathOnly })),
      resetExplorer: () =>
        set({
          selectedNodeId: null,
          filterLayer: "全部",
          searchKeyword: "",
          pathOnly: false,
        }),
    }),
    {
      name: "knowledge-tree-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedNodeId: state.selectedNodeId,
        recentNodeIds: state.recentNodeIds,
      }),
    }
  )
);
