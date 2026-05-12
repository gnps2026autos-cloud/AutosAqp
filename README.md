# AQP-Autos by GNPS

Aplicación móvil para compra y venta de vehículos en la región de Arequipa, Perú.

![Versión](https://img.shields.io/badge/versi%C3%B3n-1.0.0-blue.svg)
![Plataforma](https://img.shields.io/badge/plataforma-iOS%20%7C%20Android-green.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-black.svg)

---

## ⚠️ EXENCIÓN DE RESPONSABILIDAD

**AQP-Autos by GNPS** es una plataforma de intermediación que facilita el contacto entre compradores y vendedores de vehículos. Al usar esta aplicación, usted acepta los siguientes términos:

### Responsabilidades del Usuario

1. **Veracidad de la Información**: Los usuarios son responsables de la veracidad, exactitud y legalidad de la información publicada en sus anuncios.

2. **Transacciones**: AQP-Autos NO participa en las transacciones entre compradores y vendedores. Todas las negociaciones, acuerdos y transacciones se realizan directamente entre las partes.

3. **Estado de Vehículos**: No garantizamos el estado, condición, funcionamiento o legalidad de los vehículos publicados. Es responsabilidad del comprador verificar toda la información antes de realizar una compra.

4. **Documentación Legal**: Los usuarios deben verificar que todos los documentos del vehículo (SOAT, revisión técnica, tarjeta de propiedad, etc.) estén en regla antes de cualquier transacción.

### Limitación de Responsabilidad

- **NO** nos hacemos responsables por pérdidas, daños o perjuicios derivados del uso de esta plataforma.
- **NO** garantizamos la exactitud de la información publicada por los usuarios.
- **NO** somos responsables por fraudes, estafas o transacciones fraudulentas entre usuarios.
- **NO** garantizamos la disponibilidad continua del servicio.

### Recomendaciones de Seguridad

- Siempre verifique la identidad del vendedor/comprador.
- Realice inspección física del vehículo antes de comprar.
- Verifique toda la documentación legal.
- Evite realizar pagos adelantados sin garantías.
- Realice transacciones en lugares públicos y seguros.
- Consulte con profesionales (mecánicos, abogados) antes de comprar.

**AL USAR ESTA APLICACIÓN, USTED ACEPTA ESTOS TÉRMINOS Y EXIME A AQP-AUTOS BY GNPS DE CUALQUIER RESPONSABILIDAD.**

---

## 📱 Descripción

AQP-Autos es una plataforma móvil moderna estilo Wallapop diseñada específicamente para el mercado de vehículos en Arequipa. Permite a los usuarios publicar, buscar y contactar vendedores de vehículos con una interfaz intuitiva y moderna.

### Características Principales

- 🚗 **13 Categorías de Vehículos**: Autos, Camionetas, SUV, Pickup, Van, Mini Van, Motos, Scooters, Remolques, Casas Rodantes, Camiones, Buses, Ómnibus, Maquinaria
- 📸 **Galería de Fotos**: 5 fotos obligatorias + galería adicional ilimitada
- 🔍 **Búsqueda y Filtros Avanzados**: Por categoría, precio, año, transmisión, combustible
- ⭐ **Sistema de Favoritos**: Guarda los vehículos que te interesan
- 📍 **Ubicación GPS**: Geolocalización de vehículos en Arequipa
- 🔐 **Autenticación con Google**: Inicio de sesión rápido y seguro
- ⛽ **9 Tipos de Combustible**: Gasolina, Gasolina-GLP, Gasolina-GNV, Diesel, Diesel-Urea, Eléctrico, Híbrido, Gas, Otros

## 🎨 Diseño

- **Colores**: Fondo blanco, Azul Turquesa (#00BCD4), Naranja (#FF6B35)
- **Estilo**: Moderno, inspirado en Wallapop
- **UX**: Navegación por pestañas, filtros intuitivos, tarjetas con información esencial

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework**: Expo (React Native)
- **Navegación**: Expo Router (enrutamiento basado en archivos)
- **Estado**: React Context API
- **Cliente HTTP**: Axios
- **Formularios**: React Hook Form
- **Imágenes**: Expo Image Picker; el backend convierte base64 a archivos servidos por `/uploads`
- **Ubicación**: Expo Location
- **Mapas**: React Native Maps

### Backend
- **Framework**: FastAPI (Python)
- **Base de Datos**: MongoDB
- **Autenticación**: Google OAuth vía Emergent Auth
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
git clone <url-del-repositorio>
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
MONGO_URL=mongodb://localhost:27017
DB_NAME=aqp_autos
ADMIN_PIN=cambia_este_pin
PUBLIC_BASE_URL=
CORS_ORIGINS=*
YAPE_NUMERO=938567871
YAPE_TITULAR=AQP-Autos
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
# Asegúrate de que MongoDB esté en ejecución
mongod
```

### 5. Iniciar el Backend

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 6. Iniciar la Aplicación Móvil

```bash
cd frontend
expo start
# o yarn start
```

Escanea el código QR con:
- **iOS**: Aplicación Expo Go
- **Android**: Aplicación Expo Go

## 📱 Uso en Desarrollo

### Aplicación Expo Go

1. Descarga Expo Go desde tu tienda de aplicaciones
2. Escanea el código QR que aparece en la terminal
3. La aplicación se cargará en tu dispositivo

### Vista Previa Web

La aplicación también funciona en el navegador:
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
│   │   ├── (tabs)/            # Pantallas principales con pestañas
│   │   ├── vehicle/           # Detalles de vehículos
│   │   └── _layout.tsx        # Layout principal
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── contexts/          # React Contexts
│   │   ├── utils/             # Utilidades y helpers
│   │   ├── constants/         # Constantes y configuración
│   │   └── types/             # Tipos TypeScript
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

## 📊 Endpoints de la API

Ver documentación completa en [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Principales Endpoints:

- **Autenticación**
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

## 🧪 Pruebas

```bash
# Pruebas del backend
cd backend
pytest

# Pruebas del frontend (si está configurado)
cd frontend
yarn test
```

## 📦 Compilación para Producción

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

## 🚀 Despliegue

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

### Aplicación Móvil

- Google Play Store (Android)
- Apple App Store (iOS)

## 🔐 Seguridad

- ✅ Autenticación OAuth con Google
- ✅ Sesiones con tokens seguros
- ✅ Validación de datos en backend con Pydantic
- ✅ HTTPS en producción (recomendado)
- ✅ Variables de entorno para credenciales sensibles

## 📝 Validaciones

La aplicación incluye validaciones estrictas:
- ✅ 5 fotos obligatorias por vehículo
- ✅ Todos los campos del formulario son obligatorios
- ✅ Ubicación GPS obligatoria
- ✅ Validación de formato de datos (año, precio, kilometraje)

## 🐛 Solución de Problemas

### Error: "No se puede conectar al backend"
- Verifica que el backend esté en ejecución en el puerto correcto
- Revisa la variable `EXPO_PUBLIC_BACKEND_URL` en `.env`

### Error: "Falló la conexión a MongoDB"
- Asegúrate de que MongoDB esté en ejecución
- Verifica la variable `MONGO_URL` en el backend

### Las imágenes no se muestran
- El backend guarda las fotos como archivos en `backend/uploads/vehicles` y devuelve URLs públicas.
- Verifica que `PUBLIC_BASE_URL` apunte a la URL real del backend si pruebas desde un celular físico.
- En desarrollo local, asegúrate de que el dispositivo pueda acceder a `EXPO_PUBLIC_BACKEND_URL`.

## 📄 Licencia

[Especifica tu licencia aquí]

## 👥 Autores

GNPS - AQP-Autos

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz un Fork del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/NuevaFuncionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte o preguntas, contacta a [tu-email@ejemplo.com]

## 🗺️ Hoja de Ruta

### Próximas Funcionalidades
- [ ] Sistema de pagos Yape/Plin (5 soles por publicación)
- [ ] Chat en tiempo real entre compradores y vendedores
- [ ] Sistema de calificaciones y reseñas
- [ ] Notificaciones push
- [ ] Búsqueda por voz
- [ ] Comparador de vehículos
- [ ] Historial de precios

---

## ⚖️ Términos Legales

Al usar AQP-Autos by GNPS, usted acepta:

1. Que la plataforma es solo un intermediario
2. Que es responsable de verificar toda la información
3. Que las transacciones son entre usuarios
4. Los términos completos en el disclaimer arriba

**Este software se proporciona "tal cual" sin garantías de ningún tipo.**

---

**Hecho con ❤️ en Arequipa, Perú**
