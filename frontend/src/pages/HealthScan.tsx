import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { runReActVisionAgent } from '../services/reactVisionAgentService';
import type { ReActAgentResult } from '../services/reactVisionAgentService';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Maximize2,
  X,
  Aperture,
  HeartPulse,
  ArrowRight
} from 'lucide-react';

export const HealthScan: React.FC = () => {
  const { profile, addVisionAnalysis } = useHealth();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // ReAct Vision Agent Result
  const [agentResult, setAgentResult] = useState<ReActAgentResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (selectedImage) {
      executeAgentScan(selectedImage, 'skin_rash.jpg');
    }

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      }
    } catch (err: any) {
      console.warn('Webcam stream unavailable:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const capturedDataUrl = canvas.toDataURL('image/png');
        setSelectedImage(capturedDataUrl);
        stopCamera();
        executeAgentScan(capturedDataUrl, 'camera_capture.png');
        return;
      }
    }
    
    // Fallback capture frame
    const fallbackImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop';
    setSelectedImage(fallbackImage);
    stopCamera();
    executeAgentScan(fallbackImage, 'rash.jpg');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setSelectedImage(url);
        executeAgentScan(url, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeAgentScan = async (imageUrl: string, fileName?: string) => {
    setAnalyzing(true);
    setAgentResult(null);

    const res = await runReActVisionAgent(imageUrl, fileName, profile, 'disease');

    setAgentResult(res);

    if (res.type === 'disease') {
      addVisionAnalysis({
        imageUrl,
        observation: res.title,
        confidenceScore: res.confidenceScore,
        riskLevel: res.riskLevel,
        explanation: res.firstTreatment,
        recommendedAction: `Consult a ${res.recommendedDoctor}`,
        suggestedSpecialist: res.recommendedDoctor,
        timestamp: new Date().toLocaleString()
      });
    }

    setAnalyzing(false);
  };

  const recentScansList = [
    { title: 'Erythematous Skin Rash', hint: 'rash', date: 'Dec 5, 2024', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop' },
    { title: 'Eye Redness & Irritation', hint: 'eye', date: 'Dec 2, 2024', image: 'https://images.unsplash.com/photo-1565058525056-b18990807f9b?w=300&auto=format&fit=crop' },
    { title: 'Superficial Cut & Laceration', hint: 'wound cut', date: 'Dec 1, 2024', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&auto=format&fit=crop' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <SafetyBanner customMessage="AI scan assistance provides immediate observations. Always consult a certified healthcare professional for medical diagnosis." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Camera className="w-6 h-6 text-blue-600" />
            <span>AI Medical Health & Injury Scanner</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Automated AI vision agent analyzes skin conditions, rashes, cuts, burns, wounds, eye irritation & provides first-aid tips & doctor recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => {
              stopCamera();
              fileInputRef.current?.click();
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 border border-slate-200 cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={startCamera}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Use Camera</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Viewfinder & ReAct Reasoning Log */}
        <div className="lg:col-span-1 space-y-4">
          <div className="app-card p-4 space-y-3">
            {isCameraActive ? (
              <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-950 border-2 border-blue-500 flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Laser scan line overlay */}
                <div className="scan-laser-line" />

                {/* Target Reticle */}
                <div className="absolute inset-8 border-2 border-blue-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-12 h-12 border-t-2 border-l-2 border-blue-400 absolute top-0 left-0" />
                  <div className="w-12 h-12 border-t-2 border-r-2 border-blue-400 absolute top-0 right-0" />
                  <div className="w-12 h-12 border-b-2 border-l-2 border-blue-400 absolute bottom-0 left-0" />
                  <div className="w-12 h-12 border-b-2 border-r-2 border-blue-400 absolute bottom-0 right-0" />
                </div>

                {/* Top Badge */}
                <div className="absolute top-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-white font-bold flex items-center justify-between border border-slate-700">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>LIVE AI SCANNER ACTIVE</span>
                  </span>
                  <button onClick={stopCamera} className="p-1 rounded-full hover:bg-slate-700 text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Capture Button */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center">
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center space-x-2 shadow-xl shadow-blue-600/40 border border-blue-400 transform hover:scale-[1.03] transition-all cursor-pointer"
                  >
                    <Aperture className="w-4 h-4 animate-spin" />
                    <span>Snap & Auto Analyze</span>
                  </button>
                </div>
              </div>
            ) : selectedImage ? (
              <div className="relative w-full h-72 rounded-xl overflow-hidden border border-slate-200 group">
                <img src={selectedImage} alt="Captured scan" className="w-full h-full object-cover" />
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-700 shadow-md">
                  <Maximize2 className="w-4 h-4" />
                </button>
                {analyzing && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 p-4 text-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-900">ReAct Vision Agent Reasoning...</span>
                    <span className="text-[10px] text-slate-500 font-medium">Analyzing medical condition & risk assessment</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-slate-600 font-semibold flex items-center space-x-1 border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Image captured & analyzed by ReAct Agent</span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-72 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Drag & drop an image here or click to browse</h4>
                <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, WEBP (Max 10 MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Output ReAct Analysis Card */}
        <div className="lg:col-span-2 space-y-4">
          {agentResult && agentResult.type === 'disease' && (
            <div className="space-y-4">
              <div className="app-card p-6 space-y-5 border-t-4 border-t-rose-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">HEALTH CONDITION / INJURY DETECTED</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">{agentResult.title}</h2>
                  </div>

                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1 w-fit">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Risk: {agentResult.riskLevel} ({agentResult.confidenceScore}%)</span>
                  </span>
                </div>

                {/* First Basic Home Treatment */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5 text-xs">
                  <span className="font-bold text-blue-950 block flex items-center space-x-1.5 text-xs">
                    <HeartPulse className="w-4 h-4 text-blue-600" />
                    <span>First Basic Home Treatment & Self-Care Tips</span>
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {agentResult.firstTreatment}
                  </p>
                </div>

                {/* Recommended Doctor Consultation */}
                <div className="p-4.5 rounded-xl bg-teal-50 border border-teal-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-950 block flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span>Recommended Medical Specialist</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-teal-600 text-white font-extrabold text-xs shadow-xs">
                      {agentResult.recommendedDoctor}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed">
                    {agentResult.consultReason}
                  </p>

                  <button
                    onClick={() => window.location.hash = '/doctors'}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md shadow-teal-600/20 cursor-pointer transition-all transform hover:scale-[1.01]"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Find & Book Nearby {agentResult.recommendedDoctor}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans Gallery */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Health Scans</h3>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View All →</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentScansList.map((scan, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                setSelectedImage(scan.image);
                executeAgentScan(scan.image, scan.hint);
              }}
              className="app-card p-3 flex items-center space-x-3 cursor-pointer hover:border-blue-400 transition-colors group"
            >
              <img src={scan.image} alt={scan.title} className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{scan.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{scan.date}</p>
                <span className="text-[9px] text-blue-600 font-bold mt-1 inline-block">Click to analyze →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
