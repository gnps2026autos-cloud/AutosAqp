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

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const USERNAME_RE = /^[A-Za-z0-9._-]{7,30}$/;
const PHONE_RE = /^\+[1-9]\d{6,14}$/;

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'La contraseña debe tener mínimo 8 caracteres.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra mayúscula.';
  }

  if (!/\d/.test(password)) {
    return 'La contraseña debe incluir al menos un número.';
  }

  if (!/[^\w\s]/.test(password)) {
    return 'La contraseña debe incluir al menos un carácter especial.';
  }

  return null;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+51');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!USERNAME_RE.test(cleanUsername)) {
      Alert.alert(
        'Usuario inválido',
        'El nombre de usuario debe tener entre 7 y 30 caracteres. Puede incluir letras, números, punto, guion y guion bajo.'
      );
      return;
    }

    if (!EMAIL_RE.test(cleanEmail)) {
      Alert.alert('Correo inválido', 'Ingresa un correo válido con @.');
      return;
    }

    if (!PHONE_RE.test(cleanPhone)) {
      Alert.alert(
        'Teléfono inválido',
        'Ingresa el teléfono en formato internacional. Ejemplo: +51987654321'
      );
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Contraseña inválida', passwordError);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Contraseñas diferentes', 'Las contraseñas ingresadas no coinciden.');
      return;
    }

    try {
      setLoading(true);

      await register({
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        confirm_password: confirmPassword,
      });

      Alert.alert(
        'Registro exitoso',
        'Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.',
        [
          {
            text: 'Iniciar sesión',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        'No se pudo registrar el usuario.';

      Alert.alert('Error de registro', detail);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace('/(auth)/login');
  };

  const passwordHintColor = (valid: boolean) => (valid ? '#16A34A' : '#6B7280');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add-outline" size={56} color={COLORS_THEME.primary} />
            </View>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.description}>Regístrate para publicar y guardar vehículos</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Ej.: Giova_2026"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.helperText}>
                Mínimo 7 caracteres. Puedes usar letras, números, punto, guion y guion bajo.
              </Text>
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
              <Text style={styles.label}>Teléfono con código de país</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+51987654321"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>Ejemplo Perú: +51987654321</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Crea una contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordRules}>
                <Text style={[styles.ruleText, { color: passwordHintColor(password.length >= 8) }]}>
                  • Mínimo 8 caracteres
                </Text>
                <Text style={[styles.ruleText, { color: passwordHintColor(/[A-Z]/.test(password)) }]}>
                  • Una mayúscula
                </Text>
                <Text style={[styles.ruleText, { color: passwordHintColor(/\d/.test(password)) }]}>
                  • Un número
                </Text>
                <Text style={[styles.ruleText, { color: passwordHintColor(/[^\w\s]/.test(password)) }]}>
                  • Un carácter especial
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="person-add-outline" size={24} color="#fff" />
              )}
              <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrarme'}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={goToLogin} disabled={loading}>
                <Text style={styles.loginLink}> Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 22,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS_THEME.primary,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS_THEME.primary,
  },
  description: {
    fontSize: 15,
    color: COLORS_THEME.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
  helperText: {
    fontSize: 12,
    color: COLORS_THEME.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS_THEME.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  passwordRules: {
    marginTop: 8,
    gap: 3,
  },
  ruleText: {
    fontSize: 12,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS_THEME.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginText: {
    fontSize: 14,
    color: COLORS_THEME.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS_THEME.primary,
  },
});
