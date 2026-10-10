import React, { useState, useEffect, useRef } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { Settings as SettingsIcon, CheckCircle2, Key, Cpu, ShieldCheck, Camera, Upload, Trash2 } from 'lucide-react';
import { getGroqApiKey, setStoredGroqApiKey } from '../services/groqService';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23e2e8f0'/><circle cx='50' cy='40' r='20' fill='%2394a3b8'/><path d='M 18 88 C 18 68, 82 68, 82 88 Z' fill='%2394a3b8'/></svg>";

export const Settings: React.FC = () => {
  const { profile, setProfile, currentUser, setCurrentUser } = useHealth();
  const [activeTab, setActiveTab] = useState<string>('Profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(currentUser?.full_name || profile.name || '');
  const [email, setEmail] = useState(currentUser?.email || profile.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || profile.phone || '');
  const [age, setAge] = useState<number>(currentUser?.age || profile.age || 28);
  const [gender, setGender] = useState<string>(currentUser?.gender || profile.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState<string>(currentUser?.blood_group || profile.bloodGroup || 'B+');
  const [address, setAddress] = useState<string>(currentUser?.address || profile.address || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser?.avatarUrl || profile.avatarUrl || DEFAULT_AVATAR);

  const [groqKey, setGroqKey] = useState(getGroqApiKey());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentUser || profile) {
      setName(currentUser?.full_name || profile.name || '');
      setEmail(currentUser?.email || profile.email || '');
      setPhone(currentUser?.phone || profile.phone || '');
      setAge(currentUser?.age || profile.age || 28);
      setGender(currentUser?.gender || profile.gender || 'Male');
      setBloodGroup(currentUser?.blood_group || profile.bloodGroup || 'B+');
      setAddress(currentUser?.address || profile.address || '');
      setAvatarUrl(currentUser?.avatarUrl || profile.avatarUrl || DEFAULT_AVATAR);
    }
  }, [currentUser, profile]);

  const tabs = ['Profile', 'AI Model & Groq API', 'Preferences', 'Notifications', 'Privacy & Security'];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPhoto = () => {
    setAvatarUrl(DEFAULT_AVATAR);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      ...profile,
      name,
      email,
      phone,
      address,
      avatarUrl,
      age: Number(age) || 28,
      gender: gender as any,
      bloodGroup
    });
    if (currentUser && setCurrentUser) {
      const updatedUser = {
        ...currentUser,
        full_name: name,
        email,
        phone,
        address,
        avatarUrl,
        age: Number(age) || 28,
        gender,
        blood_group: bloodGroup
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('HEALTH_COPILOT_USER', JSON.stringify(updatedUser));
    }
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

          {/* User Photo Edit & Upload */}
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Profile photo"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md bg-slate-100"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                title="Upload Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 cursor-pointer flex items-center space-x-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New Photo</span>
                </button>

                {avatarUrl !== DEFAULT_AVATAR && (
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs border border-slate-200 cursor-pointer flex items-center space-x-1 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                JPG, PNG or GIF (Max 5MB limit). Click upload to choose from device.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-600 font-bold block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohith Kumar"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohith@gmail.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium font-mono"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                placeholder="28"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium font-mono"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-600 font-bold block mb-1">Street Address / Location</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Green Park, New Delhi, Delhi 110016"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
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

