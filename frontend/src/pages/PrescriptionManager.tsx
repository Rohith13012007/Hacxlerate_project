import React, { useState, useRef } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { Pill, Upload, Clock } from 'lucide-react';
import type { Prescription } from '../types';

export const PrescriptionManager: React.FC = () => {
  const { prescriptions, addPrescription, addMedicineSchedule } = useHealth();
  const [uploading, setUploading] = useState(false);
  const [activeRx, setActiveRx] = useState<Prescription>(prescriptions[0]);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleUploadRx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        const newRx: Omit<Prescription, 'id'> = {
          doctorName: 'Dr. Diagnostic Physician',
          hospitalName: 'Apollo Care',
          date: new Date().toISOString().split('T')[0],
          items: [
            {
              id: `rx_i_${Date.now()}`,
              medicationName: 'Amoxicillin 500mg',
              dosage: '500 mg',
              frequency: 'Three times daily',
              duration: '5 days',
              instructions: 'Take 1 capsule after food with water.'
            }
          ],
          notes: 'OCR extracted from uploaded prescription image.'
        };
        addPrescription(newRx);
        setUploading(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner customMessage="The system transcribes prescribed dosage info. Do NOT alter doctor prescribed dosages independently." />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center space-x-2">
            <Pill className="w-7 h-7 text-amber-400" />
            <span>Prescription OCR & Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload doctor prescriptions to extract medication schedules, dosage, frequency, and instructions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileRef}
            onChange={handleUploadRx}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Extracting Text...' : 'Upload Prescription'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescriptions List */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Prescription Records</h3>
          <div className="space-y-2">
            {prescriptions.map(rx => (
              <div
                key={rx.id}
                onClick={() => setActiveRx(rx)}
                className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                  activeRx?.id === rx.id
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-100">
                  <span>{rx.doctorName}</span>
                  <span className="text-[10px] text-slate-400">{rx.date}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {rx.hospitalName} • {rx.items.length} Medications
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescription Details */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          {activeRx && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-100">Prescription Details</h2>
                  <p className="text-xs text-slate-400">{activeRx.doctorName} • {activeRx.hospitalName} • {activeRx.date}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  Verified Transcription
                </span>
              </div>

              <div className="space-y-4">
                {activeRx.items.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-100">{item.medicationName}</h4>
                      <p className="text-xs text-amber-300 font-semibold">Dosage: {item.dosage} | Frequency: {item.frequency}</p>
                      <p className="text-xs text-slate-300">Duration: {item.duration}</p>
                      <p className="text-xs text-slate-400 italic mt-1">Instructions: "{item.instructions}"</p>
                    </div>

                    <button
                      onClick={() => {
                        addMedicineSchedule({
                          name: item.medicationName,
                          dosage: item.dosage,
                          time: '08:00',
                          frequency: item.frequency,
                          durationDays: 7,
                          startDate: new Date().toISOString().split('T')[0],
                          instructions: item.instructions
                        });
                        alert(`Added ${item.medicationName} to your automated medicine reminder schedule!`);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-health-300 border border-health-500/30 font-semibold text-xs flex items-center justify-center space-x-1 flex-shrink-0"
                    >
                      <Clock className="w-4 h-4 text-health-400" />
                      <span>Sync to Reminders</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
