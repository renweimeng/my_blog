import TopomapPanel from '../components/research/TopomapPanel';
import { Panel } from '../components/research/Panel';
import type { SubjectView, TopomapWindow } from '../data/demoData';
import type { PageProps } from './types';

const windows: TopomapWindow[] = ['N400', 'P600', 'Theta power', 'Alpha suppression'];
const views: Array<[SubjectView, string]> = [
  ['A', 'Subject A'],
  ['B', 'Subject B'],
  ['average', '双脑平均'],
  ['difference', 'A-B 差异']
];

export default function TopomapPage({
  snapshot,
  topomapWindow,
  subjectView,
  topomapTime,
  onTopomapWindowChange,
  onSubjectViewChange,
  onTopomapTimeChange
}: PageProps) {
  const dynamicTopomapTime = Math.round((topomapTime + snapshot.currentTime * 180) % 1000);

  return (
    <div className="research-page topomap-page">
      <Panel title="Topomap / 头皮电位分布控制" eyebrow="Scalp map interaction" className="control-strip">
        <div className="control-row">
          <div>
            <span>时间窗</span>
            <div className="segmented-control">
              {windows.map((windowName) => (
                <button key={windowName} type="button" className={topomapWindow === windowName ? 'active' : ''} onClick={() => onTopomapWindowChange(windowName)}>
                  {windowName}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span>被试视图</span>
            <div className="segmented-control">
              {views.map(([value, label]) => (
                <button key={value} type="button" className={subjectView === value ? 'active' : ''} onClick={() => onSubjectViewChange(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="range-control">
            <span>Realtime {dynamicTopomapTime} ms · base {topomapTime} ms</span>
            <input type="range" min="0" max="1000" value={topomapTime} onChange={(event) => onTopomapTimeChange(Number(event.target.value))} />
          </label>
        </div>
      </Panel>

      <section className="topomap-grid">
        <TopomapPanel condition={snapshot.condition} windowName="N400" subjectView={subjectView} timeMs={dynamicTopomapTime} title="N400 window 320-480 ms" />
        <TopomapPanel condition={snapshot.condition} windowName="P600" subjectView={subjectView} timeMs={dynamicTopomapTime} title="P600 window 560-760 ms" />
        <TopomapPanel condition={snapshot.condition} windowName="Theta power" subjectView={subjectView} timeMs={dynamicTopomapTime} title="Frontal theta power" />
        <TopomapPanel condition={snapshot.condition} windowName="Alpha suppression" subjectView={subjectView} timeMs={dynamicTopomapTime} title="Occipital alpha suppression" />
      </section>
    </div>
  );
}
