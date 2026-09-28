'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import {
  Landmark,
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Award,
  BadgeIndianRupee,
  ArrowRight,
  HelpCircle,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function SchemesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, business, setProfile } = useAppStore();

  const [schemes, setSchemes] = useState<any[]>([]);
  const [eligibilitySummary, setEligibilitySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedScheme, setExpandedScheme] = useState<string | number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Local filter overrides initialized from saved profile
  const [activeDistrict, setActiveDistrict] = useState('');
  const [activeState, setActiveState] = useState('');
  const [financingTarget, setFinancingTarget] = useState<number>(500000);
  const [filterWomen, setFilterWomen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All Schemes');

  // Load canonical profile on mount
  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          router.push('/login?redirect=/advisory/schemes');
          return;
        }
        if (data.user) {
          setProfile(data.user, data.business || null);
          setActiveState(data.user.state || '');
          setActiveDistrict(data.user.district || '');
          setFilterWomen(data.user.gender === 'Female');
          const defaultTarget = data.business?.requestedFinancing || data.business?.projectCost || data.business?.estimatedCapital || 500000;
          setFinancingTarget(defaultTarget);
          fetchSchemes({
            state: data.user.state,
            district: data.user.district,
            gender: data.user.gender,
            social_category: data.user.socialCategory,
            is_rural: data.user.isRural,
            is_new_business: data.business?.isNewBusiness,
            is_traditional_artisan: data.user.isTraditionalArtisan,
            is_street_vendor: data.user.isStreetVendor,
            sector: data.business?.sector,
            project_cost: data.business?.projectCost || data.business?.estimatedCapital,
            requested_loan_amount: defaultTarget,
          });
        }
      })
      .catch((err) => {
        console.warn('Could not load user profile:', err);
        fetchSchemes({});
      });
  }, [setProfile, router]);

  const fetchSchemes = async (overrideParams: any = {}) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const targetNeed = overrideParams.target_financing_need 
        ?? overrideParams.requested_loan_amount 
        ?? financingTarget;

      const res = await fetch('/api/advisory/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_financing_need: targetNeed,
          requested_loan_amount: targetNeed,
          ...overrideParams,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }
      if (data.schemes) setSchemes(data.schemes);
      if (data.eligibilitySummary) setEligibilitySummary(data.eligibilitySummary);
      if (data.userLocation) {
        if (data.userLocation.state && !activeState) setActiveState(data.userLocation.state);
        if (data.userLocation.district && !activeDistrict) setActiveDistrict(data.userLocation.district);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Could not load authoritative recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchSchemes({
      state: activeState || user?.state || undefined,
      district: activeDistrict || user?.district || undefined,
      gender: filterWomen ? 'Female' : (user?.gender || undefined),
      social_category: user?.socialCategory || undefined,
      is_rural: user?.isRural,
      sector: business?.sector || undefined,
      project_cost: business?.projectCost || business?.estimatedCapital || financingTarget,
      is_new_business: business?.isNewBusiness,
      is_traditional_artisan: user?.isTraditionalArtisan,
      is_street_vendor: user?.isStreetVendor,
      requested_loan_amount: financingTarget,
      target_financing_need: financingTarget,
    });
  };

  const filteredSchemes = schemes.filter((item) => {
    if (categoryFilter === 'All Schemes') return true;
    const s = item.scheme;
    const type = (s?.primaryType || s?.primary_type || '').toUpperCase();
    const name = (s?.name || '').toUpperCase();
    const desc = (s?.description || '').toUpperCase();

    switch (categoryFilter) {
      case 'Subsidy':
        return type.includes('SUBSIDY') || name.includes('SUBSIDY') || desc.includes('SUBSIDY');
      case 'Loan':
        return type.includes('CREDIT') || type.includes('LOAN') || name.includes('LOAN') || desc.includes('LOAN');
      case 'Skill Development':
        return type.includes('TRAINING') || type.includes('SKILL') || type.includes('ENTREPRENEURSHIP') || type.includes('ARTISAN') || name.includes('SKILL') || desc.includes('SKILL');
      case 'Infrastructure':
        return type.includes('INFRASTRUCTURE') || type.includes('CLUSTER') || name.includes('INFRASTRUCTURE') || desc.includes('INFRASTRUCTURE');
      case 'Export':
        return type.includes('EXPORT') || type.includes('INTERNATIONALIZATION') || name.includes('EXPORT') || desc.includes('EXPORT');
      case 'State Schemes':
        return (s?.state && s.state !== 'All India') || name.includes('STATE') || desc.includes('STATE');
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col">
      <Navbar />

      <div className="flex-1 flex w-full min-w-0">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1550px] w-full min-w-0 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#159A68] transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-[#0B1736] font-semibold">Government Schemes</span>
          </div>

          {/* ========================================================================= */}
          {/* 1. HERO BANNER WITH INDIAN PUBLIC GOVERNANCE ARTWORK (Direct Screen 5)     */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs relative overflow-hidden">
            {/* National Governance Architecture Art Fading on the Left */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden rounded-r-2xl sm:rounded-r-3xl z-0">
              <img
                src="/parliament-schemes.jpg"
                alt="Indian Parliament building with the Indian flag"
                className="w-full h-full object-cover object-[center_20%] schemes-hero-mask"
              />
              <style dangerouslySetInnerHTML={{ __html: `
                .schemes-hero-mask {
                  -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                  mask-image: linear-gradient(to right, transparent 0%, transparent 68%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%);
                }
                @media (min-width: 640px) {
                  .schemes-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, transparent 26%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%);
                  }
                }
                @media (min-width: 1024px) {
                  .schemes-hero-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                  }
                }
              `}} />
            </div>

            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest block">
                GOVERNMENT SCHEMES
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B1736] tracking-tight font-serif">
                Discover relevant schemes
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
                Find government schemes, subsidies and incentives for your business across central and state programmes.
              </p>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 1B. CATEGORY FILTER TABS (Direct Reference Match - Screen 5)               */}
          {/* ========================================================================= */}
          <section className="w-full min-w-0 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['All Schemes', 'Subsidy', 'Loan', 'Skill Development', 'Infrastructure', 'Export', 'State Schemes'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#159A68] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-[#0B1736] border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </section>

          {/* Statutory Eligibility Assessment Gate Banner */}
          {eligibilitySummary && (
            <div className="bg-[#0B1736] text-white p-5 rounded-2xl shadow-xs border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#34D399] uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Deterministic Statutory Hard Gate</span>
                </div>
                <h2 className="text-base font-bold mt-0.5">
                  {eligibilitySummary.totalEvaluated} Central Government Programmes Evaluated
                </h2>
                <p className="text-[11px] text-slate-300">
                  Rules verified against applicant demographics, location jurisdiction, and enterprise parameters.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 rounded-xl bg-[#159A68]/20 border border-[#159A68]/40 text-center">
                  <span className="block text-lg font-bold text-[#34D399]">{eligibilitySummary.totalEligible}</span>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase">Eligible</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-center">
                  <span className="block text-lg font-bold text-[#FBBF24]">{eligibilitySummary.totalPartiallyVerified}</span>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase">Partially Verified</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-center">
                  <span className="block text-lg font-bold text-red-400">{eligibilitySummary.totalIneligible}</span>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase">Ineligible</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Target Financing Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs font-semibold text-[#0B1736] mb-1">
                <span>Financing / Loan Needed</span>
                <span className="text-[#159A68] font-bold">₹{financingTarget.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={20000}
                max={20000000}
                step={25000}
                value={financingTarget}
                onChange={(e) => setFinancingTarget(parseInt(e.target.value))}
                className="w-full accent-[#159A68] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1736] bg-[#F8FAFC] px-3 py-2.5 rounded-xl border border-[#DCE3EA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterWomen}
                  onChange={(e) => setFilterWomen(e.target.checked)}
                  className="accent-[#159A68]"
                />
                <span>Women Quota</span>
              </label>

              <button
                onClick={handleApplyFilter}
                className="px-5 py-2.5 rounded-xl bg-[#159A68] text-white font-semibold text-xs hover:bg-[#128357] transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Apply Filter
              </button>
            </div>
          </div>

          {/* Scheme Cards State Handling */}
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-[#159A68] bg-[#EAF7F0] rounded-xl border border-[#159A68]/20">
                <Loader2 className="w-4 h-4 text-[#159A68] animate-spin" />
                <span>Evaluating Statutory Rules & Scoring Recommendations...</span>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-5 w-64 bg-slate-200 rounded-lg" />
                      <div className="h-3 w-40 bg-slate-100 rounded-md" />
                    </div>
                    <div className="h-8 w-24 bg-slate-200 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : errorMsg ? (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-8 text-center max-w-2xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#0B1736]">
                  We couldn't load your scheme recommendations right now
                </h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                  The recommendation service encountered an issue while retrieving matches. Please check your connection and try again.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleApplyFilter()}
                  className="px-5 py-2.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-semibold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Recommendations</span>
                </button>
                <Link
                  href="/dashboard/profile"
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0B1736] hover:bg-[#F8FAFC] font-semibold text-xs transition"
                >
                  Review Profile Settings
                </Link>
              </div>
            </div>
          ) : schemes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0] p-8">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#0B1736]">No matching programmes found</h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
                No government programmes matched the current profile attributes. Try updating your profile or adjusting financing requirements.
              </p>
              <Link href="/dashboard/profile" className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#159A68] text-white font-semibold text-xs">
                Review Profile
              </Link>
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0] p-8 space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-1" />
              <h3 className="text-base font-bold text-[#0B1736]">No programmes found under &ldquo;{categoryFilter}&rdquo;</h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                None of the {schemes.length} evaluated schemes match this specific category filter.
              </p>
              <button
                type="button"
                onClick={() => setCategoryFilter('All Schemes')}
                className="mt-2 inline-block px-4 py-2 rounded-xl bg-[#159A68] text-white font-semibold text-xs hover:bg-[#128357] transition-colors cursor-pointer"
              >
                Show All {schemes.length} Programmes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchemes.map((item, idx) => {
                const s = item.scheme;
                const isExpanded = expandedScheme === (s.id || idx);
                const fitScore = Math.round(item.recommendationScore ?? item.approvalProbability ?? 80);
                const fitCategory = (item.fitCategory || 'STRONG_FIT').replace(/_/g, ' ');

                return (
                  <div key={idx} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-4 hover:border-[#CBD5E1] transition-all">
                    
                    {/* Top Row: Name, Ministry, Fit Category & Recommendation Score */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-[#0B1736]">{s.name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7F0] text-[#159A68] border border-[#159A68]/20 text-[11px] font-bold flex items-center gap-1">
                            <Award className="w-3 h-3 text-[#159A68]" />
                            {fitCategory}: {fitScore}/100
                          </span>
                          {item.eligibilityStatus && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.eligibilityStatus === 'Eligible' 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {item.eligibilityStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">{s.ministry}</p>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="text-xs text-[#94A3B8] font-medium">Target Amount</div>
                        <div className="text-base font-bold text-[#0B1736]">
                          {item.recommendedAmount ? `₹${item.recommendedAmount.toLocaleString('en-IN')}` : 'Scheme Defined'}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#475569] leading-relaxed">{s.description}</p>

                    {/* Quick Facts Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs">
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">Assistance Type</span>
                        <strong className="text-[#0B1736] font-semibold">{s.primaryType || 'Statutory Assistance'}</strong>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">Actionability</span>
                        <strong className="text-[#0B1736] font-semibold">{s.actionabilityType || 'Direct Benefit'}</strong>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">Programme Code</span>
                        <strong className="text-[#0B1736] font-mono text-[11px]">{s.code || 'CENTRAL'}</strong>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">Statutory Status</span>
                        <strong className="text-[#0B1736] font-semibold capitalize">{item.eligibilityStatus || 'Eligible'}</strong>
                      </div>
                    </div>

                    {/* Statutory Reasons Satisfied */}
                    {item.statutoryReasons && item.statutoryReasons.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-[#0B1736] mb-1.5 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-[#159A68]" />
                          <span>Statutory Rules Satisfied by Your Profile:</span>
                        </h4>
                        <ul className="space-y-1 text-xs text-[#475569] pl-5 list-disc">
                          {item.statutoryReasons.map((reason: string, ri: number) => (
                            <li key={ri}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Unverified Statutory Criteria */}
                    {item.unverifiedCriteria && item.unverifiedCriteria.length > 0 && (
                      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900">
                        <div className="font-semibold flex items-center gap-1.5 mb-1 text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Criteria Requiring External Verification / Documentation:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {item.unverifiedCriteria.map((crit: string, ci: number) => (
                            <li key={ci}>{crit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Disqualifying Reasons */}
                    {item.disqualifyingReasons && item.disqualifyingReasons.length > 0 && (
                      <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 text-xs text-red-900">
                        <div className="font-semibold flex items-center gap-1.5 mb-1 text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>Disqualifying Criteria:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {item.disqualifyingReasons.map((disq: string, di: number) => (
                            <li key={di}>{disq}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Collapsible Local Insights */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-[#F1F5F9] space-y-3">
                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                          <h5 className="text-xs font-semibold text-[#0B1736] mb-1">Local Operational Insights ({activeDistrict || 'District'})</h5>
                          <p className="text-xs text-[#475569]">{item.hyperLocalInsight}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Bar - Preserved exact buttons only */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => setExpandedScheme(isExpanded ? null : (s.id || idx))}
                        className="text-xs font-semibold text-[#64748B] hover:text-[#0B1736] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {isExpanded ? <>Hide Details <ChevronUp className="w-4 h-4" /></> : <>View Operational Insights <ChevronDown className="w-4 h-4" /></>}
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/advisory/financial?programId=${encodeURIComponent(s.id)}&programCode=${encodeURIComponent(s.code || '')}&loanNeeded=${encodeURIComponent(financingTarget)}`}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B1736] hover:bg-[#152347] text-white text-xs font-semibold transition shadow-xs"
                        >
                          <BadgeIndianRupee className="w-3.5 h-3.5 text-[#F4A340]" />
                          <span>Structure Financing</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        {s.officialPortalUrl && (
                          <a
                            href={s.officialPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1736] text-xs font-semibold transition-colors"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3 h-3 text-[#64748B]" />
                          </a>
                        )}
                        <Link
                          href="/chat"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] text-xs font-semibold transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#159A68]" />
                          <span>Ask AI Advisor</span>
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}


