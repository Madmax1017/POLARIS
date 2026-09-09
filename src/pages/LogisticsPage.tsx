import React from 'react';
import { MOCK_CARGO } from '../data/mockData';
import { Truck, Anchor } from 'lucide-react';

export const LogisticsPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <Truck className="w-5 h-5 mr-2 text-[var(--polar-cyan)]" /> Cargo Tracking & Seasonal Window Logistics
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Real-time movement of icebreaker vessels, cargo flights, and snow-cat convoys through narrow weather windows.
          </p>
        </div>
      </div>

      {/* Cargo Movement Cards */}
      <div className="space-y-4">
        {MOCK_CARGO.map((item) => (
          <div
            key={item.id}
            className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs space-y-4 text-[var(--text-primary)] hover:border-[var(--polar-cyan)]/40 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-semibold text-[var(--polar-cyan)] px-2.5 py-0.5 rounded bg-[var(--polar-cyan)]/10 border border-[var(--polar-cyan)]/30">
                    {item.trackingId}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    {item.urgency}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-2 flex items-center">
                  <Anchor className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> {item.vesselName}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-semibold self-start md:self-auto">
                STATUS: {item.status}
              </span>
            </div>

            <p className="text-sm font-semibold text-[var(--text-primary)]">{item.cargoSummary}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-[var(--text-secondary)]">
              <div className="bg-[var(--surface-elevated)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">ORIGIN → DESTINATION</p>
                <p className="font-semibold text-[var(--text-primary)] mt-1">{item.origin} → {item.destination}</p>
              </div>

              <div className="bg-[var(--surface-elevated)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">GROSS WEIGHT</p>
                <p className="font-semibold text-[var(--text-primary)] mt-1">{(item.weightKg / 1000).toFixed(1)} Metric Tons</p>
              </div>

              <div className="bg-[var(--surface-elevated)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">SEASONAL ETA</p>
                <p className="font-bold text-[var(--polar-cyan)] mt-1 font-mono">{item.eta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
