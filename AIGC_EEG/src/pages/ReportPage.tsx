import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import EChart from '../components/EChart';
import { Panel } from '../components/research/Panel';
import { reportPerformanceRows } from '../utils/signalGenerator';

export default function ReportPage() {
  const performanceOption = useMemo<EChartsOption>(
    () => ({
      grid: { left: 48, right: 16, top: 36, bottom: 78 },
      legend: { top: 0, textStyle: { color: '#94a3b8' } },
      xAxis: { type: 'category', data: reportPerformanceRows.map((row) => row.model), axisLabel: { color: '#94a3b8', rotate: 28 }, axisTick: { show: false } },
      yAxis: { type: 'value', min: 0.6, max: 0.95, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } } },
      series: [
        { name: 'AUROC', type: 'bar', data: reportPerformanceRows.map((row) => row.auroc), itemStyle: { color: '#22d3ee' } },
        { name: 'F1', type: 'bar', data: reportPerformanceRows.map((row) => row.f1), itemStyle: { color: '#a78bfa' } }
      ]
    }),
    []
  );
  const metrics = [
    ['Number of dyads', '20'],
    ['Participants', '40'],
    ['Sampling rate', '1000 Hz'],
    ['EEG channels', '64'],
    ['Video clips', '24'],
    ['Mean duration', '4.8 min'],
    ['Conditions', 'Real vs AIGC']
  ];

  return (
    <div className="research-page report-page">
      <section className="report-grid">
        <Panel title="模拟实验摘要" eyebrow="Experiment summary">
          <div className="report-metric-grid">
            {metrics.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="模型性能演示图" eyebrow="Simulated performance">
          <EChart option={performanceOption} className="report-chart" />
        </Panel>
      </section>
      <Panel title="特征消融表" eyebrow="Ablation study">
        <div className="report-table">
          <div className="report-table-head">
            <span>Model</span>
            <span>Accuracy</span>
            <span>AUROC</span>
            <span>AUPRC</span>
            <span>F1</span>
            <span>ECE</span>
          </div>
          {reportPerformanceRows.map((row) => (
            <div key={row.model}>
              <strong>{row.model}</strong>
              <span>{row.accuracy.toFixed(2)}</span>
              <span>{row.auroc.toFixed(2)}</span>
              <span>{row.auprc.toFixed(2)}</span>
              <span>{row.f1.toFixed(2)}</span>
              <span>{row.ece.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Disclaimer" eyebrow="Demo simulation">
        <p className="explanation-text">
          All values are simulated for interface demonstration and do not represent validated clinical or forensic performance.
        </p>
      </Panel>
    </div>
  );
}
