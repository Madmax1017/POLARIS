import React from 'react';
import { MOCK_EXPEDITIONS } from '../data/mockData';
import { Compass, Calendar, MapPin, Users, Plus } from 'lucide-react';

export const ExpeditionsPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <Compass className="w-5 h-5 mr-2 text-[var(--polar-cyan)]" /> Expedition Planning & Timeline Scheduling
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Phase tracking, team composition, route planning, and seasonal window allocation across Indian Polar Stations.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-xs rounded-xl shadow-2xs flex items-center space-x-2 shrink-0 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>NEW EXPEDITION PLAN</span>
        </button>
      </div>

      {/* Expeditions List Cards */}
      <div className="grid grid-cols-1 gap-4">
        {MOCK_EXPEDITIONS.map((exp) => (
          <div
            key={exp.id}
            className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs hover:border-[var(--polar-cyan)]/40 transition-all space-y-4 text-[var(--text-primary)]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-semibold text-[var(--polar-cyan)] px-2.5 py-1 rounded bg-[var(--polar-cyan)]/10 border border-[var(--polar-cyan)]/30">
                    {exp.code}
                  </span>
                  <span className="text-xs font-sans px-2.5 py-1 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-medium">
                    Phase: {exp.phase}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-2">{exp.name}</h3>
              </div>
              <span
                className={`self-start md:self-auto px-3 py-1 rounded-full text-xs font-semibold ${exp.status === 'ON_SCHEDULE'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                  }`}
              >
                STATUS: {exp.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-[var(--text-secondary)]">
              <div className="flex items-center space-x-3 bg-[var(--surface-elevated)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
                <Users className="w-4 h-4 text-[var(--polar-cyan)] shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">LEAD & TEAM</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5">{exp.leadScientist} ({exp.teamCount} members)</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-[var(--surface-elevated)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
                <Calendar className="w-4 h-4 text-[var(--polar-cyan)] shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">EXPEDITION WINDOW</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5">{exp.startDate} → {exp.targetCompletion}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-[var(--surface-elevated)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
                <MapPin className="w-4 h-4 text-[var(--polar-cyan)] shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">ROUTE MATRIX</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5 truncate">{exp.routeSummary}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
