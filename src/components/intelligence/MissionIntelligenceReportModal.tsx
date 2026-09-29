import React, { useState } from 'react';
import {
    Brain,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Download,
    Share2,
    RefreshCw,
    X,
    Cpu,
    FileText,
    Users,
    Truck,
    Navigation,
    CloudSnow,
    Radio,
    Package,
    ArrowRight
} from 'lucide-react';
import { MissionIntelligenceReport } from '../../types/analysis';

interface MissionIntelligenceReportModalProps {
    report: MissionIntelligenceReport | null;
    isLoading: boolean;
    onClose: () => void;
    onRegenerate: () => void;
    missionName: string;
}

export const MissionIntelligenceReportModal: React.FC<MissionIntelligenceReportModalProps> = ({
    report,
    isLoading,
    onClose,
    onRegenerate,
    missionName,
}) => {
    const [copied, setCopied] = useState(false);

    if (!report && !isLoading) return null;

    const handleShare = async () => {
        const shareData = {
            title: `NORTHSTAR Intelligence Report: ${missionName}`,
            text: `NORTHSTAR Mission Intelligence Report for ${missionName} (Generated: ${report?.generatedAt})`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
                // User cancelled share
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'READY':
                return <span className="px-3 py-1 bg-[#238B63]/10 text-[#238B63] border border-[#238B63]/30 rounded text-xs font-mono font-bold tracking-wider">READY</span>;
            case 'READY WITH CAUTIONS':
                return <span className="px-3 py-1 bg-[#B98224]/10 text-[#B98224] border border-[#B98224]/30 rounded text-xs font-mono font-bold tracking-wider">READY WITH CAUTIONS</span>;
            case 'REVIEW REQUIRED':
                return <span className="px-3 py-1 bg-[#B98224]/15 text-[#B98224] border border-[#B98224]/40 rounded text-xs font-mono font-bold tracking-wider">REVIEW REQUIRED</span>;
            case 'HIGH RISK':
            case 'NOT READY':
                return <span className="px-3 py-1 bg-[#B94A48]/10 text-[#B94A48] border border-[#B94A48]/30 rounded text-xs font-mono font-bold tracking-wider">{status}</span>;
            default:
                return <span className="px-3 py-1 bg-[#176B52]/10 text-[#176B52] border border-[#176B52]/30 rounded text-xs font-mono font-bold tracking-wider">{status}</span>;
        }
    };

    const getScoreStroke = (score: number) => {
        if (score >= 85) return 'stroke-[#238B63] text-[#238B63]';
        if (score >= 70) return 'stroke-[#176B52] text-[#176B52]';
        if (score >= 50) return 'stroke-[#B98224] text-[#B98224]';
        return 'stroke-[#B94A48] text-[#B94A48]';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17231F]/50 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:text-black font-sans">
            <div className="relative w-full max-w-5xl max-h-[92vh] bg-white border border-[#D9E6E1] rounded-xl shadow-xl overflow-hidden flex flex-col print:max-h-none print:shadow-none print:border-none print:rounded-none">

                {/* Modal Header */}
                <div className="px-6 py-4 bg-[#F7FAF8] border-b border-[#D9E6E1] flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#E8F3F5] border border-[#D9E6E1] rounded-lg text-[#176B52]">
                            <Brain className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs font-bold tracking-wider text-[#0F3D32] font-mono uppercase">
                                    NORTHSTAR MISSION INTELLIGENCE REPORT
                                </h2>
                                <span className="px-2.5 py-0.5 bg-[#E8F3F5] text-[#176B52] border border-[#D9E6E1] rounded text-[10px] font-mono font-bold">
                                    NORTHSTAR INTELLIGENCE
                                </span>
                            </div>
                            <p className="text-xs text-[#66756F] font-mono mt-0.5">
                                {missionName} · {report?.id || 'Processing'} · Generated: {report?.generatedAt || 'Processing...'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onRegenerate}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-white hover:bg-[#F0F6F3] text-[#0F3D32] border border-[#D9E6E1] rounded-lg text-xs font-mono flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-[#176B52] ${isLoading ? 'animate-spin' : ''}`} />
                            Regenerate
                        </button>

                        <button
                            onClick={handleShare}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-white hover:bg-[#F0F6F3] text-[#0F3D32] border border-[#176B52] rounded-lg text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <Share2 className="w-3.5 h-3.5 text-[#176B52]" />
                            {copied ? 'Copied Link!' : 'Share'}
                        </button>

                        <button
                            onClick={handleDownloadPDF}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-[#0F3D32] hover:bg-[#176B52] text-white border border-[#0F3D32] rounded-lg text-xs font-mono flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                            <Download className="w-3.5 h-3.5 text-white" />
                            Download PDF
                        </button>

                        <button
                            onClick={onClose}
                            className="p-1.5 text-[#66756F] hover:text-[#17231F] hover:bg-[#F0F6F3] rounded-lg transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Header - Visible only in Print */}
                <div className="hidden print:block p-8 border-b border-gray-300">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">NORTHSTAR MISSION INTELLIGENCE REPORT</h1>
                    <p className="text-sm text-gray-600 mt-1">Mission: {missionName} | Generated: {report?.generatedAt}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: NORTHSTAR Intelligence Operational Assessment</p>
                </div>

                {/* Content Container */}
                <div className="p-6 overflow-y-auto space-y-6 text-[#17231F] bg-[#F7FAF8] custom-scrollbar print:overflow-visible">

                    {isLoading ? (
                        <div className="py-20 text-center space-y-4 bg-white rounded-xl border border-[#D9E6E1]">
                            <div className="relative w-14 h-14 mx-auto">
                                <div className="absolute inset-0 rounded-full border-2 border-[#E8F3F5] border-t-[#176B52] animate-spin" />
                                <Cpu className="w-7 h-7 text-[#176B52] absolute inset-0 m-auto animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-mono font-bold text-[#0F3D32]">ANALYZING MISSION PARAMETERS</h3>
                                <p className="text-xs text-[#66756F] font-mono mt-1">
                                    NORTHSTAR Intelligence evaluating personnel, assets, route, cargo, and polar telemetry...
                                </p>
                            </div>
                        </div>
                    ) : report ? (
                        <>
                            {/* Executive Summary & Overall Score Card */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-[#D9E6E1] shadow-xs">
                                <div className="md:col-span-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-mono font-bold text-[#5D8B7A] uppercase tracking-wider">
                                            EXECUTIVE OPERATIONAL SUMMARY
                                        </h3>
                                        {getStatusBadge(report.overallReadiness.status)}
                                    </div>
                                    <p className="text-sm text-[#17231F] leading-relaxed font-sans font-normal">
                                        {report.executiveSummary}
                                    </p>
                                    <p className="text-xs text-[#66756F] font-mono border-t border-[#D9E6E1] pt-2.5 mt-2">
                                        <span className="text-[#176B52] font-bold">Assessment Note:</span> {report.overallReadiness.explanation}
                                    </p>
                                </div>

                                {/* Circular Readiness Visual Anchor */}
                                <div className="flex flex-col items-center justify-center p-4 bg-[#F0F6F3] rounded-lg border border-[#D9E6E1] text-center">
                                    <div className="relative w-28 h-28 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            {/* Track */}
                                            <path
                                                className="text-[#E8F3F5]"
                                                strokeWidth="3.5"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            {/* Progress */}
                                            <path
                                                className={getScoreStroke(report.overallReadiness.score).split(' ')[0]}
                                                strokeDasharray={`${report.overallReadiness.score}, 100`}
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-mono font-bold text-[#0F3D32]">
                                                {report.overallReadiness.score}
                                            </span>
                                            <span className="text-[10px] font-mono text-[#66756F]">/ 100</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-[#0F3D32] mt-2 uppercase tracking-wide">
                                        MISSION READINESS
                                    </span>
                                </div>
                            </div>

                            {/* Readiness Breakdown Gauges */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-mono font-bold text-[#5D8B7A] uppercase tracking-wider">
                                    READINESS DIMENSIONS BREAKDOWN
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                                    {[
                                        { label: 'Personnel', score: report.readinessBreakdown.personnel, icon: Users },
                                        { label: 'Assets', score: report.readinessBreakdown.assets, icon: Truck },
                                        { label: 'Inventory', score: report.readinessBreakdown.inventory, icon: Package },
                                        { label: 'Logistics', score: report.readinessBreakdown.logistics, icon: FileText },
                                        { label: 'Route', score: report.readinessBreakdown.route, icon: Navigation },
                                        { label: 'Weather', score: report.readinessBreakdown.weather, icon: CloudSnow },
                                        { label: 'Comms', score: report.readinessBreakdown.communications, icon: Radio },
                                    ].map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={idx} className="p-3 bg-white rounded-lg border border-[#D9E6E1] text-center space-y-1.5 shadow-2xs">
                                                <div className="flex justify-center text-[#5D8B7A]">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className={`text-base font-mono font-bold ${getScoreStroke(item.score).split(' ')[1]}`}>
                                                    {item.score}%
                                                </div>
                                                <div className="text-[11px] font-mono text-[#66756F] truncate">{item.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Resource Status Table */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-mono font-bold text-[#5D8B7A] uppercase tracking-wider">
                                    RESOURCE & INVENTORY AVAILABILITY
                                </h3>
                                <div className="overflow-x-auto rounded-lg border border-[#D9E6E1] bg-white shadow-2xs">
                                    <table className="w-full text-left text-xs font-mono">
                                        <thead className="bg-[#F0F6F3] border-b border-[#D9E6E1] text-[#0F3D32]">
                                            <tr>
                                                <th className="p-3 font-bold">Resource Item</th>
                                                <th className="p-3 font-bold">Required</th>
                                                <th className="p-3 font-bold">Available</th>
                                                <th className="p-3 font-bold">Projected Remaining</th>
                                                <th className="p-3 font-bold">Status</th>
                                                <th className="p-3 font-bold">Assessment</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#D9E6E1]/60 text-[#17231F]">
                                            {report.resourceAnalysis.map((res, i) => (
                                                <tr key={i} className="hover:bg-[#F0F6F3]/50">
                                                    <td className="p-3 font-bold text-[#0F3D32]">{res.resource}</td>
                                                    <td className="p-3 text-[#17231F]">{res.required}</td>
                                                    <td className="p-3 text-[#17231F]">{res.available}</td>
                                                    <td className="p-3 text-[#17231F]">{res.remaining}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${res.status === 'HEALTHY' ? 'bg-[#238B63]/10 text-[#238B63] border border-[#238B63]/30' :
                                                            res.status === 'WARNING' ? 'bg-[#B98224]/10 text-[#B98224] border border-[#B98224]/30' :
                                                                'bg-[#B94A48]/10 text-[#B94A48] border border-[#B94A48]/30'
                                                            }`}>
                                                            {res.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-[#66756F] max-w-xs truncate">{res.assessment}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Logistics & Route Assessment Split */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-white rounded-xl border border-[#D9E6E1] space-y-3 shadow-2xs">
                                    <div className="flex items-center justify-between border-b border-[#D9E6E1] pb-2">
                                        <h4 className="text-xs font-mono font-bold text-[#0F3D32] flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-[#176B52]" /> LOGISTICS ASSESSMENT
                                        </h4>
                                        <span className="text-xs font-mono font-bold text-[#176B52]">{report.logisticsAssessment.score}%</span>
                                    </div>
                                    <p className="text-xs text-[#17231F] leading-relaxed font-sans">{report.logisticsAssessment.assessment}</p>
                                    <div className="space-y-1 text-xs font-mono text-[#66756F]">
                                        <div><span className="text-[#5D8B7A] font-bold">Cargo Status:</span> {report.logisticsAssessment.cargoStatus}</div>
                                        <div><span className="text-[#5D8B7A] font-bold">Transport Allocation:</span> {report.logisticsAssessment.transportStatus}</div>
                                        <div><span className="text-[#5D8B7A] font-bold">Dependencies:</span> {report.logisticsAssessment.dependencies}</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-xl border border-[#D9E6E1] space-y-3 shadow-2xs">
                                    <div className="flex items-center justify-between border-b border-[#D9E6E1] pb-2">
                                        <h4 className="text-xs font-mono font-bold text-[#0F3D32] flex items-center gap-2">
                                            <Navigation className="w-4 h-4 text-[#176B52]" /> ROUTE & ENVIRONMENT
                                        </h4>
                                        <span className={`text-xs font-mono font-bold ${report.routeAssessment.status === 'HEALTHY' ? 'text-[#238B63]' : 'text-[#B98224]'}`}>
                                            {report.routeAssessment.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#17231F] leading-relaxed font-sans">{report.routeAssessment.reason}</p>
                                    <div className="text-xs font-mono text-[#66756F]">
                                        <span className="text-[#5D8B7A] font-bold">Route Profile:</span> {report.routeAssessment.details}
                                    </div>
                                </div>
                            </div>

                            {/* Personnel & Asset Assessments */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-white rounded-xl border border-[#D9E6E1] space-y-2 shadow-2xs">
                                    <h4 className="text-xs font-mono font-bold text-[#0F3D32] flex items-center gap-2 border-b border-[#D9E6E1] pb-2">
                                        <Users className="w-4 h-4 text-[#176B52]" /> PERSONNEL EVALUATION
                                    </h4>
                                    <p className="text-xs text-[#17231F] font-sans">{report.personnelAssessment.assessment}</p>
                                    <p className="text-xs text-[#66756F] font-mono"><span className="text-[#5D8B7A] font-bold">Identified Risks:</span> {report.personnelAssessment.risks}</p>
                                </div>

                                <div className="p-4 bg-white rounded-xl border border-[#D9E6E1] space-y-2 shadow-2xs">
                                    <h4 className="text-xs font-mono font-bold text-[#0F3D32] flex items-center gap-2 border-b border-[#D9E6E1] pb-2">
                                        <Truck className="w-4 h-4 text-[#176B52]" /> ASSET EVALUATION
                                    </h4>
                                    <p className="text-xs text-[#17231F] font-sans">{report.assetAssessment.assessment}</p>
                                    <p className="text-xs text-[#66756F] font-mono"><span className="text-[#5D8B7A] font-bold">Maintenance:</span> {report.assetAssessment.maintenanceConcerns}</p>
                                </div>
                            </div>

                            {/* Risks Matrix & List */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-mono font-bold text-[#5D8B7A] uppercase tracking-wider">
                                    RISK ASSESSMENT MATRIX
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {report.risks.map((risk, i) => (
                                        <div key={i} className="p-4 bg-white rounded-xl border border-[#D9E6E1] space-y-2 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono font-bold text-[#0F3D32]">{risk.risk}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${risk.severity === 'HIGH' || risk.severity === 'CRITICAL'
                                                    ? 'bg-[#B94A48]/10 text-[#B94A48] border border-[#B94A48]/30'
                                                    : 'bg-[#B98224]/10 text-[#B98224] border border-[#B98224]/30'
                                                    }`}>
                                                    {risk.severity} SEVERITY
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#66756F] font-sans">{risk.impact}</p>
                                            <div className="text-xs font-mono text-[#176B52] pt-1 border-t border-[#D9E6E1]/60">
                                                <span className="text-[#5D8B7A] font-bold">Mitigation:</span> {risk.mitigation}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Critical Findings & Actionable Recommendations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-white rounded-xl border border-[#D9E6E1] space-y-3 shadow-2xs">
                                    <h4 className="text-xs font-mono font-bold text-[#0F3D32] flex items-center gap-2 border-b border-[#D9E6E1] pb-2 uppercase">
                                        <ShieldAlert className="w-4 h-4 text-[#B98224]" /> CRITICAL FINDINGS
                                    </h4>
                                    <ul className="space-y-2">
                                        {report.criticalFindings.map((cf, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs font-mono">
                                                {cf.type === 'critical' ? (
                                                    <XCircle className="w-4 h-4 text-[#B94A48] shrink-0 mt-0.5" />
                                                ) : cf.type === 'warning' ? (
                                                    <AlertTriangle className="w-4 h-4 text-[#B98224] shrink-0 mt-0.5" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4 text-[#238B63] shrink-0 mt-0.5" />
                                                )}
                                                <span className="text-[#17231F]">{cf.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4 bg-white rounded-xl border border-[#D9E6E1] space-y-3 shadow-2xs">
                                    <h4 className="text-xs font-mono font-bold text-[#0F3D32] flex items-center gap-2 border-b border-[#D9E6E1] pb-2 uppercase">
                                        <ArrowRight className="w-4 h-4 text-[#176B52]" /> ACTIONABLE RECOMMENDATIONS
                                    </h4>
                                    <ul className="space-y-2">
                                        {report.recommendations.map((rec, i) => (
                                            <li key={i} className="p-2.5 bg-[#F0F6F3] rounded border border-[#D9E6E1] border-l-4 border-l-[#176B52] text-xs font-mono space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-[#0F3D32]">
                                                        {String(i + 1).padStart(2, '0')}. {rec.action}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-[#176B52]">{rec.priority} PRIORITY</span>
                                                </div>
                                                <p className="text-[#66756F] text-[11px] font-sans pl-4">{rec.reason}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Final Assessment Disclaimer */}
                            <div className="p-4 bg-[#E8F3F5] border border-[#D9E6E1] rounded-xl text-center space-y-1.5 shadow-2xs">
                                <h4 className="text-xs font-mono font-bold text-[#0F3D32] tracking-wider uppercase">
                                    NORTHSTAR INTELLIGENCE · EXPEDITION COMMAND DECISION SUPPORT
                                </h4>
                                <p className="text-xs text-[#17231F] font-sans max-w-3xl mx-auto">{report.finalAssessment.explanation}</p>
                                <p className="text-[10px] font-mono text-[#66756F]">
                                    CONFIDENTIAL // NCPOR POLAR OPERATIONS COMMAND // IST DATETIME: {report.generatedAt}
                                </p>
                            </div>
                        </>
                    ) : null}

                </div>

                {/* Footer Action Bar */}
                <div className="px-6 py-4 bg-[#F7FAF8] border-t border-[#D9E6E1] flex items-center justify-between print:hidden">
                    <span className="text-xs font-mono text-[#66756F]">
                        Saved to System Reports (NORTHSTAR Intelligence)
                    </span>

                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-[#0F3D32] hover:bg-[#176B52] text-white font-mono font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
                    >
                        CLOSE & VIEW IN REPORTS
                    </button>
                </div>
            </div>
        </div>
    );
};
