import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InventoryItem, InventoryStatus } from '../types';

interface InventoryStore {
    items: InventoryItem[];
    isSeeded: boolean;
    addItem: (item: InventoryItem) => void;
    updateItem: (id: string, updates: Partial<InventoryItem>) => void;
    removeItem: (id: string) => void;
    adjustStock: (id: string, newQuantity: number) => void;
    allocateToMission: (id: string, quantity: number) => void;
    seedInventory: () => void;
}

export const calcStatus = (qty: number, min: number, crit: number): InventoryStatus => {
    if (qty <= 0) return 'DEPLETED';
    if (qty <= crit) return 'CRITICAL';
    if (qty <= min) return 'LOW';
    return 'HEALTHY';
};

const SEED_DATA: InventoryItem[] = [
    {
        id: 'INV-042',
        name: 'MGO Marine Fuel',
        category: 'Fuel',
        quantity: 185000,
        unit: 'L',
        location: 'Maitri Station',
        minimumThreshold: 50000,
        criticalThreshold: 25000,
        consumptionRate: 4200,
        reservedQuantity: 30000,
        status: 'HEALTHY',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'INV-089',
        name: 'Jet A-1 Aviation Fuel',
        category: 'Fuel',
        quantity: 12000,
        unit: 'L',
        location: 'Bharati Station',
        minimumThreshold: 15000,
        criticalThreshold: 5000,
        consumptionRate: 800,
        reservedQuantity: 0,
        status: 'LOW',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'INV-301',
        name: 'Freeze-Dried Rations (Month pack)',
        category: 'Food & Rations',
        quantity: 450,
        unit: 'packs',
        location: 'Bharati Station',
        minimumThreshold: 200,
        criticalThreshold: 50,
        consumptionRate: 4,
        reservedQuantity: 20,
        status: 'HEALTHY',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'INV-412',
        name: 'Emergency Medical Kits (Level 3)',
        category: 'Medical',
        quantity: 5,
        unit: 'kits',
        location: 'Maitri Station',
        minimumThreshold: 10,
        criticalThreshold: 3,
        consumptionRate: 0.1,
        reservedQuantity: 2,
        status: 'LOW',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'INV-550',
        name: 'Ice Core Drill Bits (Titanium)',
        category: 'Scientific Equipment',
        quantity: 2,
        unit: 'units',
        location: 'Field Camp Alpha',
        minimumThreshold: 5,
        criticalThreshold: 2,
        consumptionRate: 0.2,
        reservedQuantity: 2,
        status: 'CRITICAL',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'INV-707',
        name: 'Snowcat Treads (Set)',
        category: 'Spare Parts',
        quantity: 12,
        unit: 'sets',
        location: 'Maitri Station',
        minimumThreshold: 8,
        criticalThreshold: 4,
        consumptionRate: 0.5,
        reservedQuantity: 0,
        status: 'HEALTHY',
        lastUpdated: new Date().toISOString(),
    }
];

export const useInventoryStore = create<InventoryStore>()(
    persist(
        (set) => ({
            items: [],
            isSeeded: false,

            addItem: (item) => set((state) => ({
                items: [...state.items, { ...item, status: calcStatus(item.quantity, item.minimumThreshold, item.criticalThreshold), lastUpdated: new Date().toISOString() }]
            })),

            updateItem: (id, updates) => set((state) => ({
                items: state.items.map(item => {
                    if (item.id === id) {
                        const up = { ...item, ...updates, lastUpdated: new Date().toISOString() };
                        up.status = calcStatus(up.quantity, up.minimumThreshold, up.criticalThreshold);
                        return up;
                    }
                    return item;
                })
            })),

            removeItem: (id) => set((state) => ({
                items: state.items.filter(item => item.id !== id)
            })),

            adjustStock: (id, newQuantity) => set((state) => ({
                items: state.items.map(item => {
                    if (item.id === id) {
                        const q = Math.max(0, newQuantity);
                        return {
                            ...item,
                            quantity: q,
                            status: calcStatus(q, item.minimumThreshold, item.criticalThreshold),
                            lastUpdated: new Date().toISOString()
                        };
                    }
                    return item;
                })
            })),

            allocateToMission: (id, quantity) => set((state) => ({
                items: state.items.map(item => {
                    if (item.id === id) {
                        // we're preserving the total quantity, just raising reserved 
                        return {
                            ...item,
                            reservedQuantity: item.reservedQuantity + quantity,
                            lastUpdated: new Date().toISOString()
                        };
                    }
                    return item;
                })
            })),

            seedInventory: () => set({
                items: SEED_DATA,
                isSeeded: true
            })
        }),
        {
            name: 'northstar-inventory',
        }
    )
);
