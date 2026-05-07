import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import type { DemoSnapshot, EEGChannelCount, EEGFrequencyBand } from '../../data/demoData';
import { generateEEGPaths, makeSvgPath } from '../../utils/signalGenerator';
import { Panel } from './Panel';

interface EEGPreviewProps {
  snapshot: DemoSnapshot;
  channelCount?: EEGChannelCount;
  band?: EEGFrequencyBand;
  height?: number;
  detailed?: boolean;
}

export default function EEGPreview({
  snapshot,
  channelCount = 8,
  band = 'Raw',
  height = 260,
  detailed = false
}: EEGPreviewProps) {
  const signals = useMemo(
    () => generateEEGPaths(snapshot.clip, snapshot.currentTime, snapshot.condition, channelCount, band, detailed ? 320 : 220),
    [band, channelCount, detailed, snapshot.clip, snapshot.condition, snapshot.currentTime]
  );
  const channelsPerSubject = channelCount;
  const rowHeight = height / channelsPerSubject;
  const width = 900;
  const subjectWidth = detailed ? width / 2 : width;
  const subjects = detailed ? (['A', 'B'] as const) : (['A'] as const);

  return (
    <Panel
      title={detailed ? '双脑 EEG 矩阵' : 'EEG 实时信号预览'}
      eyebrow={detailed ? 'Dual-brain EEG monitor' : 'Raw signal preview'}
      action={
        <span className="mini-label">
          <Activity size={13} />
          {channelCount} ch · {band}
        </span>
      }
      className="eeg-card"
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="eeg-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="eegGrid" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(34, 211, 238, 0.04)" />
            <stop offset="1" stopColor="rgba(167, 139, 250, 0.05)" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#eegGrid)" />
        {Array.from({ length: 22 }, (_, index) => (
          <line key={`vx-${index}`} x1={(index / 21) * width} y1="0" x2={(index / 21) * width} y2={height} className="eeg-grid-line" />
        ))}
        {subjects.map((subject, subjectIndex) => (
          <g key={subject} transform={`translate(${subjectIndex * subjectWidth},0)`}>
            {detailed && (
              <>
                <rect width={subjectWidth} height={22} className={`subject-band subject-${subject.toLowerCase()}`} />
                <text x="12" y="15" className="eeg-subject-label">
                  被试 {subject}
                </text>
              </>
            )}
            {signals
              .filter((signal) => signal.subject === subject)
              .map((signal, index) => {
                const yBase = index * rowHeight + rowHeight * 0.55 + (detailed ? 12 : 0);
                const path = makeSvgPath(signal.points, subjectWidth, yBase, rowHeight * (detailed ? 0.32 : 0.26));
                return (
                  <g key={`${subject}-${signal.channel}`}>
                    <line x1="0" x2={subjectWidth} y1={yBase} y2={yBase} className="eeg-row-line" />
                    <path d={path} className={`eeg-wave subject-${subject.toLowerCase()}`} />
                    <text x="8" y={yBase - 3} className="eeg-channel-label">
                      {signal.channel}
                    </text>
                  </g>
                );
              })}
          </g>
        ))}
      </svg>
    </Panel>
  );
}
