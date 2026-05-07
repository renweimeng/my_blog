import ERPTimeFrequencyPanel from '../components/research/ERPTimeFrequencyPanel';
import { Panel } from '../components/research/Panel';
import { generateERPSeries } from '../utils/signalGenerator';
import type { PageProps } from './types';

export default function ERPTimeFrequencyPage({ snapshot }: PageProps) {
  const erp = generateERPSeries(snapshot.condition);
  const n400 = erp.filter((point) => point.time >= 320 && point.time <= 480).reduce((min, point) => Math.min(min, point.average), 0);
  const p600 = erp.filter((point) => point.time >= 560 && point.time <= 760).reduce((max, point) => Math.max(max, point.average), 0);
  const latency = erp.reduce((best, point) => (Math.abs(point.average) > Math.abs(best.average) ? point : best), erp[0]);
  const effectSize = snapshot.condition === 'real' ? 0.42 : snapshot.condition === 'uncertain' ? 0.68 : 0.92;
  const pValue = snapshot.condition === 'real' ? '0.084' : snapshot.condition === 'uncertain' ? '0.031' : '0.006';

  return (
    <div className="research-page erp-page">
      <ERPTimeFrequencyPanel condition={snapshot.condition} />
      <section className="stats-grid">
        <Panel title="ERP 统计指标" eyebrow="Demonstration statistics">
          <div className="stat-list">
            <div><span>N400 peak amplitude</span><strong>{n400.toFixed(2)} μV</strong></div>
            <div><span>P600 peak amplitude</span><strong>{p600.toFixed(2)} μV</strong></div>
            <div><span>Peak latency</span><strong>{latency.time} ms</strong></div>
            <div><span>Effect size</span><strong>{effectSize.toFixed(2)}</strong></div>
            <div><span>p-value</span><strong>{pValue}</strong></div>
          </div>
        </Panel>
        <Panel title="时频响应解释" eyebrow="Interpretation">
          <p className="explanation-text">
            AIGC 条件下，关键时间窗附近会出现 frontal theta 增强与 occipital alpha suppression；ERP 曲线表现为更强的 N400
            负波与 P600 重分析正波。所有数值均为 demo simulation。
          </p>
        </Panel>
      </section>
    </div>
  );
}
