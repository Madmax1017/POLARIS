import Dexie from 'dexie';

export const db = new Dexie('NCPORPolarLogistics');

db.version(1).stores({
  inventory: 'id, station, name, category, quantity, unit, dailyConsumption, resupplyWindowDays',
  personnel: 'id, name, station, role, team, status, lastCheckin, nextCheckinDue, medicalClearance',
  cargo: 'id, containerNumber, origin, destination, vessel, status, eta, priority, items',
  traversals: 'id, title, station, status, leader, teamCount, startCoords, currentCoords, destCoords',
  incidents: 'id, timestamp, station, severity, category, description, status, reportedBy',
  syncQueue: '++id, timestamp, action, payload, status'
});

export const addSyncQueueItem = async (action, payload) => {
  return await db.syncQueue.add({
    timestamp: new Date().toISOString(),
    action,
    payload,
    status: 'PENDING_SATELLITE_LINK'
  });
};

export const clearSyncedQueue = async () => {
  return await db.syncQueue.clear();
};
