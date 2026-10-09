import React from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  ArrowRight, 
  ShieldCheck, 
  UserPlus, 
  LogIn,
  CheckCircle2,
  Lock
} from 'lucide-react';
import './AuthGateway.css';

interface AuthGatewayProps {
  onNavigate: (path: string) => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onNavigate }) => {
  return (
    <div className="gateway-root">
      <div className="gateway-grid" />
      <div className="gateway-glow" />

      {/* Top Header */}
      <header className="relative z-10 w-full px-6 lg:px-12 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight leading-tight">
              Health<span className="text-sky-400">Copilot</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Personal Health & Clinical Operating System</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">ABDM & HIPAA Compliant</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 flex flex-col justify-center items-center text-center">
        
        {/* Hero Title */}
        <div className="max-w-2xl mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-sky-400 text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Authentication Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Select Your Portal to Continue
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-normal">
            Choose whether you are signing in as a patient or registering a verified clinical practice.
          </p>
        </div>

        {/* Dual Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* ================= PATIENT PORTAL CARD ================= */}
          <div className="gateway-card p-7 sm:p-8 flex flex-col justify-between text-left border-teal-500/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shadow-md shadow-teal-500/10">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className="gateway-patient-badge px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Patient Portal
                </span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                For Patients
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Manage your health records, consult the AI Health Copilot, track vitals, and share digital health passports with doctors.
              </p>

              {/* Feature Points */}
              <div className="my-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Instant Mobile & OTP Authentication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Digital Health Records & Lab Reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Encrypted QR Health Passport Sharing</span>
                </div>
              </div>
            </div>

            {/* Patient Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('/patient-login')}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer group"
              >
                <LogIn className="w-4 h-4" />
                <span>Patient Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('/patient-register')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-teal-300 font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Patient Account</span>
              </button>
            </div>
          </div>

          {/* ================= DOCTOR PORTAL CARD ================= */}
          <div className="gateway-card p-7 sm:p-8 flex flex-col justify-between text-left border-sky-500/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shadow-md shadow-sky-500/10">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="gateway-doctor-badge px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Doctor Portal
                </span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                For Doctors
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Authorized clinical workspace for medical practitioners, OPD waiting queues, SOAP consultation notes, and FHIR records.
              </p>

              {/* Feature Points */}
              <div className="my-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Doctor ID & NMC Registry Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Clinical SOAP Workstation & E-Prescriptions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Real-Time Patient OPD Waiting Queue</span>
                </div>
              </div>
            </div>

            {/* Doctor Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('/doctor-login')}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer group"
              >
                <LogIn className="w-4 h-4" />
                <span>Doctor Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('/doctor-register')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-sky-300 font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register as a Doctor</span>
              </button>
            </div>
          </div>

        </div>

        {/* Demo Quick Navigation Chips */}
        <div className="mt-12 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-bold mr-1">Direct Pages:</span>
          <button
            onClick={() => onNavigate('/patient-login')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 font-medium cursor-pointer"
          >
            1. Patient Login
          </button>
          <button
            onClick={() => onNavigate('/patient-register')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 font-medium cursor-pointer"
          >
            2. Patient Registration
          </button>
          <button
            onClick={() => onNavigate('/doctor-login')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium cursor-pointer"
          >
            3. Doctor Login
          </button>
          <button
            onClick={() => onNavigate('/doctor-register')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium cursor-pointer"
          >
            4. Doctor Registration
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-slate-500 border-t border-slate-900 bg-slate-950/80">
        <p>© 2026 HealthCopilot Platform • Protected Health Information (PHI) Environment</p>
      </footer>
    </div>
  );
};
