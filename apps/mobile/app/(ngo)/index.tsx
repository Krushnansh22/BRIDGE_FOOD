import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../constants';
import api from '../../services/api';
import ListingCard from '../../components/ListingCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function DiscoveryFeed() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { logout } = useAuthStore();

  const fetchNearbyListings = async () => {
    try {
      // First try to get location
      let lat = 19.0760; // Mumbai default from spec
      let lng = 72.8777;
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      } catch (locErr) {
        console.log('Using default mumbai coords');
      }

      const { data } = await api.get(`/listings/nearby?lat=${lat}&lng=${lng}&radiusKm=20`);
      if (data.success) {
        setListings(data.data);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not load nearby listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNearbyListings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNearbyListings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Food</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : listings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No available listings nearby.</Text>
          <TouchableOpacity 
            style={styles.refreshBtn}
            onPress={onRefresh}
          >
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          renderItem={({ item }) => (
            <ListingCard 
              listing={item} 
              onPress={() => router.push(`/(ngo)/${item._id}`)}
              showDistance={true}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  logoutButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  refreshBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refreshBtnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
