import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { runReActVisionAgent } from '../services/reactVisionAgentService';
import type { ReActAgentResult } from '../services/reactVisionAgentService';
import { 
  Utensils, 
  Camera, 
  Upload, 
  RefreshCw, 
  Flame, 
  CheckCircle2, 
  X, 
  Aperture,
  ShieldCheck,
  Sparkles,
  Brain
} from 'lucide-react';

export const FoodScan: React.FC = () => {
  const { profile, addFoodScanResult } = useHealth();
  
  // Default selected image: Fresh Red Apple
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // ReAct Vision Output State
  const [agentResult, setAgentResult] = useState<ReActAgentResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Run ReAct Agent automatically on initial load for the selected image
    executeAgentScan(selectedImage, 'Fresh Red Apple');

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
      console.warn('Food camera stream unavailable:', err);
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
        executeAgentScan(capturedDataUrl, 'camera_snapshot.png');
        return;
      }
    }
    
    // Fallback capture
    const fallbackFood = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop';
    setSelectedImage(fallbackFood);
    stopCamera();
    executeAgentScan(fallbackFood, 'apple.jpg');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setSelectedImage(url);
        executeAgentScan(url, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // ReAct Automated Agent Execution Engine
  const executeAgentScan = async (imageUrl: string, fileNameHint?: string) => {
    setAnalyzing(true);
    setAgentResult(null);

    // Run ReAct Agent Service in strict FOOD mode
    const res = await runReActVisionAgent(imageUrl, fileNameHint, profile, 'food');
    
    setAgentResult(res);

    // Sync with Health Context for persistence
    if (res.type === 'food') {
      addFoodScanResult({
        foodName: res.title,
        estimatedNutrition: {
          calories: res.nutrition.calories,
          carbsGrams: res.nutrition.carbsGrams,
          proteinGrams: res.nutrition.proteinGrams,
          fatGrams: res.nutrition.fatGrams,
          fiberGrams: res.nutrition.fiberGrams
        },
        personalizedSuitability: res.recommendation === 'EAT' ? 'Suitable' : 'Caution',
        personalizedNotes: res.personalizedNotes,
        timestamp: new Date().toLocaleDateString()
      });
    }

    setAnalyzing(false);
  };

  const [customFoodHint, setCustomFoodHint] = useState<string>('');

  const recentFoodScansList = [
    { title: 'Fresh Crispy Puri & Chole', hint: 'puri chole', date: 'Just now', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop' },
    { title: 'Butterscotch Cream Cake', hint: 'cake butterscotch', date: 'Dec 9, 2024', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop' },
    { title: 'Fresh Red Apple', hint: 'apple', date: 'Dec 9, 2024', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop' },
    { title: 'Grilled Chicken Salad', hint: 'salad', date: 'Dec 8, 2024', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <SafetyBanner customMessage="ReAct AI Scanner provides real-time vision analysis. Always confirm health conditions with a qualified medical specialist." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Utensils className="w-6 h-6 text-rose-500" />
            <span>AI Food & Nutrition Scanner</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Automated AI vision agent analyzes food images to identify exact dish names, calories, carbs, proteins, fats, fiber & health impact.
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
        
        {/* Left Side: Camera / Image Viewfinder & ReAct Reasoning Execution Log */}
        <div className="lg:col-span-1 space-y-4">
          <div className="app-card p-4 space-y-3 flex flex-col items-center">
            {isCameraActive ? (
              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-slate-950 border-2 border-rose-500 flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Scanning animation laser */}
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
                    <span>REACT VISION CAMERA ACTIVE</span>
                  </span>
                  <button onClick={stopCamera} className="p-1 rounded-full hover:bg-slate-700 text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Snap Button */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center">
                  <button
                    onClick={captureFoodPhoto}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center space-x-2 shadow-xl shadow-rose-600/40 border border-rose-400 transform hover:scale-[1.03] transition-all cursor-pointer"
                  >
                    <Aperture className="w-4 h-4 animate-spin" />
                    <span>Snap & Auto Analyze</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-slate-200">
                <img src={selectedImage} alt="Scanned item" className="w-full h-full object-cover" />
                {analyzing && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 p-4 text-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-900">ReAct Automated Agent Reasoning...</span>
                    <span className="text-[10px] text-slate-500 font-medium">Analyzing food nutrition & ingredients</span>
                  </div>
                )}
              </div>
            )}

            {!isCameraActive && (
              <div className="w-full space-y-2">
                <button
                  onClick={() => executeAgentScan(selectedImage, customFoodHint || 'scanned_food_item')}
                  disabled={analyzing}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  <span>Analyze Food & Get Nutrition</span>
                </button>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={customFoodHint}
                    onChange={(e) => setCustomFoodHint(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        executeAgentScan(selectedImage, customFoodHint || 'scanned_food_item');
                      }
                    }}
                    placeholder="Optional: Enter dish name (e.g. Chocolate Cake, Biryani, Pizza)..."
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: ReAct Vision Agent Output Result Card */}
        <div className="lg:col-span-2 space-y-4">
          {agentResult && agentResult.type === 'food' && (
            <div className="space-y-4">
              <div className="app-card p-6 space-y-5 border-t-4 border-t-emerald-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">FOOD ITEM DETECTED</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                        {agentResult.foodCategory || 'Fruit'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">{agentResult.title}</h2>
                  </div>
                  
                  {/* EAT or AVOID Badge */}
                  <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 shadow-xs w-fit ${
                    agentResult.recommendation === 'EAT'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{agentResult.recommendation === 'EAT' ? 'SUGGESTED TO EAT ✅' : 'AVOID / LIMIT CONSUMPTION ⚠️'}</span>
                  </span>
                </div>

                {/* Is it Healthy Status */}
                <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 flex items-center space-x-2 text-xs font-bold text-emerald-950">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                  <span>Is it healthy?</span>
                  <span className="text-emerald-700 font-extrabold">{agentResult.isHealthy}</span>
                </div>

                {/* Macro Nutrition Metrics */}
                <div>
                  <span className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider">Macronutrient Breakdown</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      <div className="text-base font-black text-slate-900">{agentResult.nutrition.calories}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Calories (kcal)</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-base font-black text-slate-900">{agentResult.nutrition.carbsGrams}g</div>
                      <div className="text-[10px] text-slate-500 font-medium">Carbs</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-base font-black text-slate-900">{agentResult.nutrition.proteinGrams}g</div>
                      <div className="text-[10px] text-slate-500 font-medium">Protein</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-base font-black text-slate-900">{agentResult.nutrition.fatGrams}g</div>
                      <div className="text-[10px] text-slate-500 font-medium">Fats</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center col-span-2 sm:col-span-1">
                      <div className="text-base font-black text-slate-900">{agentResult.nutrition.fiberGrams}g</div>
                      <div className="text-[10px] text-slate-500 font-medium">Fiber</div>
                    </div>
                  </div>
                </div>

                {/* Key Health Benefits */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-extrabold text-slate-900 block flex items-center space-x-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Key Health Benefits & Metabolic Impact</span>
                  </span>
                  <ul className="space-y-1.5 text-slate-700 font-medium pl-1">
                    {agentResult.healthBenefits?.map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best Time to Eat */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1 text-xs">
                  <span className="font-bold text-blue-950 block flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>When is the Best Time to Eat?</span>
                  </span>
                  <p className="text-slate-800 font-semibold leading-relaxed">
                    {agentResult.bestTimeToEat}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Food & Vision Scans Gallery */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Scans</h3>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View All →</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {recentFoodScansList.map((food, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                setSelectedImage(food.image);
                executeAgentScan(food.image, food.hint);
              }}
              className="app-card p-3 flex items-center space-x-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <img src={food.image} alt={food.title} className="w-14 h-14 rounded-xl object-cover group-hover:scale-105 transition-transform" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{food.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{food.date}</p>
                <span className="text-[9px] text-blue-600 font-bold mt-1 inline-block">Click to analyze →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
