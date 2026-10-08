"""
End-to-End Automated Integration Test for HealthCopilot Handoff Workflow
Tests: Patient Registration -> Health Profile -> Appointment Booking -> AI Brief Generation ->
Doctor Brief Access -> Doctor Consultation & Prescription -> Patient Record & Timeline Update.
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests

BASE_URL = "http://localhost:8000"

print("==================================================")
print("   HEALTHCOPILOT END-TO-END INTEGRATION TEST    ")
print("==================================================")

# 1. Health Endpoint Check
print("\n[Step 1] Checking API Health Endpoint...")
res = requests.get(f"{BASE_URL}/health")
assert res.status_code == 200
print("✓ Health Check Passed:", res.json()["status"])

# 2. Register Patient User
print("\n[Step 2] Registering Test Patient...")
user_email = f"test_e2e_{int(requests.get(f'{BASE_URL}/').elapsed.total_seconds()*1000)}@example.com"
reg_res = requests.post(f"{BASE_URL}/api/auth/register", json={
    "email": user_email,
    "password": "Password123!",
    "full_name": "Test E2E Patient",
    "age": 30,
    "gender": "Female",
    "blood_group": "A+"
})
assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
user_data = reg_res.json()
patient_token = user_data["token"]
patient_id = user_data["user_id"]
print(f"✓ Patient Registered: {user_data['full_name']} (ID: {patient_id})")

# 3. Create Appointment & Trigger AI PreConsultation Handoff
print("\n[Step 3] Booking Appointment & Triggering PreConsultationAgent...")
headers = {"Authorization": f"Bearer {patient_token}"}
appt_res = requests.post(f"{BASE_URL}/api/appointments", headers=headers, json={
    "doctor_id": "doc_1",
    "doctor_name": "Dr. Priya Sharma",
    "specialization": "Dermatologist",
    "hospital_name": "Apollo Skin Clinic",
    "date": "2026-10-15",
    "time": "10:30 AM",
    "consultation_type": "In-Person",
    "disease_category": "Skin Irritation / Erythema",
    "disease_description": "Experiencing red itchy patches on arm for 4 days.",
    "symptoms_duration": "4 Days",
    "severity_level": "Moderate",
    "patient_notes": "Allergic to Sulfa drugs. Please check skin observation."
})
assert appt_res.status_code == 200, f"Booking failed: {appt_res.text}"
appt_data = appt_res.json()
appointment_id = appt_data["appointment"]["id"]
brief = appt_data["preConsultationBrief"]

print(f"✓ Appointment Booked: ID {appointment_id}")
print(f"✓ AI Patient Brief Generated: ID {brief['id']} (Status: {brief['status']})")
print(f"  - Target Physician: {brief['ai_recommended_specialty']}")
print(f"  - Source Records ({len(brief['source_records'])}): {[s['title'] for s in brief['source_records']]}")

# 4. Doctor Dashboard & Brief Inspection
print("\n[Step 4] Doctor Accessing Upcoming Appointments & Patient Brief...")
doc_appts_res = requests.get(f"{BASE_URL}/api/doctor/appointments?doctor_id=doc_1")
assert doc_appts_res.status_code == 200
doc_appts = doc_appts_res.json()
matching_appt = next((a for a in doc_appts if a["id"] == appointment_id), None)
assert matching_appt is not None, "Appointment not listed on doctor dashboard"
print(f"✓ Doctor Dashboard Verified: Found appointment {matching_appt['id']} for patient {matching_appt['patient_id']}")

brief_res = requests.get(f"{BASE_URL}/api/doctor/appointments/{appointment_id}/patient-brief?doctor_id=doc_1")
assert brief_res.status_code == 200
fetched_brief = brief_res.json()
print(f"✓ Doctor Opened Patient Brief: Reason='{fetched_brief['reason_for_visit']}'")
print(f"  - Relevant Allergies: {fetched_brief['relevant_allergies']}")
print(f"  - Active Medications: {fetched_brief['current_medications']}")

# 5. Doctor Consultation & Prescription Submission
print("\n[Step 5] Doctor Completing Consultation & Issuing Prescription...")
consult_res = requests.post(f"{BASE_URL}/api/doctor/appointments/{appointment_id}/consultation", json={
    "chief_complaint": "Skin Irritation / Erythema",
    "clinical_observations": "Superficial localized erythema noted on left arm. No infection.",
    "assessment_diagnosis": "Acute Contact Dermatitis",
    "plan": "Apply Hydrocortisone 1% cream twice daily for 5 days.",
    "prescription_items": ["Hydrocortisone 1% Cream (Twice daily)", "Cetirizine 10mg (Once daily at night)"],
    "follow_up_date": "2026-10-22"
})
assert consult_res.status_code == 200
consult_data = consult_res.json()
print(f"✓ Consultation Completed: ID {consult_data['consultation_id']}")
print(f"  - Diagnosis: {consult_data['diagnosis']}")
print(f"  - Prescribed Medicines: {consult_data['prescription']}")

# 6. Verify Timeline & Patient Record Update
print("\n[Step 6] Verifying Patient Timeline Update...")
timeline_res = requests.get(f"{BASE_URL}/api/timeline", headers=headers)
assert timeline_res.status_code == 200
timeline = timeline_res.json()
print(f"✓ Patient Timeline Events ({len(timeline)} events present): Latest = '{timeline[0]['title']}'")

print("\n==================================================")
print("  ✓ ALL END-TO-END INTEGRATION TESTS PASSED!    ")
print("==================================================")
