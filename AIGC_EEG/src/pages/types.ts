import type {
  DemoClip,
  DemoCondition,
  DemoSnapshot,
  EEGChannelCount,
  EEGFrequencyBand,
  PLVBand,
  SubjectView,
  TopomapWindow
} from '../data/demoData';
import type { PageKey } from '../components/layout/types';

export interface PageProps {
  snapshot: DemoSnapshot;
  clip: DemoClip;
  condition: DemoCondition;
  currentTime: number;
  isRunning: boolean;
  channelCount: EEGChannelCount;
  eegBand: EEGFrequencyBand;
  plvBand: PLVBand;
  subjectView: SubjectView;
  topomapWindow: TopomapWindow;
  topomapTime: number;
  onNavigate: (page: PageKey) => void;
  onSeek: (time: number) => void;
  onConditionChange: (condition: DemoCondition) => void;
  onClipChange: (clipId: string) => void;
  onChannelCountChange: (count: EEGChannelCount) => void;
  onEegBandChange: (band: EEGFrequencyBand) => void;
  onPlvBandChange: (band: PLVBand) => void;
  onSubjectViewChange: (view: SubjectView) => void;
  onTopomapWindowChange: (windowName: TopomapWindow) => void;
  onTopomapTimeChange: (time: number) => void;
  onRunningChange: (value: boolean) => void;
  onReset: () => void;
}
