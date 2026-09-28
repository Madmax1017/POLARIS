import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { CargoSimulation, RouteWaypoint, MapIceberg, WeatherZone, NearbyStation, NearbyAsset } from '../../data/routeSimulationData';
import { MapObjectInfo } from './MapPopup';

interface Props {
    simulation: CargoSimulation;
    isPlaying: boolean;
    speed: number;
    animationProgress: number;
    onObjectClick: (obj: MapObjectInfo) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Polar Stereographic Projection (South Pole centered)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function projectPoint(lat: number, lng: number, centerLat: number, centerLng: number, scale: number, cx: number, cy: number): [number, number] {
    const toRad = Math.PI / 180;
    const dLat = lat - centerLat;
    const dLng = lng - centerLng;
    const x = cx + dLng * scale * Math.cos(centerLat * toRad);
    const y = cy - dLat * scale;
    return [x, y];
}

// Antarctic coastline simplified outline (very rough polygon for visual effect)
const ANTARCTIC_COAST: [number, number][] = [
    [-66, -60], [-67, -45], [-68, -30], [-69, -15], [-70, 0], [-69.5, 15], [-68, 30],
    [-67, 45], [-66, 55], [-65, 65], [-66, 75], [-67.5, 85], [-68, 95], [-69, 105],
    [-70, 115], [-71, 125], [-72, 135], [-73, 145], [-74, 155], [-74, 165], [-73, 175],
    [-72, -175], [-73, -165], [-74, -155], [-75, -145], [-76, -135], [-77, -125],
    [-78, -115], [-77, -105], [-76, -95], [-74, -85], [-72, -80], [-70, -75], [-68, -70],
    [-66, -60],
];

// Inner continent mass (ice shelf edge)
const ICE_SHELF: [number, number][] = [
    [-72, -60], [-73, -45], [-74, -30], [-75, -15], [-76, 0], [-75, 15], [-74, 30],
    [-73, 45], [-72, 55], [-71, 65], [-72, 75], [-73, 85], [-74, 95], [-75, 105],
    [-76, 115], [-77, 125], [-78, 135], [-79, 145], [-80, 155], [-80, 165], [-79, 175],
    [-78, -175], [-79, -165], [-80, -155], [-81, -145], [-82, -135], [-83, -125],
    [-82, -115], [-81, -105], [-80, -95], [-78, -85], [-76, -80], [-74, -75], [-72, -70],
    [-72, -60],
];

export const AntarcticMap: React.FC<Props> = ({ simulation, isPlaying, speed, animationProgress, onObjectClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });
    const [hoveredObject, setHoveredObject] = useState<string | null>(null);

    // Responsive sizing
    useEffect(() => {
        const updateSize = () => {
            if (svgRef.current?.parentElement) {
                const rect = svgRef.current.parentElement.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = height / 2;

    // Calculate bounds from route waypoints to center the map
    const bounds = useMemo(() => {
        const points = simulation.routeWaypoints;
        const allLats = points.map(p => p.lat);
        const allLngs = points.map(p => p.lng);
        const minLat = Math.min(...allLats);
        const maxLat = Math.max(...allLats);
        const minLng = Math.min(...allLngs);
        const maxLng = Math.max(...allLngs);
        return {
            centerLat: (minLat + maxLat) / 2,
            centerLng: (minLng + maxLng) / 2,
            latRange: maxLat - minLat,
            lngRange: maxLng - minLng,
        };
    }, [simulation.routeWaypoints]);

    const scale = useMemo(() => {
        const padFactor = 1.6;
        const scaleByLat = height / (bounds.latRange * padFactor);
        const scaleByLng = width / (bounds.lngRange * padFactor);
        return Math.min(scaleByLat, scaleByLng, 40);
    }, [bounds, width, height]);

    const project = useCallback((lat: number, lng: number): [number, number] => {
        return projectPoint(lat, lng, bounds.centerLat, bounds.centerLng, scale, cx, cy);
    }, [bounds, scale, cx, cy]);

    // Route polylines
    const routePoints = simulation.routeWaypoints.map(wp => project(wp.lat, wp.lng));
    const completedIndex = Math.floor(animationProgress * (routePoints.length - 1));
    const completedFraction = animationProgress * (routePoints.length - 1) - completedIndex;

    // Current vessel interpolated position
    const getInterpolatedPosition = (): [number, number] => {
        if (completedIndex >= routePoints.length - 1) return routePoints[routePoints.length - 1];
        const from = routePoints[completedIndex];
        const to = routePoints[completedIndex + 1];
        return [
            from[0] + (to[0] - from[0]) * completedFraction,
            from[1] + (to[1] - from[1]) * completedFraction,
        ];
    };

    const vesselPos = getInterpolatedPosition();

    // Build path strings
    const completedPath = routePoints
        .slice(0, completedIndex + 1)
        .concat([vesselPos])
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
        .join(' ');

    const remainingPath = [vesselPos]
        .concat(routePoints.slice(completedIndex + 1))
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
        .join(' ');

    const fullPath = routePoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
        .join(' ');

    // Coastline paths
    const coastPath = ANTARCTIC_COAST.map(([lat, lng]) => project(lat, lng))
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
        .join(' ') + ' Z';

    const iceShelfPath = ICE_SHELF.map(([lat, lng]) => project(lat, lng))
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
        .join(' ') + ' Z';

    // Heading arrow rotation
    const headingRad = (simulation.currentPosition.heading - 90) * Math.PI / 180;

    // Click handlers
    const handleVesselClick = () => {
        onObjectClick({
            type: 'vessel',
            title: simulation.cargoId === 'cg-901' ? 'MV Vasiliy Golovnin' : simulation.vesselIcon + ' Active Vessel',
            details: {
                'Position': simulation.currentPosition.coordinatesDisplay,
                'Speed': `${simulation.currentPosition.speed} ${simulation.currentPosition.speedUnit}`,
                'Heading': `${simulation.currentPosition.heading}°`,
                'Status': 'ACTIVE',
            },
        });
    };

    const handleStationClick = (station: NearbyStation) => {
        onObjectClick({
            type: 'station',
            title: station.name,
            details: {
                'Personnel': String(station.personnel || 'Unknown'),
                'Status': station.status || 'UNKNOWN',
                'Position': `${station.lat.toFixed(2)}° ${station.lat < 0 ? 'S' : 'N'}, ${station.lng.toFixed(2)}° E`,
            },
        });
    };

    const handleIcebergClick = (iceberg: MapIceberg) => {
        onObjectClick({
            type: 'iceberg',
            title: 'Ice Field',
            details: {
                'Distance': iceberg.distance,
                'Concentration': iceberg.concentration || 'Unknown',
                'Size': iceberg.size.toUpperCase(),
                'Risk': iceberg.risk,
            },
        });
    };

    const handleWeatherClick = (wz: WeatherZone) => {
        onObjectClick({
            type: 'weather',
            title: wz.name,
            details: {
                'Type': wz.type.toUpperCase(),
                'Risk': wz.risk,
                'Details': wz.details || 'No additional data',
            },
        });
    };

    const handleAssetClick = (asset: NearbyAsset) => {
        onObjectClick({
            type: 'asset',
            title: asset.name,
            details: {
                'Type': asset.type.toUpperCase(),
                'Description': asset.description || '',
                ...(asset.heading !== undefined ? { 'Heading': `${asset.heading}°` } : {}),
            },
        });
    };

    const handleCheckpointClick = (cp: { name: string; status: string; eta?: string }) => {
        onObjectClick({
            type: 'checkpoint',
            title: cp.name,
            details: {
                'Status': cp.status.toUpperCase(),
                ...(cp.eta ? { 'ETA': cp.eta } : {}),
            },
        });
    };

    return (
        <svg
            ref={svgRef}
            className="antarctic-map-svg"
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="100%"
            style={{ background: 'transparent' }}
        >
            <defs>
                {/* Glow filter for vessel */}
                <filter id="vessel-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Glow for route */}
                <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Gradient for ocean */}
                <radialGradient id="ocean-gradient" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#0a1628" />
                    <stop offset="100%" stopColor="#060d18" />
                </radialGradient>

                {/* Grid pattern */}
                <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(168,199,209,0.04)" strokeWidth="0.5" />
                </pattern>

                {/* Iceberg gradient */}
                <radialGradient id="iceberg-grad" cx="50%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.1" />
                </radialGradient>

                {/* Weather zone gradients */}
                <radialGradient id="storm-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#c85c62" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#c85c62" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="ice-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="wind-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#c49a55" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#c49a55" stopOpacity="0" />
                </radialGradient>

                {/* Vessel pulse animation */}
                <style>{`
          @keyframes vesselPulse {
            0%, 100% { r: 6; opacity: 1; }
            50% { r: 10; opacity: 0.5; }
          }
          @keyframes vesselRing {
            0% { r: 8; opacity: 0.6; }
            100% { r: 24; opacity: 0; }
          }
          .vessel-pulse { animation: vesselPulse 2s ease-in-out infinite; }
          .vessel-ring { animation: vesselRing 2s ease-out infinite; }
        `}</style>
            </defs>

            {/* Ocean background */}
            <rect x="0" y="0" width={width} height={height} fill="url(#ocean-gradient)" />

            {/* Grid overlay */}
            <rect x="0" y="0" width={width} height={height} fill="url(#grid-pattern)" />

            {/* Lat/Lng grid lines */}
            {[-30, -40, -50, -60, -70, -80].map(lat => {
                const [, y] = project(lat, bounds.centerLng);
                return (
                    <g key={`lat-${lat}`}>
                        <line x1="0" y1={y} x2={width} y2={y} stroke="rgba(168,199,209,0.06)" strokeWidth="0.5" strokeDasharray="8 12" />
                        <text x="8" y={y - 4} fill="rgba(168,199,209,0.2)" fontSize="9" fontFamily="'JetBrains Mono', monospace">
                            {Math.abs(lat)}°{lat < 0 ? 'S' : 'N'}
                        </text>
                    </g>
                );
            })}
            {Array.from({ length: 13 }, (_, i) => (i - 6) * 15 + bounds.centerLng).map(lng => {
                const [x] = project(bounds.centerLat, lng);
                return (
                    <g key={`lng-${lng}`}>
                        <line x1={x} y1="0" x2={x} y2={height} stroke="rgba(168,199,209,0.04)" strokeWidth="0.5" strokeDasharray="8 12" />
                        <text x={x + 4} y={height - 8} fill="rgba(168,199,209,0.15)" fontSize="9" fontFamily="'JetBrains Mono', monospace">
                            {Math.abs(lng).toFixed(0)}°{lng < 0 ? 'W' : 'E'}
                        </text>
                    </g>
                );
            })}

            {/* Antarctic coastline */}
            <path d={coastPath} fill="rgba(168,199,209,0.04)" stroke="rgba(168,199,209,0.12)" strokeWidth="1" />

            {/* Ice shelf */}
            <path d={iceShelfPath} fill="rgba(191,220,227,0.03)" stroke="rgba(191,220,227,0.08)" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* Weather zones */}
            {simulation.weatherZones.map(wz => {
                const [wxz, wyz] = project(wz.lat, wz.lng);
                const r = wz.radius * scale * 0.15;
                const gradId = wz.type === 'storm' ? 'storm-grad' : wz.type === 'ice' ? 'ice-grad' : 'wind-grad';
                return (
                    <g key={wz.id} style={{ cursor: 'pointer' }} onClick={() => handleWeatherClick(wz)}>
                        <circle cx={wxz} cy={wyz} r={r} fill={`url(#${gradId})`} />
                        <circle cx={wxz} cy={wyz} r={r} fill="none" stroke={
                            wz.risk === 'SEVERE' ? 'rgba(200,92,98,0.25)' :
                                wz.risk === 'HIGH' ? 'rgba(200,92,98,0.18)' :
                                    wz.risk === 'MODERATE' ? 'rgba(196,154,85,0.18)' :
                                        'rgba(168,199,209,0.1)'
                        } strokeWidth="1" strokeDasharray="6 6" />
                        <text x={wxz} y={wyz - r - 6} textAnchor="middle" fill="rgba(168,199,209,0.35)" fontSize="8" fontFamily="'JetBrains Mono', monospace">
                            {wz.name}
                        </text>
                    </g>
                );
            })}

            {/* Icebergs */}
            {simulation.icebergs.map(ib => {
                const [ibx, iby] = project(ib.lat, ib.lng);
                const sz = ib.size === 'large' ? 12 : ib.size === 'medium' ? 8 : 5;
                const isHovered = hoveredObject === ib.id;
                return (
                    <g
                        key={ib.id}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredObject(ib.id)}
                        onMouseLeave={() => setHoveredObject(null)}
                        onClick={() => handleIcebergClick(ib)}
                    >
                        {/* Iceberg shape — irregular polygon */}
                        <polygon
                            points={`${ibx},${iby - sz} ${ibx + sz * 0.7},${iby - sz * 0.2} ${ibx + sz * 0.5},${iby + sz * 0.6} ${ibx - sz * 0.4},${iby + sz * 0.5} ${ibx - sz * 0.8},${iby - sz * 0.1}`}
                            fill="url(#iceberg-grad)"
                            stroke="rgba(125,211,252,0.3)"
                            strokeWidth={isHovered ? 1.5 : 0.8}
                        />
                        {isHovered && (
                            <text x={ibx} y={iby + sz + 12} textAnchor="middle" fill="rgba(125,211,252,0.7)" fontSize="8" fontFamily="'JetBrains Mono', monospace">
                                {ib.distance}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Full route (faint background) */}
            <path d={fullPath} fill="none" stroke="rgba(168,199,209,0.08)" strokeWidth="1" />

            {/* Completed route */}
            <path d={completedPath} fill="none" stroke="var(--polar-cyan)" strokeWidth="2.5" filter="url(#route-glow)" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

            {/* Remaining route (dashed) */}
            <path d={remainingPath} fill="none" stroke="rgba(168,199,209,0.3)" strokeWidth="1.5" strokeDasharray="8 6" strokeLinecap="round" />

            {/* Checkpoints */}
            {simulation.checkpoints.map(cp => {
                const [cpx, cpy] = project(cp.lat, cp.lng);
                const color = cp.status === 'completed' ? 'var(--status-success)' : cp.status === 'current' ? 'var(--polar-cyan)' : 'rgba(168,199,209,0.3)';
                return (
                    <g key={cp.id} style={{ cursor: 'pointer' }} onClick={() => handleCheckpointClick(cp)}>
                        <rect x={cpx - 4} y={cpy - 4} width="8" height="8" rx="2" fill={color} opacity={cp.status === 'upcoming' ? 0.4 : 0.8} transform={`rotate(45, ${cpx}, ${cpy})`} />
                        <text x={cpx + 10} y={cpy + 3} fill="rgba(168,199,209,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">
                            {cp.name}
                        </text>
                    </g>
                );
            })}

            {/* Nearby stations */}
            {simulation.nearbyStations.map(st => {
                const [stx, sty] = project(st.lat, st.lng);
                return (
                    <g key={st.id} style={{ cursor: 'pointer' }} onClick={() => handleStationClick(st)}>
                        <polygon
                            points={`${stx},${sty - 7} ${stx + 6},${sty} ${stx},${sty + 7} ${stx - 6},${sty}`}
                            fill={st.status === 'OPTIMAL' ? 'rgba(99,166,138,0.3)' : 'rgba(196,154,85,0.3)'}
                            stroke={st.status === 'OPTIMAL' ? 'var(--status-success)' : 'var(--status-warning)'}
                            strokeWidth="1"
                        />
                        <text x={stx + 10} y={sty + 3} fill="rgba(168,199,209,0.6)" fontSize="9" fontWeight="500" fontFamily="'JetBrains Mono', monospace">
                            {st.name}
                        </text>
                    </g>
                );
            })}

            {/* Nearby assets */}
            {simulation.nearbyAssets.map(asset => {
                const [ax, ay] = project(asset.lat, asset.lng);
                return (
                    <g key={asset.id} style={{ cursor: 'pointer' }} onClick={() => handleAssetClick(asset)}>
                        <circle cx={ax} cy={ay} r="4" fill="rgba(168,199,209,0.2)" stroke="rgba(168,199,209,0.4)" strokeWidth="0.8" />
                        <text x={ax + 8} y={ay + 3} fill="rgba(168,199,209,0.4)" fontSize="7" fontFamily="'JetBrains Mono', monospace">
                            {asset.name}
                        </text>
                    </g>
                );
            })}

            {/* VESSEL MARKER — The Hero */}
            <g style={{ cursor: 'pointer' }} onClick={handleVesselClick} filter="url(#vessel-glow)">
                {/* Outer pulse ring */}
                <circle cx={vesselPos[0]} cy={vesselPos[1]} r="8" fill="none" stroke="var(--polar-cyan)" strokeWidth="1" className="vessel-ring" />

                {/* Inner glow */}
                <circle cx={vesselPos[0]} cy={vesselPos[1]} r="6" fill="var(--polar-cyan)" opacity="0.25" className="vessel-pulse" />

                {/* Vessel dot */}
                <circle cx={vesselPos[0]} cy={vesselPos[1]} r="5" fill="var(--polar-cyan)" stroke="#fff" strokeWidth="1.5" />

                {/* Heading indicator */}
                <line
                    x1={vesselPos[0]}
                    y1={vesselPos[1]}
                    x2={vesselPos[0] + Math.cos(headingRad) * 18}
                    y2={vesselPos[1] + Math.sin(headingRad) * 18}
                    stroke="var(--polar-cyan)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.6"
                />
                <polygon
                    points={`
            ${vesselPos[0] + Math.cos(headingRad) * 20},${vesselPos[1] + Math.sin(headingRad) * 20}
            ${vesselPos[0] + Math.cos(headingRad - 0.4) * 14},${vesselPos[1] + Math.sin(headingRad - 0.4) * 14}
            ${vesselPos[0] + Math.cos(headingRad + 0.4) * 14},${vesselPos[1] + Math.sin(headingRad + 0.4) * 14}
          `}
                    fill="var(--polar-cyan)"
                    opacity="0.5"
                />
            </g>

            {/* Vessel label */}
            <text x={vesselPos[0]} y={vesselPos[1] - 16} textAnchor="middle" fill="var(--polar-cyan)" fontSize="9" fontWeight="600" fontFamily="'JetBrains Mono', monospace" opacity="0.9">
                {simulation.vesselIcon} {simulation.currentPosition.speed > 0 ? `${simulation.currentPosition.speed} ${simulation.currentPosition.speedUnit}` : ''}
            </text>

            {/* Origin & Destination labels */}
            {routePoints.length > 0 && (
                <>
                    <g>
                        <circle cx={routePoints[0][0]} cy={routePoints[0][1]} r="6" fill="var(--status-success)" opacity="0.3" />
                        <circle cx={routePoints[0][0]} cy={routePoints[0][1]} r="3" fill="var(--status-success)" />
                        <text x={routePoints[0][0]} y={routePoints[0][1] + 16} textAnchor="middle" fill="var(--status-success)" fontSize="9" fontWeight="600" fontFamily="'JetBrains Mono', monospace" opacity="0.8">
                            ORIGIN
                        </text>
                    </g>
                    <g>
                        <circle cx={routePoints[routePoints.length - 1][0]} cy={routePoints[routePoints.length - 1][1]} r="6" fill="var(--status-critical)" opacity="0.3" />
                        <circle cx={routePoints[routePoints.length - 1][0]} cy={routePoints[routePoints.length - 1][1]} r="3" fill="var(--polar-cyan)" />
                        <text x={routePoints[routePoints.length - 1][0]} y={routePoints[routePoints.length - 1][1] + 16} textAnchor="middle" fill="var(--polar-cyan)" fontSize="9" fontWeight="600" fontFamily="'JetBrains Mono', monospace" opacity="0.8">
                            DESTINATION
                        </text>
                    </g>
                </>
            )}

            {/* Map watermark */}
            <text x={width - 12} y={height - 12} textAnchor="end" fill="rgba(168,199,209,0.12)" fontSize="8" fontFamily="'JetBrains Mono', monospace">
                POLARIS GEOSPATIAL · SIMULATED DATA
            </text>
        </svg>
    );
};
