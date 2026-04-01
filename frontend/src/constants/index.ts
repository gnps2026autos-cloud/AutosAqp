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
  { label: 'Diesel', value: 'diesel' },
  { label: 'Eléctrico', value: 'electrico' },
  { label: 'Híbrido', value: 'hibrido' },
  { label: 'Gas', value: 'gas' },
];

export const TRANSMISSIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Automática', value: 'automatica' },
];

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