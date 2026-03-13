import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors } from '../../constants';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

export default function MyRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests/my');
      if (data.success) {
        setRequests(data.data);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAction = async (reqId: string, action: 'collect' | 'cancel') => {
    try {
      const { data } = await api.patch(`/requests/${reqId}/${action}`);
      if (data.success) {
        Alert.alert('Success', `Request ${action}ed successfully`);
        fetchRequests();
      } else {
        Alert.alert('Error', data.error?.message || 'Action failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.message || 'Action failed');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isApproved = item.status === 'approved';
    const isPending = item.status === 'pending';

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.listing?.title || 'Food Listing'}</Text>
          <View style={[
            styles.statusBadge, 
            item.status === 'approved' ? styles.statusApproved : 
            item.status === 'rejected' ? styles.statusRejected :
            item.status === 'collected' ? styles.statusCollected :
            item.status === 'cancelled' ? styles.statusCancelled :
            styles.statusPending
          ]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.detailText}>
            📍 {item.listing?.address || 'Address hidden'}
          </Text>
          <Text style={styles.detailText}>
            ⏳ Requested {formatDistanceToNow(new Date(item.createdAt))} ago
          </Text>
        </View>

        <View style={styles.actions}>
          {isPending && (
            <TouchableOpacity 
              style={[styles.btn, styles.cancelBtn]}
              onPress={() => handleAction(item._id, 'cancel')}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {isApproved && (
            <TouchableOpacity 
              style={[styles.btn, styles.collectBtn]}
              onPress={() => handleAction(item._id, 'collect')}
            >
              <Text style={styles.collectBtnText}>Mark as Collected</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="mail-open-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>You haven't requested any pickups.</Text>
          <TouchableOpacity 
            style={styles.browseBtn}
            onPress={() => router.push('/(ngo)/')}
          >
            <Text style={styles.browseBtnText}>Browse Nearby</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          renderItem={renderItem}
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
  browseBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: { backgroundColor: '#fef3c7' },
  statusApproved: { backgroundColor: '#d1fae5' },
  statusCollected: { backgroundColor: '#f1f5f9' },
  statusRejected: { backgroundColor: '#fee2e2' },
  statusCancelled: { backgroundColor: '#f3f4f6' },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  details: {
    gap: 8,
    marginBottom: 16,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtn: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cancelBtnText: {
    color: Colors.text,
    fontWeight: '600',
  },
  collectBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  collectBtnText: {
    color: Colors.surface,
    fontWeight: '600',
  },
});
