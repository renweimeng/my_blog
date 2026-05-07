import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { TelemetrySnapshot } from '../types';
import { colorForRisk } from '../lib/dataGenerator';

interface RiskGaugePanelProps {
  telemetry: TelemetrySnapshot;
}

const useAnimatedNumber = (value: number, duration = 380) => {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (value - from) * eased;
      setDisplay(next);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        fromRef.current = value;
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [duration, value]);

  return display;
};

const MetricRow = ({ label, value, suffix = '' }: { label: string; value: string | number; suffix?: string }) => (
  <div className="metric-row">
    <span>{label}</span>
    <strong>
      {value}
      {suffix}
    </strong>
  </div>
);

export default function RiskGaugePanel({ telemetry }: RiskGaugePanelProps) {
  const animatedRisk = useAnimatedNumber(telemetry.answerRisk);
  const riskColor = colorForRisk(animatedRisk / 100);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(100, Math.max(0, animatedRisk)) / 100) * circumference;
  const statusLabel = useMemo(() => {
    if (animatedRisk < 30) return '真实倾向';
    if (animatedRisk < 65) return '待复核';
    return '疑似 AIGC';
  }, [animatedRisk]);

  return (
    <motion.section
      className={`panel-card p-3 ${telemetry.answerRisk > 68 ? 'risk-breathe' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="panel-title">
          {animatedRisk > 65 ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
          实时风险分数
        </div>
        <span
          className="rounded-lg border px-2 py-1 text-xs font-semibold"
          style={{
            borderColor: `${riskColor}55`,
            color: riskColor,
            backgroundColor: `${riskColor}14`
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-[156px_1fr] items-center gap-3">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 150 150" className="h-full w-full rotate-[-90deg]">
            <circle cx="75" cy="75" r={radius} stroke="rgba(148, 163, 184, 0.16)" strokeWidth="12" fill="none" />
            <motion.circle
              cx="75"
              cy="75"
              r={radius}
              stroke={riskColor}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ type: 'spring', stiffness: 95, damping: 22 }}
              style={{ filter: `drop-shadow(0 0 10px ${riskColor}88)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <strong className="text-4xl font-semibold tabular-nums text-white">{Math.round(animatedRisk)}</strong>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <MetricRow label="帧级伪造风险" value={telemetry.tokenRisk.toFixed(2)} />
          <MetricRow label="片段累计风险" value={telemetry.prefixRisk.toFixed(2)} />
          <MetricRow label="脑电-视觉冲突" value={telemetry.syncDropIndex.toFixed(2)} />
          <MetricRow label="N400 违和响应" value={telemetry.n400Amplitude.toFixed(1)} suffix=" μV" />
          <MetricRow label="P600 重分析强度" value={telemetry.p600Intensity.toFixed(1)} suffix=" μV" />
        </div>
      </div>
    </motion.section>
  );
}
