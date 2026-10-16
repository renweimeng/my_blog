export type LiveText = readonly [string, string];
export type LiveTaskKind =
  | "count"
  | "rotation"
  | "stroop"
  | "shapes"
  | "mental"
  | "memory";

export interface LiveTask {
  id: string;
  kind: LiveTaskKind;
  name: LiveText;
  prompt: LiveText;
  rule: LiveText;
  explanation: LiveText;
  difficulty: number;
  answer: number;
  options: number[];
}

export const liveTasks: LiveTask[] = [
  {
    id: "quantity",
    kind: "count",
    name: ["数量关系推理", "Numerical relations"],
    prompt: [
      "观察每一行的变化，补全右下角。",
      "Find the row-wise rule and complete the matrix.",
    ],
    rule: [
      "每向右一格，圆点数量增加 1。",
      "Each step to the right adds one dot.",
    ],
    explanation: [
      "第三行是 3 → 4 → 5，因此应选择五个圆点。",
      "The final row is 3 → 4 → 5. Select five dots.",
    ],
    difficulty: 0.44,
    answer: 3,
    options: [2, 3, 4, 5],
  },
  {
    id: "direction",
    kind: "rotation",
    name: ["方向序列推理", "Directional sequence"],
    prompt: [
      "沿行和列观察箭头，选择缺失方向。",
      "Follow the arrows across rows and columns.",
    ],
    rule: [
      "向右或向下移动，箭头顺时针旋转 90°。",
      "Each step right or down rotates the arrow 90° clockwise.",
    ],
    explanation: [
      "最后一行由向下、向左到向上，下一项应向上。",
      "The last row goes down, left, then up. Choose the upward arrow.",
    ],
    difficulty: 0.61,
    answer: 0,
    options: [0, 90, 180, 270],
  },
  {
    id: "interference",
    kind: "stroop",
    name: ["颜色干扰抑制", "Color interference"],
    prompt: [
      "忽略文字含义，只选择文字显示的颜色。",
      "Ignore the word. Select the color of the ink.",
    ],
    rule: [
      "文字写着“蓝色”，但实际显示为红色。",
      "The word says “blue”, but its ink is red.",
    ],
    explanation: [
      "任务要求判断字色，而不是读出词义；正确答案是红色。",
      "The task asks for ink color, not word meaning. Red is correct.",
    ],
    difficulty: 0.82,
    answer: 1,
    options: [0, 1, 2, 3],
  },
  {
    id: "shape",
    kind: "shapes",
    name: ["图形循环推理", "Cyclic shape reasoning"],
    prompt: [
      "每一行有相同的三种图形，补全空缺。",
      "Each row contains the same three shapes. Fill the gap.",
    ],
    rule: [
      "圆、方、三角按行循环移位，每行各出现一次。",
      "Circle, square and triangle shift cyclically across rows.",
    ],
    explanation: [
      "第三行已有三角形和圆形，缺失的图形是正方形。",
      "The last row already has a triangle and a circle. A square is missing.",
    ],
    difficulty: 0.52,
    answer: 1,
    options: [0, 1, 2, 3],
  },
  {
    id: "spatial",
    kind: "mental",
    name: ["心理旋转任务", "Mental rotation"],
    prompt: [
      "将参考图形顺时针旋转 90°，不做镜像。",
      "Rotate the reference 90° clockwise, without mirroring.",
    ],
    rule: [
      "保留结构与手性，仅改变方向。",
      "Preserve the structure and handedness; change only orientation.",
    ],
    explanation: [
      "选项 B 与参考图形顺时针旋转 90° 后的结构一致。",
      "Option B preserves the reference after a 90° clockwise rotation.",
    ],
    difficulty: 0.76,
    answer: 1,
    options: [0, 90, 180, 270],
  },
  {
    id: "memory",
    kind: "memory",
    name: ["空间工作记忆", "Spatial working memory"],
    prompt: [
      "记住亮起位置的顺序，选出最后亮起的位置。",
      "Remember the sequence and identify the final illuminated cell.",
    ],
    rule: [
      "呈现顺序为左上 → 中心 → 右上 → 左下。",
      "The sequence is top-left → center → top-right → bottom-left.",
    ],
    explanation: [
      "最后亮起的是左下角的位置，即选项 C。",
      "The last illuminated cell is the bottom-left one: option C.",
    ],
    difficulty: 0.67,
    answer: 2,
    options: [0, 4, 6, 2],
  },
];

export const LIVE_TRIAL_MS = 20_000;
export const liveStages = [
  {
    id: "fixation",
    name: ["注视准备", "Fixation"] as LiveText,
    start: 0,
    end: 1200,
    code: "FIX",
  },
  {
    id: "encode",
    name: ["刺激编码", "Encoding"] as LiveText,
    start: 1200,
    end: 5600,
    code: "STIM",
  },
  {
    id: "integrate",
    name: ["规则整合", "Integration"] as LiveText,
    start: 5600,
    end: 11200,
    code: "RULE",
  },
  {
    id: "verify",
    name: ["冲突检验", "Verification"] as LiveText,
    start: 11200,
    end: 15800,
    code: "CHECK",
  },
  {
    id: "respond",
    name: ["选择作答", "Response"] as LiveText,
    start: 15800,
    end: 18400,
    code: "RESP",
  },
  {
    id: "feedback",
    name: ["结果反馈", "Feedback"] as LiveText,
    start: 18400,
    end: LIVE_TRIAL_MS,
    code: "FB",
  },
] as const;

export interface LiveElectrode {
  name: string;
  x: number;
  y: number;
  region: "frontal" | "central" | "parietal" | "occipital" | "temporal";
}

// Normalized schematic positions, not an anatomical or source-localization model.
export const liveElectrodes: LiveElectrode[] = [
  { name: "Fp1", x: -0.29, y: -0.83, region: "frontal" },
  { name: "Fp2", x: 0.29, y: -0.83, region: "frontal" },
  { name: "F7", x: -0.78, y: -0.45, region: "frontal" },
  { name: "F3", x: -0.4, y: -0.44, region: "frontal" },
  { name: "Fz", x: 0, y: -0.48, region: "frontal" },
  { name: "F4", x: 0.4, y: -0.44, region: "frontal" },
  { name: "F8", x: 0.78, y: -0.45, region: "frontal" },
  { name: "FC5", x: -0.62, y: -0.23, region: "frontal" },
  { name: "FC1", x: -0.23, y: -0.23, region: "frontal" },
  { name: "FC2", x: 0.23, y: -0.23, region: "frontal" },
  { name: "FC6", x: 0.62, y: -0.23, region: "frontal" },
  { name: "T7", x: -0.9, y: 0, region: "temporal" },
  { name: "C3", x: -0.44, y: 0, region: "central" },
  { name: "Cz", x: 0, y: 0, region: "central" },
  { name: "C4", x: 0.44, y: 0, region: "central" },
  { name: "T8", x: 0.9, y: 0, region: "temporal" },
  { name: "CP5", x: -0.63, y: 0.24, region: "parietal" },
  { name: "CP1", x: -0.23, y: 0.24, region: "parietal" },
  { name: "CP2", x: 0.23, y: 0.24, region: "parietal" },
  { name: "CP6", x: 0.63, y: 0.24, region: "parietal" },
  { name: "P7", x: -0.76, y: 0.46, region: "parietal" },
  { name: "P3", x: -0.4, y: 0.44, region: "parietal" },
  { name: "Pz", x: 0, y: 0.48, region: "parietal" },
  { name: "P4", x: 0.4, y: 0.44, region: "parietal" },
  { name: "P8", x: 0.76, y: 0.46, region: "parietal" },
  { name: "PO3", x: -0.28, y: 0.66, region: "occipital" },
  { name: "PO4", x: 0.28, y: 0.66, region: "occipital" },
  { name: "O1", x: -0.29, y: 0.83, region: "occipital" },
  { name: "Oz", x: 0, y: 0.9, region: "occipital" },
  { name: "O2", x: 0.29, y: 0.83, region: "occipital" },
  { name: "TP9", x: -0.88, y: 0.28, region: "temporal" },
  { name: "TP10", x: 0.88, y: 0.28, region: "temporal" },
];

export const clampLive = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const bell = (x: number, center: number, width: number) =>
  Math.exp(-(((x - center) / width) ** 2));
const smooth = (x: number) => {
  const v = clampLive(x);
  return v * v * (3 - 2 * v);
};

function hashNoise(n: number, seed: number) {
  let x = Math.imul(n ^ seed, 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return ((x ^ (x >>> 16)) >>> 0) / 2147483648 - 1;
}

function noise(time: number, frequency: number, seed: number) {
  const at = time * frequency;
  const n = Math.floor(at),
    f = at - n;
  return hashNoise(n, seed) * (1 - f) + hashNoise(n + 1, seed) * f;
}

export function liveTiming(elapsedMs: number) {
  const safe = Math.max(0, elapsedMs);
  const trialIndex = Math.floor(safe / LIVE_TRIAL_MS);
  const within = safe % LIVE_TRIAL_MS;
  const phase = liveStages.findIndex((stage) => within < stage.end);
  const task = liveTasks[trialIndex % liveTasks.length];
  return { trialIndex, within, phase, task };
}

export function liveOutcome(trialIndex: number) {
  const task = liveTasks[trialIndex % liveTasks.length];
  // Occasional scripted errors make the verification/feedback states visible.
  const choice = trialIndex % 5 === 2 ? (task.answer + 1) % 4 : task.answer;
  return { choice, correct: choice === task.answer };
}

export function liveResponseAt(trialIndex: number) {
  const task = liveTasks[trialIndex % liveTasks.length];
  return 16000 + Math.round(task.difficulty * 1400) + (trialIndex % 3) * 90;
}

export function liveMetrics(elapsedMs: number) {
  const timing = liveTiming(elapsedMs);
  const seconds = timing.within / 1000;
  const difficulty = timing.task.difficulty;
  const load = clampLive(
    0.18 +
      difficulty * 0.28 +
      bell(seconds, 8.6, 3.7) * 0.35 +
      bell(seconds, 13.3, 1.6) * difficulty * 0.24 +
      Math.sin(elapsedMs / 1100) * 0.035,
  );
  const conflict = bell(seconds, 12.7, 2.3) * difficulty;
  const confidence = clampLive(
    0.2 +
      smooth((seconds - 2) / 14) * 0.72 -
      conflict * 0.2 +
      Math.sin(elapsedMs / 1600) * 0.025,
  );
  const attention = clampLive(
    0.58 +
      bell(seconds, 5.9, 5.8) * 0.27 -
      bell(seconds, 18.9, 1.3) * 0.17 +
      Math.sin(elapsedMs / 2300) * 0.04,
  );
  const alignment = clampLive(
    0.54 +
      smooth((seconds - 2) / 12) * 0.33 -
      conflict * 0.12 +
      Math.sin(elapsedMs / 2100) * 0.025,
  );
  return {
    load,
    confidence,
    conflict,
    attention,
    alignment,
    quality: clampLive(
      0.96 -
        bell(seconds, 4.2, 0.4) * 0.07 +
        Math.sin(elapsedMs / 3100) * 0.018,
    ),
  };
}

export function getLiveFrame(elapsedMs: number) {
  const timing = liveTiming(elapsedMs);
  const stage = liveStages[timing.phase];
  const outcome = liveOutcome(timing.trialIndex);
  return {
    ...timing,
    ...liveMetrics(elapsedMs),
    elapsedMs,
    stage,
    progress: timing.within / LIVE_TRIAL_MS,
    phaseProgress: (timing.within - stage.start) / (stage.end - stage.start),
    focus: Math.floor(Math.max(0, timing.within - 1200) / 730) % 8,
    choice:
      timing.within >= liveResponseAt(timing.trialIndex)
        ? outcome.choice
        : null,
    correct: outcome.correct,
    responseSeconds: (liveResponseAt(timing.trialIndex) - 1200) / 1000,
    completed: timing.trialIndex + (timing.phase === 5 ? 1 : 0),
  };
}
export type LiveFrame = ReturnType<typeof getLiveFrame>;

export function evokedSignal(
  ms: number,
  difficulty: number,
  posterior = false,
) {
  return (
    -bell(ms, 230, 68) * (2 + difficulty * 3) +
    bell(ms, 390, 100) * (posterior ? 7.8 : 4.6) +
    bell(ms, 610, 130) * difficulty * 2
  );
}

export function sampleLiveEEG(channel: number, seconds: number) {
  const electrode = liveElectrodes[channel % liveElectrodes.length];
  const ms = seconds * 1000;
  const { task, within, trialIndex } = liveTiming(ms);
  const s = within / 1000;
  const frontal = electrode.region === "frontal";
  const posterior =
    electrode.region === "occipital" || electrode.region === "parietal";
  const load = 0.3 + task.difficulty * 0.22 + bell(s, 9.5, 4) * 0.5;
  const phase = channel * 1.731;
  const alpha =
    Math.sin(2 * Math.PI * (9.1 + (channel % 5) * 0.57) * seconds + phase) *
    (posterior ? 9 : 4.2) *
    (1 - load * 0.35);
  const theta =
    Math.sin(
      2 * Math.PI * (4.6 + (channel % 4) * 0.43) * seconds + phase * 0.7,
    ) * (frontal ? 3.9 + load * 7 : 3.7);
  const beta =
    Math.sin(
      2 * Math.PI * (17 + (channel % 7) * 1.31) * seconds + phase * 1.3,
    ) *
    (2.9 + load * 1.8);
  const gamma =
    Math.sin(2 * Math.PI * (34 + (channel % 5) * 1.7) * seconds + phase * 0.3) *
    1.2;
  const rough =
    noise(seconds, 45, channel + 101) * 6.8 +
    noise(seconds, 21, channel + 201) * 3.6 +
    noise(seconds, 95, channel + 301) * 2.3;
  const drift =
    noise(seconds, 1.3, channel + 401) * 2 +
    Math.sin(seconds * 1.7 + phase) * 1.4;
  const blink = frontal ? bell(s, 4.2, 0.11) * (15 + (channel % 4) * 2) : 0;
  const response =
    evokedSignal(within - 1200, task.difficulty, posterior) +
    evokedSignal(
      within - liveResponseAt(trialIndex),
      task.difficulty * 0.7,
      posterior,
    ) *
      0.65;
  return alpha + theta + beta + gamma + rough + drift + blink + response;
}

export interface LiveAnalysis {
  scalp: number[];
  spectrum: number[];
  bands: {
    id: string;
    name: LiveText;
    range: string;
    value: number;
    color: string;
  }[];
}

export function analyzeLiveSignal(
  elapsedMs: number,
  channel: number,
): LiveAnalysis {
  const now = elapsedMs / 1000;
  const scalp = liveElectrodes.map((_, index) => {
    let sum = 0;
    for (let i = 0; i < 64; i++)
      sum += sampleLiveEEG(index, now - i / 256) ** 2;
    return Math.sqrt(sum / 64);
  });
  const samples = Array.from({ length: 512 }, (_, i) =>
    sampleLiveEEG(channel, now - (511 - i) / 256),
  );
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const windowed = samples.map(
    (sample, i) =>
      (sample - mean) * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / 511)),
  );
  // Goertzel measures the generated signal; charts are not independent random numbers.
  const spectrum = Array.from({ length: 45 }, (_, f) => {
    const coefficient = 2 * Math.cos((2 * Math.PI * (f + 1)) / 256);
    let previous = 0,
      before = 0;
    for (const sample of windowed) {
      const current = sample + coefficient * previous - before;
      before = previous;
      previous = current;
    }
    return (
      Math.max(
        0,
        previous ** 2 + before ** 2 - coefficient * previous * before,
      ) /
      512 ** 2
    );
  });
  const definitions = [
    {
      id: "theta",
      name: ["θ 频段", "Theta"] as LiveText,
      range: "4–7 Hz",
      lo: 4,
      hi: 7,
      color: "#d6b98b",
    },
    {
      id: "alpha",
      name: ["α 频段", "Alpha"] as LiveText,
      range: "8–12 Hz",
      lo: 8,
      hi: 12,
      color: "#6edbc6",
    },
    {
      id: "beta",
      name: ["β 频段", "Beta"] as LiveText,
      range: "13–30 Hz",
      lo: 13,
      hi: 30,
      color: "#b5a0e8",
    },
    {
      id: "gamma",
      name: ["γ 频段", "Gamma"] as LiveText,
      range: "31–45 Hz",
      lo: 31,
      hi: 45,
      color: "#82b9ed",
    },
  ];
  const power = definitions.map((band) =>
    spectrum.slice(band.lo - 1, band.hi).reduce((a, b) => a + b, 0),
  );
  const total = power.reduce((a, b) => a + b, 0) || 1;
  return {
    scalp,
    spectrum,
    bands: definitions.map((band, i) => ({ ...band, value: power[i] / total })),
  };
}

export function getLiveEvents(elapsedMs: number) {
  const { trialIndex, within } = liveTiming(elapsedMs);
  const events: { id: string; time: number; phase: number; text: LiveText }[] =
    [];
  for (let trial = Math.max(0, trialIndex - 2); trial <= trialIndex; trial++) {
    for (let phase = 0; phase < liveStages.length; phase++) {
      const stage = liveStages[phase];
      const eventAt = phase === 4 ? liveResponseAt(trial) : stage.start;
      if (trial === trialIndex && eventAt > within) continue;
      const text: LiveText =
        phase === 0
          ? ["试次开始 · 刺激时钟归零", "Trial opened · stimulus clock reset"]
          : phase === 1
            ? ["刺激呈现 · 事件标记 S01", "Stimulus onset · event S01"]
            : phase === 2
              ? [
                  "规则比较 · 关注前额与顶叶窗口",
                  "Rule comparison · frontoparietal window",
                ]
              : phase === 3
                ? [
                    "候选复核 · 更新过程对齐指标",
                    "Candidate check · alignment updated",
                  ]
                : phase === 4
                  ? [
                      `被试作答 · 选项 ${"ABCD"[liveOutcome(trial).choice]}`,
                      `Response · option ${"ABCD"[liveOutcome(trial).choice]}`,
                    ]
                  : liveOutcome(trial).correct
                    ? ["反馈完成 · 本题回答正确", "Feedback · correct response"]
                    : [
                        "反馈完成 · 检出回答偏差",
                        "Feedback · response mismatch",
                      ];
      events.push({
        id: `${trial}-${phase}`,
        time: trial * LIVE_TRIAL_MS + eventAt,
        phase,
        text,
      });
    }
  }
  return events.slice(-18).reverse();
}

export function liveAccuracy(completed: number) {
  if (completed === 0) return null;
  let correct = 0;
  for (let trial = 0; trial < completed; trial++)
    if (liveOutcome(trial).correct) correct++;
  return correct / completed;
}

export function formatLiveTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
