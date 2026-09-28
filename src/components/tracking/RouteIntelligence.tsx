import React from 'react';
import { IntelligenceMessage } from '../../data/routeSimulationData';
import { BrainCircuit } from 'lucide-react';

interface Props {
    messages: IntelligenceMessage[];
}

const typeIcons: Record<string, string> = {
    ok: '✓',
    warning: '⚠',
    info: '→',
};

const typeColors: Record<string, string> = {
    ok: 'var(--status-success)',
    warning: 'var(--status-warning)',
    info: 'var(--polar-cyan)',
};

export const RouteIntelligence: React.FC<Props> = ({ messages }) => {
    return (
        <div className="route-intel">
            <div className="ri-header">
                <BrainCircuit className="w-3.5 h-3.5" style={{ color: 'var(--polar-cyan)' }} />
                <span className="ri-title">ROUTE INTELLIGENCE</span>
            </div>
            <div className="ri-messages">
                {messages.slice(0, 4).map((msg, idx) => (
                    <div key={idx} className="ri-message">
                        <span className="ri-icon" style={{ color: typeColors[msg.type] }}>
                            {typeIcons[msg.type]}
                        </span>
                        <span className="ri-text">{msg.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
