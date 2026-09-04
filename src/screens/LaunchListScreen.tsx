import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { FilterBar } from '../components/FilterBar';
import { LaunchCard } from '../components/LaunchCard';
import { SyncBanner } from '../components/SyncBanner';
import { RootStackParamList } from '../navigation/types';
import { useMissionStore } from '../state/missionStore';
import { EnrichedLaunch } from '../types/spacex';
import { filterAndSortLaunches, groupLaunchesByMonth } from '../utils/filters';
import { useMissionData } from '../hooks/useMissionData';

type Row = { type: 'header'; id: string; title: string } | { type: 'launch'; id: string; launch: EnrichedLaunch };

export const LaunchListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data = [], isLoading, isRefetching, refetch } = useMissionData();
  const filters = useMissionStore((state) => state.filters);
  const rockets = useMemo(
    () => Array.from(new Set(data.map((launch) => launch.rocket))).map((rocket) => ({ id: rocket, label: rocket })),
    [data],
  );
  const launchpads = useMemo(
    () =>
      Array.from(
        new Map(
          data.map((launch) => [
            launch.launchpadId,
            { id: launch.launchpadId, label: launch.launchpad?.name ?? launch.launchpadId },
          ]),
        ).values(),
      ),
    [data],
  );
  const rows = useMemo<Row[]>(() => {
    const filtered = filterAndSortLaunches(data, filters);
    return groupLaunchesByMonth(filtered).flatMap((section) => [
      { type: 'header' as const, id: section.title, title: section.title },
      ...section.data.map((launch) => ({ type: 'launch' as const, id: launch.id, launch })),
    ]);
  }, [data, filters]);
  const stickyHeaderIndices = rows
    .map((row, index) => (row.type === 'header' ? index : -1))
    .filter((index) => index >= 0);

  return (
    <View style={styles.screen}>
      <SyncBanner />
      <FilterBar rockets={rockets} launchpads={launchpads} />
      {isLoading && data.length === 0 ? <ActivityIndicator style={styles.loader} color="#3dd6c6" /> : null}
      <FlashList
        data={rows}
        keyExtractor={(item) => item.id}
        stickyHeaderIndices={stickyHeaderIndices}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#3dd6c6" />}
        renderItem={({ item }) =>
          item.type === 'header' ? (
            <Text style={styles.header}>{item.title}</Text>
          ) : (
            <LaunchCard launch={item.launch} onPress={() => navigation.navigate('LaunchDetails', { launchId: item.launch.id })} />
          )
        }
        ListEmptyComponent={<Text style={styles.empty}>No launches match these filters.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#09111f' },
  loader: { marginTop: 40 },
  header: { color: '#7dd3fc', backgroundColor: '#09111f', paddingHorizontal: 16, paddingVertical: 8, fontWeight: '800' },
  empty: { color: '#9fb0c8', padding: 24, textAlign: 'center' },
});
