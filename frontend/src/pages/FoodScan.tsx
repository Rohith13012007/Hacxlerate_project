import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { Utensils, Camera, Upload, RefreshCw, Flame, CheckCircle2, X, Aperture } from 'lucide-react';

export const FoodScan: React.FC = () => {
  const { profile, addFoodScanResult, foodScans } = useHealth();
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentResult, setCurrentResult] = useState<any | null>(foodScans[0] || {
    foodName: 'Grilled Chicken Salad with Quinoa & Veggies',
    estimatedNutrition: {
      calories: 380,
      carbsGrams: 32,
      proteinGrams: 28,
      fatGrams: 14,
      fiberGrams: 7
    },
    personalizedSuitability: 'Suitable' as const,
    personalizedNotes: `High in lean protein and fiber. Excellent nutritional balance matching your ${profile.dietPreference} profile guidelines.`,
    timestamp: 'Dec 9, 2024'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
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
      console.warn('Food webcam stream unavailable:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureFoodPhoto = () => {
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
        handleScanSample(capturedDataUrl);
        return;
      }
    }
    
    // Fallback capture
    const fallbackFood = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop';
    setSelectedImage(fallbackFood);
    stopCamera();
    handleScanSample(fallbackFood);
  };

  const handleScanSample = (_imgUrl?: string) => {
    setAnalyzing(true);
    setTimeout(() => {
      const scanData = {
        foodName: 'Brown Rice + Turmeric Dal + Palak Paneer',
        estimatedNutrition: {
          calories: 450,
          carbsGrams: 62,
          proteinGrams: 18,
          fatGrams: 12,
          fiberGrams: 9
        },
        personalizedSuitability: 'Suitable' as const,
        personalizedNotes: `High in fiber and plant protein. Aligns with your ${profile.dietPreference} preference. Low glycemic index brown rice helps maintain steady energy.`,
        timestamp: new Date().toLocaleDateString()
      };
      setCurrentResult(scanData);
      addFoodScanResult(scanData);
      setAnalyzing(false);
    }, 1500);
  };

  const recentFoodScansList = [
    { title: 'Grilled Chicken Salad', date: 'Dec 9, 2024', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop' },
    { title: 'Banana', date: 'Dec 8, 2024', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop' },
    { title: 'Rice and Dal', date: 'Dec 5, 2024', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner customMessage="Nutritional scans provide estimates. Dietary recommendations should be confirmed with your doctor or dietitian." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Utensils className="w-6 h-6 text-rose-500" />
            <span>Scan Food & Get Nutrition</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Take a photo or upload an image to get nutritional information.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                stopCamera();
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setSelectedImage(ev.target?.result as string);
                  handleScanSample(ev.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => {
              stopCamera();
              fileInputRef.current?.click();
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 border border-slate-200 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={startCamera}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Use Camera</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Food Photo & Analyze Button */}
        <div className="lg:col-span-1 space-y-4">
          <div className="app-card p-4 space-y-3 flex flex-col items-center">
            {isCameraActive ? (
              <div className="relative w-full h-72 rounded-xl overflow-hidden bg-slate-950 border-2 border-rose-500 flex flex-col items-center justify-center">
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
                <div className="absolute inset-8 border-2 border-rose-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-10 h-10 border-t-2 border-l-2 border-rose-400 absolute top-0 left-0" />
                  <div className="w-10 h-10 border-t-2 border-r-2 border-rose-400 absolute top-0 right-0" />
                  <div className="w-10 h-10 border-b-2 border-l-2 border-rose-400 absolute bottom-0 left-0" />
                  <div className="w-10 h-10 border-b-2 border-r-2 border-rose-400 absolute bottom-0 right-0" />
                </div>

                {/* Top Badge */}
                <div className="absolute top-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-white font-bold flex items-center justify-between border border-slate-700">
                  <span className="flex items-center space-x-1 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>FOOD VISION CAMERA ACTIVE</span>
                  </span>
                  <button onClick={stopCamera} className="p-1 rounded-full hover:bg-slate-700 text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Capture Button */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center">
                  <button
                    onClick={captureFoodPhoto}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center space-x-2 shadow-xl shadow-rose-600/40 border border-rose-400 transform hover:scale-[1.03] transition-all cursor-pointer"
                  >
                    <Aperture className="w-4 h-4 animate-spin" />
                    <span>Snap & Analyze Nutrition</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-200">
                <img src={selectedImage} alt="Food scan" className="w-full h-full object-cover" />
                {analyzing && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-800">Extracting Nutrition AI...</span>
                  </div>
                )}
              </div>
            )}

            {!isCameraActive && (
              <button
                onClick={() => handleScanSample()}
                disabled={analyzing}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Analyze Food
              </button>
            )}
          </div>
        </div>

        {/* Nutrition Output Panel */}
        <div className="lg:col-span-2 space-y-4">
          {currentResult && (
            <div className="space-y-4">
              <div className="app-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{currentResult.foodName}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Identified via Vision AI</p>
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {currentResult.personalizedSuitability} for Profile
                  </span>
                </div>

                {/* Macro metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <div className="text-base font-black text-slate-900">{currentResult.estimatedNutrition.calories}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Calories (kcal)</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-base font-black text-slate-900">{currentResult.estimatedNutrition.carbsGrams}g</div>
                    <div className="text-[10px] text-slate-500 font-medium">Carbs</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-base font-black text-slate-900">{currentResult.estimatedNutrition.proteinGrams}g</div>
                    <div className="text-[10px] text-slate-500 font-medium">Protein</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-base font-black text-slate-900">{currentResult.estimatedNutrition.fatGrams}g</div>
                    <div className="text-[10px] text-slate-500 font-medium">Fats</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center col-span-2 sm:col-span-1">
                    <div className="text-base font-black text-slate-900">{currentResult.estimatedNutrition.fiberGrams}g</div>
                    <div className="text-[10px] text-slate-500 font-medium">Fiber</div>
                  </div>
                </div>

                {/* Guidance */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1 text-xs">
                  <span className="font-bold text-blue-900 block flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Personalized Health Guidance</span>
                  </span>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {currentResult.personalizedNotes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Food Scans Gallery (Matching Panel 5 of Image 1) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Food Scans</h3>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View All →</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentFoodScansList.map((food, idx) => (
            <div key={idx} className="app-card p-3 flex items-center space-x-3 cursor-pointer hover:border-blue-400 transition-colors">
              <img src={food.image} alt={food.title} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{food.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{food.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
