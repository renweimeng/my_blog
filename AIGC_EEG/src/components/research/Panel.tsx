import type { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Panel({ title, eyebrow, action, className = '', children }: PanelProps) {
  return (
    <section className={`research-card ${className}`}>
      {(title || eyebrow || action) && (
        <div className="research-card-header">
          <div>
            {eyebrow && <span>{eyebrow}</span>}
            {title && <h2>{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function ValuePill({ label, value, tone = 'cyan' }: { label: string; value: string; tone?: 'cyan' | 'violet' | 'amber' | 'red' }) {
  return (
    <div className={`value-pill ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
