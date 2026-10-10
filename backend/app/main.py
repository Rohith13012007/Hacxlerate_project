import os
import uuid
import datetime
import json
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

load_dotenv()

from app.models.schemas import (
    RegisterRequest, LoginRequest, AuthResponse,
    ChatRequest, ChatResponse,
    HealthImageAnalysisRequest, HealthImageAnalysisResponse,
    FoodAnalysisRequest, FoodAnalysisResponse,
    DocumentUploadRequest, DocumentOCRResponse,
    QRCreateRequest, QRCreateResponse, DoctorAccessResponse
)
from app.agents.orchestrator import HealthCopilotOrchestrator
from app.agents.pre_consultation_agent import PreConsultationAgent
from app.db.database import Base, engine, get_db, SessionLocal, db_dialect

from app.db.models import (
    User, PatientProfile, DoctorRecord, HospitalRecord, AppointmentRecord,
    PatientConsultationBriefRecord, ConsultationRecord, TimelineEventRecord,
    MedicalReportRecord, PrescriptionRecord, MedicineScheduleRecord,
    FoodScanRecord, VisionScanRecord, DoctorAccessLogRecord,
    PatientConsentQRRecord
)

from app.repositories.patient_repository import PatientRepository
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.services.patient_context_service import PatientContextService
from app.auth.auth_handler import hash_password, verify_password, create_access_token, verify_access_token
from app.services.fhir_adapter import FHIRAdapter
from sqlalchemy import text as sa_text

# Initialize Database Tables
try:
    Base.metadata.create_all(bind=engine)
    print("[DB Status] Database tables initialized successfully.")
except Exception as e:
    print(f"[DB Warning] Could not initialize database tables automatically: {e}")

app = FastAPI(
    title="HealthCopilot API",
    description="AI-Powered Personal Health Operating System with Repository Service Layer & PreConsultation Handoff Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = HealthCopilotOrchestrator()
pre_consult_agent = PreConsultationAgent()

QR_TOKENS_DB: Dict[str, Any] = {}
AUDIT_LOGS_DB: List[Dict[str, Any]] = [
    {
        "id": "aud_001",
        "actor": "system",
        "action": "SYSTEM_STARTUP",
        "resource": "HealthCopilot Service Engine",
        "timestamp": datetime.datetime.now().isoformat(),
        "status": "SUCCESS"
    }
]

def log_audit(actor: str, action: str, resource: str, status: str = "SUCCESS"):
    AUDIT_LOGS_DB.insert(0, {
        "id": f"aud_{uuid.uuid4().hex[:8]}",
        "actor": actor,
        "action": action,
        "resource": resource,
        "timestamp": datetime.datetime.now().isoformat(),
        "status": status
    })


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header"
        )

    payload = verify_access_token(token.strip())

    if not payload or not payload.get("user_id"):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session token"
        )

    return payload["user_id"]


# --- BACKGROUND WORKER FOR PRE-CONSULTATION BRIEF GENERATION ---

def bg_generate_pre_consultation_brief(appointment_id: str, patient_id: str, doctor_id: str, doctor_specialty: str):
    """Background worker task generating patient brief asynchronously without blocking HTTP response."""
    db = SessionLocal()
    try:
        context_service = PatientContextService(db)
        appt_repo = AppointmentRepository(db)
        
        # 1. Retrieve Permission-Filtered Relevant Patient Context
        context = context_service.get_patient_context_for_doctor(
            patient_id=patient_id,
            doctor_specialty=doctor_specialty,
            appointment_id=appointment_id
        )

        # 2. Run PreConsultationAgent
        brief_data = pre_consult_agent.generate_patient_brief(
            patient_context=context,
            appointment_data=context.get("appointment")
        )

        # 3. Save Patient Consultation Brief to DB
        existing_brief = appt_repo.get_brief_by_appointment_id(appointment_id)
        if not existing_brief:
            brief_rec = PatientConsultationBriefRecord(
                id=brief_data["id"],
                appointment_id=appointment_id,
                patient_id=patient_id,
                doctor_id=doctor_id,
                patient_name=brief_data["patient_name"],
                age=brief_data["age"],
                blood_group=brief_data["blood_group"],
                reason_for_visit=brief_data["reason_for_visit"],
                symptom_summary=brief_data["symptom_summary"],
                symptom_duration=brief_data["symptom_duration"],
                symptom_severity=brief_data["symptom_severity"],
                relevant_allergies=brief_data["relevant_allergies"],
                relevant_conditions=brief_data["relevant_conditions"],
                current_medications=brief_data["current_medications"],
                ai_conversation_summary=brief_data["ai_conversation_summary"],
                ai_recommended_specialty=brief_data["ai_recommended_specialty"],
                source_records_json=json.dumps(brief_data["source_records"]),
                version="v1.0",
                status="READY"
            )
            appt_repo.save_brief(brief_rec)
            log_audit("BG_WORKER", "PATIENT_BRIEF_GENERATED", f"Generated brief {brief_data['id']} for appt {appointment_id}")

    except Exception as e:
        print(f"[BG Worker Error] Failed generating patient brief for appt {appointment_id}: {e}")
    finally:
        db.close()

# --- SYSTEM HEALTH ---

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "AI Health Copilot Service & Repository Engine",
        "database": "Active (PostgreSQL / SQLite)",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/health")
@app.get("/health/live")
@app.get("/health/ready")
def health_check():
    # Actually probe the database — do not claim UP without testing
    db_status = "DOWN"
    try:
        with engine.connect() as _c:
            _c.execute(sa_text("SELECT 1"))
        db_status = "UP"
    except Exception:
        db_status = "DOWN"
    overall = "UP" if db_status == "UP" else "DEGRADED"
    return {
        "status": overall,
        "services": {
            "database": db_status,
            "database_dialect": db_dialect,
            "ai_orchestrator": "UP",
            "pre_consultation_agent": "UP",
            "patient_context_service": "UP",
            "fhir_adapter": "READY"
        },
        "timestamp": datetime.datetime.now().isoformat()
    }

# --- AUTHENTICATION ---

@app.post("/api/auth/register", response_model=AuthResponse)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    patient_repo = PatientRepository(db)
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        log_audit(req.email.lower(), "REGISTER_ATTEMPT", "User Account", "FAILED_EXISTS")
        raise HTTPException(status_code=400, detail="User email already registered")

    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    hashed_pwd = hash_password(req.password)
    
    new_user = User(
        id=user_id,
        email=req.email.lower(),
        hashed_password=hashed_pwd,
        full_name=req.full_name,
        role="PATIENT"
    )
    db.add(new_user)
    
    profile_id = f"prof_{uuid.uuid4().hex[:10]}"
    new_profile = PatientProfile(
        id=profile_id,
        user_id=user_id,
        name=req.full_name,
        age=req.age or 28,
        gender=req.gender or "Male",
        blood_group=req.blood_group or "B+"
    )
    patient_repo.create_patient_profile(new_profile)

    log_audit(user_id, "REGISTER_SUCCESS", "Account Created")
    token = create_access_token(user_id, req.email.lower())
    return AuthResponse(
        token=token,
        user_id=user_id,
        email=req.email.lower(),
        full_name=req.full_name,
        age=new_profile.age,
        gender=new_profile.gender,
        blood_group=new_profile.blood_group
    )

@app.post("/api/auth/login", response_model=AuthResponse)
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        log_audit(req.email.lower(), "LOGIN_ATTEMPT", "User Auth", "FAILED_INVALID_CREDS")
        raise HTTPException(status_code=401, detail="Invalid email address or password")

    patient_repo = PatientRepository(db)
    profile = patient_repo.get_profile_by_user_id(user.id)
    token = create_access_token(user.id, user.email)
    log_audit(user.id, "LOGIN_SUCCESS", "Session Token Issued")
    
    return AuthResponse(
        token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        age=profile.age if profile else 28,
        gender=profile.gender if profile else "Male",
        blood_group=profile.blood_group if profile else "B+"
    )

# --- COPILOT AI ASSISTANT ---

@app.post("/api/assistant/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest,user_id: str = Depends(get_current_user_id)):
    res = orchestrator.process_message(req.message, req.language or "en")
    conv_id = req.conversation_id or f"conv_{uuid.uuid4().hex[:8]}"
    log_audit(req.user_id , "AI_COPILOT_QUERY", f"Session {conv_id}")
    return ChatResponse(
        conversation_id=conv_id,
        reply_text=res["reply"],
        detected_language=res["detected_language"],
        urgency=res["urgency"],
        is_emergency=res["is_emergency"],
        specialist_recommendation=res["specialist"],
        followup_questions=res["followups"]
    )

# --- APPOINTMENTS & AI PATIENT BRIEF GENERATION WORKFLOW ---

@app.post("/api/appointments")
def create_appointment(
    req: Dict[str, Any], 
    background_tasks: BackgroundTasks, 
    user_id: str = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    appt_repo = AppointmentRepository(db)
    medical_repo = MedicalRecordRepository(db)
    context_service = PatientContextService(db)

    appt_id = f"appt_{uuid.uuid4().hex[:10]}"
    doctor_id = req.get("doctor_id") or "doc_001"
    doctor_name = req.get("doctor_name") or req.get("doctorName") or "Dr. Priya Sharma"
    specialization = req.get("specialization") or "Dermatologist"
    hospital_name = req.get("hospital_name") or req.get("hospitalName") or "Apollo Skin Clinic"
    appt_date = req.get("date") or datetime.date.today().isoformat()
    appt_time = req.get("time") or "04:30 PM"
    consult_type = req.get("consultation_type") or req.get("consultationType") or "In-Person"
    disease_cat = req.get("disease_category") or req.get("diseaseCategory") or "Skin Irritation"
    disease_desc = req.get("disease_description") or req.get("diseaseDescription") or "Patient reported symptoms."
    duration = req.get("symptoms_duration") or req.get("symptomsDuration") or "3-5 Days"
    severity = req.get("severity_level") or req.get("severityLevel") or "Moderate"
    notes = req.get("patient_notes") or req.get("patientNotes") or ""

    # 1. Create Appointment Record in Repository
    new_appt = AppointmentRecord(
        id=appt_id,
        patient_id=user_id,
        doctor_id=doctor_id,
        doctor_name=doctor_name,
        specialization=specialization,
        hospital_name=hospital_name,
        appointment_date=appt_date,
        appointment_time=appt_time,
        consultation_type=consult_type,
        disease_category=disease_cat,
        disease_description=disease_desc,
        symptoms_duration=duration,
        severity_level=severity,
        patient_notes=notes,
        status="CONFIRMED"
    )
    appt_repo.create_appointment(new_appt)

    # 2. Add Timeline Record
    timeline_evt = TimelineEventRecord(
        id=f"evt_{uuid.uuid4().hex[:8]}",
        user_id=user_id,
        date=appt_date,
        time=appt_time,
        type="Appointment Scheduled",
        title=f"Appointment Booked with {doctor_name}",
        description=f"{disease_cat} ({consult_type}) on {appt_date} at {appt_time}",
        doctor_or_source=hospital_name
    )
    medical_repo.add_timeline_event(timeline_evt)

    # 3. Synchronously generate immediate brief & queue background worker
    context = context_service.get_patient_context_for_doctor(
        patient_id=user_id,
        doctor_specialty=specialization,
        appointment_id=appt_id
    )
    brief_data = pre_consult_agent.generate_patient_brief(context, context.get("appointment"))
    
    # Save Initial Brief Record
    brief_rec = PatientConsultationBriefRecord(
        id=brief_data["id"],
        appointment_id=appt_id,
        patient_id=user_id,
        doctor_id=doctor_id,
        patient_name=brief_data["patient_name"],
        age=brief_data["age"],
        blood_group=brief_data["blood_group"],
        reason_for_visit=disease_cat,
        symptom_summary=disease_desc,
        symptom_duration=duration,
        symptom_severity=severity,
        relevant_allergies=brief_data["relevant_allergies"],
        relevant_conditions=brief_data["relevant_conditions"],
        current_medications=brief_data["current_medications"],
        ai_conversation_summary=brief_data["ai_conversation_summary"],
        ai_recommended_specialty=specialization,
        source_records_json=json.dumps(brief_data["source_records"]),
        version="v1.0",
        status="READY"
    )
    appt_repo.save_brief(brief_rec)

    # Queue Async Background Task
    background_tasks.add_task(
        bg_generate_pre_consultation_brief,
        appointment_id=appt_id,
        patient_id=user_id,
        doctor_id=doctor_id,
        doctor_specialty=specialization
    )

    log_audit(user_id, "APPOINTMENT_BOOKED", f"Booked {appt_id} with {doctor_name}")

    return {
        "success": True,
        "message": "Appointment created & Pre-Consultation Summary Brief generated for doctor.",
        "appointment": {
            "id": appt_id,
            "doctorName": doctor_name,
            "specialization": specialization,
            "hospitalName": hospital_name,
            "date": appt_date,
            "time": appt_time,
            "consultationType": consult_type,
            "diseaseCategory": disease_cat,
            "diseaseDescription": disease_desc,
            "status": "CONFIRMED"
        },
        "preConsultationBrief": brief_data
    }

@app.get("/api/doctor/appointments")
def get_doctor_appointments(doctor_id: Optional[str] = "doc_001", _uid: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    appt_repo = AppointmentRepository(db)
    appts = appt_repo.get_by_doctor_id(doctor_id)
    results = []
    for a in appts:
        brief = appt_repo.get_brief_by_appointment_id(a.id)
        results.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "doctorName": a.doctor_name,
            "specialization": a.specialization,
            "hospitalName": a.hospital_name,
            "date": a.appointment_date,
            "time": a.appointment_time,
            "consultationType": a.consultation_type,
            "diseaseCategory": a.disease_category,
            "diseaseDescription": a.disease_description,
            "symptomsDuration": a.symptoms_duration,
            "severityLevel": a.severity_level,
            "patientNotes": a.patient_notes,
            "status": a.status,
            "brief_id": brief.id if brief else None,
            "brief_text": brief.symptom_summary if brief else None
        })
    log_audit(doctor_id or "doc_001", "DOCTOR_VIEW_APPOINTMENTS", "Doctor Dashboard Query")
    return results

@app.get("/api/doctor/appointments/{appointment_id}/patient-brief")
def get_patient_brief_for_doctor(appointment_id: str, doctor_id: Optional[str] = "doc_001", db: Session = Depends(get_db)):
    appt_repo = AppointmentRepository(db)
    context_service = PatientContextService(db)

    brief = appt_repo.get_brief_by_appointment_id(appointment_id)
    if not brief:
        appt = appt_repo.get_by_id(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        context = context_service.get_patient_context_for_doctor(
            patient_id=appt.patient_id,
            doctor_specialty=appt.specialization,
            appointment_id=appointment_id
        )
        b_data = pre_consult_agent.generate_patient_brief(context, context.get("appointment"))
        log_audit(doctor_id or "doc_001", "DOCTOR_VIEW_PATIENT_BRIEF", f"Accessed Brief for Appt {appointment_id}")
        return b_data

    sources = json.loads(brief.source_records_json) if brief.source_records_json else []

    log_audit(doctor_id or "doc_001", "DOCTOR_VIEW_PATIENT_BRIEF", f"Accessed Brief {brief.id}")
    return {
        "id": brief.id,
        "appointment_id": brief.appointment_id,
        "patient_id": brief.patient_id,
        "patient_name": brief.patient_name,
        "age": brief.age,
        "blood_group": brief.blood_group,
        "reason_for_visit": brief.reason_for_visit,
        "symptom_summary": brief.symptom_summary,
        "symptom_duration": brief.symptom_duration,
        "symptom_severity": brief.symptom_severity,
        "relevant_allergies": brief.relevant_allergies,
        "relevant_conditions": brief.relevant_conditions,
        "current_medications": brief.current_medications,
        "ai_conversation_summary": brief.ai_conversation_summary,
        "ai_recommended_specialty": brief.ai_recommended_specialty,
        "sources": sources,
        "version": brief.version,
        "status": brief.status,
        "generated_at": brief.generated_at.isoformat()
    }

@app.post("/api/doctor/appointments/{appointment_id}/consultation")
def save_doctor_consultation(appointment_id: str, req: Dict[str, Any], _uid: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    appt_repo = AppointmentRepository(db)
    medical_repo = MedicalRecordRepository(db)

    appt = appt_repo.get_by_id(appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    consultation_id = f"consult_{uuid.uuid4().hex[:10]}"
    chief_complaint = req.get("chief_complaint") or appt.disease_category
    observations = req.get("clinical_observations") or "Superficial rash noted. No acute distress."
    diagnosis = req.get("assessment_diagnosis") or "Contact Dermatitis / Mild Allergy"
    plan = req.get("plan") or "Prescribed topical ointment and antihistamine. Hydrate and review in 7 days."
    rx_items = req.get("prescription_items") or ["Cetirizine 10mg once daily (5 days)", "Hydrocortisone 1% cream"]

    consult_rec = ConsultationRecord(
        id=consultation_id,
        appointment_id=appointment_id,
        patient_id=appt.patient_id,
        doctor_id=appt.doctor_id,
        chief_complaint=chief_complaint,
        clinical_observations=observations,
        assessment_diagnosis=diagnosis,
        plan=plan,
        prescription_json=json.dumps(rx_items),
        follow_up_date=req.get("follow_up_date") or "2026-10-20"
    )
    appt_repo.save_consultation(consult_rec)

    # Save Prescription Record
    rx_rec = PrescriptionRecord(
        id=f"rx_{uuid.uuid4().hex[:8]}",
        user_id=appt.patient_id,
        doctor_name=appt.doctor_name,
        hospital_name=appt.hospital_name,
        date=datetime.date.today().isoformat(),
        items_json=json.dumps(rx_items),
        notes=f"Diagnosis: {diagnosis}. Plan: {plan}"
    )
    medical_repo.add_prescription(rx_rec)

    # Update Appointment Status
    appt.status = "COMPLETED"
    db.commit()

    # Timeline Record
    timeline_evt = TimelineEventRecord(
        id=f"evt_{uuid.uuid4().hex[:8]}",
        user_id=appt.patient_id,
        date=datetime.date.today().isoformat(),
        time=datetime.datetime.now().strftime("%I:%M %p"),
        type="Doctor Visit",
        title=f"Consultation Completed with {appt.doctor_name}",
        description=f"Diagnosis: {diagnosis}. {plan}",
        doctor_or_source=appt.doctor_name
    )
    medical_repo.add_timeline_event(timeline_evt)

    log_audit(appt.doctor_id, "CONSULTATION_COMPLETED", f"Completed consultation {consultation_id} for patient {appt.patient_id}")

    return {
        "success": True,
        "message": "Consultation saved & patient medical record updated.",
        "consultation_id": consultation_id,
        "diagnosis": diagnosis,
        "prescription": rx_items
    }

# --- TIMELINE & MEDICAL HISTORY ENDPOINTS ---

@app.get("/api/timeline")
@app.get("/api/history")
def get_patient_timeline(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    medical_repo = MedicalRecordRepository(db)
    events = medical_repo.get_timeline_by_patient(user_id)
    results = [
        {
            "id": e.id,
            "date": e.date,
            "time": e.time,
            "type": e.type,
            "title": e.title,
            "description": e.description,
            "doctorOrSource": e.doctor_or_source
        }
        for e in events
    ]
    return results

# --- PATIENT PROFILE ENDPOINTS ---

@app.get("/api/patient/profile")
def get_patient_profile(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    patient_repo = PatientRepository(db)
    user = patient_repo.get_by_id(user_id)
    profile = patient_repo.get_profile_by_user_id(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return {
        "user_id": user_id,
        "name": profile.name,
        "email": user.email if user else None,
        "age": profile.age,
        "gender": profile.gender,
        "blood_group": profile.blood_group,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "allergies": [a.strip() for a in (profile.allergies or "").split(",") if a.strip()],
        "existing_conditions": [c.strip() for c in (profile.existing_conditions or "").split(",") if c.strip()],
        "current_medicines": [m.strip() for m in (profile.current_medicines or "").split(",") if m.strip()],
        "emergency_contact": {
            "name": profile.emergency_contact_name or "",
            "phone": profile.emergency_contact_phone or ""
        },
        "diet_preference": profile.diet_preference,
        "language_preference": profile.language_preference
    }

from app.models.schemas import PatientProfileUpdateRequest

@app.put("/api/patient/profile")
def update_patient_profile(
    req: PatientProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    patient_repo = PatientRepository(db)
    update_data: Dict[str, Any] = {}
    if req.name is not None:
        update_data["name"] = req.name
    if req.age is not None:
        update_data["age"] = req.age
    if req.gender is not None:
        update_data["gender"] = req.gender
    if req.blood_group is not None:
        update_data["blood_group"] = req.blood_group
    if req.height_cm is not None:
        update_data["height_cm"] = req.height_cm
    if req.weight_kg is not None:
        update_data["weight_kg"] = req.weight_kg
    if req.allergies is not None:
        update_data["allergies"] = ", ".join(req.allergies)
    if req.existing_conditions is not None:
        update_data["existing_conditions"] = ", ".join(req.existing_conditions)
    if req.current_medicines is not None:
        update_data["current_medicines"] = ", ".join(req.current_medicines)
    if req.emergency_contact_name is not None:
        update_data["emergency_contact_name"] = req.emergency_contact_name
    if req.emergency_contact_phone is not None:
        update_data["emergency_contact_phone"] = req.emergency_contact_phone
    if req.diet_preference is not None:
        update_data["diet_preference"] = req.diet_preference
    if req.language_preference is not None:
        update_data["language_preference"] = req.language_preference

    profile = patient_repo.update_patient_profile(user_id, update_data)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    log_audit(user_id, "PROFILE_UPDATED", "Patient Profile")
    return {
        "user_id": user_id,
        "name": profile.name,
        "age": profile.age,
        "gender": profile.gender,
        "blood_group": profile.blood_group,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "allergies": [a.strip() for a in (profile.allergies or "").split(",") if a.strip()],
        "existing_conditions": [c.strip() for c in (profile.existing_conditions or "").split(",") if c.strip()],
        "current_medicines": [m.strip() for m in (profile.current_medicines or "").split(",") if m.strip()],
        "emergency_contact": {
            "name": profile.emergency_contact_name or "",
            "phone": profile.emergency_contact_phone or ""
        },
        "diet_preference": profile.diet_preference,
        "language_preference": profile.language_preference
    }

# --- PATIENT APPOINTMENTS ---

@app.get("/api/appointments")
def get_patient_appointments(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    appt_repo = AppointmentRepository(db)
    appts = appt_repo.get_by_patient_id(user_id)
    return [
        {
            "id": a.id,
            "doctorName": a.doctor_name,
            "specialization": a.specialization,
            "hospitalName": a.hospital_name,
            "date": a.appointment_date,
            "time": a.appointment_time,
            "consultationType": a.consultation_type,
            "diseaseCategory": a.disease_category,
            "status": a.status
        }
        for a in appts
    ]

# --- DOCTOR & HOSPITAL DIRECTORIES ---

@app.get("/api/doctors")
def list_doctors(
    specialization: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DoctorRecord)
    if specialization:
        query = query.filter(DoctorRecord.specialization.ilike(f"%{specialization}%"))
    if search:
        query = query.filter(
            DoctorRecord.name.ilike(f"%{search}%") |
            DoctorRecord.specialization.ilike(f"%{search}%") |
            DoctorRecord.hospital_name.ilike(f"%{search}%")
        )
    doctors = query.all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "specialization": d.specialization,
            "qualification": d.qualification,
            "experience_years": d.experience_years,
            "hospital_name": d.hospital_name,
            "address": d.address,
            "phone": d.phone,
            "rating": d.rating,
            "distance_km": d.distance_km,
            "consultation_fee": d.consultation_fee
        }
        for d in doctors
    ]

@app.get("/api/hospitals")
def list_hospitals(
    emergency_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(HospitalRecord)
    if emergency_only:
        query = query.filter(HospitalRecord.emergency_available == True)
    hospitals = query.all()
    return [
        {
            "id": h.id,
            "name": h.name,
            "address": h.address,
            "city": h.city,
            "phone": h.phone,
            "emergency_available": h.emergency_available
        }
        for h in hospitals
    ]

# --- QR TOKEN MANAGEMENT ---

@app.post("/api/qr/generate", response_model=QRCreateResponse)
def generate_qr_token(
    req: QRCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Security: reject attempts to generate a token on behalf of another user
    if req.user_id and req.user_id != user_id:
        log_audit(user_id, "QR_GENERATE_SPOOF_ATTEMPT", f"Tried to generate token for {req.user_id}", "FAILED_FORBIDDEN")
        raise HTTPException(status_code=403, detail="Cannot generate a QR token for another patient")

    token_value = f"qr_{uuid.uuid4().hex}"
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=req.duration_hours)

    qr_record = PatientConsentQRRecord(
        id=f"qrec_{uuid.uuid4().hex[:10]}",
        token=token_value,
        user_id=user_id,
        duration_hours=req.duration_hours,
        expires_at=expires_at,
        is_revoked=False,
        shared_fields_json=json.dumps(req.shared_fields)
    )
    db.add(qr_record)
    db.commit()
    db.refresh(qr_record)

    # Keep in-memory dict in sync for fast lookups
    QR_TOKENS_DB[token_value] = {
        "user_id": user_id,
        "expires_at": expires_at,
        "is_revoked": False,
        "shared_fields": req.shared_fields
    }

    log_audit(user_id, "QR_TOKEN_GENERATED", f"Token {token_value} expires {expires_at.isoformat()}")
    return QRCreateResponse(
        token=token_value,
        qr_url=f"/api/qr/access/{token_value}",
        expires_at=expires_at.isoformat()
    )

@app.post("/api/qr/revoke/{token}")
def revoke_qr_token(
    token: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    qr_record = db.query(PatientConsentQRRecord).filter(PatientConsentQRRecord.token == token).first()
    if not qr_record:
        raise HTTPException(status_code=404, detail="QR token not found")
    if qr_record.user_id != user_id:
        log_audit(user_id, "QR_REVOKE_UNAUTHORIZED", f"Token {token} owned by another patient", "FAILED_FORBIDDEN")
        raise HTTPException(status_code=403, detail="You can only revoke your own QR tokens")
    qr_record.is_revoked = True
    db.commit()
    # Sync in-memory dict
    if token in QR_TOKENS_DB:
        QR_TOKENS_DB[token]["is_revoked"] = True
    log_audit(user_id, "QR_TOKEN_REVOKED", f"Token {token} revoked by patient")
    return {"success": True, "message": "QR access token has been revoked"}

# --- DOCTOR ACCESS VIA QR TOKEN ---

@app.get("/api/qr/access/{token}", response_model=DoctorAccessResponse)
def doctor_access(token: str, db: Session = Depends(get_db)):
    # Look up token in the database (authoritative source)
    qr_record = db.query(PatientConsentQRRecord).filter(PatientConsentQRRecord.token == token).first()
    if not qr_record:
        log_audit("DOCTOR_PORTAL", "QR_ACCESS_DENIED", f"Token {token}", "FAILED_NOT_FOUND")
        raise HTTPException(status_code=404, detail="Invalid or expired QR Access Token")
    if qr_record.is_revoked:
        log_audit("DOCTOR_PORTAL", "QR_ACCESS_DENIED", f"Token {token}", "FAILED_REVOKED")
        raise HTTPException(status_code=403, detail="QR access token has been revoked by the patient")
    if datetime.datetime.utcnow() > qr_record.expires_at:
        log_audit("DOCTOR_PORTAL", "QR_ACCESS_DENIED", f"Token {token}", "FAILED_EXPIRED")
        raise HTTPException(status_code=410, detail="QR access token has expired")

    shared_fields = json.loads(qr_record.shared_fields_json or "{}")
    patient_id = qr_record.user_id

    patient_repo = PatientRepository(db)
    medical_repo = MedicalRecordRepository(db)
    user = patient_repo.get_by_id(patient_id)
    profile = patient_repo.get_profile_by_user_id(patient_id)

    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Apply consent filtering — only return fields the patient consented to share
    allergies = (
    [a.strip() for a in (profile.allergies or "").split(",") if a.strip()]
    if shared_fields.get("allergies", False)
    else []
)

    conditions = (
    [c.strip() for c in (profile.existing_conditions or "").split(",") if c.strip()]
    if shared_fields.get("conditions", False)
    else []
)
    medicines = [m.strip() for m in (profile.current_medicines or "").split(",") if m.strip()] if shared_fields.get("medicines", False) else []
    recent_reports = []
    if shared_fields.get("reports", False):
        reports = medical_repo.get_reports_by_patient(patient_id)
        recent_reports = [{"title": r.title, "date": r.date, "aiSummary": r.ai_summary or ""} for r in reports[:5]]

    prescriptions = []
    if shared_fields.get("prescriptions", False):
        rxs = medical_repo.get_prescriptions_by_patient(patient_id)
        prescriptions = [{"doctor": r.doctor_name, "date": r.date, "items": json.loads(r.items_json or "[]")} for r in rxs[:5]]

    timeline = []
    if shared_fields.get("timeline", False):
        events = medical_repo.get_timeline_by_patient(patient_id)
        timeline = [{"date": e.date, "event": e.title} for e in events[:10]]

    log_audit("DOCTOR_PORTAL", "QR_ACCESS_SUCCESS", f"Authorized Access via token {token} for patient {patient_id}")

    return DoctorAccessResponse(
        patient_name=profile.name if shared_fields.get("profile", False) else "[Consent Not Given]",
age=profile.age if shared_fields.get("profile", False) else 0,
blood_group=profile.blood_group if shared_fields.get("profile", False) else "[Hidden]",
        allergies=allergies,
        conditions=conditions,
        medicines=medicines,
        recent_reports=recent_reports,
        prescriptions=prescriptions,
        timeline=timeline
    )

# --- FHIR STANDARDS API ---

@app.get("/api/fhir/Patient/{patient_id}")

@app.get("/api/fhir/Patient/{patient_id}")
def get_fhir_patient(
    patient_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    if patient_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot access another patient's records"
        )

    patient_repo = PatientRepository(db)
    user = patient_repo.get_by_id(patient_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    profile = patient_repo.get_profile_by_user_id(patient_id)

    patient_data = {
        "user_id": patient_id,
        "name": user.full_name,
        "email": user.email,
        "age": profile.age if profile else None,
        "gender": profile.gender if profile else None,
        "blood_group": profile.blood_group if profile else None
    }

    return FHIRAdapter.to_fhir_patient(patient_data)


# --- SECURITY & AUDIT ENDPOINTS ---

@app.get("/api/audit")
def get_audit_logs(user_id: str = Depends(get_current_user_id)):
    return [
        entry for entry in AUDIT_LOGS_DB
        if entry.get("actor") in (user_id, "system")
    ][:50]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
