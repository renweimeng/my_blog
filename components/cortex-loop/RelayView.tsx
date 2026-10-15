"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Dna,
  EyeOff,
  FileText,
  Search,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import {
  enumeratePaths,
  makeKernel,
  relayResults,
  scorePath,
} from "@/lib/cortex-loop/relay";
import { riskShrinkage } from "@/lib/cortex-loop/simulation";
import { useCortex } from "./CortexContext";
import {
  Action,
  Chart,
  InlineLink,
  Kernel,
  Metric,
  PageHeading,
  Panel,
  Range,
  Segmented,
  SourceTag,
} from "./Primitives";
import { TrajectoryAlignment } from "./TrajectoryAlignment";

export default function RelayView() {
  const { t, research, navigate } = useCortex();
  const [cross, setCross] = useState("cross");
  const [donors, setDonors] = useState(20);
  const [channels, setChannels] = useState(32);
  const [noise, setNoise] = useState(0.6);
  const [path, setPath] = useState([1, 1, 2, 2, 3, 3, 4, 4]);
  const [rho, setRho] = useState(0.665);
  const [a, setA] = useState(0.736);
  const [variance, setVariance] = useState(0.364);
  const [deployed, setDeployed] = useState(false);
  const [intervention, setIntervention] = useState("intact");
  const [rule, setRule] = useState("rotation");
  const [answer, setAnswer] = useState<number | null>(null);
  const [reasonStep, setReasonStep] = useState(4);
  const kernel = useMemo(
    () => makeKernel(donors, noise, cross === "cross", channels),
    [donors, noise, cross, channels],
  );
  const pathScore = useMemo(() => scorePath(path), [path]);
  const optimum = riskShrinkage(a, variance);
  const actualRisk = (1 - rho) ** 2 * a + rho ** 2 * variance;
  const probs = [
    0.13,
    0.1 + (4 - reasonStep) * 0.035,
    0.66 - (4 - reasonStep) * 0.07,
    0.11 + (4 - reasonStep) * 0.035,
  ];
  const cuts = [1, 2, 3].map((v) => path.filter((p) => p <= v).length);
  const setCut = (i: number, value: number) => {
    const next = [...cuts];
    next[i] = Math.max(
      i === 0 ? 1 : next[i - 1] + 1,
      Math.min(i === 2 ? 7 : next[i + 1] - 1, value),
    );
    setPath(
      Array.from({ length: 8 }, (_, j) =>
        j < next[0] ? 1 : j < next[1] ? 2 : j < next[2] ? 3 : 4,
      ),
    );
  };
  return (
    <>
      <PageHeading
        index="01"
        eyebrow="RELAY / THE STATIC FOUNDATION"
        title={
          <>
            {t("先让认知，", "First, make cognition")}
            <br />
            <em>{t("成为可靠的教师。", "a reliable teacher.")}</em>
          </>
        }
        description={t(
          "风险校准的人类神经轨迹蒸馏。训练时利用跨被试 EEG 关系结构；部署后只需要图像。",
          "Risk-calibrated human neural trajectory distillation. Cross-donor EEG relations guide training; only images are needed at deployment.",
        )}
      >
        <SourceTag kind="reported" />
        <InlineLink href="/cortex-loop/references/RELAY-main.pdf">
          {t("阅读原文", "Read the manuscript")}
        </InlineLink>
      </PageHeading>
      <section className="cl-paper-results">
        <div className="cl-result-head">
          <span className="cl-eyebrow">REPORTED IN THE REVISED MANUSCRIPT</span>
          <span className="cl-mono">TABLE 1 / PDF p.5</span>
        </div>
        <div className="cl-real-metrics">
          <Metric
            label={t("Task-only 准确率", "Task-only accuracy")}
            value="62.75"
            suffix="%"
          />
          <div className="cl-result-arrow">
            <ArrowRight size={32} />
          </div>
          <Metric
            label={t("RELAY 准确率", "RELAY accuracy")}
            value="71.47"
            suffix="%"
            tone="cl-gold"
          />
          <Metric
            label={t("配对增益", "Paired gain")}
            value="+8.72"
            suffix="pp"
            detail="95% CI [7.38, 10.12]"
          />
          <Metric
            label={t("独立绝对核风险", "Independent absolute risk")}
            value="0.300"
            detail={t(
              "×10⁻⁶ · Anchor 0.753 · 表 3",
              "×10⁻⁶ · anchor 0.753 · Table 3",
            )}
          />
        </div>
        <p className="cl-small-note">
          {t(
            "数据口径：400 道原始题、8 个规则族留一评测、10 个配对初始化种子。标准差按种子，区间按题目分层配对重采样；数值来自作者提供的修订稿。",
            "Scope: 400 original problems, leave-one-of-eight-family evaluation and 10 paired initialization seeds. SD is across seeds; intervals use paired family-stratified problem resampling. Values are from the author-supplied revised manuscript.",
          )}
        </p>
        <details className="cl-paper-table">
          <summary>
            {t(
              "展开全部基线与统计边界",
              "View all baselines & statistical limits",
            )}
            <ChevronRight size={15} />
          </summary>
          <div className="cl-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t("方法", "Method")}</th>
                  <th>{t("准确率 %", "Accuracy %")}</th>
                  <th>SD</th>
                  <th>NLL ↓</th>
                </tr>
              </thead>
              <tbody>
                {relayResults.map((row) => (
                  <tr
                    key={row.method}
                    className={row.method === "RELAY" ? "cl-highlight-row" : ""}
                  >
                    <td>{row.method}</td>
                    <td>{row.accuracy.toFixed(2)}</td>
                    <td>{row.sd.toFixed(2)}</td>
                    <td>{row.nll.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {t(
              "对 Full-space 的行为增益为 0.62 pp，95% CI [−0.33, 1.57]，未排除零差异。6 被试/角色时，保守分布无关证书选择零转移；实际方法使用独立估计的 plug-in 权重。",
              "The behavioral gain over Full-space is 0.62 pp, 95% CI [−0.33, 1.57], which includes zero. With six donors per role, the conservative distribution-free certificate selects zero transfer; the operational method uses independently estimated plug-in weights.",
            )}
          </p>
        </details>
      </section>
      <div className="cl-section-label">
        <span>01</span>
        <h2>
          {t("先亲自做一道视觉推理题", "Start with a visual reasoning problem")}
        </h2>
        <SourceTag kind="concept" />
      </div>
      <div className="cl-two-columns">
        <Panel
          title={t(
            "识别规则，补全序列",
            "Discover the rule. Complete the sequence.",
          )}
        >
          <Segmented
            value={rule}
            onChange={(v) => {
              setRule(v);
              setAnswer(null);
            }}
            label={t("规则族", "Rule family")}
            options={[
              { value: "rotation", label: t("旋转", "Rotation") },
              { value: "count", label: t("数量递增", "Increasing count") },
            ]}
          />
          <div className="cl-relay-puzzle">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                {i === 3 ? (
                  "?"
                ) : rule === "rotation" ? (
                  <span
                    className="cl-puzzle-diamond"
                    style={{ transform: `rotate(${i * 45}deg)` }}
                  />
                ) : (
                  <span className="cl-dot-group">
                    {Array.from({ length: i + 1 }, (_, j) => (
                      <i key={j} />
                    ))}
                  </span>
                )}
                <small>{i + 1}</small>
              </div>
            ))}
          </div>
          <div className="cl-answer-options">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                className={
                  answer === i ? (i === 2 ? "correct" : "incorrect") : ""
                }
                onClick={() => setAnswer(i)}
              >
                {rule === "rotation" ? (
                  <span
                    className="cl-puzzle-diamond"
                    style={{ transform: `rotate(${[0, 90, 135, 180][i]}deg)` }}
                  />
                ) : (
                  <span className="cl-dot-group">
                    {Array.from({ length: [2, 3, 4, 5][i] }, (_, j) => (
                      <i key={j} />
                    ))}
                  </span>
                )}
                <small>{String.fromCharCode(65 + i)}</small>
              </button>
            ))}
          </div>
          <p aria-live="polite" className="cl-puzzle-feedback">
            {answer === null
              ? t(
                  "请选择你的答案。此题为网站生成的教学示例。",
                  "Choose an answer. This is a website-generated teaching item.",
                )
              : answer === 2
                ? t(
                    "正确：每步旋转 45° / 数量增加 1。",
                    "Correct: rotate by 45° / add one element at each step.",
                  )
                : t(
                    "再看一下相邻两步的变化。",
                    "Look again at the change between adjacent steps.",
                  )}
          </p>
        </Panel>
        <Panel
          title={t(
            "四个学生状态，八个认知窗口",
            "Four student states. Eight cognitive windows.",
          )}
          eyebrow="ILLUSTRATIVE TRAJECTORY"
        >
          <div className="cl-state-trajectory">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i}>
                <span>t{i + 1}</span>
                <i
                  style={{
                    height: 18 + Math.sin(i * 0.7 + 1) * 14 + reasonStep * 2,
                  }}
                />
                <small>s{path[i]}</small>
              </div>
            ))}
          </div>
          <Range
            label={t("观察学生推理状态", "Inspect reasoning state")}
            min={1}
            max={4}
            step={1}
            value={reasonStep}
            format={(v) => `s${v}`}
            onChange={setReasonStep}
          />
          <div className="cl-probabilities">
            {probs.map((p, i) => (
              <div key={i}>
                <span>{String.fromCharCode(65 + i)}</span>
                <i>
                  <b style={{ width: `${p * 100}%` }} />
                </i>
                <strong>{(p * 100).toFixed(1)}%</strong>
              </div>
            ))}
          </div>
          <p className="cl-small-note">
            {t(
              "交互概率和轨迹是机制示意，不是模型逐题日志；真实结果见上方论文汇总。",
              "Interactive probabilities and trajectories illustrate the mechanism; they are not per-item model logs. Empirical aggregates are shown above.",
            )}
          </p>
        </Panel>
      </div>
      <div className="cl-section-label">
        <span>02</span>
        <h2>
          {t(
            "从多人噪声中，提炼公共结构",
            "Shared structure, through individual noise",
          )}
        </h2>
        <SourceTag />
      </div>
      <Panel>
        <div className="cl-neural-builder">
          <div>
            <Segmented
              label={t("核估计器", "Kernel estimator")}
              value={cross}
              onChange={setCross}
              options={[
                { value: "self", label: t("均值自乘", "Mean self-product") },
                { value: "cross", label: t("跨被试", "Cross-donor") },
              ]}
            />
            <div className="cl-donor-traces">
              <svg
                viewBox="0 0 460 220"
                role="img"
                aria-label={t(
                  "多被试虚拟轨迹",
                  "Virtual multi-donor trajectories",
                )}
              >
                {kernel.traces.map((trace, i) => (
                  <polyline
                    key={i}
                    points={trace
                      .map(
                        (v, j) =>
                          `${10 + (j / 7) * 440},${110 + v * 44 + i * 1.4}`,
                      )
                      .join(" ")}
                    fill="none"
                    stroke={i % 2 ? "#b0a4df" : "#d4b48a"}
                    strokeOpacity=".38"
                    strokeWidth="1.2"
                  />
                ))}
              </svg>
            </div>
            <div className="cl-controls-grid cl-three-controls">
              <Range
                label={t("被试数", "Donors")}
                min={2}
                max={40}
                step={1}
                value={donors}
                onChange={setDonors}
                format={String}
              />
              <Range
                label={t("通道数", "Channels")}
                min={4}
                max={64}
                step={4}
                value={channels}
                onChange={setChannels}
                format={String}
              />
              <Range
                label={t("噪声强度", "Noise")}
                value={noise}
                min={0}
                max={1.5}
                onChange={setNoise}
              />
            </div>
          </div>
          <ArrowRight className="cl-builder-arrow" />
          <Kernel
            values={kernel.display}
            label={
              cross === "cross" ? "CROSS-DONOR KERNEL" : "SELF-PRODUCT KERNEL"
            }
          />
          <div className="cl-neural-explanation">
            <Dna size={25} />
            <h3>
              {cross === "cross"
                ? t("消除自乘噪声项", "Remove self-noise terms")
                : t("噪声也会被自乘", "Self-products retain noise")}
            </h3>
            <p>
              {cross === "cross"
                ? t(
                    "不同被试零均值、相互独立的噪声，其交叉项期望为零。有限样本仍可能波动，甚至出现负特征值。",
                    "Independent, zero-mean donor noise has zero cross-term expectation. Finite samples can still fluctuate and need not be positive semidefinite.",
                  )
                : t(
                    "均值的自乘 Gram 会保留额外的噪声项；增加被试数可以缩小，但不等于显式消除偏差。",
                    "The Gram of the donor mean retains an extra noise term. More donors reduce it, but do not explicitly remove the bias.",
                  )}
            </p>
            <code>B = (ΣX · ΣXᵀ − ΣXXᵀ) / S(S−1)</code>
          </div>
        </div>
      </Panel>
      <div className="cl-section-label">
        <span>03</span>
        <h2>
          {t(
            "时间分辨率不同，教师也要兼容",
            "A teacher must fit the student's resolution",
          )}
        </h2>
        <SourceTag kind="concept" />
      </div>
      <div className="cl-two-columns">
        <Panel
          title={t("8 → 4 单调路径", "8 → 4 monotone alignment")}
          actions={
            <button
              className="cl-inline-link"
              onClick={() => {
                const best = enumeratePaths().sort(
                  (a, b) => scorePath(a).score - scorePath(b).score,
                )[0];
                setPath(best);
              }}
            >
              <Search size={14} />
              {t("精确搜索 35 条路径", "Search all 35 paths")}
            </button>
          }
        >
          <svg
            viewBox="0 0 540 220"
            className="cl-path-map"
            role="img"
            aria-label={t(
              "八窗口与四状态的对齐路径",
              "Eight-window to four-state alignment",
            )}
          >
            {path.map((p, i) => (
              <g key={i}>
                <line
                  x1={35 + (i / 7) * 470}
                  y1="42"
                  x2={70 + ((p - 1) / 3) * 400}
                  y2="170"
                  stroke={p % 2 ? "#d4b48a" : "#b6a6dc"}
                  strokeOpacity=".5"
                />
                <circle cx={35 + (i / 7) * 470} cy="42" r="10" fill="#c7ab80" />
                <text x={35 + (i / 7) * 470} y="19" textAnchor="middle">
                  t{i + 1}
                </text>
              </g>
            ))}
            {[1, 2, 3, 4].map((p) => (
              <g key={p}>
                <rect
                  x={45 + ((p - 1) / 3) * 400}
                  y="154"
                  width="50"
                  height="35"
                  rx="6"
                  fill="#282436"
                  stroke="#8f80ac"
                />
                <text x={70 + ((p - 1) / 3) * 400} y="176" textAnchor="middle">
                  s{p}
                </text>
              </g>
            ))}
          </svg>
          <div className="cl-three-controls">
            {cuts.map((cut, i) => (
              <Range
                key={i}
                label={t(`状态 ${i + 1} 的结束窗口`, `End of state ${i + 1}`)}
                min={1}
                max={7}
                step={1}
                value={cut}
                onChange={(v) => setCut(i, v)}
                format={String}
              />
            ))}
          </div>
        </Panel>
        <Panel
          title={t(
            "可学习误差与底噪分离",
            "Separate learnable error from the floor",
          )}
        >
          <div className="cl-compatible-result">
            <Kernel
              values={pathScore.projected}
              label="STUDENT-COMPATIBLE PROJECTION"
            />
            <div>
              <Metric
                label={t("可学习误差", "Learnable error")}
                value={pathScore.learnable.toFixed(4)}
              />
              <Metric
                label={t("时间近似底噪", "Temporal floor")}
                value={pathScore.floor.toFixed(4)}
                tone="cl-gold"
              />
              <Metric
                label={t("路径风险分数", "Path risk score")}
                value={pathScore.score.toFixed(4)}
              />
            </div>
          </div>
          <p className="cl-small-note">
            {t(
              "重复状态的整个块行与块列共同变化。不可表达的时间差异不能成为加强监督的理由。",
              "Repeated states share complete block rows and columns. Unexpressible temporal differences do not justify stronger supervision.",
            )}
          </p>
        </Panel>
      </div>
      <div className="cl-section-label">
        <span>04</span>
        <h2>
          {t(
            "不是全盘相信，而是按风险学习",
            "Trust the teacher in proportion to its risk",
          )}
        </h2>
        <SourceTag kind="concept" />
      </div>
      <div className="cl-two-columns">
        <Panel title={t("风险收缩实验", "Risk shrinkage experiment")}>
          <Chart
            series={[
              {
                label: t("预期风险 R(ρ)", "Expected risk R(ρ)"),
                color: "#d8b587",
                values: Array.from(
                  { length: 51 },
                  (_, i) => (1 - i / 50) ** 2 * a + (i / 50) ** 2 * variance,
                ),
              },
            ]}
            min={0}
            max={Math.max(a, variance, 0.1)}
            labels={["ρ = 0", "0.5", "ρ = 1"]}
            xLabel="ρ"
          />
          <div className="cl-inline-metrics">
            <span>
              {t("当前风险", "Current risk")} <b>{actualRisk.toFixed(3)}</b>
            </span>
            <span>
              ρ* <b>{optimum.rho.toFixed(3)}</b>
            </span>
            <span>
              R* <b>{optimum.risk.toFixed(3)}</b>
            </span>
          </div>
        </Panel>
        <Panel
          title={t(
            "何时应该退回 anchor？",
            "When should we fall back to the anchor?",
          )}
        >
          <Range
            label={t("神经转移权重 ρ", "Transfer weight ρ")}
            value={rho}
            onChange={setRho}
          />
          <Range
            label={t("可修正差异 a", "Correctable mismatch a")}
            value={a}
            max={1.5}
            onChange={setA}
          />
          <Range
            label={t("教师方差 v", "Teacher variance v")}
            value={variance}
            max={2}
            onChange={setVariance}
          />
          <button
            className="cl-inline-link"
            onClick={() => setRho(optimum.rho)}
          >
            {t("应用最优权重", "Apply optimal weight")}
            <Check size={15} />
          </button>
          <p className="cl-small-note">
            {t(
              "假设：独立校准、无偏教师、教师误差与 anchor 误差正交。示例数值处于归一化概念单位。",
              "Assumptions: independent calibration, an unbiased teacher, and orthogonal teacher and anchor errors. Values use normalized illustrative units.",
            )}
          </p>
          {research && (
            <code>
              R(ρ) = (1 − ρ)²a + ρ²v
              <br />
              ρ* = a / (a + v)
            </code>
          )}
        </Panel>
      </div>
      <div className="cl-section-label">
        <span>05</span>
        <h2>
          {t(
            "对齐的，是联合轨迹几何",
            "Align the geometry of a joint trajectory",
          )}
        </h2>
      </div>
      <TrajectoryAlignment />
      <div className="cl-section-label">
        <span>06</span>
        <h2>
          {t(
            "脑数据离场，推理继续",
            "The brain signals leave. Reasoning stays.",
          )}
        </h2>
        <SourceTag kind="concept" />
      </div>
      <Panel className="cl-deployment-panel">
        <div className={`cl-deploy-flow ${deployed ? "is-deployed" : ""}`}>
          <div className="cl-neural-input">
            <BrainIcon />
            <span>EEG</span>
          </div>
          <ArrowRight className="cl-neural-input" />
          <div>
            <EyeOff size={28} />
            <span>{t("图像", "Image")}</span>
          </div>
          <ArrowRight />
          <div>
            <Dna size={28} />
            <span>{t("视觉学生", "Visual student")}</span>
          </div>
          <ArrowRight />
          <div>
            <ShieldCheck size={28} />
            <span>{t("答案", "Answer")}</span>
          </div>
        </div>
        <div className="cl-deploy-controls">
          <Action onClick={() => setDeployed((v) => !v)}>
            {deployed ? <Undo2 size={16} /> : <ArrowUpRight size={16} />}{" "}
            {deployed
              ? t("返回训练视角", "Return to training")
              : t("部署 · 移除神经输入", "Deploy · remove neural input")}
          </Action>
          <Segmented
            value={intervention}
            onChange={setIntervention}
            label={t("决策子空间干预", "Decision subspace intervention")}
            options={[
              { value: "intact", label: t("完整", "Intact") },
              { value: "aligned", label: t("删除对齐方向", "Remove aligned") },
              { value: "random", label: t("等能量随机", "Matched random") },
              { value: "null", label: t("读出零空间", "Readout null") },
            ]}
          />
        </div>
        <div className="cl-intervention-prob">
          <span>
            {t(
              "教学代理的正确答案概率",
              "Correct-answer probability in the teaching proxy",
            )}
          </span>
          <b>
            {(
              { intact: 0.72, aligned: 0.38, random: 0.64, null: 0.71 }[
                intervention
              ] ?? 0.72
            ).toFixed(2)}
          </b>
        </div>
        <p className="cl-small-note">
          {t(
            "此处干预是概念代理，不是论文原始干预日志。真实部署只使用图像；等距结构对齐不意味着识别了唯一神经算法。",
            "This intervention is a conceptual proxy, not an original intervention log. Real deployment uses images only; isometric alignment does not identify a unique neural algorithm.",
          )}
        </p>
      </Panel>
      <section className="cl-paper-figure">
        <div className="cl-section-intro">
          <p className="cl-eyebrow">METHOD / AUTHOR-SUPPLIED FIGURE</p>
          <h2>
            {t("一张图，看清完整链路。", "The full path, in one figure.")}
          </h2>
          <p>
            {t(
              "从神经采集到视觉学生，从训练时蒸馏到推理时去除脑数据。",
              "From neural acquisition to visual students; from training-time distillation to brain-free inference.",
            )}
          </p>
        </div>
        <a
          href="/cortex-loop/relay-method.webp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/cortex-loop/relay-method.webp"
            alt={t(
              "RELAY 方法示意：采集、预处理、跨被试教师、视觉推理、蒸馏、预测及图像独立部署",
              "RELAY method: neural acquisition, preprocessing, cross-donor teacher, visual reasoning, distillation, prediction and image-only deployment",
            )}
            loading="lazy"
            width="1672"
            height="939"
          />
        </a>
      </section>
      <div className="cl-download-bar">
        <div>
          <FileText size={19} />
          <span>
            {t(
              "所有实测数字都可在作者提供的论文中定位；尚未提供原始训练日志与逐题 EEG。",
              "All empirical values are traceable to the author-supplied paper. Raw training logs and per-item EEG are not included.",
            )}
          </span>
        </div>
        <InlineLink href="/cortex-loop/references/RELAY-supplement.pdf">
          {t("查看补充材料", "Supplementary material")}
        </InlineLink>
        <button
          className="cl-button cl-button-secondary"
          onClick={() => navigate("loop")}
        >
          {t("进入主动闭环", "Enter the active loop")}
          <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}

function BrainIcon() {
  return <Dna size={28} />;
}
