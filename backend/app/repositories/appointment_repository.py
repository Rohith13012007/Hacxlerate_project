from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import AppointmentRecord, PatientConsultationBriefRecord, ConsultationRecord

class AppointmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, appointment_id: str) -> Optional[AppointmentRecord]:
        return self.db.query(AppointmentRecord).filter(AppointmentRecord.id == appointment_id).first()

    def get_by_patient_id(self, patient_id: str) -> List[AppointmentRecord]:
        return self.db.query(AppointmentRecord).filter(AppointmentRecord.patient_id == patient_id).order_by(AppointmentRecord.created_at.desc()).all()

    def get_by_doctor_id(self, doctor_id: str) -> List[AppointmentRecord]:
        return self.db.query(AppointmentRecord).filter(AppointmentRecord.doctor_id == doctor_id).order_by(AppointmentRecord.created_at.desc()).all()

    def create_appointment(self, appointment: AppointmentRecord) -> AppointmentRecord:
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def save_brief(self, brief: PatientConsultationBriefRecord) -> PatientConsultationBriefRecord:
        self.db.add(brief)
        self.db.commit()
        self.db.refresh(brief)
        return brief

    def get_brief_by_appointment_id(self, appointment_id: str) -> Optional[PatientConsultationBriefRecord]:
        return self.db.query(PatientConsultationBriefRecord).filter(PatientConsultationBriefRecord.appointment_id == appointment_id).first()

    def save_consultation(self, consultation: ConsultationRecord) -> ConsultationRecord:
        self.db.add(consultation)
        self.db.commit()
        self.db.refresh(consultation)
        return consultation
