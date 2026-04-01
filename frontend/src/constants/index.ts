// Secciones principales
export const SECTIONS = [
  { id: 'autos', label: 'Autos y Camionetas', icon: 'car' },
  { id: 'motos', label: 'Motos y Más', icon: 'bicycle' },
  { id: 'otros', label: 'Otros', icon: 'ellipsis-horizontal' },
];

// Categorías por sección
export const CATEGORIES = {
  autos: [
    { label: 'Auto', value: 'auto' },
    { label: 'Camioneta', value: 'camioneta' },
    { label: 'SUV', value: 'suv' },
    { label: 'Pickup', value: 'pickup' },
    { label: 'Van', value: 'van' },
    { label: 'Mini Van', value: 'minivan' },
  ],
  motos: [
    { label: 'Moto', value: 'moto' },
    { label: 'Scooter', value: 'scooter' },
    { label: 'Remolque', value: 'remolque' },
    { label: 'Casa Rodante', value: 'casa_rodante' },
  ],
  otros: [
    { label: 'Camión', value: 'camion' },
    { label: 'Bus', value: 'bus' },
    { label: 'Ómnibus', value: 'omnibus' },
    { label: 'Maquinaria', value: 'maquinaria' },
    { label: 'Otro', value: 'otro' },
  ],
};

// Todas las categorías (para formularios)
export const ALL_CATEGORIES = [
  ...CATEGORIES.autos,
  ...CATEGORIES.motos,
  ...CATEGORIES.otros,
];

export const FUEL_TYPES = [
  { label: 'Gasolina', value: 'gasolina' },
  { label: 'Gasolina-GLP', value: 'gasolina_glp' },
  { label: 'Gasolina-GNV', value: 'gasolina_gnv' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Diesel-Urea', value: 'diesel_urea' },
  { label: 'Eléctrico', value: 'electrico' },
  { label: 'Híbrido', value: 'hibrido' },
  { label: 'Gas', value: 'gas' },
  { label: 'Otros', value: 'otros' },
];

export const TRANSMISSIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Automática', value: 'automatica' },
];

// Colores del tema
export const COLORS_THEME = {
  primary: '#00BCD4',      // Azul turquesa
  secondary: '#FF6B35',    // Naranja
  background: '#FFFFFF',   // Blanco
  text: '#00BCD4',         // Azul turquesa para textos principales
  textSecondary: '#666666', // Gris para textos secundarios
  border: '#E0E0E0',       // Gris claro para bordes
  success: '#4CAF50',      // Verde para éxito
  error: '#F44336',        // Rojo para errores
};

export const COLORS = [
  'Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 
  'Amarillo', 'Naranja', 'Marrón', 'Beige', 'Dorado'
];

export const PHOTO_LABELS = [
  { key: 'foto_frente', label: 'Foto Frontal' },
  { key: 'foto_atras', label: 'Foto Trasera' },
  { key: 'foto_costado_izq', label: 'Costado Izquierdo' },
  { key: 'foto_costado_der', label: 'Costado Derecho' },
  { key: 'foto_interior', label: 'Interior (Tablero con llaves)' },
];

// Región Arequipa (Centro aproximado)
export const AREQUIPA_REGION = {
  latitude: -16.409047,
  longitude: -71.537451,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3,
};

// Etiquetas para anuncios destacados
export const ETIQUETAS_DESTACADO = [
  { value: 'oferta', label: 'Oferta', icon: 'pricetag', color: '#FF6B35' },
  { value: 'ocasion', label: 'Ocasión', icon: 'flash', color: '#E91E63' },
  { value: 'por_viaje', label: 'Por Viaje', icon: 'airplane', color: '#9C27B0' },
  { value: 'destacado', label: 'Destacados', icon: 'star', color: '#FFD700' },
  { value: 'super_anuncio', label: 'Super Anuncio', icon: 'megaphone', color: '#00BCD4' },
];