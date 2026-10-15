export type CortexLocale = "zh" | "en";
export type CortexPage =
  | "home"
  | "relay"
  | "loop"
  | "aesthetic"
  | "space"
  | "agent-world"
  | "universe"
  | "theory"
  | "audit"
  | "about";
export type LoopMode = "static" | "active" | "online" | "full";
export type SensorSet = "behavior" | "eeg" | "eeg-eye" | "eeg-fmri";
export type AuditStatus = "pass" | "fail" | "uncertain" | "frozen";

export interface LoopParameters {
  seed: number;
  mode: LoopMode;
  controller: "agent" | "direct";
  sensors: SensorSet;
  personal: boolean;
  noise: number;
  fatigue: number;
  drift: number;
  exploration: number;
  strictness: number;
  updateRadius: number;
  teacherWeight: number;
  budgetMinutes: number;
  candidateCount: number;
  replay: number;
  expertise: number;
  learningRate: number;
  segmentBoundary: number;
}

export interface QueryCandidate {
  id: string;
  concept: number;
  x: number;
  y: number;
  difficulty: number;
  informationGain: number;
  expectedGain: number;
  redundancy: number;
  seconds: number;
  safetyRisk: number;
  propensity: number;
  utility: number;
}

export interface TeacherEstimate {
  compatibleError: number;
  floor: number;
  variance: number;
  driftRisk: number;
  innovation: number;
  quality: number;
  rho: number;
  risk: number;
  accepted: boolean;
  kernel: number[][];
}

export interface LoopRound {
  id: number;
  seed: number;
  parameters: LoopParameters;
  candidates: QueryCandidate[];
  selected: QueryCandidate;
  teacher: TeacherEstimate;
  humanSeconds: number;
  totalMinutes: number;
  fatigue: number;
  skillsBefore: number[];
  skillsAfter: number[];
  performance: number;
  shadowPerformance: number;
  sentinelBefore: number;
  sentinelAfter: number;
  confidenceRadius: number;
  forgetting: number;
  calibration: number;
  fairness: number;
  audit: AuditStatus;
  reason:
    "improved" | "degraded" | "insufficient" | "quality" | "frozen" | "fatigue";
  modelBefore: number;
  modelAfter: number;
  eeg: number[][];
  gaze: [number, number][];
  pupil: number[];
  events: {
    time: number;
    kind:
      "onset" | "attention" | "evidence" | "conflict" | "recheck" | "decision";
  }[];
  propensityWeight: number;
}

export interface LoopState {
  rounds: LoopRound[];
  skills: number[];
  version: number;
  minutes: number;
}

export const phases = [
  "select",
  "human",
  "segment",
  "teacher",
  "shadow",
  "audit",
  "decision",
  "next",
] as const;
export type LoopPhase = (typeof phases)[number];

export const defaultParameters: LoopParameters = {
  seed: 20261015,
  mode: "full",
  controller: "agent",
  sensors: "eeg-eye",
  personal: false,
  noise: 0.24,
  fatigue: 0.16,
  drift: 0.12,
  exploration: 0.2,
  strictness: 0.55,
  updateRadius: 0.18,
  teacherWeight: 1,
  budgetMinutes: 30,
  candidateCount: 12,
  replay: 0.7,
  expertise: 0.78,
  learningRate: 0.55,
  segmentBoundary: 0.55,
};
