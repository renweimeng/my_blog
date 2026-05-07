import {
  attentionTokens,
  brainRegions,
  clamp,
  eegChannels64,
  gaussian,
  getEventInfluence,
  seededNoise
} from '../data/demoData';
import type {
  DemoClip,
  DemoCondition,
  EEGChannelCount,
  EEGFrequencyBand,
  PLVBand,
  SubjectId,
  SubjectView,
  TopomapWindow
} from '../data/demoData';

export interface EEGPath {
  channel: string;
  subject: SubjectId;
  points: number[];
}

export interface ERPPoint {
  time: number;
  realA: number;
  realB: number;
  aigcA: number;
  aigcB: number;
  average: number;
  difference: number;
}

export interface TopomapElectrode {
  name: string;
  x: number;
  y: number;
  value: number;
}

export interface GNNNode {
  id: string;
  label: string;
  x: number;
  y: number;
  importance: number;
  value: number;
  contribution: number;
}

export interface GNNEdge {
  source: string;
  target: string;
  strength: number;
  contribution: number;
}

const bandMultiplier: Record<EEGFrequencyBand, { alpha: number; theta: number; beta: number; gamma: number; delta: number }> = {
  Raw: { alpha: 1, theta: 1, beta: 1, gamma: 0.5, delta: 0.6 },
  Delta: { alpha: 0.1, theta: 0.2, beta: 0.08, gamma: 0.04, delta: 1.3 },
  Theta: { alpha: 0.16, theta: 1.4, beta: 0.08, gamma: 0.04, delta: 0.16 },
  Alpha: { alpha: 1.4, theta: 0.12, beta: 0.1, gamma: 0.04, delta: 0.08 },
  Beta: { alpha: 0.12, theta: 0.08, beta: 1.25, gamma: 0.12, delta: 0.06 },
  Gamma: { alpha: 0.08, theta: 0.06, beta: 0.22, gamma: 1.35, delta: 0.04 }
};

const channelRegionBoost = (channel: string) => {
  if (channel.startsWith('F') || channel === 'FCz') return { theta: 1.25, alpha: 0.8 };
  if (channel.startsWith('O') || channel.startsWith('PO') || channel === 'Oz') return { theta: 0.75, alpha: 1.35 };
  if (channel.startsWith('T') || channel.startsWith('FT') || channel.startsWith('TP')) return { theta: 1.08, alpha: 0.9 };
  return { theta: 1, alpha: 1 };
};

const signalValue = (
  channel: string,
  subject: SubjectId,
  condition: DemoCondition,
  band: EEGFrequencyBand,
  currentTime: number,
  sampleIndex: number,
  clip: DemoClip
) => {
  const seed = seededNoise(`${channel}-${subject}`);
  const t = currentTime + sampleIndex / 70;
  const event = getEventInfluence(clip, currentTime, 7);
  const aigc = condition === 'aigc' ? 1 : condition === 'uncertain' ? 0.55 : 0.12;
  const region = channelRegionBoost(channel);
  const multiplier = bandMultiplier[band];
  const subjectPhase = subject === 'A' ? 0 : 0.42;
  const alphaSuppression = 1 - aigc * 0.18 - event * 0.35;
  const thetaBurst = 1 + aigc * 0.3 + event * 1.8;
  const alpha =
    Math.sin(Math.PI * 2 * (8.6 + seed * 2.6) * t + seed + subjectPhase) *
    0.58 *
    region.alpha *
    alphaSuppression *
    multiplier.alpha;
  const theta =
    Math.sin(Math.PI * 2 * (4.4 + seed * 1.7) * t + seed * 2.2) *
    0.46 *
    region.theta *
    thetaBurst *
    multiplier.theta;
  const beta = Math.sin(Math.PI * 2 * (15 + seed * 11) * t + seed * 4) * 0.23 * (1 + aigc * 0.2) * multiplier.beta;
  const gamma = Math.sin(Math.PI * 2 * (31 + seed * 14) * t + seed * 5) * 0.12 * (1 + event) * multiplier.gamma;
  const delta = Math.sin(Math.PI * 2 * (1.1 + seed) * t + seed * 3) * 0.22 * multiplier.delta;
  const drift = Math.cos(Math.PI * 2 * 0.18 * t + seed) * 0.08;
  const noise = (seededNoise(`${channel}-${subject}-${sampleIndex}-${Math.floor(currentTime)}`) - 0.5) * (0.15 + aigc * 0.08);
  const erpDeflection =
    event *
    ((channel.includes('P') || channel === 'Cz' || channel === 'Pz' ? -0.75 : -0.25) +
      (channel.startsWith('F') ? 0.34 * Math.sin(sampleIndex / 10) : 0));

  return alpha + theta + beta + gamma + delta + drift + noise + erpDeflection;
};

export const generateEEGPaths = (
  clip: DemoClip,
  currentTime: number,
  condition: DemoCondition,
  channelCount: EEGChannelCount,
  band: EEGFrequencyBand,
  samples = 180
): EEGPath[] => {
  const selected = eegChannels64.slice(0, channelCount);
  return (['A', 'B'] as SubjectId[]).flatMap((subject) =>
    selected.map((channel) => ({
      channel,
      subject,
      points: Array.from({ length: samples }, (_, sampleIndex) =>
        signalValue(channel, subject, condition, band, currentTime, sampleIndex, clip)
      )
    }))
  );
};

export const makeSvgPath = (points: number[], width: number, yBase: number, amplitude: number) => {
  const xStep = width / Math.max(points.length - 1, 1);
  return points
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${index * xStep} ${(yBase - value * amplitude).toFixed(2)}`)
    .join(' ');
};

const erpFor = (condition: DemoCondition, subject: SubjectId, time: number) => {
  const aigc = condition === 'aigc' ? 1 : condition === 'uncertain' ? 0.58 : 0;
  const subjectOffset = subject === 'A' ? 0.15 : -0.08;
  const n400Amplitude = -(2.0 + aigc * 3.6 + subjectOffset);
  const p600Amplitude = 2.0 + aigc * 3.0 - subjectOffset * 0.5;
  const baseline = Math.sin(time / 85) * 0.14 + Math.cos(time / 121) * 0.1;
  return baseline + n400Amplitude * gaussian(time, 405, 72) + p600Amplitude * gaussian(time, 625, 105);
};

export const generateERPSeries = (condition: DemoCondition): ERPPoint[] =>
  Array.from({ length: 61 }, (_, index) => -200 + index * 20).map((time) => {
    const realA = erpFor('real', 'A', time);
    const realB = erpFor('real', 'B', time);
    const aigcA = erpFor(condition === 'real' ? 'real' : 'aigc', 'A', time);
    const aigcB = erpFor(condition === 'real' ? 'real' : 'aigc', 'B', time);
    const average = (aigcA + aigcB) / 2;
    return {
      time,
      realA,
      realB,
      aigcA,
      aigcB,
      average,
      difference: average - (realA + realB) / 2
    };
  });

export const generateTimeFrequency = (condition: DemoCondition) => {
  const rows: Array<[number, number, number]> = [];
  const aigc = condition === 'aigc' ? 1 : condition === 'uncertain' ? 0.55 : 0.15;
  for (let time = -200; time <= 1000; time += 30) {
    for (let frequency = 1; frequency <= 40; frequency += 1) {
      const theta = gaussian(frequency, 6, 2.1) * gaussian(time, 430, 170) * (1.4 + aigc * 2.2);
      const alpha = gaussian(frequency, 10, 2.6) * gaussian(time, 540, 210) * (-0.45 - aigc * 1.25);
      const beta = gaussian(frequency, 22, 5) * gaussian(time, 620, 250) * (0.15 + aigc * 0.28);
      const background = Math.sin(time / 190 + frequency * 0.21) * 0.08;
      rows.push([time, frequency, Number((theta + alpha + beta + background).toFixed(3))]);
    }
  }
  return rows;
};

export const generatePLVMatrix = (condition: DemoCondition, band: PLVBand, currentTime: number) => {
  const aigc = condition === 'aigc' ? 1 : condition === 'uncertain' ? 0.52 : 0;
  const bandBoost = band === 'Theta' ? 0.08 : band === 'Alpha' ? 0.03 : band === 'Beta' ? 0.04 : 0.02;
  return brainRegions.map((row, rowIndex) =>
    brainRegions.map((col, colIndex) => {
      const sameSystem = rowIndex === colIndex ? 0.12 : 0;
      const natural = (row.includes('Visual') && col.includes('Visual')) || (row.includes('Auditory') && col.includes('Auditory')) ? 0.08 : 0;
      const abnormal =
        aigc *
        (['Frontal-Visual', 'Temporal-L-Visual', 'Temporal-R-Visual', 'Frontal-Temporal-L', 'Frontal-Temporal-R'].includes(
          `${row}-${col}`
        )
          ? 0.23
          : 0);
      const instability = Math.sin(currentTime / 11 + rowIndex * 0.8 + colIndex * 0.5) * (0.025 + aigc * 0.05);
      const base = condition === 'real' ? 0.48 : condition === 'uncertain' ? 0.54 : 0.56;
      return clamp(base + sameSystem + natural + abnormal + bandBoost + instability, 0.12, 0.88);
    })
  );
};

export const generateTopomap = (
  condition: DemoCondition,
  windowName: TopomapWindow,
  subjectView: SubjectView,
  timeMs: number
): TopomapElectrode[] => {
  const positions: Array<[string, number, number]> = [
    ['Fp1', 42, 18],
    ['Fp2', 58, 18],
    ['F3', 34, 34],
    ['F4', 66, 34],
    ['Fz', 50, 30],
    ['T7', 20, 50],
    ['T8', 80, 50],
    ['C3', 35, 52],
    ['C4', 65, 52],
    ['Cz', 50, 52],
    ['P3', 36, 70],
    ['P4', 64, 70],
    ['Pz', 50, 72],
    ['O1', 42, 86],
    ['O2', 58, 86],
    ['Oz', 50, 88]
  ];
  const aigc = condition === 'aigc' ? 1 : condition === 'uncertain' ? 0.55 : 0.12;
  const subjectOffset = subjectView === 'A' ? 0.08 : subjectView === 'B' ? -0.04 : subjectView === 'difference' ? 0.16 : 0;
  return positions.map(([name, x, y]) => {
    const frontal = y < 38;
    const centralParietal = y > 46 && y < 78;
    const posterior = y > 66;
    const timeWave = Math.sin(timeMs / 140 + x / 20 + y / 30) * 0.12;
    let value = timeWave + subjectOffset;
    if (windowName === 'N400') value += centralParietal ? -0.25 - aigc * 0.86 : -0.1 * aigc;
    if (windowName === 'P600') value += posterior || centralParietal ? 0.22 + aigc * 0.78 : 0.08 * aigc;
    if (windowName === 'Theta power') value += frontal ? 0.2 + aigc * 0.9 : 0.04;
    if (windowName === 'Alpha suppression') value += posterior ? -0.18 - aigc * 0.72 : -0.06 * aigc;
    if (subjectView === 'difference') value *= 0.72;
    return { name, x, y, value: clamp(value, -1.2, 1.2) };
  });
};

export const heatColor = (value: number) => {
  const normalized = clamp((value + 1.2) / 2.4, 0, 1);
  if (normalized < 0.5) {
    const t = normalized / 0.5;
    return `rgb(${Math.round(34 + t * 45)}, ${Math.round(211 - t * 90)}, ${Math.round(238 - t * 20)})`;
  }
  const t = (normalized - 0.5) / 0.5;
  return `rgb(${Math.round(245 + t * 3)}, ${Math.round(158 - t * 77)}, ${Math.round(11 + t * 62)})`;
};

export const generateAttentionWeights = (condition: DemoCondition) => {
  const aigc = condition === 'aigc' ? 1 : condition === 'uncertain' ? 0.55 : 0.08;
  return attentionTokens.map((token, index) => {
    const base = condition === 'real' ? 0.28 + seededNoise(token) * 0.22 : 0.2 + seededNoise(token) * 0.18;
    const riskToken = ['Mouth region', 'Eye region', 'Face boundary', 'Audio-visual sync', 'EEG N400 token', 'EEG P600 token', 'PLV graph token'].includes(token)
      ? aigc * 0.46
      : aigc * 0.08;
    return {
      token,
      weight: clamp(base + riskToken + Math.sin(index * 0.7) * 0.04, 0.08, 0.95),
      explanation:
        token.includes('EEG') || token.includes('PLV')
          ? 'Neural feature token contributes to multimodal detector reasoning.'
          : 'Video token receives attention according to local artifact evidence.'
    };
  });
};

export const generateAttentionMatrix = (condition: DemoCondition) => {
  const weights = generateAttentionWeights(condition);
  return weights.flatMap((row, rowIndex) =>
    weights.map((col, colIndex) => {
      const affinity = (row.weight + col.weight) / 2;
      const diagonal = rowIndex === colIndex ? 0.16 : 0;
      const cross =
        row.token.includes('Mouth') && col.token.includes('N400')
          ? 0.16
          : row.token.includes('Eye') && col.token.includes('P600')
            ? 0.12
            : 0;
      return [rowIndex, colIndex, clamp(affinity + diagonal + cross, 0, 1)] as [number, number, number];
    })
  );
};

export const generateGNNGraph = (condition: DemoCondition, currentTime: number) => {
  const aigc = condition === 'aigc' ? 1 : condition === 'uncertain' ? 0.55 : 0.12;
  const nodes: GNNNode[] = brainRegions.map((region, index) => {
    const angle = (Math.PI * 2 * index) / brainRegions.length - Math.PI / 2;
    const important = ['Frontal', 'Temporal-L', 'Temporal-R', 'Occipital', 'Parietal', 'Visual'].includes(region);
    const importance = clamp(0.22 + seededNoise(region) * 0.24 + (important ? aigc * 0.38 : aigc * 0.12), 0.08, 0.92);
    return {
      id: region,
      label: region,
      x: 50 + Math.cos(angle) * 32,
      y: 50 + Math.sin(angle) * 32,
      importance,
      value: clamp(0.35 + importance * 0.52 + Math.sin(currentTime / 20 + index) * 0.04, 0, 1),
      contribution: clamp(importance * (0.5 + aigc * 0.45), 0.05, 0.95)
    };
  });
  const edgePairs: Array<[string, string]> = [
    ['Frontal', 'Temporal-L'],
    ['Frontal', 'Temporal-R'],
    ['Frontal', 'Visual'],
    ['Visual', 'Occipital'],
    ['Auditory', 'Temporal-L'],
    ['Auditory', 'Temporal-R'],
    ['Parietal', 'Occipital'],
    ['Central', 'Parietal'],
    ['Temporal-L', 'Visual'],
    ['Temporal-R', 'Visual']
  ];
  const edges: GNNEdge[] = edgePairs.map(([source, target], index) => {
    const highContribution = ['Frontal-Visual', 'Temporal-L-Visual', 'Temporal-R-Visual', 'Frontal-Temporal-L', 'Frontal-Temporal-R'].includes(
      `${source}-${target}`
    );
    const strength = clamp(0.28 + seededNoise(`${source}-${target}`) * 0.22 + (highContribution ? aigc * 0.28 : aigc * 0.08), 0.1, 0.9);
    return {
      source,
      target,
      strength,
      contribution: clamp(strength * (highContribution ? 0.92 : 0.48) + Math.sin(currentTime / 15 + index) * 0.03, 0.04, 0.92)
    };
  });
  return { nodes, edges };
};

export const detectorContributions = (condition: DemoCondition, clip: DemoClip, currentTime: number) => {
  const event = getEventInfluence(clip, currentTime, 12);
  const aigc = condition === 'aigc' ? 1 : condition === 'uncertain' ? 0.55 : 0.12;
  return [
    { label: 'Visual artifact contribution', value: clamp(0.18 + aigc * 0.48 + event * 0.28, 0.08, 0.86) },
    { label: 'N400/P600 contribution', value: clamp(0.16 + aigc * 0.42 + event * 0.35, 0.08, 0.84) },
    { label: 'PLV instability contribution', value: clamp(0.14 + aigc * 0.36 + event * 0.25, 0.06, 0.78) },
    { label: 'Attention anomaly contribution', value: clamp(0.12 + aigc * 0.44 + event * 0.3, 0.06, 0.82) },
    { label: 'GNN graph anomaly contribution', value: clamp(0.13 + aigc * 0.38 + event * 0.28, 0.06, 0.8) }
  ];
};

export const reportPerformanceRows = [
  { model: 'Video only', accuracy: 0.76, auroc: 0.78, auprc: 0.75, f1: 0.73, ece: 0.12 },
  { model: 'EEG ERP only', accuracy: 0.72, auroc: 0.74, auprc: 0.7, f1: 0.69, ece: 0.14 },
  { model: 'EEG spectral only', accuracy: 0.7, auroc: 0.73, auprc: 0.69, f1: 0.68, ece: 0.15 },
  { model: 'PLV synchrony', accuracy: 0.69, auroc: 0.71, auprc: 0.67, f1: 0.66, ece: 0.16 },
  { model: 'GNN graph', accuracy: 0.78, auroc: 0.8, auprc: 0.77, f1: 0.75, ece: 0.11 },
  { model: 'Full multimodal model', accuracy: 0.85, auroc: 0.89, auprc: 0.86, f1: 0.83, ece: 0.08 }
];
