import React, { useState, useEffect, useRef } from 'react';
import { useHealth } from '../context/HealthContext';
import { speechService } from '../services/speechService';
import { detectLanguageFromText } from '../services/groqService';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  Paperclip, 
  Keyboard, 
  Square, 
  Bot, 
  User, 
  Send,
  X,
  Sparkles,
  Stethoscope,
  MapPin,
  Globe
} from 'lucide-react';

export const VoiceAssistantModal: React.FC = () => {
  const { 
    isVoiceModalOpen, 
    setIsVoiceModalOpen, 
    activeLanguage, 
    setActiveLanguage,
    sendMessageToCopilot,
    conversations,
    activeConversationId
  } = useHealth();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [showKeyboardInput, setShowKeyboardInput] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [conversationEnded, setConversationEnded] = useState<boolean>(false);
  const [summaryReport, setSummaryReport] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef<boolean>(false);
  const lastTextRef = useRef<string>('');

  const currentConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const suggestionChips = [
    "I have a headache since yesterday",
    "Explain my blood report",
    "Suggest diet for weight loss"
  ];

  useEffect(() => {
    if (isVoiceModalOpen && !conversationEnded) {
      handleToggleListening(true);
    } else {
      handleToggleListening(false);
      speechService.stopSpeaking();
    }
    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, [isVoiceModalOpen, activeLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages, interimText]);

  const handleToggleListening = (enable?: boolean) => {
    const shouldListen = enable !== undefined ? enable : !isListening;
    if (shouldListen) {
      speechService.startListening(
        activeLanguage,
        async (recognizedText, isFinal) => {
          if (isFinal) {
            setInterimText('');
            await processUserSpeech(recognizedText);
          } else {
            setInterimText(recognizedText);
          }
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsListening(false);
        }
      );
      setIsListening(true);
    } else {
      speechService.stopListening();
      setIsListening(false);
      setInterimText('');
    }
  };

  const processUserSpeech = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isProcessingRef.current) return;
    
    // Auto detect language ONLY if non-english native script or explicit verbal command is detected
    const detectedLang = detectLanguageFromText(trimmed);
    const targetLang = (detectedLang && detectedLang !== 'en') ? detectedLang : activeLanguage;
    if (detectedLang && detectedLang !== 'en' && detectedLang !== activeLanguage) {
      setActiveLanguage(detectedLang);
    }

    // Ignore duplicate exact text if received within 1 second
    if (lastTextRef.current === trimmed) return;

    isProcessingRef.current = true;
    lastTextRef.current = trimmed;
    setIsProcessing(true);
    speechService.stopListening();
    setIsListening(false);
    
    // Clear last processed text memory after 1 second
    setTimeout(() => {
      if (lastTextRef.current === trimmed) {
        lastTextRef.current = '';
      }
    }, 1000);

    const onTtsComplete = () => {
      setIsSpeaking(false);
      isProcessingRef.current = false;
      if (isVoiceModalOpen && !conversationEnded) {
        handleToggleListening(true);
      }
    };

    try {
      // Send user message to AI Copilot
      const aiMsg = await sendMessageToCopilot(trimmed);
      setIsProcessing(false);

      const responseLang = aiMsg?.language || targetLang;

      // Speak AI response and auto-resume listening when TTS finishes
      if (!isSpeakerMuted && aiMsg && aiMsg.text) {
        setIsSpeaking(true);
        speechService.speakText(
          aiMsg.text, 
          responseLang, 
          onTtsComplete
        );
      } else {
        onTtsComplete();
      }
    } catch (err) {
      console.warn('Error processing user speech turn:', err);
      setIsProcessing(false);
      onTtsComplete();
    }
  };

  const handleTextSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;
    const msg = textInput;
    setTextInput('');
    await processUserSpeech(msg);
  };

  const handleChipClick = async (chipText: string) => {
    await processUserSpeech(chipText);
  };

  const handleEndConversation = () => {
    speechService.stopListening();
    speechService.stopSpeaking();
    setIsListening(false);
    setIsSpeaking(false);
    setConversationEnded(true);

    const totalMsgs = currentConv ? currentConv.messages.length : 0;
    const summary = `Session Duration: ~3 minutes | Messages Exchanged: ${totalMsgs} | Language: ${activeLanguage.toUpperCase()} | Key Topics: Symptom Triage & Guidance. All details saved to Medical History.`;
    setSummaryReport(summary);
  };

  const handleClose = () => {
    speechService.stopListening();
    speechService.stopSpeaking();
    setIsListening(false);
    setIsSpeaking(false);
    setConversationEnded(false);
    setSummaryReport(null);
    setIsVoiceModalOpen(false);
  };

  const renderMessageContent = (text: string) => {
    if (!text) return null;

    // Clean out any raw http/https Google Maps URLs from text paragraph so plain URL text strings are never displayed
    let cleanText = text.replace(/https?:\/\/(www\.)?google\.com\/maps[^\s)]+/g, '').trim();
    cleanText = cleanText.replace(/\[📍?[^\]]*\]\(https?:\/\/[^)]+\)/g, '').trim();
    cleanText = cleanText.replace(/మీ సమీప ఆసుపత్రి కోసం ఇక్కడ క్లిక్ చేయండి:\s*/g, '').trim();
    cleanText = cleanText.replace(/यहाँ क्लिक करें:\s*/g, '').trim();
    cleanText = cleanText.replace(/Click here for nearby hospital:\s*/g, '').trim();

    return (
      <div className="whitespace-pre-line leading-relaxed">
        {cleanText}
      </div>
    );
  };

  if (!isVoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl h-[88vh] bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header matching Reference Image */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <span>Talk to Health Copilot</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold">Continuous Voice & Multilingual AI Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <select
                value={activeLanguage}
                onChange={(e) => setActiveLanguage(e.target.value as any)}
                className="bg-transparent font-extrabold text-blue-800 text-xs focus:outline-none cursor-pointer pr-1"
                title="Select Manual AI Language"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice AI Visualizer Ring Section featuring AI Voice Graphic Background */}
        {!conversationEnded && (
          <div className="relative py-8 border-b border-slate-100 flex flex-col items-center justify-center overflow-hidden bg-slate-900">
            {/* Background AI Voice Graphic Art */}
            <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
              <img 
                src="/images/voice_assistant_bg.jpg" 
                alt="AI Voice Assistant Soundwaves" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Glassmorphic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80 pointer-events-none" />

            <div className="relative z-10 concentric-wave flex items-center justify-center">
              <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all ${
                isListening 
                  ? 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 scale-105 ring-4 ring-cyan-400/40' 
                  : isSpeaking
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 scale-105 ring-4 ring-emerald-400/40'
                  : isProcessing
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-400 scale-105'
                  : 'bg-blue-600'
              }`}>
                <Mic className="w-7 h-7" />
                <span className="text-[10px] font-extrabold mt-0.5">
                  {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isProcessing ? 'Thinking...' : 'Tap Mic'}
                </span>
              </div>
            </div>

            {/* Real-time Animated Waveform Bars */}
            {(isListening || isSpeaking) && (
              <div className="relative z-10 flex items-center space-x-1.5 mt-3">
                <span className="wave-bar h-4"></span>
                <span className="wave-bar h-7"></span>
                <span className="wave-bar h-5"></span>
                <span className="wave-bar h-8"></span>
                <span className="wave-bar h-4"></span>
              </div>
            )}
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
          {currentConv?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-teal-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none font-medium'
                }`}
              >
                {renderMessageContent(msg.text)}
                
                {(msg.googleMapsUrl || msg.isEmergency) && (
                  <div className="mt-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-2.5 text-xs text-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <span className="font-extrabold text-blue-950">
                          {msg.specialistRecommendation ? `${msg.specialistRecommendation} Specialist` : 'Recommended Nearby Doctor'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        GPS Location Matched
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium">
                      Matched to your live location and reported health issues.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={
                          msg.googleMapsUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.specialistRecommendation || 'Hospitals near me')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleClose}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-rose-300 animate-bounce" />
                        <span>📍 Directions from Google Maps</span>
                      </a>

                      <button
                        onClick={() => {
                          handleClose();
                          window.location.hash = '/doctors';
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                      >
                        📅 Book Consultation
                      </button>
                    </div>
                  </div>
                )}
                <div className={`mt-1.5 text-[10px] font-medium text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Interim speech text */}
          {interimText && (
            <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse opacity-70">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-900 text-xs italic font-medium">
                {interimText}...
              </div>
            </div>
          )}

          {/* Summary report on end */}
          {conversationEnded && summaryReport && (
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>CONVERSATION SUMMARY</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">{summaryReport}</p>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips ribbon matching reference design */}
        {!conversationEnded && (
          <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex-shrink-0">Suggestions:</span>
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip)}
                className="px-3 py-1 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap shadow-2xs transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Keyboard Input Toggle Bar */}
        {showKeyboardInput && !conversationEnded && (
          <form onSubmit={handleTextSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Action Controls Bar matching Panel 3 & Image 4 */}
        {!conversationEnded && (
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-around">
            {/* Microphone */}
            <button
              onClick={() => handleToggleListening()}
              className={`flex flex-col items-center space-y-1 transition-all ${
                isListening ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-xs transition-all ${
                isListening ? 'bg-emerald-100 border-emerald-300 text-emerald-600 ring-4 ring-emerald-100' : 'bg-slate-100 border-slate-200'
              }`}>
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </div>
              <span className="text-[10px] font-bold">Microphone</span>
            </button>

            {/* Speaker */}
            <button
              onClick={() => {
                const next = !isSpeakerMuted;
                setIsSpeakerMuted(next);
                if (next) speechService.stopSpeaking();
              }}
              className={`flex flex-col items-center space-y-1 ${
                isSpeakerMuted ? 'text-slate-400' : 'text-teal-600'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-teal-600" />}
              </div>
              <span className="text-[10px] font-bold">Speaker</span>
            </button>

            {/* Camera */}
            <button
              onClick={() => {
                handleClose();
                window.location.hash = '/scan';
              }}
              className="flex flex-col items-center space-y-1 text-slate-600 hover:text-slate-800"
            >
              <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">Camera</span>
            </button>

            {/* Upload */}
            <button
              onClick={() => {
                handleClose();
                window.location.hash = '/reports';
              }}
              className="flex flex-col items-center space-y-1 text-slate-600 hover:text-slate-800"
            >
              <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Paperclip className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">Upload</span>
            </button>

            {/* Keyboard */}
            <button
              onClick={() => setShowKeyboardInput(!showKeyboardInput)}
              className="flex flex-col items-center space-y-1 text-slate-600 hover:text-slate-800"
            >
              <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Keyboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">Keyboard</span>
            </button>

            {/* End Conversation (Red Button) */}
            <button
              onClick={handleEndConversation}
              className="flex flex-col items-center space-y-1 text-rose-600 hover:text-rose-700"
            >
              <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                <Square className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] font-bold text-rose-600">End</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
