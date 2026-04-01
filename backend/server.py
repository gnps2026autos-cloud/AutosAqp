from fastapi import FastAPI, APIRouter, HTTPException, Header, Response, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
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
    category: str  # "auto", "moto", "camion"
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
    # Fotos en base64 (5 obligatorias)
    foto_frente: str
    foto_atras: str
    foto_costado_izq: str
    foto_costado_der: str
    foto_interior: str  # tablero con llaves
    # Metadata
    estado: str = "activo"  # "activo", "vendido", "inactivo"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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
    
    # Return user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return User(**user_doc)

@api_router.get("/auth/me")
async def get_me(request: Request, authorization: Optional[str] = Header(None)):
    """Get current authenticated user"""
    user = await get_current_user(request, authorization)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout current user"""
    session_token = request.cookies.get("session_token")
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
    new_vehicle = Vehicle(
        vehicle_id=vehicle_id,
        user_id=user.user_id,
        **vehicle.model_dump()
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
    """Get all vehicles with optional filters (public endpoint)"""
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
    
    vehicles = await db.vehicles.find(
        filters,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limite).to_list(limite)
    
    return [Vehicle(**v) for v in vehicles]

@api_router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str):
    """Get a single vehicle by ID (public endpoint)"""
    vehicle = await db.vehicles.find_one(
        {"vehicle_id": vehicle_id},
        {"_id": 0}
    )
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    return Vehicle(**vehicle)

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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
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
