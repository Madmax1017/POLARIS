import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Check, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Mission, MissionObjective, MissionPersonnel, MissionCheckpoint } from '../../types';
import { MISSION_PERSONNEL_POOL, ROUTE_CHECKPOINTS, SEED_MISSIONS } from '../../data/missionData';

type D = Partial<Mission>;
const F = 'bg-[var(--surface-input)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] w-full focus:outline-none focus:border-[var(--polar-cyan)] font-sans';
const L = 'text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] block mb-1.5';

// ── Step 01 — Mission Details ─────────────────────────────────────────────────
export const Step01: React.FC<{ data: D; set: (u: D) => void }> = ({ data, set }) => {
    const types = ['Scientific Research', 'Field Survey', 'Resupply', 'Maintenance', 'Personnel Transfer', 'Emergency Response', 'Reconnaissance', 'Logistics Support', 'Other'];
    const bases = ['Maitri Station', 'Bharati Station', 'Himadri Station', 'HQ / Command Center'];
    const commanders = MISSION_PERSONNEL_POOL.filter(p => p.status !== 'On Mission');

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={L}>Mission Name</label>
                    <input className={F} placeholder='e.g. "Operation Glacier Survey"' value={data.name || ''} onChange={e => set({ name: e.target.value })} />
                </div>
                <div>
                    <label className={L}>Mission ID (Auto-Generated)</label>
                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 font-mono text-sm text-[var(--polar-cyan)] font-bold">{data.id || '—'}</div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={L}>Mission Type</label>
                    <select className={F} value={data.type || ''} onChange={e => set({ type: e.target.value as Mission['type'] })}>
                        <option value="">Select type…</option>
                        {types.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className={L}>Priority</label>
                    <select className={F} value={data.priority || ''} onChange={e => set({ priority: e.target.value as Mission['priority'] })}>
                        <option value="">Select priority…</option>
                        {['Routine', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className={L}>Mission Status</label>
                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono text-amber-400 font-bold">PLANNING → PLANNED</div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={L}>Mission Lead / Commander</label>
                    <select className={F} value={data.commanderPersonnelId || ''} onChange={e => {
                        const p = commanders.find(c => c.id === e.target.value);
                        set({ commanderPersonnelId: e.target.value, commanderName: p?.name || '' });
                    }}>
                        <option value="">Select commander…</option>
                        {commanders.map(c => <option key={c.id} value={c.id}>{c.name} — {c.role}</option>)}
                    </select>
                </div>
                <div>
                    <label className={L}>Operational Station / Base</label>
                    <select className={F} value={data.operationalBase || ''} onChange={e => set({ operationalBase: e.target.value })}>
                        <option value="">Select base…</option>
                        {bases.map(b => <option key={b}>{b}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className={L}>Mission Description</label>
                <textarea className={F + ' resize-none'} rows={3} placeholder="Brief operational description of mission purpose and scope…" value={data.description || ''} onChange={e => set({ description: e.target.value })} />
            </div>
        </div>
    );
};

// ── Step 02 — Objectives ──────────────────────────────────────────────────────
export const Step02: React.FC<{ data: D; set: (u: D) => void }> = ({ data, set }) => {
    const [newObj, setNewObj] = useState('');
    const objectives: MissionObjective[] = data.objectives || [];
    const primary = objectives.find(o => o.type === 'primary');
    const secondary = objectives.filter(o => o.type === 'secondary');

    const setPrimary = (text: string) => {
        const rest = objectives.filter(o => o.type !== 'primary');
        set({ objectives: text ? [{ id: 'obj-p', type: 'primary', text }, ...rest] : rest });
    };
    const addSec = () => {
        if (!newObj.trim()) return;
        set({ objectives: [...objectives, { id: `obj-s-${Date.now()}`, type: 'secondary', text: newObj.trim() }] });
        setNewObj('');
    };
    const removeSec = (id: string) => set({ objectives: objectives.filter(o => o.id !== id) });

    return (
        <div className="space-y-5">
            <div>
                <label className={L}>Primary Objective</label>
                <textarea className={F + ' resize-none'} rows={3} placeholder="Conduct a geological survey across the designated field zone…" value={primary?.text || ''} onChange={e => setPrimary(e.target.value)} />
            </div>
            <div>
                <label className={L}>Secondary Objectives</label>
                <div className="space-y-2 mb-3">
                    {secondary.map((obj, i) => (
                        <div key={obj.id} className="flex items-start gap-2 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2">
                            <span className="text-[10px] font-mono text-[var(--polar-cyan)] mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                            <span className="flex-1 text-sm text-[var(--text-primary)]">{obj.text}</span>
                            <button onClick={() => removeSec(obj.id)} className="text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    ))}
                    {secondary.length === 0 && <p className="text-xs text-[var(--text-muted)] font-mono">No secondary objectives defined.</p>}
                </div>
                <div className="flex gap-2">
                    <input className={F} placeholder="Add secondary objective…" value={newObj} onChange={e => setNewObj(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSec()} />
                    <button onClick={addSec} className="px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--polar-cyan)] hover:bg-[var(--surface-hover)] transition cursor-pointer shrink-0"><Plus className="w-4 h-4" /></button>
                </div>
            </div>
            <div>
                <label className={L}>Mission Success Criteria</label>
                <textarea className={F + ' resize-none'} rows={2} placeholder="Complete survey of designated area and return all personnel and equipment safely…" value={data.successCriteria || ''} onChange={e => set({ successCriteria: e.target.value })} />
            </div>
        </div>
    );
};

// ── Step 03 — Route & Operational Area (Mock SVG Map) ─────────────────────────
const CP_ICONS: Record<string, string> = {
    origin: '●', waypoint: '◆', field_camp: '▲', research_area: '★', destination: '●'
};
const CP_COLORS: Record<string, string> = {
    origin: 'text-[var(--polar-cyan)]', waypoint: 'text-amber-400', field_camp: 'text-emerald-400', research_area: 'text-violet-400', destination: 'text-[var(--polar-cyan)]'
};

// Predefined polar layout positions (SVG 560×340)
const SVG_POSITIONS: Record<string, { x: number; y: number }> = {
    maitri: { x: 140, y: 200 },
    bharati: { x: 340, y: 140 },
    himadri: { x: 280, y: 60 },
    checkpoint_a: { x: 200, y: 240 },
    checkpoint_b: { x: 250, y: 270 },
    field_camp_03: { x: 300, y: 290 },
    survey_zone_alpha: { x: 370, y: 305 },
    gruber_mountains: { x: 255, y: 265 },
    prydz_bay: { x: 410, y: 160 },
};

export const Step03: React.FC<{ data: D; set: (u: D) => void }> = ({ data, set }) => {
    const cps: MissionCheckpoint[] = data.checkpoints || [];
    const cpKeys = Object.keys(ROUTE_CHECKPOINTS);

    const toggle = (key: string) => {
        const cp = ROUTE_CHECKPOINTS[key];
        const exists = cps.find(c => c.id === cp.id);
        let next: MissionCheckpoint[];
        if (exists) {
            next = cps.filter(c => c.id !== cp.id).map((c, i) => ({ ...c, order: i }));
        } else {
            next = [...cps, { ...cp, order: cps.length }];
        }
        const summary = next.sort((a, b) => a.order - b.order).map(c => c.name).join(' → ');
        set({ checkpoints: next, routeSummary: summary, estimatedDistanceKm: next.length * 80, estimatedTravelHours: next.length * 4 });
    };

    const isSelected = (key: string) => cps.some(c => c.id === ROUTE_CHECKPOINTS[key].id);
    const sorted = [...cps].sort((a, b) => a.order - b.order);

    // Build SVG line path
    const points = sorted.map(cp => {
        const key = Object.keys(ROUTE_CHECKPOINTS).find(k => ROUTE_CHECKPOINTS[k].id === cp.id);
        return key ? SVG_POSITIONS[key] : null;
    }).filter(Boolean) as { x: number; y: number }[];

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Mock Map */}
                <div className="lg:col-span-2 bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Polar Operational Map — Demo Mode</span>
                        <span className="text-[10px] font-mono text-[var(--polar-cyan)]">Click waypoints to add to route</span>
                    </div>
                    <svg viewBox="0 0 560 340" className="w-full" style={{ background: 'var(--surface-primary)' }}>
                        {/* Grid */}
                        <defs>
                            <pattern id="pg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="560" height="340" fill="url(#pg)" />
                        {/* Antarctica silhouette suggestion */}
                        <ellipse cx="280" cy="290" rx="220" ry="55" fill="rgba(168,199,209,0.04)" stroke="rgba(168,199,209,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                        <text x="280" y="320" textAnchor="middle" fontSize="9" fill="rgba(168,199,209,0.3)" fontFamily="monospace">ANTARCTIC OPERATIONAL ZONE</text>
                        <text x="280" y="50" textAnchor="middle" fontSize="8" fill="rgba(168,199,209,0.2)" fontFamily="monospace">ARCTIC ZONE</text>
                        {/* Route lines */}
                        {points.length > 1 && points.map((p, i) => i < points.length - 1 && (
                            <line key={i} x1={p.x} y1={p.y} x2={points[i + 1].x} y2={points[i + 1].y}
                                stroke="var(--polar-cyan)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" />
                        ))}
                        {/* Nodes */}
                        {cpKeys.map(key => {
                            const pos = SVG_POSITIONS[key];
                            const cp = ROUTE_CHECKPOINTS[key];
                            const sel = isSelected(key);
                            const idx = sorted.findIndex(c => c.id === cp.id);
                            return (
                                <g key={key} onClick={() => toggle(key)} style={{ cursor: 'pointer' }}>
                                    <circle cx={pos.x} cy={pos.y} r={sel ? 10 : 7}
                                        fill={sel ? 'rgba(168,199,209,0.2)' : 'rgba(0,0,0,0.3)'}
                                        stroke={sel ? 'var(--polar-cyan)' : 'rgba(168,199,209,0.3)'}
                                        strokeWidth={sel ? 2 : 1} />
                                    {sel && <circle cx={pos.x} cy={pos.y} r={4} fill="var(--polar-cyan)" />}
                                    {sel && idx >= 0 && (
                                        <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#000" fontWeight="bold" fontFamily="monospace">{idx + 1}</text>
                                    )}
                                    {!sel && <circle cx={pos.x} cy={pos.y} r={3} fill="rgba(168,199,209,0.4)" />}
                                    <text x={pos.x} y={pos.y + 16} textAnchor="middle" fontSize="8" fill={sel ? 'var(--polar-cyan)' : 'rgba(168,199,209,0.5)'} fontFamily="monospace" fontWeight={sel ? 'bold' : 'normal'}>
                                        {cp.name.length > 14 ? cp.name.slice(0, 13) + '…' : cp.name}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
                {/* Route Summary Panel */}
                <div className="space-y-3">
                    <div>
                        <label className={L}>Planned Route ({sorted.length} waypoints)</label>
                        {sorted.length === 0 ? (
                            <p className="text-xs text-[var(--text-muted)] font-mono">Click map waypoints to build route.</p>
                        ) : (
                            <div className="space-y-1">
                                {sorted.map((cp, i) => (
                                    <div key={cp.id} className="flex items-center gap-2">
                                        <span className={`text-xs font-mono shrink-0 ${CP_COLORS[cp.type] || 'text-[var(--polar-cyan)]'}`}>{CP_ICONS[cp.type] || '●'}</span>
                                        <span className="text-xs text-[var(--text-primary)] font-medium">{cp.name}</span>
                                        {i < sorted.length - 1 && <span className="text-[var(--text-muted)] text-xs ml-auto">↓</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {sorted.length > 1 && (
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                ['Est. Distance', `~${data.estimatedDistanceKm || 0} km`],
                                ['Est. Travel', `~${data.estimatedTravelHours || 0} hrs`],
                                ['Checkpoints', String(sorted.length)],
                                ['Op. Area', sorted.find(c => c.type === 'research_area')?.name || '—'],
                            ].map(([l, v]) => (
                                <div key={l} className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg p-2">
                                    <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase">{l}</p>
                                    <p className="text-xs font-bold text-[var(--text-primary)] font-mono mt-0.5">{v}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={() => set({ checkpoints: [], routeSummary: '', estimatedDistanceKm: 0, estimatedTravelHours: 0 })}
                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300 transition cursor-pointer">
                        Clear Route
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Step 04 — Personnel ────────────────────────────────────────────────────────
export const Step04: React.FC<{ data: D; set: (u: D) => void }> = ({ data, set }) => {
    const selected: MissionPersonnel[] = data.personnel || [];
    const conflictIds = SEED_MISSIONS.flatMap(m => m.status === 'ACTIVE' ? m.personnel.map(p => p.id) : []);

    const toggle = (p: MissionPersonnel) => {
        const exists = selected.find(s => s.id === p.id);
        if (exists) {
            set({ personnel: selected.filter(s => s.id !== p.id) });
        } else {
            const isLead = p.id === data.commanderPersonnelId;
            set({ personnel: [...selected, { ...p, isLead }] });
        }
    };

    const isSelected = (id: string) => selected.some(s => s.id === id);
    const isConflict = (id: string) => conflictIds.includes(id);

    const lead = selected.find(p => p.isLead);
    const field = selected.filter(p => !p.isLead && ['Field Engineer', 'Station Engineer', 'Field Logistics Officer'].includes(p.role));
    const support = selected.filter(p => !p.isLead && !['Field Engineer', 'Station Engineer', 'Field Logistics Officer'].includes(p.role));

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                {[
                    ['PERSONNEL ASSIGNED', String(selected.length)],
                    ['MISSION LEAD', lead?.name || '—'],
                    ['FIELD / SUPPORT', `${field.length} / ${support.length}`],
                ].map(([l, v]) => (
                    <div key={l} className="bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl p-3">
                        <p className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">{l}</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] mt-1 truncate">{v}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                {MISSION_PERSONNEL_POOL.map(p => {
                    const sel = isSelected(p.id);
                    const conflict = isConflict(p.id) && !sel;
                    const isLead = p.id === data.commanderPersonnelId;
                    return (
                        <div key={p.id} onClick={() => !conflict && toggle(p)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${conflict ? 'opacity-50 cursor-not-allowed border-[var(--border-subtle)]' : sel ? 'border-[var(--polar-cyan)] bg-[var(--surface-elevated)] cursor-pointer' : 'border-[var(--border-subtle)] hover:border-[var(--border-primary)] bg-[var(--surface-elevated)] cursor-pointer'}`}>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${sel ? 'bg-[var(--polar-cyan)] border-[var(--polar-cyan)]' : 'border-[var(--border-primary)]'}`}>
                                {sel && <Check className="w-3 h-3 text-[#0a0a09]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[var(--text-primary)]">{p.name}</span>
                                    {isLead && <span className="text-[9px] font-mono bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border border-[var(--polar-cyan)]/30 px-1.5 py-0.5 rounded">LEAD</span>}
                                    {conflict && <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" />CONFLICT</span>}
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{p.role} · {p.specialization}</p>
                                <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{p.stationId.charAt(0).toUpperCase() + p.stationId.slice(1)} Station · {p.status === 'On Mission' ? <span className="text-amber-400">On Mission</span> : p.status}</p>
                            </div>
                            {sel && <CheckCircle2 className="w-4 h-4 text-[var(--polar-cyan)] shrink-0" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
