import { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../constants';
import api from '../../services/api';

export default function NGO_Map() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 19.0760,
    longitude: 72.8777,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const router = useRouter();

  const fetchMapListings = async () => {
    try {
      let lat = region.latitude;
      let lng = region.longitude;
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
          setRegion(prev => ({ ...prev, latitude: lat, longitude: lng }));
        }
      } catch (locErr) {}

      const { data } = await api.get(`/listings/nearby?lat=${lat}&lng=${lng}&radiusKm=20`);
      if (data.success) {
        setListings(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMapListings();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        {listings.map((listing) => {
          if (!listing.location?.coordinates) return null;
          const [lng, lat] = listing.location.coordinates;
          return (
            <Marker
              key={listing._id}
              coordinate={{ latitude: lat, longitude: lng }}
              pinColor={Colors.primary}
            >
              <Callout onPress={() => router.push(`/(ngo)/${listing._id}`)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{listing.title}</Text>
                  <Text style={styles.calloutText}>{listing.quantity} servings</Text>
                  <Text style={styles.calloutLink}>Tap to view</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  callout: {
    padding: 8,
    minWidth: 120,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutText: {
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  calloutLink: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
