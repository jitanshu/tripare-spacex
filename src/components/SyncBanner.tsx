import { StyleSheet, Text, View } from 'react-native';
import { useMissionStore } from '../state/missionStore';
import { lastSyncedLabel } from '../utils/time';

export const SyncBanner = () => {
  const { lastSyncedAt, syncError } = useMissionStore();
  return (
    <View style={[styles.container, syncError ? styles.warning : styles.ok]}>
      <Text style={styles.text}>{lastSyncedLabel(lastSyncedAt)}</Text>
      {syncError ? <Text style={styles.error}>{syncError}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 10 },
  ok: { backgroundColor: '#0e2a31' },
  warning: { backgroundColor: '#392b13' },
  text: { color: '#d7fbff', fontWeight: '700' },
  error: { color: '#ffe8b5', marginTop: 2 },
});
