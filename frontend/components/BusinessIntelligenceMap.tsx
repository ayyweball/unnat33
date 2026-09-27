'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Landmark,
  BadgeIndianRupee,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLanguage';

export default function BusinessIntelligenceMap() {
  const { language } = useLanguage();
  const [selectedCluster, setSelectedCluster] = useState('varanasi');

  const clusters = {
    varanasi: {
      name: language === 'hi' ? 'वाराणसी जिला क्लस्टर' : 'Varanasi District Cluster',
      state: language === 'hi' ? 'उत्तर प्रदेश' : 'Uttar Pradesh',
      trade: language === 'hi' ? 'हथकरघा, जरी एवं कृषि-प्रसंस्करण' : 'Handloom, Zari & Agro-Processing',
      demandScore: 92,
      demandLabel: language === 'hi' ? 'उच्च स्थानीय मांग' : 'Strong Regional Absorption',
      msmesInRadius: '1,240 Micro Units',
      financingOption: 'MUDRA Tarun (₹10L)',
      statutorySubsidies: 'PMEGP 35% Capital Margin',
      dprStatus: '13-Section DPR Ready',
      growthYoY: '+18.4%',
      rawMaterial: '95% Local Mandi Sourced',
      powerInfra: '98.5% Stable Rural Feeder',
    },
    pune: {
      name: language === 'hi' ? 'पुणे औद्योगिक क्लस्टर' : 'Pune Industrial Cluster',
      state: language === 'hi' ? 'महाराष्ट्र' : 'Maharashtra',
      trade: language === 'hi' ? 'लाइट इंजीनियरिंग एवं सीएनसी फैब्रिकेशन' : 'Light Engineering & CNC Fabrication',
      demandScore: 89,
      demandLabel: language === 'hi' ? 'आपूर्ति श्रृंखला मांग' : 'High Supply Chain Demand',
      msmesInRadius: '3,850 Units',
      financingOption: 'CGTMSE Credit (₹2 Cr)',
      statutorySubsidies: 'State Industrial Incentive (25%)',
      dprStatus: '13-Section DPR Ready',
      growthYoY: '+16.2%',
      rawMaterial: 'Tier 1 Steel & Metal Hub',
      powerInfra: 'High Tension Industrial Grid',
    },
    jaipur: {
      name: language === 'hi' ? 'जयपुर शिल्प एवं परिधान कॉरिडोर' : 'Jaipur Craft & Apparel Corridor',
      state: language === 'hi' ? 'राजस्थान' : 'Rajasthan',
      trade: language === 'hi' ? 'ब्लॉक प्रिंटिंग, हस्तशिल्प व चमड़ा कार्य' : 'Block Printing, Artisan Works & Gems',
      demandScore: 86,
      demandLabel: language === 'hi' ? 'निर्यात व घरेलू मांग' : 'Export & Domestic Catchment',
      msmesInRadius: '2,110 Units',
      financingOption: 'PM Vishwakarma Concessional',
      statutorySubsidies: 'Artisan Concession (5% Rate)',
      dprStatus: '13-Section DPR Ready',
      growthYoY: '+14.8%',
      rawMaterial: 'Artisan Raw Material Banks',
      powerInfra: 'Solar Hybrid Net-Metered',
    },
    coimbatore: {
      name: language === 'hi' ? 'कोयंबटूर पंप एवं मोटर क्लस्टर' : 'Coimbatore Engineering Cluster',
      state: language === 'hi' ? 'तमिलनाडु' : 'Tamil Nadu',
      trade: language === 'hi' ? 'कृषि पंप, कास्टिंग एवं मोटर असेंबली' : 'Agro Pumps, Castings & Motors',
      demandScore: 91,
      demandLabel: language === 'hi' ? 'अखिल भारतीय बाजार पहुंच' : 'Pan-India Distribution',
      msmesInRadius: '2,940 Units',
      financingOption: 'MUDRA + CGTMSE Stack',
      statutorySubsidies: 'Tamil Nadu NEEDS Scheme (25%)',
      dprStatus: '13-Section DPR Ready',
      growthYoY: '+17.1%',
      rawMaterial: 'Foundry Grade Ingot Hub',
      powerInfra: 'Dedicated Agro-Industrial Grid',
    },
    surat: {
      name: language === 'hi' ? 'सूरत टेक्सटाइल एवं सूक्ष्म क्लस्टर' : 'Surat Synthetic & Weaving Hub',
      state: language === 'hi' ? 'गुजरात' : 'Gujarat',
      trade: language === 'hi' ? 'पावरलूम बुनाई, कढ़ाई एवं वैल्यू एडिशन' : 'Powerloom Weaving, Embroidery & Apparel',
      demandScore: 94,
      demandLabel: language === 'hi' ? 'सर्वोच्च थोक कारोबार' : 'Peak Wholesale Turnaround',
      msmesInRadius: '4,620 Units',
      financingOption: 'TUFS + PMEGP Capital Subsidy',
      statutorySubsidies: '35% Rural Subsidy / 25% Urban',
      dprStatus: '13-Section DPR Ready',
      growthYoY: '+21.3%',
      rawMaterial: 'Direct Yarn Synthetic Mills',
      powerInfra: '24x7 Uninterrupted Industrial',
    },
  };

  const active = clusters[selectedCluster as keyof typeof clusters] || clusters.varanasi;

  return (
    <div className="w-full bg-white/98 backdrop-blur-xs rounded-[24px] border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(11,23,54,0.12),0_4px_12px_-2px_rgba(11,23,54,0.06)] overflow-hidden select-none">
      {/* 1. Compact Clean Header Bar (~56px) */}
      <div className="bg-slate-50/80 border-b border-slate-200/70 px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse shrink-0" />
          <span className="text-xs sm:text-[13px] font-bold text-[#0B1736] tracking-tight">
            {language === 'hi' ? 'हाइपर-लोकल मार्केट इंटेलिजेंस इंजन' : 'Hyper-Local Market Intelligence Engine'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] font-medium text-slate-500">
            {language === 'hi' ? '785 जिले सक्रिय' : '785 Districts Synchronized'}
          </span>
        </div>

        {/* Compact City Tabs */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold">
          {(Object.keys(clusters) as Array<keyof typeof clusters>).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCluster(key)}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer capitalize ${
                selectedCluster === key
                  ? 'bg-[#0B1736] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Compact Body: Stat Cards + Main Cluster Snapshot */}
      <div className="p-3 sm:p-4 space-y-2.5 bg-[#FAFBF9]/50">
        
        {/* 3 Metric Cards Row (Compact Heights) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Metric 1 */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EAF6F0] text-[#159A68] flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Local Demand Index
              </span>
              <span className="text-xs font-black text-[#0B1736] truncate block">
                {active.demandScore}/100 • {active.demandLabel}
              </span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <BadgeIndianRupee className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Recommended Credit
              </span>
              <span className="text-xs font-black text-[#0B1736] truncate block">
                {active.financingOption}
              </span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#F4A340] flex items-center justify-center shrink-0">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Statutory Scheme
              </span>
              <span className="text-xs font-black text-[#0B1736] truncate block">
                {active.statutorySubsidies}
              </span>
            </div>
          </div>
        </div>

        {/* Main Cluster Focus Section (Compressed Height & Spacing) */}
        <div className="bg-white rounded-xl border border-slate-200/70 shadow-2xs p-3 sm:p-3.5 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2.5">
              {/* Circular Progress Gauge */}
              <div className="relative w-8 h-8 shrink-0">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#159A68]"
                    strokeDasharray={`${active.demandScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-[#0B1736]">
                  {active.demandScore}%
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                  <span className="text-[10px] font-bold text-[#159A68] uppercase tracking-wider">
                    Target Cluster Focus
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-[#0B1736] leading-snug">
                  {active.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {active.trade} · {active.state}
                </p>
              </div>
            </div>

            <div className="flex items-center sm:flex-col sm:items-end gap-0.5">
              <span className="text-[10px] font-semibold text-slate-400">Projected Growth</span>
              <span className="text-xs font-black text-[#159A68] bg-[#EAF6F0] px-2 py-0.5 rounded-md border border-[#159A68]/20">
                {active.growthYoY} YoY
              </span>
            </div>
          </div>

          {/* 4 Compact Data Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
            <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Enterprise Density
              </span>
              <span className="text-[11px] font-extrabold text-[#0B1736] mt-0.5 block truncate">
                {active.msmesInRadius}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Statutory Gate
              </span>
              <span className="text-[11px] font-extrabold text-[#159A68] mt-0.5 block truncate">
                Eligible (Pre-Check)
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Raw Materials
              </span>
              <span className="text-[11px] font-extrabold text-[#0B1736] mt-0.5 block truncate" title={active.rawMaterial}>
                {active.rawMaterial}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Bank DPR
              </span>
              <span className="text-[11px] font-extrabold text-[#0B1736] mt-0.5 block truncate">
                {active.dprStatus}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Small Lightweight Footer (Source/Credibility Line) */}
      <div className="px-4 sm:px-5 py-2 border-t border-slate-200/60 bg-white/70 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-medium gap-1">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-[#159A68]" />
          <span>Deterministic Rule Engine • Official Udyam & District Census Baseline</span>
        </div>
        <div className="text-slate-400">
          PMEGP • MUDRA • PM Vishwakarma • CGTMSE
        </div>
      </div>
    </div>
  );
}
