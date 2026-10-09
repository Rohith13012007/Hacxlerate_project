import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Calendar, 
  Pill, 
  FileText, 
  Mic, 
  QrCode, 
  ChevronRight, 
  Share2, 
  MoreVertical,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Activity,
  LogOut
} from 'lucide-react';
import type { Language } from '../types';

interface DashboardProps {
  onNavigate: (path: string) => void;
  onOpenQR: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenQR }) => {
  const { 
    profile, 
    setIsVoiceModalOpen,
    activeLanguage,
    setActiveLanguage,
    sendMessageToCopilot,
    logout
  } = useHealth();

  const [promptInput, setPromptInput] = useState<string>('');
  const [selectedVitalsFilter, setSelectedVitalsFilter] = useState<'7D' | '1M' | '3M'>('7D');

  const suggestionChips = [
    "I have a headache since yesterday",
    "Explain my blood report",
    "Suggest diet for weight loss"
  ];

  const handleSendPrompt = async (text: string) => {
    if (!text.trim()) return;
    setPromptInput('');
    setIsVoiceModalOpen(true);
    await sendMessageToCopilot(text);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <SafetyBanner />

      {/* Greeting Header matching Reference Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good Morning, {profile.name.split(' ')[0]}!</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Here's your health overview for today.
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            onNavigate('/');
          }}
          className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          title="Log out and return to Home"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out to Home</span>
        </button>
      </div>

      {/* Top Row: 4 Overview Cards matching Reference Design Panel 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Upcoming Appointment */}
        <div className="app-card p-4 flex flex-col justify-between space-y-3 bg-white hover:border-blue-300 transition-all shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-slate-900">Upcoming Appointment</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop" 
              alt="Dr. Priya Mehta"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-xs" 
            />
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Dr. Priya Mehta</h4>
              <p className="text-[11px] text-slate-500 font-medium">General Physician</p>
              <p className="text-[10px] font-bold text-blue-600 mt-0.5">Today, 4:00 PM</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => onNavigate('/appointments')}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center space-x-1"
            >
              <span>Join / View</span>
            </button>
          </div>
        </div>

        {/* Card 2: Medications */}
        <div className="app-card p-4 flex flex-col justify-between space-y-3 bg-white hover:border-amber-300 transition-all shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Pill className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-slate-900">Medications</span>
            </div>
            <button 
              onClick={() => onNavigate('/medicines')}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="py-1">
            <div className="text-xl font-black text-slate-900">2 due today</div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Next: Vitamin D at 8:00 AM</span>
            </p>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-1/2 rounded-full" />
          </div>
        </div>

        {/* Card 3: Health Records */}
        <div className="app-card p-4 flex flex-col justify-between space-y-3 bg-white hover:border-teal-300 transition-all shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-slate-900">Health Records</span>
            </div>
            <button 
              onClick={() => onNavigate('/reports')}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              View Records
            </button>
          </div>

          <div className="py-1">
            <div className="text-xl font-black text-slate-900">12 reports</div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Last updated 2 days ago</p>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            <span>FHIR Compliant Records</span>
          </div>
        </div>

        {/* Card 4: Health Score Circular Gauge */}
        <div className="app-card p-4 flex flex-col justify-between space-y-3 bg-white hover:border-emerald-300 transition-all shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-slate-900">Health Score</span>
            </div>
            <button 
              onClick={() => onNavigate('/history')}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              View Details
            </button>
          </div>

          <div className="flex items-center space-x-4 py-1">
            {/* Circular SVG Gauge */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="22" 
                  stroke="#10b981" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray={138} 
                  strokeDashoffset={138 - (138 * 78) / 100}
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-black text-slate-900 leading-none">78</span>
              </div>
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                Good
              </span>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Based on vitals & habits</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+4 points from last month</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Talk to Health Copilot AI Card & Health Passport QR Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: "Talk to Health Copilot" AI Voice & Chat Box */}
        <div className="lg:col-span-2 app-card p-6 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/40 border border-blue-100 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Talk to Health Copilot</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold border border-blue-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    AI Copilot
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Ask anything about your health, symptoms, reports or lifestyle.
                </p>
              </div>
            </div>

            {/* Language Dropdown */}
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <select
                value={activeLanguage}
                onChange={(e) => setActiveLanguage(e.target.value as Language)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs focus:outline-none cursor-pointer"
              >
                <option value="en">English ∨</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="kn">కన్నడ (Kannada)</option>
              </select>
            </div>
          </div>

          {/* Interactive Voice Mic Input Field matching Reference Screenshot */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendPrompt(promptInput);
              }}
              placeholder="Ask Health Copilot anything or click mic to speak..."
              className="w-full bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-600 rounded-2xl pl-5 pr-14 py-3.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none shadow-sm transition-all placeholder-slate-400"
            />

            <button
              onClick={() => {
                if (promptInput.trim()) {
                  handleSendPrompt(promptInput);
                } else {
                  setIsVoiceModalOpen(true);
                }
              }}
              className="absolute right-2.5 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition-all transform hover:scale-105"
              title="Activate Voice AI"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Suggestion Chips below matching mockup */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Suggestions:</span>
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(chip)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold shadow-2xs transition-all flex items-center space-x-1"
              >
                <span>{chip}</span>
                <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Right 1 Column: Health Passport QR Code Card */}
        <div className="app-card p-6 bg-white border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Health Passport</h3>
                <p className="text-[10px] text-slate-500 font-medium">Share your records securely with doctors</p>
              </div>
            </div>
            <button className="p-1 text-slate-400 hover:text-slate-700">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
              <QRCodeSVG 
                value={`http://localhost:5173/#/doctor-access?patient=${encodeURIComponent(profile.name)}`}
                size={120}
                level="H"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">SECURE DOCTOR TOKEN</span>
          </div>

          {/* Action Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenQR}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share QR</span>
            </button>
            <button 
              onClick={() => onNavigate('/doctor-access')}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
              title="Open Doctor View"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Health Records | Vitals Trend | Upcoming Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Recent Health Records matching mockup */}
        <div className="app-card p-5 bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Recent Health Records</h3>
            <button 
              onClick={() => onNavigate('/reports')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                  📄
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Blood Test Report</h4>
                  <p className="text-[10px] text-slate-400 font-medium">12 Mar 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Normal</span>
                <button 
                  onClick={() => onNavigate('/reports')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100"
                >
                  View
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  🩻
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Chest X-Ray</h4>
                  <p className="text-[10px] text-slate-400 font-medium">5 Feb 2024</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('/reports')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100"
              >
                View
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                  💊
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Prescription</h4>
                  <p className="text-[10px] text-slate-400 font-medium">20 Jan 2024</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('/prescriptions')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100"
              >
                View
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Vitals Trend Multi-line chart matching mockup */}
        <div className="app-card p-5 bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Vitals Trend</h3>
            
            {/* Filter pills */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              {(['7D', '1M', '3M'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedVitalsFilter(f)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    selectedVitalsFilter === f ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-around text-[10px] font-bold text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Heart Rate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Blood Pressure
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Weight
            </span>
          </div>

          {/* SVG Multi-Line Chart */}
          <div className="relative w-full h-40 pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
              {/* Horizontal Grid lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* Heart Rate Line (Blue) */}
              <path 
                d="M 10,70 Q 60,30 110,65 T 210,40 T 290,55" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Blood Pressure Line (Emerald) */}
              <path 
                d="M 10,40 Q 60,60 110,35 T 210,75 T 290,30" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Weight Line (Amber) */}
              <path 
                d="M 10,90 Q 60,85 110,88 T 210,80 T 290,82" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="2" 
                strokeDasharray="4 2"
                strokeLinecap="round"
              />
            </svg>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-1">
              <span>Mar 1</span>
              <span>Mar 5</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
            </div>
          </div>
        </div>

        {/* Column 3: Upcoming Medications matching mockup */}
        <div className="app-card p-5 bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Upcoming Medications</h3>
            <button 
              onClick={() => onNavigate('/medicines')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                  💊
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Vitamin D</h4>
                  <p className="text-[10px] text-slate-400 font-medium">1 tablet • 8:00 AM</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('/medicines')}
                className="px-3 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold hover:bg-teal-700 shadow-xs"
              >
                Take Now
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  💊
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Metformin</h4>
                  <p className="text-[10px] text-slate-400 font-medium">1 tablet • 1:00 PM</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold">Pending</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  💊
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Omega 3</h4>
                  <p className="text-[10px] text-slate-400 font-medium">1 capsule • 8:00 PM</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold">Pending</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
