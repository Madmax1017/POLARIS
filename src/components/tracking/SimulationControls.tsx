import React, { useState, useEffect } from 'react';
import { Play, Pause, Radio } from 'lucide-react';

interface Props {
    isPlaying: boolean;
    speed: number;
    onTogglePlay: () => void;
    onSpeedChange: (speed: number) => void;
}

export const SimulationControls: React.FC<Props> = ({ isPlaying, speed, onTogglePlay, onSpeedChange }) => {
    const [lastUpdate, setLastUpdate] = useState(0);
    const [nextUpdate, setNextUpdate] = useState(60);

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setLastUpdate(prev => prev + 1);
            setNextUpdate(prev => {
                if (prev <= 1) {
                    setLastUpdate(0);
                    return 60;
                }
                return prev - 1;
            });
        }, 1000 / speed);
        return () => clearInterval(interval);
    }, [isPlaying, speed]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    return (
        <div className="sim-controls">
            <div className="sim-controls-left">
                <div className="sim-live-indicator">
                    <Radio className="w-3 h-3" />
                    <span>LIVE SIMULATION</span>
                </div>
            </div>

            <div className="sim-controls-center">
                <button className="sim-play-btn" onClick={onTogglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <div className="sim-speed-group">
                    {[1, 2, 5].map(s => (
                        <button
                            key={s}
                            className={`sim-speed-btn ${speed === s ? 'sim-speed-active' : ''}`}
                            onClick={() => onSpeedChange(s)}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
            </div>

            <div className="sim-controls-right">
                <div className="sim-telemetry-info">
                    <div className="sim-telemetry-row">
                        <span className="sim-telemetry-label">LAST UPDATE</span>
                        <span className="sim-telemetry-value">{formatTime(lastUpdate)}</span>
                    </div>
                    <div className="sim-telemetry-row">
                        <span className="sim-telemetry-label">NEXT UPDATE</span>
                        <span className="sim-telemetry-value">{formatTime(nextUpdate)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
