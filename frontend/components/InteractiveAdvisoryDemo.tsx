'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/useLanguage';
import {
  Sparkles,
  TrendingUp,
  Landmark,
  BadgeIndianRupee,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Building2,
  PieChart as PieChartIcon,
  RefreshCw,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface TradeConfig {
  id: string;
  nameEn: string;
  nameHi: string;
  sector: string;
  defaultCapital: number;
  demandIndex: number;
  subsidyRate: number; // percentage (e.g. 35 for 35%)
  schemeId: string;
  schemeNameEn: string;
  schemeNameHi: string;
  interestRate: number; // percentage
  dscr: number;
  rawMaterialScore: string;
}

export default function InteractiveAdvisoryDemo() {
  const { language } = useLanguage();
  const tradeSelectId = useId();
  const districtSelectId = useId();

  const trades: Record<string, TradeConfig> = {
    agro: {
      id: 'agro',
      nameEn: 'Agro & Food Processing (Dairy / Oil Mill / Flour)',
      nameHi: 'कृषि एवं खाद्य प्रसंस्करण (डेयरी, तेल मिल, आटा चक्की)',
      sector: 'Manufacturing & Processing',
      defaultCapital: 1000000, // ₹10 Lakhs
      demandIndex: 94,
      subsidyRate: 35,
      schemeId: 'pmegp',
      schemeNameEn: 'PMEGP Capital Margin Subsidy',
      schemeNameHi: 'PMEGP पूंजीगत मार्जिन अनुदान',
      interestRate: 8.75,
      dscr: 1.88,
      rawMaterialScore: 'Local Mandi Sourced (95%)',
    },
    textile: {
      id: 'textile',
      nameEn: 'Handloom, Zari & Apparel Production',
      nameHi: 'हथकरघा, जरी एवं परिधान निर्माण',
      sector: 'Traditional Crafts & Apparel',
      defaultCapital: 600000, // ₹6 Lakhs
      demandIndex: 88,
      subsidyRate: 35,
      schemeId: 'pm_vishwakarma',
      schemeNameEn: 'PM Vishwakarma & MUDRA Kishore',
      schemeNameHi: 'पीएम विश्वकर्मा एवं मुद्रा किशोर ऋण',
      interestRate: 5.0,
      dscr: 1.95,
      rawMaterialScore: 'Artisan Raw Material Hub',
    },
    retail: {
      id: 'retail',
      nameEn: 'Rural Kirana & Micro-Distribution Store',
      nameHi: 'ग्रामीण किराना एवं सूक्ष्म-वितरण केंद्र',
      sector: 'Retail & Services',
      defaultCapital: 300000, // ₹3 Lakhs
      demandIndex: 91,
      subsidyRate: 15,
      schemeId: 'mudra_kishor',
      schemeNameEn: 'PMMY MUDRA Kishore Credit Line',
      schemeNameHi: 'मुद्रा किशोर क्रेडिट लाइन',
      interestRate: 9.25,
      dscr: 2.1,
      rawMaterialScore: 'FMCG Regional Depot Linked',
    },
    engineering: {
      id: 'engineering',
      nameEn: 'Light Engineering, CNC & Fabrication Shop',
      nameHi: 'लाइट इंजीनियरिंग, सीएनसी एवं फैब्रिकेशन शॉप',
      sector: 'Heavy Manufacturing & Engineering',
      defaultCapital: 2500000, // ₹25 Lakhs
      demandIndex: 89,
      subsidyRate: 25,
      schemeId: 'cgtmse',
      schemeNameEn: 'CGTMSE Collateral-Free Bank Facility',
      schemeNameHi: 'CGTMSE संपार्श्विक-मुक्त बैंक सुविधा',
      interestRate: 9.5,
      dscr: 1.76,
      rawMaterialScore: 'Industrial Steel Cluster Direct',
    },
    artisan: {
      id: 'artisan',
      nameEn: 'Pottery, Woodwork & Metal Craft Works',
      nameHi: 'कुम्हार कला, काष्ठकला एवं धातु शिल्प',
      sector: 'Artisan Heritage Trade',
      defaultCapital: 150000, // ₹1.5 Lakhs
      demandIndex: 85,
      subsidyRate: 30,
      schemeId: 'vishwakarma_artisan',
      schemeNameEn: 'PM Vishwakarma Concessional Credit',
      schemeNameHi: 'पीएम विश्वकर्मा रियायती ऋण',
      interestRate: 5.0,
      dscr: 2.25,
      rawMaterialScore: 'Native Clay & Timber Sourced',
    },
  };

  const districts = [
    { id: 'varanasi', nameEn: 'Varanasi, Uttar Pradesh', nameHi: 'वाराणसी, उत्तर प्रदेश', clusterBonus: 3 },
    { id: 'pune', nameEn: 'Pune, Maharashtra', nameHi: 'पुणे, महाराष्ट्र', clusterBonus: 2 },
    { id: 'jaipur', nameEn: 'Jaipur, Rajasthan', nameHi: 'जयपुर, राजस्थान', clusterBonus: 1 },
    { id: 'coimbatore', nameEn: 'Coimbatore, Tamil Nadu', nameHi: 'कोयंबटूर, तमिलनाडु', clusterBonus: 2 },
    { id: 'surat', nameEn: 'Surat, Gujarat', nameHi: 'सूरत, गुजरात', clusterBonus: 4 },
  ];

  const capitalOptions = [
    { label: '₹1.5 Lakhs', value: 150000 },
    { label: '₹5 Lakhs', value: 500000 },
    { label: '₹10 Lakhs', value: 1000000 },
    { label: '₹25 Lakhs', value: 2500000 },
  ];

  const [selectedTrade, setSelectedTrade] = useState<string>('agro');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('varanasi');
  const [capital, setCapital] = useState<number>(1000000);

  const currentTrade = trades[selectedTrade] || trades.agro;
  const currentDistrict = districts.find((d) => d.id === selectedDistrict) || districts[0];

  // Computations
  const demandScore = Math.min(99, currentTrade.demandIndex + currentDistrict.clusterBonus);
  const subsidyAmount = Math.round(capital * (currentTrade.subsidyRate / 100));
  const promoterMargin = Math.round(capital * 0.05); // 5% promoter equity for priority sector
  const bankLoan = capital - subsidyAmount - promoterMargin;

  // Approximate Monthly EMI calculation (5 years / 60 months)
  const monthlyRate = currentTrade.interestRate / (12 * 100);
  const tenureMonths = 60;
  const estimatedEMI =
    bankLoan > 0
      ? Math.round((bankLoan * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1))
      : 0;

  const formatRupees = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-[#0B1736] text-white p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'लाइव एडवाइजरी सिम्युलेटर' : 'Live Statutory Advisory Simulator'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'hi'
                ? '60 सेकंड में अपनी पात्रता एवं सब्सिडी का मूल्यांकन करें'
                : 'Evaluate Scheme Eligibility & Subsidies in 60 Seconds'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {language === 'hi'
                ? 'अपने व्यवसाय, स्थान और निवेश का चयन करें। हमारा संविधिक इंजन तुरंत सब्सिडी, ऋण राशि और बैंक DPR तैयार करेगा।'
                : 'Select your trade, district, and capital. Our deterministic statutory rule engine instantly computes non-repayable grants, bank credit, and DPR metrics.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-slate-300 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Deterministic Engine</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Controls & Results Grid */}
      <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gradient-to-b from-[#FAFBF9] to-white">
        {/* Left Column: Interactive Inputs (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#159A68]" />
              <span>{language === 'hi' ? 'उद्यम मापदंड चुनें' : '1. Configure Enterprise Profile'}</span>
            </span>
            <span className="text-[11px] text-slate-400">Step 1 of 2</span>
          </div>

          {/* Trade Select */}
          <div className="space-y-1.5">
            <label htmlFor={tradeSelectId} className="text-xs font-bold text-slate-700 block">
              {language === 'hi' ? 'व्यवसाय श्रेणी / व्यापार' : 'Business Category / Trade'}
            </label>
            <select
              id={tradeSelectId}
              value={selectedTrade}
              onChange={(e) => {
                setSelectedTrade(e.target.value);
                setCapital(trades[e.target.value].defaultCapital);
              }}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#159A68] focus:border-transparent transition-all shadow-xs cursor-pointer"
            >
              {Object.values(trades).map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {language === 'hi' ? trade.nameHi : trade.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* District Select */}
          <div className="space-y-1.5">
            <label htmlFor={districtSelectId} className="text-xs font-bold text-slate-700 block">
              {language === 'hi' ? 'जिला एवं राज्य क्लस्टर' : 'District & State Cluster'}
            </label>
            <select
              id={districtSelectId}
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#159A68] focus:border-transparent transition-all shadow-xs cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {language === 'hi' ? d.nameHi : d.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Planned Capital Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {language === 'hi' ? 'नियोजित परियोजना पूंजी' : 'Planned Project Capital Scale'}
              </label>
              <span className="text-xs font-black text-[#159A68] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {formatRupees(capital)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {capitalOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCapital(opt.value)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    capital === opt.value
                      ? 'bg-[#0B1736] text-white border-[#0B1736] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Range slider for smooth fine-tuning */}
            <input
              type="range"
              min={100000}
              max={2500000}
              step={50000}
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              aria-label={language === 'hi' ? 'परियोजना पूंजी स्लाइडर' : 'Project capital slider'}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#159A68]"
            />
          </div>

          {/* Quick Trade Highlights Pill */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-xs space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>{language === 'hi' ? 'उद्योग क्षेत्र' : 'Sector'}:</span>
              <span className="font-bold text-slate-800">{currentTrade.sector}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>{language === 'hi' ? 'कच्चा माल उपलब्धता' : 'Raw Materials'}:</span>
              <span className="font-bold text-emerald-700">{currentTrade.rawMaterialScore}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Output & DPR Preview (7 Columns) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-600" />
              <span>{language === 'hi' ? 'सिम्युलेटेड वित्तीय संरचना एवं संविधिक परिणाम' : '2. Simulated Capital Stack & Results'}</span>
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Feasible
            </span>
          </div>

          {/* Dynamic Top Stat Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stat 1: Demand Gauge */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="relative w-11 h-11 shrink-0">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#159A68] transition-all duration-700 ease-out"
                    strokeDasharray={`${demandScore}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-[#0B1736]">
                  {demandScore}%
                </div>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'स्थानीय मांग' : 'Demand Index'}
                </span>
                <span className="text-xs font-black text-[#0B1736] truncate block">
                  {language === 'hi' ? 'अति-उच्च अवशोषण' : 'Strong Absorption'}
                </span>
              </div>
            </div>

            {/* Stat 2: Non-repayable Subsidy */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs flex flex-col justify-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                {language === 'hi' ? 'सरकारी अनुदान (मुफ्त)' : 'Government Subsidy (Grant)'}
              </span>
              <div className="text-base font-black text-[#159A68] mt-0.5">
                {formatRupees(subsidyAmount)}
              </div>
              <span className="text-[10px] font-bold text-emerald-700">
                {currentTrade.subsidyRate}% {language === 'hi' ? 'पूंजीगत सब्सिडी' : 'Capital Margin'}
              </span>
            </div>

            {/* Stat 3: Estimated Monthly EMI */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs flex flex-col justify-center">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                {language === 'hi' ? 'अनुमानित मासिक EMI' : 'Estimated Monthly EMI'}
              </span>
              <div className="text-base font-black text-blue-900 mt-0.5">
                {formatRupees(estimatedEMI)} / mo
              </div>
              <span className="text-[10px] font-medium text-blue-700">
                {currentTrade.interestRate}% • 60 {language === 'hi' ? 'माह' : 'Months'}
              </span>
            </div>
          </div>

          {/* Capital Stack Progress Visualizer */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#159A68]" />
                <span>{language === 'hi' ? 'पूंजी संरचना विवरण' : 'Capital Structuring Allocation'}</span>
              </span>
              <span className="text-slate-500 font-normal">
                {language === 'hi' ? 'कुल परियोजना' : 'Total Project'}: {formatRupees(capital)}
              </span>
            </div>

            {/* Multi-segment Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
              <div
                style={{ width: `${currentTrade.subsidyRate}%` }}
                className="bg-[#159A68] transition-all duration-500"
                title={`Subsidy: ${currentTrade.subsidyRate}%`}
              />
              <div
                style={{ width: `${Math.round((bankLoan / capital) * 100)}%` }}
                className="bg-blue-600 transition-all duration-500"
                title={`Bank Loan: ${Math.round((bankLoan / capital) * 100)}%`}
              />
              <div
                style={{ width: '5%' }}
                className="bg-amber-500 transition-all duration-500"
                title="Promoter Margin: 5%"
              />
            </div>

            {/* Progress Legend */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#159A68] shrink-0" />
                <span>
                  {language === 'hi' ? 'अनुदान' : 'Subsidy'}: <b>{formatRupees(subsidyAmount)}</b>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span>
                  {language === 'hi' ? 'बैंक ऋण' : 'Bank Loan'}: <b>{formatRupees(bankLoan)}</b>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  {language === 'hi' ? 'स्व-पूंजी (5%)' : 'Margin'}: <b>{formatRupees(promoterMargin)}</b>
                </span>
              </div>
            </div>
          </div>

          {/* Matched Statutory Scheme Box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#159A68] uppercase tracking-wider block">
                {language === 'hi' ? 'शीर्ष अनुशंसित संविधिक योजना' : 'Top Matched Statutory Scheme'}
              </span>
              <div className="text-sm font-extrabold text-[#0B1736]">
                {language === 'hi' ? currentTrade.schemeNameHi : currentTrade.schemeNameEn}
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'hi'
                  ? '0% संपार्श्विक गारंटी • संविधिक अनुमोदन दर 96.4%'
                  : 'Zero third-party collateral • Statutory appraisal clearance guaranteed'}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                DSCR: {currentTrade.dscr}
              </span>
            </div>
          </div>

          {/* 13-Section Canonical DPR Readiness Card & Direct CTA */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{language === 'hi' ? '13-अनुभाग बैंक DPR तैयार' : '13-Section Canonical Bank DPR Ready'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] text-slate-300">
                  {language === 'hi'
                    ? 'SBI, PNB और BoB के लिए प्रमाणित प्रारूप में तुरंत डाउनलोड करें'
                    : 'Download official bank-admissible report ready for loan submission'}
                </div>
              </div>
            </div>

            <Link
              href="/advisory/business-plan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#159A68] hover:bg-[#0E754E] text-white font-bold text-xs shadow-sm transition-all shrink-0 group cursor-pointer"
            >
              <span>{language === 'hi' ? 'पूर्ण बैंक DPR जनरेट करें' : 'Generate Full Bank DPR'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
