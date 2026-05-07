import { ScanSearch } from 'lucide-react';
import RiskScoreCard from '../components/research/RiskScoreCard';
import { Panel } from '../components/research/Panel';
import { detectorContributions } from '../utils/signalGenerator';
import type { PageProps } from './types';
import ModelArchitectureDiagram from '../components/research/ModelArchitectureDiagram';

export default function DetectorPage({ snapshot }: PageProps) {
  const contributions = detectorContributions(snapshot.condition, snapshot.clip, snapshot.currentTime);
  const highRisk = snapshot.riskScore > 60;
  const explanation = highRisk
    ? 'The detector assigns high risk because the video segment contains mouth-eye inconsistency, accompanied by increased N400 amplitude and unstable frontal-temporal inter-brain synchrony.'
    : snapshot.riskScore > 35
      ? 'The detector remains suspicious because several weak visual artifacts co-occur with moderate EEG feature shifts and uncertain attention allocation.'
      : 'The detector assigns low risk because visual artifacts are weak, ERP amplitudes remain close to baseline, and inter-brain synchrony is stable.';

  return (
    <div className="research-page detector-page">
      <section className="detector-grid">
        <Panel title="多模态融合模型示意图" eyebrow="Model architecture diagram" className="fusion-card">
          <ModelArchitectureDiagram snapshot={snapshot} />
        </Panel>
        <RiskScoreCard snapshot={snapshot} />
      </section>

      <section className="detector-detail-grid">
        <Panel title="风险来源分解" eyebrow="Contribution decomposition">
          <div className="contribution-list large">
            {contributions.map((item) => (
              <div key={item.label} className="contribution-row">
                <span>{item.label}</span>
                <div><i style={{ width: `${item.value * 100}%` }} /></div>
                <strong>{Math.round(item.value * 100)}%</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="模型解释文本" eyebrow="Detector explanation">
          <div className="detector-copy">
            <ScanSearch size={20} />
            <p>{explanation}</p>
            <small>
              Research prototype visualization only. All values are simulated for interface demonstration and do not represent validated clinical or forensic performance.
            </small>
          </div>
        </Panel>
      </section>
    </div>
  );
}
