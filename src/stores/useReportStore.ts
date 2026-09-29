import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MissionIntelligenceReport } from '../types/analysis';

interface ReportStore {
    reports: MissionIntelligenceReport[];
    addReport: (report: MissionIntelligenceReport) => void;
    getReportById: (id: string) => MissionIntelligenceReport | undefined;
    getReportsByMissionId: (missionId: string) => MissionIntelligenceReport[];
    deleteReport: (id: string) => void;
}

export const useReportStore = create<ReportStore>()(
    persist(
        (set, get) => ({
            reports: [],

            addReport: (report: MissionIntelligenceReport) => {
                set((state) => ({
                    reports: [report, ...state.reports.filter((r) => r.id !== report.id)],
                }));
            },

            getReportById: (id: string) => {
                return get().reports.find((r) => r.id === id);
            },

            getReportsByMissionId: (missionId: string) => {
                return get().reports.filter((r) => r.missionId === missionId);
            },

            deleteReport: (id: string) => {
                set((state) => ({
                    reports: state.reports.filter((r) => r.id !== id),
                }));
            },
        }),
        {
            name: 'northstar-reports',
        }
    )
);
