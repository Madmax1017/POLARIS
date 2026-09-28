import {
    MissionPersonnel,
    MissionAsset,
    Mission,
    MissionCheckpoint,
} from '../types';

// ─── Personnel Pool ───────────────────────────────────────────────────────────
export const MISSION_PERSONNEL_POOL: MissionPersonnel[] = [
    {
        id: 'mp-01',
        name: 'Dr. Ananya Sharma',
        role: 'Lead Glaciologist',
        specialization: 'Ice Core Analysis & Glacial Dynamics',
        stationId: 'bharati',
        status: 'Available',
    },
    {
        id: 'mp-02',
        name: 'Vikramaditya Das',
        role: 'Field Logistics Officer',
        specialization: 'Convoy Operations & Field Supply',
        stationId: 'maitri',
        status: 'Available',
    },
    {
        id: 'mp-03',
        name: 'Suresh Kumar',
        role: 'Station Engineer',
        specialization: 'Power Systems & Mechanical Maintenance',
        stationId: 'maitri',
        status: 'On Mission',
    },
    {
        id: 'mp-04',
        name: 'Dr. Preeti Nair',
        role: 'Atmospheric Scientist',
        specialization: 'Aerosol Sampling & Weather Prediction',
        stationId: 'himadri',
        status: 'Available',
    },
    {
        id: 'mp-05',
        name: 'Karan Patel',
        role: 'Communications Lead',
        specialization: 'Satellite Telemetry & BGAN Setup',
        stationId: 'bharati',
        status: 'Available',
    },
    {
        id: 'mp-06',
        name: 'Arjun Mehta',
        role: 'Field Engineer',
        specialization: 'Heavy Vehicle Operation & Equipment Setup',
        stationId: 'maitri',
        status: 'Available',
    },
    {
        id: 'mp-07',
        name: 'Dr. Riya Singh',
        role: 'Marine Biologist',
        specialization: 'Coastal Ecosystem & Species Survey',
        stationId: 'bharati',
        status: 'Available',
    },
    {
        id: 'mp-08',
        name: 'Lt. Rohan Tiwari',
        role: 'Medical Officer',
        specialization: 'Emergency Medicine & Cold Weather Trauma',
        stationId: 'maitri',
        status: 'Available',
    },
];

// ─── Asset Pool ───────────────────────────────────────────────────────────────
export const MISSION_ASSET_POOL: MissionAsset[] = [
    {
        id: 'ast-01',
        assetId: 'SNOWCAT-07',
        name: 'Heavy Snowcat Unit 07',
        type: 'Snowcat',
        location: 'Bharati Station — Vehicle Bay',
        availability: 'Available',
        condition: 'Operational',
        fuelRequirement: '~450L Polar Diesel per day',
    },
    {
        id: 'ast-02',
        assetId: 'SNOWCAT-12',
        name: 'Heavy Snowcat Unit 12',
        type: 'Snowcat',
        location: 'Maitri Station — Vehicle Bay',
        availability: 'Available',
        condition: 'Serviceable',
        fuelRequirement: '~450L Polar Diesel per day',
    },
    {
        id: 'ast-03',
        assetId: 'HELI-ANT-03',
        name: 'Polar Survey Helicopter',
        type: 'Aircraft',
        location: 'Bharati Station — Helipad',
        availability: 'Available',
        condition: 'Operational',
        fuelRequirement: '~800L Jet A-1 per sortie',
    },
    {
        id: 'ast-04',
        assetId: 'UTIL-VAN-06',
        name: 'Light Utility Skidoo Pack',
        type: 'Utility Vehicle',
        location: 'Maitri Station — Depot',
        availability: 'In Use',
        condition: 'Operational',
        fuelRequirement: '~80L per day',
    },
    {
        id: 'ast-05',
        assetId: 'SAT-COM-02',
        name: 'BGAN Satellite Terminal',
        type: 'Communication Equipment',
        location: 'Bharati Station — Comms Room',
        availability: 'Available',
        condition: 'Operational',
    },
    {
        id: 'ast-06',
        assetId: 'SCI-DRILL-01',
        name: 'Ice Core Drill Assembly',
        type: 'Scientific Equipment',
        location: 'Bharati Station — Science Lab',
        availability: 'Available',
        condition: 'Operational',
    },
    {
        id: 'ast-07',
        assetId: 'MED-KIT-FIELD-01',
        name: 'Field Medical Kit (Level III)',
        type: 'Medical Equipment',
        location: 'Maitri Station — Medical Bay',
        availability: 'Available',
        condition: 'Operational',
    },
];

// ─── Route Checkpoint Presets ─────────────────────────────────────────────────
export const ROUTE_CHECKPOINTS: Record<string, MissionCheckpoint> = {
    maitri: {
        id: 'cp-maitri',
        name: 'Maitri Station',
        type: 'origin',
        lat: -70.7667,
        lng: 11.7333,
        order: 0,
    },
    bharati: {
        id: 'cp-bharati',
        name: 'Bharati Station',
        type: 'origin',
        lat: -69.4075,
        lng: 76.1958,
        order: 0,
    },
    himadri: {
        id: 'cp-himadri',
        name: 'Himadri Station',
        type: 'origin',
        lat: 78.9233,
        lng: 11.9333,
        order: 0,
    },
    checkpoint_a: {
        id: 'cp-a',
        name: 'Checkpoint Alpha',
        type: 'waypoint',
        lat: -71.15,
        lng: 12.8,
        order: 1,
    },
    checkpoint_b: {
        id: 'cp-b',
        name: 'Checkpoint Bravo',
        type: 'waypoint',
        lat: -71.55,
        lng: 13.9,
        order: 2,
    },
    field_camp_03: {
        id: 'cp-fc03',
        name: 'Field Camp 03',
        type: 'field_camp',
        lat: -72.1,
        lng: 15.0,
        order: 3,
    },
    survey_zone_alpha: {
        id: 'cp-sza',
        name: 'Survey Zone Alpha',
        type: 'research_area',
        lat: -72.8,
        lng: 16.5,
        order: 4,
    },
    gruber_mountains: {
        id: 'cp-gm',
        name: 'Gruber Mountains',
        type: 'waypoint',
        lat: -72.4,
        lng: 14.2,
        order: 3,
    },
    prydz_bay: {
        id: 'cp-pb',
        name: 'Prydz Bay Outpost',
        type: 'research_area',
        lat: -69.0,
        lng: 77.5,
        order: 2,
    },
};

// ─── Seed Missions ────────────────────────────────────────────────────────────
export const SEED_MISSIONS: Mission[] = [
    {
        id: `NORTHSTAR-MSN-${new Date().getFullYear()}-001`,
        name: 'Operation Glacier Survey',
        type: 'Scientific Research',
        priority: 'High',
        status: 'ACTIVE',
        commanderName: 'Dr. Ananya Sharma',
        commanderPersonnelId: 'mp-01',
        operationalBase: 'Bharati Station',
        description:
            'Conduct a comprehensive geological and glaciological survey across the designated Antarctic field zone. Collect ice-core samples from three target depths for laboratory analysis.',
        objectives: [
            { id: 'obj-1', type: 'primary', text: 'Conduct geological survey across designated field zone and collect ice-core samples.' },
            { id: 'obj-2', type: 'secondary', text: 'Collect ice samples from three target depth profiles.' },
            { id: 'obj-3', type: 'secondary', text: 'Record atmospheric measurements at field camp.' },
            { id: 'obj-4', type: 'secondary', text: 'Deploy monitoring equipment at Survey Zone Alpha.' },
            { id: 'obj-5', type: 'secondary', text: 'Return all samples and equipment safely to station.' },
        ],
        successCriteria: 'Complete survey of designated area. Return all personnel and equipment safely. Deliver minimum 4 ice-core samples in viable condition.',
        checkpoints: [
            { id: 'cp-bharati', name: 'Bharati Station', type: 'origin', lat: -69.4075, lng: 76.1958, order: 0 },
            { id: 'cp-a', name: 'Checkpoint Alpha', type: 'waypoint', lat: -71.15, lng: 12.8, order: 1 },
            { id: 'cp-fc03', name: 'Field Camp 03', type: 'field_camp', lat: -72.1, lng: 15.0, order: 2 },
            { id: 'cp-sza', name: 'Survey Zone Alpha', type: 'research_area', lat: -72.8, lng: 16.5, order: 3 },
        ],
        routeSummary: 'Bharati → Checkpoint Alpha → Field Camp 03 → Survey Zone Alpha',
        estimatedDistanceKm: 320,
        estimatedTravelHours: 16,
        personnel: [
            { id: 'mp-01', name: 'Dr. Ananya Sharma', role: 'Lead Glaciologist', specialization: 'Ice Core Analysis', stationId: 'bharati', status: 'Available', isLead: true },
            { id: 'mp-05', name: 'Karan Patel', role: 'Communications Lead', specialization: 'Satellite Telemetry', stationId: 'bharati', status: 'Available' },
            { id: 'mp-06', name: 'Arjun Mehta', role: 'Field Engineer', specialization: 'Heavy Vehicle Operation', stationId: 'maitri', status: 'Available' },
            { id: 'mp-08', name: 'Lt. Rohan Tiwari', role: 'Medical Officer', specialization: 'Emergency Medicine', stationId: 'maitri', status: 'Available' },
        ],
        assets: [
            { id: 'ast-01', assetId: 'SNOWCAT-07', name: 'Heavy Snowcat Unit 07', type: 'Snowcat', location: 'Bharati Station', availability: 'Available', condition: 'Operational', fuelRequirement: '~450L/day' },
            { id: 'ast-05', assetId: 'SAT-COM-02', name: 'BGAN Satellite Terminal', type: 'Communication Equipment', location: 'Bharati Station', availability: 'Available', condition: 'Operational' },
            { id: 'ast-06', assetId: 'SCI-DRILL-01', name: 'Ice Core Drill Assembly', type: 'Scientific Equipment', location: 'Bharati Station', availability: 'Available', condition: 'Operational' },
        ],
        cargo: [
            { id: 'cg-1', item: 'Jet A-1 Fuel', quantity: 2000, unit: 'L', priority: 'HIGH', requiredAt: 'Field Camp 03', deadline: `${new Date().getFullYear()}-10-18 05:00`, category: 'Fuel' },
            { id: 'cg-2', item: 'Emergency Medical Kit', quantity: 4, unit: 'units', priority: 'CRITICAL', requiredAt: 'Field Camp 03', deadline: `${new Date().getFullYear()}-10-18 06:00`, category: 'Medical Supplies' },
            { id: 'cg-3', item: 'Research Equipment Crates', quantity: 12, unit: 'units', priority: 'NORMAL', requiredAt: 'Survey Zone Alpha', deadline: `${new Date().getFullYear()}-10-18 10:00`, category: 'Scientific Equipment' },
        ],
        phases: [
            { id: 'ph-1', name: 'Briefing & Departure Prep', startTime: `${new Date().getFullYear()}-10-18 04:00`, endTime: `${new Date().getFullYear()}-10-18 06:00`, description: 'Final briefing, equipment check, personnel assembly.' },
            { id: 'ph-2', name: 'Transit to Field Camp', startTime: `${new Date().getFullYear()}-10-18 06:00`, endTime: `${new Date().getFullYear()}-10-18 10:00`, description: 'Snowcat convoy from Bharati to Field Camp 03.' },
            { id: 'ph-3', name: 'Field Survey Operations', startTime: `${new Date().getFullYear()}-10-18 10:00`, endTime: `${new Date().getFullYear()}-10-18 18:00`, description: 'Ice core sampling and geological survey at Survey Zone Alpha.' },
            { id: 'ph-4', name: 'Return Transit', startTime: `${new Date().getFullYear()}-10-18 18:00`, endTime: `${new Date().getFullYear()}-10-18 22:00`, description: 'Return convoy to Bharati Station.' },
        ],
        departureTime: `${new Date().getFullYear()}-10-18 06:00`,
        returnTime: `${new Date().getFullYear()}-10-18 22:00`,
        durationHours: 16,
        risks: [
            { id: 'rsk-1', category: 'Weather', description: 'Blizzard conditions possible during return window', severity: 'HIGH', probability: 'MEDIUM', mitigation: 'Monitor ECMWF forecast every 4h. Maintain 24h shelter reserve at Field Camp 03.' },
            { id: 'rsk-2', category: 'Connectivity', description: 'Satellite link degradation in storm conditions', severity: 'MEDIUM', probability: 'HIGH', mitigation: 'Offline-first operation enabled. Critical updates queued for next sync window.' },
        ],
        environmentalConditions: {
            temperature: '-28°C (forecast)',
            wind: '35-45 kt SW',
            visibility: '2-5 km',
            seaIce: 'Fast Ice — Stable',
            weather: 'Partly Cloudy / Storm Risk',
            terrain: 'Glacial — High Crevasse Risk',
            connectivity: 'SAT-LINK (Intermittent)',
        },
        readiness: {
            personnel: 'READY',
            assets: 'READY',
            cargo: 'PARTIAL',
            route: 'READY',
            weather: 'REVIEW',
            communications: 'READY',
        },
        overallReadiness: 'REVIEW REQUIRED',
        createdAt: `${new Date().getFullYear()}-09-15T08:00:00Z`,
        updatedAt: `${new Date().getFullYear()}-09-20T10:00:00Z`,
    },
    {
        id: `NORTHSTAR-MSN-${new Date().getFullYear()}-002`,
        name: 'Operation Prydz Bay Survey',
        type: 'Scientific Research',
        priority: 'Routine',
        status: 'PLANNED',
        commanderName: 'Dr. Riya Singh',
        commanderPersonnelId: 'mp-07',
        operationalBase: 'Bharati Station',
        description:
            'Marine ecosystem survey along the Prydz Bay coastal zone. Conduct water column sampling and coastal habitat assessments.',
        objectives: [
            { id: 'obj-1', type: 'primary', text: 'Marine ecosystem survey along Prydz Bay coastal zone.' },
            { id: 'obj-2', type: 'secondary', text: 'Collect water column samples at 5 designated stations.' },
            { id: 'obj-3', type: 'secondary', text: 'Conduct coastal habitat assessment with photographic documentation.' },
        ],
        successCriteria: 'Complete sampling at all 5 designated stations. Return all biological specimens in viable condition.',
        checkpoints: [
            { id: 'cp-bharati', name: 'Bharati Station', type: 'origin', lat: -69.4075, lng: 76.1958, order: 0 },
            { id: 'cp-pb', name: 'Prydz Bay Outpost', type: 'research_area', lat: -69.0, lng: 77.5, order: 1 },
        ],
        routeSummary: 'Bharati → Prydz Bay Outpost',
        estimatedDistanceKm: 85,
        estimatedTravelHours: 6,
        personnel: [
            { id: 'mp-07', name: 'Dr. Riya Singh', role: 'Marine Biologist', specialization: 'Coastal Ecosystem', stationId: 'bharati', status: 'Available', isLead: true },
            { id: 'mp-02', name: 'Vikramaditya Das', role: 'Field Logistics Officer', specialization: 'Convoy Operations', stationId: 'maitri', status: 'Available' },
        ],
        assets: [
            { id: 'ast-02', assetId: 'SNOWCAT-12', name: 'Heavy Snowcat Unit 12', type: 'Snowcat', location: 'Maitri Station', availability: 'Available', condition: 'Serviceable', fuelRequirement: '~450L/day' },
        ],
        cargo: [
            { id: 'cg-1', item: 'Sampling Equipment', quantity: 8, unit: 'crates', priority: 'HIGH', requiredAt: 'Prydz Bay Outpost', deadline: `${new Date().getFullYear()}-11-05 09:00`, category: 'Scientific Equipment' },
            { id: 'cg-2', item: 'Field Rations', quantity: 20, unit: 'packs', priority: 'NORMAL', requiredAt: 'Prydz Bay Outpost', deadline: `${new Date().getFullYear()}-11-05 06:00`, category: 'Food / Rations' },
        ],
        phases: [
            { id: 'ph-1', name: 'Departure', startTime: `${new Date().getFullYear()}-11-05 06:00`, endTime: `${new Date().getFullYear()}-11-05 09:00`, description: 'Transit to Prydz Bay.' },
            { id: 'ph-2', name: 'Field Operations', startTime: `${new Date().getFullYear()}-11-05 09:00`, endTime: `${new Date().getFullYear()}-11-05 16:00`, description: 'Coastal survey and sample collection.' },
            { id: 'ph-3', name: 'Return', startTime: `${new Date().getFullYear()}-11-05 16:00`, endTime: `${new Date().getFullYear()}-11-05 19:00`, description: 'Return to Bharati Station.' },
        ],
        departureTime: `${new Date().getFullYear()}-11-05 06:00`,
        returnTime: `${new Date().getFullYear()}-11-05 19:00`,
        durationHours: 13,
        risks: [
            { id: 'rsk-1', category: 'Sea Ice', description: 'Coastal ice conditions may restrict access', severity: 'MEDIUM', probability: 'MEDIUM', mitigation: 'Verify coastal ice report 24h before departure.' },
        ],
        environmentalConditions: {
            temperature: '-18°C (forecast)',
            wind: '20-25 kt W',
            visibility: '8-15 km',
            seaIce: 'Coastal — Variable',
            weather: 'Clear to Partly Cloudy',
            terrain: 'Coastal Transition Zone',
            connectivity: 'SAT-LINK (Stable)',
        },
        readiness: {
            personnel: 'READY',
            assets: 'READY',
            cargo: 'READY',
            route: 'READY',
            weather: 'READY',
            communications: 'READY',
        },
        overallReadiness: 'READY',
        createdAt: `${new Date().getFullYear()}-09-20T10:00:00Z`,
        updatedAt: `${new Date().getFullYear()}-09-22T09:00:00Z`,
    },
    {
        id: `NORTHSTAR-MSN-${new Date().getFullYear()}-003`,
        name: 'Maitri Emergency Resupply',
        type: 'Resupply',
        priority: 'Critical',
        status: 'COMPLETED',
        commanderName: 'Vikramaditya Das',
        commanderPersonnelId: 'mp-02',
        operationalBase: 'Maitri Station',
        description:
            'Emergency fuel and MRE resupply to Maitri Station following accelerated consumption due to extended cold weather operations.',
        objectives: [
            { id: 'obj-1', type: 'primary', text: 'Deliver emergency fuel reserves to Maitri Station.' },
            { id: 'obj-2', type: 'secondary', text: 'Deliver supplementary MRE ration packs.' },
        ],
        successCriteria: 'Delivery of minimum 15,000L fuel and 800 MRE packs to Maitri Station within mission window.',
        checkpoints: [
            { id: 'cp-bharati', name: 'Bharati Station', type: 'origin', lat: -69.4075, lng: 76.1958, order: 0 },
            { id: 'cp-maitri', name: 'Maitri Station', type: 'destination', lat: -70.7667, lng: 11.7333, order: 1 },
        ],
        routeSummary: 'Bharati → Maitri Station',
        estimatedDistanceKm: 180,
        estimatedTravelHours: 8,
        personnel: [
            { id: 'mp-02', name: 'Vikramaditya Das', role: 'Field Logistics Officer', specialization: 'Convoy Operations', stationId: 'maitri', status: 'Available', isLead: true },
            { id: 'mp-06', name: 'Arjun Mehta', role: 'Field Engineer', specialization: 'Heavy Vehicle Operation', stationId: 'maitri', status: 'Available' },
        ],
        assets: [
            { id: 'ast-02', assetId: 'SNOWCAT-12', name: 'Heavy Snowcat Unit 12', type: 'Snowcat', location: 'Bharati Station', availability: 'Available', condition: 'Serviceable' },
        ],
        cargo: [
            { id: 'cg-1', item: 'Polar Special Diesel A-1', quantity: 16000, unit: 'L', priority: 'CRITICAL', requiredAt: 'Maitri Station', deadline: `${new Date().getFullYear()}-09-10 18:00`, category: 'Fuel' },
            { id: 'cg-2', item: 'Freeze-Dried MRE Rations', quantity: 850, unit: 'packs', priority: 'HIGH', requiredAt: 'Maitri Station', deadline: `${new Date().getFullYear()}-09-10 18:00`, category: 'Food / Rations' },
        ],
        phases: [
            { id: 'ph-1', name: 'Loading', startTime: `${new Date().getFullYear()}-09-10 04:00`, endTime: `${new Date().getFullYear()}-09-10 06:00`, description: 'Load cargo at Bharati Station.' },
            { id: 'ph-2', name: 'Transit', startTime: `${new Date().getFullYear()}-09-10 06:00`, endTime: `${new Date().getFullYear()}-09-10 14:00`, description: 'Convoy to Maitri Station.' },
            { id: 'ph-3', name: 'Offloading', startTime: `${new Date().getFullYear()}-09-10 14:00`, endTime: `${new Date().getFullYear()}-09-10 17:00`, description: 'Offload at Maitri fuel tanks.' },
        ],
        departureTime: `${new Date().getFullYear()}-09-10 06:00`,
        returnTime: `${new Date().getFullYear()}-09-10 17:00`,
        durationHours: 11,
        risks: [],
        environmentalConditions: {
            temperature: '-22°C',
            wind: '28 kt SW',
            visibility: '10+ km',
            seaIce: 'Fast Ice — Stable',
            weather: 'Clear',
            terrain: 'Glacial Terrain — Established Route',
            connectivity: 'SAT-LINK',
        },
        readiness: {
            personnel: 'READY',
            assets: 'READY',
            cargo: 'READY',
            route: 'READY',
            weather: 'READY',
            communications: 'READY',
        },
        overallReadiness: 'READY',
        createdAt: `${new Date().getFullYear()}-09-08T06:00:00Z`,
        updatedAt: `${new Date().getFullYear()}-09-10T18:00:00Z`,
    },
];

// ─── Mission ID Generator ─────────────────────────────────────────────────────
export function generateMissionId(existingIds: string[]): string {
    const year = new Date().getFullYear();
    const prefix = `NORTHSTAR-MSN-${year}-`;
    let max = 3;
    existingIds.forEach(id => {
        const match = id.match(/NORTHSTAR-MSN-\d+-(\d+)/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > max) max = num;
        }
    });
    const next = String(max + 1).padStart(3, '0');
    return `${prefix}${next}`;
}
