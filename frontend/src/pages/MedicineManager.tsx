import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { Pill, Plus, Clock, Bell } from 'lucide-react';

export const MedicineManager: React.FC = () => {
  const { addMedicineSchedule } = useHealth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newFreq, setNewFreq] = useState('Once daily');

  const sampleMedicinesList = [
    { name: 'Paracetamol 500mg', instructions: '1 tablet • 2 times daily', time: '08:00 AM, 08:00 PM', active: true, color: 'text-rose-500 bg-rose-50' },
    { name: 'Metformin 500mg', instructions: '1 tablet • After breakfast', time: '08:00 AM', active: true, color: 'text-blue-500 bg-blue-50' },
    { name: 'Vitamin D3', instructions: '1 capsule • Once daily', time: '09:00 AM', active: true, color: 'text-amber-500 bg-amber-50' },
    { name: 'Omega 3', instructions: '1 capsule • Once daily', time: '09:00 AM', active: true, color: 'text-emerald-500 bg-emerald-50' },
  ];

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDosage) return;
    addMedicineSchedule({
      name: newName,
      dosage: newDosage,
      time: newTime,
      frequency: newFreq,
      durationDays: 14,
      startDate: new Date().toLocaleDateString(),
      instructions: 'Take with water after meal'
    });
    setNewName('');
    setNewDosage('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner customMessage="Medication reminders are scheduled based on prescription logs. Ensure alarms are verified." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Pill className="w-6 h-6 text-amber-500" />
            <span>My Medicines</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your medications and get reminders.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddMed} className="app-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Add Scheduled Medication</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <input
              type="text"
              placeholder="Medicine Name (e.g. Paracetamol)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
              required
            />
            <input
              type="text"
              placeholder="Dosage (e.g. 500mg)"
              value={newDosage}
              onChange={(e) => setNewDosage(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
              required
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
              required
            />
            <select
              value={newFreq}
              onChange={(e) => setNewFreq(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">
            Save Schedule
          </button>
        </form>
      )}

      {/* Medicines List matching Reference Screenshot Panel 7 */}
      <div className="space-y-3">
        {sampleMedicinesList.map((med, idx) => (
          <div key={idx} className="app-card p-4 flex items-center justify-between hover:border-blue-300 transition-colors">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${med.color}`}>
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">{med.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{med.instructions}</p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold mt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{med.time}</span>
                </div>
              </div>
            </div>

            {/* Toggle Switch matching Panel 7 */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={med.active} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Medicine Reminder Bottom Notification Card (Matching Panel 7) */}
      <div className="app-card p-5 bg-blue-50/70 border-blue-200 flex items-center space-x-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-600/20">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-blue-950">Medicine Reminder</h4>
          <p className="text-xs text-blue-800 font-medium mt-0.5">
            Get timely reminders and never miss a dose.
          </p>
        </div>
      </div>
    </div>
  );
};
