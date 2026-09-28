import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Mission, MissionStatus } from '../types';
import { SEED_MISSIONS } from '../data/missionData';

interface MissionStore {
    missions: Mission[];
    draftMission: Partial<Mission> | null;
    addMission: (mission: Mission) => void;
    updateMission: (id: string, updates: Partial<Mission>) => void;
    setMissionStatus: (id: string, status: MissionStatus) => void;
    saveDraft: (draft: Partial<Mission>) => void;
    clearDraft: () => void;
    getMissionById: (id: string) => Mission | undefined;
    isSeeded: boolean;
    seedMissions: () => void;
}

export const useMissionStore = create<MissionStore>()(
    persist(
        (set, get) => ({
            missions: [],
            draftMission: null,
            isSeeded: false,

            seedMissions: () => {
                const { isSeeded, missions } = get();
                if (!isSeeded && missions.length === 0) {
                    set({ missions: SEED_MISSIONS, isSeeded: true });
                }
            },

            addMission: (mission: Mission) => {
                set((state) => ({
                    missions: [mission, ...state.missions],
                    draftMission: null,
                }));
            },

            updateMission: (id: string, updates: Partial<Mission>) => {
                set((state) => ({
                    missions: state.missions.map((m) =>
                        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
                    ),
                }));
            },

            setMissionStatus: (id: string, status: MissionStatus) => {
                set((state) => ({
                    missions: state.missions.map((m) =>
                        m.id === id
                            ? { ...m, status, updatedAt: new Date().toISOString() }
                            : m
                    ),
                }));
            },

            saveDraft: (draft: Partial<Mission>) => {
                set({ draftMission: draft });
            },

            clearDraft: () => {
                set({ draftMission: null });
            },

            getMissionById: (id: string) => {
                return get().missions.find((m) => m.id === id);
            },
        }),
        {
            name: 'northstar-missions',
            partialize: (state) => ({
                missions: state.missions,
                isSeeded: state.isSeeded,
            }),
        }
    )
);
