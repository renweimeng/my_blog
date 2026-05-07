import type {
  AnswerScript,
  BandPowers,
  EegChannelConfig,
  ERPPoint,
  EventLogItem,
  RiskMode,
  SubjectId,
  TelemetrySnapshot,
  TokenUnit
} from '../types';

export const CHANNEL_NAMES = [
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
  'T3',
  'T4',
  'T5',
  'T6',
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
  'PO4'
];

export const RISK_MODE_LABELS: Record<RiskMode, string> = {
  stable: '真实样本',
  mild: '可疑样本',
  high: 'AIGC 伪造'
};

const MODE_PROFILE = {
  stable: {
    baseRisk: 0.1,
    answerBase: 0.15,
    volatility: 0.028,
    tokenScale: 0.35,
    plvBase: 0.78,
    thetaBoost: 0.08,
    n400Base: 2.2,
    p600Base: 1.5
  },
  mild: {
    baseRisk: 0.24,
    answerBase: 0.38,
    volatility: 0.055,
    tokenScale: 0.5,
    plvBase: 0.62,
    thetaBoost: 0.2,
    n400Base: 3.1,
    p600Base: 2.2
  },
  high: {
    baseRisk: 0.45,
    answerBase: 0.62,
    volatility: 0.085,
    tokenScale: 0.62,
    plvBase: 0.48,
    thetaBoost: 0.38,
    n400Base: 4.3,
    p600Base: 3.4
  }
} satisfies Record<RiskMode, Record<string, number>>;

const REGION_SENSITIVE = new Set(['Fp1', 'Fp2', 'F3', 'F4', 'Fz', 'P3', 'P4', 'Pz', 'FC1', 'FC2', 'CP1', 'CP2']);

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const lerp = (a: number, b: number, amount: number) => a + (b - a) * amount;

const gaussian = (x: number, center: number, width: number) => Math.exp(-Math.pow(x - center, 2) / (2 * width * width));

const binaryRiskTarget = (mode: RiskMode, tokenRisk: number, tick: number) => {
  const wave = Math.sin(tick * 0.09) * 3 + Math.cos(tick * 0.047) * 2;

  if (mode === 'stable') {
    return clamp(8 + tokenRisk * 16 + wave, 4, 24);
  }

  if (mode === 'mild') {
    return clamp(76 + tokenRisk * 18 + wave, 72, 92);
  }

  return clamp(88 + tokenRisk * 10 + wave, 86, 98);
};

const nowTime = () =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date());

const makeTokens = (items: Array<[string, number]>): TokenUnit[] =>
  items.map(([text, intrinsicRisk]) => ({ text, intrinsicRisk }));

export const ANSWER_SCRIPTS: AnswerScript[] = [
  {
    id: 'real-interview',
    question: '真实采访片段 / 自然面部运动',
    tokens: makeTokens([
      ['片头基线', 0.05],
      ['自然眨眼', 0.08],
      ['头部微动', 0.06],
      ['唇形同步', 0.07],
      ['肤色连续', 0.08],
      ['眼周纹理稳定', 0.1],
      ['光照一致', 0.08],
      ['背景运动匹配', 0.09],
      ['面部边缘稳定', 0.11],
      ['音画节奏一致', 0.08],
      ['低频视觉响应', 0.07],
      ['ERP 基线稳定', 0.06],
      ['双被试一致', 0.08],
      ['真实倾向增强', 0.07],
      ['片尾复核', 0.1]
    ])
  },
  {
    id: 'face-swap',
    question: 'AIGC 换脸片段 / 局部纹理漂移',
    tokens: makeTokens([
      ['片头基线', 0.14],
      ['面部边缘轻闪', 0.34],
      ['眼周纹理漂移', 0.72],
      ['鼻梁高光异常', 0.56],
      ['唇形相位滞后', 0.66],
      ['下颌轮廓跳变', 0.7],
      ['肤色块状过渡', 0.62],
      ['背景压缩失配', 0.44],
      ['额叶 theta 增强', 0.58],
      ['N400 响应抬升', 0.64],
      ['PLV 局部下降', 0.54],
      ['风险进入复核区', 0.6],
      ['伪造线索聚合', 0.68],
      ['二元判别偏伪', 0.74],
      ['片尾复核', 0.48]
    ])
  },
  {
    id: 'talking-head',
    question: 'AIGC 数字人片段 / 时序一致性异常',
    tokens: makeTokens([
      ['片头基线', 0.16],
      ['眨眼频率异常', 0.7],
      ['口型闭合偏差', 0.76],
      ['面部微表情缺失', 0.64],
      ['颈部阴影不连续', 0.58],
      ['瞳孔反光失真', 0.68],
      ['帧间纹理重采样', 0.8],
      ['语音节拍漂移', 0.62],
      ['视觉冲突上升', 0.74],
      ['P600 重分析增强', 0.72],
      ['双被试分歧扩大', 0.58],
      ['融合层置信升高', 0.7],
      ['疑似生成片段', 0.82],
      ['风险峰值保持', 0.78],
      ['片尾复核', 0.56]
    ])
  }
];

export const createEegChannelConfigs = (): EegChannelConfig[] => {
  const configs: EegChannelConfig[] = [];

  (['A', 'B'] as SubjectId[]).forEach((subject, subjectOffset) => {
    CHANNEL_NAMES.forEach((name, index) => {
      const frontal = name.startsWith('F') || name === 'Fz';
      const occipital = name.startsWith('O') || name === 'Oz';
      configs.push({
        subject,
        name,
        index: index + subjectOffset * CHANNEL_NAMES.length,
        phase: Math.random() * Math.PI * 2,
        alphaFrequency: occipital ? 9.5 + Math.random() * 1.9 : 8.2 + Math.random() * 2.8,
        thetaFrequency: frontal ? 4.1 + Math.random() * 1.9 : 5.1 + Math.random() * 1.5,
        betaFrequency: 15 + Math.random() * 8,
        alphaAmplitude: occipital ? 0.7 + Math.random() * 0.35 : 0.42 + Math.random() * 0.32,
        thetaAmplitude: frontal ? 0.55 + Math.random() * 0.32 : 0.36 + Math.random() * 0.24,
        betaAmplitude: 0.2 + Math.random() * 0.18,
        noise: 0.2 + Math.random() * 0.18,
        spikeRate: 0.002 + Math.random() * 0.002
      });
    });
  });

  return configs;
};

export const generateEegValue = (
  config: EegChannelConfig,
  time: number,
  mode: RiskMode,
  tokenRisk: number
) => {
  const profile = MODE_PROFILE[mode];
  const sensitive = REGION_SENSITIVE.has(config.name);
  const subjectPhase = config.subject === 'A' ? 0 : 0.35;
  const riskBoost = sensitive ? tokenRisk * (0.72 + profile.thetaBoost) : tokenRisk * 0.18;
  const alpha = Math.sin(Math.PI * 2 * config.alphaFrequency * time + config.phase + subjectPhase) * config.alphaAmplitude;
  const theta =
    Math.sin(Math.PI * 2 * (config.thetaFrequency + riskBoost * 0.35) * time + config.phase * 0.5) *
    config.thetaAmplitude *
    (1 + riskBoost);
  const beta =
    Math.sin(Math.PI * 2 * config.betaFrequency * time + config.phase * 1.7) *
    config.betaAmplitude *
    (1 + tokenRisk * 0.12);
  const drift = Math.cos(Math.PI * 2 * 0.35 * time + config.phase) * 0.12;
  const noise = (Math.random() - 0.5) * config.noise * (1 + tokenRisk * (sensitive ? 1.2 : 0.45));
  const spike =
    Math.random() < config.spikeRate * (1 + tokenRisk * (sensitive ? 6 : 1.8))
      ? (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 1.1) * (1 + tokenRisk)
      : 0;

  return alpha + theta + beta + drift + noise + spike;
};

export const getTokenRisk = (script: AnswerScript, index: number, mode: RiskMode, phase = 0) => {
  const token = script.tokens[Math.max(0, Math.min(index, script.tokens.length - 1))];
  const profile = MODE_PROFILE[mode];
  const rhythmic = Math.sin(phase * 0.65 + index * 0.37) * profile.volatility;
  const local = token?.intrinsicRisk ?? 0.1;
  const highModeSurge = mode === 'high' && index % 7 === 0 ? 0.08 : 0;

  return clamp(profile.baseRisk + local * profile.tokenScale + rhythmic + highModeSurge, 0.04, 0.96);
};

export const createInitialTelemetry = (mode: RiskMode): TelemetrySnapshot => {
  const profile = MODE_PROFILE[mode];
  const initialAnswerRisk = binaryRiskTarget(mode, profile.baseRisk, 0);
  return {
    tokenRisk: profile.baseRisk,
    prefixRisk: initialAnswerRisk / 100,
    answerRisk: initialAnswerRisk,
    syncDropIndex: 0.18,
    n400Amplitude: profile.n400Base,
    p600Intensity: profile.p600Base,
    latency: 39,
    plvAverage: profile.plvBase,
    thetaPLV: profile.plvBase + 0.03,
    alphaPLV: profile.plvBase + 0.07,
    syncStability: profile.plvBase + 0.1,
    bands: {
      theta: 42,
      alpha: 56,
      beta: 36,
      gamma: 22
    },
    erp: generateERP(mode, profile.baseRisk, 0),
    plvMatrix: generatePLVMatrix(undefined, mode, profile.baseRisk, 0)
  };
};

export const generateERP = (mode: RiskMode, tokenRisk: number, tick: number): ERPPoint[] => {
  const profile = MODE_PROFILE[mode];
  const n400 = profile.n400Base + tokenRisk * 5.4;
  const p600 = profile.p600Base + tokenRisk * 4.4;
  const points: ERPPoint[] = [];

  for (let time = -200; time <= 800; time += 20) {
    const baseline = Math.sin((time + tick * 6) / 72) * 0.18 + Math.cos((time - tick * 3) / 95) * 0.12;
    const n400Wave = -n400 * gaussian(time, 410, 78);
    const p600Wave = p600 * gaussian(time, 635, 118);
    const subjectA = baseline + n400Wave * 1.02 + p600Wave * 0.92 + Math.sin(tick * 0.11 + time / 48) * 0.12;
    const subjectB = baseline * 0.85 + n400Wave * 0.9 + p600Wave * 1.1 + Math.cos(tick * 0.1 + time / 52) * 0.12;

    points.push({
      time,
      subjectA,
      subjectB,
      dyadicAverage: (subjectA + subjectB) / 2
    });
  }

  return points;
};

const generateBandPowers = (previous: BandPowers, mode: RiskMode, tokenRisk: number, tick: number): BandPowers => {
  const profile = MODE_PROFILE[mode];
  const thetaTarget = 32 + tokenRisk * 48 + profile.thetaBoost * 45 + Math.sin(tick * 0.17) * 3;
  const alphaTarget = 64 - tokenRisk * 22 + Math.cos(tick * 0.11) * 4;
  const betaTarget = 34 + tokenRisk * 15 + Math.sin(tick * 0.13 + 1.4) * 5;
  const gammaTarget = 20 + tokenRisk * 18 + Math.cos(tick * 0.19 + 0.4) * 4;

  return {
    theta: lerp(previous.theta, clamp(thetaTarget / 100, 0.08, 0.95) * 100, 0.12),
    alpha: lerp(previous.alpha, clamp(alphaTarget / 100, 0.08, 0.95) * 100, 0.1),
    beta: lerp(previous.beta, clamp(betaTarget / 100, 0.08, 0.95) * 100, 0.12),
    gamma: lerp(previous.gamma, clamp(gammaTarget / 100, 0.08, 0.88) * 100, 0.12)
  };
};

export const generatePLVMatrix = (
  previous: number[][] | undefined,
  mode: RiskMode,
  tokenRisk: number,
  tick: number
) => {
  const profile = MODE_PROFILE[mode];
  const size = 8;
  const matrix: number[][] = [];

  for (let row = 0; row < size; row += 1) {
    const line: number[] = [];
    for (let col = 0; col < size; col += 1) {
      const diagonal = row === col ? 0.12 : 0;
      const frontalParietal = row < 3 && col > 4 ? tokenRisk * 0.24 : 0;
      const wave = Math.sin(tick * 0.08 + row * 0.7 + col * 0.41) * 0.045;
      const disturbance = mode === 'high' ? (Math.random() - 0.5) * 0.1 * tokenRisk : 0;
      const target = clamp(profile.plvBase + diagonal + wave + disturbance - frontalParietal, 0.12, 0.94);
      const oldValue = previous?.[row]?.[col] ?? target;
      line.push(lerp(oldValue, target, 0.12));
    }
    matrix.push(line);
  }

  return matrix;
};

export const nextTelemetry = (
  previous: TelemetrySnapshot,
  mode: RiskMode,
  tokenRisk: number,
  tick: number
): TelemetrySnapshot => {
  const profile = MODE_PROFILE[mode];
  const smoothToken = lerp(previous.tokenRisk, tokenRisk, 0.22);
  const answerTarget = binaryRiskTarget(mode, smoothToken, tick);
  const prefixTarget = answerTarget / 100;
  const plvTarget = clamp(profile.plvBase - smoothToken * 0.28 + Math.sin(tick * 0.04) * 0.025, 0.16, 0.92);

  return {
    tokenRisk: smoothToken,
    prefixRisk: lerp(previous.prefixRisk, prefixTarget, 0.16),
    answerRisk: lerp(previous.answerRisk, answerTarget, 0.18),
    syncDropIndex: lerp(previous.syncDropIndex, clamp(0.12 + smoothToken * 0.72, 0.08, 0.92), 0.11),
    n400Amplitude: lerp(previous.n400Amplitude, profile.n400Base + smoothToken * 5.3, 0.1),
    p600Intensity: lerp(previous.p600Intensity, profile.p600Base + smoothToken * 4.2, 0.1),
    latency: lerp(previous.latency, 34 + smoothToken * 26 + Math.sin(tick * 0.13) * 3, 0.12),
    plvAverage: lerp(previous.plvAverage, plvTarget, 0.1),
    thetaPLV: lerp(previous.thetaPLV, clamp(plvTarget - smoothToken * 0.12 + 0.08, 0.08, 0.92), 0.1),
    alphaPLV: lerp(previous.alphaPLV, clamp(plvTarget + 0.08 - smoothToken * 0.06, 0.12, 0.94), 0.1),
    syncStability: lerp(previous.syncStability, clamp(plvTarget + 0.16 - smoothToken * 0.22, 0.1, 0.96), 0.1),
    bands: generateBandPowers(previous.bands, mode, smoothToken, tick),
    erp: generateERP(mode, smoothToken, tick),
    plvMatrix: generatePLVMatrix(previous.plvMatrix, mode, smoothToken, tick)
  };
};

const eventTemplates = {
  stable: [
    '视频关键帧 Trigger 同步稳定，脑电时间戳已对齐',
    '被试 A Cz 通道 alpha 节律保持平稳',
    '被试 B Pz 通道视觉诱发响应处于参考区间',
    '脑际 PLV 相位锁定值维持高一致性',
    '脑电-视频融合层输出真实倾向'
  ],
  mild: [
    '被试 A Fz 通道检测到 theta 频段增强',
    '视觉违和相关 N400 响应出现轻度偏移',
    '融合层提升当前帧伪造线索权重',
    '脑际同步稳定性指数小幅下降',
    '片段风险分数进入在线复核区'
  ],
  high: [
    'N400 时间窗异常幅值快速上升',
    'P600 视觉重分析响应强度增强',
    'PLV 同步指数出现局部下降',
    '当前关键帧伪造风险显著升高',
    '额叶与顶叶通道出现鉴伪相关同步扰动'
  ]
} satisfies Record<RiskMode, string[]>;

export const generateEventLog = (
  mode: RiskMode,
  telemetry: TelemetrySnapshot,
  cueText: string,
  elapsedSeconds: number
): EventLogItem => {
  const pool = eventTemplates[mode];
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const severity: EventLogItem['severity'] =
    telemetry.tokenRisk > 0.72 || mode === 'high' ? 'critical' : telemetry.tokenRisk > 0.42 ? 'warning' : 'info';
  const cueSuffix = cueText ? `：${cueText}` : '';

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time: nowTime(),
    message:
      Math.random() > 0.72
        ? `关键帧 Trigger 已同步：t = ${elapsedSeconds.toFixed(3)} s${cueSuffix}`
        : picked,
    severity
  };
};

export const colorForRisk = (risk: number) => {
  if (risk < 0.3) return '#22d3ee';
  if (risk < 0.65) return '#f59e0b';
  return '#f85149';
};

export const plvColor = (value: number) => {
  if (value < 0.28) return `rgba(28, 54, 132, ${0.55 + value})`;
  if (value < 0.48) return `rgba(24, 144, 205, ${0.58 + value * 0.55})`;
  if (value < 0.68) return `rgba(34, 211, 238, ${0.62 + value * 0.45})`;
  if (value < 0.82) return `rgba(250, 204, 21, ${0.58 + value * 0.36})`;
  return `rgba(248, 81, 73, ${0.62 + value * 0.32})`;
};
