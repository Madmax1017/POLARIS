import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'cyan',
  pulse = false,
}) => {
  const styles = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    cyan: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border inline-flex items-center space-x-1.5 ${styles[variant]
        }`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      <span>{status}</span>
    </span>
  );
};
