"""
Phase 2 Automated Verification Test Suite
Tests:
1. GET /api/doctors (Directory, filtering, search)
2. GET /api/hospitals (Directory, emergency filters)
3. GET /api/patient/profile (Authenticated profile fetch)
4. PUT /api/patient/profile (Authenticated profile update & ownership)
5. POST /api/qr/generate (Secure token generation & validation)
6. Security checks (Cannot generate QR for other patient, revocation enforcement, consent filtering)
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')
from fastapi.testclient import TestClient
from app.main import app, QR_TOKENS_DB
from app.auth.auth_handler import create_access_token

client = TestClient(app)

print("==================================================")
print("     HEALTHCOPILOT PHASE 2 TEST VERIFICATION      ")
print("==================================================")

# 0. Setup Auth Tokens
user_id = "usr_001"
user_token = create_access_token(user_id, "akhil@example.com")
headers = {"Authorization": f"Bearer {user_token}"}

other_user_id = "usr_999"
other_token = create_access_token(other_user_id, "other@example.com")
other_headers = {"Authorization": f"Bearer {other_token}"}

# --- TEST 1: GET /api/doctors ---
print("\n[Test 1] Testing GET /api/doctors...")
res = client.get("/api/doctors")
assert res.status_code == 200, f"Failed: {res.text}"
doctors = res.json()
assert len(doctors) >= 3, f"Expected at least 3 doctors, got {len(doctors)}"
print(f"✓ Retrieved {len(doctors)} doctors successfully.")

# Filter by specialization
res_derm = client.get("/api/doctors?specialization=Dermatologist")
assert res_derm.status_code == 200
derm_docs = res_derm.json()
assert all("dermatolog" in d["specialization"].lower() for d in derm_docs)
print(f"✓ Specialization filter works (Found {len(derm_docs)} Dermatologists).")

# Search query
res_search = client.get("/api/doctors?search=Priya")
assert res_search.status_code == 200
search_docs = res_search.json()
assert len(search_docs) >= 1 and "Priya" in search_docs[0]["name"]
print(f"✓ Search filter works (Found '{search_docs[0]['name']}').")

# --- TEST 2: GET /api/hospitals ---
print("\n[Test 2] Testing GET /api/hospitals...")
res_hosp = client.get("/api/hospitals")
assert res_hosp.status_code == 200, f"Failed: {res_hosp.text}"
hospitals = res_hosp.json()
assert len(hospitals) >= 2, f"Expected at least 2 hospitals, got {len(hospitals)}"
print(f"✓ Retrieved {len(hospitals)} hospitals successfully.")

# --- TEST 3: GET /api/patient/profile ---
print("\n[Test 3] Testing GET /api/patient/profile...")
res_prof = client.get("/api/patient/profile", headers=headers)
assert res_prof.status_code == 200, f"Failed: {res_prof.text}"
profile = res_prof.json()
assert profile["user_id"] == user_id
assert profile["name"] == "Akhil Sharma"
assert isinstance(profile["allergies"], list)
assert isinstance(profile["current_medicines"], list)
print(f"✓ Retrieved profile for {profile['name']} (Allergies: {profile['allergies']})")

# --- TEST 4: PUT /api/patient/profile ---
print("\n[Test 4] Testing PUT /api/patient/profile...")
update_payload = {
    "weight_kg": 72.5,
    "allergies": ["Penicillin", "Peanut", "Dust Mites"],
    "diet_preference": "Vegetarian",
    "emergency_contact_phone": "+91 98765 99999"
}
res_update = client.put("/api/patient/profile", headers=headers, json=update_payload)
assert res_update.status_code == 200, f"Failed: {res_update.text}"
updated_prof = res_update.json()
assert updated_prof["weight_kg"] == 72.5
assert "Dust Mites" in updated_prof["allergies"]
assert updated_prof["emergency_contact"]["phone"] == "+91 98765 99999"
print(f"✓ Profile updated successfully (Weight: {updated_prof['weight_kg']} kg, Allergies: {updated_prof['allergies']})")

# --- TEST 5: POST /api/qr/generate & Consent Filtering ---
print("\n[Test 5] Testing POST /api/qr/generate...")
qr_payload = {
    "duration_hours": 12,
    "shared_fields": {
        "profile": True,
        "conditions": True,
        "medicines": False,     # Patient revoked medicine visibility
        "reports": True,
        "prescriptions": True,
        "timeline": True,
        "aiSummaries": True
    }
}
res_qr = client.post("/api/qr/generate", headers=headers, json=qr_payload)
assert res_qr.status_code == 200, f"Failed: {res_qr.text}"
qr_data = res_qr.json()
token = qr_data["token"]
assert token.startswith("qr_")
print(f"✓ QR Token generated: {token} (Expires: {qr_data['expires_at']})")

# Verify Doctor Portal Access respects consent
print("\n[Test 6] Testing Doctor Access & Patient Consent Filtering...")
res_access = client.get(f"/api/qr/access/{token}")
assert res_access.status_code == 200, f"Failed: {res_access.text}"
access_data = res_access.json()
assert access_data["patient_name"] == "Akhil Sharma"
assert len(access_data["medicines"]) == 0, "Security Violation: Medicines were shared despite patient consent = False!"
assert len(access_data["recent_reports"]) > 0, "Reports should be visible when consent = True"
print("✓ Consent Filtering Enforced: Medicines withheld (0 items), Reports provided.")

# --- TEST 7: Security Ownership & Revocation ---
print("\n[Test 7] Testing Security Ownership & Token Revocation...")
# Other user cannot revoke our token
res_unauthorized_revoke = client.post(f"/api/qr/revoke/{token}", headers=other_headers)
assert res_unauthorized_revoke.status_code == 403, f"Expected 403, got {res_unauthorized_revoke.status_code}"
print("✓ Cross-user revocation blocked with 403 Forbidden.")

# Other user cannot generate token targeting another user's id
res_spoof = client.post("/api/qr/generate", headers=other_headers, json={"user_id": "usr_001", "duration_hours": 24, "shared_fields": {}})
assert res_spoof.status_code == 403, f"Expected 403, got {res_spoof.status_code}"
print("✓ Identity spoofing on QR generation blocked with 403 Forbidden.")

# Legitimate user revokes token
res_revoke = client.post(f"/api/qr/revoke/{token}", headers=headers)
assert res_revoke.status_code == 200
print("✓ Patient revoked their QR token successfully.")

# Access revoked token should now fail with 403
res_revoked_access = client.get(f"/api/qr/access/{token}")
assert res_revoked_access.status_code == 403, f"Expected 403 on revoked token, got {res_revoked_access.status_code}"
print("✓ Access to revoked token properly denied with 403 Forbidden.")

print("\n==================================================")
print("✓ ALL PHASE 2 TESTS PASSED PERFECTLY!")
print("==================================================")
