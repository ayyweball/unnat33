import React from 'react';

interface AshokaLionEmblemProps {
  className?: string;
  size?: number;
  monochrome?: boolean;
}

/**
 * Ashoka Lion Capital (State Emblem of India)
 * Used sparingly in official institutional & report authority headers.
 */
export default function AshokaLionEmblem({
  className = '',
  size = 48,
  monochrome = true,
}: AshokaLionEmblemProps) {
  const primaryColor = monochrome ? 'currentColor' : '#0B1736';
  const goldColor = monochrome ? 'currentColor' : '#D97706';

  return (
    <div
      className={`inline-flex flex-col items-center justify-center shrink-0 ${className}`}
      style={{ width: size, minWidth: size }}
      title="State Emblem of India / सत्यमेव जयते"
      aria-label="State Emblem of India"
    >
      <svg
        viewBox="0 0 100 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Top Lions Crown / Crest */}
        <g stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Central Lion Head */}
          <path d="M50 12 C46 12 43 15 43 19 C43 23 45 26 47 28 C45 30 44 33 44 37 C44 42 47 46 50 48 C53 46 56 42 56 37 C56 33 55 30 53 28 C55 26 57 23 57 19 C57 15 54 12 50 12 Z" />
          <path d="M47 20 Q50 18 53 20" />
          <circle cx="47" cy="23" r="1" fill={primaryColor} />
          <circle cx="53" cy="23" r="1" fill={primaryColor} />
          <path d="M49 26 Q50 28 51 26" />
          <path d="M46 32 C48 34 52 34 54 32" />
          {/* Mane Details */}
          <path d="M44 26 C40 28 39 33 40 38 C41 42 45 45 47 46" />
          <path d="M56 26 C60 28 61 33 60 38 C59 42 55 45 53 46" />
          
          {/* Left Lion Profile */}
          <path d="M42 22 C37 20 33 21 31 25 C29 29 30 34 32 37 C30 40 30 45 33 49 C36 53 40 55 44 55" />
          <circle cx="34" cy="28" r="1" fill={primaryColor} />
          <path d="M30 33 Q33 34 35 32" />
          <path d="M34 40 C32 44 33 48 36 51" />

          {/* Right Lion Profile */}
          <path d="M58 22 C63 20 67 21 69 25 C71 29 70 34 68 37 C70 40 70 45 67 49 C64 53 60 55 56 55" />
          <circle cx="66" cy="28" r="1" fill={primaryColor} />
          <path d="M70 33 Q67 34 65 32" />
          <path d="M66 40 C68 44 67 48 64 51" />

          {/* Torso & Forelegs Pillars */}
          <path d="M40 48 L39 68 L44 68 L45 52" />
          <path d="M60 48 L61 68 L56 68 L55 52" />
          <path d="M46 52 L46 68 L54 68 L54 52" />

          {/* Base Abacus Platform */}
          <rect x="22" y="68" width="56" height="5" rx="1.5" fill={primaryColor} fillOpacity="0.08" />
          <rect x="20" y="73" width="60" height="15" rx="2" />
        </g>

        {/* Ashoka Chakra in Abacus Center */}
        <g transform="translate(50, 80.5)">
          <circle cx="0" cy="0" r="5.5" stroke={primaryColor} strokeWidth="1.2" fill="none" />
          <circle cx="0" cy="0" r="1" fill={primaryColor} />
          {/* 12 cross-spokes representing 24 spokes */}
          {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165].map((deg) => (
            <line
              key={deg}
              x1="-5.2"
              y1="0"
              x2="5.2"
              y2="0"
              stroke={primaryColor}
              strokeWidth="0.6"
              transform={`rotate(${deg})`}
            />
          ))}
        </g>

        {/* Flanking Galloping Horse (Left) & Humped Bull (Right) simplified reliefs */}
        <g stroke={primaryColor} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.8">
          {/* Left: Horse */}
          <path d="M26 83 C28 80 32 80 34 82 C36 84 37 83 39 80" />
          <path d="M28 85 L29 87 M35 85 L36 87" />
          {/* Right: Bull */}
          <path d="M61 80 C63 82 65 82 67 80 C69 82 73 82 75 83" />
          <path d="M64 85 L64 87 M71 85 L71 87" />
        </g>

        {/* Lower Inverted Lotus Base */}
        <g stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M24 88 C30 94 40 97 50 97 C60 97 70 94 76 88" />
          <path d="M28 88 C35 93 42 95 50 95 C58 95 65 93 72 88" opacity="0.6" />
          <path d="M34 94 L33 98 M42 96 L41 99 M50 97 L50 100 M58 96 L59 99 M66 94 L67 98" strokeWidth="1" />
          <line x1="28" y1="100" x2="72" y2="100" strokeWidth="2" />
        </g>

        {/* Devanagari Script: सत्यमेव जयते */}
        <text
          x="50"
          y="114"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="system-ui, 'Noto Sans Devanagari', 'Mukta', sans-serif"
          fill={primaryColor}
          letterSpacing="0.04em"
        >
          सत्यमेव जयते
        </text>

        {/* English Translation subtle sub-caption */}
        <text
          x="50"
          y="124"
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          fill={primaryColor}
          opacity="0.65"
          letterSpacing="0.12em"
        >
          TRUTH ALONE TRIUMPHS
        </text>
      </svg>
    </div>
  );
}
