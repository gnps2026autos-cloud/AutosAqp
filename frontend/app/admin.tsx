import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminAPI } from '../src/utils/api';
import { COLORS_THEME } from '../src/constants';

interface PaymentItem {
  payment_id: string;
  vehicle_id: string;
  user_id: string;
  tipo_pago: string;
  monto: number;
  numero_operacion: string;
  estado: string;
  placa: string;
  marca_modelo: string;
  created_at: string;
  verificado_at?: string;
}

export default function AdminScreen() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [total, setTotal] = useState(0);

  const handleLogin = async () => {
    if (!pinInput.trim()) {
      Alert.alert('Error', 'Ingresa el PIN de administrador');
      return;
    }
    try {
      await adminAPI.login(pinInput.trim());
      setPin(pinInput.trim());
      setAuthenticated(true);
      loadPayments(pinInput.trim());
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'PIN incorrecto');
    }
  };

  const loadPayments = async (adminPin?: string) => {
    try {
      setLoading(true);
      const currentPin = adminPin || pin;
      const result = await adminAPI.getPayments(currentPin, filterEstado || undefined);
      setPayments(result.payments || []);
      setTotal(result.total || 0);
    } catch (error: any) {
      console.error('Error loading payments:', error);
      if (error.response?.status === 403) {
        setAuthenticated(false);
        Alert.alert('Error', 'Sesión expirada, ingresa el PIN nuevamente');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  useEffect(() => {
    if (authenticated) {
      loadPayments();
    }
  }, [filterEstado]);

  const handleVerify = (paymentId: string, estado: string) => {
    const action = estado === 'verificado' ? 'verificar' : 'rechazar';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} pago`,
      `¿Estás seguro de que deseas ${action} este pago?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: estado === 'rechazado' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await adminAPI.verifyPayment(pin, paymentId, estado);
              Alert.alert('Éxito', `Pago ${estado} correctamente`);
              loadPayments();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'No se pudo actualizar');
            }
          },
        },
      ]
    );
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '#FF9800';
      case 'verificado': return '#4CAF50';
      case 'rechazado': return '#F44336';
      default: return '#666';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'verificado': return 'Verificado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  const getTipoPagoLabel = (tipo: string) => {
    switch (tipo) {
      case 'destacado_10d': return 'Destacado 10 días';
      case 'priorizado_5d_7d': return 'Priorizado 5d + 7d';
      default: return tipo;
    }
  };

  const renderPaymentCard = ({ item }: { item: PaymentItem }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
          <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
            {getEstadoLabel(item.estado)}
          </Text>
        </View>
        <Text style={styles.paymentDate}>
          {new Date(item.created_at).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View style={styles.paymentBody}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Vehículo:</Text>
          <Text style={styles.paymentValue}>{item.marca_modelo || 'N/A'}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Placa:</Text>
          <Text style={styles.paymentValueBold}>{item.placa || 'N/A'}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Plan:</Text>
          <Text style={styles.paymentValue}>{getTipoPagoLabel(item.tipo_pago)}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Monto:</Text>
          <Text style={styles.paymentAmount}>S/ {item.monto.toFixed(2)}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>N° Operación:</Text>
          <Text style={styles.paymentOperacion}>{item.numero_operacion}</Text>
        </View>
      </View>

      {item.estado === 'pendiente' && (
        <View style={styles.paymentActions}>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => handleVerify(item.payment_id, 'verificado')}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.verifyButtonText}>Verificar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleVerify(item.payment_id, 'rechazado')}
          >
            <Ionicons name="close-circle" size={18} color="#fff" />
            <Text style={styles.rejectButtonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Login Screen
  if (!authenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginHeader}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.loginTitle}>Panel de Administración</Text>
        </View>
        <View style={styles.loginContainer}>
          <View style={styles.lockIcon}>
            <Ionicons name="shield-checkmark" size={64} color={COLORS_THEME.primary} />
          </View>
          <Text style={styles.loginSubtitle}>Ingresa tu PIN de administrador</Text>
          <TextInput
            style={styles.pinInput}
            placeholder="PIN"
            value={pinInput}
            onChangeText={setPinInput}
            secureTextEntry
            keyboardType="numeric"
            maxLength={10}
            textAlign="center"
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Ionicons name="log-in" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>Acceder</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Verificación de Pagos</Text>
            <Text style={styles.headerSubtitle}>{total} pagos registrados</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: '', label: 'Todos' },
          { key: 'pendiente', label: 'Pendientes' },
          { key: 'verificado', label: 'Verificados' },
          { key: 'rechazado', label: 'Rechazados' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              filterEstado === f.key && styles.filterTabActive,
            ]}
            onPress={() => setFilterEstado(f.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterEstado === f.key && styles.filterTabTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Payments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS_THEME.primary} />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentCard}
          keyExtractor={(item) => item.payment_id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hay pagos registrados</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Login
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  lockIcon: {
    marginBottom: 24,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  pinInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS_THEME.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    width: 200,
    marginBottom: 24,
    letterSpacing: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS_THEME.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  // Main
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  filterTabActive: {
    backgroundColor: COLORS_THEME.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  paymentDate: {
    fontSize: 12,
    color: '#999',
  },
  paymentBody: {
    padding: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  paymentValueBold: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '700',
    letterSpacing: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS_THEME.secondary,
  },
  paymentOperacion: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS_THEME.primary,
    letterSpacing: 1,
  },
  paymentActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    gap: 6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    gap: 6,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
