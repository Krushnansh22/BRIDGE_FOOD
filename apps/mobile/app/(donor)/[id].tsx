import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

export default function ListingDetail() {
  const { id } = useLocalSearchParams();
  const [listing, setListing] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [listingRes, requestsRes] = await Promise.all([
        api.get(`/listings/${id}`),
        // Normally requests for a listing might be fetched as a separate endpoint or populated in listing. 
        // For standard apps, it might return all requests, then we filter. 
        // We will invoke the endpoint to fetch my listings requests if possible, or all requests. 
        // Let's assume there is an endpoint or we just filter from `/requests/my`. 
        // Wait, the API spec says '/requests/my' gets my requests, but for Donor, how do they get incoming?
        // Actually, maybe listing object populates requests natively, or they are in the listing detail.
        api.get('/requests/my'), // we'll filter this based on listingId
      ]);
      
      if (listingRes.data.success) {
        setListing(listingRes.data.data);
      }
      
      if (requestsRes.data.success) {
        // Filter requests for this listing
        // Note: in a real server, an explicit endpoint like GET /listings/:id/requests is better.
        // We will fallback to filtering
        const incoming = requestsRes.data.data.filter((req: any) => req.listing === id || req.listing?._id === id);
        setRequests(incoming);
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
      fetchData();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handeRequestStatus = async (reqId: string, action: 'approve' | 'reject') => {
    try {
      const { data } = await api.patch(`/requests/${reqId}/${action}`);
      if (data.success) {
        Alert.alert('Success', `Request ${action}d successfully`);
        fetchData();
      } else {
        Alert.alert('Error', data.error?.message || 'Failed to update request');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to update request');
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

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{listing.title}</Text>
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>{listing.category}</Text>
          <Text style={styles.tag}>Qty: {listing.quantity}</Text>
          <Text style={[styles.tag, { backgroundColor: '#fee2e2', color: '#dc2626' }]}>
            Expires: {formatDistanceToNow(new Date(listing.expiresAt))}
          </Text>
        </View>
        <Text style={styles.description}>{listing.description || 'No description provided.'}</Text>
        <Text style={styles.address}>📍 {listing.address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Incoming Requests ({requests.length})</Text>
        
        {requests.length === 0 ? (
          <View style={styles.emptyRequests}>
            <Text style={styles.emptyText}>No requests yet.</Text>
          </View>
        ) : (
          requests.map(req => (
            <View key={req._id} style={styles.requestCard}>
              <View style={styles.reqHeader}>
                <Text style={styles.reqName}>{req.ngoId?.name || 'Local NGO'}</Text>
                <Text style={styles.reqStatus}>[{req.status.toUpperCase()}]</Text>
              </View>
              {req.status === 'pending' && (
                <View style={styles.reqActions}>
                  <TouchableOpacity 
                    style={[styles.btn, styles.rejectBtn]}
                    onPress={() => handeRequestStatus(req._id, 'reject')}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btn, styles.approveBtn]}
                    onPress={() => handeRequestStatus(req._id, 'approve')}
                  >
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  address: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyRequests: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  requestCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reqName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  reqStatus: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  reqActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  rejectBtn: {
    borderColor: Colors.error,
    backgroundColor: Colors.surface,
  },
  rejectText: {
    color: Colors.error,
    fontWeight: '600',
  },
  approveBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  approveText: {
    color: Colors.surface,
    fontWeight: '600',
  },
});
