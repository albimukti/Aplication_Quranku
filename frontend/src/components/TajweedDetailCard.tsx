import React from 'react';
import { TajweedRule } from '../utils/tajweed';
import { Sparkles, X, Volume2, BookOpen, Check, ArrowRight } from 'lucide-react';

interface TajweedDetailCardProps {
  rule: TajweedRule | null;
  word: string;
  onClose: () => void;
  onOpenFullGuide: () => void;
}

export const TajweedDetailCard: React.FC<TajweedDetailCardProps> = ({
  rule,
  word,
  onClose,
  onOpenFullGuide,
}) => {
  if (!rule) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce-short">
      <div
        className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border-2 transition-all"
        style={{ borderColor: rule.color }}
      >
        {/* Top bar with tag & close */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${rule.badgeBg} ${rule.badgeText} ${rule.badgeBorder}`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: rule.color }}
            />
            {rule.name}
          </span>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
              {rule.harakatCount}
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors ml-1"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Word Display & Pronunciation */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Kata yang diklik:
            </span>
            <div className="text-xs text-slate-600 mt-0.5 font-medium">
              Ketukan: <b className="text-slate-800">{rule.harakatCount}</b>
            </div>
          </div>
          <div
            className="font-arabic text-3xl sm:text-4xl select-none"
            style={{ color: rule.color }}
          >
            {word}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2 mb-3 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <span className="font-bold text-slate-900 min-w-[70px]">Cara Baca:</span>
            <span className="leading-relaxed">{rule.howToRead}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-slate-900 min-w-[70px]">Keterangan:</span>
            <span className="text-slate-600 leading-relaxed">{rule.description}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-slate-900 min-w-[70px]">Huruf/Ciri:</span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {rule.letters}
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onOpenFullGuide}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Buka Panduan Lengkap
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
          >
            Mengerti ✓
          </button>
        </div>
      </div>
    </div>
  );
};
