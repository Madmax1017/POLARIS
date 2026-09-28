import React from 'react';
import { CargoShipment } from '../../types';
import { CargoSimulation } from '../../data/routeSimulationData';
import { Anchor, Plane, Mountain, Ship, Navigation, Gauge, Clock, MapPin, ArrowRight } from 'lucide-react';

interface Props {
    cargo: CargoShipment;
    simulation: CargoSimulation;
}

const vesselTypeLabels: Record<string, string> = {
    icebreaker: 'ICEBREAKER',
    aircraft: 'CARGO AIRCRAFT',
    snowcat: 'SNOW-CAT CONVOY',
    supply_ship: 'SUPPLY VESSEL',
};

const VesselIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'icebreaker':
        case 'supply_ship':
            return <Anchor className="w-4 h-4" />;
        case 'aircraft':
            return <Plane className="w-4 h-4" />;
        case 'snowcat':
            return <Mountain className="w-4 h-4" />;
        default:
            return <Ship className="w-4 h-4" />;
    }
};

export const RouteInfoPanel: React.FC<Props> = ({ cargo, simulation }) => {
    const progressColor = simulation.routeProgress >= 75
        ? 'var(--status-success)'
        : simulation.routeProgress >= 40
            ? 'var(--polar-cyan)'
            : 'var(--status-warning)';

    return (
        <div className="route-info-panel">
            {/* Cargo ID Header */}
            <div className="rip-header">
                <span className="rip-tracking-id">{cargo.trackingId}</span>
            </div>

            {/* Vessel Name & Type */}
            <div className="rip-vessel">
                <div className="rip-vessel-icon">
                    <VesselIcon type={simulation.vesselType} />
                </div>
                <div>
                    <div className="rip-vessel-name">{cargo.vesselName.split('(')[0].trim()}</div>
                    <div className="rip-vessel-type">{vesselTypeLabels[simulation.vesselType] || simulation.vesselType}</div>
                </div>
            </div>

            {/* Status */}
            <div className="rip-status-row">
                <span className="rip-label">STATUS</span>
                <span className={`rip-status-badge rip-status-${cargo.status.toLowerCase()}`}>
                    {cargo.status.replace(/_/g, ' ')}
                </span>
            </div>

            {/* Route */}
            <div className="rip-route">
                <span className="rip-label">ROUTE</span>
                <div className="rip-route-path">
                    <span className="rip-origin">{cargo.origin.split(',')[0]}</span>
                    <ArrowRight className="w-3 h-3" style={{ color: 'var(--polar-cyan)', flexShrink: 0 }} />
                    <span className="rip-dest">{cargo.destination.split(',')[0]}</span>
                </div>
            </div>

            {/* Route Progress */}
            <div className="rip-progress-section">
                <div className="rip-progress-header">
                    <span className="rip-label">ROUTE PROGRESS</span>
                    <span className="rip-progress-pct" style={{ color: progressColor }}>{simulation.routeProgress}%</span>
                </div>
                <div className="rip-progress-bar-bg">
                    <div
                        className="rip-progress-bar-fill"
                        style={{ width: `${simulation.routeProgress}%`, backgroundColor: progressColor }}
                    />
                </div>
            </div>

            {/* Distance & ETA */}
            <div className="rip-stats-grid">
                <div className="rip-stat">
                    <span className="rip-label">DISTANCE REMAINING</span>
                    <span className="rip-stat-value">{simulation.distanceRemaining}</span>
                </div>
                <div className="rip-stat">
                    <span className="rip-label">ETA</span>
                    <span className="rip-stat-value rip-stat-highlight">{simulation.eta}</span>
                </div>
            </div>

            {/* Next Checkpoint */}
            <div className="rip-checkpoint">
                <span className="rip-label">NEXT CHECKPOINT</span>
                <span className="rip-checkpoint-name">{simulation.nextCheckpoint}</span>
            </div>

            {/* Divider */}
            <div className="rip-divider" />

            {/* Vessel Telemetry */}
            <div className="rip-telemetry">
                <span className="rip-label" style={{ marginBottom: '8px', display: 'block' }}>VESSEL POSITION</span>
                <div className="rip-telemetry-grid">
                    <div className="rip-telemetry-item">
                        <MapPin className="w-3 h-3" style={{ color: 'var(--polar-cyan)' }} />
                        <div>
                            <div className="rip-telemetry-label">COORDINATES</div>
                            <div className="rip-telemetry-value">{simulation.currentPosition.coordinatesDisplay}</div>
                        </div>
                    </div>
                    <div className="rip-telemetry-item">
                        <Gauge className="w-3 h-3" style={{ color: 'var(--polar-cyan)' }} />
                        <div>
                            <div className="rip-telemetry-label">SPEED</div>
                            <div className="rip-telemetry-value">{simulation.currentPosition.speed} {simulation.currentPosition.speedUnit}</div>
                        </div>
                    </div>
                    <div className="rip-telemetry-item">
                        <Navigation className="w-3 h-3" style={{ color: 'var(--polar-cyan)' }} />
                        <div>
                            <div className="rip-telemetry-label">HEADING</div>
                            <div className="rip-telemetry-value">{simulation.currentPosition.heading}°</div>
                        </div>
                    </div>
                    <div className="rip-telemetry-item">
                        <Clock className="w-3 h-3" style={{ color: 'var(--polar-cyan)' }} />
                        <div>
                            <div className="rip-telemetry-label">LAST UPDATE</div>
                            <div className="rip-telemetry-value">{simulation.currentPosition.lastUpdate}</div>
                        </div>
                    </div>
                </div>
            </div>

            {simulation.altitude && (
                <div className="rip-altitude">
                    <span className="rip-label">ALTITUDE</span>
                    <span className="rip-stat-value">{simulation.altitude}</span>
                </div>
            )}
        </div>
    );
};
