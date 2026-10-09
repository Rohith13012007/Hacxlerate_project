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
  UserCheck,
  HeartPulse,
  Search,
} from 'lucide-react';

interface NavbarProps {
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQR }) => {
  const {
    activeLanguage,
    setActiveLanguage,
    setIsVoiceModalOpen,
    setIsEmergencyModalOpen,
    resetDemoData,
    currentUser,
    setIsAuthModalOpen,
    logout,
  } = useHealth();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100/80 bg-white/85 px-4 py-3 shadow-sm shadow-emerald-900/[0.03] backdrop-blur-xl lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-700 text-white shadow-md shadow-emerald-700/15">
            <HeartPulse size={23} />
          </div>

          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-800 sm:text-lg">
              Health<span className="text-teal-700">Copilot</span>
            </h1>
            <p className="hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">
              YOUR PERSONAL HEALTH COMPANION
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="order-3 flex w-full items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 transition-colors focus-within:border-emerald-300 focus-within:bg-white md:order-none md:mx-4 md:max-w-xs md:flex-1 lg:max-w-md">
          <Search size={16} className="shrink-0 text-teal-700" />
          <input
            type="text"
            placeholder="Search health information..."
            aria-label="Search health information"
            className="w-full min-w-0 bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Main controls */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Language */}
          <div className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/70 px-2.5 py-2">
            <Globe size={15} className="shrink-0 text-blue-700" />
            <select
              value={activeLanguage}
              onChange={(event) =>
                setActiveLanguage(event.target.value as Language)
              }
              aria-label="Select language"
              className="max-w-[95px] cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Voice AI */}
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-700/15 transition-all hover:-translate-y-0.5 hover:shadow-md"
            title="Open Voice AI"
          >
            <Mic size={15} />
            <span className="hidden lg:inline">Voice AI</span>
          </button>

          {/* QR Passport */}
          <button
            type="button"
            onClick={onOpenQR}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 transition-colors hover:bg-violet-100"
            title="QR Passport"
          >
            <QrCode size={15} />
            <span className="hidden sm:inline">QR Passport</span>
          </button>

          {/* Emergency */}
          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
            title="Emergency"
          >
            <AlertTriangle size={15} />
            <span className="hidden lg:inline">Emergency</span>
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={resetDemoData}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            title="Reset Demo Data"
            aria-label="Reset demo data"
          >
            <RotateCcw size={15} />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-xl border border-emerald-100 bg-emerald-50/70 p-2 text-teal-800 transition-colors hover:bg-emerald-100"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={17} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-rose-400" />
          </button>

          {/* User and authentication */}
          {currentUser ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 py-1.5 pl-2 pr-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-200 to-teal-300 text-teal-900">
                <UserCheck size={17} />
              </div>

              <div className="hidden max-w-[125px] sm:block">
                <p className="truncate text-xs font-bold text-slate-800">
                  {currentUser.full_name}
                </p>
                <p className="text-[10px] font-medium text-emerald-700">
                  Signed in
                </p>
              </div>

              <button
                type="button"
                onClick={logout}
                className="ml-1 inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-white px-2 py-1.5 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-50"
                title="Logout"
              >
                <LogOut size={13} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-teal-700/15 transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-4"
            >
              <UserCheck size={15} />
              <span>Login / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};