import React from 'react';

export interface TajweedRule {
  id: string;
  name: string;
  color: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  howToRead: string;
  harakatCount: string;
  example: string;
  letters: string;
}

export const TAJWEED_RULES: Record<string, TajweedRule> = {
  mad: {
    id: 'mad',
    name: 'Mad Wajib / Jaiz / Lazim',
    color: '#DC2626', // Crimson Red
    textColor: 'text-red-600',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-900',
    badgeBorder: 'border-red-400',
    description: 'Terdapat tanda bendera gelombang (~) di atas huruf mad (Alif, Wawu, Ya).',
    howToRead: 'Wajib dipanjangkan dengan lembut dan teratur.',
    harakatCount: '4 sampai 6 Harakat (2,5 - 3 Alif)',
    example: 'جَآءَ - السَّمَآءِ - وَلَا الضَّآلِّينَ',
    letters: 'Alif (ا), Wawu (و), Ya (ي) dengan tanda bendera (ٓ / ~)',
  },
  ghunnah: {
    id: 'ghunnah',
    name: 'Ghunnah Musyaddadah',
    color: '#EC4899', // Vibrant Pink / Magenta
    textColor: 'text-pink-600',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-900',
    badgeBorder: 'border-pink-400',
    description: 'Huruf Nun bertasydid (نّ) atau Mim bertasydid (مّ).',
    howToRead: 'Wajib didengungkan ke pangkal hidung (khaisyum) dan ditahan sebelum melanjutkan.',
    harakatCount: '2 sampai 3 Harakat (ditahan sejenak)',
    example: 'إِنَّ - عَمَّ - مِنَ الْجِنَّةِ',
    letters: 'Nun Tasydid (نّ), Mim Tasydid (مّ)',
  },
  qalqalah: {
    id: 'qalqalah',
    name: 'Qalqalah (Sugra & Kubra)',
    color: '#0284C7', // Ocean / Sky Blue
    textColor: 'text-sky-600',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    badgeBorder: 'border-sky-400',
    description: 'Huruf Qalqalah berharakat sukun asli atau bersukun karena diwaqafkan.',
    howToRead: 'Dibaca memantul dengan gema yang jelas dan tegas.',
    harakatCount: 'Pantulan Jelas (Sugra ringan, Kubra kuat)',
    example: 'قُلْ هُوَ اللَّهُ أَحَدٌْ - الْفَلَقِْ - تَبَّتْ',
    letters: 'ب ج د ط ق (Disukai disingkat: Ba-Ju-Di-To-Ko)',
  },
  ikhfa: {
    id: 'ikhfa',
    name: "Ikhfa' Haqiqi",
    color: '#059669', // Emerald Green
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-400',
    description: 'Nun sukun (نْ) atau Tanwin bertemu salah satu dari 15 huruf Ikhfa.',
    howToRead: 'Dibaca samar-samar antara Idzhar dan Idgham, disertai dengung ke hidung.',
    harakatCount: '2 Harakat (berdengung samar)',
    example: 'مِن قَبْلُ - أَنفُسَهُمْ - كِتَابٌ كَرِيمٌ',
    letters: 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك',
  },
  idgham: {
    id: 'idgham',
    name: 'Idgham (Bighunnah & Bilaghunnah)',
    color: '#D97706', // Amber / Gold
    textColor: 'text-amber-600',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-400',
    description: 'Nun mati/tanwin melebur ke huruf Ya, Nun, Mim, Wawu (dengung) atau Lam, Ra (tanpa dengung).',
    howToRead: 'Bunyi huruf pertama dimasukkan / dileburkan ke dalam huruf berikutnya.',
    harakatCount: '2 Harakat (Bighunnah) / Tanpa dengung (Bilaghunnah)',
    example: 'مَن يَقُولُ - مِن مَّالٍ - مِّن رَّبِّهِمْ',
    letters: 'ي ن م و (Bighunnah) | ل ر (Bilaghunnah)',
  },
  iqlab: {
    id: 'iqlab',
    name: 'Iqlab',
    color: '#8B5CF6', // Royal Purple / Violet
    textColor: 'text-purple-600',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-400',
    description: 'Nun mati (نْ) atau Tanwin bertemu huruf Ba (ب). Terdapat tanda Mim kecil (ۭ).',
    howToRead: 'Suara Nun atau Tanwin ditukar menjadi suara Mim (م) disertai dengung halus.',
    harakatCount: '2 Harakat',
    example: 'مِنۢ بَعْدِ - أَنۢبِئْهُم - كِرَامٍۢ بَرَرَةٍ',
    letters: 'Ba (ب) setelah Nun Sukun / Tanwin',
  },
  idzhar: {
    id: 'idzhar',
    name: 'Idzhar Halqi / Syafawi',
    color: '#EA580C', // Tangerine / Deep Orange
    textColor: 'text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-900',
    badgeBorder: 'border-orange-400',
    description: 'Nun mati/tanwin bertemu huruf halq (tenggorokan), atau Mim sukun bertemu selain Mim & Ba.',
    howToRead: 'Dibaca jelas, tegas, dan terang tanpa dengung sama sekali.',
    harakatCount: '1 Harakat (Normal tanpa dengung)',
    example: 'مَنْ ءَامَنَ - أَنْعَمْتَ - كُفُوًا أَحَدٌ',
    letters: 'ء هـ ع ح غ خ (Halqi) | 26 Huruf hijaiyah selain Mim & Ba (Syafawi)',
  },
};

// High-speed word cache to avoid re-running regex checks on repeated words
const wordTajweedCache = new Map<string, { rule: TajweedRule | null; reason: string }>();

/**
 * Detects tajweed category in an Arabic word token (with O(1) cache)
 */
export function identifyWordTajweed(word: string): { rule: TajweedRule | null; reason: string } {
  const cached = wordTajweedCache.get(word);
  if (cached) return cached;

  let result: { rule: TajweedRule | null; reason: string } = { rule: null, reason: '' };

  // 1. Mad (contains maddah wave ~ or \u0653)
  if (/[~ٓ\u0653]/.test(word)) {
    result = {
      rule: TAJWEED_RULES.mad,
      reason: 'Mad: Dibaca panjang 4 sampai 6 harakat',
    };
  } else if (/\u06E2|[\u0646]\u0652?[\s\u0640]*[\u0628]/.test(word)) {
    // 2. Iqlab: contains small high meem \u06E2 or nun + ba
    result = {
      rule: TAJWEED_RULES.iqlab,
      reason: 'Iqlab: Suara N ditukar menjadi M (dengung 2 harakat)',
    };
  } else if (/[\u0646\u0645]\u0651/.test(word)) {
    // 3. Ghunnah: Nun or Mim with shaddah (نّ or مّ)
    result = {
      rule: TAJWEED_RULES.ghunnah,
      reason: 'Ghunnah Musyaddadah: Nun/Mim bertasydid ditahan dengung 2-3 harakat',
    };
  } else if (/[قطبجد]\u0652/.test(word)) {
    // 4. Qalqalah: sukun on qalqalah letters (ق ط ب ج د)
    result = {
      rule: TAJWEED_RULES.qalqalah,
      reason: 'Qalqalah: Pantulan huruf Qaf, Tha, Ba, Jim, Dal bersukun',
    };
  } else if (/[\u064B\u064C\u064D\u0646]\u0652?[\s\u0640]*[ينمولر]/.test(word)) {
    // 5. Idgham: tanwin / nun sukun followed by ya, nun, mim, waw, lam, ra
    result = {
      rule: TAJWEED_RULES.idgham,
      reason: 'Idgham: Melebur bunyi huruf dengan dengung',
    };
  } else if (/[\u064B\u064C\u064D\u0646]\u0652?[\s\u0640]*[تثجدذزسشصضطظفقك]/.test(word)) {
    // 6. Ikhfa: tanwin / nun sukun followed by 15 ikhfa letters
    result = {
      rule: TAJWEED_RULES.ikhfa,
      reason: "Ikhfa' Haqiqi: Dibaca samar-samar berdengung 2 harakat",
    };
  } else if (/[\u064B\u064C\u064D\u0646]\u0652?[\s\u0640]*[ءهعحغخ]/.test(word)) {
    // 7. Idzhar: tanwin / nun sukun followed by throat letters
    result = {
      rule: TAJWEED_RULES.idzhar,
      reason: 'Idzhar Halqi: Dibaca jelas tanpa dengung',
    };
  }

  // Cap cache size to avoid unbounded memory
  if (wordTajweedCache.size > 2000) {
    wordTajweedCache.clear();
  }
  wordTajweedCache.set(word, result);
  return result;
}

/**
 * Renders Arabic text with tajweed color highlights and interactive click support
 */
export function renderTajweedText(
  arabicText: string,
  enableTajweed: boolean,
  onWordClick?: (rule: TajweedRule, word: string) => void
): React.ReactNode {
  if (!enableTajweed) {
    return arabicText;
  }

  const words = arabicText.split(' ');

  return (
    <>
      {words.map((word, index) => {
        const { rule } = identifyWordTajweed(word);

        if (!rule) {
          return (
            <React.Fragment key={index}>
              <span>{word}</span>
              {index < words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={index}>
            <span
              onClick={(e) => {
                if (onWordClick) {
                  e.stopPropagation();
                  onWordClick(rule, word);
                }
              }}
              style={{
                color: rule.color,
                fontWeight: 600,
                textDecorationColor: `${rule.color}66`,
              }}
              className="cursor-pointer transition-all hover:scale-105 hover:underline underline-offset-8 active:scale-95 inline-block select-text"
              title={`Klik untuk melihat hukum tajwid: ${rule.name} (${rule.harakatCount})`}
            >
              {word}
            </span>
            {index < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </>
  );
}
