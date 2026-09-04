import NetInfo from '@react-native-community/netinfo';
import { syncMissionData } from '../data/sync';
import { createMemoryRepository } from '../data/memoryRepository';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('../api/spacexClient', () => ({
  fetchLaunches: jest.fn(),
  fetchLaunchpadsForLaunches: jest.fn(),
}));

describe('syncMissionData', () => {
  it('returns cached state without network and keeps the last sync timestamp', async () => {
    const repository = createMemoryRepository();
    await repository.setMetadata('lastSyncedAt', '2026-09-04T00:00:00.000Z');
    jest.mocked(NetInfo.fetch).mockResolvedValue({ isConnected: false } as Awaited<ReturnType<typeof NetInfo.fetch>>);

    await expect(syncMissionData(repository)).resolves.toEqual({
      ok: false,
      error: 'Offline. Showing cached mission data.',
      lastSyncedAt: '2026-09-04T00:00:00.000Z',
    });
  });
});
