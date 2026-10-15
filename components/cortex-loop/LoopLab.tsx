"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Brain,
  Check,
  ChevronDown,
  CircleDot,
  Download,
  FastForward,
  FlaskConical,
  ShieldCheck,
  SlidersHorizontal,
  Undo2,
} from "lucide-react";
import { concepts, phaseCopy } from "@/lib/cortex-loop/content";
import {
  generateCandidates,
  runExperiment,
  simulateRound,
} from "@/lib/cortex-loop/simulation";
import {
  phases,
  type LoopMode,
  type LoopParameters,
  type QueryCandidate,
} from "@/lib/cortex-loop/types";
import { useCortex } from "./CortexContext";
import {
  Action,
  Chart,
  downloadJson,
  Kernel,
  Metric,
  PageHeading,
  Panel,
  Playback,
  Range,
  Segmented,
  SourceTag,
} from "./Primitives";

const statusCopy = {
  pass: ["通过 · 晋升", "PASS · PROMOTED"],
  fail: ["拒绝 · 回滚", "FAIL · ROLLED BACK"],
  uncertain: ["不确定 · 仅缓存", "UNCERTAIN · CACHED"],
  frozen: ["冻结 · 离线采集", "FROZEN · COLLECTION"],
} as const;

export default function LoopLab() {
  const {
    t,
    locale,
    params,
    setParams,
    experiment,
    pending,
    phase,
    playing,
    batchRunning,
    setPlaying,
    step,
    reset,
    runBatch,
    research,
    navigate,
  } = useCortex();
  const [selectedCandidate, setSelectedCandidate] =
    useState<QueryCandidate | null>(null);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [controlOpen, setControlOpen] = useState(false);
  const [speed, setSpeed] = useState(20);
  const preview = useMemo(
    () => simulateRound(params, experiment),
    [params, experiment],
  );
  const round =
    historyIndex !== null
      ? experiment.rounds[historyIndex]
      : (pending ?? preview ?? experiment.rounds.at(-1));
  const candidates =
    round?.candidates ?? generateCandidates(params, experiment);
  const candidate =
    (selectedCandidate &&
      candidates.find((c) => c.id === selectedCandidate.id)) ||
    round?.selected ||
    candidates[0];
  const teacher = round?.teacher;
  const copy = phaseCopy[phases[phase]];
  const update = <K extends keyof LoopParameters>(
    key: K,
    value: LoopParameters[K],
  ) => setParams((p) => ({ ...p, [key]: value }));
  const comparisons = useMemo(
    () =>
      (["static", "active", "online", "full"] as LoopMode[]).map((mode) => ({
        mode,
        state: runExperiment(
          { ...params, mode },
          Math.max(1, experiment.rounds.length),
        ),
      })),
    [params, experiment.rounds.length],
  );
  const limitReached =
    experiment.rounds.length >= 50 ||
    experiment.minutes >= params.budgetMinutes;
  const audit = round?.audit ?? "uncertain";
  const auditVisible = historyIndex !== null || Boolean(pending && phase >= 5);

  return (
    <>
      <PageHeading
        index="02"
        eyebrow="CORTEX–LOOP LAB"
        title={
          <>
            {t("让学习，", "Let learning")}{" "}
            <em>{t("闭合成环。", "come full circle.")}</em>
          </>
        }
        description={t(
          "跟随一次完整的人脑–AI 学习闭环。看 AI 提问、人类作答、认知教师形成，以及更新如何被独立审计。",
          "Follow a complete human–AI learning loop: a query, a human response, a cognitive teacher, and an independently audited update.",
        )}
      >
        <SourceTag />
        <span className="cl-mono">SEED {params.seed}</span>
      </PageHeading>
      <div className="cl-lab-toolbar">
        <div>
          <Segmented
            label={t("实验条件", "Experiment condition")}
            value={params.mode}
            onChange={(v) => update("mode", v)}
            options={[
              { value: "static", label: t("静态", "Static") },
              { value: "active", label: t("仅主动选题", "Active only") },
              { value: "online", label: t("仅在线更新", "Online only") },
              { value: "full", label: t("完整闭环", "Full loop") },
            ]}
          />
          <select
            aria-label={t("控制器", "Controller")}
            value={params.controller}
            onChange={(e) =>
              update(
                "controller",
                e.target.value as LoopParameters["controller"],
              )
            }
          >
            <option value="agent">{t("课程 Agent", "Curriculum agent")}</option>
            <option value="direct">
              {t("直接控制器", "Direct controller")}
            </option>
          </select>
          <select
            aria-label={t("信号模态", "Sensor set")}
            value={params.sensors}
            onChange={(e) =>
              update("sensors", e.target.value as LoopParameters["sensors"])
            }
          >
            <option value="behavior">{t("仅行为", "Behavior only")}</option>
            <option value="eeg">EEG</option>
            <option value="eeg-eye">EEG + {t("眼动", "gaze")}</option>
            <option value="eeg-fmri">EEG + fMRI</option>
          </select>
        </div>
        <button
          className="cl-control-toggle"
          aria-expanded={controlOpen}
          onClick={() => setControlOpen((v) => !v)}
        >
          <SlidersHorizontal size={15} />
          {t("实验参数", "Parameters")}
          <ChevronDown size={13} />
        </button>
      </div>
      {controlOpen && (
        <Panel
          className="cl-parameter-panel"
          title={t(
            "虚拟参与者与学习策略",
            "Virtual participant & learning policy",
          )}
          actions={<SourceTag />}
        >
          <div className="cl-controls-grid">
            {(
              [
                ["expertise", "参与者专长", "Expertise"],
                ["noise", "神经测量噪声", "Neural noise"],
                ["fatigue", "初始疲劳", "Initial fatigue"],
                ["drift", "策略漂移", "Strategy drift"],
                ["exploration", "查询探索率", "Query exploration"],
                ["strictness", "审计严格度", "Audit strictness"],
                ["updateRadius", "信任域半径", "Trust region"],
                ["teacherWeight", "教师权重倍率", "Teacher multiplier"],
                ["replay", "历史回放强度", "Replay strength"],
                ["learningRate", "学生学习率", "Learning rate"],
              ] as const
            ).map(([key, zh, en]) => (
              <Range
                key={key}
                label={t(zh, en)}
                value={params[key]}
                onChange={(v) => update(key, v)}
              />
            ))}
            <Range
              label={t("人类时间预算（分钟）", "Human budget (minutes)")}
              value={params.budgetMinutes}
              min={1}
              max={60}
              step={1}
              onChange={(v) => update("budgetMinutes", v)}
              format={String}
            />
            <Range
              label={t("候选池大小", "Candidate pool size")}
              value={params.candidateCount}
              min={6}
              max={24}
              step={1}
              onChange={(v) => update("candidateCount", v)}
              format={String}
            />
            <label className="cl-field">
              {t("随机种子", "Random seed")}
              <input
                type="number"
                min="1"
                max="2147483647"
                value={params.seed}
                onChange={(e) =>
                  update(
                    "seed",
                    Math.max(
                      1,
                      Math.min(2147483647, Number(e.target.value) || 1),
                    ),
                  )
                }
              />
            </label>
            <label className="cl-check">
              <input
                type="checkbox"
                checked={params.personal}
                onChange={(e) => update("personal", e.target.checked)}
              />
              {t("个体化教师", "Personalized teacher")}
            </label>
          </div>
          <p className="cl-small-note">
            {t(
              "参数在下一轮生效；进行中的轮次保留开始时的参数快照。fMRI 在此表示离线定位先验，不是毫秒级脑成像反馈。",
              "Parameters apply to the next round; an in-progress round keeps its starting snapshot. fMRI represents an offline localization prior, not millisecond imaging feedback.",
            )}
          </p>
        </Panel>
      )}
      <div className="cl-lab-stage-bar">
        <div>
          <span className="cl-live-dot" />
          <span className="cl-mono">
            ROUND{" "}
            {String(experiment.rounds.length + (pending ? 1 : 0)).padStart(
              2,
              "0",
            )}{" "}
            / 50
          </span>
          <span className="cl-stage-divider" />
          <span>
            {t("部署模型", "Deployed model")}{" "}
            <b>m_{String(experiment.version).padStart(4, "0")}</b>
          </span>
        </div>
        <Playback
          playing={playing}
          onPlay={() => {
            setHistoryIndex(null);
            setPlaying((v) => !v);
          }}
          onStep={() => {
            setHistoryIndex(null);
            setPlaying(false);
            step();
          }}
          onReset={() => {
            setHistoryIndex(null);
            setSelectedCandidate(null);
            reset();
          }}
        />
      </div>
      <div className="cl-lab-preview-note">
        {historyIndex !== null
          ? t(
              "正在回放已完成的轮次；全部数值来自该轮参数快照。",
              "Inspecting a completed round; all values come from its parameter snapshot.",
            )
          : pending
            ? t(
                "当前虚拟轮次正在执行；只有通过独立审计的更新才能部署。",
                "This virtual round is in progress; only independently audited updates can be deployed.",
              )
            : t(
                "下一轮虚拟预览。点击播放、单步或连续计算，才会生成完成记录。",
                "Preview of the next virtual round. Play, step or run a batch to create completed records.",
              )}
      </div>
      <div className="cl-loop-workspace">
        <aside className="cl-stimulus-space">
          <p className="cl-eyebrow">QUERY / {candidate.id}</p>
          <h2>{concepts[candidate.concept][locale === "zh" ? 0 : 1]}</h2>
          <p>
            {t(
              "当纹理和位置改变，哪一个图形仍然遵循相同的变换规则？",
              "When texture and position change, which object still follows the same transformation rule?",
            )}
          </p>
          <div className="cl-stimulus-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className={i === 8 ? "cl-question-cell" : ""}>
                {i === 8 ? (
                  "?"
                ) : (
                  <span
                    className={`cl-shape shape-${(i + candidate.concept) % 3}`}
                    style={{
                      transform: `rotate(${i * 45}deg)`,
                      opacity: 0.5 + i * 0.06,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <span className="cl-mono cl-muted">
            {t(
              "程序化刺激 · 非论文原始试题",
              "PROCEDURAL STIMULUS · NOT AN ORIGINAL PAPER ITEM",
            )}
          </span>
          <div className="cl-query-numbers">
            <Metric
              label={t("信息增益", "Information gain")}
              value={candidate.informationGain.toFixed(3)}
            />
            <Metric
              label={t("选择概率", "Propensity")}
              value={candidate.propensity.toFixed(3)}
            />
            <Metric
              label={t("预计人类耗时", "Human cost")}
              value={candidate.seconds.toFixed(1)}
              suffix="s"
            />
            <Metric
              label={t("安全风险", "Safety risk")}
              value={candidate.safetyRisk.toFixed(3)}
            />
          </div>
          <div className="cl-human-state">
            <Brain size={18} />
            <div>
              <b>
                {t("虚拟参与者", "Virtual participant")}{" "}
                {params.personal ? "P01" : "S01–S20"}
              </b>
              <small>
                {t("专长", "Expertise")} {(params.expertise * 100).toFixed(0)}%
                · {t("疲劳", "Fatigue")}{" "}
                {((round?.fatigue ?? params.fatigue) * 100).toFixed(0)}%
              </small>
            </div>
          </div>
        </aside>
        <div className="cl-loop-center">
          <svg
            viewBox="0 0 640 520"
            className="cl-loop-orbit"
            role="img"
            aria-label={t("八阶段学习闭环", "Eight-stage learning loop")}
          >
            <defs>
              <linearGradient id="cl-orbit-gradient">
                <stop stopColor="#e2b988" />
                <stop offset=".55" stopColor="#99ced7" />
                <stop offset="1" stopColor="#b3a1e3" />
              </linearGradient>
            </defs>
            <ellipse
              cx="320"
              cy="250"
              rx="245"
              ry="184"
              fill="none"
              stroke="url(#cl-orbit-gradient)"
              strokeOpacity=".3"
              strokeDasharray="3 7"
            />
            <ellipse
              cx="320"
              cy="250"
              rx="228"
              ry="166"
              fill="none"
              stroke="url(#cl-orbit-gradient)"
              strokeOpacity=".12"
            />
            {phases.map((p, i) => {
              const angle = -Math.PI / 2 + (i / 8) * Math.PI * 2;
              const x = 320 + 245 * Math.cos(angle),
                y = 250 + 184 * Math.sin(angle);
              return (
                <g key={p} className={phase === i ? "is-current" : ""}>
                  <circle
                    cx={x}
                    cy={y}
                    r={phase === i ? 19 : 13}
                    fill={phase === i ? "#d9bd95" : "#13141e"}
                    stroke={phase === i ? "#efd7ae" : "#42434c"}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill={phase === i ? "#17151b" : "#a2a4b2"}
                    fontSize="11"
                  >
                    {i + 1}
                  </text>
                  <text
                    x={x}
                    y={y + (i === 0 ? -30 : i === 4 ? 38 : 34)}
                    textAnchor="middle"
                    fontSize="12"
                    fill={phase === i ? "#ebd3ad" : "#898b9a"}
                  >
                    {phaseCopy[p][locale === "zh" ? 0 : 1]}
                  </text>
                </g>
              );
            })}
            <path
              d="M210 250 C250 150 390 350 430 250 C390 150 250 350 210 250"
              fill="none"
              stroke="url(#cl-orbit-gradient)"
              strokeWidth="1.5"
              opacity=".65"
              className={playing ? "cl-loop-infinity" : ""}
            />
            <circle
              cx="210"
              cy="250"
              r="45"
              fill="#251e1b"
              stroke="#c39d6c"
              strokeOpacity=".5"
            />
            <circle
              cx="430"
              cy="250"
              r="45"
              fill="#1d1b2c"
              stroke="#a497cb"
              strokeOpacity=".5"
            />
            <text
              x="210"
              y="246"
              textAnchor="middle"
              fill="#e4c59c"
              fontSize="13"
            >
              HUMAN
            </text>
            <text
              x="210"
              y="264"
              textAnchor="middle"
              fill="#9d8b73"
              fontSize="9"
            >
              COGNITION
            </text>
            <text
              x="430"
              y="247"
              textAnchor="middle"
              fill="#c4b6e6"
              fontSize="16"
            >
              AI
            </text>
            <text
              x="430"
              y="265"
              textAnchor="middle"
              fill="#8f84a5"
              fontSize="9"
            >
              SHADOW MODEL
            </text>
            <text
              x="320"
              y="202"
              textAnchor="middle"
              fill="#7b7e90"
              fontSize="9"
              letterSpacing="2"
            >
              COGNITIVE TRANSFER
            </text>
            <text
              x="320"
              y="321"
              textAnchor="middle"
              fill="#d5d4dc"
              fontSize="15"
            >
              ρ = {(teacher?.rho ?? 0).toFixed(3)}
            </text>
            <text
              x="320"
              y="342"
              textAnchor="middle"
              fill="#7b7e90"
              fontSize="10"
            >
              {t("风险校准的教师权重", "RISK-CALIBRATED TRANSFER")}
            </text>
          </svg>
          <div className="cl-loop-phase-copy" aria-live="polite">
            <span className="cl-mono">0{phase + 1} / 08</span>
            <h2>{copy[locale === "zh" ? 0 : 1]}</h2>
            <p>{copy[locale === "zh" ? 2 : 3]}</p>
          </div>
          <div className="cl-candidate-field">
            <span className="cl-mono">
              {t("候选刺激池 · 点击检查", "CANDIDATE POOL · CLICK TO INSPECT")}
            </span>
            <div>
              {candidates.map((c) => (
                <button
                  key={c.id}
                  className={candidate.id === c.id ? "is-selected" : ""}
                  title={`${c.id}: p=${c.propensity.toFixed(3)}`}
                  onClick={() => setSelectedCandidate(c)}
                  style={{
                    left: `${c.x * 100}%`,
                    top: `${c.y * 100}%`,
                    width: 10 + c.informationGain * 16,
                    height: 10 + c.informationGain * 16,
                  }}
                  aria-label={`${c.id} ${t("选择概率", "propensity")} ${c.propensity.toFixed(3)}`}
                />
              ))}
            </div>
            <small>
              {t(
                "点大小 = 信息增益 · 光环 = 当前检查对象",
                "size = information gain · halo = inspected query",
              )}
            </small>
          </div>
        </div>
        <aside className="cl-evidence-space">
          <p className="cl-eyebrow">EVIDENCE / TRACEABLE BY DESIGN</p>
          <details open>
            <summary>
              <CircleDot size={16} />
              {t("查询卡", "Query card")}
              <ChevronDown size={14} />
            </summary>
            <p>
              {t(
                "根据当前不确定性、预计增益、重复度、时间与安全成本计算效用，再混入探索概率采样。",
                "Utility combines uncertainty, expected gain, redundancy, time and safety cost. An exploration mixture determines sampling.",
              )}
            </p>
            <div className="cl-data-lines">
              <span>
                {t("效用", "Utility")}
                <b>{candidate.utility.toFixed(3)}</b>
              </span>
              <span>
                {t("重复度", "Redundancy")}
                <b>{candidate.redundancy.toFixed(3)}</b>
              </span>
              <span>
                μ(q) / π(q)
                <b>
                  {(1 / candidates.length / candidate.propensity).toFixed(3)}
                </b>
              </span>
            </div>
          </details>
          <details open>
            <summary>
              <AudioLines size={16} />
              {t("教师卡", "Teacher card")}
              <ChevronDown size={14} />
            </summary>
            <div className="cl-data-lines">
              <span>
                {t("可学习差异 a", "Compatible error a")}
                <b>{teacher?.compatibleError.toFixed(3)}</b>
              </span>
              <span>
                {t("不可表达底噪", "Approximation floor")}
                <b>{teacher?.floor.toFixed(3)}</b>
              </span>
              <span>
                {t("教师方差 v", "Teacher variance v")}
                <b>{teacher?.variance.toFixed(3)}</b>
              </span>
              <span>
                {t("漂移风险 δ", "Drift risk δ")}
                <b>{teacher?.driftRisk.toFixed(3)}</b>
              </span>
              <span>
                {t("条件创新", "Conditional innovation")}
                <b>{teacher?.innovation.toFixed(3)}</b>
              </span>
            </div>
            <div className="cl-teacher-rho">
              <span>ρ*</span>
              <strong>{teacher?.rho.toFixed(3)}</strong>
            </div>
          </details>
          <details open>
            <summary>
              <ShieldCheck size={16} />
              {t("更新卡", "Update card")}
              <ChevronDown size={14} />
            </summary>
            <div
              className={`cl-audit-result ${auditVisible ? audit : "uncertain"}`}
            >
              <span>
                {auditVisible
                  ? statusCopy[audit][locale === "zh" ? 0 : 1]
                  : t("待独立审计", "AWAITING AUDIT")}
              </span>
              {audit === "pass" ? (
                <Check size={18} />
              ) : audit === "fail" ? (
                <Undo2 size={18} />
              ) : (
                <CircleDot size={18} />
              )}
            </div>
            <div className="cl-data-lines">
              <span>
                {t("更新对象", "Update target")}
                <b>{t("小型适配器", "Small adapter")}</b>
              </span>
              <span>
                {t("哨兵性能差", "Sentinel delta")}
                <b>
                  {round
                    ? (
                        (round.sentinelAfter - round.sentinelBefore) *
                        100
                      ).toFixed(2)
                    : "—"}{" "}
                  pp
                </b>
              </span>
              <span>
                {t("版本", "Version")}
                <b>
                  m_{round?.modelBefore} <ArrowRight size={11} /> m_
                  {round?.modelAfter}
                </b>
              </span>
            </div>
          </details>
          <button className="cl-inline-link" onClick={() => navigate("audit")}>
            {t("查看审计与来源", "Inspect audit & provenance")}
            <ArrowUpRight size={14} />
          </button>
        </aside>
      </div>
      <section className="cl-signal-strip">
        <header>
          <span className="cl-eyebrow">STREAM / EEG + GAZE</span>
          <span>
            {t(
              "虚拟观测 · 4 秒 · 8 通道降采样",
              "VIRTUAL OBSERVATIONS · 4 s · 8 DOWNSAMPLED CHANNELS",
            )}
          </span>
        </header>
        <div className="cl-signal-body">
          <svg
            viewBox="0 0 800 190"
            role="img"
            aria-label={t(
              "八通道虚拟 EEG 及事件边界",
              "Eight virtual EEG channels and event boundaries",
            )}
          >
            {(round?.eeg ?? []).map((channel, c) => (
              <g key={c}>
                <text x="0" y={15 + c * 21}>
                  {["Fp1", "Fp2", "F3", "F4", "Cz", "P3", "P4", "Pz"][c]}
                </text>
                <polyline
                  points={channel
                    .map(
                      (v, i) =>
                        `${43 + (i / channel.length) * 750},${12 + c * 21 + v * 9}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke={c < 4 ? "#d8b586" : "#a99bd6"}
                  strokeWidth=".9"
                  opacity=".8"
                />
              </g>
            ))}
            {round?.events.map((event) => (
              <g key={event.kind}>
                <line
                  x1={43 + (event.time / 4) * 750}
                  x2={43 + (event.time / 4) * 750}
                  y1="0"
                  y2="173"
                  stroke="#aab5cc"
                  strokeOpacity=".18"
                  strokeDasharray="3 4"
                />
                <text x={43 + (event.time / 4) * 750} y="187" fontSize="8">
                  {event.time.toFixed(1)}s
                </text>
              </g>
            ))}
          </svg>
          <div className="cl-gaze-preview">
            <svg
              viewBox="0 0 160 150"
              role="img"
              aria-label={t("虚拟注视轨迹", "Virtual gaze path")}
            >
              <path
                d={(round?.gaze ?? [])
                  .map(([x, y], i) => `${i ? "L" : "M"}${x * 155} ${y * 150}`)
                  .join(" ")}
                stroke="#d1b286"
                strokeOpacity=".5"
                fill="none"
              />
              {round?.gaze.map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x * 155}
                  cy={y * 150}
                  r={2 + i / 10}
                  fill="#d1b286"
                  opacity={0.2 + i / 30}
                />
              ))}
            </svg>
            <span>{t("注视轨迹", "Gaze trajectory")}</span>
          </div>
        </div>
        <Range
          label={t(
            "拖动分段边界，观察下一轮教师方差变化",
            "Move the segment boundary to change next-round teacher variance",
          )}
          value={params.segmentBoundary}
          min={0.1}
          max={0.9}
          onChange={(v) => update("segmentBoundary", v)}
        />
      </section>
      <div className="cl-lab-run-controls">
        <div>
          <Action
            secondary
            onClick={() => {
              setHistoryIndex(null);
              runBatch(speed);
            }}
            disabled={limitReached || batchRunning}
          >
            <FastForward size={16} />
            {batchRunning
              ? t("正在计算…", "Computing…")
              : t(`连续计算 ${speed} 轮`, `Run ${speed} rounds`)}
          </Action>
          <select
            aria-label={t("批量轮数", "Batch rounds")}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            {[5, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n} {t("轮", "rounds")}
              </option>
            ))}
          </select>
          <button
            className="cl-text-button cl-danger-text"
            onClick={() => {
              update("drift", 0.94);
              setPlaying(false);
            }}
          >
            <FlaskConical size={15} />
            {t("注入漂移压力", "Inject drift stress")}
          </button>
        </div>
        <div className="cl-run-budget">
          <span>{t("已用人类时间", "Human time used")}</span>
          <b>
            {experiment.minutes.toFixed(1)} / {params.budgetMinutes} min
          </b>
          <i>
            <span
              style={{
                width: `${(experiment.minutes / params.budgetMinutes) * 100}%`,
              }}
            />
          </i>
        </div>
      </div>
      {experiment.rounds.length > 0 && (
        <div className="cl-round-history">
          <span className="cl-mono">
            {t("回放已完成轮次", "INSPECT COMPLETED ROUNDS")}
          </span>
          <button
            className={historyIndex === null ? "is-active" : ""}
            onClick={() => setHistoryIndex(null)}
          >
            {t("实时", "Live")}
          </button>
          {experiment.rounds.map((r, i) => (
            <button
              key={r.id}
              className={`${r.audit} ${historyIndex === i ? "is-active" : ""}`}
              onClick={() => {
                setPlaying(false);
                setHistoryIndex(i);
                setSelectedCandidate(null);
              }}
              title={statusCopy[r.audit][locale === "zh" ? 0 : 1]}
            >
              {String(r.id).padStart(2, "0")}
            </button>
          ))}
        </div>
      )}
      <div className="cl-two-columns">
        <Panel
          title={t("能力与人类成本", "Capability & human cost")}
          eyebrow="DEPLOYED STUDENT / TOY MODEL"
        >
          <Chart
            series={comparisons.map((c, i) => ({
              label: [
                t("静态", "Static"),
                t("仅主动", "Active only"),
                t("仅在线", "Online only"),
                t("完整闭环", "Full loop"),
              ][i],
              values: [0.49, ...c.state.rounds.map((r) => r.performance)],
              color: ["#6e7188", "#9b91b9", "#85b8c6", "#e2bc88"][i],
              dashed: i < 2,
            }))}
            min={0.45}
            max={0.9}
            xLabel={t(
              "轮次（相同虚拟参与者参数）",
              "Rounds · shared participant parameters",
            )}
            labels={["0", String(Math.max(1, experiment.rounds.length))]}
          />
          <p className="cl-small-note">
            {t(
              "比较的是部署中的学生；静态与仅主动条件保持参数冻结，新数据留待离线训练。本图不是 RELAY 的实测曲线。",
              "The deployed student is compared here. Static and active-only conditions freeze parameters and reserve new data for offline training. These are not measured RELAY curves.",
            )}
          </p>
        </Panel>
        <Panel
          title={t("教师风险与晋升记录", "Teacher risk & promotions")}
          eyebrow="INDEPENDENT SENTINEL / SEEDED"
        >
          <Chart
            series={[
              {
                label: t("教师风险", "Teacher risk"),
                values: experiment.rounds.length
                  ? experiment.rounds.map((r) => r.teacher.risk)
                  : [preview?.teacher.risk ?? 0],
                color: "#b09ed8",
              },
              {
                label: t("漂移风险", "Drift risk"),
                values: experiment.rounds.length
                  ? experiment.rounds.map((r) => r.teacher.driftRisk)
                  : [preview?.teacher.driftRisk ?? 0],
                color: "#d38c7f",
              },
            ]}
            min={0}
            max={0.35}
            xLabel={t("轮次", "Rounds")}
          />
          <div className="cl-inline-metrics">
            <span>
              {t("晋升", "Promoted")}{" "}
              <b>
                {experiment.rounds.filter((r) => r.audit === "pass").length}
              </b>
            </span>
            <span>
              {t("回滚", "Rolled back")}{" "}
              <b>
                {experiment.rounds.filter((r) => r.audit === "fail").length}
              </b>
            </span>
            <span>
              {t("仅缓存", "Cached")}{" "}
              <b>
                {
                  experiment.rounds.filter((r) => r.audit === "uncertain")
                    .length
                }
              </b>
            </span>
          </div>
        </Panel>
      </div>
      {research && teacher && (
        <Panel
          title={t(
            "当前轮次的公共核与统计口径",
            "Current kernel & statistical contract",
          )}
        >
          <div className="cl-kernel-research">
            <Kernel
              values={teacher.kernel}
              label="8 × 8 / CROSS-DONOR CONCEPT"
            />
            <div>
              <code>ρ* = a / (a + v + δdrift)</code>
              <p>
                {t(
                  "当前演示使用零均值且与 anchor 误差正交的噪声代理；漂移作为额外风险项。真实系统若存在系统偏差或误差相关，必须保留交叉项。独立哨兵评估使用另一条随机数流与固定均衡分布。",
                  "This illustration uses a zero-mean noise proxy orthogonal to anchor error, with drift as added risk. Real systematic bias or correlated errors require cross terms. Sentinel evaluation uses an independent random stream and a fixed balanced distribution.",
                )}
              </p>
              <button
                className="cl-inline-link"
                onClick={() => navigate("theory")}
              >
                {t("展开理论假设", "Explore the assumptions")}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </Panel>
      )}
      <div className="cl-download-bar">
        <div>
          <SourceTag />
          <span>
            {t(
              "本地运行，不采集真实脑数据。可下载参数、轮次与审计记录，使用相同 seed 复现。",
              "Runs locally without acquiring neural recordings. Export parameters, rounds and audit history for seeded replay.",
            )}
          </span>
        </div>
        <button
          className="cl-button cl-button-secondary"
          onClick={() =>
            downloadJson(`cortex-loop-${params.seed}.json`, {
              schema: "cortex-loop/1.0",
              source: "seeded-simulation",
              parameters: params,
              experiment,
            })
          }
        >
          <Download size={15} />
          {t("导出实验 JSON", "Export experiment JSON")}
        </button>
      </div>
      <p className="cl-small-note cl-lab-note">
        <ArrowDown size={13} />
        {t(
          "出现质量不足、疲劳过高或哨兵性能退化时，系统会回滚；证据不足时只缓存。改变参数可能让完整闭环不优于静态基线。",
          "Low quality, excessive fatigue or sentinel degradation triggers rollback; insufficient evidence triggers caching. Parameter changes can make full-loop performance no better than the static baseline.",
        )}
      </p>
    </>
  );
}
