export interface MissionReadinessBreakdown {
    personnel: number;
    assets: number;
    inventory: number;
    logistics: number;
    route: number;
    weather: number;
    communications: number;
}

export interface ResourceAnalysisItem {
    resource: string;
    required: string;
    available: string;
    remaining: string;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'DEPLETED' | 'READY';
    assessment: string;
}

export interface RiskItem {
    risk: string;
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    probability: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: string;
    mitigation: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CriticalFinding {
    type: 'warning' | 'success' | 'critical' | 'info';
    text: string;
}

export interface ActionableRecommendation {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    action: string;
    reason: string;
}

export interface MissionIntelligenceReport {
    id: string;
    missionId: string;
    missionName: string;
    generatedAt: string; // Dynamic IST formatted date
    isDemo: boolean;

    executiveSummary: string;

    overallReadiness: {
        score: number; // 0 - 100
        status: 'READY' | 'READY WITH CAUTIONS' | 'REVIEW REQUIRED' | 'HIGH RISK' | 'NOT READY';
        explanation: string;
    };

    readinessBreakdown: MissionReadinessBreakdown;

    resourceAnalysis: ResourceAnalysisItem[];

    logisticsAssessment: {
        score: number;
        cargoStatus: string;
        transportStatus: string;
        dependencies: string;
        assessment: string;
    };

    routeAssessment: {
        status: 'HEALTHY' | 'CAUTION' | 'HIGH RISK' | 'CRITICAL';
        reason: string;
        details: string;
    };

    personnelAssessment: {
        score: number;
        assessment: string;
        risks: string;
        recommendations: string;
    };

    assetAssessment: {
        availableCount: number;
        totalCount: number;
        maintenanceConcerns: string;
        dependencies: string;
        assessment: string;
    };

    risks: RiskItem[];

    criticalFindings: CriticalFinding[];

    recommendations: ActionableRecommendation[];

    finalAssessment: {
        status: 'READY' | 'READY WITH CAUTIONS' | 'REVIEW REQUIRED' | 'HIGH RISK' | 'NOT READY';
        explanation: string;
    };
}
