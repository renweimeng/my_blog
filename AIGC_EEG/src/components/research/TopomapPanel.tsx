import { Radar } from 'lucide-react';
import type { DemoCondition, SubjectView, TopomapWindow } from '../../data/demoData';
import { generateTopomap, heatColor } from '../../utils/signalGenerator';
import { Panel } from './Panel';

interface TopomapPanelProps {
  condition: DemoCondition;
  windowName: TopomapWindow;
  subjectView: SubjectView;
  timeMs: number;
  title?: string;
  compact?: boolean;
}

export default function TopomapPanel({ condition, windowName, subjectView, timeMs, title = 'Dual-brain Topomap', compact = false }: TopomapPanelProps) {
  const electrodes = generateTopomap(condition, windowName, subjectView, timeMs);
  const heat = electrodes.filter((item) => Math.abs(item.value) > 0.16);

  return (
    <Panel
      title={title}
      eyebrow="Scalp potential distribution"
      action={
        <span className="mini-label">
          <Radar size={13} />
          {windowName}
        </span>
      }
      className={compact ? 'topomap-card compact' : 'topomap-card'}
    >
      <svg viewBox="0 0 100 108" className="topomap-svg">
        <defs>
          <filter id="blurHeat">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <path d="M44 8 L50 0 L56 8" className="topomap-nose" />
        <ellipse cx="12" cy="54" rx="5" ry="13" className="topomap-ear" />
        <ellipse cx="88" cy="54" rx="5" ry="13" className="topomap-ear" />
        <circle cx="50" cy="54" r="43" className="topomap-head" />
        <g filter="url(#blurHeat)" opacity="0.82">
          {heat.map((electrode) => (
            <circle
              key={`heat-${electrode.name}`}
              cx={electrode.x}
              cy={electrode.y}
              r={compact ? 10 : 13}
              fill={heatColor(electrode.value)}
              opacity={Math.min(0.82, 0.28 + Math.abs(electrode.value) * 0.5)}
            />
          ))}
        </g>
        <circle cx="50" cy="54" r="43" className="topomap-head-outline" />
        {electrodes.map((electrode) => (
          <g key={electrode.name}>
            <circle cx={electrode.x} cy={electrode.y} r={compact ? 1.45 : 1.8} fill={heatColor(electrode.value)} stroke="rgba(255,255,255,0.58)" strokeWidth="0.35" />
            {!compact && (
              <text x={electrode.x + 2.3} y={electrode.y + 1.4} className="topomap-label">
                {electrode.name}
              </text>
            )}
          </g>
        ))}
      </svg>
      {!compact && (
        <div className="topomap-legend">
          <span>negative μV / suppression</span>
          <i />
          <span>positive μV / power</span>
        </div>
      )}
    </Panel>
  );
}
