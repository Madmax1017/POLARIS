import React from 'react';
import { X } from 'lucide-react';

export type MapObjectType = 'vessel' | 'station' | 'iceberg' | 'weather' | 'checkpoint' | 'asset';

export interface MapObjectInfo {
    type: MapObjectType;
    title: string;
    details: Record<string, string>;
}

interface Props {
    object: MapObjectInfo | null;
    onClose: () => void;
}

const typeColors: Record<MapObjectType, string> = {
    vessel: 'var(--polar-cyan)',
    station: 'var(--status-success)',
    iceberg: '#7dd3fc',
    weather: 'var(--status-warning)',
    checkpoint: 'var(--polar-cyan)',
    asset: 'var(--text-secondary)',
};

export const MapPopup: React.FC<Props> = ({ object, onClose }) => {
    if (!object) return null;

    return (
        <div className="map-popup">
            <div className="mp-header">
                <div className="mp-type-badge" style={{
                    color: typeColors[object.type],
                    borderColor: typeColors[object.type] + '40',
                    backgroundColor: typeColors[object.type] + '10',
                }}>
                    {object.type.toUpperCase()}
                </div>
                <button className="mp-close" onClick={onClose}>
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="mp-title">{object.title}</div>
            <div className="mp-details">
                {Object.entries(object.details).map(([key, value]) => (
                    <div key={key} className="mp-detail-row">
                        <span className="mp-detail-key">{key}</span>
                        <span className="mp-detail-value">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
