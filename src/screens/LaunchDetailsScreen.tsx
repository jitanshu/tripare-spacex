import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LaunchpadMap } from '../components/LaunchpadMap';
import { missionRepository } from '../data/database';
import { decryptNote, encryptNote } from '../data/encryption';
import { loadCachedData } from '../hooks/useMissionData';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LaunchDetails'>;
type Tab = 'overview' | 'launchpad' | 'media';

export const LaunchDetailsScreen = ({ route }: Props) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [note, setNote] = useState('');
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ['mission-data-cache'],
    queryFn: loadCachedData,
    staleTime: 60_000,
  });
  const launch = data.find((item) => item.id === route.params.launchId);

  useEffect(() => {
    if (launch?.bookmark) {
      void decryptNote(launch.bookmark.encryptedNote).then(setNote);
    } else {
      void Promise.resolve().then(() => setNote(''));
    }
  }, [launch?.bookmark]);

  if (isLoading || !launch) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#3dd6c6" />
      </View>
    );
  }

  const toggleBookmark = async () => {
    if (launch.bookmark) {
      await missionRepository.deleteBookmark(launch.id);
    } else {
      await missionRepository.upsertBookmark({ launchId: launch.id, encryptedNote: null, updatedAt: new Date().toISOString() });
    }
    await queryClient.invalidateQueries({ queryKey: ['mission-data'] });
    await queryClient.invalidateQueries({ queryKey: ['mission-data-cache'] });
  };

  const saveNote = async () => {
    const encryptedNote = note.trim().length > 0 ? await encryptNote(note) : null;
    await missionRepository.upsertBookmark({ launchId: launch.id, encryptedNote, updatedAt: new Date().toISOString() });
    await queryClient.invalidateQueries({ queryKey: ['mission-data'] });
    await queryClient.invalidateQueries({ queryKey: ['mission-data-cache'] });
  };

  const links = [
    ['Webcast', launch.webcast],
    ['Article', launch.article],
    ['Wikipedia', launch.wikipedia],
  ] as const;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image source={launch.patchLarge ? { uri: launch.patchLarge } : undefined} style={styles.patch} cachePolicy="disk" contentFit="contain" />
        <View style={styles.heroText}>
          <Text style={styles.title}>{launch.name}</Text>
          <Text style={styles.meta}>Flight {launch.flightNumber} • {launch.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.tabs}>
        {(['overview', 'launchpad', 'media'] as const).map((item) => (
          <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}>
            <Text style={styles.tabText}>{item[0].toUpperCase() + item.slice(1)}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'overview' ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Mission</Text>
          <Text style={styles.copy}>{launch.details ?? 'No public mission details are available for this launch.'}</Text>
          <Text style={styles.sectionTitle}>Rocket</Text>
          <Text style={styles.copy}>{launch.rocket}</Text>
          <Text style={styles.sectionTitle}>Payload IDs</Text>
          <Text style={styles.copy}>{launch.payloadIds.length > 0 ? launch.payloadIds.join(', ') : 'No payloads listed'}</Text>
          <Pressable style={styles.primaryButton} onPress={toggleBookmark}>
            <Text style={styles.primaryButtonText}>{launch.bookmark ? 'Remove Bookmark' : 'Bookmark Launch'}</Text>
          </Pressable>
          <Text style={styles.sectionTitle}>Private Note</Text>
          <TextInput value={note} onChangeText={setNote} placeholder="Encrypted bookmark note" placeholderTextColor="#74829a" multiline style={styles.note} />
          <Pressable style={styles.secondaryButton} onPress={saveNote}>
            <Text style={styles.secondaryButtonText}>Save Note</Text>
          </Pressable>
        </View>
      ) : null}

      {tab === 'launchpad' ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>{launch.launchpad?.fullName ?? 'Launchpad'}</Text>
          <Text style={styles.copy}>{launch.launchpad?.details ?? 'Launchpad enrichment has not synced yet.'}</Text>
          <LaunchpadMap mode="single" launchpad={launch.launchpad} />
        </View>
      ) : null}

      {tab === 'media' ? (
        <View style={styles.panel}>
          {links.map(([label, url]) =>
            url ? (
              <Pressable key={label} style={styles.linkButton} onPress={() => Linking.openURL(url)}>
                <Text style={styles.linkText}>{label}</Text>
              </Pressable>
            ) : null,
          )}
          {!launch.webcast && !launch.article && !launch.wikipedia ? <Text style={styles.copy}>No media links are available.</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#09111f' },
  content: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#09111f' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, backgroundColor: '#0b1324' },
  patch: { width: 92, height: 92 },
  heroText: { flex: 1 },
  title: { color: '#f8fafc', fontSize: 26, fontWeight: '900' },
  meta: { color: '#9fb0c8', marginTop: 6 },
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { flex: 1, alignItems: 'center', borderRadius: 8, backgroundColor: '#17233a', paddingVertical: 10 },
  tabActive: { backgroundColor: '#246b73' },
  tabText: { color: '#edf7ff', fontWeight: '800' },
  panel: { padding: 16, gap: 12 },
  sectionTitle: { color: '#7dd3fc', fontWeight: '900', marginTop: 8 },
  copy: { color: '#d5deec', lineHeight: 21 },
  primaryButton: { backgroundColor: '#3dd6c6', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#041014', fontWeight: '900' },
  secondaryButton: { borderWidth: 1, borderColor: '#3dd6c6', borderRadius: 8, padding: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#7dd3fc', fontWeight: '800' },
  note: { minHeight: 96, borderRadius: 8, borderWidth: 1, borderColor: '#25344d', color: '#f8fafc', padding: 12, textAlignVertical: 'top' },
  linkButton: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#213047', paddingVertical: 16 },
  linkText: { color: '#7dd3fc', fontWeight: '800', fontSize: 16 },
});
