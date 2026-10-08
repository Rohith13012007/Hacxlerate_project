from pydantic import BaseModel, Field
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
    user_id: str
    duration_hours: int = 24
    shared_fields: Dict[str, bool]

class QRCreateResponse(BaseModel):
    token: str
    qr_url: str
    expires_at: str

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
