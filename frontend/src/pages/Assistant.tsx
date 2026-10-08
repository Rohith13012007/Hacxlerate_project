import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { SafetyBanner } from '../components/SafetyBanner';
import { Bot, User, Mic, Send, Sparkles, Plus, Stethoscope, FileCheck, CheckCircle2, ShieldCheck, X, MapPin } from 'lucide-react';
import type { PatientSessionSummary } from '../services/groqService';

export const Assistant: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    sendMessageToCopilot, 
    startNewConversation, 
    setIsVoiceModalOpen,
    activeLanguage,
    setActiveLanguage,
    completeAndStoreConversationSummary
  } = useHealth();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<PatientSessionSummary | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    setLoading(true);
    await sendMessageToCopilot(msg);
    setLoading(false);
  };

  const handleEndAndSummarizeSession = async () => {
    setSummarizing(true);
    try {
      const summary = await completeAndStoreConversationSummary(activeConversationId);
      setSessionSummary(summary);
    } catch (e) {
      console.error('Failed to summarize session:', e);
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6">
      {/* Left Conversations Sidebar */}
      <div className="w-full lg:w-72 app-card p-4 flex flex-col justify-between">
        <div>
          <button
            onClick={() => {
              setSessionSummary(null);
              startNewConversation();
            }}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 mb-4 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Previous Health Chats
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[50vh]">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => {}}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  conv.id === activeConversationId
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="truncate">{conv.title}</span>
                  <span className="text-[9px] text-slate-400">{conv.startDate}</span>
                </div>
                {conv.summary && (
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{conv.summary}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <button
            onClick={handleEndAndSummarizeSession}
            disabled={summarizing || !currentConv?.messages.length}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {summarizing ? <Sparkles className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            <span>End & Store Analysis</span>
          </button>

          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-blue-600" />
            <span>Launch Live Voice Mode</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 app-card flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{currentConv?.title}</h2>
              <p className="text-xs text-slate-500 font-medium">Natural Language Health Navigation Agent</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleEndAndSummarizeSession}
              disabled={summarizing}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Analyze & Store Patient Record</span>
            </button>

            <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Language:</span>
              <select
                value={activeLanguage}
                onChange={(e) => setActiveLanguage(e.target.value as any)}
                className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="en">English (Auto)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="kn">కన్నడ (Kannada)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="px-6 pt-3">
          <SafetyBanner customMessage="Interactive health advice. For severe chest pain, breathlessness, or emergency signs, click Emergency." />
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {(!currentConv?.messages || currentConv.messages.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-md">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">AI Health Copilot Ready</h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm mt-1 leading-relaxed">
                  Start speaking or typing to describe your symptoms. Responses will generate dynamically live in real-time!
                </p>
              </div>
            </div>
          )}

          {currentConv?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.isEmergency
                    ? 'bg-rose-600 text-white'
                    : 'bg-teal-500 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-50 border border-blue-100 text-slate-800 rounded-tr-none font-medium'
                    : msg.isEmergency
                    ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-none font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none font-medium shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                {msg.specialistRecommendation && (
                  <div className="mt-3 p-3 bg-teal-50/90 border border-teal-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-teal-800 font-extrabold">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>Recommended Doctor Specialist: {msg.specialistRecommendation}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Based on your reported symptoms, we recommend consulting a certified <strong>{msg.specialistRecommendation}</strong> for clinical evaluation.
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <a
                        href="#/doctors"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs transition-all"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Find & Book Nearby Doctor &rarr;</span>
                      </a>
                    </div>
                  </div>
                )}
                <div className="mt-1 text-[10px] text-slate-400 text-right font-medium">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-blue-600 p-2 font-semibold">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing symptoms & formulating suggestions...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask health questions or describe how long symptoms have lasted..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 border border-slate-200 cursor-pointer"
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Patient Consultation Summary Modal */}
        {sessionSummary && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Patient Consultation Highlights</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Analyzed & Saved to Medical History</p>
                  </div>
                </div>
                <button
                  onClick={() => setSessionSummary(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Triage & Duration Header */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800">Clinical Triage Evaluation</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                    sessionSummary.triageLevel === 'EMERGENCY' ? 'bg-rose-100 text-rose-700' :
                    sessionSummary.triageLevel === 'URGENT' ? 'bg-amber-100 text-amber-700' :
                    sessionSummary.triageLevel === 'MODERATE CONCERN' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {sessionSummary.triageLevel}
                  </span>
                </div>
                <p className="text-slate-600 font-medium">
                  <strong>Reported Duration:</strong> {sessionSummary.durationAndOnset}
                </p>
                <p className="text-slate-600 font-medium">
                  <strong>Recommended Specialist:</strong> <span className="text-blue-700 font-bold">{sessionSummary.recommendedSpecialist}</span>
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Key Clinical Highlights</h4>
                <ul className="space-y-1.5">
                  {sessionSummary.keyHighlights.map((hl, i) => (
                    <li key={i} className="flex items-start space-x-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Recommendations */}
              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Recommended Health Actions</h4>
                <ul className="space-y-1.5">
                  {sessionSummary.aiRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start space-x-2 text-slate-700 font-medium">
                      <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stored Status Badge & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Permanently Stored in Patient Timeline</span>
                </span>
                <button
                  onClick={() => setSessionSummary(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

