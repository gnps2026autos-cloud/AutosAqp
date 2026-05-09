import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigationContainerRef } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState('Procesando autenticación...');

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Esperar un momento para que el layout se monte completamente
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get session_id from URL (could be in hash or query params)
        let sessionId = params.session_id as string;
        
        // If not in params, check window location hash (for web only)
        if (!sessionId && Platform.OS === 'web' && typeof window !== 'undefined') {
          const hash = window.location.hash;
          const match = hash.match(/session_id=([^&]+)/);
          if (match) {
            sessionId = match[1];
          }
        }

        if (!sessionId) {
          setStatus('No se encontró el token de sesión');
          // Esperar antes de redirigir para no causar error de navegación
          await new Promise(resolve => setTimeout(resolve, 1000));
          router.replace('/(auth)/login');
          return;
        }

        setStatus('Conectando con el servidor...');

        // Exchange session_id for user data
        await login(sessionId);
        
        setStatus('¡Sesión iniciada!');
        
        // Navigate to home
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('Error al iniciar sesión. Redirigiendo...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.replace('/(auth)/login');
      }
    };

    processAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
