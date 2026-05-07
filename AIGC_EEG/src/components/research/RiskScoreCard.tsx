import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import EChart from '../EChart';
import { conditionEnglish, conditionTone, formatClock } from '../../data/demoData';
import type { DemoSnapshot } from '../../data/demoData';
import { detectorContributions } from '../../utils/signalGenerator';
import { Panel, ValuePill } from './Panel';

interface RiskScoreCardProps {
  snapshot: DemoSnapshot;
  showContributions?: boolean;
}

export default function RiskScoreCard({ snapshot, showContributions = true }: RiskScoreCardProps) {
  const tone = conditionTone[snapshot.condition];
  const risk = Math.round(snapshot.riskScore);
  const Icon = snapshot.condition === 'real' ? ShieldCheck : AlertTriangle;
  const contributions = detectorContributions(snapshot.condition, snapshot.clip, snapshot.currentTime);
  const trendOption = useMemo<EChartsOption>(
    () => ({
      animation: true,
      grid: { left: 4, right: 4, top: 8, bottom: 4 },
      xAxis: { type: 'category', show: false, data: snapshot.riskTrend.map((point) => formatClock(point.time)) },
      yAxis: { type: 'value', show: false, min: 0, max: 100 },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: { color: `${tone}1f` },
          lineStyle: { color: tone, width: 2.4 },
          data: snapshot.riskTrend.map((point) => Number(point.value.toFixed(1)))
        }
      ]
    }),
    [snapshot.riskTrend, tone]
  );

  return (
    <Panel
      title="实时风险总览"
      eyebrow="AIGC Risk Score"
      action={
        <span className="condition-badge" style={{ color: tone, borderColor: `${tone}66` }}>
          <Icon size={13} />
          {conditionEnglish[snapshot.condition]}
        </span>
      }
      className="risk-card"
    >
      <div className="risk-card-body">
        <div className="risk-number" style={{ color: tone }}>
          <strong>{risk}</strong>
          <span>/100</span>
        </div>
        <div className="risk-meta-grid">
          <ValuePill label="置信度" value={`${Math.round(snapshot.confidence * 100)}%`} tone="cyan" />
          <ValuePill label="30s trend" value={snapshot.riskTrend[snapshot.riskTrend.length - 1]?.value.toFixed(1) ?? '0.0'} tone="violet" />
          <ValuePill label="累积风险" value={snapshot.cumulativeRisk.toFixed(1)} tone={snapshot.condition === 'aigc' ? 'red' : 'amber'} />
        </div>
      </div>
      <EChart option={trendOption} className="risk-trend-chart" />
      {showContributions && (
        <div className="contribution-list">
          {contributions.map((item) => (
            <div key={item.label} className="contribution-row">
              <span>{item.label}</span>
              <div>
                <i style={{ width: `${item.value * 100}%`, background: `linear-gradient(90deg, #22d3ee, ${tone})` }} />
              </div>
              <strong>{Math.round(item.value * 100)}%</strong>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
