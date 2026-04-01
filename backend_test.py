#!/usr/bin/env python3
"""
AutoArequipa Backend API Testing Suite
Tests all backend endpoints for the vehicle marketplace app
"""

import requests
import json
import base64
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Test configuration
BASE_URL = "https://carsell-regional.preview.emergentagent.com/api"
TEST_USER_1_TOKEN = "test_session_1775078939901"
TEST_USER_2_TOKEN = "test_session2_1775078939901"

# Test data
SAMPLE_VEHICLE_DATA = {
    "category": "auto",
    "marca": "Toyota",
    "modelo": "Corolla",
    "anio": 2020,
    "precio": 25000.0,
    "kilometraje": 50000,
    "color": "Blanco",
    "tipo_combustible": "gasolina",
    "transmision": "automatica",
    "num_puertas": 4,
    "placa": "ABC-123",
    "descripcion": "Vehículo en excelente estado, único dueño",
    "ciudad": "Arequipa",
    "distrito": "Cercado",
    "latitude": -16.4090,
    "longitude": -71.5375,
    "foto_frente": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "foto_atras": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "foto_costado_izq": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "foto_costado_der": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "foto_interior": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
}

SAMPLE_VEHICLE_DATA_2 = {
    "category": "moto",
    "marca": "Honda",
    "modelo": "CBR 600",
    "anio": 2019,
    "precio": 15000.0,
    "kilometraje": 25000,
    "color": "Rojo",
    "tipo_combustible": "gasolina",
    "transmision": "manual",
    "num_puertas": 0,
    "placa": "XYZ-789",
    "descripcion": "Moto deportiva en perfecto estado",
    "ciudad": "Arequipa",
    "distrito": "Yanahuara",
    "latitude": -16.3988,
    "longitude": -71.5369,
    "foto_frente": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "foto_atras": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "foto_costado_izq": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "foto_costado_der": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "foto_interior": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.warnings = []
        
    def add_pass(self, test_name: str):
        self.passed += 1
        print(f"✅ {test_name}")
        
    def add_fail(self, test_name: str, error: str):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ {test_name}: {error}")
        
    def add_warning(self, test_name: str, warning: str):
        self.warnings.append(f"{test_name}: {warning}")
        print(f"⚠️  {test_name}: {warning}")
        
    def summary(self):
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"⚠️  Warnings: {len(self.warnings)}")
        
        if self.errors:
            print(f"\n🔴 CRITICAL FAILURES:")
            for error in self.errors:
                print(f"  - {error}")
                
        if self.warnings:
            print(f"\n🟡 WARNINGS:")
            for warning in self.warnings:
                print(f"  - {warning}")

def make_request(method: str, endpoint: str, token: Optional[str] = None, data: Optional[Dict] = None) -> requests.Response:
    """Make HTTP request with proper headers"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=30)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data, timeout=30)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        raise

def test_health_check(results: TestResults):
    """Test health check endpoint"""
    print("\n🔍 Testing Health Check...")
    
    try:
        response = make_request("GET", "/health")
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                results.add_pass("Health check endpoint")
            else:
                results.add_fail("Health check endpoint", f"Unexpected response: {data}")
        else:
            results.add_fail("Health check endpoint", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("Health check endpoint", str(e))

def test_auth_endpoints(results: TestResults):
    """Test authentication endpoints"""
    print("\n🔍 Testing Auth Endpoints...")
    
    # Test /api/auth/me with valid token
    try:
        response = make_request("GET", "/auth/me", token=TEST_USER_1_TOKEN)
        if response.status_code == 200:
            user_data = response.json()
            if "user_id" in user_data and "email" in user_data:
                results.add_pass("GET /auth/me with valid token")
            else:
                results.add_fail("GET /auth/me with valid token", f"Missing required fields: {user_data}")
        else:
            results.add_fail("GET /auth/me with valid token", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.add_fail("GET /auth/me with valid token", str(e))
    
    # Test /api/auth/me without token
    try:
        response = make_request("GET", "/auth/me")
        if response.status_code == 401:
            results.add_pass("GET /auth/me without token (401 expected)")
        else:
            results.add_fail("GET /auth/me without token", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_fail("GET /auth/me without token", str(e))
    
    # Test /api/auth/me with invalid token
    try:
        response = make_request("GET", "/auth/me", token="invalid_token")
        if response.status_code == 401:
            results.add_pass("GET /auth/me with invalid token (401 expected)")
        else:
            results.add_fail("GET /auth/me with invalid token", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_fail("GET /auth/me with invalid token", str(e))
    
    # Test profile update
    try:
        update_data = {"name": "Updated Test User", "phone": "+51999888777"}
        response = make_request("PUT", "/auth/profile", token=TEST_USER_1_TOKEN, data=update_data)
        if response.status_code == 200:
            user_data = response.json()
            if user_data.get("name") == "Updated Test User":
                results.add_pass("PUT /auth/profile")
            else:
                results.add_fail("PUT /auth/profile", f"Profile not updated correctly: {user_data}")
        else:
            results.add_fail("PUT /auth/profile", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.add_fail("PUT /auth/profile", str(e))

def test_vehicle_endpoints(results: TestResults):
    """Test vehicle CRUD endpoints"""
    print("\n🔍 Testing Vehicle Endpoints...")
    
    vehicle_id_1 = None
    vehicle_id_2 = None
    
    # Test vehicle creation (User 1)
    try:
        response = make_request("POST", "/vehicles", token=TEST_USER_1_TOKEN, data=SAMPLE_VEHICLE_DATA)
        if response.status_code == 200:
            vehicle_data = response.json()
            vehicle_id_1 = vehicle_data.get("vehicle_id")
            if vehicle_id_1 and vehicle_data.get("marca") == "Toyota":
                results.add_pass("POST /vehicles (User 1)")
            else:
                results.add_fail("POST /vehicles (User 1)", f"Invalid response: {vehicle_data}")
        else:
            results.add_fail("POST /vehicles (User 1)", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.add_fail("POST /vehicles (User 1)", str(e))
    
    # Test vehicle creation (User 2)
    try:
        response = make_request("POST", "/vehicles", token=TEST_USER_2_TOKEN, data=SAMPLE_VEHICLE_DATA_2)
        if response.status_code == 200:
            vehicle_data = response.json()
            vehicle_id_2 = vehicle_data.get("vehicle_id")
            if vehicle_id_2 and vehicle_data.get("marca") == "Honda":
                results.add_pass("POST /vehicles (User 2)")
            else:
                results.add_fail("POST /vehicles (User 2)", f"Invalid response: {vehicle_data}")
        else:
            results.add_fail("POST /vehicles (User 2)", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.add_fail("POST /vehicles (User 2)", str(e))
    
    # Test vehicle creation without auth
    try:
        response = make_request("POST", "/vehicles", data=SAMPLE_VEHICLE_DATA)
        if response.status_code == 401:
            results.add_pass("POST /vehicles without auth (401 expected)")
        else:
            results.add_fail("POST /vehicles without auth", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /vehicles without auth", str(e))
    
    # Test vehicle creation without all photos
    try:
        incomplete_data = SAMPLE_VEHICLE_DATA.copy()
        incomplete_data["foto_frente"] = ""
        response = make_request("POST", "/vehicles", token=TEST_USER_1_TOKEN, data=incomplete_data)
        if response.status_code == 400:
            results.add_pass("POST /vehicles without all photos (400 expected)")
        else:
            results.add_fail("POST /vehicles without all photos", f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /vehicles without all photos", str(e))
    
    # Test get all vehicles (public)
    try:
        response = make_request("GET", "/vehicles")
        if response.status_code == 200:
            vehicles = response.json()
            if isinstance(vehicles, list) and len(vehicles) >= 2:
                results.add_pass("GET /vehicles (public)")
            else:
                results.add_fail("GET /vehicles (public)", f"Expected list with vehicles, got: {vehicles}")
        else:
            results.add_fail("GET /vehicles (public)", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("GET /vehicles (public)", str(e))
    
    # Test get vehicles with filters
    try:
        response = make_request("GET", "/vehicles?category=auto&marca=Toyota")
        if response.status_code == 200:
            vehicles = response.json()
            if isinstance(vehicles, list):
                toyota_vehicles = [v for v in vehicles if v.get("marca") == "Toyota"]
                if len(toyota_vehicles) >= 1:
                    results.add_pass("GET /vehicles with filters")
                else:
                    results.add_fail("GET /vehicles with filters", f"No Toyota vehicles found: {vehicles}")
            else:
                results.add_fail("GET /vehicles with filters", f"Expected list, got: {vehicles}")
        else:
            results.add_fail("GET /vehicles with filters", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("GET /vehicles with filters", str(e))
    
    # Test get single vehicle
    if vehicle_id_1:
        try:
            response = make_request("GET", f"/vehicles/{vehicle_id_1}")
            if response.status_code == 200:
                vehicle = response.json()
                if vehicle.get("vehicle_id") == vehicle_id_1:
                    results.add_pass("GET /vehicles/{id}")
                else:
                    results.add_fail("GET /vehicles/{id}", f"Wrong vehicle returned: {vehicle}")
            else:
                results.add_fail("GET /vehicles/{id}", f"Status code: {response.status_code}")
        except Exception as e:
            results.add_fail("GET /vehicles/{id}", str(e))
    
    # Test get non-existent vehicle
    try:
        response = make_request("GET", "/vehicles/nonexistent")
        if response.status_code == 404:
            results.add_pass("GET /vehicles/{nonexistent} (404 expected)")
        else:
            results.add_fail("GET /vehicles/{nonexistent}", f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.add_fail("GET /vehicles/{nonexistent}", str(e))
    
    # Test update vehicle (owner)
    if vehicle_id_1:
        try:
            update_data = {"precio": 26000.0, "descripcion": "Precio actualizado"}
            response = make_request("PUT", f"/vehicles/{vehicle_id_1}", token=TEST_USER_1_TOKEN, data=update_data)
            if response.status_code == 200:
                vehicle = response.json()
                if vehicle.get("precio") == 26000.0:
                    results.add_pass("PUT /vehicles/{id} (owner)")
                else:
                    results.add_fail("PUT /vehicles/{id} (owner)", f"Update failed: {vehicle}")
            else:
                results.add_fail("PUT /vehicles/{id} (owner)", f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            results.add_fail("PUT /vehicles/{id} (owner)", str(e))
    
    # Test update vehicle (non-owner)
    if vehicle_id_1:
        try:
            update_data = {"precio": 27000.0}
            response = make_request("PUT", f"/vehicles/{vehicle_id_1}", token=TEST_USER_2_TOKEN, data=update_data)
            if response.status_code == 403:
                results.add_pass("PUT /vehicles/{id} (non-owner, 403 expected)")
            else:
                results.add_fail("PUT /vehicles/{id} (non-owner)", f"Expected 403, got {response.status_code}")
        except Exception as e:
            results.add_fail("PUT /vehicles/{id} (non-owner)", str(e))
    
    # Test get my vehicles
    try:
        response = make_request("GET", "/vehicles/user/my-vehicles", token=TEST_USER_1_TOKEN)
        if response.status_code == 200:
            vehicles = response.json()
            if isinstance(vehicles, list) and len(vehicles) >= 1:
                results.add_pass("GET /vehicles/user/my-vehicles")
            else:
                results.add_fail("GET /vehicles/user/my-vehicles", f"Expected vehicles list, got: {vehicles}")
        else:
            results.add_fail("GET /vehicles/user/my-vehicles", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("GET /vehicles/user/my-vehicles", str(e))
    
    # Test delete vehicle (owner)
    if vehicle_id_2:
        try:
            response = make_request("DELETE", f"/vehicles/{vehicle_id_2}", token=TEST_USER_2_TOKEN)
            if response.status_code == 200:
                results.add_pass("DELETE /vehicles/{id} (owner)")
                
                # Verify soft delete
                response = make_request("GET", f"/vehicles/{vehicle_id_2}")
                if response.status_code == 200:
                    vehicle = response.json()
                    if vehicle.get("estado") == "inactivo":
                        results.add_pass("Vehicle soft delete verification")
                    else:
                        results.add_fail("Vehicle soft delete verification", f"Estado not updated: {vehicle}")
                else:
                    results.add_fail("Vehicle soft delete verification", f"Vehicle not found after delete")
            else:
                results.add_fail("DELETE /vehicles/{id} (owner)", f"Status code: {response.status_code}")
        except Exception as e:
            results.add_fail("DELETE /vehicles/{id} (owner)", str(e))
    
    # Test delete vehicle (non-owner)
    if vehicle_id_1:
        try:
            response = make_request("DELETE", f"/vehicles/{vehicle_id_1}", token=TEST_USER_2_TOKEN)
            if response.status_code == 403:
                results.add_pass("DELETE /vehicles/{id} (non-owner, 403 expected)")
            else:
                results.add_fail("DELETE /vehicles/{id} (non-owner)", f"Expected 403, got {response.status_code}")
        except Exception as e:
            results.add_fail("DELETE /vehicles/{id} (non-owner)", str(e))
    
    return vehicle_id_1, vehicle_id_2

def test_favorites_endpoints(results: TestResults, vehicle_id: Optional[str]):
    """Test favorites endpoints"""
    print("\n🔍 Testing Favorites Endpoints...")
    
    if not vehicle_id:
        results.add_fail("Favorites tests", "No vehicle ID available for testing")
        return
    
    # Test add to favorites
    try:
        response = make_request("POST", f"/favorites/{vehicle_id}", token=TEST_USER_2_TOKEN)
        if response.status_code == 200:
            data = response.json()
            if "favoritos" in data.get("message", "").lower():
                results.add_pass("POST /favorites/{vehicle_id}")
            else:
                results.add_fail("POST /favorites/{vehicle_id}", f"Unexpected response: {data}")
        else:
            results.add_fail("POST /favorites/{vehicle_id}", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.add_fail("POST /favorites/{vehicle_id}", str(e))
    
    # Test add to favorites again (should handle duplicate)
    try:
        response = make_request("POST", f"/favorites/{vehicle_id}", token=TEST_USER_2_TOKEN)
        if response.status_code == 200:
            results.add_pass("POST /favorites/{vehicle_id} (duplicate)")
        else:
            results.add_fail("POST /favorites/{vehicle_id} (duplicate)", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("POST /favorites/{vehicle_id} (duplicate)", str(e))
    
    # Test check if favorited
    try:
        response = make_request("GET", f"/favorites/check/{vehicle_id}", token=TEST_USER_2_TOKEN)
        if response.status_code == 200:
            data = response.json()
            if data.get("is_favorite") is True:
                results.add_pass("GET /favorites/check/{vehicle_id}")
            else:
                results.add_fail("GET /favorites/check/{vehicle_id}", f"Expected is_favorite=true, got: {data}")
        else:
            results.add_fail("GET /favorites/check/{vehicle_id}", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("GET /favorites/check/{vehicle_id}", str(e))
    
    # Test get all favorites
    try:
        response = make_request("GET", "/favorites", token=TEST_USER_2_TOKEN)
        if response.status_code == 200:
            favorites = response.json()
            if isinstance(favorites, list) and len(favorites) >= 1:
                results.add_pass("GET /favorites")
            else:
                results.add_fail("GET /favorites", f"Expected favorites list, got: {favorites}")
        else:
            results.add_fail("GET /favorites", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("GET /favorites", str(e))
    
    # Test remove from favorites
    try:
        response = make_request("DELETE", f"/favorites/{vehicle_id}", token=TEST_USER_2_TOKEN)
        if response.status_code == 200:
            data = response.json()
            if "eliminado" in data.get("message", "").lower():
                results.add_pass("DELETE /favorites/{vehicle_id}")
            else:
                results.add_fail("DELETE /favorites/{vehicle_id}", f"Unexpected response: {data}")
        else:
            results.add_fail("DELETE /favorites/{vehicle_id}", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("DELETE /favorites/{vehicle_id}", str(e))
    
    # Test remove from favorites again (should return 404)
    try:
        response = make_request("DELETE", f"/favorites/{vehicle_id}", token=TEST_USER_2_TOKEN)
        if response.status_code == 404:
            results.add_pass("DELETE /favorites/{vehicle_id} (not in favorites, 404 expected)")
        else:
            results.add_fail("DELETE /favorites/{vehicle_id} (not in favorites)", f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.add_fail("DELETE /favorites/{vehicle_id} (not in favorites)", str(e))
    
    # Test favorites without auth
    try:
        response = make_request("GET", "/favorites")
        if response.status_code == 401:
            results.add_pass("GET /favorites without auth (401 expected)")
        else:
            results.add_fail("GET /favorites without auth", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_fail("GET /favorites without auth", str(e))

def test_payment_system(results: TestResults, vehicle_id: Optional[str]):
    """Test payment system endpoints"""
    print("\n🔍 Testing Payment System...")
    
    if not vehicle_id:
        results.add_fail("Payment tests", "No vehicle ID available for testing")
        return None
    
    payment_id = None
    
    # Test GET /api/payments/config (public endpoint)
    try:
        response = make_request("GET", "/payments/config")
        if response.status_code == 200:
            config = response.json()
            required_fields = ["yape_numero", "yape_titular", "planes"]
            if all(field in config for field in required_fields):
                planes = config.get("planes", {})
                if "destacado_10d" in planes and "priorizado_5d_7d" in planes:
                    destacado = planes["destacado_10d"]
                    priorizado = planes["priorizado_5d_7d"]
                    if (destacado.get("monto") == 10.0 and destacado.get("dias") == 10 and
                        priorizado.get("monto") == 5.0 and priorizado.get("dias") == 12):
                        results.add_pass("GET /payments/config")
                    else:
                        results.add_fail("GET /payments/config", f"Invalid plan details: {planes}")
                else:
                    results.add_fail("GET /payments/config", f"Missing required plans: {planes}")
            else:
                results.add_fail("GET /payments/config", f"Missing required fields: {config}")
        else:
            results.add_fail("GET /payments/config", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("GET /payments/config", str(e))
    
    # Test POST /api/vehicles/{vehicle_id}/promote with valid data
    try:
        promote_data = {
            "tipo_pago": "destacado_10d",
            "numero_operacion": "12345678"
        }
        response = make_request("POST", f"/vehicles/{vehicle_id}/promote", token=TEST_USER_1_TOKEN, data=promote_data)
        if response.status_code == 200:
            data = response.json()
            if "payment_id" in data and data.get("estado") == "aprobado":
                payment_id = data.get("payment_id")
                results.add_pass("POST /vehicles/{id}/promote (valid data)")
            else:
                results.add_fail("POST /vehicles/{id}/promote (valid data)", f"Invalid response: {data}")
        else:
            results.add_fail("POST /vehicles/{id}/promote (valid data)", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.add_fail("POST /vehicles/{id}/promote (valid data)", str(e))
    
    # Test POST /api/vehicles/{vehicle_id}/promote with duplicate operation number
    try:
        promote_data = {
            "tipo_pago": "priorizado_5d_7d",
            "numero_operacion": "12345678"  # Same as above
        }
        response = make_request("POST", f"/vehicles/{vehicle_id}/promote", token=TEST_USER_1_TOKEN, data=promote_data)
        if response.status_code == 400:
            results.add_pass("POST /vehicles/{id}/promote (duplicate operation number, 400 expected)")
        else:
            results.add_fail("POST /vehicles/{id}/promote (duplicate operation number)", f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /vehicles/{id}/promote (duplicate operation number)", str(e))
    
    # Test POST /api/vehicles/{vehicle_id}/promote with invalid tipo_pago
    try:
        promote_data = {
            "tipo_pago": "invalid_plan",
            "numero_operacion": "87654321"
        }
        response = make_request("POST", f"/vehicles/{vehicle_id}/promote", token=TEST_USER_1_TOKEN, data=promote_data)
        if response.status_code == 400:
            results.add_pass("POST /vehicles/{id}/promote (invalid tipo_pago, 400 expected)")
        else:
            results.add_fail("POST /vehicles/{id}/promote (invalid tipo_pago)", f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /vehicles/{id}/promote (invalid tipo_pago)", str(e))
    
    # Test POST /api/vehicles/{vehicle_id}/promote with empty operation number
    try:
        promote_data = {
            "tipo_pago": "destacado_10d",
            "numero_operacion": ""
        }
        response = make_request("POST", f"/vehicles/{vehicle_id}/promote", token=TEST_USER_1_TOKEN, data=promote_data)
        if response.status_code == 400:
            results.add_pass("POST /vehicles/{id}/promote (empty operation number, 400 expected)")
        else:
            results.add_fail("POST /vehicles/{id}/promote (empty operation number)", f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /vehicles/{id}/promote (empty operation number)", str(e))
    
    # Test POST /api/vehicles/{vehicle_id}/promote with short operation number
    try:
        promote_data = {
            "tipo_pago": "destacado_10d",
            "numero_operacion": "12"
        }
        response = make_request("POST", f"/vehicles/{vehicle_id}/promote", token=TEST_USER_1_TOKEN, data=promote_data)
        if response.status_code == 400:
            results.add_pass("POST /vehicles/{id}/promote (short operation number, 400 expected)")
        else:
            results.add_fail("POST /vehicles/{id}/promote (short operation number)", f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /vehicles/{id}/promote (short operation number)", str(e))
    
    # Test POST /api/vehicles/{vehicle_id}/promote without auth
    try:
        promote_data = {
            "tipo_pago": "destacado_10d",
            "numero_operacion": "99999999"
        }
        response = make_request("POST", f"/vehicles/{vehicle_id}/promote", data=promote_data)
        if response.status_code == 401:
            results.add_pass("POST /vehicles/{id}/promote without auth (401 expected)")
        else:
            results.add_fail("POST /vehicles/{id}/promote without auth", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /vehicles/{id}/promote without auth", str(e))
    
    # Test POST /api/vehicles/{vehicle_id}/promote with non-owner
    try:
        promote_data = {
            "tipo_pago": "destacado_10d",
            "numero_operacion": "88888888"
        }
        response = make_request("POST", f"/vehicles/{vehicle_id}/promote", token=TEST_USER_2_TOKEN, data=promote_data)
        if response.status_code == 403:
            results.add_pass("POST /vehicles/{id}/promote (non-owner, 403 expected)")
        else:
            results.add_fail("POST /vehicles/{id}/promote (non-owner)", f"Expected 403, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /vehicles/{id}/promote (non-owner)", str(e))
    
    # Test POST /api/vehicles/{nonexistent}/promote
    try:
        promote_data = {
            "tipo_pago": "destacado_10d",
            "numero_operacion": "77777777"
        }
        response = make_request("POST", "/vehicles/nonexistent/promote", token=TEST_USER_1_TOKEN, data=promote_data)
        if response.status_code == 404:
            results.add_pass("POST /vehicles/{nonexistent}/promote (404 expected)")
        else:
            results.add_fail("POST /vehicles/{nonexistent}/promote", f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /vehicles/{nonexistent}/promote", str(e))
    
    return payment_id

def test_admin_panel(results: TestResults, payment_id: Optional[str]):
    """Test admin panel endpoints"""
    print("\n🔍 Testing Admin Panel...")
    
    # Test POST /api/admin/login with correct PIN
    try:
        login_data = {"pin": "1234"}
        response = make_request("POST", "/admin/login", data=login_data)
        if response.status_code == 200:
            data = response.json()
            if data.get("admin") is True:
                results.add_pass("POST /admin/login (correct PIN)")
            else:
                results.add_fail("POST /admin/login (correct PIN)", f"Invalid response: {data}")
        else:
            results.add_fail("POST /admin/login (correct PIN)", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.add_fail("POST /admin/login (correct PIN)", str(e))
    
    # Test POST /api/admin/login with incorrect PIN
    try:
        login_data = {"pin": "wrong"}
        response = make_request("POST", "/admin/login", data=login_data)
        if response.status_code == 403:
            results.add_pass("POST /admin/login (incorrect PIN, 403 expected)")
        else:
            results.add_fail("POST /admin/login (incorrect PIN)", f"Expected 403, got {response.status_code}")
    except Exception as e:
        results.add_fail("POST /admin/login (incorrect PIN)", str(e))
    
    # Test GET /api/admin/payments with correct PIN
    try:
        headers = {"X-Admin-Pin": "1234"}
        url = f"{BASE_URL}/admin/payments"
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 200:
            data = response.json()
            if "payments" in data and "total" in data:
                payments = data.get("payments", [])
                if isinstance(payments, list):
                    results.add_pass("GET /admin/payments (correct PIN)")
                else:
                    results.add_fail("GET /admin/payments (correct PIN)", f"Invalid payments format: {data}")
            else:
                results.add_fail("GET /admin/payments (correct PIN)", f"Missing required fields: {data}")
        else:
            results.add_fail("GET /admin/payments (correct PIN)", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.add_fail("GET /admin/payments (correct PIN)", str(e))
    
    # Test GET /api/admin/payments with incorrect PIN
    try:
        headers = {"X-Admin-Pin": "wrong"}
        url = f"{BASE_URL}/admin/payments"
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 403:
            results.add_pass("GET /admin/payments (incorrect PIN, 403 expected)")
        else:
            results.add_fail("GET /admin/payments (incorrect PIN)", f"Expected 403, got {response.status_code}")
    except Exception as e:
        results.add_fail("GET /admin/payments (incorrect PIN)", str(e))
    
    # Test GET /api/admin/payments without PIN
    try:
        url = f"{BASE_URL}/admin/payments"
        response = requests.get(url, timeout=30)
        if response.status_code == 403:
            results.add_pass("GET /admin/payments (no PIN, 403 expected)")
        else:
            results.add_fail("GET /admin/payments (no PIN)", f"Expected 403, got {response.status_code}")
    except Exception as e:
        results.add_fail("GET /admin/payments (no PIN)", str(e))
    
    # Test GET /api/admin/payments with estado filter
    try:
        headers = {"X-Admin-Pin": "1234"}
        url = f"{BASE_URL}/admin/payments?estado=aprobado"
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 200:
            data = response.json()
            if "payments" in data:
                results.add_pass("GET /admin/payments (with estado filter)")
            else:
                results.add_fail("GET /admin/payments (with estado filter)", f"Invalid response: {data}")
        else:
            results.add_fail("GET /admin/payments (with estado filter)", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("GET /admin/payments (with estado filter)", str(e))
    
    if payment_id:
        # Test PUT /api/admin/payments/{payment_id}/verify with correct PIN (verificado)
        try:
            headers = {"X-Admin-Pin": "1234", "Content-Type": "application/json"}
            verify_data = {"estado": "verificado"}
            url = f"{BASE_URL}/admin/payments/{payment_id}/verify"
            response = requests.put(url, headers=headers, json=verify_data, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if data.get("estado") == "verificado":
                    results.add_pass("PUT /admin/payments/{id}/verify (verificado)")
                else:
                    results.add_fail("PUT /admin/payments/{id}/verify (verificado)", f"Invalid response: {data}")
            else:
                results.add_fail("PUT /admin/payments/{id}/verify (verificado)", f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            results.add_fail("PUT /admin/payments/{id}/verify (verificado)", str(e))
        
        # Test PUT /api/admin/payments/{payment_id}/verify with correct PIN (rechazado)
        try:
            headers = {"X-Admin-Pin": "1234", "Content-Type": "application/json"}
            verify_data = {"estado": "rechazado"}
            url = f"{BASE_URL}/admin/payments/{payment_id}/verify"
            response = requests.put(url, headers=headers, json=verify_data, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if data.get("estado") == "rechazado":
                    results.add_pass("PUT /admin/payments/{id}/verify (rechazado)")
                else:
                    results.add_fail("PUT /admin/payments/{id}/verify (rechazado)", f"Invalid response: {data}")
            else:
                results.add_fail("PUT /admin/payments/{id}/verify (rechazado)", f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            results.add_fail("PUT /admin/payments/{id}/verify (rechazado)", str(e))
        
        # Test PUT /api/admin/payments/{payment_id}/verify with incorrect PIN
        try:
            headers = {"X-Admin-Pin": "wrong", "Content-Type": "application/json"}
            verify_data = {"estado": "verificado"}
            url = f"{BASE_URL}/admin/payments/{payment_id}/verify"
            response = requests.put(url, headers=headers, json=verify_data, timeout=30)
            if response.status_code == 403:
                results.add_pass("PUT /admin/payments/{id}/verify (incorrect PIN, 403 expected)")
            else:
                results.add_fail("PUT /admin/payments/{id}/verify (incorrect PIN)", f"Expected 403, got {response.status_code}")
        except Exception as e:
            results.add_fail("PUT /admin/payments/{id}/verify (incorrect PIN)", str(e))
        
        # Test PUT /api/admin/payments/{payment_id}/verify with invalid estado
        try:
            headers = {"X-Admin-Pin": "1234", "Content-Type": "application/json"}
            verify_data = {"estado": "invalid_estado"}
            url = f"{BASE_URL}/admin/payments/{payment_id}/verify"
            response = requests.put(url, headers=headers, json=verify_data, timeout=30)
            if response.status_code == 400:
                results.add_pass("PUT /admin/payments/{id}/verify (invalid estado, 400 expected)")
            else:
                results.add_fail("PUT /admin/payments/{id}/verify (invalid estado)", f"Expected 400, got {response.status_code}")
        except Exception as e:
            results.add_fail("PUT /admin/payments/{id}/verify (invalid estado)", str(e))
    
    # Test PUT /api/admin/payments/{nonexistent}/verify
    try:
        headers = {"X-Admin-Pin": "1234", "Content-Type": "application/json"}
        verify_data = {"estado": "verificado"}
        url = f"{BASE_URL}/admin/payments/nonexistent/verify"
        response = requests.put(url, headers=headers, json=verify_data, timeout=30)
        if response.status_code == 404:
            results.add_pass("PUT /admin/payments/{nonexistent}/verify (404 expected)")
        else:
            results.add_fail("PUT /admin/payments/{nonexistent}/verify", f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.add_fail("PUT /admin/payments/{nonexistent}/verify", str(e))

def test_data_validation(results: TestResults):
    """Test data validation and edge cases"""
    print("\n🔍 Testing Data Validation...")
    
    # Test vehicle creation with invalid data
    invalid_data_tests = [
        ({"category": "invalid_category"}, "Invalid category"),
        ({"anio": 1800}, "Invalid year (too old)"),
        ({"anio": 2030}, "Invalid year (future)"),
        ({"precio": -1000}, "Negative price"),
        ({"kilometraje": -5000}, "Negative mileage"),
    ]
    
    for invalid_data, test_name in invalid_data_tests:
        try:
            test_data = SAMPLE_VEHICLE_DATA.copy()
            test_data.update(invalid_data)
            response = make_request("POST", "/vehicles", token=TEST_USER_1_TOKEN, data=test_data)
            if response.status_code in [400, 422]:
                results.add_pass(f"Data validation: {test_name}")
            else:
                results.add_warning(f"Data validation: {test_name}", f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            results.add_fail(f"Data validation: {test_name}", str(e))

def main():
    """Run all backend tests"""
    print("🚀 Starting AutoArequipa Backend API Tests")
    print(f"Base URL: {BASE_URL}")
    print(f"Test User 1 Token: {TEST_USER_1_TOKEN}")
    print(f"Test User 2 Token: {TEST_USER_2_TOKEN}")
    
    results = TestResults()
    
    # Run all tests
    test_health_check(results)
    test_auth_endpoints(results)
    vehicle_id_1, vehicle_id_2 = test_vehicle_endpoints(results)
    test_favorites_endpoints(results, vehicle_id_1)
    
    # Test payment system and admin panel (NEW)
    payment_id = test_payment_system(results, vehicle_id_1)
    test_admin_panel(results, payment_id)
    
    test_data_validation(results)
    
    # Print summary
    results.summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit(main())