import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useHealth } from '../context/HealthContext';
import { 
  Share2, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Stethoscope
} from 'lucide-react';

interface PatientQRPassportProps {
  onNavigate: (path: string) => void;
  onOpenQR: () => void;
}

export const PatientQRPassport: React.FC<PatientQRPassportProps> = ({ onNavigate, onOpenQR }) => {
  const { profile, activeQRTokens } = useHealth();
  const [currentToken] = useState<string>(activeQRTokens[0]?.token || 'demo_token_8899');
  const [copied, setCopied] = useState(false);

  const [customHost, setCustomHost] = useState<string>(() => {
    return localStorage.getItem('PUBLIC_PASSPORT_HOST') || '';
  });

  const getBaseOrigin = () => {
    if (customHost.trim()) {
      let h = customHost.trim();
      if (!h.startsWith('http://') && !h.startsWith('https://')) {
        h = `http://${h}`;
      }
      return h;
    }
    return window.location.origin;
  };

  const passportUrl = `${getBaseOrigin()}/#/passport-view?token=${currentToken}&patient=${encodeURIComponent(profile.name)}`;

  const handleHostChange = (val: string) => {
    setCustomHost(val);
    localStorage.setItem('PUBLIC_PASSPORT_HOST', val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Encrypted Health Identity Token</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Patient Emergency & Health Passport
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Show or share this QR code with doctors to grant temporary, secure access to your medical history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/passport-view')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Preview Scanned Passport Page</span>
          </button>
          <button
            onClick={onOpenQR}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Pop-up QR Modal</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive QR Code Box */}
        <div className="lg:col-span-5 app-card p-6 bg-white border border-slate-200 flex flex-col items-center justify-center text-center space-y-5 shadow-xs rounded-3xl">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-extrabold text-slate-900 uppercase">Live QR Security Token</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Active & Valid
            </span>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-3xl border-2 border-blue-200 shadow-md flex items-center justify-center">
            <QRCodeSVG 
              value={passportUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="space-y-2 w-full text-center">
            <p className="text-xs font-bold text-slate-700">
              Scan with any smartphone camera or QR reader
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600 flex items-center justify-between">
              <span className="truncate pr-2">{passportUrl}</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="w-full text-left space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Mobile Wi-Fi IP / Public Domain Host:
                </label>
                <span className="text-[9px] text-blue-600 font-bold">For Phone Scanners</span>
              </div>
              <input
                type="text"
                value={customHost}
                onChange={(e) => handleHostChange(e.target.value)}
                placeholder="e.g. 192.168.1.15:5173 or hacxlerate.vercel.app"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="w-full space-y-2 pt-2">
            <button
              onClick={() => onNavigate('/passport-view')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Preview Live Scanned Passport View →</span>
            </button>
            <button
              onClick={() => onNavigate('/doctor-login')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 hover:border-sky-200 text-slate-700 font-extrabold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>Doctor Portal Login Gateway →</span>
            </button>
          </div>
        </div>

        {/* Right Column: Shared Summary & Privacy Settings */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Patient Quick Medical Card */}
          <div className="app-card p-6 bg-white border border-slate-200 space-y-4 shadow-xs rounded-3xl">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase pb-2 border-b border-slate-100">
              Emergency Health Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Patient Name</span>
                <span className="font-extrabold text-slate-900">{profile.name}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Age & Gender</span>
                <span className="font-extrabold text-slate-900">{profile.age} yrs • {profile.gender}</span>
              </div>

              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-[10px] text-rose-500 font-bold block uppercase">Blood Group</span>
                <span className="font-black text-rose-700">{profile.bloodGroup}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Known Allergies</span>
                <span className="font-bold text-amber-700">
                  {profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None Reported'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Chronic Conditions</span>
                <span className="font-bold text-slate-800">
                  {profile.existingConditions.length > 0 ? profile.existingConditions.join(', ') : 'None Reported'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Shared Record Access Permissions */}
          <div className="app-card p-6 bg-white border border-slate-200 space-y-4 shadow-xs rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">
                Included Records
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">ABDM Compliant</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Basic Profile & Vitals</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Active Prescriptions</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Lab Test Summaries</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Consultation Briefs</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-[11px] text-blue-900 flex items-start space-x-2">
              <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Your health data is protected by AES-256 end-to-end encryption. Only authorized physicians with valid clinical credentials can view your record summary upon scanning.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
