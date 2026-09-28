'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/useLanguage';
import {
  TrendingUp,
  Landmark,
  BadgeIndianRupee,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface ModuleData {
  id: string;
  badge: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  descEn: string;
  descHi: string;
  pointsEn: string[];
  pointsHi: string[];
  image: string;
  imageAlt: string;
  statBadge: string;
  href: string;
  ctaEn: string;
  ctaHi: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODULES: ModuleData[] = [
  {
    id: 'market',
    badge: '01 • CENSUS & CLUSTER TELEMETRY',
    titleEn: 'Hyper-Local Market & Enterprise Clustering',
    titleHi: 'हाइपर-लोकल बाजार एवं क्लस्टर विश्लेषण',
    subtitleEn: '785 Districts Empirical Intelligence',
    subtitleHi: '785 जिलों का वास्तविक डेटा',
    descEn:
      'Evaluate district-level enterprise density, supply chain gaps, and consumer demand absorption using empirical census and mandi registers.',
    descHi:
      '785 भारतीय जिलों से वास्तविक उद्योग घनत्व, आपूर्ति श्रृंखला अंतराल और उपभोक्ता मांग का आधिकारिक डेटा प्राप्त करें।',
    pointsEn: [
      'Empirical enterprise scale distribution across micro, small, and medium units',
      'Local demand absorption scoring calibrated to regional consumer spending',
      'Microclimate logistics disruption indicators from official weather telemetry',
    ],
    pointsHi: [
      'सूक्ष्म, लघु एवं मध्यम इकाइयों का वास्तविक जिला-स्तरीय वर्गीकरण',
      'स्थानीय उपभोक्ता खर्च और मांग अवशोषण की सांख्यिकीय गणना',
      'मौसम और क्षेत्रीय परिवहन आपूर्ति जोखिम का वास्तविक समय विश्लेषण',
    ],
    image: '/market-banner.jpg',
    imageAlt: 'Indian marketplace cluster',
    statBadge: '785 Districts Covered',
    href: '/dashboard',
    ctaEn: 'Explore Market Intelligence',
    ctaHi: 'बाजार विश्लेषण देखें',
    icon: TrendingUp,
  },
  {
    id: 'schemes',
    badge: '02 • STATUTORY ELIGIBILITY GATE',
    titleEn: 'Deterministic Statutory Eligibility Matcher',
    titleHi: '60+ सरकारी योजनाओं का सटीक मिलान',
    subtitleEn: 'Zero AI Hallucination in Grants',
    subtitleHi: 'पारदर्शी एवं नियम-आधारित पात्रता',
    descEn:
      'Rule-based evaluation matching your promoter profile, trade category, and investment scale directly against 60+ Central and State assistance programs.',
    descHi:
      'आयु, लिंग, सामाजिक वर्ग, निवेश और व्यापार श्रेणी के आधार पर 60+ केंद्रीय और राज्य योजनाओं की पात्रता का सत्यापन।',
    pointsEn: [
      'Full coverage of PMEGP, MUDRA, PM Vishwakarma, PMFME, and Stand-Up India',
      'Exact statutory eligibility confidence scoring with transparent criteria',
      'Automated subsidy, margin money, and interest subvention calculation',
    ],
    pointsHi: [
      'PMEGP, मुद्रा, पीएम विश्वकर्मा, पीएमएफएमई और स्टैंड-अप इंडिया का कवरेज',
      'पात्रता का सटीक प्रतिशत एवं अयोग्यता के कारणों का पारदर्शी विवरण',
      'सब्सिडी, मार्जिन मनी और ब्याज छूट की स्वचालित गणना',
    ],
    image: '/schemes-national.jpg',
    imageAlt: 'Indian artisan enterprise support',
    statBadge: '60+ Priority Schemes',
    href: '/advisory/schemes',
    ctaEn: 'Evaluate Scheme Eligibility',
    ctaHi: 'योजना पात्रता जांचें',
    icon: Landmark,
  },
  {
    id: 'finance',
    badge: '03 • CAPITAL STRUCTURING & EMIS',
    titleEn: 'Financial Structuring & EMI Affordability',
    titleHi: 'ऋण संरचना एवं सुरक्षित ईएमआई योजना',
    subtitleEn: 'Prudent Banking Feasibility',
    subtitleHi: 'बैंक-स्वीकृत वित्तीय प्रारूप',
    descEn:
      'Structure conservative debt-to-income ratios and model sustainable repayment scenarios to ensure commercial loan viability without promoter distress.',
    descHi:
      'ऋण-से-आय (DTI) और मासिक अधिशेष के आधार पर सुरक्षित पुनर्भुगतान सीमाएं और सस्ती ईएमआई योजना तैयार करें।',
    pointsEn: [
      'Conservative, Recommended, and Extended tenure EMI repayment projections',
      'CGTMSE collateral-free credit guarantee coverage and fee analysis',
      'Optimized capital stack balancing promoter equity, bank debt, and subsidies',
    ],
    pointsHi: [
      'रूढ़िवादी, अनुशंसित और विस्तारित अवधि के ईएमआई परिदृश्य',
      'सीजीटीएमएसई बिना किसी बंधक के क्रेडिट गारंटी कवरेज की जांच',
      'प्रमोटर इक्विटी, बैंक ऋण और सरकारी अनुदान का संतुलित विभाजन',
    ],
    image: '/financial-banner.jpg',
    imageAlt: 'Indian business financial planning',
    statBadge: 'RBI / CGTMSE Norms',
    href: '/advisory/financial',
    ctaEn: 'Structure Capital Stack',
    ctaHi: 'पूंजी संरचना की योजना बनाएं',
    icon: BadgeIndianRupee,
  },
  {
    id: 'dpr',
    badge: '04 • 13-SECTION CANONICAL EXPORT',
    titleEn: '13-Section Canonical DPR Generator',
    titleHi: '13-अनुभाग बैंक डीपीआर एवं पीडीएफ रिपोर्ट',
    subtitleEn: 'Appraisal-Ready Documentation',
    subtitleHi: 'बैंक शाखा में जमा करने योग्य दस्तावेज',
    descEn:
      'Synthesize comprehensive Detailed Project Reports structured to statutory scheduled commercial bank guidelines, ready for branch appraisal.',
    descHi:
      'अनुसूचित वाणिज्यिक बैंकों के क्रेडिट मानकों के अनुसार 13 मानकीकृत अनुभागों में बैंक-तैयार डीपीआर तैयार करें।',
    pointsEn: [
      '13 standardized chapters formatted to commercial bank credit standards',
      'Qualitative market absorption narrative and risk-mitigation framing',
      'Downloadable canonical PDF export with shareable branch verification',
    ],
    pointsHi: [
      'बैंक ऋण समिति के मानकों के अनुसार 13 मानकीकृत अध्याय',
      'मांग अवशोषण और जोखिम प्रबंधन का विस्तृत विश्लेषणात्मक विवरण',
      'आधिकारिक पीडीएफ निर्यात और बैंक शाखा के लिए सत्यापन लिंक',
    ],
    image: '/dpr-banner.jpg',
    imageAlt: 'Detailed Project Report document',
    statBadge: '< 60 Sec Synthesis',
    href: '/advisory/business-plan',
    ctaEn: 'Generate Bank-Ready DPR',
    ctaHi: 'बैंक डीपीआर तैयार करें',
    icon: FileSpreadsheet,
  },
  {
    id: 'simulator',
    badge: '05 • SENSITIVITY & STRESS-TESTING',
    titleEn: 'What-If Business & Sensitivity Simulator',
    titleHi: 'व्हाट-इफ संवेदनशीलता एवं व्यापार सिम्युलेटर',
    subtitleEn: 'Single-Source Financial Modeling',
    subtitleHi: 'गतिशील वित्तीय परिदृश्य मॉडलिंग',
    descEn:
      'Explore how variations in footfall, pricing elasticity, variable costs, and loan financing impact operating margins and break-even points in real time.',
    descHi:
      'ग्राहक संख्या, मूल्य निर्धारण, परिवर्तनीय लागत और ऋण वित्तपोषण में बदलाव के प्रभाव का वास्तविक समय में मूल्यांकन करें।',
    pointsEn: [
      'Single source of truth deterministic financial simulation engine',
      'Instant break-even analysis under fluctuating cost and pricing assumptions',
      'Prudent operating profit delta and margin impact observations',
    ],
    pointsHi: [
      'एकल स्रोत सत्य संविधिक वित्तीय सिमुलेशन इंजन',
      'बदलती लागत और मूल्य निर्धारण मान्यताओं के तहत त्वरित ब्रेक-इवन विश्लेषण',
      'ऑपरेटिंग लाभ डेल्टा और मार्जिन प्रभाव का निष्पक्ष अवलोकन',
    ],
    image: '/financial-banner.jpg',
    imageAlt: 'What-If Simulator interface',
    statBadge: 'Real-Time Scenarios',
    href: '/simulator',
    ctaEn: 'Launch What-If Simulator',
    ctaHi: 'व्हाट-इफ सिम्युलेटर शुरू करें',
    icon: Sliders,
  },
];

export default function ScrollRevealDashboard() {
  const { language } = useLanguage();
  const [activeId, setActiveId] = useState('market');

  const activeModule = MODULES.find((m) => m.id === activeId) || MODULES[0];
  const IconComponent = activeModule.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-[#159A68] uppercase tracking-wider block mb-2">
          Modular Advisory Capabilities
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-[#0B1736] tracking-tight mb-3">
          {language === 'hi' ? 'विस्तृत सलाहकार मॉड्यूल' : 'Explore Advisory Modules'}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed font-normal">
          {language === 'hi'
            ? 'अपनी व्यावसायिक आवश्यकता के अनुसार मॉड्यूल चुनें और व्यावहारिक विश्लेषण देखें।'
            : 'Select any module below to examine how our deterministic advisory engine guides every stage of enterprise growth.'}
        </p>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center p-1 rounded-2xl bg-white border border-slate-200/90 shadow-xs gap-1">
          {MODULES.map((m) => {
            const isActive = m.id === activeId;
            const TabIcon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveId(m.id)}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#0B1736] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1736] hover:bg-slate-50'
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#159A68]' : 'text-slate-400'}`} />
                <span>
                  {m.id === 'market' && (language === 'hi' ? 'बाजार विश्लेषण' : 'Market')}
                  {m.id === 'schemes' && (language === 'hi' ? 'सरकारी योजनाएं' : 'Government Schemes')}
                  {m.id === 'finance' && (language === 'hi' ? 'ऋण संरचना' : 'Finance')}
                  {m.id === 'dpr' && (language === 'hi' ? 'डीपीआर बिल्डर' : 'DPR Builder')}
                  {m.id === 'simulator' && (language === 'hi' ? 'व्हाट-इफ सिम्युलेटर' : 'What-If Simulator')}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editorial Information Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Left Content Area */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              <div>
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6F0] border border-[#159A68]/20 text-[#159A68] text-[11px] font-black tracking-wider uppercase mb-4">
                  <Sparkles className="w-3 h-3 text-[#159A68]" />
                  <span>{activeModule.badge}</span>
                </div>

                {/* Heading */}
                <h3 className="text-xl sm:text-2xl lg:text-[1.75rem] font-black text-[#0B1736] tracking-tight leading-snug mb-3">
                  {language === 'hi' ? activeModule.titleHi : activeModule.titleEn}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
                  {language === 'hi' ? activeModule.descHi : activeModule.descEn}
                </p>

                {/* Key Points */}
                <div className="space-y-2.5 pt-1">
                  {(language === 'hi' ? activeModule.pointsHi : activeModule.pointsEn).map((pt, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#F7F8F5] border border-slate-200/70 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#159A68] shrink-0 mt-0.5" />
                      <span className="text-xs text-[#0B1736] font-medium leading-relaxed">
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <Link
                  href={activeModule.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1736] hover:bg-[#159A68] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-200 group cursor-pointer"
                >
                  <span>{language === 'hi' ? activeModule.ctaHi : activeModule.ctaEn}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <div className="text-[11px] font-bold text-slate-400">
                  {language === 'hi' ? activeModule.subtitleHi : activeModule.subtitleEn}
                </div>
              </div>
            </div>

            {/* Right Visual/Data Showcase */}
            <div className="lg:col-span-5 relative bg-[#0B1736] min-h-[260px] sm:min-h-[320px] lg:min-h-auto overflow-hidden flex flex-col justify-end p-6 sm:p-8">
              {/* Background Image */}
              <img
                src={activeModule.image}
                alt={activeModule.imageAlt}
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 transition-transform duration-700 hover:scale-100"
              />
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1736] via-[#0B1736]/60 to-transparent pointer-events-none" />

              {/* Floating Landmark Badge */}
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-[#0B1736] text-[11px] font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#159A68]" />
                  <span>{activeModule.statBadge}</span>
                </div>
                <div className="text-white text-xs font-semibold leading-snug drop-shadow-sm">
                  {language === 'hi' ? activeModule.titleHi : activeModule.titleEn}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
