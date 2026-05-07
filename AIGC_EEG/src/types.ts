export type RiskMode = 'stable' | 'mild' | 'high';

export type ViewDensity = 'standard' | 'dense' | 'presentation';

export type ChannelDensity = 'compact' | 'standard' | 'expanded';

export type SubjectId = 'A' | 'B';

export interface TokenUnit {
  text: string;
  intrinsicRisk: number;
}

export interface AnswerScript {
  id: string;
  question: string;
  tokens: TokenUnit[];
}

export interface ERPPoint {
  time: number;
  subjectA: number;
  subjectB: number;
  dyadicAverage: number;
}

export interface BandPowers {
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
}

export interface TelemetrySnapshot {
  tokenRisk: number;
  prefixRisk: number;
  answerRisk: number;
  syncDropIndex: number;
  n400Amplitude: number;
  p600Intensity: number;
  latency: number;
  plvAverage: number;
  thetaPLV: number;
  alphaPLV: number;
  syncStability: number;
  bands: BandPowers;
  erp: ERPPoint[];
  plvMatrix: number[][];
}

export interface EventLogItem {
  id: string;
  time: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface EegChannelConfig {
  subject: SubjectId;
  name: string;
  index: number;
  phase: number;
  alphaFrequency: number;
  thetaFrequency: number;
  betaFrequency: number;
  alphaAmplitude: number;
  thetaAmplitude: number;
  betaAmplitude: number;
  noise: number;
  spikeRate: number;
}
