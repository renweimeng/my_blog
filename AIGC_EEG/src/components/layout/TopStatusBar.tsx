import { Pause, Play, RefreshCcw, TimerReset, Video, Wifi, Zap } from 'lucide-react';
import FullscreenButton from '../FullscreenButton';
import { conditionLabel, formatClock } from '../../data/demoData';
import type { DemoClip, DemoCondition } from '../../data/demoData';
import { runtimeClipLibrary } from '../../data/videoCatalog';

interface TopStatusBarProps {
  clip: DemoClip;
  condition: DemoCondition;
  currentTime: number;
  nowLabel: string;
  latency: number;
  isRunning: boolean;
  onRunningChange: (value: boolean) => void;
  onReset: () => void;
  onConditionChange: (condition: DemoCondition) => void;
  onClipChange: (clipId: string) => void;
}

export default function TopStatusBar({
  clip,
  condition,
  currentTime,
  nowLabel,
  latency,
  isRunning,
  onRunningChange,
  onReset,
  onConditionChange,
  onClipChange
}: TopStatusBarProps) {
  return (
    <header className="research-topbar">
      <div className="topbar-status">
        <span className="status-pill online">
          <Wifi size={14} />
          系统在线
        </span>
        <span className="status-pill">
          <TimerReset size={14} />
          1000 Hz
        </span>
        <span className="status-pill">
          <Zap size={14} />
          延迟 {Math.round(latency)} ms
        </span>
        <span className="status-pill clip-pill">
          <Video size={14} />
          {clip.title} · {formatClock(currentTime)} / {formatClock(clip.duration)}
        </span>
      </div>

      <div className="topbar-controls">
        <select value={condition} onChange={(event) => onConditionChange(event.target.value as DemoCondition)}>
          <option value="real">{conditionLabel.real}</option>
          <option value="uncertain">{conditionLabel.uncertain}</option>
          <option value="aigc">{conditionLabel.aigc}</option>
        </select>
        <select value={clip.id} onChange={(event) => onClipChange(event.target.value)}>
          {runtimeClipLibrary.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <button type="button" className="icon-action" onClick={() => onRunningChange(!isRunning)} title={isRunning ? '暂停' : '播放'}>
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button type="button" className="icon-action" onClick={onReset} title="重置时间轴">
          <RefreshCcw size={16} />
        </button>
        <span className="status-time">{nowLabel}</span>
        <FullscreenButton />
      </div>
    </header>
  );
}
