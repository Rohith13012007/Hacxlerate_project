import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  Stethoscope, 
  FileText, 
  ChevronDown,
  ChevronUp,
  Key,
  Download,
  Search,
  ArrowUpRight,
  LogOut
} from 'lucide-react';

export const DoctorPortal: React.FC = () => {
  const { profile, appointments, addPrescription, logout, currentUser } = useHealth();
  const [tokenInput, setTokenInput] = useState('demo_token_8899');
  const [authorized, setAuthorized] = useState(true);
  const [selectedPatientTab, setSelectedPatientTab] = useState<'Overview' | 'Reports' | 'Medications' | 'Vitals' | 'History'>('Overview');
  const [expandedApptId, setExpandedApptId] = useState<string | null>(appointments[0]?.id || null);

  // Doctor Consultation Form State
  const [activeConsultApptId, setActiveConsultApptId] = useState<string | null>(null);
  const [clinicalObservations, setClinicalObservations] = useState<string>('Superficial localized erythema noted on left arm. No purulent discharge.');
  const [diagnosis] = useState<string>('Contact Dermatitis / Mild Skin Allergy');
  const [plan] = useState<string>('Apply Hydrocortisone 1% cream twice daily for 5 days. Wash gently with fragrance-free soap.');
  const [rxMedicines, setRxMedicines] = useState<string>('Cetirizine 10mg (Once daily at night for 5 days), Hydrocortisone 1% Cream (Twice daily)');
  const [followUpDate] = useState<string>('2026-10-19');
  const [consultationSuccess, setConsultationSuccess] = useState<boolean>(false);

  const handleCompleteConsultation = (apptId: string) => {
    fetch(`http://localhost:8000/api/doctor/appointments/${apptId}/consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinical_observations: clinicalObservations,
        assessment_diagnosis: diagnosis,
        plan: plan,
        prescription_items: rxMedicines.split(','),
        follow_up_date: followUpDate
      })
    }).catch(err => console.warn('Backend consult sync warning:', err));

    const targetAppt = appointments.find(a => a.id === apptId) || appointments[0];
    addPrescription({
      doctorName: targetAppt ? targetAppt.doctorName : 'Dr. Priya Mehta',
      hospitalName: targetAppt ? targetAppt.hospitalName : 'General Clinic',
      date: new Date().toISOString().split('T')[0],
      items: rxMedicines.split(',').map((item, idx) => ({
        id: `rx_item_${idx}`,
        medicationName: item.trim(),
        dosage: 'As prescribed',
        frequency: 'Daily',
        duration: '5 Days',
        instructions: 'Take after meals'
      })),
      notes: `Diagnosis: ${diagnosis}. Plan: ${plan}`
    });

    setConsultationSuccess(true);
    setTimeout(() => {
      setConsultationSuccess(false);
      setActiveConsultApptId(null);
    }, 3000);
  };

  const scheduleList = [
    { time: '09:00 AM', name: 'Amit Kumar', reason: 'Follow-up • Diabetes', status: 'Join', isLive: true },
    { time: '09:30 AM', name: 'Neha Singh', reason: 'Consultation • Fever', status: 'Upcoming', isLive: false },
    { time: '10:00 AM', name: profile.name, reason: 'Report Discussion', status: 'Upcoming', isLive: false },
    { time: '10:30 AM', name: 'Sneha Patel', reason: 'General Consultation', status: 'Upcoming', isLive: false },
  ];

  const recentPatients = [
    { name: profile.name, age: profile.age, gender: profile.gender, time: 'Today, 10:00 AM', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop' },
    { name: 'Neha Singh', age: 34, gender: 'Female', time: 'Today, 09:30 AM', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop' },
    { name: 'Amit Kumar', age: 45, gender: 'Male', time: 'Today, 09:00 AM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop' },
    { name: 'Sneha Patel', age: 29, gender: 'Female', time: 'Today, 10:30 AM', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header matching Reference Image Doctor Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Good Morning, {currentUser?.full_name ? (currentUser.full_name.startsWith('Dr.') ? currentUser.full_name : `Dr. ${currentUser.full_name}`) : 'Dr. Priya Mehta'}!</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Here's your schedule and patient overview.
          </p>
        </div>

        {/* Search & Token Authenticate Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Search patients, records..."
              className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <button
            onClick={() => setAuthorized(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            Authenticate Token
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            title="Log out and return to Home"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Schedule + Recent Patients & Patient Summary + Quick Actions */}
      {authorized ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Today's Schedule */}
          <div className="app-card p-5 bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Today's Schedule</h3>
              <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>

            <div className="space-y-3">
              {scheduleList.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="font-bold text-slate-500 w-16 text-[11px] flex-shrink-0">
                      {item.time}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{item.reason}</p>
                    </div>
                  </div>

                  {item.isLive ? (
                    <button className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-xs">
                      Join
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold">
                      Upcoming
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Middle Column: Recent Patients & Patient Health Summary */}
          <div className="space-y-6">
            {/* Recent Patients */}
            <div className="app-card p-5 bg-white border border-slate-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Recent Patients</h3>
                <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {recentPatients.map((pt, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 flex items-center justify-between transition-colors">
                    <div className="flex items-center space-x-3">
                      <img src={pt.avatar} alt={pt.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{pt.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{pt.age} yrs • {pt.gender}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] text-slate-400 hidden sm:inline">{pt.time}</span>
                      <button className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-[11px] font-bold">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Health Summary Card matching reference image */}
            <div className="app-card p-5 bg-white border border-slate-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Patient Health Summary</h3>
                <button className="text-xs font-bold text-blue-600 hover:underline">View Full Record</button>
              </div>

              {/* Patient profile header inside summary */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" 
                  alt={profile.name} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{profile.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{profile.age} yrs • {profile.gender}</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
                {(['Overview', 'Reports', 'Medications', 'Vitals', 'History'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedPatientTab(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedPatientTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">CONDITIONS</span>
                  <span className="font-extrabold text-slate-900">Diabetes (Type 2)</span>
                  <span className="text-[9px] text-slate-400 block">Since 2022</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">ALLERGIES</span>
                  <span className="font-bold text-emerald-600">None known</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">CURRENT MEDICATIONS</span>
                  <span className="font-bold text-blue-600">Metformin 500mg</span>
                  <span className="text-[9px] text-slate-500 block">Vitamin D3</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">LAST VISIT</span>
                  <span className="font-bold text-slate-800">12 Mar 2024</span>
                </div>
              </div>

              {/* FHIR Export Button */}
              <button className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center space-x-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span>FHIR Export</span>
              </button>
            </div>
          </div>

          {/* Right Column: Quick Actions & Consultation Management */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="app-card p-5 bg-white border border-slate-200 space-y-3 shadow-xs">
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase pb-2 border-b border-slate-100">Quick Actions</h3>

              <div className="space-y-2 text-xs">
                <button 
                  onClick={() => setActiveConsultApptId(appointments[0]?.id || 'appt_1')}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-800 font-extrabold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Create Prescription</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>

                <button className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-800 font-extrabold flex items-center justify-between transition-colors">
                  <span className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Request Test</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>

                <button className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-800 font-extrabold flex items-center justify-between transition-colors">
                  <span className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-purple-600" />
                    <span>Share Record Access</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>

                <button className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-800 font-extrabold flex items-center justify-between transition-colors">
                  <span className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-amber-600" />
                    <span>Generate FHIR Export</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Booked Appointments & Patient Pre-Consultation Brief */}
            <div className="app-card p-5 bg-white border border-slate-200 space-y-3 shadow-xs">
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase pb-2 border-b border-slate-100">
                Active Appointments & Briefs
              </h3>

              {appointments.map(appt => {
                const isExpanded = expandedApptId === appt.id;
                const isConsulting = activeConsultApptId === appt.id;

                return (
                  <div key={appt.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <div 
                      onClick={() => setExpandedApptId(isExpanded ? null : appt.id)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{appt.reason}</h4>
                        <p className="text-[10px] text-slate-500">{appt.date} at {appt.time}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {isExpanded && (
                      <div className="p-3 space-y-3 bg-white text-xs border-t border-slate-100">
                        <p className="text-slate-600 font-medium">"{appt.diseaseDescription || appt.reason}"</p>
                        
                        {!isConsulting ? (
                          <button
                            onClick={() => setActiveConsultApptId(appt.id)}
                            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                          >
                            Start Prescription Entry
                          </button>
                        ) : (
                          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                            <span className="font-bold text-blue-900 block text-[11px]">PRESCRIPTION FORM</span>
                            <textarea
                              value={clinicalObservations}
                              onChange={(e) => setClinicalObservations(e.target.value)}
                              placeholder="Observations..."
                              rows={2}
                              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                            />
                            <input
                              type="text"
                              value={rxMedicines}
                              onChange={(e) => setRxMedicines(e.target.value)}
                              placeholder="Medicines..."
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900"
                            />

                            {consultationSuccess && (
                              <div className="p-2 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                                Saved to patient record!
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleCompleteConsultation(appt.id)}
                              className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                            >
                              Save Prescription
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-500">
          Enter token above and click Authenticate Token to unlock clinical record view.
        </div>
      )}
    </div>
  );
};
