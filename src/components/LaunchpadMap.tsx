import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Launchpad } from '../types/spacex';
import { clusterLaunchpads, distanceKm } from '../utils/geo';

type Props = {
  launchpad?: Launchpad;
  launchpads?: Launchpad[];
  mode: 'single' | 'cluster';
};

export const LaunchpadMap = ({ launchpad, launchpads = [], mode }: Props) => {
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    void Location.requestForegroundPermissionsAsync().then(async (permission) => {
      if (permission.status !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setUserLocation(position.coords);
    });
  }, []);

  const markers = useMemo(
    () => (mode === 'single' && launchpad ? [launchpad] : launchpads),
    [launchpad, launchpads, mode],
  );
  const clusters = useMemo(() => clusterLaunchpads(markers, zoom), [markers, zoom]);
  const first = launchpad ?? launchpads[0];

  if (!first) {
    return <Text style={styles.empty}>Launchpad map unavailable until the first sync completes.</Text>;
  }

  const distance =
    launchpad && userLocation
      ? distanceKm(userLocation, { latitude: launchpad.latitude, longitude: launchpad.longitude })
      : null;

  const openDirections = () => {
    if (!launchpad) {
      return;
    }
    const url = `https://maps.apple.com/?daddr=${launchpad.latitude},${launchpad.longitude}`;
    void Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: first.latitude,
          longitude: first.longitude,
          latitudeDelta: mode === 'single' ? 4 : 35,
          longitudeDelta: mode === 'single' ? 4 : 35,
        }}
        showsUserLocation={Boolean(userLocation)}
        onRegionChangeComplete={(region) => setZoom(Math.max(1, Math.round(20 - region.longitudeDelta)))}
      >
        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
            title={
              cluster.launchpads.length > 1
                ? `${cluster.launchpads.length} launchpads`
                : cluster.launchpads[0].name
            }
            description={`${cluster.density} launch attempts`}
            pinColor={cluster.density > 50 ? '#ef4444' : cluster.density > 10 ? '#facc15' : '#2dd4bf'}
          />
        ))}
      </MapView>
      {mode === 'single' ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {distance ? `${distance.toFixed(0)} km from you` : permissionDenied ? 'Location denied' : 'Locating...'}
          </Text>
          <Pressable style={styles.button} onPress={openDirections}>
            <Text style={styles.buttonText}>Directions</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 300, overflow: 'hidden', borderRadius: 8, backgroundColor: '#111827' },
  map: { flex: 1 },
  empty: { color: '#9fb0c8', padding: 16 },
  footer: { position: 'absolute', left: 12, right: 12, bottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { color: '#f8fafc', backgroundColor: '#09111fdd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, overflow: 'hidden' },
  button: { backgroundColor: '#3dd6c6', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  buttonText: { color: '#041014', fontWeight: '700' },
});
