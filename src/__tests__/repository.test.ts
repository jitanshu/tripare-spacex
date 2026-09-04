import { createMemoryRepository } from '../data/memoryRepository';

describe('memory repository contract', () => {
  it('persists cached launches, launchpads, metadata and bookmarks', async () => {
    const repository = createMemoryRepository();
    await repository.migrate();
    await repository.saveLaunches([
      {
        id: 'launch-1',
        name: 'Demo',
        dateUtc: '2024-01-01T00:00:00.000Z',
        dateUnix: 1704067200,
        rocket: 'falcon9',
        launchpadId: 'pad-1',
        status: 'success',
        details: null,
        flightNumber: 1,
        patchSmall: null,
        patchLarge: null,
        webcast: null,
        article: null,
        wikipedia: null,
        payloadIds: ['payload-1'],
      },
    ]);
    await repository.saveLaunchpads([
      {
        id: 'pad-1',
        name: 'SLC-40',
        fullName: 'Space Launch Complex 40',
        locality: 'Cape Canaveral',
        region: 'Florida',
        latitude: 28.56,
        longitude: -80.57,
        details: null,
        launchAttempts: 1,
        launchSuccesses: 1,
      },
    ]);
    await repository.upsertBookmark({ launchId: 'launch-1', encryptedNote: 'cipher', updatedAt: '2026-09-04T00:00:00.000Z' });
    await repository.setMetadata('lastSyncedAt', '2026-09-04T00:00:00.000Z');

    expect(await repository.getMetadata('lastSyncedAt')).toBe('2026-09-04T00:00:00.000Z');
    expect(await repository.getLaunches()).toHaveLength(1);
    expect(await repository.getLaunchpads()).toHaveLength(1);
    expect(await repository.getBookmarks()).toEqual([{ launchId: 'launch-1', encryptedNote: 'cipher', updatedAt: '2026-09-04T00:00:00.000Z' }]);
  });
});
