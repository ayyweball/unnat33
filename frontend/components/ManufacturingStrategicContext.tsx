'use client';

import React from 'react';
import {
  Cpu,
  TrendingUp,
  Globe2,
  Factory,
  Zap,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  BarChart2,
  Compass,
} from 'lucide-react';

/**
 * BCG/CII (September 2015) "Future of Indian Manufacturing: Bridging the Gap"
 * Secondary Historical / Strategic Context Components for Manufacturing Domain.
 *
 * INVARIANT: Used strictly as qualitative historical reference;
 * NEVER used in calculations, district estimates, revenue projections,
 * eligibility decisions, or financial formulas.
 */

export function ManufacturingDemandContext() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-[#159A68]" />
          <h3 className="text-sm font-bold text-[#0B1736]">
            Secondary Strategic Context: Manufacturing Sector Trends &amp; FDI Inflow
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
          BCG/CII (September 2015) — Exhibits 1.1, 1.2, 1.3, 1.5, pp. 5–10
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#159A68] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sector Growth Anchor</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-normal">
            Domestic consumer spending (₹15.9T in Q4 FY15) historically anchored manufacturing recovery, buffering export cyclicality across 14 of 22 manufacturing subsectors.
          </p>
          <div className="text-[10px] text-slate-400 pt-1">
            BCG/CII 2015, Exhibit 1.1 &amp; 1.2, pp. 5–7
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
          <div className="flex items-center gap-1.5 text-blue-600 font-bold">
            <Globe2 className="w-3.5 h-3.5" />
            <span>FDI Inflow Concentration</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-normal">
            Manufacturing historically captured over 1/3rd of national FDI, concentrated in Automobiles (9.0%), Pharma (3.6%), Mechanical Engineering (3.1%), and Industrial Machinery (2.2%).
          </p>
          <div className="text-[10px] text-slate-400 pt-1">
            BCG/CII 2015, Exhibit 1.5 &amp; 1.6, pp. 8–10
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#F4A340] font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Infrastructure Enablers</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-normal">
            Dedicated Freight Corridors (EDFC &amp; WDFC, speeds to 100 km/h) and grid capacity additions (lowering power deficits from 10.1% to 3.6%) proved essential for plant viability.
          </p>
          <div className="text-[10px] text-slate-400 pt-1">
            BCG/CII 2015, Exhibits 1.7 &amp; 1.8, p. 11
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50/80 rounded-lg text-[11px] text-slate-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <span className="font-bold text-slate-700">Historical Strategic Reference Only:</span> Sourced from the BCG/CII report &ldquo;Future of Indian Manufacturing: Bridging the Gap&rdquo; (Sept 2015). Provided strictly as secondary industrial baseline context. Present-day local enterprise metrics derive from official Ministry of MSME Udyam Census and MoSPI HCES records.
        </span>
      </div>
    </section>
  );
}

export function ManufacturingCompetitorContext() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#159A68]" />
          <h3 className="text-sm font-bold text-[#0B1736]">
            Secondary Strategic Context: Manufacturing Competitiveness &amp; Export Horizon
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
          BCG/CII (September 2015) — Exhibits 1.3, 3.3, 3.4, 6.1, pp. 8, 22–25, 40–43
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
          <div className="font-bold text-[#0B1736] flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-[#159A68]" />
            <span>Global Factor Cost Disruption</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Chinese factory wages rose from 3% of US levels in 2000 to 17% by 2015 (15% annual wage inflation) alongside currency strengthening, diminishing pure cost arbitrage and opening opportunities for alternative manufacturing hubs.
          </p>
          <div className="text-[10px] text-slate-400 pt-1">
            BCG/CII 2015, Exhibit 3.3, pp. 22–24
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
          <div className="font-bold text-[#0B1736] flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Global Export Share Baseline</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            India&rsquo;s manufacturing export volume grew from $188B in 2011 to $203B in 2014, maintaining a steady 1.5% global export share against an NMP target of 25% of national GDP (actual historical plateau was ~17%).
          </p>
          <div className="text-[10px] text-slate-400 pt-1">
            BCG/CII 2015, Exhibit 1.3, p. 8
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
          <div className="font-bold text-[#0B1736] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F4A340]" />
            <span>Moving Beyond &lsquo;Jugaad&rsquo; to Systems</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            India cannot win long-term purely on low conversion costs against frontier low-cost countries. Manufacturers must transition from stopgap &lsquo;Jugaad&rsquo; to root-cause quality, 5S shop-floor discipline, and Kaizen continuous improvement.
          </p>
          <div className="text-[10px] text-slate-400 pt-1">
            BCG/CII 2015, Exhibit 6.1, pp. 40–43
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50/80 rounded-lg text-[11px] text-slate-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <span className="font-bold text-slate-700">Historical Strategic Reference Only:</span> Sourced from BCG/CII (2015). Provided to contextualize structural manufacturing trade and cost dynamics; not used for current local competitor counts or pricing calculations.
        </span>
      </div>
    </section>
  );
}

export function ManufacturingTechnologyContext() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#159A68]" />
          <h3 className="text-sm font-bold text-[#0B1736]">
            Secondary Strategic Context: Advanced Manufacturing Technologies &amp; Productivity
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
          BCG/CII (September 2015) — Exhibits 4.1–4.6, 6.2, pp. 28–34, 44
        </span>
      </div>

      {/* 5 Core Technologies of the Factory of Tomorrow */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[#0B1736]">
          Five Foundational Technologies of the &ldquo;Factory of Tomorrow&rdquo; (Industry 4.0):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-[#159A68] uppercase block">1. Additive / 3D</span>
            <div className="font-bold text-[#0B1736]">Tooling &amp; Prototyping</div>
            <p className="text-[11px] text-slate-600">
              Low-cost digital mockups and tooling samples without costly CNC machine runs; reduces material scrap.
            </p>
            <div className="text-[10px] text-slate-400 pt-1">BCG/CII p. 28</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase block">2. Autonomous Robots</span>
            <div className="font-bold text-[#0B1736]">Flexible Automation</div>
            <p className="text-[11px] text-slate-600">
              Industrial robotics costs projected to decrease ~20% with 5% annual capability gains, handling complex variable tasks.
            </p>
            <div className="text-[10px] text-slate-400 pt-1">Exhibit 4.2, p. 30</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase block">3. Agile Development</span>
            <div className="font-bold text-[#0B1736]">ICME Virtual Modeling</div>
            <p className="text-[11px] text-slate-600">
              Virtual design simulation cutting product development cycle times by 15–25% before physical fabrication.
            </p>
            <div className="text-[10px] text-slate-400 pt-1">Exhibit 4.3, p. 31</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-purple-600 uppercase block">4. Digital Factory</span>
            <div className="font-bold text-[#0B1736]">Virtual Assembly Lines</div>
            <p className="text-[11px] text-slate-600">
              Digital simulation of plant layout eliminating &gt;50% of physical prototyping steps and optimizing cycle time.
            </p>
            <div className="text-[10px] text-slate-400 pt-1">BCG/CII p. 31</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase block">5. Industrial IoT</span>
            <div className="font-bold text-[#0B1736]">Predictive Maintenance</div>
            <p className="text-[11px] text-slate-600">
              Sensors, RFID tracking, and wireless analytics reducing unplanned machinery downtime by up to 100%.
            </p>
            <div className="text-[10px] text-slate-400 pt-1">Exhibit 4.4, p. 32</div>
          </div>
        </div>
      </div>

      {/* Leadership Priorities Shift & German Mittelstand Benchmark */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
          <div className="font-bold text-[#0B1736] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68]" />
            <span>Shift from Table Stakes to Innovation Advantage</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            BCG/CII leadership surveys showed manufacturing priorities shifting from foundational baseline goals (quality 72%, productivity 68%) toward value-chain innovation (75%) and shortening product development lifecycles (55%).
          </p>
          <div className="text-[10px] text-slate-400">BCG/CII 2015, Exhibit 4.6, p. 34</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
          <div className="font-bold text-[#0B1736] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>German Mittelstand SME Benchmark (Wittenstein AG)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Benchmarked against the German Mittelstand model: continuous reinvestment of ~10%–12% of revenue into specialized R&amp;D and precision engineering builds durable, high-margin SME moats.
          </p>
          <div className="text-[10px] text-slate-400">BCG/CII 2015, Exhibit 6.2, p. 44</div>
        </div>
      </div>

      <div className="p-3 bg-slate-50/80 rounded-lg text-[11px] text-slate-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <span className="font-bold text-slate-700">Historical Strategic Reference Only:</span> Sourced from BCG/CII (2015). Provided to assist manufacturing promoters in technology roadmapping; does not alter ML cluster indicators or statutory eligibility.
        </span>
      </div>
    </section>
  );
}

export function ManufacturingReportSection() {
  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-sm font-bold text-[#0B1736] uppercase tracking-wider flex items-center gap-2">
          <Factory className="w-4 h-4 text-[#159A68]" />
          <span>Secondary Strategic &amp; Historical Context (BCG/CII 2015)</span>
        </h2>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          Historical Benchmark — September 2015
        </span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        To supplement present-day MSME census and HCES expenditure metrics, the following structural insights from the BCG/CII landmark study &ldquo;Future of Indian Manufacturing: Bridging the Gap&rdquo; (September 2015) provide historical strategic context for industrial promoters:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="font-bold text-[#0B1736] flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-[#159A68]" />
            <span>Macro Performance &amp; FDI</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Historically, manufacturing accounted for ~17% of GDP and 1.5% of global exports ($203B in 2014). Manufacturing attracted &gt;33% of national FDI, driven by Automobiles (9.0%) and Engineering (3.1%).
          </p>
          <div className="text-[10px] text-slate-400">BCG/CII Exhibits 1.3, 1.5, pp. 8–10</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="font-bold text-[#0B1736] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Competitiveness &amp; Moats</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Erosion of Chinese cost arbitrage (factory wages reaching 17% of US levels) shifted competition from pure low-cost conversion toward product differentiation, 5S shop-floor systems, and Kaizen discipline.
          </p>
          <div className="text-[10px] text-slate-400">BCG/CII Exhibits 3.3, 6.1, pp. 22–24, 41</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="font-bold text-[#0B1736] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>Advanced Technologies</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Industry 4.0 pillars (3D sample tooling, autonomous robotics with ~20% cost declines, virtual ICME simulation cutting development cycles by 15–25%) offer blended advantage with technical labor.
          </p>
          <div className="text-[10px] text-slate-400">BCG/CII Exhibits 4.1–4.3, pp. 28–31</div>
        </div>
      </div>

      <div className="p-3 bg-slate-100/70 rounded-lg text-[10px] text-slate-500 leading-relaxed">
        <span className="font-bold text-slate-700">Notice of Secondary Status:</span> Sourced from BCG/CII (September 2015). Provided purely as strategic industry background; not blended into statutory calculations, district enterprise counts, or loan eligibility evaluations.
      </div>
    </section>
  );
}
