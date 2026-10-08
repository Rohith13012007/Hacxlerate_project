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
  if (!text) return null;
  // 1. Native Script Checks
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu native script
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi native script
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil native script
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada native script

  // 2. Keyword & Phonetic Language Switch Requests
  const lower = text.toLowerCase().trim();
  if (lower.includes('telugu') || lower.includes('telugulo') || lower.includes('matladu') || lower.includes('namaskaram') || lower.includes('cheppu')) return 'te';
  if (lower.includes('hindi') || lower.includes('namaste') || lower.includes('baat karo') || lower.includes('batao')) return 'hi';
  if (lower.includes('tamil') || lower.includes('vanakkam') || lower.includes('pesu')) return 'ta';
  if (lower.includes('kannada') || lower.includes('namaskara') || lower.includes('matai')) return 'kn';
  if (lower.includes('english') || lower.includes('speak english')) return 'en';

  return null;
}

/**
 * Send natural health prompt to Groq API (openai/gpt-oss-120b & qwen/qwen3.8-27b)
 */
export async function queryGroqChat(
  userText: string,
  language: string = 'en',
  history: { sender: 'user' | 'ai'; text: string }[] = []
): Promise<{ reply: string; urgency: 'LOW CONCERN' | 'MODERATE CONCERN' | 'URGENT' | 'EMERGENCY'; specialist?: string; detectedLanguage: string } | null> {
  const apiKey = getGroqApiKey();
  const detectedLang = detectLanguageFromText(userText);
  const activeLang = detectedLang ? detectedLang : (language || 'en');

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

    const systemPrompt = `You are the "AI Health Well-Wisher Agent" — a deeply caring, empathetic, supportive, and knowledgeable personal healthcare companion.

YOUR PERSONA:
You treat every user like a cherished friend or family member. Your tone is warm, gentle, reassuring, and deeply concerned for their health and peace of mind.

RESPONSE RULES & STRUCTURE:
1. GREETINGS & SMALL TALK (e.g. "hi", "hello", "good morning", "how are you"):
   - Greet warmly as a caring Health Well-Wisher.
   - Gently ask how they are feeling today and if any health symptom or question is troubling them.

2. WHEN USER TELLS YOU ABOUT ANY HEALTH SYMPTOM, PAIN, OR ILLNESS:
   Structure your entire answer into these clear sections:
   💙 **Warm Well-Wisher Concern**: Acknowledge with deep empathy and comfort.
   1️⃣ **WHAT YOU MUST DO FIRST (Immediate Relief & First Aid Actions)**: Give 2-3 clear immediate actions (rest, sip warm water, sit comfortably, cool compress, check temperature, avoid strain).
   2️⃣ **SUGGESTED NEARBY SPECIALIST & DOCTOR**: Identify exact doctor specialist needed (Dermatologist, General Physician, Neurologist, Gastroenterologist, Cardiologist, Dentist, Ophthalmologist). Mention nearby doctor/hospital options (e.g., Dr. Priya Sharma - Dermatologist at Apollo Skin Clinic (1.8 km), Dr. Ananya Reddy - General Physician at KIMS Hospital (4.1 km), Dr. Ramesh Kumar - Care Clinic) and encourage booking an appointment in the app's Find Doctors section.
   3️⃣ **WELL-WISHER ADVICES & LIFESTYLE TIPS**: Give 2-3 practical care tips (hydration, light diet, sleep, things to avoid).

3. EMERGENCY SIGNS: If severe symptoms (chest pain, breathlessness, unconsciousness, stroke), alert immediately to call emergency 108 / 911 or head to ER.

4. CRITICAL LANGUAGE MANDATE:
   Target Language: ${targetLangName}. Write ENTIRE response in ${targetLangName} script! (Telugu: తెలుగు, Hindi: हिन्दी, Tamil: தமிழ், Kannada: ಕನ್ನಡ, English: English).

5. ALWAYS END WITH: "(Note: AI Well-Wisher guidance only. Please consult a qualified doctor for clinical diagnosis.)"`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(h => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      })),
      { role: 'user', content: userText }
    ];

    const modelsToTry = [
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b'
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
            temperature: 0.4,
            max_tokens: 800
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
 * Send image to Groq Vision API (llama-3.2-11b-vision-preview)
 */
export async function analyzeImageWithGroq(
  imageDataUrl: string,
  fileHint?: string
): Promise<GroqVisionResponse | null> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;

  try {
    const prompt = `Analyze this uploaded image (filename/hint: "${fileHint || 'camera snapshot'}").
Classify into ONE of two categories:
1. FOOD (Any fruit, vegetable, dish, meal, drink, salad, snack, e.g. Red Apple, Banana, Salad, Pizza, etc.)
2. DISEASE_CONDITION (Any skin rash, eye redness, wound, burn, swelling, oral ulcer, skin patch, etc.)

Respond strictly with a valid JSON object matching this JSON format without markdown wrapping:
{
  "category": "FOOD" or "DISEASE_CONDITION",
  "title": "Name of food or disease condition (e.g., Red Delicious Apple, Mild Atopic Eczema, Banana, Conjunctivitis)",
  "isHealthy": true or false (if FOOD),
  "healthStatusText": "YES - EXCELLENT FOR DAILY DIET" or "LIMIT CONSUMPTION" (if FOOD),
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "bestTimeToEat": "e.g. Morning breakfast / Mid-afternoon snack" (if FOOD),
  "eatOrAvoid": "EAT" or "AVOID" (if FOOD),
  "riskLevel": "Low" or "Moderate" or "High" (if DISEASE_CONDITION),
  "firstBasicTreatment": "Step 1: Clean area with mild water... Step 2: Apply soothing gel..." (if DISEASE_CONDITION),
  "recommendedDoctorConsultation": "Consult a Dermatologist / Ophthalmologist if symptoms persist...",
  "confidenceScore": 92.5,
  "nutrition": {
    "calories": 95,
    "carbs_g": 25,
    "protein_g": 0.5,
    "fat_g": 0.3,
    "fiber_g": 4.4
  },
  "disclaimer": "AI vision assessment for informational purposes only. Consult a healthcare professional."
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.warn('Groq Vision API HTTP error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Clean JSON markdown if wrapped
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed: GroqVisionResponse = JSON.parse(cleanJson);
    return parsed;
  } catch (err) {
    console.error('Groq Vision Exception:', err);
    return null;
  }
}
