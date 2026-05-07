import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { DemoSnapshot, FeatureMetric } from '../../data/demoData';
import { Panel } from './Panel';

const TrendIcon = ({ metric }: { metric: FeatureMetric }) => {
  if (metric.trend === 'up') return <ArrowUpRight size={14} className="trend-up" />;
  if (metric.trend === 'down') return <ArrowDownRight size={14} className="trend-down" />;
  return <ArrowRight size={14} className="trend-stable" />;
};

const formatValue = (value: number, unit: string) => {
  if (!unit) return value.toFixed(2);
  if (unit === '%') return Math.round(value).toString();
  return value.toFixed(1);
};

interface FeatureMetricGridProps {
  snapshot: DemoSnapshot;
  compact?: boolean;
}

export default function FeatureMetricGrid({ snapshot, compact = false }: FeatureMetricGridProps) {
  const items = compact ? snapshot.features.slice(0, 8) : snapshot.features;
  return (
    <Panel title="双脑核心特征" eyebrow="Neural feature summary" className="feature-grid-card">
      <div className="feature-grid">
        {items.map((metric) => (
          <div key={metric.key} className="feature-tile">
            <div className="feature-tile-top">
              <span>{metric.label}</span>
              <TrendIcon metric={metric} />
            </div>
            <div className="feature-subjects">
              <strong>
                A {formatValue(metric.valueA, metric.unit)}
                {metric.unit}
              </strong>
              <strong>
                B {formatValue(metric.valueB, metric.unit)}
                {metric.unit}
              </strong>
            </div>
            <div className="feature-delta">
              <span>baseline {metric.baselineDelta > 0 ? '+' : ''}{Math.round(metric.baselineDelta * 100)}%</span>
              <i style={{ width: `${Math.min(100, metric.riskContribution * 100 * 4.8)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
