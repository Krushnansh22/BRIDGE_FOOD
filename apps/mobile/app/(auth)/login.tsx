import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    try {
      await login(email, password);
      // navigation handled by _layout.tsx based on user state
    } catch (e) {
      // error is handled by store
      Alert.alert('Login Failed', error || 'Invalid credentials');
    }
  };

  const demoLogin = (role: 'donor' | 'ngo' | 'admin') => {
    setEmail(
      role === 'donor' ? 'donor@foodbridge.app' : 
      role === 'ngo' ? 'ngo@foodbridge.app' : 
      'admin@foodbridge.app'
    );
    setPassword('password123');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to FoodBridge</Text>
        <Text style={styles.subtitle}>Connecting surplus food with those in need</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Quick Demo Login</Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity style={styles.demoButton} onPress={() => demoLogin('donor')}>
              <Text style={styles.demoButtonText}>Donor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoButton} onPress={() => demoLogin('ngo')}>
              <Text style={styles.demoButtonText}>NGO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoButton} onPress={() => demoLogin('admin')}>
              <Text style={styles.demoButtonText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  demoButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  demoButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
