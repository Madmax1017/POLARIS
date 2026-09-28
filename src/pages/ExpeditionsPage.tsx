import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Plus, MapPin, Users, Package, Truck, Clock, CheckCircle2, AlertTriangle, XCircle, Eye, ChevronRight } from 'lucide-react';
import { Mission } from '../types';
import { useMissionStore } from '../stores/useMissionStore';

const STATUS_TABS = ['ALL', 'PLANNED', 'READY', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;

const STATUS_STYLES: Record<string, string> = {
  PLANNING: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  PLANNED: 'text-[var(--polar-cyan)] bg-[var(--polar-cyan)]/10 border-[var(--polar-cyan)]/30',
  READY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  ACTIVE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  COMPLETED: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  CANCELLED: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

const PRIORITY_STYLES: Record<string, string> = {
  Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  High: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Routine: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const READINESS_ICON: Record<string, React.ReactNode> = {
  READY: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  'REVIEW REQUIRED': <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  'NOT READY': <XCircle className="w-3.5 h-3.5 text-rose-400" />,
};

const MissionCard: React.FC<{ mission: Mission }> = ({ mission }) => {
  const navigate = useNavigate();
  const sorted = [...mission.checkpoints].sort((a, b) => a.order - b.order);
  const fmt = (dt: string) => { try { return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); } catch { return dt; } };
  const totalCargo = mission.cargo.reduce((s, c) => s + c.quantity * (c.unit === 'L' ? 0.0008 : c.unit === 'kg' ? 0.001 : 0.05), 0);

  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 hover:border-[var(--polar-cyan)]/30 transition-all space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <p className="text-xs font-mono font-bold text-[var(--polar-cyan)]">{mission.id}</p>
          <h3 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide">{mission.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${PRIORITY_STYLES[mission.priority] || ''}`}>{mission.priority.toUpperCase()} PRIORITY</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">{mission.type}</span>
          </div>
        </div>
        <span className={`self-start sm:self-auto text-xs font-mono font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[mission.status] || ''}`}>{mission.status}</span>
      </div>

      {/* Route */}
      {sorted.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
          <MapPin className="w-3 h-3 text-[var(--polar-cyan)] shrink-0" />
          {sorted.map((cp, i) => (
            <React.Fragment key={cp.id}>
              <span className="text-[var(--text-secondary)]">{cp.name}</span>
              {i < sorted.length - 1 && <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { icon: <Clock className="w-3.5 h-3.5 text-[var(--polar-cyan)]" />, label: 'SCHEDULE', val: mission.departureTime ? fmt(mission.departureTime) : '—' },
          { icon: <Users className="w-3.5 h-3.5 text-[var(--polar-cyan)]" />, label: 'PERSONNEL', val: `${mission.personnel.length} ASSIGNED` },
          { icon: <Truck className="w-3.5 h-3.5 text-[var(--polar-cyan)]" />, label: 'ASSETS', val: `${mission.assets.length} ASSIGNED` },
          { icon: <Package className="w-3.5 h-3.5 text-[var(--polar-cyan)]" />, label: 'CARGO', val: `~${totalCargo.toFixed(1)} MT` },
        ].map(({ icon, label, val }) => (
          <div key={label} className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg p-2 flex items-start gap-2">
            {icon}
            <div>
              <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase">{label}</p>
              <p className="text-xs font-bold text-[var(--text-primary)] font-mono mt-0.5">{val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          {READINESS_ICON[mission.overallReadiness]}
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">READINESS: <span className="font-bold">{mission.overallReadiness}</span></span>
        </div>
        <button
          onClick={() => navigate(`/missions/${mission.id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-lg text-xs font-mono font-bold text-[var(--text-primary)] hover:border-[var(--polar-cyan)] hover:text-[var(--polar-cyan)] transition cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" /> VIEW MISSION
        </button>
      </div>
    </div>
  );
};

export const ExpeditionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { missions, seedMissions, isSeeded } = useMissionStore();
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>('ALL');
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => { if (!isSeeded) seedMissions(); }, [isSeeded]);

  useEffect(() => {
    const id = searchParams.get('created');
    if (id) { setCreatedId(id); setTimeout(() => setCreatedId(null), 6000); }
  }, [searchParams]);

  const filtered = missions.filter(m => activeTab === 'ALL' || m.status === activeTab);
  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'ALL' ? missions.length : missions.filter(m => m.status === tab).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5 font-sans text-[var(--text-primary)]">
      {/* Success Banner */}
      {createdId && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-400">MISSION CREATED</p>
            <p className="text-xs text-[var(--text-secondary)]"><span className="font-mono font-bold">{createdId}</span> has been added to the mission registry.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[var(--polar-cyan)]" /> Missions — Expedition Operations Registry
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">Operational record of all planned, active and completed polar missions.</p>
        </div>
        <button
          onClick={() => navigate('/missions/plan')}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] font-mono font-bold text-xs rounded-xl shadow-sm transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> PLAN NEW MISSION
        </button>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {STATUS_TABS.slice(1).map(tab => (
          <div key={tab} className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg p-2 text-center">
            <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase">{tab}</p>
            <p className="text-lg font-mono font-bold text-[var(--text-primary)]">{counts[tab] || 0}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-subtle)] overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 border-b-2 transition cursor-pointer ${activeTab === tab
                ? 'border-[var(--polar-cyan)] text-[var(--polar-cyan)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
          >
            {tab} {counts[tab] > 0 && <span className="ml-1">({counts[tab]})</span>}
          </button>
        ))}
      </div>

      {/* Mission Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <Compass className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-mono">No missions found in this category.</p>
          <button onClick={() => navigate('/missions/plan')} className="mt-4 flex items-center gap-1.5 px-4 py-2 border border-dashed border-[var(--border-primary)] rounded-xl text-xs font-mono text-[var(--polar-cyan)] hover:border-[var(--polar-cyan)] transition cursor-pointer mx-auto">
            <Plus className="w-3.5 h-3.5" /> PLAN FIRST MISSION
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(m => <MissionCard key={m.id} mission={m} />)}
        </div>
      )}
    </div>
  );
};
