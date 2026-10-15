"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Info,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import { makeKernel } from "@/lib/cortex-loop/relay";
import { riskShrinkage } from "@/lib/cortex-loop/simulation";
import { useCortex } from "./CortexContext";
import {
  Chart,
  Kernel,
  Metric,
  PageHeading,
  Panel,
  Range,
  Segmented,
  SourceTag,
} from "./Primitives";

const topics = [
  [
    "跨被试无偏性",
    "Cross-donor unbiasedness",
    "消除自乘噪声",
    "Cancel self-noise",
  ],
  [
    "学生兼容分解",
    "Student compatibility",
    "先投影，再校准",
    "Project, then calibrate",
  ],
  [
    "风险最优收缩",
    "Risk-optimal shrinkage",
    "噪声大，就少相信",
    "Trust less when noise grows",
  ],
  [
    "多模态条件创新",
    "Conditional innovation",
    "更多模态 ≠ 更多信息",
    "More modalities ≠ more information",
  ],
  [
    "自适应查询",
    "Adaptive queries",
    "问最有信息的问题",
    "Ask the informative question",
  ],
  [
    "倾向概率校正",
    "Propensity correction",
    "恢复目标分布",
    "Recover the target distribution",
  ],
  [
    "两时间尺度",
    "Two timescales",
    "快适配，慢巩固",
    "Fast adaptation, slow consolidation",
  ],
  ["独立安全晋升", "Independent promotion", "允许不更新", "Allow no update"],
] as const;

export default function TheoryView() {
  const { t, locale } = useCortex();
  const [topic, setTopic] = useState(2),
    [noise, setNoise] = useState(0.5),
    [a, setA] = useState(0.6),
    [drift, setDrift] = useState(0.15),
    [rho, setRho] = useState(0.6),
    [angle, setAngle] = useState(30),
    [correction, setCorrection] = useState(true),
    [ratio, setRatio] = useState(0.12),
    [scenario, setScenario] = useState("pass"),
    [cross, setCross] = useState(true),
    [choices, setChoices] = useState<number[]>([]),
    [copied, setCopied] = useState(false);
  const optimum = riskShrinkage(a, noise, drift);
  const kernel = useMemo(() => makeKernel(20, noise, cross), [noise, cross]);
  const candidateScores = Array.from(
    { length: 12 },
    (_, i) =>
      Math.log(1 + (1 + (i % 4)) * 0.5) /
      (1 + choices.filter((c) => c % 4 === i % 4).length),
  );
  const formulas = [
    "B = [ (Σs Xs)(Σs Xs)ᵀ − Σs XsXsᵀ ] / [S(S−1)]\nE[B] = PMMᵀP",
    "‖G−K‖² = ‖G−ΠC(K)‖² + ‖K−ΠC(K)‖²",
    "R(ρ) = (1−ρ)²a + ρ²(v+δdrift)\nρ* = a / (a+v+δdrift)",
    "Δc = (cᵀΣSa)² / (σ²+aᵀΣSa)",
    "F(A) = I(K; OA | history)\nF(A_greedy) ≥ (1−1/e) F(A_optimal)",
    "wt = μ(qt) / πt(qt | history)\nπt(q) ≥ πmin > 0",
    "Σαt = Σβt = ∞; Σαt², Σβt² < ∞\nβt / αt → 0",
    "R(θpromoted) ≤ R(θcurrent) + 2 maxj εj",
  ];
  const assumptions = [
    [
      "独立被试，条件零均值噪声；混杂投影预先固定；当前观测不能泄漏到查询选择。",
      "Independent donors, conditionally zero-mean noise and a prespecified confound projection. Current noise must not leak into query selection.",
    ],
    [
      "正交投影与可行学生集合；底噪与可学习误差分离，不假定原始坐标可识别。",
      "An orthogonal projection and a feasible student set. Separate the approximation floor from learnable error without assuming coordinate identifiability.",
    ],
    [
      "独立校准、无偏教师、误差正交；只有漂移残差与测量噪声正交时才能直接相加。系统偏差存在时必须保留交叉项。",
      "Independent calibration, an unbiased teacher and orthogonal errors. Drift and measurement noise add only when their residuals are orthogonal; systematic bias requires cross terms.",
    ],
    [
      "线性高斯近似；当前任务方向必须与新增观测方向相关。降低总体不确定性不保证当前任务受益。",
      "A linear-Gaussian approximation. The new observation must correlate with the task direction; lower overall uncertainty need not help the current task.",
    ],
    [
      "条件独立观测和单调次模信息增益、相同查询成本。一般 Agent 查询并不自动满足该保证。",
      "Conditionally independent observations, monotone submodular information gain and equal query costs. Arbitrary agent queries do not inherit this guarantee.",
    ],
    [
      "记录完整候选池和选择概率，满足 positivity。权重截断降低方差但引入偏差；自归一化估计通常非有限样本无偏。",
      "Log the full candidate pool and propensities; require positivity. Clipping reduces variance but introduces bias; self-normalization is generally not finite-sample unbiased.",
    ],
    [
      "步长条件、Lipschitz 动力学、稳定平衡及有界噪声。右图是动态概念代理，不是对任意大模型的稳定性证明。",
      "Step-size conditions, Lipschitz dynamics, stable equilibria and bounded noise. The plot is a dynamical proxy, not a stability proof for arbitrary large models.",
    ],
    [
      "候选包含不更新模型；独立哨兵风险区间同时覆盖。证据不足就不晋升，并非每轮必定提高性能。",
      "Include the no-update candidate and require simultaneous coverage of independent sentinel risk intervals. Insufficient evidence means no promotion, not guaranteed per-round improvement.",
    ],
  ];
  return (
    <>
      <PageHeading
        index="07"
        eyebrow="THEORY / MAKE THE ASSUMPTIONS VISIBLE"
        title={
          <>
            {t("让公式，", "Make the mathematics")}{" "}
            <em>{t("可以被操作。", "tangible.")}</em>
          </>
        }
        description={t(
          "八个视觉实验，把认知教师的估计、兼容、风险与安全边界变成可以亲手检验的关系。",
          "Eight visual experiments make teacher estimation, compatibility, risk and safety boundaries something you can inspect.",
        )}
      >
        <SourceTag kind="concept" />
        <span>
          {t(
            "基于研究提案与 RELAY 理论",
            "Based on the research proposal & RELAY theory",
          )}
        </span>
      </PageHeading>
      <div className="cl-theory-workspace">
        <nav
          className="cl-theory-nav"
          aria-label={t("理论主题", "Theory topics")}
        >
          {topics.map((item, i) => (
            <button
              key={item[1]}
              className={topic === i ? "is-active" : ""}
              onClick={() => setTopic(i)}
            >
              <span className="cl-mono">0{i + 1}</span>
              <div>
                <strong>{item[locale === "zh" ? 0 : 1]}</strong>
                <small>{item[locale === "zh" ? 2 : 3]}</small>
              </div>
              <ArrowRight size={14} />
            </button>
          ))}
        </nav>
        <div className="cl-theory-main">
          <Panel
            title={topics[topic][locale === "zh" ? 0 : 1]}
            eyebrow={`INTERACTIVE EXPERIMENT / 0${topic + 1}`}
          >
            {topic === 0 && (
              <>
                <div className="cl-two-columns cl-theory-visual">
                  <Kernel
                    values={kernel.display}
                    label={cross ? "CROSS-DONOR" : "SELF-PRODUCT"}
                  />
                  <div>
                    <Segmented
                      value={cross ? "cross" : "self"}
                      onChange={(v) => setCross(v === "cross")}
                      label={t("估计方式", "Estimator")}
                      options={[
                        { value: "self", label: t("均值自乘", "Self product") },
                        { value: "cross", label: t("跨被试", "Cross donor") },
                      ]}
                    />
                    <Range
                      label={t("独立噪声 σ", "Independent noise σ")}
                      value={noise}
                      min={0}
                      max={1.5}
                      onChange={setNoise}
                    />
                    <p>
                      {t(
                        "同一组虚拟观测上切换估计器。自乘噪声留下额外对角能量，跨被试估计显式移除自身乘积。",
                        "Switch estimators on the same virtual observations. Self-noise adds diagonal energy; cross-donor estimation explicitly removes self-products.",
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}
            {topic === 1 && (
              <>
                <svg
                  viewBox="0 0 600 290"
                  className="cl-projection-svg"
                  role="img"
                  aria-label={t(
                    "目标到学生可表达平面的正交投影",
                    "Orthogonal projection onto the student-compatible plane",
                  )}
                >
                  <path
                    d="M100 210 L335 275 520 165 275 110Z"
                    fill="#262638"
                    stroke="#716b8f"
                  />
                  <line
                    x1="320"
                    y1={90 - noise * 40}
                    x2="320"
                    y2="210"
                    stroke="#d7b58d"
                    strokeDasharray="5 5"
                  />
                  <circle cx="320" cy={90 - noise * 40} r="9" fill="#e7c699" />
                  <circle cx="320" cy="210" r="7" fill="#aba3d2" />
                  <line
                    x1="180"
                    y1="200"
                    x2="320"
                    y2="210"
                    stroke="#8ebfc9"
                    strokeWidth="2"
                  />
                  <text x="339" y="85">
                    K
                  </text>
                  <text x="335" y="230">
                    ΠC(K)
                  </text>
                  <text x="150" y="190">
                    G
                  </text>
                  <text x="110" y="255">
                    {t("学生可表达空间 C", "Student-compatible space C")}
                  </text>
                </svg>
                <Range
                  label={t("不可表达差异", "Unexpressible difference")}
                  value={noise}
                  onChange={setNoise}
                />
                <div className="cl-inline-metrics">
                  <span>
                    {t("可学习误差", "Learnable error")} <b>0.140</b>
                  </span>
                  <span>
                    {t("底噪", "Floor")} <b>{(noise ** 2).toFixed(3)}</b>
                  </span>
                  <span>
                    {t("总误差", "Total error")}{" "}
                    <b>{(0.14 + noise ** 2).toFixed(3)}</b>
                  </span>
                </div>
              </>
            )}
            {topic === 2 && (
              <>
                <Chart
                  series={[
                    {
                      label: t("期望风险", "Expected risk"),
                      color: "#d8ba8d",
                      values: Array.from(
                        { length: 61 },
                        (_, i) =>
                          (1 - i / 60) ** 2 * a +
                          (i / 60) ** 2 * (noise + drift),
                      ),
                    },
                  ]}
                  min={0}
                  max={Math.max(a, noise + drift, 0.1)}
                  labels={["0", "0.5", "1"]}
                  xLabel="ρ"
                  height={250}
                />
                <div className="cl-three-controls">
                  <Range
                    label={t("可修正差异 a", "Correctable error a")}
                    value={a}
                    min={0}
                    max={1.5}
                    onChange={setA}
                  />
                  <Range
                    label={t("教师方差 v", "Variance v")}
                    value={noise}
                    min={0}
                    max={1.5}
                    onChange={setNoise}
                  />
                  <Range
                    label={t("漂移风险 δ", "Drift risk δ")}
                    value={drift}
                    onChange={setDrift}
                  />
                </div>
                <Range
                  label={t("当前权重 ρ", "Current weight ρ")}
                  value={rho}
                  onChange={setRho}
                />
                <div className="cl-inline-metrics">
                  <span>
                    ρ* <b>{optimum.rho.toFixed(3)}</b>
                  </span>
                  <span>
                    R(ρ){" "}
                    <b>
                      {(
                        (1 - rho) ** 2 * a +
                        rho ** 2 * (noise + drift)
                      ).toFixed(3)}
                    </b>
                  </span>
                  <span>
                    R* <b>{optimum.risk.toFixed(3)}</b>
                  </span>
                </div>
              </>
            )}
            {topic === 3 && (
              <>
                <svg
                  viewBox="0 0 600 270"
                  className="cl-innovation-svg"
                  role="img"
                  aria-label={t(
                    "已有模态与新增任务方向",
                    "Existing modality and new task direction",
                  )}
                >
                  <ellipse
                    cx="270"
                    cy="145"
                    rx="145"
                    ry="55"
                    fill="#9d8ac4"
                    fillOpacity=".12"
                    stroke="#9d8ac4"
                  />
                  <ellipse
                    cx="270"
                    cy="145"
                    rx="145"
                    ry="35"
                    transform={`rotate(${angle} 270 145)`}
                    fill="#d6b184"
                    fillOpacity=".15"
                    stroke="#d6b184"
                  />
                  <line
                    x1="70"
                    y1="145"
                    x2="520"
                    y2="145"
                    stroke="#87b4ba"
                    strokeDasharray="4 5"
                  />
                  <text x="70" y="129">
                    {t("任务方向 c", "Task direction c")}
                  </text>
                  <text x="420" y="245">
                    EEG / fMRI
                  </text>
                </svg>
                <Range
                  label={t(
                    "新增模态与任务方向夹角",
                    "New modality vs task direction",
                  )}
                  value={angle}
                  min={0}
                  max={90}
                  step={1}
                  format={(v) => `${v}°`}
                  onChange={setAngle}
                />
                <Metric
                  label={t("当前任务的风险降低 Δc", "Task-risk reduction Δc")}
                  value={(
                    Math.cos((angle * Math.PI) / 180) ** 2 /
                    (1 + noise)
                  ).toFixed(3)}
                />
                <p>
                  {t(
                    "当方向正交，新增模态对当前任务的风险降低为零，即使它仍揭示了其他状态。",
                    "An orthogonal modality gives zero risk reduction for the current task, even if it reveals other states.",
                  )}
                </p>
              </>
            )}
            {topic === 4 && (
              <>
                <div className="cl-theory-query-pool">
                  {candidateScores.map((score, i) => (
                    <button
                      key={i}
                      onClick={() => setChoices((c) => [...c, i])}
                      className={choices.includes(i) ? "is-active" : ""}
                    >
                      <span>q{i + 1}</span>
                      <strong>{score.toFixed(3)}</strong>
                      <small>{t("边际信息增益", "Marginal information")}</small>
                    </button>
                  ))}
                </div>
                <div className="cl-hero-actions">
                  <button
                    className="cl-button"
                    onClick={() => {
                      const i = candidateScores.indexOf(
                        Math.max(...candidateScores),
                      );
                      setChoices((c) => [...c, i]);
                    }}
                  >
                    {t("贪心选择下一题", "Greedy next query")}
                    <ArrowRight size={15} />
                  </button>
                  <button
                    className="cl-text-button"
                    onClick={() => setChoices([])}
                  >
                    {t("清空选择", "Clear")}
                  </button>
                </div>
                <p>
                  {t(
                    "同一概念被反复采样后，边际增益递减。点击候选或让贪心策略选择，观察覆盖度变化。",
                    "Repeated sampling of a concept has diminishing marginal gain. Choose candidates or use the greedy policy to observe coverage.",
                  )}
                </p>
              </>
            )}
            {topic === 5 && (
              <>
                <div className="cl-propensity-bars">
                  {[0.15, 0.25, 0.25, 0.35].map((p, i) => {
                    const observed = [0.05, 0.1, 0.25, 0.6][i];
                    return (
                      <div key={i}>
                        <span>q{i + 1}</span>
                        <div>
                          <i style={{ width: `${p * 100}%` }} />
                          <b
                            style={{
                              width: `${(correction ? p : observed) * 100}%`,
                            }}
                          />
                        </div>
                        <small>
                          μ={p.toFixed(2)} · π={observed.toFixed(2)} · w=
                          {(p / observed).toFixed(2)}
                        </small>
                      </div>
                    );
                  })}
                </div>
                <label className="cl-check">
                  <input
                    type="checkbox"
                    checked={correction}
                    onChange={(e) => setCorrection(e.target.checked)}
                  />
                  {t("打开倾向概率校正", "Enable propensity correction")}
                </label>
                <p>
                  {t(
                    "细线是目标分布，亮条是课程采样分布（或经 μ/π 校正后的期望质量）。难题被过采样时，原始均值不能代表目标人群。",
                    "The thin line is the target distribution; the bright bar is the sampled distribution or its expected mass after μ/π correction. Oversampled difficult queries distort a raw population estimate.",
                  )}
                </p>
              </>
            )}
            {topic === 6 && (
              <>
                <Chart
                  series={[
                    {
                      label: t("快速适配器", "Fast adapter"),
                      color: "#d5b48c",
                      values: Array.from(
                        { length: 70 },
                        (_, i) =>
                          0.5 +
                          (ratio > 0.5 ? 0.23 : 0.04) *
                            Math.sin(i * (0.18 + ratio * 0.7)) *
                            Math.exp(-i * (ratio > 0.5 ? 0.001 : 0.035)),
                      ),
                    },
                    {
                      label: t("慢速主干", "Slow backbone"),
                      color: "#a89ac9",
                      values: Array.from(
                        { length: 70 },
                        (_, i) =>
                          0.25 +
                          (1 - Math.exp(-i * 0.035)) * 0.25 +
                          (ratio > 0.5 ? 0.16 : 0.015) *
                            Math.sin(i * (0.18 + ratio * 0.7) + 1),
                      ),
                    },
                  ]}
                  min={0}
                  max={1}
                  height={270}
                  xLabel={t(
                    "更新步数 · 动态概念代理",
                    "Update steps · dynamical proxy",
                  )}
                />
                <Range
                  label="β / α"
                  value={ratio}
                  min={0.02}
                  max={1}
                  onChange={setRatio}
                />
                <p>
                  {ratio > 0.5
                    ? t(
                        "两者变化过快且接近时，这个代理系统出现相互追逐和震荡。",
                        "When both processes move quickly at similar rates, this proxy exhibits chasing and oscillation.",
                      )
                    : t(
                        "适配器快速跟踪局部变化，主干较慢巩固，减少相互追逐。",
                        "The adapter tracks local changes quickly; the backbone consolidates more slowly.",
                      )}
                </p>
              </>
            )}
            {topic === 7 && (
              <>
                <div className="cl-audit-tree">
                  <div>{t("影子候选", "Shadow candidate")}</div>
                  <ArrowRight />
                  <div>{t("独立哨兵", "Independent sentinel")}</div>
                  <ArrowRight />
                  <div className={scenario}>
                    {scenario === "pass" ? (
                      <Check />
                    ) : scenario === "fail" ? (
                      <Undo2 />
                    ) : (
                      <Info />
                    )}
                    {scenario === "pass"
                      ? t("晋升", "Promote")
                      : scenario === "fail"
                        ? t("回滚", "Roll back")
                        : t("仅缓存", "Cache only")}
                  </div>
                </div>
                <Segmented
                  value={scenario}
                  onChange={setScenario}
                  label={t("审计分支", "Audit branch")}
                  options={[
                    { value: "pass", label: t("充分改善", "Sufficient gain") },
                    { value: "fail", label: t("性能退化", "Degradation") },
                    { value: "uncertain", label: t("证据不足", "Uncertain") },
                  ]}
                />
                <p>
                  {t(
                    "课程 Agent 不决定审计题目、风险阈值或报告终点。当前部署版本始终是合法候选。",
                    "The curriculum agent does not control sentinel items, risk thresholds or reported endpoints. The current deployed model remains a valid candidate.",
                  )}
                </p>
              </>
            )}
            <div className="cl-formula-block">
              <pre>{formulas[topic]}</pre>
              <button
                aria-label={t("复制公式", "Copy formula")}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(formulas[topic]);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div className="cl-assumptions">
              <ShieldCheck size={18} />
              <div>
                <strong>
                  {t(
                    "这条结论成立，需要什么？",
                    "What makes this statement hold?",
                  )}
                </strong>
                <p>{assumptions[topic][locale === "zh" ? 0 : 1]}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
