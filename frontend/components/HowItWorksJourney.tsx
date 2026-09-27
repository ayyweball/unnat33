'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function HowItWorksJourney() {
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  const steps = [
    {
      number: '01',
      isActive: true,
      image: '/rural-dairy-step1.jpg',
      imageAlt: 'Indian woman entrepreneur in rural dairy setting with milk containers',
      imageFit: 'object-cover',
      imagePosition: 'object-[42%_center]',
      panelPadding: '',
      title: isHindi ? 'अपने व्यवसाय के बारे में बताएं' : 'Tell us about your business',
      desc: isHindi
        ? 'हिंदी या अंग्रेजी में अपना व्यवसाय, स्थान (राज्य और जिला), और पूंजी का पैमाना दर्ज करें।'
        : 'Enter your trade, location (state and district), and capital scale in Hindi or English.',
      benefit: isHindi ? '1-मिनट प्रोफ़ाइल सेटअप' : '1-minute profile setup',
    },
    {
      number: '02',
      isActive: false,
      image: '/how-it-works-step2.png',
      imageAlt: 'Local Market Insights and Cluster Telemetry Map',
      imageFit: 'object-cover',
      imagePosition: 'object-[50%_center]',
      panelPadding: '',
      title: isHindi ? 'अपने स्थानीय बाजार को समझें' : 'Understand your local market',
      desc: isHindi
        ? 'आधिकारिक एमएसएमई घनत्व, नजदीकी क्लस्टर बेंचमार्क और स्थानीय मांग संकेतकों तक पहुंचें।'
        : 'Access empirical MSME density, nearby cluster benchmarks, and local demand indicators.',
      benefit: isHindi ? '785 जिलों का विश्लेषण' : '785 districts analyzed',
    },
    {
      number: '03',
      isActive: false,
      image: '/parliament-schemes.jpg',
      imageAlt: 'Central and State Government Schemes - Parliament of India',
      imageFit: 'object-cover',
      imagePosition: 'object-[54%_top]',
      panelPadding: '',
      title: isHindi ? 'वित्त एवं योजनाएं खोजें' : 'Discover finance & schemes',
      desc: isHindi
        ? 'हमारा वैधानिक नियम इंजन केंद्र और राज्य की 60+ योजनाओं से आपकी प्रोफ़ाइल का मिलान करता है।'
        : 'Deterministic statutory rule engine matches your profile across central and state schemes.',
      benefit: isHindi ? '100% वैधानिक सत्यापन' : 'Statutory 100-pt gate',
    },
    {
      number: '04',
      isActive: false,
      image: '/dpr-infographic.jpg',
      imageAlt: 'Why Does a DPR Matter - Detailed Project Report Infographic',
      imageFit: 'object-contain',
      imagePosition: 'object-center',
      panelPadding: 'p-1.5',
      title: isHindi ? 'अपनी विकास योजना बनाएं' : 'Build your growth plan',
      desc: isHindi
        ? 'संरचित पुनर्भुगतान परिदृश्यों के साथ बैंक-तैयार 13-अनुभाग विस्तृत परियोजना रिपोर्ट (DPR) डाउनलोड करें।'
        : 'Download bank-ready 13-section Detailed Project Reports with structured repayment scenarios.',
      benefit: isHindi ? 'बैंक-तैयार PDF निर्यात' : 'Bank-ready PDF export',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="pt-20 pb-24 sm:pt-24 sm:pb-28 bg-[#F7F8F5] border-b border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* SECTION HEADER (EYEBROW + HEADING + DESCRIPTION) */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="text-xs font-bold text-[#159A68] uppercase tracking-wider block mb-3 sm:mb-4"
          >
            {isHindi ? 'चार-चरणीय सलाहकार यात्रा' : 'FOUR-STEP CONSULTING WORKFLOW'}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="text-2xl sm:text-4xl lg:text-[2.65rem] font-black text-[#0B1736] tracking-tight leading-[1.16] mb-4 sm:mb-5"
          >
            {isHindi ? 'UnnatE कैसे काम करता है: 4 सरल चरण' : 'How UnnatE Works in 4 Simple Steps'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto"
          >
            {isHindi
              ? 'सूक्ष्म और ग्रामीण उद्यमियों को सांख्यिकीय योजना मिलान, स्थानीय मांग विश्लेषण और बैंक-तैयार डीपीआर से सशक्त बनाना।'
              : 'Empowering micro and rural entrepreneurs with deterministic scheme matching, empirical demand analytics, and bank-ready DPR documentation.'}
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP 4-STEP OPEN EDITORIAL JOURNEY (NO LARGE WHITE ENCLOSING CARDS) */}
        {/* ========================================================================= */}
        <div className="hidden lg:block relative">
          
          {/* Continuous curved/wavy journey line behind the number nodes */}
          <div className="absolute top-[284px] left-12 right-12 z-0 pointer-events-none">
            <svg
              viewBox="0 0 1000 60"
              fill="none"
              className="w-full h-12 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="journeyPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#159A68" />
                  <stop offset="35%" stopColor="#F4A340" />
                  <stop offset="70%" stopColor="#159A68" />
                  <stop offset="100%" stopColor="#F4A340" />
                </linearGradient>
              </defs>
              <motion.path
                d="M 20 30 Q 150 12, 280 30 T 540 30 T 800 30 T 980 30"
                stroke="url(#journeyPathGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
            </svg>
          </div>

          {/* 4 Steps Columns */}
          <div className="grid grid-cols-4 gap-6 xl:gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.1 + idx * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                {/* 1. Large Rounded Visual Panel (260–320px width, 220–260px height) */}
                <div className={`w-full max-w-[290px] h-[235px] rounded-[32px] overflow-hidden relative border border-slate-200/90 shadow-xs group-hover:shadow-md transition-all duration-300 bg-white ${step.panelPadding || ''}`}>
                  <div className="w-full h-full relative">
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      fill
                      sizes="(max-width: 1280px) 25vw, 290px"
                      className={`${step.imageFit || 'object-cover'} ${step.imagePosition} transition-transform duration-500 ease-out group-hover:scale-[1.03]`}
                    />
                  </div>
                  {/* Subtle inner border glow */}
                  <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-black/5 pointer-events-none" />
                </div>

                {/* 2. Numbered Milestone Node (Directly on the wavy journey line) */}
                <div className="mt-6 mb-5 relative flex items-center justify-center">
                  {step.isActive ? (
                    <div className="w-12 h-12 rounded-full bg-[#159A68] text-white flex items-center justify-center font-black text-sm shadow-md ring-4 ring-[#159A68]/20 z-10 transition-transform duration-300 group-hover:-translate-y-0.5">
                      {step.number}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white text-[#0B1736] border-2 border-slate-300 group-hover:border-[#159A68] flex items-center justify-center font-black text-sm shadow-xs z-10 transition-all duration-300 group-hover:-translate-y-0.5">
                      {step.number}
                    </div>
                  )}

                  {/* Directional Chevron between nodes */}
                  {idx < steps.length - 1 && (
                    <div
                      className="absolute w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-2xs z-20 pointer-events-none"
                      style={{ left: 'calc(100% + 24px)' }}
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* 3. Step Title */}
                <h3 className="text-lg font-bold text-[#0B1736] mb-2.5 leading-snug">
                  {step.title}
                </h3>

                {/* 4. Short Description */}
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-4 max-w-[240px]">
                  {step.desc}
                </p>

                {/* 5. Benefit / Status Line */}
                <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#159A68]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
                  <span>{step.benefit}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MOBILE & TABLET CONTINUOUS VERTICAL TIMELINE */}
        {/* ========================================================================= */}
        <div className="lg:hidden relative">
          
          {/* Vertical Connecting Line */}
          <div
            className="absolute left-6 top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#159A68] via-[#F4A340] to-[#159A68]"
            aria-hidden="true"
          />

          <div className="space-y-12 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex items-start gap-4 sm:gap-6 pl-1"
              >
                {/* Milestone Node */}
                <div className="shrink-0">
                  {step.isActive ? (
                    <div className="w-11 h-11 rounded-full bg-[#159A68] text-white flex items-center justify-center font-black text-sm shadow-md ring-4 ring-[#159A68]/20">
                      {step.number}
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white text-[#0B1736] border-2 border-slate-300 flex items-center justify-center font-black text-sm shadow-xs">
                      {step.number}
                    </div>
                  )}
                </div>

                {/* Content Block */}
                <div className="flex-1 pt-0.5">
                  {/* Visual Panel */}
                  <div className={`w-full max-w-[280px] h-[190px] rounded-[28px] overflow-hidden relative border border-slate-200/90 shadow-xs mb-4 bg-white ${step.panelPadding || ''}`}>
                    <div className="w-full h-full relative">
                      <Image
                        src={step.image}
                        alt={step.imageAlt}
                        fill
                        sizes="280px"
                        className={`${step.imageFit || 'object-cover'} ${step.imagePosition}`}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#0B1736] mb-1.5 leading-snug">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3 max-w-md">
                    {step.desc}
                  </p>

                  {/* Benefit */}
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#159A68]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68]" />
                    <span>{step.benefit}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
