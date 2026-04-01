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
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Vehicle, FilterOptions } from '../../src/types';
import { vehiclesAPI } from '../../src/utils/api';
import { formatPrice, formatKm } from '../../src/utils/imageHelper';
import { SECTIONS, CATEGORIES, ALL_CATEGORIES, FUEL_TYPES, TRANSMISSIONS, COLORS_THEME } from '../../src/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function HomeScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('autos');
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    loadVehicles();
  }, [filters, selectedSection]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      // Filter by section categories
      const sectionCategories = CATEGORIES[selectedSection as keyof typeof CATEGORIES].map(c => c.value);
      const data = await vehiclesAPI.getAll(filters);
      // Filter by section
      const filtered = data.filter(v => sectionCategories.includes(v.category));
      setVehicles(filtered);
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

  const applyFilters = () => {
    setShowFilters(false);
    loadVehicles();
  };

  const clearFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    searchQuery
      ? vehicle.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.modelo.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    // Verificar si el destacado está activo
    const isDestacado = item.es_destacado && 
                       item.fecha_destacado_hasta && 
                       new Date(item.fecha_destacado_hasta) > new Date();
    
    const getBadgeColor = (tipo?: string) => {
      switch(tipo) {
        case 'ultra': return '#FF6B35'; // Naranja
        case 'premium': return '#FFD700'; // Dorado
        case 'basico': return COLORS_THEME.primary; // Azul turquesa
        default: return COLORS_THEME.primary;
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isDestacado && styles.cardDestacado
        ]}
        onPress={() => router.push(`/vehicle/${item.vehicle_id}` as any)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.foto_frente }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {isDestacado && (
            <View style={[styles.destacadoBadge, { backgroundColor: getBadgeColor(item.tipo_destacado) }]}>
              <Ionicons name="star" size={14} color="#fff" />
              <Text style={styles.destacadoText}>
                {item.tipo_destacado === 'ultra' ? 'ULTRA' : 
                 item.tipo_destacado === 'premium' ? 'PREMIUM' : 'DESTACADO'}
              </Text>
            </View>
          )}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{formatPrice(item.precio)}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.marca} {item.modelo}
          </Text>
          <Text style={styles.cardYear}>{item.anio}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.cardDetail}>
              <Ionicons name="speedometer-outline" size={14} color="#666" />
              <Text style={styles.cardDetailText}>{item.kilometraje > 1000 ? `${Math.floor(item.kilometraje/1000)}k km` : `${item.kilometraje} km`}</Text>
            </View>
            <View style={styles.cardDetail}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.cardDetailText} numberOfLines={1}>{item.ciudad}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.logo}>AQP-Autos</Text>
            <Text style={styles.logoSubtitle}>by GNPS</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={styles.filterIconButton}
          >
            <Ionicons name="options-outline" size={24} color={COLORS_THEME.secondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar vehículos..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Section Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.tab,
                selectedSection === section.id && styles.tabActive,
              ]}
              onPress={() => setSelectedSection(section.id)}
            >
              <Ionicons
                name={section.icon as any}
                size={20}
                color={selectedSection === section.id ? '#13CE66' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedSection === section.id && styles.tabTextActive,
                ]}
              >
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vehicle Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#13CE66" />
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleCard}
          keyExtractor={(item) => item.vehicle_id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#13CE66"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color="#ddd" />
              <Text style={styles.emptyText}>No hay vehículos disponibles</Text>
              <Text style={styles.emptySubtext}>
                Intenta buscar en otra sección
              </Text>
            </View>
          }
        />
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersScroll} showsVerticalScrollIndicator={false}>
              {/* Category Filter */}
              <Text style={styles.filterLabel}>Categoría</Text>
              <View style={styles.filterOptions}>
                {ALL_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.filterChip,
                      filters.category === cat.value && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        category: filters.category === cat.value ? undefined : cat.value,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.category === cat.value && styles.filterChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range */}
              <Text style={styles.filterLabel}>Precio</Text>
              <View style={styles.rangeInputs}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Mín"
                  keyboardType="numeric"
                  value={filters.precio_min?.toString() || ''}
                  onChangeText={(text) =>
                    setFilters({ ...filters, precio_min: text ? parseFloat(text) : undefined })
                  }
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Máx"
                  keyboardType="numeric"
                  value={filters.precio_max?.toString() || ''}
                  onChangeText={(text) =>
                    setFilters({ ...filters, precio_max: text ? parseFloat(text) : undefined })
                  }
                />
              </View>

              {/* Year Range */}
              <Text style={styles.filterLabel}>Año</Text>
              <View style={styles.rangeInputs}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Desde"
                  keyboardType="numeric"
                  value={filters.anio_min?.toString() || ''}
                  onChangeText={(text) =>
                    setFilters({ ...filters, anio_min: text ? parseInt(text) : undefined })
                  }
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Hasta"
                  keyboardType="numeric"
                  value={filters.anio_max?.toString() || ''}
                  onChangeText={(text) =>
                    setFilters({ ...filters, anio_max: text ? parseInt(text) : undefined })
                  }
                />
              </View>

              {/* Transmission Filter */}
              <Text style={styles.filterLabel}>Transmisión</Text>
              <View style={styles.filterOptions}>
                {TRANSMISSIONS.map((trans) => (
                  <TouchableOpacity
                    key={trans.value}
                    style={[
                      styles.filterChip,
                      filters.transmision === trans.value && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        transmision:
                          filters.transmision === trans.value ? undefined : trans.value,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.transmision === trans.value && styles.filterChipTextActive,
                      ]}
                    >
                      {trans.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fuel Type Filter */}
              <Text style={styles.filterLabel}>Combustible</Text>
              <View style={styles.filterOptions}>
                {FUEL_TYPES.map((fuel) => (
                  <TouchableOpacity
                    key={fuel.value}
                    style={[
                      styles.filterChip,
                      filters.tipo_combustible === fuel.value && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        tipo_combustible:
                          filters.tipo_combustible === fuel.value ? undefined : fuel.value,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.tipo_combustible === fuel.value &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {fuel.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Ver resultados</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: COLORS_THEME.background,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS_THEME.primary,
  },
  logoSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS_THEME.secondary,
    marginTop: -2,
  },
  filterIconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#E0F7FA',
    borderWidth: 2,
    borderColor: COLORS_THEME.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: COLORS_THEME.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS_THEME.background,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDestacado: {
    borderWidth: 2,
    borderColor: COLORS_THEME.secondary,
    shadowColor: COLORS_THEME.secondary,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#F0F0F0',
  },
  destacadoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  destacadoText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS_THEME.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    height: 38,
  },
  cardYear: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  cardDetailText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    width: width - 32,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS_THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS_THEME.primary,
  },
  filtersScroll: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: COLORS_THEME.background,
  },
  filterChipActive: {
    backgroundColor: COLORS_THEME.primary,
    borderColor: COLORS_THEME.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterChipTextActive: {
    color: COLORS_THEME.background,
    fontWeight: '600',
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rangeSeparator: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS_THEME.secondary,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS_THEME.secondary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS_THEME.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS_THEME.background,
  },
});
