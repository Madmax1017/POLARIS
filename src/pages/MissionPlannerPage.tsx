import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, CheckCircle2 } from 'lucide-react';
import { Mission } from '../types';
import { useMissionStore } from '../stores/useMissionStore';
import { generateMissionId } from '../data/missionData';
import { Step01, Step02, Step03, Step04 } from './planner/StepsA';
import { Step05, Step06, Step07, Step08 } from './planner/StepsB';
import { Step09, computeReadiness } from './planner/Step09';

const STEPS = [
    { num: '01', label: 'Mission Details' },
    { num: '02', label: 'Objectives' },
    { num: '03', label: 'Route & Area' },
    { num: '04', label: 'Personnel' },
    { num: '05', label: 'Assets & Equipment' },
    { num: '06', label: 'Cargo & Logistics' },
    { num: '07', label: 'Schedule' },
    { num: '08', label: 'Risk & Conditions' },
    { num: '09', label: 'Review & Authorize' },
];

export const MissionPlannerPage: React.FC = () => {
    const navigate = useNavigate();
    const { missions, addMission, saveDraft, draftMission } = useMissionStore();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<Partial<Mission>>(draftMission || {});
    const [saved, setSaved] = useState(false);

    // Auto-generate mission ID once
    useEffect(() => {
        if (!data.id) {
            const id = generateMissionId(missions.map(m => m.id));
            setData(d => ({ ...d, id }));
        }
    }, []);

    const merge = (updates: Partial<Mission>) => setData(d => ({ ...d, ...updates }));

    const handleSaveDraft = () => {
        saveDraft(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleCreateMission = () => {
        const now = new Date().toISOString();
        const { readiness, overall } = computeReadiness(data);
        const mission: Mission = {
            id: data.id!,
            name: data.name || 'Unnamed Mission',
            type: data.type || 'Other',
            priority: data.priority || 'Routine',
            status: 'PLANNED',
            commanderName: data.commanderName || '',
            commanderPersonnelId: data.commanderPersonnelId || '',
            operationalBase: data.operationalBase || '',
            description: data.description || '',
            objectives: data.objectives || [],
            successCriteria: data.successCriteria || '',
            checkpoints: data.checkpoints || [],
            routeSummary: data.routeSummary || '',
            estimatedDistanceKm: data.estimatedDistanceKm || 0,
            estimatedTravelHours: data.estimatedTravelHours || 0,
            personnel: data.personnel || [],
            assets: data.assets || [],
            cargo: data.cargo || [],
            phases: data.phases || [],
            departureTime: data.departureTime || '',
            returnTime: data.returnTime || '',
            durationHours: data.durationHours || 0,
            risks: data.risks || [],
            environmentalConditions: data.environmentalConditions || {
                temperature: '—', wind: '—', visibility: '—', seaIce: '—',
                weather: '—', terrain: '—', connectivity: '—',
            },
            readiness,
            overallReadiness: overall,
            createdAt: now,
            updatedAt: now,
        };
        addMission(mission);
        navigate(`/missions?created=${mission.id}`);
    };

    const isLast = step === STEPS.length - 1;

    const stepComponents = [
        <Step01 data={data} set={merge} />,
        <Step02 data={data} set={merge} />,
        <Step03 data={data} set={merge} />,
        <Step04 data={data} set={merge} />,
        <Step05 data={data} set={merge} />,
        <Step06 data={data} set={merge} />,
        <Step07 data={data} set={merge} />,
        <Step08 data={data} set={merge} />,
        <Step09 data={data} />,
    ];

    return (
        <div className="space-y-5 font-sans text-[var(--text-primary)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                    <button onClick={() => navigate('/missions')} className="flex items-center gap-1 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--polar-cyan)] transition mb-2 cursor-pointer">
                        <ChevronLeft className="w-3.5 h-3.5" /> BACK TO MISSIONS
                    </button>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">MISSION PLANNING</h2>
                    <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">Plan and authorize a new polar expedition operation.</p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">Define objectives, personnel, assets, logistics, route, schedule and operational risks before deployment.</p>
                </div>
                {data.id && (
                    <div className="shrink-0 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5">
                        <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase">Mission ID</p>
                        <p className="text-xs font-mono font-bold text-[var(--polar-cyan)]">{data.id}</p>
                    </div>
                )}
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0 overflow-x-auto pb-2 border-b border-[var(--border-subtle)]">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s.num}>
                        <button
                            onClick={() => setStep(i)}
                            className={`flex flex-col items-center gap-1 px-3 py-2 shrink-0 rounded-lg transition cursor-pointer ${i === step ? 'bg-[var(--surface-elevated)] border border-[var(--border-primary)]'
                                    : i < step ? 'opacity-60 hover:opacity-80' : 'opacity-40 hover:opacity-60'
                                }`}
                        >
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-bold ${i < step ? 'bg-[var(--polar-cyan)] border-[var(--polar-cyan)] text-[#0a0a09]'
                                    : i === step ? 'border-[var(--polar-cyan)] text-[var(--polar-cyan)]'
                                        : 'border-[var(--border-primary)] text-[var(--text-muted)]'
                                }`}>
                                {i < step ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-center max-w-16 leading-tight">
                                {s.label}
                            </span>
                        </button>
                        {i < STEPS.length - 1 && <div className="w-4 h-px bg-[var(--border-subtle)] shrink-0" />}
                    </React.Fragment>
                ))}
            </div>

            {/* Step Header */}
            <div className="flex items-baseline gap-3">
                <span className="text-3xl font-mono font-extrabold text-[var(--polar-cyan)] opacity-40">{STEPS[step].num}</span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">{STEPS[step].label}</h3>
            </div>

            {/* Step Content */}
            <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-sm">
                {stepComponents[step]}
            </div>

            {/* Navigation Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
                <button
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="flex items-center gap-1.5 px-4 py-2 border border-[var(--border-primary)] rounded-lg text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)] disabled:opacity-30 transition cursor-pointer"
                >
                    <ChevronLeft className="w-3.5 h-3.5" /> BACK
                </button>

                <div className="flex items-center gap-2">
                    {saved && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Draft saved
                        </span>
                    )}
                    <button
                        onClick={handleSaveDraft}
                        className="flex items-center gap-1.5 px-4 py-2 border border-[var(--border-primary)] rounded-lg text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--polar-cyan)] transition cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" /> SAVE DRAFT
                    </button>

                    {!isLast ? (
                        <button
                            onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                            className="flex items-center gap-1.5 px-5 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                        >
                            CONTINUE <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleCreateMission}
                            className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-mono font-bold shadow transition cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" /> CREATE MISSION
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
