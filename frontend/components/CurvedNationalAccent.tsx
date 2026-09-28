import React from 'react';

interface CurvedNationalAccentProps {
  variant?: 'corner' | 'corner-left' | 'header-ribbon';
  className?: string;
  opacity?: number;
}

/**
 * Restrained Saffron / White / Green curved accent inspired by official Indian government report aesthetics.
 * Kept subtle and elegant; strictly non-distracting.
 */
export default function CurvedNationalAccent({
  variant = 'corner',
  className = '',
  opacity = 0.9,
}: CurvedNationalAccentProps) {
  if (variant === 'header-ribbon') {
    return (
      <div
        className={`w-full overflow-hidden pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1200 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-2.5 sm:h-3 block"
          preserveAspectRatio="none"
        >
          {/* Top Saffron Wave */}
          <path
            d="M0 0 L1200 0 L1200 4 C900 6, 600 2, 300 5 C150 6.5, 50 4, 0 4 Z"
            fill="#F4A340"
          />
          {/* White / Light Accent Middle Separator */}
          <path
            d="M0 4 C50 4, 150 6.5, 300 5 C600 2, 900 6, 1200 4 L1200 6 C900 8, 600 4, 300 7 C150 8.5, 50 6, 0 6 Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          {/* Bottom Green Wave */}
          <path
            d="M0 6 C50 6, 150 8.5, 300 7 C600 4, 900 8, 1200 6 L1200 10 C900 12, 600 8, 300 11 C150 12.5, 50 10, 0 10 Z"
            fill="#159A68"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'corner-left') {
    return (
      <div
        className={`absolute top-0 left-0 w-28 sm:w-36 h-28 sm:h-36 overflow-hidden pointer-events-none select-none z-0 ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Deep Navy Ground */}
          <path d="M0 0 L100 0 C70 15, 30 45, 0 85 Z" fill="#0B1736" fillOpacity="0.06" />
          {/* Saffron Ribbon Arc */}
          <path
            d="M0 0 L65 0 C45 25, 20 50, 0 65 Z"
            fill="#F4A340"
            fillOpacity="0.85"
          />
          {/* White Separator Arc */}
          <path
            d="M0 15 C15 35, 35 48, 50 0 L44 0 C30 40, 12 28, 0 10 Z"
            fill="#FFFFFF"
            fillOpacity="0.9"
          />
          {/* Indian Green Inner Arc */}
          <path
            d="M0 0 L32 0 C20 22, 10 32, 0 32 Z"
            fill="#159A68"
            fillOpacity="0.9"
          />
        </svg>
      </div>
    );
  }

  // Default: Top-Right Corner Sweep
  return (
    <div
      className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Soft Background Arc */}
        <path d="M100 0 L0 0 C30 15, 70 45, 100 85 Z" fill="#0B1736" fillOpacity="0.05" />
        {/* Saffron Outer Arc */}
        <path
          d="M100 0 L35 0 C55 25, 80 50, 100 65 Z"
          fill="#F4A340"
          fillOpacity="0.8"
        />
        {/* White Accent Divider */}
        <path
          d="M100 15 C85 35, 65 48, 50 0 L56 0 C70 40, 88 28, 100 10 Z"
          fill="#FFFFFF"
          fillOpacity="0.85"
        />
        {/* Indian Green Inner Arc */}
        <path
          d="M100 0 L68 0 C80 22, 90 32, 100 32 Z"
          fill="#159A68"
          fillOpacity="0.85"
        />
      </svg>
    </div>
  );
}
