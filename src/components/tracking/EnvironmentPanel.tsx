import React from 'react';
import { CargoSimulation } from '../../data/routeSimulationData';
import { Thermometer, Wind, Eye, CloudSnow, Compass, Waves, Radio, Triangle, ShieldAlert } from 'lucide-react';

interface Props {
    simulation: CargoSimulation;
}

const riskColors: Record<string, string> = {
    LOW: 'var(--status-success)',
    MODERATE: 'var(--status-warning)',
    HIGH: 'var(--status-critical)',
    SEVERE: '#ff3366',
};

const conditionStatusColors: Record<string, string> = {
    STABLE: 'var(--status-success)',
    CAUTION: 'var(--status-warning)',
    WARNING: 'var(--status-critical)',
    CRITICAL: '#ff3366',
};

export const EnvironmentPanel: React.FC<Props> = ({ simulation }) => {
    return (
        <div className="env-panel">
            {/* Route Conditions */}
            <div className="env-route-condition">
                <span className="env-label">ROUTE CONDITIONS</span>
                <div className="env-condition-badge" style={{
                    color: conditionStatusColors[simulation.routeCondition.status],
                    borderColor: conditionStatusColors[simulation.routeCondition.status] + '40',
                    backgroundColor: conditionStatusColors[simulation.routeCondition.status] + '10',
                }}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {simulation.routeCondition.status}
                </div>
                <span className="env-condition-msg">{simulation.routeCondition.message}</span>
            </div>

            <div className="env-divider" />

            {/* Nearby Stations */}
            {simulation.nearbyStations.length > 0 && (
                <div className="env-section">
                    <span className="env-label">NEARBY STATIONS</span>
                    <div className="env-list">
                        {simulation.nearbyStations.map(s => (
                            <div key={s.id} className="env-station-item">
                                <div className="env-station-dot" style={{
                                    backgroundColor: s.status === 'OPTIMAL' ? 'var(--status-success)' : 'var(--status-warning)'
                                }} />
                                <span>{s.name}</span>
                                {s.personnel && <span className="env-station-count">{s.personnel}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Nearby Assets */}
            {simulation.nearbyAssets.length > 0 && (
                <div className="env-section">
                    <span className="env-label">NEARBY ASSETS</span>
                    <div className="env-list">
                        {simulation.nearbyAssets.map(a => (
                            <div key={a.id} className="env-asset-item">
                                <div className="env-asset-icon">
                                    {a.type === 'vessel' ? <Waves className="w-3 h-3" /> :
                                        a.type === 'aircraft' ? <Compass className="w-3 h-3" /> :
                                            a.type === 'convoy' ? <Radio className="w-3 h-3" /> :
                                                <Triangle className="w-3 h-3" />}
                                </div>
                                <div>
                                    <div className="env-asset-name">{a.name}</div>
                                    {a.description && <div className="env-asset-desc">{a.description}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="env-divider" />

            {/* Environmental Conditions */}
            <div className="env-section">
                <span className="env-label">ENVIRONMENTAL CONDITIONS</span>
                <div className="env-conditions-grid">
                    <div className="env-cond-item">
                        <Thermometer className="w-3 h-3" style={{ color: 'var(--polar-cyan)' }} />
                        <span className="env-cond-label">Temp</span>
                        <span className="env-cond-value">{simulation.environment.temperature}</span>
                    </div>
                    <div className="env-cond-item">
                        <Wind className="w-3 h-3" style={{ color: 'var(--polar-cyan)' }} />
                        <span className="env-cond-label">Wind</span>
                        <span className="env-cond-value">{simulation.environment.wind}</span>
                    </div>
                    <div className="env-cond-item">
                        <Eye className="w-3 h-3" style={{ color: 'var(--polar-cyan)' }} />
                        <span className="env-cond-label">Visibility</span>
                        <span className="env-cond-value">{simulation.environment.visibility}</span>
                    </div>
                    <div className="env-cond-item">
                        <CloudSnow className="w-3 h-3" style={{ color: 'var(--polar-cyan)' }} />
                        <span className="env-cond-label">Sea Ice</span>
                        <span className="env-cond-value">{simulation.environment.seaIce}</span>
                    </div>
                    <div className="env-cond-item" style={{ gridColumn: 'span 2' }}>
                        <Compass className="w-3 h-3" style={{ color: 'var(--polar-cyan)' }} />
                        <span className="env-cond-label">Weather</span>
                        <span className="env-cond-value">{simulation.environment.weather}</span>
                    </div>
                </div>
            </div>

            {/* Ice Conditions */}
            {simulation.iceConditions.length > 0 && (
                <div className="env-section">
                    <span className="env-label">ICE CONDITIONS</span>
                    {simulation.iceConditions.map((ic, i) => (
                        <div key={i} className="env-ice-card">
                            <div className="env-ice-header">
                                <span className="env-ice-dot" style={{ backgroundColor: riskColors[ic.risk] }} />
                                <span className="env-ice-desc">{ic.description}</span>
                            </div>
                            <div className="env-ice-details">
                                <span>Distance: {ic.distance}</span>
                                {ic.concentration !== 'N/A' && <span>Concentration: {ic.concentration}</span>}
                                <span style={{ color: riskColors[ic.risk] }}>Risk: {ic.risk}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
