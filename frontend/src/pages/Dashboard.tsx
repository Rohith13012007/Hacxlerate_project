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
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Activity,
  LogOut,
  Stethoscope,
  Bot,
  Eye,
  History,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Heart
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (path: string) => void;
  onOpenQR: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenQR }) => {
  const { 
    profile, 
    setIsVoiceModalOpen,
    sendMessageToCopilot,
    logout,
    userLocation,
    appointments
  } = useHealth();

  const [promptInput, setPromptInput] = useState<string>('');
  const [selectedVitalsFilter, setSelectedVitalsFilter] = useState<'7D' | '1M' | '3M'>('7D');

  const upcomingAppt = appointments.find(a => a.status === 'Upcoming') || appointments[0];

  const suggestionChips = [
    "I have a headache since yesterday",
    "Explain my blood report",
    "Suggest diet for weight loss"
  ];

  const handleSendPrompt = async (text: string) => {
    if (!text.trim()) return;
    setPromptInput('');
    setIsVoiceModalOpen(true);
    try {
      await sendMessageToCopilot(text);
    } catch (err) {
      console.error("Error sending message to Health Copilot:", err);
    }
  };

  // Dynamic Vitals Telemetry Data based on Filter
  const vitalsData = {
    '7D': {
      avgBpm: 78,
      status: 'Normal Rhythm',
      improvement: '+4 points improvement',
      labels: ['Oct 3', 'Oct 4', 'Oct 5', 'Oct 6', 'Oct 7', 'Oct 8', 'Oct 9'],
      hrPath: "M 10,50 Q 60,20 110,45 T 210,30 T 290,40",
      bpPath: "M 10,30 Q 60,45 110,25 T 210,55 T 290,20"
    },
    '1M': {
      avgBpm: 76,
      status: 'Stable Monthly Trend',
      improvement: '+6 points improvement',
      labels: ['Sep 10', 'Sep 17', 'Sep 24', 'Oct 1', 'Oct 8'],
      hrPath: "M 10,40 Q 70,30 140,50 T 230,25 T 290,35",
      bpPath: "M 10,35 Q 70,20 140,40 T 230,45 T 290,25"
    },
    '3M': {
      avgBpm: 75,
      status: 'Optimal 90-Day Telemetry',
      improvement: '+8 points improvement',
      labels: ['Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026'],
      hrPath: "M 10,45 Q 80,15 160,35 T 240,40 T 290,30",
      bpPath: "M 10,25 Q 80,40 160,20 T 240,50 T 290,20"
    }
  }[selectedVitalsFilter];

  const projectFeatures = [
    {
      id: 'assistant',
      title: 'AI Health Copilot',
      subtitle: 'Continuous Voice & Multilingual Assistant',
      path: '/assistant',
      icon: Bot,
      bgColor: 'bg-blue-50 text-blue-600 border-blue-200',
      accentColor: 'from-blue-600 to-indigo-600',
      badge: 'Interactive AI'
    },
    {
      id: 'doctors',
      title: 'Find Doctors Near Me',
      subtitle: 'Dynamic GPS Specialist & Hospital Match',
      path: '/doctors',
      icon: Stethoscope,
      bgColor: 'bg-teal-50 text-teal-600 border-teal-200',
      accentColor: 'from-teal-600 to-emerald-600',
      badge: 'Live Directions'
    },
    {
      id: 'reports',
      title: 'Scan Medical Reports',
      subtitle: 'AI Parameter Extraction & Lab Summaries',
      path: '/reports',
      icon: FileText,
      bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      accentColor: 'from-cyan-600 to-blue-600',
      badge: 'FHIR Standard'
    },
    {
      id: 'medicines',
      title: 'Manage Medicines',
      subtitle: 'Smart Dosage Schedule & Refill Alerts',
      path: '/medicines',
      icon: Pill,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-200',
      accentColor: 'from-amber-500 to-orange-500',
      badge: 'Adherence Log'
    },
    {
      id: 'food',
      title: 'Food & Vision Scan',
      subtitle: 'AI Camera Scan for Nutrition & Rash Check',
      path: '/food',
      icon: Eye,
      bgColor: 'bg-purple-50 text-purple-600 border-purple-200',
      accentColor: 'from-purple-600 to-indigo-600',
      badge: 'Vision AI'
    },
    {
      id: 'history',
      title: 'Medical Timeline',
      subtitle: 'Patient History & Emergency QR Token',
      path: '/history',
      icon: History,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      accentColor: 'from-emerald-600 to-teal-600',
      badge: 'Health Log'
    }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <SafetyBanner />

      {/* Hero Section matching Reference Image Design (White Bright Aesthetic) */}
      <div className="relative bg-gradient-to-r from-blue-50/90 via-white to-cyan-50/90 border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden backdrop-blur-md">
        
        {/* Soft Ambient Blurred Glowing Orbs for Bright Aesthetic */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Action Header Bar inside Hero */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-200/60 mb-6">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Patient: {profile?.name || 'Akhil Sharma'} ({profile?.age || 28} yrs, {profile?.gender || 'Male'})</span>
            </span>
            {userLocation && (
              <span className="hidden sm:flex items-center space-x-1 text-blue-700 font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>GPS Active</span>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs"
            title="Log out and return to Home"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Bold Headline & Copilot Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-extrabold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>Continuous Voice & Multilingual Health Copilot</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                <span className="text-slate-900 block">Your Health.</span>
                <span className="text-slate-900 block">Your History.</span>
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                  Your Copilot.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg pt-2 leading-relaxed">
                An AI-powered healthcare navigation and personal health management assistant for you and your family.
              </p>
            </div>

            {/* Interactive Prompt & Voice Microphone Bar */}
            <div className="space-y-3 pt-2">
              <div className="relative flex items-center max-w-xl">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendPrompt(promptInput);
                  }}
                  placeholder="Ask Health Copilot anything or click mic to talk..."
                  className="w-full bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-600 rounded-2xl pl-5 pr-28 py-3.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none shadow-md shadow-blue-500/5 transition-all placeholder-slate-400"
                />

                <div className="absolute right-2 flex items-center space-x-1.5">
                  <button
                    onClick={() => {
                      if (promptInput.trim()) {
                        handleSendPrompt(promptInput);
                      } else {
                        setIsVoiceModalOpen(true);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-600/30 transition-all transform hover:scale-105 flex items-center space-x-1 cursor-pointer"
                    title="Activate Voice AI Assistant"
                  >
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-extrabold hidden sm:inline">Talk</span>
                  </button>
                </div>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-2 max-w-xl pt-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Try Asking:</span>
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(chip)}
                    className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{chip}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: AI Doctor Portrait & Floating Feature Badges matching Reference Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-4 sm:py-0">
            
            {/* Glowing Ambient Background Ring */}
            <div className="relative w-72 h-80 sm:w-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-tr from-blue-100 via-white to-cyan-100">
              <img 
                src="/images/bright_doctor_hero.jpg" 
                alt="AI Health Copilot Female Physician Assistant" 
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop";
                }}
              />
              
              {/* Overlay Gradient for Badge Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Interactive Feature Badges surrounding Doctor matching Reference Image */}
            
            {/* Badge 1: AI Assistant (Top Left) */}
            <button
              onClick={() => onNavigate('/assistant')}
              className="absolute -top-3 -left-2 sm:-left-6 px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md flex items-center space-x-2 transform hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-none">AI Assistant</span>
                <span className="text-[9px] text-slate-500 font-bold">24/7 Triage</span>
              </div>
            </button>

            {/* Badge 2: Scan Reports (Top Right) */}
            <button
              onClick={() => onNavigate('/reports')}
              className="absolute -top-3 -right-2 sm:-right-6 px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md flex items-center space-x-2 transform hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-none">Scan Reports</span>
                <span className="text-[9px] text-slate-500 font-bold">AI Analysis</span>
              </div>
            </button>

            {/* Badge 3: Find Doctors (Middle Left) */}
            <button
              onClick={() => onNavigate('/doctors')}
              className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-10 px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md flex items-center space-x-2 transform hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-none">Find Doctors</span>
                <span className="text-[9px] text-slate-500 font-bold">GPS Match</span>
              </div>
            </button>

            {/* Badge 4: Manage Medicines (Middle Right) */}
            <button
              onClick={() => onNavigate('/medicines')}
              className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-10 px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md flex items-center space-x-2 transform hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                <Pill className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-none">Manage Medicines</span>
                <span className="text-[9px] text-slate-500 font-bold">Dose Alerts</span>
              </div>
            </button>

            {/* Badge 5: QR Passport (Bottom Left) */}
            <button
              onClick={onOpenQR}
              className="absolute -bottom-3 -left-2 sm:-left-4 px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md flex items-center space-x-2 transform hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-none">QR Passport</span>
                <span className="text-[9px] text-slate-500 font-bold">Secure Share</span>
              </div>
            </button>

            {/* Badge 6: Food Scan (Bottom Right) */}
            <button
              onClick={() => onNavigate('/food')}
              className="absolute -bottom-3 -right-2 sm:-right-4 px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md flex items-center space-x-2 transform hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/30">
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-none">Food & Rash Scan</span>
                <span className="text-[9px] text-slate-500 font-bold">Vision AI</span>
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* Feature Navigation Cards Section (All Project Features with Bright Aesthetics) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Health Copilot Navigation Hub</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </h2>
            <p className="text-xs text-slate-500 font-medium">Access all AI health management modules in one tap</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectFeatures.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.path)}
                className="app-card p-5 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl border ${feat.bgColor} transition-transform group-hover:scale-110`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {feat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center space-x-1">
                    <span>{feat.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-600" />
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    {feat.subtitle}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-bold text-blue-600">
                  <span>Open Feature</span>
                  <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Grid: Dynamic Vitals, Appointments & Health Score Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Upcoming Appointment */}
        <div className="app-card p-5 flex flex-col justify-between space-y-3 bg-white border border-slate-200 hover:border-blue-300 transition-all shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-slate-900">Upcoming Doctor</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop" 
              alt={upcomingAppt?.doctorName || "Dr. Priya Mehta"}
              className="w-11 h-11 rounded-full object-cover border-2 border-blue-500 shadow-xs" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop";
              }}
            />
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">{upcomingAppt?.doctorName || "Dr. Priya Mehta"}</h4>
              <p className="text-[11px] text-slate-500 font-medium">{upcomingAppt?.specialization || "General Physician"}</p>
              <p className="text-[10px] font-bold text-blue-600 mt-0.5">{upcomingAppt ? `${upcomingAppt.date}, ${upcomingAppt.time}` : "Today, 4:00 PM"}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/appointments')}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>View Appointment</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Active Medication Reminders */}
        <div className="app-card p-5 flex flex-col justify-between space-y-3 bg-white border border-slate-200 hover:border-amber-300 transition-all shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Pill className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-slate-900">Medication Reminders</span>
            </div>
            <button 
              onClick={() => onNavigate('/medicines')}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="py-1">
            <div className="text-xl font-black text-slate-900">2 doses due today</div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Next: Vitamin D (1 tab) at 8:00 AM</span>
            </p>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full w-2/3 rounded-full" />
          </div>
        </div>

        {/* Card 3: Health Records & FHIR Compliance */}
        <div className="app-card p-5 flex flex-col justify-between space-y-3 bg-white border border-slate-200 hover:border-teal-300 transition-all shadow-xs">
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
              View All
            </button>
          </div>

          <div className="py-1">
            <div className="text-xl font-black text-slate-900">12 lab reports</div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">CBC & Blood panel updated recently</p>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-xl border border-teal-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>FHIR Compliant Standards</span>
          </div>
        </div>

        {/* Card 4: Health Score Circular Gauge */}
        <div className="app-card p-5 flex flex-col justify-between space-y-3 bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-slate-900">Health Index</span>
            </div>
            <button 
              onClick={() => onNavigate('/history')}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              Details
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
              <p className="text-[10px] text-slate-500 font-medium mt-1">Optimal vitals state</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+4 points improvement</span>
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Health Records | Bright Heartbeat Vitals Graphic | Health Passport QR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Recent Health Records */}
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
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100 cursor-pointer"
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
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100 cursor-pointer"
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
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100 cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Vitals Trend featuring Bright Heartbeat Graphic */}
        <div className="app-card p-5 bg-white border border-slate-200 space-y-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Vitals Telemetry</h3>
            
            {/* Filter pills */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              {(['7D', '1M', '3M'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedVitalsFilter(f)}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    selectedVitalsFilter === f ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Bright Heartbeat Image Portrait Header */}
          <div className="relative h-28 rounded-2xl overflow-hidden border border-cyan-100 shadow-xs">
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop" 
              alt="Heartbeat Pulse Telemetry" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent flex items-end p-3">
              <div className="flex items-center justify-between w-full text-xs font-black text-slate-900">
                <span className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Heart Rate: {vitalsData.avgBpm} BPM (Stable)</span>
                </span>
                <span className="text-[10px] text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  {vitalsData.status}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Multi-Line Chart */}
          <div className="relative w-full h-24 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
              <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* Heart Rate Line (Blue) */}
              <path 
                d={vitalsData.hrPath} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Blood Pressure Line (Emerald) */}
              <path 
                d={vitalsData.bpPath} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
            </svg>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-1">
              {vitalsData.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Health Passport QR Code Token Card */}
        <div className="app-card p-5 bg-white border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs">
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
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
              <QRCodeSVG 
                value={`${window.location.origin}/#/passport-view?patient=${encodeURIComponent(profile?.name || 'Akhil Sharma')}`}
                size={110}
                level="H"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">SECURE DOCTOR QR TOKEN</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenQR}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share QR Token</span>
            </button>
            <button 
              onClick={() => onNavigate('/qr-passport')}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              title="Open Patient Health Passport"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
