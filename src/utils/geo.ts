import { Launchpad } from '../types/spacex';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type LaunchpadCluster = {
  id: string;
  latitude: number;
  longitude: number;
  launchpads: Launchpad[];
  density: number;
};

export const distanceKm = (from: Coordinate, to: Coordinate): number => {
  const earthKm = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const clusterLaunchpads = (launchpads: Launchpad[], zoom: number): LaunchpadCluster[] => {
  const precision = zoom < 5 ? 1 : zoom < 8 ? 2 : 3;
  const buckets = new Map<string, Launchpad[]>();
  launchpads.forEach((pad) => {
    const key = `${pad.latitude.toFixed(precision)}:${pad.longitude.toFixed(precision)}`;
    const group = buckets.get(key) ?? [];
    group.push(pad);
    buckets.set(key, group);
  });
  return Array.from(buckets.entries()).map(([id, pads]) => {
    const latitude = pads.reduce((sum, pad) => sum + pad.latitude, 0) / pads.length;
    const longitude = pads.reduce((sum, pad) => sum + pad.longitude, 0) / pads.length;
    const density = pads.reduce((sum, pad) => sum + pad.launchAttempts, 0);
    return { id, latitude, longitude, launchpads: pads, density };
  });
};
