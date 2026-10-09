import React, { useState } from 'react';
import { 
  Heart, 
  Play, 
  MessageSquare, 
  FileSearch, 
  MapPin, 
  QrCode, 
  X, 
  ArrowRight, 
  Stethoscope, 
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import './HomeLanding.css';

interface HomeLandingProps {
  onNavigate: (path: string) => void;
}

export const HomeLanding: React.FC<HomeLandingProps> = ({ onNavigate }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleNavigate = (path: string) => {
    onNavigate(path);
  };

  return (
    <div className="home-landing-root">
      <div className="home-landing-bg" />

      {/* =========================================================================
          TOP NAVBAR (Pixel-Perfect Matching PDF Page 1)
          ========================================================================= */}
      <header className="landing-navbar">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => handleNavigate('/')}>
          <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-sm">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">
            HealthCopilot
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="landing-nav-links">
          <button type="button" onClick={() => handleNavigate('/')} className="landing-nav-link active">
            Home
          </button>
          <a href="#features" className="landing-nav-link">
            Features
          </a>
          <button type="button" onClick={() => handleNavigate('/patient-login')} className="landing-nav-link">
            For Patients
          </button>
          <button type="button" onClick={() => handleNavigate('/doctor-login')} className="landing-nav-link">
            For Doctors
          </button>
          <a href="#about" onClick={() => setIsDemoModalOpen(true)} className="landing-nav-link">
            About
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="landing-login-btn cursor-pointer"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('/patient-login')}
            className="landing-get-started-btn cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION (Pixel-Perfect Matching PDF Page 1)
          ========================================================================= */}
      <main className="flex-1 flex flex-col justify-between">
        <section className="landing-hero-container">
          
          {/* Left Column: Bold Headline & Call to Action */}
          <div className="space-y-6 text-left">
            <div className="space-y-1">
              <h1 className="hero-title-main">
                Your Health.
                <br />
                Your History.
                <span className="hero-title-copilot">Your Copilot.</span>
              </h1>
            </div>

            <p className="text-slate-500 text-base sm:text-lg max-w-lg font-medium leading-relaxed">
              An AI-powered healthcare navigation and personal health management assistant for you and your family.
            </p>

            {/* Action Buttons */}
            <div className="hero-cta-group">
              <button
                type="button"
                onClick={() => handleNavigate('/patient-login')}
                className="landing-get-started-btn !px-7 !py-3.5 !text-base !rounded-xl cursor-pointer"
              >
                Get Started
              </button>

              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="hero-watch-demo-btn cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
                  <Play className="w-3.5 h-3.5 fill-slate-800 text-slate-800 ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Right Column: Doctor Portrait Graphic */}
          <div className="doctor-hero-wrapper">
            <div className="doctor-cloud-bg" />

            {/* Center Doctor Portrait Graphic */}
            <div className="doctor-portrait-container">
              <img
                src="/hero_doctor_art.png"
                alt="HealthCopilot Physician"
                className="doctor-portrait-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/doctor_hero_hd.jpg';
                }}
              />
            </div>
          </div>
        </section>

        {/* =========================================================================
            BOTTOM 4 FEATURE CARDS (Pixel-Perfect Matching PDF Page 1)
            ========================================================================= */}
        <section id="features" className="landing-features-grid">
          
          {/* Card 1: Talk to Health Copilot */}
          <div 
            onClick={() => handleNavigate('/patient-login')}
            className="feature-pill-card text-left cursor-pointer"
          >
            <div className="feature-card-icon-box bg-blue-100 text-blue-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Talk to Health Copilot
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Multi-language voice & chat
              </p>
            </div>
          </div>

          {/* Card 2: Scan & Understand */}
          <div 
            onClick={() => handleNavigate('/patient-login')}
            className="feature-pill-card text-left cursor-pointer"
          >
            <div className="feature-card-icon-box bg-emerald-100 text-emerald-600">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Scan & Understand
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Reports, prescriptions, food
              </p>
            </div>
          </div>

          {/* Card 3: Find Nearby Doctors */}
          <div 
            onClick={() => handleNavigate('/patient-login')}
            className="feature-pill-card text-left cursor-pointer"
          >
            <div className="feature-card-icon-box bg-sky-100 text-sky-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Find Nearby Doctors
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Book appointments easily
              </p>
            </div>
          </div>

          {/* Card 4: Health Passport */}
          <div 
            onClick={() => handleNavigate('/patient-login')}
            className="feature-pill-card text-left cursor-pointer"
          >
            <div className="feature-card-icon-box bg-teal-100 text-teal-600">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Health Passport
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Secure QR for doctor access
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        <p>© 2026 HealthCopilot • AI-Powered Personal Health Operating System</p>
      </footer>

      {/* =========================================================================
          INTERACTIVE LOGIN SELECTOR MODAL (When clicking "Login" in navbar)
          ========================================================================= */}
      {isLoginModalOpen && (
        <div className="landing-modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-left space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-white shadow-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-black text-slate-900 text-base">Select Your Portal</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Choose your account type to proceed with secure clinical or patient authentication.
            </p>

            <div className="space-y-3">
              {/* Option 1: Patient Portal (PDF Page 2, 3, 4) */}
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  handleNavigate('/patient-login');
                }}
                className="w-full p-4 rounded-2xl border-2 border-teal-500/30 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/80 transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm">
                    <Heart className="w-6 h-6 fill-white text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm group-hover:text-teal-900">
                      Patient Portal
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Mobile & OTP • ABHA ID • SOS Emergency
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-teal-600 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Option 2: Doctor Portal */}
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  handleNavigate('/doctor-login');
                }}
                className="w-full p-4 rounded-2xl border-2 border-sky-500/30 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50/80 transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm group-hover:text-sky-900">
                      Physician & Doctor Portal
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Doctor ID • Medical SmartKey RFID • NMC Verified
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-sky-600 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DEMO VIDEO WALKTHROUGH MODAL (When clicking "Watch Demo")
          ========================================================================= */}
      {isDemoModalOpen && (
        <div className="landing-modal-overlay" onClick={() => setIsDemoModalOpen(false)}>
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-left space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span className="font-black text-slate-900 text-base">HealthCopilot Overview</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 space-y-1">
                <p className="font-bold text-teal-900 text-sm">🌟 AI-Powered Personal Health Operating System</p>
                <p className="text-teal-800">
                  Built for seamless patient navigation, real-time vitals monitoring, QR-based emergency passports, and certified physician telemetry.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Instant OTP & ABHA ID National Health Record integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Multi-lingual AI Consultation (English, Hindi, Tamil, Telugu)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>NMC-certified Doctor Portal with sterile SmartKey RFID access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>HIPAA & ABDM End-to-End Encrypted Medical Records</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDemoModalOpen(false);
                  handleNavigate('/patient-login');
                }}
                className="landing-get-started-btn flex-1 text-center cursor-pointer"
              >
                Launch Patient Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDemoModalOpen(false);
                  handleNavigate('/doctor-login');
                }}
                className="landing-login-btn flex-1 text-center cursor-pointer"
              >
                Launch Doctor Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
