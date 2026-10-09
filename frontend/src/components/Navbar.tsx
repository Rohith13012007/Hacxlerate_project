import React from 'react';
import { useHealth } from '../context/HealthContext';
import type { Language } from '../types';
import { 
  Globe, 
  Bell, 
  RotateCcw, 
  QrCode, 
  Mic, 
  AlertTriangle,
  LogOut,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  onOpenQR: () => void;
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQR, onNavigate }) => {
  const { 
    activeLanguage, 
    setActiveLanguage, 
    setIsVoiceModalOpen, 
    setIsEmergencyModalOpen,
    resetDemoData,
    currentUser,
    setIsAuthModalOpen,
    logout
  } = useHealth();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'kn', label: 'కన్నడ (Kannada)' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
      {/* Brand & Search area matching Reference Design */}
      <div className="flex items-center space-x-6 flex-1 max-w-xl">
        <h2 
          onClick={() => onNavigate ? onNavigate('/') : (window.location.hash = '/')}
          className="font-black text-lg text-blue-600 tracking-tight flex items-center space-x-2 flex-shrink-0 cursor-pointer"
          title="Return to Home"
        >
          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 font-bold text-sm">H</span>
          <span className="text-slate-900 font-extrabold">Health<span className="text-blue-600">Copilot</span></span>
        </h2>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center w-full bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <span className="text-slate-400 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search patients, records, symptoms, doctors..."
            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Center Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Language Selector */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800">
          <Globe className="w-3.5 h-3.5 text-blue-600 mr-2 flex-shrink-0" />
          <select
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value as Language)}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-white text-slate-800">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Voice Assistant Button */}
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all transform hover:scale-[1.02]"
        >
          <Mic className="w-3.5 h-3.5 animate-bounce" />
          <span className="hidden md:inline">Voice AI</span>
        </button>

        {/* QR Card button */}
        <button
          onClick={onOpenQR}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          title="QR Passport"
        >
          <QrCode className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">QR Passport</span>
        </button>

        {/* Emergency Alert Button */}
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span className="hidden lg:inline">Emergency</span>
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={resetDemoData}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors"
          title="Reset Data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right User Profile & Auth */}
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
        </button>

        {currentUser ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
                alt={currentUser.full_name}
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-none">{currentUser.full_name}</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Postgres Synced
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                if (onNavigate) onNavigate('/');
                else window.location.hash = '/';
              }}
              className="ml-2 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Logout and return to Home"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Login / Register</span>
          </button>
        )}
      </div>
    </header>
  );
};
