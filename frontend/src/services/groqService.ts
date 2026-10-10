/**
 * Groq API Integration Service for AI Health Copilot
 * Uses ultra-fast Groq LLM & Vision models (llama-3.3-70b-versatile & llama-3.2-11b-vision-preview)
 */

export interface GroqVisionResponse {
  category: 'FOOD' | 'DISEASE_CONDITION';
  title: string;
  isHealthy?: boolean;
  healthStatusText?: string;
  benefits?: string[];
  bestTimeToEat?: string;
  eatOrAvoid?: 'EAT' | 'AVOID';
  riskLevel?: 'Low' | 'Moderate' | 'High';
  firstBasicTreatment?: string;
  recommendedDoctorConsultation?: string;
  confidenceScore?: number;
  nutrition?: {
    calories: number;
    carbs_g: number;
    protein_g: number;
    fat_g: number;
    fiber_g: number;
  };
  disclaimer: string;
}

export interface PatientSessionSummary {
  symptomsReported: string[];
  durationAndOnset: string;
  triageLevel: 'LOW CONCERN' | 'MODERATE CONCERN' | 'URGENT' | 'EMERGENCY';
  keyHighlights: string[];
  aiRecommendations: string[];
  recommendedSpecialist: string;
  summaryText: string;
}

export const getGroqApiKey = (): string => {
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  if (envKey && envKey !== 'gsk_your_groq_api_key_here' && envKey.trim().length > 5) {
    return envKey.trim();
  }
  const storedKey = localStorage.getItem('GROQ_API_KEY');
  if (storedKey && storedKey.trim().length > 5) {
    return storedKey.trim();
  }
  return '';
};

export const setStoredGroqApiKey = (key: string) => {
  if (key) {
    localStorage.setItem('GROQ_API_KEY', key.trim());
  } else {
    localStorage.removeItem('GROQ_API_KEY');
  }
};

/**
 * Detect language script from incoming user text
 */
export function detectLanguageFromText(text: string): 'en' | 'te' | 'hi' | 'ta' | 'kn' | null {
  if (!text || !text.trim()) return null;
  
  // 1. Native Unicode Script Checks (Highest Priority)
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu native script
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi native script
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil native script
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada native script

  const lower = text.toLowerCase().trim();

  // 2. Explicit Language Directives (e.g. "speak in telugu", "in hindi", "in english")
  if (/\b(in telugu|speak telugu|telugulo)\b/i.test(lower)) return 'te';
  if (/\b(in hindi|speak hindi|hindime)\b/i.test(lower)) return 'hi';
  if (/\b(in tamil|speak tamil|tamilil)\b/i.test(lower)) return 'ta';
  if (/\b(in kannada|speak kannada|kannadadalli)\b/i.test(lower)) return 'kn';
  if (/\b(in english|speak english)\b/i.test(lower)) return 'en';

  // 3. Distinct Transliterated / Phonetic Keywords (Unambiguous multi-character words)
  const teluguPatterns = [
    'namaskaram', 'cheppandi', 'cheppu', 'naaku', 'vundhi', 'bagaledu', 'baaledu', 
    'vaidyudu', 'thala noppi', 'subhodayam', 'danyavadalu', 'kadalaleni', 'taganiki', 
    'tagandi', 'gontu noppi', 'aakali', 'kadupu noppi', 'jwaram'
  ];
  if (teluguPatterns.some(pattern => new RegExp(`\\b${pattern}\\b`, 'i').test(lower))) {
    return 'te';
  }

  const hindiPatterns = [
    'namaste', 'batao', 'bukhar', 'sardard', 'raha hai', 'dawai', 'subhadin', 'shukriya', 'pate dard'
  ];
  if (hindiPatterns.some(pattern => new RegExp(`\\b${pattern}\\b`, 'i').test(lower))) {
    return 'hi';
  }

  const tamilPatterns = [
    'vanakkam', 'enakku', 'valikkudhu', 'marundhu', 'nandri'
  ];
  if (tamilPatterns.some(pattern => new RegExp(`\\b${pattern}\\b`, 'i').test(lower))) {
    return 'ta';
  }

  const kannadaPatterns = [
    'namaskara', 'nanage', 'dhanyavada', 'oushadha'
  ];
  if (kannadaPatterns.some(pattern => new RegExp(`\\b${pattern}\\b`, 'i').test(lower))) {
    return 'kn';
  }

  // 4. Do not return 'en' automatically for Latin characters so place names/numbers don't break language stickiness
  return null;
}

export interface PatientDbContext {
  name?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  allergies?: string | string[];
  conditions?: string | string[];
  currentMedicines?: string | string[];
  waterIntakeMl?: number;
  stepsCount?: number;
  recentReports?: string[];
}

/**
 * Send natural health prompt to Groq API (openai/gpt-oss-120b & qwen/qwen3.8-27b)
 */
export async function queryGroqChat(
  userText: string,
  language: string = 'en',
  history: { sender: 'user' | 'ai'; text: string }[] = [],
  patientContext?: PatientDbContext
): Promise<{ reply: string; urgency: 'LOW CONCERN' | 'MODERATE CONCERN' | 'URGENT' | 'EMERGENCY'; specialist?: string; detectedLanguage: string } | null> {
  const apiKey = getGroqApiKey();
  const explicitScriptLang = detectLanguageFromText(userText);
  const activeLang = explicitScriptLang ? explicitScriptLang : (language || 'en');

  if (!apiKey) return null;

  try {
    const languageNames: Record<string, string> = {
      en: 'English',
      te: 'Telugu (తెలుగు)',
      hi: 'Hindi (हिन्दी)',
      ta: 'Tamil (தமிழ்)',
      kn: 'Kannada (ಕನ್ನಡ)'
    };

    const targetLangName = languageNames[activeLang] || 'English';

    const patientSummaryStr = patientContext ? `
PATIENT DATABASE RECORDS:
- Name: ${patientContext.name || 'User'}, Age: ${patientContext.age || 28}, Gender: ${patientContext.gender || 'Male'}, Blood Group: ${patientContext.bloodGroup || 'B+'}
- Known Allergies: ${patientContext.allergies || 'None'}
- Medical Conditions: ${patientContext.conditions || 'None'}
- Active Medications: ${patientContext.currentMedicines || 'None'}
- Today's Water Intake: ${patientContext.waterIntakeMl || 0} mL
- Today's Activity Steps: ${patientContext.stepsCount || 0} steps
` : 'PATIENT DATABASE RECORDS: Standard User Profile';

    const systemPrompt = `You are the patient's trusted, highly experienced "Family Doctor & AI Medical Copilot" executing ReAct Architecture (Reasoning + Action).

${patientSummaryStr}

STRICT CONVERSATIONAL RULES (CRITICAL MANDATE - ZERO TOLERANCE FOR QUESTION LISTS):

1. ASK EXACTLY ONE QUESTION AT A TIME:
   - DO NOT EVER ask multiple questions in a single response turn!
   - NEVER generate numbered lists of questions (e.g. 1. How long? 2. Is it constant? 3. Where is it located? 4. Associated symptoms? 5. Have you taken meds? 6. Recent triggers?).
   - NEVER generate bullet points of questions.
   - Ask EXACTLY ONE simple, focused follow-up question related to the problem, so the patient can answer step-by-step.

2. DO NOT USE BOLD SECTION HEADERS OR SUBHEADINGS:
   - NEVER use section headers like "**Quick check-in**", "**Things to try right now**", "**When to seek medical care**", or "**Clinical Triage**".
   - Write clean, empathetic, natural paragraph text so it reads conversationally and sounds smooth when spoken aloud.

3. DO NOT RECOMMEND DOCTORS OR MAP LINKS AT THE VERY START:
   - For initial or mild symptom reports, DO NOT output doctor cards, contact info, or Google Maps links.
   - First, offer simple home care guidance (e.g. hydration, rest) and ask ONE clarifying question.
   - ONLY recommend nearby doctors with live Google Maps links if symptoms are severe/emergency (e.g. persistent >12h, high fever, severe pain, breathing difficulty, chest pain) OR if the user explicitly asks for a doctor recommendation.

4. CONCISENESS & SPEED MANDATE:
   - Keep responses short, brisk, and active (maximum 2-3 sentences), so reading aloud and voice turn handoff is hyper-fast and active.

5. CRITICAL LANGUAGE MANDATE:
   - Target Language: ${targetLangName} (${activeLang}).
   - YOU MUST WRITE YOUR ENTIRE RESPONSE FULLY IN ${targetLangName} SCRIPT (Telugu: తెలుగు, Hindi: हिन्दी, Tamil: தமிழ், Kannada: ಕನ್ನಡ, English: English).
   - REGARDLESS OF THE SCRIPT OR LANGUAGE OF THE PATIENT'S INPUT (even if the patient's message contains Latin text, English place names like 'Aurangabad', numbers, or short words), YOU MUST STILL REPLY 100% IN ${targetLangName}!
   - DO NOT SWITCH BACK TO ENGLISH UNLESS THE PATIENT EXPLICITLY STATES 'speak in english' OR SWITCHES THE MANUAL LANGUAGE SELECTOR TO ENGLISH.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(h => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      })),
      { role: 'user', content: userText }
    ];

    const modelsToTry = [
      'llama-3.3-70b-versatile',
      'llama3-8b-8192',
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b'
    ];

    let reply = '';
    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
            max_tokens: 350
          })
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content || '';
          if (reply.trim()) break;
        }
      } catch (err) {
        console.warn(`Groq model ${model} error:`, err);
      }
    }

    if (!reply) return null;

    // Infer urgency & specialist from response and text
    const lowered = (userText + ' ' + reply).toLowerCase();
    let urgency: 'LOW CONCERN' | 'MODERATE CONCERN' | 'URGENT' | 'EMERGENCY' = 'LOW CONCERN';
    if (lowered.includes('chest pain') || lowered.includes('difficulty breathing') || lowered.includes('emergency')) {
      urgency = 'EMERGENCY';
    } else if (lowered.includes('fever') || lowered.includes('severe') || lowered.includes('urgent')) {
      urgency = 'MODERATE CONCERN';
    }

    let specialist: string | undefined = undefined;
    if (lowered.includes('skin') || lowered.includes('rash') || lowered.includes('itch') || lowered.includes('dermatolog') || lowered.includes('eczema')) specialist = 'Dermatologist';
    else if (lowered.includes('eye') || lowered.includes('vision') || lowered.includes('ophthalmolog')) specialist = 'Ophthalmologist';
    else if (lowered.includes('heart') || lowered.includes('chest') || lowered.includes('cardiolog')) specialist = 'Cardiologist';
    else if (lowered.includes('headache') || lowered.includes('head') || lowered.includes('migraine') || lowered.includes('neurolog')) specialist = 'Neurologist';
    else if (lowered.includes('stomach') || lowered.includes('acid') || lowered.includes('digestion') || lowered.includes('gastro')) specialist = 'Gastroenterologist';
    else if (lowered.includes('tooth') || lowered.includes('teeth') || lowered.includes('dentist')) specialist = 'Dentist';
    else if (lowered.includes('fever') || lowered.includes('flu') || lowered.includes('cough') || lowered.includes('cold')) specialist = 'General Physician';

    return { reply, urgency, specialist, detectedLanguage: activeLang };
  } catch (err) {
    console.error('Groq Chat Exception:', err);
    return null;
  }
}

/**
 * Summarize complete patient consultation trajectory with Groq
 */
export async function analyzeAndSummarizePatientSession(
  messages: { sender: 'user' | 'ai'; text: string }[],
  _language: string = 'en'
): Promise<PatientSessionSummary> {
  const apiKey = getGroqApiKey();
  const conversationText = messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

  if (apiKey && messages.length > 0) {
    try {
      const prompt = `Analyze this complete patient healthcare conversation transcript:
---
${conversationText}
---

Extract key clinical findings, highlights, and recommendations for the patient's permanent medical record.
Respond strictly with a valid JSON object matching this schema without markdown block formatting:
{
  "symptomsReported": ["Symptom 1", "Symptom 2"],
  "durationAndOnset": "e.g., Ongoing for 2 days, mild-to-moderate severity",
  "triageLevel": "LOW CONCERN",
  "keyHighlights": ["Primary complaint: ...", "Patient reported ...", "AI Triage: ..."],
  "aiRecommendations": ["Stay hydrated", "Consult Neurologist / General Physician if symptoms worsen"],
  "recommendedSpecialist": "Neurologist / General Physician",
  "summaryText": "Concise 2-sentence clinical summary of patient conversation."
}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed: PatientSessionSummary = JSON.parse(cleanJson);
        return parsed;
      }
    } catch (e) {
      console.warn('Groq session analysis error:', e);
    }
  }

  // Local Dynamic Fallback Analyzer
  const userTexts = messages.filter(m => m.sender === 'user').map(m => m.text).join(' ');
  const lowered = userTexts.toLowerCase();
  
  const symptoms: string[] = [];
  if (lowered.includes('headache') || lowered.includes('head')) symptoms.push('Headache / Cranial Discomfort');
  if (lowered.includes('fever')) symptoms.push('Elevated Body Temperature');
  if (lowered.includes('pain')) symptoms.push('Localized Pain');
  if (lowered.includes('skin') || lowered.includes('rash')) symptoms.push('Skin Rash / Irritation');
  if (symptoms.length === 0) symptoms.push('General Health Inquiry');

  let duration = 'Reported symptoms over recent timeframe';
  if (lowered.includes('2 days') || lowered.includes('two days')) duration = 'Symptoms ongoing for 2 days';
  else if (lowered.includes('week')) duration = 'Symptoms present for over 1 week';

  let specialist = 'General Physician';
  if (lowered.includes('skin') || lowered.includes('rash')) specialist = 'Dermatologist';
  else if (lowered.includes('headache') || lowered.includes('head')) specialist = 'Neurologist / General Physician';

  return {
    symptomsReported: symptoms,
    durationAndOnset: duration,
    triageLevel: lowered.includes('chest') ? 'EMERGENCY' : lowered.includes('fever') || lowered.includes('severe') ? 'MODERATE CONCERN' : 'LOW CONCERN',
    keyHighlights: [
      `Primary Symptoms: ${symptoms.join(', ')}`,
      `Reported Duration: ${duration}`,
      `AI Assessment: Conversational triage completed with specialist guidance`
    ],
    aiRecommendations: [
      'Maintain adequate oral hydration and rested state.',
      `Schedule evaluation with a ${specialist} if symptoms persist or escalate.`,
      'Seek emergency hospital care immediately if red-flag signs develop.'
    ],
    recommendedSpecialist: specialist,
    summaryText: `Patient consulted regarding ${symptoms.join(', ')} (${duration}). AI Copilot provided interactive triage guidance and recommended evaluation with a ${specialist}.`
  };
}

/**
 * Helper to compress image data URLs or remote http/https URLs before sending to Groq Vision API
 */
export async function compressImageForVision(imageUrl: string, maxDim = 600): Promise<string> {
  if (!imageUrl) return '';

  try {
    let sourceDataUrl = imageUrl;

    // If HTTP/HTTPS URL, fetch as blob first to avoid CORS canvas taint issues
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      try {
        const resp = await fetch(imageUrl, { mode: 'cors' });
        if (resp.ok) {
          const blob = await resp.blob();
          sourceDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch (fetchErr) {
        console.warn('Fetch image blob warning:', fetchErr);
      }
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          let w = img.width || 600;
          let h = img.height || 600;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(sourceDataUrl);
          }
        } catch (e) {
          resolve(sourceDataUrl);
        }
      };
      img.onerror = () => resolve(sourceDataUrl);
      img.src = sourceDataUrl;
    });
  } catch (err) {
    return imageUrl;
  }
}

export async function analyzeImageWithGroq(
  imageDataUrl: string,
  _fileHint?: string,
  forcedCategory?: 'FOOD' | 'DISEASE_CONDITION'
): Promise<GroqVisionResponse | null> {
  const modeParam = forcedCategory === 'FOOD' ? 'food' : forcedCategory === 'DISEASE_CONDITION' ? 'disease' : 'auto';

  // 1. Primary Attempt: Call Backend Multimodal Vision LLM Service
  try {
    const backendRes = await fetch('http://localhost:8000/api/vision/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageDataUrl,
        mode: modeParam,
        hint: _fileHint || ''
      })
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.success && data.result && data.result.title) {
        const res: GroqVisionResponse = data.result;
        if (forcedCategory) {
          res.category = forcedCategory;
        }
        console.log(`Backend Vision LLM (${data.source || 'LLM'}) Analysis Success:`, res.title);
        return res;
      }
    }
  } catch (err) {
    console.warn('Backend Vision API endpoint unreachable, attempting browser Groq API fallback:', err);
  }

  // 2. Secondary Attempt: Direct Groq Vision API call from browser
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;

  try {
    const compressedUrl = await compressImageForVision(imageDataUrl);

    let prompt = '';
    if (forcedCategory === 'DISEASE_CONDITION') {
      prompt = `You are a world-class AI Clinical Dermatologist & Medical Diagnostic Specialist LLM.
Examine this medical image carefully and identify the EXACT skin condition, rash, lesion, cut, wound, burn, eye irritation, or physical health injury depicted.

CRITICAL MANDATE:
This scan is strictly for MEDICAL / INJURY / HEALTH DIAGNOSIS.
- Identify the exact condition title (e.g. Erythematous Skin Rash / Atopic Dermatitis, Contact Eczema, Superficial Laceration Cut, Mild Thermal Burn, Ocular Conjunctivitis, Psoriasis Plaque).
- Determine Risk Level: "Low", "Moderate", or "High".
- Provide First Basic Home Treatment & Self-Care Tips.
- Recommend the appropriate Medical Specialist (e.g. Dermatologist, General Surgeon, Ophthalmologist, General Physician).
- Set category strictly to "DISEASE_CONDITION".

Respond strictly with a valid JSON object matching this schema without markdown wrapping:
{
  "category": "DISEASE_CONDITION",
  "title": "Exact specific name of condition (e.g. Erythematous Skin Rash / Atopic Dermatitis, Superficial Laceration Wound)",
  "riskLevel": "Low" or "Moderate" or "High",
  "confidenceScore": 88.0,
  "firstBasicTreatment": "Clear step-by-step home treatment tips...",
  "recommendedDoctorConsultation": "Dermatologist" or "General Surgeon" or "Ophthalmologist" or "General Physician",
  "disclaimer": "AI Medical Vision Assessment."
}`;
    } else if (forcedCategory === 'FOOD') {
      prompt = `You are a world-class AI Clinical Nutritionist & Food Specialist LLM.
Examine this food image carefully and identify the EXACT food item, dish, fruit, vegetable, meal, dessert, fast food, or beverage.

CRITICAL MANDATE:
This scan is strictly for FOOD & NUTRITION ANALYSIS.
- Identify the exact specific food title (e.g. Fresh Red Apple, Exotic Dragon Fruit, Fresh Crispy Puri & Chole, Hyderabadi Chicken Biryani, Butterscotch Cream Cake, Loaded Cheese Pizza, Fresh Garden Salad).
- Determine Category: "FOOD".
- Determine foodCategory: "Fruit", "Vegetable", "Cooked Meal", "Grain", "Fast Food", or "Beverage".
- Provide exact macronutrients (calories, carbs_g, protein_g, fat_g, fiber_g).
- Provide Key Health Benefits and Best Time to Eat.

Respond strictly with a valid JSON object matching this schema without markdown wrapping:
{
  "category": "FOOD",
  "foodCategory": "Fruit" or "Vegetable" or "Cooked Meal" or "Grain" or "Fast Food" or "Beverage",
  "title": "Exact specific name of food item (e.g. Fresh Red Apple, Fresh Exotic Dragon Fruit, Fresh Crispy Puri & Chole, Hyderabadi Chicken Biryani)",
  "isHealthy": true or false,
  "healthStatusText": "YES — HEALTHY & NUTRIENT-DENSE" or "YES — TRADITIONAL COOKED MEAL (MODERATE PORTION)" or "NO — HIGH IN SUGAR/FAT (LIMIT CONSUMPTION)",
  "benefits": ["Key nutrition/health benefit 1", "Key nutrition/health benefit 2", "Key nutrition/health benefit 3"],
  "bestTimeToEat": "e.g. Morning breakfast / Main lunch meal / Occasional dessert",
  "eatOrAvoid": "EAT" or "AVOID",
  "nutrition": {
    "calories": 95,
    "carbs_g": 25,
    "protein_g": 0.5,
    "fat_g": 0.3,
    "fiber_g": 4.4
  },
  "disclaimer": "AI Vision Assessment by Groq LLM."
}`;
    } else {
      prompt = `You are a world-class AI Clinical Vision Diagnostic & Nutrition Specialist LLM.
Examine this image carefully and identify the EXACT food item or visual health condition depicted in the photo.

CRITICAL MANDATE:
Look directly at the visual content of the image.
- If it is a fruit (e.g. Red Apple, Green Apple, Banana, Dragon Fruit/Pitaya, Mango, Guava, Orange, Watermelon, Strawberry, Grapes, Papaya, Pineapple), output its exact fruit title.
- If it is an Indian cooked dish (e.g. Puri Chole, Puri Bhaji, Dosa, Idli, Sambar, Biryani, Rice & Curry, Roti, Naan, Paneer Butter Masala, Chana Masala, Samosa), output its exact dish name.
- If it is bakery/dessert (e.g. Chocolate Cake, Butterscotch Cake, Pastry, Donut, Brownie, Ice Cream), output its exact dessert name.
- If it is fast food (e.g. Pizza, Burger, French Fries, Sandwich, Pasta), output its exact item name.
- If it is a skin condition, injury, rash, or wound, classify as DISEASE_CONDITION and provide medical care.

Respond strictly with a valid JSON object matching this schema without markdown wrapping:
{
  "category": "FOOD" or "DISEASE_CONDITION",
  "foodCategory": "Fruit" or "Vegetable" or "Cooked Meal" or "Grain" or "Fast Food" or "Beverage",
  "title": "Exact specific name of food item or medical condition (e.g. Fresh Red Apple, Fresh Exotic Dragon Fruit, Fresh Crispy Puri & Chole, Hyderabadi Chicken Biryani, Chocolate Butterscotch Cake, Atopic Eczema Rash)",
  "isHealthy": true or false,
  "healthStatusText": "YES — HEALTHY & NUTRIENT-DENSE" or "YES — TRADITIONAL COOKED MEAL (MODERATE PORTION)" or "NO — HIGH IN SUGAR/FAT (LIMIT CONSUMPTION)",
  "benefits": ["Key nutrition/health benefit 1", "Key nutrition/health benefit 2", "Key nutrition/health benefit 3"],
  "bestTimeToEat": "e.g. Morning breakfast / Main lunch meal / Occasional dessert",
  "eatOrAvoid": "EAT" or "AVOID",
  "riskLevel": "Low" or "Moderate" or "High",
  "firstBasicTreatment": "Basic care guidance...",
  "recommendedDoctorConsultation": "Recommended medical specialist...",
  "confidenceScore": 94.0,
  "nutrition": {
    "calories": 95,
    "carbs_g": 25,
    "protein_g": 0.5,
    "fat_g": 0.3,
    "fiber_g": 4.4
  },
  "disclaimer": "AI Vision Assessment by Groq LLM."
}`;
    }

    const visionModels = [
      'llama-3.2-11b-vision-preview',
      'llama-3.2-90b-vision-preview'
    ];

    for (const model of visionModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: compressedUrl
                    }
                  }
                ]
              }
            ],
            temperature: 0.1,
            max_tokens: 1000
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          
          const firstBrace = content.indexOf('{');
          const lastBrace = content.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonStr = content.substring(firstBrace, lastBrace + 1);
            const parsed: GroqVisionResponse = JSON.parse(jsonStr);
            if (parsed && parsed.title && !parsed.title.toLowerCase().includes('unknown')) {
              console.log(`Groq Vision LLM (${model}) Analysis Success:`, parsed.title);
              return parsed;
            }
          }
        } else {
          const errText = await response.text();
          console.warn(`Groq Vision Model (${model}) response status:`, response.status, errText);
        }
      } catch (e) {
        console.warn(`Vision model ${model} error:`, e);
      }
    }

    return null;
  } catch (err) {
    console.error('Groq Vision Exception:', err);
    return null;
  }
}
