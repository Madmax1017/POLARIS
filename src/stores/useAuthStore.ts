import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, UserRole } from '../types';

export const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'field@polaris.res.in': {
    password: 'Field@123',
    user: {
      id: 'demo-field-01',
      email: 'field@polaris.res.in',
      name: 'Dr. Ananya Sharma',
      role: 'FIELD_STAFF',
      roleDisplayName: 'Field Staff / Scientist',
      stationId: 'maitri',
      clearanceLevel: 'BETA',
      avatarInitials: 'AS',
    },
  },
  'station@polaris.res.in': {
    password: 'Station@123',
    user: {
      id: 'demo-station-01',
      email: 'station@polaris.res.in',
      name: 'Vikramaditya Das',
      role: 'STATION_LEADER',
      roleDisplayName: 'Station Leader / Logistics Officer',
      stationId: 'bharati',
      clearanceLevel: 'BETA',
      avatarInitials: 'VD',
    },
  },
  'command@polaris.res.in': {
    password: 'Command@123',
    user: {
      id: 'demo-command-01',
      email: 'command@polaris.res.in',
      name: 'Dr. Rajesh Verma',
      role: 'NCPOR_COMMAND',
      roleDisplayName: 'NCPOR Command',
      stationId: 'ncpor-goa',
      clearanceLevel: 'ALPHA',
      avatarInitials: 'RV',
    },
  },
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEMO_ACCOUNTS['command@polaris.res.in'].user,
      isAuthenticated: true,

      login: (email: string, password: string) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password) {
          return { success: false, error: 'Please enter both email and password.' };
        }

        const account = DEMO_ACCOUNTS[cleanEmail];
        if (!account || account.password !== password) {
          return { success: false, error: 'Invalid credentials' };
        }

        set({ user: account.user, isAuthenticated: true });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'polaris-demo-auth-session',
    }
  )
);
