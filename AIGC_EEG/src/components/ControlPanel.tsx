import { Gauge, Pause, Play, Radio, Rows3, SlidersHorizontal } from 'lucide-react';
import type { ChannelDensity, RiskMode, ViewDensity } from '../types';
import { RISK_MODE_LABELS } from '../lib/dataGenerator';

interface ControlPanelProps {
  isRunning: boolean;
  onRunningChange: (value: boolean) => void;
  riskMode: RiskMode;
  onRiskModeChange: (mode: RiskMode) => void;
  viewDensity: ViewDensity;
  onViewDensityChange: (value: ViewDensity) => void;
  channelDensity: ChannelDensity;
  onChannelDensityChange: (value: ChannelDensity) => void;
  showSubjectA: boolean;
  showSubjectB: boolean;
  onSubjectAChange: (value: boolean) => void;
  onSubjectBChange: (value: boolean) => void;
}

const riskModes: RiskMode[] = ['stable', 'mild', 'high'];

const densityOptions: Array<[ViewDensity, string]> = [
  ['standard', '标准'],
  ['dense', '紧凑'],
  ['presentation', '演示']
];

const channelDensityOptions: Array<[ChannelDensity, string]> = [
  ['compact', '紧凑'],
  ['standard', '标准'],
  ['expanded', '扩展']
];

export default function ControlPanel({
  isRunning,
  onRunningChange,
  riskMode,
  onRiskModeChange,
  viewDensity,
  onViewDensityChange,
  channelDensity,
  onChannelDensityChange,
  showSubjectA,
  showSubjectB,
  onSubjectAChange,
  onSubjectBChange
}: ControlPanelProps) {
  return (
    <section className="panel-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="panel-title">
          <SlidersHorizontal size={16} />
          实验控制台
        </div>
        <button
          type="button"
          onClick={() => onRunningChange(!isRunning)}
          className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition ${
            isRunning
              ? 'border-amber-300/30 bg-amber-400/10 text-amber-100 hover:bg-amber-400/16'
              : 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/16'
          }`}
        >
          {isRunning ? <Pause size={15} /> : <Play size={15} />}
          {isRunning ? '暂停演示' : '继续演示'}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="control-label">
            <Gauge size={14} />
            样本模式
          </div>
          <div className="segmented">
            {riskModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onRiskModeChange(mode)}
                className={riskMode === mode ? 'active' : ''}
              >
                {RISK_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="control-label">
            <Rows3 size={14} />
            视图模式
          </div>
          <div className="segmented">
            {densityOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onViewDensityChange(value)}
                className={viewDensity === value ? 'active' : ''}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_112px] gap-3">
          <div>
            <div className="control-label">
              <Radio size={14} />
              导联显示
            </div>
            <div className="segmented compact">
              {channelDensityOptions.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChannelDensityChange(value)}
                  className={channelDensity === value ? 'active' : ''}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="control-label">被试</div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => onSubjectAChange(!showSubjectA)}
                className={`subject-toggle ${showSubjectA ? 'subject-on-a' : ''}`}
                title="Subject A"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onSubjectBChange(!showSubjectB)}
                className={`subject-toggle ${showSubjectB ? 'subject-on-b' : ''}`}
                title="Subject B"
              >
                B
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
