import React, { useState } from 'react';
import { Plus, Trash2, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Mission, MissionAsset, MissionCargoItem, MissionPhase, MissionRisk } from '../../types';
import { MISSION_ASSET_POOL } from '../../data/missionData';

type D = Partial<Mission>;
const F = 'bg-[var(--surface-input)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] w-full focus:outline-none focus:border-[var(--polar-cyan)] font-sans';
const L = 'text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] block mb-1.5';
const SF = F + ' text-xs';

// ── Step 05 — Assets & Equipment ─────────────────────────────────────────────
export const Step05: React.FC<{ data: D; set: (u: D) => void }> = ({ data, set }) => {
    const selected: MissionAsset[] = data.assets || [];
    const availColors: Record<string, string> = {
        'Available': 'text-emerald-400', 'In Use': 'text-amber-400', 'Maintenance': 'text-rose-400',
    };
    const toggle = (a: MissionAsset) => {
        const exists = selected.find(s => s.id === a.id);
        set({ assets: exists ? selected.filter(s => s.id !== a.id) : [...selected, a] });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                {[['ASSETS ASSIGNED', String(selected.length)],
                ['VEHICLES', String(selected.filter(a => ['Snowcat', 'Icebreaker', 'Aircraft', 'Utility Vehicle'].includes(a.type)).length)],
                ['EQUIPMENT', String(selected.filter(a => !['Snowcat', 'Icebreaker', 'Aircraft', 'Utility Vehicle'].includes(a.type)).length)],
                ].map(([l, v]) => (
                    <div key={l} className="bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl p-3">
                        <p className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">{l}</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{v}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MISSION_ASSET_POOL.map(a => {
                    const sel = selected.some(s => s.id === a.id);
                    const unavail = a.availability !== 'Available';
                    return (
                        <div key={a.id} onClick={() => !unavail && toggle(a)}
                            className={`p-3 rounded-xl border transition-all ${unavail ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${sel ? 'border-[var(--polar-cyan)] bg-[var(--surface-elevated)]' : 'border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-[var(--border-primary)]'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${sel ? 'bg-[var(--polar-cyan)] border-[var(--polar-cyan)]' : 'border-[var(--border-primary)]'}`}>
                                        {sel && <Check className="w-3 h-3 text-[#0a0a09]" />}
                                    </div>
                                    <span className="text-xs font-mono font-bold text-[var(--polar-cyan)]">{a.assetId}</span>
                                </div>
                                <span className={`text-[9px] font-mono font-bold ${availColors[a.availability]}`}>{a.availability.toUpperCase()}</span>
                            </div>
                            <p className="text-sm font-bold text-[var(--text-primary)] mt-2">{a.name}</p>
                            <p className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">{a.type} · {a.location}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${a.condition === 'Operational' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : a.condition === 'Serviceable' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10'}`}>{a.condition}</span>
                                {a.fuelRequirement && <span className="text-[9px] text-[var(--text-muted)] font-mono">{a.fuelRequirement}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Step 06 — Cargo & Logistics ──────────────────────────────────────────────
const emptyItem = (): MissionCargoItem => ({
    id: `cg-${Date.now()}`, item: '', quantity: 0, unit: 'units',
    priority: 'NORMAL', requiredAt: '', deadline: '', category: 'Other',
});

export const Step06: React.FC<{ data: D; set: (u: D) => void }> = ({ data, set }) => {
    const cargo: MissionCargoItem[] = data.cargo || [];
    const add = () => set({ cargo: [...cargo, emptyItem()] });
    const remove = (id: string) => set({ cargo: cargo.filter(c => c.id !== id) });
    const update = (id: string, u: Partial<MissionCargoItem>) =>
        set({ cargo: cargo.map(c => c.id === id ? { ...c, ...u } : c) });

    const cats = ['Fuel', 'Food / Rations', 'Medical Supplies', 'Scientific Equipment', 'Spare Parts', 'Research Samples', 'Communication Equipment', 'Other'];
    const totalEst = cargo.reduce((sum, c) => {
        if (c.unit === 'L') return sum + c.quantity * 0.0008;
        return sum + c.quantity * 0.05;
    }, 0);

    return (
        <div className="space-y-4">
            {cargo.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {[['CARGO ITEMS', String(cargo.length)], ['EST. WEIGHT', `~${totalEst.toFixed(1)} MT`], ['CRITICAL ITEMS', String(cargo.filter(c => c.priority === 'CRITICAL').length)]].map(([l, v]) => (
                        <div key={l} className="bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl p-3">
                            <p className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase">{l}</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{v}</p>
                        </div>
                    ))}
                </div>
            )}
            <div className="space-y-3">
                {cargo.map((c, idx) => (
                    <div key={c.id} className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[var(--polar-cyan)] font-bold">CARGO ITEM {String(idx + 1).padStart(2, '0')}</span>
                            <button onClick={() => remove(c.id)} className="text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="md:col-span-2">
                                <label className={L}>Item</label>
                                <input className={SF} placeholder="Jet A-1 Fuel, Medical Kit…" value={c.item} onChange={e => update(c.id, { item: e.target.value })} />
                            </div>
                            <div>
                                <label className={L}>Qty</label>
                                <input className={SF} type="number" min={0} value={c.quantity} onChange={e => update(c.id, { quantity: +e.target.value })} />
                            </div>
                            <div>
                                <label className={L}>Unit</label>
                                <select className={SF} value={c.unit} onChange={e => update(c.id, { unit: e.target.value })}>
                                    {['L', 'kg', 'units', 'packs', 'crates', 'sets', 'drums'].map(u => <option key={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                                <label className={L}>Category</label>
                                <select className={SF} value={c.category} onChange={e => update(c.id, { category: e.target.value as MissionCargoItem['category'] })}>
                                    {cats.map(cat => <option key={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={L}>Priority</label>
                                <select className={SF} value={c.priority} onChange={e => update(c.id, { priority: e.target.value as MissionCargoItem['priority'] })}>
                                    {['NORMAL', 'HIGH', 'CRITICAL'].map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={L}>Required At</label>
                                <input className={SF} placeholder="Field Camp 03…" value={c.requiredAt} onChange={e => update(c.id, { requiredAt: e.target.value })} />
                            </div>
                            <div>
                                <label className={L}>Deadline</label>
                                <input className={SF} type="datetime-local" value={c.deadline} onChange={e => update(c.id, { deadline: e.target.value })} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={add} className="flex items-center gap-2 px-4 py-2 border border-dashed border-[var(--border-primary)] rounded-xl text-xs font-mono text-[var(--polar-cyan)] hover:border-[var(--polar-cyan)] hover:bg-[var(--surface-elevated)] transition cursor-pointer w-full justify-center">
                <Plus className="w-4 h-4" /> ADD CARGO ITEM
            </button>
        </div>
    );
};

// ── Step 07 — Schedule ────────────────────────────────────────────────────────
const emptyPhase = (): MissionPhase => ({
    id: `ph-${Date.now()}`, name: '', startTime: '', endTime: '', description: '',
});

export const Step07: React.FC<{ data: D; set: (u: D) => void }> = ({ data, set }) => {
    const phases: MissionPhase[] = data.phases || [];
    const addPhase = () => set({ phases: [...phases, emptyPhase()] });
    const removePhase = (id: string) => set({ phases: phases.filter(p => p.id !== id) });
    const updatePhase = (id: string, u: Partial<MissionPhase>) =>
        set({ phases: phases.map(p => p.id === id ? { ...p, ...u } : p) });

    const TIMELINE = ['Briefing', 'Departure', 'Transit', 'Field Operation', 'Checkpoint', 'Return', 'Mission Complete'];

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={L}>Planned Departure</label>
                    <input className={F} type="datetime-local" value={data.departureTime || ''} onChange={e => set({ departureTime: e.target.value })} />
                </div>
                <div>
                    <label className={L}>Expected Return</label>
                    <input className={F} type="datetime-local" value={data.returnTime || ''} onChange={e => {
                        const dh = data.departureTime ? Math.round((new Date(e.target.value).getTime() - new Date(data.departureTime).getTime()) / 3600000) : 0;
                        set({ returnTime: e.target.value, durationHours: Math.max(0, dh) });
                    }} />
                </div>
                <div>
                    <label className={L}>Mission Duration</label>
                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 font-mono text-sm text-[var(--polar-cyan)] font-bold">
                        {data.durationHours ? `${data.durationHours} hrs` : '—'}
                    </div>
                </div>
            </div>

            {/* Mission Timeline */}
            <div>
                <label className={L}>Mission Timeline</label>
                <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {TIMELINE.map((t, i) => (
                        <React.Fragment key={t}>
                            <div className="flex flex-col items-center gap-1 shrink-0">
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-mono font-bold ${i === 0 || i === TIMELINE.length - 1 ? 'border-[var(--polar-cyan)] text-[var(--polar-cyan)]' : 'border-[var(--border-primary)] text-[var(--text-muted)]'}`}>{i + 1}</div>
                                <span className="text-[9px] font-mono text-[var(--text-secondary)] text-center max-w-14 leading-tight">{t}</span>
                            </div>
                            {i < TIMELINE.length - 1 && <div className="w-6 h-px bg-[var(--border-primary)] shrink-0 mb-4" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Phases */}
            <div>
                <label className={L}>Mission Phases</label>
                <div className="space-y-3">
                    {phases.map((ph, i) => (
                        <div key={ph.id} className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-[var(--polar-cyan)] font-bold">PHASE {String(i + 1).padStart(2, '0')}</span>
                                <button onClick={() => removePhase(ph.id)} className="text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                    <label className={L}>Phase Name</label>
                                    <input className={SF} placeholder="Transit, Field Survey…" value={ph.name} onChange={e => updatePhase(ph.id, { name: e.target.value })} />
                                </div>
                                <div>
                                    <label className={L}>Start Time</label>
                                    <input className={SF} type="datetime-local" value={ph.startTime} onChange={e => updatePhase(ph.id, { startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className={L}>End Time</label>
                                    <input className={SF} type="datetime-local" value={ph.endTime} onChange={e => updatePhase(ph.id, { endTime: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className={L}>Description</label>
                                <input className={SF} placeholder="Phase description…" value={ph.description} onChange={e => updatePhase(ph.id, { description: e.target.value })} />
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={addPhase} className="flex items-center gap-2 px-4 py-2 border border-dashed border-[var(--border-primary)] rounded-xl text-xs font-mono text-[var(--polar-cyan)] hover:border-[var(--polar-cyan)] hover:bg-[var(--surface-elevated)] transition cursor-pointer w-full justify-center mt-3">
                    <Plus className="w-4 h-4" /> ADD PHASE
                </button>
            </div>
        </div>
    );
};

// ── Step 08 — Risk & Conditions ──────────────────────────────────────────────
const emptyRisk = (): MissionRisk => ({
    id: `rsk-${Date.now()}`, category: 'Weather', description: '', severity: 'MEDIUM', probability: 'MEDIUM', mitigation: '',
});

const SEV_COLORS: Record<string, string> = { LOW: 'text-emerald-400 border-emerald-500/30', MEDIUM: 'text-amber-400 border-amber-500/30', HIGH: 'text-orange-400 border-orange-500/30', CRITICAL: 'text-rose-400 border-rose-500/30' };

export const Step08: React.FC<{ data: D; set: (u: D) => void }> = ({ data, set }) => {
    const risks: MissionRisk[] = data.risks || [];
    const addRisk = () => set({ risks: [...risks, emptyRisk()] });
    const removeRisk = (id: string) => set({ risks: risks.filter(r => r.id !== id) });
    const updateRisk = (id: string, u: Partial<MissionRisk>) =>
        set({ risks: risks.map(r => r.id === id ? { ...r, ...u } : r) });

    const riskCats = ['Weather', 'Sea Ice', 'Equipment', 'Personnel', 'Connectivity', 'Fuel', 'Medical', 'Route', 'Cargo'];
    const env = data.environmentalConditions || { temperature: '-24°C (Forecast)', wind: '35-45 kt SW', visibility: '2-8 km', seaIce: 'Fast Ice — Stable', weather: 'Partly Cloudy / Storm Risk', terrain: 'Glacial High-Risk', connectivity: 'SAT-LINK (Intermittent)' };

    const setEnv = (k: keyof typeof env, v: string) =>
        set({ environmentalConditions: { ...env, [k]: v } });

    const hasPersonnel = (data.personnel?.length || 0) >= 1;
    const hasAssets = (data.assets?.length || 0) >= 1;
    const hasFuelRisk = risks.some(r => r.category === 'Fuel' || r.severity === 'HIGH' || r.severity === 'CRITICAL');
    const hasWeatherRisk = risks.some(r => r.category === 'Weather');

    return (
        <div className="space-y-5">
            {/* Environmental Conditions */}
            <div>
                <label className={L}>Expected Operational Conditions</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(env).map(([k, v]) => (
                        <div key={k} className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg p-2">
                            <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase mb-1">{k.replace(/([A-Z])/g, ' $1').toUpperCase()}</p>
                            <input className="bg-transparent text-xs font-mono text-[var(--text-primary)] w-full focus:outline-none" value={v} onChange={e => setEnv(k as keyof typeof env, e.target.value)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk Entries */}
            <div>
                <label className={L}>Operational Risks</label>
                <div className="space-y-3">
                    {risks.map((r, i) => (
                        <div key={r.id} className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-[var(--polar-cyan)] font-bold">RISK {String(i + 1).padStart(2, '0')}</span>
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${SEV_COLORS[r.severity]}`}>{r.severity}</span>
                                </div>
                                <button onClick={() => removeRisk(r.id)} className="text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div>
                                    <label className={L}>Category</label>
                                    <select className={SF} value={r.category} onChange={e => updateRisk(r.id, { category: e.target.value as MissionRisk['category'] })}>
                                        {riskCats.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={L}>Severity</label>
                                    <select className={SF} value={r.severity} onChange={e => updateRisk(r.id, { severity: e.target.value as MissionRisk['severity'] })}>
                                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={L}>Probability</label>
                                    <select className={SF} value={r.probability} onChange={e => updateRisk(r.id, { probability: e.target.value as MissionRisk['probability'] })}>
                                        {['LOW', 'MEDIUM', 'HIGH'].map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={L}>Risk Description</label>
                                    <input className={SF} placeholder="Brief risk description…" value={r.description} onChange={e => updateRisk(r.id, { description: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className={L}>Mitigation Measures</label>
                                <input className={SF} placeholder="Describe mitigation strategy…" value={r.mitigation} onChange={e => updateRisk(r.id, { mitigation: e.target.value })} />
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={addRisk} className="flex items-center gap-2 px-4 py-2 border border-dashed border-[var(--border-primary)] rounded-xl text-xs font-mono text-[var(--polar-cyan)] hover:border-[var(--polar-cyan)] hover:bg-[var(--surface-elevated)] transition cursor-pointer w-full justify-center mt-3">
                    <Plus className="w-4 h-4" /> ADD RISK
                </button>
            </div>

            {/* NORTHSTAR Operational Assessment */}
            <div className="bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">NORTHSTAR Operational Assessment</p>
                <div className="space-y-2">
                    {[
                        { ok: hasPersonnel, msg: hasPersonnel ? 'Required personnel available.' : 'No personnel assigned to this mission.' },
                        { ok: hasAssets, msg: hasAssets ? 'Required assets available.' : 'No assets assigned — review before deployment.' },
                        { ok: !hasFuelRisk, msg: hasFuelRisk ? 'Fuel reserve should be reviewed before deployment.' : 'Fuel and logistics appear adequate.' },
                        { ok: !hasWeatherRisk, msg: hasWeatherRisk ? 'Weather conditions may affect the planned operational window.' : 'No weather risks flagged at this stage.' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                            {item.ok
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                : <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
                            <span className="text-xs text-[var(--text-secondary)]">{item.msg}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
