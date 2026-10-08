import React, { useState } from 'react';
import { SafetyBanner } from '../components/SafetyBanner';
import { History, Bot, Stethoscope, FileText, Pill, Camera } from 'lucide-react';

export const MedicalHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Timeline');

  const historyTabs = ['Timeline', 'Conditions', 'Reports', 'Prescriptions'];

  const timelineList = [
    {
      date: 'Dec 9, 2024',
      title: 'AI Consultation',
      desc: 'Headache symptoms discussed with Health Copilot',
      icon: Bot,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      date: 'Dec 2, 2024',
      title: 'Doctor Visit',
      desc: 'Dr. Priya Sharma (Dermatologist)',
      icon: Stethoscope,
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      date: 'Nov 20, 2024',
      title: 'Lab Report',
      desc: 'Blood test report uploaded',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      date: 'Nov 15, 2024',
      title: 'Medication Added',
      desc: 'Metformin 500mg',
      icon: Pill,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      date: 'Oct 20, 2024',
      title: 'Image Analysis',
      desc: 'Skin rash image analyzed',
      icon: Camera,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner customMessage="Unified healthcare timeline compiling doctor visits, prescriptions, reports, and AI interactions." />

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <History className="w-6 h-6 text-blue-600" />
          <span>Medical History</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Your complete health journey in one place.
        </p>
      </div>

      {/* Filter Tabs matching Panel 10 */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl w-fit overflow-x-auto">
        {historyTabs.map(tab => (
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

      {/* Timeline List matching Panel 10 */}
      <div className="space-y-3">
        {timelineList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="app-card p-4 flex items-center justify-between hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-slate-400 w-24 flex-shrink-0">{item.date}</span>
                
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.desc}</p>
                </div>
              </div>

              <button
                onClick={() => alert(`Details for ${item.title} on ${item.date}`)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View Details
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
