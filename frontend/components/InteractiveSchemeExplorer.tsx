'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/useLanguage';
import {
  Landmark,
  BadgeIndianRupee,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Award,
  Users,
  Building2,
  FileCheck2,
} from 'lucide-react';

interface Scheme {
  id: string;
  nameEn: string;
  nameHi: string;
  category: 'all' | 'micro' | 'manufacturing' | 'artisan' | 'women';
  authorityEn: string;
  authorityHi: string;
  maxAmountEn: string;
  maxAmountHi: string;
  subsidyRateEn: string;
  subsidyRateHi: string;
  interestRateEn: string;
  interestRateHi: string;
  collateralEn: string;
  collateralHi: string;
  descriptionEn: string;
  descriptionHi: string;
  eligibilityEn: string[];
  eligibilityHi: string[];
  documentsEn: string[];
  documentsHi: string[];
  tag: string;
  tagColor: string;
}

export default function InteractiveSchemeExplorer() {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'micro' | 'manufacturing' | 'artisan' | 'women'>('all');
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);

  const categories = [
    { id: 'all', labelEn: 'All Priority Schemes', labelHi: 'सभी प्रमुख योजनाएं' },
    { id: 'manufacturing', labelEn: 'Manufacturing & Subsidies', labelHi: 'विनिर्माण एवं पूंजीगत सब्सिडी' },
    { id: 'micro', labelEn: 'Micro & Street Credit', labelHi: 'सूक्ष्म एवं कार्यशील पूंजी ऋण' },
    { id: 'artisan', labelEn: 'Artisans & Vishwakarma', labelHi: 'कारीगर एवं विश्वकर्मा' },
    { id: 'women', labelEn: 'Women & Priority Promoters', labelHi: 'महिलाएं एवं प्राथमिकता वर्ग' },
  ];

  const schemes: Scheme[] = [
    {
      id: 'pmegp',
      nameEn: 'Prime Minister’s Employment Generation Programme (PMEGP)',
      nameHi: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)',
      category: 'manufacturing',
      authorityEn: 'KVIC / Ministry of MSME',
      authorityHi: 'खादी एवं ग्रामोद्योग आयोग / सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
      maxAmountEn: 'Up to ₹50 Lakhs (Mfg) / ₹20 Lakhs (Service)',
      maxAmountHi: '₹50 लाख तक (विनिर्माण) / ₹20 लाख (सेवाएं)',
      subsidyRateEn: '15% to 35% Capital Margin Subsidy',
      subsidyRateHi: '15% से 35% पूंजीगत मार्जिन अनुदान',
      interestRateEn: 'Normal Bank Commercial Term (8.5% - 11%)',
      interestRateHi: 'सामान्य बैंक वाणिज्यिक दर (8.5% - 11%)',
      collateralEn: 'Zero Collateral up to ₹10L (CGTMSE Covered)',
      collateralHi: '₹10 लाख तक कोई गारंटी नहीं (CGTMSE द्वारा सुरक्षित)',
      descriptionEn:
        'Flagship credit-linked capital margin subsidy scheme for setting up new micro-enterprises in manufacturing and services. Provides non-repayable government margin money deposited directly into borrower term account.',
      descriptionHi:
        'विनिर्माण और सेवाओं में नए सूक्ष्म उद्यमों की स्थापना के लिए प्रमुख क्रेडिट-लिंक्ड सब्सिडी योजना। सरकार द्वारा 15% से 35% तक का गैर-वापसी योग्य अनुदान सीधे बैंक खाते में जमा किया जाता है।',
      eligibilityEn: [
        'Any individual above 18 years of age',
        '8th standard pass for projects above ₹10L in manufacturing',
        'Only new greenfield micro-projects are eligible',
        'Self-Help Groups & Charitable Trusts',
      ],
      eligibilityHi: [
        '18 वर्ष से अधिक आयु का कोई भी भारतीय नागरिक',
        'विनिर्माण में ₹10 लाख से अधिक की परियोजना के लिए 8वीं पास अनिवार्य',
        'केवल नए (Greenfield) सूक्ष्म उद्यम पात्र हैं',
        'स्वयं सहायता समूह एवं पंजीकृत संस्थाएं',
      ],
      documentsEn: ['Aadhaar & PAN Card', '13-Section Project DPR', 'Educational Certificate', 'Caste/Special Category Certificate (if claiming 35%)'],
      documentsHi: ['आधार एवं पैन कार्ड', '13-अनुभाग विस्तृत परियोजना रिपोर्ट (DPR)', 'शैक्षणिक प्रमाण पत्र', 'जाति / विशेष श्रेणी प्रमाण पत्र (35% सब्सिडी हेतु)'],
      tag: 'Highest Subsidy Grant',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'mudra',
      nameEn: 'Pradhan Mantri MUDRA Yojana (PMMY - Tarun & Kishore)',
      nameHi: 'प्रधानमंत्री मुद्रा योजना (PMMY - तरुण एवं किशोर)',
      category: 'micro',
      authorityEn: 'Department of Financial Services / MUDRA Ltd',
      authorityHi: 'वित्तीय सेवाएं विभाग / मुद्रा लिमिटेड',
      maxAmountEn: 'Up to ₹10 Lakhs (Tarun) / ₹5 Lakhs (Kishore)',
      maxAmountHi: '₹10 लाख तक (तरुण) / ₹5 लाख (किशोर)',
      subsidyRateEn: 'Interest Subvention / Guarantee Backed',
      subsidyRateHi: 'क्रेडिट गारंटी समर्थित / रियायती शुल्क',
      interestRateEn: '8.40% – 11.25% per annum',
      interestRateHi: '8.40% – 11.25% प्रति वर्ष',
      collateralEn: '100% Collateral-Free (CGFMU Guarantee)',
      collateralHi: '100% संपार्श्विक-मुक्त (CGFMU गारंटी)',
      descriptionEn:
        'Provides institutional term loans and working capital to micro-enterprises, small shopkeepers, fruit/vegetable distributors, artisans, and small manufacturing workshops through public, private, and regional rural banks.',
      descriptionHi:
        'छोटे दुकानदारों, व्यापारियों, कारीगरों और प्रसंस्करण इकाइयों को कार्यशील पूंजी और सावधि ऋण उपलब्ध कराता है। 100% संपार्श्विक-मुक्त व्यवस्था के तहत बैंक तुरंत ऋण स्वीकृत करते हैं।',
      eligibilityEn: [
        'Non-corporate small business segment (NCSBS)',
        'Proprietorship, partnership firms, and micro units',
        'Satisfactory credit track record without existing bank default',
      ],
      eligibilityHi: [
        'गैर-कॉर्पोरेट लघु व्यवसाय क्षेत्र (NCSBS)',
        'एकल स्वामित्व, साझेदारी और लघु विनिर्माण इकाइयाँ',
        'बिना किसी बैंक डिफॉल्ट के संतोषजनक क्रेडिट रिकॉर्ड',
      ],
      documentsEn: ['Udyam Registration Certificate', 'Past 6-Month Bank Statement', 'Quotations for Machinery / Stock', 'Business KYC'],
      documentsHi: ['उद्यम पंजीकरण प्रमाण पत्र', 'विगत 6 माह का बैंक विवरण', 'मशीनरी / स्टॉक का कोटेशन', 'व्यवसाय केवाईसी'],
      tag: 'Fastest Sanction',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'vishwakarma',
      nameEn: 'PM Vishwakarma Scheme for Traditional Artisans',
      nameHi: 'पारंपरिक कारीगरों के लिए पीएम विश्वकर्मा योजना',
      category: 'artisan',
      authorityEn: 'Ministry of MSME & Ministry of Skill Development',
      authorityHi: 'सूक्ष्म, लघु एवं मध्यम उद्यम एवं कौशल विकास मंत्रालय',
      maxAmountEn: '₹1 Lakh (Tranche 1) + ₹2 Lakhs (Tranche 2)',
      maxAmountHi: '₹1 लाख (प्रथम चरण) + ₹2 लाख (द्वितीय चरण)',
      subsidyRateEn: '₹15,000 Toolkit Incentive + Skill Stipend',
      subsidyRateHi: '₹15,000 टूलकिट अनुदान + दैनिक प्रशिक्षण भत्ता',
      interestRateEn: 'Fixed 5% Concessional Interest (8% MoMSME Subvention)',
      interestRateHi: 'स्थिर 5% रियायती ब्याज दर (8% सरकार द्वारा देय)',
      collateralEn: 'Zero Collateral & Zero Guarantee Fee',
      collateralHi: 'शून्य संपार्श्विक एवं शून्य गारंटी शुल्क',
      descriptionEn:
        'Complete end-to-end holistic support for 18 traditional trades (carpenters, blacksmiths, potters, weavers, masons, cobblers). Includes modern toolkit voucher, formal PM Vishwakarma certification, and concessional 5% credit.',
      descriptionHi:
        '18 पारंपरिक व्यवसायों (बढ़ई, लोहार, कुम्हार, बुनकर, राजमिस्त्री आदि) के लिए व्यापक सहायता। इसमें ₹15,000 का आधुनिक टूलकिट ई-वाउचर, आधिकारिक प्रमाण पत्र और मात्र 5% की रियायती ब्याज दर पर ऋण शामिल है।',
      eligibilityEn: [
        'Artisans working in 18 notified family crafts',
        'Minimum age of 18 on registration date',
        'Only one member per family is eligible',
      ],
      eligibilityHi: [
        '18 अधिसूचित पारंपरिक शिल्पों में कार्यरत कारीगर',
        'पंजीकरण की तिथि पर न्यूनतम आयु 18 वर्ष',
        'प्रति परिवार केवल एक सदस्य पात्र',
      ],
      documentsEn: ['Aadhaar Linked Mobile Number', 'Bank Passbook Details', 'Skill Verification via Gram Panchayat / ULB'],
      documentsHi: ['आधार से जुड़ा मोबाइल नंबर', 'बैंक पासबुक विवरण', 'ग्राम पंचायत / नगर निकाय द्वारा कौशल सत्यापन'],
      tag: '5% Low Interest',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'svanidhi',
      nameEn: 'PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)',
      nameHi: 'पीएम स्ट्रीट वेंडर्स आत्मनिर्भर निधि (पीएम स्वनिधि)',
      category: 'micro',
      authorityEn: 'Ministry of Housing and Urban Affairs (MoHUA)',
      authorityHi: 'आवासन और शहरी कार्य मंत्रालय (MoHUA)',
      maxAmountEn: '₹10,000 (1st) • ₹20,000 (2nd) • ₹50,000 (3rd)',
      maxAmountHi: '₹10,000 (पहला) • ₹20,000 (दूसरा) • ₹50,000 (तीसरा)',
      subsidyRateEn: '7% Annual Interest Subsidy directly credited',
      subsidyRateHi: '7% वार्षिक ब्याज सब्सिडी सीधे बैंक खाते में',
      interestRateEn: 'Concessional (Effective 3% - 4% after subsidy)',
      interestRateHi: 'रियायती (सब्सिडी के पश्चात मात्र 3% - 4%)',
      collateralEn: 'No Collateral / Digital Incentives up to ₹1,200/yr',
      collateralHi: 'शून्य गारंटी / ₹1,200/वर्ष तक डिजिटल कैशबैक',
      descriptionEn:
        'Micro-credit working capital line to empower urban and peri-urban street vendors to bounce back and grow. Rewards prompt digital repayments with 7% interest subvention and escalating loan limits.',
      descriptionHi:
        'शहरी और अर्ध-शहरी रेहड़ी-पटरी विक्रेताओं के लिए किफायती कार्यशील पूंजी ऋण। समय पर डिजिटल पुनर्भुगतान करने पर 7% ब्याज सब्सिडी और आगामी ऋण सीमा में स्वतः वृद्धि का लाभ मिलता है।',
      eligibilityEn: [
        'Street vendors with Vending Certificate / Identity Card issued by Urban Local Bodies (ULB)',
        'Vendors identified in vending census surveys',
        'Vendors from peri-urban or rural areas selling in urban areas',
      ],
      eligibilityHi: [
        'शहरी स्थानीय निकायों (ULB) द्वारा जारी वेंडिंग प्रमाण पत्र / पहचान पत्र धारक',
        'वेंडिंग सर्वेक्षण में पहचाने गए विक्रेता',
        'शहरी क्षेत्रों में विक्रय करने वाले आसपास के ग्रामीण विक्रेता',
      ],
      documentsEn: ['Vending Card or Letter of Recommendation (LoR)', 'Aadhaar Card', 'Bank Account Details'],
      documentsHi: ['वेंडिंग कार्ड अथवा अनुशंसा पत्र (LoR)', 'आधार कार्ड', 'बैंक खाता विवरण'],
      tag: '7% Interest Rebate',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'standup',
      nameEn: 'Stand-Up India Scheme for Women & SC/ST Promoters',
      nameHi: 'महिलाओं एवं एससी/एसटी उद्यमियों हेतु स्टैंड-अप इंडिया',
      category: 'women',
      authorityEn: 'Department of Financial Services / SIDBI',
      authorityHi: 'वित्तीय सेवाएं विभाग / सिडबी',
      maxAmountEn: '₹10 Lakhs to ₹1 Crore Greenfield Project',
      maxAmountHi: '₹10 लाख से ₹1 करोड़ तक की नई परियोजना',
      subsidyRateEn: 'State Margin Matching & Handholding Support',
      subsidyRateHi: 'राज्य मार्जिन मनी एवं संपूर्ण हैंडहोल्डिंग सहायता',
      interestRateEn: 'MCLR + 3% + Tenor Premium (Lowest Bank Bracket)',
      interestRateHi: 'MCLR + 3% (बैंक की न्यूनतम ब्याज दर श्रेणी)',
      collateralEn: 'CGSSI Credit Guarantee or Primary Hypothecation',
      collateralHi: 'CGSSI क्रेडिट गारंटी अथवा मशीनरी प्राथमिक दृष्टिबंधक',
      descriptionEn:
        'Facilitates institutional bank loans between ₹10 Lakhs and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise in manufacturing, services, agri-allied, or trading.',
      descriptionHi:
        'प्रत्येक बैंक शाखा से कम से कम एक एससी/एसटी और एक महिला उद्यमी को ₹10 लाख से ₹1 करोड़ तक का संस्थागत बैंक ऋण। विनिर्माण, सेवा, व्यापार या कृषि-संबद्ध क्षेत्रों में नए उद्यमों की स्थापना हेतु सर्वोत्तम योजना।',
      eligibilityEn: [
        'SC/ST and/or Woman entrepreneurs above 18 years of age',
        'Loans under the scheme are available only for greenfield projects',
        'In non-individual enterprises, 51% shareholding must be held by SC/ST or Women',
      ],
      eligibilityHi: [
        '18 वर्ष से अधिक आयु की महिला एवं एससी/एसटी उद्यमी',
        'केवल नए (Greenfield) प्रोजेक्ट्स के लिए ऋण उपलब्ध',
        'साझेदारी संस्थाओं में कम से कम 51% हिस्सेदारी महिला/एससी/एसटी के पास अनिवार्य',
      ],
      documentsEn: ['Project DPR & Cost Estimates', 'Caste Certificate (for SC/ST)', 'Identity & Address Proof', 'Pollution / Factory Licenses (if applicable)'],
      documentsHi: ['विस्तृत परियोजना रिपोर्ट (DPR)', 'जाति प्रमाण पत्र (एससी/एसटी हेतु)', 'पहचान व निवास प्रमाण', 'आवश्यक विनियामक अनुमतियां'],
      tag: 'Up to ₹1 Crore',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'cgtmse',
      nameEn: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
      nameHi: 'सूक्ष्म एवं लघु उद्यम क्रेडिट गारंटी ट्रस्ट (CGTMSE)',
      category: 'manufacturing',
      authorityEn: 'SIDBI & Ministry of MSME',
      authorityHi: 'सिडबी एवं सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय',
      maxAmountEn: 'Up to ₹5 Crore Collateral-Free Bank Credit',
      maxAmountHi: '₹5 करोड़ तक का संपार्श्विक-मुक्त बैंक ऋण',
      subsidyRateEn: 'Up to 85% Sovereign Guarantee Coverage',
      subsidyRateHi: '85% तक सॉवरेन क्रेडिट गारंटी सुरक्षा',
      interestRateEn: 'Competitive Bank Benchmark Rate',
      interestRateHi: 'प्रतिस्पर्धी बैंक बेंचमार्क ब्याज दर',
      collateralEn: 'No Third-Party Collateral or Guarantors Needed',
      collateralHi: 'किसी तीसरे पक्ष की संपत्ति या गारंटर की आवश्यकता नहीं',
      descriptionEn:
        'Enables commercial banks to provide collateral-free term loans and composite credit facilities up to ₹5 Crore to micro and small manufacturing and service enterprises by guaranteeing up to 85% of the default risk.',
      descriptionHi:
        'वाणिज्यिक बैंकों को सूक्ष्म और लघु विनिर्माण इकाइयों को ₹5 करोड़ तक का बिना किसी संपत्ति गिरवी रखे सावधि ऋण स्वीकृत करने में सक्षम बनाता है। डिफॉल्ट की स्थिति में सरकार 85% तक की सुरक्षा प्रदान करती है।',
      eligibilityEn: [
        'New and existing Micro and Small Enterprises (MSEs)',
        'Manufacturing and Service sector units (including Retail Trade up to ₹2 Cr)',
        'Valid Udyam Registration number',
      ],
      eligibilityHi: [
        'नए एवं मौजूदा सूक्ष्म और लघु उद्यम (MSEs)',
        'विनिर्माण एवं सेवा क्षेत्र की इकाइयां (खुदरा व्यापार ₹2 करोड़ तक)',
        'सक्रिय उद्यम पंजीकरण संख्या अनिवार्य',
      ],
      documentsEn: ['Udyam Registration', 'Audited Financial Statements / Projected Balance Sheets', 'Bank Approved DPR', 'Tax Compliance Records'],
      documentsHi: ['उद्यम पंजीकरण', 'ऑडिटेड वित्तीय विवरण / अनुमानित बैलेंस शीट', 'बैंक स्वीकृत DPR', 'जीएसटी एवं आयकर अनुपालन रिकॉर्ड'],
      tag: '₹5 Crore Sovereign Cover',
      tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  ];

  const filteredSchemes =
    activeCategory === 'all'
      ? schemes
      : schemes.filter((s) => s.category === activeCategory || (activeCategory === 'micro' && s.id === 'mudra'));

  return (
    <div className="w-full space-y-6 select-none">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              activeCategory === cat.id
                ? 'bg-[#0B1736] text-white border-[#0B1736] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {language === 'hi' ? cat.labelHi : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSchemes.map((scheme) => {
          const isExpanded = expandedScheme === scheme.id;

          return (
            <motion.div
              key={scheme.id}
              layout
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                isExpanded ? 'border-[#159A68] shadow-md ring-1 ring-[#159A68]/30' : 'border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {language === 'hi' ? scheme.authorityHi : scheme.authorityEn}
                    </span>
                    <h3 className="text-base font-black text-[#0B1736] mt-1 leading-snug">
                      {language === 'hi' ? scheme.nameHi : scheme.nameEn}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${scheme.tagColor}`}>
                    {scheme.tag}
                  </span>
                </div>

                {/* Description - Clamped to 1-2 lines when collapsed, full when expanded */}
                <p
                  className={`text-xs text-slate-600 leading-relaxed font-normal ${
                    isExpanded ? '' : 'line-clamp-2'
                  }`}
                  style={
                    !isExpanded
                      ? {
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }
                      : undefined
                  }
                >
                  {language === 'hi' ? scheme.descriptionHi : scheme.descriptionEn}
                </p>

                {/* Key Numbers Grid - ONLY Maximum Financial Limit & Subsidy / Key Benefit by default */}
                <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs font-medium">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {language === 'hi' ? 'अधिकतम सहायता' : 'Maximum Financial Limit'}
                    </span>
                    <span className="font-extrabold text-[#0B1736] mt-0.5 block truncate">
                      {language === 'hi' ? scheme.maxAmountHi : scheme.maxAmountEn}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {language === 'hi' ? 'अनुदान / सब्सिडी' : 'Subsidy / Key Benefit'}
                    </span>
                    <span className="font-extrabold text-[#159A68] mt-0.5 block truncate">
                      {language === 'hi' ? scheme.subsidyRateHi : scheme.subsidyRateEn}
                    </span>
                  </div>
                </div>

                {/* Expandable Criteria, Financial Details & Documents Drawer */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="expanded-details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-slate-100 space-y-3.5">
                        {/* Secondary Financial Information: Interest Rate & Collateral Requirement */}
                        <div className="grid grid-cols-2 gap-2.5 text-xs font-medium">
                          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                              {language === 'hi' ? 'ब्याज दर' : 'Interest Rate'}
                            </span>
                            <span className="font-extrabold text-blue-900 mt-0.5 block truncate">
                              {language === 'hi' ? scheme.interestRateHi : scheme.interestRateEn}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                              {language === 'hi' ? 'संपार्श्विक आवश्यकता' : 'Collateral Requirement'}
                            </span>
                            <span className="font-extrabold text-amber-900 mt-0.5 block truncate">
                              {language === 'hi' ? scheme.collateralHi : scheme.collateralEn}
                            </span>
                          </div>
                        </div>

                        {/* Statutory Eligibility Criteria */}
                        <div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68]" />
                            <span>{language === 'hi' ? 'पात्रता मानदंड' : 'Statutory Eligibility Criteria'}</span>
                          </span>
                          <ul className="space-y-1.5 pl-1">
                            {(language === 'hi' ? scheme.eligibilityHi : scheme.eligibilityEn).map((item, idx) => (
                              <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] mt-1.5 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Required Verification Documents */}
                        <div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>{language === 'hi' ? 'आवश्यक दस्तावेज' : 'Required Verification Documents'}</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(language === 'hi' ? scheme.documentsHi : scheme.documentsEn).map((doc, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Action Footer */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExpandedScheme(isExpanded ? null : scheme.id)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>
                    {isExpanded
                      ? (language === 'hi' ? 'विवरण छिपाएं ↑' : 'Hide Details ↑')
                      : (language === 'hi' ? 'विवरण एवं पात्रता देखें ↓' : 'View Details & Eligibility ↓')}
                  </span>
                </button>

                <Link
                  href="/advisory/schemes"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1736] hover:bg-[#159A68] text-white font-bold text-xs shadow-xs transition-colors group cursor-pointer"
                >
                  <span>{language === 'hi' ? 'पात्रता जांचें' : 'Check Eligibility'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
