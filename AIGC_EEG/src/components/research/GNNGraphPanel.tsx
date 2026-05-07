import { Share2 } from 'lucide-react';
import type { DemoSnapshot } from '../../data/demoData';
import { conditionTone } from '../../data/demoData';
import { generateGNNGraph } from '../../utils/signalGenerator';
import { Panel } from './Panel';

interface GNNGraphPanelProps {
  snapshot: DemoSnapshot;
  compact?: boolean;
}

export default function GNNGraphPanel({ snapshot, compact = false }: GNNGraphPanelProps) {
  const graph = generateGNNGraph(snapshot.condition, snapshot.currentTime);
  const tone = conditionTone[snapshot.condition];
  const ranked = [...graph.nodes].sort((a, b) => b.importance - a.importance).slice(0, compact ? 4 : 6);
  const nodeById = Object.fromEntries(graph.nodes.map((node) => [node.id, node]));

  return (
    <Panel
      title="GNN 脑网络推理"
      eyebrow="Graph Neural Network"
      action={
        <span className="mini-label">
          <Share2 size={13} />
          Layer 2 readout
        </span>
      }
      className={compact ? 'gnn-card compact' : 'gnn-card'}
    >
      <div className="gnn-layout">
        <svg viewBox="0 0 100 100" className="gnn-svg">
          {graph.edges.map((edge) => {
            const source = nodeById[edge.source];
            const target = nodeById[edge.target];
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={edge.contribution > 0.45 ? tone : '#22d3ee'}
                strokeWidth={0.4 + edge.strength * 3}
                opacity={0.22 + edge.contribution * 0.62}
              />
            );
          })}
          {graph.nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={3 + node.importance * 5}
                fill={node.importance > 0.58 ? tone : '#22d3ee'}
                opacity="0.88"
              >
                <title>{`${node.label} | value ${node.value.toFixed(2)} | importance ${node.importance.toFixed(2)} | contribution ${node.contribution.toFixed(2)}`}</title>
              </circle>
              {!compact && (
                <text x={node.x + 4} y={node.y + 1.5} className="gnn-label">
                  {node.label}
                </text>
              )}
            </g>
          ))}
        </svg>
        <div className="ranking-list">
          {ranked.map((node, index) => (
            <div key={node.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{node.label}</strong>
              <i style={{ width: `${node.importance * 100}%`, background: `linear-gradient(90deg, #22d3ee, ${tone})` }} />
              <em>{node.importance.toFixed(2)}</em>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
