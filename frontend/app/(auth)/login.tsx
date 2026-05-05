import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS_THEME } from '../../src/constants';

// Necesario para que openAuthSessionAsync funcione correctamente en Android
WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://carsell-regional.preview.emergentagent.com';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // SIEMPRE usar la URL HTTPS del backend como redirect
      // El auth server solo redirige a URLs HTTPS, no a esquemas custom
      const redirectUrl = `${BACKEND_URL}/(auth)/auth-callback`;
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

      if (Platform.OS === 'web') {
        // Web: abrir normalmente, el browser maneja el redirect
        await WebBrowser.openBrowserAsync(authUrl);
      } else {
        // Native (Android/iOS): usar openAuthSessionAsync
        // Esto abre el browser y detecta cuando navega a la URL de redirect
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUrl  // Prefix para detectar el redirect
        );

        if (result.type === 'success' && result.url) {
          // Extraer session_id de la URL retornada
          const sessionId = extractSessionId(result.url);
          
          if (sessionId) {
            // Hacer login directamente con el session_id
            await login(sessionId);
            router.replace('/(tabs)/home');
            return;
          }
        }
        
        // Si no se obtuvo session_id, puede ser que el usuario canceló
        if (result.type === 'cancel' || result.type === 'dismiss') {
          console.log('Login cancelado por el usuario');
        } else {
          Alert.alert('Error', 'No se pudo completar el inicio de sesión. Intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error de conexión', 'Verifica tu conexión a internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Extraer session_id de la URL (puede estar en hash o query params)
  const extractSessionId = (url: string): string | null => {
    try {
      // Buscar en hash fragment: ...#session_id=abc123
      const hashMatch = url.match(/[#&?]session_id=([^&]+)/);
      if (hashMatch) return hashMatch[1];

      // Buscar en query params: ...?session_id=abc123
      const urlObj = new URL(url);
      const sessionId = urlObj.searchParams.get('session_id');
      if (sessionId) return sessionId;

      // Buscar en el hash como query string: ...#session_id=abc123&other=...
      if (urlObj.hash) {
        const hashParams = new URLSearchParams(urlObj.hash.substring(1));
        const hashSessionId = hashParams.get('session_id');
        if (hashSessionId) return hashSessionId;
      }

      return null;
    } catch (e) {
      // Fallback: regex simple
      const match = url.match(/session_id=([^&#]+)/);
      return match ? match[1] : null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="car-sport" size={64} color={COLORS_THEME.primary} />
          </View>
          <Text style={styles.title}>AQP-Autos</Text>
          <Text style={styles.subtitle}>by GNPS</Text>
          <Text style={styles.description}>Compra y vende vehículos en Arequipa</Text>
        </View>

        {/* Login Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.googleButtonDisabled]}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="logo-google" size={24} color="#fff" />
            )}
            <Text style={styles.buttonText}>
              {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Al continuar, aceptas nuestros términos y condiciones
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_THEME.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: COLORS_THEME.primary,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS_THEME.primary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 20,
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
  buttonContainer: {
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS_THEME.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: COLORS_THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});