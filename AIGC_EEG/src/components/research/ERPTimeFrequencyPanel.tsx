import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { Waves } from 'lucide-react';
import EChart from '../EChart';
import type { DemoCondition } from '../../data/demoData';
import { generateERPSeries, generateTimeFrequency } from '../../utils/signalGenerator';
import { Panel } from './Panel';

interface ERPTimeFrequencyPanelProps {
  condition: DemoCondition;
  compact?: boolean;
}

export default function ERPTimeFrequencyPanel({ condition, compact = false }: ERPTimeFrequencyPanelProps) {
  const erpData = useMemo(() => generateERPSeries(condition), [condition]);
  const tfData = useMemo(() => generateTimeFrequency(condition), [condition]);
  const tfTimes = useMemo(() => Array.from(new Set(tfData.map((item) => item[0]))), [tfData]);
  const tfFreqs = useMemo(() => Array.from(new Set(tfData.map((item) => item[1]))), [tfData]);
  const tfHeatData = useMemo(
    () =>
      tfData.map((item) => [
        tfTimes.indexOf(item[0]),
        tfFreqs.indexOf(item[1]),
        item[2]
      ]),
    [tfData, tfFreqs, tfTimes]
  );
  const erpOption = useMemo<EChartsOption>(
    () => ({
      animation: true,
      grid: { left: 38, right: 12, top: 18, bottom: 28 },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(5,12,28,0.94)', borderColor: 'rgba(34,211,238,0.25)', textStyle: { color: '#e2e8f0' } },
      legend: { top: 0, right: 8, textStyle: { color: '#94a3b8', fontSize: 10 } },
      xAxis: { type: 'value', min: -200, max: 1000, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } } },
      yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } } },
      series: [
        {
          name: 'Real condition',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#22d3ee', width: 2 },
          data: erpData.map((point) => [point.time, (point.realA + point.realB) / 2])
        },
        {
          name: condition === 'real' ? 'Current' : 'AIGC condition',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { color: condition === 'real' ? '#67e8f9' : '#f59e0b', width: 2.4 },
          data: erpData.map((point) => [point.time, point.average]),
          markArea: {
            silent: true,
            data: [
              [
                { name: 'N400', xAxis: 320, itemStyle: { color: 'rgba(34,211,238,0.08)' } },
                { xAxis: 480 }
              ],
              [
                { name: 'P600', xAxis: 560, itemStyle: { color: 'rgba(167,139,250,0.09)' } },
                { xAxis: 760 }
              ]
            ]
          }
        },
        {
          name: 'AIGC - Real',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#f85149', width: 1.8, type: 'dashed' },
          data: erpData.map((point) => [point.time, point.difference])
        }
      ]
    }),
    [condition, erpData]
  );

  const tfOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      grid: { left: 38, right: 14, top: 12, bottom: 26 },
      tooltip: { position: 'top' },
      xAxis: { type: 'category', data: tfTimes, axisLabel: { color: '#94a3b8' }, splitLine: { show: false } },
      yAxis: { type: 'category', data: tfFreqs, axisLabel: { color: '#94a3b8' }, splitLine: { show: false } },
      visualMap: {
        min: -1.6,
        max: 3.2,
        show: !compact,
        right: 0,
        top: 12,
        calculable: false,
        inRange: { color: ['#1d4ed8', '#0f172a', '#22d3ee', '#f59e0b', '#f85149'] },
        textStyle: { color: '#94a3b8' }
      },
      series: [
        {
          type: 'heatmap',
          progressive: 0,
          data: tfHeatData,
          emphasis: { itemStyle: { borderColor: '#fff', borderWidth: 1 } }
        }
      ]
    }),
    [compact, tfFreqs, tfHeatData, tfTimes]
  );

  return (
    <Panel
      title="ERP 与时频分析"
      eyebrow="Event-related Potential / Time-Frequency Response"
      action={
        <span className="mini-label">
          <Waves size={13} />
          -200 ms ~ 1000 ms
        </span>
      }
      className="erp-tf-card"
    >
      <div className={compact ? 'erp-tf-grid compact' : 'erp-tf-grid'}>
        <EChart option={erpOption} className="erp-chart" />
        <EChart option={tfOption} className="tf-chart" />
      </div>
    </Panel>
  );
}
