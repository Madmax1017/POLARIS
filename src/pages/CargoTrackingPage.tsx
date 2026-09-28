import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTE_SIMULATIONS } from '../data/routeSimulationData';
import { MOCK_CARGO } from '../data/mockData';
import { AntarcticMap } from '../components/tracking/AntarcticMap';
import { RouteInfoPanel } from '../components/tracking/RouteInfoPanel';
import { EnvironmentPanel } from '../components/tracking/EnvironmentPanel';
import { RouteTimeline } from '../components/tracking/RouteTimeline';
import { SimulationControls } from '../components/tracking/SimulationControls';
import { RouteIntelligence } from '../components/tracking/RouteIntelligence';
import { MapPopup, MapObjectInfo } from '../components/tracking/MapPopup';

export const CargoTrackingPage: React.FC = () => {
    const { cargoId } = useParams<{ cargoId: string }>();
    const navigate = useNavigate();

    // Find cargo and simulation data
    const cargo = MOCK_CARGO.find(c => c.id === cargoId);
    const simulation = cargoId ? ROUTE_SIMULATIONS[cargoId] : undefined;

    // Simulation state
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(1);
    const [animationProgress, setAnimationProgress] = useState(0); // 0.0 to 1.0 along the route
    const [selectedObject, setSelectedObject] = useState<MapObjectInfo | null>(null);

    // Animation Loop
    const requestRef = useRef<number>(0);
    const lastUpdateRef = useRef<number>(0);

    const animate = (time: number) => {
        if (isPlaying && simulation) {
            if (!lastUpdateRef.current) lastUpdateRef.current = time;
            const deltaTime = time - lastUpdateRef.current;

            // Speed 1x = takes 10 seconds to complete full route. Speed 5x = 2 seconds.
            const durationMs = 10000 / speed;
            const progressDelta = deltaTime / durationMs;

            setAnimationProgress(prev => {
                let next = prev + progressDelta;
                if (next > 1) next = 0; // loop back
                return next;
            });
        }
        lastUpdateRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, speed]);

    if (!cargo || !simulation) {
        return (
            <div className="flex h-full items-center justify-center text-[var(--text-secondary)] flex-col gap-4">
                <div>Simulation data not found for Cargo ID: {cargoId}</div>
                <button
                    onClick={() => navigate('/logistics')}
                    className="px-4 py-2 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)]"
                >
                    Return to Logistics
                </button>
            </div>
        );
    }

    // Pre-calculate current fraction completed for UI
    const currentFraction = animationProgress; // In a full app this would jump between waypoints based on real time.

    return (
        <div className="cargo-tracking-view flex flex-col h-full bg-[#030712] relative overflow-hidden -mx-4 -my-6 lg:-mx-8 lg:-my-8" style={{ borderTopLeftRadius: '16px' }}>

            {/* Top Bar Navigation */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-start justify-between pointer-events-none">
                <button
                    onClick={() => navigate('/logistics')}
                    className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-[var(--polar-cyan)]/30 text-[var(--polar-cyan)] rounded-lg text-sm font-semibold hover:bg-[var(--polar-cyan)]/10 hover:border-[var(--polar-cyan)]/60 transition-all font-mono uppercase"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Logistics
                </button>
            </div>

            {/* Hero Map Layer */}
            <div className="absolute inset-0 z-0">
                <AntarcticMap
                    simulation={simulation}
                    isPlaying={isPlaying}
                    speed={speed}
                    animationProgress={animationProgress}
                    onObjectClick={setSelectedObject}
                />
            </div>

            {/* Floating Panels Overlay (Left) */}
            <div className="absolute top-20 left-6 z-10 w-80 space-y-4 pointer-events-none">
                <div className="pointer-events-auto">
                    <RouteInfoPanel
                        cargo={cargo}
                        simulation={{ ...simulation, routeProgress: Math.floor(currentFraction * 100) }}
                    />
                </div>
                <div className="pointer-events-auto">
                    <RouteIntelligence messages={simulation.intelligence} />
                </div>
            </div>

            {/* Floating Panels Overlay (Right) */}
            <div className="absolute top-20 right-6 z-10 w-80 space-y-4 pointer-events-none">
                <div className="pointer-events-auto">
                    <EnvironmentPanel simulation={simulation} />
                </div>
            </div>

            {/* Simulation Controls (Bottom Right) */}
            <div className="absolute bottom-28 right-6 z-10 pointer-events-auto">
                <SimulationControls
                    isPlaying={isPlaying}
                    speed={speed}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onSpeedChange={setSpeed}
                />
            </div>

            {/* Map Context Popup (Center) */}
            {selectedObject && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <MapPopup object={selectedObject} onClose={() => setSelectedObject(null)} />
                </div>
            )}

            {/* Route Timeline (Bottom) */}
            <div className="absolute bottom-6 left-6 right-6 z-10 bg-black/60 backdrop-blur-md rounded-xl p-4 border border-[var(--border-subtle)]/30 pointer-events-auto pb-4">
                <RouteTimeline checkpoints={simulation.checkpoints} />
            </div>

        </div>
    );
};
