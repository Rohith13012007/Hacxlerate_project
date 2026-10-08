# AI Health Copilot – Personal AI Healthcare Assistant

An AI-powered Personal Health Copilot web and mobile application designed to help individuals understand, organize, and manage their continuous healthcare journey.

---

## 🌟 Key Features

### 1. 🎤 Live AI Voice Assistant (Continuous Speech-To-Text & TTS)
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
