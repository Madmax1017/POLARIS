import React from 'react';
import { FileBarChart, Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <FileBarChart className="w-5 h-5 mr-2 text-[var(--polar-cyan)]" /> Polar Analytics & Expedition Compliance Reports
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Generate and export seasonal summary reports for NCPOR Ministry of Earth Sciences audits.
          </p>
        </div>
        <button className="px-4 py-2 bg-[var(--surface-elevated)] border border-[var(--border-primary)] hover:border-[var(--polar-cyan)]/50 text-[var(--text-primary)] font-semibold font-sans text-xs rounded-xl shadow-2xs flex items-center space-x-2 shrink-0 transition-colors cursor-pointer">
          <Download className="w-4 h-4 text-[var(--polar-cyan)]" />
          <span>EXPORT ALL LEDGERS (.PDF / .CSV)</span>
        </button>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs space-y-3 text-[var(--text-primary)] hover:border-[var(--polar-cyan)]/40 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[var(--text-primary)] text-sm">Annual Resupply Depletion Audit</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border border-[var(--polar-cyan)]/30">
              LOGISTICS
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Analyzes fuel burn rates across Maitri and Bharati to forecast cargo vessel capacity required for the 44th IAE.
          </p>
          <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[var(--polar-cyan)] font-medium">
            <span className="text-[var(--text-muted)]">Last Generated: 2 days ago</span>
            <button className="hover:underline flex items-center cursor-pointer font-semibold">Download <Download className="w-3 h-3 ml-1" /></button>
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs space-y-3 text-[var(--text-primary)] hover:border-[var(--polar-cyan)]/40 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[var(--text-primary)] text-sm">Field Safety & Dead-Man's-Switch Audit</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/30">
              SAFETY
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Summary of check-in response compliance, automated triggers, and medical reach-back drills over winter period.
          </p>
          <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[var(--polar-cyan)] font-medium">
            <span className="text-[var(--text-muted)]">Last Generated: Today</span>
            <button className="hover:underline flex items-center cursor-pointer font-semibold font-sans">Download <Download className="w-3 h-3 ml-1" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
