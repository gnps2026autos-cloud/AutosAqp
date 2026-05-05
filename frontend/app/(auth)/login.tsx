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
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS_THEME } from '../../src/constants';

// CRÍTICO: Necesario para cerrar el browser en Android al recibir el redirect
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      if (Platform.OS === 'web') {
        // === WEB ===
        const redirectUrl = `${window.location.origin}/(auth)/auth-callback`;
        const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
        await WebBrowser.openBrowserAsync(authUrl);
      } else {
        // === ANDROID / iOS NATIVO ===
        // Usar esquema personalizado: aqpautos://auth-callback
        // Cuando auth.emergentagent.com redirige a este URL,
        // Android intercepta el custom scheme y devuelve control a la app
        const redirectUrl = Linking.createURL('auth-callback');

        const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

        // openAuthSessionAsync abre Chrome Custom Tab
        // Detecta cuando el browser intenta navegar a una URL que empieza con redirectUrl
        // En ese momento cierra el browser y devuelve la URL completa
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

        if (result.type === 'success' && result.url) {
          // La URL viene como: aqpautos://auth-callback#session_id=xxx
          // o: aqpautos://auth-callback?session_id=xxx
          const sessionId = extractSessionId(result.url);

          if (sessionId) {
            // Login directo - no navegar a auth-callback
            try {
              await login(sessionId);
              router.replace('/(tabs)/home');
              return;
            } catch (loginError: any) {
              const errorMsg = loginError?.response?.data?.detail || 
                             loginError?.message || 
                             'Error desconocido al conectar con el servidor';
              Alert.alert(
                'Error de servidor',
                `No se pudo conectar con el servidor:\n${errorMsg}\n\nVerifica tu conexión a internet.`
              );
            }
          } else {
            Alert.alert(
              'Error de autenticación',
              `No se encontró el token de sesión en la respuesta.\n\nURL recibida: ${result.url.substring(0, 100)}`
            );
          }
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
          // Usuario cerró el browser manualmente - no mostrar error
        } else {
          Alert.alert(
            'Sesión no completada',
            `Tipo de resultado: ${result.type}\n\nIntenta de nuevo.`
          );
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorDetail = error?.message || error?.toString() || 'Error desconocido';
      Alert.alert(
        'Error de conexión',
        `Detalle: ${errorDetail}\n\nVerifica tu conexión a internet e intenta de nuevo.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Extraer session_id de la URL de retorno
  const extractSessionId = (url: string): string | null => {
    try {
      // Regex universal: busca session_id= en cualquier parte de la URL
      const match = url.match(/session_id=([^&#\s]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
      return null;
    } catch (e) {
      return null;
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
