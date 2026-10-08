import React from 'react';
import { AlertOctagon, PhoneCall, MapPin, Share2 } from 'lucide-react';

export const Emergency: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="p-8 rounded-3xl bg-rose-50 border-2 border-rose-200 space-y-6 shadow-sm">
        <div className="flex items-center space-x-4 text-rose-600">
          <AlertOctagon className="w-12 h-12 animate-pulse" />
          <div>
            <h1 className="text-2xl font-black text-rose-900">EMERGENCY HEALTH ASSISTANCE</h1>
            <p className="text-xs font-bold text-rose-700">Immediate Medical Safety Escalation Protocol</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed max-w-2xl">
          If you or someone around you is experiencing severe chest pain, extreme difficulty breathing, loss of consciousness, uncontrolled bleeding, severe trauma, or signs of stroke — contact emergency medical services immediately.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <a
            href="tel:108"
            className="p-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex flex-col items-center justify-center space-y-2 shadow-lg shadow-rose-600/30 transition-all text-center"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>CALL 108 / 911 AMBULANCE</span>
          </a>

          <button
            onClick={() => {
              window.open('https://www.google.com/maps/search/emergency+hospital+near+me', '_blank');
            }}
            className="p-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex flex-col items-center justify-center space-y-2 border border-slate-200 text-center shadow-xs"
          >
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>FIND NEAREST ER HOSPITAL</span>
          </button>

          <button
            onClick={() => alert('GPS coordinates broadcast to Emergency Contact (Brother: +91 98765 43210).')}
            className="p-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex flex-col items-center justify-center space-y-2 border border-slate-200 text-center shadow-xs"
          >
            <Share2 className="w-6 h-6 text-indigo-600" />
            <span>SHARE LOCATION WITH CONTACT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
