import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { Settings as SettingsIcon, CheckCircle2, Key, Cpu, ShieldCheck } from 'lucide-react';
import { getGroqApiKey, setStoredGroqApiKey } from '../services/groqService';

export const Settings: React.FC = () => {
  const { profile, setProfile } = useHealth();
  const [activeTab, setActiveTab] = useState<string>('Profile');
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState('rohith@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [gender, setGender] = useState(profile.gender);
  const [groqKey, setGroqKey] = useState(getGroqApiKey());
  const [saved, setSaved] = useState(false);

  const tabs = ['Profile', 'AI Model & Groq API', 'Preferences', 'Notifications', 'Privacy & Security'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...profile, name, gender });
    if (groqKey) {
      setStoredGroqApiKey(groqKey);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner />

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <span>Settings</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage your profile details, Groq API key, and app preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="app-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
            {saved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Saved Successfully!</span>
              </span>
            )}
          </div>

          {/* User Photo edit */}
          <div className="flex items-center space-x-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop"
              alt="Profile photo"
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
            />
            <button
              type="button"
              onClick={() => alert('Photo updated!')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 font-bold text-xs border border-slate-200 cursor-pointer"
            >
              Change Photo
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-600 font-bold block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groq API Key Configuration Card */}
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Groq API Key & High-Speed AI Engine</h2>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-blue-700 font-extrabold">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Groq API Integration Status</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Your Groq API key powers real-time dynamic LLM responses (<code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">llama-3.3-70b-versatile</code>) and vision scan analysis (<code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">llama-3.2-11b-vision-preview</code>).
              It is automatically loaded from your project <code className="bg-slate-200 px-1 rounded text-slate-800">.env</code> file (<code className="bg-slate-200 px-1 rounded text-slate-800">VITE_GROQ_API_KEY</code> / <code className="bg-slate-200 px-1 rounded text-slate-800">GROQ_API_KEY</code>).
            </p>
          </div>

          <div className="text-xs space-y-1.5">
            <label className="text-slate-700 font-bold block">Groq API Key (starts with gsk_)</label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-600"
            />
            <p className="text-[11px] text-slate-400">
              Don't have a key? Get your free API key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">console.groq.com/keys</a>
            </p>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fallback Dynamic Engine: ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Save Changes button */}
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer"
        >
          Save All Settings
        </button>
      </form>
    </div>
  );
};

