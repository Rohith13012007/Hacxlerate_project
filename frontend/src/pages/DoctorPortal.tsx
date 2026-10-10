import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  Stethoscope, 
  LayoutGrid, 
  Calendar, 
  Video, 
  Users, 
  FileText, 
  User, 
  Search, 
  Key, 
  Download, 
  ArrowUpRight, 
  Activity, 
  Sparkles, 
  QrCode,
  X, 
  CheckCircle2, 
  Plus, 
  Phone, 
  Heart, 
  LogOut
} from 'lucide-react';

interface DoctorPortalProps {
  onNavigate?: (path: string) => void;
}

type MenuTab = 'dashboard' | 'appointments' | 'video' | 'patients' | 'prescriptions' | 'profile';

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ onNavigate }) => {
  const { profile, appointments, addPrescription, logout, currentUser } = useHealth();

  // Navigation and Tab State
  const [activeTab, setActiveTab] = useState<MenuTab>('dashboard');
  const [tokenInput, setTokenInput] = useState('demo_token_8899');

  // Modals & Active Workflows State
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedPatientModal, setSelectedPatientModal] = useState<any | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [activeVideoCallPatient, setActiveVideoCallPatient] = useState<any | null>(null);

  // Form State for Quick Actions
  const [rxPatientName, setRxPatientName] = useState('Amit Kumar');
  const [rxDiagnosis, setRxDiagnosis] = useState('Contact Dermatitis / Mild Allergy');
  const [rxMedicinesText, setRxMedicinesText] = useState('Cetirizine 10mg (Once daily at night, 5 days), Hydrocortisone 1% Cream (Twice daily)');
  const [rxNotes, setRxNotes] = useState('Apply cream topically. Avoid harsh soaps.');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Test Order State
  const [selectedTest, setSelectedTest] = useState('Complete Blood Count (CBC) + IgE');
  const [testUrgency, setTestUrgency] = useState('Routine');


  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  // Backend appointments state
  const [backendAppts, setBackendAppts] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchBackendAppts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/doctor/appointments');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setBackendAppts(data);
          }
        }
      } catch (e) {
        console.warn('Fetch backend doctor appointments warning:', e);
      }
    };
    fetchBackendAppts();
  }, [activeTab]);

  const showNotice = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  // Merge appointments from HealthContext + Backend API
  const allAppointments = [...appointments];
  backendAppts.forEach(ba => {
    if (!allAppointments.some(a => a.id === ba.id)) {
      allAppointments.push({
        id: ba.id,
        doctorName: ba.doctorName || 'Dr. Priya Mehta',
        specialization: ba.specialization || 'Dermatologist',
        hospitalName: ba.hospitalName || 'Apollo Skin Clinic',
        date: ba.date || 'Today',
        time: ba.time || '10:30 AM',
        location: 'Clinic',
        reason: ba.diseaseCategory || 'General Checkup',
        status: ba.status || 'Upcoming',
        consultationType: ba.consultationType || 'In-Person',
        diseaseCategory: ba.diseaseCategory,
        diseaseDescription: ba.diseaseDescription,
        symptomsDuration: ba.symptomsDuration,
        severityLevel: ba.severityLevel,
        patientNotes: ba.patientNotes
      });
    }
  });

  const bookedSchedule = allAppointments.map((appt, idx) => ({
    id: appt.id || `booked_${idx}`,
    time: appt.time || '10:30 AM',
    date: appt.date || 'Today',
    name: profile.name || currentUser?.full_name || 'Akhil Sharma',
    reason: `${appt.consultationType || 'Consultation'} • ${appt.diseaseCategory || appt.reason || 'General Checkup'}`,
    status: appt.status || 'Upcoming',
    isLive: false,
    age: profile.age || 28,
    gender: profile.gender || 'Male',
    diseaseCategory: appt.diseaseCategory || appt.reason || 'General Checkup',
    diseaseDescription: appt.diseaseDescription || 'Patient requested consultation for medical evaluation.',
    symptomsDuration: appt.symptomsDuration || '3-5 Days',
    severityLevel: appt.severityLevel || 'Moderate',
    patientNotes: appt.patientNotes || 'Requested pre-consultation brief evaluation.',
    doctorName: appt.doctorName,
    hospitalName: appt.hospitalName,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  }));

  const baseSchedule = [
    { id: 's1', time: '09:00 AM', date: 'Today', name: 'Amit Kumar', reason: 'Follow-up • Diabetes', status: 'Join', isLive: true, age: 45, gender: 'Male', diseaseCategory: 'Diabetes', diseaseDescription: 'Routine blood sugar monitoring.', symptomsDuration: '2 Months', severityLevel: 'Mild', patientNotes: 'HbA1c test completed.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
    { id: 's2', time: '09:30 AM', date: 'Today', name: 'Neha Singh', reason: 'Consultation • Fever', status: 'Upcoming', isLive: false, age: 34, gender: 'Female', diseaseCategory: 'Fever', diseaseDescription: 'Viral fever with body ache.', symptomsDuration: '2 Days', severityLevel: 'Moderate', patientNotes: 'Took Paracetamol.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80' },
    { id: 's3', time: '10:00 AM', date: 'Today', name: 'Akhil Sharma', reason: 'Report Discussion', status: 'Upcoming', isLive: false, age: 28, gender: 'Male', diseaseCategory: 'General Checkup', diseaseDescription: 'Reviewing recent CBC blood report.', symptomsDuration: '1 Week', severityLevel: 'Mild', patientNotes: 'Normal vitals.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
    { id: 's4', time: '10:30 AM', date: 'Today', name: 'Sneha Patel', reason: 'General Consultation', status: 'Upcoming', isLive: false, age: 29, gender: 'Female', diseaseCategory: 'Dermatitis Allergy', diseaseDescription: 'Skin rash on left hand.', symptomsDuration: '4 Days', severityLevel: 'Moderate', patientNotes: 'Hydrocortisone cream applied.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80' }
  ];

  const scheduleList = [...bookedSchedule, ...baseSchedule];

  const bookedPatients = bookedSchedule.map(b => ({
    id: b.id,
    name: b.name,
    age: b.age,
    gender: b.gender,
    time: `${b.date}, ${b.time}`,
    avatar: b.avatar,
    phone: '+91 98765 43210',
    condition: `${b.reason} • ${b.severityLevel || 'Moderate'} Severity`,
    diseaseCategory: b.diseaseCategory,
    diseaseDescription: b.diseaseDescription,
    symptomsDuration: b.symptomsDuration,
    patientNotes: b.patientNotes
  }));

  const basePatients = [
    { id: 'p1', name: 'Akhil Sharma', age: 28, gender: 'Male', time: 'Today, 10:00 AM', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', phone: '+91 98765 43210', condition: 'Report Discussion • Normal Vitals' },
    { id: 'p2', name: 'Neha Singh', age: 34, gender: 'Female', time: 'Today, 09:30 AM', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', phone: '+91 98112 88410', condition: 'Viral Fever • Prescribed Paracetamol' },
    { id: 'p3', name: 'Amit Kumar', age: 45, gender: 'Male', time: 'Today, 09:00 AM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', phone: '+91 99201 44102', condition: 'Follow-up Diabetes • HbA1c: 6.8%' },
    { id: 'p4', name: 'Sneha Patel', age: 29, gender: 'Female', time: 'Today, 10:30 AM', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', phone: '+91 97102 33491', condition: 'Dermatitis Allergy • Hydrocortisone Rx' }
  ];

  const recentPatients = [...bookedPatients, ...basePatients];

  // Quick Action Handlers
  const handleCreatePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPrescription({
      doctorName: currentUser?.full_name || 'Dr. Priya Mehta',
      hospitalName: 'HealthCopilot Clinical Care',
      date: new Date().toISOString().split('T')[0],
      items: rxMedicinesText.split(',').map((item, idx) => ({
        id: `rx_${Date.now()}_${idx}`,
        medicationName: item.trim(),
        dosage: '1 Tablet / Dose',
        frequency: 'Daily',
        duration: '5 Days',
        instructions: 'Take as directed'
      })),
      notes: `Diagnosis: ${rxDiagnosis}. Notes: ${rxNotes}`
    });
    setIsPrescriptionModalOpen(false);
    showNotice(`✅ Digital Prescription issued successfully for ${rxPatientName}!`);
  };

  const handleRequestTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestModalOpen(false);
    showNotice(`🧪 Diagnostic Test Request (${selectedTest}) dispatched to Pathology Lab!`);
  };

  const handleGenerateFHIRExport = () => {
    const fhirBundle = {
      resourceType: "Bundle",
      type: "document",
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "pat_8899",
            name: [{ family: "Sharma", given: ["Akhil"] }],
            gender: "male",
            birthDate: "1998-05-14"
          }
        },
        {
          resource: {
            resourceType: "Observation",
            status: "final",
            code: { text: "Skin Erythema Assessment" },
            valueString: "Mild Contact Dermatitis"
          }
        }
      ]
    };
    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FHIR_Patient_Export_${Date.now()}.json`;
    a.click();
    showNotice("📄 FHIR R4 Bundle JSON generated and downloaded!");
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-100">
      
      {/* 1. TOP HEADER BAR matching reference image */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-[#0e5a4a] flex items-center justify-center text-white shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
              <span>HealthCopilot Doctor</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium leading-none">AI-powered clinical workspace</p>
          </div>
        </div>

        {/* Right: Doctor Workspace Button & Patient Switcher */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleNavigate('/dashboard')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            👤 Patient Dashboard
          </button>
          
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
            title="Scan Patient Health Passport QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#0e5a4a]" />
            <span>Doctor workspace</span>
          </button>


          <button
            onClick={() => {
              logout();
              handleNavigate('/doctor-login');
            }}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            title="Log out physician session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Action Notification Toast Banner */}
      {actionSuccessNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e5a4a] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* 2. MAIN LAYOUT CONTAINER: LEFT SIDEBAR + RIGHT DASHBOARD */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR matching reference image */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-4 space-y-5 flex-shrink-0">
          
          {/* Top Info Box: Doctor Workspace */}
          <div className="p-3.5 rounded-2xl bg-[#e6f4f1]/60 border border-[#cbe8e1] space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#e6f4f1] text-[#0d5c4d] flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">Doctor workspace</h3>
            <p className="text-[11px] text-slate-500 leading-tight">
              Manage appointments, patient records, and clinical consultations in one place.
            </p>
          </div>

          {/* MAIN MENU Navigation */}
          <div className="space-y-1">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">
              MAIN MENU
            </span>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2.5 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#e6f4f1] text-[#0d5c4d]'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2.5 transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-[#e6f4f1] text-[#0d5c4d]'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2.5 transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-[#e6f4f1] text-[#0d5c4d]'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Consultations</span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2.5 transition-all cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-[#e6f4f1] text-[#0d5c4d]'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Patients</span>
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2.5 transition-all cursor-pointer ${
                activeTab === 'prescriptions'
                  ? 'bg-[#e6f4f1] text-[#0d5c4d]'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Prescriptions</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2.5 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#e6f4f1] text-[#0d5c4d]'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>
          </div>

          {/* Bottom Card: Patient-first care */}
          <div className="pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1 text-xs">
              <div className="flex items-center space-x-1.5 text-[#0d5c4d] font-extrabold">
                <Heart className="w-4 h-4 fill-teal-100 text-[#0d5c4d]" />
                <span>Patient-first care</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight pt-0.5">
                Keep your clinical workflow integrated with real-time patient record briefs.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT BODY */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          
          {/* TAB 1: DASHBOARD (Matching Reference Image) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Header Greeting Banner & Search Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-1 text-[#0d5c4d] text-xs font-black tracking-wider uppercase mb-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>DOCTOR DASHBOARD</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Good morning, {currentUser?.full_name ? (currentUser.full_name.startsWith('Dr.') ? currentUser.full_name : `Dr. ${currentUser.full_name}`) : 'Dr. Priya Mehta'}!
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Here's your schedule and patient overview.
                  </p>
                </div>

                {/* Search Bar & Authenticate Token Button matching screenshot */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="demo_token_8899"
                      className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#0e5a4a] w-56 shadow-xs"
                    />
                  </div>
                  <button
                    onClick={() => {
                      showNotice(`🔑 Token ${tokenInput} authenticated! Patient history loaded.`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0e5a4a] hover:bg-[#093e33] text-white font-extrabold text-xs shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Authenticate Token</span>
                  </button>
                </div>
              </div>

              {/* 3 SUMMARY METRIC CARDS matching reference image */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Metric Card 1: Today's Schedule */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block mb-1">Today's Schedule</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none mb-1">
                      {scheduleList.length}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Scheduled consultations</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#e6f4f1] text-[#0d5c4d] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                {/* Metric Card 2: Recent Patients */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block mb-1">Recent Patients</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none mb-1">
                      {recentPatients.length}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Patient overview</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* Metric Card 3: Active Appointments */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block mb-1">Active Appointments</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none mb-1">
                      {appointments.length > 0 ? appointments.length : 2}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">From your appointment records</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#fefce8] text-amber-600 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* 3 MAIN CONTENT COLUMNS matching reference image */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1: TODAY'S SCHEDULE */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      TODAY'S SCHEDULE
                    </span>
                    <Calendar className="w-4 h-4 text-[#0d5c4d]" />
                  </div>

                  <div className="space-y-3">
                    {scheduleList.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-slate-500 w-16 text-[11px] shrink-0">
                            {item.time}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 leading-tight">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">{item.reason}</p>
                          </div>
                        </div>

                        {item.status === 'Join' ? (
                          <button 
                            onClick={() => {
                              setActiveVideoCallPatient(item);
                              setActiveTab('video');
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0e5a4a] hover:bg-[#073d32] text-white font-extrabold text-[11px] shadow-xs cursor-pointer transition-colors"
                          >
                            Join
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-200/70 text-slate-600 text-[10px] font-bold">
                            Upcoming
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: RECENT PATIENTS */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      RECENT PATIENTS
                    </span>
                    <Users className="w-4 h-4 text-[#0d5c4d]" />
                  </div>

                  <div className="space-y-2.5">
                    {recentPatients.map((pt) => (
                      <div key={pt.id} className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-teal-50/30 border border-slate-100 flex items-center justify-between transition-colors">
                        <div className="flex items-center space-x-3">
                          <img src={pt.avatar} alt={pt.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900">{pt.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">{pt.age} yrs • {pt.gender}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-400 hidden xl:inline">{pt.time}</span>
                          <button
                            onClick={() => setSelectedPatientModal(pt)}
                            className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: QUICK ACTIONS */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
                  <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                    QUICK ACTIONS
                  </span>

                  <div className="space-y-2.5 text-xs">
                    <button
                      onClick={() => setIsPrescriptionModalOpen(true)}
                      className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-bold flex items-center justify-between transition-all shadow-2xs cursor-pointer group"
                    >
                      <span className="flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-[#0d5c4d]" />
                        <span className="font-extrabold text-slate-900">Create Prescription</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    </button>

                    <button
                      onClick={() => setIsTestModalOpen(true)}
                      className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-bold flex items-center justify-between transition-all shadow-2xs cursor-pointer group"
                    >
                      <span className="flex items-center space-x-2.5">
                        <Stethoscope className="w-4 h-4 text-[#0d5c4d]" />
                        <span className="font-extrabold text-slate-900">Request Test</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    </button>

                    <button
                      onClick={() => setIsAccessModalOpen(true)}
                      className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-bold flex items-center justify-between transition-all shadow-2xs cursor-pointer group"
                    >
                      <span className="flex items-center space-x-2.5">
                        <Key className="w-4 h-4 text-[#0d5c4d]" />
                        <span className="font-extrabold text-slate-900">Share Record Access</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    </button>

                    <button
                      onClick={handleGenerateFHIRExport}
                      className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-bold flex items-center justify-between transition-all shadow-2xs cursor-pointer group"
                    >
                      <span className="flex items-center space-x-2.5">
                        <Download className="w-4 h-4 text-[#0d5c4d]" />
                        <span className="font-extrabold text-slate-900">Generate FHIR Export</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Consultation Appointments</h2>
                  <p className="text-xs text-slate-500">Live patient appointments and digital consultation records</p>
                </div>
                <button
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#0e5a4a] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Clinical Record</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
                {scheduleList.map(appt => (
                  <div key={appt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#e6f4f1] text-[#0d5c4d] flex items-center justify-center font-bold text-xs">
                        {appt.time}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">{appt.name}</h3>
                        <p className="text-xs text-slate-500">{appt.reason} • {appt.age} yrs ({appt.gender})</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPatientModal(appt)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold"
                      >
                        Patient Brief
                      </button>
                      <button
                        onClick={() => {
                          setRxPatientName(appt.name);
                          setIsPrescriptionModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#0e5a4a] text-white text-xs font-bold"
                      >
                        Write Rx
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VIDEO CONSULTATIONS */}
          {activeTab === 'video' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Tele-Health Video Suite</h2>
                  <p className="text-xs text-slate-500">Live HD encrypted video consultation with patient brief overlay</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                  ● Telemedicine Active
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Live Video Frame */}
                <div className="lg:col-span-2 bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 aspect-video flex flex-col justify-between p-4 shadow-xl">
                  <div className="flex items-center justify-between text-white z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-red-600 font-bold text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      <span>LIVE WITH {activeVideoCallPatient?.name || 'Amit Kumar'}</span>
                    </span>
                    <span className="text-xs font-mono bg-slate-900/80 px-2 py-1 rounded">08:24</span>
                  </div>

                  <div className="text-center text-slate-400 space-y-2">
                    <img 
                      src={activeVideoCallPatient?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"}
                      alt="Patient"
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-emerald-500/50 shadow-2xl"
                    />
                    <h3 className="text-lg font-black text-white">{activeVideoCallPatient?.name || 'Amit Kumar'}</h3>
                    <p className="text-xs text-emerald-400 font-medium">Follow-up • Type-2 Diabetes & Skin Rash</p>
                  </div>

                  <div className="flex justify-center space-x-3 z-10 pt-4">
                    <button className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-md">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-md">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setActiveVideoCallPatient(null)}
                      className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Side Patient Brief Drawer */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 text-xs shadow-xs">
                  <h3 className="font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Clinical Brief</span>
                    <Sparkles className="w-4 h-4 text-[#0d5c4d]" />
                  </h3>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">CHIEF COMPLAINT</span>
                      <p className="font-semibold text-slate-800">Itchy localized redness on arm for 3 days.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">KNOWN ALLERGIES</span>
                      <p className="font-bold text-amber-600">Penicillin, NSAIDs</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">AI AGENT PRE-BRIEF SUMMARY</span>
                      <p className="text-[11px] text-slate-600">Patient uploaded rash photo. AI agent flagged low-risk Contact Dermatitis. Recommended Hydrocortisone cream consultation.</p>
                    </div>

                    <button
                      onClick={() => {
                        setRxPatientName(activeVideoCallPatient?.name || 'Amit Kumar');
                        setIsPrescriptionModalOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#0e5a4a] text-white font-bold text-xs shadow-sm"
                    >
                      Prescribe Medication
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PATIENTS */}
          {activeTab === 'patients' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Patient Directory</h2>
                  <p className="text-xs text-slate-500">Search and manage clinical records across all registered patients</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentPatients.map(pt => (
                  <div key={pt.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={pt.avatar} alt={pt.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0e5a4a]" />
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">{pt.name}</h3>
                        <p className="text-xs text-slate-500">{pt.age} yrs • {pt.gender} • {pt.phone}</p>
                        <p className="text-[11px] text-[#0d5c4d] font-bold mt-0.5">{pt.condition}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPatientModal(pt)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Passport
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Prescription Center</h2>
                  <p className="text-xs text-slate-500">Issued digital prescriptions and pharmacy handoff records</p>
                </div>
                <button
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#0e5a4a] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Prescription</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-extrabold text-slate-900">
                    <span>Patient: Amit Kumar</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Rx ID: RX_99182</span>
                  </div>
                  <p className="text-slate-600">Diagnosis: Contact Dermatitis / Mild Skin Allergy</p>
                  <p className="font-mono text-slate-800">Cetirizine 10mg (Daily), Hydrocortisone 1% Cream (Twice daily)</p>
                  <p className="text-[11px] text-slate-400">Issued by Dr. Priya Mehta on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs max-w-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-[#0e5a4a] text-white flex items-center justify-center font-black text-xl shadow-md">
                    PM
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Dr. Priya Mehta, MD</h2>
                    <p className="text-xs text-[#0d5c4d] font-bold">Dermatologist & General Physician</p>
                    <p className="text-xs text-slate-400">NMC Reg No: NMC-2018-992140</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Hospital / Clinic</span>
                    <span className="font-bold text-slate-900">Apollo Skin Clinic & HealthCopilot Network</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Hours</span>
                    <span className="font-bold text-slate-900">09:00 AM - 05:00 PM (Mon - Sat)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: VIEW PATIENT PASSPORT */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedPatientModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <img src={selectedPatientModal.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'} alt={selectedPatientModal.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0e5a4a]" />
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedPatientModal.name}</h3>
                <p className="text-xs text-slate-500">{selectedPatientModal.age || 28} yrs • {selectedPatientModal.gender || 'Male'} • Blood Group: <strong className="text-rose-600">B+</strong></p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">Reason & Disease Category:</span>
                <p className="text-slate-800 font-bold">{selectedPatientModal.diseaseCategory || selectedPatientModal.reason || 'General Medical Consultation'}</p>
                {selectedPatientModal.diseaseDescription && (
                  <p className="text-slate-600 mt-1"><strong className="text-slate-700">Symptom Notes:</strong> {selectedPatientModal.diseaseDescription}</p>
                )}
                {selectedPatientModal.symptomsDuration && (
                  <p className="text-slate-500 text-[11px]"><strong className="text-slate-600">Duration:</strong> {selectedPatientModal.symptomsDuration} • <strong className="text-slate-600">Severity:</strong> {selectedPatientModal.severityLevel || 'Moderate'}</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">Chronic Conditions & Allergies:</span>
                <p className="text-slate-600">Mild Asthma, Skin Eczema. Allergy to Penicillin.</p>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                <span className="font-extrabold text-[#0d5c4d] block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Pre-Consultation Summary Brief:</span>
                </span>
                <p className="text-slate-700">{selectedPatientModal.patientNotes || 'Patient reported symptoms for consultation. AI agent pre-brief generated and ready for physician review.'}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPatientModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#0e5a4a] text-white font-extrabold text-xs shadow-sm cursor-pointer"
            >
              Close Record View
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE PRESCRIPTION */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setIsPrescriptionModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-[#0d5c4d]">
              <FileText className="w-5 h-5" />
              <h3 className="text-base font-extrabold text-slate-900">Create Clinical Prescription</h3>
            </div>

            <form onSubmit={handleCreatePrescriptionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={rxPatientName}
                  onChange={(e) => setRxPatientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnosis</label>
                <input
                  type="text"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prescribed Medicines</label>
                <textarea
                  value={rxMedicinesText}
                  onChange={(e) => setRxMedicinesText(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Notes & Advice</label>
                <input
                  type="text"
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0e5a4a] hover:bg-[#083c31] text-white font-black text-xs shadow-sm cursor-pointer"
              >
                Issue Digital Prescription
              </button>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 3: REQUEST TEST */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setIsTestModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-[#0d5c4d]">
              <Stethoscope className="w-5 h-5" />
              <h3 className="text-base font-extrabold text-slate-900">Request Diagnostic Test</h3>
            </div>

            <form onSubmit={handleRequestTestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Name</label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                >
                  <option>Complete Blood Count (CBC) + IgE</option>
                  <option>Skin Allergy Patch Panel</option>
                  <option>HbA1c & Fasting Blood Sugar</option>
                  <option>Thyroid Profile (T3, T4, TSH)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={testUrgency}
                  onChange={(e) => setTestUrgency(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                >
                  <option>Routine</option>
                  <option>Urgent (Same Day)</option>
                  <option>STAT (Immediate)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0e5a4a] text-white font-black text-xs shadow-sm cursor-pointer"
              >
                Send Order to Lab
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SHARE RECORD ACCESS */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 text-center">
            <button
              onClick={() => setIsAccessModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#e6f4f1] text-[#0d5c4d] flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">Share Record Access Token</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Temporary 15-minute access token for specialist consultation handoff.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl font-mono text-sm font-black text-[#0d5c4d] border border-slate-200">
              demo_token_8899
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText('demo_token_8899');
                setIsAccessModalOpen(false);
                showNotice("📋 Token demo_token_8899 copied to clipboard!");
              }}
              className="w-full py-2.5 rounded-xl bg-[#0e5a4a] text-white font-black text-xs shadow-sm cursor-pointer"
            >
              Copy Access Token
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: QR SCANNER MODAL */}
      {isQRScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 text-center">
            <button
              onClick={() => setIsQRScannerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#e6f4f1] text-[#0d5c4d] flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">Scan Patient Health Passport QR</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Scan QR code on patient's device or enter access token below.
            </p>

            <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-2 border border-slate-800">
              <div className="w-36 h-36 mx-auto border-2 border-dashed border-emerald-400/80 rounded-2xl flex flex-col items-center justify-center relative bg-slate-950/60">
                <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-300 font-bold mt-2">Camera Scanner Ready</span>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-slate-700">Access Token Code</label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="demo_token_8899"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-xs text-slate-900"
              />
            </div>

            <button
              onClick={() => {
                setIsQRScannerOpen(false);
                showNotice(`🔑 Token ${tokenInput} loaded successfully!`);
              }}
              className="w-full py-2.5 rounded-xl bg-[#0e5a4a] text-white font-black text-xs shadow-sm cursor-pointer"
            >
              Authenticate & Load Patient Brief
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

