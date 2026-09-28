export type StationId = 'maitri' | 'bharati' | 'himadri' | 'ncpor-goa';

export type StationRegion = 'Antarctic' | 'Arctic' | 'HQ';

export type UserRole = 'FIELD_STAFF' | 'STATION_LEADER' | 'NCPOR_COMMAND';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleDisplayName: string;
  stationId: StationId;
  clearanceLevel: 'ALPHA' | 'BETA' | 'GAMMA';
  avatarInitials: string;
}

export interface Station {
  id: StationId;
  name: string;
  code: string;
  region: StationRegion;
  coordinates: {
    lat: number;
    lng: number;
    elevation: string;
  };
  temperature: string;
  windSpeed: string;
  status: 'OPTIMAL' | 'WARNING' | 'ALERT' | 'STANDBY';
  headcount: number;
  maxCapacity: number;
  riskProfile: 'Antarctic High-Isolation' | 'Arctic Seasonal Flight Access' | 'Global Command Node';
  lastSync: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'Field Staff / Scientist' | 'Station Leader / Logistics Officer' | 'NCPOR Command';
  stationId: StationId;
  email: string;
  avatarUrl?: string;
  clearanceLevel: 'ALPHA' | 'BETA' | 'GAMMA';
}

export interface Personnel {
  id: string;
  name: string;
  role: string;
  stationId: StationId;
  team: string;
  fitnessClearance: 'APPROVED' | 'PENDING' | 'EXPIRED';
  checkInStatus: 'CHECKED_IN' | 'DUE_SOON' | 'MISSED_DEADMAN_TRIGGER' | 'OFFLINE';
  lastCheckIn: string;
  nextCheckInDue: string;
  coordinates?: string;
  bloodGroup: string;
}

export type InventoryCategory = 'Fuel' | 'Food & Rations' | 'Medical' | 'Scientific Equipment' | 'Spare Parts' | 'Communication' | 'Field Equipment' | 'Research Supplies' | 'Other';
export type InventoryStatus = 'HEALTHY' | 'LOW' | 'CRITICAL' | 'DEPLETED';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  location: string;
  minimumThreshold: number;
  criticalThreshold: number;
  consumptionRate: number;
  reservedQuantity: number;
  status: InventoryStatus;
  lastUpdated: string;
}

export interface Expedition {
  id: string;
  code: string;
  name: string;
  stationId: StationId;
  phase: 'Planning' | 'Deployment' | 'Active Field' | 'De-rigging' | 'Debrief';
  leadScientist: string;
  teamCount: number;
  startDate: string;
  targetCompletion: string;
  status: 'ON_SCHEDULE' | 'WEATHER_DELAY' | 'COMPLETED' | 'STANDBY';
  routeSummary: string;
}

export interface CargoShipment {
  id: string;
  trackingId: string;
  origin: string;
  destination: string;
  vesselName: string;
  transportMode: 'ICEBREAKER_SHIP' | 'CARGO_FLIGHT' | 'SNOW_CAT_CONVOY';
  cargoSummary: string;
  weightKg: number;
  eta: string;
  status: 'IN_TRANSIT' | 'CUSTOMS_CLEARANCE' | 'LOADED_PORT' | 'DELIVERED';
  urgency: 'ROUTINE' | 'HIGH_PRIORITY' | 'SEASONAL_CRITICAL';
}

export interface EmergencyAlert {
  id: string;
  stationId: StationId;
  personnelName: string;
  timestamp: string;
  type: 'DEADMAN_TIMEOUT' | 'ONE_TAP_SOS' | 'BLIZZARD_WARNING' | 'POWER_GRID_DROP';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'ACTIVE_ESCALATED' | 'ACKNOWLEDGED' | 'RESOLVED';
  location: string;
  vitalsSummary?: string;
}

export type MissionStatus = 'PLANNING' | 'PLANNED' | 'READY' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type MissionPriority = 'Routine' | 'High' | 'Critical';
export type MissionType =
  | 'Scientific Research'
  | 'Field Survey'
  | 'Resupply'
  | 'Maintenance'
  | 'Personnel Transfer'
  | 'Emergency Response'
  | 'Reconnaissance'
  | 'Logistics Support'
  | 'Other';

export interface MissionObjective {
  id: string;
  text: string;
  type: 'primary' | 'secondary';
}

export interface MissionCheckpoint {
  id: string;
  name: string;
  type: 'origin' | 'waypoint' | 'field_camp' | 'research_area' | 'destination';
  lat: number;
  lng: number;
  order: number;
  estimatedArrival?: string;
}

export interface MissionPersonnel {
  id: string;
  name: string;
  role: string;
  specialization: string;
  stationId: string;
  status: 'Available' | 'On Mission' | 'Unavailable';
  isLead?: boolean;
}

export interface MissionAsset {
  id: string;
  assetId: string;
  name: string;
  type: 'Snowcat' | 'Icebreaker' | 'Aircraft' | 'Utility Vehicle' | 'Field Equipment' | 'Communication Equipment' | 'Scientific Equipment' | 'Medical Equipment';
  location: string;
  availability: 'Available' | 'In Use' | 'Maintenance';
  condition: 'Operational' | 'Serviceable' | 'Limited';
  fuelRequirement?: string;
}

export interface MissionCargoItem {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  requiredAt: string;
  deadline: string;
  category: 'Fuel' | 'Food / Rations' | 'Medical Supplies' | 'Scientific Equipment' | 'Spare Parts' | 'Research Samples' | 'Communication Equipment' | 'Other';
}

export interface MissionPhase {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface MissionRisk {
  id: string;
  category: 'Weather' | 'Sea Ice' | 'Equipment' | 'Personnel' | 'Connectivity' | 'Fuel' | 'Medical' | 'Route' | 'Cargo';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigation: string;
}

export interface MissionReadiness {
  personnel: 'READY' | 'PARTIAL' | 'NOT_READY';
  assets: 'READY' | 'PARTIAL' | 'NOT_READY';
  cargo: 'READY' | 'PARTIAL' | 'NOT_READY';
  route: 'READY' | 'PARTIAL' | 'NOT_READY';
  weather: 'READY' | 'PARTIAL' | 'REVIEW';
  communications: 'READY' | 'PARTIAL' | 'NOT_READY';
}

export interface Mission {
  id: string;
  name: string;
  type: MissionType;
  priority: MissionPriority;
  status: MissionStatus;
  commanderName: string;
  commanderPersonnelId: string;
  operationalBase: string;
  description: string;
  objectives: MissionObjective[];
  successCriteria: string;
  checkpoints: MissionCheckpoint[];
  routeSummary: string;
  estimatedDistanceKm: number;
  estimatedTravelHours: number;
  personnel: MissionPersonnel[];
  assets: MissionAsset[];
  cargo: MissionCargoItem[];
  phases: MissionPhase[];
  departureTime: string;
  returnTime: string;
  durationHours: number;
  risks: MissionRisk[];
  environmentalConditions: {
    temperature: string;
    wind: string;
    visibility: string;
    seaIce: string;
    weather: string;
    terrain: string;
    connectivity: string;
  };
  readiness: MissionReadiness;
  overallReadiness: 'READY' | 'REVIEW REQUIRED' | 'NOT READY';
  createdAt: string;
  updatedAt: string;
  isDraft?: boolean;
}
