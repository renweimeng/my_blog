import GNNGraphPanel from '../components/research/GNNGraphPanel';
import { Panel } from '../components/research/Panel';
import { conditionEnglish } from '../data/demoData';
import { generateGNNGraph } from '../utils/signalGenerator';
import type { PageProps } from './types';

export default function GNNPage({ snapshot }: PageProps) {
  const graph = generateGNNGraph(snapshot.condition, snapshot.currentTime);
  const nodes = [...graph.nodes].sort((a, b) => b.importance - a.importance);
  const edges = [...graph.edges].sort((a, b) => b.contribution - a.contribution).slice(0, 6);
  const aigcProbability = snapshot.riskScore / 100;

  return (
    <div className="research-page gnn-page">
      <section className="gnn-page-grid">
        <GNNGraphPanel snapshot={snapshot} />
        <Panel title="模型输出" eyebrow="Readout head">
          <div className="probability-stack">
            <div><span>Real probability</span><strong>{(1 - aigcProbability).toFixed(2)}</strong></div>
            <div><span>AIGC probability</span><strong>{aigcProbability.toFixed(2)}</strong></div>
            <div><span>Uncertainty</span><strong>{(1 - snapshot.confidence).toFixed(2)}</strong></div>
            <div><span>Decision</span><strong>{conditionEnglish[snapshot.condition]}</strong></div>
          </div>
        </Panel>
      </section>

      <section className="gnn-detail-grid">
        <Panel title="Node Importance Ranking" eyebrow="Top contributing neural nodes">
          {nodes.slice(0, 8).map((node, index) => (
            <div key={node.id} className="rank-row">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{node.label}</strong>
              <i style={{ width: `${node.importance * 100}%` }} />
              <em>{node.importance.toFixed(2)}</em>
            </div>
          ))}
        </Panel>
        <Panel title="Edge Contribution" eyebrow="Functional connectivity evidence">
          {edges.map((edge, index) => (
            <div key={`${edge.source}-${edge.target}`} className="rank-row">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{edge.source} → {edge.target}</strong>
              <i style={{ width: `${edge.contribution * 100}%` }} />
              <em>{edge.contribution.toFixed(2)}</em>
            </div>
          ))}
        </Panel>
        <Panel title="GNN Layer Visualization" eyebrow="Feature propagation">
          <div className="layer-flow">
            {['Input PLV graph', 'Layer 1 message passing', 'Layer 2 region pooling', 'Readout detector head'].map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
