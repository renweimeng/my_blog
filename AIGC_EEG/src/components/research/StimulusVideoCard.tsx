import { useEffect, useRef } from 'react';
import { AlertTriangle, BadgeCheck, Clock3, Film, ScanFace } from 'lucide-react';
import { conditionEnglish, conditionTone, formatClock } from '../../data/demoData';
import type { DemoSnapshot } from '../../data/demoData';
import { Panel } from './Panel';

interface StimulusVideoCardProps {
  snapshot: DemoSnapshot;
  onSeek: (time: number) => void;
  compact?: boolean;
  isRunning?: boolean;
}

export default function StimulusVideoCard({ snapshot, onSeek, compact = false, isRunning = true }: StimulusVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { clip, currentTime, condition, riskScore } = snapshot;
  const progress = (currentTime / clip.duration) * 100;
  const tone = conditionTone[condition];
  const VerdictIcon = condition === 'real' ? BadgeCheck : AlertTriangle;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip.videoSrc) return;
    const targetTime = video.duration ? currentTime % video.duration : currentTime;
    if (Number.isFinite(targetTime) && Math.abs(video.currentTime - targetTime) > 0.28) {
      video.currentTime = targetTime;
    }
    if (isRunning) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [clip.videoSrc, currentTime, isRunning]);

  return (
    <Panel
      title="视频刺激窗口"
      eyebrow="Video stimulus"
      action={
        <span className="condition-badge" style={{ borderColor: `${tone}66`, color: tone }}>
          <VerdictIcon size={13} />
          {conditionEnglish[condition]}
        </span>
      }
      className={compact ? 'video-card compact' : 'video-card'}
    >
      <div className={`stimulus-frame stimulus-${condition}`}>
        <div className="stimulus-chrome">
          <span>
            <Film size={13} />
            {clip.videoType}
          </span>
          <strong>{Math.round(riskScore)} / 100</strong>
        </div>
        <div className="synthetic-face-scene">
          {clip.videoSrc ? (
            <video
              ref={videoRef}
              className="stimulus-video"
              src={clip.videoSrc}
              muted
              playsInline
              loop
              preload="metadata"
            />
          ) : (
            <div className="subject-face">
              <span className="face-eye left" />
              <span className="face-eye right" />
              <span className="face-mouth" />
              <span className="face-nose" />
            </div>
          )}
          <div className="scan-box" />
          {clip.videoSrc && (
            <div className="video-analysis-overlay">
              <span>Eye ROI</span>
              <span>Mouth ROI</span>
              <span>Boundary</span>
            </div>
          )}
          <span className="artifact-ring ring-a" />
          <span className="artifact-ring ring-b" />
          <span className="artifact-ring ring-c" />
        </div>
        <div className="stimulus-footer">
          <span>
            <Clock3 size={13} />
            {formatClock(currentTime)} / {formatClock(clip.duration)}
          </span>
          <span>{snapshot.activeEvent?.label ?? 'continuous viewing'}</span>
        </div>
      </div>

      <div className="stimulus-timeline">
        <div className="timeline-bar">
          <i style={{ width: `${progress}%`, background: `linear-gradient(90deg, #22d3ee, ${tone})` }} />
          {clip.events.map((event) => (
            <button
              key={event.time}
              type="button"
              className={`event-marker ${Math.abs(event.time - currentTime) < 8 ? 'active' : ''}`}
              style={{ left: `${(event.time / clip.duration) * 100}%` }}
              onClick={() => onSeek(event.time)}
              title={`${formatClock(event.time)} ${event.label}`}
            />
          ))}
        </div>
        <div className="timeline-events">
          {clip.events.slice(0, compact ? 3 : 5).map((event) => (
            <button key={event.time} type="button" onClick={() => onSeek(event.time)}>
              <span>{formatClock(event.time)}</span>
              <strong>{event.label}</strong>
              <small>{event.neural}</small>
            </button>
          ))}
        </div>
      </div>

      {!compact && (
        <div className="event-explanation">
          <ScanFace size={15} />
          <p>{snapshot.activeEvent?.description ?? '当前片段处于连续观看窗口，系统正在模拟视频伪影、双脑 EEG 和融合模型输出。'}</p>
        </div>
      )}
    </Panel>
  );
}
