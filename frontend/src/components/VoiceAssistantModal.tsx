import React, { useState, useEffect, useRef } from 'react';
import { useHealth } from '../context/HealthContext';
import { speechService } from '../services/speechService';
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
  ChevronRight
} from 'lucide-react';
import type { Language } from '../types';

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
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);
    speechService.stopListening();
    setIsListening(false);
    
    // Send to AI Copilot
    const aiMsg = await sendMessageToCopilot(text);
    setIsProcessing(false);

    // Speak AI response and auto-resume listening when TTS finishes
    if (!isSpeakerMuted && aiMsg.text) {
      setIsSpeaking(true);
      speechService.speakText(
        aiMsg.text, 
        aiMsg.language || activeLanguage, 
        () => {
          setIsSpeaking(false);
          if (isVoiceModalOpen && !conversationEnded) {
            handleToggleListening(true);
          }
        }
      );
    } else {
      if (isVoiceModalOpen && !conversationEnded) {
        handleToggleListening(true);
      }
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
            <select
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value as Language)}
              className="bg-slate-50 text-slate-800 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ்</option>
              <option value="kn">కన్నడ</option>
            </select>

            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice AI Visualizer Ring Section */}
        {!conversationEnded && (
          <div className="bg-gradient-to-b from-blue-50/60 to-white py-6 border-b border-slate-100 flex flex-col items-center justify-center">
            <div className="relative concentric-wave flex items-center justify-center">
              <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all ${
                isListening 
                  ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 scale-105 ring-4 ring-blue-200' 
                  : isSpeaking
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 scale-105 ring-4 ring-emerald-200'
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
              <div className="flex items-center space-x-1.5 mt-3">
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
                <p className="whitespace-pre-line">{msg.text}</p>
                {msg.specialistRecommendation && (
                  <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center space-x-1.5 text-teal-900 font-extrabold">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>Recommended Specialist: {msg.specialistRecommendation}</span>
                    </div>
                    <a
                      href="#/appointments"
                      onClick={handleClose}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs transition-colors"
                    >
                      <span>Book Consultation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
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
