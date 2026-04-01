export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  phone?: string;
  created_at: string;
}

export interface Vehicle {
  vehicle_id: string;
  user_id: string;
  category: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  kilometraje: number;
  color: string;
  tipo_combustible: string;
  transmision: string;
  num_puertas: number;
  placa: string;
  descripcion: string;
  ciudad: string;
  distrito?: string;
  latitude: number;
  longitude: number;
  foto_frente: string;
  foto_atras: string;
  foto_costado_izq: string;
  foto_costado_der: string;
  foto_interior: string;
  galeria_fotos?: string[];
  es_destacado?: boolean;
  fecha_destacado_hasta?: string;
  tipo_destacado?: string;
  etiqueta_destacado?: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  category: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  kilometraje: number;
  color: string;
  tipo_combustible: string;
  transmision: string;
  num_puertas: number;
  placa: string;
  descripcion: string;
  ciudad: string;
  distrito?: string;
  latitude: number;
  longitude: number;
  foto_frente: string;
  foto_atras: string;
  foto_costado_izq: string;
  foto_costado_der: string;
  foto_interior: string;
}

export interface FilterOptions {
  category?: string;
  marca?: string;
  modelo?: string;
  precio_min?: number;
  precio_max?: number;
  anio_min?: number;
  anio_max?: number;
  transmision?: string;
  tipo_combustible?: string;
}