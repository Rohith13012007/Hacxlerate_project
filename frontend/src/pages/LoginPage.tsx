import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  ShieldCheck, 
  Phone, 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  HeartPulse,
  Sparkles,
  MapPin,
  Camera
} from 'lucide-react';

interface LoginPageProps {
  onNavigate?: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, register } = useHealth();

  // Step 1 = Login / Phone Number, Step 2 = OTP Code, Step 3 = Create Profile Registration
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otpDigits, setOtpDigits] = useState(['4', '7', '2', '9', '1', '8']);
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [age, setAge] = useState<number>(28);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [password] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userContact = `${phoneNumber}@healthcopilot.com`;
      const checkRes = await fetch('http://localhost:8000/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, email: userContact })
      }).then(r => r.json()).catch(() => ({ registered: false }));

      const ok = await login(email || userContact, password);
      if (ok) {
        if (checkRes.registered) {
          // Already registered user -> direct login to app
          if (onNavigate) {
            onNavigate('/');
          } else {
            window.location.hash = '/';
          }
        } else {
          // New user -> must complete registration profile step 3 first!
          setStep(3);
        }
      } else {
        setError('Invalid OTP code.');
      }
    } catch (err: any) {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userEmail = email.trim() || `${phoneNumber}@healthcopilot.com`;
      await register(userEmail, password, fullName, age, regGender, address, phoneNumber);
      if (onNavigate) {
        onNavigate('/');
      } else {
        window.location.hash = '/';
      }
    } catch (err: any) {
      setError('Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Bright Aesthetic Background Graphic Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            {step > 1 ? (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-black text-sm">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">
                    HealthCopilot
                  </h1>
                  <p className="text-[10px] text-slate-400 font-medium">Personal Health OS</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HIPAA Secure</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1: Phone Login */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                <p className="text-xs text-slate-500 font-medium">Your Health. Your History. Your Copilot.</p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Rahul Sharma"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <span className="px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-300 font-bold text-slate-700 text-xs">
                      +91
                    </span>
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-xs shadow-lg shadow-blue-900/30 transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                Send Verification OTP
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>

              {/* Bottom Graphic Banner */}
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center space-x-3 text-[11px] text-blue-900 font-medium">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>AI-powered healthcare navigation, food scanning, & doctor appointment copilot.</span>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Verify OTP Code</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Enter the 6-digit security code sent to <span className="font-bold text-slate-900">+91 {phoneNumber}</span>
                </p>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center space-x-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newDigits = [...otpDigits];
                      newDigits[idx] = e.target.value;
                      setOtpDigits(newDigits);
                    }}
                    className="w-10 h-12 text-center text-lg font-extrabold bg-slate-50 border-2 border-slate-300 focus:border-blue-600 rounded-xl focus:outline-none"
                  />
                ))}
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Didn't receive code? <button type="button" className="text-blue-600 font-bold hover:underline">Resend in 00:20</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Continue'}
              </button>
            </form>
          )}

          {/* STEP 3: Complete Profile Registration */}
          {step === 3 && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900">Complete Patient Profile</h2>
                <p className="text-xs text-slate-500 font-medium">Set up your health profile & credentials</p>
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="relative">
                  <img
                    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23e2e8f0'/><circle cx='50' cy='40' r='20' fill='%2394a3b8'/><path d='M 18 88 C 18 68, 82 68, 82 88 Z' fill='%2394a3b8'/></svg>"
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 shadow-xs bg-slate-100"
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 text-white shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Profile Photo (Optional)</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Age *</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 28)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Gender *</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1 flex items-center justify-between">
                    <span>Phone Number *</span>
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">(Mandatory)</span>
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 font-bold text-slate-700 text-xs select-none">
                      +91
                    </span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1 flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] text-slate-400 font-semibold">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul.sharma@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Address / Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your street address, city, state"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>{loading ? 'Logging in...' : 'Login to HealthCopilot'}</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
