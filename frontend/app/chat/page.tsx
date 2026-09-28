'use client';

import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  Lightbulb,
  Landmark,
  BarChart3,
  IndianRupee,
  Paperclip,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp?: string;
}

export default function ChatPage() {
  const { t, language } = useLanguage();
  const { user } = useAppStore();

  const getInitialTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      timestamp: '10:12 AM',
      content: language === 'hi'
        ? `नमस्ते ${user?.name || 'उद्यमी'}! 👋 मैं आपका UnnatE AI व्यावसायिक सलाहकार हूँ। आप मुझसे अपने बिज़नेस प्लान, MUDRA ऋण आवेदन प्रक्रिया, या नया व्यवसाय शुरू करने के बारे में कुछ भी पूछ सकते हैं।`
        : `Hello ${user?.name || 'Entrepreneur'}! 👋\nI am your UnnatE AI business advisor. Ask me anything about your business feasibility, starting a new business, MUDRA loan application steps, or government scheme eligibility.`
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [promptSetIndex, setPromptSetIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const msg = textToSend || input;
    if (!msg.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgs: ChatMessage[] = [...messages, { role: 'user', content: msg, timestamp: currentTime }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          conversationId,
        }),
      });

      const data = await res.json();
      if (data.chatId) setConversationId(data.chatId);
      if (data.message) {
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            content: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an issue connecting to the advisory intelligence service. Please check your connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Multiple rotating sets of suggested business questions
  const promptSets = language === 'hi' ? [
    [
      'नया व्यवसाय शुरू करने से पहले मुझे क्या जानना चाहिए?',
      'MUDRA लोन के लिए कौन से दस्तावेज़ चाहिए?',
      '5 लाख रुपये के लोन की मासिक EMI कितनी होगी?'
    ],
    [
      'PMEGP योजना में महिला उद्यमियों के लिए कितनी सब्सिडी मिलती है?',
      'Udyam पोर्टल पर MSME रजिस्ट्रेशन कैसे करें?',
      'क्या CGTMSE के तहत बिना गारंटी के लोन मिल सकता है?'
    ],
    [
      'मेरे ज़िले में कौन से उद्योग सबसे ज़्यादा मुनाफ़े वाले हैं?',
      'फूड प्रोसेसिंग यूनिट शुरू करने के लिए कौन से लाइसेंस ज़रूरी हैं?',
      'बिज़नेस के लिए वर्किंग कैपिटल की गणना कैसे करें?'
    ]
  ] : [
    [
      'What shall I know before I start a business?',
      'What documents are needed for a MUDRA loan?',
      'What will be the monthly EMI for a ₹5 Lakh loan?'
    ],
    [
      'What is the PMEGP subsidy percentage for rural entrepreneurs?',
      'How do I register for Udyam MSME certification online?',
      'Can I get a collateral-free bank loan under CGTMSE?'
    ],
    [
      'What are the highest demand manufacturing sectors in my district?',
      'What statutory licenses are required for an agri-food enterprise?',
      'How to calculate working capital requirement for inventory?'
    ]
  ];

  const currentPrompts = promptSets[promptSetIndex % promptSets.length];

  const cyclePrompts = () => {
    setPromptSetIndex((prev) => (prev + 1) % promptSets.length);
  };

  // Quick contextual categories directly aligned with the visual hero badges
  const quickCategories = [
    {
      id: 'guidance',
      title: 'Business Guidance',
      icon: Lightbulb,
      color: 'amber',
      query: 'What are the essential steps to plan a viable MSME business model and assess market feasibility?'
    },
    {
      id: 'scheme',
      title: 'Scheme Eligibility',
      icon: Landmark,
      color: 'orange',
      query: 'Which central and state government MSME subsidy schemes (PMEGP, Mudra, ODOP) am I eligible for?'
    },
    {
      id: 'market',
      title: 'Market Insights',
      icon: BarChart3,
      color: 'emerald',
      query: 'How do I analyze local census demand, customer demographics, and nearest district competition?'
    },
    {
      id: 'loan',
      title: 'Loan Planning',
      icon: IndianRupee,
      color: 'orange',
      query: 'What are the MUDRA loan categories (Shishu, Kishore, Tarun) and interest rate expectations?'
    }
  ];

  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;
      const isHeading = line.startsWith('###');
      if (isHeading) {
        formatted = line.replace(/^###\s*/, '');
      }

      const parts = formatted.split(/(\*\*.*?\*\*)/g);
      const lineElements = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-[#0B1736]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isHeading) {
        return (
          <div key={idx} className="text-xs sm:text-sm font-bold text-[#0B1736] mt-3 mb-1.5 border-b border-emerald-100 pb-1">
            {lineElements}
          </div>
        );
      }

      return (
        <div key={idx} className={line.trim() === '' ? 'h-2' : 'py-0.5'}>
          {lineElements}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-[1520px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 flex flex-col gap-5 min-w-0">
          
          {/* ========================================================================= */}
          {/* 1. EDITORIAL HERO BANNER WITH GENERAL INDIA AI ADVISOR ARTWORK             */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between min-h-[175px]">
              
              {/* Left Editorial Copy */}
              <div className="p-6 sm:p-8 lg:max-w-[55%] z-10 space-y-2">
                <span className="text-[11px] font-extrabold text-[#159A68] tracking-widest uppercase block">
                  AI ADVISOR
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-serif font-black text-[#0B1736] tracking-tight leading-tight">
                  UnnatE AI Advisor
                </h1>
                <p className="text-sm font-medium text-slate-700 leading-snug">
                  Your intelligent partner for business growth.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl pt-0.5">
                  Get personalized guidance on business feasibility, government schemes, MUDRA loans, market opportunities and more — powered by multi-model AI.
                </p>
              </div>

              {/* Right Illustration Composition with Floating Quick Actions */}
              <div className="relative lg:w-[45%] h-52 sm:h-56 lg:h-48 overflow-hidden flex items-center justify-center shrink-0">
                {/* Gradient blend on left to fade gracefully into white */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none hidden lg:block" />

                {/* General India Tech & Entrepreneurship Hero Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ai-advisor-hero.jpg"
                  alt="UnnatE AI Advisor - Guiding Indian MSMEs and Entrepreneurs"
                  className="w-full h-full object-cover object-right"
                />

                {/* Floating Contextual Badges (Direct Visual Reference) */}
                <div className="absolute inset-0 z-20 pointer-events-none p-3 hidden sm:block">
                  {/* Top-Left: Business Guidance */}
                  <button
                    type="button"
                    onClick={() => handleSend(quickCategories[0].query)}
                    className="pointer-events-auto absolute top-3 left-4 bg-white/95 backdrop-blur-xs border border-amber-200/90 rounded-full px-3 py-1.5 shadow-2xs flex items-center gap-2 hover:bg-amber-50 hover:border-amber-300 transition-all text-left cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-100/90 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shrink-0">
                      <Lightbulb className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-[#0B1736] leading-tight whitespace-nowrap">
                      Business<br className="sm:hidden" /> Guidance
                    </span>
                  </button>

                  {/* Top-Right: Scheme Eligibility */}
                  <button
                    type="button"
                    onClick={() => handleSend(quickCategories[1].query)}
                    className="pointer-events-auto absolute top-3 right-4 bg-white/95 backdrop-blur-xs border border-amber-200/90 rounded-full px-3 py-1.5 shadow-2xs flex items-center gap-2 hover:bg-amber-50 hover:border-amber-300 transition-all text-left cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-100/90 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shrink-0">
                      <Landmark className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-[#0B1736] leading-tight whitespace-nowrap">
                      Scheme<br className="sm:hidden" /> Eligibility
                    </span>
                  </button>

                  {/* Bottom-Left: Market Insights */}
                  <button
                    type="button"
                    onClick={() => handleSend(quickCategories[2].query)}
                    className="pointer-events-auto absolute bottom-3 left-10 bg-white/95 backdrop-blur-xs border border-emerald-200/90 rounded-full px-3 py-1.5 shadow-2xs flex items-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100/90 flex items-center justify-center text-[#159A68] group-hover:scale-110 transition-transform shrink-0">
                      <BarChart3 className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-[#0B1736] leading-tight whitespace-nowrap">
                      Market<br className="sm:hidden" /> Insights
                    </span>
                  </button>

                  {/* Bottom-Right: Loan Planning */}
                  <button
                    type="button"
                    onClick={() => handleSend(quickCategories[3].query)}
                    className="pointer-events-auto absolute bottom-3 right-4 bg-white/95 backdrop-blur-xs border border-orange-200/90 rounded-full px-3 py-1.5 shadow-2xs flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300 transition-all text-left cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-orange-100/90 flex items-center justify-center text-[#F4A340] group-hover:scale-110 transition-transform shrink-0">
                      <IndianRupee className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-[#0B1736] leading-tight whitespace-nowrap">
                      Loan<br className="sm:hidden" /> Planning
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. CHAT CONVERSATION WORKSPACE CONTAINER                                   */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex-1 flex flex-col min-h-[520px] relative overflow-hidden">
            
            {/* Messages Thread Container */}
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-5 relative">
              
              {/* Subtle Decorative Bharat Landscape Silhouette in Empty Lower Space */}
              <div className="absolute right-0 bottom-0 w-full max-w-2xl h-44 pointer-events-none opacity-25 select-none overflow-hidden flex items-end justify-end">
                <svg
                  viewBox="0 0 600 140"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-slate-400"
                >
                  {/* Subtle Sun */}
                  <circle cx="430" cy="90" r="28" fill="#F4A340" fillOpacity="0.25" />
                  
                  {/* Gentle Rolling Farm Hills and Enterprise Outlines */}
                  <path
                    d="M0 135 C120 132, 190 120, 290 125 C390 130, 480 115, 600 128 L600 140 L0 140 Z"
                    fill="#159A68"
                    fillOpacity="0.08"
                  />
                  
                  {/* Rural Workshop and Shop Silhouette */}
                  <rect x="360" y="105" width="22" height="18" rx="2" fill="#64748B" fillOpacity="0.2" />
                  <polygon points="357,105 371,94 385,105" fill="#64748B" fillOpacity="0.3" />
                  <rect x="400" y="100" width="28" height="23" rx="2" fill="#64748B" fillOpacity="0.2" />
                  <polygon points="396,100 414,88 432,100" fill="#64748B" fillOpacity="0.3" />
                  <line x1="422" y1="88" x2="422" y2="76" stroke="#64748B" strokeWidth="2" strokeOpacity="0.3" />

                  {/* Minimalist Trees */}
                  <circle cx="340" cy="112" r="7" fill="#159A68" fillOpacity="0.2" />
                  <line x1="340" y1="119" x2="340" y2="128" stroke="#159A68" strokeWidth="1.5" strokeOpacity="0.3" />
                  <circle cx="450" cy="110" r="8" fill="#159A68" fillOpacity="0.2" />
                  <line x1="450" y1="118" x2="450" y2="126" stroke="#159A68" strokeWidth="1.5" strokeOpacity="0.3" />

                  {/* Flowing National Tricolor Ribbon Wave */}
                  <path
                    d="M180 118 C280 102, 380 126, 590 85"
                    stroke="#FF9933"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeOpacity="0.5"
                  />
                  <path
                    d="M180 122 C280 106, 380 130, 590 89"
                    stroke="#E2E8F0"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                  />
                  <path
                    d="M180 126 C280 110, 380 134, 590 93"
                    stroke="#138808"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeOpacity="0.5"
                  />
                </svg>
              </div>

              {/* Message Items */}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3.5 max-w-3xl relative z-10 ${
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                      m.role === 'user'
                        ? 'bg-[#0B1736] text-white border border-slate-700'
                        : 'bg-[#EAF7F0] border border-[#159A68]/30 text-[#159A68]'
                    }`}
                  >
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble Container */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed transition-all shadow-2xs ${
                      m.role === 'user'
                        ? 'bg-[#0B1736] text-white rounded-tr-none'
                        : 'bg-[#F0FAF5] text-[#0B1736] rounded-tl-none border border-[#159A68]/20'
                    }`}
                  >
                    {/* Timestamp header */}
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        m.role === 'user' ? 'text-slate-300' : 'text-[#159A68]'
                      }`}>
                        {m.role === 'user' ? (user?.name || 'You') : 'UnnatE AI Advisor'}
                      </span>
                      {m.timestamp && (
                        <span className={`text-[10px] ${m.role === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                          {m.timestamp}
                        </span>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="whitespace-pre-wrap">
                      {renderFormattedContent(m.content)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex gap-3.5 mr-auto relative z-10">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF7F0] border border-[#159A68]/30 text-[#159A68] flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin text-[#159A68]" />
                  </div>
                  <div className="p-3.5 bg-[#F0FAF5] rounded-2xl rounded-tl-none border border-[#159A68]/20 text-xs text-[#0B1736] font-medium shadow-2xs flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#159A68] animate-ping" />
                    <span>UnnatE AI Advisor synthesizing response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ===================================================================== */}
            {/* 3. SUGGESTED QUESTIONS (TRY ASKING...)                                */}
            {/* ===================================================================== */}
            <div className="px-5 sm:px-6 pt-3 pb-2 border-t border-slate-100 bg-white/90 relative z-10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1736]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4A340]" />
                  <span>Try asking...</span>
                </div>
                <button
                  type="button"
                  onClick={cyclePrompts}
                  className="text-xs font-bold text-[#159A68] hover:text-[#128357] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View more examples</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Suggestions Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {currentPrompts.map((qp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(qp)}
                    className="p-3 rounded-xl bg-white border border-slate-200/90 hover:border-[#159A68]/40 hover:bg-[#F0FAF5]/70 transition-all flex items-start gap-2.5 text-left group shadow-2xs cursor-pointer"
                  >
                    <div className="p-1 rounded-md bg-amber-50 text-[#F4A340] shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-[#0B1736] group-hover:text-[#159A68] leading-snug">
                      {qp}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 4. INPUT AREA BAR (DOCK AT BOTTOM)                                   */}
            {/* ===================================================================== */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-4 sm:p-5 border-t border-slate-100 bg-white relative z-10"
            >
              <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 shadow-2xs focus-within:ring-2 focus-within:ring-[#159A68]/20 focus-within:border-[#159A68] transition-all">
                {/* Paperclip attachment icon */}
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-[#0B1736] rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Attach file (optional)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Input Text Box */}
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'अपना व्यावसायिक प्रश्न यहाँ पूछें...' : 'Ask your business query here...'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#0B1736] placeholder:text-slate-400 focus:outline-none px-2"
                />

                {/* Forest Green Send Button */}
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>

        </main>
      </div>
    </div>
  );
}
