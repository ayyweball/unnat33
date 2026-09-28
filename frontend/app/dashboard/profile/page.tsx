'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Building2,
  BadgeIndianRupee,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Accessibility,
  UserCheck,
  Check,
  Sparkles,
} from 'lucide-react';

const INDIAN_STATES_AND_UTS = [
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

export default function ProfilePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { user, business, setProfile } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Active single-step profile dimension state (1 through 6)
  const [activeSection, setActiveSection] = useState<number>(1);
  const rightContentRef = useRef<HTMLDivElement>(null);

  const handleSelectDimension = (dimensionId: number) => {
    setActiveSection(dimensionId);
    if (rightContentRef.current) {
      const topOffset = rightContentRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }
  };

  // Form state spanning all 5 canonical profile dimensions
  const [form, setForm] = useState({
    // 1. Identity & Demographics
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    socialCategory: '',
    isDifferentlyAbled: false,
    isExServiceman: false,
    language: 'en',

    // 2. Location
    state: '',
    district: '',
    lgdDistrictCode: '',
    isRural: null as boolean | null,

    // 3. Special Beneficiary Status
    isTraditionalArtisan: false,
    isStreetVendor: false,
    isStartup: false,

    // 4. Enterprise Profile
    sector: '',
    businessType: '',
    activity: '',
    stage: '',
    isNewBusiness: null as boolean | null,

    // 5. Financial Profile
    projectCost: '',
    requestedFinancing: '',
    promoterContribution: '',
    annualIncome: '',
    annualTurnover: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    existingDebt: '',
    existingMonthlyEmi: '',
  });

  // Fetch saved canonical profile on mount
  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          router.push('/login?redirect=/dashboard/profile');
          return;
        }
        if (data.user) {
          setProfile(data.user, data.business || null);
          setForm({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            age: data.user.age != null ? data.user.age.toString() : '',
            gender: data.user.gender || '',
            socialCategory: data.user.socialCategory || '',
            isDifferentlyAbled: Boolean(data.user.isDifferentlyAbled),
            isExServiceman: Boolean(data.user.isExServiceman),
            language: data.user.language || 'en',

            state: data.user.state || '',
            district: data.user.district || '',
            lgdDistrictCode: data.user.lgdDistrictCode || '',
            isRural: data.user.isRural != null ? data.user.isRural : null,

            isTraditionalArtisan: Boolean(data.user.isTraditionalArtisan),
            isStreetVendor: Boolean(data.user.isStreetVendor),
            isStartup: Boolean(data.user.isStartup),

            sector: data.business?.sector || '',
            businessType: data.business?.type || '',
            activity: data.business?.activity || '',
            stage: data.business?.stage || '',
            isNewBusiness: data.business?.isNewBusiness != null ? data.business.isNewBusiness : null,

            projectCost:
              data.business?.projectCost != null
                ? data.business.projectCost.toString()
                : data.business?.estimatedCapital
                ? data.business.estimatedCapital.toString()
                : '',
            requestedFinancing:
              data.business?.requestedFinancing != null
                ? data.business.requestedFinancing.toString()
                : '',
            promoterContribution:
              data.business?.promoterContribution != null
                ? data.business.promoterContribution.toString()
                : '',
            annualIncome:
              data.business?.annualIncome != null
                ? data.business.annualIncome.toString()
                : '',
            annualTurnover:
              data.business?.annualTurnover != null
                ? data.business.annualTurnover.toString()
                : '',
            monthlyIncome:
              data.business?.monthlyIncome != null
                ? data.business.monthlyIncome.toString()
                : '',
            monthlyExpenses:
              data.business?.monthlyExpenses != null
                ? data.business.monthlyExpenses.toString()
                : '',
            existingDebt:
              data.business?.existingDebt != null
                ? data.business.existingDebt.toString()
                : '',
            existingMonthlyEmi:
              data.business?.existingMonthlyEmi != null
                ? data.business.existingMonthlyEmi.toString()
                : '',
          });
        }
      })
      .catch((err) => console.warn('Could not load profile:', err))
      .finally(() => setLoading(false));
  }, [setProfile, router]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMsg(null);

    // Basic frontend input integrity checks
    if (form.age && (parseInt(form.age) < 14 || parseInt(form.age) > 120)) {
      setMsg({ text: 'Age must be between 14 and 120 years.', isError: true });
      setSaving(false);
      return;
    }

    if (form.phone) {
      const cleanPhone = form.phone.trim().replace(/\D/g, '');
      if (!/^\d{10}$/.test(cleanPhone)) {
        setMsg({ text: 'Please enter a valid 10-digit mobile number.', isError: true });
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        name: form.name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || null,
        age: form.age ? parseInt(form.age) : null,
        language: form.language,
        state: form.state.trim() || undefined,
        district: form.district.trim() || undefined,
        lgdDistrictCode: form.lgdDistrictCode.trim() || null,
        isRural: form.isRural,
        gender: form.gender || null,
        socialCategory: form.socialCategory || null,
        isDifferentlyAbled: form.isDifferentlyAbled,
        isExServiceman: form.isExServiceman,
        isTraditionalArtisan: form.isTraditionalArtisan,
        isStreetVendor: form.isStreetVendor,
        isStartup: form.isStartup,

        // Enterprise attributes
        sector: form.sector || null,
        businessType: form.businessType.trim() || null,
        type: form.businessType.trim() || undefined,
        activity: form.activity.trim() || null,
        stage: form.stage || null,
        isNewBusiness: form.isNewBusiness,

        // Financial attributes (preserve null if empty string)
        projectCost: form.projectCost !== '' ? parseFloat(form.projectCost) : null,
        requestedFinancing: form.requestedFinancing !== '' ? parseFloat(form.requestedFinancing) : null,
        promoterContribution: form.promoterContribution !== '' ? parseFloat(form.promoterContribution) : null,
        annualIncome: form.annualIncome !== '' ? parseFloat(form.annualIncome) : null,
        annualTurnover: form.annualTurnover !== '' ? parseFloat(form.annualTurnover) : null,
        monthlyIncome: form.monthlyIncome !== '' ? parseFloat(form.monthlyIncome) : null,
        monthlyExpenses: form.monthlyExpenses !== '' ? parseFloat(form.monthlyExpenses) : null,
        existingDebt: form.existingDebt !== '' ? parseFloat(form.existingDebt) : null,
        existingMonthlyEmi: form.existingMonthlyEmi !== '' ? parseFloat(form.existingMonthlyEmi) : null,
      };

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setProfile(data.user, data.business);
      if (data.user.language) setLanguage(data.user.language as any);
      setMsg({
        text: 'Authoritative profile updated successfully! All engines will use these saved parameters.',
        isError: false,
      });
    } catch (err: any) {
      setMsg({ text: `Error: ${err.message}`, isError: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-[#159A68] animate-spin" />
        </div>
      </div>
    );
  }

  const keyFields = [
    Boolean(form.name),
    Boolean(form.phone),
    Boolean(form.age),
    Boolean(form.gender),
    Boolean(form.socialCategory),
    Boolean(form.state),
    Boolean(form.district),
    form.isRural !== null,
    Boolean(form.sector),
    Boolean(form.businessType),
    Boolean(form.stage),
    Boolean(form.projectCost),
    Boolean(form.requestedFinancing),
  ];
  const completionPercent = Math.round((keyFields.filter(Boolean).length / keyFields.length) * 100);

  // Stepper definition synchronized with progressive disclosure
  const SECTIONS = [
    { id: 1, title: 'Identity & Demographics', short: 'Identity & Demographics' },
    { id: 2, title: 'Geographic Location', short: 'Geographic Location' },
    { id: 3, title: 'Statutory Beneficiary Classifications', short: 'Statutory Classification' },
    { id: 4, title: 'Enterprise & Business Profile', short: 'Enterprise & Business' },
    { id: 5, title: 'Financial & Capital Structuring Parameters', short: 'Financial & Capital' },
    { id: 6, title: 'Additional Details & Verification', short: 'Additional Details' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#0B1736] flex flex-col font-sans selection:bg-[#159A68] selection:text-white">
      <Navbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1550px] w-full min-w-0 space-y-6 sm:space-y-7">
          {/* Breadcrumb Navigation (Exact Reference Match) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#159A68] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0B1736] font-semibold">Business Profile</span>
          </div>

          {/* ========================================================================= */}
          {/* 1. HERO BANNER WITH INDIAN HERITAGE ARTWORK (Exact Reference Visuals)      */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs relative overflow-hidden">
            {/* Business Profile Hero Visual Area */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden rounded-r-2xl sm:rounded-r-3xl z-0 opacity-25 sm:opacity-100 transition-opacity">
              <img
                src="/profile-sewing.jpg"
                alt="Indian woman entrepreneur with sewing machine in rural setting"
                className="w-full h-full object-cover object-[38%_55%]"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%)',
                }}
              />
            </div>

            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="text-[11px] font-bold text-[#159A68] uppercase tracking-widest block">
                BUSINESS PROFILE
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B1736] tracking-tight font-serif">
                Tell us about your enterprise
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
                Help us understand your business better to provide accurate market analysis, scheme recommendations and financial guidance.
              </p>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. READINESS & LANGUAGE BAR (Matching Reference Strip)                     */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Profile Readiness */}
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0B1736]">Profile Readiness</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7F0] text-[#159A68] border border-[#159A68]/20 text-[11px] font-bold">
                    {completionPercent}%
                  </span>
                </div>
                <div className="w-36 sm:w-44 bg-slate-100 rounded-full h-2 overflow-hidden mt-1.5">
                  <div
                    className="bg-[#159A68] h-full rounded-full transition-all duration-300"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Center: Authoritative Precision */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#0B1736]">Authoritative &amp; High Match Precision</div>
                <div className="text-[11px] text-slate-500">
                  {completionPercent >= 80
                    ? 'Your profile is complete and ready for analysis across all modules.'
                    : 'Complete remaining fields for maximum statutory match accuracy.'}
                </div>
              </div>
            </div>

            {/* Right: Language Selector Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Language:</span>
              <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, language: 'en' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    form.language === 'en'
                      ? 'bg-[#159A68] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0B1736]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, language: 'hi' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    form.language === 'hi'
                      ? 'bg-[#159A68] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0B1736]'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          </section>

          {/* Alert Message Banner */}
          {msg && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs ${
                msg.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-[#EAF7F0] text-[#159A68] border border-[#159A68]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {msg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{msg.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setMsg(null)}
                className="text-slate-400 hover:text-slate-600 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. TWO-COLUMN LAYOUT: LEFT STEP NAVIGATOR + RIGHT PROGRESSIVE DISCLOSURE  */}
          {/* ========================================================================= */}
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* --------------------------------------------------------------------- */}
            {/* LEFT COLUMN: Section Navigator Stepper (1 to 6)                       */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs lg:sticky lg:top-24 space-y-2">
              <div className="px-2 pt-1 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  PROFILE DIMENSIONS
                </span>
              </div>

              <nav className="space-y-1">
                {SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => handleSelectDimension(sec.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-[#EAF7F0] text-[#159A68] font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-[#0B1736] hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isActive
                            ? 'bg-[#159A68] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {sec.id}
                      </div>
                      <span className="text-xs truncate">{sec.short}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 mt-3 border-t border-slate-100 space-y-3">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="w-full py-3 px-4 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Canonical Profile</span>
                </button>

                <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-[#159A68] shrink-0" />
                  <span>Statutory parameters are stored securely and encrypted for all ministerial matching engines.</span>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: Active Single-Step Profile Dimension                    */}
            {/* --------------------------------------------------------------------- */}
            <div ref={rightContentRef} className="lg:col-span-8 space-y-4">

              {/* =================================================================== */}
              {/* SECTION 1: Identity & Demographics                                  */}
              {/* =================================================================== */}
              {activeSection === 1 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#0B1736]">1. Identity &amp; Demographics</h2>
                        <p className="text-[11px] text-slate-500">Applicant credentials and personal demographic criteria.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-3.5 py-1.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save</span>
                      </button>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-amber-200/80 text-[11px] font-semibold">
                        Required
                      </span>
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="Enter full legal name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Mobile Phone (Registered)</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                          placeholder="Optional email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Applicant Age (Years)</label>
                      <input
                        type="number"
                        min={14}
                        max={120}
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 28"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] bg-white transition-all"
                      >
                        <option value="">-- Select Gender --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Transgender / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Social Category</label>
                      <select
                        value={form.socialCategory}
                        onChange={(e) => setForm({ ...form, socialCategory: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] bg-white transition-all"
                      >
                        <option value="">-- Select Social Category --</option>
                        <option value="General">General</option>
                        <option value="OBC">OBC (Other Backward Class)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="Minority">Minority Community</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Demographic Flags - Rich Cards Matching Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        form.isDifferentlyAbled
                          ? 'border-[#159A68] bg-[#EAF7F0] shadow-xs ring-1 ring-[#159A68]/30'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.isDifferentlyAbled}
                        onChange={(e) => setForm({ ...form, isDifferentlyAbled: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          form.isDifferentlyAbled
                            ? 'bg-[#159A68] border-[#159A68] text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#159A68] flex items-center justify-center shrink-0">
                        <Accessibility className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${form.isDifferentlyAbled ? 'text-[#0B1736]' : 'text-slate-800'}`}>
                          Differently Abled (PwD)
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                          Qualifies for specialized concessionary subsidies and statutory quotas
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        form.isExServiceman
                          ? 'border-[#159A68] bg-[#EAF7F0] shadow-xs ring-1 ring-[#159A68]/30'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.isExServiceman}
                        onChange={(e) => setForm({ ...form, isExServiceman: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          form.isExServiceman
                            ? 'bg-[#159A68] border-[#159A68] text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${form.isExServiceman ? 'text-[#0B1736]' : 'text-slate-800'}`}>
                          Ex-Serviceman
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                          Qualifies for defense rehabilitation credit schemes and reserved allocations
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Section Stepper Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div />
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(2)}
                      className="px-5 py-2.5 rounded-xl bg-[#0B1736] hover:bg-[#159A68] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Continue to Location</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* SECTION 2: Geographic Location                                      */}
              {/* =================================================================== */}
              {activeSection === 2 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#0B1736]">2. Geographic Location</h2>
                        <p className="text-[11px] text-slate-500">Jurisdictional boundaries for state and district scheme matching.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-3.5 py-1.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save</span>
                      </button>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-amber-200/80 text-[11px] font-semibold">
                        Required
                      </span>
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">State / Union Territory</label>
                      <select
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] bg-white transition-all"
                      >
                        <option value="">-- Select State / UT --</option>
                        {INDIAN_STATES_AND_UTS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">District Name</label>
                      <input
                        type="text"
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="Enter district (e.g. Pune, Varanasi)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Jurisdiction Area</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, isRural: form.isRural === true ? null : true })}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                            form.isRural === true
                              ? 'bg-[#159A68] text-white border-[#159A68] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Rural
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, isRural: form.isRural === false ? null : false })}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                            form.isRural === false
                              ? 'bg-[#159A68] text-white border-[#159A68] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Urban
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">LGD District Code (Optional)</label>
                      <input
                        type="text"
                        value={form.lgdDistrictCode}
                        onChange={(e) => setForm({ ...form, lgdDistrictCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 194"
                      />
                    </div>
                  </div>

                  {/* Section Stepper Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(3)}
                      className="px-5 py-2.5 rounded-xl bg-[#0B1736] hover:bg-[#159A68] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Continue to Classifications</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* SECTION 3: Statutory Beneficiary Classifications                    */}
              {/* =================================================================== */}
              {activeSection === 3 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#0B1736]">3. Statutory Beneficiary Classifications</h2>
                        <p className="text-[11px] text-slate-500">Statutory hard-gate qualifications for specialized central schemes.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-3.5 py-1.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save</span>
                      </button>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-amber-200/80 text-[11px] font-semibold">
                        Required
                      </span>
                    </div>
                  </div>

                  {/* Beneficiary Toggle Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        form.isTraditionalArtisan
                          ? 'border-[#159A68] bg-[#EAF7F0] shadow-xs ring-1 ring-[#159A68]/30'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.isTraditionalArtisan}
                        onChange={(e) => setForm({ ...form, isTraditionalArtisan: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          form.isTraditionalArtisan
                            ? 'bg-[#159A68] border-[#159A68] text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${form.isTraditionalArtisan ? 'text-[#0B1736]' : 'text-slate-800'}`}>
                          Traditional Artisan / Craftsperson
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                          Carpenter, blacksmith, potter, weaver, tailor, etc. (PM Vishwakarma statutory gate)
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        form.isStreetVendor
                          ? 'border-[#159A68] bg-[#EAF7F0] shadow-xs ring-1 ring-[#159A68]/30'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.isStreetVendor}
                        onChange={(e) => setForm({ ...form, isStreetVendor: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          form.isStreetVendor
                            ? 'bg-[#159A68] border-[#159A68] text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${form.isStreetVendor ? 'text-[#0B1736]' : 'text-slate-800'}`}>
                          Street Vendor / Informal Merchant
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                          Engaged in vending goods, food, or petty services (PM SVANidhi statutory gate)
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        form.isStartup
                          ? 'border-[#159A68] bg-[#EAF7F0] shadow-xs ring-1 ring-[#159A68]/30'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.isStartup}
                        onChange={(e) => setForm({ ...form, isStartup: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          form.isStartup
                            ? 'bg-[#159A68] border-[#159A68] text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${form.isStartup ? 'text-[#0B1736]' : 'text-slate-800'}`}>
                          Recognized Tech / Innovation Startup
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                          DPIIT recognized entity exploring venture capital and seed credit guarantees
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Section Stepper Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(2)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(4)}
                      className="px-5 py-2.5 rounded-xl bg-[#0B1736] hover:bg-[#159A68] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Continue to Enterprise Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* SECTION 4: Enterprise & Business Profile                            */}
              {/* =================================================================== */}
              {activeSection === 4 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#0B1736]">4. Enterprise &amp; Business Profile</h2>
                        <p className="text-[11px] text-slate-500">Commercial operational classification, sector, and venture stage.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-3.5 py-1.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save</span>
                      </button>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-amber-200/80 text-[11px] font-semibold">
                        Required
                      </span>
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Primary Sector</label>
                      <select
                        value={form.sector}
                        onChange={(e) => setForm({ ...form, sector: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] bg-white transition-all"
                      >
                        <option value="">-- Select Canonical Sector --</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Services">Services</option>
                        <option value="Trading">Trading</option>
                        <option value="Agriculture">Agriculture &amp; Allied</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Business Trade / Title</label>
                      <input
                        type="text"
                        value={form.businessType}
                        onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. Dairy Farming, Agro-Processing"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Specific Operational Activity</label>
                      <input
                        type="text"
                        value={form.activity}
                        onChange={(e) => setForm({ ...form, activity: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. Milk Chilling & Pasteurization"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Business Stage</label>
                      <select
                        value={form.stage}
                        onChange={(e) => setForm({ ...form, stage: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] bg-white transition-all"
                      >
                        <option value="">-- Select Stage --</option>
                        <option value="Idea / Pre-Venture">Idea / Pre-Venture</option>
                        <option value="Early Stage">Early Stage</option>
                        <option value="Operational">Operational / Established</option>
                        <option value="Expansion">Expansion / Scaling</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">
                        Enterprise Greenfield / Expansion Status
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, isNewBusiness: form.isNewBusiness === true ? null : true })}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border text-left transition-colors ${
                            form.isNewBusiness === true
                              ? 'bg-[#159A68] text-white border-[#159A68] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          New Business (Greenfield Venture)
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, isNewBusiness: form.isNewBusiness === false ? null : false })}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border text-left transition-colors ${
                            form.isNewBusiness === false
                              ? 'bg-[#159A68] text-white border-[#159A68] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Existing Enterprise (Expansion / Modernization)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section Stepper Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(3)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(5)}
                      className="px-5 py-2.5 rounded-xl bg-[#0B1736] hover:bg-[#159A68] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Continue to Financial Parameters</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* SECTION 5: Financial & Capital Structuring Parameters              */}
              {/* =================================================================== */}
              {activeSection === 5 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                        <BadgeIndianRupee className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#0B1736]">5. Financial &amp; Capital Structuring Parameters</h2>
                        <p className="text-[11px] text-slate-500">Total project capital outlay, debt requirements, and repayment capacity.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-3.5 py-1.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save</span>
                      </button>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-amber-200/80 text-[11px] font-semibold">
                        Required
                      </span>
                    </div>
                  </div>

                  {/* Financial Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Estimated Total Project Cost (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={form.projectCost}
                        onChange={(e) => setForm({ ...form, projectCost: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 1000000"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Total capex + initial opex needed</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Requested Loan / Financing (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={form.requestedFinancing}
                        onChange={(e) => setForm({ ...form, requestedFinancing: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 750000"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Desired bank loan or credit facility</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Promoter Own Contribution (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={form.promoterContribution}
                        onChange={(e) => setForm({ ...form, promoterContribution: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 250000"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Personal savings or equity available</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Annual Business Turnover (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={form.annualTurnover}
                        onChange={(e) => setForm({ ...form, annualTurnover: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 1500000"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Projected or existing yearly sales</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Monthly Personal / Business Surplus (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step="500"
                        value={form.monthlyIncome}
                        onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 45000"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Required for Debt-to-Income (DTI) assessment</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Monthly Operational Overhead (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step="500"
                        value={form.monthlyExpenses}
                        onChange={(e) => setForm({ ...form, monthlyExpenses: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 15000"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Monthly household or recurring fixed costs</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Current Monthly Existing EMI (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step="100"
                        value={form.existingMonthlyEmi}
                        onChange={(e) => setForm({ ...form, existingMonthlyEmi: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 3500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Current loan repayments across all banks</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Existing Outstanding Debt (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={form.existingDebt}
                        onChange={(e) => setForm({ ...form, existingDebt: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 50000"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Total remaining loan balance</span>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#0B1736] mb-1.5">Annual Household Income (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={form.annualIncome}
                        onChange={(e) => setForm({ ...form, annualIncome: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all bg-white"
                        placeholder="e.g. 360000"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Combined annual earnings from all household sources</span>
                    </div>
                  </div>

                  {/* Section Stepper Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(4)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectDimension(6)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Review &amp; Verify</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="py-2.5 px-6 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Save Canonical Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* SECTION 6: Additional Details & Statutory Verification              */}
              {/* =================================================================== */}
              {activeSection === 6 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#159A68] flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#0B1736]">6. Additional Details &amp; Verification</h2>
                        <p className="text-[11px] text-slate-500">Statutory review, verification readiness, and canonical persistence.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-3.5 py-1.5 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save</span>
                      </button>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7F0] text-[#159A68] border border-[#159A68]/20 text-[11px] font-bold">
                        Ready
                      </span>
                    </div>
                  </div>

                  {/* Summary Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">APPLICANT</span>
                      <div className="text-xs font-bold text-[#0B1736] truncate">{form.name || 'Not set'}</div>
                      <div className="text-[11px] text-slate-500">{form.gender || 'Gender unselected'} • Age {form.age || '—'}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LOCATION</span>
                      <div className="text-xs font-bold text-[#0B1736] truncate">{form.district ? `${form.district}, ${form.state}` : 'Not set'}</div>
                      <div className="text-[11px] text-slate-500">{form.isRural === true ? 'Rural Jurisdiction' : form.isRural === false ? 'Urban Jurisdiction' : 'Area unselected'}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ENTERPRISE SECTOR</span>
                      <div className="text-xs font-bold text-[#0B1736] truncate">{form.sector || 'Sector unselected'}</div>
                      <div className="text-[11px] text-slate-500">{form.businessType || 'Trade unassigned'}</div>
                    </div>
                  </div>

                  {/* Statutory Declaration Reassurance Card */}
                  <div className="p-4 rounded-xl bg-[#FFF9EE] border border-amber-200/80 text-amber-950 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#F4A340]" />
                      <span className="text-xs font-bold text-[#0B1736]">Statutory Verification Declaration</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      By saving, you certify that these attributes accurately represent your applicant credentials and enterprise structure.
                      UnnatE synchronizes these parameters across the Scheme Matching Engine, Bank DPR Financial Structuring Engine, and Regional Market Intelligence maps.
                    </p>
                  </div>

                  {/* Section Stepper Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(5)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Financials</span>
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="py-3 px-8 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save Canonical Profile</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
