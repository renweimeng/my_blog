import {
  BarChart3,
  BrainCircuit,
  GitBranch,
  Network,
  Radar,
  ScanSearch,
  Share2,
  Waves
} from 'lucide-react';
import type { PageKey } from '../layout/types';
import { Panel } from './Panel';

const entries: Array<{ page: PageKey; title: string; desc: string; Icon: typeof Radar }> = [
  { page: 'topomap', title: 'Dual-brain Topomap', desc: 'N400 / P600 / theta / alpha scalp map', Icon: Radar },
  { page: 'plv', title: 'PLV Connectivity', desc: 'Phase Locking Value matrix and links', Icon: Network },
  { page: 'erp', title: 'Time-Frequency Spectrogram', desc: 'Theta burst and alpha suppression', Icon: BarChart3 },
  { page: 'erp', title: 'ERP Response', desc: 'N400, P600 and AIGC - Real curves', Icon: Waves },
  { page: 'gnn', title: 'GNN Brain Graph', desc: 'Node importance and edge contribution', Icon: Share2 },
  { page: 'plv', title: 'Inter-brain Synchrony', desc: 'Dyadic synchrony stability and variance', Icon: GitBranch },
  { page: 'attention', title: 'Transformer Attention', desc: 'Video token × EEG token cross-attention', Icon: BrainCircuit },
  { page: 'detector', title: 'Hallucination Detector', desc: 'Multimodal detector head and explanation', Icon: ScanSearch }
];

interface VisualizationEntryGridProps {
  onNavigate: (page: PageKey) => void;
}

export default function VisualizationEntryGrid({ onNavigate }: VisualizationEntryGridProps) {
  return (
    <Panel title="核心可视化入口" eyebrow="Research views" className="viz-entry-card">
      <div className="viz-entry-grid">
        {entries.map(({ page, title, desc, Icon }) => (
          <button key={`${title}-${page}`} type="button" onClick={() => onNavigate(page)}>
            <Icon size={20} />
            <strong>{title}</strong>
            <span>{desc}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
