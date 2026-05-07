import { useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';
import { BrainCircuit } from 'lucide-react';
import EChart from '../EChart';
import type { DemoCondition } from '../../data/demoData';
import { attentionTokens, conditionTone } from '../../data/demoData';
import { generateAttentionMatrix, generateAttentionWeights } from '../../utils/signalGenerator';
import { Panel } from './Panel';

interface AttentionPanelProps {
  condition: DemoCondition;
  compact?: boolean;
}

export default function AttentionPanel({ condition, compact = false }: AttentionPanelProps) {
  const [hoverText, setHoverText] = useState('Hover attention tokens to inspect simulated explanation.');
  const weights = generateAttentionWeights(condition);
  const matrix = generateAttentionMatrix(condition);
  const tone = conditionTone[condition];
  const option = useMemo<EChartsOption>(
    () => ({
      animation: false,
      grid: { left: compact ? 8 : 120, right: 8, top: 8, bottom: compact ? 8 : 92 },
      xAxis: {
        type: 'category',
        data: attentionTokens,
        axisLabel: { color: '#94a3b8', rotate: compact ? 0 : 45, show: !compact },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        data: attentionTokens,
        axisLabel: { color: '#94a3b8', show: !compact },
        axisTick: { show: false }
      },
      visualMap: {
        min: 0,
        max: 1,
        show: false,
        inRange: { color: ['#111827', '#1d4ed8', '#22d3ee', '#f59e0b', '#f85149'] }
      },
      series: [{ type: 'heatmap', data: matrix, itemStyle: { borderColor: 'rgba(15,23,42,0.9)', borderWidth: 1 } }]
    }),
    [compact, matrix]
  );

  return (
    <Panel
      title="Transformer Attention 可解释性"
      eyebrow="Video tokens × EEG tokens"
      action={
        <span className="mini-label">
          <BrainCircuit size={13} />
          Cross-attention
        </span>
      }
      className={compact ? 'attention-card compact' : 'attention-card'}
    >
      <div className="attention-layout">
        <div className="attention-video-grid">
          {['Eye', 'Mouth', 'Boundary', 'Lighting', 'Texture', 'A/V Sync'].map((label, index) => (
            <span key={label} style={{ borderColor: index < 3 && condition !== 'real' ? `${tone}88` : 'rgba(34,211,238,0.22)' }}>
              {label}
            </span>
          ))}
        </div>
        <EChart option={option} className="attention-heatmap" />
      </div>
      {!compact && (
        <>
          <div className="attention-token-row">
            {weights.map((item) => (
              <button key={item.token} type="button" onMouseEnter={() => setHoverText(`${item.token}: ${item.explanation}`)}>
                <span>{item.token}</span>
                <i style={{ width: `${item.weight * 100}%`, background: `linear-gradient(90deg, #22d3ee, ${tone})` }} />
                <strong>{item.weight.toFixed(2)}</strong>
              </button>
            ))}
          </div>
          <p className="attention-help">{hoverText}</p>
        </>
      )}
    </Panel>
  );
}
