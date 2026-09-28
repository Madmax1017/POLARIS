import React, { useState, useEffect } from 'react';
import { X, Cpu, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Mission, InventoryItem } from '../../types';
import { useInventoryStore } from '../../stores/useInventoryStore';

const L = 'text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] block mb-1';
const Divider = () => <div className="border-t border-dashed border-[var(--border-subtle)] my-4 w-full" />;

export const NorthstarIntelligenceModal: React.FC<{ mission: Mission; onClose: () => void }> = ({ mission, onClose }) => {
    const [analyzing, setAnalyzing] = useState(true);
    const { items } = useInventoryStore();

    useEffect(() => {
        // Artificial delay to feel like "generating" analysis
        const t = setTimeout(() => setAnalyzing(false), 1500);
        return () => clearTimeout(t);
    }, []);

    // -- Heuristics Engine --
    let personnelStatus = { ok: true, msg: 'Personnel available' };
    let assetStatus = { ok: true, msg: 'Assets available' };
    let routeStatus = { ok: true, msg: 'Current planned route is operational.' };
    let logisticsStatus = { ok: true, msg: 'Cargo requirements met.', count: mission.cargo.length, ready: 0 };
    let overall = 'HIGH'; // HIGH, MODERATE, LOW

    if (mission.personnel.length === 0) { personnelStatus = { ok: false, msg: 'No personnel assigned' }; overall = 'LOW'; }
    if (mission.assets.length === 0) { assetStatus = { ok: false, msg: 'No assets assigned' }; overall = 'LOW'; }
    if (mission.risks.some(r => r.category === 'Weather' && ['HIGH', 'CRITICAL'].includes(r.severity))) {
        routeStatus = { ok: false, msg: 'Potential weather deterioration may affect the return window.' };
        overall = overall === 'HIGH' ? 'MODERATE' : overall;
    }

    // Inventory matching mock logic
    type AnalysisRow = { item: string; req: number; unit: string; matchedItem?: InventoryItem; projectedQty?: number; projectedStatus?: string; warning?: string };
    const inventoryImpacts: AnalysisRow[] = mission.cargo.map(c => {
        // try to find matching inventory item by category
        const matches = items.filter(i => i.category === c.category);
        const matched = matches[0]; // simplistic mock mapping

        if (matched) {
            logisticsStatus.ready++;
            const proj = matched.quantity - c.quantity;
            let pStatus = 'HEALTHY';
            if (proj <= 0) pStatus = 'DEPLETED';
            else if (proj <= matched.criticalThreshold) pStatus = 'CRITICAL';
            else if (proj <= matched.minimumThreshold) pStatus = 'LOW';

            let warn = '';
            if (pStatus === 'DEPLETED' || pStatus === 'CRITICAL') warn = `Operation will cause critical depletion of ${matched.name}.`;

            return { item: c.item, req: c.quantity, unit: c.unit, matchedItem: matched, projectedQty: Math.max(0, proj), projectedStatus: pStatus, warning: warn };
        }
        return { item: c.item, req: c.quantity, unit: c.unit, warning: 'No matching tracking inventory found.' };
    });

    const warnings = inventoryImpacts.filter(i => i.warning).map(i => i.warning!);
    if (warnings.length > 0) overall = overall === 'HIGH' ? 'MODERATE' : overall;
    if (mission.overallReadiness === 'NOT READY') overall = 'LOW';

    // Date formatter using real current time
    const now = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-[#0f1115] border border-[var(--border-subtle)] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]">
                    <div className="flex items-center gap-2 text-[var(--polar-cyan)]">
                        <Cpu className={`w-5 h-5 ${analyzing ? 'animate-pulse' : ''}`} />
                        <span className="font-mono font-bold tracking-widest text-xs">NORTHSTAR INTELLIGENCE</span>
                    </div>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 overflow-y-auto font-mono text-sm space-y-5 text-[var(--text-secondary)]">

                    {analyzing ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Cpu className="w-12 h-12 text-[var(--polar-cyan)] animate-ping absolute mb-6" />
                            <Cpu className="w-12 h-12 text-[var(--polar-cyan)] mb-6" />
                            <p className="animate-pulse tracking-widest text-[var(--text-primary)]">ANALYZING MISSION PROFILE...</p>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div><span className={L}>MISSION</span><span className="text-[var(--text-primary)]">{mission.name}</span></div>
                                <div><span className={L}>MISSION ID</span><span className="text-[var(--polar-cyan)]">{mission.id}</span></div>
                                <div className="col-span-2"><span className={L}>ANALYSIS GENERATED</span><span>{now}</span></div>
                            </div>

                            <Divider />

                            <div className="space-y-1">
                                <span className={L}>OPERATIONAL READINESS</span>
                                <p className={`text-lg font-bold ${overall === 'HIGH' ? 'text-emerald-400' : overall === 'MODERATE' ? 'text-amber-400' : 'text-rose-400'}`}>{overall}</p>
                                <p className="mt-1">
                                    {overall === 'HIGH' ? 'The mission is fully resourced and can proceed.' :
                                        overall === 'MODERATE' ? 'The mission can proceed, but specific inventory or risk constraints require review before deployment.' :
                                            'The mission lacks critical resources or personnel and is not recommended for deployment.'}
                                </p>
                            </div>

                            <Divider />

                            <div className="space-y-3">
                                <span className={L}>RESOURCE ASSESSMENT</span>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        {personnelStatus.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                                        <span className={personnelStatus.ok ? 'text-[var(--text-primary)]' : 'text-rose-400'}>{personnelStatus.msg}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {assetStatus.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                                        <span className={assetStatus.ok ? 'text-[var(--text-primary)]' : 'text-rose-400'}>{assetStatus.msg}</span>
                                    </div>
                                    {warnings.length === 0 && (
                                        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-[var(--text-primary)]">Inventory allocations healthy</span></div>
                                    )}
                                    {warnings.map((w, i) => (
                                        <div key={i} className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-amber-400">{w}</span></div>
                                    ))}
                                </div>
                            </div>

                            <Divider />

                            <div className="space-y-4">
                                <span className={L}>INVENTORY IMPACT</span>
                                {inventoryImpacts.length === 0 ? <p className="opacity-50">No inventory impact identified.</p> :
                                    inventoryImpacts.map((imp, i) => (
                                        <div key={i} className="bg-[var(--surface-primary)] p-3 rounded-lg border border-[var(--border-subtle)] space-y-2 text-xs">
                                            <p className="font-bold text-[var(--text-primary)] text-sm">{imp.matchedItem?.name || imp.item}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {imp.matchedItem && <div><span className="opacity-60 block">Current available:</span><span className="text-[var(--text-primary)]">{imp.matchedItem.quantity} {imp.matchedItem.unit}</span></div>}
                                                <div><span className="opacity-60 block">Mission requirement:</span><span className="text-[var(--text-primary)]">{imp.req} {imp.unit}</span></div>
                                                {imp.matchedItem && <div><span className="opacity-60 block">Projected remaining:</span><span className="font-bold text-[var(--polar-cyan)]">{imp.projectedQty} {imp.matchedItem.unit}</span></div>}
                                                {imp.matchedItem && <div><span className="opacity-60 block">Projected status:</span><span className={`font-bold ${imp.projectedStatus === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}`}>{imp.projectedStatus}</span></div>}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            <Divider />

                            <div className="space-y-2">
                                <span className={L}>LOGISTICS & ROUTE</span>
                                <p>Cargo availability: <strong className={logisticsStatus.ready === logisticsStatus.count ? 'text-emerald-400' : 'text-amber-400'}>{logisticsStatus.ready === logisticsStatus.count ? 'COMPLETE' : 'PARTIAL'}</strong></p>
                                <p className="opacity-70">
                                    Required cargo: {logisticsStatus.count} items<br />
                                    Ready: {logisticsStatus.ready} / Pending: {logisticsStatus.count - logisticsStatus.ready}
                                </p>
                                <p className="mt-2 text-amber-400">{routeStatus.ok ? '' : routeStatus.msg}</p>
                            </div>

                            <Divider />

                            {mission.risks.length > 0 && (
                                <div className="space-y-2">
                                    <span className={L}>RISKS</span>
                                    {mission.risks.map((r, i) => (
                                        <p key={i}>
                                            {i + 1}. {r.category} —
                                            <span className={r.severity === 'CRITICAL' ? 'text-rose-400 ml-1' : r.severity === 'HIGH' ? 'text-orange-400 ml-1' : 'text-emerald-400 ml-1'}>
                                                Severity: {r.severity}
                                            </span>
                                        </p>
                                    ))}
                                    <Divider />
                                </div>
                            )}

                            <div className="space-y-3">
                                <span className={L}>RECOMMENDED ACTIONS</span>
                                <ol className="list-decimal pl-4 space-y-1 space-y-2 text-[var(--text-primary)]">
                                    {warnings.map((w, i) => <li key={`w-${i}`}>{w.replace('Operation will cause critical depletion of', 'Verify critical reserve levels for')}</li>)}
                                    {!routeStatus.ok && <li>Review weather conditions before final deployment.</li>}
                                    {mission.personnel.length === 0 && <li>Assign mission personnel and commander.</li>}
                                    <li>Maintain offline operational mode readiness.</li>
                                </ol>
                            </div>

                        </div>
                    )}

                </div>

                {/* Footer */}
                {!analyzing && (
                    <div className="p-4 bg-[var(--surface-elevated)] border-t border-[var(--border-subtle)] flex items-center justify-between">
                        <span className={L + ' !mb-0'}>COMMANDER DECISION</span>
                        <button onClick={onClose} className="px-5 py-2 bg-[var(--polar-cyan)] text-[#0a0a09] font-mono font-bold text-xs rounded-lg hover:bg-cyan-400 transition cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.2)]">READY FOR REVIEW</button>
                    </div>
                )}
            </div>
        </div>
    );
};
