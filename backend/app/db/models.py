import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="PATIENT") # PATIENT, DOCTOR, CAREGIVER, ADMIN
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("PatientProfile", back_populates="user", uselist=False)

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, default=28)
    gender = Column(String(20), default="Male")
    blood_group = Column(String(10), default="B+")
    height_cm = Column(Float, default=175.0)
    weight_kg = Column(Float, default=70.0)
    allergies = Column(Text, default="Penicillin, Peanut") # Comma-separated
    existing_conditions = Column(Text, default="Mild Eczema, Seasonal Asthma")
    current_medicines = Column(Text, default="Cetirizine 10mg, Vitamin D3 60k IU")
    emergency_contact_name = Column(String(100), default="Suresh Sharma")
    emergency_contact_phone = Column(String(50), default="+91 98765 12345")
    diet_preference = Column(String(50), default="Vegetarian")
    language_preference = Column(String(10), default="en")

    user = relationship("User", back_populates="profile")

class DoctorRecord(Base):
    __tablename__ = "doctors"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=True)
    name = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=False)
    qualification = Column(String(100), default="MBBS, MD")
    experience_years = Column(Integer, default=12)
    hospital_name = Column(String(100), nullable=False)
    hospital_id = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    rating = Column(Float, default=4.8)
    distance_km = Column(Float, default=2.0)
    consultation_fee = Column(String(20), default="₹750")

class HospitalRecord(Base):
    __tablename__ = "hospitals"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(50), default="Hyderabad")
    phone = Column(String(50), nullable=True)
    emergency_available = Column(Boolean, default=True)

class AppointmentRecord(Base):
    __tablename__ = "appointments"

    id = Column(String(50), primary_key=True, index=True)
    patient_id = Column(String(50), nullable=False, index=True)
    doctor_id = Column(String(50), nullable=False, index=True)
    doctor_name = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=False)
    hospital_name = Column(String(100), nullable=False)
    appointment_date = Column(String(20), nullable=False)
    appointment_time = Column(String(20), nullable=False)
    consultation_type = Column(String(50), default="In-Person")
    disease_category = Column(String(100), nullable=False)
    disease_description = Column(Text, nullable=False)
    symptoms_duration = Column(String(50), default="3-5 Days")
    severity_level = Column(String(20), default="Moderate")
    patient_notes = Column(Text, nullable=True)
    status = Column(String(30), default="CONFIRMED") # REQUESTED, CONFIRMED, COMPLETED, CANCELLED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PatientConsultationBriefRecord(Base):
    __tablename__ = "patient_consultation_briefs"

    id = Column(String(50), primary_key=True, index=True)
    appointment_id = Column(String(50), ForeignKey("appointments.id"), nullable=False, index=True)
    patient_id = Column(String(50), nullable=False, index=True)
    doctor_id = Column(String(50), nullable=False, index=True)
    patient_name = Column(String(100), nullable=False)
    age = Column(Integer, default=28)
    blood_group = Column(String(10), default="B+")
    reason_for_visit = Column(String(100), nullable=False)
    symptom_summary = Column(Text, nullable=False)
    symptom_duration = Column(String(50), nullable=False)
    symptom_severity = Column(String(20), nullable=False)
    relevant_allergies = Column(Text, nullable=True)
    relevant_conditions = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    ai_conversation_summary = Column(Text, nullable=True)
    ai_recommended_specialty = Column(String(100), nullable=True)
    source_records_json = Column(Text, nullable=True)
    version = Column(String(10), default="v1.0")
    status = Column(String(20), default="READY")
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

class ConsultationRecord(Base):
    __tablename__ = "consultations"

    id = Column(String(50), primary_key=True, index=True)
    appointment_id = Column(String(50), ForeignKey("appointments.id"), nullable=False, index=True)
    patient_id = Column(String(50), nullable=False, index=True)
    doctor_id = Column(String(50), nullable=False, index=True)
    chief_complaint = Column(Text, nullable=False)
    clinical_observations = Column(Text, nullable=False)
    assessment_diagnosis = Column(Text, nullable=False)
    plan = Column(Text, nullable=False)
    prescription_json = Column(Text, nullable=True)
    follow_up_date = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TimelineEventRecord(Base):
    __tablename__ = "timeline_events"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    date = Column(String(20), nullable=False)
    time = Column(String(20), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    doctor_or_source = Column(String(100), nullable=True)

class MedicalReportRecord(Base):
    __tablename__ = "medical_reports"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    date = Column(String(20), nullable=False)
    doctor_name = Column(String(100), nullable=True)
    hospital_name = Column(String(100), nullable=True)
    report_type = Column(String(100), nullable=True)
    file_name = Column(String(255), nullable=True)
    extracted_json = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)

class PrescriptionRecord(Base):
    __tablename__ = "prescriptions"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    doctor_name = Column(String(100), nullable=False)
    hospital_name = Column(String(100), nullable=True)
    date = Column(String(20), nullable=False)
    items_json = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)

class MedicineScheduleRecord(Base):
    __tablename__ = "medicine_schedules"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    dosage = Column(String(50), nullable=False)
    time = Column(String(20), nullable=False)
    frequency = Column(String(50), nullable=False)
    duration_days = Column(Integer, default=7)
    start_date = Column(String(20), nullable=False)
    instructions = Column(Text, nullable=True)

class FoodScanRecord(Base):
    __tablename__ = "food_scans"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    food_name = Column(String(150), nullable=False)
    calories = Column(Integer, default=0)
    carbs_g = Column(Float, default=0.0)
    protein_g = Column(Float, default=0.0)
    fat_g = Column(Float, default=0.0)
    fiber_g = Column(Float, default=0.0)
    suitability = Column(String(50), default="Suitable")
    notes = Column(Text, nullable=True)
    timestamp = Column(String(50), nullable=False)

class VisionScanRecord(Base):
    __tablename__ = "vision_scans"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    image_url = Column(Text, nullable=True)
    observation = Column(String(255), nullable=False)
    confidence_score = Column(Float, default=85.0)
    risk_level = Column(String(20), default="Low")
    explanation = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    suggested_specialist = Column(String(100), default="Dermatologist")
    timestamp = Column(String(50), nullable=False)

class DoctorAccessLogRecord(Base):
    __tablename__ = "doctor_access_logs"

    id = Column(String(50), primary_key=True, index=True)
    doctor_id = Column(String(50), nullable=False, index=True)
    patient_id = Column(String(50), nullable=False, index=True)
    appointment_id = Column(String(50), nullable=True)
    resource_type = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    accessed_at = Column(DateTime, default=datetime.datetime.utcnow)

class PatientConsentQRRecord(Base):
    __tablename__ = "patient_qr_tokens"

    id = Column(String(50), primary_key=True, index=True)
    token = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    duration_hours = Column(Integer, default=24)
    expires_at = Column(DateTime, nullable=False, index=True)
    is_revoked = Column(Boolean, default=False)
    shared_fields_json = Column(Text, nullable=False, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
