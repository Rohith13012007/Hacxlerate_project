export type Language = 'en' | 'te' | 'hi' | 'ta' | 'kn';

export interface UserHealthProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  allergies: string[];
  existingConditions: string[];
  currentMedicines: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  dietPreference: 'Vegetarian' | 'Non-vegetarian' | 'Vegan' | 'Other';
  languagePreference: Language;
}

export type TriageUrgency = 'LOW CONCERN' | 'MODERATE CONCERN' | 'URGENT' | 'EMERGENCY';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  language: Language;
  timestamp: string;
  urgency?: TriageUrgency;
  isEmergency?: boolean;
  audioUrl?: string;
  specialistRecommendation?: string;
  googleMapsUrl?: string;
}

export interface AIConversation {
  id: string;
  title: string;
  startDate: string;
  messages: Message[];
  summary?: string;
  detectedLanguage: Language;
  urgency?: TriageUrgency;
}

export interface HealthReportValue {
  parameter: string;
  result: string;
  unit?: string;
  referenceRange: string;
  isAbnormal?: boolean;
  notes?: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  date: string;
  doctorName: string;
  hospitalName: string;
  reportType: string;
  fileUrl?: string;
  fileName: string;
  values: HealthReportValue[];
  aiSummary: string;
  doctorNotes?: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  items: PrescriptionItem[];
  originalFileUrl?: string;
  notes?: string;
}

export interface MedicineSchedule {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:MM
  frequency: string; // e.g. "Every Day", "Twice Daily"
  durationDays: number;
  startDate: string;
  instructions: string;
}

export interface MedicationLog {
  id: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: string;
  date: string;
  status: 'taken' | 'missed' | 'skipped';
  timestamp?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialization: string;
  hospitalName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "4:30 PM"
  location: string;
  reason: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  lat?: number;
  lng?: number;
  consultationType?: 'In-Person' | 'Video Call';
  diseaseCategory?: string;
  diseaseDescription?: string;
  symptomsDuration?: string;
  severityLevel?: 'Mild' | 'Moderate' | 'Severe';
  patientNotes?: string;
  preConsultationDocUrl?: string;
}

export interface NearbyDoctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  rating: number;
  distanceKm: number;
  travelTimeMins: number;
  address: string;
  phone: string;
  availability: string;
  lat: number;
  lng: number;
}

export interface HealthImageAnalysis {
  id: string;
  imageUrl: string;
  observation: string;
  confidenceScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High';
  explanation: string;
  recommendedAction: string;
  suggestedSpecialist: string;
  timestamp: string;
}

export interface NutritionData {
  calories: number;
  carbsGrams: number;
  proteinGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface FoodScanResult {
  id: string;
  imageUrl?: string;
  foodName: string;
  estimatedNutrition: NutritionData;
  personalizedSuitability: 'Suitable' | 'Caution' | 'Avoid';
  personalizedNotes: string;
  timestamp: string;
}

export type TimelineEventType = 
  | 'Symptom Reported' 
  | 'Doctor Visit' 
  | 'Prescription Added' 
  | 'Medicine Taken' 
  | 'Report Uploaded' 
  | 'Appointment Scheduled' 
  | 'Food Logged' 
  | 'AI Conversation' 
  | 'Vision Analysis';

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: TimelineEventType;
  title: string;
  description: string;
  doctorOrSource?: string;
  details?: Record<string, any>;
}

export interface QRAccessToken {
  token: string;
  createdAt: string;
  expiresAt: string; // ISO string
  durationHours: number;
  isRevoked: boolean;
  sharedFields: {
    profile: boolean;
    conditions: boolean;
    medicines: boolean;
    reports: boolean;
    prescriptions: boolean;
    timeline: boolean;
    aiSummaries: boolean;
  };
}

export interface DailyActivityStats {
  stepsCount: number;
  stepsGoal: number;
  waterIntakeMl: number;
  waterGoalMl: number;
  sleepHours: number;
  sleepGoalHours: number;
  moodRating: number; // 1-5
}
