import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { GitBranch } from 'lucide-react';

const nodes = [
  '视频片段加载',
  '关键帧 Trigger 同步',
  'EEG 伪迹抑制',
  'ERP/PSD/PLV 提取',
  '帧级 AIGC 线索建模',
  '脑电-视频融合',
  '二元真伪判别',
  '实时风险分数'
];

export default function PipelinePanel() {
  return (
    <motion.section
      className="panel-card min-h-0 p-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.26 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="panel-title">
          <GitBranch size={16} />
          视频鉴伪处理流水线
        </div>
        <span className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-100">
          Demo 模拟
        </span>
      </div>

      <div className="pipeline-track">
        {nodes.map((node, index) => (
          <div className="pipeline-node" key={node} style={{ '--i': index } as CSSProperties}>
            <span className="node-index">{String(index + 1).padStart(2, '0')}</span>
            <strong>{node}</strong>
            <i />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
