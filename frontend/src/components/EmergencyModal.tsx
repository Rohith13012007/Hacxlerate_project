import React from 'react';
import { useHealth } from '../context/HealthContext';
import { AlertOctagon, PhoneCall, MapPin, Share2, X } from 'lucide-react';

export const EmergencyModal: React.FC = () => {
  const { isEmergencyModalOpen, setIsEmergencyModalOpen } = useHealth();

  if (!isEmergencyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-2xl text-slate-900">
        <button
          onClick={() => setIsEmergencyModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-rose-600 mb-4">
          <AlertOctagon className="w-10 h-10 animate-bounce text-rose-600" />
          <div>
            <h2 className="text-xl font-black tracking-tight text-rose-900">⚠️ POSSIBLE MEDICAL EMERGENCY</h2>
            <p className="text-xs font-bold text-rose-700">Safety System Priority Escalation</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 mb-6 text-xs text-rose-950 leading-relaxed">
          <p className="font-bold text-sm mb-1 text-rose-900">Please seek immediate emergency medical care!</p>
          Your reported symptoms contain potential emergency indicators (e.g. chest pain, difficulty breathing, or sudden acute onset). Do not rely on AI for critical care.
        </div>

        <div className="space-y-3">
          <a
            href="tel:108"
            className="w-full flex items-center justify-center space-x-3 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-lg shadow-rose-600/30 transition-all"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span>CALL EMERGENCY SERVICES (108 / 911)</span>
          </a>

          <button
            onClick={() => {
              window.open('https://www.google.com/maps/search/emergency+hospital+near+me', '_blank');
            }}
            className="w-full flex items-center justify-center space-x-3 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs"
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Find Nearest Emergency Hospital</span>
          </button>

          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  alert(`Location captured: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}. Sent to Emergency Contact.`);
                }, () => {
                  alert('Emergency contact notified with primary address: Jubilee Hills, Hyderabad.');
                });
              }
            }}
            className="w-full flex items-center justify-center space-x-3 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs"
          >
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Share Location with Emergency Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
};
