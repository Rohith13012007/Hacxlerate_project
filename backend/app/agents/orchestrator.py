import re
import os
import json
import requests
from typing import Dict, Any, List

EMERGENCY_KEYWORDS = [
    "chest pain", "difficulty breathing", "cannot breathe", "unconscious", 
    "severe bleeding", "stroke", "paralysis", "seizure", "anaphylaxis", 
    "choking", "heart attack", "head injury", "suicidal", "severe burn"
]

GROQ_MODELS = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b'
]

class HealthCopilotOrchestrator:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")

    def detect_language(self, text: str) -> str:
        if re.search(r'[\u0C00-\u0C7F]', text): # Telugu
            return "te"
        elif re.search(r'[\u0900-\u097F]', text): # Hindi
            return "hi"
        elif re.search(r'[\u0B80-\u0BFF]', text): # Tamil
            return "ta"
        elif re.search(r'[\u0C80-\u0CFF]', text): # Kannada
            return "kn"
        return "en"

    def check_emergency(self, text: str) -> bool:
        lowered = text.lower()
        return any(kw in lowered for kw in EMERGENCY_KEYWORDS)

    def suggest_specialist(self, text: str) -> str:
        lowered = text.lower()
        if any(w in lowered for w in ["skin", "rash", "itch", "eczema", "acne", "spot", "allergy"]):
            return "Dermatologist"
        if any(w in lowered for w in ["tooth", "teeth", "gum", "cavity", "dentist"]):
            return "Dentist"
        if any(w in lowered for w in ["eye", "vision", "blur", "red eye"]):
            return "Ophthalmologist"
        if any(w in lowered for w in ["heart", "chest pressure", "palpitation", "cardiolog"]):
            return "Cardiologist"
        if any(w in lowered for w in ["stomach", "gastric", "acid", "digestion", "diarrhea", "nausea"]):
            return "Gastroenterologist"
        if any(w in lowered for w in ["breath", "asthma", "wheezing", "lung", "pulmonolog"]):
            return "Pulmonologist"
        if any(w in lowered for w in ["headache", "head", "migraine", "neurolog"]):
            return "Neurologist"
        return "General Physician"

    def query_groq_llm(self, user_message: str, lang: str = "en") -> Dict[str, Any] | None:
        if not self.api_key:
            return None

        lang_names = {
            "en": "English",
            "te": "Telugu (తెలుగు)",
            "hi": "Hindi (हिन्दी)",
            "ta": "Tamil (தமிழ்)",
            "kn": "Kannada (ಕನ್ನಡ)"
        }
        target_lang = lang_names.get(lang, "English")

        system_prompt = f"""You are the "AI Health Well-Wisher Agent" — a deeply caring, empathetic, supportive, and knowledgeable personal healthcare companion.

YOUR PERSONA:
You treat every user like a cherished friend or family member. Your tone is warm, gentle, reassuring, and deeply concerned for their health and peace of mind.

RESPONSE RULES & STRUCTURE:
1. GREETINGS & SMALL TALK (e.g. "hi", "hello", "good morning"):
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
   Target Language: {target_lang}. Write ENTIRE response in {target_lang} script!

5. ALWAYS END WITH: "(Note: AI Well-Wisher guidance only. Please consult a qualified doctor for clinical diagnosis.)" """

        for model in GROQ_MODELS:
            try:
                res = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message}
                        ],
                        "temperature": 0.4,
                        "max_tokens": 800
                    },
                    timeout=8
                )
                if res.status_code == 200:
                    data = res.json()
                    reply = data["choices"][0]["message"]["content"]
                    spec = self.suggest_specialist(user_message)
                    is_emerg = self.check_emergency(user_message)
                    return {
                        "reply": reply,
                        "detected_language": lang,
                        "urgency": "EMERGENCY" if is_emerg else "MODERATE CONCERN" if spec != "General Physician" else "LOW CONCERN",
                        "is_emergency": is_emerg,
                        "specialist": spec,
                        "followups": ["What should I eat?", "Suggest nearby doctor", "How to prevent this?"]
                    }
            except Exception as e:
                print(f"[Orchestrator Warning] Groq model {model} failed: {e}")
                continue

        return None

    def process_message(self, user_message: str, lang: str = "en") -> Dict[str, Any]:
        detected_lang = self.detect_language(user_message) if lang == "auto" or not lang else lang
        is_emergency = self.check_emergency(user_message)
        specialist = self.suggest_specialist(user_message)

        if is_emergency:
            return {
                "reply": "⚠️ Possible Medical Emergency detected! Please seek immediate emergency medical care or call 108 / 911 immediately.\n\n(Note: AI Well-Wisher guidance only.)",
                "detected_language": detected_lang,
                "urgency": "EMERGENCY",
                "is_emergency": True,
                "specialist": "Emergency Physician",
                "followups": ["Call Emergency 108", "Navigate to Nearest ER"]
            }

        # Try live LLM first
        llm_res = self.query_groq_llm(user_message, detected_lang)
        if llm_res:
            return llm_res

        # Dynamic Python Fallback Well-Wisher Engine
        lowered = user_message.lower().strip()
        is_greeting = any(g in lowered for g in ["hi", "hello", "hey", "good morning", "namaste", "namaskaram", "vanakkam"])
        if is_greeting and len(lowered) < 15:
            reply = "Hello dear friend! 🌼 I am your AI Health Well-Wisher Copilot. Your health, peace of mind, and well-being mean everything to me! How are you feeling today? Are you experiencing any symptoms, or is there any health concern I can guide you with?"
            reply += "\n\n(Note: AI Well-Wisher guidance only. Please consult a qualified doctor for diagnosis.)"
            return {
                "reply": reply,
                "detected_language": detected_lang,
                "urgency": "LOW CONCERN",
                "is_emergency": False,
                "specialist": "General Physician",
                "followups": ["I have a headache", "I have skin rash", "I have stomach pain"]
            }

        is_clarification = any(c in lowered for c in ["i didnt mention", "didn't mention", "nothing", "what can you do"])
        if is_clarification:
            reply = "Ah, no problem dear friend! 🌼 As your personal Health Well-Wisher, whenever you feel unwell, experience any symptoms (like fever, headache, skin rash, stomach ache), or need guidance on doctors and nutrition, I'm right here for you. How can I assist your health journey today?"
            reply += "\n\n(Note: AI Well-Wisher guidance only. Please consult a qualified doctor for diagnosis.)"
            return {
                "reply": reply,
                "detected_language": detected_lang,
                "urgency": "LOW CONCERN",
                "is_emergency": False,
                "specialist": "General Physician",
                "followups": ["Check my symptoms", "Find nearby doctors", "Nutrition advice"]
            }

        # Structured 3-step Well-Wisher response
        if specialist == "Dermatologist":
            doctor_name = "Dr. Priya Sharma (Dermatologist - Apollo Skin Clinic, 1.8 km away)"
            first_aid = "1. **Cool Compress**: Apply a clean, cool damp cloth to the irritated area for 10-15 minutes.\n2. **Avoid Scratching**: Gently tap around the skin instead of scratching.\n3. **Gentle Cleanse**: Wash softly with lukewarm water and mild fragrance-free soap."
            advice = "- Apply a gentle non-fragranced moisturizer or soothing aloe vera gel.\n- Wear loose, breathable cotton clothing.\n- Stay hydrated with 8-10 glasses of water daily."
            concern = "Oh dear, I am so sorry to hear about your skin irritation and discomfort. Skin rash can feel quite bothering, but stay calm—we will care for it together!"
        elif specialist == "Neurologist":
            doctor_name = "Dr. Ramesh Kumar (General Physician - Care Clinic) / Dr. Ananya Reddy (KIMS Hospital)"
            first_aid = "1. **Rest in Dark Room**: Lie down in a quiet, dimly lit, cool room.\n2. **Hydration**: Drink a fresh glass of room-temperature water immediately.\n3. **Cold Compress**: Place a cool damp cloth across your forehead or temples."
            advice = "- Dim digital screens and limit smartphone blue light.\n- Avoid loud noises, strong lights, and caffeine.\n- Practice 5 minutes of slow, deep breathing."
            concern = "I'm so sorry you're experiencing head pain dear friend. Please rest your eyes and take it easy!"
        elif specialist == "Gastroenterologist":
            doctor_name = "Dr. Ananya Reddy (General Physician - KIMS Multi-Specialty Hospital, 4.1 km away)"
            first_aid = "1. **Sip Warm Water**: Sip warm water or mild ginger tea slowly.\n2. **Upright Posture**: Avoid lying down flat immediately after meals.\n3. **Gentle Heat**: Apply a mild warm compress over your abdomen."
            advice = "- Eat light, easily digestible foods like plain rice, dal, or toast.\n- Avoid spicy, fried, or acidic foods.\n- Take small, frequent meals rather than heavy portions."
            concern = "Oh, stomach discomfort can be so draining! Please sit comfortably and relax while we get you some relief."
        else:
            doctor_name = "Dr. Ananya Reddy (General Physician - KIMS Multi-Specialty Hospital, 4.1 km away)"
            first_aid = "1. **Rest & Relax**: Sit down in a comfortable position and take deep, calming breaths.\n2. **Hydrate**: Sip a fresh glass of water to keep your body refreshed.\n3. **Monitor Symptoms**: Note down when symptoms started and if they worsen."
            advice = "- Maintain adequate rest and avoid heavy physical exertion.\n- Eat wholesome, balanced home-cooked meals.\n- Consult a doctor if symptoms persist or escalate."
            concern = f"I hear your concern regarding '{user_message}'. As your Health Well-Wisher, your well-being is my top priority!"

        reply = f"💙 **Warm Well-Wisher Concern**\n{concern}\n\n" \
                f"1️⃣ **WHAT YOU MUST DO FIRST (Immediate Relief & Action)**\n{first_aid}\n\n" \
                f"2️⃣ **SUGGESTED NEARBY SPECIALIST & DOCTOR**\n" \
                f"- **Recommended Specialist**: **{specialist}**\n" \
                f"- **Nearby Doctor Suggestion**: {doctor_name}\n" \
                f"- *You can book an instant appointment with nearby doctors in our **Find Doctors** tab.*\n\n" \
                f"3️⃣ **WELL-WISHER ADVICES & LIFESTYLE TIPS**\n{advice}\n\n" \
                f"(Note: AI Well-Wisher guidance only. Please consult a qualified doctor for clinical diagnosis.)"

        return {
            "reply": reply,
            "detected_language": detected_lang,
            "urgency": "MODERATE CONCERN" if specialist != "General Physician" else "LOW CONCERN",
            "is_emergency": False,
            "specialist": specialist,
            "followups": ["Book appointment with doctor", "Diet advice", "How long will this take to heal?"]
        }
