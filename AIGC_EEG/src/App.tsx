import { useEffect, useMemo, useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import type { PageKey } from './components/layout/types';
import {
  makeSnapshot
} from './data/demoData';
import { runtimeClipLibrary, withVideoDuration } from './data/videoCatalog';
import type {
  DemoCondition,
  EEGChannelCount,
  EEGFrequencyBand,
  PLVBand,
  SubjectView,
  TopomapWindow
} from './data/demoData';
import AttentionPage from './pages/AttentionPage';
import DashboardPage from './pages/DashboardPage';
import DetectorPage from './pages/DetectorPage';
import EEGMonitorPage from './pages/EEGMonitorPage';
import ERPTimeFrequencyPage from './pages/ERPTimeFrequencyPage';
import GNNPage from './pages/GNNPage';
import PLVPage from './pages/PLVPage';
import ReportPage from './pages/ReportPage';
import TimelinePage from './pages/TimelinePage';
import TopomapPage from './pages/TopomapPage';
import type { PageProps } from './pages/types';

const pageKeys: PageKey[] = ['dashboard', 'eeg', 'topomap', 'plv', 'erp', 'gnn', 'detector', 'attention', 'timeline', 'report'];

const getHashPage = (): PageKey => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  return pageKeys.includes(hash as PageKey) ? (hash as PageKey) : 'dashboard';
};

const formatDateTime = () =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>(() => getHashPage());
  const [clipId, setClipId] = useState(() => runtimeClipLibrary.find((item) => item.condition === 'aigc')?.id ?? runtimeClipLibrary[0]?.id ?? 'clip02');
  const [condition, setCondition] = useState<DemoCondition>('aigc');
  const [currentTime, setCurrentTime] = useState(35);
  const [videoDurations, setVideoDurations] = useState<Record<string, number>>({});
  const [isRunning, setIsRunning] = useState(true);
  const [nowLabel, setNowLabel] = useState(formatDateTime);
  const [channelCount, setChannelCount] = useState<EEGChannelCount>(16);
  const [eegBand, setEegBand] = useState<EEGFrequencyBand>('Raw');
  const [plvBand, setPlvBand] = useState<PLVBand>('Theta');
  const [subjectView, setSubjectView] = useState<SubjectView>('average');
  const [topomapWindow, setTopomapWindow] = useState<TopomapWindow>('N400');
  const [topomapTime, setTopomapTime] = useState(410);

  const clip = useMemo(() => {
    const found = runtimeClipLibrary.find((item) => item.id === clipId) ?? runtimeClipLibrary[0];
    return withVideoDuration(found, videoDurations[found.id]);
  }, [clipId, videoDurations]);
  const snapshot = useMemo(() => makeSnapshot(clip, currentTime, condition), [clip, condition, currentTime]);
  const latency = useMemo(() => 34 + snapshot.riskScore * 0.18 + Math.sin(currentTime / 8) * 3, [currentTime, snapshot.riskScore]);

  useEffect(() => {
    const hashListener = () => setActivePage(getHashPage());
    window.addEventListener('hashchange', hashListener);
    return () => window.removeEventListener('hashchange', hashListener);
  }, []);

  useEffect(() => {
    runtimeClipLibrary.forEach((item) => {
      if (!item.videoSrc || videoDurations[item.id]) return;
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = item.videoSrc;
      video.onloadedmetadata = () => {
        if (Number.isFinite(video.duration)) {
          setVideoDurations((previous) => ({ ...previous, [item.id]: video.duration }));
        }
      };
    });
  }, [videoDurations]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowLabel(formatDateTime()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((time) => {
        const next = time + 0.12;
        return next >= clip.duration ? 0 : next;
      });
    }, 120);
    return () => window.clearInterval(timer);
  }, [clip.duration, isRunning]);

  const navigate = (page: PageKey) => {
    window.location.hash = `/${page}`;
    setActivePage(page);
  };

  const changeCondition = (nextCondition: DemoCondition) => {
    const nextClip = runtimeClipLibrary.find((item) => item.condition === nextCondition) ?? runtimeClipLibrary[0];
    setCondition(nextCondition);
    setClipId(nextClip.id);
    setCurrentTime(Math.min(35, nextClip.duration - 1));
  };

  const changeClip = (nextClipId: string) => {
    const nextClip = runtimeClipLibrary.find((item) => item.id === nextClipId);
    if (!nextClip) return;
    setClipId(nextClip.id);
    setCondition(nextClip.condition);
    setCurrentTime(0);
  };

  const pageProps: PageProps = {
    snapshot,
    clip,
    condition,
    currentTime,
    isRunning,
    channelCount,
    eegBand,
    plvBand,
    subjectView,
    topomapWindow,
    topomapTime,
    onNavigate: navigate,
    onSeek: (time: number) => setCurrentTime(Math.max(0, Math.min(clip.duration - 1, time))),
    onConditionChange: changeCondition,
    onClipChange: changeClip,
    onChannelCountChange: setChannelCount,
    onEegBandChange: setEegBand,
    onPlvBandChange: setPlvBand,
    onSubjectViewChange: setSubjectView,
    onTopomapWindowChange: setTopomapWindow,
    onTopomapTimeChange: setTopomapTime,
    onRunningChange: setIsRunning,
    onReset: () => setCurrentTime(0)
  };

  const renderPage = () => {
    switch (activePage) {
      case 'eeg':
        return <EEGMonitorPage {...pageProps} />;
      case 'topomap':
        return <TopomapPage {...pageProps} />;
      case 'plv':
        return <PLVPage {...pageProps} />;
      case 'erp':
        return <ERPTimeFrequencyPage {...pageProps} />;
      case 'gnn':
        return <GNNPage {...pageProps} />;
      case 'detector':
        return <DetectorPage {...pageProps} />;
      case 'attention':
        return <AttentionPage {...pageProps} />;
      case 'timeline':
        return <TimelinePage {...pageProps} />;
      case 'report':
        return <ReportPage />;
      case 'dashboard':
      default:
        return <DashboardPage {...pageProps} />;
    }
  };

  return (
    <AppLayout
      activePage={activePage}
      clip={clip}
      condition={condition}
      currentTime={currentTime}
      nowLabel={nowLabel}
      latency={latency}
      isRunning={isRunning}
      onNavigate={navigate}
      onRunningChange={setIsRunning}
      onReset={() => setCurrentTime(0)}
      onConditionChange={changeCondition}
      onClipChange={changeClip}
    >
      {renderPage()}
    </AppLayout>
  );
}
