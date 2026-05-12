from fastapi import FastAPI, APIRouter, HTTPException, Header, Response, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
import base64
import re
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= CONFIGURATION =============

UPLOAD_ROOT = ROOT_DIR / "uploads"
UPLOAD_VEHICLES_DIR = UPLOAD_ROOT / "vehicles"
UPLOAD_VEHICLES_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_DATA_URL_RE = re.compile(r"^data:(image/(?:jpeg|jpg|png|webp));base64,(.+)$", re.IGNORECASE | re.DOTALL)
IMAGE_EXTENSIONS = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
MAX_IMAGE_BASE64_CHARS = int(os.environ.get("MAX_IMAGE_BASE64_CHARS", "6000000"))

def get_public_base_url(request: Request) -> str:
    """Base URL used to serve uploaded images back to the mobile app."""
    return os.environ.get("PUBLIC_BASE_URL") or str(request.base_url).rstrip("/")

def save_image_if_base64(image_value: Optional[str], vehicle_id: str, label: str, request: Request) -> Optional[str]:
    """
    Receives an image as a base64 data URL and stores it as a local file.
    If the value is already an http(s) URL or an /uploads URL, it is returned as-is.
    This keeps large image payloads out of MongoDB.
    """
    if not image_value:
        return image_value

    if image_value.startswith("http://") or image_value.startswith("https://") or image_value.startswith("/uploads/"):
        return image_value

    match = IMAGE_DATA_URL_RE.match(image_value.strip())
    if not match:
        # Keep backwards compatibility with existing URLs/paths, but reject unknown data blobs.
        if image_value.startswith("data:"):
            raise HTTPException(status_code=400, detail=f"Formato de imagen inválido en {label}")
        return image_value

    if len(image_value) > MAX_IMAGE_BASE64_CHARS:
        raise HTTPException(status_code=413, detail=f"La imagen {label} es demasiado pesada")

    mime_type, encoded = match.groups()
    extension = IMAGE_EXTENSIONS.get(mime_type.lower())
    if not extension:
        raise HTTPException(status_code=400, detail=f"Tipo de imagen no permitido en {label}")

    try:
        image_bytes = base64.b64decode(encoded, validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail=f"No se pudo leer la imagen {label}")

    filename = f"{vehicle_id}_{label}_{uuid.uuid4().hex[:10]}.{extension}"
    file_path = UPLOAD_VEHICLES_DIR / filename
    file_path.write_bytes(image_bytes)

    return f"{get_public_base_url(request)}/uploads/vehicles/{filename}"

def prepare_vehicle_images(vehicle_data: Dict, vehicle_id: str, request: Request) -> Dict:
    image_fields = [
        "foto_frente",
        "foto_atras",
        "foto_costado_izq",
        "foto_costado_der",
        "foto_interior",
    ]

    for field in image_fields:
        if field in vehicle_data and vehicle_data[field]:
            vehicle_data[field] = save_image_if_base64(vehicle_data[field], vehicle_id, field, request)

    if "galeria_fotos" in vehicle_data:
        gallery = vehicle_data.get("galeria_fotos") or []
        vehicle_data["galeria_fotos"] = [
            save_image_if_base64(image, vehicle_id, f"galeria_{index + 1}", request)
            for index, image in enumerate(gallery)
            if image
        ]

    return vehicle_data

def get_admin_pin() -> str:
    admin_pin = os.environ.get("ADMIN_PIN")
    if not admin_pin:
        raise HTTPException(
            status_code=500,
            detail="ADMIN_PIN no está configurado en el backend"
        )
    return admin_pin

def get_yape_config() -> Dict:
    return {
        "numero": os.environ.get("YAPE_NUMERO", ""),
        "titular": os.environ.get("YAPE_TITULAR", "AQP-Autos"),
        "planes": {
            "destacado_10d": {
                "nombre": "Anuncio Destacado",
                "descripcion": "Tu anuncio se destaca con badge especial por 10 días",
                "dias": int(os.environ.get("YAPE_PLAN_DESTACADO_DIAS", "10")),
                "monto": float(os.environ.get("YAPE_PLAN_DESTACADO_MONTO", "10.00")),
                "tipo_destacado": "premium"
            },
            "priorizado_5d_7d": {
                "nombre": "Priorizado + Extensión",
                "descripcion": "Priorización por fecha de publicación 5 días + 1 semana adicional",
                "dias": int(os.environ.get("YAPE_PLAN_PRIORIZADO_DIAS", "12")),
                "monto": float(os.environ.get("YAPE_PLAN_PRIORIZADO_MONTO", "5.00")),
                "tipo_destacado": "basico"
            }
        }
    }

def calculate_featured_until(vehicle: Dict, days: int, now: datetime) -> datetime:
    current_until = vehicle.get("fecha_destacado_hasta")
    if vehicle.get("es_destacado") and current_until:
        if isinstance(current_until, str):
            current_until = datetime.fromisoformat(current_until.replace("Z", "+00:00"))
        if current_until.tzinfo is None:
            current_until = current_until.replace(tzinfo=timezone.utc)
        if current_until > now:
            return current_until + timedelta(days=days)
    return now + timedelta(days=days)

def choose_featured_type(current_type: Optional[str], new_type: str) -> str:
    priority = {"basico": 1, "premium": 2, "ultra": 3}
    return new_type if priority.get(new_type, 0) >= priority.get(current_type or "", 0) else current_type

# ============= MODELS =============

class User(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Vehicle(BaseModel):
    vehicle_id: str
    user_id: str
    category: str  # "auto", "camioneta", "suv", "pickup", "van", "minivan", "moto", "scooter", "remolque", "casa_rodante", "camion", "bus", "omnibus", "maquinaria", "otro"
    marca: str
    modelo: str
    anio: int
    precio: float
    kilometraje: int
    color: str
    tipo_combustible: str  # "gasolina", "diesel", "electrico", "hibrido", "gas"
    transmision: str  # "manual", "automatica"
    num_puertas: int
    placa: str
    descripcion: str
    # Ubicación
    ciudad: str  # "Arequipa"
    distrito: Optional[str] = None
    latitude: float
    longitude: float
    # Fotos obligatorias: el frontend envía base64 y el backend guarda URLs de /uploads
    foto_frente: str
    foto_atras: str
    foto_costado_izq: str
    foto_costado_der: str
    foto_interior: str  # tablero con llaves
    # Galería de fotos adicionales (opcional)
    galeria_fotos: Optional[List[str]] = []  # URLs de fotos adicionales
    # Sistema de destacados/premium
    es_destacado: bool = False  # Si el anuncio es destacado/premium
    fecha_destacado_hasta: Optional[datetime] = None  # Hasta cuando está destacado
    tipo_destacado: Optional[str] = None  # "basico" | "premium" | "ultra"
    etiqueta_destacado: Optional[str] = None  # "oferta" | "ocasion" | "por_viaje" | "destacado" | "super_anuncio"
    # Metadata
    estado: str = "activo"  # "activo", "vendido", "inactivo"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VehicleDetail(Vehicle):
    seller_name: Optional[str] = None
    seller_phone: Optional[str] = None

class VehicleCreate(BaseModel):
    category: str
    marca: str
    modelo: str
    anio: int
    precio: float
    kilometraje: int
    color: str
    tipo_combustible: str
    transmision: str
    num_puertas: int
    placa: str
    descripcion: str
    ciudad: str
    distrito: Optional[str] = None
    latitude: float
    longitude: float
    foto_frente: str
    foto_atras: str
    foto_costado_izq: str
    foto_costado_der: str
    foto_interior: str
    galeria_fotos: Optional[List[str]] = []

class VehicleUpdate(BaseModel):
    category: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None
    precio: Optional[float] = None
    kilometraje: Optional[int] = None
    color: Optional[str] = None
    tipo_combustible: Optional[str] = None
    transmision: Optional[str] = None
    num_puertas: Optional[int] = None
    placa: Optional[str] = None
    descripcion: Optional[str] = None
    ciudad: Optional[str] = None
    distrito: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    foto_frente: Optional[str] = None
    foto_atras: Optional[str] = None
    foto_costado_izq: Optional[str] = None
    foto_costado_der: Optional[str] = None
    foto_interior: Optional[str] = None
    galeria_fotos: Optional[List[str]] = None
    estado: Optional[str] = None

class Favorite(BaseModel):
    favorite_id: str
    user_id: str
    vehicle_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionData(BaseModel):
    session_id: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    picture: Optional[str] = None

# ============= AUTH HELPER =============

async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    """
    Get current user from session token (cookie or Authorization header)
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session in database
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Delete expired session
        await db.user_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user_doc)

# ============= AUTH ENDPOINTS =============

@api_router.post("/auth/session")
async def create_session(session_data: SessionData, response: Response):
    """
    Exchange session_id for user data and create persistent session
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    session_id = session_data.session_id
    
    # Call Emergent Auth API to get user data
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            auth_response.raise_for_status()
            user_data = auth_response.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to authenticate: {str(e)}")
    
    # Create or update user
    email = user_data.get("email")
    name = user_data.get("name")
    picture = user_data.get("picture")
    
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = User(
            user_id=user_id,
            email=email,
            name=name,
            picture=picture
        )
        await db.users.insert_one(new_user.model_dump())
        user_doc = new_user.model_dump()
    
    # Create session
    session_token = user_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    # Delete old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    
    # Create new session
    new_session = UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at
    )
    await db.user_sessions.insert_one(new_session.model_dump())
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,  # 7 days
        path="/"
    )
    
    # Return user data WITH session_token for native mobile apps
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    user_response = User(**user_doc).model_dump()
    user_response["session_token"] = session_token
    return user_response

@api_router.get("/auth/me")
async def get_me(request: Request, authorization: Optional[str] = Header(None)):
    """Get current authenticated user"""
    user = await get_current_user(request, authorization)
    return user

@api_router.post("/auth/logout")
async def logout(
    request: Request,
    response: Response,
    authorization: Optional[str] = Header(None)
):
    """Logout current user from cookie or Bearer token."""
    session_token = request.cookies.get("session_token")
    if not session_token and authorization and authorization.startswith("Bearer "):
        session_token = authorization.replace("Bearer ", "")

    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.put("/auth/profile")
async def update_profile(
    request: Request,
    user_update: UserUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update user profile"""
    user = await get_current_user(request, authorization)
    
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return User(**updated_user)

# ============= VEHICLE ENDPOINTS =============

@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(
    request: Request,
    vehicle: VehicleCreate,
    authorization: Optional[str] = Header(None)
):
    """Create a new vehicle listing"""
    user = await get_current_user(request, authorization)
    
    # Validate all 5 photos are present
    if not all([
        vehicle.foto_frente,
        vehicle.foto_atras,
        vehicle.foto_costado_izq,
        vehicle.foto_costado_der,
        vehicle.foto_interior
    ]):
        raise HTTPException(status_code=400, detail="Todas las 5 fotos son obligatorias")
    
    vehicle_id = f"vehicle_{uuid.uuid4().hex[:12]}"
    vehicle_data = prepare_vehicle_images(vehicle.model_dump(), vehicle_id, request)
    new_vehicle = Vehicle(
        vehicle_id=vehicle_id,
        user_id=user.user_id,
        **vehicle_data
    )
    
    await db.vehicles.insert_one(new_vehicle.model_dump())
    return new_vehicle

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles(
    category: Optional[str] = None,
    marca: Optional[str] = None,
    modelo: Optional[str] = None,
    precio_min: Optional[float] = None,
    precio_max: Optional[float] = None,
    anio_min: Optional[int] = None,
    anio_max: Optional[int] = None,
    transmision: Optional[str] = None,
    tipo_combustible: Optional[str] = None,
    limite: int = 50,
    skip: int = 0
):
    """Get all vehicles with optional filters (public endpoint) - Destacados primero"""
    filters = {"estado": "activo"}
    
    if category:
        filters["category"] = category
    if marca:
        filters["marca"] = {"$regex": marca, "$options": "i"}
    if modelo:
        filters["modelo"] = {"$regex": modelo, "$options": "i"}
    if precio_min is not None or precio_max is not None:
        filters["precio"] = {}
        if precio_min is not None:
            filters["precio"]["$gte"] = precio_min
        if precio_max is not None:
            filters["precio"]["$lte"] = precio_max
    if anio_min is not None or anio_max is not None:
        filters["anio"] = {}
        if anio_min is not None:
            filters["anio"]["$gte"] = anio_min
        if anio_max is not None:
            filters["anio"]["$lte"] = anio_max
    if transmision:
        filters["transmision"] = transmision
    if tipo_combustible:
        filters["tipo_combustible"] = tipo_combustible
    
    # Obtener vehículos destacados primero, luego normales
    # Ordenar por: es_destacado (DESC), tipo_destacado (ultra > premium > basico), created_at (DESC)
    pipeline = [
        {"$match": filters},
        {
            "$addFields": {
                "destacado_activo": {
                    "$cond": {
                        "if": {
                            "$and": [
                                {"$eq": ["$es_destacado", True]},
                                {"$gte": ["$fecha_destacado_hasta", datetime.now(timezone.utc)]}
                            ]
                        },
                        "then": 1,
                        "else": 0
                    }
                },
                "prioridad_tipo": {
                    "$switch": {
                        "branches": [
                            {"case": {"$eq": ["$tipo_destacado", "ultra"]}, "then": 3},
                            {"case": {"$eq": ["$tipo_destacado", "premium"]}, "then": 2},
                            {"case": {"$eq": ["$tipo_destacado", "basico"]}, "then": 1}
                        ],
                        "default": 0
                    }
                }
            }
        },
        {"$sort": {"destacado_activo": -1, "prioridad_tipo": -1, "created_at": -1}},
        {"$skip": skip},
        {"$limit": limite},
        {"$project": {"_id": 0, "destacado_activo": 0, "prioridad_tipo": 0}}
    ]
    
    vehicles = await db.vehicles.aggregate(pipeline).to_list(limite)
    
    return [Vehicle(**v) for v in vehicles]

@api_router.get("/vehicles/{vehicle_id}", response_model=VehicleDetail)
async def get_vehicle(vehicle_id: str):
    """Get a single vehicle by ID with public seller contact fields."""
    vehicle = await db.vehicles.find_one(
        {"vehicle_id": vehicle_id},
        {"_id": 0}
    )
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    seller = await db.users.find_one(
        {"user_id": vehicle.get("user_id")},
        {"_id": 0, "name": 1, "phone": 1}
    )
    if seller:
        vehicle["seller_name"] = seller.get("name")
        vehicle["seller_phone"] = seller.get("phone")
    
    return VehicleDetail(**vehicle)

@api_router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(
    request: Request,
    vehicle_id: str,
    vehicle_update: VehicleUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update a vehicle (only owner can update)"""
    user = await get_current_user(request, authorization)
    
    # Check if vehicle exists and belongs to user
    vehicle = await db.vehicles.find_one(
        {"vehicle_id": vehicle_id},
        {"_id": 0}
    )
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    if vehicle["user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este vehículo")
    
    # Update vehicle
    update_data = {k: v for k, v in vehicle_update.model_dump().items() if v is not None}
    update_data = prepare_vehicle_images(update_data, vehicle_id, request)
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.vehicles.update_one(
        {"vehicle_id": vehicle_id},
        {"$set": update_data}
    )
    
    updated_vehicle = await db.vehicles.find_one(
        {"vehicle_id": vehicle_id},
        {"_id": 0}
    )
    
    return Vehicle(**updated_vehicle)

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(
    request: Request,
    vehicle_id: str,
    authorization: Optional[str] = Header(None)
):
    """Delete a vehicle (only owner can delete)"""
    user = await get_current_user(request, authorization)
    
    # Check if vehicle exists and belongs to user
    vehicle = await db.vehicles.find_one(
        {"vehicle_id": vehicle_id},
        {"_id": 0}
    )
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    if vehicle["user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este vehículo")
    
    # Soft delete (set estado to "inactivo")
    await db.vehicles.update_one(
        {"vehicle_id": vehicle_id},
        {"$set": {"estado": "inactivo", "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Vehículo eliminado exitosamente"}

@api_router.get("/vehicles/user/my-vehicles", response_model=List[Vehicle])
async def get_my_vehicles(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Get all vehicles of the authenticated user"""
    user = await get_current_user(request, authorization)
    
    vehicles = await db.vehicles.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [Vehicle(**v) for v in vehicles]

# ============= DESTACADOS/PREMIUM ENDPOINTS =============

class Payment(BaseModel):
    payment_id: str
    vehicle_id: str
    user_id: str
    tipo_pago: str  # "destacado_10d" | "priorizado_5d_7d"
    monto: float
    numero_operacion: str
    estado: str = "pendiente"  # "pendiente" | "verificado" | "rechazado"
    placa: str = ""
    marca_modelo: str = ""
    etiqueta_destacado: Optional[str] = "destacado"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verificado_por: Optional[str] = None
    verificado_at: Optional[datetime] = None

class PromoteVehicleRequest(BaseModel):
    tipo_pago: str
    numero_operacion: str
    etiqueta: Optional[str] = "destacado"

ETIQUETAS_VALIDAS = ["oferta", "ocasion", "por_viaje", "destacado", "super_anuncio"]

class VerifyPaymentRequest(BaseModel):
    estado: str  # "verificado" | "rechazado"

YAPE_CONFIG = get_yape_config()

@api_router.get("/payments/config")
async def get_payment_config():
    """Obtener configuración de pagos (público)."""
    return {
        "yape_numero": YAPE_CONFIG["numero"],
        "yape_titular": YAPE_CONFIG["titular"],
        "planes": YAPE_CONFIG["planes"]
    }

@api_router.post("/vehicles/{vehicle_id}/promote")
async def promote_vehicle(
    request: Request,
    vehicle_id: str,
    promote_data: PromoteVehicleRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Registra una solicitud de destacado con comprobante Yape.
    El anuncio queda pendiente hasta que un administrador verifique el pago.
    """
    user = await get_current_user(request, authorization)

    vehicle = await db.vehicles.find_one(
        {"vehicle_id": vehicle_id},
        {"_id": 0}
    )

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    if vehicle["user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para destacar este vehículo")

    if promote_data.tipo_pago not in YAPE_CONFIG["planes"]:
        raise HTTPException(status_code=400, detail="Tipo de pago inválido. Use 'destacado_10d' o 'priorizado_5d_7d'")

    numero_operacion = promote_data.numero_operacion.strip() if promote_data.numero_operacion else ""
    if len(numero_operacion) < 3:
        raise HTTPException(status_code=400, detail="Número de operación Yape inválido")

    etiqueta = promote_data.etiqueta or "destacado"
    if etiqueta not in ETIQUETAS_VALIDAS:
        raise HTTPException(status_code=400, detail=f"Etiqueta inválida. Opciones: {', '.join(ETIQUETAS_VALIDAS)}")

    existing_payment = await db.payments.find_one(
        {"numero_operacion": numero_operacion},
        {"_id": 0}
    )
    if existing_payment:
        raise HTTPException(status_code=400, detail="Este número de operación ya fue utilizado")

    plan = YAPE_CONFIG["planes"][promote_data.tipo_pago]

    payment_id = f"pay_{uuid.uuid4().hex[:12]}"
    new_payment = Payment(
        payment_id=payment_id,
        vehicle_id=vehicle_id,
        user_id=user.user_id,
        tipo_pago=promote_data.tipo_pago,
        monto=plan["monto"],
        numero_operacion=numero_operacion,
        estado="pendiente",
        placa=vehicle.get("placa", ""),
        marca_modelo=f"{vehicle.get('marca', '')} {vehicle.get('modelo', '')}".strip(),
        etiqueta_destacado=etiqueta
    )
    await db.payments.insert_one(new_payment.model_dump())

    return {
        "message": "Pago registrado. Tu anuncio quedará destacado cuando el administrador verifique el Yape.",
        "payment_id": payment_id,
        "plan": plan["nombre"],
        "monto": plan["monto"],
        "dias": plan["dias"],
        "numero_operacion": numero_operacion,
        "estado": "pendiente",
        "nota": "El destacado no se activa automáticamente. Revisa el panel admin para aprobar o rechazar el pago."
    }

@api_router.get("/vehicles/featured/list")
async def get_featured_vehicles(limite: int = 20):
    """Obtener solo vehículos destacados activos."""
    now = datetime.now(timezone.utc)

    vehicles = await db.vehicles.find(
        {
            "estado": "activo",
            "es_destacado": True,
            "fecha_destacado_hasta": {"$gte": now}
        },
        {"_id": 0}
    ).sort([
        ("created_at", -1)
    ]).limit(limite).to_list(limite)

    return [Vehicle(**v) for v in vehicles]

# ============= ADMIN ENDPOINTS =============

@api_router.post("/admin/login")
async def admin_login(request: Request):
    """Verificar PIN de administrador configurado por variable de entorno."""
    body = await request.json()
    pin = body.get("pin", "")
    if pin != get_admin_pin():
        raise HTTPException(status_code=403, detail="PIN de administrador incorrecto")
    return {"message": "Acceso de administrador concedido", "admin": True}

@api_router.get("/admin/payments")
async def get_admin_payments(
    request: Request,
    estado: Optional[str] = None,
    limite: int = 50,
    skip: int = 0
):
    """Obtener lista de pagos para verificación de administrador."""
    body_pin = request.headers.get("X-Admin-Pin", "")
    if body_pin != get_admin_pin():
        raise HTTPException(status_code=403, detail="Acceso de administrador requerido")

    filters: Dict = {}
    if estado:
        filters["estado"] = estado

    payments = await db.payments.find(
        filters,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limite).to_list(limite)

    total = await db.payments.count_documents(filters)

    return {
        "payments": payments,
        "total": total,
        "skip": skip,
        "limite": limite
    }

@api_router.put("/admin/payments/{payment_id}/verify")
async def verify_payment(
    request: Request,
    payment_id: str,
    verify_data: VerifyPaymentRequest
):
    """Verificar o rechazar un pago. Solo al verificar se activa el destacado."""
    body_pin = request.headers.get("X-Admin-Pin", "")
    if body_pin != get_admin_pin():
        raise HTTPException(status_code=403, detail="Acceso de administrador requerido")

    if verify_data.estado not in ["verificado", "rechazado"]:
        raise HTTPException(status_code=400, detail="Estado inválido. Use 'verificado' o 'rechazado'")

    payment = await db.payments.find_one(
        {"payment_id": payment_id},
        {"_id": 0}
    )

    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    if payment.get("estado") == "verificado" and verify_data.estado == "verificado":
        return {
            "message": "El pago ya estaba verificado",
            "payment_id": payment_id,
            "estado": payment.get("estado")
        }

    now = datetime.now(timezone.utc)

    update_payment_data = {
        "estado": verify_data.estado,
        "verificado_at": now,
        "verificado_por": "admin"
    }

    result_payload = {
        "message": f"Pago {verify_data.estado} exitosamente",
        "payment_id": payment_id,
        "estado": verify_data.estado
    }

    if verify_data.estado == "verificado":
        vehicle = await db.vehicles.find_one(
            {"vehicle_id": payment["vehicle_id"]},
            {"_id": 0}
        )
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehículo asociado no encontrado")

        plan = YAPE_CONFIG["planes"].get(payment["tipo_pago"])
        if not plan:
            raise HTTPException(status_code=400, detail="Plan de pago inválido")

        fecha_hasta = calculate_featured_until(vehicle, plan["dias"], now)
        final_tipo = choose_featured_type(vehicle.get("tipo_destacado"), plan["tipo_destacado"])
        etiqueta = payment.get("etiqueta_destacado") or "destacado"

        await db.vehicles.update_one(
            {"vehicle_id": payment["vehicle_id"]},
            {
                "$set": {
                    "es_destacado": True,
                    "tipo_destacado": final_tipo,
                    "fecha_destacado_hasta": fecha_hasta,
                    "etiqueta_destacado": etiqueta,
                    "updated_at": now
                }
            }
        )
        update_payment_data["fecha_destacado_hasta"] = fecha_hasta
        result_payload["valido_hasta"] = fecha_hasta.isoformat()

    await db.payments.update_one(
        {"payment_id": payment_id},
        {"$set": update_payment_data}
    )

    return result_payload

# ============= FAVORITES ENDPOINTS =============

@api_router.post("/favorites/{vehicle_id}")
async def add_favorite(
    request: Request,
    vehicle_id: str,
    authorization: Optional[str] = Header(None)
):
    """Add vehicle to favorites"""
    user = await get_current_user(request, authorization)
    
    # Check if vehicle exists
    vehicle = await db.vehicles.find_one({"vehicle_id": vehicle_id})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Check if already favorited
    existing = await db.favorites.find_one({
        "user_id": user.user_id,
        "vehicle_id": vehicle_id
    })
    
    if existing:
        return {"message": "Ya está en favoritos"}
    
    # Add to favorites
    favorite_id = f"fav_{uuid.uuid4().hex[:12]}"
    new_favorite = Favorite(
        favorite_id=favorite_id,
        user_id=user.user_id,
        vehicle_id=vehicle_id
    )
    
    await db.favorites.insert_one(new_favorite.model_dump())
    return {"message": "Añadido a favoritos"}

@api_router.delete("/favorites/{vehicle_id}")
async def remove_favorite(
    request: Request,
    vehicle_id: str,
    authorization: Optional[str] = Header(None)
):
    """Remove vehicle from favorites"""
    user = await get_current_user(request, authorization)
    
    result = await db.favorites.delete_one({
        "user_id": user.user_id,
        "vehicle_id": vehicle_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No está en favoritos")
    
    return {"message": "Eliminado de favoritos"}

@api_router.get("/favorites", response_model=List[Vehicle])
async def get_favorites(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Get all favorite vehicles of the authenticated user"""
    user = await get_current_user(request, authorization)
    
    # Get favorite vehicle IDs
    favorites = await db.favorites.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(100)
    
    vehicle_ids = [fav["vehicle_id"] for fav in favorites]
    
    if not vehicle_ids:
        return []
    
    # Get vehicles
    vehicles = await db.vehicles.find(
        {"vehicle_id": {"$in": vehicle_ids}, "estado": "activo"},
        {"_id": 0}
    ).to_list(100)
    
    return [Vehicle(**v) for v in vehicles]

@api_router.get("/favorites/check/{vehicle_id}")
async def check_favorite(
    request: Request,
    vehicle_id: str,
    authorization: Optional[str] = Header(None)
):
    """Check if vehicle is in favorites"""
    user = await get_current_user(request, authorization)
    
    favorite = await db.favorites.find_one({
        "user_id": user.user_id,
        "vehicle_id": vehicle_id
    })
    
    return {"is_favorite": favorite is not None}

# ============= HEALTH CHECK =============

@api_router.get("/")
async def root():
    return {"message": "AutoArequipa API", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")

cors_origins = [origin.strip() for origin in os.environ.get("CORS_ORIGINS", "*").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
