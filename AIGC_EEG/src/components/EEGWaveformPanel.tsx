import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { motion } from 'framer-motion';
import { Activity, Layers3 } from 'lucide-react';
import type { ChannelDensity, EegChannelConfig, RiskMode } from '../types';
import { CHANNEL_NAMES, createEegChannelConfigs, generateEegValue } from '../lib/dataGenerator';

interface EEGWaveformPanelProps {
  isRunning: boolean;
  riskMode: RiskMode;
  tokenRisk: number;
  showSubjectA: boolean;
  showSubjectB: boolean;
  channelDensity: ChannelDensity;
}

const densityAmplitude: Record<ChannelDensity, number> = {
  compact: 0.38,
  standard: 0.5,
  expanded: 0.64
};

const useCanvasSize = (ref: RefObject<HTMLCanvasElement>) => {
  const [size, setSize] = useState({ width: 0, height: 0, ratio: 1 });

  useEffect(() => {
    if (!ref.current) return undefined;
    const canvas = ref.current;
    const update = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      setSize({ width: rect.width, height: rect.height, ratio });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};

const subjectColor = {
  A: '#22d3ee',
  B: '#a78bfa'
};

export default function EEGWaveformPanel({
  isRunning,
  riskMode,
  tokenRisk,
  showSubjectA,
  showSubjectB,
  channelDensity
}: EEGWaveformPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);
  const timeRef = useRef(0);
  const configs = useMemo(() => createEegChannelConfigs(), []);
  const buffersRef = useRef<number[][]>(configs.map(() => Array.from({ length: 720 }, () => 0)));
  const size = useCanvasSize(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const drawGrid = (width: number, height: number, ratio: number, panes: Array<{ subject: 'A' | 'B'; x: number; w: number }>) => {
      context.save();
      context.scale(ratio, ratio);
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(5, 12, 28, 0.96)');
      gradient.addColorStop(0.55, 'rgba(8, 13, 35, 0.94)');
      gradient.addColorStop(1, 'rgba(10, 9, 28, 0.98)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      context.lineWidth = 1;
      for (let x = 0; x < width; x += 44) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 34; y < height; y += 18) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      panes.forEach((pane) => {
        context.fillStyle = pane.subject === 'A' ? 'rgba(34, 211, 238, 0.12)' : 'rgba(167, 139, 250, 0.12)';
        context.strokeStyle = pane.subject === 'A' ? 'rgba(34, 211, 238, 0.32)' : 'rgba(167, 139, 250, 0.32)';
        context.fillRect(pane.x, 0, pane.w, 28);
        context.strokeRect(pane.x + 0.5, 0.5, pane.w - 1, height - 1);
        context.fillStyle = '#e2e8f0';
        context.font = '600 12px Inter, sans-serif';
        context.fillText(`被试 ${pane.subject} 32 导联`, pane.x + 12, 19);
      });

      context.restore();
    };

    const drawWaveforms = (width: number, height: number, ratio: number) => {
      const activeSubjects = [
        ...(showSubjectA ? (['A'] as const) : []),
        ...(showSubjectB ? (['B'] as const) : [])
      ];
      const paneCount = Math.max(activeSubjects.length, 1);
      const panes = activeSubjects.map((subject, index) => ({
        subject,
        x: (width / paneCount) * index,
        w: width / paneCount
      }));

      drawGrid(width, height, ratio, panes);

      context.save();
      context.scale(ratio, ratio);
      context.lineJoin = 'round';
      context.lineCap = 'round';

      panes.forEach((pane) => {
        const subjectConfigs = configs.filter((config) => config.subject === pane.subject);
        const top = 34;
        const bottom = height - 12;
        const rowHeight = (bottom - top) / CHANNEL_NAMES.length;
        const amplitude = Math.max(2.2, rowHeight * densityAmplitude[channelDensity]);
        const points = buffersRef.current[subjectConfigs[0].index]?.length ?? 1;

        subjectConfigs.forEach((config, channelIndex) => {
          const yBase = top + rowHeight * channelIndex + rowHeight * 0.5;
          const buffer = buffersRef.current[config.index];
          const xStep = pane.w / Math.max(points - 1, 1);
          const color = subjectColor[pane.subject];
          const sensitive = ['F3', 'F4', 'Fz', 'P3', 'P4', 'Pz'].includes(config.name);

          context.strokeStyle = sensitive && tokenRisk > 0.62 ? 'rgba(248, 81, 73, 0.82)' : `${color}cc`;
          context.lineWidth = sensitive && tokenRisk > 0.62 ? 1.45 : 0.9;
          context.shadowColor = sensitive && tokenRisk > 0.62 ? 'rgba(248, 81, 73, 0.55)' : color;
          context.shadowBlur = sensitive && tokenRisk > 0.62 ? 10 : 3;
          context.beginPath();

          for (let i = 0; i < buffer.length; i += 1) {
            const x = pane.x + i * xStep;
            const y = yBase - buffer[i] * amplitude;
            if (i === 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }
          }
          context.stroke();
          context.shadowBlur = 0;

          if (pane.w > 430 || channelDensity !== 'compact') {
            context.fillStyle = sensitive && tokenRisk > 0.62 ? 'rgba(248, 113, 113, 0.92)' : 'rgba(203, 213, 225, 0.68)';
            context.font = channelDensity === 'compact' ? '8px Inter, sans-serif' : '9px Inter, sans-serif';
            context.fillText(config.name, pane.x + 6, yBase + 3);
          }
        });
      });

      context.restore();
    };

    const update = (timestamp: number) => {
      const width = size.width;
      const height = size.height;
      const ratio = size.ratio;

      if (width > 0 && height > 0) {
        if (isRunning && timestamp - lastUpdateRef.current > 30) {
          const deltaSeconds = Math.min((timestamp - lastUpdateRef.current) / 1000, 0.05) || 0.03;
          timeRef.current += deltaSeconds;
          lastUpdateRef.current = timestamp;

          configs.forEach((config: EegChannelConfig) => {
            const buffer = buffersRef.current[config.index];
            buffer.push(generateEegValue(config, timeRef.current, riskMode, tokenRisk));
            const targetLength = Math.max(380, Math.floor(width / Math.max(showSubjectA && showSubjectB ? 1.8 : 1.25, 1)));
            while (buffer.length > targetLength) {
              buffer.shift();
            }
          });
        }

        drawWaveforms(width, height, ratio);
      }

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [channelDensity, configs, isRunning, riskMode, showSubjectA, showSubjectB, size.height, size.ratio, size.width, tokenRisk]);

  return (
    <motion.section
      className={`panel-card relative flex h-full min-h-0 flex-col overflow-hidden p-3 ${tokenRisk > 0.68 ? 'risk-breathe' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="panel-title">
          <Activity size={16} />
          视频鉴伪实时 EEG 多通道波形
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2 py-1">
            <Layers3 size={13} />
            64 导联
          </span>
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1">5.8 s 窗口</span>
        </div>
      </div>
      <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/20">
        <canvas ref={canvasRef} className="h-full w-full" />
        <div className="pointer-events-none absolute bottom-2 left-3 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <i className="h-2 w-5 rounded-full bg-cyan-300/80" />
            被试 A
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="h-2 w-5 rounded-full bg-violet-300/80" />
            被试 B
          </span>
        </div>
      </div>
    </motion.section>
  );
}
