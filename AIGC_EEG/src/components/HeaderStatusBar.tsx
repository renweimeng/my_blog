import { Activity, Cpu, RadioTower, TimerReset, Wifi } from 'lucide-react';
import type { ReactNode } from 'react';
import FullscreenButton from './FullscreenButton';

interface HeaderStatusBarProps {
  currentTime: string;
  latency: number;
  currentTrial: number;
  currentFrame: number;
  totalFrames: number;
  frameLabel: string;
}

const StatusPill = ({
  icon,
  label,
  value,
  tone = 'cyan'
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: 'cyan' | 'green' | 'amber' | 'purple';
}) => {
  const toneClass = {
    cyan: 'border-cyan-300/25 bg-cyan-400/10 text-cyan-100',
    green: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100',
    amber: 'border-amber-300/25 bg-amber-400/10 text-amber-100',
    purple: 'border-violet-300/25 bg-violet-400/10 text-violet-100'
  }[tone];

  return (
    <div className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs ${toneClass}`}>
      {icon}
      <span className="text-slate-300">{label}</span>
      <strong className="font-semibold text-white">{value}</strong>
    </div>
  );
};

export default function HeaderStatusBar({
  currentTime,
  latency,
  currentTrial,
  currentFrame,
  totalFrames,
  frameLabel
}: HeaderStatusBarProps) {
  return (
    <header className="relative z-20 flex h-[76px] items-center justify-between border-b border-white/10 bg-[#07111f]/80 px-4 shadow-glass backdrop-blur-2xl">
      <div className="flex min-w-[330px] items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 shadow-cyan">
          <Activity className="text-cyan-200" size={23} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-normal text-white">AIGC二元脑机鉴伪</h1>
          <p className="mt-1 text-xs text-slate-400">视频真伪判别实时演示系统</p>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-4 xl:flex">
        <StatusPill icon={<Wifi size={14} />} label="系统状态" value="演示运行中" tone="green" />
        <StatusPill icon={<RadioTower size={14} />} label="EEG 数据流" value="被试 A / B 已连接" tone="cyan" />
        <StatusPill icon={<Cpu size={14} />} label="视频 Trigger" value="帧同步中" tone="purple" />
        <StatusPill icon={<TimerReset size={14} />} label="采样率" value="1000 Hz" tone="amber" />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 2xl:block">
          <span className="mr-3">Trial {currentTrial.toString().padStart(3, '0')}</span>
          <span className="mr-3">
            Frame {Math.min(currentFrame, totalFrames).toString().padStart(2, '0')}/{totalFrames.toString().padStart(2, '0')}
          </span>
          <span className="text-cyan-100">{frameLabel || '待同步'}</span>
        </div>
        <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100">
          延迟 {Math.round(latency)} ms
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm tabular-nums text-white">
          {currentTime}
        </div>
        <FullscreenButton />
      </div>
    </header>
  );
}
