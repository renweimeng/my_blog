import {
  Activity,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  FileText,
  GitBranch,
  Home,
  Network,
  Radar,
  ScanSearch,
  Share2,
  Waves
} from 'lucide-react';
import type { PageKey } from './types';

export interface NavItem {
  key: PageKey;
  label: string;
  subtitle: string;
}

const iconMap = {
  dashboard: Home,
  eeg: Activity,
  topomap: Radar,
  plv: Network,
  erp: Waves,
  gnn: Share2,
  detector: ScanSearch,
  attention: BrainCircuit,
  timeline: CalendarClock,
  report: FileText
};

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', subtitle: '主控制台' },
  { key: 'eeg', label: 'Dual-Brain EEG', subtitle: '双脑实时监测' },
  { key: 'topomap', label: 'Topomap', subtitle: '头皮电位分布' },
  { key: 'plv', label: 'PLV Synchrony', subtitle: '跨脑同步' },
  { key: 'erp', label: 'ERP / TFR', subtitle: '时频分析' },
  { key: 'gnn', label: 'GNN Graph', subtitle: '脑网络推理' },
  { key: 'detector', label: 'AIGC Detector', subtitle: '融合鉴伪模型' },
  { key: 'attention', label: 'Attention', subtitle: '可解释性' },
  { key: 'timeline', label: 'Timeline', subtitle: '视频刺激实验' },
  { key: 'report', label: 'Report', subtitle: '统计摘要' }
];

interface SidebarProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="research-sidebar">
      <div className="brand-block">
        <div className="brand-mark">
          <GitBranch size={22} />
        </div>
        <div>
          <h1>AIGC二元脑机鉴伪</h1>
          <p>Dual-brain hyperscanning demo</p>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map((item) => {
          const Icon = iconMap[item.key] ?? BarChart3;
          return (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              <Icon size={17} />
              <span>
                <strong>{item.label}</strong>
                <small>{item.subtitle}</small>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-note">
        <strong>Research prototype</strong>
        <span>All signals, model outputs and statistics are simulated for interface demonstration.</span>
      </div>
    </aside>
  );
}
