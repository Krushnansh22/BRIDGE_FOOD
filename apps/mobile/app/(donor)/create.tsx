import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../constants';
import api from '../../services/api';

export default function CreateListing() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('cooked'); // 'cooked', 'raw', 'packaged'
  const [pickupAddress, setPickupAddress] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const router = useRouter();

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use your current location.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      Alert.alert('Location Added', 'Your current location will be used for pickup.');
    } catch (error) {
      Alert.alert('Error', 'Failed to get location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !quantity || !pickupAddress) {
      Alert.alert('Missing Fields', 'Please fill all required fields');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Please provide a pickup location, e.g. using Use My Current Location');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you'd calculate expiresAt based on a shelf-life engine.
      // We will set manually to +3 hours.
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 3);

      const { data } = await api.post('/listings', {
        title,
        description,
        quantity: parseInt(quantity, 10),
        category,
        location: {
          type: 'Point',
          coordinates: [location.coords.longitude, location.coords.latitude],
        },
        address: pickupAddress,
        expiresAt: expiresAt.toISOString(),
      });

      if (data.success) {
        Alert.alert('Success', 'Food listed successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', data.error?.message || 'Failed to create listing');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 10 Loaves of Bread, Veg Biryani"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any special storage instructions?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Quantity (servings) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Text style={styles.label}>Category Type (Optional)</Text>
        <View style={styles.categoryRow}>
          {['cooked', 'raw', 'packaged'].map(cat => (
            <TouchableOpacity 
              key={cat}
              style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Pickup Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full address"
          value={pickupAddress}
          onChangeText={setPickupAddress}
        />

        <TouchableOpacity 
          style={styles.locationBtn}
          onPress={handleGetLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator color={Colors.primary} size="small" />
          ) : (
            <Text style={styles.locationBtnText}>
              {location ? '📍 Location Acquired' : '📍 Use My Current Location'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.submitText}>Submit Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  categoryBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.surface,
  },
  locationBtn: {
    marginVertical: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#dcfce7',
  },
  locationBtnText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
