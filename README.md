# AI Health Copilot – Personal AI Healthcare Assistant

Our Health Copilot is a personal AI healthcare companion that brings medical records, health tracking, reminders, food analysis, doctor discovery, and conversational assistance together in one platform.

---

## 🌟 Main Features of Our Project

1. **AI Health Assistant** — continuous interaction through voice and text.
2. **Medical Report Analysis** — upload and understand blood reports, prescriptions, and other medical documents.
3. **Camera-Based Health Observation** — analyze health-related images and provide appropriate informational guidance.
4. **Symptom Assistant** — ask questions about symptoms and provide guidance on appropriate next steps.
5. **Doctor Finder** — suggest relevant specialists and nearby doctors, with distance and Google Maps directions.
6. **Food Scanner** — estimate calories, fats, and other nutritional information from food images.
7. **Personal Medical History** — securely organize reports, prescriptions, diseases, and previous conversations.
8. **QR Medical History Sharing** — allow users to share relevant medical information securely with doctors.
9. **Multilingual Assistant** — listen and respond in supported languages (**English**, **Telugu**, **Hindi**, **Tamil**, and **Kannada**).
10. **Health Dashboard** — track water intake, exercise, steps, and other health activities.
11. **Medicine Reminders** — reminders for medicines and dosage schedules.
12. **Appointment Reminders** — help users remember upcoming medical appointments.
13. **Health Timeline and Reports** — organize health records over time and compare available results.
14. **Conversation Transcripts** — preserve text transcripts of AI conversations for future reference.

---

### Detailed Architecture & Technical Breakdown
- **Continuous Live Conversation**: Real-time microphone listening, soundwave animation, natural language processing, and spoken speech synthesis response.
- **Multilingual Support**: Supports **English**, **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, and **Kannada (కన్నడ)** with automatic script/language detection.
- **Dynamic Triage**: Automatically evaluates symptoms and classifies concern level into `LOW CONCERN`, `MODERATE CONCERN`, `URGENT`, or `EMERGENCY`.

### 2. ⚠️ Emergency Detection & Escalation Engine
- Priority safety layer that scans for acute symptoms (chest pain, difficulty breathing, unconsciousness, severe bleeding, stroke).
- Instantly displays emergency alert banners with one-touch options:
  - 📞 **Call Emergency 108 / 911**
  - 🏥 **Find Nearest Emergency Hospital**
  - 📍 **Broadcast GPS Location to Emergency Contact**

### 3. 📷 Camera Health Image Analysis (Vision AI)
- Visual observations for skin rashes, eye redness, swelling, or surface abnormalities.
- Displays AI Confidence Score (%), Risk Indicator (Low/Moderate/High), simplified explanation, recommended action, and specialist category routing.

### 4. 🥗 Food Scanner & Personalized Nutrition AI
- Computer vision food scanner identifying meals (e.g. Rice + Dal + Curry).
- Calculates estimated calories (kcal) and macronutrients (Carbohydrates, Protein, Fat, Fiber).
- Personalizes suitability recommendations against the user's stored medical conditions, allergies, and diet preferences (Vegetarian, Vegan, Non-vegetarian).

### 5. 📄 Medical Document Management & OCR Summarizer
- Upload lab reports, blood panels, or hospital discharge summaries (PDF, JPG, PNG).
- OCR parameter extraction with reference ranges and abnormal flag highlighting.
- Simplified AI Report Summary translating complex medical jargon.

### 6. 💊 Prescription Management & Medicine Reminders
- Extracted dosage, frequency, time, and instructions from doctor prescriptions.
- Automated medicine reminder schedule with adherence logging (**Mark Taken**, **Skipped**, **Missed**).

### 7. 📅 Appointment Management & Nearby Doctor Map Locator
- Book and manage doctor consultations with automated reminder alerts.
- Nearby provider locator with specialization filtering, distance, travel time, and direct **Google Maps Deep-Link Navigation**.
- Specialist category recommendations based on symptoms (e.g., Skin -> Dermatologist).

### 8. 📜 Unified Healthcare History Timeline
- Chronological visual timeline compiling symptoms, doctor visits, lab reports, prescriptions, food logs, and AI conversations.

### 9. 🔐 QR Medical Health Card & Doctor Access Portal
- Generates secure tokenized access QR codes with configurable expiration (1 hr, 24 hrs, 7 days) and user consent field filters.
- Dedicated **Doctor Portal (`/doctor-access`)** providing doctors with authorized medical summaries clearly labeled into *Patient-Provided*, *Doctor-Provided*, and *AI-Generated* categories.

### 10. 🎯 Hackathon Demo Mode
- Pre-loaded with complete fictional patient data (Akhil Sharma, 28 yrs, blood reports, prescriptions, eczema history, appointments) for 100% out-of-the-box demonstration.

---

## 🛠️ Project Structure

```
Hacxlerate_project/
├── frontend/                     # React (Vite + TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, VoiceAssistantModal, EmergencyModal, QRCodeModal, SafetyBanner
│   │   ├── pages/               # Dashboard, Assistant, HealthScan, FoodScan, Reports, Medicines, Appointments, Doctors, History, Profile, DoctorPortal, Emergency, Settings
│   │   ├── context/             # HealthContext state management & demo data store
│   │   ├── services/            # speechService (STT/TTS), mockData, aiOrchestrator
│   │   ├── types/               # Domain interfaces & schemas
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                      # Python FastAPI AI Service
│   ├── app/
│   │   ├── main.py              # FastAPI endpoints & CORS
│   │   ├── agents/              # Orchestrator, Triage, Vision, Food, Document OCR
│   │   └── models/              # Pydantic Schemas
│   └── requirements.txt
└── README.md
```

---

## 🚀 Getting Started

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```
Open browser at `http://localhost:5173`.

### Running Python FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Open API Swagger docs at `http://localhost:8000/docs`.

---

## 🛡️ Safety & Medical Disclaimers
*The AI Health Copilot is designed to assist individuals in organizing and navigating their healthcare journey. All outputs are clearly labeled as AI-assisted observations and do NOT constitute a definitive medical diagnosis or replace a qualified healthcare professional.*
