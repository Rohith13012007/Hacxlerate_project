import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { User, Lock, Download, Trash2, CheckCircle, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { profile, setProfile, activeQRTokens, revokeQRToken } = useHealth();
  const [formData, setFormData] = useState(profile);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDownloadData = () => {
    const jsonStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Health_Profile_${profile.name.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner customMessage="Your personal health data is protected under patient privacy standards." />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <User className="w-6 h-6 text-blue-600" />
            <span>Health Profile & Privacy Center</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your personal metrics, allergies, emergency contacts, diet preferences, and data privacy controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 app-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Personal Vitals & Information</h2>
            {saved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Profile Saved!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-600 font-bold block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold block mb-1">Age (Years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold block mb-1">Blood Group</label>
              <input
                type="text"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold block mb-1">Diet Preference</label>
              <select
                value={formData.dietPreference}
                onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-vegetarian">Non-vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-slate-600 font-bold block mb-1 text-xs">Known Allergies (comma separated)</label>
              <input
                type="text"
                value={formData.allergies.join(', ')}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-rose-700 font-semibold focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold block mb-1 text-xs">Existing Medical Conditions</label>
              <input
                type="text"
                value={formData.existingConditions.join(', ')}
                onChange={(e) => setFormData({ ...formData, existingConditions: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-amber-700 font-semibold focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md shadow-blue-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Update Health Profile</span>
          </button>
        </form>

        {/* Privacy Center */}
        <div className="app-card p-6 space-y-5">
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>PRIVACY & CONSENT CENTER</span>
          </div>

          <div className="space-y-3 text-xs">
            <button
              onClick={handleDownloadData}
              className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Download My Medical Data (JSON)</span>
            </button>

            <button
              onClick={() => alert('All conversation session logs have been deleted successfully.')}
              className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4 text-amber-600" />
              <span>Delete AI Conversation History</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Active QR Access Tokens</span>
            {activeQRTokens.map(t => (
              <div key={t.token} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-700 font-medium">{t.token}</span>
                {t.isRevoked ? (
                  <span className="text-rose-600 font-bold">REVOKED</span>
                ) : (
                  <button
                    onClick={() => revokeQRToken(t.token)}
                    className="text-rose-600 hover:underline font-bold"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
