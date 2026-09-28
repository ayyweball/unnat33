'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import {
  BadgeIndianRupee,
  ShieldCheck,
  CheckSquare,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Building2,
  Check,
  ArrowRight,
  Landmark,
  Coins,
} from 'lucide-react';

export default function FinancialResultsPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const [advisory, setAdvisory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'balanced' | 'extended'>('balanced');

  useEffect(() => {
    fetch(`/api/advisory/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.advisory) setAdvisory(data.advisory);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] text-[#0B1736] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex w-full min-w-0">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Loader2 className="w-5 h-5 text-[#159A68] animate-spin" />
              <span className="text-xs font-semibold text-[#0B1736]">Loading financial structuring evaluation...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fin = advisory?.financialJson || {};
  const structures = fin.structures || {};
  const capital = fin.capitalBreakdown;
  const warnings = fin.warnings || [];

  const activeScenario = structures[selectedScenario] || structures.balanced || structures.conservative || structures.extended;
  const displayDti = activeScenario?.projectedDTI ?? fin.debtToIncomeRatio;
  const displayEmi = activeScenario?.monthlyEMI;

  const promoterMarginPct = capital?.promoter_contribution_pct ?? null;
  const promoterMarginAmt = capital?.promoter_contribution_amount ?? null;
  const effectiveDebtAmt = capital?.net_effective_debt ?? capital?.initial_bank_loan ?? null;
  const hasSubsidy = capital?.subsidy_amount != null && capital.subsidy_amount > 0;
  const hasGuarantee = !!capital?.credit_guarantee_eligible;

  // Clean risk assessment presentation without developer wording or duplication
  const getRiskDetails = (assessment?: string, dtiCategory?: string) => {
    const raw = (assessment || dtiCategory || '').trim();
    const clean = raw.replace(/risk/gi, '').trim().toUpperCase();
    if (clean === 'HEALTHY' || clean === 'LOW') {
      return {
        label: 'Healthy Profile',
        badge: 'bg-[#EAF7F0] text-[#159A68] border-[#159A68]/30',
        dot: 'bg-[#159A68]',
        dtiStatus: 'Optimal Debt Burden',
        desc: 'Debt servicing capacity is well within statutory banking thresholds.',
      };
    }
    if (clean === 'MODERATE' || clean === 'MEDIUM') {
      return {
        label: 'Moderate Risk',
        badge: 'bg-amber-50 text-amber-700 border-amber-300',
        dot: 'bg-amber-500',
        dtiStatus: 'Manageable Debt Burden',
        desc: 'Debt burden is manageable with standard commercial underwriting covenants.',
      };
    }
    if (clean === 'STRETCHED' || clean === 'HIGH' || clean === 'HIGH_RISK') {
      return {
        label: 'Stretched Exposure',
        badge: 'bg-rose-50 text-rose-700 border-rose-300',
        dot: 'bg-rose-500',
        dtiStatus: 'High Debt Burden',
        desc: 'Monthly liabilities require equity re-balancing or debt restructuring.',
      };
    }
    return {
      label: raw ? raw.replace(/_/g, ' ') : 'Sanction Assessment',
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-400',
      dtiStatus: 'Evaluated on Sanction',
      desc: 'Evaluated deterministically against scheme parameters.',
    };
  };

  const risk = getRiskDetails(fin.creditAssessment, fin.dtiHealthCategory);

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#0B1736] flex flex-col font-sans selection:bg-[#159A68] selection:text-white">
      <Navbar />

      <div className="flex-1 flex w-full min-w-0">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1550px] w-full min-w-0 space-y-6 sm:space-y-7">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#159A68] transition-colors flex items-center gap-1">
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <Link href="/advisory/financial" className="hover:text-[#159A68] transition-colors">
              Financial Options
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0B1736] font-semibold">Structuring Results</span>
          </div>

          {/* ========================================================================= */}
          {/* 1. HERO BANNER WITH INDIAN BANKING & PUBLIC FINANCE ARTWORK                */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden rounded-r-2xl sm:rounded-r-3xl z-0">
              <img
                src="/finance-national.jpg"
                alt="Indian banking and financial advisory"
                className="w-full h-full object-cover object-[center_35%] financial-result-hero-mask"
              />
              <style dangerouslySetInnerHTML={{ __html: `
                .financial-result-hero-mask {
                  -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                  mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                }
                @media (min-width: 640px) {
                  .financial-result-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                  }
                }
                @media (min-width: 1024px) {
                  .financial-result-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                  }
                }
              `}} />
            </div>

            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest block">
                FINANCIAL ADVISORY
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B1736] tracking-tight font-serif">
                Financial Structuring Results
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
                Deterministic capital structuring and debt service capacity evaluation based on income, expenses, and statutory guidelines.
              </p>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. REPAYMENT CAPACITY & KEY FINANCIAL GAUGES                              */}
          {/* ========================================================================= */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0B1736]">Debt Serviceability & Repayment Health</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {fin.source || 'Deterministic financial structuring based on income, debt service capacity, and statutory scheme guidelines.'}
                </p>
              </div>
              <span className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${risk.badge}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{risk.label}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Debt-to-Income (DTI) Gauge */}
              <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Debt-to-Income (DTI)</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    displayDti != null && displayDti <= 40
                      ? 'bg-[#EAF7F0] text-[#159A68] border-[#159A68]/30'
                      : displayDti != null && displayDti <= 50
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : displayDti != null
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      displayDti != null && displayDti <= 40
                        ? 'bg-[#159A68]'
                        : displayDti != null && displayDti <= 50
                        ? 'bg-amber-500'
                        : displayDti != null
                        ? 'bg-rose-500'
                        : 'bg-slate-400'
                    }`} />
                    {displayDti != null ? (displayDti <= 40 ? 'Optimal' : displayDti <= 50 ? 'Moderate' : 'Elevated') : 'N/A'}
                  </span>
                </div>

                <div>
                  <div className="text-3xl font-black text-[#0B1736] tracking-tight">
                    {displayDti != null ? `${displayDti}%` : 'Not available'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Projected DTI with proposed loan ({selectedScenario} track). Baseline existing DTI: {fin.debtToIncomeRatio ?? 0}%. Safe threshold: &lt; 40-50%.
                  </p>
                </div>
              </div>

              {/* Monthly Loan EMI */}
              <div className="p-5 bg-[#EAF7F0]/40 rounded-2xl border border-[#159A68]/30 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#159A68] uppercase tracking-wider">Monthly Loan EMI</span>
                  <div className="w-8 h-8 rounded-xl bg-[#159A68] text-white flex items-center justify-center shadow-xs">
                    <BadgeIndianRupee className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-black text-[#0B1736] tracking-tight">
                    {displayEmi != null ? `₹${displayEmi.toLocaleString('en-IN')}` : 'Not available'}
                    <span className="text-sm font-semibold text-slate-500 ml-1">/ mo</span>
                  </div>
                  <p className="text-xs text-[#159A68] font-medium mt-1">
                    Structured repayment ({activeScenario?.tenureMonths ? `${activeScenario.tenureMonths / 12} yrs (${activeScenario.tenureMonths} mo)` : 'structured'} @ {activeScenario?.interestRate != null ? `${activeScenario.interestRate}% p.a.` : 'indicative rate'}).
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#159A68]/20 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">Safe EMI Cap (Dual-Gate DSCR):</span>
                    <span className="font-bold text-[#159A68]">
                      {fin.affordableEMI != null && fin.affordableEMI > 0
                        ? `₹${fin.affordableEMI.toLocaleString('en-IN')} / mo`
                        : `₹0 / mo (Surplus constrained)`}
                    </span>
                  </div>
                  {fin.affordableEMI === 0 && (
                    <p className="text-[10px] text-amber-700 bg-amber-50/90 p-1.5 rounded-lg border border-amber-200/70 mt-1.5 leading-snug">
                      Note: Operating expenses match or exceed declared income. Banks will require promoter equity adjustment or collateral guarantor during underwriting.
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Authoritative Capital Stack & Margin Money Card */}
            <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0B1736] text-white text-[10px] font-bold uppercase tracking-wider">
                    {fin.programName || 'Statutory Financial Structure'}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0B1736]">Capital Stack & Margin Breakdown</h3>
                </div>
                <span className="text-xs font-semibold text-[#0B1736] bg-white px-3 py-1 rounded-xl shadow-2xs border border-slate-200">
                  {promoterMarginPct != null ? `${promoterMarginPct}% Margin : ${100 - promoterMarginPct}% Debt/Grant` : 'Statutory Capital Stack'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                {/* 1. Total Project Cost */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Total Project Cost</div>
                  <div className="text-xl font-bold text-[#0B1736]">
                    ₹{Math.round(capital?.project_cost || fin.projectCost || ((promoterMarginAmt || 0) + (effectiveDebtAmt || 0)) || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">Total verified project outlay</div>
                </div>

                {/* 2. Beneficiary Margin Money */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">
                    {promoterMarginPct != null ? `${promoterMarginPct}% Beneficiary Margin` : 'Beneficiary Margin'}
                  </div>
                  <div className="text-xl font-bold text-[#0B1736]">
                    {promoterMarginAmt != null ? `₹${Math.round(promoterMarginAmt).toLocaleString('en-IN')}` : 'As per scheme rules'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {capital?.is_statutory_margin ? 'Authoritative statutory equity rule' : 'Required promoter equity'}
                  </div>
                </div>

                {/* 3. Net Bank Debt Financing */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Net Bank Debt Financing</div>
                  <div className="text-xl font-bold text-[#159A68]">
                    {effectiveDebtAmt != null ? `₹${Math.round(effectiveDebtAmt).toLocaleString('en-IN')}` : 'Evaluated on sanction'}
                  </div>
                  <div className="text-[10px] text-slate-400">Commercial bank term loan</div>
                </div>

                {/* 4. Subsidy / Guarantee / Assistance */}
                {hasSubsidy && capital?.subsidy_amount != null ? (
                  <div className="p-4 bg-[#EAF7F0] rounded-xl border border-[#159A68]/30 shadow-2xs space-y-1">
                    <div className="text-[11px] font-bold text-[#159A68]">Capital Subsidy / Grant</div>
                    <div className="text-xl font-bold text-[#0B1736]">₹{Math.round(capital.subsidy_amount).toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-[#159A68]">
                      {capital.subsidy_pct ? `${capital.subsidy_pct}% statutory grant` : 'Government back-ended subsidy'}
                    </div>
                  </div>
                ) : hasGuarantee ? (
                  <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 shadow-2xs space-y-1">
                    <div className="text-[11px] font-bold text-purple-800">Credit Guarantee Cover</div>
                    <div className="text-xl font-bold text-purple-900">
                      {capital.guaranteed_amount != null ? `₹${Math.round(capital.guaranteed_amount).toLocaleString('en-IN')}` : 'Collateral-free risk coverage'}
                    </div>
                    <div className="text-[10px] text-purple-600">
                      {capital.guarantee_coverage_pct ? `${capital.guarantee_coverage_pct}% lender risk mitigation` : 'Lender risk coverage'}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 shadow-2xs space-y-1">
                    <div className="text-[11px] font-bold text-blue-800">Credit Guarantee Cover</div>
                    <div className="text-xl font-bold text-blue-900">CGTMSE Eligible</div>
                    <div className="text-[10px] text-blue-600">Collateral-free bank borrowing cover</div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. 3 LOAN STRUCTURE CARDS (Conservative, Balanced, Extended)              */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Conservative */}
            <div
              onClick={() => setSelectedScenario('conservative')}
              className={`p-6 rounded-2xl sm:rounded-3xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
                selectedScenario === 'conservative'
                  ? 'ring-2 ring-[#159A68] border-[#159A68] bg-[#EAF7F0]/30 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{t('advisory.conservative')}</span>
                  <div className="flex items-center gap-1.5">
                    {selectedScenario === 'conservative' && (
                      <span className="text-[10px] font-bold text-white bg-[#159A68] px-2 py-0.5 rounded-full">Selected</span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Fast Payoff</span>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1736] mt-3 tracking-tight">
                  {structures.conservative?.monthlyEMI != null ? (
                    <>₹{structures.conservative.monthlyEMI.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/mo</span></>
                  ) : (
                    <span className="text-sm font-semibold text-slate-500">Subject to terms</span>
                  )}
                </div>
                
                <div className="space-y-2 text-xs text-slate-600 mt-5 border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tenure:</span>
                    <strong className="text-[#0B1736]">
                      {structures.conservative?.tenureMonths != null ? `${structures.conservative.tenureMonths} Months (${structures.conservative.tenureMonths / 12} yrs)` : 'Not specified'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected DTI:</span>
                    <strong className="text-[#0B1736]">
                      {structures.conservative?.projectedDTI != null ? `${structures.conservative.projectedDTI}%` : 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interest Rate:</span>
                    <strong className="text-[#0B1736]">
                      {structures.conservative?.interestRate != null
                        ? `${structures.conservative.interestRate}% p.a.`
                        : (structures.conservative?.isMarketLinked ? 'Market-Linked' : (structures.conservative?.rateNote || 'Lender benchmark'))}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Interest:</span>
                    <strong className="text-[#0B1736]">
                      {structures.conservative?.totalInterest != null ? `₹${structures.conservative.totalInterest.toLocaleString('en-IN')}` : 'Calculated on sanction'}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl text-center">
                {structures.conservative?.feasibility || 'Fastest debt-free horizon'}
              </div>
            </div>

            {/* Balanced - Recommended */}
            <div
              onClick={() => setSelectedScenario('balanced')}
              className={`p-6 rounded-2xl sm:rounded-3xl border shadow-xs flex flex-col justify-between relative cursor-pointer transition-all ${
                selectedScenario === 'balanced'
                  ? 'border-2 border-[#159A68] bg-[#EAF7F0]/40 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-[#159A68]/60'
              }`}
            >
              <div className="absolute -top-3 right-5 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#159A68] text-white font-bold text-[10px] uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3" />
                Recommended Option
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#159A68] tracking-wider">{t('advisory.balanced')}</span>
                  <div className="flex items-center gap-1.5">
                    {selectedScenario === 'balanced' && (
                      <span className="text-[10px] font-bold text-white bg-[#159A68] px-2 py-0.5 rounded-full">Selected</span>
                    )}
                    <span className="text-[10px] font-bold text-[#159A68] bg-[#EAF7F0] px-2 py-0.5 rounded-full border border-[#159A68]/20">Balanced</span>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1736] mt-3 tracking-tight">
                  {structures.balanced?.monthlyEMI != null ? (
                    <>₹{structures.balanced.monthlyEMI.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/mo</span></>
                  ) : (
                    <span className="text-sm font-semibold text-slate-500">Subject to terms</span>
                  )}
                </div>
                
                <div className="space-y-2 text-xs text-slate-600 mt-5 border-t border-[#159A68]/20 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tenure:</span>
                    <strong className="text-[#0B1736]">
                      {structures.balanced?.tenureMonths != null ? `${structures.balanced.tenureMonths} Months (${structures.balanced.tenureMonths / 12} yrs)` : 'Not specified'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected DTI:</span>
                    <strong className="text-[#0B1736]">
                      {structures.balanced?.projectedDTI != null ? `${structures.balanced.projectedDTI}%` : 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interest Rate:</span>
                    <strong className="text-[#0B1736]">
                      {structures.balanced?.interestRate != null
                        ? `${structures.balanced.interestRate}% p.a.`
                        : (structures.balanced?.isMarketLinked ? 'Market-Linked' : (structures.balanced?.rateNote || 'Lender benchmark'))}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Interest:</span>
                    <strong className="text-[#0B1736]">
                      {structures.balanced?.totalInterest != null ? `₹${structures.balanced.totalInterest.toLocaleString('en-IN')}` : 'Calculated on sanction'}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-[#159A68]/20 text-[11px] font-bold text-[#159A68] bg-[#EAF7F0] p-2.5 rounded-xl text-center">
                {structures.balanced?.feasibility || 'Optimized Cashflow Balance'}
              </div>
            </div>

            {/* Extended */}
            <div
              onClick={() => setSelectedScenario('extended')}
              className={`p-6 rounded-2xl sm:rounded-3xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
                selectedScenario === 'extended'
                  ? 'ring-2 ring-[#159A68] border-[#159A68] bg-[#EAF7F0]/30 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{t('advisory.extended')}</span>
                  <div className="flex items-center gap-1.5">
                    {selectedScenario === 'extended' && (
                      <span className="text-[10px] font-bold text-white bg-[#159A68] px-2 py-0.5 rounded-full">Selected</span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Lowest Outflow</span>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1736] mt-3 tracking-tight">
                  {structures.extended?.monthlyEMI != null ? (
                    <>₹{structures.extended.monthlyEMI.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/mo</span></>
                  ) : (
                    <span className="text-sm font-semibold text-slate-500">Subject to terms</span>
                  )}
                </div>
                
                <div className="space-y-2 text-xs text-slate-600 mt-5 border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tenure:</span>
                    <strong className="text-[#0B1736]">
                      {structures.extended?.tenureMonths != null ? `${structures.extended.tenureMonths} Months (${structures.extended.tenureMonths / 12} yrs)` : 'Not specified'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected DTI:</span>
                    <strong className="text-[#0B1736]">
                      {structures.extended?.projectedDTI != null ? `${structures.extended.projectedDTI}%` : 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interest Rate:</span>
                    <strong className="text-[#0B1736]">
                      {structures.extended?.interestRate != null
                        ? `${structures.extended.interestRate}% p.a.`
                        : (structures.extended?.isMarketLinked ? 'Market-Linked' : (structures.extended?.rateNote || 'Lender benchmark'))}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Interest:</span>
                    <strong className="text-[#0B1736]">
                      {structures.extended?.totalInterest != null ? `₹${structures.extended.totalInterest.toLocaleString('en-IN')}` : 'Calculated on sanction'}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl text-center">
                {structures.extended?.feasibility || 'Lowest Monthly Outflow'}
              </div>
            </div>

          </section>

          {/* ========================================================================= */}
          {/* 4. PRE-APPROVAL REQUIRED DOCUMENTS CHECKLIST                              */}
          {/* ========================================================================= */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-[#0B1736] flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#159A68]" />
              <span>Pre-Approval Required Documents Checklist</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fin.preApprovalChecklist?.map((doc: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-[#159A68] shrink-0" />
                  <span className="text-xs text-slate-700 font-medium">{doc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 5. STATUTORY UNDERWRITING & REGULATORY CAVEATS                           */}
          {/* ========================================================================= */}
          {warnings.length > 0 && (
            <section className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Underwriting & Regulatory Caveats</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-amber-800">
                {warnings.map((w: string, idx: number) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </section>
          )}

          {/* ========================================================================= */}
          {/* 6. NEXT STEPS CTA                                                         */}
          {/* ========================================================================= */}
          <section className="bg-[#0B1736] text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 border border-slate-800 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold">Ready to apply for Government Loan or Subsidy?</h3>
              <p className="text-xs text-slate-300">
                Explore matching government schemes with verified approval feasibility in your district.
              </p>
            </div>

            <Link
              href="/advisory/schemes"
              className="px-6 py-3 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Match Schemes Now</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </section>

        </main>
      </div>
    </div>
  );
}
