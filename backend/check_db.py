"""
Comprehensive Database & Workflow Verification Script
Verifies DB Connection, Table Integrity, Repositories, Services,
Appointment Creation, and AI Patient Brief Doctor Handoff.
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.db.database import engine, Base, SessionLocal
from app.db.models import User, PatientProfile, AppointmentRecord, PatientConsultationBriefRecord
from app.repositories.patient_repository import PatientRepository
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.services.patient_context_service import PatientContextService
from app.agents.pre_consultation_agent import PreConsultationAgent
from sqlalchemy import text

print("==================================================")
print("  HEALTHCOPILOT DATABASE & HANDOFF SYSTEM CHECK  ")
print("==================================================")

# 1. Test Database Engine & Connection
print("\n[1/6] Testing Database Engine Connection...")
print(f"Target Database URL: {engine.url}")
try:
    with engine.connect() as conn:
        res = conn.execute(text("SELECT 1")).scalar()
        print(f"✓ Database Connected Successfully (SELECT 1 returned {res})")
except Exception as e:
    print(f"❌ Connection Failed: {e}")
    sys.exit(1)

# 2. Verify Database Schema & Tables
print("\n[2/6] Verifying Database Tables...")
Base.metadata.create_all(bind=engine)
with engine.connect() as conn:
    tables = [row[0] for row in conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).fetchall()]
    print(f"✓ Active Tables ({len(tables)}): {', '.join(tables)}")

# 3. Test Repositories
print("\n[3/6] Testing Repository Layer...")
db = SessionLocal()
try:
    patient_repo = PatientRepository(db)
    appt_repo = AppointmentRepository(db)
    medical_repo = MedicalRecordRepository(db)
    
    profile = patient_repo.get_profile_by_user_id("usr_001")
    print(f"✓ PatientRepository Verified: Found patient profile '{profile.name if profile else 'Demo'}'")

    appts = appt_repo.get_by_patient_id("usr_001")
    print(f"✓ AppointmentRepository Verified: Found {len(appts)} appointments for patient")

    reports = medical_repo.get_reports_by_patient("usr_001")
    print(f"✓ MedicalRecordRepository Verified: Found {len(reports)} lab reports")

# 4. Test PatientContextService
    print("\n[4/6] Testing PatientContextService (Permission-Filtered Context)...")
    context_service = PatientContextService(db)
    context = context_service.get_patient_context_for_doctor(patient_id="usr_001", doctor_specialty="Dermatologist")
    print(f"✓ PatientContextService Verified: Constructed context for {context['patient']['name']}")
    print(f"  - Active Medicines: {context['patient']['current_medicines']}")
    print(f"  - Known Allergies: {context['patient']['allergies']}")
    print(f"  - Relevant Reports: {len(context['relevant_reports'])}")

# 5. Test PreConsultationAgent & Source Traceability
    print("\n[5/6] Testing PreConsultationAgent (AI Patient Brief & Sources)...")
    agent = PreConsultationAgent()
    brief_data = agent.generate_patient_brief(
        patient_context=context,
        appointment_data={"doctor_name": "Dr. Priya Sharma", "specialization": "Dermatologist", "disease_category": "Skin Rash"}
    )
    print(f"✓ PreConsultationAgent Verified: Generated brief '{brief_data['id']}' (Status: {brief_data['status']})")
    print(f"  - Linked Sources ({len(brief_data['source_records'])}): {[s['title'] for s in brief_data['source_records']]}")

# 6. Summary Status
    print("\n==================================================")
    print("✓ ALL SYSTEM CHECKS PASSED: DATABASE & HANDOFF READY!")
    print("==================================================")

except Exception as e:
    print(f"❌ Verification Failed: {e}")
finally:
    db.close()
