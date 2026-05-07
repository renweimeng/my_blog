import { Network } from 'lucide-react';
import { brainRegions } from '../../data/demoData';
import type { DemoCondition, PLVBand } from '../../data/demoData';
import { generatePLVMatrix } from '../../utils/signalGenerator';
import { Panel } from './Panel';

const plvColor = (value: number) => {
  if (value < 0.4) return '#2563eb';
  if (value < 0.62) return '#22d3ee';
  if (value < 0.75) return '#f59e0b';
  return '#f85149';
};

const electrodeLayout = [
  { region: 'Frontal', label: 'Fz', x: 0, y: -52 },
  { region: 'Central', label: 'Cz', x: 0, y: -16 },
  { region: 'Temporal-L', label: 'T7', x: -34, y: -10 },
  { region: 'Temporal-R', label: 'T8', x: 34, y: -10 },
  { region: 'Parietal', label: 'Pz', x: 0, y: 22 },
  { region: 'Occipital', label: 'Oz', x: 0, y: 52 },
  { region: 'Visual', label: 'POz', x: -20, y: 42 },
  { region: 'Auditory', label: 'TP', x: 20, y: 34 }
];

interface PLVConnectivityPanelProps {
  condition: DemoCondition;
  currentTime: number;
  band: PLVBand;
  compact?: boolean;
}

export default function PLVConnectivityPanel({ condition, currentTime, band, compact = false }: PLVConnectivityPanelProps) {
  const matrix = generatePLVMatrix(condition, band, currentTime);
  const links = matrix
    .flatMap((row, rowIndex) =>
      row.map((value, colIndex) => ({ rowIndex, colIndex, value })).filter((item) => item.value > (compact ? 0.66 : 0.58))
    )
    .sort((a, b) => b.value - a.value)
    .slice(0, compact ? 12 : 22);
  const leftCenter = { x: 96, y: 118 };
  const rightCenter = { x: 304, y: 118 };
  const point = (center: { x: number; y: number }, index: number) => ({
    x: center.x + electrodeLayout[index].x,
    y: center.y + electrodeLayout[index].y
  });

  return (
    <Panel
      title="PLV / Inter-brain Synchrony"
      eyebrow="Phase Locking Value"
      action={
        <span className="mini-label">
          <Network size={13} />
          {band}
        </span>
      }
      className={compact ? 'plv-card compact' : 'plv-card'}
    >
      <div className="plv-layout">
        <svg viewBox="0 0 400 240" className="plv-network-svg">
          <defs>
            <radialGradient id="brainGlowA" cx="50%" cy="42%" r="64%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.28)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0.25)" />
            </radialGradient>
            <radialGradient id="brainGlowB" cx="50%" cy="42%" r="64%">
              <stop offset="0%" stopColor="rgba(167,139,250,0.3)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0.25)" />
            </radialGradient>
          </defs>
          <ellipse cx={leftCenter.x} cy={leftCenter.y} rx="58" ry="82" className="plv-brain-fill-a" />
          <ellipse cx={rightCenter.x} cy={rightCenter.y} rx="58" ry="82" className="plv-brain-fill-b" />
          <ellipse cx={leftCenter.x - 58} cy={leftCenter.y} rx="9" ry="24" className="plv-ear" />
          <ellipse cx={rightCenter.x + 58} cy={rightCenter.y} rx="9" ry="24" className="plv-ear" />
          <path d={`M ${leftCenter.x - 13} ${leftCenter.y - 84} L ${leftCenter.x} ${leftCenter.y - 102} L ${leftCenter.x + 13} ${leftCenter.y - 84}`} className="plv-nose" />
          <path d={`M ${rightCenter.x - 13} ${rightCenter.y - 84} L ${rightCenter.x} ${rightCenter.y - 102} L ${rightCenter.x + 13} ${rightCenter.y - 84}`} className="plv-nose" />
          {links.map((link) => {
            const p1 = point(leftCenter, link.rowIndex);
            const p2 = point(rightCenter, link.colIndex);
            return (
              <line
                key={`${link.rowIndex}-${link.colIndex}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={plvColor(link.value)}
                strokeWidth={0.55 + link.value * 3.1}
                opacity={0.18 + link.value * 0.58}
              />
            );
          })}
          {electrodeLayout.map((electrode, index) => {
            const p = point(leftCenter, index);
            const value = Math.max(...matrix[index]);
            return (
              <g key={`a-${electrode.label}`}>
                <circle cx={p.x} cy={p.y} r={3.6 + value * 2.2} fill={plvColor(value)} className="plv-electrode" />
                {!compact && <text x={p.x + 5} y={p.y + 3} className="plv-region-label">{electrode.label}</text>}
              </g>
            );
          })}
          {electrodeLayout.map((electrode, index) => {
            const p = point(rightCenter, index);
            const value = Math.max(...matrix.map((row) => row[index]));
            return (
              <g key={`b-${electrode.label}`}>
                <circle cx={p.x} cy={p.y} r={3.6 + value * 2.2} fill={plvColor(value)} className="plv-electrode" />
                {!compact && <text x={p.x + 5} y={p.y + 3} className="plv-region-label">{electrode.label}</text>}
              </g>
            );
          })}
          <text x="67" y="224" className="plv-subject-label">Subject A</text>
          <text x="275" y="224" className="plv-subject-label">Subject B</text>
        </svg>

        <div className="plv-heatmap">
          {matrix.flatMap((row, rowIndex) =>
            row.map((value, colIndex) => (
              <span
                key={`${rowIndex}-${colIndex}`}
                title={`${brainRegions[rowIndex]} → ${brainRegions[colIndex]} ${value.toFixed(2)}`}
                style={{ backgroundColor: plvColor(value), opacity: 0.36 + value * 0.58 }}
              >
                {!compact && value.toFixed(2)}
              </span>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}
