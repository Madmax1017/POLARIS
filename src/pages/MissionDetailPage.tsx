import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, MapPin, Users, Package, Truck, Clock, Shield,
    CheckCircle2, AlertTriangle, XCircle, ChevronRight, Flag,
    Play, CheckSquare, XSquare, Target, Brain, Sparkles
} from 'lucide-react';
import { useMissionStore } from '../stores/useMissionStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useReportStore } from '../stores/useReportStore';
import { MissionStatus } from '../types';
import { MissionIntelligenceReport } from '../types/analysis';
import { generateMissionAnalysis } from '../services/analysisService';
import { MissionIntelligenceReportModal } from '../components/intelligence/MissionIntelligenceReportModal';

const L = 'text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] block mb-1';
const CARD = 'bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-4';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const c: Record<string, string> = {
        PLANNING: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
        PLANNED: 'text-[var(--polar-cyan)] bg-[var(--polar-cyan)]/10 border-[var(--polar-cyan)]/30',
        READY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        ACTIVE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        COMPLETED: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
        CANCELLED: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    };
    return <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${c[status] || ''}`}>{status}</span>;
};

const ReadinessRow: React.FC<{ label: string; status: string }> = ({ label, status }) => {
    const icon = status === 'READY' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        : status === 'NOT_READY' ? <XCircle className="w-4 h-4 text-rose-400" />
            : <AlertTriangle className="w-4 h-4 text-amber-400" />;
    const col = status === 'READY' ? 'text-emerald-400' : status === 'NOT_READY' ? 'text-rose-400' : 'text-amber-400';
    return (
        <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-sm text-[var(--text-secondary)] capitalize">{label}</span>
            <div className="flex items-center gap-2">{icon}<span className={`text-xs font-mono font-bold ${col}`}>{status.replace('_', ' ')}</span></div>
        </div>
    );
};

const SEV_COLORS: Record<string, string> = {
    LOW: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    MEDIUM: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    HIGH: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    CRITICAL: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
};

export const MissionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { missions, setMissionStatus } = useMissionStore();
    const { items: inventoryItems } = useInventoryStore();
    const addReport = useReportStore((s) => s.addReport);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeReport, setActiveReport] = useState<MissionIntelligenceReport | null>(null);
    const [showModal, setShowModal] = useState(false);

    const mission = missions.find(m => m.id === id);

    if (!mission) return (
        <div className="text-center py-20 text-[var(--text-muted)]">
            <p className="text-sm font-mono">Mission not found: {id}</p>
            <button onClick={() => navigate('/missions')} className="mt-4 text-xs font-mono text-[var(--polar-cyan)] hover:underline cursor-pointer">← Back to Missions</button>
        </div>
    );

    const handleRunAnalysis = async () => {
        setShowModal(true);
        setIsAnalyzing(true);
        setActiveReport(null);

        const report = await generateMissionAnalysis(mission, inventoryItems);
        addReport(report);
        setActiveReport(report);
        setIsAnalyzing(false);
    };

    const sorted = [...mission.checkpoints].sort((a, b) => a.order - b.order);
    const fmt = (dt: string) => { try { return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return dt; } };
    const totalCargo = mission.cargo.reduce((s, c) => s + c.quantity * (c.unit === 'L' ? 0.0008 : c.unit === 'kg' ? 0.001 : 0.05), 0);

    const lifecycleBtns: { label: string; targetStatus: MissionStatus; icon: React.ReactNode; color: string; show: MissionStatus[] }[] = [
        { label: 'MARK READY', targetStatus: 'READY', icon: <Flag className="w-3.5 h-3.5" />, color: 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10', show: ['PLANNED'] },
        { label: 'START MISSION', targetStatus: 'ACTIVE', icon: <Play className="w-3.5 h-3.5" />, color: 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10', show: ['READY', 'PLANNED'] },
        { label: 'COMPLETE MISSION', targetStatus: 'COMPLETED', icon: <CheckSquare className="w-3.5 h-3.5" />, color: 'border-[var(--polar-cyan)]/40 text-[var(--polar-cyan)] hover:bg-[var(--polar-cyan)]/10', show: ['ACTIVE'] },
        { label: 'CANCEL MISSION', targetStatus: 'CANCELLED', icon: <XSquare className="w-3.5 h-3.5" />, color: 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10', show: ['PLANNED', 'READY'] },
    ];

    const overallColor = mission.overallReadiness === 'READY'
        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
        : mission.overallReadiness === 'REVIEW REQUIRED'
            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
            : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

    return (
        <div className="space-y-5 font-sans text-[var(--text-primary)]">
            {/* Back + Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                    <button onClick={() => navigate('/missions')} className="flex items-center gap-1 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--polar-cyan)] transition mb-2 cursor-pointer">
                        <ChevronLeft className="w-3.5 h-3.5" /> BACK TO MISSIONS
                    </button>
                    <p className="text-xs font-mono font-bold text-[var(--polar-cyan)] mb-0.5">{mission.id}</p>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase">{mission.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <StatusBadge status={mission.status} />
                        <span className="text-xs font-mono text-[var(--text-secondary)]">{mission.type}</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${mission.priority === 'Critical' ? 'text-rose-400 border-rose-500/30' : mission.priority === 'High' ? 'text-amber-400 border-amber-500/30' : 'text-slate-400 border-slate-500/30'}`}>{mission.priority.toUpperCase()} PRIORITY</span>
                    </div>
                </div>
                {/* Lifecycle Controls */}
                <div className="flex flex-wrap gap-2 shrink-0">
                    <button onClick={handleRunAnalysis} className="flex items-center gap-1.5 px-3 py-1.5 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 bg-cyan-500/5 rounded-lg text-xs font-mono font-bold transition cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                        <Brain className="w-4 h-4" /> ANALYZE MISSION
                    </button>
                    {lifecycleBtns.filter(b => b.show.includes(mission.status)).map(btn => (
                        <button key={btn.label} onClick={() => setMissionStatus(mission.id, btn.targetStatus)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-mono font-bold transition cursor-pointer ${btn.color}`}>
                            {btn.icon}{btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview + Readiness */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Overview */}
                <div className={CARD + ' lg:col-span-2 space-y-3'}>
                    <p className={L}>MISSION OVERVIEW</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            { l: 'Commander', v: mission.commanderName || '—' },
                            { l: 'Operational Base', v: mission.operationalBase || '—' },
                            { l: 'Duration', v: mission.durationHours ? `${mission.durationHours} hrs` : '—' },
                            { l: 'Departure', v: mission.departureTime ? fmt(mission.departureTime) : '—' },
                            { l: 'Return', v: mission.returnTime ? fmt(mission.returnTime) : '—' },
                            { l: 'Route Distance', v: mission.estimatedDistanceKm ? `~${mission.estimatedDistanceKm} km` : '—' },
                        ].map(({ l, v }) => (
                            <div key={l}><p className={L}>{l}</p><p className="text-sm font-bold text-[var(--text-primary)]">{v}</p></div>
                        ))}
                    </div>
                    {mission.description && (
                        <div><p className={L}>Description</p><p className="text-sm text-[var(--text-secondary)]">{mission.description}</p></div>
                    )}
                </div>

                {/* Readiness */}
                <div className={CARD}>
                    <div className="flex items-center justify-between mb-3">
                        <p className={L}>READINESS</p>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${overallColor}`}>{mission.overallReadiness}</span>
                    </div>
                    {(Object.entries(mission.readiness) as [string, string][]).map(([k, v]) => (
                        <ReadinessRow key={k} label={k} status={v} />
                    ))}
                </div>
            </div>

            {/* Objectives */}
            {mission.objectives.length > 0 && (
                <div className={CARD}>
                    <p className={L + ' mb-3'}>OBJECTIVES</p>
                    <div className="space-y-2">
                        {mission.objectives.map((obj, i) => (
                            <div key={obj.id} className="flex items-start gap-2">
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${obj.type === 'primary' ? 'text-[var(--polar-cyan)] bg-[var(--polar-cyan)]/10' : 'text-[var(--text-muted)] bg-[var(--surface-primary)]'}`}>{obj.type === 'primary' ? 'PRIMARY' : `SEC ${String(i).padStart(2, '0')}`}</span>
                                <p className="text-sm text-[var(--text-primary)]">{obj.text}</p>
                            </div>
                        ))}
                    </div>
                    {mission.successCriteria && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                            <p className={L}>Success Criteria</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{mission.successCriteria}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Route */}
            {sorted.length > 0 && (
                <div className={CARD}>
                    <p className={L + ' mb-3'}>PLANNED ROUTE</p>
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                        {sorted.map((cp, i) => (
                            <React.Fragment key={cp.id}>
                                <div className="flex flex-col items-center gap-1">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold ${i === 0 ? 'border-[var(--polar-cyan)] text-[var(--polar-cyan)]' : i === sorted.length - 1 ? 'border-[var(--polar-cyan)] text-[var(--polar-cyan)]' : 'border-amber-500/50 text-amber-400'}`}>{i + 1}</div>
                                    <span className="text-[9px] font-mono text-[var(--text-secondary)] text-center max-w-20 leading-tight">{cp.name}</span>
                                </div>
                                {i < sorted.length - 1 && <ChevronRight className="w-4 h-4 text-[var(--text-muted)] mb-4" />}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
                        <span>Distance: <strong className="text-[var(--text-primary)]">~{mission.estimatedDistanceKm} km</strong></span>
                        <span>Travel time: <strong className="text-[var(--text-primary)]">~{mission.estimatedTravelHours} hrs</strong></span>
                    </div>
                </div>
            )}

            {/* Personnel + Assets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personnel */}
                <div className={CARD}>
                    <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-[var(--polar-cyan)]" /><p className={L}>PERSONNEL ({mission.personnel.length})</p></div>
                    <div className="space-y-2">
                        {mission.personnel.map(p => (
                            <div key={p.id} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                                <div className="w-7 h-7 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-subtle)] flex items-center justify-center text-[9px] font-mono font-bold text-[var(--polar-cyan)]">
                                    {p.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5"><p className="text-xs font-bold text-[var(--text-primary)] truncate">{p.name}</p>{p.isLead && <span className="text-[8px] font-mono text-[var(--polar-cyan)] border border-[var(--polar-cyan)]/30 px-1 rounded shrink-0">LEAD</span>}</div>
                                    <p className="text-[10px] font-mono text-[var(--text-secondary)]">{p.role}</p>
                                </div>
                            </div>
                        ))}
                        {mission.personnel.length === 0 && <p className="text-xs text-[var(--text-muted)] font-mono">No personnel assigned.</p>}
                    </div>
                </div>

                {/* Assets */}
                <div className={CARD}>
                    <div className="flex items-center gap-2 mb-3"><Truck className="w-4 h-4 text-[var(--polar-cyan)]" /><p className={L}>ASSETS ({mission.assets.length})</p></div>
                    <div className="space-y-2">
                        {mission.assets.map(a => (
                            <div key={a.id} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                                <span className="text-[9px] font-mono text-[var(--polar-cyan)] bg-[var(--polar-cyan)]/10 border border-[var(--polar-cyan)]/20 px-1.5 py-0.5 rounded shrink-0">{a.assetId}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{a.name}</p>
                                    <p className="text-[10px] font-mono text-[var(--text-secondary)]">{a.type} · {a.condition}</p>
                                </div>
                            </div>
                        ))}
                        {mission.assets.length === 0 && <p className="text-xs text-[var(--text-muted)] font-mono">No assets assigned.</p>}
                    </div>
                </div>
            </div>

            {/* Cargo */}
            {mission.cargo.length > 0 && (
                <div className={CARD}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2"><Package className="w-4 h-4 text-[var(--polar-cyan)]" /><p className={L}>CARGO & LOGISTICS ({mission.cargo.length} items)</p></div>
                        <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">~{totalCargo.toFixed(1)} MT est.</span>
                    </div>
                    <div className="space-y-2">
                        {mission.cargo.map(c => (
                            <div key={c.id} className="grid grid-cols-3 md:grid-cols-6 gap-2 items-center py-2 border-b border-[var(--border-subtle)] last:border-0 text-xs">
                                <span className="font-bold text-[var(--text-primary)] md:col-span-2">{c.item}</span>
                                <span className="font-mono text-[var(--text-secondary)]">{c.quantity} {c.unit}</span>
                                <span className={`font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border w-fit ${c.priority === 'CRITICAL' ? 'text-rose-400 border-rose-500/30' : c.priority === 'HIGH' ? 'text-amber-400 border-amber-500/30' : 'text-slate-400 border-slate-500/30'}`}>{c.priority}</span>
                                <span className="font-mono text-[var(--text-muted)] text-[10px]">{c.requiredAt}</span>
                                <span className="font-mono text-[var(--text-muted)] text-[10px]">{c.deadline ? fmt(c.deadline) : '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Phases */}
            {mission.phases.length > 0 && (
                <div className={CARD}>
                    <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-[var(--polar-cyan)]" /><p className={L}>MISSION TIMELINE</p></div>
                    <div className="relative pl-6 space-y-4">
                        <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--border-primary)]" />
                        {mission.phases.map((ph, i) => (
                            <div key={ph.id} className="relative">
                                <div className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-[var(--polar-cyan)] bg-[var(--surface-elevated)]" />
                                <p className="text-xs font-bold text-[var(--text-primary)]">PHASE {String(i + 1).padStart(2, '0')} — {ph.name}</p>
                                {ph.startTime && <p className="text-[10px] font-mono text-[var(--polar-cyan)]">{fmt(ph.startTime)} → {ph.endTime ? fmt(ph.endTime) : '?'}</p>}
                                {ph.description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{ph.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Environmental Conditions */}
            <div className={CARD}>
                <p className={L + ' mb-3'}>ENVIRONMENTAL CONDITIONS</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(mission.environmentalConditions).map(([k, v]) => (
                        <div key={k} className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg p-2">
                            <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase">{k.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-xs font-mono text-[var(--text-primary)] mt-0.5 font-bold">{v}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Risks */}
            {mission.risks.length > 0 && (
                <div className={CARD}>
                    <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-[var(--polar-cyan)]" /><p className={L}>OPERATIONAL RISKS</p></div>
                    <div className="space-y-3">
                        {mission.risks.map((r, i) => (
                            <div key={r.id} className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${SEV_COLORS[r.severity]}`}>{r.severity}</span>
                                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">PROB: {r.probability}</span>
                                    <span className="text-[10px] font-mono font-bold text-[var(--text-primary)]">{r.category.toUpperCase()}</span>
                                </div>
                                {r.description && <p className="text-xs text-[var(--text-secondary)]">{r.description}</p>}
                                {r.mitigation && (
                                    <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1.5 border-l-2 border-[var(--border-primary)] pl-2">{r.mitigation}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {(showModal || isAnalyzing) && (
                <MissionIntelligenceReportModal
                    report={activeReport}
                    isLoading={isAnalyzing}
                    missionName={mission.name}
                    onClose={() => setShowModal(false)}
                    onRegenerate={handleRunAnalysis}
                />
            )}
        </div>
    );
};
