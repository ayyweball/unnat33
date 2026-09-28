import React from 'react';

export type DprEditorialArtType =
  | 'business'
  | 'market'
  | 'customers'
  | 'operations'
  | 'marketing'
  | 'government'
  | 'financial'
  | 'location'
  | 'risk'
  | 'milestones';

interface DprEditorialArtProps {
  type: DprEditorialArtType;
  className?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Editorial Indian line-art illustrations for DPR sections.
 * Clean architectural line draughtsmanship in navy (#0B1736), dark green (#159A68),
 * and restrained saffron (#F4A340) accents. Designed specifically for unused whitespace.
 */
export default function DprEditorialArt({
  type,
  className = '',
  width = 120,
  height = 80,
}: DprEditorialArtProps) {
  return (
    <div
      className={`inline-flex items-center justify-center pointer-events-none select-none shrink-0 ${className}`}
      aria-hidden="true"
      style={{ width, height }}
    >
      {type === 'business' && <BusinessStorefrontArt />}
      {type === 'market' && <MarketBazaarArt />}
      {type === 'customers' && <CustomersCommunityArt />}
      {type === 'operations' && <OperationsWorkshopArt />}
      {type === 'marketing' && <MarketingOutreachArt />}
      {type === 'government' && <GovernmentCivicArt />}
      {type === 'financial' && <FinancialLedgerArt />}
      {type === 'location' && <LocationIndiaArt />}
      {type === 'risk' && <RiskShieldArt />}
      {type === 'milestones' && <MilestonesRoadmapArt />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. BUSINESS: Traditional Indian Storefront / Dukaan & Entrepreneur Desk
// ---------------------------------------------------------------------------
function BusinessStorefrontArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Plinth / Baseline */}
      <line x1="8" y1="82" x2="132" y2="82" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="85" x2="126" y2="85" stroke="#159A68" strokeWidth="1" strokeOpacity="0.6" strokeLinecap="round" />

      {/* Main Storefront Pillars & Frame */}
      <rect x="22" y="32" width="96" height="50" rx="1" stroke="#0B1736" strokeWidth="1.25" />
      <line x1="28" y1="32" x2="28" y2="82" stroke="#0B1736" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="112" y1="32" x2="112" y2="82" stroke="#0B1736" strokeWidth="1" strokeOpacity="0.4" />

      {/* Scalloped Awning / Chhatri Roof */}
      <path
        d="M16 32 C 16 18, 30 14, 70 14 C 110 14, 124 18, 124 32 Z"
        stroke="#0B1736"
        strokeWidth="1.25"
        fill="#F4F7FB"
      />
      {/* Saffron & Green Awning Stripes */}
      <path d="M42 16 L38 32" stroke="#F4A340" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M58 14.5 L56 32" stroke="#159A68" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M70 14 L70 32" stroke="#0B1736" strokeWidth="1" strokeOpacity="0.4" />
      <path d="M82 14.5 L84 32" stroke="#159A68" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M98 16 L102 32" stroke="#F4A340" strokeWidth="1.2" strokeLinecap="round" />

      {/* Decorative Finial Top */}
      <path d="M70 14 L70 6" stroke="#F4A340" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="70" cy="5" r="2" fill="#F4A340" />

      {/* Store Window & Display Shelves */}
      <rect x="34" y="38" width="30" height="28" rx="1" stroke="#0B1736" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="34" y1="48" x2="64" y2="48" stroke="#0B1736" strokeWidth="0.75" strokeOpacity="0.4" />
      <line x1="34" y1="58" x2="64" y2="58" stroke="#0B1736" strokeWidth="0.75" strokeOpacity="0.4" />
      <rect x="38" y="42" width="6" height="5" rx="0.5" stroke="#159A68" strokeWidth="0.8" />
      <rect x="48" y="42" width="6" height="5" rx="0.5" stroke="#F4A340" strokeWidth="0.8" />
      <circle cx="43" cy="53" r="2.5" stroke="#0B1736" strokeWidth="0.8" strokeOpacity="0.6" />
      <circle cx="53" cy="53" r="2.5" stroke="#159A68" strokeWidth="0.8" />

      {/* Doorway / Entrance */}
      <path d="M74 82 L74 44 C 74 40, 78 38, 86 38 C 94 38, 98 40, 98 44 L98 82" stroke="#0B1736" strokeWidth="1.2" />
      <circle cx="93" cy="62" r="1.5" fill="#0B1736" fillOpacity="0.7" />

      {/* Hanging Signboard */}
      <line x1="108" y1="36" x2="108" y2="42" stroke="#0B1736" strokeWidth="0.8" />
      <line x1="120" y1="36" x2="120" y2="42" stroke="#0B1736" strokeWidth="0.8" />
      <rect x="105" y="42" width="18" height="10" rx="1" stroke="#F4A340" strokeWidth="1" fill="#FFFFFF" />
      <line x1="109" y1="47" x2="119" y2="47" stroke="#159A68" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 2. MARKET: Traditional Indian Bazaar & Commercial Scale
// ---------------------------------------------------------------------------
function MarketBazaarArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Ground Line */}
      <line x1="10" y1="82" x2="130" y2="82" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="85" x2="120" y2="85" stroke="#159A68" strokeWidth="0.8" strokeOpacity="0.5" strokeLinecap="round" />

      {/* Left Market Stall Canopy */}
      <path d="M14 42 L42 22 L70 42 Z" stroke="#0B1736" strokeWidth="1.2" fill="#F4F7FB" />
      <path d="M28 32 L34 42" stroke="#F4A340" strokeWidth="1" />
      <path d="M42 22 L42 42" stroke="#159A68" strokeWidth="1" />
      <path d="M56 32 L50 42" stroke="#F4A340" strokeWidth="1" />
      {/* Stall Posts */}
      <line x1="18" y1="42" x2="18" y2="82" stroke="#0B1736" strokeWidth="1" />
      <line x1="66" y1="42" x2="66" y2="82" stroke="#0B1736" strokeWidth="1" />
      {/* Market Counter & Crates */}
      <rect x="18" y="56" width="48" height="26" rx="1" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      <rect x="23" y="62" width="16" height="14" rx="0.5" stroke="#159A68" strokeWidth="0.8" strokeOpacity="0.7" />
      <rect x="45" y="62" width="16" height="14" rx="0.5" stroke="#F4A340" strokeWidth="0.8" strokeOpacity="0.7" />

      {/* Right Market Stall / Canopy */}
      <path d="M72 40 L98 24 L124 40 Z" stroke="#0B1736" strokeWidth="1.2" fill="#F4F7FB" />
      <path d="M85 32 L89 40" stroke="#159A68" strokeWidth="1" />
      <path d="M98 24 L98 40" stroke="#F4A340" strokeWidth="1" />
      <path d="M111 32 L107 40" stroke="#159A68" strokeWidth="1" />
      {/* Stall Posts */}
      <line x1="76" y1="40" x2="76" y2="82" stroke="#0B1736" strokeWidth="1" />
      <line x1="120" y1="40" x2="120" y2="82" stroke="#0B1736" strokeWidth="1" />
      {/* Market Display Table */}
      <rect x="76" y="54" width="44" height="28" rx="1" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      {/* Pots / Jars on Table */}
      <path d="M85 54 C 82 48, 92 48, 89 54 Z" stroke="#F4A340" strokeWidth="1" fill="#FFFFFF" />
      <path d="M99 54 C 96 46, 108 46, 105 54 Z" stroke="#159A68" strokeWidth="1" fill="#FFFFFF" />

      {/* Decorative Bunting / Garland Between Stalls */}
      <path d="M42 22 Q 57 32 72 24" stroke="#F4A340" strokeWidth="0.8" strokeDasharray="2 2" />
      <polygon points="50,28 53,33 47,33" fill="#159A68" fillOpacity="0.7" />
      <polygon points="63,28 66,33 60,33" fill="#F4A340" fillOpacity="0.7" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 3. CUSTOMERS: Community Patronage & Commercial Relationship
// ---------------------------------------------------------------------------
function CustomersCommunityArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Floor Line */}
      <line x1="10" y1="82" x2="130" y2="82" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />

      {/* Counter Desk */}
      <rect x="52" y="52" width="36" height="30" rx="1" stroke="#0B1736" strokeWidth="1.2" fill="#FFFFFF" />
      <line x1="52" y1="62" x2="88" y2="62" stroke="#159A68" strokeWidth="0.8" strokeOpacity="0.6" />
      <line x1="70" y1="62" x2="70" y2="82" stroke="#0B1736" strokeWidth="0.75" strokeOpacity="0.3" />

      {/* Left Entrepreneur Figure (behind/at desk) */}
      <circle cx="40" cy="30" r="7" stroke="#0B1736" strokeWidth="1.2" />
      <path d="M26 56 C 26 44, 33 40, 40 40 C 47 40, 54 44, 54 56" stroke="#0B1736" strokeWidth="1.2" />
      <path d="M40 40 L40 54" stroke="#159A68" strokeWidth="1" strokeLinecap="round" />
      {/* Hand extending forward */}
      <path d="M48 48 Q 56 46 62 48" stroke="#0B1736" strokeWidth="1" strokeLinecap="round" />

      {/* Right Customer Figure (at counter) */}
      <circle cx="100" cy="28" r="7" stroke="#0B1736" strokeWidth="1.2" />
      {/* Dupatta / Shawl line */}
      <path d="M94 28 Q 90 38 92 48" stroke="#F4A340" strokeWidth="1" strokeLinecap="round" />
      <path d="M86 56 C 86 42, 93 38, 100 38 C 107 38, 114 42, 114 56" stroke="#0B1736" strokeWidth="1.2" />
      {/* Hand receiving */}
      <path d="M92 48 Q 84 46 76 48" stroke="#0B1736" strokeWidth="1" strokeLinecap="round" />

      {/* Parcel / Trade Good on Counter */}
      <rect x="64" y="44" width="12" height="8" rx="0.5" stroke="#F4A340" strokeWidth="1" fill="#FFFFFF" />
      <line x1="70" y1="44" x2="70" y2="52" stroke="#159A68" strokeWidth="0.75" />

      {/* Background Radiating Arc of Community Trust */}
      <path d="M50 20 Q 70 8 90 20" stroke="#159A68" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.7" />
      <circle cx="70" cy="14" r="2" fill="#F4A340" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 4. OPERATIONS: Factory Workshop, Sawtooth Roof, Precision Machinery
// ---------------------------------------------------------------------------
function OperationsWorkshopArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Plinth */}
      <line x1="8" y1="82" x2="132" y2="82" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="85" x2="124" y2="85" stroke="#159A68" strokeWidth="0.8" strokeOpacity="0.5" strokeLinecap="round" />

      {/* Industrial Sawtooth Roof & Factory Silhouette */}
      <path
        d="M16 82 L16 38 L38 24 L38 38 L60 24 L60 38 L82 24 L82 82 Z"
        stroke="#0B1736"
        strokeWidth="1.25"
        fill="#F4F7FB"
      />
      {/* Skylight Louvres */}
      <line x1="24" y1="36" x2="36" y2="28" stroke="#F4A340" strokeWidth="1" />
      <line x1="46" y1="36" x2="58" y2="28" stroke="#159A68" strokeWidth="1" />
      <line x1="68" y1="36" x2="80" y2="28" stroke="#F4A340" strokeWidth="1" />

      {/* Ventilation Stack / Chimney */}
      <rect x="74" y="12" width="6" height="12" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      <line x1="72" y1="12" x2="82" y2="12" stroke="#0B1736" strokeWidth="1" />
      {/* Smoke rings */}
      <circle cx="77" cy="6" r="2" stroke="#159A68" strokeWidth="0.75" strokeOpacity="0.6" strokeDasharray="1.5 1.5" />

      {/* Factory Roll-Up Shutter Door */}
      <rect x="28" y="52" width="22" height="30" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      <line x1="28" y1="58" x2="50" y2="58" stroke="#0B1736" strokeWidth="0.75" strokeOpacity="0.4" />
      <line x1="28" y1="64" x2="50" y2="64" stroke="#0B1736" strokeWidth="0.75" strokeOpacity="0.4" />
      <line x1="28" y1="70" x2="50" y2="70" stroke="#0B1736" strokeWidth="0.75" strokeOpacity="0.4" />
      <line x1="28" y1="76" x2="50" y2="76" stroke="#0B1736" strokeWidth="0.75" strokeOpacity="0.4" />

      {/* Precision Machinery Cogwheels on Right */}
      <circle cx="106" cy="46" r="14" stroke="#0B1736" strokeWidth="1.2" />
      <circle cx="106" cy="46" r="8" stroke="#159A68" strokeWidth="1" />
      <circle cx="106" cy="46" r="3" fill="#0B1736" />
      {/* Cog Teeth */}
      <line x1="106" y1="28" x2="106" y2="32" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="106" y1="60" x2="106" y2="64" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="88" y1="46" x2="92" y2="46" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="120" y1="46" x2="124" y2="46" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="93" y1="33" x2="96" y2="36" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="116" y1="56" x2="119" y2="59" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="93" y1="59" x2="96" y2="56" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="116" y1="36" x2="119" y2="33" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />

      {/* Secondary Interlocking Gear */}
      <circle cx="122" cy="68" r="9" stroke="#F4A340" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="122" cy="68" r="2.5" fill="#F4A340" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 5. MARKETING: Outreach, Broadcast, Digital Signage & Distribution Channels
// ---------------------------------------------------------------------------
function MarketingOutreachArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Baseline */}
      <line x1="10" y1="82" x2="130" y2="82" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />

      {/* Broadcast Megaphone / Loudspeaker */}
      <path d="M22 42 L36 34 L36 58 L22 50 Z" stroke="#0B1736" strokeWidth="1.2" fill="#FFFFFF" />
      <path d="M36 34 L66 18 L66 74 L36 58 Z" stroke="#0B1736" strokeWidth="1.25" fill="#F4F7FB" />
      <ellipse cx="66" cy="46" rx="4" ry="28" stroke="#159A68" strokeWidth="1.2" />
      <rect x="16" y="44" width="6" height="4" rx="0.5" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      {/* Handle */}
      <path d="M28 54 L32 70 L38 68 L34 52" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />

      {/* Radiating Sound / Outreach Broadcast Waves */}
      <path d="M76 34 Q 84 46 76 58" stroke="#F4A340" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M84 26 Q 96 46 84 66" stroke="#159A68" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M92 18 Q 108 46 92 74" stroke="#0B1736" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 3" strokeLinecap="round" />

      {/* Digital Channel Icons / Waypoint Markers */}
      <g transform="translate(104, 22)">
        <rect x="0" y="0" width="22" height="16" rx="2" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
        <line x1="4" y1="5" x2="18" y2="5" stroke="#159A68" strokeWidth="0.8" />
        <line x1="4" y1="9" x2="14" y2="9" stroke="#F4A340" strokeWidth="0.8" />
      </g>
      <g transform="translate(108, 48)">
        <circle cx="10" cy="10" r="10" stroke="#159A68" strokeWidth="1" fill="#FFFFFF" />
        <path d="M6 10 L9 13 L15 7" stroke="#159A68" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 6. GOVERNMENT: Civic Secretariat, Classical Colonnade, Institutional Dome
// ---------------------------------------------------------------------------
function GovernmentCivicArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Stepped Plinth Base */}
      <line x1="8" y1="82" x2="132" y2="82" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="78" x2="126" y2="78" stroke="#0B1736" strokeWidth="1" />
      <line x1="20" y1="74" x2="120" y2="74" stroke="#159A68" strokeWidth="0.8" strokeOpacity="0.6" />

      {/* Classical Colonnade Pillars */}
      <rect x="26" y="38" width="6" height="36" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      <rect x="42" y="38" width="6" height="36" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      <rect x="58" y="38" width="6" height="36" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      <rect x="76" y="38" width="6" height="36" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      <rect x="92" y="38" width="6" height="36" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
      <rect x="108" y="38" width="6" height="36" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />

      {/* Entablature / Architrave */}
      <rect x="20" y="32" width="100" height="6" stroke="#0B1736" strokeWidth="1.2" fill="#F4F7FB" />
      <line x1="20" y1="35" x2="120" y2="35" stroke="#F4A340" strokeWidth="0.75" />

      {/* Central Pediment */}
      <polygon points="20,32 70,18 120,32" stroke="#0B1736" strokeWidth="1.2" fill="#FFFFFF" />

      {/* Ashoka Wheel / Emblem Motif in Pediment */}
      <circle cx="70" cy="26" r="4.5" stroke="#159A68" strokeWidth="1" />
      <circle cx="70" cy="26" r="1.5" fill="#159A68" />
      <line x1="70" y1="21.5" x2="70" y2="30.5" stroke="#159A68" strokeWidth="0.6" />
      <line x1="65.5" y1="26" x2="74.5" y2="26" stroke="#159A68" strokeWidth="0.6" />

      {/* Central Dome behind Pediment */}
      <path d="M52 18 C 52 8, 88 8, 88 18" stroke="#0B1736" strokeWidth="1" strokeOpacity="0.7" fill="#F4F7FB" />
      <line x1="70" y1="8" x2="70" y2="4" stroke="#F4A340" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="70" cy="3" r="1.5" fill="#F4A340" />

      {/* Tricolor Ribbon Arc Accent */}
      <path d="M14 26 Q 70 2 126 26" stroke="#F4A340" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="3 3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 7. FINANCIAL: Accounting Ledger, Rupee Coins, Precision Balance Scale
// ---------------------------------------------------------------------------
function FinancialLedgerArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Baseline */}
      <line x1="10" y1="82" x2="130" y2="82" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />

      {/* Double Pan Balance Scale on Left */}
      <line x1="38" y1="22" x2="38" y2="82" stroke="#0B1736" strokeWidth="1.25" />
      <circle cx="38" cy="22" r="2.5" fill="#F4A340" />
      <path d="M20 28 L38 24 L56 28" stroke="#0B1736" strokeWidth="1.2" strokeLinecap="round" />
      {/* Left Pan */}
      <line x1="20" y1="28" x2="15" y2="44" stroke="#0B1736" strokeWidth="0.75" />
      <line x1="20" y1="28" x2="25" y2="44" stroke="#0B1736" strokeWidth="0.75" />
      <path d="M13 44 C 13 49, 27 49, 27 44 Z" stroke="#159A68" strokeWidth="1" fill="#FFFFFF" />
      {/* Right Pan */}
      <line x1="56" y1="28" x2="51" y2="44" stroke="#0B1736" strokeWidth="0.75" />
      <line x1="56" y1="28" x2="61" y2="44" stroke="#0B1736" strokeWidth="0.75" />
      <path d="M49 44 C 49 49, 63 49, 63 44 Z" stroke="#F4A340" strokeWidth="1" fill="#FFFFFF" />

      {/* Accounting Ledger / Bahi-Khata on Right */}
      <g transform="translate(68, 30)">
        {/* Open Book Pages */}
        <path d="M6 46 L6 14 C 18 10, 28 14, 30 18 C 32 14, 42 10, 54 14 L54 46 C 42 42, 32 46, 30 46 C 28 46, 18 42, 6 46 Z" stroke="#0B1736" strokeWidth="1.2" fill="#FFFFFF" />
        <line x1="30" y1="18" x2="30" y2="46" stroke="#0B1736" strokeWidth="1" />
        {/* Ledger Rupee Symbol & Lines */}
        <text x="12" y="27" fill="#159A68" fontSize="8" fontWeight="bold" fontFamily="sans-serif">₹</text>
        <line x1="20" y1="25" x2="27" y2="25" stroke="#0B1736" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="12" y1="32" x2="27" y2="32" stroke="#0B1736" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="12" y1="38" x2="27" y2="38" stroke="#0B1736" strokeWidth="0.6" strokeOpacity="0.5" />
        {/* Right page lines */}
        <line x1="34" y1="25" x2="48" y2="25" stroke="#F4A340" strokeWidth="0.75" />
        <line x1="34" y1="32" x2="48" y2="32" stroke="#0B1736" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="34" y1="38" x2="48" y2="38" stroke="#0B1736" strokeWidth="0.6" strokeOpacity="0.5" />
        {/* Bookmark Ribbon */}
        <path d="M30 18 L30 52 L33 49 L36 52 L36 46" stroke="#F4A340" strokeWidth="0.75" fill="#F4A340" fillOpacity="0.4" />
      </g>

      {/* Stacked Rupee Coin Edges */}
      <g transform="translate(108, 54)">
        <ellipse cx="14" cy="22" rx="12" ry="4" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
        <ellipse cx="14" cy="17" rx="12" ry="4" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
        <ellipse cx="14" cy="12" rx="12" ry="4" stroke="#159A68" strokeWidth="1" fill="#FFFFFF" />
        <ellipse cx="14" cy="7" rx="12" ry="4" stroke="#F4A340" strokeWidth="1.2" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 8. LOCATION: India Geographic Contour, Compass Rose, District Waypoint
// ---------------------------------------------------------------------------
function LocationIndiaArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Drafting Lat/Long Grid */}
      <line x1="15" y1="45" x2="125" y2="45" stroke="#0B1736" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 3" />
      <line x1="70" y1="8" x2="70" y2="82" stroke="#0B1736" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 3" />

      {/* Stylized Contour of India */}
      <path
        d="M62 10 
           C 66 12, 74 12, 78 16 
           C 82 20, 84 26, 88 30 
           C 96 32, 104 34, 108 38 
           C 112 42, 106 46, 100 48 
           C 96 52, 92 56, 86 64 
           C 80 72, 74 80, 70 84 
           C 66 80, 60 72, 54 64 
           C 48 56, 44 50, 42 44 
           C 40 38, 44 32, 48 26 
           C 52 20, 58 14, 62 10 Z"
        stroke="#0B1736"
        strokeWidth="1.25"
        fill="#F4F7FB"
      />

      {/* Interior Administrative Region Accent Arcs */}
      <path d="M50 36 Q 66 40 82 34" stroke="#F4A340" strokeWidth="0.8" strokeDasharray="2 2" />
      <path d="M52 50 Q 70 54 86 48" stroke="#159A68" strokeWidth="0.8" strokeDasharray="2 2" />

      {/* Prominent District Location Pin */}
      <g transform="translate(68, 38)">
        <path
          d="M0 -14 C -6 -14, -10 -10, -10 -4 C -10 4, 0 10, 0 10 C 0 10, 10 4, 10 -4 C 10 -10, 6 -14, 0 -14 Z"
          stroke="#159A68"
          strokeWidth="1.2"
          fill="#FFFFFF"
        />
        <circle cx="0" cy="-4" r="3" fill="#F4A340" />
      </g>

      {/* Small Nautical / Precision Compass Rose (Top Right) */}
      <g transform="translate(116, 20)">
        <circle cx="0" cy="0" r="12" stroke="#0B1736" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="2 2" />
        <line x1="0" y1="-12" x2="0" y2="12" stroke="#0B1736" strokeWidth="0.8" strokeOpacity="0.5" />
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#0B1736" strokeWidth="0.8" strokeOpacity="0.5" />
        <polygon points="0,-10 2.5,-3 0,0 -2.5,-3" fill="#159A68" />
        <polygon points="0,10 2.5,3 0,0 -2.5,3" fill="#F4A340" />
        <text x="-2" y="-14" fill="#0B1736" fontSize="6" fontWeight="bold" fontFamily="sans-serif">N</text>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 9. RISK: Heraldic Shield, Climate Umbrella, Resilience Crest
// ---------------------------------------------------------------------------
function RiskShieldArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Baseline */}
      <line x1="10" y1="82" x2="130" y2="82" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />

      {/* Central Heraldic Shield */}
      <path
        d="M70 12 
           C 86 12, 102 18, 102 36 
           C 102 58, 86 72, 70 80 
           C 54 72, 38 58, 38 36 
           C 38 18, 54 12, 70 12 Z"
        stroke="#0B1736"
        strokeWidth="1.25"
        fill="#F4F7FB"
      />
      {/* Inner Shield Rim */}
      <path
        d="M70 18 
           C 82 18, 96 22, 96 36 
           C 96 54, 82 66, 70 73 
           C 58 66, 44 54, 44 36 
           C 44 22, 58 18, 70 18 Z"
        stroke="#159A68"
        strokeWidth="0.8"
        strokeOpacity="0.6"
      />

      {/* Central Checkmark / Resilience Seal */}
      <path
        d="M58 42 L66 50 L82 32"
        stroke="#159A68"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Climate Umbrella / Weather Protection (Left) */}
      <g transform="translate(22, 28)">
        <path d="M0 16 C 0 4, 20 4, 20 16 Z" stroke="#F4A340" strokeWidth="1" fill="#FFFFFF" />
        <line x1="10" y1="16" x2="10" y2="34" stroke="#0B1736" strokeWidth="1" />
        <path d="M10 34 C 10 37, 7 37, 7 34" stroke="#0B1736" strokeWidth="1" fill="none" />
        {/* Rain droplets */}
        <line x1="2" y1="22" x2="0" y2="28" stroke="#159A68" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="18" y1="22" x2="16" y2="28" stroke="#159A68" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* Security Padlock / Assurance Key (Right) */}
      <g transform="translate(108, 38)">
        <rect x="0" y="8" width="16" height="14" rx="2" stroke="#0B1736" strokeWidth="1" fill="#FFFFFF" />
        <path d="M3 8 L3 4 C 3 1, 13 1, 13 4 L13 8" stroke="#F4A340" strokeWidth="1" fill="none" />
        <circle cx="8" cy="14" r="1.5" fill="#0B1736" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 10. MILESTONES: Winding Pathway, Milestone Marker Stones, Flagpost
// ---------------------------------------------------------------------------
function MilestonesRoadmapArt() {
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Baseline */}
      <line x1="10" y1="82" x2="130" y2="82" stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" />

      {/* Winding Pathway */}
      <path
        d="M14 78 Q 45 74 60 56 T 100 36 T 124 24"
        stroke="#0B1736"
        strokeWidth="1.25"
        strokeDasharray="4 3"
        fill="none"
      />
      <path
        d="M22 82 Q 52 78 68 60 T 108 40 T 130 28"
        stroke="#159A68"
        strokeWidth="0.8"
        strokeOpacity="0.4"
        fill="none"
      />

      {/* Milestone 1 Marker Stone */}
      <g transform="translate(24, 52)">
        <path d="M0 26 L0 8 C 0 2, 14 2, 14 8 L14 26 Z" stroke="#0B1736" strokeWidth="1.2" fill="#FFFFFF" />
        <line x1="0" y1="12" x2="14" y2="12" stroke="#F4A340" strokeWidth="0.8" />
        <text x="3.5" y="21" fill="#0B1736" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">M1</text>
      </g>

      {/* Milestone 2 Marker Stone */}
      <g transform="translate(68, 34)">
        <path d="M0 26 L0 8 C 0 2, 14 2, 14 8 L14 26 Z" stroke="#0B1736" strokeWidth="1.2" fill="#FFFFFF" />
        <line x1="0" y1="12" x2="14" y2="12" stroke="#159A68" strokeWidth="0.8" />
        <text x="3.5" y="21" fill="#0B1736" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">M2</text>
      </g>

      {/* Milestone 3 Target / Flagpost at Peak */}
      <g transform="translate(112, 10)">
        <line x1="4" y1="4" x2="4" y2="40" stroke="#0B1736" strokeWidth="1.2" strokeLinecap="round" />
        <polygon points="4,6 22,12 4,18" stroke="#F4A340" strokeWidth="1" fill="#F4A340" fillOpacity="0.25" />
        <circle cx="4" cy="4" r="1.5" fill="#F4A340" />
        <path d="M0 40 L8 40" stroke="#0B1736" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}
