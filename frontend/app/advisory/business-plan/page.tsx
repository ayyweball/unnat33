'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Database,
  ExternalLink,
  ChevronRight,
  Check,
} from 'lucide-react';
import { DPRResponse } from '@/lib/api-client';

const PROVENANCE_STYLES: Record<string, string> = {
  'USER PROVIDED': 'bg-blue-50 text-blue-700 border-blue-200',
  'GOVERNMENT / DATASET DERIVED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'MODELLED INDICATOR': 'bg-purple-50 text-purple-700 border-purple-200',
  'AI INTERPRETATION': 'bg-amber-50 text-amber-700 border-amber-200',
  'ILLUSTRATIVE ASSUMPTION': 'bg-orange-50 text-orange-700 border-orange-200',
  'BACKEND DETERMINISTIC CALCULATION': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'USER EDITED': 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

function ProvenanceBadge({ tag }: { tag: string }) {
  const style = PROVENANCE_STYLES[tag] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold border ${style}`}>
      {tag}
    </span>
  );
}

const STEPS = [
  { id: 1, name: 'Overview', fullName: 'Business & Promoter Overview', icon: Building2, desc: 'Auto-prefilled from your verified entrepreneur profile.' },
  { id: 2, name: 'Market', fullName: 'District Market Intelligence & Nearest Neighbors', icon: Database, desc: 'Official PostgreSQL Udyam census & scikit-learn NearestNeighbors.' },
  { id: 3, name: 'Customers', fullName: 'Target Customers & Competitive Structure', icon: Users, desc: 'AI market synthesis grounded strictly in local census metrics.' },
  { id: 4, name: 'Business', fullName: 'Business Model & Value Proposition', icon: Briefcase, desc: 'Value delivery, core revenue streams, and key commercial partners.' },
  { id: 5, name: 'Operations', fullName: 'Operational Workflow & Capital Equipment', icon: Layers, desc: 'Production lifecycle, machinery breakdown, and labor requirements.' },
  { id: 6, name: 'Marketing', fullName: 'Go-To-Market Strategy & Pricing Architecture', icon: TrendingUp, desc: 'Distribution channels, promotional tactics, and unit pricing structure.' },
  { id: 7, name: 'Government', fullName: 'Statutory Scheme Matching & Subsidy Structuring', icon: ShieldCheck, desc: 'Deterministic qualification gates, margin money subsidy, and CGTMSE coverage.' },
  { id: 8, name: 'Financial', fullName: 'Financial Projections & Debt Serviceability', icon: IndianRupee, desc: 'Capital outlay, monthly debt serviceability, and statutory FOIR/DSCR evaluation.' },
  { id: 9, name: 'Risk & Mitigation', fullName: 'Microclimate & Commercial Risk Management', icon: CloudSun, desc: 'Atmospheric risk signals, supply chain vulnerabilities, and actionable mitigations.' },
  { id: 10, name: 'Milestones', fullName: 'Implementation Roadmap & Stabilization Milestones', icon: Calendar, desc: 'Sequential month 1-6 operational rollout targets and stabilization metrics.' },
  { id: 11, name: 'Review & Finalize', fullName: 'Review & Complete Detailed Project Report', icon: FileText, desc: 'Audit trail, provenance verification, and final document generation.' },
];

export default function RebuiltDPRBuilderPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
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
  const [dprResult, setDprResult] = useState<any>(null);

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
              subType: b.description || b.activity || prev.subType,
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

  // Fetch or trigger DPR synthesis
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

  // Trigger initial DPR synthesis when entering review or step >= 2
  useEffect(() => {
    if (!dprResult && !generatingDPR && currentStep >= 2) {
      fetchDPR();
    }
  }, [currentStep]);

  const handleQualitativeChange = (field: string, val: string) => {
    setQualitativeEdits((prev) => ({ ...prev, [field]: val }));
    setEditedFields((prev) => new Set(prev).add(field));
  };

  const getFieldProvenance = (field: string, defaultTag: string) => {
    return editedFields.has(field) ? 'USER EDITED' : defaultTag;
  };

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
            <span className="text-[#0B1736] font-semibold">DPR Builder</span>
          </div>

          {/* ========================================================================= */}
          {/* 1. DPR INTRODUCTION BANNER (National Indian Enterprise Artwork)           */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs relative overflow-hidden">
            {/* National India Enterprise Artwork Fading on the Right */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden rounded-r-2xl sm:rounded-r-3xl z-0">
              <img
                src="/dpr-infographic.jpg"
                alt="Why Does a DPR Matter infographic"
                className="w-full h-full object-cover object-[78%_center] dpr-hero-mask"
              />
              <style dangerouslySetInnerHTML={{ __html: `
                .dpr-hero-mask {
                  -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                  mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                }
                @media (min-width: 640px) {
                  .dpr-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                  }
                }
                @media (min-width: 1024px) {
                  .dpr-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                  }
                }
              `}} />
            </div>

            <div className="relative z-10 max-w-2xl space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B1736] tracking-tight font-serif">
                11-Step DPR &amp; Market Advisory Builder
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
                Authoritative Consulting Workflow: Real Census + Nearest Neighbors + Statutory Structuring + Bank-Ready DPR.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={fetchDPR}
                  disabled={generatingDPR}
                  className="px-4 py-2.5 bg-[#0B1736] hover:bg-[#152347] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                >
                  {generatingDPR ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#F4A340]" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#F4A340]" />
                  )}
                  <span>{dprResult ? 'Recalculate DPR' : 'Generate Intelligence'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. ERROR ALERT BAR (Clean subtle red alert when error occurs)             */}
          {/* ========================================================================= */}
          {error && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. 11-STEP GUIDED HORIZONTAL WORKFLOW NAVIGATOR                           */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
            
            {/* Top Status & Jump Dropdown Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#159A68] whitespace-nowrap">
                  Step {currentStep} of 11
                </span>
                {/* Horizontal Progress Bar */}
                <div className="w-36 sm:w-52 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#159A68] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((currentStep / 11) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Jump to Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="step-jump-selector" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Jump to:
                </label>
                <select
                  id="step-jump-selector"
                  value={currentStep}
                  onChange={(e) => setCurrentStep(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] cursor-pointer transition-all"
                >
                  {STEPS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}. {s.name} {currentStep > s.id ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Continuous Horizontal Stepper Track */}
            <div className="overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center justify-between min-w-[860px] gap-1 px-1">
                {STEPS.map((s, idx) => {
                  const active = currentStep === s.id;
                  const completed = currentStep > s.id;
                  return (
                    <React.Fragment key={s.id}>
                      {/* Step Item */}
                      <button
                        type="button"
                        onClick={() => setCurrentStep(s.id)}
                        className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                          active
                            ? 'bg-[#EAF7F0] border border-[#159A68]/40 shadow-2xs'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            active
                              ? 'bg-[#159A68] text-white shadow-xs'
                              : completed
                              ? 'bg-[#159A68] text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {completed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                        </div>
                        <span
                          className={`text-[11px] mt-1.5 whitespace-nowrap transition-colors ${
                            active
                              ? 'font-bold text-[#159A68]'
                              : completed
                              ? 'font-semibold text-[#0B1736]'
                              : 'font-medium text-slate-500'
                          }`}
                        >
                          {s.name}
                        </span>
                      </button>

                      {/* Connecting Line Between Steps */}
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 min-w-[8px] rounded-full transition-colors ${
                            completed ? 'bg-[#159A68]' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

          </section>

          {/* ========================================================================= */}
          {/* 4. ACTIVE STEP WORKSPACE SECTION (Dominant Form Container)                 */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0B1736]">
                    Step {currentStep}: {STEPS[currentStep - 1]?.fullName || STEPS[currentStep - 1]?.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {STEPS[currentStep - 1]?.desc}
                  </p>
                </div>
              </div>

              {/* Provenance Badge */}
              <div className="self-start sm:self-center">
                {currentStep === 1 && <ProvenanceBadge tag="USER PROVIDED" />}
                {currentStep === 2 && (
                  <div className="flex gap-1.5">
                    <ProvenanceBadge tag="GOVERNMENT / DATASET DERIVED" />
                    <ProvenanceBadge tag="MODELLED INDICATOR" />
                  </div>
                )}
                {currentStep === 3 && <ProvenanceBadge tag={getFieldProvenance('buying_behaviour_summary', 'AI INTERPRETATION')} />}
                {currentStep === 4 && <ProvenanceBadge tag={getFieldProvenance('value_proposition', 'AI INTERPRETATION')} />}
                {currentStep === 5 && <ProvenanceBadge tag="ILLUSTRATIVE ASSUMPTION" />}
                {currentStep === 6 && <ProvenanceBadge tag={getFieldProvenance('marketing_strategy', 'AI INTERPRETATION')} />}
                {currentStep === 7 && <ProvenanceBadge tag="BACKEND DETERMINISTIC CALCULATION" />}
                {currentStep === 8 && <ProvenanceBadge tag="BACKEND DETERMINISTIC CALCULATION" />}
                {currentStep === 9 && <ProvenanceBadge tag="GOVERNMENT / DATASET DERIVED + AI INTERPRETATION" />}
                {currentStep === 10 && <ProvenanceBadge tag="AI INTERPRETATION" />}
                {currentStep === 11 && <ProvenanceBadge tag="BACKEND DETERMINISTIC CALCULATION + AI INTERPRETATION" />}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: Business & Promoter Overview                          */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-semibold text-[#0B1736] mb-1.5">Project Name</label>
                  <input
                    type="text"
                    value={form.projectName}
                    onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1736] mb-1.5">Promoter Name</label>
                  <input
                    type="text"
                    value={form.promoterName}
                    onChange={(e) => setForm({ ...form, promoterName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1736] mb-1.5">Primary Business Domain</label>
                  <input
                    type="text"
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1736] mb-1.5">Specific Sub-Type / Trade</label>
                  <input
                    type="text"
                    value={form.subType}
                    onChange={(e) => setForm({ ...form, subType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1736] mb-1.5">District</label>
                  <input
                    type="text"
                    value={form.districtName}
                    onChange={(e) => setForm({ ...form, districtName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1736] mb-1.5">State</label>
                  <input
                    type="text"
                    value={form.stateName}
                    onChange={(e) => setForm({ ...form, stateName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1736] mb-1.5">Total Project Capital Outlay (₹)</label>
                  <input
                    type="number"
                    value={form.estimatedCapital}
                    onChange={(e) => setForm({ ...form, estimatedCapital: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1736] mb-1.5">Annual Personal/Business Revenue (₹)</label>
                  <input
                    type="number"
                    value={form.currentIncome}
                    onChange={(e) => setForm({ ...form, currentIncome: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: Market Intelligence & Nearest Neighbors               */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {dprResult?.market_analysis ? (
                  <div className="space-y-5">
                    {/* District Census Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Registered MSMEs</div>
                        <div className="text-xl font-black text-[#0B1736]">
                          {dprResult.market_analysis.total_msmes_in_district.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">PostgreSQL Udyam Census</div>
                      </div>

                      <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Micro Share %</div>
                        <div className="text-xl font-black text-[#0B1736]">
                          {dprResult.market_analysis.micro_enterprise_share.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-500">Micro enterprise density</div>
                      </div>

                      <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">KMeans Archetype</div>
                        <div className="text-xs font-bold text-[#159A68] line-clamp-2">
                          {dprResult.market_analysis.cluster_archetype_label}
                        </div>
                        <div className="text-[10px] text-slate-500">scikit-learn (K=4)</div>
                      </div>

                      <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Market Indicator (MRI)</div>
                        <div className="text-xl font-black text-[#159A68]">
                          {dprResult.market_analysis.market_research_indicator.toFixed(1)}/100
                        </div>
                        <div className="text-[10px] text-slate-500">Multi-factor score</div>
                      </div>
                    </div>

                    {/* Nearest Neighbors Comparable Districts */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">
                          Nearest Neighbor Comparable Markets (scikit-learn NearestNeighbors)
                        </h3>
                        <span className="text-[10px] text-slate-400">Euclidean distance in 6-dimensional feature space</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {dprResult.market_analysis.comparable_districts?.map((d: any, i: number) => (
                          <div key={i} className="p-3.5 border border-slate-200/80 rounded-xl bg-white shadow-2xs space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0B1736]">
                                #{d.similarity_rank} {d.district_name}, {d.state_name}
                              </span>
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                                Distance: {d.similarity_distance.toFixed(3)}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              {d.total_msmes.toLocaleString()} MSMEs ({d.micro_share.toFixed(1)}% Micro, {d.small_medium_share.toFixed(1)}% SME)
                            </div>
                            <p className="text-[11px] text-slate-500 italic leading-relaxed">{d.qualitative_observation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    {generatingDPR ? 'Loading authoritative market intelligence...' : 'Click "Generate Intelligence" to compute.'}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: Customers & Competition                               */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-5">
                {dprResult ? (
                  <div className="space-y-5">
                    <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0B1736]">Local Buying Behavior</span>
                        <ProvenanceBadge tag="AI INTERPRETATION" />
                      </div>
                      <textarea
                        rows={2}
                        value={qualitativeEdits.buying_behaviour_summary ?? dprResult.customer_segments.buying_behaviour_summary}
                        onChange={(e) => handleQualitativeChange('buying_behaviour_summary', e.target.value)}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all"
                      />
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider mb-2.5">
                        Customer Persona Segments
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {dprResult.customer_segments.customer_segments.map((seg: any, idx: number) => (
                          <div key={idx} className="p-3.5 border border-slate-200/80 rounded-xl text-xs space-y-1 bg-white shadow-2xs">
                            <div className="font-bold text-[#0B1736]">{seg.segment}</div>
                            <div className="text-slate-600"><span className="font-medium text-slate-800">Need:</span> {seg.need}</div>
                            <div className="text-slate-600"><span className="font-medium text-slate-800">Buying Factor:</span> {seg.buying_consideration}</div>
                            <div className="text-slate-500 text-[11px]"><span className="font-medium text-slate-700">Channel:</span> {seg.recommended_channel}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0B1736]">
                          Competition Intensity: <span className="text-[#159A68]">{dprResult.competition.competition_intensity}</span>
                        </span>
                        <ProvenanceBadge tag="MODELLED INDICATOR" />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{dprResult.competition.competition_rationale}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Computing customer segments...</div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: Business Model & Value Proposition                    */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 4 && (
              <div className="space-y-5">
                {dprResult ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1736] mb-1.5">Core Value Proposition</label>
                      <textarea
                        rows={2}
                        value={qualitativeEdits.value_proposition ?? dprResult.business_model.value_proposition}
                        onChange={(e) => handleQualitativeChange('value_proposition', e.target.value)}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-slate-200/80 rounded-xl bg-white space-y-2 shadow-2xs">
                        <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">Primary Revenue Streams</h3>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                          {dprResult.business_model.primary_revenue_streams.map((s: any, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 border border-slate-200/80 rounded-xl bg-white space-y-2 shadow-2xs">
                        <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">Commercial Off-Take Channels</h3>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                          {dprResult.business_model.sales_channels.map((c: any, idx: number) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Synthesizing business model...</div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 5: Operational Workflow & Capital Equipment              */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 5 && (
              <div className="space-y-5">
                {dprResult ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1736] mb-1.5">Operational Workflow Narrative</label>
                      <textarea
                        rows={2}
                        value={qualitativeEdits.operations_narrative ?? dprResult.operations.operations_narrative}
                        onChange={(e) => handleQualitativeChange('operations_narrative', e.target.value)}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">
                        Major Capital Machinery &amp; Equipment
                      </h3>
                      <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                        {dprResult.operations.machinery_list.map((m: any, idx: number) => (
                          <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <div className="font-bold text-[#0B1736]">{m.machinery_name}</div>
                              <div className="text-[11px] text-slate-500">
                                Capacity: {m.capacity_output} • Power: {m.power_spec} • Supplier: {m.indicative_source}
                              </div>
                            </div>
                            <div className="font-black text-[#159A68] sm:text-right shrink-0">
                              ₹{m.unit_cost.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-right text-xs font-bold text-[#0B1736]">
                        Total Equipment Cost: ₹{dprResult.operations.total_equipment_cost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Loading operational parameters...</div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 6: Go-To-Market Strategy & Pricing Architecture          */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 6 && (
              <div className="space-y-5">
                {dprResult ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1736] mb-1.5">Sales &amp; Marketing Strategy</label>
                      <textarea
                        rows={2}
                        value={qualitativeEdits.marketing_strategy ?? dprResult.marketing.marketing_strategy}
                        onChange={(e) => handleQualitativeChange('marketing_strategy', e.target.value)}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-slate-200/80 rounded-xl bg-white space-y-2 shadow-2xs">
                        <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">Direct &amp; Indirect Channels</h3>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                          {dprResult.marketing.distribution_channels.map((d: any, idx: number) => (
                            <li key={idx}>{d}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 border border-slate-200/80 rounded-xl bg-white space-y-2 shadow-2xs">
                        <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">Unit Pricing &amp; Margin Structure</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{dprResult.marketing.pricing_strategy_notes}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Computing marketing channels...</div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 7: Statutory Scheme Matching & Subsidy Structuring       */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 7 && (
              <div className="space-y-5">
                {dprResult ? (
                  <div className="space-y-5">
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Matched Central &amp; State Programme
                        </span>
                        <span className="font-mono text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          {dprResult.government_support.selected_program.program_code}
                        </span>
                      </div>
                      <div className="text-base font-bold text-emerald-950">
                        {dprResult.government_support.selected_program.program_name}
                      </div>
                      <div className="text-xs text-emerald-800">
                        Ministry: {dprResult.government_support.selected_program.owning_ministry} •
                        <a
                          href={dprResult.government_support.selected_program.official_portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1 underline font-semibold inline-flex items-center gap-0.5"
                        >
                          Official Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Subsidy and Margin Stack */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div className="p-3.5 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Project Cost</div>
                        <div className="text-lg font-black text-[#0B1736] mt-1">
                          ₹{dprResult.government_support.subsidy_breakdown.total_project_cost.toLocaleString()}
                        </div>
                      </div>

                      <div className="p-3.5 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Promoter Margin</div>
                        <div className="text-lg font-black text-amber-600 mt-1">
                          ₹{dprResult.government_support.subsidy_breakdown.promoter_contribution.toLocaleString()} (
                          {dprResult.government_support.subsidy_breakdown.promoter_contribution_pct}%)
                        </div>
                      </div>

                      <div className="p-3.5 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Capital Subsidy Grant</div>
                        <div className="text-lg font-black text-[#159A68] mt-1">
                          ₹{dprResult.government_support.subsidy_breakdown.subsidy_amount.toLocaleString()} (
                          {dprResult.government_support.subsidy_breakdown.subsidy_pct}%)
                        </div>
                      </div>

                      <div className="p-3.5 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Term Loan</div>
                        <div className="text-lg font-black text-[#0B1736] mt-1">
                          ₹{dprResult.government_support.subsidy_breakdown.bank_loan_amount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/80 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-700">CGTMSE Credit Guarantee Coverage:</span>
                      <span className="font-black text-[#159A68]">
                        {dprResult.government_support.credit_guarantee_details.guarantee_coverage_pct}% Coverage
                      </span>
                    </div>

                    {/* Disqualification Reason Check */}
                    {dprResult.government_support.disqualification_reasons.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1">
                        <div className="text-xs font-bold text-red-700">Statutory Compliance Gates:</div>
                        <ul className="text-xs text-red-600 list-disc list-inside">
                          {dprResult.government_support.disqualification_reasons.map((r: any, i: number) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Evaluating statutory schemes...</div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 8: Financial Projections & Debt Serviceability           */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 8 && (
              <div className="space-y-5">
                {dprResult ? (
                  <div className="space-y-5">
                    {/* Amortization Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div className="p-4 border border-slate-200/80 rounded-xl bg-white shadow-2xs space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Conservative Tenure (36 Mo)</div>
                        <div className="text-xl font-black text-[#0B1736]">
                          ₹{dprResult.financial_plan.amortization_scenarios.conservative.monthly_emi.toLocaleString()} /mo
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Total Interest: ₹{dprResult.financial_plan.amortization_scenarios.conservative.total_interest.toLocaleString()}
                        </div>
                      </div>

                      <div className="p-4 border border-[#159A68]/30 bg-[#EAF7F0] rounded-xl space-y-1 shadow-xs">
                        <div className="text-[10px] text-[#159A68] uppercase font-bold tracking-wider">Recommended (60 Mo)</div>
                        <div className="text-xl font-black text-[#159A68]">
                          ₹{dprResult.financial_plan.amortization_scenarios.recommended.monthly_emi.toLocaleString()} /mo
                        </div>
                        <div className="text-[10px] text-emerald-800">
                          Total Interest: ₹{dprResult.financial_plan.amortization_scenarios.recommended.total_interest.toLocaleString()}
                        </div>
                      </div>

                      <div className="p-4 border border-slate-200/80 rounded-xl bg-white shadow-2xs space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Extended Tenure (84 Mo)</div>
                        <div className="text-xl font-black text-[#0B1736]">
                          ₹{dprResult.financial_plan.amortization_scenarios.extended.monthly_emi.toLocaleString()} /mo
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Total Interest: ₹{dprResult.financial_plan.amortization_scenarios.extended.total_interest.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Serviceability Metrics */}
                    <div className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#0B1736]">
                        <span>Monthly Debt Serviceability (FOIR / DSCR):</span>
                        <span className="text-[#159A68]">{dprResult.financial_plan.debt_serviceability.status}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{dprResult.financial_plan.debt_serviceability.serviceability_commentary}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600">
                        <div><span className="font-semibold text-slate-800">Monthly Surplus:</span> ₹{dprResult.financial_plan.debt_serviceability.monthly_surplus.toLocaleString()}</div>
                        <div><span className="font-semibold text-slate-800">Safe EMI Limit:</span> ₹{dprResult.financial_plan.debt_serviceability.safe_emi_limit.toLocaleString()}</div>
                        <div><span className="font-semibold text-slate-800">Debt Buffer:</span> ₹{dprResult.financial_plan.debt_serviceability.debt_buffer.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* 3-Year Projections Table */}
                    <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[#0B1736]">
                          <tr>
                            <th className="p-3 font-bold">Projection Period</th>
                            <th className="p-3 font-bold">Projected Revenue</th>
                            <th className="p-3 font-bold">Operating Costs</th>
                            <th className="p-3 font-bold">Debt Service EMI</th>
                            <th className="p-3 font-bold">Net Cash Surplus</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {dprResult.financial_plan.indicative_projections.map((row: any) => (
                            <tr key={row.year}>
                              <td className="p-3 font-bold text-[#0B1736]">Year {row.year}</td>
                              <td className="p-3">₹{row.revenue.toLocaleString()}</td>
                              <td className="p-3">₹{row.operating_expenses.toLocaleString()}</td>
                              <td className="p-3">₹{row.debt_service_emi.toLocaleString()}</td>
                              <td className="p-3 font-black text-[#159A68]">₹{row.net_cash_surplus.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Synthesizing financial projections...</div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 9: Microclimate & Commercial Risk Management             */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 9 && (
              <div className="space-y-5">
                {dprResult ? (
                  <div className="space-y-5">
                    {/* Atmospheric Signals */}
                    <div className="p-4 border border-slate-200/80 bg-slate-50/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">
                          Open-Meteo Microclimate Signals ({form.districtName}, {form.stateName})
                        </h3>
                        <ProvenanceBadge tag="GOVERNMENT / DATASET DERIVED" />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{dprResult.risk_and_weather.weather_context.activity_implication}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600">
                        <div><span className="font-semibold text-slate-800">Heat Stress:</span> {dprResult.risk_and_weather.weather_context.heat_stress_signal}</div>
                        <div><span className="font-semibold text-slate-800">Rain Impact:</span> {dprResult.risk_and_weather.weather_context.rain_disruption_signal}</div>
                        <div><span className="font-semibold text-slate-800">Outdoor Activity:</span> {dprResult.risk_and_weather.weather_context.outdoor_activity_signal}</div>
                        <div><span className="font-semibold text-slate-800">Logistics:</span> {dprResult.risk_and_weather.weather_context.logistics_disruption_signal}</div>
                      </div>
                    </div>

                    {/* Operational Risks Table */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">Commercial &amp; Operational Risks</h3>
                      <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                        {dprResult.risk_and_weather.risk_matrix.map((r: any, idx: number) => (
                          <div key={idx} className="p-3.5 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0B1736]">{r.risk}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.impact === 'HIGH'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : r.impact === 'MEDIUM'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {r.impact} IMPACT
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              <span className="font-medium text-slate-800">Mitigation:</span> {r.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Evaluating climate and market risks...</div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 10: Implementation Roadmap & Milestones                  */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 10 && (
              <div className="space-y-5">
                {dprResult ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">
                      Month 1 to 6 Implementation Timeline
                    </h3>
                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                      {dprResult.milestones.implementation_timeline.map((m: any) => (
                        <div key={m.month} className="p-3.5 flex items-start gap-3.5 text-xs">
                          <div className="w-8 h-8 rounded-full bg-[#EAF7F0] text-[#159A68] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            M{m.month}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="font-bold text-[#0B1736] flex items-center justify-between">
                              <span>{m.title}</span>
                              <span className="text-[10px] text-slate-400 font-medium">Month {m.month}</span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">Computing milestones...</div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 11: Review & Complete Detailed Project Report            */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 11 && (
              <div className="space-y-6">
                {dprResult ? (
                  <div className="space-y-6">
                    {/* Executive Summary Box */}
                    <div className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">
                          Executive Summary Narrative
                        </h3>
                        <ProvenanceBadge tag={getFieldProvenance('executive_narrative', 'AI INTERPRETATION')} />
                      </div>
                      <textarea
                        rows={5}
                        value={qualitativeEdits.executive_narrative ?? dprResult.executive_summary.executive_narrative}
                        onChange={(e) => handleQualitativeChange('executive_narrative', e.target.value)}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all"
                      />
                    </div>

                    {/* Illustrative Operating Assumptions Disclaimer */}
                    <div className="p-4 border border-amber-200/80 bg-[#FFF9EE] rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950">Illustrative Operating Assumptions</span>
                        <ProvenanceBadge tag="ILLUSTRATIVE ASSUMPTION" />
                      </div>
                      <p className="text-amber-900 text-[11px] italic font-medium leading-relaxed">
                        &ldquo;{dprResult.illustrative_assumptions.disclaimer}&rdquo;
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 text-[11px] pt-1">
                        <div><span className="font-semibold text-slate-900">Working Capital Cycle:</span> {dprResult.illustrative_assumptions.working_capital_cycle_days} Days</div>
                        <div><span className="font-semibold text-slate-900">Break-Even Point:</span> {dprResult.illustrative_assumptions.break_even_commentary}</div>
                      </div>
                    </div>

                    {/* Provenance Audit Legend */}
                    <div className="p-4 border border-slate-200/80 rounded-xl bg-white space-y-3 shadow-2xs">
                      <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wider">
                        Provenance Audit Trail (6 Data Categories)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {Object.entries(dprResult.provenance_legend).map(([key, desc]) => (
                          <div key={key} className="flex items-start gap-2 text-xs">
                            <ProvenanceBadge tag={key} />
                            <span className="text-[11px] text-slate-600 leading-snug">{String(desc)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Final Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-xs text-slate-500">
                        Report ID: <span className="font-mono font-bold text-[#0B1736]">{dprResult.report_id}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/advisory/business-plan/${dprResult.report_id}`)}
                        className="px-6 py-3 bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Open Official Bank-Ready DPR View</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
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

            {/* Stepper Navigation Action Bar */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-100">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentStep < 11 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(11, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1736] hover:bg-[#152347] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer group"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F4A340] group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={fetchDPR}
                  disabled={generatingDPR}
                  className="px-5 py-2.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                >
                  {generatingDPR ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                  <span>Refresh Analysis</span>
                </button>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
