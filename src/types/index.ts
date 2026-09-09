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

export interface InventoryItem {
  id: string;
  stationId: StationId;
  category: 'Fuel & Energy' | 'Rations & Food' | 'Medical Supplies' | 'Technical Spares' | 'Field Gear';
  name: string;
  currentStock: number;
  unit: string;
  burnRatePerDay: number;
  daysRemaining: number;
  minThreshold: number;
  status: 'HEALTHY' | 'DEPLETING_FAST' | 'CRITICAL_LOW' | 'EXPIRING_SOON';
  location: string;
  expiryDate?: string;
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
