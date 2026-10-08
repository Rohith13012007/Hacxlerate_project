from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.db.models import User, PatientProfile

class PatientRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_profile_by_user_id(self, user_id: str) -> Optional[PatientProfile]:
        return self.db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()

    def create_patient_profile(self, profile: PatientProfile) -> PatientProfile:
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update_patient_profile(self, user_id: str, data: Dict[str, Any]) -> Optional[PatientProfile]:
        profile = self.get_profile_by_user_id(user_id)
        if not profile:
            return None
        for key, value in data.items():
            if hasattr(profile, key) and value is not None:
                setattr(profile, key, value)
        self.db.commit()
        self.db.refresh(profile)
        return profile
