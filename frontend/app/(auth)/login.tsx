import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { COLORS_THEME } from '../../src/constants';

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      let redirectUrl: string;

      if (Platform.OS === 'web') {
        // Web: usar window.location.origin
        redirectUrl = `${window.location.origin}/(auth)/auth-callback`;
        const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
        await WebBrowser.openBrowserAsync(authUrl);
      } else {
        // Native (Android/iOS): usar deep link del esquema de la app
        redirectUrl = Linking.createURL('(auth)/auth-callback');
        const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
        
        // openAuthSessionAsync maneja el redirect de vuelta a la app
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          // Extraer session_id de la URL de retorno
          const parsed = Linking.parse(result.url);
          const sessionId = parsed.queryParams?.session_id as string;
          
          if (sessionId) {
            router.replace({
              pathname: '/(auth)/auth-callback',
              params: { session_id: sessionId },
            });
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión. Intenta de nuevo.');
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
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={24} color="#fff" />
            <Text style={styles.buttonText}>Continuar con Google</Text>
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