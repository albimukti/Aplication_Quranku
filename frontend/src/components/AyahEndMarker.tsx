import React from 'react';

export function toArabicDigits(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .replace(/[0-9]/g, (w) => arabicDigits[parseInt(w, 10)]);
}

interface AyahEndMarkerProps {
  number: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AyahEndMarker: React.FC<AyahEndMarkerProps> = ({
  number,
  className = '',
  size = 'md',
}) => {
  const arabicNum = toArabicDigits(number);

  const sizeClass = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-10 h-10 sm:w-11 sm:h-11',
  }[size];

  const fontSize = arabicNum.length >= 3 ? 10.5 : arabicNum.length === 2 ? 12.5 : 14.5;

  return (
    <span
      className={`inline-flex items-center justify-center align-middle mx-2.5 select-none ${className}`}
      dir="rtl"
      title={`Ayat ${number}`}
    >
      <svg
        viewBox="0 0 44 44"
        className={`${sizeClass} drop-shadow-sm flex-shrink-0`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Islamic Green Border */}
        <circle
          cx="22"
          cy="22"
          r="19"
          fill="#ECFDF5"
          stroke="#059669"
          strokeWidth="1.8"
        />
        {/* Inner Gold Rosette Ring */}
        <circle
          cx="22"
          cy="22"
          r="16"
          fill="none"
          stroke="#D97706"
          strokeWidth="1"
          strokeDasharray="2 1.5"
        />
        {/* Mushaf Standar Indonesia Petals at Cardinal Points */}
        <path d="M22 1 L24 4 L20 4 Z" fill="#047857" />
        <path d="M22 43 L24 40 L20 40 Z" fill="#047857" />
        <path d="M1 22 L4 20 L4 24 Z" fill="#047857" />
        <path d="M43 22 L40 20 L40 24 Z" fill="#047857" />

        {/* Small corner jewels */}
        <circle cx="8" cy="8" r="1" fill="#F59E0B" />
        <circle cx="36" cy="8" r="1" fill="#F59E0B" />
        <circle cx="8" cy="36" r="1" fill="#F59E0B" />
        <circle cx="36" cy="36" r="1" fill="#F59E0B" />

        {/* Arabic Numeral Centered Exactly INSIDE the Circle */}
        <text
          x="22"
          y="23.5"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'LPMQ Isep Misbah', 'Amiri Quran', 'Scheherazade New', serif"
          fontWeight="bold"
          fontSize={fontSize}
          fill="#064E3B"
        >
          {arabicNum}
        </text>
      </svg>
    </span>
  );
};
