import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Vehicle } from '../../src/types';
import { vehiclesAPI, favoritesAPI } from '../../src/utils/api';
import { formatPrice, formatKm } from '../../src/utils/imageHelper';
import { useAuth } from '../../src/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function VehicleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, sessionToken } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const vehicleId = params.id as string;

  useEffect(() => {
    loadVehicle();
    if (user) {
      checkFavorite();
    }
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const data = await vehiclesAPI.getById(vehicleId);
      setVehicle(data);
    } catch (error) {
      console.error('Error loading vehicle:', error);
      Alert.alert('Error', 'No se pudo cargar el vehículo');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const isFav = await favoritesAPI.check(vehicleId, sessionToken || undefined);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(vehicleId, sessionToken || undefined);
        setIsFavorite(false);
        Alert.alert('Eliminado', 'Eliminado de favoritos');
      } else {
        await favoritesAPI.add(vehicleId, sessionToken || undefined);
        setIsFavorite(true);
        Alert.alert('Guardado', 'Agregado a favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    const message = `Hola, estoy interesado en tu ${vehicle?.marca} ${vehicle?.modelo} ${vehicle?.anio}`;
    Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return null;
  }

  const images = [
    { uri: vehicle.foto_frente, label: 'Frente' },
    { uri: vehicle.foto_atras, label: 'Atrás' },
    { uri: vehicle.foto_costado_izq, label: 'Costado Izquierdo' },
    { uri: vehicle.foto_costado_der, label: 'Costado Derecho' },
    { uri: vehicle.foto_interior, label: 'Interior' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF3B30' : '#000'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[currentImageIndex].uri }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.indicatorActive,
                ]}
                onPress={() => setCurrentImageIndex(index)}
              />
            ))}
          </View>
          <View style={styles.imageLabel}>
            <Text style={styles.imageLabelText}>{images[currentImageIndex].label}</Text>
          </View>
        </View>

        {/* Thumbnail Gallery */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentImageIndex(index)}
              style={[
                styles.thumbnail,
                currentImageIndex === index && styles.thumbnailActive,
              ]}
            >
              <Image source={{ uri: image.uri }} style={styles.thumbnailImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Price and Title */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(vehicle.precio)}</Text>
          <Text style={styles.title}>
            {vehicle.marca} {vehicle.modelo}
          </Text>
          <Text style={styles.year}>{vehicle.anio}</Text>
        </View>

        {/* Specs */}
        <View style={styles.specsContainer}>
          <View style={styles.specItem}>
            <Ionicons name="speedometer-outline" size={24} color="#007AFF" />
            <Text style={styles.specLabel}>Kilometraje</Text>
            <Text style={styles.specValue}>{formatKm(vehicle.kilometraje)}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
            <Text style={styles.specLabel}>Transmisión</Text>
            <Text style={styles.specValue}>
              {vehicle.transmision.charAt(0).toUpperCase() + vehicle.transmision.slice(1)}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={24} color="#007AFF" />
            <Text style={styles.specLabel}>Combustible</Text>
            <Text style={styles.specValue}>
              {vehicle.tipo_combustible.charAt(0).toUpperCase() + vehicle.tipo_combustible.slice(1)}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Color</Text>
              <Text style={styles.detailValue}>{vehicle.color}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Puertas</Text>
              <Text style={styles.detailValue}>{vehicle.num_puertas}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Placa</Text>
              <Text style={styles.detailValue}>{vehicle.placa}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Categoría</Text>
              <Text style={styles.detailValue}>
                {vehicle.category.charAt(0).toUpperCase() + vehicle.category.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {vehicle.descripcion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{vehicle.descripcion}</Text>
          </View>
        )}

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={24} color="#007AFF" />
            <Text style={styles.locationText}>
              {vehicle.distrito ? `${vehicle.distrito}, ` : ''}
              {vehicle.ciudad}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Contact Buttons */}
      {vehicle.user_id !== user?.user_id && (
        <View style={styles.contactContainer}>
          <TouchableOpacity
            style={[styles.contactButton, styles.whatsappButton]}
            onPress={() => handleWhatsApp('+51999999999')}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactButton, styles.callButton]}
            onPress={() => handleCall('+51999999999')}
          >
            <Ionicons name="call" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>Llamar</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#f0f0f0',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  imageLabel: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: '#007AFF',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  priceSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  year: {
    fontSize: 16,
    color: '#666',
  },
  specsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  contactContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  callButton: {
    backgroundColor: '#007AFF',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
