export type RiskMode = "stable" | "mild" | "high";
export type ViewMode = "standard" | "dense" | "presentation";
export type ChannelDensity = "compact" | "standard" | "expanded";

export type MetricState = {
  tokenRisk: number;
  prefixRisk: number;
  answerRisk: number;
  plvDrop: number;
  n400: number;
  p600: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
  latency: number;
  trial: number;
};

export type TokenUnit = {
  text: string;
  risk: number;
};

export type TokenState = {
  question: string;
  responseIndex: number;
  cursor: number;
  tokens: TokenUnit[];
  activeToken?: TokenUnit;
};

export type ErpPoint = {
  time: number;
  subjectA: number;
  subjectB: number;
  average: number;
};

export type PlvMatrix = number[][];

export type EventItem = {
  id: string;
  time: string;
  level: "info" | "warn" | "risk";
  message: string;
};
