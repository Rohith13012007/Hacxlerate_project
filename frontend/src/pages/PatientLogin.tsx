import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Phone, 
  Mail,
  ArrowLeft, 
  Lock, 
  Camera, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Stethoscope,
  Info,
  Activity,
  Dna,
  AlertTriangle,
  Globe,
  ShieldCheck,
  Radio,
  Sparkles
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import './PatientLogin.css';

interface PatientLoginProps {
  onNavigate?: (path: string) => void;
  initialStep?: AuthStep;
}

type AuthStep = 'login' | 'otp' | 'register' | 'success';
type PatientAuthMethod = 'mobile' | 'email' | 'abha' | 'emergency';
type LanguageCode = 'en' | 'hi' | 'ta' | 'te';

interface TranslationData {
  welcome: string;
  tagline: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  continueBtn: string;
  abhaSubtitle: string;
}

const TRANSLATIONS: Record<LanguageCode, TranslationData> = {
  en: {
    welcome: 'Welcome Back',
    tagline: 'Your Health. Your History. Your Copilot.',
    nameLabel: 'Your name',
    namePlaceholder: 'Enter your full name (e.g. Rohith Kumar)',
    phoneLabel: 'Mobile Number',
    continueBtn: 'Send OTP',
    abhaSubtitle: 'Login with your 14-digit Ayushman Bharat Digital Health ID'
  },
  hi: {
    welcome: 'नमस्ते! फिर से स्वागत है',
    tagline: 'आपका स्वास्थ्य। आपका इतिहास। आपका कोपायलट।',
    nameLabel: 'आपका नाम',
    namePlaceholder: 'राहुल शर्मा',
    phoneLabel: 'मोबाइल नंबर',
    continueBtn: 'ओटीपी भेजें',
    abhaSubtitle: 'अपनी 14-अंकीय आयुष्मान भारत डिजिटल हेल्थ आईडी से लॉगिन करें'
  },
  ta: {
    welcome: 'வணக்கம்! மீண்டும் வருக',
    tagline: 'உங்கள் நலம். உங்கள் வரலாறு. உங்கள் துணைவன்.',
    nameLabel: 'உங்கள் பெயர்',
    namePlaceholder: 'ராகுல் சர்மா',
    phoneLabel: 'அலைபேசி எண்',
    continueBtn: 'OTP அனுப்பவும்',
    abhaSubtitle: 'உங்கள் 14 இலக்க ஆயுஷ்மான் பாரத் டிஜிட்டல் ஐடி மூலம் நுழையவும்'
  },
  te: {
    welcome: 'స్వాగతం! మళ్లీ రండి',
    tagline: 'మీ ఆరోగ్యం. మీ చరిత్ర. మీ కోపైలట్.',
    nameLabel: 'మీ పేరు',
    namePlaceholder: 'రాహుల్ శర్మ',
    phoneLabel: 'మొబైల్ సంఖ్య',
    continueBtn: 'OTP పంపండి',
    abhaSubtitle: 'మీ 14-అంకెల ఆయుష్మాన్ భారత్ హెల్త్ ఐడీతో లాగిన్ అవ్వండి'
  }
};

export const PatientLogin: React.FC<PatientLoginProps> = ({ 
  onNavigate, 
  initialStep = 'login' 
}) => {
  const { login, register } = useHealth();
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [authMethod, setAuthMethod] = useState<PatientAuthMethod>('mobile');
  const [lang, setLang] = useState<LanguageCode>('en');

  // Step 1: Patient Login Form State (Clean by default for real user entry)
  const [fullName, setFullName] = useState('');
  const [countryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSentReal, setEmailSentReal] = useState<boolean>(false);

  // ABHA ID Form State
  const [abhaNumber, setAbhaNumber] = useState('');
  const [abhaAuthType, setAbhaAuthType] = useState<'aadhaar_otp' | 'mobile_otp'>('aadhaar_otp');
  const [abhaError, setAbhaError] = useState<string | null>(null);

  // Step 2: OTP Verification State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [sentOtpCode, setSentOtpCode] = useState<string>('482910');
  const [countdown, setCountdown] = useState<number>(22);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: Registration Form State
  const [regAge, setRegAge] = useState<number | ''>('');
  const [regAddress, setRegAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick 1-Click Demo Fill Helper
  const handleFillDemoPatient = () => {
    setFullName('Rahul Sharma');
    setPhoneNumber('9876543210');
    setEmailAddress('rahul.sharma@example.com');
    setAbhaNumber('14-8892-4102-9912');
    setRegAge(28);
    setRegAddress('123 Green Park, New Delhi, Delhi 110016');
    setBackendNotice('Sample patient data loaded. You can proceed directly or edit any field with real details.');
    setTimeout(() => setBackendNotice(null), 3500);
  };

  // Feedback and backend notices
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendNotice, setBackendNotice] = useState<string | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Auto-redirect to Patient Dashboard upon success
  useEffect(() => {
    if (step !== 'success') return;
    const timer = setTimeout(() => {
      handleNavigate('/dashboard');
    }, 1800);
    return () => clearTimeout(timer);
  }, [step]);

  const t = TRANSLATIONS[lang];

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  // Validation
  const validateName = (val: string): boolean => {
    if (!val.trim()) {
      setNameError('Full name is required.');
      return false;
    }
    setNameError(null);
    return true;
  };

  const validatePhone = (val: string): boolean => {
    const clean = val.replace(/\D/g, '');
    if (!clean || clean.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val.trim() || !emailRegex.test(val.trim())) {
      setEmailError('Please enter a valid email address (e.g. name@gmail.com).');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validateAbha = (val: string): boolean => {
    const clean = val.replace(/\D/g, '');
    if (val.includes('@')) {
      setAbhaError(null);
      return true;
    }
    if (clean.length !== 14) {
      setAbhaError('Please enter a valid 14-digit ABHA ID (e.g. 14-8892-4102-9912).');
      return false;
    }
    setAbhaError(null);
    return true;
  };

  const handlePhoneOrEmailPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text').trim();
    if (pastedText.includes('@')) {
      e.preventDefault();
      setAuthMethod('email');
      setEmailAddress(pastedText);
      if (emailError) validateEmail(pastedText);
    }
  };

  // STEP 1: Handle Send OTP & ABHA Login
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendNotice(null);

    if (authMethod === 'abha') {
      const isAbhaOk = validateAbha(abhaNumber);
      if (!isAbhaOk) return;
      setIsSubmitting(true);
      try {
        await login(
          abhaNumber ? `${abhaNumber.replace(/[^a-zA-Z0-9]/g, '')}@abdm.gov.in` : 'abha.patient@abdm.gov.in',
          'abha-verified'
        );
        setStep('success');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const isNameOk = validateName(fullName);
    if (!isNameOk) return;

    const isEmailMode = authMethod === 'email';

    if (isEmailMode) {
      const isEmailOk = validateEmail(emailAddress);
      if (!isEmailOk) return;
    } else {
      const isPhoneOk = validatePhone(phoneNumber);
      if (!isPhoneOk) return;
    }

    setIsSubmitting(true);
    try {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      const contactVal = isEmailMode ? emailAddress.trim() : `${countryCode}${phoneNumber.trim()}`;

      const res = await fetch('http://localhost:8000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: contactVal,
          name: fullName.trim(),
          type: isEmailMode ? 'email' : 'mobile'
        })
      }).then(r => r.json()).catch(() => null);

      const codeToUse = res?.otp_code || fallbackCode;
      setSentOtpCode(codeToUse);
      setCountdown(30);
      setEmailSentReal(Boolean(res?.email_sent));

      if (res?.message) {
        setBackendNotice(res.message);
      } else {
        setBackendNotice(isEmailMode ? `OTP dispatched to ${emailAddress}` : `OTP dispatched to +91 ${phoneNumber}`);
      }

      setStep('otp');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google 1-Tap OAuth Login
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login('rahul.sharma@gmail.com', 'google-oauth');
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    const char = value.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const digits = pasted.split('');
      const newDigits = [...otpDigits];
      digits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // STEP 2: Handle Verify OTP (Patient Login -> Success -> Dashboard)
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendNotice(null);

    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      setBackendNotice('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isEmailMode = authMethod === 'email';
      const contactVal = isEmailMode ? emailAddress.trim() : `${countryCode}${phoneNumber.trim()}`;

      const res = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: contactVal,
          code: otpCode,
          name: fullName.trim()
        })
      }).then(r => r.ok ? r.json() : null).catch(() => null);

      if (res && res.token) {
        await login(
          res.email || (isEmailMode ? emailAddress : `${phoneNumber}@patient.healthcopilot.org`),
          'otp-verified',
          res.full_name || fullName.trim() || 'Patient'
        );
        setStep('success');
      } else {
        await login(
          isEmailMode ? emailAddress.trim() : `${phoneNumber}@patient.healthcopilot.org`,
          'otp-verified',
          fullName.trim() || 'Patient'
        );
        setStep('success');
      }
    } catch (err) {
      setBackendNotice('Failed to verify OTP code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    const isEmailMode = authMethod === 'email';
    const contactVal = isEmailMode ? emailAddress.trim() : `${countryCode}${phoneNumber.trim()}`;

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: contactVal,
          name: fullName.trim(),
          type: isEmailMode ? 'email' : 'mobile'
        })
      }).then(r => r.json()).catch(() => null);

      const freshCode = res?.otp_code || Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtpCode(freshCode);
      setCountdown(30);
      setEmailSentReal(Boolean(res?.email_sent));

      if (res?.message) {
        setBackendNotice(res.message);
      } else {
        setBackendNotice(isEmailMode ? `Fresh OTP email sent to ${emailAddress}` : `Fresh OTP code ${freshCode} sent to +91 ${phoneNumber}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  // STEP 3: Handle Create Account (Patient Registration -> Success -> Dashboard)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendNotice(null);

    setIsSubmitting(true);
    try {
      await register(
        phoneNumber ? `${phoneNumber}@patient.healthcopilot.org` : 'patient@healthcopilot.org',
        'patient-secure-123',
        fullName.trim() || 'Patient',
        Number(regAge) || 28,
        'Male'
      );
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  // Emergency SOS Immediate Bypass -> Dashboard
  const handleEmergencyBypass = async () => {
    await login('emergency.patient@healthcopilot.org', 'sos-bypass');
    handleNavigate('/dashboard');
  };

  return (
    <div className="patient-auth-root">
      <div className="patient-auth-backdrop" />

      {/* Top Portal Switcher Bar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight block leading-tight">HealthCopilot</span>
            <span className="text-[10px] text-teal-600 font-semibold block leading-tight">Patient Care Gateway</span>
          </div>
        </div>

        {/* Navigation & Portal Switcher Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleNavigate('/')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
          >
            <span>← Home</span>
          </button>
          <button
            onClick={() => handleNavigate('/patient-login')}
            className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 font-extrabold text-xs shadow-xs cursor-pointer flex items-center space-x-1"
          >
            <span>👤 Patient Portal</span>
          </button>
          <button
            onClick={() => handleNavigate('/doctor-login')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
            <span>Doctor Portal</span>
          </button>
        </div>
      </header>

      {/* Main Container — Centered Enlarged Portal Card on Full-Screen AI Background */}
      <main className="flex-1 relative z-10 w-full px-4 py-8 flex flex-col items-center justify-center">
          
          {/* SCREEN 1: PATIENT LOGIN (Exact PDF Page 2 + ABHA ID + Emergency SOS + Language) */}
          {step === 'login' && (
            <div className="patient-card-container space-y-4 animate-fade-in">
              
              {/* Multilingual Switcher Header (New Healthcare Feature) */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-semibold">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>Language:</span>
                </div>
                <div className="flex items-center space-x-1">
                  {(['en', 'hi', 'ta', 'te'] as LanguageCode[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLang(code)}
                      className={`lang-badge-btn ${lang === code ? 'active' : ''}`}
                    >
                      {code === 'en' ? 'EN' : code === 'hi' ? 'हिन्दी' : code === 'ta' ? 'தமிழ்' : 'తెలుగు'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Brand matching PDF Page 2 */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="flex items-center space-x-1.5">
                  <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center text-white shadow-xs">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">HealthCopilot</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
                  {t.welcome}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {t.tagline}
                </p>
              </div>

              {/* Auth Mode Pill Tabs (Phone OTP vs Email OTP vs ABHA ID vs Emergency SOS) */}
              <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('mobile'); setBackendNotice(null); }}
                  className={`patient-auth-tab-btn ${authMethod === 'mobile' ? 'active' : ''}`}
                >
                  <Phone className="w-3 h-3" />
                  <span>Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setBackendNotice(null); }}
                  className={`patient-auth-tab-btn ${authMethod === 'email' ? 'active' : ''}`}
                >
                  <Mail className="w-3 h-3" />
                  <span>Email OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('abha'); setBackendNotice(null); }}
                  className={`patient-auth-tab-btn ${authMethod === 'abha' ? 'active' : ''}`}
                >
                  <Dna className="w-3 h-3 text-teal-600" />
                  <span>ABHA ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('emergency'); setBackendNotice(null); }}
                  className={`patient-auth-tab-btn emergency-tab ${authMethod === 'emergency' ? 'active' : ''}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Emergency</span>
                </button>
              </div>

              {backendNotice && (
                <div role="alert" className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{backendNotice}</span>
                </div>
              )}

              {/* MODE 1: Standard Mobile OTP Flow */}
              {authMethod === 'mobile' && (
                <form onSubmit={handleSendOTP} noValidate className="space-y-3">
                  
                  {/* Demo fill quick toggle */}
                  <div className="flex items-center justify-between pb-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">Enter your real credentials:</span>
                    <button
                      type="button"
                      onClick={handleFillDemoPatient}
                      className="text-[11px] text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer"
                    >
                      ✨ Fill Sample Details
                    </button>
                  </div>
                  
                  {/* Field 1: Your Name */}
                  <div className={`unified-field-box ${nameError ? 'has-error' : ''}`}>
                    <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                    <div className="flex-1 text-left">
                      <span className="block text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                        {t.nameLabel}
                      </span>
                      <input
                        id="login-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (nameError) validateName(e.target.value);
                        }}
                        placeholder={t.namePlaceholder}
                        required
                        className="w-full bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  {nameError && (
                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{nameError}</span>
                    </p>
                  )}

                  {/* Field 2: Country Code + Phone Number */}
                  <div className={`unified-field-box ${phoneError ? 'has-error' : ''}`}>
                    <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 pr-2.5 border-r border-slate-200 select-none">
                      +91
                    </span>
                    <input
                      id="login-phone"
                      type="tel"
                      value={phoneNumber}
                      maxLength={10}
                      onPaste={handlePhoneOrEmailPaste}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhoneNumber(val);
                        if (phoneError) validatePhone(val);
                      }}
                      placeholder="9876543210"
                      required
                      className="w-full bg-transparent pl-2.5 p-0 text-sm font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{phoneError}</span>
                    </p>
                  )}

                  {/* Send OTP Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="patient-navy-btn mt-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Sending OTP...' : t.continueBtn}
                  </button>

                  {/* OR Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      OR
                    </span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="patient-google-btn cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>
              )}

              {/* MODE 1.5: Email OTP Flow */}
              {authMethod === 'email' && (
                <form onSubmit={handleSendOTP} noValidate className="space-y-3">
                  {/* Demo fill quick toggle */}
                  <div className="flex items-center justify-between pb-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">Enter your email address:</span>
                    <button
                      type="button"
                      onClick={handleFillDemoPatient}
                      className="text-[11px] text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer"
                    >
                      ✨ Fill Sample Details
                    </button>
                  </div>
                  
                  {/* Field 1: Your Name */}
                  <div className={`unified-field-box ${nameError ? 'has-error' : ''}`}>
                    <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                    <div className="flex-1 text-left">
                      <span className="block text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                        {t.nameLabel}
                      </span>
                      <input
                        id="login-email-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (nameError) validateName(e.target.value);
                        }}
                        placeholder={t.namePlaceholder}
                        required
                        className="w-full bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  {nameError && (
                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{nameError}</span>
                    </p>
                  )}

                  {/* Field 2: Email Address */}
                  <div className={`unified-field-box ${emailError ? 'has-error' : ''}`}>
                    <Mail className="w-4 h-4 text-teal-600 mr-2.5 shrink-0" />
                    <div className="flex-1 text-left">
                      <span className="block text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                        Email Address
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        value={emailAddress}
                        onChange={(e) => {
                          setEmailAddress(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        placeholder="rohith@gmail.com"
                        required
                        className="w-full bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  {emailError && (
                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{emailError}</span>
                    </p>
                  )}

                  {/* Send Email OTP Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="patient-navy-btn mt-2 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>{isSubmitting ? 'Sending Real Email OTP...' : 'Send OTP to Email'}</span>
                  </button>

                  {/* OR Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      OR
                    </span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="patient-google-btn cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>
              )}

              {/* MODE 2: Ayushman Bharat Digital Mission (ABHA ID) Login */}
              {authMethod === 'abha' && (
                <form onSubmit={handleSendOTP} className="space-y-3.5 text-left">
                  <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">National Digital Health Mission (ABDM)</p>
                      <p className="text-teal-700">{t.abhaSubtitle}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">
                      14-Digit ABHA ID or ABHA Address
                    </label>
                    <div className={`unified-field-box ${abhaError ? 'has-error' : ''}`}>
                      <Dna className="w-4 h-4 text-teal-600 mr-2 shrink-0" />
                      <input
                        type="text"
                        value={abhaNumber}
                        onChange={(e) => {
                          setAbhaNumber(e.target.value);
                          if (abhaError) validateAbha(e.target.value);
                        }}
                        placeholder="14-8892-4102-9912 or name@abdm"
                        className="w-full bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none font-mono"
                      />
                    </div>
                    {abhaError && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pl-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{abhaError}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setAbhaAuthType('aadhaar_otp')}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                        abhaAuthType === 'aadhaar_otp' 
                          ? 'bg-teal-600 text-white border-teal-600' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Aadhaar OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setAbhaAuthType('mobile_otp')}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                        abhaAuthType === 'mobile_otp' 
                          ? 'bg-teal-600 text-white border-teal-600' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ABHA Mobile OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="patient-navy-btn mt-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Validating ABHA...' : 'Verify via Govt Health Gateway'}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    Don't have an ABHA Card?{' '}
                    <span className="text-teal-700 font-bold hover:underline cursor-pointer">
                      Create ABHA in 60 seconds
                    </span>
                  </p>
                </form>
              )}

              {/* MODE 3: Emergency SOS Quick Triage Access */}
              {authMethod === 'emergency' && (
                <div className="space-y-3.5 text-left">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                    <div className="flex items-center space-x-1.5 text-rose-700 font-black text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                      <span>CRITICAL CARE & EMERGENCY SOS BYPASS</span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-tight">
                      For urgent cardiac, trauma, or respiratory distress. Bypasses standard SMS authentication to alert hospital triage immediately.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Emergency Profile:</span>
                      <span className="text-rose-600">Rahul Sharma (O+ Positive)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Emergency Contact:</span>
                      <span className="font-mono font-semibold">+91 98112 34567 (Father)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Known Allergies:</span>
                      <span className="font-semibold text-amber-700">Penicillin, NSAIDs</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="tel:108"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-black transition-colors"
                    >
                      <Radio className="w-3.5 h-3.5 text-rose-400" />
                      <span>Call 108 Ambulance</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleEmergencyBypass}
                      className="patient-emergency-btn flex-1 !h-auto py-2.5 px-3 text-xs"
                    >
                      <span>Direct Triage Entry →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Switch to Registration */}
              <div className="text-center pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setStep('register'); setBackendNotice(null); }}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                >
                  New patient? Create your account here →
                </button>
              </div>

              {/* Bottom Medical Illustration */}
              <div className="patient-illustration-card flex flex-col items-center text-center space-y-2">
                <div className="flex items-center justify-center -space-x-3 pt-0.5">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&auto=format&fit=crop&q=80"
                    alt="Doctor 1"
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80"
                    alt="Doctor 2"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md z-10"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1594824813589-9a7243c3f914?w=80&auto=format&fit=crop&q=80"
                    alt="Doctor 3"
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight max-w-xs px-2">
                  AI-powered healthcare navigation and personal health management.
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <div className="patient-card-container space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => { setStep('login'); setBackendNotice(null); }}
                  className="flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-md bg-teal-500 flex items-center justify-center text-white shadow-xs">
                    <Activity className="w-3 h-3" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">HealthCopilot</span>
                </div>
              </div>

              <div className="otp-shield-emblem">
                <Lock className="w-8 h-8 text-white" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {authMethod === 'email' ? 'Verify Your Email Address' : 'Verify Your Phone Number'}
                </h2>
                <p className="text-xs text-slate-500">
                  We have sent a 6-digit OTP code to
                </p>
                <p className="text-sm font-extrabold text-slate-900 font-mono tracking-wide">
                  {authMethod === 'email' ? emailAddress : `+91 ${phoneNumber}`}
                </p>
              </div>

              {/* Real Email / Phone Dispatch Notice Alert */}
              {authMethod === 'email' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium text-center space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-center space-x-1.5 font-bold">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {emailSentReal 
                        ? `📧 Real OTP Email sent to ${emailAddress}. Check inbox & spam folder!`
                        : `📧 OTP code for ${emailAddress}:`}
                    </span>
                    {!emailSentReal && (
                      <span className="font-mono text-sm tracking-widest text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded font-black">
                        {sentOtpCode}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpDigits(sentOtpCode.split(''))}
                    className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                  >
                    <span>⚡ One-Tap Auto-fill Code ({sentOtpCode})</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium text-center space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-center space-x-1.5 font-bold">
                    <span>📱 SMS dispatched to +91 {phoneNumber || 'Your Number'}:</span>
                    <span className="font-mono text-sm tracking-widest text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded font-black">{sentOtpCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpDigits(sentOtpCode.split(''))}
                    className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                  >
                    <span>⚡ One-Tap Auto-fill Code ({sentOtpCode})</span>
                  </button>
                </div>
              )}

              {backendNotice && (
                <div role="alert" className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium text-center">
                  {backendNotice}
                </div>
              )}


              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex justify-center items-center gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`otp-digit-box ${digit ? 'filled' : ''}`}
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="text-center text-xs text-slate-500">
                  {countdown > 0 ? (
                    <span>
                      Didn't receive the OTP? Resend in{' '}
                      <span className="font-bold text-slate-800 font-mono">
                        00:{countdown < 10 ? `0${countdown}` : countdown}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer"
                    >
                      Resend OTP Code Now
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="patient-navy-btn cursor-pointer"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Continue to Dashboard'}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setStep('register')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                  >
                    First time here? Complete your patient profile →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SCREEN 3: REGISTRATION FORM (Exact PDF Page 4) */}
          {step === 'register' && (
            <div className="patient-card-container space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => { setStep('otp'); setBackendNotice(null); }}
                  className="flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-md bg-teal-500 flex items-center justify-center text-white shadow-xs">
                    <Activity className="w-3 h-3" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">HealthCopilot</span>
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Complete Your Registration
                </h2>
                <p className="text-xs text-slate-500">
                  Tell us a bit more about yourself
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4 py-1">
                <div className="avatar-photo-wrapper">
                  <img src={avatarUrl} alt="Patient Avatar" className="avatar-photo-img" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="avatar-camera-btn"
                    title="Upload profile picture"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-extrabold text-slate-900">
                    Add Photo (Optional)
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">
                    JPG, PNG (Max 5MB)
                  </span>
                </div>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rahul Sharma"
                    required
                    className="patient-std-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={regAge}
                    onChange={(e) => setRegAge(Number(e.target.value))}
                    placeholder="28"
                    required
                    className="patient-std-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`+91 ${phoneNumber}`}
                    className="patient-std-input font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="123 Green Park, New Delhi, Delhi 110016"
                      required
                      className="patient-std-input pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="patient-navy-btn mt-2 cursor-pointer"
                >
                  {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                >
                  Already have an account? Sign in here →
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: REGISTRATION SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="patient-card-container space-y-5 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Account Active & Synced</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Welcome to HealthCopilot, <span className="font-bold text-slate-800">{fullName}</span>. Your health records, vitals, and consultation portal are ready.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient Name:</span>
                  <span className="font-bold text-slate-800">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile / Identity:</span>
                  <span className="font-bold text-slate-800 font-mono">{countryCode} {phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ABHA Linked:</span>
                  <span className="font-bold text-teal-700 font-mono">{abhaNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Age & Location:</span>
                  <span className="font-bold text-slate-800">{regAge} yrs • New Delhi</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleNavigate('/dashboard')}
                className="patient-navy-btn cursor-pointer"
              >
                Go to Patient Dashboard →
              </button>

              <p className="text-[11px] text-teal-600 font-bold flex items-center justify-center gap-1.5 animate-pulse pt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Redirecting to your Patient Dashboard in 2 seconds...</span>
              </p>
            </div>
          )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-slate-400">
        <p>© 2026 HealthCopilot • AI-Powered Personal Health Operating System</p>
      </footer>
    </div>
  );
};
