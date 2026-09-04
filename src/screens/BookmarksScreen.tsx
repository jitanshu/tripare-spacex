import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LaunchCard } from '../components/LaunchCard';
import { SyncBanner } from '../components/SyncBanner';
import { useMissionData } from '../hooks/useMissionData';
import { RootStackParamList } from '../navigation/types';

export const BookmarksScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data = [] } = useMissionData();
  const bookmarks = useMemo(() => data.filter((launch) => launch.bookmark), [data]);
  return (
    <View style={styles.screen}>
      <SyncBanner />
      <FlashList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LaunchCard launch={item} onPress={() => navigation.navigate('LaunchDetails', { launchId: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Bookmarked launches will appear here.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#09111f' },
  empty: { color: '#9fb0c8', padding: 24, textAlign: 'center' },
});
