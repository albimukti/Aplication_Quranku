import React from 'react';
import { Icon3DQuran } from './3d/Icons3D';
import { Heart, Shield } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-emerald-950 text-slate-300 pt-12 pb-24 border-t border-emerald-900/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-800/60 rounded-xl border border-emerald-600/40">
                <Icon3DQuran className="w-8 h-8" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                QURANKU
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform Al-Qur'an digital, panduan belajar Iqro', waktu sholat akurat, kompas kiblat, dan penyaluran sedekah zakat terpercaya di Indonesia.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" /> Berdasarkan Standar Kemenag RI
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
              Fitur Al-Qur'an & Iqro
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('quran')} className="hover:text-emerald-400 transition-colors">
                  Bacaan Al-Qur'an 30 Juz
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('juz-amma')} className="hover:text-emerald-400 transition-colors">
                  Juz 'Amma Khusus (Hafalan)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('iqro')} className="hover:text-emerald-400 transition-colors">
                  Belajar Iqro' Jilid 1 - 6
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('doa')} className="hover:text-emerald-400 transition-colors">
                  Doa Sholat & Harian Lengkap
                </button>
              </li>
            </ul>
          </div>

          {/* Prayer & Location */}
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
              Ibadah & Lokasi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('prayer')} className="hover:text-emerald-400 transition-colors">
                  Waktu Sholat Seluruh Indonesia
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('qibla')} className="hover:text-emerald-400 transition-colors">
                  Arah Kiblat (Kompas 3D)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('masjid')} className="hover:text-emerald-400 transition-colors">
                  Masjid Terdekat (Google Maps)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('zakat')} className="hover:text-emerald-400 transition-colors">
                  Kalkulator Zakat & Infaq
                </button>
              </li>
            </ul>
          </div>

          {/* Islamic Note */}
          <div className="p-4 bg-emerald-900/40 rounded-2xl border border-emerald-800/60">
            <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <span>📖</span> Pengingat Kebaikan
            </h5>
            <p className="text-[11px] text-emerald-200 italic leading-relaxed">
              "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."
            </p>
            <p className="text-[10px] text-amber-300 mt-2 font-semibold text-right">
              — HR. Bukhari No. 5027
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 QURANKU - Aplikasi Islami Ramah Semua Kalangan Usia.</p>
          <div className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk Ummat
          </div>
        </div>
      </div>
    </footer>
  );
};
