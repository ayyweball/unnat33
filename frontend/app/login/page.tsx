'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import { Phone, ShieldCheck, ArrowRight, Loader2, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/dashboard';
  const { t, language } = useLanguage();
  const { setUser } = useAppStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);

  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code');

      setStep('otp');
      setTimer(30);
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: fullOtp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP code');

      setUser(data.user);
      router.push(redirectParam);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-xl shadow-slate-200/40 relative overflow-hidden">
      {/* Tricolor Government Identity Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="h-full flex-1 bg-[#FF9933]" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-[#138808]" />
      </div>

      <div className="text-center mb-6 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7F0] border border-[#159A68]/20 text-[11px] font-bold text-[#159A68] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>National Entrepreneur Portal</span>
        </div>
        <h1 className="text-2xl font-black text-[#0B1736] tracking-tight font-serif">
          {step === 'phone' ? 'Sign in to UnnatE' : 'Verify Mobile OTP'}
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          {step === 'phone'
            ? 'Enter your 10-digit mobile number to access your enterprise dashboard, scheme recommendations, and DPR tools.'
            : `Enter the 6-digit verification code sent to +91 ${phone}.`}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1736] mb-1.5">Mobile Phone Number</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-slate-500 border-r border-slate-200 pr-2">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-20 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] transition-all"
                autoFocus
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">A 6-digit OTP will be generated for instant sign-in.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-center text-xs text-amber-900">
            <span>Evaluation / Test Code: </span>
            <strong className="font-mono text-amber-950 font-bold tracking-wider">123456</strong>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1736] mb-2 text-center">
              Enter 6-Digit Verification Code
            </label>
            <div className="flex justify-between gap-2 max-w-xs mx-auto">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`login-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-200/90 text-[#0B1736] focus:outline-none focus:ring-2 focus:ring-[#159A68]/20 focus:border-[#159A68] bg-slate-50 transition-all"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#159A68] hover:bg-[#128357] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify &amp; Continue</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setStep('phone'); setError(''); }}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-[#0B1736] font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change phone</span>
            </button>

            {timer > 0 ? (
              <span className="text-slate-400">Resend in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-[#159A68] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend OTP</span>
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-500">
          Want to register with detailed credentials?{' '}
          <Link href="/auth/register" className="text-[#159A68] font-bold hover:underline">
            Create full account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-[#159A68] animate-spin" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
