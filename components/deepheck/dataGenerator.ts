import type { ErpPoint, EventItem, MetricState, PlvMatrix, RiskMode, TokenState, TokenUnit } from "./types";

export const channels = [
  "Fp1", "Fp2", "F3", "F4", "C3", "C4", "P3", "P4", "O1", "O2", "F7", "F8", "T3", "T4", "T5", "T6",
  "Fz", "Cz", "Pz", "Oz", "FC1", "FC2", "CP1", "CP2", "FC5", "FC6", "CP5", "CP6", "TP9", "TP10", "PO3", "PO4",
];

const responses = [
  {
    question: "请解释阿司匹林的主要医学用途。",
    text: "阿司匹林常用于缓解轻中度疼痛、降低发热反应，并在医生指导下用于抗血小板治疗，以减少部分心脑血管事件风险。对于胃肠道出血风险、过敏史或正在使用抗凝药物的人群，需要进行个体化评估。",
  },
  {
    question: "为什么大型语言模型会出现幻觉回答？",
    text: "大型语言模型根据上下文概率生成文本，当检索证据不足、问题含糊、训练语料存在冲突或推理链被错误前提牵引时，模型可能生成看似流畅但缺乏事实支撑的内容。实时监测需要同时关注语义不确定性、神经整合负荷和回答级风险累积。",
  },
  {
    question: "如何判断一段医学问答是否需要人工复核？",
    text: "可以综合观察断言强度、来源可核验性、术语一致性、禁忌症覆盖程度以及用户场景风险。如果回答包含高影响医学建议、缺少限定条件或与前文证据不一致，应触发人工复核流程。",
  },
];

const highRiskHints = ["风险", "错误", "缺乏", "冲突", "禁忌", "人工复核", "高影响", "不一致", "出血", "抗凝", "证据不足", "错误前提", "缺少限定"];

const tokenLexicon = [
  "大型语言模型",
  "上下文概率",
  "检索证据不足",
  "训练语料",
  "错误前提",
  "看似流畅",
  "事实支撑",
  "实时监测",
  "语义不确定性",
  "神经整合负荷",
  "回答级风险累积",
  "阿司匹林",
  "常用于",
  "轻中度疼痛",
  "降低",
  "发热反应",
  "医生指导下",
  "抗血小板治疗",
  "心脑血管事件",
  "胃肠道出血风险",
  "过敏史",
  "抗凝药物",
  "个体化评估",
  "综合观察",
  "断言强度",
  "来源可核验性",
  "术语一致性",
  "禁忌症",
  "用户场景风险",
  "高影响医学建议",
  "缺少限定条件",
  "前文证据不一致",
  "人工复核流程",
  "医学用途",
  "幻觉回答",
  "医学问答",
  "缓解",
  "疼痛",
  "医疗",
  "治疗",
  "根据",
  "生成",
  "文本",
  "问题",
  "含糊",
  "可能",
  "内容",
  "关注",
  "如果",
  "回答",
  "包含",
  "触发",
  "需要",
  "进行",
  "用于",
  "部分",
].sort((a, b) => b.length - a.length);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hashText(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function segmentText(text: string) {
  const tokens: string[] = [];
  let index = 0;

  while (index < text.length) {
    const rest = text.slice(index);
    const char = text[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/^[，。？！、；：,.!?]/.test(char)) {
      tokens.push(char);
      index += 1;
      continue;
    }

    const matched = tokenLexicon.find((word) => rest.startsWith(word));
    if (matched) {
      tokens.push(matched);
      index += matched.length;
      continue;
    }

    const nextPunctuation = rest.search(/[，。？！、；：,.!?\s]/);
    const raw = nextPunctuation === -1 ? rest : rest.slice(0, nextPunctuation);
    const step = raw.length >= 4 ? 2 : Math.max(1, raw.length);
    tokens.push(rest.slice(0, step));
    index += step;
  }

  return tokens;
}

function splitToTokens(text: string, mode: RiskMode): TokenUnit[] {
  const chunks = segmentText(text);
  return chunks.map((chunk, index) => {
    const seed = (hashText(chunk) % 100) / 100;
    const hasHint = highRiskHints.some((hint) => chunk.includes(hint));
    const modeBoost = mode === "high" ? 0.42 : mode === "mild" ? 0.12 : 0;
    const pulse = index % 13 === 7 ? 0.26 : 0;
    const risk = clamp(0.06 + seed * 0.2 + modeBoost + pulse + (hasHint ? 0.48 : 0), 0.03, 0.98);
    return { text: chunk, risk };
  });
}

export function createInitialMetrics(): MetricState {
  return {
    tokenRisk: 0.18,
    prefixRisk: 0.21,
    answerRisk: 24,
    plvDrop: 0.12,
    n400: 2.1,
    p600: 1.8,
    theta: 42,
    alpha: 58,
    beta: 38,
    gamma: 24,
    latency: 39,
    trial: 18,
  };
}

export function createInitialTokenState(mode: RiskMode = "stable"): TokenState {
  return {
    question: responses[0].question,
    responseIndex: 0,
    cursor: 0,
    tokens: splitToTokens(responses[0].text, mode),
    activeToken: undefined,
  };
}

export function nextTokenState(state: TokenState, mode: RiskMode): TokenState {
  const nextCursor = state.cursor + 1;
  if (nextCursor <= state.tokens.length) {
    return {
      ...state,
      cursor: nextCursor,
      activeToken: state.tokens[nextCursor - 1],
    };
  }

  const responseIndex = (state.responseIndex + 1) % responses.length;
  const tokens = splitToTokens(responses[responseIndex].text, mode);
  return {
    question: responses[responseIndex].question,
    responseIndex,
    cursor: 1,
    tokens,
    activeToken: tokens[0],
  };
}

export function reweightTokenStateForMode(state: TokenState, mode: RiskMode): TokenState {
  const response = responses[state.responseIndex];
  const tokens = splitToTokens(response.text, mode);
  return {
    ...state,
    tokens,
    activeToken: tokens[Math.max(0, state.cursor - 1)],
  };
}

export function updateMetrics(prev: MetricState, mode: RiskMode, tokenRisk: number): MetricState {
  const baseRisk = mode === "stable" ? 14 : mode === "mild" ? 34 : 62;
  const nonlinearRisk = Math.pow(tokenRisk, 1.75);
  const hallucinationSurge = tokenRisk > 0.68 ? 22 + tokenRisk * 18 : 0;
  const targetAnswer = clamp(baseRisk + nonlinearRisk * 58 + hallucinationSurge + (Math.random() - 0.5) * 5, 3, 99);
  const targetPrefix = clamp(tokenRisk * 0.72 + (mode === "high" ? 0.28 : mode === "mild" ? 0.1 : 0.02), 0, 1);
  const n400Target = 1.2 + tokenRisk * 7.2 + (mode === "high" ? 2.2 : 0);
  const p600Target = 1.0 + tokenRisk * 5.6 + (mode === "high" ? 1.6 : 0);
  const thetaTarget = 35 + tokenRisk * 42 + (mode === "high" ? 14 : mode === "mild" ? 5 : 0);
  const alphaTarget = 68 - tokenRisk * 18 + (Math.random() - 0.5) * 4;
  const betaTarget = 34 + tokenRisk * 18 + (Math.random() - 0.5) * 5;
  const gammaTarget = 22 + tokenRisk * 14 + (Math.random() - 0.5) * 4;

  return {
    tokenRisk: prev.tokenRisk * 0.42 + tokenRisk * 0.58,
    prefixRisk: prev.prefixRisk * 0.72 + targetPrefix * 0.28,
    answerRisk: prev.answerRisk * (tokenRisk > 0.68 ? 0.42 : 0.84) + targetAnswer * (tokenRisk > 0.68 ? 0.58 : 0.16),
    plvDrop: prev.plvDrop * 0.76 + clamp(tokenRisk * 0.72 + (mode === "high" ? 0.18 : 0), 0, 0.95) * 0.24,
    n400: prev.n400 * 0.7 + n400Target * 0.3,
    p600: prev.p600 * 0.72 + p600Target * 0.28,
    theta: prev.theta * 0.72 + thetaTarget * 0.28,
    alpha: prev.alpha * 0.82 + alphaTarget * 0.18,
    beta: prev.beta * 0.78 + betaTarget * 0.22,
    gamma: prev.gamma * 0.78 + gammaTarget * 0.22,
    latency: clamp(prev.latency * 0.7 + (34 + tokenRisk * 25 + Math.random() * 9) * 0.3, 28, 72),
    trial: prev.trial + (Math.random() > 0.85 ? 1 : 0),
  };
}

export function generateErpPoints(mode: RiskMode, risk: number, tick: number): ErpPoint[] {
  const riskScale = mode === "high" ? 1.35 : mode === "mild" ? 0.95 : 0.55;
  const points: ErpPoint[] = [];
  for (let t = -200; t <= 800; t += 20) {
    const n400 = -Math.exp(-Math.pow((t - 390) / 92, 2)) * (2.2 + risk * 6.8) * riskScale;
    const p600 = Math.exp(-Math.pow((t - 640) / 115, 2)) * (1.4 + risk * 5.2) * riskScale;
    const baseA = Math.sin((t + tick * 2.2) / 75) * 0.55 + Math.cos((t - tick) / 130) * 0.22;
    const baseB = Math.sin((t + 30 + tick * 2.5) / 82) * 0.48 + Math.cos((t + tick) / 120) * 0.18;
    const subjectA = baseA + n400 + p600;
    const subjectB = baseB + n400 * 0.88 + p600 * 1.08;
    points.push({ time: t, subjectA, subjectB, average: (subjectA + subjectB) / 2 });
  }
  return points;
}

export function createInitialPlvMatrix(): PlvMatrix {
  return Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => clamp(0.68 + Math.sin(row * 1.7 + col) * 0.08 + Math.random() * 0.08, 0, 1)),
  );
}

export function updatePlvMatrix(prev: PlvMatrix, mode: RiskMode, risk: number): PlvMatrix {
  const drop = mode === "high" ? 0.22 + risk * 0.22 : mode === "mild" ? 0.1 + risk * 0.12 : risk * 0.05;
  return prev.map((row, rowIndex) =>
    row.map((value, colIndex) => {
      const regionalDrop = rowIndex < 3 || colIndex > 4 ? drop : drop * 0.45;
      const target = clamp(0.78 - regionalDrop + Math.sin(Date.now() / 900 + rowIndex + colIndex * 1.3) * 0.08, 0.08, 0.98);
      return clamp(value * 0.8 + target * 0.2 + (Math.random() - 0.5) * 0.025, 0, 1);
    }),
  );
}

export function createEvent(metrics: MetricState, activeToken?: string): EventItem {
  const now = new Date();
  const time = now.toLocaleTimeString("zh-CN", { hour12: false });
  const riskHigh = metrics.answerRisk > 68 || metrics.tokenRisk > 0.72;
  const messages = riskHigh
    ? [
        `当前 Token 风险升高：${activeToken ?? "语义片段"}`,
        "N400 时间窗异常幅值上升，语义整合负荷增强",
        "额叶 Fz/F3/F4 通道 theta 增强",
        "PLV 同步指数下降，脑际耦合稳定性降低",
        "回答级风险评分更新，在线预警阈值接近触发",
      ]
    : [
        "Token Trigger 已同步，时间戳写入事件缓冲区",
        "Subject A Fz 通道保持稳定语义响应",
        "Subject B Pz 通道出现轻微整合响应",
        "ERP/PSD/PLV 特征窗口完成增量更新",
        "神经语义对齐模块完成交叉注意融合",
      ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time,
    level: riskHigh ? "risk" : metrics.answerRisk > 42 ? "warn" : "info",
    message,
  };
}

export function metricColor(score: number) {
  if (score >= 65) return "#fb375d";
  if (score >= 30) return "#f59e0b";
  return "#22d3ee";
}
