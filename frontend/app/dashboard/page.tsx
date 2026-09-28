'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import {
  TrendingUp,
  Landmark,
  BadgeIndianRupee,
  ShieldCheck,
  Plus,
  MapPin,
  Search,
  Sun,
  ChevronRight,
  CloudSun,
  CloudRain,
  Compass,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Sparkles,
  BarChart3,
  Info,
  Building2,
  Thermometer,
  Truck,
  Activity,
  Store,
  ArrowRight,
  ShieldAlert,
  Lightbulb,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { MarketIntelligenceResponse } from '@/lib/api-client';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { user, setUser } = useAppStore();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligenceResponse | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [programCount, setProgramCount] = useState<number>(115);

  useEffect(() => {
    // Fetch profile and user businesses
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    fetch('/api/businesses')
      .then((res) => res.json())
      .then((data) => {
        if (data.businesses) setBusinesses(data.businesses);
      })
      .finally(() => setLoading(false));

    // Fetch authoritative programme count from FastAPI
    fetch('/api/schemes')
      .then((res) => res.json())
      .then((data) => {
        if (data.count) setProgramCount(data.count);
      })
      .catch(() => {});
  }, [setUser]);

  // Fetch unified market intelligence (ML clustering + LLM analysis + real MSME & weather data)
  useEffect(() => {
    if (!user?.district || !user?.state) {
      setMarketIntelligence(null);
      setResearchLoading(false);
      setResearchError(null);
      return;
    }

    setResearchLoading(true);
    setResearchError(null);

    const primaryBusiness = businesses && businesses.length > 0 ? businesses[0] : null;
    const businessContext = primaryBusiness ? {
      business_type: primaryBusiness.type,
      sub_type: primaryBusiness.subType,
      experience_level: primaryBusiness.experienceLevel,
      target_market: primaryBusiness.targetMarket,
      current_income: primaryBusiness.currentIncome,
      estimated_capital: primaryBusiness.estimatedCapital,
      existing_debt: primaryBusiness.existingDebt,
    } : undefined;

    fetch('/api/research/market-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state_name: user.state,
        district_name: user.district,
        business_profile: businessContext,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) {
          setMarketIntelligence(data);
        } else {
          setMarketIntelligence(null);
          setResearchError(data?.error || 'Failed to load market intelligence');
        }
      })
      .catch((err) => {
        console.warn('Could not fetch market intelligence:', err);
        setMarketIntelligence(null);
        setResearchError(err.message || 'Network error');
      })
      .finally(() => {
        setResearchLoading(false);
      });
  }, [user?.state, user?.district, businesses]);

  const market = marketIntelligence?.market_context;
  const weather = marketIntelligence?.weather_context;
  const ml = marketIntelligence?.ml_analysis;
  const llm = marketIntelligence?.llm_analysis;
  const weatherImpact = marketIntelligence?.weather_activity_impact;
  const observations = marketIntelligence?.research_observations || [];
  const cautions = marketIntelligence?.operational_cautions || [];
  const primaryBusiness = businesses && businesses.length > 0 ? businesses[0] : null;
  const activeDistrictName = marketIntelligence?.district_name || user?.district || primaryBusiness?.district || '';
  const activeStateName = marketIntelligence?.state_name || user?.state || primaryBusiness?.state || '';

  // Real Profile Completion percentage calculated dynamically
  const profileCompletion = useMemo(() => {
    const fields = [
      user?.name,
      user?.phone,
      user?.state,
      user?.district,
      user?.category,
      user?.gender,
      primaryBusiness?.name,
      primaryBusiness?.type,
      primaryBusiness?.estimatedCapital,
    ];
    const completed = fields.filter((f) => Boolean(f)).length;
    return Math.round((completed / fields.length) * 100);
  }, [user, primaryBusiness]);

  // Real Activity items tracked from actual profile, enterprise, and intelligence state
  const activities = useMemo(() => {
    const list: { title: string; detail: string; dotColor: string }[] = [];
    if (user?.updatedAt || user?.name) {
      list.push({
        title: 'Business profile active',
        detail: user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Current session',
        dotColor: 'bg-[#159A68]',
      });
    }
    if (primaryBusiness?.name) {
      list.push({
        title: `Enterprise tracked: ${primaryBusiness.name}`,
        detail: primaryBusiness.type || 'Registered unit',
        dotColor: 'bg-blue-500',
      });
    }
    if (market) {
      list.push({
        title: `Udyam intelligence synced: ${activeDistrictName}`,
        detail: `${market.total_enterprises?.toLocaleString() || ''} MSME records`,
        dotColor: 'bg-emerald-500',
      });
    }
    return list;
  }, [user, primaryBusiness, market, activeDistrictName]);

  // Real Enterprise Scale Distribution Data for Chart (Micro, Small, Medium)
  const enterpriseScaleChartData = market ? [
    {
      tier: 'Micro',
      fullName: 'Micro Enterprises',
      count: market.micro_enterprises,
      share: Number(market.micro_share?.toFixed(1) || 0),
      color: '#159A68',
    },
    {
      tier: 'Small',
      fullName: 'Small Enterprises',
      count: market.small_enterprises,
      share: Number(market.small_share?.toFixed(1) || 0),
      color: '#2563eb',
    },
    {
      tier: 'Medium',
      fullName: 'Medium Enterprises',
      count: market.medium_enterprises,
      share: Number(market.medium_share?.toFixed(1) || 0),
      color: '#7c3aed',
    },
  ] : [];

  // Top Canonical Government Schemes List for Compact Display
  const prioritySchemes = [
    {
      id: 'pmegp',
      name: language === 'hi' ? 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)' : "Prime Minister's Employment Generation Programme (PMEGP)",
      ministry: language === 'hi' ? 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय (KVIC)' : 'Ministry of MSME / KVIC',
      benefit: language === 'hi' ? '₹50 लाख तक परियोजना सीमा • 15%–35% पूंजीगत सब्सिडी' : 'Up to ₹50 Lakhs project limit • 15%–35% capital subsidy',
      category: language === 'hi' ? 'विनिर्माण एवं सेवा' : 'Manufacturing & Services',
      tag: 'Priority Subsidy',
    },
    {
      id: 'mudra',
      name: language === 'hi' ? 'प्रधानमंत्री मुद्रा योजना (PMMY)' : 'Pradhan Mantri MUDRA Yojana (PMMY)',
      ministry: language === 'hi' ? 'वित्तीय सेवाएं विभाग, वित्त मंत्रालय' : 'Department of Financial Services, MoF',
      benefit: language === 'hi' ? '₹20 लाख तक संपार्श्विक-मुक्त संस्थागत ऋण' : 'Up to ₹20 Lakhs collateral-free institutional credit',
      category: language === 'hi' ? 'माइक्रो-एंटरप्राइज क्रेडिट' : 'Micro-Enterprise Credit',
      tag: 'Collateral-Free',
    },
    {
      id: 'standup',
      name: language === 'hi' ? 'स्टैंड-अप इंडिया योजना' : 'Stand-Up India Scheme',
      ministry: language === 'hi' ? 'सिडबी एवं वित्तीय सेवाएं विभाग' : 'SIDBI & DFS / MoF',
      benefit: language === 'hi' ? '₹10 लाख से ₹1 करोड़ ग्रीनफील्ड उद्यम ऋण' : '₹10 Lakhs to ₹1 Crore greenfield project financing',
      category: language === 'hi' ? 'महिलाएं एवं एससी/एसटी उद्यमी' : 'Women & SC/ST Promoters',
      tag: 'Greenfield Scale',
    },
    {
      id: 'vishwakarma',
      name: language === 'hi' ? 'पीएम विश्वकर्मा योजना' : 'PM Vishwakarma Scheme',
      ministry: language === 'hi' ? 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय' : 'Ministry of MSME',
      benefit: language === 'hi' ? '₹3 लाख तक संपार्श्विक-मुक्त ऋण (5% ब्याज दर)' : 'Up to ₹3 Lakhs credit at 5% concessional interest',
      category: language === 'hi' ? 'पारंपरिक कारीगर एवं शिल्पकार' : 'Traditional Artisans & Trades',
      tag: 'Subsidized 5%',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#0B1736] flex flex-col font-sans selection:bg-[#159A68] selection:text-white">
      <Navbar />

      <div className="flex-1 flex w-full min-w-0">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1550px] w-full min-w-0 space-y-6 sm:space-y-7">
          
          {/* Breadcrumb Navigation (Direct Reference Match) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#159A68] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0B1736] font-semibold">Dashboard</span>
          </div>

          {/* ========================================================================= */}
          {/* 1. DASHBOARD HERO BANNER (Direct Reference Composition & Visual Continuity) */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
            {/* Dashboard Hero Visual Area */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden rounded-r-2xl sm:rounded-r-3xl z-0 opacity-25 sm:opacity-100 transition-opacity">
              <img
                src="/dashboard-shopkeeper.jpg"
                alt="Entrepreneur in grocery store"
                className="w-full h-full object-cover object-[55%_25%]"
                style={{
                  maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,1) 75%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,1) 75%)"
                }}
              />
            </div>

            {/* Left Column: Confident Editorial Title & Supporting Copy */}
            <div className="relative z-10 max-w-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest">
                  DASHBOARD
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  Empirical MSME Intelligence
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-black text-[#0B1736] tracking-tight leading-tight">
                Welcome back, {user?.name || user?.phone || 'Entrepreneur'}!
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Here&apos;s your snapshot across business, market, schemes and financial opportunities.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/advisory/business-plan"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1736] hover:bg-[#159A68] text-white text-xs font-bold shadow-xs transition-colors group cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-[#0B1736] text-xs font-semibold border border-slate-200/90 shadow-2xs transition-colors backdrop-blur-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#159A68]" />
                  <span>{user?.district ? `${user.district}, ${user.state || 'India'}` : 'Configure Location'}</span>
                </Link>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 1B. 4 QUICK METRIC OVERVIEW CARDS (Dynamic State)                          */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Business Profile */}
            <Link
              href="/dashboard/profile"
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-[#159A68]/40 hover:shadow-sm transition-all group flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Business Profile</div>
                <div className="text-xl sm:text-2xl font-black text-[#0B1736] mt-1 group-hover:text-[#159A68] transition-colors">
                  {profileCompletion}%
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {profileCompletion === 100 ? 'Fully Configured' : 'Complete Profile'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            </Link>

            {/* Card 2: Market Analysis */}
            <Link
              href="/dashboard/market-analysis"
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-[#159A68]/40 hover:shadow-sm transition-all group flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Market Intelligence</div>
                <div className="text-xl sm:text-2xl font-black text-[#0B1736] mt-1 group-hover:text-[#159A68] transition-colors truncate max-w-[140px]">
                  {user?.district || 'District Data'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {market ? `${market.total_enterprises?.toLocaleString() || ''} Enterprises` : 'View Analysis'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
            </Link>

            {/* Card 3: Schemes Matched */}
            <Link
              href="/advisory/schemes"
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-[#159A68]/40 hover:shadow-sm transition-all group flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Government Schemes</div>
                <div className="text-xl sm:text-2xl font-black text-[#0B1736] mt-1 group-hover:text-[#159A68] transition-colors">
                  {programCount || 115} Schemes
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Central &amp; State Catalogue
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
            </Link>

            {/* Card 4: Financial Options */}
            <Link
              href="/advisory/financial"
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-[#159A68]/40 hover:shadow-sm transition-all group flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Financial Advisor</div>
                <div className="text-xl sm:text-2xl font-black text-[#0B1736] mt-1 group-hover:text-[#159A68] transition-colors">
                  3 Scenarios
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Balanced, Safe &amp; Growth
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <BadgeIndianRupee className="w-5 h-5" />
              </div>
            </Link>
          </section>

          {/* ========================================================================= */}
          {/* 1C. YOUR NEXT STEPS & RECENT ACTIVITY (Direct Reference Match - Screen 2) */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Your Next Steps */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">Your Next Steps</h2>
              
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F4A340] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <span className="text-xs font-semibold text-[#0B1736]">Complete DPR Builder</span>
                  </div>
                  <Link
                    href="/advisory/business-plan"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-[#0B1736] hover:bg-[#159A68] hover:text-white hover:border-[#159A68] transition-all flex items-center gap-1 shrink-0 shadow-2xs"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F4A340] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <span className="text-xs font-semibold text-[#0B1736]">Explore Government Schemes</span>
                  </div>
                  <Link
                    href="/advisory/schemes"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-[#0B1736] hover:bg-[#159A68] hover:text-white hover:border-[#159A68] transition-all flex items-center gap-1 shrink-0 shadow-2xs"
                  >
                    <span>View Schemes</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#159A68] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      3
                    </span>
                    <span className="text-xs font-semibold text-[#0B1736]">Get AI Guidance</span>
                  </div>
                  <Link
                    href="/chat"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-[#0B1736] hover:bg-[#159A68] hover:text-white hover:border-[#159A68] transition-all flex items-center gap-1 shrink-0 shadow-2xs"
                  >
                    <span>Ask Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">Recent Activity</h2>
              
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((act, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${act.dotColor}`} />
                        <span className="font-semibold text-[#0B1736]">{act.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{act.detail}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-600">No recent activity recorded yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Your profile updates, scheme explorations, and market analyses will be tracked here.
                  </p>
                  <div className="pt-2">
                    <Link href="/dashboard/profile" className="inline-flex items-center gap-1 text-xs font-bold text-[#159A68] hover:underline">
                      <span>Complete your profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Missing Location Alert Banner (if applicable) */}
          {(!user?.district || !user?.state) && (
            <div className="p-4 rounded-xl bg-[#FFF9EE] border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F4A340] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#0B1736]">Profile Location Not Fully Configured</p>
                  <p className="text-slate-600 mt-0.5">
                    Please specify your district and state in Business Profile to unlock localized MSME market intelligence and statutory scheme eligibility.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/profile"
                className="px-3.5 py-1.5 rounded-lg bg-[#F4A340] hover:bg-[#E2922F] text-white font-bold text-xs shrink-0 transition-colors inline-block text-center shadow-xs"
              >
                Complete Profile
              </Link>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. KEY SIGNALS (Single Clean Horizontal Surface, No Fragmented Cards) */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                KEY SIGNALS
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Live authoritative indicators
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              
              {/* Signal 1: Market Demand */}
              <div className="sm:pr-4 pt-4 sm:pt-0">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('dashboard.marketDemand')}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1736] tracking-tight mt-1.5">
                  {market?.total_msmes 
                    ? `${(market.total_msmes / 1000).toFixed(1)}k MSMEs` 
                    : (researchLoading ? 'Loading...' : (user?.district ? 'Pending' : '48.5k MSMEs'))}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed">
                  {market?.micro_share !== undefined 
                    ? `${market.micro_share.toFixed(1)}% Micro Enterprises` 
                    : 'Official Udyam records'}
                </p>
                {market?.state_rank && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-[#159A68] bg-[#EAF7F0] px-2 py-0.5 rounded">
                    State Rank #{market.state_rank}/{market.total_districts_in_state || 75}
                  </span>
                )}
              </div>

              {/* Signal 2: Relevant Schemes */}
              <div className="sm:px-6 pt-4 sm:pt-0">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('dashboard.relevantSchemes')}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1736] tracking-tight mt-1.5">
                  {programCount > 0 ? `${programCount} Programmes` : '115 Programmes'}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed">
                  Central Sector &amp; Centrally Sponsored
                </p>
                <Link
                  href="/advisory/schemes"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159A68] hover:underline mt-2"
                >
                  <span>Explore Schemes</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Signal 3: Capital Advisory */}
              <div className="sm:px-6 pt-4 sm:pt-0">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Capital Advisory
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1736] tracking-tight mt-1.5">
                  {primaryBusiness?.estimatedCapital
                    ? `₹${(primaryBusiness.estimatedCapital / 100000).toFixed(1)}L Target`
                    : 'Up to ₹50 Lakhs'}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed">
                  PMEGP, MUDRA &amp; CGTMSE
                </p>
                <Link
                  href="/advisory/financial"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159A68] hover:underline mt-2"
                >
                  <span>Structuring</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Signal 4: District Climate Context */}
              <div className="sm:pl-6 pt-4 sm:pt-0">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  District Climate Context
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1736] tracking-tight mt-1.5">
                  {researchLoading ? (
                    <span className="text-slate-400 text-lg font-semibold animate-pulse">Loading...</span>
                  ) : weather?.current ? (
                    `${Math.round(weather.current.temperature_c)}°C • ${weather.current.weather_description}`
                  ) : (
                    'Weather Unavailable'
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed">
                  {weather?.current ? (
                    `Feels ${Math.round(weather.current.apparent_temperature_c)}°C • Rain ${weather.current.precipitation_mm}mm`
                  ) : (
                    researchError || 'Weather data unavailable for this location'
                  )}
                </p>
                {weather?.current && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Open-Meteo Live
                  </span>
                )}
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. MAIN ANALYTICS CENTERPIECE: MSME Scale Breakdown + Key Insights */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* 3. MAIN ANALYTICS CENTERPIECE: MSME Scale Breakdown + Key Insights */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden space-y-8">
            
            {/* Subtle Tricolor Visual Identity Accent at Top Border */}
            <div className="h-[2.5px] w-full bg-gradient-to-r from-[#FF9933]/70 via-slate-200 to-[#159A68]/70 absolute top-0 left-0 right-0" />

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest block mb-1">
                  EMPIRICAL REGISTRY DISTRIBUTION
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#0B1736] tracking-tight">
                  District MSME Enterprise Scale Breakdown
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                  {user?.district
                    ? `Empirical distribution from official Udyam records for ${activeDistrictName}, ${activeStateName}.`
                    : 'Empirical distribution from official Udyam records. Select your district in profile to view local MSME data.'}
                </p>
              </div>

              {market && (
                <div className="flex items-center gap-3 text-xs font-medium text-slate-600 shrink-0">
                  <span>State Rank: <strong className="font-bold text-[#0B1736]">#{market.state_rank}</strong>/{market.total_districts_in_state || 75}</span>
                  <span>•</span>
                  <span>National Rank: <strong className="font-bold text-[#0B1736]">#{market.national_rank}</strong>/785</span>
                </div>
              )}
            </div>

            {/* Asymmetrical Analytical Grid: Dominant Chart (70%) + Editorial Key Insights (30%) */}
            {market ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Dominant Chart Canvas */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="h-80 sm:h-96 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={enterpriseScaleChartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="tier" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: any, name: any, item: any) => [
                            `${Number(value).toLocaleString()} registered enterprises (${item.payload.share}%)`,
                            item.payload.fullName
                          ]}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={64}>
                          {enterpriseScaleChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Data source: Ministry of Micro, Small and Medium Enterprises (MoMSME) Udyam national registry datasets.
                  </p>
                </div>

                {/* Key Insights Editorial Panel */}
                <div className="lg:col-span-4 space-y-6 lg:border-l lg:border-slate-100 lg:pl-8">
                  <div>
                    <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">
                      Key Insights
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Numerical composition by enterprise scale
                    </p>
                  </div>

                  {/* Clean Numerical Stats List */}
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#159A68] shrink-0" />
                        <span className="font-semibold text-slate-700">Micro Enterprises</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#0B1736]">
                          {market.micro_enterprises ? market.micro_enterprises.toLocaleString() : '—'}
                        </span>
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          ({market.micro_share !== undefined ? market.micro_share.toFixed(1) : '—'}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shrink-0" />
                        <span className="font-semibold text-slate-700">Small Enterprises</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#0B1736]">
                          {market.small_enterprises ? market.small_enterprises.toLocaleString() : '—'}
                        </span>
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          ({market.small_share !== undefined ? market.small_share.toFixed(1) : '—'}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] shrink-0" />
                        <span className="font-semibold text-slate-700">Medium Enterprises</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#0B1736]">
                          {market.medium_enterprises ? market.medium_enterprises.toLocaleString() : '—'}
                        </span>
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          ({market.medium_share !== undefined ? market.medium_share.toFixed(1) : '—'}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Analytical Takeaways */}
                  <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-600 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] shrink-0 mt-1.5" />
                      <span>
                        <strong className="font-bold text-[#0B1736]">{market.micro_share ? `${Math.round(market.micro_share)}%+ Micro Concentration` : 'Micro Concentration'}:</strong> Dense base of self-employed micro manufacturing &amp; trade units.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                      <span>
                        <strong className="font-bold text-[#0B1736]">Credit Guarantee Gap:</strong> Prime qualifying zone for collateral-free CGTMSE &amp; PMEGP capital expansion.
                      </span>
                    </div>
                  </div>

                  {/* Editorial Research Observations */}
                  {observations.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Local Observations
                      </span>
                      <div className="space-y-2">
                        {observations.map((obs: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-normal">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68] shrink-0 mt-0.5" />
                            <span>{obs}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : researchLoading ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <Loader2 className="w-7 h-7 mx-auto animate-spin text-[#159A68]" />
                <p className="text-xs font-semibold text-slate-600">Retrieving official Udyam MSME registry data...</p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200/80 p-8">
                <BarChart3 className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                <div className="max-w-md mx-auto space-y-1">
                  <p className="text-sm font-bold text-[#0B1736]">Configure Location to View Enterprise Breakdown</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set your enterprise location in Business Profile to load empirical Udyam registry records, scale distribution, and district state rankings.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1736] hover:bg-[#159A68] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>Configure Location in Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* 4. RECENT GOVERNMENT SCHEMES & ML MARKET CLASSIFICATION */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left 7 Columns: RECENT GOVERNMENT SCHEMES (Clean Actionable List) */}
            <section className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest block mb-1">
                    STATUTORY ASSISTANCE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-[#0B1736] tracking-tight">
                    Recent Government Schemes
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Top matching schemes for your business profile.
                  </p>
                </div>

                <Link
                  href="/advisory/schemes"
                  className="text-xs font-bold text-[#159A68] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>View All Schemes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Compact Schemes List */}
              <div className="divide-y divide-slate-100">
                {prioritySchemes.map((scheme) => (
                  <div key={scheme.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF7F0] text-[#159A68] border border-[#159A68]/20">
                          {scheme.tag}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {scheme.ministry}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0B1736] group-hover:text-[#159A68] transition-colors">
                        {scheme.name}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-normal">
                        {scheme.benefit}
                      </p>
                    </div>

                    <Link
                      href="/advisory/schemes"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0B1736] group-hover:text-[#159A68] bg-[#F7F8F5] group-hover:bg-[#EAF7F0] px-3.5 py-1.5 rounded-xl border border-slate-200/80 transition-colors shrink-0 self-start sm:self-center"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#159A68]" />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Total {programCount || 115} Central and State subsidy schemes indexed.</span>
                <Link href="/advisory/schemes" className="font-bold text-[#159A68] hover:underline flex items-center gap-1">
                  <span>Explore full directory</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </section>

            {/* Right 5 Columns: ML MARKET CLASSIFICATION (Analytical Intelligence Panel) */}
            <section className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest">
                    MACHINE LEARNING
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    scikit-learn k-means
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#0B1736] tracking-tight">
                  ML Market Classification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unsupervised district archetype classification based on 785 national district datasets.
                </p>
              </div>

              {/* Market Cluster Result */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#F7F8F5] border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      MARKET CLUSTER
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF7F0] text-[#159A68]">
                      {ml?.cluster_id !== undefined ? `Cluster #${ml.cluster_id}` : 'Cluster Pending'}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#0B1736]">
                    {ml?.cluster_label || (user?.district ? 'District Archetype Computing...' : 'District Archetype Pending')}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {ml?.cluster_description || (user?.district ? 'Evaluating statistical density features against national Udyam clusters.' : 'Configure your enterprise location in profile to compute k-means cluster placement and quantitative indicators.')}
                  </p>
                </div>

                {/* Quantitative Market Research Indicator Score */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Market Research Indicator</span>
                    <span className="font-black text-[#0B1736]">
                      {ml?.quantitative_indicators?.market_research_indicator 
                        ? ml.quantitative_indicators.market_research_indicator.toFixed(1) 
                        : '—'} <span className="text-[11px] font-normal text-slate-400">/ 100</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#159A68] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, ml?.quantitative_indicators?.market_research_indicator || 0))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>40% National Density</span>
                    <span>30% State Density</span>
                    <span>30% SME Depth</span>
                  </div>
                </div>

                {/* Key Percentiles */}
                <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">National Density Percentile</span>
                    <span className="font-bold text-[#0B1736]">
                      {ml?.quantitative_indicators?.national_density_percentile 
                        ? `${ml.quantitative_indicators.national_density_percentile.toFixed(1)}%` 
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">State Density Percentile</span>
                    <span className="font-bold text-[#0B1736]">
                      {ml?.quantitative_indicators?.state_density_percentile 
                        ? `${ml.quantitative_indicators.state_density_percentile.toFixed(1)}%` 
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Formal SME Depth Score</span>
                    <span className="font-bold text-[#0B1736]">
                      {ml?.quantitative_indicators?.sme_depth_score 
                        ? `${ml.quantitative_indicators.sme_depth_score.toFixed(1)} / 100` 
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                Methodology: Deterministic k-means (k=4) fitted on official 785 Udyam district MSME profiles.
              </div>
            </section>

          </div>

          {/* ========================================================================= */}
          {/* 5. WEATHER & OPERATIONAL INTELLIGENCE (Contextual Heuristic Layer) */}
          {/* ========================================================================= */}
          {(cautions.length > 0 || weatherImpact?.is_available || weather?.current) && (
            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest block mb-1">
                    MICROCLIMATE &amp; OPERATIONAL CONTEXT
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-[#0B1736] tracking-tight">
                    District Weather &amp; Activity Heuristics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atmospheric conditions mapped to indicative enterprise footfall and logistics disruption signals.
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Open-Meteo Model • Zero Footfall Fabrication
                </span>
              </div>

              {/* Operational Cautions */}
              {cautions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Statutory &amp; Operational Advisories</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {cautions.map((caution: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-amber-950 bg-[#FFF9EE] p-3 rounded-xl border border-amber-200/80 leading-relaxed font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{caution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Heuristic Grid: Current Impact + Business Implication + Risk Signals */}
              {weatherImpact && weatherImpact.is_available && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  
                  {/* Item 1: Impact Label */}
                  <div className="p-4 rounded-xl bg-[#F7F8F5] border border-slate-200/70 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Activity Impact
                    </span>
                    <div className="text-sm font-bold text-[#0B1736]">
                      {weatherImpact.activity_impact_label}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {weatherImpact.potential_footfall_effect}
                    </p>
                  </div>

                  {/* Item 2: Business Implication */}
                  <div className="p-4 rounded-xl bg-[#F7F8F5] border border-slate-200/70 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Sector Sensitivity ({primaryBusiness?.type || 'Enterprise'})
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {weatherImpact.business_type_implication || 'Standard operational conditions prevailing across commercial transport and retail corridors.'}
                    </p>
                  </div>

                  {/* Item 3: Risk Summary */}
                  <div className="p-4 rounded-xl bg-[#F7F8F5] border border-slate-200/70 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Atmospheric Risk Signals
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80">
                        <span className="text-slate-500 text-[11px]">Heat</span>
                        <span className="font-bold text-[#0B1736]">{weatherImpact.risk_signals?.heat_stress || 'Normal'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80">
                        <span className="text-slate-500 text-[11px]">Rain</span>
                        <span className="font-bold text-[#0B1736]">{weatherImpact.risk_signals?.rain_disruption || 'None'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
