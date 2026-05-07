import PLVConnectivityPanel from '../components/research/PLVConnectivityPanel';
import { Panel } from '../components/research/Panel';
import { brainRegions } from '../data/demoData';
import type { PLVBand } from '../data/demoData';
import { generatePLVMatrix } from '../utils/signalGenerator';
import type { PageProps } from './types';

const bands: PLVBand[] = ['Theta', 'Alpha', 'Beta', 'Gamma'];

export default function PLVPage({ snapshot, plvBand, onPlvBandChange, onConditionChange }: PageProps) {
  const matrix = generatePLVMatrix(snapshot.condition, plvBand, snapshot.currentTime);
  const strongest = matrix
    .flatMap((row, rowIndex) => row.map((value, colIndex) => ({ source: brainRegions[rowIndex], target: brainRegions[colIndex], value })))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="research-page plv-page">
      <Panel title="PLV / Inter-brain Synchrony 控制" eyebrow="Cross-brain synchrony" className="control-strip">
        <div className="control-row">
          <div>
            <span>频段</span>
            <div className="segmented-control">
              {bands.map((band) => (
                <button key={band} type="button" className={plvBand === band ? 'active' : ''} onClick={() => onPlvBandChange(band)}>
                  {band}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span>条件对比</span>
            <div className="segmented-control">
              <button type="button" className={snapshot.condition === 'real' ? 'active' : ''} onClick={() => onConditionChange('real')}>
                Real
              </button>
              <button type="button" className={snapshot.condition === 'aigc' ? 'active' : ''} onClick={() => onConditionChange('aigc')}>
                AIGC
              </button>
            </div>
          </div>
        </div>
      </Panel>

      <section className="plv-page-grid">
        <PLVConnectivityPanel condition={snapshot.condition} currentTime={snapshot.currentTime} band={plvBand} />
        <Panel title="关键跨脑连接贡献" eyebrow="Top PLV links" className="ranking-panel">
          {strongest.map((link, index) => (
            <div key={`${link.source}-${link.target}`} className="rank-row">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{link.source} → {link.target}</strong>
              <i style={{ width: `${link.value * 100}%` }} />
              <em>{link.value.toFixed(2)}</em>
            </div>
          ))}
        </Panel>
      </section>
    </div>
  );
}
