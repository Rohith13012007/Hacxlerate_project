import React, { createContext, useContext, useState, useEffect } from 'react';
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
  phone?: string;
  address?: string;
  avatarUrl?: string;
  token?: string;
}

interface HealthContextType {
  currentUser: AuthUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string, fullName?: string, age?: number, gender?: string, address?: string, phone?: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, age?: number, gender?: string, address?: string, phone?: string) => Promise<boolean>;
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
  visionAnalyses: HealthImageAnalysis[];
  conversations: AIConversation[];
  activeConversationId: string;
  activeLanguage: Language;
  isVoiceModalOpen: boolean;
  isEmergencyModalOpen: boolean;
  userLocation: { lat: number; lng: number; address: string };
  setUserLocation: (loc: { lat: number; lng: number; address: string }) => void;
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
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('HEALTH_APPOINTMENTS');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return initialAppointments;
  });
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimelineEvents);
  const [foodScans, setFoodScans] = useState<FoodScanResult[]>(initialFoodScans);
  const [visionScans, setVisionScans] = useState<HealthImageAnalysis[]>(initialVisionScans);
  const [conversations, setConversations] = useState<AIConversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>(initialConversations[0].id);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string }>({
    lat: 37.7749,
    lng: -122.4194,
    address: 'Detecting Live Location...'
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`
          });
        },
        (_err) => {
          setUserLocation({
            lat: 37.7749,
            lng: -122.4194,
            address: 'Your Local City (GPS Default)'
          });
        }
      );
    }
  }, []);

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

  const login = async (email: string, password: string, fullName?: string, age?: number, gender?: string, address?: string, phone?: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('API unavailable');
      const data: AuthUser = await res.json();
      if (address) data.address = address;
      if (phone) data.phone = phone;
      setCurrentUser(data);
      localStorage.setItem('HEALTH_COPILOT_USER', JSON.stringify(data));
      setProfile(prev => ({
        ...prev,
        name: data.full_name,
        email: data.email,
        phone: data.phone || phone || prev.phone,
        address: data.address || address || prev.address,
        age: data.age,
        gender: data.gender as any,
        bloodGroup: data.blood_group
      }));
      if (address) setUserLocation(prev => ({ ...prev, address }));
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
        address: address || '',
        phone: phone || '',
        token: `token_${Date.now()}`
      };
      setCurrentUser(demoUser);
      localStorage.setItem('HEALTH_COPILOT_USER', JSON.stringify(demoUser));
      setProfile(prev => ({
        ...prev,
        name: resolvedName,
        email,
        phone: phone || '',
        address: address || '',
        age: demoUser.age,
        gender: demoUser.gender as any,
        bloodGroup: demoUser.blood_group
      }));
      if (address) setUserLocation(prev => ({ ...prev, address }));
      return true;
    }
  };

  const register = async (email: string, password: string, fullName: string, age?: number, gender?: string, address?: string, phone?: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, age: age || 28, gender: gender || 'Male' })
      });
      if (!res.ok) return false;
      const data: AuthUser = await res.json();
      if (address) data.address = address;
      if (phone) data.phone = phone;
      setCurrentUser(data);
      localStorage.setItem('HEALTH_COPILOT_USER', JSON.stringify(data));
      setProfile(prev => ({
        ...prev,
        name: data.full_name,
        email: data.email,
        phone: data.phone || phone || prev.phone,
        address: data.address || address || prev.address,
        age: data.age,
        gender: data.gender as any,
        bloodGroup: data.blood_group
      }));
      if (address) setUserLocation(prev => ({ ...prev, address }));
      return true;
    } catch (e) {
      const demoUser: AuthUser = {
        user_id: `usr_${Date.now()}`,
        email,
        full_name: fullName,
        age: age || 28,
        gender: gender || 'Male',
        blood_group: 'B+',
        address: address || '',
        phone: phone || '',
        token: `token_${Date.now()}`
      };
      setCurrentUser(demoUser);
      localStorage.setItem('HEALTH_COPILOT_USER', JSON.stringify(demoUser));
      setProfile(prev => ({
        ...prev,
        name: fullName,
        email,
        phone: phone || '',
        address: address || '',
        age: age || 28,
        gender: (gender || 'Male') as any,
        bloodGroup: 'B+'
      }));
      if (address) setUserLocation(prev => ({ ...prev, address }));
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

    // Auto-detect language ONLY if non-english native script or explicit verbal command is detected
    const explicitLang = detectLanguageFromText(text);
    const currentLang = (explicitLang && explicitLang !== 'en') ? explicitLang : activeLanguage;
    if (explicitLang && explicitLang !== 'en' && explicitLang !== activeLanguage) {
      setActiveLanguage(explicitLang);
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

    // Construct Patient DB Context for ReAct Agent
    const patientCtx = {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      conditions: profile.existingConditions,
      currentMedicines: profile.currentMedicines,
      waterIntakeMl: dailyStats.waterIntakeMl,
      stepsCount: dailyStats.stepsCount,
      recentReports: reports.map(r => r.title)
    };

    const groqRes = await queryGroqChat(text, currentLang, history, patientCtx);

    if (groqRes && groqRes.reply) {
      aiText = groqRes.reply;
      urgency = groqRes.urgency;
      specRec = groqRes.specialist;
      if (groqRes.detectedLanguage && groqRes.detectedLanguage !== 'en' && groqRes.detectedLanguage !== activeLanguage) {
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
            conversation_id: activeConversationId,
            patient_context: patientCtx,
            user_location: userLocation
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

    // Dynamic Query Analysis Fallback Engine (ReAct Reason + Action) if LLM API is unavailable
    if (!aiText) {
      const isGreeting = ["hi", "hello", "hey", "good morning", "good evening", "namaste", "namaskaram", "vanakkam"].some(g => lowered === g || lowered.startsWith(g + ' ') || lowered.endsWith(' ' + g));
      const isCoding = ["code", "python", "javascript", "java", "html", "css", "sql", "api", "function", "program", "bug", "developer", "coding"].some(u => lowered.includes(u));
      const isMath = ["math", "calculate", "sum", "multiply", "divide", "square root", "algebra", "2+", "2-", "2*", "10+"].some(u => lowered.includes(u));
      const isWeather = ["weather", "temperature", "rain", "sunny", "cloudy", "winter", "summer", "climate", "forecast"].some(u => lowered.includes(u));
      const isSportsMovies = ["cricket", "football", "soccer", "match", "score", "tennis", "world cup", "ipl", "movie", "cinema", "actor", "actress", "film", "song"].some(u => lowered.includes(u));
      const isGeneralGK = ["who is", "what is", "where is", "capital", "currency", "history", "planet", "physics", "chemistry", "space", "news", "game"].some(u => lowered.includes(u));

      const userName = profile.name || 'there';
      const userMeds = Array.isArray(profile.currentMedicines) ? profile.currentMedicines.join(', ') : (profile.currentMedicines || 'None');

      if (isGreeting) {
        if (currentLang === 'te') {
          aiText = `నమస్కారం ${userName}! నేను మీ AI హెల్త్ అసిస్టెంట్‌ని. ఈ రోజు మీకు ఆరోగ్యం ఎలా ఉంది? మీ ఆహారం, ఔషధాలు లేదా సూచనల గురించి అడగండి.`;
        } else if (currentLang === 'hi') {
          aiText = `नमस्ते ${userName}! मैं आपका AI हेल्थ कॉपायलट हूँ। आज आपकी तबियत कैसी है? आप मुझसे स्वास्थ्य, दवाइयों या रिपोर्ट के बारे में कुछ भी पूछ सकते हैं।`;
        } else {
          aiText = `Hello ${userName}! I am your AI Health Assistant. How are you feeling today? Feel free to ask me any question about your symptoms, diet, active medications, or health reports!`;
        }
      } else if (isCoding) {
        if (currentLang === 'te') {
          aiText = `మీ కోడింగ్ ప్రశ్నకు సమాధానం: ప్రోగ్రామింగ్ లాజిక్ ద్వారా సాఫ్ట్‌వేర్ నిర్మించబడుతుంది.\n\nకోడింగ్‌లో మునిగిపోయినప్పుడు కళ్ళకు విశ్రాంతి ఇవ్వడం మరియు మంచి నీరు తాగడం ఆరోగ్యానికి ఎంతో అవసరం! ${userName}, మీ రోజువారీ నీటి శాతాన్ని సరిచూసుకుందామా?`;
        } else if (currentLang === 'hi') {
          aiText = `आपके कोडिंग/प्रोग्रामिंग सवाल का जवाब: प्रोग्रामिंग में कोड द्वारा सॉफ़्टवेयर विकसित किया जाता है।\n\nकोडिंग के दौरान आंखों की देखभाल और पानी पीना जरूरी है! ${userName}, क्या आप अपनी आज की पानी की मात्रा या स्वास्थ्य स्थिति देखना चाहते हैं?`;
        } else {
          aiText = `Here is the answer to your coding question: Programming involves writing structured logic (in languages like Python or JavaScript) to solve problems and build software applications!\n\nJust as clean code requires good architecture, your body requires proper hydration and rest breaks during long coding sessions. ${userName}, how are your energy levels or daily water intake today?`;
        }
        specRec = "General Physician";
      } else if (isMath) {
        if (currentLang === 'te') {
          aiText = `మీ గణిత ప్రశ్నకు పరిష్కారం: సమాధానం ఖచ్చితమైన లాజిక్ మరియు ఫార్ములాల ఆధారంగా లెక్కింపబడుతుంది.\n\nసంఖ్యల విషయానికి వస్తే, మీ రోజువారీ అడుగులు, గుండె వేగం మరియు రక్తపోటు కూడా ముఖ్యమైన సంఖ్యలే! ${userName}, మీ ఆరోగ్య నివేదికలోని ముఖ్య సంఖ్యలను విశ్లేషిద్దామా?`;
        } else if (currentLang === 'hi') {
          aiText = `आपके गणित प्रश्न का उत्तर: गणितीय सूत्रों के उपयोग से सटीक परिणाम प्राप्त होते हैं।\n\nसंख्याओं की बात करें तो आपके दैनिक कदम, ब्लड प्रेशर और वॉटर इनटेक भी बहुत महत्वपूर्ण आंकड़े हैं! ${userName}, क्या आप अपनी हेल्थ रिपोर्ट या दवाइयों का शेड्यूल देखना चाहते हैं?`;
        } else {
          aiText = `Here is the answer to your math question: Mathematical equations rely on precise operators and logical formulas to yield exact solutions!\n\nSpeaking of numbers, tracking your personal health metrics—like your daily step goal, blood pressure, or water intake—is a great way to stay healthy. ${userName}, would you like to check your daily health stats or ask a symptom question?`;
        }
        specRec = "General Physician";
      } else if (isWeather) {
        if (currentLang === 'te') {
          aiText = `వాతావరణ మార్పుల గురించిన సమాచారం: వాతావరణంలో తేమ మరియు ఉష్ణోగ్రత మార్పులు సహజం.\n\nవాతావరణ మార్పులతో అలర్జీలు మరియు జలుబు వచ్చే అవకాశం ఉంటుంది. ${userName}, మీకు ఎలాంటి అలర్జీలు లేదా లక్షణాలు కనిపించడం లేదా?`;
        } else if (currentLang === 'hi') {
          aiText = `मौसम से जुड़े सवाल का जवाब: मौसम में बदलाव तापमान और आर्द्रता पर निर्भर करता है।\n\nमौसम बदलने से एलर्जी और जुकाम का खतरा बढ़ता है। ${userName}, क्या आपको इस मौसम में कोई स्वास्थ्य समस्या या एलर्जी महसूस हो रही है?`;
        } else {
          aiText = `Regarding the weather: Seasonal weather conditions change based on atmospheric pressure, temperature, and humidity shifts!\n\nWeather transitions often impact skin hydration and immunity. ${userName}, are you experiencing any cold symptoms or seasonal allergies today?`;
        }
        specRec = "General Physician";
      } else if (isSportsMovies) {
        if (currentLang === 'te') {
          aiText = `విశ్వాసనీయ ఆటలు/వినోదం ప్రశ్నకు సమాధానం: క్రీడలు మరియు వినోదం మానసిక ప్రశాంతతను అందిస్తాయి!\n\nశారీరక శ్రమ గుండె ఆరోగ్యానికి మరియు రక్త ప్రసరణకు ఎంతో మేలు చేస్తుంది. ${userName}, ఈ రోజు మీరు ఎన్ని అడుగులు నడిచారో చెక్ చేసుకుందాం?`;
        } else if (currentLang === 'hi') {
          aiText = `खेल और मनोरंजन के सवाल का जवाब: खेलकूद और मनोरंजन मानसिक ताजगी के लिए बेहतरीन हैं!\n\nसक्रिय रहना आपके दिल और स्वास्थ्य के लिए उत्तम है। ${userName}, क्या आप अपनी दैनिक फिटनेस या डाइट के बारे में कुछ पूछना चाहते हैं?`;
        } else {
          aiText = `Regarding sports & entertainment: Engaging in sports, games, and entertainment is fantastic for mental relaxation and stress relief!\n\nPhysical movement is also vital for your cardiovascular health. ${userName}, how many active steps have you logged today? Would you like any workout or nutrition tips?`;
        }
        specRec = "General Physician";
      } else if (isGeneralGK) {
        if (currentLang === 'te') {
          aiText = `సాధారణ పరిజ్ఞాన ప్రశ్నకు వివరాలు: '${text}' గురించిన సమాచారం ఆసక్తికరంగా ఉంటుంది!\n\nనూతన విషయాలు గ్రహించడం మెదడు చురుకుదనానికి మంచిది. అలాగే మీ శరీర ఆరోగ్యం పట్ల శ్రద్ధ వహించడం కూడా ముఖ్యం. ${userName}, మీ ఔషధాలు ('${userMeds}') లేదా నివేదికల గురించి ఏదైనా సమాచారం కావాలా?`;
        } else if (currentLang === 'hi') {
          aiText = `सामान्य ज्ञान प्रश्न का उत्तर: '${text}' के बारे में यह एक रोचक तथ्य है!\n\nनया ज्ञान प्राप्त करना मस्तिष्क स्वास्थ्य के लिए बहुत अच्छा है। ${userName}, क्या आप अपनी दवाइयों ('${userMeds}') या किसी लक्षण के बारे में कुछ पूछना चाहते हैं?`;
        } else {
          aiText = `Regarding your general knowledge question about "${text}": That's an interesting topic! Continuous learning and curiosity keep your cognitive health sharp.\n\nWhile exploring new topics is great, taking care of your physical well-being is equally essential. ${userName}, would you like to review your active medications ('${userMeds}') or ask a health question?`;
        }
        specRec = "General Physician";
      } else if (lowered.includes('blood') || lowered.includes('report') || lowered.includes('lab') || lowered.includes('cbc') || lowered.includes('రిపోర్ట్') || lowered.includes('రక్త') || lowered.includes('रिपोर्ट')) {
        if (currentLang === 'te') {
          aiText = "రక్త పరీక్షల నివేదికపై విశ్లేషణ మరియు సూచనలు:\n• బ్లడ్ రిపోర్ట్‌లో హిమోగ్లోబిన్, తెల్ల రక్త కణాలు (WBC), ప్లేట్‌లెట్స్ మరియు షుగర్ స్థాయిలు పరిశీలించాలి.\n• మీ రిపోర్ట్‌ను 'అప్‌లోడ్' ఆప్షన్ ద్వారా అప్‌లోడ్ చేసి నిపుణుల AI సలహా పొందవచ్చు.\n• ఖచ్చితమైన ఫలితాల నిర్ధారణకు వైద్యుడిని సంప్రదించండి.";
        } else if (currentLang === 'hi') {
          aiText = "ब्लड रिपोर्ट विश्लेषण व सुझाव:\n• हिमोग्लोबिन, WBC, प्लेटलेट्स और ब्लड शुगर लेवल की जांच करें।\n• आप ऐप में रिपोर्ट अपलोड करके विस्तृत विश्लेषण पा सकते हैं।\n• किसी भी असंतुलन के लिए डॉक्टर की सलाह लें।";
        } else {
          aiText = "Blood Report Guidance & Analysis:\n• Key parameters to evaluate include Hemoglobin, WBC count, Platelet counts, and Blood Sugar levels.\n• Use the 'Upload' feature to analyze your report image instantly.\n• Consult a qualified General Physician for clinical correlation.";
        }
        specRec = "General Physician";
      } else if (lowered.includes('diet') || lowered.includes('weight') || lowered.includes('food') || lowered.includes('nutrition') || lowered.includes('ఆహారం') || lowered.includes('డైట్') || lowered.includes('బరువు') || lowered.includes('डाइट') || lowered.includes('वजन')) {
        if (currentLang === 'te') {
          aiText = "ఆరోగ్యకరమైన ఆహారం మరియు బరువు నియంత్రణ సూచనలు:\n• పీచు పదార్థాలు (ఫైబర్), ఆకుకూరలు, పప్పుధాన్యాలు మరియు పండ్లు ఎక్కువగా తీసుకోండి.\n• రోజుకి 2.5 నుండి 3 లీటర్ల నీరు తాగండి.\n• జంక్ ఫుడ్, పంచదార తగ్గించి, క్రమం తప్పకుండా రోజుకి 30 నిమిషాలు వ్యాయామం చేయండి.";
        } else if (currentLang === 'hi') {
          aiText = "स्वस्थ आहार और वजन नियंत्रण टिप्स:\n• फाइबर युक्त भोजन, हरी सब्जियां, दालें और फल खाएं।\n• रोजाना 2.5 - 3 लीटर पानी पिएं।\n• जंक फूड और अत्यधिक चीनी से बचें तथा नियमित व्यायाम करें।";
        } else {
          aiText = "Diet & Weight Management Guidance:\n• Focus on a balanced diet rich in lean protein, fiber, vegetables, and whole grains.\n• Stay well-hydrated by drinking 2.5 to 3 liters of water daily.\n• Limit refined sugars, processed foods, and maintain 30 minutes of daily physical activity.";
        }
        specRec = "General Physician";
      } else if (lowered.includes('doctor') || lowered.includes('specialist') || lowered.includes('clinic') || lowered.includes('hospital') || lowered.includes('physician') || lowered.includes('appointment')) {
        aiText = `As your dedicated family doctor, here is the top-rated nearby specialist I recommend for your evaluation:\n\n👨‍⚕️ **Recommended Nearby Doctor**: **Dr. Ramesh Kumar** (MBBS, MD Internal Medicine)\n🏥 **Hospital / Clinic**: Care Family Health Clinic\n📍 **Location**: Banjara Hills, Hyderabad (2.4 km away, ⭐ 4.8)\n📞 **Contact**: +91 98765 00002 | **Consultation Fee**: ₹1,500\n\nYou can book an in-person or video consultation directly. ${userName}, would you like me to reserve an appointment slot for you?`;
        specRec = "General Physician";
      } else if (lowered.includes('headache') || lowered.includes('head') || lowered.includes('migraine') || lowered.includes('తలనొప్పి') || lowered.includes('सिरदर्द')) {
        aiText = `As your family doctor, here is my clinical guidance for your headache:\n• Rest comfortably in a quiet, dimmed room and stay well hydrated.\n• Apply a cool compress or damp towel across your forehead.\n• Reduce screen exposure and practice 5 minutes of deep breathing.\n\n👨‍⚕️ **Recommended Nearby Specialist**: **Dr. Suresh Varma** (MBBS, DM Neurology)\n🏥 **Hospital**: Continental Brain & Spine Institute, Gachibowli (3.5 km away, ⭐ 4.8)\n📞 **Contact**: +91 40 4488 5000 | **Fee**: ₹2,000`;
        specRec = "Neurologist / General Physician";
        if (currentLang === 'te') {
          aiText = "తలనొప్పి ఉపశమనానికి ముఖ్యమైన సూచనలు:\n• తగినంత నీరు తాగి, తక్కువ వెలుతురు ఉన్న గదిలో ప్రశాంతంగా విశ్రాంతి తీసుకోండి.\n• నుదుటిపై చల్లని బట్టను (Cool Compress) ఉంచడం ద్వారా ఉపశమనం పొందవచ్చు.\n• కంప్యూటర్, మొబైల్ స్క్రీన్లను కొంతసేపు పక్కన పెట్టండి.\nతలనొప్పి తీవ్రంగా ఉంటే నిపుణులైన డాక్టర్‌ను సంప్రదించండి.";
        } else if (currentLang === 'hi') {
          aiText = "सिरदर्द से राहत के टिप्स:\n• पर्याप्त पानी पिएं और शांत व अंधेरे कमरे में आराम करें।\n• माथे पर ठंडा कपड़ा रखें।\n• मोबाइल और लैपटॉप स्क्रीन से ब्रेक लें।\nदर्द गंभीर होने पर डॉक्टर से संपर्क करें।";
        } else {
          aiText = "Headache Relief Guidance:\n• Rest comfortably in a quiet, dimmed room and stay well hydrated.\n• Apply a cool compress or damp towel across your forehead.\n• Reduce screen exposure and practice 5 minutes of deep breathing.\nConsult a physician or neurologist if headache persists or intensifies.";
        }
        specRec = "Neurologist / General Physician";
      } else if (lowered.includes('stomach') || lowered.includes('gastric') || lowered.includes('acid') || lowered.includes('digestion') || lowered.includes('nausea') || lowered.includes('కడుపు') || lowered.includes('అసిడిటీ') || lowered.includes('पेट')) {
        if (currentLang === 'te') {
          aiText = "కడుపు నొప్పి మరియు అసిడిటీ నివారణ సూచనలు:\n• గోరువెచ్చని నీరు లేదా అల్లం టీ నెమ్మదిగా సేవించండి.\n• కారం, నూనె పదార్థాలు తగ్గించి పెరుగు అన్నం, ఇడ్లీ వంటి సులభంగా అరిగే ఆహారం తీసుకోండి.\n• తిన్న వెంటనే పడుకోకుండా కొద్దిసేపు నడవండి.";
        } else if (currentLang === 'hi') {
          aiText = "पेट दर्द व एसिडिटी से राहत के उपाय:\n• हल्का गुनगुना पानी या अदरक की चाय पिएं।\n• मसालेदार और तले हुए भोजन से बचें, हल्का खाना खाएं।\n• खाने के तुरंत बाद न सोएं।";
        } else {
          aiText = "Stomach & Gastric Relief Advice:\n• Sip warm water or ginger tea slowly to ease discomfort.\n• Eat light, non-spicy foods like plain rice, curd, or toast.\n• Avoid lying down flat immediately following meals.";
        }
        specRec = "Gastroenterologist";
      } else if (lowered.includes('fever') || lowered.includes('cough') || lowered.includes('cold') || lowered.includes('flu') || lowered.includes('throat') || lowered.includes('జ్వరం') || lowered.includes('దగ్గు') || lowered.includes('జలుబు') || lowered.includes('बुखार') || lowered.includes('खांसी')) {
        if (currentLang === 'te') {
          aiText = "జ్వరం మరియు జలుబు ఉపశమన సూచనలు:\n• పూర్తి విశ్రాంతి తీసుకోండి, గోరువెచ్చని నీరు మరియు ద్రవాహారం తీసుకోండి.\n• థర్మామీటర్‌తో జ్వరాన్ని సమయానుకూలంగా నమోదు చేసుకోండి.\n• గొంతు నొప్పి ఉంటే వేడి నీటిలో ఉప్పు వేసి పుక్కిలించండి (Gargle).";
        } else if (currentLang === 'hi') {
          aiText = "बुखार और सर्दी के उपाय:\n• पूरा आराम करें और गुनगुना पानी या काढ़ा पिएं।\n• नियमित अंतराल पर शरीर का तापमान मापें।\n• गले की खराश के लिए नमक के पानी से गरारे करें।";
        } else {
          aiText = "Fever & Cold Management:\n• Prioritize bed rest and stay hydrated with warm water or herbal teas.\n• Check body temperature regularly with a digital thermometer.\n• Gargle with warm salt water 2-3 times daily for throat discomfort.";
        }
        specRec = "General Physician";
      } else if (lowered.includes('skin') || lowered.includes('rash') || lowered.includes('itch') || lowered.includes('eczema') || lowered.includes('allergy') || lowered.includes('చర్మం') || lowered.includes('దురద') || lowered.includes('त्वचा') || lowered.includes('खुजली')) {
        if (currentLang === 'te') {
          aiText = "చర్మ సమస్యలు మరియు దురద నివారణ సూచనలు:\n• సబ్బు లేకుండా చల్లని నీటితో ప్రభావిత ప్రాంతాన్ని కడగండి.\n• కలబంద (Aloe Vera) జెల్ లేదా మైల్డ్ మాయిశ్చరైజర్ రాయండి.\n• గోళ్ళతో గిల్లకండి; చర్మ సమస్య తీవ్రంగా ఉంటే డెర్మటాలజిస్ట్‌ను సంప్రదించండి.";
        } else if (currentLang === 'hi') {
          aiText = "त्वचा की एलर्जी व खुजली से बचाव:\n• ठंडे पानी से धीरे से धोएं और एलोवेरा जेल या मॉइस्चराइजर लगाएं।\n• त्वचा को रगड़ें या खुजलाएं नहीं। डॉक्टर की सलाह लें।";
        } else {
          aiText = "Skin Rash & Irritation Advice:\n• Gently wash the affected skin area with cool water and mild soap.\n• Apply aloe vera gel or a fragrance-free moisturizer.\n• Avoid scratching the skin to prevent secondary infection.";
        }
        specRec = "Dermatologist";
      } else if (lowered.includes('sleep') || lowered.includes('insomnia') || lowered.includes('stress') || lowered.includes('నిద్ర') || lowered.includes('స్ట్రెస్') || lowered.includes('नींद') || lowered.includes('तनाव')) {
        if (currentLang === 'te') {
          aiText = "మంచి నిద్ర మరియు మానసిక ప్రశాంతత సూచనలు:\n• నిద్రపోయే 1 గంట ముందు స్మార్ట్‌ఫోన్, టీవీ చూడటం ఆపండి.\n• ప్రతిరోజూ ఒకే సమయానికి నిద్రపోవడం అలవాటు చేసుకోండి.\n• పడుకునే ముందు ప్రశాంతంగా దీర్ఘ శ్వాస వ్యాయామాలు చేయండి.";
        } else if (currentLang === 'hi') {
          aiText = "अच्छी नींद और तनाव मुक्ति के उपाय:\n• सोने से 1 घंटा पहले स्क्रीन बंद कर दें।\n• रोजाना एक निश्चित समय पर सोएं और गहरी सांस लेने का अभ्यास करें।";
        } else {
          aiText = "Sleep Hygiene & Relaxation Tips:\n• Turn off electronic screens at least 1 hour prior to sleep.\n• Maintain a consistent sleep schedule in a dark, quiet room.\n• Practice 5 minutes of mindful deep breathing before sleeping.";
        }
        specRec = "General Physician";
      } else {
        if (currentLang === 'te') {
          aiText = `మీరు అడిగిన '${text}' అంశానికి సంబంధించి సమాధానం మరియు సూచనలు:\n• మీ ఆరోగ్యానికి తగిన సమతుల్య ఆహారం మరియు తగినంత విశ్రాంతి తీసుకోండి.\n• రోజూ తగినంత నీరు తాగుతూ శరీరాన్ని తేమగా ఉంచుకోండి.\n• ఏవైనా ఇబ్బందులు ఉన్నట్లయితే సమీప డాక్టర్‌ను లేదా హెల్త్ ప్రొవైడర్‌ను సంప్రదించండి.`;
        } else if (currentLang === 'hi') {
          aiText = `आपके प्रश्न '${text}' से संबंधित सुझाव:\n• संतुलित आहार और पर्याप्त आराम लें।\n• शरीर को हाइड्रेटेड रखने के लिए पर्याप्त पानी पिएं।\n• किसी भी समस्या के लिए डॉक्टर की सलाह लें।`;
        } else {
          aiText = `Regarding your query "${text}":\n• Maintain a balanced diet, adequate hydration, and sufficient daily rest.\n• Track any symptoms or changes in how you feel.\n• Consult a qualified doctor or healthcare specialist if you experience ongoing discomfort.`;
        }
        specRec = "General Physician";
      }
    }

    // 1. Strict Temperature Symptom Parser (Only when fever/temperature context or explicit °F/°C units exist)
    const isTempKeyword = lowered.includes('temp') || 
                          lowered.includes('fever') || 
                          lowered.includes('degree') || 
                          lowered.includes('ఉష్ణోగ్రత') || 
                          lowered.includes('జ్వరం') || 
                          lowered.includes('డిగ్రీ') || 
                          lowered.includes('तापमान') || 
                          lowered.includes('बुखार');

    const hasTempUnit = /\b\d+(\.\d+)?\s*(°\s*[fc]|celsius|fahrenheit|deg|degrees|°)\b/i.test(lowered) ||
                        /\b(10[0-8]|9[5-9])\s*(f|farenheit)?\b/i.test(lowered) ||
                        /\b(3[6-9]|4[0-2])\s*(c|celsius)?\b/i.test(lowered);

    if (isTempKeyword || hasTempUnit) {
      const match = text.match(/\b(\d{2,3}(\.\d)?)\b/);
      const val = match ? Number(match[1]) : 101;

      if (val >= 30 && val <= 110) {
        const isFarenheit = val > 45;
        const fVal = isFarenheit ? val : Math.round((val * 9/5) + 32);
        const cVal = isFarenheit ? ((val - 32) * 5/9).toFixed(1) : val;

        if (fVal >= 100) {
          if (currentLang === 'te') {
            aiText = `మీరు పేర్కొన్న శరీర ఉష్ణోగ్రత ${fVal}°F (${cVal}°C) చాలా ఎక్కువ జ్వరం. ముందుగా ప్రశాంతంగా విశ్రాంతి తీసుకోండి, నొసలు మరియు మెడపై చల్లని బట్టతో (Cool Compress) తుడవండి మరియు తగినంత ద్రవాహారం తీసుకోండి. ఈ జ్వరంతో పాటు దగ్గు, గొంతు నొప్పి లేదా వణుకు వంటి ఇతర లక్షణాలు ఏవైనా ఉన్నాయా?`;
          } else if (currentLang === 'hi') {
            aiText = `आपके शरीर का तापमान ${fVal}°F (${cVal}°C) उच्च बुखार दर्शाता है। कृपया आराम करें, माथे पर ठंडा कपड़ा रखें और पर्याप्त पानी/तरल पदार्थ लें। क्या इस बुखार के साथ खांसी, गले में खराश या ठंड लगने की समस्या है?`;
          } else if (currentLang === 'ta') {
            aiText = `உங்கள் உடல் வெப்பநிலை ${fVal}°F (${cVal}°C) அதிக காய்ச்சலைக் காட்டுகிறது. தயவுசெய்து ஓய்வெடுக்கவும், நீர்ச்சத்து எடுத்துக் கொள்ளவும். சளி அல்லது இருமல் உள்ளதா?`;
          } else if (currentLang === 'kn') {
            aiText = `ನಿಮ್ಮ ದೇಹದ ತಾಪಮಾನ ${fVal}°F (${cVal}°C) ಹೆಚ್ಚಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ನೀರು ಕುಡಿಯಿರಿ. ಕೆಮ್ಮು ಅಥವಾ ಜ್ವರವಿದೆಯೇ?`;
          } else {
            aiText = `A body temperature of ${fVal}°F (${cVal}°C) indicates a high fever. Please rest comfortably, apply a cool compress to your forehead/neck, and stay hydrated. Do you have any chills, cough, body pain, or sore throat alongside this fever?`;
          }
          urgency = 'MODERATE CONCERN';
          specRec = "General Physician";
        } else {
          if (currentLang === 'te') {
            aiText = `శరీర ఉష్ణోగ్రత ${fVal}°F (${cVal}°C) నమోదు చేసుకున్నాను. ఈ లక్షణాలు లేదా శారీరక ఇబ్బంది ఎప్పటి నుండి ప్రారంభమైంది?`;
          } else if (currentLang === 'hi') {
            aiText = `शरीर का तापमान ${fVal}°F (${cVal}°C) नोट कर लिया गया है। यह लक्षण कब से शुरू हुआ है?`;
          } else if (currentLang === 'ta') {
            aiText = `உடல் வெப்பநிலை ${fVal}°F (${cVal}°C) பதிவு செய்யப்பட்டது. இந்த அறிகுறிகள் எப்போது தொடங்கின?`;
          } else if (currentLang === 'kn') {
            aiText = `ದೇಹದ ತಾಪಮಾನ ${fVal}°F (${cVal}°C) ದಾಖಲಿಸಲಾಗಿದೆ. ಈ ಲಕ್ಷಣಗಳು ಎಷ್ಟೊತ್ತಿನಿಂದ ಇವೆ?`;
          } else {
            aiText = `Noted body temperature of ${fVal}°F (${cVal}°C). How long have you been experiencing these symptoms?`;
          }
          specRec = "General Physician";
        }
      }
    }

    const isDoctorRequest = lowered.includes('suggest a doctor') || lowered.includes('suggest doctor') || lowered.includes('find doctor') || lowered.includes('need a doctor') || lowered.includes('recommend a doctor') || lowered.includes('డాక్టర్‌ని సూచించండి') || lowered.includes('డాక్టర్ వివరాలు');

    const mapsUrl = (isEmergency || isDoctorRequest)
      ? (userLocation?.lat && userLocation?.lng
        ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(specRec || 'Hospitals near me')}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(specRec || 'Hospitals near me')}`)
      : undefined;

    const aiMsg: Message = {
      id: `msg_ai_${Date.now()}`,
      sender: 'ai',
      text: aiText,
      language: currentLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgency,
      isEmergency,
      specialistRecommendation: specRec,
      googleMapsUrl: mapsUrl
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
    setAppointments(prev => {
      const updated = [newAppt, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('HEALTH_APPOINTMENTS', JSON.stringify(updated));
      }
      return updated;
    });
    pushTimelineEvent('Appointment Scheduled', `Appointment with ${newAppt.doctorName}`, `Scheduled for ${newAppt.date} at ${newAppt.time}`, newAppt.hospitalName);

    // Sync appointment to backend FastAPI repository & AI Pre-Consultation Agent
    try {
      fetch('http://localhost:8000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_name: newAppt.doctorName,
          specialization: newAppt.specialization,
          hospital_name: newAppt.hospitalName,
          date: newAppt.date,
          time: newAppt.time,
          consultation_type: newAppt.consultationType || 'In-Person',
          disease_category: newAppt.diseaseCategory || newAppt.reason || 'General Checkup',
          disease_description: newAppt.diseaseDescription || 'Patient booked appointment.',
          symptoms_duration: newAppt.symptomsDuration || '3-5 Days',
          severity_level: newAppt.severityLevel || 'Moderate',
          patient_notes: newAppt.patientNotes || ''
        })
      }).catch(err => console.warn('Backend appointment sync warning:', err));
    } catch (e) {
      console.warn('Backend fetch exception:', e);
    }
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
        setCurrentUser,
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
        visionAnalyses: visionScans,
        conversations,
        activeConversationId,
        activeLanguage,
        isVoiceModalOpen,
        isEmergencyModalOpen,
        userLocation,
        setUserLocation,
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
