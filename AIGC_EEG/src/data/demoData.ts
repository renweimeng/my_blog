export type DemoCondition = 'real' | 'aigc' | 'uncertain';
export type SubjectId = 'A' | 'B';
export type SubjectView = 'A' | 'B' | 'average' | 'difference';
export type EEGChannelCount = 8 | 16 | 32 | 64;
export type EEGFrequencyBand = 'Raw' | 'Delta' | 'Theta' | 'Alpha' | 'Beta' | 'Gamma';
export type PLVBand = 'Theta' | 'Alpha' | 'Beta' | 'Gamma';
export type TopomapWindow = 'N400' | 'P600' | 'Theta power' | 'Alpha suppression';

export interface ClipEvent {
  time: number;
  label: string;
  type: 'visual' | 'neural' | 'attention' | 'risk';
  neural: string;
  riskImpact: number;
  description: string;
}

export interface DemoClip {
  id: string;
  title: string;
  condition: DemoCondition;
  videoType: string;
  duration: number;
  events: ClipEvent[];
  videoSrc?: string;
  sourcePath?: string;
}

export interface FeatureMetric {
  key: string;
  label: string;
  valueA: number;
  valueB: number;
  unit: string;
  baselineDelta: number;
  trend: 'up' | 'down' | 'stable';
  riskContribution: number;
}

export interface DemoSnapshot {
  clip: DemoClip;
  condition: DemoCondition;
  currentTime: number;
  riskScore: number;
  confidence: number;
  cumulativeRisk: number;
  riskTrend: Array<{ time: number; value: number }>;
  features: FeatureMetric[];
  activeEvent?: ClipEvent;
}

export const brainRegions = [
  'Frontal',
  'Central',
  'Temporal-L',
  'Temporal-R',
  'Parietal',
  'Occipital',
  'Visual',
  'Auditory'
];

export const attentionTokens = [
  'Eye region',
  'Mouth region',
  'Face boundary',
  'Lighting transition',
  'Background texture',
  'Audio-visual sync',
  'EEG N400 token',
  'EEG P600 token',
  'PLV graph token'
];

export const eegChannels64 = [
  'Fp1',
  'Fp2',
  'F3',
  'F4',
  'C3',
  'C4',
  'P3',
  'P4',
  'O1',
  'O2',
  'F7',
  'F8',
  'T7',
  'T8',
  'P7',
  'P8',
  'Fz',
  'Cz',
  'Pz',
  'Oz',
  'FC1',
  'FC2',
  'CP1',
  'CP2',
  'FC5',
  'FC6',
  'CP5',
  'CP6',
  'TP9',
  'TP10',
  'PO3',
  'PO4',
  'AF3',
  'AF4',
  'F1',
  'F2',
  'F5',
  'F6',
  'C1',
  'C2',
  'C5',
  'C6',
  'P1',
  'P2',
  'P5',
  'P6',
  'PO7',
  'PO8',
  'FT7',
  'FT8',
  'FC3',
  'FC4',
  'CP3',
  'CP4',
  'TP7',
  'TP8',
  'AF7',
  'AF8',
  'F9',
  'F10',
  'Iz',
  'POz',
  'CPz',
  'FCz'
];

export const clipLibrary: DemoClip[] = [
  {
    id: 'clip01',
    title: 'Clip 01 Real Interview',
    condition: 'real',
    videoType: '真实视频 / Real Interview',
    duration: 270,
    events: [
      {
        time: 42,
        label: '自然眨眼',
        type: 'visual',
        neural: 'Low-risk visual response',
        riskImpact: 0.04,
        description: '自然眼部运动，ERP 波形保持稳定。'
      },
      {
        time: 98,
        label: '环境光缓慢变化',
        type: 'visual',
        neural: 'Occipital alpha stable',
        riskImpact: 0.05,
        description: '真实拍摄环境中的渐变光照，跨脑同步平稳。'
      },
      {
        time: 171,
        label: '镜头切换',
        type: 'attention',
        neural: 'Attention shift without risk surge',
        riskImpact: 0.07,
        description: '注意力从面部转向背景再回到面部，风险保持低位。'
      },
      {
        time: 226,
        label: '语音停顿',
        type: 'neural',
        neural: 'N400 within baseline',
        riskImpact: 0.03,
        description: '语义整合响应在正常阈值内。'
      }
    ]
  },
  {
    id: 'clip02',
    title: 'Clip 02 AIGC Talking Head',
    condition: 'aigc',
    videoType: 'AIGC 伪造视频 / Talking Head',
    duration: 310,
    events: [
      {
        time: 45,
        label: '眼部闪烁异常',
        type: 'visual',
        neural: 'Frontal theta burst',
        riskImpact: 0.28,
        description: '眼周纹理与眨眼节奏不一致，引发额叶 theta 增强。'
      },
      {
        time: 92,
        label: '光照不连续',
        type: 'visual',
        neural: 'Occipital alpha suppression',
        riskImpact: 0.22,
        description: '面部高光与背景光照不匹配，视觉冲突分数上升。'
      },
      {
        time: 130,
        label: '嘴型-语音不同步',
        type: 'attention',
        neural: 'N400 amplitude exceeds baseline',
        riskImpact: 0.35,
        description: 'mouth-eye region attention 集中，N400 负波增强。'
      },
      {
        time: 205,
        label: '纹理过度平滑',
        type: 'risk',
        neural: 'P600 reanalysis response',
        riskImpact: 0.3,
        description: '脸部边界与皮肤纹理过平滑，P600 重分析增强。'
      },
      {
        time: 268,
        label: '跨脑 PLV 不稳定',
        type: 'neural',
        neural: 'Inter-brain PLV instability',
        riskImpact: 0.25,
        description: '前额-颞叶跨脑同步出现局部异常波动。'
      }
    ]
  },
  {
    id: 'clip03',
    title: 'Clip 03 Real News',
    condition: 'real',
    videoType: '真实视频 / Real News',
    duration: 225,
    events: [
      {
        time: 36,
        label: '字幕出现',
        type: 'visual',
        neural: 'Visual onset response',
        riskImpact: 0.04,
        description: '字幕出现带来短暂视觉诱发响应。'
      },
      {
        time: 87,
        label: '自然头部转动',
        type: 'attention',
        neural: 'Stable dyadic synchrony',
        riskImpact: 0.06,
        description: '真实人物自然头动，PLV 结构稳定。'
      },
      {
        time: 154,
        label: '背景切换',
        type: 'visual',
        neural: 'Low N400 response',
        riskImpact: 0.05,
        description: '镜头背景自然切换，风险低。'
      }
    ]
  },
  {
    id: 'clip04',
    title: 'Clip 04 Deepfake-like Synthetic Face',
    condition: 'aigc',
    videoType: 'AIGC 伪造视频 / Synthetic Face',
    duration: 295,
    events: [
      {
        time: 58,
        label: '脸部边界漂移',
        type: 'visual',
        neural: 'Face-boundary attention surge',
        riskImpact: 0.3,
        description: '面部轮廓与背景边缘之间出现帧间漂移。'
      },
      {
        time: 116,
        label: '瞳孔反光失真',
        type: 'attention',
        neural: 'Eye token attention elevated',
        riskImpact: 0.27,
        description: '眼部高光方向不稳定，模型注意力集中到 eye region。'
      },
      {
        time: 181,
        label: '口型闭合偏差',
        type: 'neural',
        neural: 'N400/P600 coupled response',
        riskImpact: 0.34,
        description: '视听不一致伴随 N400 负波和 P600 正波增强。'
      },
      {
        time: 244,
        label: '帧间纹理重采样',
        type: 'risk',
        neural: 'GNN graph anomaly',
        riskImpact: 0.31,
        description: 'GNN 图嵌入显示视觉-额叶-颞叶连接贡献升高。'
      }
    ]
  },
  {
    id: 'clip05',
    title: 'Clip 05 Mixed / Uncertain Segment',
    condition: 'uncertain',
    videoType: '混合片段 / Uncertain',
    duration: 260,
    events: [
      {
        time: 52,
        label: '轻微压缩伪影',
        type: 'visual',
        neural: 'Weak visual incongruity',
        riskImpact: 0.14,
        description: '局部压缩伪影导致风险短暂上升。'
      },
      {
        time: 124,
        label: '嘴型轻度滞后',
        type: 'attention',
        neural: 'Moderate N400 shift',
        riskImpact: 0.2,
        description: '视听同步略有偏差，判定进入可疑区。'
      },
      {
        time: 199,
        label: '纹理恢复正常',
        type: 'risk',
        neural: 'Risk easing',
        riskImpact: -0.08,
        description: '后续帧特征恢复稳定，模型不确定性增加。'
      }
    ]
  }
];

export const conditionLabel: Record<DemoCondition, string> = {
  real: '真实视频',
  aigc: 'AIGC 伪造视频',
  uncertain: '不确定 / 混合片段'
};

export const conditionEnglish: Record<DemoCondition, string> = {
  real: 'Likely Real',
  aigc: 'Likely AIGC',
  uncertain: 'Suspicious'
};

export const conditionTone: Record<DemoCondition, string> = {
  real: '#22d3ee',
  aigc: '#f85149',
  uncertain: '#f59e0b'
};

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, amount: number) => a + (b - a) * amount;

export const gaussian = (x: number, center: number, width: number) =>
  Math.exp(-Math.pow(x - center, 2) / (2 * width * width));

export const seededNoise = (seed: string) => {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
};

export const formatClock = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

export const getSelectedChannels = (count: EEGChannelCount) => eegChannels64.slice(0, count);

export const getEventInfluence = (clip: DemoClip, currentTime: number, width = 9) =>
  clip.events.reduce((total, event) => total + event.riskImpact * gaussian(currentTime, event.time, width), 0);

export const getActiveEvent = (clip: DemoClip, currentTime: number) =>
  clip.events.find((event) => Math.abs(event.time - currentTime) < 8);

const baseRiskByCondition: Record<DemoCondition, number> = {
  real: 18,
  uncertain: 44,
  aigc: 68
};

export const riskAtTime = (clip: DemoClip, currentTime: number, condition = clip.condition) => {
  const slowWave = Math.sin(currentTime / 21) * 2.8 + Math.cos(currentTime / 37) * 1.8;
  const eventBoost = getEventInfluence(clip, currentTime, condition === 'real' ? 12 : 18) * 58;
  const target = baseRiskByCondition[condition] + slowWave + eventBoost;

  if (condition === 'real') return clamp(target, 8, 35);
  if (condition === 'uncertain') return clamp(target, 35, 60);
  return clamp(target, 60, 92);
};

export const makeRiskTrend = (clip: DemoClip, currentTime: number, condition = clip.condition, windowSeconds = 60) =>
  Array.from({ length: windowSeconds }, (_, index) => {
    const time = Math.max(0, currentTime - (windowSeconds - 1 - index) * 0.5);
    return {
      time,
      value: riskAtTime(clip, time, condition)
    };
  });

export const cumulativeRiskAtTime = (clip: DemoClip, currentTime: number, condition = clip.condition) => {
  const samples = Array.from({ length: 24 }, (_, index) => {
    const time = Math.max(0, currentTime - index * 8);
    return riskAtTime(clip, time, condition);
  });
  return samples.reduce((sum, value) => sum + value, 0) / samples.length;
};

export const confidenceAtTime = (riskScore: number, condition: DemoCondition) => {
  const distance = Math.abs(riskScore - 50) / 50;
  const base = condition === 'uncertain' ? 0.68 : 0.78;
  return clamp(base + distance * 0.18, 0.58, 0.96);
};

export const makeFeatureMetrics = (clip: DemoClip, currentTime: number, condition = clip.condition): FeatureMetric[] => {
  const event = getEventInfluence(clip, currentTime, 10);
  const subjectOffsetA = seededNoise(`${clip.id}-A`) * 0.28;
  const subjectOffsetB = seededNoise(`${clip.id}-B`) * 0.28;
  const aigcScale = condition === 'aigc' ? 1 : condition === 'uncertain' ? 0.55 : 0.16;
  const n400 = -(1.6 + aigcScale * 3.8 + event * 4.8);
  const p600 = 1.6 + aigcScale * 2.8 + event * 4.2;
  const theta = 38 + aigcScale * 24 + event * 26;
  const alpha = 58 - aigcScale * 16 - event * 18;
  const beta = 34 + aigcScale * 10 + event * 10;
  const gamma = 20 + aigcScale * 8 + event * 8;
  const plv = condition === 'real' ? 0.52 + event * 0.05 : condition === 'uncertain' ? 0.58 + event * 0.12 : 0.64 + event * 0.18;
  const synchrony = condition === 'real' ? 0.72 - event * 0.04 : condition === 'uncertain' ? 0.58 - event * 0.08 : 0.48 - event * 0.1;
  const conflict = condition === 'real' ? 0.16 + event * 0.08 : condition === 'uncertain' ? 0.42 + event * 0.18 : 0.62 + event * 0.25;

  const build = (
    key: string,
    label: string,
    value: number,
    unit: string,
    baselineDelta: number,
    riskContribution: number,
    invertTrend = false
  ): FeatureMetric => {
    const jitter = Math.sin(currentTime / 17 + seededNoise(key) * 4) * 0.08;
    const valueA = value + subjectOffsetA + jitter;
    const valueB = value + subjectOffsetB - jitter * 0.8;
    const trend =
      Math.abs(baselineDelta) < 0.06 ? 'stable' : baselineDelta > 0 !== invertTrend ? 'up' : 'down';
    return {
      key,
      label,
      valueA,
      valueB,
      unit,
      baselineDelta,
      trend,
      riskContribution
    };
  };

  return [
    build('n400', 'N400 peak', n400, 'μV', condition === 'real' ? -0.08 : -0.42 - event * 0.2, 0.16, true),
    build('p600', 'P600 peak', p600, 'μV', condition === 'real' ? 0.05 : 0.38 + event * 0.18, 0.13),
    build('theta', 'Frontal theta', theta, '%', condition === 'real' ? 0.04 : 0.32 + event * 0.18, 0.12),
    build('alpha', 'Occipital alpha', alpha, '%', condition === 'real' ? -0.03 : -0.26 - event * 0.14, 0.1, true),
    build('beta', 'Beta power', beta, '%', condition === 'real' ? 0.02 : 0.14 + event * 0.08, 0.07),
    build('gamma', 'Gamma power', gamma, '%', condition === 'real' ? 0.01 : 0.12 + event * 0.06, 0.06),
    build('plv', 'PLV local max', plv, '', condition === 'real' ? 0.03 : 0.22 + event * 0.12, 0.15),
    build('synchrony', 'Inter-brain Synchrony', synchrony, '', condition === 'real' ? 0.05 : -0.18 - event * 0.1, 0.12, true),
    build('conflict', 'EEG-visual conflict', conflict, '', condition === 'real' ? 0.04 : 0.34 + event * 0.16, 0.09)
  ];
};

export const makeSnapshot = (clip: DemoClip, currentTime: number, condition = clip.condition): DemoSnapshot => {
  const riskScore = riskAtTime(clip, currentTime, condition);
  return {
    clip,
    condition,
    currentTime,
    riskScore,
    confidence: confidenceAtTime(riskScore, condition),
    cumulativeRisk: cumulativeRiskAtTime(clip, currentTime, condition),
    riskTrend: makeRiskTrend(clip, currentTime, condition),
    features: makeFeatureMetrics(clip, currentTime, condition),
    activeEvent: getActiveEvent(clip, currentTime)
  };
};

export const getFeatureValue = (features: FeatureMetric[], key: string, subject: SubjectId | 'average' = 'average') => {
  const metric = features.find((item) => item.key === key);
  if (!metric) return 0;
  if (subject === 'A') return metric.valueA;
  if (subject === 'B') return metric.valueB;
  return (metric.valueA + metric.valueB) / 2;
};

export const makeRecentEvents = (snapshot: DemoSnapshot) => {
  const { clip, currentTime, condition } = snapshot;
  const base = [
    'Detected visual-semantic incongruity',
    'N400 amplitude exceeds baseline threshold',
    'Inter-brain PLV instability detected',
    'Transformer attention focuses on mouth-eye region',
    'GNN graph embedding updates detector head'
  ];
  const realBase = [
    'Natural blink event aligned with EEG baseline',
    'Stable occipital alpha response observed',
    'Inter-brain synchrony remains within reference range',
    'Attention distribution remains diffuse across visual tokens'
  ];
  const pool = condition === 'real' ? realBase : base;
  const nearby = clip.events.filter((event) => event.time <= currentTime).slice(-3);
  const generated = pool.slice(0, 4).map((message, index) => ({
    id: `${clip.id}-${Math.floor(currentTime)}-${index}`,
    time: formatClock(Math.max(0, currentTime - (4 - index) * 11)),
    message,
    severity: condition === 'aigc' && index < 3 ? ('critical' as const) : condition === 'uncertain' ? ('warning' as const) : ('info' as const)
  }));
  return [
    ...nearby.map((event) => ({
      id: `${clip.id}-${event.time}`,
      time: formatClock(event.time),
      message: `${event.label}: ${event.neural}`,
      severity: event.riskImpact > 0.24 ? ('critical' as const) : event.riskImpact > 0.1 ? ('warning' as const) : ('info' as const)
    })),
    ...generated
  ].slice(-6);
};
