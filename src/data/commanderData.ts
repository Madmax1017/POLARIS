/**
 * POLARIS — Commander-Level Data
 * Extended operational data for the NCPOR Command dashboard.
 * Designed to be replaced by a PostgreSQL backend.
 */

import {
    MOCK_STATIONS,
    MOCK_EXPEDITIONS,
    MOCK_PERSONNEL,
    MOCK_ALERTS,
    MOCK_CARGO,
    MOCK_INVENTORY,
} from './mockData';

// ─── Computed Global Metrics ─────────────────────────────────────────────────

export const COMMANDER_METRICS = {
    activeExpeditions: MOCK_EXPEDITIONS.filter(
        (e) => e.status === 'ON_SCHEDULE' || e.status === 'WEATHER_DELAY'
    ).length + 4, // prototype: include 4 additional expeditions not yet tracked

    personnelDeployed: MOCK_STATIONS.reduce((acc, s) => acc + s.headcount, 0) + 30,
    // +30 accounts for field personnel outside stations recorded in mock

    activeAssets: 38,

    cargoInTransit: MOCK_CARGO.filter(
        (c) => c.status === 'IN_TRANSIT' || c.status === 'LOADED_PORT' || c.status === 'CUSTOMS_CLEARANCE'
    ).length,

    weatherRisks: 3,

    criticalAlerts: MOCK_ALERTS.filter((a) => a.severity === 'CRITICAL').length,

    fieldReadinessPct: 92,
    checkInIssues: MOCK_PERSONNEL.filter(
        (p) => p.checkInStatus === 'MISSED_DEADMAN_TRIGGER' || p.checkInStatus === 'DUE_SOON'
    ).length,
};

// ─── Extended Expedition Overview ────────────────────────────────────────────

export interface ExtendedExpedition {
    id: string;
    code: string;
    name: string;
    location: string;
    teamCount: number;
    status: 'ACTIVE' | 'TRANSIT' | 'WEATHER_HOLD' | 'STANDBY';
    progressPct: number;
    nextMilestone: string;
    leadScientist: string;
}

export const COMMANDER_EXPEDITIONS: ExtendedExpedition[] = [
    {
        id: 'exp-07',
        code: 'EXP-07',
        name: 'Schirmacher Glacier Core Sampling',
        location: 'Arctic Zone 04',
        teamCount: 18,
        status: 'ACTIVE',
        progressPct: 78,
        nextMilestone: 'Waypoint Delta',
        leadScientist: 'Dr. Rajesh Verma',
    },
    {
        id: 'exp-05',
        code: 'EXP-05',
        name: 'Prydz Bay Marine Survey',
        location: 'Maitri → Bharati',
        teamCount: 12,
        status: 'TRANSIT',
        progressPct: 64,
        nextMilestone: 'Arrival at Bharati',
        leadScientist: 'Dr. Ananya Sharma',
    },
    {
        id: 'exp-04',
        code: 'EXP-04',
        name: 'Expedition Zone 04 Survey',
        location: 'Ross Ice Shelf, Zone 04',
        teamCount: 21,
        status: 'WEATHER_HOLD',
        progressPct: 51,
        nextMilestone: 'Weather Window',
        leadScientist: 'Dr. K. Krishnamurthy',
    },
    {
        id: 'exp-03',
        code: 'EXP-03',
        name: 'Coastal Sector Mapping',
        location: 'Queen Maud Land Coastal',
        teamCount: 21,
        status: 'ACTIVE',
        progressPct: 91,
        nextMilestone: 'Base Camp Return',
        leadScientist: 'Cmdr. Deepak Shenoy',
    },
    {
        id: 'exp-arc-02',
        code: 'ARC-02',
        name: 'Svalbard Carbon Flux Array',
        location: 'Svalbard, Arctic',
        teamCount: 4,
        status: 'ACTIVE',
        progressPct: 34,
        nextMilestone: 'Bayelva Sensor Deploy',
        leadScientist: 'Dr. Preeti Nair',
    },
];

// ─── Resource Forecast ────────────────────────────────────────────────────────

export interface ResourceForecast {
    id: string;
    name: string;
    category: string;
    station: string;
    levelPct: number;
    projectedHours: number;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    unit: string;
}

export const RESOURCE_FORECASTS: ResourceForecast[] = [
    {
        id: 'rf-01',
        name: 'Polar Diesel A-1',
        category: 'Fuel',
        station: 'Maitri Station',
        levelPct: 68,
        projectedHours: 696, // 29 days
        status: 'NORMAL',
        unit: 'Liters',
    },
    {
        id: 'rf-02',
        name: 'MRE Rations',
        category: 'Food',
        station: 'Maitri Station',
        levelPct: 31,
        projectedHours: 600, // 25 days
        status: 'WARNING',
        unit: 'Packs',
    },
    {
        id: 'rf-03',
        name: 'Hypothermia & Trauma Kits',
        category: 'Medical',
        station: 'Bharati Station',
        levelPct: 18,
        projectedHours: 2160, // 90 days
        status: 'NORMAL',
        unit: 'Kits',
    },
    {
        id: 'rf-04',
        name: 'Aviation Turbine Fuel (Jet A-1)',
        category: 'Aviation Fuel',
        station: 'Bharati Station',
        levelPct: 82,
        projectedHours: 2184, // 91 days
        status: 'NORMAL',
        unit: 'Liters',
    },
];

// ─── Weather & Risk ───────────────────────────────────────────────────────────

export interface WeatherNode {
    id: string;
    location: string;
    temperature: string;
    windSpeed: string;
    windDirection: string;
    visibility: string;
    stormProbabilityPct: number;
    risk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}

export const WEATHER_NODES: WeatherNode[] = [
    {
        id: 'wx-maitri',
        location: 'Maitri Station',
        temperature: '-18°C',
        windSpeed: '32 km/h',
        windDirection: 'SW',
        visibility: '12 km',
        stormProbabilityPct: 14,
        risk: 'LOW',
    },
    {
        id: 'wx-bharati',
        location: 'Bharati Station',
        temperature: '-24°C',
        windSpeed: '47 km/h',
        windDirection: 'S',
        visibility: '6 km',
        stormProbabilityPct: 38,
        risk: 'MODERATE',
    },
    {
        id: 'wx-zone04',
        location: 'Expedition Zone 04',
        temperature: '-21°C',
        windSpeed: '61 km/h',
        windDirection: 'SW',
        visibility: '3 km',
        stormProbabilityPct: 72,
        risk: 'HIGH',
    },
    {
        id: 'wx-himadri',
        location: 'Himadri Station',
        temperature: '-4°C',
        windSpeed: '18 km/h',
        windDirection: 'NW',
        visibility: '20 km',
        stormProbabilityPct: 8,
        risk: 'LOW',
    },
];

// ─── Command Priorities ───────────────────────────────────────────────────────

export interface CommandPriority {
    id: string;
    rank: number;
    severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
    title: string;
    subtitle: string;
    context: string;
    actionLabel: string;
    route: string;
}

export const COMMAND_PRIORITIES: CommandPriority[] = [
    {
        id: 'cp-01',
        rank: 1,
        severity: 'CRITICAL',
        title: 'DEADMAN TIMEOUT',
        subtitle: 'Suresh Kumar — Station Engineer',
        context: 'Maitri Station · Check-in expired -12 mins ago',
        actionLabel: 'INSPECT',
        route: '/alerts',
    },
    {
        id: 'cp-02',
        rank: 2,
        severity: 'HIGH',
        title: 'POWER GRID INSTABILITY',
        subtitle: 'Automated System Warning',
        context: 'Bharati Turbine Bank 2 · Bypass engaged',
        actionLabel: 'VIEW',
        route: '/alerts',
    },
    {
        id: 'cp-03',
        rank: 3,
        severity: 'WARNING',
        title: 'WEATHER WINDOW CLOSING',
        subtitle: 'Expedition Zone 04',
        context: '72% storm probability · Recommended delay: 6 hours',
        actionLabel: 'REVIEW',
        route: '/map',
    },
    {
        id: 'cp-04',
        rank: 4,
        severity: 'WARNING',
        title: 'MRE RATION THRESHOLD',
        subtitle: 'Maitri Station Cold Storage',
        context: 'Stock below minimum threshold · 25 days remaining',
        actionLabel: 'VIEW',
        route: '/inventory',
    },
];

// ─── POLARIS Intelligence Recommendations ────────────────────────────────────

export interface IntelRecommendation {
    id: string;
    category: string;
    headline: string;
    body: string;
    route: string;
    urgency: 'CRITICAL' | 'HIGH' | 'INFO';
}

export const INTEL_RECOMMENDATIONS: IntelRecommendation[] = [
    {
        id: 'ir-01',
        category: 'RESOURCE',
        headline: 'MRE Rations — Maitri Station',
        body: 'Current MRE stock at Maitri is below the minimum threshold (1,850 packs vs. 2,000 required). At the current burn rate, resupply is needed within 25 days. Consider prioritising this in the next cargo manifest.',
        route: '/inventory',
        urgency: 'HIGH',
    },
    {
        id: 'ir-02',
        category: 'WEATHER',
        headline: 'High Wind Risk — Expedition Zone 04',
        body: 'Storm probability for Zone 04 has reached 72%. Recommended deployment delay: 6 hours minimum. EXP-04 is currently on weather hold.',
        route: '/map',
        urgency: 'HIGH',
    },
    {
        id: 'ir-03',
        category: 'LOGISTICS',
        headline: 'Annual Resupply — 18 Days Remaining',
        body: 'MV Vasiliy Golovnin is tracking normally. 18 days remain until arrival window closes at Maitri & Bharati. No intervention required at this time.',
        route: '/logistics',
        urgency: 'INFO',
    },
];

// ─── Logistics Status ────────────────────────────────────────────────────────

export const LOGISTICS_STATUS = {
    inTransit: MOCK_CARGO.filter((c) => c.status === 'IN_TRANSIT').length,
    awaitingDispatch: MOCK_CARGO.filter((c) => c.status === 'LOADED_PORT').length,
    deliveredToday: MOCK_CARGO.filter((c) => c.status === 'DELIVERED').length,
    delayed: MOCK_CARGO.filter((c) => c.status === 'CUSTOMS_CLEARANCE').length,
};

export interface LogisticsRoute {
    id: string;
    from: string;
    to: string;
    via?: string;
    status: string;
    eta: string;
    trackingId: string;
}

export const ACTIVE_ROUTES: LogisticsRoute[] = [
    {
        id: 'rt-01',
        from: 'Cape Town',
        to: 'Maitri & Bharati',
        via: 'Southern Ocean',
        status: 'IN TRANSIT',
        eta: '18 days',
        trackingId: 'MV-VASILIY-GOLOVNIN-2026-A',
    },
    {
        id: 'rt-02',
        from: 'Cape Town Airport',
        to: 'ALCI Ice Runway',
        status: 'LOADED',
        eta: '4 Oct 2026',
        trackingId: 'DROMLAN-AIR-CARGO-44',
    },
];

// ─── Command Activity Timeline ────────────────────────────────────────────────

export interface ActivityEvent {
    id: string;
    time: string;
    description: string;
    type: 'expedition' | 'cargo' | 'weather' | 'personnel' | 'system';
}

export const COMMAND_ACTIVITY: ActivityEvent[] = [
    { id: 'act-01', time: '09:42', description: 'EXP-07 reached Waypoint Delta.', type: 'expedition' },
    { id: 'act-02', time: '09:18', description: 'Cargo CN-204 dispatched from Bharati.', type: 'cargo' },
    { id: 'act-03', time: '08:54', description: 'Weather warning issued for Zone 04.', type: 'weather' },
    { id: 'act-04', time: '08:32', description: 'Personnel check-in completed at Maitri.', type: 'personnel' },
    { id: 'act-05', time: '08:05', description: 'Inventory synchronization completed.', type: 'system' },
    { id: 'act-06', time: '07:41', description: 'ARC-02 deployed sensor array at Bayelva.', type: 'expedition' },
];

// ─── System Status ────────────────────────────────────────────────────────────

export const SYSTEM_STATUS = {
    satLink: 'ONLINE',
    database: 'SYNCHRONIZED',
    fieldNodesTotal: 18,
    fieldNodesOnline: 18,
    offlineQueue: 0,
    lastSync: '2 min ago',
};
