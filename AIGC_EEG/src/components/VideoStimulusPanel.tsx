import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Binary, Film, ScanFace, Video } from 'lucide-react';
import type { AnswerScript, RiskMode } from '../types';
import { colorForRisk } from '../lib/dataGenerator';

interface VideoStimulusPanelProps {
  script: AnswerScript;
  visibleCount: number;
  frameRisks: number[];
  currentFrameRisk: number;
  riskMode: RiskMode;
  isRunning: boolean;
}

const verdictForRisk = (risk: number) => {
  if (risk < 0.3) return { label: '真实倾向', icon: BadgeCheck };
  if (risk < 0.65) return { label: '待复核', icon: AlertTriangle };
  return { label: '疑似 AIGC', icon: AlertTriangle };
};

export default function VideoStimulusPanel({
  script,
  visibleCount,
  frameRisks,
  currentFrameRisk,
  riskMode,
  isRunning
}: VideoStimulusPanelProps) {
  const currentIndex = Math.max(0, visibleCount - 1);
  const currentCue = script.tokens[currentIndex]?.text ?? '等待刺激';
  const riskColor = colorForRisk(currentFrameRisk);
  const verdict = verdictForRisk(currentFrameRisk);
  const VerdictIcon = verdict.icon;
  const progress = Math.max(0, Math.min(100, (visibleCount / script.tokens.length) * 100));
  const highRiskCount = frameRisks.filter((risk, index) => index < visibleCount && risk > 0.62).length;

  return (
    <motion.section
      className="panel-card video-stimulus-panel flex min-h-0 flex-1 flex-col p-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="panel-title">
          <Video size={16} />
          视频刺激源
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold"
          style={{
            borderColor: `${riskColor}55`,
            backgroundColor: `${riskColor}18`,
            color: riskColor
          }}
        >
          <VerdictIcon size={12} />
          {verdict.label}
        </span>
      </div>

      <div className={`video-stage video-${script.id} ${riskMode === 'high' ? 'video-high-risk' : ''}`}>
        <div className="video-topbar">
          <span className="inline-flex items-center gap-1">
            <Film size={12} />
            Clip {String((currentIndex % 9) + 1).padStart(2, '0')}
          </span>
          <span>{isRunning ? 'LIVE' : 'HOLD'}</span>
        </div>
        <div className="face-field">
          <div className="scan-window" />
          <div className="face-silhouette">
            <span className="eye eye-left" />
            <span className="eye eye-right" />
            <span className="nose-line" />
            <span className="mouth-line" />
            <span className="mesh mesh-a" />
            <span className="mesh mesh-b" />
          </div>
          <span className="artifact-patch patch-a" />
          <span className="artifact-patch patch-b" />
          <span className="artifact-patch patch-c" />
        </div>
        <div className="video-bottombar">
          <span className="inline-flex items-center gap-1">
            <ScanFace size={12} />
            {currentCue}
          </span>
          <span className="tabular-nums">{Math.round(currentFrameRisk * 100)}%</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="video-stat">
          <span>帧级风险</span>
          <strong style={{ color: riskColor }}>{currentFrameRisk.toFixed(2)}</strong>
        </div>
        <div className="video-stat">
          <span>高风险帧</span>
          <strong>{highRiskCount}</strong>
        </div>
        <div className="video-stat">
          <span>二元输出</span>
          <strong>{currentFrameRisk > 0.5 ? '伪' : '真'}</strong>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Binary size={12} />
            {script.question}
          </span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="video-progress">
          <span style={{ width: `${progress}%`, background: `linear-gradient(90deg, #22d3ee, ${riskColor})` }} />
        </div>
      </div>

      <div className="frame-strip mt-3">
        {script.tokens.map((token, index) => {
          const isActive = index < visibleCount;
          const isCurrent = index === currentIndex;
          const frameRisk = frameRisks[index] ?? token.intrinsicRisk;
          return (
            <span
              key={`${script.id}-frame-${index}`}
              className={`frame-thumb ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
              title={token.text}
              style={{
                borderColor: isActive ? `${colorForRisk(frameRisk)}88` : 'rgba(148, 163, 184, 0.16)',
                backgroundColor: isActive ? `${colorForRisk(frameRisk)}22` : 'rgba(15, 23, 42, 0.48)'
              }}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
