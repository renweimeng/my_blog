"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useCortex } from "./CortexContext";

export function SourceTag({
  kind = "simulation",
}: {
  kind?: "simulation" | "concept" | "reported" | "proposal";
}) {
  const { t } = useCortex();
  const labels = {
    simulation: t("可复现模拟", "SEEDED SIMULATION"),
    concept: t("概念可视化", "CONCEPT VISUALIZATION"),
    reported: t("论文实测结果", "PAPER-REPORTED RESULTS"),
    proposal: t("拟议研究", "RESEARCH PROPOSAL"),
  };
  return (
    <span className={`cl-source cl-source-${kind}`}>
      <span />
      {labels[kind]}
    </span>
  );
}

export function PageHeading({
  index,
  eyebrow,
  title,
  description,
  children,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="cl-page-heading">
      <div>
        <p className="cl-eyebrow">
          <span>{index}</span>
          {eyebrow}
        </p>
        <h1>{title}</h1>
        <p className="cl-lead">{description}</p>
      </div>
      <div className="cl-heading-aside">{children ?? <SourceTag />}</div>
    </header>
  );
}

export function Panel({
  title,
  eyebrow,
  children,
  className = "",
  actions,
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`cl-panel ${className}`}>
      {(title || actions) && (
        <header className="cl-panel-heading">
          <div>
            {eyebrow && <span className="cl-mono cl-muted">{eyebrow}</span>}
            <h2>{title}</h2>
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Range({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  format,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
  hint?: string;
}) {
  return (
    <label className="cl-range">
      <span>
        <span>{label}</span>
        <output>{format ? format(value) : value.toFixed(2)}</output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={
          {
            "--range": `${((value - min) / (max - min)) * 100}%`,
          } as CSSProperties
        }
      />
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="cl-segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Metric({
  label,
  value,
  suffix,
  tone = "",
  detail,
}: {
  label: string;
  value: ReactNode;
  suffix?: string;
  tone?: string;
  detail?: string;
}) {
  return (
    <div className={`cl-metric ${tone}`}>
      <span>{label}</span>
      <strong>
        {value}
        {suffix && <small>{suffix}</small>}
      </strong>
      {detail && <p>{detail}</p>}
    </div>
  );
}

export function Action({
  children,
  onClick,
  secondary = false,
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  secondary?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`cl-button ${secondary ? "cl-button-secondary" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Chart({
  series,
  labels,
  height = 200,
  min,
  max,
  xLabel,
  yLabel,
  annotation,
}: {
  series: {
    values: number[];
    color: string;
    label: string;
    dashed?: boolean;
  }[];
  labels?: string[];
  height?: number;
  min?: number;
  max?: number;
  xLabel?: string;
  yLabel?: string;
  annotation?: string;
}) {
  const all = series.flatMap((s) => s.values);
  const lo = min ?? Math.min(...all, 0);
  const hi = max ?? Math.max(...all, 1);
  const y = (v: number) =>
    18 + (1 - (v - lo) / Math.max(0.00001, hi - lo)) * (height - 53);
  return (
    <div className="cl-chart">
      <div className="cl-chart-legend">
        {series.map((s) => (
          <span key={s.label}>
            <i style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        {yLabel && <small>{yLabel}</small>}
      </div>
      <svg
        role="img"
        aria-label={series.map((s) => s.label).join(", ")}
        viewBox={`0 0 600 ${height}`}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1="42"
              y1={18 + (i * (height - 53)) / 4}
              x2="588"
              y2={18 + (i * (height - 53)) / 4}
              stroke="currentColor"
              opacity=".1"
            />
            <text x="32" y={22 + (i * (height - 53)) / 4} textAnchor="end">
              {(hi - ((hi - lo) * i) / 4).toFixed(hi > 10 ? 0 : 2)}
            </text>
          </g>
        ))}
        {series.map((s) => (
          <polyline
            key={s.label}
            points={s.values
              .map(
                (v, i) =>
                  `${42 + (i / Math.max(1, s.values.length - 1)) * 546},${y(v)}`,
              )
              .join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={s.dashed ? "5 6" : undefined}
          />
        ))}
        {(labels ?? ["0", "", "", "", "1"]).map((label, i, arr) => (
          <text
            key={i}
            x={42 + (i / Math.max(1, arr.length - 1)) * 546}
            y={height - 14}
            textAnchor={i === 0 ? "start" : "end"}
          >
            {label}
          </text>
        ))}
      </svg>
      <div className="cl-chart-caption">
        <span>{annotation}</span>
        <span>{xLabel}</span>
      </div>
    </div>
  );
}

export function Kernel({
  values,
  label,
}: {
  values: number[][];
  label?: string;
}) {
  return (
    <div className="cl-kernel-wrap">
      <div
        className="cl-kernel"
        role="img"
        aria-label={label ?? "kernel matrix"}
        style={{ gridTemplateColumns: `repeat(${values.length}, 1fr)` }}
      >
        {values.flatMap((row, i) =>
          row.map((value, j) => (
            <span
              key={`${i}-${j}`}
              style={{
                background: `hsl(${205 - value * 158} ${35 + value * 35}% ${12 + value * 56}%)`,
              }}
              title={`${i + 1}, ${j + 1}: ${value.toFixed(3)}`}
            />
          )),
        )}
      </div>
      {label && <p className="cl-mono cl-muted">{label}</p>}
    </div>
  );
}

export function Playback({
  playing,
  onPlay,
  onStep,
  onReset,
}: {
  playing: boolean;
  onPlay: () => void;
  onStep: () => void;
  onReset: () => void;
}) {
  const { t } = useCortex();
  return (
    <div className="cl-playback">
      <button onClick={onPlay}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
        {playing ? t("暂停", "Pause") : t("播放", "Play")}
      </button>
      <button onClick={onStep}>
        <ChevronRight size={17} />
        {t("单步", "Step")}
      </button>
      <button onClick={onReset} aria-label={t("重置", "Reset")}>
        <RotateCcw size={15} />
      </button>
    </div>
  );
}

export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      className="cl-inline-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={15} />
    </a>
  );
}

export function downloadJson(filename: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
