import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { vehiclesAPI } from '../../src/utils/api';
import { pickImage } from '../../src/utils/imageHelper';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  ALL_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSIONS,
  COLORS,
  PHOTO_LABELS,
} from '../../src/constants';

interface FormData {
  category: string;
  marca: string;
  modelo: string;
  anio: string;
  precio: string;
  kilometraje: string;
  color: string;
  tipo_combustible: string;
  transmision: string;
  num_puertas: string;
  placa: string;
  descripcion: string;
  ciudad: string;
  distrito: string;
  galeria_fotos_url: string;
  foto_frente: string;
  foto_atras: string;
  foto_costado_izq: string;
  foto_costado_der: string;
  foto_interior: string;
}

export default function AddVehicleScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    category: '',
    marca: '',
    modelo: '',
    anio: '',
    precio: '',
    kilometraje: '',
    color: '',
    tipo_combustible: '',
    transmision: '',
    num_puertas: '',
    placa: '',
    descripcion: '',
    ciudad: 'Arequipa',
    distrito: '',
    galeria_fotos_url: '',
    foto_frente: '',
    foto_atras: '',
    foto_costado_izq: '',
    foto_costado_der: '',
    foto_interior: '',
  });

  const handleImagePick = async (photoKey: keyof FormData) => {
    const imageUri = await pickImage();
    if (imageUri) {
      setFormData({ ...formData, [photoKey]: imageUri });
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      Alert.alert('Éxito', 'Ubicación obtenida correctamente');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const validateForm = (): boolean => {
    // Validar campos obligatorios
    if (!formData.category) {
      Alert.alert('Campo requerido', 'Por favor selecciona una categoría');
      return false;
    }

    if (!formData.marca || !formData.marca.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa la marca del vehículo');
      return false;
    }

    if (!formData.modelo || !formData.modelo.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el modelo del vehículo');
      return false;
    }

    if (!formData.anio || parseInt(formData.anio) < 1900 || parseInt(formData.anio) > new Date().getFullYear() + 1) {
      Alert.alert('Año inválido', 'Por favor ingresa un año válido entre 1900 y ' + (new Date().getFullYear() + 1));
      return false;
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      Alert.alert('Precio inválido', 'Por favor ingresa un precio válido mayor a 0');
      return false;
    }

    if (!formData.kilometraje || parseInt(formData.kilometraje) < 0) {
      Alert.alert('Kilometraje inválido', 'Por favor ingresa un kilometraje válido');
      return false;
    }

    if (!formData.color) {
      Alert.alert('Campo requerido', 'Por favor selecciona un color');
      return false;
    }

    if (!formData.tipo_combustible) {
      Alert.alert('Campo requerido', 'Por favor selecciona el tipo de combustible');
      return false;
    }

    if (!formData.transmision) {
      Alert.alert('Campo requerido', 'Por favor selecciona el tipo de transmisión');
      return false;
    }

    if (!formData.num_puertas || parseInt(formData.num_puertas) < 1) {
      Alert.alert('Número de puertas inválido', 'Por favor ingresa un número de puertas válido');
      return false;
    }

    if (!formData.placa || !formData.placa.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa la placa del vehículo');
      return false;
    }

    if (!formData.descripcion || !formData.descripcion.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa una descripción del vehículo');
      return false;
    }

    // Validar las 5 fotos obligatorias
    if (!formData.foto_frente || !formData.foto_atras || !formData.foto_costado_izq || 
        !formData.foto_costado_der || !formData.foto_interior) {
      Alert.alert('Fotos incompletas', 'Por favor agrega las 5 fotos obligatorias del vehículo');
      return false;
    }

    // Validar ubicación
    if (!location) {
      Alert.alert('Ubicación requerida', 'Por favor obtén tu ubicación usando el botón');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const vehicleData = {
        category: formData.category,
        marca: formData.marca,
        modelo: formData.modelo,
        anio: parseInt(formData.anio),
        precio: parseFloat(formData.precio),
        kilometraje: parseInt(formData.kilometraje),
        color: formData.color,
        tipo_combustible: formData.tipo_combustible,
        transmision: formData.transmision,
        num_puertas: parseInt(formData.num_puertas),
        placa: formData.placa,
        descripcion: formData.descripcion,
        ciudad: formData.ciudad,
        distrito: formData.distrito || undefined,
        latitude: location!.latitude,
        longitude: location!.longitude,
        foto_frente: formData.foto_frente,
        foto_atras: formData.foto_atras,
        foto_costado_izq: formData.foto_costado_izq,
        foto_costado_der: formData.foto_costado_der,
        foto_interior: formData.foto_interior,
        galeria_fotos_url: formData.galeria_fotos_url || undefined,
      };

      await vehiclesAPI.create(vehicleData, sessionToken || undefined);
      
      Alert.alert('Éxito', 'Vehículo publicado correctamente', [
        {
          text: 'Ver mis vehículos',
          onPress: () => router.push('/(tabs)/my-vehicles'),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo publicar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  const renderPhotoButton = (photoKey: keyof FormData, label: string) => (
    <TouchableOpacity
      style={[styles.photoButton, formData[photoKey] && styles.photoButtonFilled]}
      onPress={() => handleImagePick(photoKey)}
      activeOpacity={0.7}
    >
      {formData[photoKey] ? (
        <Image source={{ uri: formData[photoKey] }} style={styles.photoPreview} />
      ) : (
        <>
          <Ionicons name="camera" size={32} color="#007AFF" />
          <Text style={styles.photoButtonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Publicar Vehículo</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category */}
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.optionsRow}>
            {ALL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.optionChip,
                  formData.category === cat.value && styles.optionChipActive,
                ]}
                onPress={() => setFormData({ ...formData, category: cat.value })}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    formData.category === cat.value && styles.optionChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Basic Info */}
          <Text style={styles.label}>Marca *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Toyota"
            value={formData.marca}
            onChangeText={(text) => setFormData({ ...formData, marca: text })}
          />

          <Text style={styles.label}>Modelo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Corolla"
            value={formData.modelo}
            onChangeText={(text) => setFormData({ ...formData, modelo: text })}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Año *</Text>
              <TextInput
                style={styles.input}
                placeholder="2020"
                keyboardType="numeric"
                value={formData.anio}
                onChangeText={(text) => setFormData({ ...formData, anio: text })}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Precio (S/) *</Text>
              <TextInput
                style={styles.input}
                placeholder="25000"
                keyboardType="numeric"
                value={formData.precio}
                onChangeText={(text) => setFormData({ ...formData, precio: text })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Kilometraje *</Text>
              <TextInput
                style={styles.input}
                placeholder="50000"
                keyboardType="numeric"
                value={formData.kilometraje}
                onChangeText={(text) => setFormData({ ...formData, kilometraje: text })}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>N° Puertas *</Text>
              <TextInput
                style={styles.input}
                placeholder="4"
                keyboardType="numeric"
                value={formData.num_puertas}
                onChangeText={(text) => setFormData({ ...formData, num_puertas: text })}
              />
            </View>
          </View>

          <Text style={styles.label}>Color *</Text>
          <View style={styles.optionsRow}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.optionChip,
                  formData.color === color && styles.optionChipActive,
                ]}
                onPress={() => setFormData({ ...formData, color })}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    formData.color === color && styles.optionChipTextActive,
                  ]}
                >
                  {color}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Transmisión *</Text>
          <View style={styles.optionsRow}>
            {TRANSMISSIONS.map((trans) => (
              <TouchableOpacity
                key={trans.value}
                style={[
                  styles.optionChip,
                  formData.transmision === trans.value && styles.optionChipActive,
                ]}
                onPress={() => setFormData({ ...formData, transmision: trans.value })}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    formData.transmision === trans.value && styles.optionChipTextActive,
                  ]}
                >
                  {trans.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Tipo de Combustible *</Text>
          <View style={styles.optionsRow}>
            {FUEL_TYPES.map((fuel) => (
              <TouchableOpacity
                key={fuel.value}
                style={[
                  styles.optionChip,
                  formData.tipo_combustible === fuel.value && styles.optionChipActive,
                ]}
                onPress={() => setFormData({ ...formData, tipo_combustible: fuel.value })}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    formData.tipo_combustible === fuel.value && styles.optionChipTextActive,
                  ]}
                >
                  {fuel.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Placa *</Text>
          <TextInput
            style={styles.input}
            placeholder="ABC-123"
            value={formData.placa}
            onChangeText={(text) => setFormData({ ...formData, placa: text.toUpperCase() })}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe las características y estado del vehículo..."
            value={formData.descripcion}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Distrito</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Cayma, Yanahuara..."
            value={formData.distrito}
            onChangeText={(text) => setFormData({ ...formData, distrito: text })}
          />

          <Text style={styles.label}>Enlace a Galería de Fotos (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://drive.google.com/..."
            value={formData.galeria_fotos_url}
            onChangeText={(text) => setFormData({ ...formData, galeria_fotos_url: text })}
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* Location */}
          <TouchableOpacity
            style={[styles.locationButton, location && styles.locationButtonActive]}
            onPress={getLocation}
          >
            <Ionicons
              name={location ? 'checkmark-circle' : 'location'}
              size={24}
              color={location ? '#4CAF50' : '#007AFF'}
            />
            <Text style={[styles.locationButtonText, location && styles.locationButtonTextActive]}>
              {location ? 'Ubicación obtenida' : 'Obtener mi ubicación *'}
            </Text>
          </TouchableOpacity>

          {/* Photos */}
          <Text style={styles.sectionTitle}>Fotos del Vehículo (5 obligatorias) *</Text>
          {PHOTO_LABELS.map((photo) => (
            <View key={photo.key}>
              <Text style={styles.label}>{photo.label}</Text>
              {renderPhotoButton(photo.key as keyof FormData, `Agregar ${photo.label}`)}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Publicar Vehículo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  optionChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionChipText: {
    fontSize: 14,
    color: '#666',
  },
  optionChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  locationButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  locationButtonTextActive: {
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 24,
    marginBottom: 8,
  },
  photoButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoButtonFilled: {
    borderStyle: 'solid',
    borderColor: '#4CAF50',
    padding: 0,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
