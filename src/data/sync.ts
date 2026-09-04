import NetInfo from '@react-native-community/netinfo';
import { fetchLaunches, fetchLaunchpadsForLaunches } from '../api/spacexClient';
import { MissionRepository } from './database';
import { logError } from '../utils/logger';

export type SyncResult = {
  ok: boolean;
  error: string | null;
  lastSyncedAt: string | null;
};

export const syncMissionData = async (repository: MissionRepository): Promise<SyncResult> => {
  await repository.migrate();
  const network = await NetInfo.fetch();
  if (!network.isConnected) {
    return { ok: false, error: 'Offline. Showing cached mission data.', lastSyncedAt: await repository.getMetadata('lastSyncedAt') };
  }

  try {
    const launches = await fetchLaunches();
    const launchpads = await fetchLaunchpadsForLaunches(launches);
    await repository.saveLaunches(launches);
    await repository.saveLaunchpads(launchpads);
    const now = new Date().toISOString();
    await repository.setMetadata('lastSyncedAt', now);
    return { ok: true, error: null, lastSyncedAt: now };
  } catch (error) {
    logError(error, 'syncMissionData');
    return {
      ok: false,
      error: 'Could not refresh SpaceX data. Showing the latest cached copy.',
      lastSyncedAt: await repository.getMetadata('lastSyncedAt'),
    };
  }
};
