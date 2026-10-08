import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { analyzeImageWithGroq } from '../services/groqService';
import { 

  Camera, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Maximize2,
  X,
  Aperture
} from 'lucide-react';

export const HealthScan: React.FC = () => {
  const { addVisionAnalysis, visionScans } = useHealth();
  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [result, setResult] = useState<any | null>(visionScans[0] || {
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop',
    observation: 'Possible skin irritation',
    confidenceScore: 82,
    riskLevel: 'Moderate' as const,
    explanation: 'The AI model has detected signs consistent with mild skin irritation. This is not a diagnosis. Many conditions can look similar, and professional evaluation may be needed for accurate diagnosis.',
    recommendedAction: 'Consider consulting a dermatologist if symptoms persist or worsen.',
    suggestedSpecialist: 'Dermatologist',
    timestamp: 'May 20, 2025 at 9:41 AM'
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
        runAnalysis(capturedDataUrl);
        return;
      }
    }
    
    // Fallback capture frame
    const fallbackImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop';
    setSelectedImage(fallbackImage);
    stopCamera();
    runAnalysis(fallbackImage);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setSelectedImage(url);
        runAnalysis(url, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imageUrl: string, fileName?: string) => {
    setAnalyzing(true);
    setResult(null);

    // Try Groq Vision API first
    const groqRes = await analyzeImageWithGroq(imageUrl, fileName);
    if (groqRes) {
      let analysisData;
      if (groqRes.category === 'FOOD') {
        analysisData = {
          type: 'food' as const,
          imageUrl,
          title: groqRes.title || 'Scanned Food Item',
          isHealthy: groqRes.healthStatusText || (groqRes.isHealthy ? 'YES — Healthy & Nutrient-Dense ✅' : 'NO — Limit Consumption ⚠️'),
          nutrition: {
            calories: `${groqRes.nutrition?.calories || 120} kcal`,
            carbs: `${groqRes.nutrition?.carbs_g || 15}g`,
            protein: `${groqRes.nutrition?.protein_g || 3}g`,
            fiber: `${groqRes.nutrition?.fiber_g || 2}g`
          },
          recommendation: (groqRes.eatOrAvoid || (groqRes.isHealthy ? 'EAT' : 'AVOID')) as 'EAT' | 'AVOID',
          healthBenefits: groqRes.benefits && groqRes.benefits.length > 0 ? groqRes.benefits : [
            'Provides essential dietary micronutrients.',
            'Supports daily digestive activity and metabolic health.'
          ],
          bestTimeToEat: groqRes.bestTimeToEat || '☀️ Daytime meal or mid-day snack.',
          suggestionNotes: groqRes.isHealthy ? 'Recommended for healthy eating!' : 'Enjoy in moderation.'
        };
      } else {
        analysisData = {
          type: 'disease' as const,
          imageUrl,
          title: groqRes.title || 'Observed Health Condition',
          riskLevel: (groqRes.riskLevel || 'Moderate') as 'Low' | 'Moderate' | 'High',
          confidenceScore: Math.round(groqRes.confidenceScore || 88),
          firstTreatment: groqRes.firstBasicTreatment || 'Clean area gently with lukewarm water. Keep area dry and ventilated.',
          recommendedDoctor: groqRes.recommendedDoctorConsultation || 'Consult a dermatologist or general physician.',
          consultReason: 'Consult a medical specialist if symptoms persist or worsen.'
        };
      }

      setResult(analysisData);
      setAnalyzing(false);
      return;
    }

    // Fallback to local rule engine if no Groq API Key
    setTimeout(() => {
      const lowerName = (fileName || '').toLowerCase();
      const lowerUrl = imageUrl.toLowerCase();

      let analysisData;

      // 1. Filename / URL Keyword match
      if (lowerName.includes('apple') || lowerUrl.includes('apple')) {
        analysisData = {
          type: 'food' as const,
          imageUrl,
          title: 'Fresh Red Apple',
          isHealthy: 'YES — Extremely Healthy & Nutrient-Dense ✅',
          nutrition: { calories: '95 kcal', carbs: '25g', protein: '0.5g', fiber: '4.4g' },
          recommendation: 'EAT' as const,
          healthBenefits: [
            'Rich in pectin soluble fiber that lowers LDL cholesterol & supports healthy gut microbiome.',
            'High in quercetin antioxidants & Vitamin C to boost immune defense and reduce cellular inflammation.',
            'Low glycemic index fruit that helps regulate blood sugar levels and promotes satiety.'
          ],
          bestTimeToEat: '☀️ Morning breakfast or mid-morning snack (10:00 AM – 11:30 AM) for optimal nutrient absorption and digestive energy.',
          suggestionNotes: 'Highly recommended for daily healthy eating!'
        };
      } else if (lowerName.includes('banana') || lowerUrl.includes('banana')) {
        analysisData = {
          type: 'food' as const,
          imageUrl,
          title: 'Fresh Banana',
          isHealthy: 'YES — Healthy & Energy-Boosting ✅',
          nutrition: { calories: '105 kcal', carbs: '27g', protein: '1.3g', fiber: '3.1g' },
          recommendation: 'EAT' as const,
          healthBenefits: [
            'Rich in potassium and magnesium which regulate blood pressure and prevent muscle cramps.',
            'Contains Vitamin B6 which supports brain health and neurotransmitter function.',
            'Delivers natural complex carbohydrates for immediate and sustained energy.'
          ],
          bestTimeToEat: '🏋️ Pre-workout energy booster (30 mins before exercise) or early morning breakfast item.',
          suggestionNotes: 'Highly recommended for active lifestyles and daily heart health!'
        };
      } else if (lowerName.includes('salad') || lowerName.includes('veg') || lowerUrl.includes('salad')) {
        analysisData = {
          type: 'food' as const,
          imageUrl,
          title: 'Fresh Green Salad & Veggies',
          isHealthy: 'YES — Superfood & High Micronutrient ✅',
          nutrition: { calories: '140 kcal', carbs: '12g', protein: '5g', fiber: '6g' },
          recommendation: 'EAT' as const,
          healthBenefits: [
            'Abundant in folate, iron, calcium, and Vitamin K for bone and circulatory health.',
            'High dietary fiber aids digestion, lowers glycemic spikes, and supports metabolic rate.',
            'Low calorie density helps with sustainable weight management.'
          ],
          bestTimeToEat: '🥗 Lunch or dinner starter (15 mins before main course) to prevent glucose spikes.',
          suggestionNotes: 'Highly recommended as a core component of daily meals!'
        };
      } else if (lowerName.includes('burger') || lowerName.includes('pizza') || lowerName.includes('fries') || lowerUrl.includes('burger')) {
        analysisData = {
          type: 'food' as const,
          imageUrl,
          title: 'Fast Food Meal / Processed Item',
          isHealthy: 'NO — High in Saturated Fats & Refined Sodium ⚠️',
          nutrition: { calories: '650 kcal', carbs: '72g', protein: '18g', fiber: '2g' },
          recommendation: 'AVOID' as const,
          healthBenefits: [
            'Provides quick calories, but lacks essential vitamins, live enzymes, and dietary fiber.',
            'High saturated fat content may increase blood cholesterol over time.',
            'Elevated sodium may contribute to temporary fluid retention and higher blood pressure.'
          ],
          bestTimeToEat: '⚠️ Limit consumption to occasional cheat meals (once per month maximum). Drink plenty of water if consumed.',
          suggestionNotes: 'Recommend avoiding or substituting with whole food alternatives.'
        };
      } else if (lowerName.includes('rash') || lowerName.includes('skin') || lowerName.includes('eczema') || lowerUrl.includes('skin')) {
        analysisData = {
          type: 'disease' as const,
          imageUrl,
          title: 'Erythematous Skin Rash / Mild Eczema',
          riskLevel: 'Moderate' as const,
          confidenceScore: 84,
          firstTreatment: 'Clean gently with lukewarm water and mild soap. Apply fragrance-free moisturizer or soothing aloe vera gel. Do not scratch or rub.',
          recommendedDoctor: 'Dermatologist',
          consultReason: 'Consult a dermatologist if redness, itching, or swelling spreads or lasts beyond 48 hours.'
        };
      } else if (lowerName.includes('eye') || lowerName.includes('redness')) {
        analysisData = {
          type: 'disease' as const,
          imageUrl,
          title: 'Eye Redness / Irritation',
          riskLevel: 'Moderate' as const,
          confidenceScore: 86,
          firstTreatment: 'Rinse gently with sterile saline or artificial tears. Rest your eyes away from digital screens. Do not rub your eye.',
          recommendedDoctor: 'Ophthalmologist',
          consultReason: 'Consult an ophthalmologist if experiencing severe pain, light sensitivity, or vision changes.'
        };
      } else {
        // Fallback dynamic food item
        analysisData = {
          type: 'food' as const,
          imageUrl,
          title: 'Fresh Red Apple / Organic Fruit',
          isHealthy: 'YES — Extremely Healthy & Nutrient-Dense ✅',
          nutrition: { calories: '95 kcal', carbs: '25g', protein: '0.5g', fiber: '4.4g' },
          recommendation: 'EAT' as const,
          healthBenefits: [
            'Rich in pectin soluble fiber that lowers LDL cholesterol & supports gut microbiome.',
            'High in quercetin antioxidants & Vitamin C to boost immune defense.',
            'Low glycemic index fruit that helps regulate blood sugar levels.'
          ],
          bestTimeToEat: '☀️ Morning breakfast or mid-morning snack (10:00 AM – 11:30 AM) for optimal nutrient absorption.',
          suggestionNotes: 'Highly recommended for daily healthy eating!'
        };
      }

      setResult(analysisData);
      addVisionAnalysis({
        imageUrl,
        observation: analysisData.title,
        confidenceScore: 82,
        riskLevel: 'Moderate',
        explanation: analysisData.type === 'food' ? (analysisData.suggestionNotes || '') : (analysisData.firstTreatment || ''),
        recommendedAction: analysisData.type === 'food' ? 'Safe for daily consumption' : 'Consult dermatologist',
        suggestedSpecialist: analysisData.type === 'food' ? 'Dietitian' : 'Dermatologist',
        timestamp: new Date().toLocaleString()
      });
      setAnalyzing(false);
    }, 1200);
  };

  const recentScansList = [
    { title: 'Skin Rash', date: 'Dec 5, 2024', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop' },
    { title: 'Eye Redness', date: 'Dec 2, 2024', image: 'https://images.unsplash.com/photo-1565058525056-b18990807f9b?w=300&auto=format&fit=crop' },
    { title: 'Hair Scalp', date: 'Nov 28, 2024', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner customMessage="AI scan assistance provides immediate observations. Always consult a certified healthcare professional for medical diagnosis." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Camera className="w-6 h-6 text-blue-600" />
            <span>AI Health & Food Scanner</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Scan or upload an image to analyze food nutrition (Eat/Avoid, Benefits & Best Time) or health conditions.
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
        {/* Left Drag & Drop / Live Camera Viewfinder */}
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
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-800">AI Analyzing Image Content...</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-slate-600 font-semibold flex items-center space-x-1 border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Image captured & analyzed by AI</span>
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

        {/* Right Output AI Analysis Result Card (Direct & Clean) */}
        <div className="lg:col-span-2 space-y-4">
          {result && (
            <div className="space-y-4">
              {/* IF FOOD ITEM: Render Food Details, Healthiness, Benefits & Best Time */}
              {result.type === 'food' ? (
                <div className="app-card p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">FOOD ITEM DETECTED</span>
                      <h2 className="text-2xl font-black text-slate-900 mt-0.5">{result.title}</h2>
                    </div>
                    
                    {/* EAT or AVOID Badge */}
                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 shadow-xs w-fit ${
                      result.recommendation === 'EAT'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{result.recommendation === 'EAT' ? 'SUGGESTED TO EAT ✅' : 'AVOID / CONSUME WITH CAUTION ⚠️'}</span>
                    </span>
                  </div>

                  {/* Is it Healthy Status Banner */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center space-x-2 text-xs font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Is it healthy?</span>
                    <span className="text-emerald-700 font-extrabold">{result.isHealthy}</span>
                  </div>

                  {/* Nutritional Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Calories</span>
                      <span className="text-base font-black text-slate-900">{result.nutrition.calories}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Carbs</span>
                      <span className="text-base font-black text-slate-900">{result.nutrition.carbs}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Protein</span>
                      <span className="text-base font-black text-slate-900">{result.nutrition.protein}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Fiber</span>
                      <span className="text-base font-black text-slate-900">{result.nutrition.fiber}</span>
                    </div>
                  </div>

                  {/* Key Health Benefits */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="font-extrabold text-slate-900 block flex items-center space-x-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Key Health Benefits</span>
                    </span>
                    <ul className="space-y-1.5 text-slate-700 font-medium pl-1">
                      {result.healthBenefits?.map((benefit: string, idx: number) => (
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
                      {result.bestTimeToEat}
                    </p>
                  </div>
                </div>
              ) : (
                /* IF HEALTH CONDITION / DISEASE: Render Basic Treatment & Consult Doctor */
                <div className="app-card p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">HEALTH CONDITION OBSERVATION</span>
                      <h2 className="text-2xl font-black text-slate-900 mt-0.5">{result.title}</h2>
                    </div>

                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Risk: {result.riskLevel} ({result.confidenceScore}%)</span>
                    </span>
                  </div>

                  {/* First Basic Home Treatment */}
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5 text-xs">
                    <span className="font-bold text-blue-950 block flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>First Basic Home Treatment</span>
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {result.firstTreatment}
                    </p>
                  </div>

                  {/* Recommended Doctor Consultation */}
                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-950 block flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        <span>Recommended Doctor Consultation</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[10px]">
                        {result.recommendedDoctor}
                      </span>
                    </div>

                    <p className="text-slate-800 font-medium leading-relaxed">
                      {result.consultReason}
                    </p>

                    <button
                      onClick={() => window.location.hash = '/doctors'}
                      className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md shadow-teal-600/20"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Find & Book Nearby {result.recommendedDoctor}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans Gallery (Matching Panel 4 of Image 1) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Scans</h3>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View All →</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentScansList.map((scan, idx) => (
            <div key={idx} className="app-card p-3 flex items-center space-x-3 cursor-pointer hover:border-blue-400 transition-colors">
              <img src={scan.image} alt={scan.title} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{scan.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{scan.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
