import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ListTree } from 'lucide-react';
import type { EventLogItem } from '../types';

interface EventLogPanelProps {
  logs: EventLogItem[];
}

const severityClass = {
  info: 'text-cyan-200 border-cyan-300/20',
  warning: 'text-amber-200 border-amber-300/25',
  critical: 'text-red-200 border-red-300/25'
};

export default function EventLogPanel({ logs }: EventLogPanelProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [logs]);

  return (
    <motion.section
      className="panel-card min-h-0 p-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.22 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="panel-title">
          <ListTree size={16} />
          鉴伪事件流
        </div>
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-slate-300">
          最近 {logs.length} 条
        </span>
      </div>
      <div className="event-log-scroll">
        {logs.map((log) => (
          <div key={log.id} className={`event-line ${severityClass[log.severity]}`}>
            <span className="tabular-nums text-slate-500">{log.time}</span>
            <p>{log.message}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </motion.section>
  );
}
