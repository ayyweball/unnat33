'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAppStore } from '@/lib/store';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Scale,
  Landmark,
  Building2,
  Layers,
  BookOpen,
  Info,
  Loader2,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  SimulatorAssumptions,
  SimulatorCalculateResponse,
  DistrictResearchContextResponse,
  HcesStateMpceResponse,
} from '@/lib/api-client';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

function WhatIfSimulatorContent() {
  const searchParams = useSearchParams();
  const urlState = searchParams?.get('state') || '';
  const urlDistrict = searchParams?.get('district') || '';
  const { user: storeUser, business: storeBusiness } = useAppStore();

  // 1. Business Profile Context
  const [profileLoading, setProfileLoading] = useState(true);
  const [enterpriseMeta, setEnterpriseMeta] = useState({
    businessName: storeBusiness?.name || (storeUser?.name ? `${storeUser.name}'s Enterprise` : 'My Enterprise'),
    sector: storeBusiness?.sector || storeBusiness?.type || 'Food',
    subType: storeBusiness?.description || 'Micro Enterprise',
    state: urlState || storeBusiness?.state || storeUser?.state || '',
    district: urlDistrict || storeBusiness?.district || storeUser?.district || '',
    isRural: storeBusiness?.isRural !== undefined && storeBusiness?.isRural !== null ? storeBusiness.isRural : true,
  });

  // 2. Baseline Assumptions
  const [baseline, setBaseline] = useState<SimulatorAssumptions>({
    monthly_customers: 250,
    average_selling_price: 400,
    variable_cost_per_unit: 240,
    fixed_operating_costs: 20000,
    marketing_expense: 4000,
    initial_investment: 150000,
    loan_amount: 100000,
    annual_interest_rate: 9.5,
    loan_tenure_months: 36,
  });

  // 3. Scenario Assumptions
  const [scenario, setScenario] = useState<SimulatorAssumptions>({
    monthly_customers: 250,
    average_selling_price: 400,
    variable_cost_per_unit: 240,
    fixed_operating_costs: 20000,
    marketing_expense: 4000,
    initial_investment: 150000,
    loan_amount: 100000,
    annual_interest_rate: 9.5,
    loan_tenure_months: 36,
  });

  // 4. Calculation State (Single Source of Truth: Backend)
  const [calculationResult, setCalculationResult] = useState<SimulatorCalculateResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // 5. Research Context (HCES 2022-23 + PwC 2025)
  const [researchContext, setResearchContext] = useState<DistrictResearchContextResponse | null>(null);
  const [loadingResearch, setLoadingResearch] = useState(false);
  const [hcesData, setHcesData] = useState<HcesStateMpceResponse | null>(null);
  const [loadingHces, setLoadingHces] = useState(false);

  // 1. Load User/Business Profile
  useEffect(() => {
    async function loadInitialProfile() {
      try {
        setProfileLoading(true);
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          const u = data.user || {};
          const b = data.business || {};

          const resolvedState = urlState || b.state || u.state || storeBusiness?.state || storeUser?.state || '';
          const resolvedDistrict = urlDistrict || b.district || u.district || storeBusiness?.district || storeUser?.district || '';
          const resolvedSector = b.sector || b.type || storeBusiness?.sector || storeBusiness?.type || 'Food';
          const resolvedSubType = b.description || storeBusiness?.description || 'Micro Enterprise';
          const resolvedIsRural = b.isRural !== undefined && b.isRural !== null ? b.isRural : (storeBusiness?.isRural ?? true);

          setEnterpriseMeta({
            businessName: b.name || storeBusiness?.name || `${resolvedSector} Enterprise`,
            sector: resolvedSector,
            subType: resolvedSubType,
            state: resolvedState,
            district: resolvedDistrict,
            isRural: resolvedIsRural,
          });

          // Derive baseline values if available
          const capital = Number(b.projectCost || b.estimatedCapital) || 150000;
          const monthlyRev = Number(b.monthlyIncome) || (Number(b.annualTurnover) ? Number(b.annualTurnover) / 12 : 100000);
          const loanAmt = Number(b.requestedFinancing || b.existingDebt) || (capital > 50000 ? Math.round(capital * 0.6) : 50000);
          const monthlyExp = Number(b.monthlyExpenses) || Math.round(monthlyRev * 0.7);

          const estCustomers = 250;
          const estPrice = Math.max(50, Math.round(monthlyRev / estCustomers));
          const estVarCost = Math.max(20, Math.round((monthlyExp * 0.65) / estCustomers));
          const estFixedCost = Math.max(5000, Math.round(monthlyExp * 0.35));

          const initialBase: SimulatorAssumptions = {
            monthly_customers: estCustomers,
            average_selling_price: estPrice,
            variable_cost_per_unit: estVarCost,
            fixed_operating_costs: estFixedCost,
            marketing_expense: 3000,
            initial_investment: capital,
            loan_amount: loanAmt,
            annual_interest_rate: 9.5,
            loan_tenure_months: 36,
          };

          setBaseline(initialBase);
          setScenario(initialBase);
        }
      } catch (err) {
        console.warn('Could not load profile in simulator:', err);
      } finally {
        setProfileLoading(false);
      }
    }
    loadInitialProfile();
  }, []);

  // 2. Load Research Context (Authoritative MoSPI HCES 2022-23 + PwC Voice of the Consumer)
  useEffect(() => {
    async function loadResearch() {
      if (!enterpriseMeta.district || !enterpriseMeta.state) return;
      try {
        setLoadingResearch(true);
        const params = new URLSearchParams({
          district_name: enterpriseMeta.district,
          state_name: enterpriseMeta.state,
          business_type: enterpriseMeta.sector,
          sector: enterpriseMeta.subType,
        });
        const res = await fetch(`/api/research/district-market-context?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResearchContext(data);
        }
      } catch (err) {
        console.warn('Could not load contextual research evidence:', err);
      } finally {
        setLoadingResearch(false);
      }

      // Fetch authoritative HCES State benchmark
      try {
        setLoadingHces(true);
        const hcesRes = await fetch(`/api/research/hces/state/${encodeURIComponent(enterpriseMeta.state)}`);
        if (hcesRes.ok) {
          const hd = await hcesRes.json();
          setHcesData(hd);
        } else {
          setHcesData(null);
        }
      } catch (err) {
        console.warn('Could not load HCES state MPCE benchmark:', err);
      } finally {
        setLoadingHces(false);
      }
    }
    loadResearch();
  }, [enterpriseMeta.district, enterpriseMeta.state, enterpriseMeta.sector, enterpriseMeta.subType]);

  // 3. Stateless Deterministic Backend Calculation (Single Source of Truth)
  const executeSimulation = useCallback(
    async (baseAssumptions: SimulatorAssumptions, scenAssumptions: SimulatorAssumptions) => {
      setCalculating(true);
      setCalcError(null);
      try {
        const payload = {
          baseline: baseAssumptions,
          scenario: scenAssumptions,
          sector: enterpriseMeta.sector,
          sub_type: enterpriseMeta.subType,
          state_name: enterpriseMeta.state,
          district_name: enterpriseMeta.district,
          is_rural: enterpriseMeta.isRural,
        };

        const res = await fetch('/api/simulator/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Simulation engine error (HTTP ${res.status})`);
        }

        const data: SimulatorCalculateResponse = await res.json();
        setCalculationResult(data);
      } catch (err: any) {
        console.error('Calculation execution error:', err);
        setCalcError(
          err.message ||
            'Unable to reach backend simulation engine. Please check that the backend service is running and click Apply Scenario to retry.'
        );
      } finally {
        setCalculating(false);
      }
    },
    [enterpriseMeta]
  );

  // Trigger calculation when baseline is initialized
  useEffect(() => {
    if (!profileLoading) {
      executeSimulation(baseline, scenario);
    }
  }, [profileLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply scenario handler
  const handleApplyScenario = () => {
    executeSimulation(baseline, scenario);
  };

  // Reset scenario handler
  const handleResetScenario = () => {
    setScenario({ ...baseline });
    executeSimulation(baseline, baseline);
  };

  // Format currency
  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    return `₹${Math.round(val).toLocaleString()}`;
  };

  // Format chart comparison data
  const chartData = calculationResult
    ? [
        {
          name: 'Revenue',
          Current: calculationResult.baseline_metrics.monthly_revenue,
          Scenario: calculationResult.scenario_metrics.monthly_revenue,
        },
        {
          name: 'Operating Cost',
          Current: calculationResult.baseline_metrics.total_operating_cost,
          Scenario: calculationResult.scenario_metrics.total_operating_cost,
        },
        {
          name: 'Operating Profit',
          Current: calculationResult.baseline_metrics.operating_profit,
          Scenario: calculationResult.scenario_metrics.operating_profit,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0B1736] flex flex-col font-sans selection:bg-[#159A68] selection:text-white">
      <Navbar />

      <div className="flex-1 flex w-full min-w-0">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1550px] w-full min-w-0 space-y-6 sm:space-y-7">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#159A68] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0B1736] font-semibold">What-If Simulator</span>
          </div>

          {/* Page Title & Philosophy */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-[#159A68] bg-[#EAF7F0] px-2.5 py-0.5 rounded-full border border-[#159A68]/20 tracking-wider uppercase">
                Decision Support Engine
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Deterministic Financial Modeling
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1736] tracking-tight">
              What-If Business Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Explore how changes in price, transaction volume, variable costs, fixed overheads, and debt financing impact your operating profit, margins, debt servicing, and break-even points.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetScenario}
              disabled={calculating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Scenario
            </button>
            <button
              type="button"
              onClick={handleApplyScenario}
              disabled={calculating}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1736] hover:bg-[#152347] transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F4A340]" />
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <span>Apply Scenario</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F4A340]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Error Banner (No Silent Local Fallback Math) */}
        {calcError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold">Simulation Engine Unavailable</div>
              <p className="text-rose-700 leading-relaxed">{calcError}</p>
              <button
                type="button"
                onClick={handleApplyScenario}
                className="mt-2 px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition"
              >
                Retry Calculation
              </button>
            </div>
          </div>
        )}

        {/* 1. Baseline Enterprise Profile & Geographic Context */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#159A68]" />
              <h2 className="text-sm font-bold text-[#0B1736] uppercase tracking-wide">
                1. Enterprise Baseline Setup
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">
              Pre-populated from profile; modify to update baseline assumptions.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Sector / Domain
              </label>
              <input
                type="text"
                value={enterpriseMeta.sector}
                onChange={(e) => setEnterpriseMeta({ ...enterpriseMeta, sector: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#159A68] focus:border-[#159A68] bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Sub-Type / Activity
              </label>
              <input
                type="text"
                value={enterpriseMeta.subType}
                onChange={(e) => setEnterpriseMeta({ ...enterpriseMeta, subType: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#159A68] focus:border-[#159A68] bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">State / UT</label>
              <select
                value={enterpriseMeta.state}
                onChange={(e) => setEnterpriseMeta({ ...enterpriseMeta, state: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#159A68] focus:border-[#159A68] bg-white cursor-pointer"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={enterpriseMeta.district}
                placeholder="e.g. Pune, Mumbai..."
                onChange={(e) => setEnterpriseMeta({ ...enterpriseMeta, district: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#159A68] focus:border-[#159A68] bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location Type</label>
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setEnterpriseMeta({ ...enterpriseMeta, isRural: true })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    enterpriseMeta.isRural
                      ? 'bg-[#EAF7F0] text-[#159A68] border-[#159A68]'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Rural
                </button>
                <button
                  type="button"
                  onClick={() => setEnterpriseMeta({ ...enterpriseMeta, isRural: false })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    !enterpriseMeta.isRural
                      ? 'bg-[#EAF7F0] text-[#159A68] border-[#159A68]'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Urban
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Baseline Outlay (₹)
              </label>
              <input
                type="number"
                value={baseline.initial_investment}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBaseline({ ...baseline, initial_investment: val });
                }}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#159A68] focus:border-[#159A68] bg-white"
              />
            </div>
          </div>
        </section>

        {/* 2. Interactive Scenario Assumptions Controls */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#159A68]" />
              <h2 className="text-sm font-bold text-[#0B1736] uppercase tracking-wide">
                2. Scenario Assumption Controls
              </h2>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>Adjust parameters and click</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Apply Scenario</span>
              <span>to recalculate via backend engine.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Control 1: Average Selling Price */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Average Selling Price</span>
                <span className="text-xs font-mono font-bold text-[#0B1736] bg-white px-2 py-0.5 border rounded">
                  ₹{scenario.average_selling_price}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max={Math.max(2000, baseline.average_selling_price * 3)}
                step="5"
                value={scenario.average_selling_price}
                onChange={(e) => setScenario({ ...scenario, average_selling_price: Number(e.target.value) })}
                className="w-full accent-[#159A68] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Baseline: ₹{baseline.average_selling_price}</span>
                <span className={scenario.average_selling_price >= baseline.average_selling_price ? 'text-emerald-700' : 'text-amber-700'}>
                  {scenario.average_selling_price >= baseline.average_selling_price ? '+' : ''}
                  {baseline.average_selling_price > 0
                    ? Math.round(((scenario.average_selling_price - baseline.average_selling_price) / baseline.average_selling_price) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>

            {/* Control 2: Monthly Customer Volume */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Monthly Customers / Transactions</span>
                <span className="text-xs font-mono font-bold text-[#0B1736] bg-white px-2 py-0.5 border rounded">
                  {scenario.monthly_customers}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(2000, baseline.monthly_customers * 3)}
                step="5"
                value={scenario.monthly_customers}
                onChange={(e) => setScenario({ ...scenario, monthly_customers: Number(e.target.value) })}
                className="w-full accent-[#159A68] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Baseline: {baseline.monthly_customers}</span>
                <span className={scenario.monthly_customers >= baseline.monthly_customers ? 'text-emerald-700' : 'text-amber-700'}>
                  {scenario.monthly_customers >= baseline.monthly_customers ? '+' : ''}
                  {baseline.monthly_customers > 0
                    ? Math.round(((scenario.monthly_customers - baseline.monthly_customers) / baseline.monthly_customers) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>

            {/* Control 3: Variable Cost per Unit */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Variable Cost per Unit</span>
                <span className="text-xs font-mono font-bold text-[#0B1736] bg-white px-2 py-0.5 border rounded">
                  ₹{scenario.variable_cost_per_unit}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(1500, baseline.variable_cost_per_unit * 3)}
                step="5"
                value={scenario.variable_cost_per_unit}
                onChange={(e) => setScenario({ ...scenario, variable_cost_per_unit: Number(e.target.value) })}
                className="w-full accent-[#159A68] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Baseline: ₹{baseline.variable_cost_per_unit}</span>
                <span className={scenario.variable_cost_per_unit <= baseline.variable_cost_per_unit ? 'text-emerald-700' : 'text-rose-700'}>
                  {scenario.variable_cost_per_unit >= baseline.variable_cost_per_unit ? '+' : ''}
                  {baseline.variable_cost_per_unit > 0
                    ? Math.round(((scenario.variable_cost_per_unit - baseline.variable_cost_per_unit) / baseline.variable_cost_per_unit) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>

            {/* Control 4: Fixed Operating Costs */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Fixed Operating Overheads (₹/mo)</span>
                <input
                  type="number"
                  value={scenario.fixed_operating_costs}
                  onChange={(e) => setScenario({ ...scenario, fixed_operating_costs: Number(e.target.value) })}
                  className="w-28 px-2 py-0.5 text-xs text-right font-mono font-bold border rounded bg-white"
                />
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(100000, baseline.fixed_operating_costs * 3)}
                step="500"
                value={scenario.fixed_operating_costs}
                onChange={(e) => setScenario({ ...scenario, fixed_operating_costs: Number(e.target.value) })}
                className="w-full accent-[#159A68] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Baseline: ₹{baseline.fixed_operating_costs.toLocaleString()}</span>
                <span className={scenario.fixed_operating_costs <= baseline.fixed_operating_costs ? 'text-emerald-700' : 'text-rose-700'}>
                  Diff: ₹{(scenario.fixed_operating_costs - baseline.fixed_operating_costs).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Control 5: Marketing Expenditure */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Marketing & Promotion (₹/mo)</span>
                <input
                  type="number"
                  value={scenario.marketing_expense}
                  onChange={(e) => setScenario({ ...scenario, marketing_expense: Number(e.target.value) })}
                  className="w-28 px-2 py-0.5 text-xs text-right font-mono font-bold border rounded bg-white"
                />
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={scenario.marketing_expense}
                onChange={(e) => setScenario({ ...scenario, marketing_expense: Number(e.target.value) })}
                className="w-full accent-[#159A68] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Baseline: ₹{baseline.marketing_expense.toLocaleString()}</span>
                <span>Diff: ₹{(scenario.marketing_expense - baseline.marketing_expense).toLocaleString()}</span>
              </div>
            </div>

            {/* Control 6: Loan Financing (Principal, Rate, Tenure) */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Loan Principal (₹)</span>
                <input
                  type="number"
                  value={scenario.loan_amount}
                  onChange={(e) => setScenario({ ...scenario, loan_amount: Number(e.target.value) })}
                  className="w-28 px-2 py-0.5 text-xs text-right font-mono font-bold border rounded bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block font-semibold">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={scenario.annual_interest_rate}
                    onChange={(e) => setScenario({ ...scenario, annual_interest_rate: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-xs border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block font-semibold">Tenure (Months)</label>
                  <input
                    type="number"
                    value={scenario.loan_tenure_months}
                    onChange={(e) => setScenario({ ...scenario, loan_tenure_months: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-xs border rounded bg-white"
                  />
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono text-right">
                Baseline Loan: ₹{baseline.loan_amount.toLocaleString()} @ {baseline.annual_interest_rate}% ({baseline.loan_tenure_months}m)
              </div>
            </div>
          </div>
        </section>

        {/* 3. Primary Output: Current vs Scenario Comparison Table */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#159A68]" />
                <h2 className="text-sm font-bold text-[#0B1736] uppercase tracking-wide">
                  3. Financial Comparison: Current vs Scenario
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic calculations generated strictly by the backend simulation service.
              </p>
            </div>

            <div className="text-[11px] font-semibold text-slate-500">
              Single Source of Truth: <span className="text-[#159A68] font-bold">FastAPI Simulator Engine</span>
            </div>
          </div>

          {calculating && !calculationResult ? (
            <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#159A68]" />
              <span>Computing financial metrics...</span>
            </div>
          ) : calculationResult ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Financial Metric</th>
                    <th className="py-3 px-4 text-right">Current (Baseline)</th>
                    <th className="py-3 px-4 text-right">Scenario</th>
                    <th className="py-3 px-4 text-right">Variance / Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Monthly Revenue */}
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">Monthly Revenue</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {formatCurrency(calculationResult.baseline_metrics.monthly_revenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0B1736]">
                      {formatCurrency(calculationResult.scenario_metrics.monthly_revenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {renderDeltaCell(calculationResult.deltas.monthly_revenue, true)}
                    </td>
                  </tr>

                  {/* Variable Operating Costs */}
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-4 text-slate-600 pl-6">• Variable Operating Costs</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                      {formatCurrency(calculationResult.baseline_metrics.variable_costs)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                      {formatCurrency(calculationResult.scenario_metrics.variable_costs)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {renderDeltaCell(calculationResult.deltas.variable_costs, false)}
                    </td>
                  </tr>

                  {/* Fixed Operating Costs */}
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-4 text-slate-600 pl-6">• Fixed Costs (inc. Marketing)</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                      {formatCurrency(calculationResult.baseline_metrics.fixed_costs)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                      {formatCurrency(calculationResult.scenario_metrics.fixed_costs)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {renderDeltaCell(calculationResult.deltas.fixed_costs, false)}
                    </td>
                  </tr>

                  {/* Total Operating Cost */}
                  <tr className="hover:bg-slate-50/50 transition bg-slate-50/30">
                    <td className="py-3 px-4 font-semibold text-slate-900">Total Operating Cost</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {formatCurrency(calculationResult.baseline_metrics.total_operating_cost)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(calculationResult.scenario_metrics.total_operating_cost)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {renderDeltaCell(calculationResult.deltas.total_operating_cost, false)}
                    </td>
                  </tr>

                  {/* Operating Profit */}
                  <tr className="hover:bg-slate-50/50 transition bg-emerald-50/20">
                    <td className="py-3 px-4 font-bold text-[#0B1736] flex items-center gap-1.5">
                      <span>Operating Profit</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Revenue - Operating Costs)</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                      {formatCurrency(calculationResult.baseline_metrics.operating_profit)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#159A68] text-sm">
                      {formatCurrency(calculationResult.scenario_metrics.operating_profit)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {renderDeltaCell(calculationResult.deltas.operating_profit, true)}
                    </td>
                  </tr>

                  {/* Operating Margin */}
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-4 text-slate-700 font-semibold pl-6">• Operating Margin</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      {calculationResult.baseline_metrics.operating_margin_pct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                      {calculationResult.scenario_metrics.operating_margin_pct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold">
                      {calculationResult.deltas.operating_margin_pct.percentage_points_change !== null ? (
                        <span
                          className={
                            calculationResult.deltas.operating_margin_pct.percentage_points_change >= 0
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }
                        >
                          {calculationResult.deltas.operating_margin_pct.percentage_points_change >= 0 ? '+' : ''}
                          {calculationResult.deltas.operating_margin_pct.percentage_points_change.toFixed(1)} pp
                        </span>
                      ) : (
                        '0.0 pp'
                      )}
                    </td>
                  </tr>

                  {/* Monthly Loan Payment (EMI) */}
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800">Monthly Loan Payment (EMI)</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatCurrency(calculationResult.baseline_metrics.monthly_loan_emi)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(calculationResult.scenario_metrics.monthly_loan_emi)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {renderDeltaCell(calculationResult.deltas.monthly_loan_emi, false)}
                    </td>
                  </tr>

                  {/* Cash Remaining After Loan */}
                  <tr className="hover:bg-slate-50/50 transition bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      Cash Remaining After Loan (Net Operating Cash Flow)
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                      {formatCurrency(calculationResult.baseline_metrics.cash_remaining_after_loan)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-extrabold ${
                        calculationResult.scenario_metrics.cash_remaining_after_loan >= 0
                          ? 'text-[#0B1736]'
                          : 'text-rose-700'
                      }`}
                    >
                      {formatCurrency(calculationResult.scenario_metrics.cash_remaining_after_loan)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {renderDeltaCell(calculationResult.deltas.cash_remaining_after_loan, true)}
                    </td>
                  </tr>

                  {/* Break-Even Volume */}
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-4 text-slate-700 font-semibold">Break-Even Transactions (Units/mo)</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      {calculationResult.baseline_metrics.break_even_customers !== null
                        ? `${calculationResult.baseline_metrics.break_even_customers} tx`
                        : 'Unachievable'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                      {calculationResult.scenario_metrics.break_even_customers !== null
                        ? `${calculationResult.scenario_metrics.break_even_customers} tx`
                        : 'Unachievable'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {calculationResult.scenario_metrics.break_even_customers !== null &&
                      calculationResult.baseline_metrics.break_even_customers !== null ? (
                        <span
                          className={
                            calculationResult.deltas.break_even_customers.absolute_change <= 0
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }
                        >
                          {calculationResult.deltas.break_even_customers.absolute_change > 0 ? '+' : ''}
                          {calculationResult.deltas.break_even_customers.absolute_change} tx
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>

                  {/* Break-Even Revenue */}
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-4 text-slate-700 font-semibold">Break-Even Monthly Revenue</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      {calculationResult.baseline_metrics.break_even_revenue !== null
                        ? formatCurrency(calculationResult.baseline_metrics.break_even_revenue)
                        : 'Unachievable'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                      {calculationResult.scenario_metrics.break_even_revenue !== null
                        ? formatCurrency(calculationResult.scenario_metrics.break_even_revenue)
                        : 'Unachievable'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {calculationResult.scenario_metrics.break_even_revenue !== null &&
                      calculationResult.baseline_metrics.break_even_revenue !== null ? (
                        renderDeltaCell(calculationResult.deltas.break_even_revenue, false)
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        {/* 4. Visual Comparison Chart & Deterministic Scenario Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Visualization */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#159A68]" />
                <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wide">
                  Revenue vs Operating Costs vs Profit (₹)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Current vs Scenario Comparison</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px', borderColor: '#CBD5E1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Current" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Scenario" fill="#159A68" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Deterministic Scenario Impact Summary */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#159A68]" />
                <h3 className="text-xs font-bold text-[#0B1736] uppercase tracking-wide">
                  Scenario Financial Impact
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Formula-Derived Insights
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {calculationResult && calculationResult.observations.length > 0 ? (
                calculationResult.observations.map((obs, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-2.5 text-xs text-slate-700 leading-snug"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        obs.direction === 'positive'
                          ? 'bg-emerald-500'
                          : obs.direction === 'negative'
                          ? 'bg-rose-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900 capitalize mr-1">
                        [{obs.category.replace('_', ' ')}]:
                      </span>
                      <span>{obs.message}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Adjust scenario assumptions and click Apply Scenario to view deterministic impacts.
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 italic">
              * Observations are generated strictly from mathematical deltas without subjective ranking or evaluative scores.
            </div>
          </section>
        </div>

        {/* 5. Isolated Context & Evidence Panel */}
        <section className="bg-gradient-to-br from-slate-50 to-emerald-50/20 border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#159A68]" />
              <h2 className="text-sm font-bold text-[#0B1736] uppercase tracking-wide">
                Context & Evidence
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
              MoSPI HCES 2022-23 & PwC India 2025 Benchmarks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel A: MoSPI HCES 2022-23 State Benchmark */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B1736]">
                  Official Household Consumption Benchmark (HCES)
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  GOVERNMENT BENCHMARK
                </span>
              </div>

              {hcesData ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Rural Monthly Per Capita</span>
                    <div className="text-base font-extrabold text-[#0B1736] mt-0.5">
                      ₹{hcesData.rural_mpce.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500">{hcesData.state_name} Rural</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Urban Monthly Per Capita</span>
                    <div className="text-base font-extrabold text-[#159A68] mt-0.5">
                      ₹{hcesData.urban_mpce.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500">{hcesData.state_name} Urban</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border rounded-lg text-xs text-slate-500 text-center">
                  {loadingHces ? 'Fetching authoritative HCES benchmark...' : `No HCES data found for ${enterpriseMeta.state}.`}
                </div>
              )}

              <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                <div><span className="font-semibold text-slate-700">Source:</span> Government of India / MoSPI NSSO Fact Sheet</div>
                <div><span className="font-semibold text-slate-700">Survey Period:</span> 2022-23 (All-India coverage)</div>
                <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/60 mt-1">
                  * Official State Benchmark; district MPCE is not fabricated. Non-food expenditure reflects essential consumption basket categories, not discretionary surplus.
                </div>
              </div>
            </div>

            {/* Panel B: PwC Voice of the Consumer 2025 */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B1736]">
                  Consumer Market Survey (PwC Voice of the Consumer)
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  SURVEY EVIDENCE
                </span>
              </div>

              {researchContext?.consumer_market_evidence ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 bg-teal-50/40 p-2 rounded-lg border border-teal-100">
                    <div><span className="font-semibold text-slate-800">Geography:</span> {researchContext.consumer_market_evidence.geography} (National)</div>
                    <div><span className="font-semibold text-slate-800">Year:</span> {researchContext.consumer_market_evidence.survey_year}</div>
                    <div><span className="font-semibold text-slate-800">Sample:</span> {researchContext.consumer_market_evidence.sample_size.toLocaleString()} Adults</div>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
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
                  <div className="font-semibold text-slate-700">Domain Relevance Notice:</div>
                  <p>
                    PwC Voice of the Consumer (2025) empirical observations are exposed strictly for Food, Agriculture, Retail, and FMCG sectors.
                    Survey metrics are not forced into unrelated sectors ({enterpriseMeta.sector}).
                  </p>
                </div>
              )}

              <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                * National consumer sentiment benchmark; does not represent localized headcount or predict business success.
              </div>
            </div>
          </div>

          {/* Strict Isolation Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-white/90 p-3 rounded-xl border border-slate-200">
            <Info className="w-4 h-4 text-[#159A68] shrink-0" />
            <span>
              <strong>Contextual Evidence Only:</strong> These empirical benchmarks provide external market context.
              They are strictly isolated from the financial calculation engine and never alter revenue, costs, debt payments, or break-even results.
            </span>
          </div>
        </section>
      </main>
      </div>
    </div>
  );
}

/**
 * Helper to render delta cells with directional colors.
 * If isIncomeMetric is true, positive change is green (emerald), negative is red (rose).
 * If isIncomeMetric is false (cost), positive change is red (rose), negative is green (emerald).
 */
function renderDeltaCell(delta: any, isIncomeMetric: boolean) {
  if (!delta) return '—';
  const diff = delta.absolute_change;
  const pct = delta.percentage_change;

  if (diff === 0) {
    return <span className="text-slate-400">0.0 (0%)</span>;
  }

  const sign = diff > 0 ? '+' : '';
  const isPositive = isIncomeMetric ? diff > 0 : diff < 0;
  const colorClass = isPositive ? 'text-emerald-700' : 'text-rose-700';

  return (
    <span className={colorClass}>
      {sign}₹{Math.round(diff).toLocaleString()}{' '}
      {pct !== null && <span className="text-[10px] opacity-80">({sign}{pct.toFixed(1)}%)</span>}
    </span>
  );
}

export default function WhatIfSimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-[#F4F7FB] items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#159A68] animate-spin" />
        </div>
      }
    >
      <WhatIfSimulatorContent />
    </Suspense>
  );
}
