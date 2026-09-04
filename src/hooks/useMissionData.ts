import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { missionRepository } from '../data/database';
import { syncMissionData } from '../data/sync';
import { EnrichedLaunch } from '../types/spacex';
import { useMissionStore } from '../state/missionStore';

export const loadCachedData = async (): Promise<EnrichedLaunch[]> => {
  await missionRepository.migrate();
  const [launches, launchpads, bookmarks] = await Promise.all([
    missionRepository.getLaunches(),
    missionRepository.getLaunchpads(),
    missionRepository.getBookmarks(),
  ]);
  const padsById = new Map(launchpads.map((pad) => [pad.id, pad]));
  const bookmarksByLaunchId = new Map(bookmarks.map((bookmark) => [bookmark.launchId, bookmark]));
  return launches.map((launch) => ({
    ...launch,
    launchpad: padsById.get(launch.launchpadId),
    bookmark: bookmarksByLaunchId.get(launch.id),
  }));
};

export const useMissionData = () => {
  const setSyncState = useMissionStore((state) => state.setSyncState);

  const query = useQuery({
    queryKey: ['mission-data'],
    queryFn: async () => {
      const result = await syncMissionData(missionRepository);
      setSyncState(result.lastSyncedAt, result.error);
      return loadCachedData();
    },
    placeholderData: (previous) => previous,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15000),
    staleTime: 60_000,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        void query.refetch();
      }
    });
    return unsubscribe;
  }, [query]);

  return query;
};
