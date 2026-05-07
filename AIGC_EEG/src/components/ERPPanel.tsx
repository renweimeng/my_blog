import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Waves } from 'lucide-react';
import type { EChartsOption } from 'echarts';
import type { BandPowers, ERPPoint } from '../types';
import EChart from './EChart';

interface ERPPanelProps {
  data: ERPPoint[];
  bands: BandPowers;
}

const bandLabels: Array<[keyof BandPowers, string, string]> = [
  ['theta', 'Theta', '#22d3ee'],
  ['alpha', 'Alpha', '#7dd3fc'],
  ['beta', 'Beta', '#a78bfa'],
  ['gamma', 'Gamma', '#fb7185']
];

export default function ERPPanel({ data, bands }: ERPPanelProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      animation: true,
      animationDurationUpdate: 260,
      grid: { left: 34, right: 12, top: 16, bottom: 24 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(5, 12, 28, 0.94)',
        borderColor: 'rgba(34, 211, 238, 0.28)',
        textStyle: { color: '#e2e8f0' }
      },
      xAxis: {
        type: 'value',
        min: -200,
        max: 800,
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }
      },
      series: [
        {
          name: '被试 A',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#22d3ee', width: 2 },
          data: data.map((point) => [point.time, point.subjectA]),
          markArea: {
            silent: true,
            itemStyle: { color: 'rgba(34, 211, 238, 0.08)' },
            data: [
              [
                { name: 'N400', xAxis: 300 },
                { xAxis: 500 }
              ],
              [
                { name: 'P600', xAxis: 500, itemStyle: { color: 'rgba(167, 139, 250, 0.08)' } },
                { xAxis: 800 }
              ]
            ]
          }
        },
        {
          name: '被试 B',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#a78bfa', width: 2 },
          data: data.map((point) => [point.time, point.subjectB])
        },
        {
          name: '双被试均值',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#f59e0b', width: 2.4 },
          data: data.map((point) => [point.time, point.dyadicAverage])
        }
      ]
    }),
    [data]
  );

  return (
    <motion.section
      className="panel-card p-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.14 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="panel-title">
          <Waves size={16} />
          视觉诱发 ERP / 频段响应
        </div>
        <div className="text-[11px] text-slate-400">-200 ms 至 800 ms</div>
      </div>

      <EChart option={option} className="h-[184px] w-full" />

      <div className="mt-2 grid grid-cols-4 gap-2">
        {bandLabels.map(([key, label, color]) => (
          <div key={key} className="band-cell">
            <div className="mb-1 flex items-center justify-between">
              <span>{label}</span>
              <strong>{Math.round(bands[key])}</strong>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(8, Math.min(100, bands[key]))}%`,
                  background: `linear-gradient(90deg, ${color}66, ${color})`,
                  boxShadow: `0 0 12px ${color}66`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
