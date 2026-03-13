import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants';
import api from '../../services/api';
import ListingCard from '../../components/ListingCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function DonorDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { logout } = useAuthStore();

  const fetchListings = async () => {
    try {
      const { data } = await api.get('/listings/my');
      if (data.success) {
        setListings(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Listings</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : listings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="fast-food-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>You haven't created any listings yet.</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(donor)/create')}
          >
            <Text style={styles.addButtonText}>Donate Food</Text>
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
              onPress={() => router.push(`/(donor)/${item._id}`)}
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
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
