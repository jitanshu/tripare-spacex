import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EnrichedLaunch } from '../types/spacex';

type Props = {
  launch: EnrichedLaunch;
  onPress: () => void;
};

const statusColor = {
  success: '#2dd4bf',
  failure: '#fb7185',
  upcoming: '#facc15',
};

export const LaunchCard = ({ launch, onPress }: Props) => (
  <Pressable onPress={onPress} style={styles.card}>
    <Image
      source={launch.patchSmall ? { uri: launch.patchSmall } : undefined}
      style={styles.patch}
      cachePolicy="disk"
      contentFit="contain"
    />
    <View style={styles.content}>
      <View style={styles.row}>
        <Text numberOfLines={1} style={styles.title}>
          {launch.name}
        </Text>
        <View style={[styles.dot, { backgroundColor: statusColor[launch.status] }]} />
      </View>
      <Text style={styles.meta}>
        Flight {launch.flightNumber} • {new Date(launch.dateUtc).toLocaleDateString()}
      </Text>
      <Text numberOfLines={1} style={styles.meta}>
        {launch.launchpad?.name ?? launch.launchpadId} • {launch.rocket}
      </Text>
    </View>
    {launch.bookmark ? <Text style={styles.bookmark}>★</Text> : null}
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#213047',
    backgroundColor: '#0b1324',
  },
  patch: { width: 52, height: 52 },
  content: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  meta: { color: '#9fb0c8', marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  bookmark: { color: '#facc15', fontSize: 18 },
});
