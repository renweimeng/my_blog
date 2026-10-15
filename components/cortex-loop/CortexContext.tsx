"use client";

import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  CortexLocale,
  CortexPage,
  LoopParameters,
  LoopRound,
  LoopState,
} from "@/lib/cortex-loop/types";

export interface CortexContextValue {
  locale: CortexLocale;
  t: (zh: string, en: string) => string;
  page: CortexPage;
  navigate: (page: CortexPage) => void;
  research: boolean;
  reducedMotion: boolean;
  params: LoopParameters;
  setParams: Dispatch<SetStateAction<LoopParameters>>;
  experiment: LoopState;
  setExperiment: Dispatch<SetStateAction<LoopState>>;
  pending: LoopRound | null;
  phase: number;
  playing: boolean;
  batchRunning: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
  step: () => void;
  reset: () => void;
  runBatch: (count: number) => void;
}

export const CortexContext = createContext<CortexContextValue | null>(null);
export function useCortex() {
  const value = useContext(CortexContext);
  if (!value) throw new Error("CortexContext is required");
  return value;
}
