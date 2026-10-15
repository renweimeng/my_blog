import {
  defaultParameters,
  type LoopParameters,
  type LoopRound,
  type LoopState,
  type QueryCandidate,
} from "./types";

export const clamp = (x: number, lo = 0, hi = 1) =>
  Math.max(lo, Math.min(hi, x));

// A local, deterministic PRNG. Rendering never consumes the experiment's random stream.
export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normal(random: () => number) {
  return (
    Math.sqrt(-2 * Math.log(Math.max(1e-9, random()))) *
    Math.cos(2 * Math.PI * random())
  );
}

export const initialLoopState = (): LoopState => ({
  rounds: [],
  skills: [0.54, 0.46, 0.59, 0.4, 0.51, 0.44],
  version: 1,
  minutes: 0,
});
const mean = (xs: number[]) =>
  xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

export function riskShrinkage(a: number, variance: number, drift = 0) {
  const total = Math.max(0, variance) + Math.max(0, drift);
  const rho = a + total > 0 ? Math.max(0, a) / (Math.max(0, a) + total) : 0;
  return { rho, risk: (1 - rho) ** 2 * a + rho ** 2 * total };
}

export function generateCandidates(
  params: LoopParameters,
  state: LoopState,
): QueryCandidate[] {
  const random = seededRandom(params.seed + (state.rounds.length + 1) * 7919);
  const active = params.mode === "active" || params.mode === "full";
  const candidates = Array.from({ length: params.candidateCount }, (_, i) => {
    const concept = i % 6;
    const difficulty = 0.25 + random() * 0.7;
    const uncertainty = 1 - state.skills[concept];
    const informationGain = clamp(
      uncertainty *
        (1 - Math.abs(difficulty - (1 - uncertainty))) *
        (0.75 + random() * 0.25),
    );
    const redundancy =
      state.rounds.slice(-6).filter((r) => r.selected.concept === concept)
        .length / 6;
    const seconds = 8 + difficulty * 15 + params.fatigue * 8;
    const safetyRisk = random() * 0.12;
    const expectedGain = informationGain * (1 - params.noise * 0.7);
    const utility =
      1.8 * informationGain +
      expectedGain -
      redundancy * 0.35 -
      seconds / 90 -
      safetyRisk * params.strictness;
    return {
      id: `q-${state.rounds.length + 1}-${i + 1}`,
      concept,
      difficulty,
      informationGain,
      expectedGain,
      redundancy,
      seconds,
      safetyRisk,
      utility,
      x: 0.1 + random() * 0.8,
      y: 0.12 + random() * 0.76,
      propensity: 0,
    };
  });
  const temperature = params.controller === "agent" ? 0.14 : 0.38;
  const max = Math.max(...candidates.map((c) => c.utility));
  const weights = candidates.map((c) =>
    Math.exp((c.utility - max) / temperature),
  );
  const sum = weights.reduce((a, b) => a + b, 0);
  return candidates.map((c, i) => ({
    ...c,
    propensity: active
      ? ((1 - params.exploration) * weights[i]) / sum +
        params.exploration / candidates.length
      : 1 / candidates.length,
  }));
}

export function simulateRound(
  params: LoopParameters,
  state: LoopState,
): LoopRound | null {
  if (state.rounds.length >= 50 || state.minutes >= params.budgetMinutes)
    return null;
  const id = state.rounds.length + 1;
  const random = seededRandom(params.seed + id * 104729);
  const candidates = generateCandidates(params, state);
  let draw = random();
  const selected =
    candidates.find((c) => (draw -= c.propensity) <= 0) ??
    candidates[candidates.length - 1];
  const humanSeconds = selected.seconds * (1.25 - params.expertise * 0.4);
  if (state.minutes + humanSeconds / 60 > params.budgetMinutes) return null;
  const fatigue = clamp(params.fatigue + state.minutes * 0.014);
  const boundaryError = Math.abs(params.segmentBoundary - 0.55);
  const quality = clamp(
    1 -
      params.noise * 0.55 -
      fatigue * 0.26 -
      boundaryError * 0.35 -
      Math.abs(normal(random)) * 0.025,
  );
  const compatibleError = (1 - state.skills[selected.concept]) ** 2;
  const modalityFactor = {
    behavior: 1.5,
    eeg: 1,
    "eeg-eye": 0.78,
    "eeg-fmri": 0.68,
  }[params.sensors];
  const innovation =
    params.sensors === "behavior"
      ? 0
      : (1 - params.noise) * (params.sensors === "eeg" ? 0.16 : 0.27);
  const variance =
    (0.012 +
      params.noise ** 2 * 0.36 +
      fatigue ** 2 * 0.1 +
      boundaryError ** 2 * 0.35) *
    modalityFactor *
    (params.personal ? 1.25 : 1);
  const driftRisk = params.drift ** 2 * (0.1 + id * 0.003);
  const shrink = riskShrinkage(compatibleError, variance, driftRisk);
  const accepted = quality > 0.38 && fatigue < 0.86;
  const rho = accepted ? shrink.rho * params.teacherWeight : 0;
  const risk =
    (1 - rho) ** 2 * compatibleError + rho ** 2 * (variance + driftRisk);
  const kernel = Array.from({ length: 8 }, (_, i) =>
    Array.from({ length: 8 }, (_, j) =>
      clamp(
        Math.exp(-Math.abs(i - j) * 0.3) +
          (random() - 0.5) * params.noise * 0.4,
      ),
    ),
  );
  const neuralGain =
    params.sensors === "behavior" ? 0 : innovation * rho * 0.065;
  const gain =
    (0.012 + selected.informationGain * 0.045 + neuralGain) *
    params.learningRate *
    params.expertise *
    (1 - fatigue);
  const update = Math.min(params.updateRadius, gain);
  const corrupted = params.drift > 0.65 || params.noise > 0.86;
  const skillsShadow = state.skills.map((skill, i) =>
    clamp(
      skill +
        (i === selected.concept
          ? update * (corrupted ? -2 : 3.4)
          : update * 0.32) -
        (1 - params.replay) * update * 0.5,
    ),
  );
  // The held-out sentinel has an independent random stream and a fixed, balanced distribution.
  const sentinel = seededRandom(params.seed + id * 15485863);
  const sentinelBefore = mean(state.skills) + normal(sentinel) * 0.0005;
  const sentinelAfter = mean(skillsShadow) + normal(sentinel) * 0.0005;
  const confidenceRadius = 0.0007 + params.strictness * 0.0014;
  const difference = sentinelAfter - sentinelBefore;
  const online = params.mode === "online" || params.mode === "full";
  const forgetting = Math.max(
    0,
    mean(state.skills.map((x, i) => x - skillsShadow[i])),
  );
  let audit: LoopRound["audit"] = "uncertain";
  let reason: LoopRound["reason"] = "insufficient";
  if (!online) {
    audit = "frozen";
    reason = "frozen";
  } else if (fatigue >= 0.86) {
    audit = "fail";
    reason = "fatigue";
  } else if (!accepted) {
    audit = "fail";
    reason = "quality";
  } else if (difference < -confidenceRadius || forgetting > 0.01) {
    audit = "fail";
    reason = "degraded";
  } else if (difference > confidenceRadius) {
    audit = "pass";
    reason = "improved";
  }
  const skillsAfter = audit === "pass" ? skillsShadow : [...state.skills];
  const eeg = Array.from({ length: 8 }, (_, channel) =>
    Array.from({ length: 160 }, (_, i) => {
      const t = i / 40;
      const conflict =
        Math.exp(-(((t - 2.2) / 0.32) ** 2)) * selected.difficulty;
      return (
        Math.sin(t * (9 + channel * 0.4) * 6.28) * 0.3 +
        Math.sin(t * (4.2 + channel * 0.12) * 6.28) * (0.2 + conflict) +
        normal(random) * params.noise * 0.5
      );
    }),
  );
  const gaze: [number, number][] = Array.from({ length: 18 }, (_, i) => [
    0.15 + (i % 4) * 0.2 + random() * 0.1,
    0.2 + Math.floor(i / 5) * 0.16 + random() * 0.08,
  ]);
  return {
    id,
    seed: params.seed + id * 104729,
    parameters: { ...params },
    candidates,
    selected,
    teacher: {
      compatibleError,
      floor: 0.06 + selected.difficulty * 0.12,
      variance,
      driftRisk,
      innovation,
      quality,
      rho,
      risk,
      accepted,
      kernel,
    },
    humanSeconds,
    totalMinutes: state.minutes + humanSeconds / 60,
    fatigue,
    skillsBefore: [...state.skills],
    skillsAfter,
    performance: mean(skillsAfter),
    shadowPerformance: mean(skillsShadow),
    sentinelBefore,
    sentinelAfter,
    confidenceRadius,
    forgetting,
    calibration: clamp(0.12 - mean(skillsAfter) * 0.08 + params.noise * 0.03),
    fairness: clamp(1 - Math.max(...skillsAfter) + Math.min(...skillsAfter)),
    audit,
    reason,
    modelBefore: state.version,
    modelAfter: state.version + (audit === "pass" ? 1 : 0),
    eeg,
    gaze,
    pupil: Array.from(
      { length: 40 },
      (_, i) =>
        3 +
        Math.sin(i / 8) * 0.2 +
        selected.difficulty * Math.exp(-(((i - 23) / 6) ** 2)),
    ),
    events: [
      { time: 0, kind: "onset" },
      { time: 0.5, kind: "attention" },
      { time: 1.2, kind: "evidence" },
      { time: 2.1, kind: "conflict" },
      { time: 2.8, kind: "recheck" },
      { time: 3.7, kind: "decision" },
    ],
    propensityWeight: 1 / candidates.length / selected.propensity,
  };
}

export function appendRound(state: LoopState, round: LoopRound): LoopState {
  return {
    rounds: [...state.rounds, round],
    skills: round.skillsAfter,
    version: round.modelAfter,
    minutes: round.totalMinutes,
  };
}

export function runExperiment(
  params: LoopParameters = defaultParameters,
  count = 30,
): LoopState {
  let state = initialLoopState();
  for (let i = 0; i < Math.min(50, count); i++) {
    const round = simulateRound(params, state);
    if (!round) break;
    state = appendRound(state, round);
  }
  return state;
}
