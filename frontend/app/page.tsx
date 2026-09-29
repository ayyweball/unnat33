'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Navbar from '@/components/Navbar';
import HowItWorksJourney from '@/components/HowItWorksJourney';
import ScrollRevealDashboard from '@/components/ScrollRevealDashboard';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Landmark,
  BadgeIndianRupee,
  FileSpreadsheet,
  ShieldCheck,
  Building2,
  Store,
  Utensils,
  Wheat,
  Wrench,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  ExternalLink,
  Layers,
  Activity,
  FileCheck2,
  Sliders,
} from 'lucide-react';

export default function LandingPage() {
  const { t, language } = useLanguage();
  const { user } = useAppStore();
  const shouldReduceMotion = useReducedMotion();

  // Parallax: hero background drifts subtly upward as user scrolls
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(
    heroScrollY,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [0, -30]
  );

  // Stagger variants for feature cards
  const cardContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 } },
  };
  const cardItemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  };

  // Fade-up for section headers
  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: (delay: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.6, delay, ease: 'easeOut' },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-[#0B1736] font-sans selection:bg-[#159A68] selection:text-white">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION — CINEMATIC PHOTOGRAPHIC BHARAT ENTERPRISE */}
      {/* ========================================================================= */}
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-[560px] lg:min-h-[580px] bg-gradient-to-b from-[#EEF4FB] via-[#F4F7FB] to-white"
      >
        {/* Parallax background image — shifted upward by 80px */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 will-change-transform"
          style={{ y: parallaxY }}
        >
          <img
            src="/hero-bg.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-[calc(100%+80px)] object-cover"
            style={{ objectPosition: '25% top', transform: 'translateY(-80px)' }}
            draggable={false}
          />
        </motion.div>

        {/* Overlays: soft light-blue/cool-white palette */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          {/* Right fade: keep left (woman) clear, fade right into cool-white/light-blue for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent via-35% to-[#EEF4FB]/85 lg:to-[#F4F8FB]/95" />
          {/* Bottom fade: soft cool-white transition */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-50% to-[#F4F7FB]" />
        </div>

        {/* Subtle Saffron/White/Green Curved Corner Accent (Top-Right) */}
        <div className="absolute top-0 right-0 w-36 sm:w-48 h-36 sm:h-48 overflow-hidden pointer-events-none select-none z-10 opacity-70" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M100 0 L0 0 C30 15, 70 45, 100 85 Z" fill="#0B1736" fillOpacity="0.04" />
            <path d="M100 0 L35 0 C55 25, 80 50, 100 65 Z" fill="#F4A340" fillOpacity="0.3" />
            <path d="M100 15 C85 35, 65 48, 50 0 L56 0 C70 40, 88 28, 100 10 Z" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M100 0 L68 0 C80 22, 90 32, 100 32 Z" fill="#159A68" fillOpacity="0.35" />
          </svg>
        </div>

        {/* Restrained Indian Architectural Line-Art in Unused Background Space */}
        <div className="absolute right-4 lg:right-12 top-6 lg:top-10 pointer-events-none select-none z-0 opacity-12 sm:opacity-15 w-64 lg:w-80 h-44 lg:h-56 hidden sm:block" aria-hidden="true">
          <svg viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Plinth Base */}
            <line x1="20" y1="145" x2="260" y2="145" stroke="#0B1736" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="32" y1="141" x2="248" y2="141" stroke="#0B1736" strokeWidth="0.8" />
            <line x1="44" y1="137" x2="236" y2="137" stroke="#159A68" strokeWidth="0.8" strokeOpacity="0.8" />
            {/* Colonnade Pillars */}
            {[52, 76, 100, 124, 156, 180, 204, 228].map((px) => (
              <rect key={px} x={px} y="75" width="7" height="62" stroke="#0B1736" strokeWidth="0.8" fill="#FFFFFF" fillOpacity="0.5" />
            ))}
            {/* Architrave */}
            <rect x="42" y="66" width="196" height="9" stroke="#0B1736" strokeWidth="1" fill="#EEF4FB" />
            <line x1="42" y1="70" x2="238" y2="70" stroke="#F4A340" strokeWidth="0.8" />
            {/* Pediment */}
            <polygon points="42,66 140,32 238,66" stroke="#0B1736" strokeWidth="1.1" fill="#FFFFFF" fillOpacity="0.5" />
            {/* Ashoka Wheel Insignia */}
            <circle cx="140" cy="49" r="6" stroke="#159A68" strokeWidth="0.8" />
            <circle cx="140" cy="49" r="2" fill="#159A68" />
            {/* Central Dome */}
            <path d="M110,32 C110,12, 170,12, 170,32" stroke="#0B1736" strokeWidth="0.9" fill="#EEF4FB" fillOpacity="0.6" />
            <line x1="140" y1="12" x2="140" y2="4" stroke="#F4A340" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="140" cy="3" r="1.5" fill="#F4A340" />
          </svg>
        </div>

        {/* Hero Content — upper-right, matching reference badge position */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 lg:pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left spacer: woman lives here */}
            <div className="hidden lg:block lg:col-span-5 pointer-events-none" />

            {/* Right: content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left lg:pl-10 lg:translate-x-[80px]">

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-[#0B1736] tracking-tight leading-[1.08]"
              >
                {language === 'hi' ? (
                  <>
                    स्थानीय अंतर्दृष्टि से<br className="hidden sm:inline" /> सशक्त भारतीय उद्यम।
                  </>
                ) : (
                  <>
                    Turn Local Insight<br className="hidden sm:inline" /> Into Better Business.
                  </>
                )}
              </motion.h1>

              {/* Body */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-3.5 text-sm sm:text-base text-slate-700 max-w-lg leading-relaxed font-medium"
              >
                {language === 'hi'
                  ? 'UnnatE सूक्ष्म और ग्रामीण उद्यमियों को बाजार मांग समझने, पूंजी संरचना की योजना बनाने, सरकारी अनुदान खोजने और 13-अनुभाग बैंक DPR तैयार करने में सहायता करता है।'
                  : 'UnnatE helps entrepreneurs discover local opportunities, access government support, structure the right capital, and build bank-ready business plans — all in one place.'}
              </motion.p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-5">
                <Link
                  href={user ? '/dashboard' : '/login?redirect=/dashboard'}
                  className="h-11 inline-flex items-center justify-center gap-2 px-5 rounded-[10px] bg-[#0B1736] hover:bg-[#159A68] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  <span>{language === 'hi' ? 'प्लेटफ़ॉर्म एक्सप्लोर करें' : 'Explore Your Business'}</span>
                  <ArrowRight className="w-4 h-4 text-white/90" />
                </Link>
                <Link
                  href={user ? '/advisory/schemes' : '/login?redirect=/advisory/schemes'}
                  className="h-11 inline-flex items-center justify-center gap-2 px-5 rounded-[10px] bg-white hover:bg-[#F4F7FB] text-[#0B1736] text-xs font-semibold border border-[#D9DEE5] hover:border-slate-300 shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  <Landmark className="w-4 h-4 text-[#159A68]" />
                  <span>{language === 'hi' ? 'सरकारी योजनाएं' : 'Explore Schemes'}</span>
                </Link>
                <Link
                  href="/simulator"
                  className="h-11 inline-flex items-center justify-center gap-2 px-5 rounded-[10px] bg-white hover:bg-[#F4F7FB] text-[#0B1736] text-xs font-semibold border border-[#D9DEE5] hover:border-slate-300 shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  <Sliders className="w-4 h-4 text-[#159A68]" />
                  <span>{language === 'hi' ? 'व्हाट-इफ सिम्युलेटर' : 'What-If Simulator'}</span>
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* Feature Highlights — bottom-floating feature strip 30px above hero bottom edge */}
        <motion.div
          className="relative lg:absolute lg:bottom-[30px] lg:inset-x-0 z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 lg:mt-0 pb-8 sm:pb-10 lg:pb-0"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            <motion.div variants={cardItemVariants} className="p-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200/80 flex items-start gap-3 hover:border-emerald-300 transition-colors shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#EAF6F0] text-[#159A68] flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">785 Districts</span>
                <span className="text-xs font-bold text-[#0B1736] block mt-0.5 leading-snug">Empirical Census &amp; Mandi Insights</span>
              </div>
            </motion.div>

            <motion.div variants={cardItemVariants} className="p-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200/80 flex items-start gap-3 hover:border-blue-300 transition-colors shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <BadgeIndianRupee className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">₹125+ Cr Catalogued</span>
                <span className="text-xs font-bold text-[#0B1736] block mt-0.5 leading-snug">Priority Subsidies &amp; Credit Lines</span>
              </div>
            </motion.div>

            <motion.div variants={cardItemVariants} className="p-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200/80 flex items-start gap-3 hover:border-amber-300 transition-colors shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F4A340] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">100% Deterministic</span>
                <span className="text-xs font-bold text-[#0B1736] block mt-0.5 leading-snug">Negligible AI Hallucinations in Grants</span>
              </div>
            </motion.div>

            <motion.div variants={cardItemVariants} className="p-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200/80 flex items-start gap-3 hover:border-purple-300 transition-colors shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">&lt; 60 Sec DPR</span>
                <span className="text-xs font-bold text-[#0B1736] block mt-0.5 leading-snug">11-Section Canonical PDF Export</span>
              </div>
            </motion.div>

          </div>
        </motion.div>

      </section>

      {/* ========================================================================= */}
      {/* 2. HOW UNNATE WORKS (Continuous Editorial 4-Step Journey) */}
      {/* ========================================================================= */}
      <HowItWorksJourney />

      {/* ========================================================================= */}
      {/* 3. ADVISORY MODULES SECTION */}
      {/* ========================================================================= */}
      <section id="analysis" className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <ScrollRevealDashboard />
      </section>

      {/* ========================================================================= */}
      {/* 4. BUILT FOR REAL-WORLD MICRO & RURAL ENTERPRISES */}
      {/* ========================================================================= */}
      <section id="entrepreneurs" className="py-20 sm:py-28 bg-[#F4F7FB] border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs font-bold text-[#159A68] uppercase tracking-wider block mb-2">
              {language === 'hi' ? 'प्राथमिक व्यापार श्रेणियां' : 'Foundational Trade Categories'}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-[#0B1736] tracking-tight leading-[1.15] mb-4">
              {language === 'hi' ? 'वास्तविक भारतीय उद्यमों के लिए निर्मित' : 'Built for Real-World Micro & Rural Enterprises'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {language === 'hi'
                ? 'भारत के प्राथमिक वाणिज्यिक क्षेत्रों में स्थानीय उद्यमियों के लिए विशेष रूप से संरचित व्यावहारिक सलाह।'
                : "Practical advisory structured specifically for local entrepreneurs across India's primary commercial sectors."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Category 1 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#159A68] transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#EAF6F0] text-[#159A68] flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1736] mb-2 group-hover:text-[#159A68] transition-colors">
                  {language === 'hi' ? 'खुदरा एवं सूक्ष्म व्यापार' : 'Retail & Micro-Commerce'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {language === 'hi'
                    ? 'किराना स्टोर, ग्रामीण वितरक, परिधान दुकानें, और दैनिक आवश्यक वस्तुओं की दुकानें।'
                    : 'Kirana stores, rural distributors, apparel shops, and daily necessities retail.'}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                <span className="text-[11px] font-bold text-[#159A68]">
                  PM SVANidhi &amp; MUDRA Shishu
                </span>
              </div>
            </div>

            {/* Category 2 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#159A68] transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                  <Utensils className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1736] mb-2 group-hover:text-[#159A68] transition-colors">
                  {language === 'hi' ? 'खाद्य एवं कृषि प्रसंस्करण' : 'Food & Agro-Processing'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {language === 'hi'
                    ? 'दुग्ध संग्रहण इकाइयां, अनाज और आटा मिलें, बेकरी, और कोल्ड चेन लॉजिस्टिक्स।'
                    : 'Dairy collection units, grain and flour milling, bakery, and cold chain logistics.'}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                <span className="text-[11px] font-bold text-[#159A68]">
                  PMEGP &amp; PMFME Subsidies
                </span>
              </div>
            </div>

            {/* Category 3 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#159A68] transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#F4A340] flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                  <Wheat className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1736] mb-2 group-hover:text-[#159A68] transition-colors">
                  {language === 'hi' ? 'कृषि एवं संबद्ध उद्यम' : 'Agriculture & Allied'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {language === 'hi'
                    ? 'संरक्षित पॉलीहाउस, पोल्ट्री इकाइयां, सौर जल पंपिंग, और बीज उत्पादन।'
                    : 'Protected polyhouses, poultry units, solar water pumping, and seed production.'}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                <span className="text-[11px] font-bold text-[#159A68]">
                  AIF &amp; NABARD Refinance
                </span>
              </div>
            </div>

            {/* Category 4 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#159A68] transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1736] mb-2 group-hover:text-[#159A68] transition-colors">
                  {language === 'hi' ? 'स्थानीय सेवाएं एवं कारीगर' : 'Local Services & Artisans'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {language === 'hi'
                    ? 'हथकरघा बुनाई, हल्का फैब्रिकेशन, ऑटोमोबाइल मरम्मत, और विद्युत कार्यशालाएं।'
                    : 'Handloom weaving, light fabrication, automotive repair, and electrical workshops.'}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                <span className="text-[11px] font-bold text-[#159A68]">
                  PM Vishwakarma &amp; CGTMSE
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. EMPIRICAL DISTRICT INSIGHTS */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
            <div className="lg:col-span-8">
              <span className="text-xs font-bold text-[#159A68] uppercase tracking-wider block mb-2">
                {language === 'hi' ? 'सांख्यिकीय जिला विश्लेषण' : 'Empirical District Insights'}
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-[#0B1736] tracking-tight leading-[1.15] mb-4">
                {language === 'hi' ? (
                  <>आपके जिले की अपनी कहानी है।<br />UnnatE इसे पढ़ने में मदद करता है।</>
                ) : (
                  <>Your district has a story.<br />UnnatE helps you read it.</>
                )}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
                {language === 'hi'
                  ? 'प्रत्येक भारतीय जिला अलग आपूर्ति श्रृंखला अंतराल और उपभोक्ता अवशोषण दर प्रदर्शित करता है। हम आधिकारिक जनगणना डेटा और उद्यम रजिस्टरों को स्पष्ट, व्यावहारिक व्यावसायिक मार्गदर्शन में मैप करते हैं।'
                  : 'Every Indian district exhibits distinct supply chain gaps and consumer absorption rates. We map official census data and enterprise registers into clear, actionable business guidance.'}
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#EAF6F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
                <span>{language === 'hi' ? '785 जिले सक्रिय सिंक्रनाइज़' : '785 Districts Active Telemetry'}</span>
              </div>
            </div>
          </div>

          {/* Unified Intelligence Panel with 4 Data Columns */}
          <div className="bg-[#F4F7FB] rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
              
              {/* Column 1 */}
              <div className="p-6 sm:p-8 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'मांग अवशोषण' : 'Demand Absorption'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#0B1736] tracking-tight">
                  88 / 100
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {language === 'hi'
                    ? 'क्षेत्रीय आपूर्ति घाटे के साथ उच्च स्थानीय उपभोग दर।'
                    : 'High local consumption with regional supply deficit.'}
                </p>
              </div>

              {/* Column 2 */}
              <div className="p-6 sm:p-8 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'उद्यम घनत्व' : 'Enterprise Density'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#0B1736] tracking-tight">
                  14,200+
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {language === 'hi'
                    ? 'वर्तमान जिला क्लस्टर में सक्रिय पंजीकृत सूक्ष्म इकाइयां।'
                    : 'Active registered micro units in current district cluster.'}
                </p>
              </div>

              {/* Column 3 */}
              <div className="p-6 sm:p-8 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'ग्राहक पहुंच' : 'Customer Catchment'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#0B1736] tracking-tight">
                  Tier 2 / 3
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {language === 'hi'
                    ? '20 किमी वाणिज्यिक दायरे में उच्च घरेलू घनत्व।'
                    : 'High household density within a 20km commercial radius.'}
                </p>
              </div>

              {/* Column 4 */}
              <div className="p-6 sm:p-8 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'विकास गति' : 'Growth Velocity'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#159A68] tracking-tight">
                  +18.4% YoY
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {language === 'hi'
                    ? 'प्राथमिक व्यापार श्रेणियों में निरंतर बढ़ता व्यापार परिमाण।'
                    : 'Expanding trade volume across primary commercial categories.'}
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STRONG FINAL CTA */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-[#EEF4FB] via-[#F4F8FC] to-[#E5EFF9] text-[#0B1736] border-t border-b border-slate-200/90 relative overflow-hidden">
        {/* Subtle Atmospheric Light & Saffron/Green Accents */}
        <div
          aria-hidden="true"
          className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-[#159A68]/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#F4A340]/10 blur-3xl pointer-events-none"
        />

        {/* Subtle Saffron/White/Green Curved Corner Accent (Top-Right) */}
        <div className="absolute top-0 right-0 w-36 sm:w-52 h-36 sm:h-52 overflow-hidden pointer-events-none select-none z-0 opacity-70" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M100 0 L0 0 C30 15, 70 45, 100 85 Z" fill="#0B1736" fillOpacity="0.03" />
            <path d="M100 0 L35 0 C55 25, 80 50, 100 65 Z" fill="#F4A340" fillOpacity="0.3" />
            <path d="M100 15 C85 35, 65 48, 50 0 L56 0 C70 40, 88 28, 100 10 Z" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M100 0 L68 0 C80 22, 90 32, 100 32 Z" fill="#159A68" fillOpacity="0.35" />
          </svg>
        </div>

        {/* Subtle Curved Accent (Bottom-Left) */}
        <div className="absolute bottom-0 left-0 w-32 sm:w-44 h-32 sm:h-44 overflow-hidden pointer-events-none select-none z-0 opacity-60" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0 100 L100 100 C70 85, 30 55, 0 15 Z" fill="#0B1736" fillOpacity="0.03" />
            <path d="M0 100 L65 100 C45 75, 20 50, 0 35 Z" fill="#159A68" fillOpacity="0.25" />
            <path d="M0 85 C15 65, 35 52, 50 100 L44 100 C30 60, 12 72, 0 90 Z" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M0 100 L32 100 C20 78, 10 68, 0 68 Z" fill="#F4A340" fillOpacity="0.25" />
          </svg>
        </div>

        {/* Restrained Indian Architectural Line-Art Watermark in Unused Space */}
        <div className="absolute left-1/2 -translate-x-1/2 top-10 pointer-events-none select-none z-0 opacity-10 w-96 sm:w-[500px] h-60 hidden sm:block" aria-hidden="true">
          <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <line x1="20" y1="145" x2="300" y2="145" stroke="#0B1736" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="40" y1="140" x2="280" y2="140" stroke="#0B1736" strokeWidth="0.8" />
            <line x1="60" y1="136" x2="260" y2="136" stroke="#159A68" strokeWidth="0.8" strokeOpacity="0.7" />
            {[60, 88, 116, 144, 176, 204, 232, 260].map((px) => (
              <rect key={px} x={px} y="76" width="8" height="60" stroke="#0B1736" strokeWidth="0.8" fill="#FFFFFF" fillOpacity="0.4" />
            ))}
            <rect x="48" y="66" width="224" height="10" stroke="#0B1736" strokeWidth="1" fill="#EEF4FB" />
            <polygon points="48,66 160,28 272,66" stroke="#0B1736" strokeWidth="1.1" fill="#FFFFFF" fillOpacity="0.4" />
            <circle cx="160" cy="46" r="7" stroke="#159A68" strokeWidth="0.8" />
            <circle cx="160" cy="46" r="2.2" fill="#159A68" />
            <path d="M125 28 C125 6, 195 6, 195 28" stroke="#0B1736" strokeWidth="0.9" fill="#EEF4FB" fillOpacity="0.5" />
            <line x1="160" y1="6" x2="160" y2="0" stroke="#F4A340" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 text-[#159A68] text-xs font-black tracking-wider uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F4A340]" />
            <span>{language === 'hi' ? 'आज ही शुरुआत करें' : 'Start Your Enterprise Journey'}</span>
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-[#0B1736] tracking-tight leading-[1.12]">
            {language === 'hi' ? (
              <>आपका अगला व्यावसायिक निर्णय<br />बेहतर जानकारी से शुरू होता है।</>
            ) : (
              <>Your next business decision<br />starts with better information.</>
            )}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
            {language === 'hi'
              ? 'अपने बाजार को समझें। सही सहायता प्राप्त करें। आत्मविश्वास के साथ निर्माण करें।'
              : 'Understand your market. Find the right support. Build with confidence.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href={user ? '/dashboard' : '/login?redirect=/dashboard'}
              className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 rounded-xl bg-[#159A68] hover:bg-[#0E754E] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
            >
              <span>{language === 'hi' ? 'व्यावसायिक विश्लेषण शुरू करें' : 'Start Your Business Analysis'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href={user ? '/advisory/schemes' : '/login?redirect=/advisory/schemes'}
              className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-white hover:bg-[#F4F7FB] text-[#0B1736] font-bold text-xs border border-[#D9DEE5] hover:border-slate-300 shadow-xs transition-colors duration-200 cursor-pointer"
            >
              <span>{language === 'hi' ? 'सरकारी योजनाएं देखें' : 'Review Government Schemes'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 7. INSTITUTIONAL PUBLIC INFRASTRUCTURE FOOTER */}
      {/* ========================================================================= */}
      <footer id="about" className="relative overflow-hidden bg-[#F0F4F9] text-slate-700 pt-12 pb-8 border-t border-slate-200/90">
        
        {/* Top Edge Tricolor Ribbon Accent */}
        <div className="absolute top-0 inset-x-0 h-1 overflow-hidden pointer-events-none select-none z-10" aria-hidden="true">
          <div className="w-full h-full flex">
            <div className="w-1/3 bg-[#F4A340]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#159A68]" />
          </div>
        </div>

        {/* Subtle Saffron/White/Green Curved Corner Accent */}
        <div className="absolute top-0 right-0 w-32 sm:w-44 h-32 sm:h-44 overflow-hidden pointer-events-none select-none z-0 opacity-50" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M100 0 L0 0 C30 15, 70 45, 100 85 Z" fill="#0B1736" fillOpacity="0.03" />
            <path d="M100 0 L35 0 C55 25, 80 50, 100 65 Z" fill="#F4A340" fillOpacity="0.25" />
            <path d="M100 15 C85 35, 65 48, 50 0 L56 0 C70 40, 88 28, 100 10 Z" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M100 0 L68 0 C80 22, 90 32, 100 32 Z" fill="#159A68" fillOpacity="0.25" />
          </svg>
        </div>

        {/* Restrained Indian Architectural Line-Art in Unused Space */}
        <div className="absolute right-6 bottom-4 pointer-events-none select-none z-0 opacity-8 sm:opacity-10 w-56 h-36 hidden md:block" aria-hidden="true">
          <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <line x1="10" y1="110" x2="190" y2="110" stroke="#0B1736" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="20" y1="106" x2="180" y2="106" stroke="#0B1736" strokeWidth="0.8" />
            <line x1="30" y1="102" x2="170" y2="102" stroke="#159A68" strokeWidth="0.8" />
            {[40, 65, 90, 115, 140, 165].map((px) => (
              <rect key={px} x={px} y="56" width="6" height="46" stroke="#0B1736" strokeWidth="0.8" fill="#FFFFFF" fillOpacity="0.6" />
            ))}
            <rect x="30" y="48" width="140" height="8" stroke="#0B1736" strokeWidth="1" fill="#EEF4FB" />
            <polygon points="30,48 100,22 170,48" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" fillOpacity="0.5" />
            <circle cx="100" cy="35" r="4.5" stroke="#159A68" strokeWidth="0.8" />
            <path d="M80 22 C80 8, 120 8, 120 22" stroke="#0B1736" strokeWidth="0.8" fill="#EEF4FB" />
            <line x1="100" y1="8" x2="100" y2="2" stroke="#F4A340" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-slate-200/80">
            
            {/* Column 1: Brand Column (~30-33%) */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-3.5">
              <Link href="/" className="inline-flex items-center bg-white px-3 py-1.5 rounded-xl shadow-xs border border-slate-200/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="UnnatE Logo"
                  className="h-7 w-auto object-contain"
                />
              </Link>

              <p className="text-[11px] font-bold tracking-widest text-[#D97706] uppercase">
                PLAN • GROW • SUCCEED
              </p>

              <p className="text-xs text-slate-600 leading-relaxed font-normal max-w-sm">
                AI-driven business advisory and financial structuring for Indian micro and rural entrepreneurs.
              </p>
            </div>

            {/* Column 2: Platform */}
            <div className="lg:col-span-2 space-y-3 text-xs">
              <span className="font-bold text-[#0B1736] uppercase tracking-wider block mb-1">
                PLATFORM
              </span>
              <ul className="space-y-2.5">
                <li>
                  <Link href="#how-it-works" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#analysis" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Business Advisory
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Advisory Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#entrepreneurs" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Target Enterprises
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="lg:col-span-3 space-y-3 text-xs">
              <span className="font-bold text-[#0B1736] uppercase tracking-wider block mb-1">
                RESOURCES
              </span>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/advisory/schemes" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Scheme Matcher
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/market-analysis" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Market Analysis
                  </Link>
                </li>
                <li>
                  <Link href="/advisory/financial" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Financing Options
                  </Link>
                </li>
                <li>
                  <Link href="/advisory/business-plan" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    DPR Builder
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Insights &amp; Reports
                  </Link>
                </li>
                <li>
                  <Link href="/simulator" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    What-If Simulator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: About */}
            <div className="lg:col-span-3 space-y-3 text-xs">
              <span className="font-bold text-[#0B1736] uppercase tracking-wider block mb-1">
                ABOUT
              </span>
              <ul className="space-y-2.5">
                <li>
                  <Link href="#about" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    About UnnatE
                  </Link>
                </li>
                <li>
                  <Link href="mailto:support@unnate.in" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-slate-600 hover:text-[#159A68] transition-colors duration-150">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Compact Understated CTA Strip */}
          <div className="py-5 px-5 sm:px-6 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#159A68]" />
              <span className="text-sm font-semibold text-[#0B1736]">Ready to build your business?</span>
            </div>
            <Link
              href={user ? '/dashboard' : '/login?redirect=/dashboard'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white text-xs font-semibold shadow-xs transition-colors duration-150 cursor-pointer"
            >
              <span>Start Your Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bottom Bar: Copyright & Tagline */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© 2026 UnnatE. Built for Indian Micro and Rural Entrepreneurs.</p>
            <p className="text-slate-500 font-medium">Empowering local enterprise.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
