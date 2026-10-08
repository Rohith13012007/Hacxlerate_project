import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useHealth } from '../context/HealthContext';
import { QrCode, X, Share2, Download } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateDoctorPortal: (token: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, onNavigateDoctorPortal }) => {
  const { activeQRTokens } = useHealth();
  const [currentToken] = useState<string>(activeQRTokens[0]?.token || 'demo_token_8899');

  const [sharedFields, setSharedFields] = useState({
    basicInfo: true,
    medications: true,
    allergies: true,
    reports: true,
    consultations: true,
    conditions: true,
    emergency: true
  });

  if (!isOpen) return null;

  const doctorPortalUrl = `${window.location.origin}/doctor-access?token=${currentToken}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header matching Panel 11 */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Health Passport</h2>
            <p className="text-xs text-slate-500 font-medium">Securely share your health summary with trusted doctors.</p>
          </div>
        </div>

        {/* QR Canvas Box matching Panel 11 */}
        <div className="app-card p-6 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50">
          <span className="text-xs font-bold text-slate-700">Your Health QR Code</span>
          
          <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-blue-100">
            <QRCodeSVG
              value={doctorPortalUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <span className="text-[10px] font-mono text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
            Scan this code for your health summary
          </span>

          {/* Share & Download buttons */}
          <div className="grid grid-cols-2 gap-3 w-full pt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(doctorPortalUrl);
                alert('QR Access Link copied to clipboard!');
              }}
              className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={() => onNavigateDoctorPortal(currentToken)}
              className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Doctor Portal</span>
            </button>
          </div>
        </div>

        {/* What will be shared checklist matching Panel 11 */}
        <div className="pt-4 space-y-2 text-xs">
          <span className="font-bold text-slate-800 block">What will be shared?</span>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sharedFields.basicInfo}
                onChange={(e) => setSharedFields({ ...sharedFields, basicInfo: e.target.checked })}
                className="rounded bg-slate-100 text-blue-600 border-slate-300"
              />
              <span>Basic health information</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sharedFields.medications}
                onChange={(e) => setSharedFields({ ...sharedFields, medications: e.target.checked })}
                className="rounded bg-slate-100 text-blue-600 border-slate-300"
              />
              <span>Current medications</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sharedFields.allergies}
                onChange={(e) => setSharedFields({ ...sharedFields, allergies: e.target.checked })}
                className="rounded bg-slate-100 text-blue-600 border-slate-300"
              />
              <span>Allergies</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sharedFields.reports}
                onChange={(e) => setSharedFields({ ...sharedFields, reports: e.target.checked })}
                className="rounded bg-slate-100 text-blue-600 border-slate-300"
              />
              <span>Recent reports</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sharedFields.consultations}
                onChange={(e) => setSharedFields({ ...sharedFields, consultations: e.target.checked })}
                className="rounded bg-slate-100 text-blue-600 border-slate-300"
              />
              <span>Past consultations</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sharedFields.conditions}
                onChange={(e) => setSharedFields({ ...sharedFields, conditions: e.target.checked })}
                className="rounded bg-slate-100 text-blue-600 border-slate-300"
              />
              <span>Chronic conditions (if any)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
