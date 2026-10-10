import sys
sys.stdout.reconfigure(encoding='utf-8')
import uuid

from fastapi.testclient import TestClient
from app.main import app
from app.auth.auth_handler import create_access_token

client = TestClient(app)

PASS = 0
FAIL = 0
results = []

def check(label, got, expected, extra=""):
    global PASS, FAIL
    if got == expected:
        PASS += 1
        results.append(f"[PASS] {label} -> {got} {extra}")
    else:
        FAIL += 1
        results.append(f"[FAIL] {label} -> got {got}, expected {expected} {extra}")

print("=" * 52)
print("  HEALTHCOPILOT PHASE 4 ENDPOINT VERIFICATION  ")
print("=" * 52)

r = client.get("/health")
svc = r.json()["services"]
check("GET /health", r.status_code, 200, f"db={svc['database']} dialect={svc['database_dialect']}")

r = client.get("/health/live")
check("GET /health/live", r.status_code, 200)
r = client.get("/health/ready")
check("GET /health/ready", r.status_code, 200)

test_email = f"e2e_{uuid.uuid4().hex[:6]}@test.invalid"
r = client.post("/api/auth/register", json={"email": test_email, "password": "Test1234!", "full_name": "E2E Test User", "age": 25, "gender": "Male", "blood_group": "O+"})
check("POST /api/auth/register (new)", r.status_code, 200)
reg = r.json() if r.status_code == 200 else {}
e2e_tok = reg.get("token", "")
e2e_uid = reg.get("user_id", "")
e2e_h = {"Authorization": f"Bearer {e2e_tok}"}

r = client.post("/api/auth/register", json={"email": test_email, "password": "X", "full_name": "Dup"})
check("POST /api/auth/register (dup)", r.status_code, 400)

r = client.post("/api/auth/login", json={"email": test_email, "password": "Test1234!"})
check("POST /api/auth/login (valid)", r.status_code, 200)
r = client.post("/api/auth/login", json={"email": test_email, "password": "WRONG"})
check("POST /api/auth/login (invalid)", r.status_code, 401)

r = client.get("/api/patient/profile", headers=e2e_h)
check("GET /api/patient/profile (auth)", r.status_code, 200, f"name={r.json().get('name','?')}" if r.status_code==200 else "")
r = client.get("/api/patient/profile")
check("GET /api/patient/profile (no auth)", r.status_code, 401)

r = client.put("/api/patient/profile", headers=e2e_h, json={"weight_kg": 68.0, "allergies": ["Penicillin"]})
check("PUT /api/patient/profile (auth)", r.status_code, 200, f"weight={r.json().get('weight_kg','?')}" if r.status_code==200 else "")

r = client.get("/api/doctors")
check("GET /api/doctors", r.status_code, 200, f"count={len(r.json())}")
r = client.get("/api/doctors?specialization=Dermatologist")
check("GET /api/doctors?specialization=Dermatologist", r.status_code, 200, f"count={len(r.json())}")
r = client.get("/api/hospitals")
check("GET /api/hospitals", r.status_code, 200, f"count={len(r.json())}")

r = client.get("/api/appointments", headers=e2e_h)
check("GET /api/appointments (auth)", r.status_code, 200)

r = client.post("/api/appointments", headers=e2e_h, json={
    "doctor_id": "doc_test_01", "doctor_name": "Dr. Test Doctor",
    "specialization": "General Medicine", "hospital_name": "Test Hospital",
    "date": "2026-10-20", "time": "11:00 AM", "consultation_type": "In-Person",
    "disease_category": "Fever", "disease_description": "Mild fever for 2 days",
    "symptoms_duration": "2 Days", "severity_level": "Mild"})
check("POST /api/appointments", r.status_code, 200)
appt_id = r.json().get("appointment", {}).get("id", "") if r.status_code == 200 else ""

r = client.get("/api/timeline", headers=e2e_h)
check("GET /api/timeline (auth)", r.status_code, 200, f"events={len(r.json())}")
r = client.get("/api/history", headers=e2e_h)
check("GET /api/history (auth)", r.status_code, 200)

doc_tok = create_access_token("usr_doc_test", "doc@test.invalid")
doc_h = {"Authorization": f"Bearer {doc_tok}"}
r = client.get("/api/doctor/appointments", headers=doc_h)
check("GET /api/doctor/appointments (auth)", r.status_code, 200)
r = client.get("/api/doctor/appointments")
check("GET /api/doctor/appointments (no auth)", r.status_code, 401)

if appt_id:
    r = client.get(f"/api/doctor/appointments/{appt_id}/patient-brief", headers=doc_h)
    check("GET /api/doctor/.../patient-brief", r.status_code, 200)
    r = client.post(f"/api/doctor/appointments/{appt_id}/consultation", headers=doc_h,
                    json={"chief_complaint": "Fever", "clinical_observations": "Mild temp", "assessment_diagnosis": "Viral Fever", "plan": "Rest"})
    check("POST /api/doctor/.../consultation (auth)", r.status_code, 200)
    r = client.post(f"/api/doctor/appointments/{appt_id}/consultation", json={"chief_complaint": "Fever"})
    check("POST /api/doctor/.../consultation (no auth)", r.status_code, 401)

r = client.post("/api/qr/generate", headers=e2e_h, json={"duration_hours": 6, "shared_fields": {"profile": True, "medicines": False}})
check("POST /api/qr/generate", r.status_code, 200)
qr_tok = r.json().get("token", "") if r.status_code == 200 else ""

if qr_tok:
    r = client.get(f"/api/qr/access/{qr_tok}")
    check("GET /api/qr/access/{token} (valid)", r.status_code, 200, f"medicines_hidden={len(r.json().get('medicines',[]))==0}" if r.status_code==200 else "")
    
    other_h = {"Authorization": f"Bearer {create_access_token('usr_999', 'other@test.invalid')}"}
    r = client.post(f"/api/qr/revoke/{qr_tok}", headers=other_h)
    check("POST /api/qr/revoke (wrong owner)", r.status_code, 403)
    
    r = client.post(f"/api/qr/revoke/{qr_tok}", headers=e2e_h)
    check("POST /api/qr/revoke (owner)", r.status_code, 200)
    r = client.get(f"/api/qr/access/{qr_tok}")
    check("GET /api/qr/access (revoked)", r.status_code, 403)

r = client.get("/api/qr/access/totally_invalid_xyz")
check("GET /api/qr/access (unknown token)", r.status_code, 404)

r = client.post(
    "/api/assistant/chat",
    headers=e2e_h,
    json={"message": "I have a headache", "user_id": e2e_uid}
)
check("POST /api/assistant/chat (auth)", r.status_code, 200)

r = client.get("/api/audit", headers=e2e_h)
check("GET /api/audit (auth)", r.status_code, 200, f"entries={len(r.json())}")
r = client.get("/api/audit")
check("GET /api/audit (no auth)", r.status_code, 401)

r = client.post("/api/assistant/chat", json={"message": "I have a headache"})
check("POST /api/assistant/chat (no auth)", r.status_code, 401)

r = client.post(
    "/api/assistant/chat",
    headers=e2e_h,
    json={"message": "I have a headache"}
)
check("POST /api/assistant/chat (auth)", r.status_code, 200)

print()
for line in results:
    print(line)
print()
print("=" * 52)
print(f"  TOTAL: {PASS+FAIL}   PASS: {PASS}   FAIL: {FAIL}")
print("=" * 52)
if FAIL > 0:
    sys.exit(1)
