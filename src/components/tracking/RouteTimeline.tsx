import React from 'react';
import { Checkpoint } from '../../data/routeSimulationData';
import { Check, Circle, CircleDot } from 'lucide-react';

interface Props {
    checkpoints: Checkpoint[];
}

export const RouteTimeline: React.FC<Props> = ({ checkpoints }) => {
    return (
        <div className="route-timeline">
            <div className="rt-track">
                {checkpoints.map((cp, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === checkpoints.length - 1;

                    return (
                        <React.Fragment key={cp.id}>
                            {/* Connector line before this node (except first) */}
                            {!isFirst && (
                                <div className={`rt-connector ${cp.status === 'completed' || cp.status === 'current' ? 'rt-connector-done' : 'rt-connector-pending'}`} />
                            )}

                            {/* Checkpoint node */}
                            <div className={`rt-node rt-node-${cp.status}`}>
                                <div className="rt-node-icon">
                                    {cp.status === 'completed' ? (
                                        <Check className="w-3 h-3" />
                                    ) : cp.status === 'current' ? (
                                        <CircleDot className="w-3.5 h-3.5" />
                                    ) : (
                                        <Circle className="w-3 h-3" />
                                    )}
                                </div>
                                <div className="rt-node-label">{cp.name}</div>
                                {cp.eta && <div className="rt-node-eta">{cp.eta}</div>}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
