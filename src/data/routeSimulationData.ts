// Route Simulation Data — Mock telemetry and environmental data for cargo tracking
// Each cargo ID maps to a rich simulation dataset

export interface RouteWaypoint {
    lat: number;
    lng: number;
    label?: string;
}

export interface VesselPosition {
    lat: number;
    lng: number;
    heading: number;
    speed: number;
    speedUnit: string;
    coordinatesDisplay: string;
    lastUpdate: string;
}

export interface Checkpoint {
    id: string;
    name: string;
    status: 'completed' | 'current' | 'upcoming';
    lat: number;
    lng: number;
    eta?: string;
}

export interface NearbyStation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    personnel?: number;
    status?: string;
}

export interface NearbyAsset {
    id: string;
    name: string;
    type: 'vessel' | 'convoy' | 'aircraft' | 'station';
    lat: number;
    lng: number;
    heading?: number;
    description?: string;
}

export interface EnvironmentalConditions {
    temperature: string;
    wind: string;
    visibility: string;
    seaIce: string;
    weather: string;
    pressure?: string;
}

export interface IceCondition {
    description: string;
    distance: string;
    concentration: string;
    risk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
}

export interface WeatherZone {
    id: string;
    name: string;
    type: 'storm' | 'ice' | 'wind' | 'fog' | 'clear';
    risk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    lat: number;
    lng: number;
    radius: number;
    details?: string;
}

export interface IntelligenceMessage {
    type: 'ok' | 'warning' | 'info';
    text: string;
}

export interface MapIceberg {
    id: string;
    lat: number;
    lng: number;
    size: 'small' | 'medium' | 'large';
    distance: string;
    concentration?: string;
    risk: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface RouteCondition {
    status: 'STABLE' | 'CAUTION' | 'WARNING' | 'CRITICAL';
    message: string;
}

export interface CargoSimulation {
    cargoId: string;
    vesselType: 'icebreaker' | 'aircraft' | 'snowcat' | 'supply_ship';
    vesselIcon: string;
    routeWaypoints: RouteWaypoint[];
    currentPosition: VesselPosition;
    routeProgress: number;
    distanceRemaining: string;
    distanceTotal: string;
    eta: string;
    nextCheckpoint: string;
    checkpoints: Checkpoint[];
    nearbyStations: NearbyStation[];
    nearbyAssets: NearbyAsset[];
    environment: EnvironmentalConditions;
    iceConditions: IceCondition[];
    weatherZones: WeatherZone[];
    icebergs: MapIceberg[];
    intelligence: IntelligenceMessage[];
    routeCondition: RouteCondition;
    altitude?: string; // For aircraft
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIMULATION DATA FOR EACH CARGO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ROUTE_SIMULATIONS: Record<string, CargoSimulation> = {
    // ─── cg-901: MV Vasiliy Golovnin — Icebreaker, Cape Town → Maitri & Bharati ───
    'cg-901': {
        cargoId: 'cg-901',
        vesselType: 'icebreaker',
        vesselIcon: '🚢',
        routeWaypoints: [
            { lat: -33.92, lng: 18.42, label: 'Cape Town Port' },
            { lat: -38.5, lng: 16.0, label: 'Atlantic Transit South' },
            { lat: -45.0, lng: 12.0, label: 'Mid-Atlantic' },
            { lat: -52.0, lng: 8.0, label: 'Roaring Forties' },
            { lat: -58.0, lng: 5.0, label: 'Southern Ocean Entry' },
            { lat: -62.0, lng: 3.0, label: 'Antarctic Convergence' },
            { lat: -65.5, lng: 4.0, label: 'Pack Ice Edge' },
            { lat: -68.0, lng: 7.0, label: 'Ice Navigation Zone' },
            { lat: -69.5, lng: 10.0, label: 'Maitri Coastal Approach' },
            { lat: -70.77, lng: 11.73, label: 'Maitri Station' },
        ],
        currentPosition: {
            lat: -69.97,
            lng: 11.92,
            heading: 148,
            speed: 12.4,
            speedUnit: 'kn',
            coordinatesDisplay: "69°58' S, 11°55' E",
            lastUpdate: '02 min ago',
        },
        routeProgress: 78,
        distanceRemaining: '1,240 km',
        distanceTotal: '5,640 km',
        eta: '18:40 IST',
        nextCheckpoint: 'Maitri Coastal Approach',
        checkpoints: [
            { id: 'cp-1', name: 'Cape Town', status: 'completed', lat: -33.92, lng: 18.42, eta: 'Departed' },
            { id: 'cp-2', name: 'Atlantic Transit', status: 'completed', lat: -45.0, lng: 12.0, eta: 'Completed' },
            { id: 'cp-3', name: 'Southern Ocean', status: 'current', lat: -62.0, lng: 3.0 },
            { id: 'cp-4', name: 'Maitri Approach', status: 'upcoming', lat: -69.5, lng: 10.0, eta: '~16h' },
            { id: 'cp-5', name: 'Maitri Station', status: 'upcoming', lat: -70.77, lng: 11.73, eta: '~22h' },
        ],
        nearbyStations: [
            { id: 'maitri', name: 'Maitri Station', lat: -70.77, lng: 11.73, personnel: 24, status: 'OPTIMAL' },
            { id: 'bharati', name: 'Bharati Station', lat: -69.41, lng: 76.20, personnel: 31, status: 'WARNING' },
            { id: 'fc-03', name: 'Field Camp 03', lat: -71.2, lng: 12.5, personnel: 6, status: 'OPTIMAL' },
        ],
        nearbyAssets: [
            { id: 'na-1', name: 'SA Agulhas II', type: 'vessel', lat: -66.3, lng: 8.1, heading: 195, description: 'Polar Research Vessel' },
            { id: 'na-2', name: 'Snowcat Convoy Alpha', type: 'convoy', lat: -70.5, lng: 11.9, description: 'Supply run to Field Camp 03' },
            { id: 'na-3', name: 'IL-76 TD-90VD', type: 'aircraft', lat: -68.0, lng: 15.0, description: 'Cargo flight from Cape Town' },
        ],
        environment: {
            temperature: '-29°C',
            wind: '18 kt SSW',
            visibility: '4.2 km',
            seaIce: 'Moderate',
            weather: 'Overcast',
            pressure: '978 hPa',
        },
        iceConditions: [
            { description: 'Nearby ice field detected', distance: '34 km', concentration: '72%', risk: 'MODERATE' },
            { description: 'Tabular iceberg cluster', distance: '58 km', concentration: '40%', risk: 'LOW' },
        ],
        weatherZones: [
            { id: 'wz-1', name: 'Katabatic Wind Zone', type: 'wind', risk: 'MODERATE', lat: -70.0, lng: 9.0, radius: 80, details: 'Gusts up to 45 kt expected' },
            { id: 'wz-2', name: 'Sea Ice Consolidation', type: 'ice', risk: 'HIGH', lat: -68.5, lng: 6.0, radius: 120, details: 'Heavy first-year ice, 1.2m thickness' },
            { id: 'wz-3', name: 'Low Pressure System', type: 'storm', risk: 'MODERATE', lat: -64.0, lng: 2.0, radius: 200, details: 'Passing system, clearing in 12h' },
        ],
        icebergs: [
            { id: 'ib-1', lat: -68.2, lng: 9.5, size: 'large', distance: '34 km', concentration: '72%', risk: 'MODERATE' },
            { id: 'ib-2', lat: -67.0, lng: 5.5, size: 'medium', distance: '58 km', concentration: '40%', risk: 'LOW' },
            { id: 'ib-3', lat: -69.0, lng: 13.0, size: 'small', distance: '22 km', risk: 'LOW' },
            { id: 'ib-4', lat: -66.5, lng: 11.0, size: 'large', distance: '46 km', concentration: '65%', risk: 'MODERATE' },
        ],
        intelligence: [
            { type: 'ok', text: 'Current route remains within planned weather window.' },
            { type: 'warning', text: 'Heavy sea-ice concentration detected 46 km ahead.' },
            { type: 'info', text: 'Recommended: maintain current route and reassess at next checkpoint.' },
            { type: 'ok', text: 'Maitri Station confirming berth availability for scheduled arrival.' },
        ],
        routeCondition: {
            status: 'CAUTION',
            message: 'Weather window closing in 08h',
        },
    },

    // ─── cg-902: Il-76 — Air Cargo, Cape Town → ALCI Ice Runway ───
    'cg-902': {
        cargoId: 'cg-902',
        vesselType: 'aircraft',
        vesselIcon: '✈',
        routeWaypoints: [
            { lat: -33.97, lng: 18.60, label: 'Cape Town International' },
            { lat: -40.0, lng: 15.0, label: 'South Atlantic Waypoint' },
            { lat: -50.0, lng: 8.0, label: 'Mid-Ocean Waypoint' },
            { lat: -58.0, lng: 2.0, label: 'Southern Ocean Crossing' },
            { lat: -65.0, lng: -2.0, label: 'Antarctic Airspace Entry' },
            { lat: -70.0, lng: 2.5, label: 'Troll Approach' },
            { lat: -71.95, lng: 5.15, label: 'ALCI Ice Runway' },
        ],
        currentPosition: {
            lat: -33.97,
            lng: 18.60,
            heading: 0,
            speed: 0,
            speedUnit: 'kn',
            coordinatesDisplay: "33°58' S, 18°36' E",
            lastUpdate: 'Grounded',
        },
        routeProgress: 0,
        distanceRemaining: '5,400 km',
        distanceTotal: '5,400 km',
        eta: '2026-10-14',
        nextCheckpoint: 'Departure',
        altitude: 'Grounded',
        checkpoints: [
            { id: 'cp-1', name: 'Cape Town', status: 'current', lat: -33.97, lng: 18.60, eta: 'Awaiting clearance' },
            { id: 'cp-2', name: 'South Atlantic', status: 'upcoming', lat: -50.0, lng: 8.0, eta: '~3h after departure' },
            { id: 'cp-3', name: 'Antarctic Airspace', status: 'upcoming', lat: -65.0, lng: -2.0, eta: '~4.5h after departure' },
            { id: 'cp-4', name: 'Troll Approach', status: 'upcoming', lat: -70.0, lng: 2.5, eta: '~5.5h after departure' },
            { id: 'cp-5', name: 'ALCI Ice Runway', status: 'upcoming', lat: -71.95, lng: 5.15, eta: '~6h after departure' },
        ],
        nearbyStations: [
            { id: 'troll', name: 'Troll Station (NOR)', lat: -72.01, lng: 2.53, personnel: 8, status: 'OPTIMAL' },
            { id: 'maitri', name: 'Maitri Station', lat: -70.77, lng: 11.73, personnel: 24, status: 'OPTIMAL' },
        ],
        nearbyAssets: [
            { id: 'na-1', name: 'DROMLAN C-130', type: 'aircraft', lat: -71.0, lng: 3.0, description: 'Return flight to Cape Town' },
        ],
        environment: {
            temperature: '22°C',
            wind: '12 kt NW',
            visibility: '15 km',
            seaIce: 'N/A',
            weather: 'Clear',
            pressure: '1013 hPa',
        },
        iceConditions: [],
        weatherZones: [
            { id: 'wz-1', name: 'Runway Crosswind Zone', type: 'wind', risk: 'LOW', lat: -71.95, lng: 5.15, radius: 50, details: 'Light crosswinds at runway' },
        ],
        icebergs: [],
        intelligence: [
            { type: 'ok', text: 'Cargo loaded and secured. Awaiting weather window for departure.' },
            { type: 'info', text: 'ALCI Ice Runway surface condition: GOOD. Cleared for heavy aircraft operations.' },
            { type: 'warning', text: 'Weather window for Antarctic landing: 14 Oct 06:00–18:00 UTC.' },
        ],
        routeCondition: {
            status: 'STABLE',
            message: 'Pre-departure. Conditions nominal.',
        },
    },

    // ─── cg-903: Snow-Cat Convoy — Bharati → Maitri ───
    'cg-903': {
        cargoId: 'cg-903',
        vesselType: 'snowcat',
        vesselIcon: '🏔',
        routeWaypoints: [
            { lat: -69.41, lng: 76.20, label: 'Bharati Station' },
            { lat: -69.5, lng: 70.0, label: 'Larsemann Hills Exit' },
            { lat: -69.8, lng: 60.0, label: 'Ice Shelf Traverse Alpha' },
            { lat: -70.0, lng: 48.0, label: 'Mid-Traverse Cache Point' },
            { lat: -70.2, lng: 35.0, label: 'Weddell Approach' },
            { lat: -70.5, lng: 22.0, label: 'Schirmacher Corridor Entry' },
            { lat: -70.77, lng: 11.73, label: 'Maitri Station' },
        ],
        currentPosition: {
            lat: -70.1,
            lng: 42.5,
            heading: 265,
            speed: 18,
            speedUnit: 'km/h',
            coordinatesDisplay: "70°06' S, 42°30' E",
            lastUpdate: '05 min ago',
        },
        routeProgress: 52,
        distanceRemaining: '1,580 km',
        distanceTotal: '3,300 km',
        eta: '14h 32m',
        nextCheckpoint: 'Mid-Traverse Cache Point',
        checkpoints: [
            { id: 'cp-1', name: 'Bharati Station', status: 'completed', lat: -69.41, lng: 76.20, eta: 'Departed' },
            { id: 'cp-2', name: 'Larsemann Exit', status: 'completed', lat: -69.5, lng: 70.0, eta: 'Passed' },
            { id: 'cp-3', name: 'Ice Shelf Traverse', status: 'current', lat: -69.8, lng: 60.0 },
            { id: 'cp-4', name: 'Cache Point', status: 'upcoming', lat: -70.0, lng: 48.0, eta: '~4h' },
            { id: 'cp-5', name: 'Schirmacher Entry', status: 'upcoming', lat: -70.5, lng: 22.0, eta: '~10h' },
            { id: 'cp-6', name: 'Maitri Station', status: 'upcoming', lat: -70.77, lng: 11.73, eta: '~14h' },
        ],
        nearbyStations: [
            { id: 'bharati', name: 'Bharati Station', lat: -69.41, lng: 76.20, personnel: 31, status: 'WARNING' },
            { id: 'maitri', name: 'Maitri Station', lat: -70.77, lng: 11.73, personnel: 24, status: 'OPTIMAL' },
        ],
        nearbyAssets: [
            { id: 'na-1', name: 'Convoy Beta', type: 'convoy', lat: -70.3, lng: 38.0, description: 'Cold weather gear transport' },
            { id: 'na-2', name: 'Field Camp 03', type: 'station', lat: -71.2, lng: 12.5, description: 'Temporary research camp' },
        ],
        environment: {
            temperature: '-34°C',
            wind: '24 kt SW',
            visibility: '2.8 km',
            seaIce: 'N/A — Overland',
            weather: 'Blowing Snow',
            pressure: '965 hPa',
        },
        iceConditions: [
            { description: 'Crevasse field detected ahead', distance: '12 km', concentration: 'N/A', risk: 'HIGH' },
        ],
        weatherZones: [
            { id: 'wz-1', name: 'Blowing Snow Zone', type: 'wind', risk: 'HIGH', lat: -70.2, lng: 40.0, radius: 60, details: 'Visibility < 3km, gusts 35 kt' },
            { id: 'wz-2', name: 'Crevasse Field', type: 'ice', risk: 'HIGH', lat: -70.15, lng: 44.0, radius: 30, details: 'Mapped crevasse field — GPS waypoints required' },
        ],
        icebergs: [],
        intelligence: [
            { type: 'warning', text: 'Crevasse field 12 km ahead — maintain GPS-guided route only.' },
            { type: 'warning', text: 'Blowing snow reducing visibility. Consider halt if < 1 km.' },
            { type: 'info', text: 'Cache Point fuel depot confirmed stocked. Refuel opportunity in ~4h.' },
            { type: 'ok', text: 'All convoy vehicles reporting nominal mechanical status.' },
        ],
        routeCondition: {
            status: 'CAUTION',
            message: 'Low visibility — blowing snow conditions',
        },
    },

    // ─── cg-904: Heavy Polar Sled — Maitri → Expedition 07 ───
    'cg-904': {
        cargoId: 'cg-904',
        vesselType: 'snowcat',
        vesselIcon: '🏔',
        routeWaypoints: [
            { lat: -70.77, lng: 11.73, label: 'Maitri Station' },
            { lat: -70.9, lng: 12.5, label: 'Schirmacher Oasis Edge' },
            { lat: -71.3, lng: 13.8, label: 'Glacier Transition Zone' },
            { lat: -71.8, lng: 15.0, label: 'Ice Sheet Plateau' },
            { lat: -72.5, lng: 16.5, label: 'Expedition 07 Camp' },
        ],
        currentPosition: {
            lat: -70.77,
            lng: 11.73,
            heading: 0,
            speed: 0,
            speedUnit: 'km/h',
            coordinatesDisplay: "70°46' S, 11°44' E",
            lastUpdate: 'Staged at depot',
        },
        routeProgress: 0,
        distanceRemaining: '245 km',
        distanceTotal: '245 km',
        eta: '21h 10m (Weather Delay)',
        nextCheckpoint: 'Departure',
        checkpoints: [
            { id: 'cp-1', name: 'Maitri Station', status: 'current', lat: -70.77, lng: 11.73, eta: 'Weather hold' },
            { id: 'cp-2', name: 'Oasis Edge', status: 'upcoming', lat: -70.9, lng: 12.5, eta: '~2h after departure' },
            { id: 'cp-3', name: 'Glacier Zone', status: 'upcoming', lat: -71.3, lng: 13.8, eta: '~8h after departure' },
            { id: 'cp-4', name: 'Expedition 07', status: 'upcoming', lat: -72.5, lng: 16.5, eta: '~21h after departure' },
        ],
        nearbyStations: [
            { id: 'maitri', name: 'Maitri Station', lat: -70.77, lng: 11.73, personnel: 24, status: 'OPTIMAL' },
            { id: 'fc-03', name: 'Field Camp 03', lat: -71.2, lng: 12.5, personnel: 6, status: 'OPTIMAL' },
        ],
        nearbyAssets: [
            { id: 'na-1', name: 'Snowcat Convoy Alpha', type: 'convoy', lat: -70.5, lng: 11.9, description: 'Supply run to Field Camp 03' },
        ],
        environment: {
            temperature: '-24°C',
            wind: '38 kt SW',
            visibility: '1.2 km',
            seaIce: 'N/A — Overland',
            weather: 'Blizzard Warning',
            pressure: '958 hPa',
        },
        iceConditions: [
            { description: 'Glacier transition zone — unstable surface', distance: '35 km', concentration: 'N/A', risk: 'MODERATE' },
        ],
        weatherZones: [
            { id: 'wz-1', name: 'Blizzard System', type: 'storm', risk: 'SEVERE', lat: -71.0, lng: 12.0, radius: 100, details: 'Sustained 38 kt winds, visibility < 1 km' },
        ],
        icebergs: [],
        intelligence: [
            { type: 'warning', text: 'Departure delayed — blizzard warning active at Maitri Station.' },
            { type: 'info', text: 'Weather window expected to open in 06–08 hours.' },
            { type: 'ok', text: 'Fuel drums secured and cargo pre-staged at loading bay.' },
        ],
        routeCondition: {
            status: 'WARNING',
            message: 'Blizzard conditions — departure on hold',
        },
    },

    // ─── cg-905: SA Agulhas II — Supply ship, Cape Town → Bharati ───
    'cg-905': {
        cargoId: 'cg-905',
        vesselType: 'supply_ship',
        vesselIcon: '🚢',
        routeWaypoints: [
            { lat: -33.92, lng: 18.42, label: 'Cape Town Port' },
            { lat: -36.0, lng: 22.0, label: 'Agulhas Current' },
            { lat: -42.0, lng: 35.0, label: 'Indian Ocean Route' },
            { lat: -50.0, lng: 50.0, label: 'Roaring Forties' },
            { lat: -56.0, lng: 60.0, label: 'Southern Ocean' },
            { lat: -62.0, lng: 68.0, label: 'Antarctic Approach' },
            { lat: -66.0, lng: 73.0, label: 'Pack Ice Edge' },
            { lat: -69.41, lng: 76.20, label: 'Bharati Station' },
        ],
        currentPosition: {
            lat: -33.92,
            lng: 18.42,
            heading: 0,
            speed: 0,
            speedUnit: 'kn',
            coordinatesDisplay: "33°55' S, 18°25' E",
            lastUpdate: 'At berth',
        },
        routeProgress: 0,
        distanceRemaining: '6,200 km',
        distanceTotal: '6,200 km',
        eta: '2d 04h',
        nextCheckpoint: 'Departure',
        checkpoints: [
            { id: 'cp-1', name: 'Cape Town', status: 'current', lat: -33.92, lng: 18.42, eta: 'Loading' },
            { id: 'cp-2', name: 'Indian Ocean', status: 'upcoming', lat: -42.0, lng: 35.0, eta: '~2d' },
            { id: 'cp-3', name: 'Southern Ocean', status: 'upcoming', lat: -56.0, lng: 60.0, eta: '~5d' },
            { id: 'cp-4', name: 'Bharati Station', status: 'upcoming', lat: -69.41, lng: 76.20, eta: '~8d' },
        ],
        nearbyStations: [
            { id: 'bharati', name: 'Bharati Station', lat: -69.41, lng: 76.20, personnel: 31, status: 'WARNING' },
        ],
        nearbyAssets: [
            { id: 'na-1', name: 'MV Vasiliy Golovnin', type: 'vessel', lat: -69.97, lng: 11.92, heading: 148, description: 'Icebreaker en route to Maitri' },
        ],
        environment: {
            temperature: '18°C',
            wind: '8 kt W',
            visibility: '20 km',
            seaIce: 'N/A',
            weather: 'Partly Cloudy',
            pressure: '1018 hPa',
        },
        iceConditions: [],
        weatherZones: [],
        icebergs: [],
        intelligence: [
            { type: 'ok', text: 'Loading operations 85% complete. Departure on schedule.' },
            { type: 'info', text: 'Southern Ocean weather forecast favorable for planned transit window.' },
        ],
        routeCondition: {
            status: 'STABLE',
            message: 'Pre-departure. Loading in progress.',
        },
    },

    // ─── cg-906: Light Utility Convoy Alpha — DELIVERED ───
    'cg-906': {
        cargoId: 'cg-906',
        vesselType: 'snowcat',
        vesselIcon: '🏔',
        routeWaypoints: [
            { lat: -70.77, lng: 11.73, label: 'Maitri Station' },
            { lat: -70.9, lng: 12.0, label: 'Oasis Transit' },
            { lat: -71.5, lng: 13.5, label: 'Expedition 05 Camp' },
        ],
        currentPosition: {
            lat: -71.5,
            lng: 13.5,
            heading: 0,
            speed: 0,
            speedUnit: 'km/h',
            coordinatesDisplay: "71°30' S, 13°30' E",
            lastUpdate: 'Delivered',
        },
        routeProgress: 100,
        distanceRemaining: '0 km',
        distanceTotal: '120 km',
        eta: 'Delivered',
        nextCheckpoint: 'N/A',
        checkpoints: [
            { id: 'cp-1', name: 'Maitri Station', status: 'completed', lat: -70.77, lng: 11.73, eta: 'Departed' },
            { id: 'cp-2', name: 'Oasis Transit', status: 'completed', lat: -70.9, lng: 12.0, eta: 'Passed' },
            { id: 'cp-3', name: 'Expedition 05', status: 'completed', lat: -71.5, lng: 13.5, eta: 'Delivered' },
        ],
        nearbyStations: [
            { id: 'maitri', name: 'Maitri Station', lat: -70.77, lng: 11.73, personnel: 24, status: 'OPTIMAL' },
        ],
        nearbyAssets: [],
        environment: {
            temperature: '-22°C',
            wind: '14 kt S',
            visibility: '8 km',
            seaIce: 'N/A — Overland',
            weather: 'Clear',
            pressure: '972 hPa',
        },
        iceConditions: [],
        weatherZones: [],
        icebergs: [],
        intelligence: [
            { type: 'ok', text: 'Cargo delivered successfully. All communication equipment operational.' },
            { type: 'ok', text: 'Satellite terminal installation confirmed by Expedition 05 team.' },
        ],
        routeCondition: {
            status: 'STABLE',
            message: 'Delivery complete.',
        },
    },

    // ─── cg-907: Snow-Cat Convoy Beta — Bharati → Expedition 03 ───
    'cg-907': {
        cargoId: 'cg-907',
        vesselType: 'snowcat',
        vesselIcon: '🏔',
        routeWaypoints: [
            { lat: -69.41, lng: 76.20, label: 'Bharati Station' },
            { lat: -69.6, lng: 74.0, label: 'Larsemann Hills West' },
            { lat: -69.9, lng: 71.0, label: 'Ice Sheet Access' },
            { lat: -70.3, lng: 68.0, label: 'Plateau Traverse' },
            { lat: -70.8, lng: 65.0, label: 'Expedition 03 Camp' },
        ],
        currentPosition: {
            lat: -69.75,
            lng: 72.5,
            heading: 240,
            speed: 15,
            speedUnit: 'km/h',
            coordinatesDisplay: "69°45' S, 72°30' E",
            lastUpdate: '03 min ago',
        },
        routeProgress: 33,
        distanceRemaining: '420 km',
        distanceTotal: '630 km',
        eta: '18h 45m',
        nextCheckpoint: 'Ice Sheet Access',
        checkpoints: [
            { id: 'cp-1', name: 'Bharati Station', status: 'completed', lat: -69.41, lng: 76.20, eta: 'Departed' },
            { id: 'cp-2', name: 'Larsemann West', status: 'completed', lat: -69.6, lng: 74.0, eta: 'Passed' },
            { id: 'cp-3', name: 'Ice Sheet Access', status: 'current', lat: -69.9, lng: 71.0 },
            { id: 'cp-4', name: 'Plateau Traverse', status: 'upcoming', lat: -70.3, lng: 68.0, eta: '~8h' },
            { id: 'cp-5', name: 'Expedition 03', status: 'upcoming', lat: -70.8, lng: 65.0, eta: '~18h' },
        ],
        nearbyStations: [
            { id: 'bharati', name: 'Bharati Station', lat: -69.41, lng: 76.20, personnel: 31, status: 'WARNING' },
        ],
        nearbyAssets: [
            { id: 'na-1', name: 'PistonBully Convoy', type: 'convoy', lat: -70.1, lng: 42.5, description: 'Medical supplies to Maitri' },
        ],
        environment: {
            temperature: '-31°C',
            wind: '20 kt W',
            visibility: '6 km',
            seaIce: 'N/A — Overland',
            weather: 'Partly Cloudy',
            pressure: '968 hPa',
        },
        iceConditions: [
            { description: 'sastrugi field on ice sheet', distance: '18 km', concentration: 'N/A', risk: 'MODERATE' },
        ],
        weatherZones: [
            { id: 'wz-1', name: 'Sastrugi Field', type: 'ice', risk: 'MODERATE', lat: -69.95, lng: 70.5, radius: 40, details: 'Hard-packed snow ridges, reduce speed to 10 km/h' },
        ],
        icebergs: [],
        intelligence: [
            { type: 'ok', text: 'Convoy proceeding on schedule through Larsemann Hills corridor.' },
            { type: 'warning', text: 'Sastrugi field ahead — recommend speed reduction to 10 km/h.' },
            { type: 'info', text: 'Expedition 03 confirming receiving coordinates for cargo drop.' },
        ],
        routeCondition: {
            status: 'STABLE',
            message: 'Route conditions nominal.',
        },
    },
};
