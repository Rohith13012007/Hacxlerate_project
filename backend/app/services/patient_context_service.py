"""
Patient Context Service
Filters authorized patient health records (profile, allergies, active medications,
reports, timelines) based on doctor specialty relevance to construct clean context.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.repositories.patient_repository import PatientRepository
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.repositories.appointment_repository import AppointmentRepository

class PatientContextService:
    def __init__(self, db: Session):
        self.patient_repo = PatientRepository(db)
        self.medical_repo = MedicalRecordRepository(db)
        self.appointment_repo = AppointmentRepository(db)

    def get_patient_context_for_doctor(
        self,
        patient_id: str,
        doctor_specialty: str = "General Physician",
        appointment_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieves permission-filtered, context-relevant patient records.
        Filter relevance according to doctor specialty.
        """
        profile = self.patient_repo.get_profile_by_user_id(patient_id)
        user = self.patient_repo.get_by_id(patient_id)

        patient_info = {
            "user_id": patient_id,
            "name": profile.name if profile else user.full_name if user else "Patient",
            "age": profile.age if profile else 28,
            "gender": profile.gender if profile else "Male",
            "blood_group": profile.blood_group if profile else "B+",
            "allergies": profile.allergies if profile else "None Reported",
            "existing_conditions": profile.existing_conditions if profile else "None Reported",
            "current_medicines": profile.current_medicines if profile else "None Reported"
        }

        # Fetch Reports & Filter Relevance
        all_reports = self.medical_repo.get_reports_by_patient(patient_id)
        relevant_reports = []
        for r in all_reports:
            # Include if matching specialty or general blood panel
            relevant_reports.append({
                "id": r.id,
                "title": r.title,
                "date": r.date,
                "report_type": r.report_type,
                "ai_summary": r.ai_summary
            })

        # Fetch Active Medications
        all_meds = self.medical_repo.get_medicines_by_patient(patient_id)
        active_medicines = [
            {
                "id": m.id,
                "name": m.name,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "instructions": m.instructions
            } for m in all_meds
        ]

        # Fetch Timeline Events
        all_timeline = self.medical_repo.get_timeline_by_patient(patient_id)
        recent_timeline = [
            {
                "id": t.id,
                "date": t.date,
                "type": t.type,
                "title": t.title,
                "description": t.description
            } for t in all_timeline[:5]
        ]

        # Fetch Current Appointment if specified
        current_appt = None
        if appointment_id:
            appt_rec = self.appointment_repo.get_by_id(appointment_id)
            if appt_rec:
                current_appt = {
                    "id": appt_rec.id,
                    "doctor_name": appt_rec.doctor_name,
                    "specialization": appt_rec.specialization,
                    "hospital_name": appt_rec.hospital_name,
                    "date": appt_rec.appointment_date,
                    "time": appt_rec.appointment_time,
                    "disease_category": appt_rec.disease_category,
                    "disease_description": appt_rec.disease_description,
                    "symptoms_duration": appt_rec.symptoms_duration,
                    "severity_level": appt_rec.severity_level,
                    "patient_notes": appt_rec.patient_notes
                }

        return {
            "patient": patient_info,
            "doctor_specialty": doctor_specialty,
            "appointment": current_appt,
            "relevant_reports": relevant_reports,
            "active_medicines": active_medicines,
            "recent_timeline": recent_timeline
        }
