# Correcciones aplicadas en AutosAqp

## Seguridad y configuración
- `ADMIN_PIN` ya no está hardcodeado en `server.py`; ahora se lee desde `backend/.env`.
- El número y titular de Yape se leen desde variables de entorno (`YAPE_NUMERO`, `YAPE_TITULAR`).
- Se agregaron archivos `backend/.env.example` y `frontend/.env.example`.
- Se limpió `.gitignore` y se excluyeron cachés, envs reales y uploads generados.

## Pagos / destacados
- El pago por Yape ya no activa el destacado automáticamente.
- Ahora el pago queda en estado `pendiente`.
- El panel admin puede `verificar` o `rechazar` pagos.
- Solo al verificar un pago se activa el destacado del vehículo.
- Se actualizó el frontend para mostrar el nuevo flujo pendiente de verificación.

## Imágenes
- Las imágenes pueden seguir enviándose desde el frontend como base64.
- El backend ahora convierte esas imágenes en archivos locales dentro de `backend/uploads/vehicles`.
- MongoDB guarda URLs públicas a `/uploads/vehicles/...`, no el texto base64 completo.
- Se agregó límite de tamaño por imagen con `MAX_IMAGE_BASE64_CHARS`.

## Contacto del vendedor
- El detalle del vehículo ahora devuelve `seller_name` y `seller_phone`.
- Los botones de WhatsApp y llamada ya no usan un número falso.
- Se agregó edición de perfil para guardar nombre y teléfono/WhatsApp del vendedor.
- Si el vendedor no registra teléfono, la app muestra un aviso en lugar de abrir un número falso.

## Frontend
- Se corrigió `app.json`: el splash ahora apunta a `splash-image.png`, archivo que sí existe.
- `VehicleCreate` ahora incluye `galeria_fotos` en los tipos TypeScript.
- La pantalla de detalle muestra también las fotos adicionales de `galeria_fotos`.
- El número de Yape se obtiene desde `/api/payments/config`.
- El logout móvil ahora envía el Bearer token para cerrar la sesión del backend.

## Limpieza
- Se eliminó `.metro-cache` del repositorio.
- Se limpió `.gitignore`, quitando entradas repetidas y líneas `-e` inválidas.
- Se actualizó README/API docs para reflejar Expo SDK 54, uploads y pagos pendientes.

## Ajustes adicionales aplicados en v2

- La pantalla de pago del frontend ahora lee precios, días y descripciones desde `/api/payments/config`; así no quedan montos hardcodeados en la UI.
- Los scripts de prueba `backend_test.py` y `payment_flow_test.py` ya no apuntan a una URL pública fija ni usan tokens de prueba hardcodeados: ahora leen `API_BASE_URL`, `TEST_USER_TOKEN`, `TEST_USER_1_TOKEN` y `TEST_USER_2_TOKEN` desde variables de entorno.
- Se volvió a validar la sintaxis del backend con `python -m py_compile`.
- Se revisó sintaxis TSX de las pantallas modificadas con `tsc` en modo parseo, sin errores de sintaxis.

## Corrección v3 - Dependencias locales

- Se eliminó `emergentintegrations==0.1.0` de `backend/requirements.txt` porque no existe en PyPI y bloqueaba la instalación.
- Se reemplazó el archivo de requerimientos por una lista mínima y estable para ejecutar el backend localmente.
- Se reforzaron los archivos `.env.example` de backend y frontend.
- Se eliminó `__pycache__` del ZIP final.

Comando recomendado para levantar backend:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```


## v4 - Inicio de sesión sin Emergent para APK

- Se agregó `POST /api/auth/demo-login` en el backend.
- Se reemplazó la pantalla de login móvil por un formulario local de nombre, correo y teléfono.
- Se mantiene el endpoint antiguo `/api/auth/session`, pero la APK ya no depende de Emergent Auth.
- Se configuró `usesCleartextTraffic` para permitir `http://IP_LOCAL:8001` durante pruebas en Android.
- Se actualizó `eas.json` para que el perfil `preview` reciba `EXPO_PUBLIC_BACKEND_URL`.

