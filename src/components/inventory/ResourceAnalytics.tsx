import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    BarChart, Bar, ReferenceLine
} from 'recharts';
import { BarChart2, TrendingDown } from 'lucide-react';
import { InventoryItem } from '../../types';

interface ResourceAnalyticsProps {
    items: InventoryItem[];
}

/* ─── DESIGN TOKENS ───────────────────────────────────────── */
const COLORS = {
    green: '#176B52',
    greenMid: '#238B63',
    greenLight: '#5D8B7A',
    ice: '#E8F3F5',
    border: '#D9E6E1',
    text: '#17231F',
    textSec: '#66756F',
    amber: '#B98224',
    red: '#B94A48',
    gridLine: '#E8F3F5',
};

const STATUS_STROKE = (status: string) => {
    if (status === 'CRITICAL') return COLORS.red;
    if (status === 'LOW') return COLORS.amber;
    return COLORS.green;
};

const CATEGORY_COLORS: Record<string, string> = {
    'Fuel': '#176B52',
    'Food & Rations': '#5D8B7A',
    'Medical': '#238B63',
    'Scientific Equipment': '#B98224',
    'Spare Parts': '#A0B4AE',
    'Communication': '#8CAEAC',
    'Field Equipment': '#6B9E91',
    'Other': '#C4D5D2',
};

/* ─── CUSTOM TOOLTIP ─────────────────────────────────────── */
const SharedTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#D9E6E1] rounded-lg p-3 shadow-md text-xs font-mono">
            {label && <p className="text-[#0F3D32] font-bold mb-1">{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color || p.fill || '#176B52' }}>
                    {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
                </p>
            ))}
        </div>
    );
};

const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div className="bg-white border border-[#D9E6E1] rounded-lg p-3 shadow-md text-xs font-mono">
            <p className="text-[#0F3D32] font-bold">{d.name}</p>
            <p style={{ color: d.payload.fill }}>{d.value.toLocaleString()} {d.payload.unit}</p>
            <p className="text-[#66756F]">{d.payload.percent}% of total</p>
        </div>
    );
};

/* ─── CHART 1 : CONSUMPTION TREND ───────────────────────── */
function ConsumptionTrend({ items }: { items: InventoryItem[] }) {
    const [selectedId, setSelectedId] = useState<string>('');

    const selected = useMemo(() => {
        if (!selectedId) return items[0];
        return items.find(i => i.id === selectedId) ?? items[0];
    }, [selectedId, items]);

    // Simulate 30-day consumption history from current stock + consumptionRate
    const historyData = useMemo(() => {
        if (!selected) return [];
        const rate = selected.consumptionRate || 0;
        const days = 30;
        const currentQty = selected.quantity;
        const data = [];
        for (let d = days; d >= 0; d--) {
            const dayLabel = d === 0 ? 'Today' : d === days ? `-${days}d` : d % 5 === 0 ? `-${d}d` : '';
            // Reverse-project: x days ago we had quantity + (rate * d)
            const qty = currentQty + rate * d;
            data.push({ day: d, label: `Day -${d}`, shortLabel: dayLabel, qty: Math.round(qty) });
        }
        return data.reverse();
    }, [selected]);

    if (items.length === 0) return null;

    return (
        <div className="bg-white border border-[#D9E6E1] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-xs font-mono font-bold text-[#0F3D32] uppercase tracking-wider">
                        RESOURCE CONSUMPTION TREND
                    </h4>
                    <p className="text-[11px] text-[#66756F] font-mono mt-0.5">Last 30 Days · Based on active consumption rate</p>
                </div>
                <select
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                    className="text-xs font-mono border border-[#D9E6E1] rounded-lg px-2.5 py-1.5 bg-[#F7FAF8] text-[#17231F] focus:outline-none focus:border-[#176B52]"
                >
                    {items.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                </select>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={historyData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: COLORS.textSec, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(_, i) => {
                            if (i === 0) return '−30d';
                            if (i === historyData.length - 1) return 'Today';
                            if (i % 5 === 0) return `−${30 - i}d`;
                            return '';
                        }}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: COLORS.textSec, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                        width={40}
                    />
                    <Tooltip content={<SharedTooltip />} />
                    {selected && (
                        <>
                            <ReferenceLine
                                y={selected.minimumThreshold}
                                stroke={COLORS.amber}
                                strokeDasharray="4 3"
                                strokeWidth={1}
                                label={{ value: 'MIN', position: 'insideTopRight', fontSize: 9, fill: COLORS.amber, fontFamily: 'monospace' }}
                            />
                            <ReferenceLine
                                y={selected.criticalThreshold}
                                stroke={COLORS.red}
                                strokeDasharray="4 3"
                                strokeWidth={1}
                                label={{ value: 'CRIT', position: 'insideTopRight', fontSize: 9, fill: COLORS.red, fontFamily: 'monospace' }}
                            />
                        </>
                    )}
                    <Line
                        type="monotone"
                        dataKey="qty"
                        name={selected?.name ?? 'Quantity'}
                        stroke={selected ? STATUS_STROKE(selected.status) : COLORS.green}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: COLORS.green }}
                    />
                </LineChart>
            </ResponsiveContainer>

            {selected && (
                <div className="mt-3 flex items-center gap-5 text-[11px] font-mono text-[#66756F] border-t border-[#D9E6E1] pt-2.5">
                    <span><span className="font-bold text-[#17231F]">Current:</span> {selected.quantity.toLocaleString()} {selected.unit}</span>
                    <span><span className="font-bold text-[#17231F]">Burn Rate:</span> {selected.consumptionRate}/{selected.unit[0]}/day</span>
                    <span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${selected.status === 'HEALTHY' ? 'bg-[#238B63]/10 text-[#238B63]' : selected.status === 'LOW' ? 'bg-[#B98224]/10 text-[#B98224]' : 'bg-[#B94A48]/10 text-[#B94A48]'}`}>
                            {selected.status}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
}

/* ─── CHART 2 : INVENTORY COMPOSITION ───────────────────── */
function InventoryComposition({ items }: { items: InventoryItem[] }) {
    // Group by category, summing quantity
    const catData = useMemo(() => {
        const map: Record<string, { qty: number; unit: string }> = {};
        items.forEach(i => {
            if (!map[i.category]) map[i.category] = { qty: 0, unit: i.unit };
            map[i.category].qty += i.quantity;
        });
        const total = Object.values(map).reduce((s, v) => s + v.qty, 0);
        return Object.entries(map).map(([cat, { qty, unit }]) => ({
            name: cat,
            value: qty,
            unit,
            fill: CATEGORY_COLORS[cat] ?? COLORS.greenLight,
            percent: total > 0 ? Math.round((qty / total) * 100) : 0,
        }));
    }, [items]);

    const total = catData.reduce((s, d) => s + d.value, 0);

    return (
        <div className="bg-white border border-[#D9E6E1] rounded-xl p-5 shadow-xs">
            <div className="mb-3">
                <h4 className="text-xs font-mono font-bold text-[#0F3D32] uppercase tracking-wider">
                    INVENTORY COMPOSITION
                </h4>
                <p className="text-[11px] text-[#66756F] font-mono mt-0.5">Distribution by resource category</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={catData}
                                cx="50%"
                                cy="50%"
                                innerRadius="58%"
                                outerRadius="82%"
                                dataKey="value"
                                paddingAngle={2}
                            >
                                {catData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1.5 text-[11px] font-mono min-w-[130px]">
                    <div className="mb-1 pb-1.5 border-b border-[#D9E6E1]">
                        <p className="text-[10px] text-[#66756F] uppercase">Total Units</p>
                        <p className="text-base font-bold text-[#0F3D32]">{total.toLocaleString()}</p>
                    </div>
                    {catData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                            <span className="text-[#66756F] truncate">{d.name}</span>
                            <span className="ml-auto font-bold text-[#17231F]">{d.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── CHART 3 : STOCK VS THRESHOLD ─────────────────────── */
function StockVsThreshold({ items }: { items: InventoryItem[] }) {
    // Show top items by relevance (those closest to threshold first, then healthy)
    const barData = useMemo(() => {
        return [...items]
            .sort((a, b) => {
                // Prioritize critical > low > healthy
                const order = { CRITICAL: 0, LOW: 1, DEPLETED: 0, HEALTHY: 2 };
                return (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3);
            })
            .slice(0, 7)
            .map(i => ({
                name: i.name.length > 18 ? i.name.slice(0, 16) + '…' : i.name,
                stock: i.quantity,
                min: i.minimumThreshold,
                crit: i.criticalThreshold,
                status: i.status,
                unit: i.unit,
            }));
    }, [items]);

    const CustomBar = (props: any) => {
        const { x, y, width, height, status } = props;
        const fill = status === 'CRITICAL' ? COLORS.red : status === 'LOW' ? COLORS.amber : COLORS.green;
        return <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} />;
    };

    return (
        <div className="bg-white border border-[#D9E6E1] rounded-xl p-5 shadow-xs">
            <div className="mb-3">
                <h4 className="text-xs font-mono font-bold text-[#0F3D32] uppercase tracking-wider">
                    RESOURCE HEALTH
                </h4>
                <p className="text-[11px] text-[#66756F] font-mono mt-0.5">Stock vs. minimum and critical thresholds</p>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} horizontal={false} />
                    <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: COLORS.textSec, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fontSize: 10, fill: COLORS.text, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<SharedTooltip />} />
                    <Bar dataKey="stock" name="Stock" shape={<CustomBar />} />
                    <Bar dataKey="min" name="Min. Threshold" fill={COLORS.amber} opacity={0.45} radius={[0, 2, 2, 0]} />
                    <Bar dataKey="crit" name="Crit. Threshold" fill={COLORS.red} opacity={0.45} radius={[0, 2, 2, 0]} />
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-2.5 flex items-center gap-4 text-[10px] font-mono text-[#66756F] border-t border-[#D9E6E1] pt-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#176B52]" /> Current Stock</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#B98224] opacity-60" /> Min. Threshold</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#B94A48] opacity-60" /> Crit. Threshold</span>
            </div>
        </div>
    );
}

/* ─── CHART 4 : 30-DAY DEPLETION FORECAST ──────────────── */
function DepletionForecast({ items }: { items: InventoryItem[] }) {
    const [selectedId, setSelectedId] = useState<string>('');

    const selected = useMemo(() => {
        if (!selectedId) return items[0];
        return items.find(i => i.id === selectedId) ?? items[0];
    }, [selectedId, items]);

    const forecastData = useMemo(() => {
        if (!selected) return [];
        const rate = selected.consumptionRate || 0;
        const data = [];
        for (let d = 0; d <= 30; d++) {
            const projected = Math.max(0, selected.quantity - rate * d);
            data.push({
                day: d,
                label: d === 0 ? 'Today' : `+${d}d`,
                projected: Math.round(projected),
                min: selected.minimumThreshold,
                crit: selected.criticalThreshold,
            });
        }
        return data;
    }, [selected]);

    // Find first day projected hits critical threshold
    const critDay = useMemo(() => {
        if (!selected || selected.consumptionRate <= 0) return null;
        const days = Math.floor((selected.quantity - selected.criticalThreshold) / selected.consumptionRate);
        return days > 0 && days <= 30 ? days : null;
    }, [selected]);

    if (items.length === 0) return null;

    return (
        <div className="bg-white border border-[#D9E6E1] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-xs font-mono font-bold text-[#0F3D32] uppercase tracking-wider">
                        30-DAY RESOURCE FORECAST
                    </h4>
                    <p className="text-[11px] text-[#66756F] font-mono mt-0.5">Projected resource level based on current burn rate</p>
                </div>
                <select
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                    className="text-xs font-mono border border-[#D9E6E1] rounded-lg px-2.5 py-1.5 bg-[#F7FAF8] text-[#17231F] focus:outline-none focus:border-[#176B52]"
                >
                    {items.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                </select>
            </div>

            {critDay !== null && (
                <div className="mb-3 px-3 py-2 bg-[#B94A48]/8 border border-[#B94A48]/25 rounded-lg text-[11px] font-mono text-[#B94A48] flex items-center gap-2">
                    <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                    <span>Projected to reach <strong>CRITICAL THRESHOLD</strong> in <strong>{critDay} days</strong> at current burn rate.</span>
                </div>
            )}

            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={forecastData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: COLORS.textSec, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: COLORS.textSec, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                        width={40}
                    />
                    <Tooltip content={<SharedTooltip />} />
                    <ReferenceLine
                        y={selected?.minimumThreshold}
                        stroke={COLORS.amber}
                        strokeDasharray="5 4"
                        strokeWidth={1.5}
                        label={{ value: 'MINIMUM', position: 'insideTopRight', fontSize: 9, fill: COLORS.amber, fontFamily: 'monospace' }}
                    />
                    <ReferenceLine
                        y={selected?.criticalThreshold}
                        stroke={COLORS.red}
                        strokeDasharray="5 4"
                        strokeWidth={1.5}
                        label={{ value: 'CRITICAL', position: 'insideTopRight', fontSize: 9, fill: COLORS.red, fontFamily: 'monospace' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="projected"
                        name="Projected Stock"
                        stroke={critDay !== null ? COLORS.red : COLORS.green}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: COLORS.green }}
                        strokeDasharray={critDay !== null ? undefined : undefined}
                    />
                </LineChart>
            </ResponsiveContainer>

            {selected && (
                <div className="mt-3 flex items-center gap-5 text-[11px] font-mono text-[#66756F] border-t border-[#D9E6E1] pt-2.5">
                    <span><span className="font-bold text-[#17231F]">Current:</span> {selected.quantity.toLocaleString()} {selected.unit}</span>
                    <span><span className="font-bold text-[#17231F]">Burn Rate:</span> {selected.consumptionRate}/{selected.unit[0]}/day</span>
                    <span><span className="font-bold text-[#17231F]">Day 30 Est.:</span> {Math.max(0, selected.quantity - selected.consumptionRate * 30).toLocaleString()} {selected.unit}</span>
                </div>
            )}
        </div>
    );
}

/* ─── MAIN EXPORT ────────────────────────────────────────── */
export const ResourceAnalytics: React.FC<ResourceAnalyticsProps> = ({ items }) => {
    if (items.length === 0) return null;

    return (
        <div className="space-y-5">
            {/* Section Header */}
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-subtle)]">
                <BarChart2 className="w-5 h-5 text-[#176B52] shrink-0" />
                <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-wide">
                        Resource Analytics
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                        Live resource visibility and 30-day operational forecasting
                    </p>
                </div>
            </div>

            {/* Row 1: Full-width Consumption Trend */}
            <ConsumptionTrend items={items} />

            {/* Row 2: Two side-by-side charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InventoryComposition items={items} />
                <StockVsThreshold items={items} />
            </div>

            {/* Row 3: Full-width Depletion Forecast */}
            <DepletionForecast items={items} />
        </div>
    );
};
