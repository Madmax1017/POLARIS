import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Compass,
    Users,
    Package,
    Truck,
    ShieldAlert,
    ArrowRight,
    Globe,
    Activity,
    Cloud,
    Radio,
    MapPin,
    TrendingUp,
    AlertTriangle,
    ChevronRight,
    BarChart3,
    Wifi,
    Database,
    RefreshCw,
    CalendarDays,
    Clock,
    CheckCircle2,
    Zap,
} from 'lucide-react';
import {
    COMMANDER_METRICS,
    COMMANDER_EXPEDITIONS,
    RESOURCE_FORECASTS,
    WEATHER_NODES,
    COMMAND_PRIORITIES,
    INTEL_RECOMMENDATIONS,
    LOGISTICS_STATUS,
    ACTIVE_ROUTES,
    COMMAND_ACTIVITY,
    SYSTEM_STATUS,
} from '../data/commanderData';
import { MOCK_ALERTS } from '../data/mockData';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useThemeStore } from '../stores/useThemeStore';
import { useNetworkStore } from '../stores/useNetworkStore';

// ─── Animated Metric counter-up hook ──────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
    const [count, setCount] = useState(0);
    const raf = useRef<number>(0);
    useEffect(() => {
        const start = performance.now();
        const animate = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            setCount(Math.round(ease * target));
            if (t < 1) raf.current = requestAnimationFrame(animate);
        };
        raf.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);
    return count;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = 'var(--polar-cyan)' }: { pct: number; color?: string }) {
    return (
        <div className="h-1 w-full rounded-full bg-[var(--surface-elevated)] overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, pct)}%`, background: color }}
            />
        </div>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function SeverityBadge({ sev }: { sev: string }) {
    const map: Record<string, string> = {
        CRITICAL: 'bg-[var(--status-critical)]/15 text-[var(--status-critical)] border-[var(--status-critical)]/30',
        HIGH: 'bg-[var(--status-warning)]/15 text-[var(--status-warning)] border-[var(--status-warning)]/30',
        WARNING: 'bg-[var(--status-warning)]/10 text-[var(--status-warning)] border-[var(--status-warning)]/20',
        INFO: 'bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border-[var(--polar-cyan)]/20',
    };
    return (
        <span className={`text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border ${map[sev] ?? map['INFO']}`}>
            {sev}
        </span>
    );
}

// ─── Leaflet custom icon ──────────────────────────────────────────────────────
function makeIcon(color: string, label: string, pulse = false) {
    return L.divIcon({
        className: 'custom-polar-marker',
        html: `<div class="relative">
      <div style="background:${color};border:2px solid rgba(255,255,255,0.35);border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:white;font-family:monospace;letter-spacing:0.05em">
        ${label.slice(0, 3)}
      </div>
      ${pulse ? '<span style="position:absolute;top:-2px;right:-2px;width:10px;height:10px;background:#C85C62;border-radius:50%;animation:ping 1s cubic-bezier(0,0,0.2,1) infinite"></span>' : ''}
    </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
    });
}

// ─── Status Expedition pill ───────────────────────────────────────────────────
function ExpStatusPill({ status }: { status: string }) {
    const c: Record<string, string> = {
        ACTIVE: 'text-[var(--status-success)] bg-[var(--status-success)]/10 border-[var(--status-success)]/20',
        TRANSIT: 'text-[var(--polar-cyan)] bg-[var(--polar-cyan)]/10 border-[var(--polar-cyan)]/20',
        WEATHER_HOLD: 'text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/20',
        STANDBY: 'text-[var(--text-muted)] bg-[var(--surface-elevated)] border-[var(--border-primary)]',
    };
    const label: Record<string, string> = {
        ACTIVE: '● ACTIVE', TRANSIT: '● TRANSIT', WEATHER_HOLD: '⚠ HOLD', STANDBY: '○ STANDBY',
    };
    return (
        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${c[status] ?? c['STANDBY']}`}>
            {label[status] ?? status}
        </span>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const CommanderDashboardPage: React.FC = () => {
    const { theme } = useThemeStore();
    const { isOnline, lastSyncTime } = useNetworkStore();
    const isDark = theme === 'dark';

    const [mapFilter, setMapFilter] = useState<'ALL' | 'EXPEDITIONS' | 'STATIONS' | 'CARGO' | 'ALERTS'>('ALL');
    const [tileError, setTileError] = useState(false);

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ').toUpperCase();

    // Animated metric values
    const cntExp = useCountUp(COMMANDER_METRICS.activeExpeditions);
    const cntPers = useCountUp(COMMANDER_METRICS.personnelDeployed);
    const cntAss = useCountUp(COMMANDER_METRICS.activeAssets);
    const cntCargo = useCountUp(COMMANDER_METRICS.cargoInTransit);
    const cntWx = useCountUp(COMMANDER_METRICS.weatherRisks);
    const cntAlerts = useCountUp(COMMANDER_METRICS.criticalAlerts);

    // Map tile URL — Stadia Alidade Smooth Dark/Light (free, no API key required)
    const tileUrl = isDark
        ? `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png`
        : `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png`;

    // Station markers data
    const stationMarkers = [
        { id: 'maitri', lat: -70.7667, lng: 11.7333, label: 'MTR', color: '#C85C62', pulse: true },
        { id: 'bharati', lat: -69.4075, lng: 76.1958, label: 'BHT', color: '#C49A55', pulse: false },
        { id: 'himadri', lat: 78.9233, lng: 11.9333, label: 'HMD', color: '#63A68A', pulse: false },
        { id: 'ncpor', lat: 15.391, lng: 73.805, label: 'HQ', color: '#A8C7D1', pulse: false },
    ];

    // Expedition route lines
    const routes: [number, number][][] = [
        [[-70.7667, 11.7333], [-72.5, 6.0], [-73.9, 2.1]],    // Schirmacher
        [[-69.4075, 76.1958], [-70.0, 50.0], [-70.7667, 11.7333]], // Bharati→Maitri
        [[78.9233, 11.9333], [78.5, 15.0], [78.2, 18.0]],     // Svalbard
    ];

    // ─ Resource color helper
    const rColor = (status: string) => {
        if (status === 'CRITICAL') return 'var(--status-critical)';
        if (status === 'WARNING') return 'var(--status-warning)';
        return 'var(--polar-cyan)';
    };

    // ─ Weather risk color
    const wxColor = (risk: string) => {
        if (risk === 'EXTREME') return 'text-[var(--status-critical)]';
        if (risk === 'HIGH') return 'text-rose-400';
        if (risk === 'MODERATE') return 'text-[var(--status-warning)]';
        return 'text-[var(--status-success)]';
    };

    const wxBg = (risk: string) => {
        if (risk === 'EXTREME') return 'border-l-[var(--status-critical)]';
        if (risk === 'HIGH') return 'border-l-rose-400';
        if (risk === 'MODERATE') return 'border-l-[var(--status-warning)]';
        return 'border-l-[var(--status-success)]';
    };

    const activityIcon: Record<string, React.ElementType> = {
        expedition: Compass,
        cargo: Truck,
        weather: Cloud,
        personnel: Users,
        system: Database,
    };

    return (
        <div className="space-y-6 font-sans text-[var(--text-primary)] text-sm pb-12">

            {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="text-[10px] font-mono tracking-widest text-[var(--text-muted)] uppercase">POLAR COMMAND / COMMANDER</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tighter leading-tight">GLOBAL OPERATIONS</h1>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">Polar Expedition Command Center</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
                        Real-time operational overview across expeditions, personnel, resources, logistics and safety.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--status-success)]/10 border border-[var(--status-success)]/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-[var(--status-success)]">SYSTEM OPERATIONAL</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)]">
                        <Clock className="w-3 h-3" />
                        <span>Last sync: {lastSyncTime}</span>
                    </div>
                </div>
            </div>

            {/* ── SECTION 1: GLOBAL OPERATIONAL METRICS ──────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {[
                    { label: 'ACTIVE EXPEDITIONS', value: cntExp, sub: '+2 from last week', accent: 'var(--polar-cyan)', icon: Compass },
                    { label: 'PERSONNEL DEPLOYED', value: cntPers, sub: '24 at stations', accent: 'var(--polar-cyan)', icon: Users },
                    { label: 'ACTIVE ASSETS', value: cntAss, sub: '38 operational', accent: 'var(--polar-cyan)', icon: Activity },
                    { label: 'CARGO IN TRANSIT', value: cntCargo, sub: '18 delivered today', accent: 'var(--polar-cyan)', icon: Truck },
                    { label: 'WEATHER RISKS', value: cntWx, sub: '1 high, 2 moderate', accent: 'var(--status-warning)', icon: Cloud },
                    { label: 'CRITICAL ALERTS', value: cntAlerts, sub: 'Requires attention', accent: 'var(--status-critical)', icon: ShieldAlert },
                ].map((m) => {
                    const Icon = m.icon;
                    return (
                        <div
                            key={m.label}
                            className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs hover:border-[var(--border-primary)] transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-[9px] font-mono font-bold tracking-widest text-[var(--text-muted)] uppercase leading-tight">{m.label}</span>
                                <Icon className="w-3.5 h-3.5 shrink-0 ml-1" style={{ color: m.accent }} />
                            </div>
                            <div className="text-3xl font-bold tabular-nums leading-none" style={{ color: m.accent }}>
                                {String(m.value).padStart(2, '0')}
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1.5 font-mono">{m.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* ── SECTION 2+3: MAP + COMMAND PRIORITIES ────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

                {/* MAP PANEL */}
                <div className="xl:col-span-3 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs">
                    {/* Map Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border-primary)]">
                        <div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[var(--polar-cyan)]" />
                                <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">GLOBAL OPERATIONS MAP</span>
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--polar-cyan)] border border-[var(--polar-cyan)]/20 font-bold">
                                    {COMMANDER_METRICS.activeExpeditions} ACTIVE
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {(['ALL', 'EXPEDITIONS', 'STATIONS', 'CARGO', 'ALERTS'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setMapFilter(f)}
                                    className={`text-[9px] font-mono px-2.5 py-1 rounded border transition-colors cursor-pointer ${mapFilter === f
                                        ? 'bg-[var(--polar-cyan)] text-[var(--bg-app)] border-[var(--polar-cyan)] font-bold'
                                        : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Map Container */}
                    <div className="h-[420px] relative" style={{ background: isDark ? '#0D1117' : '#E8F0F5' }}>
                        <MapContainer
                            center={[-20, 30]}
                            zoom={2}
                            style={{ width: '100%', height: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                key={theme}
                                url={tileUrl}
                                attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                maxZoom={20}
                                tileSize={256}
                                eventHandlers={{ tileerror: () => setTileError(true) }}
                            />

                            {/* Station Markers */}
                            {stationMarkers.map(sm => (
                                <Marker
                                    key={sm.id}
                                    position={[sm.lat, sm.lng]}
                                    icon={makeIcon(sm.color, sm.label, sm.pulse)}
                                >
                                    <Popup className="custom-popup">
                                        <div style={{ fontFamily: 'monospace', fontSize: '11px', minWidth: '160px' }}>
                                            <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '12px' }}>
                                                {sm.label === 'MTR' ? 'MAITRI STATION' : sm.label === 'BHT' ? 'BHARATI STATION' : sm.label === 'HMD' ? 'HIMADRI STATION' : 'NCPOR HQ'}
                                            </div>
                                            {sm.pulse && (
                                                <div style={{ color: '#C85C62', fontWeight: 700, marginBottom: 4 }}>⚠ CRITICAL ALERT ACTIVE</div>
                                            )}
                                            <div style={{ opacity: 0.7 }}>Lat: {sm.lat.toFixed(2)}° / Lng: {sm.lng.toFixed(2)}°</div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* Expedition Routes */}
                            {(mapFilter === 'ALL' || mapFilter === 'EXPEDITIONS') && routes.map((coords, i) => (
                                <Polyline
                                    key={i}
                                    positions={coords}
                                    pathOptions={{
                                        color: '#A8C7D1',
                                        weight: 1.5,
                                        opacity: 0.5,
                                        dashArray: '6 6',
                                    }}
                                />
                            ))}
                        </MapContainer>

                        {/* Map overlay legend */}
                        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 text-[9px] font-mono bg-[var(--surface-primary)]/90 backdrop-blur-sm border border-[var(--border-primary)] rounded-lg px-3 py-2">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C85C62]" />ALERT</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C49A55]" />WARNING</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#63A68A]" />OPTIMAL</span>
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><Clock className="w-2.5 h-2.5" />Updated 2m ago</span>
                        </div>
                    </div>

                    <Link
                        to="/map"
                        className="flex items-center justify-end gap-1.5 px-5 py-2.5 border-t border-[var(--border-primary)] text-[10px] font-mono text-[var(--polar-cyan)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        OPEN FULL OPERATIONS MAP <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* COMMAND PRIORITIES PANEL */}
                <div className="xl:col-span-2 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs flex flex-col">
                    <div className="px-5 py-4 border-b border-[var(--border-primary)]">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-[var(--status-critical)]" />
                            <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">COMMAND PRIORITIES</span>
                        </div>
                        <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">Items requiring command decision</p>
                    </div>

                    <div className="flex-1 divide-y divide-[var(--border-subtle)] overflow-y-auto">
                        {COMMAND_PRIORITIES.map((p) => (
                            <div key={p.id} className="px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] tabular-nums">
                                            {String(p.rank).padStart(2, '0')}
                                        </span>
                                        <SeverityBadge sev={p.severity} />
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{p.title}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{p.subtitle}</p>
                                <p className="text-[9px] font-mono text-[var(--text-muted)] mt-1 leading-relaxed">{p.context}</p>
                                <Link
                                    to={p.route}
                                    className="inline-flex items-center gap-1 text-[9px] font-mono font-bold tracking-wider text-[var(--polar-cyan)] mt-2.5 hover:text-[var(--text-primary)] transition-colors"
                                >
                                    {p.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
                                </Link>
                            </div>
                        ))}
                    </div>

                    <Link
                        to="/alerts"
                        className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--border-primary)] text-[10px] font-mono text-[var(--polar-cyan)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        VIEW ALL ALERTS <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* ── POLARIS INTELLIGENCE ──────────────────────────────────────────────── */}
            <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-primary)]">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">POLARIS INTELLIGENCE</span>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] px-2 py-0.5 bg-[var(--surface-elevated)] rounded border border-[var(--border-subtle)]">
                            COMMAND RECOMMENDATIONS
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
                    {INTEL_RECOMMENDATIONS.map((r) => (
                        <div key={r.id} className="px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <SeverityBadge sev={r.urgency} />
                                <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-widest">{r.category}</span>
                            </div>
                            <p className="text-xs font-bold text-[var(--text-primary)] mb-1.5">{r.headline}</p>
                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{r.body}</p>
                            <Link
                                to={r.route}
                                className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[var(--polar-cyan)] mt-3 hover:text-[var(--text-primary)] transition-colors tracking-wider"
                            >
                                VIEW MODULE <ChevronRight className="w-2.5 h-2.5" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── SECTION 4: ACTIVE EXPEDITIONS ────────────────────────────────────── */}
            <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-primary)]">
                    <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">ACTIVE EXPEDITIONS</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-[var(--surface-elevated)] text-[var(--polar-cyan)] rounded border border-[var(--polar-cyan)]/20 font-bold">
                            {COMMANDER_EXPEDITIONS.length} TOTAL
                        </span>
                    </div>
                    <Link
                        to="/expeditions"
                        className="flex items-center gap-1 text-[10px] font-mono font-bold text-[var(--polar-cyan)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Table header */}
                <div className="hidden md:grid grid-cols-[2fr_1.5fr_100px_90px_80px_1fr] gap-4 px-5 py-2.5 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] text-[9px] font-mono font-bold tracking-widest text-[var(--text-muted)]">
                    <span>EXPEDITION</span>
                    <span>LOCATION</span>
                    <span>TEAM</span>
                    <span>STATUS</span>
                    <span>PROGRESS</span>
                    <span>NEXT MILESTONE</span>
                </div>

                <div className="divide-y divide-[var(--border-subtle)]">
                    {COMMANDER_EXPEDITIONS.map((e) => (
                        <div
                            key={e.id}
                            className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_100px_90px_80px_1fr] gap-2 md:gap-4 md:items-center px-5 py-3.5 hover:bg-[var(--surface-hover)] transition-colors"
                        >
                            <div>
                                <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{e.code}</p>
                                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 leading-tight">{e.name}</p>
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] font-mono">{e.location}</p>
                            <p className="text-[11px] text-[var(--text-secondary)] font-mono">{e.teamCount} personnel</p>
                            <ExpStatusPill status={e.status} />
                            <div className="space-y-1 min-w-[60px]">
                                <ProgressBar pct={e.progressPct} color={e.status === 'WEATHER_HOLD' ? 'var(--status-warning)' : 'var(--polar-cyan)'} />
                                <span className="text-[9px] font-mono text-[var(--text-muted)]">{e.progressPct}%</span>
                            </div>
                            <p className="text-[10px] font-mono text-[var(--polar-cyan)]">{e.nextMilestone}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── SECTION 5+6: RESOURCE FORECAST + WEATHER RISK ────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {/* RESOURCE FORECAST */}
                <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border-primary)]">
                        <Package className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">RESOURCE FORECAST</span>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] px-2 py-0.5 bg-[var(--surface-elevated)] rounded border border-[var(--border-subtle)]">PREDICTIVE</span>
                    </div>

                    <div className="divide-y divide-[var(--border-subtle)]">
                        {RESOURCE_FORECASTS.map((rf) => {
                            const color = rColor(rf.status);
                            const daysLeft = Math.round(rf.projectedHours / 24);
                            return (
                                <div key={rf.id} className="px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{rf.name}</p>
                                            <p className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5">{rf.category} · {rf.station}</p>
                                        </div>
                                        <SeverityBadge sev={rf.status === 'NORMAL' ? 'INFO' : rf.status} />
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <ProgressBar pct={rf.levelPct} color={color} />
                                        <span className="text-xs font-bold tabular-nums shrink-0" style={{ color }}>{rf.levelPct}%</span>
                                    </div>
                                    <p className="text-[9px] font-mono text-[var(--text-muted)]">
                                        Projected depletion: <strong className="text-[var(--text-secondary)]">{daysLeft} DAYS</strong>
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <Link
                        to="/inventory"
                        className="flex items-center justify-end gap-1.5 px-5 py-2.5 border-t border-[var(--border-primary)] text-[10px] font-mono text-[var(--polar-cyan)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        VIEW INVENTORY <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* WEATHER & ENVIRONMENTAL RISK */}
                <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border-primary)]">
                        <Cloud className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">WEATHER & ENVIRONMENTAL RISK</span>
                    </div>

                    <div className="divide-y divide-[var(--border-subtle)]">
                        {WEATHER_NODES.map((wx) => (
                            <div key={wx.id} className={`px-5 py-4 border-l-2 ${wxBg(wx.risk)} hover:bg-[var(--surface-hover)] transition-colors`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{wx.location}</p>
                                        <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                                            {wx.temperature} · Wind {wx.windSpeed} {wx.windDirection} · Vis {wx.visibility}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-mono font-bold ${wxColor(wx.risk)}`}>{wx.risk}</span>
                                        <p className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5">Storm: {wx.stormProbabilityPct}%</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-1">
                                    <ProgressBar pct={wx.stormProbabilityPct}
                                        color={wx.risk === 'HIGH' || wx.risk === 'EXTREME' ? 'var(--status-critical)' : wx.risk === 'MODERATE' ? 'var(--status-warning)' : 'var(--status-success)'}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link
                        to="/map"
                        className="flex items-center justify-end gap-1.5 px-5 py-2.5 border-t border-[var(--border-primary)] text-[10px] font-mono text-[var(--polar-cyan)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        VIEW WEATHER MAP <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* ── SECTION 7+8: LOGISTICS + PERSONNEL ───────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {/* LOGISTICS */}
                <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border-primary)]">
                        <Truck className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">LOGISTICS STATUS</span>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-4 divide-x divide-[var(--border-subtle)] border-b border-[var(--border-subtle)]">
                        {[
                            { label: 'IN TRANSIT', value: LOGISTICS_STATUS.inTransit, color: 'var(--polar-cyan)' },
                            { label: 'DISPATCHING', value: LOGISTICS_STATUS.awaitingDispatch, color: 'var(--text-secondary)' },
                            { label: 'DELIVERED', value: LOGISTICS_STATUS.deliveredToday, color: 'var(--status-success)' },
                            { label: 'DELAYED', value: LOGISTICS_STATUS.delayed, color: 'var(--status-warning)' },
                        ].map((s) => (
                            <div key={s.label} className="px-4 py-3 text-center">
                                <div className="text-xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
                                <div className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5 leading-tight">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Active Routes */}
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {ACTIVE_ROUTES.map((rt) => (
                            <div key={rt.id} className="px-5 py-3.5 hover:bg-[var(--surface-hover)] transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                                            <span>{rt.from}</span>
                                            <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
                                            <span>{rt.to}</span>
                                        </div>
                                        <p className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5">{rt.trackingId}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-mono font-bold text-[var(--polar-cyan)]">{rt.status}</span>
                                        <p className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5">ETA: {rt.eta}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link
                        to="/logistics"
                        className="flex items-center justify-end gap-1.5 px-5 py-2.5 border-t border-[var(--border-primary)] text-[10px] font-mono text-[var(--polar-cyan)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        VIEW LOGISTICS <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* PERSONNEL READINESS */}
                <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs flex flex-col">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border-primary)]">
                        <Users className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">PERSONNEL STATUS</span>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-4 divide-x divide-[var(--border-subtle)] border-b border-[var(--border-subtle)]">
                        {[
                            { label: 'DEPLOYED', value: COMMANDER_METRICS.personnelDeployed, color: 'var(--text-primary)' },
                            { label: 'IN FIELD', value: 118, color: 'var(--polar-cyan)' },
                            { label: 'AT STATIONS', value: 24, color: 'var(--status-success)' },
                            { label: 'ISSUES', value: COMMANDER_METRICS.checkInIssues, color: 'var(--status-warning)' },
                        ].map((s) => (
                            <div key={s.label} className="px-4 py-3 text-center">
                                <div className="text-xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
                                <div className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5 leading-tight">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Readiness */}
                    <div className="px-5 py-4 flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] tracking-widest">FIELD READINESS</span>
                            <span className="text-sm font-bold text-[var(--status-success)]">{COMMANDER_METRICS.fieldReadinessPct}%</span>
                        </div>
                        <ProgressBar pct={COMMANDER_METRICS.fieldReadinessPct} color="var(--status-success)" />

                        {/* Check-in issues */}
                        <div className="mt-4 space-y-2">
                            <p className="text-[9px] font-mono font-bold text-[var(--text-muted)] tracking-widest mb-2">ATTENTION REQUIRED</p>
                            {MOCK_ALERTS.filter(a => a.severity === 'CRITICAL').slice(0, 2).map(a => (
                                <div key={a.id} className="flex items-start justify-between gap-2 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-primary)] leading-tight">{a.personnelName}</p>
                                        <p className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5">{a.type.replace(/_/g, ' ')} · {a.location}</p>
                                    </div>
                                    <SeverityBadge sev={a.severity} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Link
                        to="/personnel"
                        className="flex items-center justify-end gap-1.5 px-5 py-2.5 border-t border-[var(--border-primary)] text-[10px] font-mono text-[var(--polar-cyan)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        VIEW PERSONNEL <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* ── SECTION 9+10: ACTIVITY + SYSTEM STATUS ───────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

                {/* COMMAND ACTIVITY */}
                <div className="xl:col-span-3 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border-primary)]">
                        <Activity className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">COMMAND ACTIVITY</span>
                    </div>

                    <div className="divide-y divide-[var(--border-subtle)]">
                        {COMMAND_ACTIVITY.map((ev) => {
                            const Icon = activityIcon[ev.type] ?? Activity;
                            return (
                                <div key={ev.id} className="flex items-start gap-3 px-5 py-3 hover:bg-[var(--surface-hover)] transition-colors">
                                    <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums shrink-0 mt-0.5">{ev.time}</span>
                                    <div className="w-5 h-5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                                        <Icon className="w-3 h-3 text-[var(--polar-cyan)]" />
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] leading-snug">{ev.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SYSTEM / CONNECTIVITY */}
                <div className="xl:col-span-2 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs flex flex-col">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border-primary)]">
                        <Radio className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">SYSTEM STATUS</span>
                    </div>

                    <div className="flex-1 px-5 py-4 grid grid-cols-1 gap-3">
                        {[
                            {
                                label: 'SAT-LINK',
                                value: SYSTEM_STATUS.satLink,
                                ok: true,
                                icon: Wifi,
                            },
                            {
                                label: 'DATABASE',
                                value: SYSTEM_STATUS.database,
                                ok: true,
                                icon: Database,
                            },
                            {
                                label: 'FIELD NODES',
                                value: `${SYSTEM_STATUS.fieldNodesOnline} / ${SYSTEM_STATUS.fieldNodesTotal} ONLINE`,
                                ok: SYSTEM_STATUS.fieldNodesOnline === SYSTEM_STATUS.fieldNodesTotal,
                                icon: Radio,
                            },
                            {
                                label: 'OFFLINE QUEUE',
                                value: `${SYSTEM_STATUS.offlineQueue} ITEMS`,
                                ok: SYSTEM_STATUS.offlineQueue === 0,
                                icon: RefreshCw,
                            },
                            {
                                label: 'LAST SYNC',
                                value: SYSTEM_STATUS.lastSync,
                                ok: true,
                                icon: CheckCircle2,
                            },
                        ].map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                        <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] tracking-wider">{s.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: s.ok ? 'var(--status-success)' : 'var(--status-warning)' }}
                                        />
                                        <span className="text-[10px] font-mono font-bold" style={{ color: s.ok ? 'var(--status-success)' : 'var(--status-warning)' }}>
                                            {s.value}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Link
                        to="/settings"
                        className="flex items-center justify-end gap-1.5 px-5 py-2.5 border-t border-[var(--border-primary)] text-[10px] font-mono text-[var(--polar-cyan)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        SETTINGS & SYNC <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

        </div>
    );
};
