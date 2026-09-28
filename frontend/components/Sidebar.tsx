'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  BarChart3,
  Landmark,
  BadgeIndianRupee,
  FileSpreadsheet,
  FileText,
  Bot,
  ArrowRight,
  Lightbulb,
  Sliders,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const {
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useAppStore();

  const sidebarRef = useRef<HTMLElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hover expansion handlers with debounce to prevent accidental triggering/flickering
  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setSidebarCollapsed(false);
    }, 140); // 140ms intentional hover delay
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 240); // 240ms grace period prevents flickering
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // Restore persisted collapse state on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('unnate_sidebar_collapsed');
      if (stored !== null) {
        setSidebarCollapsed(stored === 'true');
      }
    } catch (e) {
      // Ignore localStorage read errors in SSR/sandboxed mode
    }
  }, [setSidebarCollapsed]);

  // Desktop: Click outside expanded sidebar collapses it back to rail
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        !sidebarCollapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setSidebarCollapsed(true);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  const menuItems = [
    { id: 'dashboard', href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'profile', href: '/dashboard/profile', label: t('nav.businessProfile'), icon: Building2 },
    { id: 'simulator', href: '/simulator', label: 'What-If Simulator', icon: Sliders },
    { id: 'market', href: '/dashboard/market-analysis', label: t('nav.marketAnalysis'), icon: BarChart3 },
    { id: 'schemes', href: '/advisory/schemes', label: t('nav.governmentSchemes'), icon: Landmark },
    { id: 'financial', href: '/advisory/financial', label: t('nav.financialOptions'), icon: BadgeIndianRupee },
    { id: 'dpr', href: '/advisory/business-plan', label: t('nav.dprBuilder'), icon: FileSpreadsheet },
    { id: 'reports', href: '/reports', label: t('nav.insightsReports'), icon: FileText },
    { id: 'chat', href: '/chat', label: t('nav.aiAdvisor'), icon: Bot },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP COLLAPSIBLE SIDEBAR RAIL & EXPANDED PANEL                      */}
      {/* ========================================================================= */}
      <aside
        ref={sidebarRef}
        aria-label="Global Sidebar Navigation"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] flex flex-col justify-between hidden md:flex shrink-0 select-none relative z-30 transition-[width] duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-[70px]' : 'w-[275px]'
        }`}
      >
        {/* --- Top Section: Header & Menu Toggle --- */}
        <div>
          {sidebarCollapsed ? (
            /* Collapsed Top: Centered Hamburger Button */
            <div className="py-3.5 px-3 flex items-center justify-center border-b border-slate-100">
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-[#0B1736] hover:bg-slate-100 transition-colors cursor-pointer"
                title="Expand Navigation (☰)"
                aria-label="Expand Sidebar"
              >
                <Menu className="w-5 h-5 text-[#0B1736]" />
              </button>
            </div>
          ) : (
            /* Expanded Top: Brand Logo + SIH Badge + Close (✕) Button */
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="UnnatE"
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Collapse Navigation (✕)"
                aria-label="Collapse Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* --- Navigation List --- */}
          <div className="mt-2">
            {!sidebarCollapsed && (
              <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                MAIN MENU
              </div>
            )}

            <nav
              className={`space-y-1.5 ${sidebarCollapsed ? 'px-2 py-2' : 'px-3 py-1'}`}
              aria-label="Sidebar Menu"
            >
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.id === 'dashboard'
                    ? pathname === '/dashboard'
                    : item.href !== '/dashboard' && pathname === item.href;

                if (sidebarCollapsed) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      title={item.label}
                      className={`relative w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-colors group cursor-pointer ${
                        isActive
                          ? 'bg-[#EAF7F0] text-[#159A68]'
                          : 'text-slate-500 hover:text-[#0B1736] hover:bg-slate-50'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 bg-[#159A68] rounded-r" />
                      )}
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-[#159A68]'
                            : 'text-slate-500 group-hover:text-slate-700'
                        }`}
                      />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`relative flex items-center gap-3 px-3 py-2.5 text-xs transition-colors rounded-xl cursor-pointer ${
                      isActive
                        ? 'text-[#159A68] font-bold bg-[#EAF7F0]'
                        : 'text-slate-600 hover:text-[#0B1736] hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#159A68] rounded-r" />
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#159A68]'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* --- Bottom Section --- */}
        <div>
          {sidebarCollapsed ? (
            /* Collapsed Bottom: Compact Guidance Button */
            <div className="py-4 px-2 border-t border-slate-100 flex flex-col items-center">
              <Link
                href="/chat"
                title="Need Guidance? Ask AI Advisor"
                className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-600 flex items-center justify-center transition-colors shadow-2xs"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </Link>
            </div>
          ) : (
            /* Expanded Bottom: Full Bharat Entrepreneur Heritage & AI Guidance Card */
            <div className="p-4 border-t border-slate-100 space-y-3 overflow-hidden">
              <div className="w-full rounded-xl overflow-hidden shadow-xs border border-slate-200/90 aspect-[16/11] bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/sidebar-national.jpg"
                  alt="Empowering Bharat's Entrepreneurs"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-1">
                <h4 className="font-serif font-bold text-xs sm:text-[13px] text-[#0B1736] leading-snug">
                  Empowering Bharat&apos;s Entrepreneurs
                </h4>
                {/* Subtle Tricolor Ribbon Bar */}
                <div className="flex h-1 w-10 rounded-full overflow-hidden mt-1.5">
                  <div className="w-1/3 bg-[#FF9933]" />
                  <div className="w-1/3 bg-slate-100 border-y border-slate-200" />
                  <div className="w-1/3 bg-[#138808]" />
                </div>
              </div>

              {/* AI Guidance Card */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/90 space-y-2.5 mt-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-amber-100/80 text-amber-600 shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0B1736]">Need Guidance?</p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Get personalized advice with our AI assistant
                    </p>
                  </div>
                </div>
                <Link
                  href="/chat"
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-[#F4A340] hover:bg-[#e09130] text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  <span>Ask AI Advisor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE OFF-CANVAS DRAWER & FLOATING TOGGLE TRIGGER                     */}
      {/* ========================================================================= */}
      <div className="md:hidden">
        {/* Floating Mobile Menu Button on Bottom-Left or Top if needed */}
        {!mobileSidebarOpen && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="fixed bottom-5 left-5 z-40 w-11 h-11 rounded-full bg-[#0B1736] text-white shadow-lg flex items-center justify-center border border-slate-700 active:scale-95 transition-transform cursor-pointer"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Off-Canvas Drawer Backdrop & Container */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sliding Drawer */}
            <div className="relative w-[280px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 overflow-y-auto animate-in slide-in-from-left duration-200">
              <div>
                {/* Header */}
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo.png"
                      alt="UnnatE"
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Nav Items */}
                <div className="mt-3">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    MAIN MENU
                  </div>
                  <nav className="space-y-1 mt-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.id === 'dashboard'
                          ? pathname === '/dashboard'
                          : item.href !== '/dashboard' && pathname === item.href;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={`relative flex items-center gap-3 px-3 py-2.5 text-xs transition-colors rounded-xl ${
                            isActive
                              ? 'text-[#159A68] font-bold bg-[#EAF7F0]'
                              : 'text-slate-600 hover:text-[#0B1736] hover:bg-slate-50 font-medium'
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#159A68] rounded-r" />
                          )}
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-[#159A68]' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Mobile Guidance Card */}
              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                <Link
                  href="/chat"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#F4A340] text-white text-xs font-bold shadow-xs"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Ask AI Advisor</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
