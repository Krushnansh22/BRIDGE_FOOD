import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Colors } from '../constants';
import { Ionicons } from '@expo/vector-icons';

interface ListingCardProps {
  listing: any;
  onPress?: () => void;
  showDistance?: boolean;
}

export default function ListingCard({ listing, onPress, showDistance }: ListingCardProps) {
  const isExpired = new Date(listing.expiresAt) < new Date();
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
          <Text style={styles.donorName} numberOfLines={1}>
            <Ionicons name="restaurant-outline" size={14} color={Colors.textSecondary} /> {listing.donorId?.name || 'Local Business'}
          </Text>
        </View>
        <View style={[
          styles.statusBadge, 
          listing.status === 'completed' ? styles.statusCompleted : 
          listing.status === 'reserved' ? styles.statusReserved : 
          isExpired ? styles.statusExpired : styles.statusActive
        ]}>
          <Text style={styles.statusText}>
            {listing.status === 'completed' ? 'Completed' :
             listing.status === 'reserved' ? 'Reserved' :
             isExpired ? 'Expired' : 'Active'}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {isExpired ? 'Expired' : `Expires in ${formatDistanceToNow(new Date(listing.expiresAt))}`}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="pizza-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}> Serves ~{listing.quantity} people</Text>
        </View>
        
        {showDistance && listing.distance !== undefined && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <Text style={[styles.detailText, { color: Colors.primary, fontWeight: '600' }]}>
              {listing.distance.toFixed(1)} km away
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 4,
    maxWidth: 200,
  },
  donorName: {
    fontSize: 14,
    color: Colors.textSecondary,
    maxWidth: 200,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: { backgroundColor: '#dcfce7' },
  statusReserved: { backgroundColor: '#fef3c7' },
  statusCompleted: { backgroundColor: '#f1f5f9' },
  statusExpired: { backgroundColor: '#fee2e2' },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
