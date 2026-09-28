import React from 'react';

interface IndianArchitecturalLineArtProps {
  className?: string;
}

/**
 * Clean architectural Indian line-art illustration.
 * Replaces the AI-generated hero image on the DPR advisory page.
 * Features institutional elevation lines, classical colonnade, central dome,
 * and subtle saffron/green accent lines.
 */
export default function IndianArchitecturalLineArt({
  className = '',
}: IndianArchitecturalLineArtProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 540 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Soft Background Tint Layers */}
        <defs>
          <linearGradient id="archSky" x1="0" y1="0" x2="0" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F0F4F9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="goldAccent" x1="0" y1="0" x2="540" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F4A340" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#F4A340" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F4A340" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="greenAccent" x1="0" y1="0" x2="540" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#159A68" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#159A68" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#159A68" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="540" height="340" fill="url(#archSky)" />

        {/* Subtle Drafting Grid Lines */}
        <g stroke="#0B1736" strokeOpacity="0.04" strokeWidth="0.75" strokeDasharray="3 3">
          <line x1="40" y1="60" x2="500" y2="60" />
          <line x1="40" y1="120" x2="500" y2="120" />
          <line x1="40" y1="180" x2="500" y2="180" />
          <line x1="40" y1="240" x2="500" y2="240" />
          <line x1="120" y1="30" x2="120" y2="310" />
          <line x1="270" y1="30" x2="270" y2="310" />
          <line x1="420" y1="30" x2="420" y2="310" />
        </g>

        {/* Outer Concentric Radiating Architectural Halo */}
        <circle cx="270" cy="115" r="95" stroke="#F4A340" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 4" />
        <circle cx="270" cy="115" r="75" stroke="#159A68" strokeWidth="0.75" strokeOpacity="0.2" />

        {/* Central Dome & Finial (Rashtrapati Bhavan / Parliament style) */}
        <g stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Finial Kalash / Spire */}
          <line x1="270" y1="32" x2="270" y2="52" strokeWidth="2" stroke="#F4A340" />
          <circle cx="270" cy="30" r="3" fill="#F4A340" stroke="#0B1736" strokeWidth="1.2" />
          <ellipse cx="270" cy="42" rx="4" ry="2" fill="#FFFFFF" stroke="#0B1736" strokeWidth="1" />
          
          {/* Dome Ribs and Curves */}
          <path d="M225 95 C225 55, 315 55, 315 95 Z" fill="#FFFFFF" fillOpacity="0.7" />
          <path d="M238 95 C240 68, 300 68, 302 95" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M252 95 C254 62, 286 62, 288 95" strokeOpacity="0.4" strokeWidth="1" />
          <line x1="270" y1="52" x2="270" y2="95" strokeOpacity="0.3" strokeWidth="1" />

          {/* Dome Drum / Base with Small Arches */}
          <rect x="220" y="95" width="100" height="15" fill="#F8FAFC" />
          {[228, 240, 252, 264, 276, 288, 300].map((x) => (
            <rect key={x} x={x} y="98" width="8" height="9" rx="4" fill="#0B1736" fillOpacity="0.08" strokeWidth="0.8" />
          ))}

          {/* Main Pediment / Entablature */}
          <path d="M190 115 L270 98 L350 115 Z" fill="#FFFFFF" />
          <line x1="180" y1="115" x2="360" y2="115" strokeWidth="2" />
          <line x1="170" y1="122" x2="370" y2="122" strokeWidth="1.5" />
          <line x1="80" y1="130" x2="460" y2="130" strokeWidth="2" />
        </g>

        {/* Ashoka Wheel Emblem in Central Pediment */}
        <circle cx="270" cy="110" r="4.5" stroke="#F4A340" strokeWidth="1" fill="#FFFFFF" />
        <circle cx="270" cy="110" r="1" fill="#F4A340" />

        {/* Colonnade & Pillars */}
        <g stroke="#0B1736" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="#FFFFFF">
          {/* Main Classical Pillars (14 Grand Columns) */}
          {[95, 120, 145, 170, 195, 220, 245, 270, 295, 320, 345, 370, 395, 420, 445].map((x) => (
            <g key={x}>
              {/* Column Capital */}
              <path d={`M${x - 6} 130 L${x + 6} 130 L${x + 4} 135 L${x - 4} 135 Z`} fill="#F8FAFC" />
              {/* Column Shaft */}
              <line x1={x - 3} y1="135" x2={x - 3} y2="230" strokeWidth="1" />
              <line x1={x + 3} y1="135" x2={x + 3} y2="230" strokeWidth="1" />
              <line x1={x} y1="137" x2={x} y2="228" strokeOpacity="0.15" strokeWidth="0.75" />
              {/* Column Base */}
              <rect x={x - 5} y="230" width="10" height="4" rx="0.5" fill="#F8FAFC" />
            </g>
          ))}
        </g>

        {/* Arched Portals between Core Central Columns */}
        <g stroke="#0B1736" strokeWidth="1" fill="none" opacity="0.4">
          {[207.5, 232.5, 257.5, 282.5, 307.5, 332.5].map((x) => (
            <path key={x} d={`M${x - 7} 210 L${x - 7} 175 C${x - 7} 165, ${x + 7} 165, ${x + 7} 175 L${x + 7} 210`} />
          ))}
        </g>

        {/* Central Entrance Gateway Arch */}
        <g stroke="#0B1736" strokeWidth="1.5" fill="#FFFFFF">
          <path d="M250 230 L250 180 C250 165, 290 165, 290 180 L290 230" />
          <path d="M255 230 L255 185 C255 174, 285 174, 285 185 L285 230" strokeOpacity="0.3" strokeWidth="1" />
        </g>

        {/* Monumental Stepped Plinth Base */}
        <g stroke="#0B1736" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#FFFFFF">
          <rect x="70" y="234" width="400" height="6" fill="#F8FAFC" />
          <rect x="55" y="240" width="430" height="7" fill="#F8FAFC" />
          <rect x="40" y="247" width="460" height="8" fill="#F8FAFC" />
          <line x1="20" y1="255" x2="520" y2="255" strokeWidth="2" />
        </g>

        {/* Subtle Saffron & Green Horizon Accents */}
        <line x1="40" y1="262" x2="500" y2="262" stroke="url(#goldAccent)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="267" x2="480" y2="267" stroke="url(#greenAccent)" strokeWidth="2" strokeLinecap="round" />

        {/* Clean Blueprint Style Dimension & Labeling Notes */}
        <g fontFamily="monospace" fontSize="8" fill="#0B1736" fillOpacity="0.4" letterSpacing="0.08em">
          <text x="50" y="288">FIG 1.0 — INSTITUTIONAL ELEVATION &amp; STATUTORY FORMAT</text>
          <text x="50" y="302">SCALE: 1:100 ARCHITECTURAL BLUEPRINT // UNNATE ADVISORY</text>
          <text x="390" y="302">Estd. MSME 2026</text>
        </g>
      </svg>
    </div>
  );
}
