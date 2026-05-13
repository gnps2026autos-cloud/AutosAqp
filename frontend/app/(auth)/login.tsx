import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS_THEME } from '../../src/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { loginDemo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleLocalLogin = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      Alert.alert('Dato requerido', 'Ingresa tu nombre para continuar.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      Alert.alert('Correo inválido', 'Ingresa un correo válido.');
      return;
    }

    try {
      setLoading(true);
      await loginDemo({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
      });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error?.message || 'No se pudo iniciar sesión.';
      Alert.alert(
        'Error de inicio de sesión',
        `${detail}\n\nVerifica que el backend esté encendido y que la URL del frontend apunte a la IP correcta.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="car-sport" size={64} color={COLORS_THEME.primary} />
            </View>
            <Text style={styles.title}>AQP-Autos</Text>
            <Text style={styles.subtitle}>by GNPS</Text>
            <Text style={styles.description}>Compra y vende vehículos en Arequipa</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Iniciar sesión</Text>
            <Text style={styles.formSubtitle}>
              Esta versión usa inicio de sesión local para APK, sin depender de Emergent Auth.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej.: Giova"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>WhatsApp / teléfono</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Ej.: 938567871"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLocalLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="log-in-outline" size={24} color="#fff" />
              )}
              <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Entrar a la app'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_THEME.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: COLORS_THEME.primary,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS_THEME.primary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 19,
    fontWeight: '600',
    color: COLORS_THEME.secondary,
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    color: COLORS_THEME.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS_THEME.textPrimary,
  },
  formSubtitle: {
    fontSize: 13,
    color: COLORS_THEME.textSecondary,
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS_THEME.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS_THEME.textPrimary,
    backgroundColor: '#F9FAFB',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS_THEME.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
