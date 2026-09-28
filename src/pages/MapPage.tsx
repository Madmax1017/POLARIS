import React, { useState, useEffect } from 'react';
import {
  MOCK_STATIONS,
  MOCK_PERSONNEL,
  MOCK_EXPEDITIONS,
  MOCK_ALERTS
} from '../data/mockData';
import { Station, Expedition } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Globe,
  MapPin,
  Radio,
  Maximize2,
  ShieldAlert
} from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';

// Custom Marker Generator
const createCustomIcon = (status: string, code: string, isAlert: boolean = false) => {
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

// Map Navigation Controller Helper Component
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

export const MapPage: React.FC = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [selectedStation, setSelectedStation] = useState<Station>(MOCK_STATIONS[0]);
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>([-70.7667, 11.7333]);
  const [targetZoom, setTargetZoom] = useState<number>(4);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<number>(0);

  // Filter & Visibility Toggles
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'Antarctic' | 'Arctic' | 'HQ'>('ALL');
  const [showExpeditions, setShowExpeditions] = useState<boolean>(true);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const [tileLoadError, setTileLoadError] = useState<boolean>(false);

  // Active Emergency Alert at Maitri
  const maitriAlert = MOCK_ALERTS.find((a) => a.stationId === 'maitri' && a.severity === 'CRITICAL');

  // Filtered Station List
  const filteredStations = MOCK_STATIONS.filter((s) => {
    if (regionFilter === 'ALL') return true;
    return s.region === regionFilter;
  });

  // Expedition Route Coordinates Mapping
  const expeditionRoutes: { exp: Expedition; coords: [number, number][] }[] = [
    {
      exp: MOCK_EXPEDITIONS[0], // Schirmacher Glacier Core Sampling (Maitri)
      coords: [
        [-70.7667, 11.7333], // Maitri Base
        [-70.8500, 11.8500], // Point 42 Summit
        [-70.9200, 11.6000], // Gruber Mountains
        [-70.7667, 11.7333], // Return
      ],
    },
    {
      exp: MOCK_EXPEDITIONS[1], // Prydz Bay Survey (Bharati)
      coords: [
        [-69.4075, 76.1958], // Bharati Base
        [-69.4200, 76.3500], // Stornes Peninsula
        [-69.2500, 76.8000], // Amanda Bay
      ],
    },
    {
      exp: MOCK_EXPEDITIONS[2], // Svalbard Carbon Array (Himadri)
      coords: [
        [78.9233, 11.9333], // Himadri Station
        [78.9350, 11.8500], // Bayelva Basin
        [78.9600, 12.1000], // Kongsfjorden Ridge
      ],
    },
  ];

  // Action: Focus Station on Map
  const focusStation = (station: Station) => {
    setSelectedStation(station);
    setTargetCoords([station.coordinates.lat, station.coordinates.lng]);
    setTargetZoom(6);
  };

  // Action: Reset Map to Fit All Stations
  const handleResetView = () => {
    setFitBoundsTrigger((prev) => prev + 1);
  };

  // Select map tile URL based on global theme
  // Dark mode → Stadia Alidade Smooth Dark | Light mode → Stadia Alidade Smooth
  const tileUrl = isDark
    ? `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png`
    : `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png`;

  return (
    <div className="space-y-4 font-sans text-[var(--text-primary)]">
      {/* MAP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <Globe className="w-5 h-5 mr-2 text-[var(--polar-cyan)]" /> Geospatial Operations Map
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Live station telemetry, personnel positioning & expedition routes
          </p>
        </div>

        {/* Telemetry Indicator & Filters */}
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

      {/* MAP CONTROLS & FILTER BAR */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center space-x-2">
          <span className="text-[var(--text-secondary)] font-medium">Region Filter:</span>
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

        <div className="flex items-center space-x-5">
          <label className="flex items-center space-x-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
            <input
              type="checkbox"
              checked={showExpeditions}
              onChange={(e) => setShowExpeditions(e.target.checked)}
              className="rounded border-[var(--border-primary)] text-[var(--polar-cyan)] focus:ring-[var(--polar-cyan)]"
            />
            <span>Expedition Routes</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer text-rose-500 font-semibold">
            <input
              type="checkbox"
              checked={showAlerts}
              onChange={(e) => setShowAlerts(e.target.checked)}
              className="rounded border-rose-500 text-rose-500 focus:ring-rose-500"
            />
            <span>Critical Alerts Overlay</span>
          </label>
        </div>
      </div>

      {/* Main Map Viewport & Operations Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[550px]">
        {/* OPERATIONS SIDEBAR / PANEL */}
        <div className="lg:col-span-4 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs flex flex-col justify-between overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-3">
              <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider flex items-center">
                <Radio className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> Station Telemetry Status
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
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold ${st.status === 'OPTIMAL'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          }`}
                      >
                        {st.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1.5 border-t border-[var(--border-subtle)] font-sans">
                      <span>Temp: <strong className="text-[var(--text-primary)]">{st.temperature}</strong></span>
                      <span>Wind: {st.windSpeed}</span>
                      <span>{st.headcount}/{st.maxCapacity} Capacity</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Station Detailed Inspector Card */}
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

              {/* PERSONNEL TELEMETRY */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Field Personnel Telemetry
                </span>
                <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] text-xs font-sans space-y-2">
                  <div className="flex items-center justify-between text-[var(--polar-cyan)] font-semibold">
                    <span>Field personnel location telemetry</span>
                  </div>
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
        </div>

        {/* INTERACTIVE LEAFLET MAP VIEWPORT */}
        <div className="lg:col-span-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-2xs relative">
          <MapContainer
            center={[-70.7667, 11.7333]}
            zoom={3}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', backgroundColor: 'transparent' }}
          >
            {/* Dynamic Map Controller for Flying / Fitting Bounds */}
            <MapController
              targetCoords={targetCoords}
              targetZoom={targetZoom}
              fitBoundsTrigger={fitBoundsTrigger}
            />

            {/* Dynamic Tile Layer switching between Google Satellite and Roadmap */}
            <TileLayer
              key={theme}
              url={tileUrl}
              attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
              maxZoom={20}
              tileSize={256}
              eventHandlers={{
                tileerror: () => {
                  setTileLoadError(true);
                },
              }}
            />

            {/* STATION MARKERS & POPUPS */}
            {filteredStations.map((st) => {
              const isMaitriAlert = st.id === 'maitri' && showAlerts && Boolean(maitriAlert);
              const markerIcon = createCustomIcon(st.status, st.code, isMaitriAlert);

              return (
                <Marker
                  key={st.id}
                  position={[st.coordinates.lat, st.coordinates.lng]}
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedStation(st);
                    },
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-3 bg-[var(--surface-primary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] font-sans text-xs space-y-2 min-w-[220px] shadow-lg">
                      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                        <div>
                          <h4 className="font-bold text-[var(--text-primary)] text-sm">{st.name}</h4>
                          <span className="text-xs text-[var(--polar-cyan)] font-medium">{st.code} • {st.region}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${st.status === 'OPTIMAL'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            }`}
                        >
                          {st.status}
                        </span>
                      </div>

                      {/* ACTIVE EMERGENCY INDICATOR ON MAP */}
                      {isMaitriAlert && maitriAlert && (
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold space-y-1">
                          <p className="flex items-center">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-500 animate-pulse" />
                            CRITICAL — DEADMAN TIMEOUT
                          </p>
                          <p className="text-[11px] text-rose-400 font-normal">
                            Personnel: {maitriAlert.personnelName} | Location: {maitriAlert.location}
                          </p>
                        </div>
                      )}

                      <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Temperature:</span>
                          <span className="font-bold text-[var(--text-primary)]">{st.temperature}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Wind Speed:</span>
                          <span>{st.windSpeed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Headcount:</span>
                          <span>{st.headcount} / {st.maxCapacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Risk Profile:</span>
                          <span className="text-[var(--polar-cyan)] font-medium">{st.riskProfile}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                          <span>Last Sync:</span>
                          <span>{st.lastSync}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* EXPEDITION ROUTES POLYLINES */}
            {showExpeditions &&
              expeditionRoutes.map(({ exp, coords }) => (
                <Polyline
                  key={exp.id}
                  positions={coords}
                  pathOptions={{
                    color: exp.id === 'exp-43-01' ? '#38BDF8' : exp.id === 'exp-43-02' ? '#F59E0B' : '#22C55E',
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
          </MapContainer>

          {/* Graceful Tile Error Notification */}
          {tileLoadError && (
            <div className="absolute bottom-4 left-4 z-40 bg-[var(--surface-primary)] border border-[var(--border-primary)] p-2.5 rounded-lg text-[var(--text-secondary)] text-xs font-sans flex items-center space-x-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Google Maps tile load error — check API key or network</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
