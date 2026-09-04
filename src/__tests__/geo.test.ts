import { clusterLaunchpads, distanceKm } from '../utils/geo';
import { Launchpad } from '../types/spacex';

const pad = (overrides: Partial<Launchpad>): Launchpad => ({
  id: 'pad',
  name: 'SLC',
  fullName: 'Space Launch Complex',
  locality: 'Cape Canaveral',
  region: 'Florida',
  latitude: 28.56,
  longitude: -80.57,
  details: null,
  launchAttempts: 1,
  launchSuccesses: 1,
  ...overrides,
});

describe('geo utilities', () => {
  it('computes distance in kilometers', () => {
    const km = distanceKm({ latitude: 28.562, longitude: -80.577 }, { latitude: 34.632, longitude: -120.611 });
    expect(km).toBeGreaterThan(3800);
    expect(km).toBeLessThan(4200);
  });

  it('clusters nearby launchpads at low zoom and sums density', () => {
    const clusters = clusterLaunchpads(
      [
        pad({ id: 'a', latitude: 28.561, longitude: -80.577, launchAttempts: 5 }),
        pad({ id: 'b', latitude: 28.562, longitude: -80.578, launchAttempts: 7 }),
        pad({ id: 'c', latitude: 34.632, longitude: -120.611, launchAttempts: 2 }),
      ],
      4,
    );

    expect(clusters).toHaveLength(2);
    expect(clusters.find((cluster) => cluster.launchpads.length === 2)?.density).toBe(12);
  });
});
