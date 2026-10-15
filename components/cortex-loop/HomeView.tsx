"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Boxes,
  CircleDot,
  Fingerprint,
  Focus,
  Layers3,
  Network,
  Orbit,
  ScanEye,
  Sparkles,
} from "lucide-react";
import { useCortex } from "./CortexContext";
import { Action, SourceTag } from "./Primitives";

const BrainScene = dynamic(() => import("./BrainScene"), {
  ssr: false,
  loading: () => (
    <div className="cl-scene-loading">
      <Orbit size={40} />
    </div>
  ),
});
const depths = [
  {
    zh: "输出",
    en: "Output",
    subtitle: ["文本 · 标签", "Text · labels"],
    description: [
      "一个答案，是认知过程留下的最后一道痕迹。它告诉我们结果，却很少解释结果如何发生。",
      "An answer is the final trace of cognition. It tells us the result, but little about how the result came to be.",
    ],
    scores: [25, 15, 10, 95, 15],
    icon: Layers3,
  },
  {
    zh: "行为",
    en: "Behavior",
    subtitle: ["动作 · 偏好", "Actions · preferences"],
    description: [
      "观察选择与行动，让监督越过单个标签，开始看见意图和价值权衡。",
      "Choices and actions move supervision beyond a single label, revealing intent and value trade-offs.",
    ],
    scores: [45, 30, 25, 80, 35],
    icon: Fingerprint,
  },
  {
    zh: "认知过程",
    en: "Process",
    subtitle: ["脑电 · 眼动 · 脑成像", "EEG · gaze · fMRI"],
    description: [
      "沿着注意、证据和冲突的时间轨迹，探索产生答案之前的中间计算。",
      "Follow attention, evidence and conflict through time to explore the intermediate computation before an answer.",
    ],
    scores: [75, 75, 80, 60, 85],
    icon: AudioLines,
  },
  {
    zh: "认知算子",
    en: "Operator",
    subtitle: ["关系 · 动态 · 事件图", "Relations · dynamics · events"],
    description: [
      "从带噪观测中提炼可迁移的结构。学习关系与几何，而不强求大脑和模型坐标一致。",
      "Distill transferable structure from noisy observations. Learn relations and geometry without forcing brain and model coordinates to match.",
    ],
    scores: [90, 65, 50, 55, 60],
    icon: Network,
  },
  {
    zh: "学习闭环",
    en: "Loop",
    subtitle: ["主动提问 · 独立审计", "Active queries · independent audit"],
    description: [
      "AI 暴露自己的盲点，主动提出下一题；人类过程形成教师，每次更新都接受独立检验。",
      "AI exposes its blind spots and asks the next question. Human processes become teachers, and every update faces an independent audit.",
    ],
    scores: [95, 90, 65, 85, 80],
    icon: Orbit,
  },
];

export function HomeView() {
  const { t, locale, navigate, research } = useCortex();
  const [depth, setDepth] = useState(2);
  const current = depths[depth];
  return (
    <>
      <section className="cl-hero">
        <div className="cl-hero-copy">
          <p className="cl-eyebrow">
            <span className="cl-live-dot" />
            {t("人类认知 × 下一代智能", "HUMAN COGNITION × NEXT INTELLIGENCE")}
          </p>
          <h1>
            {t("智能的下一课，", "The next lesson")}
            <br />
            {t("在人类认知", "for AI is")}
            <br />
            <em>{t("深处。", "within us.")}</em>
          </h1>
          <p className="cl-hero-description">
            {t(
              "我们早已教会 AI 学习人类的答案。现在，向前一步：学习答案形成之前的注意、推理与决策。",
              "We taught AI to learn from our answers. Now, we move upstream—to the attention, reasoning and decisions that come before them.",
            )}
          </p>
          <div className="cl-hero-actions">
            <Action onClick={() => navigate("loop")}>
              {t("进入闭环实验室", "Enter Loop Lab")}
              <ArrowUpRight size={17} />
            </Action>
            <button
              className="cl-text-button"
              onClick={() => navigate("relay")}
            >
              {t("探索 RELAY", "Explore RELAY")}
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="cl-hero-footnote">
            <span className="cl-mini-orbit" />
            {t(
              "从人类输出，到可验证的认知结构。",
              "From human output to verifiable cognitive structure.",
            )}
          </div>
        </div>
        <div className="cl-hero-art">
          <div className="cl-hero-art-label cl-mono">
            <span>FIG. 01</span>
            <span>
              {t("认知计算的另一种视角", "A DIFFERENT VIEW OF COMPUTATION")}
            </span>
          </div>
          <BrainScene depth={depth} />
          <div className="cl-brain-label cl-human-label">
            <span className="cl-live-dot" />
            {t("人类认知流形", "HUMAN COGNITION")}
            <small>
              {t("注意 / 关系 / 决策", "attention / relations / decisions")}
            </small>
          </div>
          <div className="cl-brain-label cl-ai-label">
            <span className="cl-live-dot" />
            {t("AI 潜在状态", "AI LATENT STATES")}
            <small>
              {t("可对齐的中间计算", "alignable intermediate computation")}
            </small>
          </div>
          <div className="cl-art-caption">
            <SourceTag kind="concept" />
            <span>
              {t(
                "拖动旋转 · 程序化点云",
                "DRAG TO ROTATE · PROCEDURAL POINT CLOUD",
              )}
            </span>
          </div>
        </div>
      </section>
      <section className="cl-principle-strip">
        <span className="cl-mono">THE CORTEX PRINCIPLE</span>
        <p>
          {t("不止学会回答。", "Beyond learning the answer.")}{" "}
          <strong>
            {t("学习回答如何发生。", "Learn how it comes to be.")}
          </strong>
        </p>
        <ArrowDown size={20} />
      </section>
      <section className="cl-depth-section">
        <div className="cl-section-intro">
          <p className="cl-eyebrow">01 / DEPTH OF SUPERVISION</p>
          <h2>{t("监督，可以更深入。", "Supervision goes deeper.")}</h2>
          <p>
            {t(
              "拖动刻度，探索五种学习信号。越深入，信息、成本与责任也随之改变。",
              "Move through five layers of learning signals. Greater depth brings richer information, higher costs and new responsibilities.",
            )}
          </p>
        </div>
        <div className="cl-depth-control">
          <div className="cl-depth-tabs">
            {depths.map((d, i) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.en}
                  className={depth === i ? "is-active" : ""}
                  onClick={() => setDepth(i)}
                >
                  <span className="cl-depth-number">0{i + 1}</span>
                  <Icon size={22} />
                  <strong>{locale === "zh" ? d.zh : d.en}</strong>
                  <small>{d.subtitle[locale === "zh" ? 0 : 1]}</small>
                </button>
              );
            })}
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            aria-label={t("监督深度", "Supervision depth")}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
          <div className="cl-depth-detail">
            <div>
              <span className="cl-mono">
                0{depth + 1} / {current.en.toUpperCase()}
              </span>
              <h3>{locale === "zh" ? current.zh : current.en}</h3>
              <p>{current.description[locale === "zh" ? 0 : 1]}</p>
              {depth === 4 && (
                <button
                  className="cl-inline-link"
                  onClick={() => navigate("loop")}
                >
                  {t("让数据流闭合成环", "Close the learning loop")}
                  <ArrowUpRight size={15} />
                </button>
              )}
            </div>
            <div className="cl-depth-bars">
              {[
                ["信息丰富度", "Information"],
                ["采集成本", "Cost"],
                ["测量噪声", "Noise"],
                ["实时可用性", "Real-time"],
                ["隐私敏感度", "Privacy sensitivity"],
              ].map(([zh, en], i) => (
                <div key={en}>
                  <span>{t(zh, en)}</span>
                  <div>
                    <i style={{ width: `${current.scores[i]}%` }} />
                  </div>
                  <small>
                    {t(
                      ["低", "中", "高"][
                        Math.min(2, Math.floor(current.scores[i] / 34))
                      ],
                      ["low", "mid", "high"][
                        Math.min(2, Math.floor(current.scores[i] / 34))
                      ],
                    )}
                  </small>
                </div>
              ))}
              <p>
                {t(
                  "定性概念量表，不代表实测比较。",
                  "Qualitative concept scales, not empirical comparisons.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="cl-research-bridge">
        <div className="cl-bridge-visual">
          <div className="cl-bridge-ring">
            <AudioLines />
            <span>HUMAN</span>
          </div>
          <span className="cl-flow-track">
            <i />
          </span>
          <div className="cl-bridge-core">
            <Network />
            <strong>RELAY</strong>
            <span>{t("可信认知教师", "RELIABLE TEACHER")}</span>
          </div>
          <span className="cl-flow-track">
            <i />
          </span>
          <div className="cl-bridge-ring cl-cool">
            <Boxes />
            <span>AI</span>
          </div>
        </div>
        <div>
          <p className="cl-eyebrow">02 / FROM STATIC TO ACTIVE</p>
          <h2>
            {t("一个可靠的起点。", "A reliable starting point.")}
            <br />
            <span className="cl-muted">
              {t("一个会提问的未来。", "A future that asks questions.")}
            </span>
          </h2>
          <p>
            {t(
              "RELAY 先将固定的脑轨迹转化为风险校准的视觉推理教师。CORTEX-Loop 进一步探索：如果 AI 能主动选择最值得向人学习的内容，会怎样？",
              "RELAY first turns fixed neural trajectories into risk-calibrated teachers for visual reasoning. CORTEX-Loop asks what happens when AI actively selects what is worth learning from humans.",
            )}
          </p>
          <button className="cl-text-button" onClick={() => navigate("relay")}>
            {t("查看方法与论文结果", "Explore the method & paper results")}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
      <section className="cl-domains-section">
        <div className="cl-section-intro">
          <p className="cl-eyebrow">03 / BEYOND A SINGLE TASK</p>
          <h2>{t("同一种范式，新的边界。", "One paradigm. New frontiers.")}</h2>
          <p>
            {t(
              "认知结构不会止步于一道推理题。走进三个不同的交互实验。",
              "Cognitive structure reaches beyond a single reasoning problem. Step into three distinct interactive experiments.",
            )}
          </p>
        </div>
        <div className="cl-domain-grid">
          {[
            {
              page: "aesthetic" as const,
              title: t("美，如何被感知？", "How do we perceive beauty?"),
              body: t(
                "在选择、注视与犹豫中，学习个人偏好的边界。",
                "Learn personal preference boundaries through choices, fixations and hesitation.",
              ),
              icon: ScanEye,
              word: "AESTHETICS",
              className: "cl-domain-aesthetic",
            },
            {
              page: "space" as const,
              title: t("世界，如何被重建？", "How do we reconstruct space?"),
              body: t(
                "旋转视角、揭开遮挡、重新规划一条抵达的路径。",
                "Rotate perspectives, reveal occlusions and replan a path to a destination.",
              ),
              icon: Focus,
              word: "SPATIAL INTELLIGENCE",
              className: "cl-domain-space",
            },
            {
              page: "agent-world" as const,
              title: t("行动，如何被决定？", "How do we decide to act?"),
              body: t(
                "在工具失效和证据冲突中，观察验证、回退与重规划。",
                "Observe verification, recovery and replanning when tools fail or evidence conflicts.",
              ),
              icon: Sparkles,
              word: "AGENT & WORLD",
              className: "cl-domain-agent",
            },
          ].map((d, i) => (
            <button
              key={d.page}
              className={`cl-domain-card ${d.className}`}
              onClick={() => navigate(d.page)}
            >
              <div className="cl-domain-art">
                <d.icon size={54} />
                {Array.from({ length: 5 }, (_, j) => (
                  <i key={j} style={{ "--i": j } as React.CSSProperties} />
                ))}
              </div>
              <span className="cl-mono">
                0{i + 1} / {d.word}
              </span>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
              <span className="cl-domain-arrow">
                <ArrowUpRight size={20} />
              </span>
            </button>
          ))}
        </div>
      </section>
      {research && (
        <section className="cl-research-note">
          <CircleDot size={24} />
          <div>
            <h3>
              {t(
                "科研视角：一个明确的研究边界",
                "Research view: a precise boundary",
              )}
            </h3>
            <p>
              {t(
                "RELAY 页面区分论文实测汇总与交互示意。闭环和未来任务是可复现的本地模拟，不构成真实在线脑–AI 训练效果的证据；理论结论以各自假设为前提。",
                "The RELAY page distinguishes paper-reported aggregates from interactive illustrations. The loop and future tasks are reproducible local simulations, not evidence of live brain–AI training gains. Theoretical statements depend on their stated assumptions.",
              )}
            </p>
          </div>
        </section>
      )}
      <section className="cl-final-cta">
        <Orbit size={30} />
        <p>{t("CORTEX 蒸馏认知计算。", "CORTEX distills the computation.")}</p>
        <h2>{t("下一步，什么最值得学习？", "What is worth learning next?")}</h2>
        <Action onClick={() => navigate("loop")}>
          {t("开启第一次闭环", "Begin your first loop")}
          <ArrowUpRight size={17} />
        </Action>
      </section>
    </>
  );
}
