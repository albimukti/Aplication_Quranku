import React, { useState, useEffect } from 'react';
import { DoaItem } from '../types';
import { fetchApi } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { useAudio } from '../context/AudioContext';
import {
  HeartHandshake,
  Search,
  Volume2,
  BookOpen,
  Sparkles,
  Sliders,
  Copy,
  Check,
} from 'lucide-react';

export const DoaCollection: React.FC = () => {
  const { arabicSize, setArabicSize } = useSettings();
  const { playTrack } = useAudio();

  const [doas, setDoas] = useState<DoaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchApi<DoaItem[]>('/doas')
      .then((data) => {
        setDoas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredDoas = doas.filter((d) => {
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      d.title.toLowerCase().includes(q) ||
      d.latin.toLowerCase().includes(q) ||
      d.translation.toLowerCase().includes(q) ||
      d.arab.includes(q);
    return matchCat && matchSearch;
  });

  const handleCopy = (doa: DoaItem) => {
    const text = `${doa.title}\n\n${doa.arab}\n\n${doa.latin}\n\nArtinya:\n"${doa.translation}"\n(${doa.riwayat})`;
    navigator.clipboard.writeText(text);
    setCopiedId(doa.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getArabicFontClass = () => {
    switch (arabicSize) {
      case 'huge':
        return 'text-3xl sm:text-4xl leading-[3.2] sm:leading-[3.6]';
      case 'large':
        return 'text-2xl sm:text-3xl leading-[2.9] sm:leading-[3.3]';
      case 'normal':
      default:
        return 'text-xl sm:text-2xl leading-[2.7] sm:leading-[3.0]';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 text-xs font-bold text-amber-300">
            <HeartHandshake className="w-3.5 h-3.5" />
            Kumpulan Doa & Dzikir Al-Ma'tsurat
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Doa Sholat & Harian Lengkap
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Bacaan doa sholat fardhu, doa harian dari bangun tidur hingga istirahat, serta dzikir pagi petang dengan teks Arab berharakat, transliterasi latin, dan terjemahan.
          </p>
        </div>

        {/* Font Accessibility Pill */}
        <div className="flex items-center gap-2 bg-emerald-950/60 p-2.5 rounded-2xl border border-emerald-600/40 text-xs text-white">
          <Sliders className="w-4 h-4 text-amber-300" />
          <span>Ukuran Arab:</span>
          <button
            onClick={() => setArabicSize('normal')}
            className={`px-2 py-1 rounded-lg font-bold ${arabicSize === 'normal' ? 'bg-amber-400 text-emerald-950' : 'text-emerald-200'}`}
          >
            A
          </button>
          <button
            onClick={() => setArabicSize('large')}
            className={`px-2 py-1 rounded-lg font-bold ${arabicSize === 'large' ? 'bg-amber-400 text-emerald-950' : 'text-emerald-200'}`}
          >
            A+
          </button>
          <button
            onClick={() => setArabicSize('huge')}
            className={`px-2 py-1 rounded-lg font-bold ${arabicSize === 'huge' ? 'bg-amber-400 text-emerald-950' : 'text-emerald-200'}`}
          >
            A++
          </button>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="clay-card p-4 bg-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Semua Doa' },
              { id: 'sholat', label: 'Doa Gerakan Sholat' },
              { id: 'harian', label: 'Doa Sehari-hari' },
              { id: 'dzikir', label: 'Dzikir Pagi & Petang' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari doa..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Doa Cards Grid */}
      <div className="space-y-4">
        {filteredDoas.map((item) => (
          <div key={item.id} className="clay-card p-5 sm:p-6 bg-white space-y-3 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {item.category === 'sholat' ? 'Doa Sholat' : item.category === 'harian' ? 'Doa Harian' : 'Dzikir'}
                </span>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(item)}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title="Salin Teks Doa"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Arabic */}
            <div className="py-4 my-2 text-right">
              <p
                className={`font-arabic text-slate-900 ${getArabicFontClass()}`}
                style={{ wordSpacing: '0.22em' }}
              >
                {item.arab}
              </p>
            </div>

            {/* Latin */}
            <div className="pt-2 border-t border-slate-100 text-xs sm:text-sm text-emerald-800 italic font-medium leading-relaxed">
              {item.latin}
            </div>

            {/* Translation & Riwayat */}
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              "{item.translation}"
            </div>

            <div className="text-[11px] text-slate-400 font-semibold pt-1">
              Sumber: {item.riwayat}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
