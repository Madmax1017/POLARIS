import React, { useState, useEffect } from 'react';
import {
  MOCK_STATIONS,
  MOCK_PERSONNEL,
  MOCK_EXPEDITIONS,
  MOCK_ALERTS,
  MOCK_VESSELS,
  MOCK_CARGO_ROUTES,
  MOCK_VEHICLES,
  MOCK_INCIDENTS,
} from '../data/mockData';
import { Station, Expedition } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Globe,
  MapPin,
  Radio,
  Maximize2,
  ShieldAlert,
  Ship,
  Truck,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import { getTileProvider } from '../config/mapTileProviders';

// ─── Custom Marker Icons ──────────────────────────────────────────────────────

/** Station markers */
const createStationIcon = (status: string, code: string, isAlert: boolean = false) => {
  const colorBg = isAlert
    ? 'bg-rose-600 border-white text-white shadow-md'
    : status === 'OPTIMAL'
      ? 'bg-emerald-600 border-white text-white shadow-md'
      : status === 'WARNING'
        ? 'bg-amber-500 border-white text-white shadow-md'
        : 'bg-[#38BDF8] border-slate-900 text-slate-950 shadow-md';

  return L.divIcon({
    className: 'custom-polar-marker',
    html: `
      <div class="relative flex items-center justify-center transition-transform hover:scale-110">
        <div class="w-9 h-9 rounded-full border-2 ${colorBg} font-sans font-bold text-[11px] flex items-center justify-center tracking-wider">
          ${code.slice(0, 3)}
        </div>
        ${isAlert ? '<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 rounded-full animate-ping"></span>' : ''}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

/** Vessel markers — ship SVG icon */
const createVesselIcon = (status: string) => {
  const color = status === 'UNDERWAY' ? '#38BDF8' : status === 'AT_ANCHOR' ? '#A78BFA' : '#94A3B8';
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="width:34px;height:34px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px ${color}55;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
            <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
            <path d="M12 10v4"/><path d="M12 3v4"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

/** Vehicle / snow-cat markers */
const createVehicleIcon = (status: string) => {
  const color = status === 'MOVING' ? '#22C55E' : status === 'STATIONARY' ? '#F59E0B' : '#94A3B8';
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="width:32px;height:32px;border-radius:6px;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px ${color}55;">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9h-3"/>
            <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

/** Incident markers */
const createIncidentIcon = (severity: string) => {
  const color =
    severity === 'CRITICAL' ? '#EF4444' :
      severity === 'HIGH' ? '#F97316' :
        severity === 'MEDIUM' ? '#EAB308' : '#94A3B8';
  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="width:30px;height:30px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px ${color}55;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/><path d="M12 17h.01"/>
          </svg>
        </div>
        ${severity === 'CRITICAL' || severity === 'HIGH' ? `<span style="position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:${color};animation:ping 1s cubic-bezier(0,0,.2,1) infinite;"></span>` : ''}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// ─── Map Navigation Controller ────────────────────────────────────────────────
const MapController: React.FC<{
  targetCoords: [number, number] | null;
  targetZoom: number;
  fitBoundsTrigger: number;
}> = ({ targetCoords, targetZoom, fitBoundsTrigger }) => {
  const map = useMap();

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, targetZoom, { duration: 1.5 });
    }
  }, [targetCoords, targetZoom, map]);

  useEffect(() => {
    if (fitBoundsTrigger > 0) {
      const bounds = L.latLngBounds(
        MOCK_STATIONS.map((s) => [s.coordinates.lat, s.coordinates.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [fitBoundsTrigger, map]);

  return null;
};

// ─── Main Page Component ──────────────────────────────────────────────────────
export const MapPage: React.FC = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // Selected station + map navigation state
  const [selectedStation, setSelectedStation] = useState<Station>(MOCK_STATIONS[0]);
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>([-70.7667, 11.7333]);
  const [targetZoom, setTargetZoom] = useState<number>(4);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<number>(0);

  // Layer visibility toggles
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'Antarctic' | 'Arctic' | 'HQ'>('ALL');
  const [showExpeditions, setShowExpeditions] = useState<boolean>(true);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showCargoRoutes, setShowCargoRoutes] = useState<boolean>(true);
  const [showVehicles, setShowVehicles] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [tileLoadError, setTileLoadError] = useState<boolean>(false);

  // Active emergency alert at Maitri
  const maitriAlert = MOCK_ALERTS.find((a) => a.stationId === 'maitri' && a.severity === 'CRITICAL');

  // Filtered station list
  const filteredStations = MOCK_STATIONS.filter((s) => {
    if (regionFilter === 'ALL') return true;
    return s.region === regionFilter;
  });

  // Expedition route coordinates
  const expeditionRoutes: { exp: Expedition; coords: [number, number][] }[] = [
    {
      exp: MOCK_EXPEDITIONS[0],
      coords: [
        [-70.7667, 11.7333],
        [-70.8500, 11.8500],
        [-70.9200, 11.6000],
        [-70.7667, 11.7333],
      ],
    },
    {
      exp: MOCK_EXPEDITIONS[1],
      coords: [
        [-69.4075, 76.1958],
        [-69.4200, 76.3500],
        [-69.2500, 76.8000],
      ],
    },
    {
      exp: MOCK_EXPEDITIONS[2],
      coords: [
        [78.9233, 11.9333],
        [78.9350, 11.8500],
        [78.9600, 12.1000],
      ],
    },
  ];

  // Tile provider from modular config — swap provider here or in config/mapTileProviders.ts
  const tileProvider = getTileProvider(isDark);

  // CSS filter for dark mode tiles (applied via a style tag keyed to the provider)
  const tileFilterStyle = tileProvider.cssFilter
    ? `
      .leaflet-tile-pane { filter: ${tileProvider.cssFilter}; }
      .leaflet-overlay-pane { filter: none !important; }
    `
    : '';

  const focusStation = (station: Station) => {
    setSelectedStation(station);
    setTargetCoords([station.coordinates.lat, station.coordinates.lng]);
    setTargetZoom(6);
  };

  const handleResetView = () => {
    setFitBoundsTrigger((prev) => prev + 1);
  };

  // Severity label formatting
  const severityLabel = (s: string) =>
    s === 'CRITICAL' ? 'text-rose-500' :
      s === 'HIGH' ? 'text-orange-500' :
        s === 'MEDIUM' ? 'text-amber-500' : 'text-slate-400';

  return (
    <div className="space-y-4 font-sans text-[var(--text-primary)]">
      {/* ── MAP HEADER ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <Globe className="w-5 h-5 mr-2 text-[var(--polar-cyan)]" /> Geospatial Operations Map
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Live station telemetry, vessel tracking, ground convoys &amp; field incidents
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>● ONLINE — SAT-LINK</span>
          </div>

          <button
            onClick={handleResetView}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-primary)] hover:bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[var(--polar-cyan)]" />
            <span>FIT ALL STATIONS</span>
          </button>
        </div>
      </div>

      {/* ── LAYER CONTROLS & FILTER BAR ───────────────────────────────────── */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        {/* Region Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[var(--text-secondary)] font-medium">Region:</span>
          {(['ALL', 'Antarctic', 'Arctic', 'HQ'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer font-medium ${regionFilter === r
                ? 'bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border border-[var(--polar-cyan)]/30 font-semibold'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)]'
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="flex items-center space-x-1.5 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
            <input type="checkbox" checked={showExpeditions} onChange={(e) => setShowExpeditions(e.target.checked)} className="rounded" />
            <span className="text-[#38BDF8]">Expedition Routes</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
            <input type="checkbox" checked={showCargoRoutes} onChange={(e) => setShowCargoRoutes(e.target.checked)} className="rounded" />
            <span className="text-amber-500">Cargo Routes</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
            <input type="checkbox" checked={showVessels} onChange={(e) => setShowVessels(e.target.checked)} className="rounded" />
            <span className="text-[#38BDF8]">Vessels</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
            <input type="checkbox" checked={showVehicles} onChange={(e) => setShowVehicles(e.target.checked)} className="rounded" />
            <span className="text-emerald-500">Convoys</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer text-orange-500 font-medium">
            <input type="checkbox" checked={showIncidents} onChange={(e) => setShowIncidents(e.target.checked)} className="rounded" />
            <span>Incidents</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer text-rose-500 font-semibold">
            <input type="checkbox" checked={showAlerts} onChange={(e) => setShowAlerts(e.target.checked)} className="rounded" />
            <span>Critical Alerts</span>
          </label>
        </div>
      </div>

      {/* ── MAIN LAYOUT: SIDEBAR + MAP ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-240px)] min-h-[550px]">

        {/* OPERATIONS SIDEBAR */}
        <div className="lg:col-span-4 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs flex flex-col justify-between overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-3">
              <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider flex items-center">
                <Radio className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> Station Telemetry
              </h3>
              <span className="text-xs text-[var(--text-secondary)] font-medium">4 Active Nodes</span>
            </div>

            {/* Station Status List */}
            <div className="space-y-2.5">
              {filteredStations.map((st) => {
                const isSelected = selectedStation.id === st.id;
                const isAlertNode = st.id === 'maitri' && showAlerts;
                return (
                  <div
                    key={st.id}
                    onClick={() => focusStation(st)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${isSelected
                      ? 'bg-[var(--polar-cyan)]/10 border-[var(--polar-cyan)] shadow-2xs'
                      : isAlertNode
                        ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50'
                        : 'bg-[var(--surface-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-primary)]'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-[var(--polar-cyan)]' : 'text-[var(--text-muted)]'}`} />
                        <span className="font-bold text-[var(--text-primary)] text-sm">{st.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${st.status === 'OPTIMAL'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        }`}>
                        {st.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1.5 border-t border-[var(--border-subtle)] font-sans">
                      <span>Temp: <strong className="text-[var(--text-primary)]">{st.temperature}</strong></span>
                      <span>Wind: {st.windSpeed}</span>
                      <span>{st.headcount}/{st.maxCapacity} Cap</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Vessels Summary */}
            {showVessels && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-[var(--border-subtle)] mb-2">
                  <Ship className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Active Vessels</span>
                </div>
                <div className="space-y-1.5">
                  {MOCK_VESSELS.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[160px]">{v.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${v.status === 'UNDERWAY' ? 'text-[#38BDF8] bg-sky-500/10' : 'text-violet-400 bg-violet-500/10'}`}>
                        {v.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ground Convoys Summary */}
            {showVehicles && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-[var(--border-subtle)] mb-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Ground Convoys</span>
                </div>
                <div className="space-y-1.5">
                  {MOCK_VEHICLES.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[150px]">{v.convoyId}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${v.status === 'MOVING' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                        {v.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Station Inspector */}
          {selectedStation && (
            <div className="pt-3 border-t border-[var(--border-primary)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--polar-cyan)] uppercase tracking-wider">
                  Inspecting: {selectedStation.name}
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {selectedStation.code}
                </span>
              </div>

              <div className="bg-[var(--surface-elevated)] p-3.5 rounded-xl border border-[var(--border-subtle)] space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Coordinates:</span>
                  <span className="text-[var(--polar-cyan)] font-semibold font-mono">
                    {selectedStation.coordinates.lat}° N/S, {selectedStation.coordinates.lng}° E/W
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Risk Profile:</span>
                  <span className="text-[var(--text-primary)] font-medium truncate max-w-[150px]">{selectedStation.riskProfile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Telemetry Sync:</span>
                  <span className="text-emerald-500 font-medium">{selectedStation.lastSync}</span>
                </div>
              </div>

              {/* Personnel telemetry */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Field Personnel Telemetry
                </span>
                <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] text-xs font-sans space-y-2">
                  {MOCK_PERSONNEL.filter((p) => p.stationId === selectedStation.id).map((p) => (
                    <div key={p.id} className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center text-[var(--text-secondary)]">
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">{p.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{p.role} • {p.team}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-semibold">
                        {p.checkInStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Map Legend */}
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center space-x-2 mb-2">
              <Layers className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Layer Legend</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0"></span>OPTIMAL Station</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>WARNING Station</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-600 shrink-0"></span>Alert / Deadman</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-400 shrink-0"></span>Vessel</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0"></span>Convoy</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 shrink-0"></span>Incident</span>
              <span className="flex items-center gap-1.5"><span style={{ width: 20, height: 2, borderTop: '2px dashed #38BDF8', display: 'inline-block' }}></span>Expedition</span>
              <span className="flex items-center gap-1.5"><span style={{ width: 20, height: 2, background: '#F59E0B', display: 'inline-block' }}></span>Cargo Route</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE LEAFLET MAP VIEWPORT */}
        <div className="lg:col-span-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs relative">
          {/* Dynamic tile filter injected as scoped style — avoids filtering markers/polylines */}
          {tileFilterStyle && (
            <style>{tileFilterStyle}</style>
          )}
          <MapContainer
            center={[-20, 30]}
            zoom={3}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', backgroundColor: 'transparent' }}
          >
            {/* Map navigation controller */}
            <MapController
              targetCoords={targetCoords}
              targetZoom={targetZoom}
              fitBoundsTrigger={fitBoundsTrigger}
            />

            {/* ── TILE LAYER — OpenStreetMap (via modular provider config) ── */}
            <TileLayer
              key={tileProvider.id}
              url={tileProvider.url}
              attribution={tileProvider.attribution}
              maxZoom={tileProvider.maxZoom}
              tileSize={tileProvider.tileSize}
              subdomains={tileProvider.subdomains}
              detectRetina={tileProvider.detectRetina}
              eventHandlers={{
                tileerror: () => setTileLoadError(true),
                tileload: () => setTileLoadError(false),
              }}
            />

            {/* ── CARGO ROUTE POLYLINES (solid, amber/green/violet) ── */}
            {showCargoRoutes &&
              MOCK_CARGO_ROUTES.map((route) => (
                <Polyline
                  key={route.id}
                  positions={route.waypoints}
                  pathOptions={{
                    color: route.color,
                    weight: 2.5,
                    opacity: 0.75,
                  }}
                >
                  <Popup>
                    <div className="p-3 bg-[var(--surface-primary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] font-sans text-xs space-y-2 min-w-[240px] shadow-lg">
                      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
                        <Ship className="w-4 h-4 text-[var(--polar-cyan)]" />
                        <span className="font-bold text-[var(--polar-cyan)] text-sm">Cargo Route</span>
                      </div>
                      <p className="font-semibold text-[var(--text-primary)]">{route.label}</p>
                      <p className="text-[var(--text-secondary)]">{route.waypoints.length} waypoints</p>
                    </div>
                  </Popup>
                </Polyline>
              ))}

            {/* ── EXPEDITION ROUTE POLYLINES (dashed) ── */}
            {showExpeditions &&
              expeditionRoutes.map(({ exp, coords }) => (
                <Polyline
                  key={exp.id}
                  positions={coords}
                  pathOptions={{
                    color: exp.id === 'exp-43-01' ? '#38BDF8' : exp.id === 'exp-43-02' ? '#A78BFA' : '#22C55E',
                    weight: 3,
                    dashArray: '6, 8',
                    opacity: 0.85,
                  }}
                >
                  <Popup>
                    <div className="p-3 bg-[var(--surface-primary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] font-sans text-xs space-y-2 min-w-[240px] shadow-lg">
                      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
                        <span className="font-bold text-[var(--polar-cyan)] font-mono">{exp.code}</span>
                        <span className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-xs text-[var(--text-secondary)] font-medium border border-[var(--border-subtle)]">{exp.phase}</span>
                      </div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{exp.name}</p>
                      <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                        <p><span className="text-[var(--text-muted)]">Lead Scientist:</span> {exp.leadScientist}</p>
                        <p><span className="text-[var(--text-muted)]">Team Count:</span> {exp.teamCount} Members</p>
                        <p><span className="text-[var(--text-muted)]">Status:</span> <strong className="text-emerald-500">{exp.status}</strong></p>
                        <p><span className="text-[var(--text-muted)]">Window:</span> {exp.startDate} → {exp.targetCompletion}</p>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              ))}

            {/* ── STATION MARKERS ── */}
            {filteredStations.map((st) => {
              const isMaitriAlert = st.id === 'maitri' && showAlerts && Boolean(maitriAlert);
              return (
                <Marker
                  key={st.id}
                  position={[st.coordinates.lat, st.coordinates.lng]}
                  icon={createStationIcon(st.status, st.code, isMaitriAlert)}
                  eventHandlers={{ click: () => setSelectedStation(st) }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-3 bg-[var(--surface-primary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] font-sans text-xs space-y-2 min-w-[220px] shadow-lg">
                      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                        <div>
                          <h4 className="font-bold text-[var(--text-primary)] text-sm">{st.name}</h4>
                          <span className="text-xs text-[var(--polar-cyan)] font-medium">{st.code} • {st.region}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${st.status === 'OPTIMAL'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          }`}>
                          {st.status}
                        </span>
                      </div>
                      {isMaitriAlert && maitriAlert && (
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold space-y-1">
                          <p className="flex items-center">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1 animate-pulse" />
                            CRITICAL — DEADMAN TIMEOUT
                          </p>
                          <p className="text-[11px] text-rose-400 font-normal">
                            Personnel: {maitriAlert.personnelName} | {maitriAlert.location}
                          </p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Temperature:</span><span className="font-bold">{st.temperature}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Wind Speed:</span><span>{st.windSpeed}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Headcount:</span><span>{st.headcount} / {st.maxCapacity}</span></div>
                        <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                          <span>Last Sync:</span><span>{st.lastSync}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* ── VESSEL MARKERS ── */}
            {showVessels &&
              MOCK_VESSELS.map((v) => (
                <Marker
                  key={v.id}
                  position={[v.coordinates.lat, v.coordinates.lng]}
                  icon={createVesselIcon(v.status)}
                >
                  <Popup>
                    <div className="p-3 bg-[var(--surface-primary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] font-sans text-xs space-y-2 min-w-[240px] shadow-lg">
                      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
                        <Ship className="w-4 h-4 text-[#38BDF8]" />
                        <div>
                          <h4 className="font-bold text-[var(--text-primary)] text-sm">{v.name}</h4>
                          <span className="text-[10px] text-[var(--text-secondary)] uppercase font-medium">{v.type.replace('_', ' ')} • {v.flag}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Status:</span><span className={`font-bold ${v.status === 'UNDERWAY' ? 'text-[#38BDF8]' : 'text-violet-400'}`}>{v.status}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Speed:</span><span>{v.speedKnots} kn</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Heading:</span><span>{v.headingDeg}°</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Destination:</span><span className="truncate max-w-[130px] text-right">{v.destination}</span></div>
                        {v.etaHours > 0 && <div className="flex justify-between"><span className="text-[var(--text-muted)]">ETA:</span><span>{Math.floor(v.etaHours / 24)}d {v.etaHours % 24}h</span></div>}
                        <div className="pt-1 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">{v.cargo}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* ── VEHICLE / CONVOY MARKERS ── */}
            {showVehicles &&
              MOCK_VEHICLES.map((v) => (
                <Marker
                  key={v.id}
                  position={[v.coordinates.lat, v.coordinates.lng]}
                  icon={createVehicleIcon(v.status)}
                >
                  <Popup>
                    <div className="p-3 bg-[var(--surface-primary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] font-sans text-xs space-y-2 min-w-[240px] shadow-lg">
                      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
                        <Truck className="w-4 h-4 text-emerald-500" />
                        <div>
                          <h4 className="font-bold text-[var(--text-primary)] text-sm">{v.name}</h4>
                          <span className="text-[10px] text-[var(--text-secondary)] uppercase font-medium">{v.convoyId}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Status:</span><span className={`font-bold ${v.status === 'MOVING' ? 'text-emerald-500' : 'text-amber-500'}`}>{v.status}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Speed:</span><span>{v.speedKmh} km/h</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Operator:</span><span>{v.operator}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Fuel:</span>
                          <span className={v.fuelPct < 30 ? 'text-rose-500 font-bold' : v.fuelPct < 50 ? 'text-amber-500 font-bold' : 'text-emerald-500'}>{v.fuelPct}%</span>
                        </div>
                        <div className="pt-1 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">{v.mission}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* ── INCIDENT MARKERS ── */}
            {showIncidents &&
              MOCK_INCIDENTS.map((inc) => (
                <Marker
                  key={inc.id}
                  position={[inc.coordinates.lat, inc.coordinates.lng]}
                  icon={createIncidentIcon(inc.severity)}
                >
                  <Popup>
                    <div className="p-3 bg-[var(--surface-primary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] font-sans text-xs space-y-2 min-w-[240px] shadow-lg">
                      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
                        <AlertTriangle className={`w-4 h-4 ${severityLabel(inc.severity)}`} />
                        <div>
                          <h4 className="font-bold text-[var(--text-primary)] text-sm">{inc.title}</h4>
                          <span className={`text-[10px] uppercase font-bold ${severityLabel(inc.severity)}`}>{inc.severity} — {inc.type.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      <p className="text-[var(--text-secondary)]">{inc.description}</p>
                      <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                        <span>Status: <strong className={inc.status === 'OPEN' ? 'text-rose-500' : 'text-amber-500'}>{inc.status}</strong></span>
                        <span>{new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* Tile load error notification */}
          {tileLoadError && (
            <div className="absolute bottom-4 left-4 z-40 bg-[var(--surface-primary)] border border-[var(--border-primary)] p-2.5 rounded-lg text-[var(--text-secondary)] text-xs font-sans flex items-center space-x-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span>Map tile load error — check network connection</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
