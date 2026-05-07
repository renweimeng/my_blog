import { AudioWaveform, BrainCircuit, GitBranch, Network, ScanSearch, Share2, Video } from 'lucide-react';
import type { DemoSnapshot } from '../../data/demoData';
import { conditionTone } from '../../data/demoData';
import { detectorContributions } from '../../utils/signalGenerator';

interface ModelArchitectureDiagramProps {
  snapshot: DemoSnapshot;
}

const modules = [
  {
    id: 'video',
    title: 'Video Encoder',
    subtitle: 'artifact / mouth-eye / texture',
    Icon: Video
  },
  {
    id: 'eeg',
    title: 'EEG Encoder',
    subtitle: 'N400 / P600 / spectral',
    Icon: AudioWaveform
  },
  {
    id: 'sync',
    title: 'Synchrony Encoder',
    subtitle: 'PLV / dyadic stability',
    Icon: Network
  },
  {
    id: 'graph',
    title: 'Graph Encoder',
    subtitle: 'GNN brain embedding',
    Icon: Share2
  },
  {
    id: 'attention',
    title: 'Attention Encoder',
    subtitle: 'video × EEG tokens',
    Icon: BrainCircuit
  }
];

export default function ModelArchitectureDiagram({ snapshot }: ModelArchitectureDiagramProps) {
  const tone = conditionTone[snapshot.condition];
  const contributions = detectorContributions(snapshot.condition, snapshot.clip, snapshot.currentTime);

  return (
    <div className="model-architecture">
      <div className="architecture-inputs">
        {modules.map(({ id, title, subtitle, Icon }, index) => {
          const contribution = contributions[index]?.value ?? 0.4;
          return (
            <div key={id} className="architecture-module">
              <div>
                <Icon size={18} />
                <strong>{title}</strong>
              </div>
              <span>{subtitle}</span>
              <i style={{ width: `${contribution * 100}%`, background: `linear-gradient(90deg, #22d3ee, ${tone})` }} />
            </div>
          );
        })}
      </div>

      <div className="architecture-neck">
        {modules.map((item) => (
          <span key={item.id} />
        ))}
      </div>

      <div className="architecture-core">
        <div className="embedding-bus">
          <GitBranch size={19} />
          <strong>Shared Multimodal Embedding Bus</strong>
          <span>temporal alignment · feature normalization · uncertainty gating</span>
        </div>
        <div className="fusion-transformer">
          <BrainCircuit size={24} />
          <strong>Fusion Transformer</strong>
          <span>cross-attention over video tokens, EEG features and graph tokens</span>
        </div>
        <div className="detector-head">
          <ScanSearch size={24} />
          <strong>Detector Head</strong>
          <span>Real / AIGC / Deepfake-like / Uncertain</span>
        </div>
      </div>

      <div className="architecture-output">
        <div>
          <span>Real probability</span>
          <strong>{(1 - snapshot.riskScore / 100).toFixed(2)}</strong>
        </div>
        <div>
          <span>AIGC probability</span>
          <strong style={{ color: tone }}>{(snapshot.riskScore / 100).toFixed(2)}</strong>
        </div>
        <div>
          <span>Uncertainty</span>
          <strong>{(1 - snapshot.confidence).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}
