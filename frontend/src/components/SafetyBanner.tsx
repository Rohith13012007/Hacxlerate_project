import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface SafetyBannerProps {
  customMessage?: string;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ customMessage }) => {
  return (
    <div className="w-full bg-teal-50/70 border border-teal-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-teal-900 mb-6 shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-teal-600/10 text-teal-700 border border-teal-200 flex-shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <p className="leading-tight text-teal-900 font-medium">
          <strong className="text-teal-950 font-bold">AI Safety Notice:</strong>{' '}
          {customMessage || 'Results are AI-assisted health observations. The system does not provide definitive medical diagnoses or replace a qualified doctor.'}
        </p>
      </div>
      <span className="hidden md:inline-flex items-center space-x-1 text-[10px] font-bold text-teal-700 bg-white px-2.5 py-1 rounded-full border border-teal-200 ml-3 flex-shrink-0 shadow-xs">
        <Info className="w-3 h-3 mr-1 text-teal-600" />
        Verified Protocol
      </span>
    </div>
  );
};
