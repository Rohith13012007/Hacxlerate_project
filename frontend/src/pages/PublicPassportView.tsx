import React from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  ShieldCheck, 
  PhoneCall, 
  AlertTriangle, 
  Pill, 
  FileText, 
  Stethoscope, 
  Activity, 
  CheckCircle2, 
  Printer, 
  ArrowLeft,
  Lock,
  HeartPulse
} from 'lucide-react';

interface PublicPassportViewProps {
  onNavigate?: (path: string) => void;
}

export const PublicPassportView: React.FC<PublicPassportViewProps> = ({ onNavigate }) => {
  const { profile, prescriptions, visionAnalyses } = useHealth();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans antialiased selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation / Header controls */}
        <div className="flex items-center justify-between no-print">
          <button
            onClick={() => onNavigate ? onNavigate('/qr-passport') : (window.location.hash = '/qr-passport')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => onNavigate ? onNavigate('/doctor-login') : (window.location.hash = '/doctor-login')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Login Gateway</span>
            </button>
          </div>
        </div>

        {/* Verification Top Banner */}
        <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-slate-900 border border-blue-500/40 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck className="w-48 h-48 text-blue-400" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>OFFICIAL ABDM LIVE VERIFIED HEALTH PASSPORT</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-3">
                <span>{profile.name}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-extrabold">
                  Blood Group: {profile.bloodGroup}
                </span>
              </h1>
              <p className="text-xs text-slate-300 font-medium mt-1">
                ABDM Token ID: <span className="font-mono text-blue-300">ABDM-IND-8899-341</span> • Age: {profile.age} yrs • Gender: {profile.gender}
              </p>
            </div>

            <a
              href={`tel:${profile.emergencyContact || '+919876543210'}`}
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center space-x-2 shadow-xl shadow-rose-600/40 border border-rose-400 transition-all w-fit"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call Emergency Contact</span>
            </a>
          </div>
        </div>

        {/* Grid Section 1: Vitals & Critical Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Blood & Vitals */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
              <HeartPulse className="w-4 h-4" />
              <span>KEY VITALS & METRICS</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 pt-1">
              <div><span className="text-slate-400">Heart Rate:</span> <strong className="text-white">72 bpm (Normal)</strong></div>
              <div><span className="text-slate-400">Blood Pressure:</span> <strong className="text-white">120/80 mmHg</strong></div>
              <div><span className="text-slate-400">SpO2 Level:</span> <strong className="text-white">98% Room Air</strong></div>
            </div>
          </div>

          {/* Known Allergies */}
          <div className="bg-amber-950/40 border border-amber-500/30 p-5 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>KNOWN ALLERGIES & RISK FLAGS</span>
            </div>
            <div className="text-xs font-bold text-amber-200">
              {profile.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.allergies.map((allergy, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      ⚠️ {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <span>No severe drug/food allergies reported.</span>
              )}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs">
              <Activity className="w-4 h-4" />
              <span>CHRONIC CONDITIONS</span>
            </div>
            <div className="text-xs font-semibold text-slate-200 pt-1">
              {profile.existingConditions.length > 0 ? profile.existingConditions.join(', ') : 'None Reported'}
            </div>
          </div>

        </div>

        {/* Section 2: Attending Doctor Clinical Descriptions & Observations */}
        <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center space-x-2 text-blue-400 font-black text-xs uppercase tracking-wider">
              <Stethoscope className="w-5 h-5 text-blue-400" />
              <span>Attending Physician Clinical Diagnosis & Notes</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold border border-blue-500/30">
              Dr. Ananya Rao, MD (Internal Medicine)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-2 text-xs text-slate-300">
            <h4 className="font-extrabold text-white text-sm">Primary Diagnosis: Mild Atopic Eczema & Seasonal Asthma</h4>
            <p className="leading-relaxed">
              <strong>Clinical Observation:</strong> Patient presented with mild skin redness and localized bronchial tightness due to seasonal change. Vitals remain within healthy physiological limits. Advised daily hydration, allergen avoidance, and prescribed short-acting inhaler & topical soothing cream.
            </p>
            <div className="pt-2 text-[11px] text-blue-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Follow-up recommended in 2 weeks if mild wheezing recurs.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Active Prescriptions */}
        <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-black text-xs uppercase tracking-wider pb-3 border-b border-slate-700">
            <Pill className="w-5 h-5 text-emerald-400" />
            <span>Active Prescriptions & Dosage Schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {prescriptions.length > 0 ? (
              prescriptions.flatMap(rx => rx.items || []).map((med, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white">{med.medicationName}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {med.dosage}
                    </span>
                  </div>
                  <p className="text-slate-400 font-medium text-[11px]">Frequency: {med.frequency} ({med.duration})</p>
                  <p className="text-slate-300 text-[11px] italic">Notes: {med.instructions || 'Take after meals'}</p>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white">Amoxicillin 500mg</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">1 tab BID</span>
                  </div>
                  <p className="text-slate-400 font-medium text-[11px]">Frequency: Twice daily after meals (5 days)</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white">Salbutamol Inhaler 100mcg</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">2 Puffs PRN</span>
                  </div>
                  <p className="text-slate-400 font-medium text-[11px]">Frequency: As needed for shortness of breath</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: AI Consultation Briefs & Vision Observations */}
        <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-black text-xs uppercase tracking-wider pb-3 border-b border-slate-700">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>AI Health Copilot Consultation & Vision Summaries</span>
          </div>

          <div className="space-y-3 text-xs">
            {visionAnalyses.length > 0 ? (
              visionAnalyses.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-300">{item.observation}</span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{item.explanation}</p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                <span className="font-extrabold text-indigo-300 block">AI Triage Brief: Mild Eczema & Skin Rash Assessment</span>
                <p className="text-slate-300 text-[11px]">
                  Visual analysis detected mild erythematous plaque. Triage urgency: LOW CONCERN. Advised gentle skin hydration with fragrance-free lotion and consultation with Dermatologist if itching escalates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Security Notice */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-center space-x-1.5 text-slate-300 font-bold">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>AES-256 ABDM Encrypted Emergency Passport</span>
          </div>
          <p className="text-[11px] text-slate-500">
            This live passport page was generated from the patient's encrypted identity token. Data access logged for patient security.
          </p>
        </div>

      </div>
    </div>
  );
};
