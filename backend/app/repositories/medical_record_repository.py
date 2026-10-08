from typing import Optional, List
from sqlalchemy.orm import Session
from app.db.models import MedicalReportRecord, PrescriptionRecord, MedicineScheduleRecord, TimelineEventRecord

class MedicalRecordRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_reports_by_patient(self, patient_id: str) -> List[MedicalReportRecord]:
        return self.db.query(MedicalReportRecord).filter(MedicalReportRecord.user_id == patient_id).all()

    def get_prescriptions_by_patient(self, patient_id: str) -> List[PrescriptionRecord]:
        return self.db.query(PrescriptionRecord).filter(PrescriptionRecord.user_id == patient_id).all()

    def get_medicines_by_patient(self, patient_id: str) -> List[MedicineScheduleRecord]:
        return self.db.query(MedicineScheduleRecord).filter(MedicineScheduleRecord.user_id == patient_id).all()

    def get_timeline_by_patient(self, patient_id: str) -> List[TimelineEventRecord]:
        return self.db.query(TimelineEventRecord).filter(TimelineEventRecord.user_id == patient_id).order_by(TimelineEventRecord.date.desc()).all()

    def add_timeline_event(self, event: TimelineEventRecord) -> TimelineEventRecord:
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def add_prescription(self, prescription: PrescriptionRecord) -> PrescriptionRecord:
        self.db.add(prescription)
        self.db.commit()
        self.db.refresh(prescription)
        return prescription
