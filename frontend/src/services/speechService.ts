import type { Language } from '../types';

export const LANG_SPEECH_CODES: Record<Language, string> = {
  en: 'en-US',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN'
};

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private synthesis: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private currentAudio: HTMLAudioElement | null = null;
  private silenceTimer: any = null;
  private speakTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSpeechSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    lang: Language,
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: any) => void
  ) {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    // Clean up previous instance safely
    this.stopListening();

    const targetLangCode = LANG_SPEECH_CODES[lang] || 'en-US';
    this.isListening = true;

    // Create fresh SpeechRecognition object to eliminate Chrome InvalidStateError
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = targetLangCode;
    this.recognition = rec;

    rec.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      if (finalTranscript.trim()) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript.trim()) {
        onResult(interimTranscript.trim(), false);
        const textToSubmit = interimTranscript.trim();
        // 1800ms generous fallback silence timer: triggers final result if user pauses for nearly 2 full seconds
        this.silenceTimer = setTimeout(() => {
          if (this.isListening && textToSubmit.length > 1) {
            onResult(textToSubmit, true);
          }
        }, 1800);
      }
    };

    rec.onerror = (event: any) => {
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return; // Ignore transient no-speech or aborted events
      }
      console.warn('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    rec.onend = () => {
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      if (this.isListening && this.recognition === rec) {
        try {
          rec.start();
        } catch (e) {
          // ignore double start
        }
      }
    };

    try {
      rec.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
    }
  }

  public stopListening() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.isListening = false;
    if (this.recognition) {
      const oldRec = this.recognition;
      this.recognition = null;
      try {
        oldRec.onresult = null;
        oldRec.onerror = null;
        oldRec.onend = null;
        oldRec.abort();
      } catch (e) {}
    }
  }

  public speakText(text: string, lang: Language, onEnd?: () => void) {
    this.stopSpeaking();

    // Clean text of markdown links, URLs, and asterisks before reading
    const cleanText = text
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/https?:\/\/[^\s]+/g, 'live direction map attached')
      .replace(/\*\*/g, '')
      .replace(/\n\n\(.*?\)/g, '')
      .replace(/⚠️/g, 'Warning.')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    let called = false;
    const safeOnEnd = () => {
      if (this.speakTimeout) {
        clearTimeout(this.speakTimeout);
        this.speakTimeout = null;
      }
      if (!called) {
        called = true;
        if (onEnd) onEnd();
      }
    };

    // Calculate maximum TTS speaking timeout safety wall (approx 14 chars/sec + 2s buffer)
    const estimatedSpeakMs = Math.min(14000, Math.max(2500, (cleanText.length / 14) * 1000 + 1500));
    this.speakTimeout = setTimeout(() => {
      this.stopSpeaking();
      safeOnEnd();
    }, estimatedSpeakMs);

    const targetLangCode = LANG_SPEECH_CODES[lang] || 'en-US';

    // 1. Primary: Web Speech Synthesis (Supported natively in Chrome for English, Telugu, Hindi, Tamil, Kannada)
    if (this.synthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = targetLangCode;
        utterance.rate = 1.08;
        utterance.pitch = 1.0;

        const voices = this.synthesis.getVoices() || [];
        const matchedVoice = voices.find(v => 
          v.lang.toLowerCase() === targetLangCode.toLowerCase() || 
          v.lang.toLowerCase().startsWith(lang.toLowerCase())
        );

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onend = safeOnEnd;
        utterance.onerror = safeOnEnd;

        this.synthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('SpeechSynthesis Exception, trying fallback:', err);
      }
    }

    // 2. Fallback Audio Stream for Telugu, Hindi, Tamil, Kannada, English
    try {
      const textChunk = cleanText.substring(0, 190);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textChunk)}&tl=${lang || 'en'}&client=tw-ob`;
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.playbackRate = 1.08;
      this.currentAudio.onended = safeOnEnd;
      this.currentAudio.onerror = safeOnEnd;
      
      this.currentAudio.play().catch(err => {
        console.warn('TTS Audio fallback stream error:', err);
        safeOnEnd();
      });
    } catch (err) {
      console.warn('Speech synthesis fallback exception:', err);
      safeOnEnd();
    }
  }

  public stopSpeaking() {
    if (this.speakTimeout) {
      clearTimeout(this.speakTimeout);
      this.speakTimeout = null;
    }
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch (e) {}
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch (e) {}
      this.currentAudio = null;
    }
  }
}

export const speechService = new SpeechService();
