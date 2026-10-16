"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Activity, Crosshair } from "lucide-react";
import {
  liveElectrodes,
  liveStages,
  liveResponseAt,
  LIVE_TRIAL_MS,
  sampleLiveEEG,
} from "@/lib/cortex-loop/liveSimulation";
import { useCortex } from "./CortexContext";

const SAMPLE_RATE = 160;
const WINDOW_SECONDS = 6;
const CAPACITY = SAMPLE_RATE * (WINDOW_SECONDS + 1);
const slot = (index: number) => ((index % CAPACITY) + CAPACITY) % CAPACITY;

export function LiveEEG({
  clock,
  selected,
  onSelect,
  playing,
}: {
  clock: RefObject<number>;
  selected: number;
  onSelect: (index: number) => void;
  playing: boolean;
}) {
  const { t, reducedMotion } = useCortex();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(32);
  const [gain, setGain] = useState(1);
  const [hover, setHover] = useState<{
    channel: string;
    value: number;
    time: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const buffers = Array.from(
      { length: 32 },
      () => new Float32Array(CAPACITY),
    );
    let lastSample =
      Math.floor((clock.current / 1000) * SAMPLE_RATE) - CAPACITY;
    let raf = 0,
      lastDraw = -1000,
      drawnTime = -1,
      drawnWidth = -1,
      drawnHeight = -1;

    const draw = (stamp: number) => {
      raf = requestAnimationFrame(draw);
      if (stamp - lastDraw < (reducedMotion ? 90 : 33)) return;
      const width = canvas.clientWidth,
        height = canvas.clientHeight;
      if (width < 1 || height < 1) return;
      const elapsed = clock.current;
      if (
        elapsed === drawnTime &&
        width === drawnWidth &&
        height === drawnHeight
      )
        return;
      lastDraw = stamp;
      drawnTime = elapsed;
      drawnWidth = width;
      drawnHeight = height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const physicalWidth = Math.round(width * ratio),
        physicalHeight = Math.round(height * ratio);
      if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const now = elapsed / 1000;
      const latest = Math.floor(now * SAMPLE_RATE);
      if (latest < lastSample || latest - lastSample >= CAPACITY)
        lastSample = latest - CAPACITY;
      // A persistent ring buffer keeps past samples unchanged while new data arrive.
      for (let sample = lastSample + 1; sample <= latest; sample++) {
        for (let channel = 0; channel < 32; channel++)
          buffers[channel][slot(sample)] = sampleLiveEEG(
            channel,
            sample / SAMPLE_RATE,
          );
      }
      lastSample = latest;

      const left = 43,
        right = width - 15,
        top = 22,
        bottom = height - 23;
      const rowHeight = (bottom - top) / count;
      const from = now - WINDOW_SECONDS;
      const xAt = (time: number) =>
        left + ((time - from) / WINDOW_SECONDS) * (right - left);
      const indices =
        count === 32
          ? Array.from({ length: 32 }, (_, i) => i)
          : Array.from({ length: 16 }, (_, i) => i * 2);
      if (!indices.includes(selected))
        indices[Math.floor(indices.length / 2)] = selected;

      context.font = '9px "SFMono-Regular", Consolas, monospace';
      context.textBaseline = "middle";
      for (let second = Math.ceil(from); second <= now; second++) {
        const x = xAt(second);
        context.strokeStyle = "rgba(164,192,192,.08)";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x, top - 6);
        context.lineTo(x, bottom);
        context.stroke();
        context.fillStyle = "#667b82";
        context.fillText(`${second.toFixed(0)}s`, x + 3, height - 9);
      }
      for (
        let trial = Math.max(0, Math.floor((from * 1000) / LIVE_TRIAL_MS));
        trial <= Math.floor(elapsed / LIVE_TRIAL_MS);
        trial++
      ) {
        for (const phase of liveStages.slice(1)) {
          const eventTime =
            (trial * LIVE_TRIAL_MS +
              (phase.id === "respond" ? liveResponseAt(trial) : phase.start)) /
            1000;
          if (eventTime < from || eventTime > now) continue;
          const x = xAt(eventTime);
          context.strokeStyle = "rgba(219,187,136,.38)";
          context.setLineDash([3, 4]);
          context.beginPath();
          context.moveTo(x, top);
          context.lineTo(x, bottom);
          context.stroke();
          context.setLineDash([]);
          context.fillStyle = "#c2ac85";
          context.fillText(phase.code, Math.min(x + 4, right - 30), 9);
        }
      }
      indices.forEach((channel, row) => {
        const y = top + (row + 0.5) * rowHeight;
        const active = channel === selected;
        const frontal = liveElectrodes[channel].region === "frontal";
        if (active) {
          context.fillStyle = "rgba(102,221,193,.07)";
          context.fillRect(0, y - rowHeight / 2, width, rowHeight);
        }
        context.strokeStyle = "rgba(155,187,187,.05)";
        context.beginPath();
        context.moveTo(left, y);
        context.lineTo(right, y);
        context.stroke();
        context.font = `${active ? "600 " : ""}${Math.max(9, Math.min(11, rowHeight * 0.75))}px "SFMono-Regular", Consolas, monospace`;
        context.fillStyle = active ? "#a6f2d9" : "#8a9ba3";
        context.fillText(liveElectrodes[channel].name, 9, y);
        context.save();
        context.beginPath();
        context.rect(left, top - 4, right - left, bottom - top + 8);
        context.clip();
        context.beginPath();
        const firstSample = Math.ceil(from * SAMPLE_RATE);
        for (let sample = firstSample; sample <= latest; sample++) {
          const value = buffers[channel][slot(sample)];
          const pointY =
            y - Math.max(-34, Math.min(34, value * gain)) * rowHeight * 0.022;
          const x = xAt(sample / SAMPLE_RATE);
          if (sample === firstSample) context.moveTo(x, pointY);
          else context.lineTo(x, pointY);
        }
        context.strokeStyle = active
          ? "#b5f7e3"
          : frontal
            ? "rgba(113,219,199,.81)"
            : "rgba(115,176,194,.76)";
        context.lineWidth = active ? 1.3 : 0.85;
        context.stroke();
        context.restore();
      });
      const fade = context.createLinearGradient(left, 0, left + 25, 0);
      fade.addColorStop(0, "#0d171b");
      fade.addColorStop(1, "#0d171b00");
      context.fillStyle = fade;
      context.fillRect(left, top, 25, bottom - top);
      context.strokeStyle = "#9ee6cf66";
      context.beginPath();
      context.moveTo(right, top);
      context.lineTo(right, bottom);
      context.stroke();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [clock, selected, count, gain, reducedMotion]);

  return (
    <section
      className="cx-panel cx-eeg"
      aria-label={t("单被试实时脑电", "Single-participant EEG")}
    >
      <header className="cx-panel-heading">
        <div>
          <span className="cx-section-number">01</span>
          <Activity size={15} />
          <h2>{t("神经信号流", "Neural signal stream")}</h2>
        </div>
        <span className="cx-tag cx-cyan">EEG / {count} CH</span>
      </header>
      <div className="cx-subject">
        <div className="cx-subject-avatar">
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <path d="M12 34c0-6 4-9 10-9s10 3 10 9M15 16a7 7 0 1 0 14 0a7 7 0 1 0-14 0" />
            <path d="M10 15C10 7 16 3 22 3s12 4 12 12M8 19h5m18 0h5M13 8l4 4m10 0 4-4" />
          </svg>
        </div>
        <div>
          <strong>{t("被试", "Participant")} S-017</strong>
          <span>
            {t(
              "视觉认知任务 · 单人观测",
              "Visual cognition · single participant",
            )}
          </span>
        </div>
        <div className="cx-subject-state">
          <i
            className={playing ? "cx-status-dot" : "cx-status-dot is-paused"}
          />
          <span>
            {playing ? t("连续采样", "Streaming") : t("已暂停", "Paused")}
          </span>
        </div>
      </div>
      <div className="cx-eeg-config">
        <label>
          {t("导联", "Channel")}
          <select
            value={selected}
            onChange={(event) => onSelect(Number(event.target.value))}
            aria-label={t("选择脑电通道", "Select EEG channel")}
          >
            {liveElectrodes.map((electrode, i) => (
              <option value={i} key={electrode.name}>
                {electrode.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("密度", "Density")}
          <select
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            aria-label={t("通道密度", "Channel density")}
          >
            <option value="32">32 CH</option>
            <option value="16">16 CH</option>
          </select>
        </label>
        <button
          onClick={() => setGain((value) => (value === 1 ? 1.6 : 1))}
          aria-label={t("切换波形增益", "Change waveform gain")}
        >
          {t("增益", "Gain")} {gain === 1 ? "1×" : "1.6×"}
        </button>
      </div>
      <div className="cx-eeg-canvas-wrap">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t(
            "32 导联合成 EEG 波形，横轴为秒，纵向依次排列具名通道",
            "Synthetic EEG: named channels stacked vertically with time in seconds",
          )}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const row = Math.floor(
              (event.clientY - rect.top - 22) / ((rect.height - 45) / count),
            );
            if (row < 0 || row >= count || event.clientX - rect.left < 43) {
              setHover(null);
              return;
            }
            const indices =
              count === 32
                ? Array.from({ length: 32 }, (_, i) => i)
                : Array.from({ length: 16 }, (_, i) => i * 2);
            if (!indices.includes(selected))
              indices[Math.floor(indices.length / 2)] = selected;
            const channel = indices[row];
            const at =
              clock.current / 1000 -
              WINDOW_SECONDS +
              ((event.clientX - rect.left - 43) / (rect.width - 58)) *
                WINDOW_SECONDS;
            setHover({
              channel: liveElectrodes[channel].name,
              value: sampleLiveEEG(channel, at),
              time: at,
            });
          }}
          onPointerLeave={() => setHover(null)}
          onClick={() => {
            if (hover)
              onSelect(
                liveElectrodes.findIndex(
                  (electrode) => electrode.name === hover.channel,
                ),
              );
          }}
        />
        {hover && (
          <div className="cx-eeg-tooltip">
            <Crosshair size={11} />
            {hover.channel} · {hover.value.toFixed(1)} μV ·{" "}
            {hover.time.toFixed(2)} s
          </div>
        )}
      </div>
      <div className="cx-eeg-scale">
        <span>
          <i />
          {t("当前选中", "Selected")} {liveElectrodes[selected].name}
        </span>
        <span>6 s / ±35 μV</span>
      </div>
      <div className="cx-signal-footer">
        <span>{t("合成信号引擎", "Synthetic signal engine")}</span>
        <strong>1,000 Hz</strong>
        <span>{t("显示抽样", "Display rate")} 160 Hz</span>
      </div>
      <p className="cx-signal-note">
        {t(
          "不规则多频振荡、瞬态噪声与事件响应；历史采样持续保留。",
          "Irregular oscillations, transients and event responses; past samples remain stable.",
        )}
      </p>
    </section>
  );
}
