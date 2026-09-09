import React from 'react';

export const Icon3DQuran: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <img
    src="/logo.jpg"
    alt="Quranku logo"
    className={`${className} object-contain rounded-xl`}
  />
);

export const Icon3DMosque: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="domeGrad" x1="30" y1="15" x2="70" y2="55" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34D399" />
        <stop offset="0.6" stopColor="#059669" />
        <stop offset="1" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="goldAcc" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#FDE68A" />
        <stop offset="0.7" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Minaret Left */}
    <rect x="14" y="32" width="10" height="52" rx="2" fill="#E2E8F0" />
    <polygon points="14,32 19,18 24,32" fill="url(#domeGrad)" />
    <circle cx="19" cy="16" r="2.5" fill="url(#goldAcc)" />
    
    {/* Minaret Right */}
    <rect x="76" y="32" width="10" height="52" rx="2" fill="#E2E8F0" />
    <polygon points="76,32 81,18 86,32" fill="url(#domeGrad)" />
    <circle cx="81" cy="16" r="2.5" fill="url(#goldAcc)" />

    {/* Main Building Base */}
    <rect x="22" y="48" width="56" height="36" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
    {/* Central Arch Door */}
    <path d="M42 84V64C42 59.5817 45.5817 56 50 56C54.4183 56 58 59.5817 58 64V84H42Z" fill="url(#domeGrad)" />
    
    {/* Dome */}
    <path d="M28 48C28 32 38 20 50 16C62 20 72 32 72 48H28Z" fill="url(#domeGrad)" />
    {/* Dome Crescent Top */}
    <circle cx="50" cy="13" r="3" fill="url(#goldAcc)" />
    <path d="M50 10C50.8 10 51.5 10.3 52 10.8C51 11.2 50.5 12.2 50.5 13.2C50.5 14.2 51 15.2 52 15.6C51.5 16.1 50.8 16.4 50 16.4C48.1 16.4 46.6 14.9 46.6 13C46.6 11.1 48.1 10 50 10Z" fill="url(#goldAcc)" />
  </svg>
);

export const Icon3DKaaba: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cubeTop" x1="50" y1="18" x2="80" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#334155" />
        <stop offset="1" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="cubeLeft" x1="18" y1="40" x2="50" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="1" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="cubeRight" x1="50" y1="40" x2="82" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="goldBelt" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#F59E0B" />
        <stop offset="0.5" stopColor="#FDE68A" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Base shadow */}
    <ellipse cx="50" cy="88" rx="34" ry="7" fill="rgba(15, 23, 42, 0.15)" />
    {/* Kaaba Top Face */}
    <polygon points="50,18 82,34 50,48 18,34" fill="url(#cubeTop)" />
    {/* Kaaba Left Face */}
    <polygon points="18,34 50,48 50,84 18,70" fill="url(#cubeLeft)" />
    {/* Kaaba Right Face */}
    <polygon points="50,48 82,34 82,70 50,84" fill="url(#cubeRight)" />
    {/* Gold Kiswah Belt Left */}
    <polygon points="18,44 50,58 50,62 18,48" fill="url(#goldBelt)" />
    {/* Gold Kiswah Belt Right */}
    <polygon points="50,58 82,44 82,48 50,62" fill="url(#goldBelt)" />
    {/* Golden Door (Bab at-Taubah) */}
    <polygon points="58,56 68,51 68,74 58,79" fill="url(#goldBelt)" stroke="#B45309" strokeWidth="0.8" />
  </svg>
);

export const Icon3DCompass: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="compassDial" cx="50" cy="50" r="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.8" stopColor="#ECFDF5" />
        <stop offset="1" stopColor="#D1FAE5" />
      </radialGradient>
      <linearGradient id="needleNorth" x1="50" y1="20" x2="50" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EF4444" />
        <stop offset="1" stopColor="#B91C1C" />
      </linearGradient>
      <linearGradient id="needleSouth" x1="50" y1="50" x2="50" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#64748B" />
        <stop offset="1" stopColor="#334155" />
      </linearGradient>
    </defs>
    {/* Outer Ring */}
    <circle cx="50" cy="50" r="44" fill="#047857" stroke="#10B981" strokeWidth="2" />
    <circle cx="50" cy="50" r="40" fill="url(#compassDial)" stroke="#059669" strokeWidth="1.5" />
    {/* Cardinal Marks */}
    <text x="50" y="22" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle">N</text>
    <text x="82" y="53" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle">E</text>
    <text x="50" y="85" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle">S</text>
    <text x="18" y="53" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle">W</text>
    {/* Needle */}
    <polygon points="50,22 55,50 50,47 45,50" fill="url(#needleNorth)" />
    <polygon points="50,78 55,50 50,47 45,50" fill="url(#needleSouth)" />
    {/* Pivot */}
    <circle cx="50" cy="50" r="4.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
  </svg>
);

export const Icon3DZakat: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chestGrad" x1="20" y1="35" x2="80" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#047857" />
        <stop offset="1" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Charity Box */}
    <rect x="22" y="44" width="56" height="42" rx="8" fill="url(#chestGrad)" stroke="#10B981" strokeWidth="2" />
    <rect x="18" y="36" width="64" height="12" rx="4" fill="#065F46" stroke="#34D399" strokeWidth="1.5" />
    {/* Slot */}
    <rect x="38" y="40" width="24" height="4" rx="2" fill="#022C22" />
    {/* Gold Coin Falling In */}
    <circle cx="50" cy="30" r="14" fill="url(#coinGrad)" stroke="#B45309" strokeWidth="1.5" />
    <circle cx="50" cy="30" r="10" fill="none" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="3 1.5" />
    <text x="50" y="34" fill="#78350F" fontSize="12" fontWeight="bold" textAnchor="middle">Rp</text>
    {/* Emblem on chest */}
    <circle cx="50" cy="65" r="9" fill="url(#coinGrad)" />
    <path d="M50 59L52 63H56L53 66L54 70L50 67L46 70L47 66L44 63H48L50 59Z" fill="#78350F" />
  </svg>
);

export const Icon3DPrayer: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="clockRing" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* Clock Base */}
    <circle cx="50" cy="52" r="36" fill="url(#clockRing)" />
    <circle cx="50" cy="52" r="30" fill="#FFFFFF" />
    {/* Bells on top */}
    <circle cx="28" cy="24" r="9" fill="#F59E0B" />
    <circle cx="72" cy="24" r="9" fill="#F59E0B" />
    <rect x="47" y="14" width="6" height="6" rx="2" fill="#D97706" />
    {/* Hands */}
    <line x1="50" y1="52" x2="50" y2="34" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="50" y1="52" x2="64" y2="52" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="50" cy="52" r="3.5" fill="#065F46" />
    {/* Feet */}
    <line x1="28" y1="84" x2="22" y2="92" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
    <line x1="72" y1="84" x2="78" y2="92" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const Icon3DIqro: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="iqroCover" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="0.7" stopColor="#D97706" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
    </defs>
    {/* Book Pages */}
    <rect x="22" y="18" width="58" height="68" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    {/* Book Front */}
    <rect x="18" y="14" width="64" height="68" rx="6" fill="url(#iqroCover)" stroke="#FEF3C7" strokeWidth="2" />
    {/* Header banner */}
    <rect x="28" y="24" width="44" height="14" rx="3" fill="#FFFFFF" />
    <text x="50" y="35" fill="#B45309" fontSize="10" fontWeight="bold" textAnchor="middle">IQRO'</text>
    {/* Big Arabic Letter Alif Ba */}
    <text x="50" y="62" fill="#FFFFFF" fontSize="26" fontFamily="Amiri, serif" fontWeight="bold" textAnchor="middle">ا ب ت</text>
    <circle cx="50" cy="74" r="3" fill="#FEF3C7" />
  </svg>
);
