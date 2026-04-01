# Guía de Deployment - AQP-Autos by GNPS

Esta guía te ayudará a desplegar tu aplicación AQP-Autos en producción.

## 📋 Checklist Pre-Deployment

Antes de desplegar, asegúrate de haber completado:

- [ ] Backend funcional y testeado
- [ ] Frontend funcional y testeado
- [ ] Variables de entorno configuradas
- [ ] Base de datos lista
- [ ] Cuenta de Google Cloud configurada (para OAuth)
- [ ] Iconos y assets preparados

---

## 🗄️ 1. Deployment de MongoDB

### Opción A: MongoDB Atlas (Recomendado)

1. **Crear cuenta en MongoDB Atlas**
   - https://www.mongodb.com/cloud/atlas/register

2. **Crear un cluster gratuito**
   - Selecciona M0 (Free Tier)
   - Elige la región más cercana

3. **Configurar seguridad**
   - Database Access: Crea un usuario
   - Network Access: Whitelist IP (0.0.0.0/0 para permitir cualquier IP)

4. **Obtener connection string**
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/aqp_autos?retryWrites=true&w=majority
   ```

5. **Actualizar backend/.env**
   ```env
   MONGO_URL=mongodb+srv://usuario:password@cluster.mongodb.net
   DB_NAME=aqp_autos
   ```

---

## 🚀 2. Deployment del Backend

### Opción A: Railway.app (Recomendado)

1. **Crear cuenta en Railway**
   - https://railway.app/

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"

3. **Configurar variables de entorno**
   ```env
   MONGO_URL=mongodb+srv://...
   DB_NAME=aqp_autos
   PORT=8001
   ```

4. **Deploy automático**
   - Railway detectará requirements.txt
   - Instalará dependencias automáticamente
   - Iniciará con `uvicorn server:app --host 0.0.0.0 --port 8001`

5. **Obtener URL del backend**
   - Railway te dará una URL como: `https://aqp-autos-production.up.railway.app`

### Opción B: Render.com

1. **Crear cuenta en Render**
   - https://render.com/

2. **Crear Web Service**
   - Connect tu repositorio de GitHub
   - Selecciona el directorio `/backend`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port 8001`

3. **Configurar variables de entorno**

4. **Deploy**

### Opción C: Emergent Platform

Si tu backend es compatible con el deployment de Emergent:

1. **Guardar código en GitHub**
2. **Usar función "Deploy" en Emergent**
3. **Costo**: 50 créditos/mes

---

## 📱 3. Preparar App Móvil para Build

### Configurar EAS (Expo Application Services)

1. **Instalar EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login en Expo**
   ```bash
   eas login
   ```

3. **Configurar proyecto**
   ```bash
   cd frontend
   eas build:configure
   ```

4. **Actualizar app.json**
   - Ya está configurado con bundle identifier/package name
   - Asegúrate de actualizar `owner` con tu usuario de Expo

5. **Actualizar variables de entorno para producción**
   
   Crear `frontend/.env.production`:
   ```env
   EXPO_PUBLIC_BACKEND_URL=https://tu-backend-en-produccion.railway.app
   ```

6. **Crear eas.json** (si no existe)
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_BACKEND_URL": "https://tu-backend-en-produccion.railway.app"
         }
       },
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal"
       }
     }
   }
   ```

---

## 🤖 4. Build para Android

### Build AAB (Para Google Play Store)

```bash
cd frontend
eas build --platform android --profile production
```

Este comando:
1. Subirá tu código a Expo
2. Compilará la app en la nube
3. Generará un archivo .aab (Android App Bundle)
4. Te dará un link para descargar el archivo

### Publicar en Google Play Store

1. **Crear cuenta de desarrollador**
   - https://play.google.com/console
   - Costo: $25 USD (pago único)

2. **Crear nueva aplicación**
   - Completa información básica
   - Nombre: AQP-Autos by GNPS
   - Categoría: Auto y vehículos

3. **Preparar assets**
   - Ícono de app: 512x512px
   - Feature graphic: 1024x500px
   - Screenshots: Mínimo 2, diferentes tamaños de pantalla
   - Descripción corta y larga
   - Política de privacidad (URL)

4. **Subir AAB**
   - Ve a "Producción" > "Crear nuevo lanzamiento"
   - Sube el archivo .aab descargado de EAS
   - Completa notas de la versión

5. **Enviar para revisión**
   - El proceso puede tomar 1-7 días

---

## 🍎 5. Build para iOS

### Requisitos

- Cuenta de Apple Developer ($99 USD/año)
- No necesitas una Mac (EAS lo hace por ti)

### Build IPA (Para App Store)

```bash
cd frontend
eas build --platform ios --profile production
```

### Publicar en Apple App Store

1. **Crear cuenta de Apple Developer**
   - https://developer.apple.com/

2. **Configurar en App Store Connect**
   - https://appstoreconnect.apple.com/
   - Crear nuevo app
   - Bundle ID: com.gnps.aqpautos

3. **Preparar assets**
   - Ícono de app: 1024x1024px
   - Screenshots para:
     * iPhone 6.7": 1290x2796px
     * iPhone 6.5": 1284x2778px
     * iPad Pro 12.9": 2048x2732px
   - Descripción
   - Keywords
   - Política de privacidad (URL)

4. **Subir build**
   - EAS automáticamente puede subir a App Store Connect
   - O usa `eas submit --platform ios`

5. **Completar información**
   - Categoría: Auto y vehículos
   - Clasificación de edad
   - Información de copyright

6. **Enviar para revisión**
   - El proceso puede tomar 1-2 días (más estricto que Android)

---

## 🔧 6. Configuración de Producción

### Variables de Entorno

**Backend (Railway/Render):**
```env
MONGO_URL=mongodb+srv://...
DB_NAME=aqp_autos
ENVIRONMENT=production
```

**Frontend (EAS):**
```env
EXPO_PUBLIC_BACKEND_URL=https://tu-backend.railway.app
```

### Seguridad

1. **Habilitar HTTPS en backend** (automático en Railway/Render)

2. **Configurar CORS correctamente**
   - Ya está configurado para permitir cualquier origen en desarrollo
   - En producción, considera restringir orígenes

3. **Rate Limiting**
   - Considera agregar rate limiting en producción
   - Ejemplo con FastAPI:
   ```python
   from slowapi import Limiter
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   ```

4. **Monitoreo**
   - Railway/Render proveen logs automáticos
   - Considera Sentry para error tracking

---

## 📊 7. Monitoreo y Mantenimiento

### Logs

**Backend:**
- Railway: Ver logs en dashboard
- Render: Ver logs en dashboard

**MongoDB:**
- MongoDB Atlas: Metrics y logs en dashboard

**App Móvil:**
- Sentry: Error tracking
- Expo Analytics: Usage analytics

### Actualizaciones

**Backend:**
- Push a GitHub → Deploy automático (Railway/Render)

**App Móvil:**
- Build nueva versión con EAS
- Submit a tiendas
- Usuarios reciben actualización

**OTA Updates (Over The Air):**
- Para cambios de JavaScript (no nativos):
  ```bash
  eas update --branch production
  ```
- Los usuarios recibirán la actualización sin ir a las tiendas

---

## 🆘 Solución de Problemas

### Error: "Build failed"
- Revisa los logs de EAS
- Asegúrate de que todas las dependencias estén en package.json
- Verifica que no haya imports incorrectos

### Error: "Backend no responde"
- Verifica que las variables de entorno estén configuradas
- Revisa los logs del backend
- Asegúrate de que MongoDB esté accesible

### Error: "Google OAuth no funciona"
- Verifica que las URLs de redirect estén configuradas en Google Cloud Console
- Asegúrate de que el backend URL sea correcto en el frontend

---

## 📝 Checklist Final

Antes de lanzar:

- [ ] Backend desplegado y funcionando
- [ ] Base de datos en producción
- [ ] Variables de entorno configuradas
- [ ] App compilada para Android (AAB)
- [ ] App compilada para iOS (IPA)
- [ ] Screenshots preparados
- [ ] Descripciones escritas
- [ ] Política de privacidad publicada
- [ ] Iconos y assets finalizados
- [ ] Testing en dispositivos reales
- [ ] Cuentas de tiendas creadas (Google Play / App Store)

---

## 🎯 Próximos Pasos

1. Despliega el backend
2. Actualiza las URLs en el frontend
3. Build de la app con EAS
4. Crea las cuentas en las tiendas
5. Prepara los assets
6. Sube la app
7. Espera aprobación
8. ¡Lanza!

---

**¿Necesitas ayuda?** Consulta la documentación de:
- [Expo EAS](https://docs.expo.dev/eas/)
- [Railway](https://docs.railway.app/)
- [Google Play Console](https://support.google.com/googleplay/android-developer)
- [App Store Connect](https://developer.apple.com/app-store-connect/)
