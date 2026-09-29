import React, { useState, useEffect } from 'react';
import {
  FileBarChart, Download, Brain, Search, Calendar, ShieldAlert,
  Share2, Trash2, Eye, Fuel, AlertTriangle, CheckCircle2, RefreshCw, Compass
} from 'lucide-react';
import { useReportStore } from '../stores/useReportStore';
import { MissionIntelligenceReport } from '../types/analysis';
import { MissionIntelligenceReportModal } from '../components/intelligence/MissionIntelligenceReportModal';
import { useMissionStore } from '../stores/useMissionStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { generateMissionAnalysis } from '../services/analysisService';

export const ReportsPage: React.FC = () => {
  const { reports, deleteReport, addReport } = useReportStore();
  const { missions, seedMissions, isSeeded: isMissionSeeded } = useMissionStore();
  const { items: inventoryItems, seedInventory, isSeeded: isInventorySeeded } = useInventoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<MissionIntelligenceReport | null>(null);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');

  useEffect(() => {
    if (!isMissionSeeded) seedMissions();
    if (!isInventorySeeded) seedInventory();
  }, [isMissionSeeded, isInventorySeeded]);

  const filteredReports = reports.filter(r =>
    r.missionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.executiveSummary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateFromPage = async () => {
    const m = missions.find(x => x.id === selectedMissionId) || missions[0];
    if (!m) return;

    setIsGeneratingNew(true);
    const rep = await generateMissionAnalysis(m, inventoryItems);
    addReport(rep);
    setSelectedReport(rep);
    setIsGeneratingNew(false);
  };

  const handleShare = async (report: MissionIntelligenceReport) => {
    const text = `NORTHSTAR Intelligence Report: ${report.missionName} (ID: ${report.id})\nReadiness: ${report.overallReadiness.score}%\nStatus: ${report.overallReadiness.status}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `NORTHSTAR Intelligence: ${report.missionName}`, text });
      } catch {
        // ignore
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#176B52]" />
            Polar Analytics & NORTHSTAR Intelligence Reports
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Operational evaluations, readiness assessments, and NCPOR Ministry compliance ledgers.
          </p>
        </div>

        {/* Generate Analysis Quick Bar */}
        <div className="flex items-center gap-2 bg-[var(--surface-primary)] p-1.5 rounded-xl border border-[var(--border-primary)] shrink-0">
          <select
            value={selectedMissionId}
            onChange={(e) => setSelectedMissionId(e.target.value)}
            className="bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--polar-cyan)]"
          >
            <option value="">-- Select Mission for NORTHSTAR Intelligence --</option>
            {missions.map(m => (
              <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
            ))}
          </select>

          <button
            onClick={handleGenerateFromPage}
            disabled={isGeneratingNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F3D32] hover:bg-[#176B52] text-white font-mono font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            {isGeneratingNew ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Brain className="w-3.5 h-3.5" />
            )}
            <span>ANALYZE</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search reports by mission name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--polar-cyan)]"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
          <span>TOTAL REPORTS: <strong className="text-[var(--text-primary)]">{reports.length}</strong></span>
          <span>CRITICAL ASSESSMENTS: <strong className="text-amber-400">{reports.filter(r => r.overallReadiness.status === 'HIGH RISK' || r.overallReadiness.status === 'NOT READY').length}</strong></span>
        </div>
      </div>

      {/* Generated Intelligence Reports Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold text-[#176B52] uppercase tracking-wider flex items-center gap-2">
          <Brain className="w-4 h-4" /> NORTHSTAR Intelligence Reports ({filteredReports.length})
        </h3>

        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-[var(--surface-primary)] border border-dashed border-[var(--border-primary)] rounded-xl">
            <Brain className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
            <p className="text-xs font-mono text-[var(--text-muted)]">No intelligence reports matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 hover:border-[#176B52]/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                {/* Card Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#176B52] bg-[#E8F3F5] border border-[#D9E6E1] px-2 py-0.5 rounded">
                          {report.id}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {report.generatedAt}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[var(--text-primary)] mt-1.5 uppercase tracking-wide">
                        {report.missionName}
                      </h4>
                    </div>

                    {/* Readiness Circle Badge */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1 bg-[#238B63]/10 border border-[#238B63]/30 px-2.5 py-1 rounded-lg">
                        <span className="text-xs font-mono font-bold text-[#238B63]">
                          {report.overallReadiness.score}%
                        </span>
                        <span className="text-[9px] font-mono text-[#238B63] uppercase">Ready</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {report.executiveSummary}
                  </p>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-[10px] font-mono">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[8px] uppercase">Status</span>
                    <span className={`font-bold ${report.overallReadiness.status === 'NOT READY' || report.overallReadiness.status === 'HIGH RISK' ? 'text-rose-400' : report.overallReadiness.status === 'READY WITH CAUTIONS' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {report.overallReadiness.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[8px] uppercase font-bold">Logistics</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {report.logisticsAssessment.score}% Score
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[8px] uppercase font-bold">Route Profile</span>
                    <span className="font-bold text-[#176B52] truncate block">
                      {report.routeAssessment.status}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F3D32] hover:bg-[#176B52] text-white rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> OPEN REPORT
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShare(report)}
                      title="Share report summary"
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[#176B52] hover:bg-[#E8F3F5] rounded-lg transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      title="Delete report"
                      className="p-1.5 text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Standard Audit Ledgers Section */}
      <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
        <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Standard Expedition Compliance Audits & Ledgers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 space-y-3 text-[var(--text-primary)] hover:border-[var(--polar-cyan)]/40 transition-all">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[var(--text-primary)] text-sm">Annual Resupply Depletion Audit</h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border border-[var(--polar-cyan)]/30">
                LOGISTICS
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Analyzes fuel burn rates across Maitri and Bharati to forecast cargo vessel capacity required for the 44th IAE.
            </p>
            <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[var(--polar-cyan)] font-medium">
              <span className="text-[var(--text-muted)] font-mono text-[10px]">Last Generated: 2 days ago</span>
              <button className="hover:underline flex items-center cursor-pointer font-semibold">Download <Download className="w-3 h-3 ml-1" /></button>
            </div>
          </div>

          <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 space-y-3 text-[var(--text-primary)] hover:border-[var(--polar-cyan)]/40 transition-all">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[var(--text-primary)] text-sm">Field Safety & Dead-Man's-Switch Audit</h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/30">
                SAFETY
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Summary of check-in response compliance, automated triggers, and medical reach-back drills over winter period.
            </p>
            <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[var(--polar-cyan)] font-medium">
              <span className="text-[var(--text-muted)] font-mono text-[10px]">Last Generated: Today</span>
              <button className="hover:underline flex items-center cursor-pointer font-semibold font-sans">Download <Download className="w-3 h-3 ml-1" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Viewer Modal */}
      {selectedReport && (
        <MissionIntelligenceReportModal
          report={selectedReport}
          isLoading={false}
          missionName={selectedReport.missionName}
          onClose={() => setSelectedReport(null)}
          onRegenerate={async () => {
            const m = missions.find(x => x.name === selectedReport.missionName);
            if (m) {
              const newRep = await generateMissionAnalysis(m, inventoryItems);
              addReport(newRep);
              setSelectedReport(newRep);
            }
          }}
        />
      )}
    </div>
  );
};
