import { useState, useEffect } from 'react';
import { MOCK_STATIONS } from '../data/mockData';
import { Station } from '../types';

export const usePolarTelemetry = () => {
  const [stations] = useState<Station[]>(MOCK_STATIONS);
  const [isOnline] = useState<boolean>(true);

  return {
    stations,
    isOnline,
    lastSyncTimestamp: new Date().toISOString(),
  };
};
