import { conditionLabel, formatClock } from '../data/demoData';
import StimulusVideoCard from '../components/research/StimulusVideoCard';
import { Panel } from '../components/research/Panel';
import type { PageProps } from './types';
import { runtimeClipLibrary } from '../data/videoCatalog';

const trialStages = ['Baseline fixation', 'Video onset', 'Key event', 'EEG response window', 'Risk update', 'Rest interval'];

export default function TimelinePage({ snapshot, onSeek, onClipChange, isRunning }: PageProps) {
  return (
    <div className="research-page timeline-page">
      <section className="timeline-grid">
        <StimulusVideoCard snapshot={snapshot} onSeek={onSeek} isRunning={isRunning} />
        <Panel title="Session clips" eyebrow="Video stimulus design">
          <div className="clip-list">
            {runtimeClipLibrary.map((clip) => (
              <button key={clip.id} type="button" className={snapshot.clip.id === clip.id ? 'active' : ''} onClick={() => onClipChange(clip.id)}>
                <strong>{clip.title}</strong>
                <span>{conditionLabel[clip.condition]} · {formatClock(clip.duration)}</span>
              </button>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Trial timeline" eyebrow="Baseline → video → neural response → risk update" className="trial-timeline-card">
        <div className="trial-stage-track">
          {trialStages.map((stage, index) => (
            <div key={stage}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{stage}</strong>
            </div>
          ))}
        </div>
        <div className="wide-event-track">
          {snapshot.clip.events.map((event) => (
            <button key={event.time} type="button" style={{ left: `${(event.time / snapshot.clip.duration) * 100}%` }} onClick={() => onSeek(event.time)}>
              <i />
              <span>{formatClock(event.time)}</span>
              <strong>{event.label}</strong>
              <small>{event.neural}</small>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
