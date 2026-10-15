"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  Check,
  CircleDot,
  Eye,
  GitBranch,
  Pause,
  Play,
  RotateCcw,
  ScanEye,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { agentPlan, findPath, roomBlocks } from "@/lib/cortex-loop/tasks";
import { seededRandom } from "@/lib/cortex-loop/simulation";
import { useCortex } from "./CortexContext";
import {
  Action,
  Chart,
  Metric,
  PageHeading,
  Panel,
  Range,
  Segmented,
  SourceTag,
} from "./Primitives";

const SpatialScene = dynamic(() => import("./SpatialScene"), { ssr: false });
const subscribeReady = () => () => {};

export default function TaskViews() {
  const { page, t } = useCortex();
  const ready = useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );
  return (
    <fieldset
      className="cl-task-view"
      disabled={!ready}
      aria-label={t("交互实验", "Interactive experiment")}
    >
      {page === "aesthetic" ? (
        <AestheticView />
      ) : page === "space" ? (
        <SpaceView />
      ) : (
        <AgentWorldView />
      )}
    </fieldset>
  );
}

function Artwork({
  seed,
  warm,
  eye,
}: {
  seed: number;
  warm: boolean;
  eye: boolean;
}) {
  const random = seededRandom(seed),
    id = `art-${seed}-${warm ? "w" : "c"}`;
  const orbX = 100 + random() * 180,
    orbY = 60 + random() * 80;
  return (
    <svg
      viewBox="0 0 520 360"
      role="img"
      aria-label={
        warm ? "Procedural golden landscape" : "Procedural indigo landscape"
      }
    >
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor={warm ? "#242329" : "#121b37"} />
          <stop offset="1" stopColor={warm ? "#ac8361" : "#a79bc8"} />
        </linearGradient>
        <linearGradient id={`${id}-land`} x2="0" y2="1">
          <stop stopColor={warm ? "#cfa278" : "#6e7b9a"} />
          <stop offset="1" stopColor={warm ? "#352d33" : "#151a34"} />
        </linearGradient>
        <radialGradient id={`${id}-orb`}>
          <stop stopColor={warm ? "#ffeed0" : "#e2daef"} />
          <stop offset="1" stopColor={warm ? "#d6a876" : "#aaa4cc"} />
        </radialGradient>
        <filter id={`${id}-grain`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".7"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".13" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="soft-light" />
        </filter>
      </defs>
      <rect width="520" height="360" fill={`url(#${id}-sky)`} />
      <circle cx={orbX} cy={orbY} r="39" fill={`url(#${id}-orb)`} />
      <ellipse
        cx={orbX}
        cy="282"
        rx="50"
        ry="5"
        fill={warm ? "#f6ce92" : "#c0b2e4"}
        opacity=".3"
      />
      {Array.from({ length: 7 }, (_, i) => {
        const y = 180 + i * 26;
        return (
          <path
            key={i}
            d={`M0 ${y} C${100 + random() * 80} ${y - 70 - random() * 50}, ${300 + random() * 80} ${y + 40}, 520 ${y - 30} V360 H0Z`}
            fill={`url(#${id}-land)`}
            stroke={warm ? "#e1b88d" : "#abb3cb"}
            strokeOpacity={0.2 + i * 0.04}
          />
        );
      })}
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d={`M${i * 47 - 80} 360 Q${180 + i * 14} 220 ${360 + i * 32} 200`}
          fill="none"
          stroke={warm ? "#ebc59b" : "#d1cfdf"}
          strokeOpacity=".12"
          strokeWidth=".6"
        />
      ))}
      <rect
        width="520"
        height="360"
        filter={`url(#${id}-grain)`}
        fill="transparent"
      />
      {eye && (
        <g>
          {[
            [0.3, 0.3],
            [0.52, 0.64],
            [0.72, 0.55],
            [0.47, 0.4],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle
                cx={x * 520}
                cy={y * 360}
                r={23 + i * 6}
                fill="#f1bb81"
                opacity=".14"
              />
              <circle cx={x * 520} cy={y * 360} r="4" fill="#f6dcb0" />
              <text x={x * 520 + 9} y={y * 360 - 8} fontSize="11" fill="white">
                {i + 1}
              </text>
            </g>
          ))}
          <path
            d="M156 108 L270 230 L374 198 L244 144"
            fill="none"
            stroke="#f4dfbc"
            strokeWidth="1"
            strokeDasharray="5 5"
            opacity=".7"
          />
        </g>
      )}
    </svg>
  );
}

function AestheticView() {
  const { t, research } = useCortex();
  const [round, setRound] = useState(1),
    [confidence, setConfidence] = useState(0.75),
    [eyes, setEyes] = useState(false),
    [policy, setPolicy] = useState("neural"),
    [personal, setPersonal] = useState("personal"),
    [history, setHistory] = useState<
      { choice: number; confidence: number; warm: boolean }[]
    >([]),
    [last, setLast] = useState("");
  const warmPreference =
    (history.reduce((s, h) => s + (h.warm ? h.confidence : -h.confidence), 0) +
      3) /
    (6 + history.length);
  const [evidence, setEvidence] = useState("full");
  const leftWarm = round % 2 === 1;
  const choose = (side: number) => {
    const warm = side === 0 ? leftWarm : !leftWarm;
    setHistory((h) => [...h, { choice: side, confidence, warm }]);
    setLast(
      t(
        `第 ${round} 轮：选择${side === 0 ? "左" : "右"}侧，置信度 ${(confidence * 100).toFixed(0)}%。`,
        `Round ${round}: chose ${side === 0 ? "left" : "right"} with ${(confidence * 100).toFixed(0)}% confidence.`,
      ),
    );
    setRound((r) => r + 1);
  };
  const seed =
    20261015 +
    round * (policy === "random" ? 71 : policy === "diversity" ? 107 : 31);
  return (
    <>
      <PageHeading
        index="03"
        eyebrow="ACTIVE AESTHETIC LEARNING"
        title={
          <>
            {t("美的判断，", "Beauty is a judgment.")}
            <br />
            <em>{t("从来不止一个分数。", "Not just a score.")}</em>
          </>
        }
        description={t(
          "做出一次偏好选择。观察注意、冲突与价值整合如何为个体偏好模型提供不同的学习信号。",
          "Make a preference choice. Explore how attention, conflict and value integration offer distinct signals for a personal preference model.",
        )}
      >
        <SourceTag />
        <span className="cl-mono">TRIAL {String(round).padStart(2, "0")}</span>
      </PageHeading>
      <div className="cl-aesthetic-toolbar">
        <Segmented
          label={t("教师对象", "Teacher scope")}
          value={personal}
          onChange={setPersonal}
          options={[
            { value: "personal", label: t("个体偏好", "Personal") },
            { value: "population", label: t("群体共性", "Population") },
          ]}
        />
        <label className="cl-check">
          <input
            type="checkbox"
            checked={eyes}
            onChange={(e) => setEyes(e.target.checked)}
          />
          <Eye size={15} />
          {t("显示虚拟注视", "Virtual gaze overlay")}
        </label>
        <select
          value={policy}
          onChange={(e) => setPolicy(e.target.value)}
          aria-label={t("课程策略", "Curriculum strategy")}
        >
          {[
            ["random", "随机", "Random"],
            ["uncertainty", "不确定性采样", "Uncertainty"],
            ["diversity", "多样性", "Diversity"],
            ["neural", "神经信息增益", "Neural information gain"],
            ["disagreement", "寻找分歧", "Disagreement seeking"],
            ["cost", "人类成本感知", "Human-cost aware"],
          ].map(([v, z, e]) => (
            <option key={v} value={v}>
              {t(z, e)}
            </option>
          ))}
        </select>
      </div>
      <div className="cl-artwork-pair">
        {[0, 1].map((side) => (
          <button
            className="cl-artwork"
            key={`${round}-${side}`}
            onClick={() => choose(side)}
            aria-label={
              side === 0
                ? t("选择左侧作品", "Choose the left image")
                : t("选择右侧作品", "Choose the right image")
            }
          >
            <div>
              <Artwork
                seed={seed + side * 17}
                warm={side === 0 ? leftWarm : !leftWarm}
                eye={eyes}
              />
              <span className="cl-artwork-choice">
                <span>{side === 0 ? "A" : "B"}</span>
                <b>{t("选择这幅", "Choose this image")}</b>
                <ArrowUpRight size={20} />
              </span>
            </div>
            <p>
              <span>
                {side === 0 ? "A / " : "B / "}
                {side === 0
                  ? leftWarm
                    ? "AMBER HORIZON"
                    : "LUNAR TOPOGRAPHY"
                  : leftWarm
                    ? "LUNAR TOPOGRAPHY"
                    : "AMBER HORIZON"}
              </span>
              <span className="cl-mono">GENERATIVE STUDY 0{round}</span>
            </p>
          </button>
        ))}
      </div>
      <div className="cl-aesthetic-choice">
        <span>
          {t(
            "此刻，哪幅作品更吸引你？",
            "Which image draws you in, right now?",
          )}
        </span>
        <Range
          label={t("我的选择置信度", "My confidence")}
          min={0.1}
          max={1}
          value={confidence}
          onChange={setConfidence}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </div>
      <p className="cl-small-note" aria-live="polite">
        {last ||
          t(
            "点击作品开始。作品是程序化生成的视觉刺激，眼动和神经响应是明确标注的虚拟观测。",
            "Select an image to begin. Artworks are procedural visual stimuli; gaze and neural responses are labeled virtual observations.",
          )}
      </p>
      <div className="cl-two-columns">
        <Panel
          title={t(
            "保留你的偏好，而不是覆盖它",
            "Preserve a preference, don't overwrite it",
          )}
          eyebrow="PERSONAL ≠ POPULATION"
        >
          <div className="cl-preference-map">
            <div className="cl-population-cloud">
              {Array.from({ length: 70 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    left: `${8 + ((i * 37) % 82)}%`,
                    top: `${15 + Math.sin(i * 3.7) * 30 + 30}%`,
                  }}
                />
              ))}
              <span
                className="cl-preference-cursor"
                style={{ left: `${20 + warmPreference * 65}%` }}
              >
                <ScanEye size={18} />
              </span>
            </div>
            <div>
              <span>{t("冷色 / 克制", "Cool / restrained")}</span>
              <span>{t("暖色 / 感性", "Warm / expressive")}</span>
            </div>
          </div>
          <div className="cl-inline-metrics">
            <span>
              {t("已观察选择", "Choices observed")}
              <b>{history.length}</b>
            </span>
            <span>
              {t("当前对象", "Current scope")}
              <b>
                {personal === "personal"
                  ? t("你", "You")
                  : t("群体先验", "Population prior")}
              </b>
            </span>
          </div>
          <p>
            {t(
              "亮点是你的选择轨迹，背景是概念性群体分布。个体审美不需要向群体均值靠拢。",
              "The bright marker tracks your choices; the background is a conceptual population distribution. Personal taste need not converge to the population mean.",
            )}
          </p>
        </Panel>
        <Panel
          title={t(
            "不同信号，提供多少额外信息？",
            "What does another signal add?",
          )}
        >
          <Segmented
            value={evidence}
            onChange={setEvidence}
            label={t("学习信号", "Learning signals")}
            options={[
              { value: "preference", label: t("偏好", "Preference") },
              { value: "gaze", label: t("+ 眼动", "+ Gaze") },
              { value: "eeg", label: "+ EEG" },
              { value: "full", label: t("完整闭环", "Full loop") },
            ]}
          />
          <Chart
            series={[
              {
                label: t(
                  "个体偏好后验不确定性",
                  "Personal posterior uncertainty",
                ),
                color: "#dcb889",
                values: Array.from(
                  { length: Math.max(2, history.length + 1) },
                  (_, i) =>
                    0.8 /
                    Math.sqrt(
                      1 +
                        i *
                          ({
                            preference: 0.2,
                            gaze: 0.29,
                            eeg: 0.34,
                            full: 0.43,
                          }[evidence] ?? 0.2),
                    ),
                ),
              },
            ]}
            min={0}
            max={1}
            xLabel={t(
              "已观察选择数 · 概念代理",
              "Observed choices · conceptual proxy",
            )}
          />
          {research && (
            <p className="cl-small-note">
              {t(
                "这是预设观测噪声下的后验收缩代理，不是实测的神经模态增益。策略改变刺激种子，所有选择均保留在当前会话。",
                "This posterior-contraction proxy assumes preset observation noise; it is not a measured neural-modality gain. Policy changes the stimulus seed; choices remain in the current session.",
              )}
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}

function SpaceView() {
  const { t, research } = useCortex();
  const [mode, setMode] = useState("rotation"),
    [angle, setAngle] = useState(45),
    [occlusion, setOcclusion] = useState(0.35),
    [roadblock, setRoadblock] = useState(false),
    [trials, setTrials] = useState(0),
    [answer, setAnswer] = useState<number | null>(null);
  const blocks = useMemo(
    () =>
      roadblock
        ? [
            ...roomBlocks,
            [0, 3] as [number, number],
            [1, 3] as [number, number],
          ]
        : roomBlocks,
    [roadblock],
  );
  const route = useMemo(() => findPath(blocks), [blocks]);
  return (
    <>
      <PageHeading
        index="04"
        eyebrow="SPATIAL COGNITION / 3D"
        title={
          <>
            {t("换一个视角，", "Change the viewpoint.")}
            <br />
            <em>{t("理解仍然成立。", "Keep the understanding.")}</em>
          </>
        }
        description={t(
          "心理旋转、遮挡补全和导航重规划。让可控的三维世界，暴露视觉捷径与空间推理之间的差别。",
          "Mental rotation, occlusion completion and navigation replanning. A controlled 3D world separates visual shortcuts from spatial reasoning.",
        )}
      >
        <SourceTag />
        <span className="cl-mono">INTERACTIVE 3D ENVIRONMENT</span>
      </PageHeading>
      <div className="cl-spatial-tabs">
        <Segmented
          value={mode}
          onChange={(v) => {
            setMode(v);
            setAnswer(null);
          }}
          label={t("空间任务", "Spatial task")}
          options={[
            { value: "rotation", label: t("心理旋转", "Mental rotation") },
            {
              value: "occlusion",
              label: t("遮挡补全", "Occlusion completion"),
            },
            {
              value: "navigation",
              label: t("封路重规划", "Navigation replanning"),
            },
          ]}
        />
        <span>{t("按住画布拖动观察视角", "Drag the canvas to orbit")}</span>
      </div>
      <div className="cl-space-lab">
        <div className="cl-spatial-stage">
          <SpatialScene
            angle={angle}
            occlusion={occlusion}
            mode={mode}
            blocks={blocks}
            path={mode === "navigation" ? route : []}
          />
          <span className="cl-stage-label cl-mono">
            {mode.toUpperCase()} / WORLD 01
          </span>
          <div className="cl-spatial-overlay">
            <span>X →</span>
            <span>Y ↑</span>
            <span>Z ↗</span>
          </div>
        </div>
        <aside>
          <p className="cl-eyebrow">SPATIAL TRANSFORMATION</p>
          <h2>
            {mode === "rotation"
              ? t(
                  "物体变了，还是视角变了？",
                  "Did the object change—or the viewpoint?",
                )
              : mode === "occlusion"
                ? t("看不见，不代表不存在。", "Unseen doesn't mean absent.")
                : t(
                    "旧路径失效，重新找一条。",
                    "The old route fails. Find another.",
                  )}
          </h2>
          <p>
            {mode === "navigation"
              ? t(
                  "金色路线由广度优先搜索实时计算。注入封路后，路径会重新经过可达单元格。",
                  "The gold route is computed with breadth-first search. Introduce a roadblock to replan through reachable cells.",
                )
              : t(
                  "拖动旋转角度并检查三维结构。这里的目标是保持拓扑理解，而不是记住纹理或投影。",
                  "Adjust the rotation and inspect the structure. The goal is topology, rather than memorized texture or a projection.",
                )}
          </p>
          {mode !== "navigation" && (
            <Range
              label={t("物体旋转角度", "Object rotation")}
              min={0}
              max={360}
              step={1}
              value={angle}
              onChange={setAngle}
              format={(v) => `${v}°`}
            />
          )}
          {mode === "occlusion" && (
            <Range
              label={t("遮挡比例", "Occlusion ratio")}
              value={occlusion}
              min={0}
              max={0.9}
              onChange={setOcclusion}
              format={(v) => `${(v * 100).toFixed(0)}%`}
            />
          )}
          {mode === "navigation" && (
            <label className="cl-check">
              <input
                type="checkbox"
                checked={roadblock}
                onChange={(e) => setRoadblock(e.target.checked)}
              />
              {t("在原有通道注入封路", "Block the original corridor")}
            </label>
          )}
          <div className="cl-space-test">
            <p>
              {mode === "navigation"
                ? t("当前是否仍存在可达路径？", "Is the goal still reachable?")
                : t(
                    "这个组合体一共有多少个方块？",
                    "How many blocks form this object?",
                  )}
            </p>
            {(mode === "navigation" ? [0, 1] : [4, 5, 6]).map((v) => (
              <button
                key={v}
                className={answer === v ? "is-active" : ""}
                onClick={() => setAnswer(v)}
              >
                {mode === "navigation"
                  ? v
                    ? t("可达", "Reachable")
                    : t("不可达", "Blocked")
                  : v}
              </button>
            ))}
            {answer !== null && (
              <small>
                {(
                  mode === "navigation"
                    ? answer === (route.length ? 1 : 0)
                    : answer === 5
                )
                  ? t(
                      "正确，空间结构已验证。",
                      "Correct. Spatial structure verified.",
                    )
                  : t(
                      "再旋转一下视角检查。",
                      "Orbit the scene and check again.",
                    )}
              </small>
            )}
          </div>
          <Action secondary onClick={() => setTrials((n) => n + 1)}>
            <Sparkles size={15} />
            {t("采集一次空间教师", "Collect a spatial teacher")}
          </Action>
        </aside>
      </div>
      <div className="cl-metrics-strip">
        <Metric label={t("旋转角度", "Rotation")} value={angle} suffix="°" />
        <Metric
          label={t("最短路径步数", "Shortest-path moves")}
          value={route.length ? route.length - 1 : "—"}
        />
        <Metric label={t("已采集虚拟试次", "Virtual trials")} value={trials} />
        <Metric
          label={t("学习对象", "Learning target")}
          value={t("空间变换", "Spatial transform")}
        />
      </div>
      {research && (
        <Panel
          title={t("评估应隔离哪些变化？", "What must evaluation hold out?")}
        >
          <div className="cl-three-controls">
            <p>
              {t(
                "留出角度：检验未见旋转，而不是记忆几个渲染视图。",
                "Held-out angles test unseen rotations rather than memorized renderings.",
              )}
            </p>
            <p>
              {t(
                "留出房间与纹理：区分纹理捷径、地标依赖和真正空间推理。",
                "Held-out rooms and textures separate shortcuts, landmarks and spatial reasoning.",
              )}
            </p>
            <p>
              {t(
                "匹配随机子空间：删除空间对齐方向，并与等秩等能量随机方向比较。",
                "Use matched-random subspace controls alongside removal of spatially aligned directions.",
              )}
            </p>
          </div>
        </Panel>
      )}
    </>
  );
}

function AgentWorldView() {
  const { t, research, reducedMotion } = useCortex();
  const [fault, setFault] = useState("none"),
    [mode, setMode] = useState("full"),
    [frame, setFrame] = useState(0),
    [playing, setPlaying] = useState(false),
    [alignment, setAlignment] = useState(0.7);
  const resilient = mode === "full" || mode === "static",
    plan = agentPlan(fault, resilient);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () =>
        setFrame((f) => {
          if (f >= plan.length - 1) {
            setPlaying(false);
            return f;
          }
          return f + 1;
        }),
      reducedMotion ? 1600 : 1000,
    );
    return () => clearInterval(id);
  }, [playing, plan.length, reducedMotion]);
  const text: Record<string, [string, string]> = {
    observe: ["观察视频", "Observe video"],
    retrieve: ["检索证据", "Retrieve evidence"],
    calculate: ["计算结果", "Calculate result"],
    verify: ["验证来源", "Verify sources"],
    submit: ["提交结果", "Submit result"],
    error: ["工具失败", "Tool failure"],
    detect: ["检测冲突", "Detect conflict"],
    fallback: ["切换工具", "Switch tool"],
    request: ["请求权限", "Request access"],
    loop: ["重复调用", "Repeated call"],
  };
  const changeFault = (value: string) => {
    setFault(value);
    setFrame(0);
    setPlaying(false);
  };
  const complete = frame === plan.length - 1 && plan[frame] === "submit";
  return (
    <>
      <PageHeading
        index="05"
        eyebrow="AGENT PLANNING + VIDEO WORLD"
        title={
          <>
            {t("理解正在发生的事，", "Understand what unfolds.")}
            <br />
            <em>{t("再决定下一步。", "Then decide what's next.")}</em>
          </>
        }
        description={t(
          "观察动态场景，寻找证据、检索资料、计算并验证。注入一次故障，比较重复调用与有依据的重规划。",
          "Observe a dynamic scene, collect evidence, retrieve, calculate and verify. Introduce a fault to compare repeated calls with evidence-based replanning.",
        )}
      >
        <SourceTag />
        <span className="cl-mono">SYNCHRONIZED EVENT TRAJECTORIES</span>
      </PageHeading>
      <div className="cl-lab-toolbar">
        <Segmented
          value={mode}
          onChange={(v) => {
            setMode(v);
            setFrame(0);
            setPlaying(false);
          }}
          label={t("智能体条件", "Agent condition")}
          options={[
            { value: "task", label: "Task-only" },
            { value: "behavior", label: t("行为模仿", "Behavior imitation") },
            { value: "static", label: "Static CORTEX" },
            { value: "full", label: "Full loop" },
          ]}
        />
        <select
          value={fault}
          onChange={(e) => changeFault(e.target.value)}
          aria-label={t("注入动态故障", "Inject a dynamic fault")}
        >
          {[
            ["none", "无故障", "No fault"],
            ["physics", "物理异常", "Physical anomaly"],
            ["occlusion", "对象遮挡", "Object occlusion"],
            ["changed", "网页变化", "Page changed"],
            ["tool", "工具报错", "Tool error"],
            ["conflict", "信息冲突", "Conflicting evidence"],
            ["permission", "权限不足", "Permission denied"],
          ].map(([v, z, e]) => (
            <option value={v} key={v}>
              {t(z, e)}
            </option>
          ))}
        </select>
      </div>
      <div className="cl-agent-workspace">
        <div className="cl-video-stage">
          <span className="cl-stage-label cl-mono">
            PROCEDURAL WORLD / {String(frame * 120).padStart(4, "0")} ms
          </span>
          <svg
            viewBox="0 0 680 400"
            role="img"
            aria-label={t(
              "实验台物体运动场景",
              "Procedural object-motion scene",
            )}
          >
            <defs>
              <linearGradient id="cl-table-g" x2="0" y2="1">
                <stop stopColor="#2d2938" />
                <stop offset="1" stopColor="#12151c" />
              </linearGradient>
            </defs>
            <path
              d="M80 270 L370 160 610 260 315 370Z"
              fill="url(#cl-table-g)"
              stroke="#575065"
            />
            {Array.from({ length: 8 }, (_, i) => (
              <path
                key={i}
                d={`M${80 + i * 35} ${270 - i * 13} L${315 + i * 36} ${370 - i * 13}`}
                stroke="#a69cb8"
                opacity=".09"
              />
            ))}
            <ellipse
              cx={180 + frame * 30}
              cy="258"
              rx="42"
              ry="14"
              fill="#000"
              opacity=".35"
            />
            <circle
              cx={180 + frame * 30}
              cy={frame > 1 && fault === "physics" ? 140 : 220}
              r="36"
              fill="#c5a37b"
              stroke="#edd1a8"
            />
            <path
              d="M420 160 l45 -22 42 23 -43 22z M420 160 v70 l44 23 43 -25v-67 M464 183v70"
              fill="#5b507c"
              stroke="#a89ac6"
            />
            {fault === "occlusion" && frame > 1 && (
              <rect
                x="280"
                y="150"
                width="110"
                height="150"
                fill="#1a202b"
                stroke="#515c6b"
              />
            )}
            <path
              d="M130 110 L410 110"
              stroke="#839797"
              strokeDasharray="5 8"
              opacity=".4"
            />
            <text x="130" y="90" fill="#aba7b7" fontSize="12">
              {t(
                "跟踪对象 A，验证它是否越过障碍。",
                "Track object A. Verify whether it clears the obstacle.",
              )}
            </text>
            <text x="40" y="375" fill="#6d6b7b" fontSize="10">
              {t(
                "程序化事件场景 · 非视频模型真实推理",
                "PROCEDURAL EVENT SCENE · NOT LIVE VIDEO-MODEL INFERENCE",
              )}
            </text>
          </svg>
          <div className="cl-video-controls">
            <button onClick={() => setPlaying((v) => !v)}>
              {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
              {playing ? t("暂停", "Pause") : t("播放轨迹", "Play trajectory")}
            </button>
            <input
              type="range"
              aria-label={t("事件时间轴", "Event timeline")}
              min="0"
              max={plan.length - 1}
              step="1"
              value={frame}
              onChange={(e) => {
                setFrame(Number(e.target.value));
                setPlaying(false);
              }}
            />
            <button
              aria-label={t("重置轨迹", "Reset trajectory")}
              onClick={() => {
                setFrame(0);
                setPlaying(false);
              }}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
        <aside className="cl-agent-trace">
          <p className="cl-eyebrow">PLAN → ACT → OBSERVE</p>
          <h2>{t("工具与验证轨迹", "Tool & verification trace")}</h2>
          {plan.map((p, i) => (
            <div
              key={`${p}-${i}`}
              className={`cl-plan-step ${i === frame ? "is-current" : ""} ${i < frame ? "is-complete" : ""} ${p === "error" || p === "loop" ? "is-error" : ""}`}
            >
              <span>
                {i < frame ? (
                  <Check size={12} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <b>{text[p][t("中", "en") === "中" ? 0 : 1]}</b>
              {i === frame && <CircleDot size={14} />}
            </div>
          ))}
          <div
            className={`cl-agent-outcome ${complete ? "pass" : plan[frame] === "loop" ? "fail" : ""}`}
          >
            {complete ? (
              <ShieldCheck size={18} />
            ) : plan[frame] === "loop" ? (
              <TriangleAlert size={18} />
            ) : (
              <GitBranch size={18} />
            )}{" "}
            {complete
              ? t(
                  "证据验证完成，可以提交。",
                  "Evidence verified. Ready to submit.",
                )
              : plan[frame] === "loop"
                ? t(
                    "未识别失败原因，进入重复调用。",
                    "Failure cause unrecognized. Calls repeat.",
                  )
                : t("沿着当前状态继续检查。", "Inspect the next state.")}
          </div>
        </aside>
      </div>
      <Panel
        title={t(
          "四条轨迹，沿事件对齐",
          "Four trajectories, aligned by events",
        )}
        eyebrow="WORLD / HUMAN / PLAN / AI"
      >
        <div className="cl-event-layers">
          {[
            ["世界事件", "World events"],
            ["虚拟脑–眼动", "Virtual brain–gaze"],
            ["人类计划", "Human plan"],
            ["AI 工具状态", "AI tool states"],
          ].map(([zh, en], row) => (
            <div key={en}>
              <span>{t(zh, en)}</span>
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setFrame(Math.min(plan.length - 1, i))}
                  className={
                    Math.round((frame / (plan.length - 1)) * 4) === i
                      ? "is-active"
                      : ""
                  }
                  style={{
                    transform:
                      row === 3
                        ? `translateX(${(alignment - 0.7) * (i % 2 ? 1 : -1) * 38}px)`
                        : undefined,
                  }}
                >
                  {
                    [
                      t("观察", "Observe"),
                      t("证据", "Evidence"),
                      t("冲突", "Conflict"),
                      t("验证", "Verify"),
                      t("决策", "Decide"),
                    ][i]
                  }
                </button>
              ))}
            </div>
          ))}
        </div>
        <Range
          label={t(
            "拖动事件对应关系，观察对齐风险",
            "Move the event correspondence to inspect alignment risk",
          )}
          value={alignment}
          onChange={setAlignment}
        />
        <div className="cl-inline-metrics">
          <span>
            {t("错配风险代理", "Mismatch-risk proxy")}{" "}
            <b>{(Math.abs(alignment - 0.7) * 0.9 + 0.03).toFixed(3)}</b>
          </span>
          <span>
            {t("有效调用", "Useful calls")}{" "}
            <b>
              {
                plan
                  .slice(0, frame + 1)
                  .filter((p) => p !== "error" && p !== "loop").length
              }
            </b>
          </span>
          <span>
            {t("验证覆盖", "Verification coverage")}{" "}
            <b>{plan.slice(0, frame + 1).includes("verify") ? "100%" : "0%"}</b>
          </span>
        </div>
        {research && (
          <p>
            {t(
              "这里展示的是显式状态机，不接入真实工具或大型模型。不同条件定义不同错误恢复路径，不能把动画差异视为性能实证。",
              "This is an explicit state machine without live tools or a large model. Conditions define different recovery paths; animation differences are not empirical performance evidence.",
            )}
          </p>
        )}
      </Panel>
    </>
  );
}
