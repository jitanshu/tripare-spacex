import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LaunchpadMap } from '../components/LaunchpadMap';
import { SyncBanner } from '../components/SyncBanner';
import { useMissionData } from '../hooks/useMissionData';

export const LaunchpadsScreen = () => {
  const { data = [] } = useMissionData();
  const launchpads = useMemo(
    () => Array.from(new Map(data.flatMap((launch) => (launch.launchpad ? [[launch.launchpad.id, launch.launchpad]] : []))).values()),
    [data],
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SyncBanner />
      <Text style={styles.title}>Launchpad Density</Text>
      <LaunchpadMap mode="cluster" launchpads={launchpads} />
      {launchpads.map((pad) => (
        <View key={pad.id} style={styles.row}>
          <Text style={styles.name}>{pad.fullName}</Text>
          <Text style={styles.meta}>{pad.launchAttempts} attempts • {pad.launchSuccesses} successes</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#09111f' },
  content: { paddingBottom: 32 },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '800', padding: 16 },
  row: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#213047' },
  name: { color: '#f8fafc', fontWeight: '800' },
  meta: { color: '#9fb0c8', marginTop: 4 },
});
