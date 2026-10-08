import React, { useState, useRef } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { FileText, Upload, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';

export const MedicalReports: React.FC = () => {
  const { reports, addMedicalReport, setIsVoiceModalOpen } = useHealth();
  const [selectedReport] = useState(reports[0]);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        const newRep = {
          title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
          date: new Date().toLocaleDateString(),
          doctorName: 'Dr. Diagnostic AI',
          hospitalName: 'Central Health Labs',
          reportType: 'Uploaded Lab Document',
          fileName: file.name,
          values: [
            { parameter: 'Hemoglobin', result: '13.9', unit: 'g/dL', referenceRange: '13.0 - 17.0', isAbnormal: false },
            { parameter: 'Platelet Count', result: '220,000', unit: '/mcL', referenceRange: '150,000 - 450,000', isAbnormal: false },
            { parameter: 'Serum Creatinine', result: '0.9', unit: 'mg/dL', referenceRange: '0.7 - 1.3', isAbnormal: false },
            { parameter: 'Serum Vitamin D3', result: '22.0', unit: 'ng/mL', referenceRange: '30.0 - 100.0', isAbnormal: true, notes: 'Sub-optimal level' }
          ],
          aiSummary: `Extracted 4 parameters from ${file.name}. All key values are within reference range except Serum Vitamin D3.`
        };
        addMedicalReport(newRep);
        setUploading(false);
      }, 1500);
    }
  };

  const recentUploadedList = [
    { title: 'Blood Test Report', date: 'Dec 9, 2024', status: 'Analyzed', type: 'red' },
    { title: 'Prescription - Dr. Sharma', date: 'Dec 2, 2024', status: 'Saved', type: 'blue' },
    { title: 'X-Ray Report', date: 'Nov 20, 2024', status: 'Saved', type: 'purple' },
    { title: 'Diabetes Report', date: 'Nov 15, 2024', status: 'Analyzed', type: 'emerald' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner customMessage="The system extracts parameters via OCR. Single lab values must be evaluated in context by a physician." />

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <FileText className="w-6 h-6 text-purple-600" />
          <span>Upload Health Report</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Upload lab reports, prescriptions or medical documents.
        </p>
      </div>

      {/* Drag & Drop Upload Zone (Matching Reference Screenshot Panel 6) */}
      <div 
        onClick={() => fileRef.current?.click()}
        className="app-card p-10 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white flex flex-col items-center justify-center text-center cursor-pointer transition-colors space-y-3"
      >
        <input
          type="file"
          ref={fileRef}
          onChange={handleFileUpload}
          accept=".pdf,image/*"
          className="hidden"
        />
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Upload className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Drag & drop files here or <span className="text-blue-600 underline">click to browse</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 10 MB)</p>
        </div>
        {uploading && (
          <span className="text-xs font-bold text-blue-600 flex items-center space-x-1">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Processing OCR parameter extraction...</span>
          </span>
        )}
      </div>

      {/* Recently Uploaded Section matching Panel 6 */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recently Uploaded</h3>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View All →</span>
        </div>

        <div className="space-y-2">
          {recentUploadedList.map((item, idx) => (
            <div key={idx} className="app-card p-4 flex items-center justify-between hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  item.status === 'Analyzed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {item.status}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed OCR Analysis Card */}
      {selectedReport && (
        <div className="app-card p-6 space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{selectedReport.title}</h3>
              <p className="text-xs text-slate-500 font-medium">{selectedReport.doctorName} • {selectedReport.hospitalName}</p>
            </div>
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask AI About Report</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-xs font-bold text-purple-900 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI REPORT SUMMARY</span>
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">{selectedReport.aiSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
};
