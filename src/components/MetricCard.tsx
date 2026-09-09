import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  subtitle,
}) => {
  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs hover:border-[var(--polar-cyan)] transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--polar-cyan)] border border-[var(--border-subtle)]">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${changeType === 'positive'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : changeType === 'negative'
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
              }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-[var(--text-muted)] font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
};
