import type { ReactNode } from 'react';
import type { DemoClip, DemoCondition } from '../../data/demoData';
import Sidebar from './Sidebar';
import TopStatusBar from './TopStatusBar';
import type { PageKey } from './types';

interface AppLayoutProps {
  activePage: PageKey;
  children: ReactNode;
  clip: DemoClip;
  condition: DemoCondition;
  currentTime: number;
  nowLabel: string;
  latency: number;
  isRunning: boolean;
  onNavigate: (page: PageKey) => void;
  onRunningChange: (value: boolean) => void;
  onReset: () => void;
  onConditionChange: (condition: DemoCondition) => void;
  onClipChange: (clipId: string) => void;
}

export default function AppLayout({
  activePage,
  children,
  clip,
  condition,
  currentTime,
  nowLabel,
  latency,
  isRunning,
  onNavigate,
  onRunningChange,
  onReset,
  onConditionChange,
  onClipChange
}: AppLayoutProps) {
  return (
    <div className="research-shell">
      <div className="research-grid-layer" />
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="research-workspace">
        <TopStatusBar
          clip={clip}
          condition={condition}
          currentTime={currentTime}
          nowLabel={nowLabel}
          latency={latency}
          isRunning={isRunning}
          onRunningChange={onRunningChange}
          onReset={onReset}
          onConditionChange={onConditionChange}
          onClipChange={onClipChange}
        />
        <main className="research-main">{children}</main>
      </div>
    </div>
  );
}
