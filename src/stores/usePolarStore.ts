import { MOCK_USER } from '../data/mockData';
import { UserProfile, StationId } from '../types';

export interface PolarState {
  currentUser: UserProfile;
  activeStationId: StationId;
}

export const initialPolarState: PolarState = {
  currentUser: MOCK_USER,
  activeStationId: 'ncpor-goa',
};
