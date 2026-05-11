"use client";

import { useEffect, useRef } from "react";
import { Activity, Eye, EyeOff } from "lucide-react";
import { channels } from "./dataGenerator";
import type { ChannelDensity, MetricState, RiskMode } from "./types";

function fract(value: number) {
  return value - Math.floor(value);
}

function randomSigned(seed: number) {
  return fract(Math.sin(seed) * 43758.5453123) * 2 - 1;
}

function valueNoise(channelIndex: number, sample: number, subjectOffset: number) {
  const base = Math.floor(sample);
  const mix = sample - base;
  const smooth = mix * mix * (3 - 2 * mix);
  const seed = channelIndex * 97.13 + subjectOffset * 193.17;
  const a = randomSigned(base * 13.17 + seed);
  const b = randomSigned((base + 1) * 13.17 + seed);
  return a + (b - a) * smooth;
}

function pseudoNoise(channelIndex: number, xIndex: number, time: number, subjectOffset: number) {
  const scroll = xIndex + time * 0.095;
  return (
    valueNoise(channelIndex, scroll * 0.88, subjectOffset) * 0.72 +
    valueNoise(channelIndex + 11, scroll * 1.76, subjectOffset) * 0.38 +
    randomSigned(scroll * 5.27 + channelIndex * 31.7 + subjectOffset * 19.3) * 0.18
  );
}

function signalAt(channelIndex: number, xIndex: number, time: number, risk: number, subjectOffset: number, mode: RiskMode) {
  const frontal = channelIndex <= 3 || channelIndex === 16;
  const parietal = [6, 7, 18, 22, 23, 30, 31].includes(channelIndex);
  const localRisk = risk + (mode === "high" ? 0.22 : mode === "mild" ? 0.08 : 0);
  const scroll = xIndex + time * 0.055;
  const alpha = Math.sin(scroll * 0.19 + channelIndex * 0.31 + subjectOffset) * (0.28 + (channelIndex % 6) * 0.025);
  const thetaBoost = (frontal || parietal) ? localRisk * 0.48 : localRisk * 0.16;
  const theta = Math.sin(scroll * 0.074 + channelIndex * 0.22) * (0.24 + thetaBoost);
  const beta = Math.sin(scroll * 0.82 + channelIndex * 0.51) * (0.2 + (channelIndex % 3) * 0.035);
  const gamma = Math.sin(scroll * 1.85 + channelIndex * 0.73) * 0.1;
  const drift = Math.sin(time * 0.0008 + channelIndex * 0.37 + subjectOffset) * 0.1;
  const noise = pseudoNoise(channelIndex, xIndex, time, subjectOffset) * (0.96 + localRisk * 0.58);
  const burstCenter = 120 + ((time * 0.035 + channelIndex * 23) % 220);
  const burst = Math.exp(-Math.pow((xIndex - burstCenter) / 5.5, 2)) * (Math.sin(xIndex * 3.9) > 0 ? 1 : -1);
  const spikeGate = (frontal || parietal) ? burst * localRisk * 1.05 : burst * localRisk * 0.18;
  return alpha + theta + beta + gamma + drift + noise + spikeGate;
}

function drawPanel(
  canvas: HTMLCanvasElement,
  metrics: MetricState,
  mode: RiskMode,
  density: ChannelDensity,
  showA: boolean,
  showB: boolean,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const ratio = window.devicePixelRatio || 1;
  if (canvas.width !== Math.floor(width * ratio) || canvas.height !== Math.floor(height * ratio)) {
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const time = performance.now();
  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(8, 20, 42, 0.96)");
  gradient.addColorStop(0.55, "rgba(8, 18, 34, 0.93)");
  gradient.addColorStop(1, "rgba(18, 12, 42, 0.9)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(125, 211, 252, 0.08)";
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 58) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += 42) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  const subjects = [
    { label: "Subject A", show: showA, color: "rgba(34, 211, 238, 0.88)", glow: "rgba(34, 211, 238, 0.34)", offset: 0, start: 0 },
    { label: "Subject B", show: showB, color: "rgba(167, 139, 250, 0.88)", glow: "rgba(167, 139, 250, 0.32)", offset: 1.7, start: 32 },
  ].filter((subject) => subject.show);

  const totalRows = Math.max(1, subjects.length * channels.length);
  const marginTop = 34;
  const labelWidth = 92;
  const amplitudeScale = density === "compact" ? 0.9 : density === "expanded" ? 1.28 : 1.08;
  const rowHeight = (height - marginTop - 10) / totalRows;
  const amplitude = Math.max(5.2, rowHeight * 0.48 * amplitudeScale);
  const samples = Math.max(620, Math.floor(width / 0.9));

  let row = 0;
  subjects.forEach((subject) => {
    context.save();
    context.font = "800 12px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillStyle = subject.color;
    context.fillText(subject.label, 14, marginTop + row * rowHeight - 9);
    context.restore();

    channels.forEach((channel, channelIndex) => {
      const yCenter = marginTop + row * rowHeight + rowHeight * 0.58;
      context.strokeStyle = "rgba(255,255,255,0.055)";
      context.beginPath();
      context.moveTo(labelWidth, yCenter);
      context.lineTo(width - 10, yCenter);
      context.stroke();

      context.fillStyle = channelIndex <= 3 || [6, 7, 16, 18].includes(channelIndex) ? "rgba(165, 243, 252, 0.82)" : "rgba(203, 213, 225, 0.62)";
      context.font = `${Math.max(7, Math.min(10, rowHeight * 0.82))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context.fillText(`${subject.label.endsWith("A") ? "A" : "B"}-${channel}`, 12, yCenter + Math.max(2.4, rowHeight * 0.28));

      context.beginPath();
      for (let i = 0; i < samples; i += 1) {
        const x = labelWidth + (i / (samples - 1)) * (width - labelWidth - 18);
        const sig = signalAt(channelIndex, i, time, metrics.tokenRisk, subject.offset, mode);
        const y = yCenter - sig * amplitude;
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.shadowColor = subject.glow;
      context.shadowBlur = metrics.tokenRisk > 0.65 ? 8 : 3;
      context.strokeStyle = subject.color;
      context.lineWidth = metrics.tokenRisk > 0.68 && (channelIndex <= 3 || [6, 7, 18].includes(channelIndex)) ? 1.45 : 0.95;
      context.stroke();
      context.shadowBlur = 0;
      row += 1;
    });
  });

  const scanX = labelWidth + ((time / 14) % Math.max(1, width - labelWidth - 18));
  context.strokeStyle = "rgba(34, 211, 238, 0.26)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(scanX, 0);
  context.lineTo(scanX, height);
  context.stroke();
}

export function EEGWaveformPanel({
  paused,
  metrics,
  mode,
  density,
  showA,
  showB,
}: {
  paused: boolean;
  metrics: MetricState;
  mode: RiskMode;
  density: ChannelDensity;
  showA: boolean;
  showB: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      drawPanel(canvas, metrics, mode, density, showA, showB);
      if (!paused) frameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [paused, metrics, mode, density, showA, showB]);

  return (
    <section className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border bg-slate-950/76 shadow-[0_26px_100px_rgba(2,6,23,0.46)] backdrop-blur-2xl transition ${metrics.answerRisk > 68 ? "border-rose-300/28 shadow-rose-950/35" : "border-cyan-100/12"}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Activity className="size-4 text-cyan-300" />
            双人实时 EEG 多通道波形
          </div>
          <p className="mt-1 text-xs text-slate-400">64 导联连续刷新 · Alpha / Theta / Beta 混合振荡 · Token 锁相分析</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${showA ? "bg-cyan-300/12 text-cyan-100" : "bg-white/5 text-slate-500"}`}>
            {showA ? <Eye className="size-3" /> : <EyeOff className="size-3" />} A
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${showB ? "bg-violet-300/12 text-violet-100" : "bg-white/5 text-slate-500"}`}>
            {showB ? <Eye className="size-3" /> : <EyeOff className="size-3" />} B
          </span>
        </div>
      </div>
      <div className="min-h-[520px] flex-1 p-3">
        <canvas ref={canvasRef} className="h-full min-h-[500px] w-full rounded-2xl border border-white/10" />
      </div>
    </section>
  );
}
