import AttentionPanel from '../components/research/AttentionPanel';
import { Panel } from '../components/research/Panel';
import { generateAttentionWeights } from '../utils/signalGenerator';
import type { PageProps } from './types';

export default function AttentionPage({ snapshot }: PageProps) {
  const weights = generateAttentionWeights(snapshot.condition);
  const sorted = [...weights].sort((a, b) => b.weight - a.weight).slice(0, 6);

  return (
    <div className="research-page attention-page">
      <AttentionPanel condition={snapshot.condition} />
      <section className="attention-detail-grid">
        <Panel title="Frame / token attention timeline" eyebrow="Top token weights">
          {sorted.map((item, index) => (
            <div key={item.token} className="rank-row">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.token}</strong>
              <i style={{ width: `${item.weight * 100}%` }} />
              <em>{item.weight.toFixed(2)}</em>
            </div>
          ))}
        </Panel>
        <Panel title="Cross-modal interpretation" eyebrow="Video tokens × EEG tokens">
          <p className="explanation-text">
            AIGC 条件下，attention 更集中到 mouth、eye、face boundary 与 audio-visual sync；EEG token 中 N400、P600、PLV
            instability 权重上升。真实视频下 attention 分布更均匀，风险 token 权重较低。
          </p>
        </Panel>
      </section>
    </div>
  );
}
