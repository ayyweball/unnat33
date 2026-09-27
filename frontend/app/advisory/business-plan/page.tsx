'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  FileText,
  Users,
  Briefcase,
  Layers,
  Calendar,
  CloudSun,
  IndianRupee,
  Cpu,
  Database,
  ExternalLink,
  BookOpen,
  Info,
} from 'lucide-react';
import {
  DPRResponse,
  ComparableDistrictItem,
  DistrictResearchContextResponse,
  ConsumerMarketEvidence,
} from '@/lib/api-client';

const PROVENANCE_STYLES: Record<string, string> = {
  'USER PROVIDED': 'bg-blue-50 text-blue-700 border-blue-200',
  'GOVERNMENT / DATASET DERIVED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'MODELLED INDICATOR': 'bg-purple-50 text-purple-700 border-purple-200',
  'AI INTERPRETATION': 'bg-amber-50 text-amber-700 border-amber-200',
  'ILLUSTRATIVE ASSUMPTION': 'bg-orange-50 text-orange-700 border-orange-200',
  'BACKEND DETERMINISTIC CALCULATION': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'USER EDITED': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'INDUSTRY SURVEY EVIDENCE': 'bg-teal-50 text-teal-700 border-teal-200',
};

function ProvenanceBadge({ tag }: { tag: string }) {
  const style = PROVENANCE_STYLES[tag] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${style}`}>
      {tag}
    </span>
  );
}

// 6 Top-Level Workflow Stages
const PRIMARY_STAGES = [
  { id: 1, name: 'Project Overview', shortName: 'Overview', desc: 'Promoter, Location & Basic Enterprise Details' },
  { id: 2, name: 'Market & Competitiveness', shortName: 'Market & Comp', desc: 'Customer, Business Model, Operations & Marketing' },
  { id: 3, name: 'Financial Plan', shortName: 'Financial Plan', desc: 'Capital Structure, Costs & Loan EMI Schedule' },
  { id: 4, name: 'Government Support', shortName: 'Govt Support', desc: 'Statutory Schemes, Subsidies & Eligibility' },
  { id: 5, name: 'Risk & Implementation', shortName: 'Risk & Roadmap', desc: 'Climate Signals, Mitigation & Rollout Milestones' },
  { id: 6, name: 'Review & Generate', shortName: 'Review & DPR', desc: 'Executive Summary, Provenance & DPR Export' },
];

// Secondary Sub-Categories under Stage 2: Market & Competitiveness
type MarketSubCategory = 'customer' | 'business_model' | 'operations' | 'marketing';

const MARKET_SUB_TABS: { id: MarketSubCategory; name: string; desc: string }[] = [
  { id: 'customer', name: 'Customer', desc: 'Target Segments, Demand & Research Evidence' },
  { id: 'business_model', name: 'Business Model', desc: 'Value Proposition & Commercial Partners' },
  { id: 'operations', name: 'Operations', desc: 'Workflow & Machinery Plan' },
  { id: 'marketing', name: 'Marketing', desc: 'Channels & Pricing Framework' },
];

// Official MoSPI HCES 2022-23 State MPCE Reference Baselines (Rural & Urban)
const HCES_STATE_BENCHMARKS: Record<string, { rural: number; urban: number }> = {
  'UTTAR PRADESH': { rural: 3191, urban: 5040 },
  'MAHARASHTRA': { rural: 4010, urban: 6657 },
  'KARNATAKA': { rural: 4397, urban: 7666 },
  'RAJASTHAN': { rural: 4263, urban: 5913 },
  'GUJARAT': { rural: 3798, urban: 6621 },
  'TAMIL NADU': { rural: 4690, urban: 6868 },
  'WEST BENGAL': { rural: 3239, urban: 5227 },
  'BIHAR': { rural: 3384, urban: 4768 },
  'MADHYA PRADESH': { rural: 3131, urban: 5057 },
  'KERALA': { rural: 5924, urban: 7019 },
  'DELHI': { rural: 6576, urban: 8217 },
  'SIKKIM': { rural: 7731, urban: 12105 },
  'CHHATTISGARH': { rural: 2466, urban: 4483 },
  'ALL-INDIA': { rural: 3773, urban: 6459 },
};

export default function RebuiltDPRBuilderPage() {
  const { t } = useLanguage();
  const router = useRouter();

  // Workflow State: 6 Primary Stages + Secondary Sub-tab in Stage 2
  const [currentStage, setCurrentStage] = useState(1);
  const [marketSubTab, setMarketSubTab] = useState<MarketSubCategory>('customer');

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generatingDPR, setGeneratingDPR] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Profile State
  const [form, setForm] = useState({
    businessId: '',
    projectName: 'Banarasi Handloom Weaving Unit',
    promoterName: 'Entrepreneur',
    businessType: 'Handloom & Textiles',
    subType: 'Zari Brocade Weaving',
    experienceLevel: '5+ Years Experienced',
    targetMarket: 'Regional Wholesale & Direct Retail',
    estimatedCapital: 1000000,
    currentIncome: 360000,
    existingDebt: 0,
    districtName: 'Varanasi',
    stateName: 'Uttar Pradesh',
    locationType: 'URBAN',
    category: 'GENERAL',
    gender: 'MALE',
    educationLevel: 'GRADUATE',
    selectedProgramCode: 'PMEGP_NEW',
  });

  // Generated DPR State
  const [dprResult, setDprResult] = useState<DPRResponse | null>(null);

  // Live Research Context (HCES + PwC)
  const [researchContext, setResearchContext] = useState<DistrictResearchContextResponse | null>(null);
  const [loadingResearch, setLoadingResearch] = useState(false);

  // User Qualitative Edits tracking
  const [qualitativeEdits, setQualitativeEdits] = useState<Record<string, string>>({});
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());

  // 1. Initial Load: Fetch saved user and business profile
  useEffect(() => {
    async function loadSavedProfile() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user || data.business) {
            const u = data.user || {};
            const b = data.business || {};
            setForm((prev) => ({
              ...prev,
              businessId: b.id || '',
              projectName: b.name || `${b.sector || b.type || prev.businessType} Enterprise`,
              promoterName: u.name || prev.promoterName,
              businessType: b.sector || b.type || prev.businessType,
              subType: b.description || prev.subType,
              districtName: b.district || u.district || prev.districtName,
              stateName: b.state || u.state || prev.stateName,
              locationType: b.isRural ? 'RURAL' : 'URBAN',
              category: u.category || prev.category,
              gender: u.gender || prev.gender,
              estimatedCapital: b.projectCost || b.estimatedCapital || prev.estimatedCapital,
              currentIncome: b.monthlyIncome ? b.monthlyIncome * 12 : (b.annualTurnover || prev.currentIncome),
              existingDebt: b.existingDebt || prev.existingDebt,
            }));
          }
        }
      } catch (err) {
        console.warn('Could not load profile in DPR builder:', err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadSavedProfile();
  }, []);

  // 2. Fetch Live Research Context (HCES 2022-23 + PwC Voice of the Consumer 2025)
  useEffect(() => {
    async function loadResearchContext() {
      if (!form.districtName || !form.stateName) return;
      setLoadingResearch(true);
      try {
        const params = new URLSearchParams({
          district_name: form.districtName,
          state_name: form.stateName,
          business_type: form.businessType,
          sector: form.subType,
        });
        const res = await fetch(`/api/research/district-market-context?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResearchContext(data);
        }
      } catch (err) {
        console.warn('Could not load research context in DPR builder:', err);
      } finally {
        setLoadingResearch(false);
      }
    }
    loadResearchContext();
  }, [form.districtName, form.stateName, form.businessType, form.subType]);

  // 3. Fetch or trigger DPR synthesis
  const fetchDPR = async () => {
    setGeneratingDPR(true);
    setError(null);
    try {
      const payload = {
        project_name: form.projectName,
        promoter_name: form.promoterName,
        business_type: form.businessType,
        sub_type: form.subType,
        target_market: form.targetMarket,
        experience_level: form.experienceLevel,
        estimated_capital: Number(form.estimatedCapital),
        current_income: Number(form.currentIncome),
        existing_debt: Number(form.existingDebt),
        district_name: form.districtName,
        state_name: form.stateName,
        location_type: form.locationType,
        category: form.category,
        gender: form.gender,
        education_level: form.educationLevel,
        selected_program_code: form.selectedProgramCode,
        qualitative_overrides: qualitativeEdits,
      };

      const res = await fetch('/api/advisory/dpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status} failed to generate DPR`);
      }

      const data: DPRResponse = await res.json();
      setDprResult(data);
    } catch (err: any) {
      console.error('DPR generation error:', err);
      setError(err.message || 'Error communicating with DPR engine');
    } finally {
      setGeneratingDPR(false);
    }
  };

  // Trigger initial DPR synthesis when entering Stage 2 or above
  useEffect(() => {
    if (!dprResult && !generatingDPR && currentStage >= 2) {
      fetchDPR();
    }
  }, [currentStage]);

  const handleQualitativeChange = (field: string, val: string) => {
    setQualitativeEdits((prev) => ({ ...prev, [field]: val }));
    setEditedFields((prev) => new Set(prev).add(field));
  };

  const getFieldProvenance = (field: string, defaultTag: string) => {
    return editedFields.has(field) ? 'USER EDITED' : defaultTag;
  };

  // Stepper Progression Navigation
  const handlePrevious = () => {
    if (currentStage === 1) return;
    if (currentStage === 2) {
      if (marketSubTab === 'marketing') {
        setMarketSubTab('operations');
      } else if (marketSubTab === 'operations') {
        setMarketSubTab('business_model');
      } else if (marketSubTab === 'business_model') {
        setMarketSubTab('customer');
      } else {
        setCurrentStage(1);
      }
      return;
    }
    if (currentStage === 3) {
      setCurrentStage(2);
      setMarketSubTab('marketing');
      return;
    }
    setCurrentStage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    if (currentStage === 1) {
      setCurrentStage(2);
      setMarketSubTab('customer');
      return;
    }
    if (currentStage === 2) {
      if (marketSubTab === 'customer') {
        setMarketSubTab('business_model');
      } else if (marketSubTab === 'business_model') {
        setMarketSubTab('operations');
      } else if (marketSubTab === 'operations') {
        setMarketSubTab('marketing');
      } else {
        setCurrentStage(3);
      }
      return;
    }
    if (currentStage < 6) {
      setCurrentStage((prev) => Math.min(6, prev + 1));
      return;
    }
    fetchDPR();
  };

  // Extract HCES Observation / Values
  const hcesObsString = researchContext?.research_observations?.find((o) => o.includes('HCES 2022-23'));
  const normState = (form.stateName || 'UTTAR PRADESH').toUpperCase();
  const stateBenchmarkFallback = HCES_STATE_BENCHMARKS[normState] || HCES_STATE_BENCHMARKS['ALL-INDIA'];
  const hcesRuralVal = stateBenchmarkFallback?.rural ?? 3191;
  const hcesUrbanVal = stateBenchmarkFallback?.urban ?? 5040;

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        <Sidebar />

        <main className="flex-1 space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#0B1736] text-[#F4A340] flex items-center justify-center shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#0B1736]">DPR & Market Advisory Builder</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7F0] text-[#159A68] border border-[#159A68]/20">
                    6-Stage Workflow Active
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Authoritative Consulting Architecture: Census Grounding + MoSPI HCES + PwC Survey + Statutory Structuring.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchDPR}
                disabled={generatingDPR}
                className="px-4 py-2 bg-[#0B1736] hover:bg-[#152347] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                {generatingDPR ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#F4A340]" />}
                {dprResult ? 'Recalculate DPR' : 'Generate Intelligence'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Clean Stepper Navigation (6 Primary Stages + Subordinate Secondary Navigation) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-4">
            {/* Top Stepper Status & Quick Jump Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#EAF7F0] text-[#159A68] text-xs font-bold">
                    Stage {currentStage} of 6
                  </span>
                  <h2 className="text-sm font-bold text-[#0B1736]">
                    {PRIMARY_STAGES[currentStage - 1]?.name}
                  </h2>
                  <span className="hidden md:inline text-xs text-[#94A3B8]">•</span>
                  <span className="hidden md:inline text-xs text-[#64748B]">
                    {PRIMARY_STAGES[currentStage - 1]?.desc}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full sm:w-72 bg-[#E2E8F0] rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="bg-[#159A68] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((currentStage / 6) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Jump to any stage dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="stage-jump" className="text-xs font-semibold text-[#64748B] hidden sm:inline">
                  Jump to:
                </label>
                <select
                  id="stage-jump"
                  value={currentStage}
                  onChange={(e) => {
                    const stg = Number(e.target.value);
                    setCurrentStage(stg);
                    if (stg === 2 && !marketSubTab) setMarketSubTab('customer');
                  }}
                  className="px-3 py-1.5 bg-[#F8FAFC] border border-[#DCE3EA] rounded-xl text-xs font-semibold text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] cursor-pointer transition-all"
                >
                  {PRIMARY_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}. {s.name} {currentStage > s.id ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Navigation Bar (6 Stages) - Clean, document-oriented, professional */}
            <div className="flex items-center gap-1 sm:gap-2 pb-1 overflow-x-auto no-scrollbar">
              {PRIMARY_STAGES.map((stage) => {
                const active = currentStage === stage.id;
                const completed = currentStage > stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      setCurrentStage(stage.id);
                      if (stage.id === 2 && !marketSubTab) setMarketSubTab('customer');
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                      active
                        ? 'bg-[#0B1736] text-white border-[#0B1736] shadow-xs'
                        : completed
                        ? 'bg-[#F8FAFC] text-[#159A68] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                        : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0B1736]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : completed
                          ? 'bg-[#159A68] text-white'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {completed ? '✓' : stage.id}
                    </span>
                    <span>{stage.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Navigation Bar (Only for Stage 2: Market & Competitiveness) */}
            {currentStage === 2 && (
              <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mr-1">
                  Section:
                </span>
                {MARKET_SUB_TABS.map((sub) => {
                  const isSubActive = marketSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setMarketSubTab(sub.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                        isSubActive
                          ? 'bg-[#EAF7F0] text-[#159A68] border-[#159A68] shadow-xs'
                          : 'bg-white text-slate-600 border-[#E2E8F0] hover:text-slate-900 hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stage Contents Container */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            {/* ============================================================= */}
            {/* Stage 1: Project Overview */}
            {/* ============================================================= */}
            {currentStage === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Stage 1: Project & Promoter Overview</h2>
                    <p className="text-xs text-slate-500">Auto-prefilled from your verified entrepreneur profile.</p>
                  </div>
                  <ProvenanceBadge tag="USER PROVIDED" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={form.projectName}
                      onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Promoter Name</label>
                    <input
                      type="text"
                      value={form.promoterName}
                      onChange={(e) => setForm({ ...form, promoterName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Primary Business Domain</label>
                    <input
                      type="text"
                      value={form.businessType}
                      onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Specific Sub-Type / Trade</label>
                    <input
                      type="text"
                      value={form.subType}
                      onChange={(e) => setForm({ ...form, subType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={form.districtName}
                      onChange={(e) => setForm({ ...form, districtName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={form.stateName}
                      onChange={(e) => setForm({ ...form, stateName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Project Capital Outlay (₹)</label>
                    <input
                      type="number"
                      value={form.estimatedCapital}
                      onChange={(e) => setForm({ ...form, estimatedCapital: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Annual Personal/Business Revenue (₹)</label>
                    <input
                      type="number"
                      value={form.currentIncome}
                      onChange={(e) => setForm({ ...form, currentIncome: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* Stage 2: Market & Competitiveness (Sub-Categories) */}
            {/* ============================================================= */}
            {currentStage === 2 && (
              <div className="space-y-6">
                {/* 2A: Customer Sub-Category (Research Evidence + MSME Census + Customer Segments) */}
                {marketSubTab === 'customer' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Market & Competitiveness: Customer & Demand</h2>
                        <p className="text-xs text-slate-500">
                          Empirical consumption benchmarks, consumer survey evidence, district MSME density, and customer persona segmentation.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <ProvenanceBadge tag="GOVERNMENT / DATASET DERIVED" />
                        <ProvenanceBadge tag="INDUSTRY SURVEY EVIDENCE" />
                      </div>
                    </div>

                    {/* DEDICATED RESEARCH & MARKET EVIDENCE CARD (HCES + PwC) */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/20 border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#159A68]" />
                          <h3 className="text-sm font-bold text-[#0B1736]">Research & Market Evidence</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                          MoSPI HCES 2022-23 & PwC India 2025 Benchmarks
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* HCES 2022-23 State Benchmark Panel */}
                        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0B1736]">
                              Official Household Consumption Benchmark (HCES)
                            </span>
                            <ProvenanceBadge tag="GOVERNMENT / DATASET DERIVED" />
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="p-2.5 bg-slate-50 border rounded-lg">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Rural Monthly Per Capita</span>
                              <div className="text-base font-extrabold text-[#0B1736] mt-0.5">
                                ₹{hcesRuralVal.toLocaleString()}
                              </div>
                              <span className="text-[10px] text-slate-500">{form.stateName} Rural</span>
                            </div>

                            <div className="p-2.5 bg-slate-50 border rounded-lg">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Urban Monthly Per Capita</span>
                              <div className="text-base font-extrabold text-[#159A68] mt-0.5">
                                ₹{hcesUrbanVal.toLocaleString()}
                              </div>
                              <span className="text-[10px] text-slate-500">{form.stateName} Urban</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                            <div><span className="font-semibold text-slate-700">Source:</span> Government of India / MoSPI NSSO Fact Sheet</div>
                            <div><span className="font-semibold text-slate-700">Survey Period:</span> 2022-23 (All-India coverage)</div>
                            <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/60 mt-1">
                              * Official State Benchmark; district MPCE is not fabricated. Non-food expenditure reflects essential consumption basket categories, not discretionary surplus.
                            </div>
                          </div>
                        </div>

                        {/* PwC Voice of the Consumer 2025 Panel */}
                        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0B1736]">
                              Consumer Market Survey (PwC Voice of the Consumer)
                            </span>
                            <ProvenanceBadge tag="INDUSTRY SURVEY EVIDENCE" />
                          </div>

                          {researchContext?.consumer_market_evidence ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 bg-teal-50/40 p-2 rounded-lg border border-teal-100">
                                <div><span className="font-semibold text-slate-800">Geography:</span> {researchContext.consumer_market_evidence.geography} (National)</div>
                                <div><span className="font-semibold text-slate-800">Year:</span> {researchContext.consumer_market_evidence.survey_year}</div>
                                <div><span className="font-semibold text-slate-800">Sample:</span> {researchContext.consumer_market_evidence.sample_size.toLocaleString()} Adults</div>
                              </div>

                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {researchContext.consumer_market_evidence.evidence.map((bullet, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-snug">
                                    <span className="text-teal-600 font-bold shrink-0 mt-0.5">•</span>
                                    <span>{bullet}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-50 border rounded-lg text-[11px] text-slate-500 space-y-1">
                              <div className="font-semibold text-slate-700">Domain Relevance Filtering:</div>
                              <p>
                                PwC Voice of the Consumer (2025) survey evidence is exposed strictly for Food, Agriculture, Retail, and FMCG domains.
                                National grocery survey evidence is not applicable or forced into unrelated sectors ({form.businessType}).
                              </p>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                            * National consumer sentiment benchmark; does not represent localized headcount or predict business success.
                          </div>
                        </div>
                      </div>

                      {/* Zero Score Blending Invariant Notice */}
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-200/60">
                        <Info className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
                        <span>
                          <strong>Zero Score Blending:</strong> HCES economic benchmarks and PwC survey indicators are independent empirical reference points. They are never combined into an arbitrary composite score, nor used to alter statutory scheme eligibility.
                        </span>
                      </div>
                    </div>

                    {/* District MSME Metrics & Nearest Neighbors */}
                    {dprResult?.market_analysis ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 bg-slate-50 border rounded-xl">
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Registered MSMEs</div>
                            <div className="text-lg font-bold text-slate-900 mt-1">
                              {dprResult.market_analysis.total_msmes_in_district.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">PostgreSQL Udyam Census</div>
                          </div>

                          <div className="p-3 bg-slate-50 border rounded-xl">
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Micro Share %</div>
                            <div className="text-lg font-bold text-slate-900 mt-1">
                              {dprResult.market_analysis.micro_enterprise_share.toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Micro enterprise density</div>
                          </div>

                          <div className="p-3 bg-slate-50 border rounded-xl">
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">KMeans Archetype</div>
                            <div className="text-xs font-bold text-indigo-700 mt-1 line-clamp-2">
                              {dprResult.market_analysis.cluster_archetype_label}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">scikit-learn (K=4)</div>
                          </div>

                          <div className="p-3 bg-slate-50 border rounded-xl">
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Market Indicator (MRI)</div>
                            <div className="text-lg font-bold text-emerald-700 mt-1">
                              {dprResult.market_analysis.market_research_indicator.toFixed(1)}/100
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Multi-factor score</div>
                          </div>
                        </div>

                        {/* Nearest Neighbors Comparable Districts */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold text-slate-900 uppercase">
                              Nearest Neighbor Comparable Markets (scikit-learn NearestNeighbors)
                            </h3>
                            <span className="text-[10px] text-slate-500">Euclidean distance in 6-dimensional feature space</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {dprResult.market_analysis.comparable_districts?.map((d, i) => (
                              <div key={i} className="p-3 border border-slate-200 rounded-xl bg-white shadow-xs space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">
                                    #{d.similarity_rank} {d.district_name}, {d.state_name}
                                  </span>
                                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                    Distance: {d.similarity_distance.toFixed(3)}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600">
                                  {d.total_msmes.toLocaleString()} MSMEs ({d.micro_share.toFixed(1)}% Micro, {d.small_medium_share.toFixed(1)}% SME)
                                </div>
                                <p className="text-[11px] text-slate-500 italic mt-1">{d.qualitative_observation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
                        {generatingDPR ? 'Loading authoritative market intelligence...' : 'Click "Generate Intelligence" to compute market analysis.'}
                      </div>
                    )}

                    {/* Customer Segments & Competition Intensity */}
                    {dprResult ? (
                      <div className="space-y-4 pt-2 border-t">
                        <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">Local Buying Behavior</span>
                            <ProvenanceBadge tag={getFieldProvenance('buying_behaviour_summary', 'AI INTERPRETATION')} />
                          </div>
                          <textarea
                            rows={2}
                            value={qualitativeEdits.buying_behaviour_summary ?? dprResult.customer_segments.buying_behaviour_summary}
                            onChange={(e) => handleQualitativeChange('buying_behaviour_summary', e.target.value)}
                            className="w-full text-xs p-2 border rounded bg-white"
                          />
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">Customer Persona Segments</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {dprResult.customer_segments.customer_segments.map((seg, idx) => (
                              <div key={idx} className="p-3 border rounded-xl text-xs space-y-1 bg-white">
                                <div className="font-bold text-slate-900">{seg.segment}</div>
                                <div className="text-slate-600"><span className="font-medium">Need:</span> {seg.need}</div>
                                <div className="text-slate-600"><span className="font-medium">Buying Factor:</span> {seg.buying_consideration}</div>
                                <div className="text-slate-500 text-[11px]"><span className="font-medium">Channel:</span> {seg.recommended_channel}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              Competition Intensity: <span className="text-indigo-700">{dprResult.competition.competition_intensity}</span>
                            </span>
                            <ProvenanceBadge tag="MODELLED INDICATOR" />
                          </div>
                          <p className="text-xs text-slate-600">{dprResult.competition.competition_rationale}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* 2B: Business Model Sub-Category */}
                {marketSubTab === 'business_model' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Market & Competitiveness: Business Model</h2>
                        <p className="text-xs text-slate-500">Value delivery, core revenue streams, and key commercial partners.</p>
                      </div>
                      <ProvenanceBadge tag={getFieldProvenance('value_proposition', 'AI INTERPRETATION')} />
                    </div>

                    {dprResult ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Core Value Proposition</label>
                          <textarea
                            rows={2}
                            value={qualitativeEdits.value_proposition ?? dprResult.business_model.value_proposition}
                            onChange={(e) => handleQualitativeChange('value_proposition', e.target.value)}
                            className="w-full text-xs p-2 border rounded bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 border rounded-xl space-y-2">
                            <span className="text-xs font-bold text-slate-900">Primary Revenue Streams</span>
                            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                              {dprResult.business_model.revenue_streams.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 border rounded-xl space-y-2">
                            <span className="text-xs font-bold text-slate-900">Key Commercial Partners</span>
                            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                              {dprResult.business_model.key_partners.map((p, i) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs">Computing business model...</div>
                    )}
                  </div>
                )}

                {/* 2C: Operations Sub-Category */}
                {marketSubTab === 'operations' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Market & Competitiveness: Operations Plan</h2>
                        <p className="text-xs text-slate-500">Domain-tailored workflow, equipment requirements, and workforce plan.</p>
                      </div>
                      <ProvenanceBadge tag="AI INTERPRETATION" />
                    </div>

                    {dprResult ? (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-xl bg-slate-50">
                          <h3 className="text-xs font-bold text-slate-900 mb-2">5-Stage Operational Workflow</h3>
                          <div className="space-y-2">
                            {dprResult.operations_plan.workflow_steps.map((w, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                <span className="font-bold text-indigo-600">Stage {i + 1}:</span>
                                <span>{w}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 border rounded-xl space-y-2">
                            <span className="text-xs font-bold text-slate-900">Machinery & Equipment</span>
                            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                              {dprResult.operations_plan.key_machinery_equipment.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 border rounded-xl space-y-2">
                            <span className="text-xs font-bold text-slate-900">Workforce Organization</span>
                            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                              {dprResult.operations_plan.workforce_roles.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs">Computing operations plan...</div>
                    )}
                  </div>
                )}

                {/* 2D: Marketing Sub-Category */}
                {marketSubTab === 'marketing' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Market & Competitiveness: Marketing Strategy</h2>
                        <p className="text-xs text-slate-500">Positioning, structured channels, and defensible pricing model.</p>
                      </div>
                      <ProvenanceBadge tag="AI INTERPRETATION" />
                    </div>

                    {dprResult ? (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                          <span className="text-xs font-bold text-slate-900">Strategic Positioning</span>
                          <textarea
                            rows={2}
                            value={qualitativeEdits.positioning_statement ?? dprResult.marketing_strategy.positioning_statement}
                            onChange={(e) => handleQualitativeChange('positioning_statement', e.target.value)}
                            className="w-full text-xs p-2 border rounded bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 border rounded-xl space-y-2">
                            <span className="text-xs font-bold text-slate-900">Sales Channels</span>
                            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                              {dprResult.marketing_strategy.sales_channels.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 border rounded-xl space-y-2">
                            <span className="text-xs font-bold text-slate-900">Pricing Framework</span>
                            <p className="text-xs text-slate-600">{dprResult.marketing_strategy.pricing_framework}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs">Computing marketing strategy...</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* Stage 3: Financial Plan */}
            {/* ============================================================= */}
            {currentStage === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Stage 3: Capital Structure & Financial Projections</h2>
                    <p className="text-xs text-slate-500">Calculated directly by backend financial structuring engine.</p>
                  </div>
                  <ProvenanceBadge tag="BACKEND DETERMINISTIC CALCULATION" />
                </div>

                {dprResult ? (
                  <div className="space-y-4">
                    {/* Capital Breakdown Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 border rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Project Cost</div>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          ₹{dprResult.capital_structure.total_project_cost.toLocaleString()}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Promoter Contribution</div>
                        {dprResult.capital_structure.promoter_equity_amount != null ? (
                          <>
                            <div className="text-lg font-bold text-blue-700 mt-1">
                              ₹{dprResult.capital_structure.promoter_equity_amount.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {dprResult.capital_structure.promoter_equity_pct != null
                                ? `${dprResult.capital_structure.promoter_equity_pct}% margin`
                                : 'Self-equity'}
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] text-amber-700 font-medium mt-1 leading-snug">
                            Not specified by authoritative programme data
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 border rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Net Bank Loan Exposure</div>
                        <div className="text-lg font-bold text-indigo-700 mt-1">
                          {dprResult.capital_structure.net_bank_loan_exposure != null
                            ? `₹${dprResult.capital_structure.net_bank_loan_exposure.toLocaleString()}`
                            : 'Not applicable'}
                        </div>
                        {dprResult.capital_structure.initial_bank_loan != null &&
                         dprResult.capital_structure.net_bank_loan_exposure != null &&
                         dprResult.capital_structure.initial_bank_loan !== dprResult.capital_structure.net_bank_loan_exposure && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Gross loan: ₹{dprResult.capital_structure.initial_bank_loan.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 border rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Monthly EMI (P+I)</div>
                        {dprResult.government_support.is_credit_linked && dprResult.financial_assumptions.annual_interest_rate_pct != null ? (
                          <>
                            <div className="text-lg font-bold text-emerald-700 mt-1">
                              ₹{dprResult.financial_assumptions.monthly_emi.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5">
                              {dprResult.financial_assumptions.loan_tenure_months} mos @ {dprResult.financial_assumptions.annual_interest_rate_pct}%
                              {dprResult.financial_assumptions.is_benchmark_assumption ? ' benchmark' : ''}
                            </div>
                            <div className="text-[9px] text-indigo-600 font-semibold mt-0.5">
                              {dprResult.financial_assumptions.rate_display_text || 'Market-linked / lender-dependent'}
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                            Not applicable — programme is not credit-linked.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Component Allocation Note */}
                    <div className="p-2.5 bg-slate-50 border border-dashed rounded-xl text-xs flex items-center justify-between text-slate-600">
                      <span className="font-semibold text-[11px]">Term Loan / Working Capital Split:</span>
                      <span className="text-[11px] font-medium text-slate-700">
                        {dprResult.capital_structure.term_loan_amount != null && dprResult.capital_structure.working_capital_amount != null
                          ? `Term: ₹${dprResult.capital_structure.term_loan_amount.toLocaleString()} | WC: ₹${dprResult.capital_structure.working_capital_amount.toLocaleString()}`
                          : 'Not specified (component allocation determined upon bank sanction)'}
                      </span>
                    </div>

                    {/* Amortization Table */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">Annual Debt Service Schedule</h3>
                      <div className="overflow-x-auto border rounded-xl">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                            <tr>
                              <th className="p-2">Year</th>
                              <th className="p-2">Opening (₹)</th>
                              <th className="p-2">Principal Paid (₹)</th>
                              <th className="p-2">Interest Paid (₹)</th>
                              <th className="p-2">Annual Outflow (₹)</th>
                              <th className="p-2">Closing (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {dprResult.financial_assumptions.amortization_schedule.map((row) => (
                              <tr key={row.year} className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-800">Year {row.year}</td>
                                <td className="p-2 font-mono">₹{row.opening_balance.toLocaleString()}</td>
                                <td className="p-2 font-mono text-indigo-600">₹{row.annual_principal.toLocaleString()}</td>
                                <td className="p-2 font-mono text-orange-600">₹{row.annual_interest.toLocaleString()}</td>
                                <td className="p-2 font-mono font-bold">₹{row.total_annual_payment.toLocaleString()}</td>
                                <td className="p-2 font-mono text-slate-600">₹{row.closing_balance.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Computing financial assumptions...</div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* Stage 4: Government Support */}
            {/* ============================================================= */}
            {currentStage === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Stage 4: Government Scheme Support & Subsidy</h2>
                    <p className="text-xs text-slate-500">Statutory scheme rules from PostgreSQL and recommendation engine.</p>
                  </div>
                  <ProvenanceBadge tag="GOVERNMENT / DATASET DERIVED" />
                </div>

                <div className="p-4 border border-indigo-200 bg-indigo-50/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-indigo-950">
                        {dprResult?.government_support.program_name || form.selectedProgramCode}
                      </div>
                      <div className="text-xs text-indigo-700 font-mono">
                        Code: {dprResult?.government_support.program_code || form.selectedProgramCode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Eligible Subsidy</div>
                      <div className="text-lg font-extrabold text-emerald-700">
                        ₹{(dprResult?.government_support.eligible_subsidy_amount || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Rate: {dprResult?.government_support.eligible_subsidy_rate_pct || 0}%
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">Nodal Agency:</span> {dprResult?.government_support.nodal_agency || 'KVIC / DIC'}
                  </div>
                </div>

                {dprResult?.government_support.mandatory_statutory_conditions && (
                  <div className="p-3 border rounded-xl bg-slate-50 space-y-1 text-xs">
                    <span className="font-bold text-slate-900">Mandatory Statutory Conditions:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                      {dprResult.government_support.mandatory_statutory_conditions.map((cond, i) => (
                        <li key={i}>{cond}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* Stage 5: Risk & Implementation (Risks + Milestones Combined) */}
            {/* ============================================================= */}
            {currentStage === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Stage 5: Risk Analysis & Implementation Roadmap</h2>
                    <p className="text-xs text-slate-500">
                      Weather sensitivity signals, operational risk mitigation, and Month 1-6 commercial rollout milestones.
                    </p>
                  </div>
                  <ProvenanceBadge tag="MODELLED INDICATOR" />
                </div>

                {dprResult ? (
                  <div className="space-y-6">
                    {/* Part A: Weather Activity & Risk Matrix */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CloudSun className="w-8 h-8 text-indigo-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">Indicative Weather Activity Impact</div>
                            <div className="text-[11px] text-slate-500">
                              Score: {dprResult.risk_analysis.weather_activity_impact_score ?? 'N/A'}/100 ({dprResult.risk_analysis.weather_activity_impact_label ?? 'Neutral'})
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          <div>Heat Stress: <span className="font-semibold text-slate-800">{dprResult.risk_analysis.heat_stress_level ?? 'Low'}</span></div>
                          <div>Rain Disruption: <span className="font-semibold text-slate-800">{dprResult.risk_analysis.rain_disruption_level ?? 'None'}</span></div>
                        </div>
                      </div>

                      {/* Operational Risk Matrix */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-900 uppercase">Operational Risk Matrix</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {dprResult.risk_analysis.identified_risks.map((r, i) => (
                            <div key={i} className="p-3 border rounded-xl text-xs space-y-1 bg-white">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{r.risk}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {r.severity}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px]">{r.mitigation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Part B: Implementation Schedule (Month 1-6 Milestones) */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 uppercase">
                          Month 1-6 Implementation Milestones & Critical Deliverables
                        </h3>
                        <ProvenanceBadge tag="AI INTERPRETATION" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dprResult.implementation_plan.milestones.map((m) => (
                          <div key={m.phase_number} className="p-3.5 border rounded-xl flex items-start gap-3 bg-white shadow-xs">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                              M{m.phase_number}
                            </div>
                            <div className="flex-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{m.month_range}: {m.activity}</span>
                              </div>
                              <p className="text-slate-500 text-[11px] mt-1">
                                <span className="font-semibold text-slate-700">Deliverable:</span> {m.critical_deliverable}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Computing risk & implementation roadmap...</div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* Stage 6: Review & Generate */}
            {/* ============================================================= */}
            {currentStage === 6 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Stage 6: Review & Final Project Report Synthesis</h2>
                    <p className="text-xs text-slate-500">Audit trail, provenance verification, and final bank-ready document export.</p>
                  </div>
                  <ProvenanceBadge tag="BACKEND DETERMINISTIC CALCULATION + AI INTERPRETATION" />
                </div>

                {dprResult ? (
                  <div className="space-y-6">
                    {/* Executive Summary Box */}
                    <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 uppercase">Executive Summary Narrative</h3>
                        <ProvenanceBadge tag={getFieldProvenance('executive_narrative', 'AI INTERPRETATION')} />
                      </div>
                      <textarea
                        rows={5}
                        value={qualitativeEdits.executive_narrative ?? dprResult.executive_summary.executive_narrative}
                        onChange={(e) => handleQualitativeChange('executive_narrative', e.target.value)}
                        className="w-full text-xs p-3 border rounded-lg bg-white leading-relaxed"
                      />
                    </div>

                    {/* Illustrative Operating Assumptions Disclaimer */}
                    <div className="p-4 border border-orange-200 bg-orange-50/60 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-950">Illustrative Operating Assumptions</span>
                        <ProvenanceBadge tag="ILLUSTRATIVE ASSUMPTION" />
                      </div>
                      <p className="text-orange-900 text-[11px] italic font-semibold">
                        "{dprResult.illustrative_assumptions.disclaimer}"
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 text-[11px] pt-1">
                        <div><span className="font-semibold">Working Capital Cycle:</span> {dprResult.illustrative_assumptions.working_capital_cycle_days} Days</div>
                        <div><span className="font-semibold">Break-Even Point:</span> {dprResult.illustrative_assumptions.break_even_commentary}</div>
                      </div>
                    </div>

                    {/* Provenance Audit Legend */}
                    <div className="p-4 border rounded-xl bg-white space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase">Provenance Audit Trail (6 Data Categories)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(dprResult.provenance_legend).map(([key, desc]) => (
                          <div key={key} className="flex items-start gap-2 text-xs">
                            <ProvenanceBadge tag={key} />
                            <span className="text-[11px] text-slate-600">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Final Action Buttons */}
                    <div className="pt-4 border-t border-[#F1F5F9] flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-xs text-[#64748B]">
                        Report ID: <span className="font-mono font-semibold text-[#0B1736]">{dprResult.report_id}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/advisory/business-plan/${dprResult.report_id}`)}
                        className="px-6 py-3 bg-[#159A68] hover:bg-[#128357] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        Open Official Bank-Ready DPR View
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-[#64748B] text-xs">
                    <button
                      type="button"
                      onClick={fetchDPR}
                      disabled={generatingDPR}
                      className="px-5 py-2.5 bg-[#0B1736] hover:bg-[#152347] text-white rounded-xl font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      {generatingDPR ? 'Generating DPR...' : 'Generate Full DPR'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stepper Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                disabled={currentStage === 1 && marketSubTab === 'customer'}
                onClick={handlePrevious}
                className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0B1736] hover:bg-[#F8FAFC] disabled:opacity-40 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              {currentStage < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-[#0B1736] hover:bg-[#152347] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  Next <ArrowRight className="w-4 h-4 text-[#F4A340]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={fetchDPR}
                  disabled={generatingDPR}
                  className="px-4 py-2 bg-[#159A68] hover:bg-[#128357] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  {generatingDPR ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#FFF5DF]" />}
                  Refresh Analysis
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
