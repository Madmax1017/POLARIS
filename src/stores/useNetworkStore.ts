import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QueuedAction {
  id: string;
  type: 'CHECK_IN' | 'INVENTORY_ADJUSTMENT' | 'ALERT_ACK' | 'SAFETY_UPDATE';
  title: string;
  details: string;
  timestamp: string;
}

interface NetworkState {
  isOnline: boolean;
  syncQueue: QueuedAction[];
  lastSyncTime: string;
  isSyncing: boolean;
  syncMessage: string | null;
  toggleNetwork: () => void;
  setOnline: (online: boolean) => void;
  addQueuedAction: (action: Omit<QueuedAction, 'id' | 'timestamp'>) => void;
  syncData: () => void;
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      syncQueue: [],
      lastSyncTime: 'Just now',
      isSyncing: false,
      syncMessage: null,

      toggleNetwork: () => {
        const current = get().isOnline;
        if (current) {
          set({ isOnline: false, syncMessage: 'SWAPPING TO OFFLINE LOCAL MODE' });
          setTimeout(() => set({ syncMessage: null }), 3000);
        } else {
          get().syncData();
        }
      },

      setOnline: (online: boolean) => {
        if (!online) {
          set({ isOnline: false });
        } else {
          get().syncData();
        }
      },

      addQueuedAction: (action) => {
        const newAction: QueuedAction = {
          ...action,
          id: `queue-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        const currentQueue = get().syncQueue;
        set({ syncQueue: [newAction, ...currentQueue] });
      },

      syncData: () => {
        const queueCount = get().syncQueue.length;
        set({
          isSyncing: true,
          syncMessage: 'CONNECTIVITY RESTORED — Synchronizing local operations...',
        });

        setTimeout(() => {
          set({
            isOnline: true,
            isSyncing: false,
            syncQueue: [],
            lastSyncTime: 'Just now',
            syncMessage: `SYNC COMPLETE — ${queueCount} operation(s) synchronized`,
          });

          setTimeout(() => {
            set({ syncMessage: null });
          }, 4000);
        }, 2000);
      },
    }),
    {
      name: 'polaris-network-state-v1',
    }
  )
);
