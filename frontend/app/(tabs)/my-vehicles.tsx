import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Vehicle } from '../../src/types';
import { vehiclesAPI, paymentsAPI } from '../../src/utils/api';
import { formatPrice, formatKm } from '../../src/utils/imageHelper';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS_THEME } from '../../src/constants';

export default function MyVehiclesScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'pay' | 'confirm'>('select');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesAPI.getMyVehicles(sessionToken || undefined);
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  };

  const handleDelete = (vehicleId: string) => {
    Alert.alert(
      'Eliminar vehículo',
      '¿Estás seguro de que deseas eliminar este vehículo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await vehiclesAPI.delete(vehicleId, sessionToken || undefined);
              Alert.alert('Éxito', 'Vehículo eliminado correctamente');
              loadVehicles();
            } catch (error) {
              console.error('Error deleting vehicle:', error);
              Alert.alert('Error', 'No se pudo eliminar el vehículo');
            }
          },
        },
      ]
    );
  };

  const openPaymentModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedPlan('');
    setNumeroOperacion('');
    setPaymentStep('select');
    setShowPaymentModal(true);
  };

  const handleCopyNumber = async () => {
    try {
      await Clipboard.setStringAsync('938567871');
      Alert.alert('Copiado', 'Número de Yape copiado al portapapeles');
    } catch {
      Alert.alert('Info', 'Número Yape: 938567871');
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedVehicle || !selectedPlan || !numeroOperacion.trim()) {
      Alert.alert('Error', 'Por favor ingresa el número de operación Yape');
      return;
    }

    if (numeroOperacion.trim().length < 3) {
      Alert.alert('Error', 'El número de operación debe tener al menos 3 caracteres');
      return;
    }

    try {
      setSubmittingPayment(true);
      const result = await paymentsAPI.promote(
        selectedVehicle.vehicle_id,
        selectedPlan,
        numeroOperacion.trim(),
        sessionToken || undefined
      );

      setShowPaymentModal(false);
      Alert.alert(
        '¡Pago Registrado!',
        `${result.message}\n\nPlan: ${result.plan}\nMonto: S/ ${result.monto}\nVálido hasta: ${new Date(result.valido_hasta).toLocaleDateString('es-PE')}\n\n${result.nota}`,
        [{ text: 'Aceptar', onPress: () => loadVehicles() }]
      );
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'No se pudo procesar el pago';
      Alert.alert('Error', detail);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getPlanInfo = (planKey: string) => {
    if (planKey === 'destacado_10d') {
      return {
        nombre: 'Anuncio Destacado',
        descripcion: 'Tu anuncio se destaca con badge especial y aparece primero',
        dias: '10 días',
        monto: 'S/ 10',
        icon: 'star' as const,
        color: '#FFD700',
      };
    }
    return {
      nombre: 'Priorizado + Extensión',
      descripcion: 'Priorización por fecha + 1 semana adicional de visibilidad',
      dias: '5 días + 7 días extra',
      monto: 'S/ 5',
      icon: 'rocket' as const,
      color: COLORS_THEME.primary,
    };
  };

  const isVehicleFeatured = (vehicle: Vehicle) => {
    return vehicle.es_destacado && 
           vehicle.fecha_destacado_hasta && 
           new Date(vehicle.fecha_destacado_hasta) > new Date();
  };

  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    const featured = isVehicleFeatured(item);
    
    return (
      <View style={[styles.card, featured && styles.cardFeatured]}>
        <TouchableOpacity
          onPress={() => router.push(`/vehicle/${item.vehicle_id}` as any)}
          activeOpacity={0.7}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: item.foto_frente }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={14} color="#fff" />
                <Text style={styles.featuredBadgeText}>DESTACADO</Text>
              </View>
            )}
          </View>
          <View style={styles.cardContent}>
            <View style={styles.statusRow}>
              <View style={[
                styles.statusBadge,
                item.estado === 'activo' && styles.statusActive,
                item.estado === 'vendido' && styles.statusSold,
                item.estado === 'inactivo' && styles.statusInactive,
              ]}>
                <Text style={[
                  styles.statusText,
                  item.estado === 'activo' && { color: '#4CAF50' },
                  item.estado === 'vendido' && { color: '#FF9800' },
                  item.estado === 'inactivo' && { color: '#F44336' },
                ]}>
                  {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                </Text>
              </View>
              {featured && (
                <Text style={styles.featuredUntil}>
                  Hasta {new Date(item.fecha_destacado_hasta!).toLocaleDateString('es-PE')}
                </Text>
              )}
            </View>
            <Text style={styles.cardTitle}>
              {item.marca} {item.modelo}
            </Text>
            <Text style={styles.cardYear}>{item.anio} · {item.placa}</Text>
            <Text style={styles.cardPrice}>{formatPrice(item.precio)}</Text>
            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="speedometer-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{formatKm(item.kilometraje)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{item.ciudad}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.cardActions}>
          {item.estado === 'activo' && !featured && (
            <TouchableOpacity
              style={[styles.actionButton, styles.promoteButton]}
              onPress={() => openPaymentModal(item)}
            >
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.promoteButtonText}>Destacar</Text>
            </TouchableOpacity>
          )}
          {item.estado === 'activo' && featured && (
            <TouchableOpacity
              style={[styles.actionButton, styles.extendButton]}
              onPress={() => openPaymentModal(item)}
            >
              <Ionicons name="time" size={20} color={COLORS_THEME.primary} />
              <Text style={styles.extendButtonText}>Extender</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.vehicle_id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {paymentStep === 'select' ? 'Destacar Anuncio' : 
               paymentStep === 'pay' ? 'Pagar con Yape' : 'Confirmar Pago'}
            </Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Vehicle Info */}
            {selectedVehicle && (
              <View style={styles.vehicleInfo}>
                <Image 
                  source={{ uri: selectedVehicle.foto_frente }} 
                  style={styles.vehicleThumb} 
                />
                <View style={styles.vehicleInfoText}>
                  <Text style={styles.vehicleInfoTitle}>
                    {selectedVehicle.marca} {selectedVehicle.modelo}
                  </Text>
                  <Text style={styles.vehicleInfoSub}>
                    {selectedVehicle.anio} · {selectedVehicle.placa}
                  </Text>
                </View>
              </View>
            )}

            {/* Step 1: Select Plan */}
            {paymentStep === 'select' && (
              <View>
                <Text style={styles.stepTitle}>Elige tu plan de promoción</Text>
                
                {/* Plan 1: Destacado */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'destacado_10d' && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPlan('destacado_10d')}
                  activeOpacity={0.7}
                >
                  <View style={styles.planHeader}>
                    <View style={[styles.planIcon, { backgroundColor: '#FFF3E0' }]}>
                      <Ionicons name="star" size={28} color="#FFD700" />
                    </View>
                    <View style={styles.planPriceContainer}>
                      <Text style={styles.planPrice}>S/ 10</Text>
                    </View>
                  </View>
                  <Text style={styles.planName}>Anuncio Destacado</Text>
                  <Text style={styles.planDesc}>
                    Tu anuncio aparece primero con un badge especial visible para todos los compradores
                  </Text>
                  <View style={styles.planDuration}>
                    <Ionicons name="calendar" size={16} color={COLORS_THEME.primary} />
                    <Text style={styles.planDurationText}>10 días de duración</Text>
                  </View>
                  {selectedPlan === 'destacado_10d' && (
                    <View style={styles.planCheck}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS_THEME.primary} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Plan 2: Priorizado */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'priorizado_5d_7d' && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPlan('priorizado_5d_7d')}
                  activeOpacity={0.7}
                >
                  <View style={styles.planHeader}>
                    <View style={[styles.planIcon, { backgroundColor: '#E0F7FA' }]}>
                      <Ionicons name="rocket" size={28} color={COLORS_THEME.primary} />
                    </View>
                    <View style={styles.planPriceContainer}>
                      <Text style={styles.planPrice}>S/ 5</Text>
                    </View>
                  </View>
                  <Text style={styles.planName}>Priorizado + Extensión</Text>
                  <Text style={styles.planDesc}>
                    Priorización por fecha de publicación por 5 días, más 1 semana adicional de visibilidad
                  </Text>
                  <View style={styles.planDuration}>
                    <Ionicons name="calendar" size={16} color={COLORS_THEME.primary} />
                    <Text style={styles.planDurationText}>5 días + 7 días extra</Text>
                  </View>
                  {selectedPlan === 'priorizado_5d_7d' && (
                    <View style={styles.planCheck}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS_THEME.primary} />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    !selectedPlan && styles.continueButtonDisabled,
                  ]}
                  onPress={() => selectedPlan && setPaymentStep('pay')}
                  disabled={!selectedPlan}
                >
                  <Text style={styles.continueButtonText}>Continuar</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Payment Instructions */}
            {paymentStep === 'pay' && (
              <View>
                <Text style={styles.stepTitle}>Realiza tu pago por Yape</Text>
                
                <View style={styles.paymentSummary}>
                  <Text style={styles.paymentSummaryLabel}>Plan seleccionado:</Text>
                  <Text style={styles.paymentSummaryValue}>
                    {getPlanInfo(selectedPlan).nombre}
                  </Text>
                  <Text style={styles.paymentSummaryAmount}>
                    Monto a pagar: {getPlanInfo(selectedPlan).monto}
                  </Text>
                </View>

                <View style={styles.yapeCard}>
                  <View style={styles.yapeHeader}>
                    <View style={styles.yapeLogo}>
                      <Text style={styles.yapeLogoText}>Y</Text>
                    </View>
                    <Text style={styles.yapeTitle}>Yape</Text>
                  </View>
                  
                  <Text style={styles.yapeLabel}>Envía el pago a este número:</Text>
                  <View style={styles.yapeNumberRow}>
                    <Text style={styles.yapeNumber}>938 567 871</Text>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={handleCopyNumber}
                    >
                      <Ionicons name="copy" size={18} color="#fff" />
                      <Text style={styles.copyButtonText}>Copiar</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.yapeTitular}>Titular: AQP-Autos</Text>
                </View>

                <View style={styles.yapeSteps}>
                  <View style={styles.yapeStep}>
                    <View style={styles.yapeStepNumber}>
                      <Text style={styles.yapeStepNumberText}>1</Text>
                    </View>
                    <Text style={styles.yapeStepText}>
                      Abre tu app de Yape y busca el número 938567871
                    </Text>
                  </View>
                  <View style={styles.yapeStep}>
                    <View style={styles.yapeStepNumber}>
                      <Text style={styles.yapeStepNumberText}>2</Text>
                    </View>
                    <Text style={styles.yapeStepText}>
                      Envía {getPlanInfo(selectedPlan).monto} al número indicado
                    </Text>
                  </View>
                  <View style={styles.yapeStep}>
                    <View style={styles.yapeStepNumber}>
                      <Text style={styles.yapeStepNumberText}>3</Text>
                    </View>
                    <Text style={styles.yapeStepText}>
                      Copia el número de operación del comprobante Yape
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentActions}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setPaymentStep('select')}
                  >
                    <Ionicons name="arrow-back" size={20} color={COLORS_THEME.primary} />
                    <Text style={styles.backButtonText}>Volver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => setPaymentStep('confirm')}
                  >
                    <Text style={styles.continueButtonText}>Ya pagué</Text>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 3: Confirm with operation number */}
            {paymentStep === 'confirm' && (
              <View>
                <Text style={styles.stepTitle}>Ingresa el N° de Operación</Text>
                
                <View style={styles.paymentSummary}>
                  <Text style={styles.paymentSummaryLabel}>
                    {getPlanInfo(selectedPlan).nombre} - {getPlanInfo(selectedPlan).monto}
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Número de operación Yape *</Text>
                <TextInput
                  style={styles.operationInput}
                  placeholder="Ej: 12345678"
                  value={numeroOperacion}
                  onChangeText={setNumeroOperacion}
                  keyboardType="default"
                  autoCapitalize="characters"
                  maxLength={20}
                />
                <Text style={styles.inputHelper}>
                  Encuéntralo en el comprobante de tu pago Yape
                </Text>

                <View style={styles.warningBox}>
                  <Ionicons name="information-circle" size={20} color={COLORS_THEME.secondary} />
                  <Text style={styles.warningText}>
                    Tu anuncio se activará automáticamente. Los pagos son verificados por muestreo.
                    Números de operación falsos serán detectados y el anuncio será retirado.
                  </Text>
                </View>

                <View style={styles.paymentActions}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setPaymentStep('pay')}
                  >
                    <Ionicons name="arrow-back" size={20} color={COLORS_THEME.primary} />
                    <Text style={styles.backButtonText}>Volver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.submitPaymentButton,
                      (!numeroOperacion.trim() || submittingPayment) && styles.continueButtonDisabled,
                    ]}
                    onPress={handleSubmitPayment}
                    disabled={!numeroOperacion.trim() || submittingPayment}
                  >
                    {submittingPayment ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.continueButtonText}>Confirmar Pago</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Vehículos</Text>
        <Text style={styles.headerSubtitle}>{vehicles.length} publicaciones</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS_THEME.primary} />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderVehicleCard}
          keyExtractor={(item) => item.vehicle_id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No tienes vehículos publicados</Text>
              <Text style={styles.emptySubtext}>
                Publica tu primer vehículo en la pestaña "Publicar"
              </Text>
            </View>
          }
        />
      )}

      {renderPaymentModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardFeatured: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  imageWrapper: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusSold: {
    backgroundColor: '#FFF3E0',
  },
  statusInactive: {
    backgroundColor: '#FFEBEE',
  },
  featuredUntil: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardYear: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS_THEME.primary,
    marginBottom: 12,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  promoteButton: {
    backgroundColor: '#FFFDF0',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  promoteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
  },
  extendButton: {
    backgroundColor: '#E0F7FA',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  extendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS_THEME.primary,
  },
  deleteButton: {
    borderLeftWidth: 0,
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  // Payment Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalBody: {
    padding: 20,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  vehicleThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  vehicleInfoText: {
    flex: 1,
  },
  vehicleInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  vehicleInfoSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },

  // Plan cards
  planCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: COLORS_THEME.primary,
    backgroundColor: '#F0FDFD',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planPriceContainer: {
    backgroundColor: COLORS_THEME.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  planName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  planDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  planDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planDurationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS_THEME.primary,
  },
  planCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },

  // Yape payment
  yapeCard: {
    backgroundColor: '#6C2DA8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  yapeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  yapeLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yapeLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6C2DA8',
  },
  yapeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  yapeLabel: {
    fontSize: 14,
    color: '#E0C3FF',
    marginBottom: 8,
  },
  yapeNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  yapeNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  copyButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  yapeTitular: {
    fontSize: 14,
    color: '#E0C3FF',
  },
  yapeSteps: {
    marginBottom: 20,
  },
  yapeStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  yapeStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS_THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yapeStepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  yapeStepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    paddingTop: 3,
  },

  // Payment summary
  paymentSummary: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  paymentSummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  paymentSummaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS_THEME.secondary,
    marginTop: 4,
  },

  // Confirm step
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  operationInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: COLORS_THEME.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  inputHelper: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  // Buttons
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS_THEME.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    flex: 1,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 6,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS_THEME.primary,
  },
  paymentActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
