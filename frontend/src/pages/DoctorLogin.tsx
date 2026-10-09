import React, { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  Stethoscope, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  HeartPulse, 
  Building, 
  GraduationCap, 
  Award, 
  Phone, 
  Mail, 
  ShieldCheck,
  Dna,
  Fingerprint,
  KeyRound,
  Sparkles
} from 'lucide-react';
import './DoctorLogin.css';

interface DoctorLoginProps {
  onNavigate?: (path: string) => void;
  initialMode?: 'login' | 'register' | 'success';
}

type DoctorAuthMode = 'login' | 'register' | 'success';
type DoctorLoginMethod = 'id_password' | 'smartkey' | 'abdm_hpid';
type ClinicalShift = 'morning_opd' | 'emergency_trauma' | 'icu_rounds' | 'telehealth';

export const DoctorLogin: React.FC<DoctorLoginProps> = ({ 
  onNavigate, 
  initialMode = 'login' 
}) => {
  const { login, register } = useHealth();
  const [mode, setMode] = useState<DoctorAuthMode>(initialMode);
  const [loginMethod, setLoginMethod] = useState<DoctorLoginMethod>('id_password');
  const [selectedShift, setSelectedShift] = useState<ClinicalShift>('morning_opd');

  // Login State (Clean by default for real doctor credentials)
  const [doctorIdOrMobile, setDoctorIdOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [idError, setIdError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ABDM HPID State
  const [hpidNumber, setHpidNumber] = useState('');

  // SmartKey State
  const [isScanningSmartKey, setIsScanningSmartKey] = useState(false);

  // Registration State
  const [regFullName, setRegFullName] = useState('');
  const [regCouncilNumber, setRegCouncilNumber] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('');
  const [regQualification, setRegQualification] = useState('');
  const [regHospital, setRegHospital] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Quick 1-Click Demo Fill Helpers
  const handleFillDemoDoctor = () => {
    setDoctorIdOrMobile('DOC-8891');
    setPassword('doctor123');
    setHpidNumber('HPID-9921-4810-7742');
    setInfoMessage('Loaded sample credentials for Dr. Priya Mehta (Cardiology). You can sign in or replace with your real details.');
    setTimeout(() => setInfoMessage(null), 3500);
  };

  const handleFillDemoDoctorRegister = () => {
    setRegFullName('Dr. Priya Mehta');
    setRegCouncilNumber('MCI-2018-9941');
    setRegSpecialty('Cardiology');
    setRegQualification('MBBS, MD (Cardiology)');
    setRegHospital('Apollo Heart Institute & Polyclinic');
    setRegMobile('9876543210');
    setRegEmail('dr.priya.mehta@apollo.org');
    setRegPassword('DoctorSecure@2026');
    setRegConfirmPassword('DoctorSecure@2026');
    setInfoMessage('Loaded sample physician registration profile.');
    setTimeout(() => setInfoMessage(null), 3500);
  };

  // Status Alerts
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Auto-redirect to Doctor Portal upon registration success
  useEffect(() => {
    if (mode !== 'success') return;
    const timer = setTimeout(() => {
      handleNavigate('/doctor-portal');
    }, 2000);
    return () => clearTimeout(timer);
  }, [mode]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  const validateIdentifier = (value: string): boolean => {
    if (!value.trim()) {
      setIdError('Doctor ID, mobile number, or clinical email is required.');
      return false;
    }
    setIdError(null);
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Password is required.');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (loginMethod === 'abdm_hpid') {
      if (!hpidNumber.trim()) {
        setIdError('Please enter your 14-digit Healthcare Professional ID.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        login(hpidNumber || 'dr.priya@apollo.org', 'doctor123');
        handleNavigate('/doctor-portal');
      }, 700);
      return;
    }

    const isIdValid = validateIdentifier(doctorIdOrMobile);
    const isPasswordValid = validatePassword(password);
    if (!isIdValid || !isPasswordValid) return;

    setIsLoading(true);
    try {
      const docName = doctorIdOrMobile.includes('@')
        ? doctorIdOrMobile.split('@')[0]
        : doctorIdOrMobile;
      const formattedDocName = docName.toLowerCase().startsWith('dr.')
        ? docName
        : `Dr. ${docName}`;

      await login(doctorIdOrMobile.trim(), password, formattedDocName);
      handleNavigate('/doctor-portal');
    } finally {
      setIsLoading(false);
    }
  };

  // SmartKey Biometric simulated 1-tap auth
  const handleSmartKeyAuth = () => {
    setIsScanningSmartKey(true);
    setTimeout(() => {
      setIsScanningSmartKey(false);
      login('dr.priya@apollo.org', 'doctor123');
      handleNavigate('/doctor-portal');
    }, 1100);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!termsAgreed) {
      setGeneralError('Please confirm the medical declaration and code of ethics.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setGeneralError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await register(
        regEmail.trim() || 'doctor@hospital.org',
        regPassword,
        regFullName.trim() || 'Dr. Physician',
        38,
        'Doctor'
      );
      setMode('success');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (docId: string, pass: string, name: string) => {
    setDoctorIdOrMobile(docId);
    setPassword(pass);
    setInfoMessage(`Loaded credentials for ${name}`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  return (
    <div className="doctor-login-root">
      <div className="doctor-bg-grid" />
      <div className="doctor-bg-glow" />

      {/* Top Bar Switcher */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight block leading-tight">HealthCopilot</span>
            <span className="text-[10px] text-sky-600 font-semibold block leading-tight">Physician & Clinical Portal</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleNavigate('/')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
          >
            <span>← Home</span>
          </button>
          <button
            onClick={() => handleNavigate('/patient-login')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
          >
            <span>👤 Patient Portal</span>
          </button>
          <button
            onClick={() => handleNavigate('/doctor-login')}
            className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 font-extrabold text-xs shadow-xs cursor-pointer flex items-center space-x-1"
          >
            <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
            <span>Doctor Portal</span>
          </button>
        </div>
      </header>

      {/* Main Container — Centered Enlarged Clinical Portal Card on Full-Screen AI Background */}
      <main className="flex-1 relative z-10 w-full px-4 py-8 flex flex-col items-center justify-center">

          {/* VIEW 1: DOCTOR LOGIN */}
          {mode === 'login' && (
            <div className="doctor-card-container space-y-4 animate-fade-in">
              
              {/* Header Brand matching PDF Clean Style */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-xs mb-1">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Physician Portal</h1>
                <p className="text-xs text-slate-400 font-medium">Verified Access for Medical Practitioners</p>
              </div>

              {/* Duty Shift Selector (New Apt Clinical Feature) */}
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-left">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Select Active Clinical Shift:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedShift('morning_opd')}
                    className={`py-1 px-2 rounded-lg text-left font-semibold border transition-colors cursor-pointer ${
                      selectedShift === 'morning_opd' 
                        ? 'bg-sky-600 text-white border-sky-600' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🌅 Morning OPD
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedShift('emergency_trauma')}
                    className={`py-1 px-2 rounded-lg text-left font-semibold border transition-colors cursor-pointer ${
                      selectedShift === 'emergency_trauma' 
                        ? 'bg-rose-600 text-white border-rose-600' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🚨 Trauma / ER
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedShift('icu_rounds')}
                    className={`py-1 px-2 rounded-lg text-left font-semibold border transition-colors cursor-pointer ${
                      selectedShift === 'icu_rounds' 
                        ? 'bg-sky-600 text-white border-sky-600' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🌙 ICU Rounds
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedShift('telehealth')}
                    className={`py-1 px-2 rounded-lg text-left font-semibold border transition-colors cursor-pointer ${
                      selectedShift === 'telehealth' 
                        ? 'bg-sky-600 text-white border-sky-600' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    💻 Telehealth
                  </button>
                </div>
              </div>

              {/* Login Method Tabs (New Apt Feature: ID/Password vs Medical SmartKey vs ABDM HPID) */}
              <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setLoginMethod('id_password')}
                  className={`doctor-auth-tab-btn ${loginMethod === 'id_password' ? 'active' : ''}`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Doctor ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('smartkey')}
                  className={`doctor-auth-tab-btn ${loginMethod === 'smartkey' ? 'active' : ''}`}
                >
                  <Fingerprint className="w-3 h-3 text-sky-600" />
                  <span>SmartKey Tap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('abdm_hpid')}
                  className={`doctor-auth-tab-btn ${loginMethod === 'abdm_hpid' ? 'active' : ''}`}
                >
                  <Dna className="w-3 h-3 text-teal-600" />
                  <span>ABDM HPID</span>
                </button>
              </div>

              {generalError && (
                <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start space-x-2 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              {infoMessage && (
                <div role="alert" className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 font-medium text-left">
                  {infoMessage}
                </div>
              )}

              {/* METHOD 1: Traditional Doctor ID & Password */}
              {loginMethod === 'id_password' && (
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5 text-left">
                  <div className="flex items-center justify-between pb-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">Enter your real physician credentials:</span>
                    <button
                      type="button"
                      onClick={handleFillDemoDoctor}
                      className="text-[11px] text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
                    >
                      ✨ Fill Sample Doctor
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">
                      Doctor ID / Mobile / Medical Email
                    </label>
                    <div className="relative">
                      <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={doctorIdOrMobile}
                        onChange={(e) => {
                          setDoctorIdOrMobile(e.target.value);
                          if (idError) validateIdentifier(e.target.value);
                        }}
                        placeholder="DOC-8891 or doctor@hospital.org"
                        required
                        className={`doctor-std-input pl-10 ${idError ? 'has-error' : ''}`}
                      />
                    </div>
                    {idError && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pl-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{idError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1 ml-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setInfoMessage('Password recovery request dispatched to your hospital IT admin.')}
                        className="text-[11px] text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) validatePassword(e.target.value);
                        }}
                        placeholder="••••••••••••"
                        required
                        className={`doctor-std-input pl-10 pr-10 ${passwordError ? 'has-error' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pl-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{passwordError}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-slate-600 font-medium">Keep session logged in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="doctor-navy-btn cursor-pointer"
                  >
                    {isLoading ? 'Verifying Credentials...' : 'Sign In to Clinical Portal'}
                  </button>
                </form>
              )}

              {/* METHOD 2: Medical SmartKey / Biometric Tap (New Apt Feature) */}
              {loginMethod === 'smartkey' && (
                <div className="space-y-3.5 text-center">
                  <div className="smartkey-scanner-box">
                    <div className="smartkey-pulse-ring">
                      <Fingerprint className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-0.5">
                      {isScanningSmartKey ? 'Authenticating Sensor...' : 'Hospital RFID Badge or Biometric Tap'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ideal for sterile scrub-room workstations. Hold physical card or touch scanner.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSmartKeyAuth}
                    disabled={isScanningSmartKey}
                    className="doctor-navy-btn cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4 text-sky-300" />
                    <span>{isScanningSmartKey ? 'Reading RFID Token...' : '1-Tap Sterile SmartKey Login'}</span>
                  </button>
                </div>
              )}

              {/* METHOD 3: ABDM Healthcare Professional ID (HPID) */}
              {loginMethod === 'abdm_hpid' && (
                <form onSubmit={handleLoginSubmit} className="space-y-3 text-left">
                  <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">National Medical Registry (HPID)</p>
                      <p className="text-teal-700">Centralized authentication for registered doctors in India.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">
                      Healthcare Professional ID (HPID)
                    </label>
                    <div className="relative">
                      <Dna className="w-4 h-4 text-teal-600 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={hpidNumber}
                        onChange={(e) => setHpidNumber(e.target.value)}
                        placeholder="HPID-9921-4810-7742"
                        className="doctor-std-input pl-10 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="doctor-navy-btn cursor-pointer"
                  >
                    {isLoading ? 'Verifying with ABDM Gateway...' : 'Verify HPID & Sign In'}
                  </button>
                </form>
              )}

              {/* Demo Quick Accounts */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 text-center">
                  Quick Demo Accounts
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('DOC-8891', 'doctor123', 'Dr. Priya Mehta (Cardiology)')}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 text-left transition-colors cursor-pointer"
                  >
                    👩‍⚕️ Dr. Priya (Cardio)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('DOC-1044', 'doctor123', 'Dr. Vikram Rao (Neurology)')}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 text-left transition-colors cursor-pointer"
                  >
                    👨‍⚕️ Dr. Vikram (Neuro)
                  </button>
                </div>
              </div>

              {/* Switch to Registration */}
              <div className="text-center pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setGeneralError(null); }}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
                >
                  New Physician? Register Medical Practice →
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: ONBOARDING REGISTRATION */}
          {mode === 'register' && (
            <div className="doctor-card-container-wide space-y-4 animate-fade-in text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setGeneralError(null); }}
                  className="flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-md bg-sky-600 flex items-center justify-center text-white shadow-xs">
                    <HeartPulse className="w-3 h-3" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">HealthCopilot Provider Network</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Physician Onboarding Application</h2>
                <p className="text-xs text-slate-500">Provide medical council credentials for automated National Registry validation.</p>
              </div>

              {generalError && (
                <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] text-slate-500 font-medium">Enter your real medical details:</span>
                <button
                  type="button"
                  onClick={handleFillDemoDoctorRegister}
                  className="text-[11px] text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
                >
                  ✨ Fill Sample
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">Full Name & Title</label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                      placeholder="Dr. Priya Mehta"
                      className="doctor-std-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">Medical Council Reg. No. (MCI / State)</label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={regCouncilNumber}
                        onChange={(e) => setRegCouncilNumber(e.target.value)}
                        required
                        placeholder="MCI-2018-9941"
                        className="doctor-std-input pl-10 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">Primary Clinical Specialty</label>
                    <div className="relative">
                      <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={regSpecialty}
                        onChange={(e) => setRegSpecialty(e.target.value)}
                        required
                        placeholder="Cardiology / Internal Medicine"
                        className="doctor-std-input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">Qualifications</label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={regQualification}
                        onChange={(e) => setRegQualification(e.target.value)}
                        required
                        placeholder="MBBS, MD, DM"
                        className="doctor-std-input pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">Affiliated Hospital / Polyclinic</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={regHospital}
                      onChange={(e) => setRegHospital(e.target.value)}
                      required
                      placeholder="Apollo Hospital / AIIMS / Private Clinic"
                      className="doctor-std-input pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">Clinical Mobile</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        required
                        placeholder="9876543210"
                        className="doctor-std-input pl-10 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">Professional Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        placeholder="dr.priya@apollo.org"
                        className="doctor-std-input pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        placeholder="••••••••••••"
                        className="doctor-std-input pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••••••"
                        className="doctor-std-input pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-600">
                      I declare that I am a registered medical practitioner with an active license under the National Medical Commission / State Medical Council and agree to comply with HIPAA/DISHA data protection regulations.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="doctor-navy-btn cursor-pointer"
                >
                  {isLoading ? 'Verifying with Medical Registry...' : 'Submit Physician Application'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW 3: ONBOARDING SUCCESS CONFIRMATION */}
          {mode === 'success' && (
            <div className="doctor-card-container space-y-5 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Medical Verification Active</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Registration for <span className="font-bold text-slate-800">{regFullName}</span> has been confirmed. Medical council registration <span className="font-bold text-sky-700 font-mono">{regCouncilNumber}</span> is validated.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor:</span>
                  <span className="font-bold text-slate-800">{regFullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Specialty:</span>
                  <span className="font-bold text-slate-800">{regSpecialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Council Number:</span>
                  <span className="font-bold text-sky-700 font-mono">{regCouncilNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hospital:</span>
                  <span className="font-bold text-slate-800">{regHospital}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleNavigate('/doctor-portal')}
                className="doctor-navy-btn cursor-pointer"
              >
                Proceed to Physician Portal →
              </button>

              <p className="text-[11px] text-sky-600 font-bold flex items-center justify-center gap-1.5 animate-pulse pt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Redirecting to Physician Portal in 2 seconds...</span>
              </p>
            </div>
          )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-slate-400">
        <p>© 2026 HealthCopilot • Clinical Operating System for Physicians & Healthcare Institutions</p>
      </footer>
    </div>
  );
};
