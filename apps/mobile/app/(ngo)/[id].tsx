import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function NgoListingDetail() {
  const { id } = useLocalSearchParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchDetail = async () => {
    try {
      const { data } = await api.get(`/listings/${id}`);
      if (data.success) {
        setListing(data.data);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load details');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDetail();
  };

  const handleRequestPickup = async () => {
    setRequesting(true);
    try {
      const { data } = await api.post('/requests', { listingId: id });
      if (data.success) {
        Alert.alert('Success', 'Pickup requested successfully!', [
          { text: 'OK', onPress: () => router.push('/(ngo)/requests') }
        ]);
      } else {
        Alert.alert('Error', data.error?.message || 'Failed to request pickup');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.message || 'Failed to request pickup');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!listing) return null;

  const isAvailable = listing.status === 'active' && new Date(listing.expiresAt) > new Date();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{listing.title}</Text>
        
        <View style={styles.donorInfo}>
          <Text style={styles.donorName}>🏢 {listing.donorId?.name || 'Local Business'}</Text>
          <Text style={styles.donorAddress}>📍 {listing.address}</Text>
        </View>

        <View style={styles.tagsRow}>
          <Text style={styles.tag}>{listing.category}</Text>
          <Text style={styles.tag}>Qty: {listing.quantity}</Text>
          <Text style={[styles.tag, isAvailable ? styles.tagActive : styles.tagExpired]}>
            {isAvailable 
              ? `Expires in ${formatDistanceToNow(new Date(listing.expiresAt))}`
              : 'Expired/Reserved'
            }
          </Text>
        </View>

        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.description}>{listing.description || 'No additional details provided.'}</Text>
        </View>

      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[
            styles.requestBtn, 
            (!isAvailable || requesting) && styles.requestBtnDisabled
          ]}
          onPress={handleRequestPickup}
          disabled={!isAvailable || requesting}
        >
          {requesting ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.requestBtnText}>
              {isAvailable ? '📬 Request Pickup' : 'No Longer Available'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  card: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  donorInfo: {
    marginBottom: 16,
    gap: 8,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  donorAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
  },
  tagActive: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  tagExpired: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  descSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  actionSection: {
    padding: 24,
  },
  requestBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  requestBtnDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  requestBtnText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
