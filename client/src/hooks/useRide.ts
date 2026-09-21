import { useCallback } from 'react';
import { BIKE_STATIONS } from '../data';
import type { RideState } from '../types';
import { useLatest } from './useLatest';
import { usePersistentState } from './usePersistentState';

function initialStock(): Record<string, number> {
  return Object.fromEntries(BIKE_STATIONS.map((station) => [station.id, station.bikes]));
}

export function useRide() {
  const [ride, setRide] = usePersistentState<RideState | null>('ride', () => null);
  const [bikeStock, setBikeStock] = usePersistentState<Record<string, number>>('bike-stock', initialStock);
  const rideRef = useLatest(ride);
  const stockRef = useLatest(bikeStock);

  const startRide = useCallback(
    (stationId: string): boolean => {
      if (rideRef.current !== null) return false;
      if ((stockRef.current[stationId] ?? 0) <= 0) return false;
      setBikeStock((prev) => ({ ...prev, [stationId]: (prev[stationId] ?? 0) - 1 }));
      setRide({ stationId, startedAt: Date.now() });
      return true;
    },
    [rideRef, setBikeStock, setRide, stockRef],
  );

  const endRide = useCallback(
    (returnStationId: string): number | null => {
      const current = rideRef.current;
      if (current === null) return null;
      setBikeStock((prev) => ({ ...prev, [returnStationId]: (prev[returnStationId] ?? 0) + 1 }));
      setRide(null);
      return Math.floor((Date.now() - current.startedAt) / 1000);
    },
    [rideRef, setBikeStock, setRide],
  );

  const resetRide = useCallback(() => {
    setRide(null);
    setBikeStock(initialStock());
  }, [setBikeStock, setRide]);

  return { ride, bikeStock, startRide, endRide, resetRide };
}
