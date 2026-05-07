import { Pause, Play, RotateCcw } from 'lucide-react';
import EEGPreview from '../components/research/EEGPreview';
import { Panel } from '../components/research/Panel';
import type { EEGChannelCount, EEGFrequencyBand } from '../data/demoData';
import type { PageProps } from './types';

const channelOptions: EEGChannelCount[] = [8, 16, 32, 64];
const bandOptions: EEGFrequencyBand[] = ['Raw', 'Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'];

export default function EEGMonitorPage({
  snapshot,
  channelCount,
  eegBand,
  isRunning,
  onChannelCountChange,
  onEegBandChange,
  onConditionChange,
  onRunningChange,
  onReset
}: PageProps) {
  return (
    <div className="research-page eeg-monitor-page">
      <Panel title="双脑 EEG 实时监测控制" eyebrow="Dual-Brain EEG Monitor" className="control-strip">
        <div className="control-row">
          <div>
            <span>通道数量</span>
            <div className="segmented-control">
              {channelOptions.map((option) => (
                <button key={option} type="button" className={channelCount === option ? 'active' : ''} onClick={() => onChannelCountChange(option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span>频段滤波</span>
            <div className="segmented-control">
              {bandOptions.map((option) => (
                <button key={option} type="button" className={eegBand === option ? 'active' : ''} onClick={() => onEegBandChange(option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span>视频条件</span>
            <div className="segmented-control">
              <button type="button" className={snapshot.condition === 'real' ? 'active' : ''} onClick={() => onConditionChange('real')}>
                Real
              </button>
              <button type="button" className={snapshot.condition === 'uncertain' ? 'active' : ''} onClick={() => onConditionChange('uncertain')}>
                Uncertain
              </button>
              <button type="button" className={snapshot.condition === 'aigc' ? 'active' : ''} onClick={() => onConditionChange('aigc')}>
                AIGC
              </button>
            </div>
          </div>
          <div className="playback-actions">
            <button type="button" className="icon-action" onClick={() => onRunningChange(!isRunning)}>
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button type="button" className="icon-action" onClick={onReset}>
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </Panel>

      <EEGPreview snapshot={snapshot} channelCount={channelCount} band={eegBand} height={720} detailed />

      <Panel title="信号模拟说明" eyebrow="Simulation model" className="scientific-note">
        <p>
          基础 EEG 由 alpha、theta、beta、gamma、低频漂移和高斯噪声叠加生成。AIGC 关键事件附近会模拟 N400-like negative
          deflection、P600-like positive deflection、frontal theta burst、alpha suppression 和局部跨脑同步增强。
        </p>
      </Panel>
    </div>
  );
}
