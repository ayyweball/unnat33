'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import {
  BadgeIndianRupee,
  Plus,
  Trash2,
  ArrowRight,
  Loader2,
  Building2,
  AlertCircle,
  Users,
  Wallet,
  Percent,
  Landmark,
  User,
  FileText,
  TrendingUp,
  ShieldCheck,
  Clock,
  Check,
  ChevronRight,
} from 'lucide-react';

function FinancialAdvisorForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialProgramId = searchParams.get('programId');
  const initialProgramCode = searchParams.get('programCode');
  const initialLoan = searchParams.get('loanNeeded');

  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  const [form, setForm] = useState({
    programId: initialProgramId ? parseInt(initialProgramId) : (undefined as number | undefined),
    programCode: initialProgramCode || '',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    existingLoans: [] as { name: string; emi: number }[],
    creditHistory: 'Good Track Record',
    projectCost: initialLoan ? parseInt(initialLoan) : 0,
    loanNeeded: initialLoan ? parseInt(initialLoan) : 0,
    purpose: 'Equipment & Machinery Purchase',
    preferredTenure: 60,
    collateralAvailable: ['None (Collateral-Free MUDRA Coverage)'],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load user business profile to pre-fill financial parameters
  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.business) {
          const b = data.business;
          const income = b.monthlyIncome || (b.annualIncome ? Math.round(b.annualIncome / 12) : 0);
          const expenses = b.monthlyExpenses || 0;
          const pCost = initialLoan ? parseInt(initialLoan) : (b.projectCost || b.estimatedCapital || 0);
          const lNeeded = initialLoan ? parseInt(initialLoan) : (b.requestedFinancing || b.projectCost || 0);
          const loans =
            b.existingMonthlyEmi && b.existingMonthlyEmi > 0
              ? [{ name: 'Existing Borrowings / EMI', emi: b.existingMonthlyEmi }]
              : [];

          setForm((prev) => ({
            ...prev,
            monthlyIncome: prev.monthlyIncome || income,
            monthlyExpenses: prev.monthlyExpenses || expenses,
            projectCost: prev.projectCost || pCost,
            loanNeeded: prev.loanNeeded || lNeeded,
            existingLoans: prev.existingLoans.length > 0 ? prev.existingLoans : loans,
          }));
        }
        setProfileLoaded(true);
      })
      .catch((e) => {
        console.warn('Could not load profile for financial advisor:', e);
        setProfileLoaded(true);
      });
  }, [initialLoan]);

  // Fetch available authoritative programmes to allow selection or switching
  useEffect(() => {
    setLoadingPrograms(true);
    fetch('/api/schemes?limit=60')
      .then((res) => res.json())
      .then((data) => {
        if (data.programs) {
          setAvailablePrograms(data.programs);
          // If no program selected from URL, default to first available program
          if (!form.programId && !form.programCode && data.programs.length > 0) {
            setForm((prev) => ({
              ...prev,
              programId: data.programs[0].id,
              programCode: data.programs[0].program_code,
            }));
          }
        }
      })
      .catch((e) => console.warn('Could not load programmes for selector:', e))
      .finally(() => setLoadingPrograms(false));
  }, []);

  const addLoan = () => {
    setForm({
      ...form,
      existingLoans: [...form.existingLoans, { name: 'Existing Borrowings / EMI', emi: 0 }],
    });
  };

  const removeLoan = (idx: number) => {
    const updated = form.existingLoans.filter((_, i) => i !== idx);
    setForm({ ...form, existingLoans: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.programId && !form.programCode) {
      setError('Please select a target government programme to structure financing.');
      setLoading(false);
      return;
    }

    if (form.monthlyIncome <= 0) {
      setError('A valid monthly income greater than 0 is required for statutory debt serviceability evaluation.');
      setLoading(false);
      return;
    }

    if (form.projectCost <= 0) {
      setError('Total project cost greater than 0 is required for deterministic capital structuring.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/advisory/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          projectCost: form.projectCost,
          loanNeeded: form.loanNeeded,
          programId: form.programId ? parseInt(form.programId.toString()) : undefined,
          programCode: form.programCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate financial advice');

      router.push(`/advisory/financial/${data.advisoryId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedProgramObj = availablePrograms.find(
    (p) => (form.programId && p.id === form.programId) || (form.programCode && p.program_code === form.programCode)
  );

  // Dynamic Financial Snapshot calculations
  const totalExistingEmi = form.existingLoans.reduce((sum, l) => sum + (l.emi || 0), 0);
  const monthlySurplus = Math.max(0, form.monthlyIncome - form.monthlyExpenses - totalExistingEmi);
  const estimatedEmiCapacity = Math.round(monthlySurplus * 0.4);

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#0B1736] flex flex-col font-sans selection:bg-[#159A68] selection:text-white">
      <Navbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1550px] w-full min-w-0 space-y-6 sm:space-y-7">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#159A68] transition-colors flex items-center gap-1">
              <span>« Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0B1736] font-semibold">Financial Options</span>
          </div>

          {/* ========================================================================= */}
          {/* 1. PAGE INTRO (Header Area with Subtle Indian Financial Banner Artwork)    */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs relative overflow-hidden">
            {/* Subtle Indian Financial Artwork Fading on the Right */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden rounded-r-2xl sm:rounded-r-3xl z-0">
              <img
                src="/currency-flag.jpg"
                alt="Indian currency notes with Indian flag and Ashoka Chakra"
                className="w-full h-full object-cover object-[65%_48%] financial-hero-mask"
              />
              <style dangerouslySetInnerHTML={{ __html: `
                .financial-hero-mask {
                  -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                  mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                }
                @media (min-width: 640px) {
                  .financial-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                  }
                }
                @media (min-width: 1024px) {
                  .financial-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                  }
                }
              `}} />
            </div>

            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest block">
                FINANCIAL OPTIONS
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B1736] tracking-tight font-serif">
                Explore funding opportunities
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
                Compare loans, subsidies and financial products for your business with deterministic eligibility rules.
              </p>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 1B. FUNDING OPPORTUNITY TABS (Direct Screen 6 Reference Match)             */}
          {/* ========================================================================= */}
          <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['Bank Loans', 'MUDRA Loans', 'Subsidies', 'Investor Options', 'Working Capital'].map((tab, idx) => (
              <button
                key={tab}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  idx === 0
                    ? 'bg-[#159A68] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-[#0B1736] border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </section>

          {/* Featured Financial Products Row (Direct Screen 6 Reference Match) */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
            {/* Product 1: MUDRA Shishu */}
            <div className="p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1736]">MUDRA Loan - Shishu</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Collateral Free
                    </span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      New Business
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Loan Amount</span>
                  <strong className="text-[#0B1736] font-bold">₹ 50,000 - 2 Lakh</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                  <strong className="text-[#0B1736] font-bold">8% - 12%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tenure</span>
                  <strong className="text-[#0B1736] font-bold">1 - 5 years</strong>
                </div>
                <Link
                  href="/advisory/schemes"
                  className="px-4 py-2 bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
                >
                  Apply Now
                </Link>
              </div>
            </div>

            {/* Product 2: MUDRA Kishor */}
            <div className="p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <BadgeIndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1736]">MUDRA Loan - Kishor</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Business Expansion
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Loan Amount</span>
                  <strong className="text-[#0B1736] font-bold">₹ 2 Lakh - 5 Lakh</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                  <strong className="text-[#0B1736] font-bold">8% - 12%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tenure</span>
                  <strong className="text-[#0B1736] font-bold">1 - 5 years</strong>
                </div>
                <Link
                  href="/advisory/schemes"
                  className="px-4 py-2 bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
                >
                  Apply Now
                </Link>
              </div>
            </div>

            {/* Product 3: Stand Up India */}
            <div className="p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1736]">Stand Up India Scheme</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      SC/ST/Women
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Greenfield
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Loan Amount</span>
                  <strong className="text-[#0B1736] font-bold">₹ 10 Lakh - 1 Crore</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                  <strong className="text-[#0B1736] font-bold">8% - 11%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tenure</span>
                  <strong className="text-[#0B1736] font-bold">1 - 7 years</strong>
                </div>
                <Link
                  href="/advisory/schemes"
                  className="px-4 py-2 bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. COMPACT FINANCIAL SNAPSHOT (4 Clean Horizontal Cards)                   */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Monthly Income */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Income
                </span>
                <div className="text-lg sm:text-xl font-black text-[#0B1736] tracking-tight">
                  ₹ {form.monthlyIncome > 0 ? form.monthlyIncome.toLocaleString('en-IN') : '25,000'}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Household / Business</span>
              </div>
            </div>

            {/* Card 2: Monthly Expenses */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF9EE] text-[#F4A340] flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Expenses
                </span>
                <div className="text-lg sm:text-xl font-black text-[#0B1736] tracking-tight">
                  ₹ {form.monthlyExpenses > 0 ? form.monthlyExpenses.toLocaleString('en-IN') : '10,000'}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Living &amp; Operational</span>
              </div>
            </div>

            {/* Card 3: Estimated EMI Capacity */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-base">
                %
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Estimated EMI Capacity
                </span>
                <div className="text-lg sm:text-xl font-black text-[#0B1736] tracking-tight">
                  ₹ {estimatedEmiCapacity > 0 ? estimatedEmiCapacity.toLocaleString('en-IN') : '3,500'}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Based on income &amp; expenses</span>
              </div>
            </div>

            {/* Card 4: Debt Profile */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Debt Profile
                </span>
                <div className="text-base sm:text-lg font-black text-[#0B1736] tracking-tight truncate max-w-[170px]">
                  {form.creditHistory}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {form.creditHistory === 'Good Track Record'
                    ? 'No prior credit issues'
                    : form.creditHistory === 'No Prior Credit'
                    ? 'First-time borrower'
                    : 'Resolvable overdues'}
                </span>
              </div>
            </div>

          </section>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2.5 border border-red-200 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Notice Banner */}
          {profileLoaded && (form.monthlyIncome <= 0 || form.projectCost <= 0) && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs space-y-1 shadow-xs">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Financial Parameters Needed
              </div>
              <p className="text-slate-600">
                Statutory debt serviceability evaluation (FOIR / DSCR) and capital structuring require a verified monthly disposable income and total project cost. Enter them below or update your business profile.
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. NUMBERED FORM SECTIONS (Clean Guided Financial Workflow)               */}
          {/* ========================================================================= */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* --------------------------------------------------------------------- */}
            {/* SECTION 1: Target Government Assistance Programme                     */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                    1. Target Government Assistance Programme
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Select the scheme or financial assistance programme you want to explore.
                  </p>
                </div>
              </div>

              <div>
                <select
                  required
                  value={form.programId || (selectedProgramObj ? selectedProgramObj.id : '')}
                  onChange={(e) => {
                    const pid = parseInt(e.target.value);
                    const prog = availablePrograms.find((p) => p.id === pid);
                    setForm({
                      ...form,
                      programId: pid,
                      programCode: prog ? prog.program_code : '',
                    });
                  }}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200/90 text-xs font-semibold bg-white text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all"
                >
                  {availablePrograms.length === 0 ? (
                    <option value="">
                      {loadingPrograms ? 'Loading authoritative programmes...' : (form.programCode || 'Target Programme')}
                    </option>
                  ) : (
                    availablePrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.program_name} ({prog.program_code}) — {prog.primary_type}
                      </option>
                    ))
                  )}
                </select>

                {selectedProgramObj && (
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-2 px-1">
                    {selectedProgramObj.benefit_summary || selectedProgramObj.description}
                  </p>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* SECTION 2: Income & Expense Details                                   */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                    2. Income &amp; Expense Details
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Your current financial position helps us suggest the right financing structure.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">
                    Current Monthly Income (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.monthlyIncome || ''}
                    placeholder="25000"
                    onChange={(e) => setForm({ ...form, monthlyIncome: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-semibold text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Monthly net operational surplus / household income
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">
                    Monthly Expenses (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.monthlyExpenses || ''}
                    placeholder="10000"
                    onChange={(e) => setForm({ ...form, monthlyExpenses: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-semibold text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Living, household, and basic operational overheads
                  </p>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* SECTION 3: Existing Debt Obligations                                  */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                      3. Existing Debt Obligations
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Active bank borrowings and monthly debt obligations.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addLoan}
                  className="text-xs font-bold text-[#159A68] hover:text-[#128357] inline-flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-[#EAF7F0]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Loan</span>
                </button>
              </div>

              {form.existingLoans.length === 0 ? (
                <div className="py-3 px-4 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs text-slate-400 italic">
                  No existing loans recorded. Click &ldquo;+ Add Loan&rdquo; if you have active borrowings.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {form.existingLoans.map((loan, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2.5 items-center">
                      <input
                        type="text"
                        placeholder="Existing Borrowings / EMI"
                        value={loan.name}
                        onChange={(e) => {
                          const updated = [...form.existingLoans];
                          updated[idx].name = e.target.value;
                          setForm({ ...form, existingLoans: updated });
                        }}
                        className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs text-[#0B1736] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="number"
                          placeholder="3500"
                          value={loan.emi || ''}
                          onChange={(e) => {
                            const updated = [...form.existingLoans];
                            updated[idx].emi = parseInt(e.target.value) || 0;
                            setForm({ ...form, existingLoans: updated });
                          }}
                          className="w-full sm:w-40 px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-bold text-[#0B1736] bg-white focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeLoan(idx)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          title="Remove loan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* SECTION 4: Project Financing Details                                  */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                    4. Project Financing Details
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Total project cost and desired loan amount for your business plan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">
                    Total Project Cost (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.projectCost || ''}
                    placeholder="100000"
                    onChange={(e) => setForm({ ...form, projectCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-bold text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Total capital expenditure + initial working capital
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">
                    Requested Loan Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.loanNeeded || ''}
                    placeholder="75000"
                    onChange={(e) => setForm({ ...form, loanNeeded: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-bold text-[#159A68] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Statutory loan requirement (subject to promoter margin)
                  </p>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* SECTION 5: Loan Purpose & Credit Profile                              */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                    5. Loan Purpose &amp; Credit Profile
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Intended fund allocation and commercial credit standing.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Purpose of Loan</label>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] bg-white transition-all"
                >
                  <option value="Equipment & Machinery Purchase">Equipment &amp; Machinery Purchase</option>
                  <option value="Raw Material & Working Capital">Raw Material &amp; Working Capital</option>
                  <option value="Livestock / Cattle Purchase">Livestock / Cattle Purchase</option>
                  <option value="New Business Setup">New Business Setup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1736] mb-2">Credit History</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Good Track Record', 'No Prior Credit', 'Minor Overdues'].map((ch) => {
                    const isSelected = form.creditHistory === ch;
                    return (
                      <label
                        key={ch}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'border-[#159A68] bg-[#EAF7F0] shadow-2xs ring-1 ring-[#159A68]/30'
                            : 'border-slate-200/80 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="creditHistory"
                          checked={isSelected}
                          onChange={() => setForm({ ...form, creditHistory: ch })}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#159A68] border-[#159A68]'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#0B1736]' : 'text-slate-700'}`}>
                          {ch}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* SECTION 6: Preferred Tenure                                           */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0B1736]">
                    6. Preferred Tenure
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Repayment amortization horizon in months.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[36, 48, 60, 84].map((ten) => {
                  const isSelected = form.preferredTenure === ten;
                  return (
                    <button
                      key={ten}
                      type="button"
                      onClick={() => setForm({ ...form, preferredTenure: ten })}
                      className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#159A68] text-white border-[#159A68] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      {ten} Mo
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===================================================================== */}
            {/* PRIMARY CTA: Structure Financing & Calculate Amortization             */}
            {/* ===================================================================== */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-[#0B1736] hover:bg-[#12234d] text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Synthesizing Statutory Amortization...</span>
                </>
              ) : (
                <>
                  <span>Structure Financing &amp; Calculate Amortization</span>
                  <ArrowRight className="w-4 h-4 text-[#F4A340] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>
        </main>
      </div>
    </div>
  );
}

export default function FinancialAdvisorFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#159A68] animate-spin" />
        </div>
      }
    >
      <FinancialAdvisorForm />
    </Suspense>
  );
}
