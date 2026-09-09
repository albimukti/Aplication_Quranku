import React from 'react';
import { TAJWEED_RULES } from '../utils/tajweed';
import { BookOpen, X, Sparkles, CheckCircle, Info } from 'lucide-react';

interface TajweedGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TajweedGuideModal: React.FC<TajweedGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = Object.values(TAJWEED_RULES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-emerald-100 flex flex-col overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between flex-shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-[11px] font-bold text-amber-300 border border-emerald-500/40 mb-1">
                <Sparkles className="w-3 h-3" /> Pedoman Tajwid Kemenag RI
              </div>
              <h3 className="text-xl font-black">Panduan Warna & Hukum Tajwid</h3>
              <p className="text-xs text-emerald-200">
                Warna ayat Al-Qur'an mempermudah membaca dengan makhraj dan ketukan yang tepat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Rules cards */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <b>Cara Memakai:</b> Aktifkan tombol <b>"Tajwid Berwarna"</b> di bagian atas bacaan Al-Qur'an atau Juz 'Amma. Setiap huruf/kata yang memiliki hukum tajwid akan diberi warna khusus sesuai panduan di bawah. Arahkan kursor atau sentuh kata untuk melihat penjelasannya.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Badge & Color indicator */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${rule.badgeBg} ${rule.badgeText} ${rule.badgeBorder}`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: rule.color }}
                      />
                      {rule.name}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {rule.harakatCount}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                    {rule.description}
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2">
                    <div>
                      <b className="text-slate-700">Cara Membaca:</b> {rule.howToRead}
                    </div>
                    <div>
                      <b className="text-slate-700">Huruf/Tanda:</b> {rule.letters}
                    </div>
                  </div>
                </div>

                {/* Example box */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Contoh:
                  </span>
                  <span
                    className="font-arabic text-lg"
                    style={{ color: rule.color }}
                  >
                    {rule.example}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Standar Tajwid Kementerian Agama RI
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            Tutup & Mulai Membaca
          </button>
        </div>
      </div>
    </div>
  );
};
