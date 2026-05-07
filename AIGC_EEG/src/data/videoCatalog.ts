import { clipLibrary, formatClock } from './demoData';
import type { ClipEvent, DemoClip, DemoCondition } from './demoData';

const videoModules = import.meta.glob('../assets/videos/**/*.{mp4,webm,mov}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>;

const titleFromFile = (fileName: string) =>
  fileName
    .replace(/\.(mp4|webm|mov)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const conditionFromPath = (path: string): DemoCondition => {
  const normalized = path.toLowerCase();
  if (normalized.includes('/aigc/') || normalized.includes('/ai/') || normalized.includes('deepfake')) return 'aigc';
  if (normalized.includes('/uncertain/') || normalized.includes('/mixed/')) return 'uncertain';
  return 'real';
};

const videoTypeFor = (condition: DemoCondition) => {
  if (condition === 'aigc') return 'AIGC 伪造视频 / Imported video';
  if (condition === 'uncertain') return '不确定 / 混合片段 / Imported video';
  return '真实视频 / Imported video';
};

const eventsFor = (condition: DemoCondition, duration: number): ClipEvent[] => {
  const safeDuration = Math.max(12, duration);
  const point = (ratio: number) => Math.min(safeDuration - 1, Math.max(1, safeDuration * ratio));
  if (condition === 'real') {
    return [
      {
        time: point(0.18),
        label: '自然眨眼',
        type: 'visual',
        neural: 'Stable visual response',
        riskImpact: 0.04,
        description: '真实视频自然眼部运动，风险保持低位。'
      },
      {
        time: point(0.42),
        label: '光照自然变化',
        type: 'visual',
        neural: 'Occipital alpha stable',
        riskImpact: 0.05,
        description: '环境光变化平滑，跨脑同步结构稳定。'
      },
      {
        time: point(0.72),
        label: '镜头切换',
        type: 'attention',
        neural: 'Diffuse attention shift',
        riskImpact: 0.06,
        description: '注意力自然转移，ERP 波动处于参考范围。'
      }
    ];
  }

  if (condition === 'uncertain') {
    return [
      {
        time: point(0.22),
        label: '轻微压缩伪影',
        type: 'visual',
        neural: 'Weak visual incongruity',
        riskImpact: 0.13,
        description: '局部压缩或转码伪影导致风险短暂上升。'
      },
      {
        time: point(0.5),
        label: '嘴型轻度滞后',
        type: 'attention',
        neural: 'Moderate N400 shift',
        riskImpact: 0.2,
        description: '视听同步略有偏差，模型保持可疑判定。'
      },
      {
        time: point(0.76),
        label: '纹理恢复正常',
        type: 'risk',
        neural: 'Risk easing',
        riskImpact: -0.08,
        description: '后续片段趋于稳定，模型不确定性上升。'
      }
    ];
  }

  return [
    {
      time: point(0.18),
      label: '眼部闪烁异常',
      type: 'visual',
      neural: 'Frontal theta burst',
      riskImpact: 0.28,
      description: '眼周纹理与眨眼节奏不一致，引发额叶 theta 增强。'
    },
    {
      time: point(0.42),
      label: '嘴型-语音不同步',
      type: 'attention',
      neural: 'N400 amplitude exceeds baseline',
      riskImpact: 0.35,
      description: '视听冲突导致 N400 负波增强，attention 聚焦嘴眼区域。'
    },
    {
      time: point(0.68),
      label: '纹理过度平滑',
      type: 'risk',
      neural: 'P600 reanalysis response',
      riskImpact: 0.3,
      description: '脸部纹理与边界过平滑，P600 重分析响应增强。'
    },
    {
      time: point(0.86),
      label: '跨脑 PLV 不稳定',
      type: 'neural',
      neural: 'Inter-brain PLV instability',
      riskImpact: 0.24,
      description: '前额-颞叶跨脑同步出现局部异常波动。'
    }
  ];
};

const importedVideoClips: DemoClip[] = Object.entries(videoModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, url], index) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1] ?? `video-${index + 1}.mp4`;
    const condition = conditionFromPath(path);
    const fallbackDuration = condition === 'aigc' ? 310 : condition === 'uncertain' ? 260 : 270;
    return {
      id: `video-${condition}-${index + 1}-${fileName.replace(/\W+/g, '-').toLowerCase()}`,
      title: `${String(index + 1).padStart(2, '0')} ${titleFromFile(fileName)}`,
      condition,
      videoType: videoTypeFor(condition),
      duration: fallbackDuration,
      events: eventsFor(condition, fallbackDuration),
      videoSrc: url,
      sourcePath: path
    };
  });

export const runtimeClipLibrary: DemoClip[] =
  importedVideoClips.length > 0
    ? importedVideoClips
    : clipLibrary;

export const withVideoDuration = (clip: DemoClip, duration?: number): DemoClip => {
  if (!duration || Number.isNaN(duration) || !Number.isFinite(duration)) return clip;
  const nextDuration = Math.max(1, duration);
  return {
    ...clip,
    duration: nextDuration,
    events: eventsFor(clip.condition, nextDuration)
  };
};

export const describeVideoFolders = () => [
  'src/assets/videos/real：放真实视频',
  'src/assets/videos/aigc：放 AIGC / deepfake / 伪造视频',
  'src/assets/videos/uncertain：放不确定或混合片段',
  `当前自动发现 ${runtimeClipLibrary.length} 个视频 clip。示例首个 clip：${runtimeClipLibrary[0]?.title ?? 'none'} · ${formatClock(runtimeClipLibrary[0]?.duration ?? 0)}`
];
