import React from 'react';
import { TAJWEED_RULES } from '../utils/tajweed';
import { HelpCircle, Sparkles } from 'lucide-react';

interface TajweedLegendBarProps {
  onOpenGuide: () => void;
}

export const TajweedLegendBar: React.FC<TajweedLegendBarProps> = ({ onOpenGuide }) => {
  const rules = Object.values(TAJWEED_RULES);

  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 shadow-sm mb-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 uppercase tracking-wider bg-emerald-100/80 px-2 py-0.5 rounded-md">
            <Sparkles className="w-3 h-3 text-emerald-700" /> Tajwid Aktif:
          </span>
          <span className="hidden sm:inline text-[11px] text-emerald-700 font-semibold bg-white/70 px-2 py-0.5 rounded-md border border-emerald-200/50">
            👆 Klik kata berwarna untuk detail hukum
          </span>
        </div>

        {/* Color Legend Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {rules.map((rule) => (
            <span
              key={rule.id}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border ${rule.badgeBg} ${rule.badgeText} ${rule.badgeBorder} shadow-2xs`}
              title={`${rule.description} (${rule.harakatCount})`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: rule.color }}
              />
              <span>{rule.name.split(' ')[0]}</span>
            </span>
          ))}
        </div>

        {/* Open Full Guide Button */}
        <button
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline decoration-emerald-500/50 hover:decoration-emerald-700 transition-colors ml-auto sm:ml-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          Panduan Lengkap
        </button>
      </div>
    </div>
  );
};
