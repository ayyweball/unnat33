'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import {
  FileText,
  Download,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Landmark,
  BadgeIndianRupee,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function InsightsAndReportsPage() {
  const { t } = useLanguage();
  const { user, business } = useAppStore();
  const [selectedTab, setSelectedTab] = useState('All Reports');

  const activeDistrict = user?.district || 'Lucknow';
  const activeState = user?.state || 'Uttar Pradesh';
  const activeSector = business?.sector || 'Services';

  const filterTabs = [
    'All Reports',
    'Market Reports',
    'Scheme Reports',
    'Financial Reports',
    'State Comparisons',
  ];

  const reportList = [
    {
      id: 'market-potential',
      category: 'Market Reports',
      title: 'District Market Potential Report',
      description: `${activeDistrict}, ${activeState}`,
      date: 'Generated on 26 Sep 2026',
      icon: TrendingUp,
      color: 'red',
      downloadUrl: '/dashboard/market-analysis',
      viewUrl: '/dashboard/market-analysis',
    },
    {
      id: 'sector-analysis',
      category: 'Market Reports',
      title: 'Sector Analysis Report',
      description: `${activeSector} Enterprise`,
      date: 'Generated on 26 Sep 2026',
      icon: Layers,
      color: 'red',
      downloadUrl: '/dashboard/market-analysis',
      viewUrl: '/dashboard/market-analysis',
    },
    {
      id: 'schemes-report',
      category: 'Scheme Reports',
      title: 'Government Schemes Report',
      description: 'Relevant statutory subsidies for your business',
      date: 'Generated on 26 Sep 2026',
      icon: Landmark,
      color: 'red',
      downloadUrl: '/advisory/schemes',
      viewUrl: '/advisory/schemes',
    },
    {
      id: 'dpr-report',
      category: 'Financial Reports',
      title: 'Bank-Ready Detailed Project Report (DPR)',
      description: '11-Step census-grounded statutory project report',
      date: 'Generated on 26 Sep 2026',
      icon: BadgeIndianRupee,
      color: 'red',
      downloadUrl: '/advisory/business-plan',
      viewUrl: '/advisory/business-plan',
    },
  ];

  const filteredReports =
    selectedTab === 'All Reports'
      ? reportList
      : reportList.filter((r) => r.category === selectedTab);

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#0B1736] flex flex-col font-sans selection:bg-[#159A68] selection:text-white">
      <Navbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1550px] w-full min-w-0 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#159A68] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0B1736] font-semibold">Insights &amp; Reports</span>
          </div>

          {/* ========================================================================= */}
          {/* 1. HERO BANNER WITH INDIAN ANALYST & ENTERPRISE ARTWORK (Screen 8 Match)   */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs relative overflow-hidden">
            {/* National Analyst Art Fading on the Left */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden rounded-r-2xl sm:rounded-r-3xl z-0">
              <img
                src="/reports-couple.jpg"
                alt="Indian rural couple using a smartphone together"
                className="w-full h-full object-cover object-[55%_22%] reports-hero-mask"
              />
              <style dangerouslySetInnerHTML={{ __html: `
                .reports-hero-mask {
                  -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                  mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                }
                @media (min-width: 640px) {
                  .reports-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                  }
                }
                @media (min-width: 1024px) {
                  .reports-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                  }
                }
              `}} />
            </div>

            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest block">
                INSIGHTS &amp; REPORTS
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B1736] tracking-tight font-serif">
                Data-driven insights for better decisions
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
                Explore reports, trends and intelligence from across India grounded in official PostgreSQL census records.
              </p>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. REPORT CATEGORY FILTER TABS (Direct Screen 8 Reference Match)           */}
          {/* ========================================================================= */}
          <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTab === tab
                    ? 'bg-[#159A68] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-[#0B1736] border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </section>

          {/* ========================================================================= */}
          {/* 3. REPORT CARDS ROW / GRID (Direct Screen 8 Reference Match)               */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-[#159A68]/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                      PDF
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {report.date}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0B1736] leading-snug">
                      {report.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={report.viewUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#159A68] hover:text-[#128357] transition-colors"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={report.downloadUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>Download</span>
                  </Link>
                </div>
              </div>
            ))}
          </section>

          {/* ========================================================================= */}
          {/* 4. CROSS-MODULE ADVISORY INTELLIGENCE CALLOUT                              */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B1736]">
                  Need a customized district or trade intelligence report?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate instant multi-model analyses and bank-ready DPR documents directly with our AI Advisor.
                </p>
              </div>
            </div>

            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1736] hover:bg-[#159A68] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <span>Ask AI Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </section>

        </main>
      </div>
    </div>
  );
}
