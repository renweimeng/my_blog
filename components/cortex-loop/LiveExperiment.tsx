"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowRight,
  AudioLines,
  ChevronRight,
  Download,
  FlaskConical,
  GitBranch,
  Pause,
  Play,
  Radio,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import {
  analyzeLiveSignal,
  formatLiveTime,
  getLiveEvents,
  getLiveFrame,
  liveAccuracy,
  liveElectrodes,
  liveMetrics,
  liveOutcome,
  liveTasks,
  LIVE_TRIAL_MS,
  sampleLiveEEG,
} from "@/lib/cortex-loop/liveSimulation";
import { useCortex } from "./CortexContext";
import { LiveEEG } from "./LiveEEG";
import { LiveTask } from "./LiveTask";
import { LiveAnalytics } from "./LiveAnalytics";
import "./live.css";

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

function ActivityTrend({ elapsed }: { elapsed: number }) {
  const { t } = useCortex();
  const points = Array.from({ length: 65 }, (_, index) => {
    const time = Math.max(0, elapsed - 20_000 + (index / 64) * 20_000);
    return liveMetrics(time);
  });
  return (
    <svg
      viewBox="0 0 360 47"
      preserveAspectRatio="none"
      className="cx-process-trend"
      role="img"
      aria-label={t(
        "最近二十秒的任务负荷和选择置信度变化",
        "Task load and choice confidence over twenty seconds",
      )}
    >
      {[10, 25, 40].map((y) => (
        <path key={y} d={`M0 ${y}H360`} stroke="#bad5d50c" />
      ))}
      <polyline
        points={points
          .map((p, i) => `${(i / 64) * 360},${44 - p.load * 38}`)
          .join(" ")}
        stroke="#d6b98b"
        fill="none"
        strokeWidth="1.3"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={points
          .map((p, i) => `${(i / 64) * 360},${44 - p.confidence * 38}`)
          .join(" ")}
        stroke="#a99dd9"
        fill="none"
        strokeWidth="1.3"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M359 4V44" stroke="#8ca5b855" />
    </svg>
  );
}

export default function LiveExperiment() {
  const { t, locale, navigate, reducedMotion } = useCortex();
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const l = locale === "zh" ? 0 : 1;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState(4);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [exportNotice, setExportNotice] = useState(false);
  const clock = useRef(0);
  const frame = useMemo(() => getLiveFrame(elapsed), [elapsed]);
  const windowTime = Math.floor(elapsed / 500) * 500;
  const analysis = useMemo(
    () => analyzeLiveSignal(windowTime, selected),
    [windowTime, selected],
  );
  const events = useMemo(
    () =>
      getLiveEvents(elapsed).filter(
        (event) => !skipped.includes(Math.floor(event.time / LIVE_TRIAL_MS)),
      ),
    [elapsed, skipped],
  );
  const completeSkipped = skipped.filter((trial) => trial < frame.completed);
  const completed = frame.completed - completeSkipped.length;
  const correct =
    Math.round((liveAccuracy(frame.completed) ?? 0) * frame.completed) -
    completeSkipped.filter((trial) => liveOutcome(trial).correct).length;

  useEffect(() => {
    if (!running) return;
    let raf = 0,
      last = performance.now(),
      lastCommit = last;
    const tick = (now: number) => {
      // Inactive tabs do not fast-forward the experiment on return.
      const delta = document.hidden ? 0 : Math.min(100, now - last);
      last = now;
      clock.current += delta * speed;
      if (now - lastCommit > (reducedMotion ? 220 : 100)) {
        setElapsed(clock.current);
        lastCommit = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speed, reducedMotion]);

  useEffect(() => {
    if (!exportNotice) return;
    const timer = setTimeout(() => setExportNotice(false), 2600);
    return () => clearTimeout(timer);
  }, [exportNotice]);

  const nextTrial = () => {
    const current = getLiveFrame(clock.current);
    if (current.phase < 5)
      setSkipped((items) => [...items, current.trialIndex]);
    clock.current = (current.trialIndex + 1) * LIVE_TRIAL_MS;
    setElapsed(clock.current);
  };
  const restart = () => {
    clock.current = 0;
    setElapsed(0);
    setSkipped([]);
  };
  const exportWindow = () => {
    const current = getLiveFrame(clock.current);
    const data = {
      schema: "cortex-live-1.0",
      provenance: "synthetic",
      participant: "S-017",
      displaySampleRateHz: 160,
      note: "Browser-generated demonstration; no participant data, device or model inference. Load, confidence and alignment are illustrative process variables.",
      frame: current,
      skippedTrials: skipped,
      analysis: analyzeLiveSignal(clock.current, selected),
      events: getLiveEvents(clock.current).filter(
        (event) => !skipped.includes(Math.floor(event.time / LIVE_TRIAL_MS)),
      ),
      eeg: liveElectrodes.map((electrode, channel) => ({
        channel: electrode.name,
        unit: "microvolt",
        startSeconds: clock.current / 1000 - 1,
        samples: Array.from({ length: 160 }, (_, index) =>
          sampleLiveEEG(channel, clock.current / 1000 - 1 + index / 160),
        ),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cortex-S017-trial-${current.trialIndex + 1}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportNotice(true);
  };

  return (
    <section
      className="cx-lab"
      data-ready={ready}
      data-playing={running}
      aria-label={t(
        "CORTEX 自动认知实验监测台",
        "CORTEX autonomous cognition observatory",
      )}
    >
      <div className="cx-session-bar">
        <div className="cx-lab-title">
          <p>
            <span className="cx-status-dot" />
            {t("人脑—AI 认知实验", "HUMAN–AI COGNITION OBSERVATORY")}
          </p>
          <h1>{t("看见思考发生的过程", "Watch cognition unfold")}</h1>
        </div>
        <div className="cx-session-readouts">
          <div>
            <span>SESSION</span>
            <strong>{formatLiveTime(elapsed)}</strong>
          </div>
          <div>
            <span>{t("完成试次", "COMPLETED")}</span>
            <strong>
              {String(completed).padStart(2, "0")}
              <small> / {t("连续运行", "continuous")}</small>
            </strong>
          </div>
          <div>
            <span>{t("正确率", "ACCURACY")}</span>
            <strong>
              {completed ? `${Math.round((correct / completed) * 100)}%` : "—"}
            </strong>
          </div>
          <div className="cx-readout-load">
            <span>{t("任务负荷 · 示意", "TASK LOAD · CONCEPT")}</span>
            <strong>
              {Math.round(frame.load * 100)}
              <small> / 100</small>
            </strong>
          </div>
        </div>
        <fieldset className="cx-transport" disabled={!ready}>
          <select
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            aria-label={t("自动播放速度", "Autoplay speed")}
          >
            <option value="1">1×</option>
            <option value="1.5">1.5×</option>
            <option value="2">2×</option>
          </select>
          <button
            onClick={() => {
              if (running) setElapsed(clock.current);
              setRunning((value) => !value);
            }}
            className="cx-play-button"
            aria-pressed={running}
          >
            {running ? <Pause size={13} /> : <Play size={13} />}
            {running ? t("暂停", "Pause") : t("继续", "Resume")}
          </button>
          <button
            onClick={nextTrial}
            title={t("跳过当前题，进入下一题", "Skip this trial and advance")}
            aria-label={t("下一题", "Next trial")}
          >
            <SkipForward size={14} />
          </button>
          <button
            onClick={restart}
            title={t("从头播放", "Restart")}
            aria-label={t("重新开始实验", "Restart experiment")}
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={exportWindow}
            title={t("导出当前窗口", "Export current window")}
            aria-label={t("导出当前窗口", "Export current window")}
          >
            <Download size={14} />
          </button>
        </fieldset>
      </div>

      <div className="cx-workspace">
        <LiveEEG
          clock={clock}
          selected={selected}
          onSelect={setSelected}
          playing={running}
        />
        <LiveTask frame={frame} />
        <LiveAnalytics
          frame={frame}
          analysis={analysis}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      <div className="cx-bottom-row">
        <section className="cx-panel cx-event-panel">
          <header>
            <span>
              <Radio size={12} />
              {t("事件记录", "EVENT STREAM")}
            </span>
            <span>
              {running ? t("自动记录中", "RECORDING") : t("已暂停", "PAUSED")}
            </span>
          </header>
          <div
            className="cx-event-scroll"
            tabIndex={0}
            aria-label={t(
              "滚动查看历史事件",
              "Scroll to inspect previous events",
            )}
          >
            {events.map((event) => (
              <div key={event.id}>
                <time>
                  {formatLiveTime(event.time)}.
                  {String(event.time % 1000).padStart(3, "0")}
                </time>
                <i className={event.phase === 5 ? "is-feedback" : ""} />
                <span>{event.text[l]}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="cx-panel cx-trend-panel">
          <header>
            <span>
              <AudioLines size={12} />
              {t("过程轨迹", "PROCESS TRAJECTORY")}
            </span>
            <div>
              <span>
                <i />
                {t("负荷", "Load")}
              </span>
              <span>
                <i />
                {t("置信度", "Confidence")}
              </span>
              <small>20 s</small>
            </div>
          </header>
          <ActivityTrend elapsed={elapsed} />
        </section>
        <section className="cx-panel cx-live-pipeline">
          <header>
            <span>
              <GitBranch size={12} />
              {t("在线处理路径", "ONLINE PROCESSING")}
            </span>
            <span>{t("同一事件时钟", "SYNCHRONIZED")}</span>
          </header>
          <div>
            {[
              ["采样", "Sample"],
              ["分窗", "Epoch"],
              ["特征", "Features"],
              ["对齐", "Align"],
              ["决策", "Choice"],
              ["反馈", "Feedback"],
            ].map((step, index) => (
              <div
                key={index}
                className={frame.phase === index ? "is-active" : ""}
              >
                <span>{step[l]}</span>
                {index < 5 && <ChevronRight size={10} />}
              </div>
            ))}
          </div>
          <p>
            <span className="cx-status-dot" />
            {t(
              "所有面板与刺激、决策事件同步更新",
              "Signals, features and decisions share one event clock",
            )}
          </p>
        </section>
      </div>
      <div className="cx-provenance">
        <span>
          <FlaskConical size={11} />
          {t(
            "虚拟被试 · 合成 EEG / 行为轨迹 · 概念指标，不进行真实认知解码或诊断",
            "Virtual participant · synthetic EEG & behavior · illustrative metrics, not cognitive decoding or diagnosis",
          )}
        </span>
        <button onClick={() => navigate("overview")}>
          {t(
            "保留的研究概览与全部展示",
            "Research overview & all original exhibits",
          )}
          <ArrowRight size={12} />
        </button>
      </div>
      {exportNotice && (
        <div className="cx-export-notice" role="status">
          {t(
            "已导出当前信号窗口、事件与指标。",
            "Signal window, events and metrics exported.",
          )}
        </div>
      )}
      <div className="cx-sr-only" aria-live="polite">
        {t("任务电池共", "Task battery:")} {liveTasks.length}{" "}
        {t("类任务，全自动循环播放。", "tasks, automatically looping.")}
      </div>
    </section>
  );
}
