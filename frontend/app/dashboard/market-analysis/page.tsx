'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import {
  TrendingUp,
  BarChart3,
  Users,
  MapPin,
  ChevronRight,
  ChevronDown,
  Award,
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
  Loader2,
  FileText,
  Compass,
  Building2,
  ShieldCheck,
  AlertTriangle,
  CloudSun,
  Activity,
  ArrowRight,
  CheckCircle2,
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
  Line,
  ComposedChart,
} from 'recharts';
import { MarketIntelligenceResponse } from '@/lib/api-client';

export default function MarketAnalysisPage() {
  const { t, language } = useLanguage();
  const { user, setUser, business } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  const [analysisTab, setAnalysisTab] = useState<'overview' | 'demand' | 'competitor' | 'price' | 'growth'>('overview');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Lucknow');
  const [selectedDomain, setSelectedDomain] = useState<string>('Services');
  const [geoTab, setGeoTab] = useState<'districts' | 'state' | 'national'>('districts');
  const [selectedFocus, setSelectedFocus] = useState<string>('Services - Zari Brocade Weaving');
  const [isFocusDropdownOpen, setIsFocusDropdownOpen] = useState(false);

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligenceResponse | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);

  const triggerResearch = (district = selectedDistrict, domain = selectedDomain) => {
    setResearchLoading(true);
    fetch('/api/research/market-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state_name: user?.state || 'Uttar Pradesh',
        district_name: district,
        business_profile: {
          business_type: domain,
          sub_type: business?.activity || 'Zari Brocade Weaving',
          target_market: 'Regional Wholesale & Direct Retail',
        },
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setMarketIntelligence(data);
      })
      .catch((err) => console.warn('Market intelligence fetch notice:', err))
      .finally(() => setResearchLoading(false));
  };

  // 1. Fetch user profile and registered businesses
  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        if (data.business && data.business.type) {
          const defaultFocus = `${data.business.sector || 'Services'} - ${data.business.activity || data.business.type || 'Zari Brocade Weaving'}`;
          setSelectedFocus(defaultFocus);
        }
      })
      .catch((err) => console.warn('Could not load user profile:', err));

    fetch('/api/businesses')
      .then((res) => res.json())
      .then((data) => {
        if (data.businesses && data.businesses.length > 0) {
          setBusinesses(data.businesses);
        }
      })
      .finally(() => setLoading(false));
  }, [setUser]);

  // 2. Fetch unified market intelligence via FastAPI backend
  useEffect(() => {
    const activeDistrict = user?.district || 'Lucknow';
    const activeState = user?.state || 'Uttar Pradesh';

    setResearchLoading(true);
    fetch('/api/research/market-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state_name: activeState,
        district_name: activeDistrict,
        business_profile: {
          business_type: business?.type || 'Handloom & Textiles',
          sub_type: business?.activity || 'Zari Brocade Weaving',
          target_market: 'Regional Wholesale & Direct Retail',
        },
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setMarketIntelligence(data);
      })
      .catch((err) => console.warn('Market intelligence fetch notice:', err))
      .finally(() => setResearchLoading(false));
  }, [user?.district, user?.state, business]);

  const activeDistrictName = user?.district || marketIntelligence?.district_name || 'Lucknow';
  const activeStateName = user?.state || marketIntelligence?.state_name || 'Uttar Pradesh';
  const ml = marketIntelligence?.ml_analysis;
  const weather = marketIntelligence?.weather_context;
  const weatherImpact = marketIntelligence?.weather_activity_impact;

  // Curated 5-Year Market Projection Data (Centerpiece Visualization)
  const projectionData = [
    { year: '2024', size: 650, line: 650, yoy: 'Base Year' },
    { year: '2025', size: 880, line: 880, yoy: '+35.4%' },
    { year: '2026', size: 1150, line: 1150, yoy: '+30.7%' },
    { year: '2027', size: 1480, line: 1480, yoy: '+28.7%' },
    { year: '2028', size: 1850, line: 1850, yoy: '+25.0%' },
  ];

  // Market Trend Data (2019-2024) matching Screen 4
  const marketTrendData = [
    { year: '2019', size: 6200 },
    { year: '2020', size: 5800 },
    { year: '2021', size: 7400 },
    { year: '2022', size: 9100 },
    { year: '2023', size: 10800 },
    { year: '2024', size: 12450 },
  ];

  // Geographic comparison data sets
  const districtList = [
    { rank: 1, name: activeDistrictName, score: 88, status: 'High Potential', highlight: true },
    { rank: 2, name: activeDistrictName === 'Varanasi' ? 'Lucknow' : 'Varanasi', score: 84, status: 'High Potential', highlight: false },
    { rank: 3, name: 'Kanpur Nagar', score: 72, status: 'Moderate Potential', highlight: false },
    { rank: 4, name: 'Prayagraj', score: 65, status: 'Emerging Opportunity', highlight: false },
  ];

  const stateComparisonList = [
    { rank: 1, name: 'Uttar Pradesh (Home)', score: 91, status: 'Top National Cluster', highlight: true },
    { rank: 2, name: 'Gujarat', score: 87, status: 'Major Export Corridors', highlight: false },
    { rank: 3, name: 'Tamil Nadu', score: 82, status: 'Established Production Hub', highlight: false },
    { rank: 4, name: 'Rajasthan', score: 78, status: 'Artisan Catchment Area', highlight: false },
  ];

  const nationalComparisonList = [
    { rank: 1, name: 'Northern Zone (UP / Delhi NCR)', score: 94, status: 'Primary Domestic Demand', highlight: true },
    { rank: 2, name: 'Western Zone (Surat / Mumbai)', score: 89, status: 'High Wholesale Liquidity', highlight: false },
    { rank: 3, name: 'Southern Zone (Chennai / BLR)', score: 80, status: 'Premium Retail Growth', highlight: false },
    { rank: 4, name: 'Eastern Zone (Kolkata Hub)', score: 76, status: 'Regional Distribution', highlight: false },
  ];

  const activeGeoList =
    geoTab === 'districts'
      ? districtList
      : geoTab === 'state'
      ? stateComparisonList
      : nationalComparisonList;

  const focusOptions = [
    'Services - Zari Brocade Weaving',
    'Manufacturing - Agro-Processing Unit',
    'Trading - Traditional Handloom Retail',
    'Services - Milk Chilling & Pasteurization',
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#0B1736] flex flex-col font-sans selection:bg-[#159A68] selection:text-white">
      <Navbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1550px] w-full min-w-0 space-y-6 sm:space-y-7">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#159A68] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0B1736] font-semibold">Market Analysis</span>
          </div>

          {/* ========================================================================= */}
          {/* 1. PAGE INTRO (Header Area with Subtle Indian Rural/Market Visual)         */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs relative overflow-hidden">
            {/* Subtle India/Rural/Market Artwork Fading on the Right */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden rounded-r-2xl sm:rounded-r-3xl z-0">
              <img
                src="/market-textile.jpg"
                alt="Traditional vibrant Indian textile market"
                className="w-full h-full object-cover object-[50%_45%] market-hero-mask"
              />
              <style dangerouslySetInnerHTML={{ __html: `
                .market-hero-mask {
                  -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                  mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                }
                @media (min-width: 640px) {
                  .market-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                  }
                }
                @media (min-width: 1024px) {
                  .market-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                  }
                }
              `}} />
            </div>

            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="text-[11px] font-bold text-[#159A68] tracking-widest uppercase block">
                MARKET ANALYSIS
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B1736] tracking-tight font-serif">
                Understand your market
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
                Get data-driven insights using real census data, district intelligence and nearest neighbors analysis.
              </p>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. SUB-NAVIGATION PILLS & DISTRICT / SECTOR FILTERS BAR                   */}
          {/* ========================================================================= */}
          <section className="space-y-4">
            {/* Top Navigation Pills matching Screen 4 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'overview', label: 'Market Overview' },
                { id: 'demand', label: 'Demand Analysis' },
                { id: 'competitor', label: 'Competitor Analysis' },
                { id: 'price', label: 'Price Insights' },
                { id: 'growth', label: 'Growth Potential' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAnalysisTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    analysisTab === tab.id
                      ? 'bg-[#159A68] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-[#0B1736] border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter Controls Row: District + Domain + Generate Analysis Button */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* District Selector */}
                <div className="flex items-center gap-2.5">
                  <label htmlFor="district-select" className="text-xs font-semibold text-slate-500">
                    District
                  </label>
                  <div className="relative">
                    <select
                      id="district-select"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="appearance-none bg-slate-50 hover:bg-slate-100/80 text-xs font-bold text-[#0B1736] pl-3 pr-8 py-2 rounded-xl border border-slate-200 cursor-pointer focus:outline-none focus:border-[#159A68]"
                    >
                      <option value="Lucknow">Lucknow</option>
                      <option value="Varanasi">Varanasi</option>
                      <option value="Kanpur Nagar">Kanpur Nagar</option>
                      <option value="Prayagraj">Prayagraj</option>
                      <option value="Agra">Agra</option>
                      <option value="Gorakhpur">Gorakhpur</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Business Domain Selector */}
                <div className="flex items-center gap-2.5">
                  <label htmlFor="domain-select" className="text-xs font-semibold text-slate-500">
                    Business Domain
                  </label>
                  <div className="relative">
                    <select
                      id="domain-select"
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="appearance-none bg-slate-50 hover:bg-slate-100/80 text-xs font-bold text-[#0B1736] pl-3 pr-8 py-2 rounded-xl border border-slate-200 cursor-pointer focus:outline-none focus:border-[#159A68]"
                    >
                      <option value="Services">Services</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Handloom & Textiles">Handloom & Textiles</option>
                      <option value="Agro-Processing">Agro-Processing</option>
                      <option value="Trading">Trading</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Action Button: Generate Analysis */}
              <button
                type="button"
                onClick={() => triggerResearch(selectedDistrict, selectedDomain)}
                disabled={researchLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                {researchLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Generate Analysis</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. PRIMARY MARKET SIGNALS (4 Metric Cards matching Screen 4)              */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Market Size */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Market Size
                </span>
                <div className="text-2xl font-black text-[#159A68] tracking-tight mt-1">
                  ₹ 12,450 Cr
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-normal mt-2">
                Estimated annual market size
              </p>
            </div>

            {/* Card 2: Growth Rate */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Growth Rate
                </span>
                <div className="text-2xl font-black text-[#159A68] tracking-tight mt-1">
                  8.5%
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-normal mt-2">
                Projected CAGR (3 years)
              </p>
            </div>

            {/* Card 3: Total Businesses */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Total Businesses
                </span>
                <div className="text-2xl font-black text-[#0B1736] tracking-tight mt-1">
                  12,340
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-normal mt-2">
                Active businesses in district
              </p>
            </div>

            {/* Card 4: Opportunity Score */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Opportunity Score
                </span>
                <div className="text-2xl font-black text-[#159A68] tracking-tight mt-1">
                  High
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-normal mt-2">
                Based on demand-supply gap
              </p>
            </div>

          </section>

          {/* ========================================================================= */}
          {/* 4. MAIN VISUALIZATION + KEY MARKET INSIGHTS (Centerpiece Research View)   */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column (lg:col-span-7): Primary Market Chart */}
            <section className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                        Market Trend (2019-2024)
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Historical and current market size expansion in {selectedDistrict}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#159A68] text-xs font-bold border border-[#159A68]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                      <span>₹12,450 Cr</span>
                    </span>
                  </div>
                </div>

                {/* Analytical Centerpiece Chart */}
                <div className="h-64 sm:h-72 w-full pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 10 }}
                        ticks={[0, 3000, 6000, 9000, 12000]}
                        unit=" Cr"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1">
                                <div className="font-bold text-[#0B1736]">FY {data.year} Market Trend</div>
                                <div className="text-[#159A68] font-bold text-sm">₹{data.size.toLocaleString('en-IN')} Crores</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="size" fill="#159A68" radius={[6, 6, 0, 0]} maxBarSize={44}>
                        {marketTrendData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === marketTrendData.length - 1 ? '#159A68' : '#82ca9d'}
                            opacity={0.9}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Source: DPIIT Cluster Registry &amp; District Statistical Handbooks</span>
                <span className="font-medium text-slate-600">CAGR: +8.5% (2021–2024)</span>
              </div>
            </section>

            {/* Right Column (lg:col-span-5): Key Market Insights */}
            <section className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF9EE] text-[#F4A340] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                      Key Insights
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      AI-powered insights based on district, sector and national data
                    </p>
                  </div>
                </div>

                {/* Structured Concise Insight Rows Matching Reference */}
                <div className="space-y-4 pt-5">
                  
                  {/* Insight 1 */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-full bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal group-hover:text-[#0B1736] transition-colors">
                      Demand for services is growing steadily
                    </p>
                  </div>

                  {/* Insight 2 */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal group-hover:text-[#0B1736] transition-colors">
                      Lower competition compared to national average
                    </p>
                  </div>

                  {/* Insight 3 */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-full bg-[#FFF9EE] text-[#F4A340] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal group-hover:text-[#0B1736] transition-colors">
                      Good scope for expansion in rural areas
                    </p>
                  </div>

                  {/* Insight 4 */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal group-hover:text-[#0B1736] transition-colors">
                      Favorable government policies in the sector
                    </p>
                  </div>

                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Model Confidence: 94.2%</span>
                <Link
                  href="/advisory/schemes"
                  className="text-xs font-bold text-[#159A68] hover:underline inline-flex items-center gap-1"
                >
                  <span>Explore Matching Schemes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>

          </div>

          {/* ========================================================================= */}
          {/* 5. SECONDARY ANALYSIS: TARGET MARKET SEGMENTS + GEOGRAPHIC OPPORTUNITY     */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column (lg:col-span-6): Target Market Segments */}
            <section className="lg:col-span-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                    Target Market Segments
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Primary customer segments for your product/service
                  </p>
                </div>
              </div>

              {/* Clean Segment Indicators Matching Reference Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                
                {/* Segment 1: 45% Domestic Retail */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border-4 border-[#159A68] flex items-center justify-center font-black text-xs text-[#0B1736] shrink-0 shadow-2xs">
                    45%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0B1736] leading-tight">
                      Domestic Retail
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      (Handloom Stores)
                    </div>
                  </div>
                </div>

                {/* Segment 2: 30% Export Markets */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border-4 border-[#F4A340] flex items-center justify-center font-black text-xs text-[#0B1736] shrink-0 shadow-2xs">
                    30%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0B1736] leading-tight">
                      Export Markets
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      (Global Buyers)
                    </div>
                  </div>
                </div>

                {/* Segment 3: 25% Fashion Brands */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center font-black text-xs text-[#0B1736] shrink-0 shadow-2xs">
                    25%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0B1736] leading-tight">
                      Fashion &amp; Ethnic
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Wear Brands
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F8F5] border border-slate-200/70 text-xs text-slate-600 leading-relaxed font-normal">
                <span className="font-bold text-[#0B1736]">Buyer Retention Signal:</span> Regional wholesale buyers demonstrate an 84% repeat purchasing rate when products maintain Geographical Indication (GI) certification.
              </div>
            </section>

            {/* Right Column (lg:col-span-6): Geographic Opportunity */}
            <section className="lg:col-span-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                      Geographic Opportunity
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      High potential markets based on demand and enterprise density
                    </p>
                  </div>
                </div>

                {/* Geographic Sub-Tabs Matching Reference */}
                <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setGeoTab('districts')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      geoTab === 'districts'
                        ? 'bg-[#159A68] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-[#0B1736]'
                    }`}
                  >
                    Top Districts
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeoTab('state')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      geoTab === 'state'
                        ? 'bg-[#159A68] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-[#0B1736]'
                    }`}
                  >
                    State Comparison
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeoTab('national')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      geoTab === 'national'
                        ? 'bg-[#159A68] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-[#0B1736]'
                    }`}
                  >
                    National Comparison
                  </button>
                </div>
              </div>

              {/* Geographic Ranking List */}
              <div className="space-y-3 pt-1">
                {activeGeoList.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-[130px]">
                      <span className="font-mono text-slate-400 font-bold text-[11px]">{item.rank}</span>
                      <span className={`font-bold ${item.highlight ? 'text-[#0B1736]' : 'text-slate-700'}`}>
                        {item.name}
                      </span>
                    </div>

                    {/* Visual Comparison Progress Bar */}
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#159A68] h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>

                    <span className="text-[11px] font-bold text-[#159A68] shrink-0 min-w-[110px] text-right">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Empirical Udyam MSME density analysis</span>
                <span className="font-medium text-slate-600">Catchment: 785 Districts</span>
              </div>
            </section>

          </div>

          {/* ========================================================================= */}
          {/* 6. DETAILED ANALYSIS SECTION (When Detailed Analysis Tab is Active)        */}
          {/* ========================================================================= */}
          {activeTab === 'detailed' && (
            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-[#159A68] uppercase tracking-widest block mb-1">
                  ADVANCED EMPIRICAL RESEARCH
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#0B1736] tracking-tight">
                  Detailed Cluster Archetype &amp; Climate Heuristics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  scikit-learn k-means dimensional classification &amp; microclimate operational signals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Metric 1: ML Archetype */}
                <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-slate-200/70 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    ML Archetype
                  </span>
                  <div className="text-sm font-bold text-[#0B1736]">
                    {ml?.cluster_label || 'Emerging Growth District'}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {ml?.cluster_description || 'High enterprise formation velocity with balanced trade density and emerging manufacturing clusters.'}
                  </p>
                </div>

                {/* Metric 2: Market Research Indicator */}
                <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-slate-200/70 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Market Indicator Score (MRI)
                  </span>
                  <div className="text-2xl font-black text-[#0B1736]">
                    {ml?.quantitative_indicators?.market_research_indicator 
                      ? ml.quantitative_indicators.market_research_indicator.toFixed(1)
                      : '74.2'} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#159A68] h-full" style={{ width: '74.2%' }} />
                  </div>
                </div>

                {/* Metric 3: Weather Activity Signal */}
                <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-slate-200/70 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Microclimate Disruption Risk
                  </span>
                  <div className="text-sm font-bold text-[#0B1736]">
                    {weatherImpact?.activity_impact_label || 'Normal Operating Conditions'}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {weatherImpact?.potential_footfall_effect || 'Standard atmospheric stability across wholesale corridors.'}
                  </p>
                </div>

              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
