# Documentación de la API - AQP-Autos by GNPS

API REST completa para la aplicación AQP-Autos by GNPS

**URL Base**: `http://localhost:8001/api` (desarrollo)  
**URL Base**: `https://tu-dominio.com/api` (producción)

**Versión**: 1.0.0

---

## ⚠️ EXENCIÓN DE RESPONSABILIDAD

Esta API es proporcionada "tal cual" sin garantías de ningún tipo, expresas o implícitas. Al usar esta API, usted acepta que:

1. **NO garantizamos** la precisión, integridad o actualidad de los datos.
2. **NO somos responsables** por pérdidas o daños derivados del uso de esta API.
3. **NO garantizamos** disponibilidad continua del servicio.
4. Los datos de vehículos son proporcionados por usuarios y deben ser verificados independientemente.
5. Las transacciones entre usuarios son su propia responsabilidad.

**USO BAJO SU PROPIO RIESGO.**

---

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Vehículos](#vehículos)
- [Favoritos](#favoritos)
- [Modelos de Datos](#modelos-de-datos)
- [Códigos de Error](#códigos-de-error)

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren autenticación mediante:
- **Cookie**: `session_token` (httpOnly)
- **Header**: `Authorization: Bearer {session_token}`

### POST /api/auth/session

Crear una sesión de usuario mediante Google OAuth.

**Cuerpo de la Solicitud:**
```json
{
  "session_id": "string"
}
```

**Respuesta:** `200 OK`
```json
{
  "user_id": "user_abc123",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "picture": "https://...",
  "phone": "987654321",
  "created_at": "2024-01-01T12:00:00Z"
}
```

**Errores:**
- `400 Bad Request`: Session ID inválido
- `500 Internal Server Error`: Error del servidor

---

### GET /api/auth/me

Obtener información del usuario autenticado actual.

**Encabezados:**
```
Authorization: Bearer {session_token}
```

**Respuesta:** `200 OK`
```json
{
  "user_id": "user_abc123",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "picture": "https://...",
  "phone": "987654321",
  "created_at": "2024-01-01T12:00:00Z"
}
```

**Errores:**
- `401 Unauthorized`: No autenticado o sesión expirada
- `404 Not Found`: Usuario no encontrado

---

### POST /api/auth/logout

Cerrar la sesión del usuario actual.

**Respuesta:** `200 OK`
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

### PUT /api/auth/profile

Actualizar el perfil del usuario autenticado.

**Encabezados:**
```
Authorization: Bearer {session_token}
```

**Cuerpo de la Solicitud:**
```json
{
  "name": "Juan Carlos Pérez",
  "phone": "987654321",
  "picture": "data:image/jpeg;base64,..."
}
```

**Respuesta:** `200 OK`
```json
{
  "user_id": "user_abc123",
  "email": "usuario@ejemplo.com",
  "name": "Juan Carlos Pérez",
  "picture": "data:image/jpeg;base64,...",
  "phone": "987654321",
  "created_at": "2024-01-01T12:00:00Z"
}
```

**Errores:**
- `401 Unauthorized`: No autenticado

---

## 🚗 Vehículos

### POST /api/vehicles

Crear un nuevo anuncio de vehículo (requiere autenticación).

**Encabezados:**
```
Authorization: Bearer {session_token}
Content-Type: application/json
```

**Cuerpo de la Solicitud:**
```json
{
  "category": "auto",
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2020,
  "precio": 25000,
  "kilometraje": 45000,
  "color": "Gris",
  "tipo_combustible": "gasolina",
  "transmision": "automatica",
  "num_puertas": 4,
  "placa": "ABC-123",
  "descripcion": "Vehículo en excelente estado, único dueño",
  "ciudad": "Arequipa",
  "distrito": "Cayma",
  "latitude": -16.409047,
  "longitude": -71.537451,
  "foto_frente": "data:image/jpeg;base64,...",
  "foto_atras": "data:image/jpeg;base64,...",
  "foto_costado_izq": "data:image/jpeg;base64,...",
  "foto_costado_der": "data:image/jpeg;base64,...",
  "foto_interior": "data:image/jpeg;base64,...",
  "galeria_fotos": [
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,..."
  ]
}
```

**Campos Obligatorios:**
- `category`: Categoría del vehículo
- `marca`: Marca del vehículo
- `modelo`: Modelo del vehículo
- `anio`: Año del vehículo (1900-2026)
- `precio`: Precio en soles (> 0)
- `kilometraje`: Kilometraje (>= 0)
- `color`: Color del vehículo
- `tipo_combustible`: Tipo de combustible
- `transmision`: Tipo de transmisión
- `num_puertas`: Número de puertas (>= 1)
- `placa`: Placa del vehículo
- `descripcion`: Descripción del vehículo
- `ciudad`: Ciudad (siempre "Arequipa")
- `latitude`: Latitud GPS
- `longitude`: Longitud GPS
- `foto_frente`: Foto frontal enviada como base64; el backend devuelve URL
- `foto_atras`: Foto trasera enviada como base64; el backend devuelve URL
- `foto_costado_izq`: Foto costado izquierdo enviada como base64; el backend devuelve URL
- `foto_costado_der`: Foto costado derecho enviada como base64; el backend devuelve URL
- `foto_interior`: Foto interior enviada como base64; el backend devuelve URL

**Campos Opcionales:**
- `distrito`: Distrito de Arequipa
- `galeria_fotos`: Array de fotos adicionales enviadas como base64; el backend devuelve URLs

**Categorías Válidas:**
```
auto, camioneta, suv, pickup, van, minivan,
moto, scooter, remolque, casa_rodante,
camion, bus, omnibus, maquinaria, otro
```

**Tipos de Combustible Válidos:**
```
gasolina, gasolina_glp, gasolina_gnv,
diesel, diesel_urea, electrico, hibrido, gas, otros
```

**Tipos de Transmisión Válidos:**
```
manual, automatica
```

**Respuesta:** `200 OK`
```json
{
  "vehicle_id": "vehicle_xyz789",
  "user_id": "user_abc123",
  "category": "auto",
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2020,
  "precio": 25000,
  ...
  "estado": "activo",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Errores:**
- `400 Bad Request`: Faltan las 5 fotos obligatorias o datos inválidos
- `401 Unauthorized`: No autenticado

---

### GET /api/vehicles

Listar todos los vehículos activos con filtros opcionales (público).

**Parámetros de Consulta:**
- `category` (string): Filtrar por categoría
- `marca` (string): Filtrar por marca (búsqueda parcial)
- `modelo` (string): Filtrar por modelo (búsqueda parcial)
- `precio_min` (float): Precio mínimo
- `precio_max` (float): Precio máximo
- `anio_min` (int): Año mínimo
- `anio_max` (int): Año máximo
- `transmision` (string): Tipo de transmisión
- `tipo_combustible` (string): Tipo de combustible
- `limite` (int): Número máximo de resultados (predeterminado: 50)
- `skip` (int): Número de resultados a saltar para paginación (predeterminado: 0)

**Ejemplo:**
```
GET /api/vehicles?category=auto&precio_max=30000&anio_min=2018&limite=10
```

**Respuesta:** `200 OK`
```json
[
  {
    "vehicle_id": "vehicle_xyz789",
    "user_id": "user_abc123",
    "category": "auto",
    "marca": "Toyota",
    "modelo": "Corolla",
    ...
  }
]
```

---

### GET /api/vehicles/{vehicle_id}

Obtener detalles de un vehículo específico (público).

**Respuesta:** `200 OK`
```json
{
  "vehicle_id": "vehicle_xyz789",
  ...
}
```

**Errores:**
- `404 Not Found`: Vehículo no encontrado

---

### PUT /api/vehicles/{vehicle_id}

Actualizar un vehículo (solo el propietario, requiere autenticación).

**Encabezados:**
```
Authorization: Bearer {session_token}
Content-Type: application/json
```

**Cuerpo de la Solicitud:** (todos los campos son opcionales)
```json
{
  "precio": 24000,
  "kilometraje": 46000,
  "descripcion": "Descripción actualizada",
  "estado": "vendido"
}
```

**Respuesta:** `200 OK`

**Errores:**
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No eres el propietario del vehículo
- `404 Not Found`: Vehículo no encontrado

---

### DELETE /api/vehicles/{vehicle_id}

Eliminar un vehículo - eliminación suave (solo el propietario, requiere autenticación).

**Encabezados:**
```
Authorization: Bearer {session_token}
```

**Respuesta:** `200 OK`
```json
{
  "message": "Vehículo eliminado exitosamente"
}
```

**Nota:** El vehículo no se elimina físicamente, solo cambia su estado a "inactivo".

**Errores:**
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No eres el propietario del vehículo
- `404 Not Found`: Vehículo no encontrado

---

### GET /api/vehicles/user/my-vehicles

Obtener todos los vehículos del usuario autenticado (requiere autenticación).

**Encabezados:**
```
Authorization: Bearer {session_token}
```

**Respuesta:** `200 OK`
```json
[
  {
    "vehicle_id": "vehicle_xyz789",
    "user_id": "user_abc123",
    "estado": "activo",
    ...
  }
]
```

**Errores:**
- `401 Unauthorized`: No autenticado

---

## ⭐ Favoritos

### POST /api/favorites/{vehicle_id}

Agregar un vehículo a favoritos (requiere autenticación).

**Encabezados:**
```
Authorization: Bearer {session_token}
```

**Respuesta:** `200 OK`
```json
{
  "message": "Añadido a favoritos"
}
```

**Errores:**
- `401 Unauthorized`: No autenticado
- `404 Not Found`: Vehículo no encontrado

---

### DELETE /api/favorites/{vehicle_id}

Eliminar un vehículo de favoritos (requiere autenticación).

**Encabezados:**
```
Authorization: Bearer {session_token}
```

**Respuesta:** `200 OK`
```json
{
  "message": "Eliminado de favoritos"
}
```

**Errores:**
- `401 Unauthorized`: No autenticado
- `404 Not Found`: No está en favoritos

---

### GET /api/favorites

Obtener todos los vehículos favoritos del usuario (requiere autenticación).

**Encabezados:**
```
Authorization: Bearer {session_token}
```

**Respuesta:** `200 OK`
```json
[
  {
    "vehicle_id": "vehicle_xyz789",
    ...
  }
]
```

**Nota:** Solo retorna vehículos activos.

**Errores:**
- `401 Unauthorized`: No autenticado

---

### GET /api/favorites/check/{vehicle_id}

Verificar si un vehículo está en favoritos (requiere autenticación).

**Encabezados:**
```
Authorization: Bearer {session_token}
```

**Respuesta:** `200 OK`
```json
{
  "is_favorite": true
}
```

**Errores:**
- `401 Unauthorized`: No autenticado

---

## 📊 Modelos de Datos

### Usuario
```typescript
{
  user_id: string;          // ID único del usuario
  email: string;            // Email (único)
  name: string;             // Nombre completo
  picture?: string;         // URL o base64 de foto de perfil
  phone?: string;           // Teléfono de contacto
  created_at: datetime;     // Fecha de creación
}
```

### Vehículo
```typescript
{
  vehicle_id: string;       // ID único del vehículo
  user_id: string;          // ID del usuario propietario
  category: string;         // Categoría del vehículo
  marca: string;            // Marca
  modelo: string;           // Modelo
  anio: number;             // Año (1900-2026)
  precio: number;           // Precio en soles
  kilometraje: number;      // Kilometraje
  color: string;            // Color
  tipo_combustible: string; // Tipo de combustible
  transmision: string;      // manual | automatica
  num_puertas: number;      // Número de puertas
  placa: string;            // Placa del vehículo
  descripcion: string;      // Descripción detallada
  ciudad: string;           // Siempre "Arequipa"
  distrito?: string;        // Distrito de Arequipa
  latitude: number;         // Latitud GPS
  longitude: number;        // Longitud GPS
  foto_frente: string;      // Foto frontal enviada como base64; el backend devuelve URL
  foto_atras: string;       // Foto trasera enviada como base64; el backend devuelve URL
  foto_costado_izq: string; // Foto costado izquierdo enviada como base64; el backend devuelve URL
  foto_costado_der: string; // Foto costado derecho enviada como base64; el backend devuelve URL
  foto_interior: string;    // Foto interior (base64)
  galeria_fotos: string[];  // Array de fotos adicionales enviadas como base64; el backend devuelve URLs
  estado: string;           // activo | vendido | inactivo
  created_at: datetime;     // Fecha de creación
  updated_at: datetime;     // Fecha de última actualización
}
```

### Favorito
```typescript
{
  favorite_id: string;      // ID único del favorito
  user_id: string;          // ID del usuario
  vehicle_id: string;       // ID del vehículo
  created_at: datetime;     // Fecha de creación
}
```

---

## ⚠️ Códigos de Error

### 200 OK
Solicitud exitosa.

### 400 Bad Request
- Datos de entrada inválidos
- Faltan campos obligatorios
- Formato de datos incorrecto

### 401 Unauthorized
- No autenticado
- Sesión expirada
- Token inválido

### 403 Forbidden
- No tienes permiso para realizar esta acción
- Solo el propietario puede editar/eliminar

### 404 Not Found
- Recurso no encontrado
- Usuario no existe
- Vehículo no existe

### 500 Internal Server Error
- Error del servidor
- Error en la base de datos
- Error en servicio externo

---

## 📝 Notas Adicionales

### Autenticación
- Las sesiones tienen una duración de 7 días
- El token se almacena en cookies httpOnly para seguridad
- También se puede usar en el header `Authorization`

### Imágenes
- El frontend puede enviar imágenes como `data:image/jpeg;base64,{base64_string}`.
- El backend las convierte a archivos en `backend/uploads/vehicles` y guarda en MongoDB solo la URL pública.
- Se recomienda comprimir las imágenes antes de subirlas y configurar `PUBLIC_BASE_URL` en producción.

### Paginación
- Los endpoints de listado soportan paginación con `limite` y `skip`
- Máximo recomendado: 50 items por página

### Limitación de Tasa (Rate Limiting)
- No implementado actualmente
- Recomendado para producción

---

## ⚖️ Aviso Legal Final

**IMPORTANTE:** Esta API y los datos proporcionados son para facilitar el contacto entre compradores y vendedores. GNPS no verifica ni garantiza la veracidad de la información publicada. Todos los usuarios deben verificar independientemente toda la información antes de realizar cualquier transacción.

**USO BAJO SU PROPIA RESPONSABILIDAD.**

---

**Última actualización**: 2024
**Versión**: 1.0.0
**Desarrollado en**: Arequipa, Perú
