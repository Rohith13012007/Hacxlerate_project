from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    age: Optional[int] = 28
    gender: Optional[str] = "Male"
    blood_group: Optional[str] = "B+"

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user_id: str
    email: str
    full_name: str
    age: int
    gender: str
    blood_group: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    language: Optional[str] = "en"
    user_id: Optional[str] = "user_001"

class ChatResponse(BaseModel):
    conversation_id: str
    reply_text: str
    detected_language: str
    urgency: str  # LOW CONCERN, MODERATE CONCERN, URGENT, EMERGENCY
    is_emergency: bool
    specialist_recommendation: Optional[str] = None
    followup_questions: List[str] = []
    audio_base64: Optional[str] = None

class HealthImageAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    body_part: Optional[str] = None

class HealthImageAnalysisResponse(BaseModel):
    observation: str
    confidence_score: float
    risk_level: str
    explanation: str
    recommended_action: str
    suggested_specialist: str
    disclaimer: str

class FoodAnalysisRequest(BaseModel):
    food_name: Optional[str] = None
    image_base64: Optional[str] = None
    allergies: List[str] = []
    existing_conditions: List[str] = []

class FoodAnalysisResponse(BaseModel):
    food_name: str
    calories: int
    carbs_g: float
    protein_g: float
    fat_g: float
    fiber_g: float
    suitability: str  # Suitable, Caution, Avoid
    personalized_notes: str
    disclaimer: str

class DocumentUploadRequest(BaseModel):
    file_name: str
    document_type: str  # Blood Test, Prescription, Doctor Summary

class DocumentOCRResponse(BaseModel):
    extracted_text: str
    extracted_values: List[Dict[str, Any]]
    ai_summary: str
    disclaimer: str

class QRCreateRequest(BaseModel):
    user_id: Optional[str] = None
    duration_hours: int = 24
    shared_fields: Dict[str, bool] = Field(default_factory=dict)

class QRCreateResponse(BaseModel):
    token: str
    qr_url: str
    expires_at: str

class PatientProfileResponse(BaseModel):
    user_id: str
    name: str
    email: Optional[str] = None
    age: int
    gender: str
    blood_group: str
    height_cm: Optional[float] = 175.0
    weight_kg: Optional[float] = 70.0
    allergies: List[str] = []
    existing_conditions: List[str] = []
    current_medicines: List[str] = []
    emergency_contact: Dict[str, str] = Field(default_factory=dict)
    diet_preference: Optional[str] = "Vegetarian"
    language_preference: Optional[str] = "en"

class PatientProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=130)
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height_cm: Optional[float] = Field(None, ge=30.0, le=300.0)
    weight_kg: Optional[float] = Field(None, ge=1.0, le=500.0)
    allergies: Optional[List[str]] = None
    existing_conditions: Optional[List[str]] = None
    current_medicines: Optional[List[str]] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=50)
    diet_preference: Optional[str] = Field(None, max_length=50)
    language_preference: Optional[str] = Field(None, max_length=10)

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        allowed = {"male": "Male", "female": "Female", "other": "Other", "prefer not to say": "Prefer not to say"}
        cleaned = v.strip().lower()
        if cleaned not in allowed:
            raise ValueError("Gender must be one of: 'Male', 'Female', 'Other', 'Prefer not to say'")
        return allowed[cleaned]

    @field_validator("blood_group")
    @classmethod
    def validate_blood_group(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip().upper()
        valid_groups = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "UNKNOWN"}
        if cleaned not in valid_groups:
            raise ValueError("Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown")
        return cleaned if cleaned != "UNKNOWN" else "Unknown"

class DoctorAccessResponse(BaseModel):
    patient_name: str
    age: int
    blood_group: str
    allergies: List[str]
    conditions: List[str]
    medicines: List[str]
    recent_reports: List[Dict[str, Any]]
    prescriptions: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]
