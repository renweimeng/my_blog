import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import type { TelemetrySnapshot } from '../types';
import { plvColor } from '../lib/dataGenerator';

interface PLVHeatmapPanelProps {
  telemetry: TelemetrySnapshot;
}

const regions = ['Fp', 'F', 'C', 'P', 'O', 'T', 'FC', 'CP'];

const BrainLink = ({ value, index }: { value: number; index: number }) => {
  const y = 24 + index * 13;
  return (
    <line
      x1="54"
      y1={y}
      x2="126"
      y2={92 - index * 10}
      stroke={plvColor(value)}
      strokeWidth={1 + value * 2.6}
      opacity={0.35 + value * 0.58}
    />
  );
};

export default function PLVHeatmapPanel({ telemetry }: PLVHeatmapPanelProps) {
  const matrix = telemetry.plvMatrix;

  return (
    <motion.section
      className="panel-card min-h-0 p-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.18 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="panel-title">
          <Network size={16} />
          脑际同步 / 鉴伪一致性
        </div>
        <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[11px] text-cyan-100">
          8 区域
        </span>
      </div>

      <div className="grid grid-cols-[1fr_142px] gap-3">
        <div className="plv-grid">
          {matrix.flatMap((row, rowIndex) =>
            row.map((value, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="plv-cell"
                title={`${regions[rowIndex]}-${regions[colIndex]} ${value.toFixed(2)}`}
                style={{
                  backgroundColor: plvColor(value),
                  boxShadow: `0 0 ${value * 16}px ${plvColor(value)}`
                }}
              >
                <span>{value.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <svg viewBox="0 0 180 118" className="h-[106px] w-full rounded-lg border border-white/10 bg-black/16">
            <ellipse cx="42" cy="58" rx="28" ry="40" fill="rgba(34, 211, 238, 0.06)" stroke="rgba(34, 211, 238, 0.38)" />
            <ellipse cx="138" cy="58" rx="28" ry="40" fill="rgba(167, 139, 250, 0.06)" stroke="rgba(167, 139, 250, 0.38)" />
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <BrainLink key={index} value={matrix[index]?.[7 - index] ?? 0.5} index={index} />
            ))}
            {[24, 40, 56, 72, 88].map((y, index) => (
              <circle key={`a-${y}`} cx={34 + (index % 2) * 16} cy={y} r="2.8" fill="#22d3ee" />
            ))}
            {[24, 40, 56, 72, 88].map((y, index) => (
              <circle key={`b-${y}`} cx={130 + (index % 2) * 16} cy={y} r="2.8" fill="#a78bfa" />
            ))}
          </svg>
          <div className="space-y-1.5">
            <div className="metric-row small">
              <span>平均 PLV</span>
              <strong>{telemetry.plvAverage.toFixed(2)}</strong>
            </div>
            <div className="metric-row small">
              <span>Theta PLV</span>
              <strong>{telemetry.thetaPLV.toFixed(2)}</strong>
            </div>
            <div className="metric-row small">
              <span>Alpha PLV</span>
              <strong>{telemetry.alphaPLV.toFixed(2)}</strong>
            </div>
            <div className="metric-row small">
              <span>鉴伪一致性</span>
              <strong>{telemetry.syncStability.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
