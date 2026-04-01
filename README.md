# AQP-Autos by GNPS

Aplicación móvil para compra y venta de vehículos en la región de Arequipa, Perú.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-green.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2053-black.svg)

## 📱 Descripción

AQP-Autos es una plataforma móvil moderna estilo Wallapop diseñada específicamente para el mercado de vehículos en Arequipa. Permite a los usuarios publicar, buscar y contactar vendedores de vehículos con una interfaz intuitiva y moderna.

### Características Principales

- 🚗 **13 Categorías de Vehículos**: Autos, Camionetas, SUV, Pickup, Van, Mini Van, Motos, Scooters, Remolques, Casas Rodantes, Camiones, Buses, Ómnibus, Maquinaria
- 📸 **Galería de Fotos**: 5 fotos obligatorias + galería adicional ilimitada
- 🔍 **Búsqueda y Filtros Avanzados**: Por categoría, precio, año, transmisión, combustible
- ⭐ **Sistema de Favoritos**: Guarda los vehículos que te interesan
- 📍 **Ubicación GPS**: Geolocalización de vehículos en Arequipa
- 🔐 **Autenticación Google OAuth**: Login rápido y seguro
- ⛽ **9 Tipos de Combustible**: Gasolina, Gasolina-GLP, Gasolina-GNV, Diesel, Diesel-Urea, Eléctrico, Híbrido, Gas, Otros

## 🎨 Diseño

- **Colores**: Fondo blanco, Azul Turquesa (#00BCD4), Naranja (#FF6B35)
- **Estilo**: Moderno, inspirado en Wallapop
- **UX**: Navegación por tabs, filtros intuitivos, cards con información esencial

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Expo (React Native)
- **Navegación**: Expo Router (file-based routing)
- **Estado**: React Context API
- **HTTP Client**: Axios
- **Formularios**: React Hook Form
- **Imágenes**: Expo Image Picker (base64)
- **Ubicación**: Expo Location
- **Mapas**: React Native Maps

### Backend
- **Framework**: FastAPI (Python)
- **Base de Datos**: MongoDB
- **Autenticación**: Google OAuth via Emergent Auth
- **Validación**: Pydantic

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Python 3.11+
- MongoDB
- Expo CLI
- Cuenta de Google Cloud (para OAuth)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd aqp-autos
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

**Archivo `.env` del backend:**
```env
MONGO_URL=mongodb://localhost:27017/aqp_autos
DB_NAME=aqp_autos
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
yarn install
# o npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración
```

**Archivo `.env` del frontend:**
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

### 4. Iniciar MongoDB

```bash
# Asegúrate de que MongoDB esté corriendo
mongod
```

### 5. Iniciar el Backend

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 6. Iniciar la App Móvil

```bash
cd frontend
expo start
# o yarn start
```

Escanea el QR con:
- **iOS**: Expo Go app
- **Android**: Expo Go app

## 📱 Uso en Desarrollo

### Expo Go App

1. Descarga Expo Go desde tu tienda de aplicaciones
2. Escanea el QR que aparece en la terminal
3. La app se cargará en tu dispositivo

### Web Preview

La app también funciona en navegador:
```bash
expo start --web
```

## 🔧 Scripts Disponibles

### Frontend
```bash
yarn start          # Inicia Expo en modo desarrollo
yarn android        # Abre en emulador Android
yarn ios            # Abre en simulador iOS
yarn web            # Abre en navegador
```

### Backend
```bash
python server.py    # Inicia el servidor
```

## 📁 Estructura del Proyecto

```
aqp-autos/
├── frontend/
│   ├── app/                    # Rutas de la aplicación (Expo Router)
│   │   ├── (auth)/            # Pantallas de autenticación
│   │   ├── (tabs)/            # Pantallas principales con tabs
│   │   ├── vehicle/           # Detalles de vehículos
│   │   └── _layout.tsx        # Layout principal
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── contexts/          # React Contexts
│   │   ├── utils/             # Utilidades y helpers
│   │   ├── constants/         # Constantes y configuración
│   │   └── types/             # TypeScript types
│   ├── assets/                # Imágenes, fuentes, etc.
│   └── app.json              # Configuración de Expo
├── backend/
│   ├── server.py             # Servidor FastAPI
│   └── requirements.txt      # Dependencias Python
└── README.md
```

## 🔑 Variables de Entorno

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/aqp_autos
DB_NAME=aqp_autos
```

### Frontend (.env)
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

**⚠️ IMPORTANTE**: Para producción, actualiza estas variables con tus URLs de producción.

## 📊 API Endpoints

Ver documentación completa en [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Principales Endpoints:

- **Auth**
  - `POST /api/auth/session` - Crear sesión
  - `GET /api/auth/me` - Obtener usuario actual
  - `POST /api/auth/logout` - Cerrar sesión

- **Vehículos**
  - `GET /api/vehicles` - Listar vehículos (con filtros)
  - `POST /api/vehicles` - Crear vehículo
  - `GET /api/vehicles/{id}` - Obtener vehículo
  - `PUT /api/vehicles/{id}` - Actualizar vehículo
  - `DELETE /api/vehicles/{id}` - Eliminar vehículo

- **Favoritos**
  - `GET /api/favorites` - Listar favoritos
  - `POST /api/favorites/{vehicle_id}` - Agregar favorito
  - `DELETE /api/favorites/{vehicle_id}` - Eliminar favorito

## 🧪 Testing

```bash
# Backend testing
cd backend
pytest

# Frontend testing (si está configurado)
cd frontend
yarn test
```

## 📦 Build para Producción

### Android (APK/AAB)

```bash
cd frontend
eas build --platform android
```

### iOS (IPA)

```bash
cd frontend
eas build --platform ios
```

**Nota**: Requiere configurar EAS (Expo Application Services)

## 🚀 Deployment

### Backend

Opciones recomendadas:
- Railway
- Render
- DigitalOcean
- AWS EC2
- Google Cloud Run

### Base de Datos

- MongoDB Atlas (recomendado)
- MongoDB en servidor propio

### App Móvil

- Google Play Store (Android)
- Apple App Store (iOS)

## 🔐 Seguridad

- ✅ Autenticación OAuth con Google
- ✅ Sesiones con tokens seguros
- ✅ Validación de datos en backend con Pydantic
- ✅ HTTPS en producción (recomendado)
- ✅ Variables de entorno para credenciales sensibles

## 📝 Validaciones

La app incluye validaciones estrictas:
- ✅ 5 fotos obligatorias por vehículo
- ✅ Todos los campos del formulario son obligatorios
- ✅ Ubicación GPS obligatoria
- ✅ Validación de formato de datos (año, precio, kilometraje)

## 🐛 Solución de Problemas

### Error: "Cannot connect to backend"
- Verifica que el backend esté corriendo en el puerto correcto
- Revisa la variable `EXPO_PUBLIC_BACKEND_URL` en `.env`

### Error: "MongoDB connection failed"
- Asegúrate de que MongoDB esté corriendo
- Verifica la variable `MONGO_URL` en el backend

### Las imágenes no se muestran
- Las imágenes se guardan en base64
- Verifica que la conversión a base64 esté funcionando

## 📄 Licencia

[Especifica tu licencia aquí]

## 👥 Autores

GNPS - AQP-Autos

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte o preguntas, contacta a [tu-email@ejemplo.com]

## 🗺️ Roadmap

### Próximas Funcionalidades
- [ ] Sistema de pagos Yape/Plin (5 soles por publicación)
- [ ] Chat en tiempo real entre compradores y vendedores
- [ ] Sistema de calificaciones y reviews
- [ ] Notificaciones push
- [ ] Búsqueda por voz
- [ ] Comparador de vehículos
- [ ] Historial de precios

---

**Hecho con ❤️ en Arequipa, Perú**
