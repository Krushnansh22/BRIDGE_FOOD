import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants';

export default function RootLayout() {
  const { isLoading, token, user, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!token) {
      // Not logged in and trying to access app
      if (!inAuthGroup) {
        // use replace to clear navigation stack
        router.replace('/(auth)/login');
      }
    } else if (user) {
      // Logged in
      if (inAuthGroup) {
        if (user.role === 'donor') {
          router.replace('/(donor)');
        } else if (user.role === 'ngo') {
          router.replace('/(ngo)');
        }
      } else if (segments[0] === '(donor)' && user.role !== 'donor') {
        router.replace('/(ngo)');
      } else if (segments[0] === '(ngo)' && user.role !== 'ngo') {
        router.replace('/(donor)');
      }
    }
  }, [token, user, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <Slot />;
}
