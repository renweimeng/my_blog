"use client";

import { Check, CircleHelp, Eye, Focus, ScanLine, X } from "lucide-react";
import {
  liveStages,
  liveOutcome,
  type LiveFrame,
  type LiveTaskKind,
} from "@/lib/cortex-loop/liveSimulation";
import { useCortex } from "./CortexContext";

function TaskGlyph({
  kind,
  value,
  small = false,
}: {
  kind: LiveTaskKind;
  value: number;
  small?: boolean;
}) {
  const dotPositions: Record<number, number[][]> = {
    1: [[45, 45]],
    2: [
      [30, 45],
      [60, 45],
    ],
    3: [
      [25, 45],
      [45, 45],
      [65, 45],
    ],
    4: [
      [31, 31],
      [59, 31],
      [31, 59],
      [59, 59],
    ],
    5: [
      [29, 29],
      [61, 29],
      [45, 45],
      [29, 61],
      [61, 61],
    ],
  };
  return (
    <svg
      viewBox="0 0 90 90"
      className={small ? "cx-glyph is-small" : "cx-glyph"}
      aria-hidden="true"
    >
      {kind === "count" &&
        dotPositions[value]?.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6.5" fill="currentColor" />
        ))}
      {kind === "rotation" && (
        <g transform={`rotate(${value} 45 45)`}>
          <path d="M45 19 63 39h-12v31H39V39H27Z" fill="currentColor" />
        </g>
      )}
      {kind === "shapes" &&
        (value === 0 ? (
          <circle cx="45" cy="45" r="21" />
        ) : value === 1 ? (
          <rect x="25" y="25" width="40" height="40" rx="3" />
        ) : value === 2 ? (
          <path d="m45 20 26 47H19Z" />
        ) : (
          <path d="m45 17 28 28-28 28-28-28Z" />
        ))}
      {kind === "mental" && (
        <g transform={`rotate(${value} 45 45)`}>
          {[
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 2],
          ].map(([x, y], i) => (
            <rect
              key={i}
              x={29 + x * 17}
              y={20 + y * 17}
              width="15"
              height="15"
              rx="1.5"
            />
          ))}
        </g>
      )}
      {kind === "memory" &&
        Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x={17 + (i % 3) * 20}
            y={17 + Math.floor(i / 3) * 20}
            width="16"
            height="16"
            rx="2"
            fill={i === value ? "currentColor" : "none"}
            stroke="currentColor"
            opacity={i === value ? 1 : 0.23}
            strokeWidth="1"
          />
        ))}
    </svg>
  );
}

const colorLabels = [
  ["蓝色", "Blue"],
  ["红色", "Red"],
  ["绿色", "Green"],
  ["黄色", "Yellow"],
] as const;
const optionColors = ["#8ab9ed", "#e69a92", "#80dbc0", "#dabc84"];

export function LiveTask({ frame }: { frame: LiveFrame }) {
  const { t, locale } = useCortex();
  const l = locale === "zh" ? 0 : 1;
  const task = frame.task;
  const memorySequence = [0, 4, 2, 6];
  const memoryStep = Math.min(
    3,
    Math.floor(Math.max(0, frame.within - 1200) / 1050),
  );
  const reveal = frame.phase === 5;
  const outcome = liveOutcome(frame.trialIndex);
  const likely = frame.phase < 2 ? frame.focus % 4 : outcome.choice;
  const peak = 0.28 + frame.confidence * 0.56;
  const probabilities = Array.from({ length: 4 }, (_, i) =>
    i === likely ? peak : (1 - peak) / 3,
  );
  const phases = [
    t("注视中心，等待刺激呈现。", "Fixate the center and await the stimulus."),
    task.kind === "memory"
      ? t(
          "按顺序呈现四个位置，保留空间轨迹。",
          "Observe four locations and retain their order.",
        )
      : t(
          "扫描刺激的局部特征，建立初始表征。",
          "Scan local features and build an initial representation.",
        ),
    t(
      "比较关系，形成当前任务的候选规则。",
      "Compare relations and form a candidate rule.",
    ),
    t(
      "回看关键证据，抑制不相容的候选项。",
      "Recheck evidence and suppress incompatible candidates.",
    ),
    t(
      "记录选择、反应时间与当前置信度。",
      "Record the response, reaction time and confidence.",
    ),
    outcome.correct
      ? t(
          "回答正确，进入下一轮任务。",
          "Correct response. Preparing the next task.",
        )
      : t(
          "回答与规则不符，保留此轮供复核。",
          "Response mismatch. Retain this trial for review.",
        ),
  ];

  return (
    <section
      className="cx-panel cx-task"
      aria-label={t("正在进行的测试题", "Current cognitive task")}
    >
      <header className="cx-panel-heading">
        <div>
          <span className="cx-section-number">02</span>
          <Focus size={15} />
          <h2>{t("被试任务现场", "Participant task")}</h2>
        </div>
        <span className="cx-tag cx-gold">
          TRIAL {String(frame.trialIndex + 1).padStart(3, "0")}
        </span>
      </header>
      <div className="cx-task-title">
        <div>
          <p>{t("认知任务电池 / 自动轮播", "COGNITIVE BATTERY / AUTOPLAY")}</p>
          <h3>{task.name[l]}</h3>
        </div>
        <div className="cx-countdown">
          <strong>{(20 - frame.within / 1000).toFixed(1)}</strong>
          <span>{t("秒 / 下一题", "s / next task")}</span>
        </div>
      </div>
      <p className="cx-task-prompt">{task.prompt[l]}</p>
      <div
        className={`cx-stimulus cx-stimulus-${task.kind}`}
        data-phase={frame.stage.id}
      >
        <div className="cx-stimulus-topline">
          <span>
            <ScanLine size={11} />
            {t("刺激窗口", "STIMULUS")}
          </span>
          <span>
            {frame.stage.code} · {(frame.within / 1000).toFixed(1)} s
          </span>
        </div>
        {(["count", "rotation", "shapes"] as string[]).includes(task.kind) && (
          <div
            className="cx-matrix"
            role="img"
            aria-label={t(
              "三行三列推理矩阵，右下角待补全",
              "Three-by-three reasoning matrix with a missing final cell",
            )}
          >
            {Array.from({ length: 9 }, (_, i) => {
              const row = Math.floor(i / 3),
                column = i % 3;
              const value =
                task.kind === "count"
                  ? row + column + 1
                  : task.kind === "rotation"
                    ? ((row + column) * 90) % 360
                    : (row + column) % 3;
              const missing = i === 8;
              const focused =
                frame.phase >= 1 && frame.phase < 4 && i === frame.focus;
              return (
                <div
                  key={i}
                  className={`cx-matrix-cell ${missing ? "is-missing" : ""} ${focused ? "is-focused" : ""} ${missing && reveal ? "is-revealed" : ""}`}
                >
                  {missing && !reveal ? (
                    <span className="cx-question-mark">?</span>
                  ) : (
                    <TaskGlyph kind={task.kind} value={value} />
                  )}
                  {focused && (
                    <span className="cx-fixation-target">
                      <i />
                      <i />
                    </span>
                  )}
                  {!missing && (
                    <small>
                      {row + 1}.{column + 1}
                    </small>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {task.kind === "stroop" && (
          <div className="cx-stroop">
            <span>
              {t("只判断字色，不读取词义", "NAME THE INK, NOT THE WORD")}
            </span>
            <strong>{t("蓝色", "BLUE")}</strong>
            <div>
              <span>{t("词义通路", "Word")}</span>
              <i />
              <span>{t("颜色通路", "Ink")}</span>
            </div>
            <small>
              {t("不一致刺激 / 干扰抑制", "INCONGRUENT / INHIBIT INTERFERENCE")}
            </small>
          </div>
        )}
        {task.kind === "mental" && (
          <div className="cx-mental">
            <div className="cx-rotation-reference">
              <TaskGlyph kind="mental" value={0} />
            </div>
            <div className="cx-rotation-cue">
              <svg viewBox="0 0 80 80" aria-hidden="true">
                <path
                  d="M18 55A26 26 0 1 1 60 52M48 50l15 6 5-16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <strong>90°</strong>
              <span>{t("顺时针", "CLOCKWISE")}</span>
            </div>
          </div>
        )}
        {task.kind === "memory" && (
          <div className="cx-memory">
            <div className="cx-memory-grid">
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  className={
                    (frame.phase === 1 && memorySequence[memoryStep] === i) ||
                    (reveal && i === 6)
                      ? "is-lit"
                      : ""
                  }
                >
                  {frame.phase === 1 && memorySequence[memoryStep] === i
                    ? memoryStep + 1
                    : ""}
                </div>
              ))}
            </div>
            <span>
              {frame.phase === 1
                ? `${t("位置序列", "SEQUENCE")} ${memoryStep + 1} / 4`
                : t("从记忆中提取最后位置", "RETRIEVE THE FINAL LOCATION")}
            </span>
          </div>
        )}
        {frame.phase === 0 && (
          <div className="cx-fixation-screen">
            <span>+</span>
            <small>{t("请注视中心", "FIXATE THE CENTER")}</small>
          </div>
        )}
        <div className="cx-stimulus-bottomline">
          <span>
            <Eye size={11} />
            {t("注视与过程轨迹示意", "Illustrative gaze & process")}
          </span>
          <span>
            {t("难度", "DIFFICULTY")} {Math.round(task.difficulty * 5)} / 5
          </span>
        </div>
      </div>

      <div
        className="cx-options"
        aria-label={t(
          "答案选项与自动作答结果",
          "Answer options and automatic response",
        )}
      >
        {task.options.map((value, i) => (
          <div
            key={i}
            className={`cx-option ${frame.choice === i ? "is-chosen" : ""} ${reveal && i === task.answer ? "is-correct" : ""} ${reveal && frame.choice === i && !frame.correct ? "is-wrong" : ""}`}
          >
            <span className="cx-option-letter">{"ABCD"[i]}</span>
            {task.kind === "stroop" ? (
              <span
                className="cx-color-option"
                style={{ color: optionColors[value] }}
              >
                {colorLabels[value][l]}
              </span>
            ) : (
              <TaskGlyph kind={task.kind} value={value} small />
            )}
            {reveal && i === task.answer ? (
              <Check className="cx-option-result" size={12} />
            ) : reveal && i === frame.choice && !frame.correct ? (
              <X className="cx-option-result" size={12} />
            ) : frame.choice === i ? (
              <span className="cx-option-selected-dot" />
            ) : null}
          </div>
        ))}
      </div>

      <div
        className={`cx-task-caption ${reveal ? (frame.correct ? "is-correct" : "is-wrong") : ""}`}
      >
        {reveal ? (
          frame.correct ? (
            <Check size={15} />
          ) : (
            <X size={15} />
          )
        ) : (
          <CircleHelp size={15} />
        )}
        <div>
          <strong>
            {reveal ? t("规则与反馈", "RULE & FEEDBACK") : frame.stage.name[l]}
            {frame.choice !== null && (
              <span className="cx-response-time">
                RT {frame.responseSeconds.toFixed(2)} s
              </span>
            )}
          </strong>
          <p>{reveal ? task.explanation[l] : phases[frame.phase]}</p>
        </div>
      </div>
      <div className="cx-choice-weights">
        <div>
          <span>{t("候选选择分布", "Candidate choice distribution")}</span>
          <span>{t("过程示意", "Illustrative")}</span>
        </div>
        <div>
          {probabilities.map((probability, i) => (
            <div key={i}>
              <b>{"ABCD"[i]}</b>
              <i>
                <span style={{ width: `${(probability * 100).toFixed(2)}%` }} />
              </i>
              <small>{Math.round(probability * 100)}%</small>
            </div>
          ))}
        </div>
      </div>
      <div className="cx-task-phase">
        <span>{t("当前进度", "TRIAL PHASE")}</span>
        <div>
          {liveStages.map((phase, i) => (
            <div
              key={phase.id}
              className={
                i === frame.phase
                  ? "is-current"
                  : i < frame.phase
                    ? "is-done"
                    : ""
              }
            >
              <i />
              <span>{phase.name[l]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
