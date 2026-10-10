"""
Seed Database Script for HealthCopilot
Creates all tables in the database (PostgreSQL or SQLite) and seeds initial patient client data
so AI Agents can retrieve authorized client data and perform actions.
"""

import sys
import datetime
import json
from dotenv import load_dotenv
load_dotenv()  # Load .env before database module reads DATABASE_URL
from app.db.database import engine, Base, SessionLocal
from app.db.models import (
    User, PatientProfile, DoctorRecord, HospitalRecord, AppointmentRecord,
    PatientConsultationBriefRecord, MedicalReportRecord, PrescriptionRecord,
    MedicineScheduleRecord, TimelineEventRecord, DoctorAccessLogRecord
)
from app.auth.auth_handler import hash_password

def seed_db():
    print("--- HealthCopilot Database Initializer & Seeder ---")
    print(f"Connecting to Database Target: {engine.dialect.name} @ {engine.url.host}")

    # 1. Create All Tables
    Base.metadata.create_all(bind=engine)
    print("[1/4] Created database tables.")

    db = SessionLocal()

    try:
        # 2. Check if primary client user exists
        client_user = db.query(User).filter(User.email == "akhil@example.com").first()
        if not client_user:
            client_user = User(
                id="usr_001",
                email="akhil@example.com",
                hashed_password=hash_password("password123"),
                full_name="Akhil Sharma",
                role="PATIENT"
            )
            db.add(client_user)

            profile = PatientProfile(
                id="prof_001",
                user_id="usr_001",
                name="Akhil Sharma",
                age=28,
                gender="Male",
                blood_group="B+",
                height_cm=175.0,
                weight_kg=70.0,
                allergies="Penicillin, Peanut",
                existing_conditions="Mild Eczema, Seasonal Asthma",
                current_medicines="Cetirizine 10mg, Vitamin D3 60k IU",
                emergency_contact_name="Suresh Sharma",
                emergency_contact_phone="+91 98765 12345",
                diet_preference="Vegetarian",
                language_preference="en"
            )
            db.add(profile)
            print("[2/4] Created Client User & Health Profile (Akhil Sharma).")
        else:
            print("[2/4] Client User & Health Profile already present.")

        # 3. Seed Doctors & Hospitals
        doctor_count = db.query(DoctorRecord).count()
        if doctor_count == 0:
            doctors = [
                DoctorRecord(
                    id="doc_1",
                    name="Dr. Priya Sharma",
                    specialization="Dermatologist",
                    qualification="MBBS, MD (Dermatology)",
                    experience_years=12,
                    hospital_name="Apollo Skin Clinic",
                    address="Jubilee Hills, Road No. 36, Hyderabad",
                    phone="+91 98765 00001",
                    rating=4.9,
                    distance_km=1.8,
                    consultation_fee="₹750"
                ),
                DoctorRecord(
                    id="doc_2",
                    name="Dr. Ramesh Kumar",
                    specialization="General Physician",
                    qualification="MBBS, MD (Internal Medicine)",
                    experience_years=16,
                    hospital_name="Care Clinic",
                    address="Banjara Hills, Hyderabad",
                    phone="+91 98765 00002",
                    rating=4.8,
                    distance_km=2.4,
                    consultation_fee="₹500"
                ),
                DoctorRecord(
                    id="doc_3",
                    name="Dr. Ananya Reddy",
                    specialization="Gastroenterologist",
                    qualification="MBBS, DM (Gastroenterology)",
                    experience_years=18,
                    hospital_name="KIMS Hospital",
                    address="Gachibowli, Hyderabad",
                    phone="+91 98765 00003",
                    rating=4.9,
                    distance_km=4.1,
                    consultation_fee="₹800"
                )
            ]
            db.add_all(doctors)

            hospitals = [
                HospitalRecord(
                    id="hosp_1",
                    name="Apollo Skin Clinic",
                    address="Jubilee Hills, Hyderabad",
                    city="Hyderabad",
                    phone="+91 40 2360 7777",
                    emergency_available=True
                ),
                HospitalRecord(
                    id="hosp_2",
                    name="KIMS Multi-Specialty Hospital",
                    address="Gachibowli, Hyderabad",
                    city="Hyderabad",
                    phone="+91 40 4488 5000",
                    emergency_available=True
                )
            ]
            db.add_all(hospitals)
            print("[3/4] Seeded Doctors & Hospitals into Database.")
        else:
            print("[3/4] Doctors & Hospitals already present.")

        # 4. Seed Medical Records, Prescriptions, Medicines
        if db.query(MedicalReportRecord).count() == 0:
            report = MedicalReportRecord(
                id="rep_001",
                user_id="usr_001",
                title="Comprehensive Annual Blood Panel",
                date="2026-10-01",
                doctor_name="Dr. Ramesh Kumar",
                hospital_name="Care Clinic",
                report_type="Blood Test",
                file_name="Annual_Blood_Report_Oct2026.pdf",
                extracted_json=json.dumps([
                    {"parameter": "Hemoglobin (Hb)", "value": 13.8, "unit": "g/dL", "status": "normal"},
                    {"parameter": "Vitamin D3", "value": 18.5, "unit": "ng/mL", "status": "low"},
                    {"parameter": "Fasting Blood Sugar", "value": 98.0, "unit": "mg/dL", "status": "normal"}
                ]),
                ai_summary="Hemoglobin level is normal (13.8 g/dL). Serum Vitamin D3 is low (18.5 ng/mL - Deficient)."
            )
            db.add(report)

            rx = PrescriptionRecord(
                id="rx_001",
                user_id="usr_001",
                doctor_name="Dr. Ramesh Kumar",
                hospital_name="Care Clinic",
                date="2026-10-01",
                items_json=json.dumps(["Vitamin D3 60k IU once weekly"]),
                notes="Deficient Vitamin D3. Repeat blood test after 8 weeks."
            )
            db.add(rx)

            med = MedicineScheduleRecord(
                id="med_001",
                user_id="usr_001",
                name="Cetirizine 10mg",
                dosage="10mg",
                time="09:00 PM",
                frequency="Daily",
                duration_days=10,
                start_date="2026-10-07",
                instructions="Take after dinner for skin allergy relief"
            )
            db.add(med)

            evt1 = TimelineEventRecord(
                id="evt_001",
                user_id="usr_001",
                date="2026-10-07",
                time="09:30 AM",
                type="Symptom Reported",
                title="Consulted AI Copilot for skin itching",
                description="AI triaged moderate concern and suggested Dermatologist consultation.",
                doctor_or_source="AI Copilot Engine"
            )
            evt2 = TimelineEventRecord(
                id="evt_002",
                user_id="usr_001",
                date="2026-10-01",
                time="11:15 AM",
                type="Report Uploaded",
                title="Annual Blood Panel Uploaded",
                description="Extracted 3 parameters. Serum Vitamin D3 deficient (18.5 ng/mL).",
                doctor_or_source="Dr. Ramesh Kumar"
            )
            db.add_all([evt1, evt2])
            print("[4/4] Seeded Patient Medical Reports, Prescriptions, Medicines & Timeline.")
        else:
            print("[4/4] Medical records already present.")

        db.commit()
        print("\nSUCCESS: Database successfully created, connected, and populated!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
