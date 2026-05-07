import { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  };

  const Icon = isFullscreen ? Minimize2 : Maximize2;

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm text-cyan-100 transition hover:border-cyan-200/70 hover:bg-cyan-300/16"
      title={isFullscreen ? '退出全屏' : '全屏监测'}
    >
      <Icon size={16} />
      <span>{isFullscreen ? '退出全屏' : '全屏监测'}</span>
    </button>
  );
}
