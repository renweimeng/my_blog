"use client";

import {
  ArrowUpRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Fingerprint,
  GitCompareArrows,
  Lightbulb,
} from "lucide-react";
import {
  clampLive,
  evokedSignal,
  liveElectrodes,
  sampleLiveEEG,
  LIVE_TRIAL_MS,
  type LiveAnalysis,
  type LiveFrame,
} from "@/lib/cortex-loop/liveSimulation";
import { useCortex } from "./CortexContext";

function heatColor(level: number) {
  const value = clampLive(level);
  const from = value < 0.58 ? [23, 55, 66] : [94, 177, 161];
  const to = value < 0.58 ? [94, 177, 161] : [225, 185, 119];
  const mix = value < 0.58 ? value / 0.58 : (value - 0.58) / 0.42;
  return `rgb(${from.map((number, i) => Math.round(number + (to[i] - number) * mix)).join(",")})`;
}

function ScalpMap({
  analysis,
  selected,
  onSelect,
}: {
  analysis: LiveAnalysis;
  selected: number;
  onSelect: (index: number) => void;
}) {
  const { t } = useCortex();
  const clip = "cx-live-scalp-clip";
  const pixels = [];
  for (let y = -8; y <= 8; y++)
    for (let x = -8; x <= 8; x++) {
      if (x * x + y * y > 70) continue;
      let weighted = 0,
        weights = 0;
      liveElectrodes.forEach((electrode, i) => {
        const distance =
          (x / 8 - electrode.x) ** 2 + (y / 8 - electrode.y) ** 2;
        const weight = 1 / (distance + 0.025) ** 1.5;
        weighted += analysis.scalp[i] * weight;
        weights += weight;
      });
      pixels.push(
        <rect
          key={`${x}-${y}`}
          x={89 + x * 8.1}
          y={87 + y * 8.1}
          width="8.5"
          height="8.5"
          fill={heatColor((weighted / weights - 4) / 10)}
        />,
      );
    }
  return (
    <svg
      className="cx-scalp-map"
      viewBox="0 0 190 184"
      role="group"
      aria-label={t(
        "头皮空间能量图，点击电极选择通道",
        "Scalp energy map; select an electrode to inspect its channel",
      )}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="93" cy="91" r="68" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>{pixels}</g>
      <path
        d="M84 22 93 10l9 12M24 78c-13-6-12 29 0 23M162 78c13-6 12 29 0 23"
        fill="none"
        stroke="#7b9297"
        strokeWidth="1.2"
      />
      <circle
        cx="93"
        cy="91"
        r="68"
        fill="none"
        stroke="#8ba5a5"
        strokeWidth="1.2"
      />
      <ellipse cx="93" cy="91" rx="35" ry="67" fill="none" stroke="#a8cfbf24" />
      <path
        d="M26 91h134M40 48q53 32 107 0M40 134q53-32 107 0"
        fill="none"
        stroke="#a8cfbf24"
      />
      {liveElectrodes.map((electrode, i) => (
        <g
          key={electrode.name}
          className={`cx-electrode ${selected === i ? "is-selected" : ""}`}
          role="button"
          tabIndex={0}
          aria-pressed={selected === i}
          aria-label={`${t("查看", "Inspect")} ${electrode.name} ${analysis.scalp[i].toFixed(1)} μV RMS`}
          onClick={() => onSelect(i)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(i);
            }
          }}
        >
          <circle
            cx={93 + electrode.x * 68}
            cy={91 + electrode.y * 68}
            r={selected === i ? 5 : 2}
            fill={selected === i ? "#f5d6a0" : "#e5f0d5b0"}
            stroke={selected === i ? "#fff5df" : "none"}
          />
          {selected === i && (
            <text
              x={93 + electrode.x * 68 + 8}
              y={95 + electrode.y * 68}
              fill="#fff3d7"
              fontSize="10"
            >
              {electrode.name}
            </text>
          )}
          <title>{`${electrode.name} · ${analysis.scalp[i].toFixed(1)} μV RMS`}</title>
        </g>
      ))}
      <text x="93" y="178" textAnchor="middle" fill="#83999f" fontSize="8">
        {t("电极布局示意 · RMS", "SCHEMATIC MONTAGE · RMS")}
      </text>
    </svg>
  );
}

function ERPChart({ frame, selected }: { frame: LiveFrame; selected: number }) {
  const { t } = useCortex();
  const clip = "cx-live-erp-clip";
  const x = (time: number) => 30 + ((time + 200) / 1000) * 300;
  const y = (value: number) => 58 - value * 1.6;
  const times = Array.from({ length: 201 }, (_, i) => -200 + i * 5);
  const eventSeconds = (frame.trialIndex * LIVE_TRIAL_MS + 1200) / 1000;
  const raw = times
    .map(
      (ms, i) =>
        `${i ? "L" : "M"}${x(ms).toFixed(2)},${y(sampleLiveEEG(selected, eventSeconds + ms / 1000)).toFixed(2)}`,
    )
    .join(" ");
  const template = times
    .map(
      (ms, i) =>
        `${i ? "L" : "M"}${x(ms).toFixed(2)},${y(evokedSignal(ms, frame.task.difficulty, liveElectrodes[selected].region === "parietal")).toFixed(2)}`,
    )
    .join(" ");
  const revealed = clampLive((frame.within - 1000) / 1000) * 300;
  return (
    <svg
      className="cx-erp-chart"
      viewBox="0 0 350 127"
      role="img"
      aria-label={t(
        "刺激锁定的单试次脑电与合成响应模板，时间范围负 200 至 800 毫秒",
        "Stimulus-locked single-trial EEG and synthetic response template, minus 200 to 800 milliseconds",
      )}
    >
      <defs>
        <clipPath id={clip}>
          <rect x="30" y="8" width={revealed} height="100" />
        </clipPath>
      </defs>
      <rect
        x={x(180)}
        y="8"
        width={x(300) - x(180)}
        height="95"
        fill="#b2a1e10d"
      />
      <rect
        x={x(300)}
        y="8"
        width={x(600) - x(300)}
        height="95"
        fill="#d6b98b0b"
      />
      {[-20, 0, 20].map((value) => (
        <g key={value}>
          <path
            d={`M30 ${y(value)}H330`}
            stroke="#b8d6cf12"
            strokeDasharray={value ? "3 4" : undefined}
          />
          <text
            x="24"
            y={y(value) + 3}
            textAnchor="end"
            fontSize="8"
            fill="#748a93"
          >
            {value}
          </text>
        </g>
      ))}
      {[-200, 0, 200, 400, 600, 800].map((ms) => (
        <g key={ms}>
          <path d={`M${x(ms)} 8V103`} stroke="#b8d6cf12" />
          <text
            x={x(ms)}
            y="119"
            textAnchor="middle"
            fontSize="8"
            fill="#81959d"
          >
            {ms}
          </text>
        </g>
      ))}
      <path d={`M${x(0)} 8V103`} stroke="#d3b88c77" strokeDasharray="3 3" />
      <text x="7" y="9" fontSize="8" fill="#81959d">
        μV
      </text>
      <text x="339" y="119" fontSize="8" fill="#81959d">
        ms
      </text>
      <path
        d={template}
        stroke="#d6b98b"
        strokeWidth="1.4"
        strokeDasharray="4 3"
        fill="none"
        opacity=".8"
      />
      <path
        d={raw}
        stroke="#7bdbc8"
        strokeWidth="1"
        fill="none"
        clipPath={`url(#${clip})`}
      />
      {revealed > 0 && revealed < 300 && (
        <path d={`M${30 + revealed} 8V103`} stroke="#a7f2d4" strokeWidth="1" />
      )}
    </svg>
  );
}

export function LiveAnalytics({
  frame,
  analysis,
  selected,
  onSelect,
}: {
  frame: LiveFrame;
  analysis: LiveAnalysis;
  selected: number;
  onSelect: (index: number) => void;
}) {
  const { t, locale } = useCortex();
  const l = locale === "zh" ? 0 : 1;
  const electrode = liveElectrodes[selected];
  const thetaAlpha =
    analysis.bands[0].value / Math.max(0.01, analysis.bands[1].value);
  const evidence = [
    [
      "注视准备",
      "Fixation",
      "保持中心注视，采集刺激前的参考窗口。",
      "Center fixation provides a pre-stimulus reference window.",
    ],
    [
      "视觉编码",
      "Visual encoding",
      "逐格扫描刺激。后部导联、注视位置与题面同步呈现。",
      "The stimulus scan and posterior channels share the same presentation clock.",
    ],
    [
      "关系整合",
      "Relational integration",
      "比较行列关系。当前高亮区域与合成频段能量随任务窗口联动。",
      "Relations are compared; highlighted regions and synthetic band energy follow the task window.",
    ],
    [
      "候选复核",
      "Candidate verification",
      "保留竞争选项，检查规则的一致性；过程对齐仍是示意指标。",
      "Competing choices are checked for consistency. Alignment remains an illustrative metric.",
    ],
    [
      "决策提交",
      "Decision registration",
      "选择与反应时间被记录到事件流，随后进入独立反馈。",
      "The choice and reaction time enter the event stream before feedback.",
    ],
    [
      "反馈更新",
      "Feedback update",
      "依据题目规则核验答案；错误试次同样保留，不隐藏失败。",
      "Responses are checked against the task rule. Incorrect trials are retained.",
    ],
  ][frame.phase];

  return (
    <aside
      className="cx-analytics"
      aria-label={t("实时分析与可解释信息", "Live analytics and explanations")}
    >
      <section className="cx-panel cx-neuro">
        <header className="cx-panel-heading">
          <div>
            <span className="cx-section-number">03</span>
            <BrainCircuit size={15} />
            <h2>{t("空间与频段响应", "Spatial & spectral response")}</h2>
          </div>
          <span className="cx-tag">250 ms</span>
        </header>
        <div className="cx-neuro-body">
          <ScalpMap
            analysis={analysis}
            selected={selected}
            onSelect={onSelect}
          />
          <div className="cx-bands">
            <div>
              <span>{t("相对频段能量", "RELATIVE BAND POWER")}</span>
              <b>{electrode.name}</b>
            </div>
            {analysis.bands.map((band) => (
              <div className="cx-band" key={band.id}>
                <div>
                  <span style={{ color: band.color }}>{band.name[l]}</span>
                  <span>
                    {(band.value * 100).toFixed(1)}
                    <small>%</small>
                  </span>
                </div>
                <i>
                  <span
                    style={{
                      width: `${(band.value * 100).toFixed(2)}%`,
                      backgroundColor: band.color,
                    }}
                  />
                </i>
                <small>{band.range}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="cx-panel-footnote">
          <span>RMS {analysis.scalp[selected].toFixed(1)} μV</span>
          <span>θ / α {thetaAlpha.toFixed(2)}</span>
          <span>{t("2 s 频谱窗", "2 s spectral window")}</span>
        </div>
      </section>

      <section className="cx-panel cx-erp">
        <header className="cx-panel-heading">
          <div>
            <ChartNoAxesCombined size={15} />
            <h2>{t("事件锁定响应", "Event-locked response")}</h2>
          </div>
          <span className="cx-tag">{electrode.name} / S01</span>
        </header>
        <div className="cx-chart-key">
          <span>
            <i />
            {t("单试次合成信号", "Synthetic single trial")}
          </span>
          <span>
            <i />
            {t("响应模板", "Response template")}
          </span>
        </div>
        <ERPChart frame={frame} selected={selected} />
        <div className="cx-panel-footnote">
          <span>
            {t("刺激前 200 ms → 后 800 ms", "−200 ms → +800 ms from onset")}
          </span>
          <span>{t("非临床 ERP", "Non-clinical ERP")}</span>
        </div>
      </section>

      <section className="cx-panel cx-explanation">
        <header className="cx-panel-heading">
          <div>
            <GitCompareArrows size={15} />
            <h2>{t("认知过程与对齐", "Process & alignment")}</h2>
          </div>
          <span className="cx-tag cx-purple">RELAY</span>
        </header>
        <div className="cx-alignment-body">
          <div
            className="cx-relation-grid"
            role="img"
            aria-label={t(
              "六阶段关系核，概念可视化",
              "Six-stage relational kernel, concept visualization",
            )}
          >
            {Array.from({ length: 36 }, (_, index) => {
              const row = Math.floor(index / 6),
                col = index % 6;
              const value = clampLive(
                Math.exp(-Math.abs(row - col) * 0.55) *
                  (0.58 + frame.alignment * 0.32) +
                  Math.sin(frame.elapsedMs / 2300 + row * 0.7 + col * 0.7) *
                    0.07,
              );
              return (
                <i
                  key={index}
                  style={{
                    background: heatColor(value),
                    outline:
                      row === frame.phase && col === frame.phase
                        ? "1px solid #f6dca9"
                        : undefined,
                  }}
                />
              );
            })}
          </div>
          <div className="cx-alignment-numbers">
            <div>
              <span>
                {t("过程对齐", "Process alignment")}{" "}
                <small>{t("示意", "concept")}</small>
              </span>
              <strong>
                {(frame.alignment * 100).toFixed(1)}
                <small>%</small>
              </strong>
            </div>
            <div>
              <Fingerprint size={12} />
              {t("阶段结构 · 非思想解码", "Stage structure, not mind reading")}
            </div>
          </div>
        </div>
        <div className="cx-evidence-copy">
          <Lightbulb size={13} />
          <div>
            <strong>{evidence[l]}</strong>
            <p>{evidence[l + 2]}</p>
          </div>
        </div>
        <div className="cx-explanation-link">
          <span>
            {t(
              "观察 → 关系 → 可检验结构",
              "OBSERVATION → RELATIONS → STRUCTURE",
            )}
          </span>
          <ArrowUpRight size={12} />
        </div>
      </section>
    </aside>
  );
}
