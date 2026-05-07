import AttentionPanel from '../components/research/AttentionPanel';
import EEGPreview from '../components/research/EEGPreview';
import ERPTimeFrequencyPanel from '../components/research/ERPTimeFrequencyPanel';
import EventStream from '../components/research/EventStream';
import FeatureMetricGrid from '../components/research/FeatureMetricGrid';
import GNNGraphPanel from '../components/research/GNNGraphPanel';
import PLVConnectivityPanel from '../components/research/PLVConnectivityPanel';
import RiskScoreCard from '../components/research/RiskScoreCard';
import StimulusVideoCard from '../components/research/StimulusVideoCard';
import TopomapPanel from '../components/research/TopomapPanel';
import VisualizationEntryGrid from '../components/research/VisualizationEntryGrid';
import type { PageProps } from './types';

export default function DashboardPage({ snapshot, onSeek, onNavigate, isRunning }: PageProps) {
  return (
    <div className="dashboard-page research-page">
      <section className="dashboard-hero-grid">
        <StimulusVideoCard snapshot={snapshot} onSeek={onSeek} isRunning={isRunning} />
        <RiskScoreCard snapshot={snapshot} />
      </section>

      <section className="dashboard-mid-grid">
        <FeatureMetricGrid snapshot={snapshot} compact />
        <EEGPreview snapshot={snapshot} channelCount={8} band="Raw" height={220} />
      </section>

      <section className="dashboard-viz-grid">
        <TopomapPanel condition={snapshot.condition} windowName="N400" subjectView="average" timeMs={(360 + snapshot.currentTime * 180) % 1000} compact />
        <PLVConnectivityPanel condition={snapshot.condition} currentTime={snapshot.currentTime} band="Theta" compact />
        <ERPTimeFrequencyPanel condition={snapshot.condition} compact />
        <GNNGraphPanel snapshot={snapshot} compact />
        <AttentionPanel condition={snapshot.condition} compact />
        <EventStream snapshot={snapshot} />
      </section>

      <VisualizationEntryGrid onNavigate={onNavigate} />
    </div>
  );
}
