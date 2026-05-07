import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles } from 'lucide-react';
import type { AnswerScript } from '../types';
import { colorForRisk } from '../lib/dataGenerator';

interface TokenStreamPanelProps {
  script: AnswerScript;
  visibleCount: number;
  tokenRisks: number[];
  currentTokenRisk: number;
}

const riskClass = (risk: number) => {
  if (risk < 0.3) return 'token-low';
  if (risk < 0.65) return 'token-mid';
  return 'token-high';
};

export default function TokenStreamPanel({
  script,
  visibleCount,
  tokenRisks,
  currentTokenRisk
}: TokenStreamPanelProps) {
  const currentIndex = Math.max(0, visibleCount - 1);
  const currentToken = script.tokens[currentIndex]?.text ?? '';
  const riskColor = colorForRisk(currentTokenRisk);

  return (
    <motion.section
      className="panel-card flex min-h-0 flex-1 flex-col p-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="panel-title">
          <BrainCircuit size={16} />
          LLM 回答流与 Token 级风险定位
        </div>
        <div
          className="rounded-lg border px-2.5 py-1 text-xs font-semibold tabular-nums"
          style={{
            borderColor: `${riskColor}55`,
            backgroundColor: `${riskColor}18`,
            color: riskColor
          }}
        >
          {currentTokenRisk.toFixed(2)}
        </div>
      </div>

      <div className="question-block">
        <span className="text-cyan-200">问题</span>
        <p>{script.question}</p>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/18">
        <div className="h-full overflow-y-auto p-3 leading-8">
          {script.tokens.slice(0, visibleCount).map((token, index) => {
            const risk = tokenRisks[index] ?? 0.1;
            const isCurrent = index === currentIndex;

            return (
              <motion.span
                key={`${script.id}-${index}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`token-chip ${riskClass(risk)} ${isCurrent ? 'token-current' : ''}`}
              >
                {token.text}
              </motion.span>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_112px] gap-3">
        <div className="timeline-track">
          {script.tokens.map((token, index) => {
            const risk = tokenRisks[index] ?? token.intrinsicRisk;
            const isActive = index < visibleCount;
            const isCurrent = index === currentIndex;
            return (
              <span
                key={`${script.id}-dot-${index}`}
                className={`timeline-dot ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                style={{
                  backgroundColor: isActive ? colorForRisk(risk) : 'rgba(148, 163, 184, 0.18)'
                }}
              />
            );
          })}
        </div>

        <div className="token-readout">
          <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles size={12} />
            当前 Token
          </div>
          <div className="truncate text-sm font-semibold text-white">{currentToken || '待同步'}</div>
        </div>
      </div>
    </motion.section>
  );
}
