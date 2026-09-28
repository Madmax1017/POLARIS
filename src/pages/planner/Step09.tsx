import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, MapPin, Users, Package, Truck, Clock, Shield } from 'lucide-react';
import { Mission, MissionReadiness } from '../../types';

type D = Partial<Mission>;
const L = 'text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)]';

function computeReadiness(data: D): { readiness: MissionReadiness; overall: Mission['overallReadiness'] } {
    const readiness: MissionReadiness = {
        personnel: (data.personnel?.length || 0) >= 2 ? 'READY' : (data.personnel?.length || 0) === 1 ? 'PARTIAL' : 'NOT_READY',
        assets: (data.assets?.length || 0) >= 1 ? 'READY' : 'NOT_READY',
        cargo: (data.cargo?.length || 0) >= 1 ? (data.cargo?.some(c => c.priority === 'CRITICAL' && !c.deadline) ? 'PARTIAL' : 'READY') : 'NOT_READY',
        route: (data.checkpoints?.length || 0) >= 2 ? 'READY' : 'PARTIAL',
        weather: (data.risks?.some(r => r.category === 'Weather' && (r.severity === 'HIGH' || r.severity === 'CRITICAL'))) ? 'REVIEW' : 'READY',
        communications: (data.assets?.some(a => a.type === 'Communication Equipment')) ? 'READY' : 'PARTIAL',
    };
    const vals = Object.values(readiness);
    const overall: Mission['overallReadiness'] =
        vals.every(v => v === 'READY') ? 'READY' :
            vals.some(v => v === 'NOT_READY') ? 'NOT READY' : 'REVIEW REQUIRED';
    return { readiness, overall };
}

const ReadinessIcon: React.FC<{ status: string }> = ({ status }) => {
    if (status === 'READY') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === 'PARTIAL' || status === 'REVIEW') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <XCircle className="w-4 h-4 text-rose-400" />;
};

const ReadyLabel: React.FC<{ status: string }> = ({ status }) => {
    const colors: Record<string, string> = { READY: 'text-emerald-400', PARTIAL: 'text-amber-400', REVIEW: 'text-amber-400', NOT_READY: 'text-rose-400' };
    return <span className={`text-xs font-mono font-bold ${colors[status] || 'text-[var(--text-muted)]'}`}>{status.replace('_', ' ')}</span>;
};

const PriorityBadge: React.FC<{ p?: string }> = ({ p }) => {
    const c = p === 'Critical' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
        : p === 'High' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
            : 'text-[var(--text-secondary)] border-[var(--border-subtle)] bg-[var(--surface-elevated)]';
    return <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${c}`}>{p?.toUpperCase() || '—'}</span>;
};

export const Step09: React.FC<{ data: D }> = ({ data }) => {
    const { readiness, overall } = computeReadiness(data);
    const sorted = [...(data.checkpoints || [])].sort((a, b) => a.order - b.order);
    const totalCargo = (data.cargo || []).reduce((s, c) => s + c.quantity * (c.unit === 'L' ? 0.0008 : c.unit === 'kg' ? 0.001 : 0.05), 0);

    const overallColor = overall === 'READY'
        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
        : overall === 'REVIEW REQUIRED'
            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
            : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

    const fmt = (dt?: string) => {
        if (!dt) return '—';
        try { return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return dt; }
    };

    return (
        <div className="space-y-5">
            {/* Mission Summary Card */}
            <div className="bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
                    <div>
                        <p className="text-[10px] font-mono text-[var(--polar-cyan)] font-bold mb-1">{data.id || '—'}</p>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{data.name || 'Untitled Mission'}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{data.description || 'No description provided.'}</p>
                    </div>
                    <PriorityBadge p={data.priority} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: <Users className="w-4 h-4 text-[var(--polar-cyan)]" />, label: 'MISSION LEAD', val: data.commanderName || '—' },
                        { icon: <Shield className="w-4 h-4 text-[var(--polar-cyan)]" />, label: 'TYPE', val: data.type || '—' },
                        { icon: <MapPin className="w-4 h-4 text-[var(--polar-cyan)]" />, label: 'BASE', val: data.operationalBase || '—' },
                        { icon: <Users className="w-4 h-4 text-[var(--polar-cyan)]" />, label: 'PERSONNEL', val: String(data.personnel?.length || 0) },
                        { icon: <Truck className="w-4 h-4 text-[var(--polar-cyan)]" />, label: 'ASSETS', val: String(data.assets?.length || 0) },
                        { icon: <Package className="w-4 h-4 text-[var(--polar-cyan)]" />, label: 'CARGO', val: `~${totalCargo.toFixed(1)} MT` },
                        { icon: <Clock className="w-4 h-4 text-[var(--polar-cyan)]" />, label: 'DEPARTURE', val: fmt(data.departureTime) },
                        { icon: <Clock className="w-4 h-4 text-[var(--polar-cyan)]" />, label: 'RETURN', val: fmt(data.returnTime) },
                    ].map(({ icon, label, val }) => (
                        <div key={label}>
                            <div className="flex items-center gap-1 mb-0.5">{icon}<span className={L}>{label}</span></div>
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{val}</p>
                        </div>
                    ))}
                </div>
                {sorted.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                        <p className={L + ' mb-1'}>ROUTE</p>
                        <p className="text-sm font-mono text-[var(--text-primary)]">{sorted.map(c => c.name).join(' → ')}</p>
                    </div>
                )}
            </div>

            {/* Readiness Matrix */}
            <div className="bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)]">MISSION READINESS</p>
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${overallColor}`}>{overall}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.entries(readiness) as [string, string][]).map(([key, status]) => (
                        <div key={key} className="flex items-center justify-between bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2">
                            <span className="text-xs font-mono text-[var(--text-secondary)] capitalize">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            <div className="flex items-center gap-1.5">
                                <ReadinessIcon status={status} />
                                <ReadyLabel status={status} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export { computeReadiness };
