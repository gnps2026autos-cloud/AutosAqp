#!/usr/bin/env python3
"""
Complete Payment Flow Test for AQP-Autos
Tests the complete flow as described in the review request
"""

import requests
import json
import time
import os
from datetime import datetime

# Test configuration
BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8001/api").rstrip("/")
TEST_USER_TOKEN = os.environ.get("TEST_USER_TOKEN", "")
ADMIN_PIN = os.environ.get("ADMIN_PIN", "cambia_este_pin")

# Sample vehicle data
SAMPLE_VEHICLE = {
    "category": "auto",
    "marca": "Toyota",
    "modelo": "Camry",
    "anio": 2021,
    "precio": 35000.0,
    "kilometraje": 15000,
    "color": "Azul",
    "tipo_combustible": "gasolina",
    "transmision": "automatica",
    "num_puertas": 4,
    "placa": "TEST-123",
    "descripcion": "Vehículo para test de pagos",
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

def make_request(method, endpoint, token=None, data=None, headers=None):
    """Make HTTP request with proper headers"""
    url = f"{BASE_URL}{endpoint}"
    request_headers = {"Content-Type": "application/json"}
    
    if token:
        request_headers["Authorization"] = f"Bearer {token}"
    
    if headers:
        request_headers.update(headers)
    
    if method == "GET":
        response = requests.get(url, headers=request_headers, timeout=30)
    elif method == "POST":
        response = requests.post(url, headers=request_headers, json=data, timeout=30)
    elif method == "PUT":
        response = requests.put(url, headers=request_headers, json=data, timeout=30)
    else:
        raise ValueError(f"Unsupported method: {method}")
    
    return response

def test_complete_payment_flow():
    """Test the complete payment flow as described in the review request"""
    print("🚀 Testing Complete Payment Flow for AQP-Autos")
    print("=" * 60)
    
    # Step 1: Create a vehicle with user token
    print("\n1️⃣ Creating a vehicle...")
    response = make_request("POST", "/vehicles", token=TEST_USER_TOKEN, data=SAMPLE_VEHICLE)
    if response.status_code != 200:
        print(f"❌ Failed to create vehicle: {response.status_code} - {response.text}")
        return False
    
    vehicle_data = response.json()
    vehicle_id = vehicle_data.get("vehicle_id")
    print(f"✅ Vehicle created successfully: {vehicle_id}")
    print(f"   Vehicle: {vehicle_data.get('marca')} {vehicle_data.get('modelo')} - {vehicle_data.get('placa')}")
    
    # Step 2: Promote vehicle with operation number
    print("\n2️⃣ Promoting vehicle with Yape payment...")
    promote_data = {
        "tipo_pago": "destacado_10d",
        "numero_operacion": "98765432"
    }
    response = make_request("POST", f"/vehicles/{vehicle_id}/promote", token=TEST_USER_TOKEN, data=promote_data)
    if response.status_code != 200:
        print(f"❌ Failed to promote vehicle: {response.status_code} - {response.text}")
        return False
    
    payment_data = response.json()
    payment_id = payment_data.get("payment_id")
    print(f"✅ Payment registered successfully: {payment_id}")
    print(f"   Plan: {payment_data.get('plan')}")
    print(f"   Amount: S/ {payment_data.get('monto')}")
    print(f"   Payment status: {payment_data.get('estado')}")
    print(f"   Status: {payment_data.get('estado')}")
    
    # Step 3: Try promoting with same operation number (should fail)
    print("\n3️⃣ Trying to promote with same operation number...")
    duplicate_data = {
        "tipo_pago": "priorizado_5d_7d",
        "numero_operacion": "98765432"  # Same as above
    }
    response = make_request("POST", f"/vehicles/{vehicle_id}/promote", token=TEST_USER_TOKEN, data=duplicate_data)
    if response.status_code == 400:
        print("✅ Duplicate operation number correctly rejected")
        print(f"   Error: {response.json().get('detail', 'Unknown error')}")
    else:
        print(f"❌ Expected 400 for duplicate operation number, got {response.status_code}")
        return False
    
    # Step 4: Admin login
    print("\n4️⃣ Testing admin login...")
    login_data = {"pin": ADMIN_PIN}
    response = make_request("POST", "/admin/login", data=login_data)
    if response.status_code != 200:
        print(f"❌ Admin login failed: {response.status_code} - {response.text}")
        return False
    
    admin_data = response.json()
    print(f"✅ Admin login successful: {admin_data.get('message')}")
    
    # Step 5: List payments as admin
    print("\n5️⃣ Listing payments as admin...")
    headers = {"X-Admin-Pin": ADMIN_PIN}
    response = make_request("GET", "/admin/payments", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to list payments: {response.status_code} - {response.text}")
        return False
    
    payments_data = response.json()
    payments = payments_data.get("payments", [])
    total = payments_data.get("total", 0)
    print(f"✅ Retrieved {len(payments)} payments (total: {total})")
    
    # Find our payment
    our_payment = None
    for payment in payments:
        if payment.get("payment_id") == payment_id:
            our_payment = payment
            break
    
    if our_payment:
        print(f"   Found our payment: {our_payment.get('numero_operacion')} - {our_payment.get('estado')}")
        print(f"   Vehicle: {our_payment.get('marca_modelo')} ({our_payment.get('placa')})")
        print(f"   Amount: S/ {our_payment.get('monto')}")
    else:
        print("⚠️  Our payment not found in the list")
    
    # Step 6: Verify/reject a payment
    print("\n6️⃣ Verifying payment...")
    verify_data = {"estado": "verificado"}
    response = make_request("PUT", f"/admin/payments/{payment_id}/verify", headers=headers, data=verify_data)
    if response.status_code != 200:
        print(f"❌ Failed to verify payment: {response.status_code} - {response.text}")
        return False
    
    verify_result = response.json()
    print(f"✅ Payment verified successfully: {verify_result.get('message')}")
    print(f"   Payment ID: {verify_result.get('payment_id')}")
    print(f"   New status: {verify_result.get('estado')}")
    
    # Step 7: Test rejecting a payment (create another one first)
    print("\n7️⃣ Testing payment rejection...")
    
    # Create another promotion
    promote_data_2 = {
        "tipo_pago": "priorizado_5d_7d",
        "numero_operacion": "11223344"
    }
    response = make_request("POST", f"/vehicles/{vehicle_id}/promote", token=TEST_USER_TOKEN, data=promote_data_2)
    if response.status_code == 200:
        payment_data_2 = response.json()
        payment_id_2 = payment_data_2.get("payment_id")
        print(f"   Created second payment: {payment_id_2}")
        
        # Now reject it
        reject_data = {"estado": "rechazado"}
        response = make_request("PUT", f"/admin/payments/{payment_id_2}/verify", headers=headers, data=reject_data)
        if response.status_code == 200:
            reject_result = response.json()
            print(f"✅ Payment rejected successfully: {reject_result.get('message')}")
            print(f"   This should remove featured status from vehicle")
        else:
            print(f"❌ Failed to reject payment: {response.status_code} - {response.text}")
    else:
        print(f"⚠️  Could not create second payment for rejection test: {response.status_code}")
    
    # Step 8: Verify existing endpoints still work
    print("\n8️⃣ Verifying existing endpoints still work...")
    
    # Test GET /vehicles
    response = make_request("GET", "/vehicles")
    if response.status_code == 200:
        vehicles = response.json()
        print(f"✅ GET /vehicles works: {len(vehicles)} vehicles found")
    else:
        print(f"❌ GET /vehicles failed: {response.status_code}")
        return False
    
    # Test GET /auth/me
    response = make_request("GET", "/auth/me", token=TEST_USER_TOKEN)
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ GET /auth/me works: {user_data.get('name')} ({user_data.get('email')})")
    else:
        print(f"❌ GET /auth/me failed: {response.status_code}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 Complete payment flow test PASSED!")
    print("All endpoints are working correctly.")
    return True

if __name__ == "__main__":
    success = test_complete_payment_flow()
    exit(0 if success else 1)