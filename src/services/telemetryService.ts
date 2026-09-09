import { MOCK_STATIONS, MOCK_ALERTS } from '../data/mockData';
import { Station, EmergencyAlert } from '../types';

export const telemetryService = {
  getStations: (): Promise<Station[]> => {
    return Promise.resolve(MOCK_STATIONS);
  },

  getAlerts: (): Promise<EmergencyAlert[]> => {
    return Promise.resolve(MOCK_ALERTS);
  },
};
