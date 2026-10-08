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
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    this.recognition.lang = LANG_SPEECH_CODES[lang] || 'en-US';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {
          // ignore double start
        }
      }
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  public speakText(text: string, lang: Language, onEnd?: () => void) {
    this.stopSpeaking();

    // Clean text of markdown asterisks/notes before reading
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\n\n\(.*?\)/g, '')
      .replace(/⚠️/g, 'Warning.')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // Try Web Speech Synthesis first
    if (this.synthesis) {
      const voices = this.synthesis.getVoices() || [];
      const targetLangCode = LANG_SPEECH_CODES[lang] || 'en-US';
      const matchedVoice = voices.find(v => 
        v.lang.toLowerCase() === targetLangCode.toLowerCase() || 
        v.lang.toLowerCase().startsWith(lang.toLowerCase())
      );

      if (matchedVoice) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = targetLangCode;
        utterance.voice = matchedVoice;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        let called = false;
        const handleEnd = () => {
          if (!called && onEnd) {
            called = true;
            onEnd();
          }
        };

        utterance.onend = handleEnd;
        utterance.onerror = handleEnd;

        this.synthesis.speak(utterance);
        return;
      }
    }

    // Fallback Audio Stream for Telugu, Hindi, Tamil, Kannada, English
    try {
      const textChunk = cleanText.substring(0, 190);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textChunk)}&tl=${lang || 'en'}&client=tw-ob`;
      
      this.currentAudio = new Audio(audioUrl);
      
      let called = false;
      const handleEnd = () => {
        if (!called && onEnd) {
          called = true;
          onEnd();
        }
      };

      this.currentAudio.onended = handleEnd;
      this.currentAudio.onerror = handleEnd;
      
      this.currentAudio.play().catch(err => {
        console.warn('TTS Audio fallback stream error:', err);
        handleEnd();
      });
    } catch (err) {
      console.warn('Speech synthesis fallback exception:', err);
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
}

export const speechService = new SpeechService();
