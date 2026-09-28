import React, { useState } from 'react';
import { X, Plus, Minus, ArrowRightLeft, Crosshair, AlertTriangle, TrendingDown } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../../types';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useMissionStore } from '../../stores/useMissionStore';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useThemeStore } from '../../stores/useThemeStore';

const SF = 'bg-[var(--surface-input)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] w-full focus:outline-none focus:border-[var(--polar-cyan)] font-sans';
const L = 'text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] block mb-1.5';

// ── Add Item Modal ────────────────────────────────────────────────────────
export const AddInventoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addItem } = useInventoryStore();
    const [data, setData] = useState<Partial<InventoryItem>>({
        name: '', category: 'Spare Parts', quantity: 0, unit: 'units', location: '',
        minimumThreshold: 0, criticalThreshold: 0, consumptionRate: 0, reservedQuantity: 0
    });

    const h = (k: keyof InventoryItem, v: any) => setData({ ...data, [k]: v });

    const cats: InventoryCategory[] = ['Fuel', 'Food & Rations', 'Medical', 'Scientific Equipment', 'Spare Parts', 'Communication', 'Field Equipment', 'Research Supplies', 'Other'];

    const submit = () => {
        if (!data.name || !data.location) return;
        addItem({
            id: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
            name: data.name,
            category: data.category as InventoryCategory,
            quantity: Number(data.quantity),
            unit: data.unit || 'units',
            location: data.location,
            minimumThreshold: Number(data.minimumThreshold),
            criticalThreshold: Number(data.criticalThreshold),
            consumptionRate: Number(data.consumptionRate),
            reservedQuantity: 0,
            status: 'HEALTHY',
            lastUpdated: new Date().toISOString()
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl w-full max-w-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase flex items-center gap-2"><Plus className="w-5 h-5 text-[var(--polar-cyan)]" /> ADD INVENTORY</h2>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-rose-400 transition"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="col-span-2"><label className={L}>Item Name</label><input className={SF} value={data.name} onChange={e => h('name', e.target.value)} placeholder="e.g. Jet A-1 Fuel" /></div>
                    <div><label className={L}>Category</label><select className={SF} value={data.category} onChange={e => h('category', e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label className={L}>Location</label><input className={SF} value={data.location} onChange={e => h('location', e.target.value)} placeholder="e.g. Bharati Station" /></div>
                    <div><label className={L}>Quantity</label><input type="number" className={SF} value={data.quantity} onChange={e => h('quantity', e.target.value)} /></div>
                    <div><label className={L}>Unit</label><input className={SF} value={data.unit} onChange={e => h('unit', e.target.value)} placeholder="L, kg, pieces" /></div>
                    <div><label className={L}>Minimum Threshold</label><input type="number" className={SF} value={data.minimumThreshold} onChange={e => h('minimumThreshold', e.target.value)} /></div>
                    <div><label className={L}>Critical Threshold</label><input type="number" className={SF} value={data.criticalThreshold} onChange={e => h('criticalThreshold', e.target.value)} /></div>
                    <div className="col-span-2"><label className={L}>Consumption Rate / Day</label><input type="number" className={SF} value={data.consumptionRate} onChange={e => h('consumptionRate', e.target.value)} /></div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                    <button onClick={onClose} className="px-4 py-2 border border-[var(--border-primary)] rounded-lg text-xs font-mono text-[var(--text-secondary)] hover:text-white transition">CANCEL</button>
                    <button onClick={submit} className="px-6 py-2 bg-[var(--polar-cyan)] text-[#0a0a09] rounded-lg text-xs font-mono font-bold hover:bg-cyan-400 transition">ADD ITEM</button>
                </div>
            </div>
        </div>
    );
};

// ── Adjust Stock Modal ───────────────────────────────────────────────────
export const AdjustStockModal: React.FC<{ item: InventoryItem; onClose: () => void }> = ({ item, onClose }) => {
    const { adjustStock } = useInventoryStore();
    const [val, setVal] = useState(0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase flex items-center gap-2"><ArrowRightLeft className="w-5 h-5 text-[var(--polar-cyan)]" /> ADJUST STOCK</h2>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-rose-400 transition"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg mb-6 text-center">
                    <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">CURRENT QUANTITY</p>
                    <p className="text-2xl font-bold text-[var(--polar-cyan)] font-mono">{item.quantity.toLocaleString()} {item.unit}</p>
                </div>
                <label className={L}>Adjustment Amount</label>
                <input type="number" className={SF + ' mb-6 text-xl h-12 text-center'} value={val} onChange={e => setVal(Number(e.target.value))} />
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { adjustStock(item.id, item.quantity + val); onClose(); }} className="p-3 border border-[var(--border-primary)] rounded-lg hover:border-emerald-500 hover:text-emerald-500 transition text-xs font-mono font-bold flex flex-col items-center gap-2 text-[var(--text-secondary)]"><Plus className="w-4 h-4" /> ADD</button>
                    <button onClick={() => { adjustStock(item.id, item.quantity - val); onClose(); }} className="p-3 border border-[var(--border-primary)] rounded-lg hover:border-amber-500 hover:text-amber-500 transition text-xs font-mono font-bold flex flex-col items-center gap-2 text-[var(--text-secondary)]"><Minus className="w-4 h-4" /> CONSUME</button>
                    <button onClick={() => { adjustStock(item.id, val); onClose(); }} className="p-3 border border-[var(--border-primary)] rounded-lg hover:border-[var(--polar-cyan)] hover:text-[var(--polar-cyan)] transition text-xs font-mono font-bold flex flex-col items-center gap-2 text-[var(--text-secondary)]"><ArrowRightLeft className="w-4 h-4" /> EXACT</button>
                </div>
            </div>
        </div>
    );
};

// ── Allocate Modal ───────────────────────────────────────────────────────
export const AllocateModal: React.FC<{ item: InventoryItem; onClose: () => void }> = ({ item, onClose }) => {
    const missions = useMissionStore(s => s.missions).filter(m => m.status === 'PLANNED' || m.status === 'READY');
    const { allocateToMission } = useInventoryStore();
    const [val, setVal] = useState(0);
    const [missionId, setMissionId] = useState(missions[0]?.id || '');

    const avail = item.quantity - (item.reservedQuantity || 0);

    const submit = () => {
        if (!missionId || val <= 0) return;
        allocateToMission(item.id, val);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase flex items-center gap-2"><Crosshair className="w-5 h-5 text-[var(--polar-cyan)]" /> RESERVE INVENTORY</h2>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-rose-400 transition"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg mb-4 text-center">
                    <p className="text-[10px] font-mono text-[var(--text-secondary)]">AVAILABLE FOR ALLOCATION</p>
                    <p className="text-xl font-bold text-emerald-400 font-mono">{avail.toLocaleString()} {item.unit}</p>
                </div>
                <div className="space-y-4 mb-6">
                    <div><label className={L}>Mission</label><select className={SF} value={missionId} onChange={e => setMissionId(e.target.value)}>
                        {missions.length === 0 && <option value="">No Active/Planned Missions</option>}
                        {missions.map(m => <option key={m.id} value={m.id}>{m.id} — {m.name}</option>)}
                    </select></div>
                    <div><label className={L}>Allocate Quantity</label><input type="number" className={SF} max={avail} value={val} onChange={e => setVal(Number(e.target.value))} /></div>
                </div>
                <button onClick={submit} disabled={!missionId || val <= 0 || val > avail} className="w-full py-3 bg-[var(--polar-cyan)] text-[#0a0a09] border border-[var(--polar-cyan)] rounded-xl text-sm font-mono font-bold hover:bg-cyan-400 transition disabled:opacity-50 cursor-pointer">ALLOCATE TO MISSION</button>
            </div>
        </div>
    );
};

// ── Detail Modal ─────────────────────────────────────────────────────────
export const DetailModal: React.FC<{ item: InventoryItem; onClose: () => void }> = ({ item, onClose }) => {
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';
    const avail = item.quantity - (item.reservedQuantity || 0);
    const depDays = (item.consumptionRate > 0 && avail > 0) ? Math.floor(avail / item.consumptionRate) : 999;

    // mock 7 days data
    const chart = Array.from({ length: 7 }).map((_, i) => ({
        day: `D-${7 - i}`,
        consumed: Math.max(0, item.consumptionRate + (Math.random() * item.consumptionRate * 0.4 - item.consumptionRate * 0.2))
    }));

    const maxW = Math.max(item.quantity, item.minimumThreshold * 1.5);
    const wCur = (item.quantity / maxW) * 100;
    const wMin = (item.minimumThreshold / maxW) * 100;
    const wCrit = (item.criticalThreshold / maxW) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl w-full max-w-2xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                    <div><span className="text-[10px] font-mono text-[var(--polar-cyan)] font-bold tracking-wider">{item.category.toUpperCase()} | {item.id}</span>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase">{item.name}</h2></div>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition"><X className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[['TOTAL STOCK', item.quantity, 'var(--polar-cyan)'], ['RESERVED', item.reservedQuantity || 0, 'var(--text-secondary)'], ['AVAILABLE', avail, 'var(--emerald-500, #10b981)'], ['CONSUMPTION', `${item.consumptionRate}/day`, 'var(--amber-500, #f59e0b)']].map(([l, v, c], i) =>
                        <div key={i} className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg">
                            <span className={L}>{l}</span>
                            <span className="text-lg font-bold font-mono" style={{ color: c as string }}>{v.toLocaleString()} <span className="text-[10px]">{item.unit}</span></span>
                        </div>
                    )}
                </div>

                <div>
                    <span className={L}>THRESHOLDS & STATUS: <span className="text-[var(--text-primary)]">{item.status}</span></span>
                    <div className="relative h-4 mt-8 bg-[var(--surface-input)] rounded-full border border-[var(--border-subtle)] w-full overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-0 bg-[var(--polar-cyan)] transition-all" style={{ width: `${wCur}%` }} />
                        <div className="absolute top-0 bottom-0 bg-amber-500 w-1 shadow-lg" style={{ left: `${wMin}%` }} title="Minimum Threshold" />
                        <div className="absolute top-0 bottom-0 bg-rose-500 w-1 shadow-lg" style={{ left: `${wCrit}%` }} title="Critical Threshold" />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono mt-1 px-1 opacity-60">
                        <span>0</span>
                        <span>CRIT ({item.criticalThreshold})</span>
                        <span>MIN ({item.minimumThreshold})</span>
                        <span>MAX ({Math.round(maxW)})</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[var(--border-subtle)]">
                    <div className="md:col-span-2">
                        <span className={L}><TrendingDown className="w-3 h-3 inline mr-1" /> 7-DAY CONSUMPTION</span>
                        <div className="h-28 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chart} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                                    <XAxis dataKey="day" tick={{ fill: isDark ? '#94A3B8' : '#64748b', fontSize: 9 }} />
                                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#0F172A' : '#fff', fontSize: '10px' }} />
                                    <Bar dataKey="consumed" fill="var(--polar-cyan)" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="p-4 bg-[var(--surface-elevated)] border border-[var(--border-primary)] rounded-xl text-center">
                            <span className={L}>EST. DEPLETION</span>
                            <p className="text-3xl font-bold font-mono py-1 text-emerald-400">{depDays} <span className="text-xs">DAYS</span></p>
                            {depDays < 30 && <p className="text-[10px] text-amber-500 mt-2 font-mono"><AlertTriangle className="w-3 h-3 inline pb-px" /> Resupply Window Open</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
