import React, { createContext, useContext, useState } from 'react';
import type {
  UserHealthProfile,
  DailyActivityStats,
  AIConversation,
  MedicalReport,
  Prescription,
  MedicineSchedule,
  MedicationLog,
  Appointment,
  TimelineEvent,
  FoodScanResult,
  HealthImageAnalysis,
  Language,
  QRAccessToken,
  Message
} from '../types';
import {
  initialProfile,
  initialDailyStats,
  initialReports,
  initialPrescriptions,
  initialMedicines,
  initialMedLogs,
  initialAppointments,
  initialTimelineEvents,
  initialFoodScans,
  initialVisionScans,
  initialConversations
} from '../services/mockData';
import { queryGroqChat, detectLanguageFromText, analyzeAndSummarizePatientSession } from '../services/groqService';
import type { PatientSessionSummary } from '../services/groqService';




export interface AuthUser {
  user_id: string;
  email: string;
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  token?: string;
}

interface HealthContextType {
  currentUser: AuthUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string, fullName?: string, age?: number, gender?: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, age?: number, gender?: string) => Promise<boolean>;
  logout: () => void;

  profile: UserHealthProfile;
  dailyStats: DailyActivityStats;
  reports: MedicalReport[];
  prescriptions: Prescription[];
  medicines: MedicineSchedule[];
  medLogs: MedicationLog[];
  appointments: Appointment[];
  timeline: TimelineEvent[];
  foodScans: FoodScanResult[];
  visionScans: HealthImageAnalysis[];
  conversations: AIConversation[];
  activeConversationId: string;
  activeLanguage: Language;
  isVoiceModalOpen: boolean;
  isEmergencyModalOpen: boolean;
  activeQRTokens: QRAccessToken[];
  
  // Handlers
  setProfile: (p: UserHealthProfile) => void;
  setActiveLanguage: (lang: Language) => void;
  setIsVoiceModalOpen: (open: boolean) => void;
  setIsEmergencyModalOpen: (open: boolean) => void;
  
  // Tracking
  addWaterIntake: (ml: number) => void;
  addSteps: (steps: number) => void;
  
  // AI Chat & Voice
  sendMessageToCopilot: (text: string) => Promise<Message>;
  startNewConversation: () => string;
  completeAndStoreConversationSummary: (convId?: string) => Promise<PatientSessionSummary>;

  
  // Records CRUD
  addMedicalReport: (report: Omit<MedicalReport, 'id'>) => void;
  addPrescription: (rx: Omit<Prescription, 'id'>) => void;
  addMedicineSchedule: (med: Omit<MedicineSchedule, 'id'>) => void;
  logMedicationStatus: (medicineId: string, status: 'taken' | 'missed' | 'skipped') => void;
  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  addFoodScanResult: (food: Omit<FoodScanResult, 'id'>) => void;
  addVisionAnalysis: (vision: Omit<HealthImageAnalysis, 'id'>) => void;
  
  // QR Sharing
  generateQRToken: (durationHours: number, sharedFields: QRAccessToken['sharedFields']) => QRAccessToken;
  revokeQRToken: (token: string) => void;
  
  // Demo Reset
  resetDemoData: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserHealthProfile>(initialProfile);
  const [dailyStats, setDailyStats] = useState<DailyActivityStats>(initialDailyStats);
  const [reports, setReports] = useState<MedicalReport[]>(initialReports);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [medicines, setMedicines] = useState<MedicineSchedule[]>(initialMedicines);
  const [medLogs, setMedLogs] = useState<MedicationLog[]>(initialMedLogs);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimelineEvents);
  const [foodScans, setFoodScans] = useState<FoodScanResult[]>(initialFoodScans);
  const [visionScans, setVisionScans] = useState<HealthImageAnalysis[]>(initialVisionScans);
  const [conversations, setConversations] = useState<AIConversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>(initialConversations[0].id);
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [activeQRTokens, setActiveQRTokens] = useState<QRAccessToken[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('HEALTH_COPILOT_USER');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const login = async (email: string, password: string, fullName?: string, age?: number, gender?: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('API unavailable');
      const data: AuthUser = await res.json();
      setCurrentUser(data);
      localStorage.setItem('HEALTH_COPILOT_USER', JSON.stringify(data));
      setProfile(prev => ({ ...prev, name: data.full_name, age: data.age, gender: data.gender as any, bloodGroup: data.blood_group }));
      return true;
    } catch (e) {
      const resolvedName = fullName || (email.includes('@') ? email.split('@')[0] : email);
      const demoUser: AuthUser = {
        user_id: `usr_${Date.now()}`,
        email,
        full_name: resolvedName,
        age: age || 28,
        gender: gender || 'Male',
        blood_group: 'B+',
        token: `token_${Date.now()}`
      };
      setCurrentUser(demoUser);
      localStorage.setItem('HEALTH_COPILOT_USER', JSON.stringify(demoUser));
      setProfile(prev => ({ ...prev, name: resolvedName, age: demoUser.age }));
      return true;
    }
  };

  const register = async (email: string, password: string, fullName: string, age?: number, gender?: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, age: age || 28, gender: gender || 'Male' })
      });
      if (!res.ok) return false;
      const data: AuthUser = await res.json();
      setCurrentUser(data);
      localStorage.setItem('HEALTH_COPILOT_USER', JSON.stringify(data));
      setProfile(prev => ({ ...prev, name: data.full_name, age: data.age, gender: data.gender as any, bloodGroup: data.blood_group }));
      return true;
    } catch (e) {
      const demoUser: AuthUser = {
        user_id: `usr_${Date.now()}`,
        email,
        full_name: fullName,
        age: age || 28,
        gender: gender || 'Male',
        blood_group: 'B+',
        token: `token_${Date.now()}`
      };
      setCurrentUser(demoUser);
      localStorage.setItem('HEALTH_COPILOT_USER', JSON.stringify(demoUser));
      setProfile(prev => ({ ...prev, name: fullName, age: age || 28, gender: (gender || 'Male') as any }));
      return true;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('HEALTH_COPILOT_USER');
    if (typeof window !== 'undefined') {
      window.location.hash = '/';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Water tracking
  const addWaterIntake = (ml: number) => {
    setDailyStats(prev => ({
      ...prev,
      waterIntakeMl: Math.min(prev.waterIntakeMl + ml, 5000)
    }));
  };

  // Steps tracking
  const addSteps = (steps: number) => {
    setDailyStats(prev => ({
      ...prev,
      stepsCount: prev.stepsCount + steps
    }));
  };

  // Helper for timeline log
  const pushTimelineEvent = (type: TimelineEvent['type'], title: string, description: string, docOrSource?: string) => {
    const now = new Date();
    const newEvt: TimelineEvent = {
      id: `evt_${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      title,
      description,
      doctorOrSource: docOrSource
    };
    setTimeline(prev => [newEvt, ...prev]);
  };

  // Start new AI chat session
  const startNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    const newConv: AIConversation = {
      id: newId,
      title: `Live Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      startDate: new Date().toISOString().split('T')[0],
      detectedLanguage: activeLanguage,
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  // AI Message dispatcher (orchestrator logic with Auto Language & Groq)
  const sendMessageToCopilot = async (text: string): Promise<Message> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Auto-detect language from incoming user message script or keyword request
    const autoLang = detectLanguageFromText(text);
    const currentLang = autoLang ? autoLang : activeLanguage;
    if (autoLang && autoLang !== activeLanguage) {
      setActiveLanguage(autoLang);
    }

    const userMsg: Message = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      language: currentLang,
      timestamp: nowStr
    };

    // Update active conversation with user message
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return { ...c, detectedLanguage: currentLang, messages: [...c.messages, userMsg] };
      }
      return c;
    }));

    // Detect Emergency
    const lowered = text.toLowerCase();
    const isEmergency = ["chest pain", "difficulty breathing", "unconscious", "stroke", "severe bleeding", "seizure"].some(k => lowered.includes(k));

    if (isEmergency) {
      setIsEmergencyModalOpen(true);
    }

    // Query Groq API if key is present
    const activeConv = conversations.find(c => c.id === activeConversationId);
    const history = activeConv ? activeConv.messages.map(m => ({ sender: m.sender, text: m.text })) : [];
    
    let aiText = "";
    let urgency: Message['urgency'] = isEmergency ? 'EMERGENCY' : 'LOW CONCERN';
    let specRec: string | undefined = undefined;

    const groqRes = await queryGroqChat(text, currentLang, history);

    if (groqRes && groqRes.reply) {
      aiText = groqRes.reply;
      urgency = groqRes.urgency;
      specRec = groqRes.specialist;
      if (groqRes.detectedLanguage && groqRes.detectedLanguage !== activeLanguage) {
        setActiveLanguage(groqRes.detectedLanguage as any);
      }
    } else {
      // Try FastAPI Backend Orchestrator Endpoint
      try {
        const backendRes = await fetch('http://localhost:8000/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            language: currentLang,
            conversation_id: activeConversationId
          })
        });

        if (backendRes.ok) {
          const bData = await backendRes.json();
          if (bData.reply_text) {
            aiText = bData.reply_text;
            urgency = bData.urgency || urgency;
            specRec = bData.specialist_recommendation;
          }
        }
      } catch (backendErr) {
        console.warn('Backend API fallback exception:', backendErr);
      }
    }

    // Dynamic Well-Wisher Fallback Engine if neither Groq nor Backend responded
    if (!aiText) {
      const isGreeting = ["hi", "hello", "hey", "good morning", "good evening", "namaste", "namaskaram", "vanakkam"].some(g => lowered === g || lowered.startsWith(g + ' ') || lowered.endsWith(' ' + g));
      
      if (isGreeting) {
        if (currentLang === 'te') {
          aiText = "నమస్కారం మై డియర్ ఫ్రెండ్! 🌼 నేను మీ హెల్త్ వెల్-విషర్ (Health Well-Wisher) AI కాపైలట్. మీ ఆరోగ్యం మరియు ప్రశాంతత నాకు అత్యంత ముఖ్యం! ఈ రోజు మీరు ఎలా ఉన్నారు? మీ ఆరోగ్యంలో ఏమైనా అసౌకర్యం ఉందా లేదా ఏమైనా అడగాలనుకుంటున్నారా?";
        } else if (currentLang === 'hi') {
          aiText = "नमस्ते प्यारे दोस्त! 🌼 मैं आपका हेल्थ वेल-विशर (Health Well-Wisher) AI कोपायलट हूं। आपकी सेहत और भलाई मेरे लिए सबसे महत्वपूर्ण है! आज आप कैसा महसूस कर रहे हैं? क्या कोई तकलीफ या स्वास्थ्य सवाल है जिसमें मैं मदद करूं?";
        } else {
          aiText = "Hello dear friend! 🌼 I am your Health Well-Wisher AI Copilot. Your health, peace of mind, and well-being mean everything to me! How are you feeling today? Are you experiencing any symptoms, or is there any health concern I can guide you with?";
        }
        aiText += "\n\n" + (currentLang === 'te' ? "(గమనిక: AI వెల్-విషర్ మార్గదర్శకత్వం మాత్రమే. వైద్య నిర్ధారణ కోసం డాక్టర్‌ను సంప్రదించండి.)" : "(Note: AI Well-Wisher guidance only. Please consult a qualified doctor for diagnosis.)");
      } else if (lowered.includes("i didnt mention") || lowered.includes("didn't mention") || lowered.includes("nothing") || lowered.includes("what can you do")) {
        if (currentLang === 'te') {
          aiText = "అవును మై డియర్ ఫ్రెండ్! 🌼 నేను మీ వ్యక్తిగత హెల్త్ వెల్-విషర్ కాపైలట్. మీకు ఎప్పుడు ఏమైనా ఆరోగ్య సమస్యలు (జ్వరం, తలనొప్పి, చర్మంపై దద్దుర్లు, కడుపునొప్పి వంటివి) వచ్చినా లేదా మందులు, డాక్టర్ల గురించి సలహా కావాలన్నా నాతో పంచుకోండి. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?";
        } else if (currentLang === 'hi') {
          aiText = "जी प्यारे दोस्त! 🌼 मैं आपका पर्सनल हेल्थ वेल-विशर कोपायलट हूं। जब भी आपको कोई स्वास्थ्य समस्या (बुखार, सिरदर्द, त्वचा की एलर्जी, पेट दर्द आदि) हो या डॉक्टर की सलाह चाहिए, आप निसंकोच मुझसे साझा कर सकते हैं। आज मैं आपकी क्या मदद कर सकता हूं?";
        } else {
          aiText = "Ah, no problem dear friend! 🌼 As your personal Health Well-Wisher, whenever you feel unwell, experience any symptoms (like fever, headache, skin rash, stomach ache), or need guidance on doctors and nutrition, I'm right here for you. How can I assist your health journey today?";
        }
        aiText += "\n\n" + (currentLang === 'te' ? "(గమనిక: AI వెల్-విషర్ మార్గదర్శకత్వం మాత్రమే. వైద్య నిర్ధారణ కోసం డాక్టర్‌ను సంప్రదించండి.)" : "(Note: AI Well-Wisher guidance only. Please consult a qualified doctor for diagnosis.)");
      } else {
        // Detailed 3-Step Well-Wisher Health Analysis
        let spec = "General Physician";
        let doctorSuggestion = "Dr. Ananya Reddy (General Physician - KIMS Multi-Specialty Hospital, 4.1 km away)";
        let firstAid = "";
        let adviceTips = "";
        let concernNote = "";

        if (lowered.includes('skin') || lowered.includes('rash') || lowered.includes('itch') || lowered.includes('eczema') || lowered.includes('allergy')) {
          spec = "Dermatologist";
          doctorSuggestion = "Dr. Priya Sharma (Dermatologist - Apollo Skin Clinic, 1.8 km away)";
          concernNote = "Oh dear, I am so sorry to hear about your skin irritation and discomfort. Skin rash can feel quite bothering, but stay calm—we will care for it together!";
          firstAid = "1. **Cool Compress**: Apply a clean, cool damp cloth to the irritated area for 10-15 minutes.\n2. **Avoid Scratching**: Gently tap around the skin instead of scratching to prevent infection.\n3. **Gentle Cleanse**: Wash softly with lukewarm water and mild fragrance-free soap.";
          adviceTips = "- Apply a gentle non-fragranced moisturizer or soothing aloe vera gel.\n- Wear loose, breathable cotton clothing.\n- Stay hydrated with 8-10 glasses of water daily.";
        } else if (lowered.includes('headache') || lowered.includes('head') || lowered.includes('migraine')) {
          spec = "Neurologist / General Physician";
          doctorSuggestion = "Dr. Ramesh Kumar (General Physician - Care Clinic) / Dr. Ananya Reddy (KIMS Hospital)";
          concernNote = "I'm so sorry you're experiencing head pain dear friend. Please rest your eyes and take it easy!";
          firstAid = "1. **Rest in Dark Room**: Lie down in a quiet, dimly lit, cool room.\n2. **Hydration**: Drink a fresh glass of room-temperature water immediately.\n3. **Cold Compress**: Place a cool damp cloth across your forehead or temples.";
          adviceTips = "- Dim digital screens and limit smartphone blue light.\n- Avoid loud noises, strong lights, and caffeine.\n- Practice 5 minutes of slow, deep breathing.";
        } else if (lowered.includes('stomach') || lowered.includes('gastric') || lowered.includes('acid') || lowered.includes('nausea') || lowered.includes('digestion')) {
          spec = "Gastroenterologist";
          doctorSuggestion = "Dr. Ananya Reddy (General Physician - KIMS Multi-Specialty Hospital, 4.1 km away)";
          concernNote = "Oh, stomach discomfort can be so draining! Please sit comfortably and relax while we get you some relief.";
          firstAid = "1. **Sip Warm Water**: Sip warm water or mild ginger tea slowly.\n2. **Upright Posture**: Avoid lying down flat immediately after meals.\n3. **Gentle Heat**: Apply a mild warm compress over your abdomen.";
          adviceTips = "- Eat light, easily digestible foods like plain rice, dal, or toast.\n- Avoid spicy, fried, or acidic foods.\n- Take small, frequent meals rather than heavy portions.";
        } else if (lowered.includes('fever') || lowered.includes('cough') || lowered.includes('cold') || lowered.includes('flu') || lowered.includes('throat')) {
          spec = "General Physician";
          doctorSuggestion = "Dr. Ananya Reddy (General Physician - KIMS Multi-Specialty Hospital, 4.1 km away)";
          concernNote = "I hear your concern about feeling feverish or unwell. Please bundle up comfortably and prioritize full rest today!";
          firstAid = "1. **Monitor Temperature**: Check your body temperature with a digital thermometer.\n2. **Lukewarm Sponge**: If body temp is high, wipe forehead and neck with a lukewarm damp cloth.\n3. **Hydrate**: Sip warm fluids, herbal decoctions, or warm soup.";
          adviceTips = "- Get 8 hours of restful sleep and avoid physical strain.\n- Warm salt water gargle 3 times a day for throat comfort.\n- Eat warm, nutritious home-cooked meals.";
        } else {
          spec = "General Physician";
          doctorSuggestion = "Dr. Ananya Reddy (General Physician - KIMS Multi-Specialty Hospital, 4.1 km away)";
          concernNote = `I hear your concern regarding '${text}'. As your Health Well-Wisher, your well-being is my top priority!`;
          firstAid = "1. **Rest & Relax**: Sit down in a comfortable position and take deep, calming breaths.\n2. **Hydrate**: Sip a fresh glass of water to keep your body refreshed.\n3. **Monitor Symptoms**: Note down when symptoms started and if they worsen.";
          adviceTips = "- Maintain adequate rest and avoid heavy physical exertion.\n- Eat wholesome, balanced home-cooked meals.\n- Consult a doctor if symptoms persist or escalate.";
        }

        specRec = spec;
        urgency = spec !== "General Physician" ? 'MODERATE CONCERN' : 'LOW CONCERN';

        aiText = `💙 **Warm Well-Wisher Concern**\n${concernNote}\n\n` +
          `1️⃣ **WHAT YOU MUST DO FIRST (Immediate Relief & Action)**\n${firstAid}\n\n` +
          `2️⃣ **SUGGESTED NEARBY SPECIALIST & DOCTOR**\n` +
          `- **Recommended Specialist**: **${spec}**\n` +
          `- **Nearby Doctor Suggestion**: ${doctorSuggestion}\n` +
          `- *You can book an instant appointment with nearby doctors in our **Find Doctors** tab.*\n\n` +
          `3️⃣ **WELL-WISHER ADVICES & LIFESTYLE TIPS**\n${adviceTips}\n\n` +
          `(Note: AI Well-Wisher guidance only. Please consult a qualified doctor for clinical diagnosis.)`;
      }
    }

    const aiMsg: Message = {
      id: `msg_ai_${Date.now()}`,
      sender: 'ai',
      text: aiText,
      language: currentLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgency,
      isEmergency,
      specialistRecommendation: specRec
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          urgency,
          messages: [...c.messages, aiMsg]
        };
      }
      return c;
    }));

    return aiMsg;
  };

  // Complete session analysis and save to Medical History Timeline
  const completeAndStoreConversationSummary = async (convId?: string): Promise<PatientSessionSummary> => {
    const targetId = convId || activeConversationId;
    const targetConv = conversations.find(c => c.id === targetId) || conversations[0];
    const summary = await analyzeAndSummarizePatientSession(targetConv.messages, activeLanguage);

    pushTimelineEvent(
      'Symptom Reported',
      `Patient Consultation Summary (${summary.recommendedSpecialist})`,
      summary.summaryText,
      'AI Copilot Engine'
    );

    return summary;
  };

  const addMedicalReport = (reportData: Omit<MedicalReport, 'id'>) => {
    const newRep: MedicalReport = { ...reportData, id: `rep_${Date.now()}` };
    setReports(prev => [newRep, ...prev]);
    pushTimelineEvent('Report Uploaded', newRep.title, `Uploaded ${newRep.fileName} with ${newRep.values.length} extracted parameters.`, newRep.doctorName);
  };

  const addPrescription = (rxData: Omit<Prescription, 'id'>) => {
    const newRx: Prescription = { ...rxData, id: `rx_${Date.now()}` };
    setPrescriptions(prev => [newRx, ...prev]);
    pushTimelineEvent('Prescription Added', `Prescription by ${newRx.doctorName}`, `Contains ${newRx.items.length} prescribed medications.`, newRx.doctorName);
  };

  const addMedicineSchedule = (medData: Omit<MedicineSchedule, 'id'>) => {
    const newMed: MedicineSchedule = { ...medData, id: `med_${Date.now()}` };
    setMedicines(prev => [newMed, ...prev]);
    pushTimelineEvent('Medicine Taken', `New Medicine Scheduled: ${newMed.name}`, `Dosage: ${newMed.dosage}, Time: ${newMed.time}`);
  };

  const logMedicationStatus = (medicineId: string, status: 'taken' | 'missed' | 'skipped') => {
    const med = medicines.find(m => m.id === medicineId);
    const newLog: MedicationLog = {
      id: `log_${Date.now()}`,
      medicineId,
      medicineName: med ? med.name : 'Medication',
      scheduledTime: med ? med.time : '09:00',
      date: new Date().toISOString().split('T')[0],
      status,
      timestamp: new Date().toISOString()
    };
    setMedLogs(prev => [newLog, ...prev]);
    pushTimelineEvent('Medicine Taken', `${med?.name || 'Medicine'} Marked as ${status.toUpperCase()}`, `Scheduled time ${med?.time || '09:00'}`);
  };

  const addAppointment = (apptData: Omit<Appointment, 'id'>) => {
    const newAppt: Appointment = { ...apptData, id: `appt_${Date.now()}` };
    setAppointments(prev => [newAppt, ...prev]);
    pushTimelineEvent('Appointment Scheduled', `Appointment with ${newAppt.doctorName}`, `Scheduled for ${newAppt.date} at ${newAppt.time}`, newAppt.hospitalName);
  };

  const addFoodScanResult = (foodData: Omit<FoodScanResult, 'id'>) => {
    const newFood: FoodScanResult = { ...foodData, id: `food_${Date.now()}` };
    setFoodScans(prev => [newFood, ...prev]);
    pushTimelineEvent('Food Logged', `Food Scanned: ${newFood.foodName}`, `${newFood.estimatedNutrition.calories} kcal - ${newFood.personalizedSuitability}`);
  };

  const addVisionAnalysis = (visionData: Omit<HealthImageAnalysis, 'id'>) => {
    const newVision: HealthImageAnalysis = { ...visionData, id: `vision_${Date.now()}` };
    setVisionScans(prev => [newVision, ...prev]);
    pushTimelineEvent('Vision Analysis', `Health Scan: ${newVision.observation}`, `Confidence: ${newVision.confidenceScore}% - Risk: ${newVision.riskLevel}`);
  };

  const generateQRToken = (durationHours: number, sharedFields: QRAccessToken['sharedFields']): QRAccessToken => {
    const tokenStr = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date();
    const expires = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    const newToken: QRAccessToken = {
      token: tokenStr,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      durationHours,
      isRevoked: false,
      sharedFields
    };
    setActiveQRTokens(prev => [newToken, ...prev]);
    return newToken;
  };

  const revokeQRToken = (token: string) => {
    setActiveQRTokens(prev => prev.map(t => t.token === token ? { ...t, isRevoked: true } : t));
  };

  const resetDemoData = () => {
    setProfile(initialProfile);
    setDailyStats(initialDailyStats);
    setReports(initialReports);
    setPrescriptions(initialPrescriptions);
    setMedicines(initialMedicines);
    setMedLogs(initialMedLogs);
    setAppointments(initialAppointments);
    setTimeline(initialTimelineEvents);
    setFoodScans(initialFoodScans);
    setVisionScans(initialVisionScans);
    setConversations(initialConversations);
    setActiveConversationId(initialConversations[0].id);
  };

  return (
    <HealthContext.Provider
      value={{
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        logout,
        profile,
        dailyStats,
        reports,
        prescriptions,
        medicines,
        medLogs,
        appointments,
        timeline,
        foodScans,
        visionScans,
        conversations,
        activeConversationId,
        activeLanguage,
        isVoiceModalOpen,
        isEmergencyModalOpen,
        activeQRTokens,
        setProfile,
        setActiveLanguage,
        setIsVoiceModalOpen,
        setIsEmergencyModalOpen,
        addWaterIntake,
        addSteps,
        sendMessageToCopilot,
        startNewConversation,
        completeAndStoreConversationSummary,

        addMedicalReport,
        addPrescription,
        addMedicineSchedule,
        logMedicationStatus,
        addAppointment,
        addFoodScanResult,
        addVisionAnalysis,
        generateQRToken,
        revokeQRToken,
        resetDemoData
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
