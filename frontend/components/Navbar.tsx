'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import {
  Globe,
  LogOut,
  User as UserIcon,
  TrendingUp,
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
  Landmark,
  FileSpreadsheet,
  Bot,
  Building2,
  ChevronRight,
  Search,
  MapPin,
  Sliders,
} from 'lucide-react';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, setProfile } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sync profile on mount if cookie exists
  useEffect(() => {
    if (!user) {
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) {
            setProfile(data.user, data.business || null);
          }
        })
        .catch(() => {});
    }
  }, [user, setProfile]);

  // Navigation active & hover states
  const [activeId, setActiveId] = useState<string>('how-it-works');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const navItems = [
    { id: 'how-it-works', href: '#how-it-works', label: t('nav.howItWorks') },
    { id: 'analysis', href: '#analysis', label: t('nav.analysis') },
    { id: 'simulator', href: '/simulator', label: 'What-If Simulator', icon: Sliders },
    { id: 'entrepreneurs', href: '#entrepreneurs', label: t('nav.forEntrepreneurs') },
    { id: 'about', href: '#about', label: t('nav.aboutUs') },
  ];

  // Synchronize active navigation link with current scroll position on homepage
  useEffect(() => {
    if (pathname !== '/') return;

    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      if (['how-it-works', 'analysis', 'entrepreneurs', 'about'].includes(hashId)) {
        setActiveId(hashId);
      }
    }

    const sections = ['how-it-works', 'analysis', 'entrepreneurs', 'about'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveId(sections[i]);
            return;
          }
        }
      }
      setActiveId('how-it-works');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const isAuthPage = pathname?.startsWith('/auth');
  const isDashboardOrAdvisory =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/advisory') ||
    pathname?.startsWith('/chat') ||
    pathname?.startsWith('/simulator');

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <div
        className={`w-full bg-white/95 transition-all duration-300 border-b ${
          scrolled
            ? 'border-slate-200/90 shadow-sm backdrop-blur-md py-2.5'
            : 'border-slate-200/60 backdrop-blur-xs py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="UnnatE - Business Grows A Stronger Bharat"
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links with Animated Hover Effects */}
          {!isAuthPage && !isDashboardOrAdvisory && (
            <nav
              onMouseLeave={() => setHoveredId(null)}
              className="relative hidden lg:flex items-center gap-2 text-xs font-semibold py-1 select-none"
              aria-label="Main Navigation"
            >
              {navItems.map((item) => {
                const isHovered = hoveredId === item.id;
                const isActive = activeId === item.id;
                const isCurrent = isHovered || (hoveredId === null && isActive);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onClick={() => {
                      setActiveId(item.id);
                    }}
                    className="group relative px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer select-none"
                  >
                    {/* Animated Sliding Hover Capsule Pill (React Bits style) */}
                    <AnimatePresence>
                      {isHovered && !shouldReduceMotion && (
                        <motion.span
                          layoutId="navTabHoverPill"
                          className="absolute inset-0 rounded-xl bg-[#EAF7F0] border border-[#159A68]/25 -z-0 pointer-events-none shadow-2xs"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{
                            type: 'spring',
                            stiffness: 450,
                            damping: 32,
                            mass: 0.7,
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Active & Hover Traveling Underline Indicator */}
                    {isCurrent && (
                      <motion.span
                        layoutId="navTabUnderline"
                        className="absolute -bottom-0.5 left-3.5 right-3.5 h-[2.5px] bg-[#159A68] rounded-full z-10 pointer-events-none"
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : {
                                type: 'spring',
                                stiffness: 450,
                                damping: 32,
                                mass: 0.7,
                              }
                        }
                      />
                    )}

                    {/* Tab Text with subtle -1px lift on hover */}
                    <span
                      className={`relative z-10 inline-block transition-all duration-200 ease-out group-hover:-translate-y-[1px] ${
                        isCurrent
                          ? 'text-[#159A68] font-bold'
                          : 'text-[#0B1736] group-hover:text-[#159A68]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Center Search Input (Dashboard & Advisory Views — Direct Reference Match) */}
          {isDashboardOrAdvisory && (
            <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search schemes, markets, or ask anything... (Ctrl K)"
                  className="w-full pl-9 pr-4 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs text-[#0B1736] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#159A68] focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Quick District Location Pill (Dashboard Views) */}
            {isDashboardOrAdvisory && (
              <Link
                href="/dashboard/profile"
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF7F0] border border-[#159A68]/20 text-xs font-semibold text-[#159A68] hover:bg-[#d5ede0] transition-colors"
                title="View or Change Geographic Location"
              >
                <MapPin className="w-3 h-3 text-[#159A68]" />
                <span>
                  {user?.district
                    ? `${user.district}${user?.state ? `, ${user.state}` : ''}`
                    : user?.state
                    ? user.state
                    : 'Set Location'}
                </span>
              </Link>
            )}

            {/* Bilingual Language Switcher Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-[#159A68]" />
              <span>{language === 'en' ? 'EN | हिन्दी' : 'हिन्दी | EN'}</span>
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-[#0B1736] font-semibold text-xs transition-colors border border-slate-200"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#159A68]" />
                  <span className="max-w-[120px] truncate">{user.name || user.phone || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#159A68] hover:bg-[#128357] text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                  <span>Sign in / Log in</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition cursor-pointer border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 shadow-lg space-y-3">
          <nav className="space-y-1 text-xs font-semibold text-slate-700">
            {user ? (
              <>
                <div className="px-3 py-2 text-[11px] font-bold text-slate-900 bg-slate-50 rounded-lg mb-2 flex items-center justify-between border border-slate-200">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-[#159A68]" />
                    <span>{user.name}</span>
                  </div>
                  <span className="text-[10px] text-[#159A68] font-bold">Active</span>
                </div>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <TrendingUp className="w-4 h-4 text-[#159A68]" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#159A68]" />
                  <span>Market Intelligence</span>
                </Link>
                <Link
                  href="/simulator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <Sliders className="w-4 h-4 text-[#159A68]" />
                  <span>What-If Simulator</span>
                </Link>
                <Link
                  href="/advisory/business-plan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>DPR Builder</span>
                </Link>
                <Link
                  href="/advisory/schemes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <Landmark className="w-4 h-4 text-[#F4A340]" />
                  <span>Government Schemes</span>
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span>Business Profile</span>
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>AI Advisory Assistant</span>
                </Link>
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  Market Intelligence
                </Link>
                <Link
                  href="/simulator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition font-semibold text-[#159A68]"
                >
                  What-If Simulator
                </Link>
                <Link
                  href="/advisory/business-plan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  DPR Builder
                </Link>
                <Link
                  href="/advisory/schemes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  Government Schemes
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-lg bg-[#159A68] text-white text-center font-bold shadow-xs mt-2"
                >
                  Sign in / Log in
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
