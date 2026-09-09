import React, { useState, useEffect } from 'react';
import { Surah } from '../types';
import { fetchApi } from '../utils/api';
import { useAudio } from '../context/AudioContext';
import { useSettings } from '../context/SettingsContext';
import { AyahEndMarker } from '../components/AyahEndMarker';
import { renderTajweedText, TajweedRule } from '../utils/tajweed';
import { TajweedGuideModal } from '../components/TajweedGuideModal';
import { TajweedLegendBar } from '../components/TajweedLegendBar';
import { TajweedDetailCard } from '../components/TajweedDetailCard';
import {
  BookOpen,
  Volume2,
  Eye,
  EyeOff,
  ChevronLeft,
  Sliders,
  CheckCircle2,
  Sparkles,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const JuzAmma: React.FC = () => {
  const { arabicSize, setArabicSize } = useSettings();
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [hideTranslation, setHideTranslation] = useState<boolean>(false);
  const [memorizedSurahs, setMemorizedSurahs] = useState<number[]>(() => {
    const saved = localStorage.getItem('quranku_juz_amma_memorized');
    return saved ? JSON.parse(saved) : [112, 113, 114];
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [enableTajweed, setEnableTajweed] = useState<boolean>(true);
  const [isTajweedGuideOpen, setIsTajweedGuideOpen] = useState<boolean>(false);
  const [activeTajweed, setActiveTajweed] = useState<{ rule: TajweedRule; word: string } | null>(null);

  useEffect(() => {
    fetchApi<Surah[]>('/quran/juz-amma')
      .then((data) => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openSurah = (surahNumber: number) => {
    fetchApi<Surah>(`/quran/surah/${surahNumber}`).then((data) => {
      setSelectedSurah(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const toggleMemorized = (surahNum: number) => {
    let updated: number[];
    if (memorizedSurahs.includes(surahNum)) {
      updated = memorizedSurahs.filter((n) => n !== surahNum);
    } else {
      updated = [...memorizedSurahs, surahNum];
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
    setMemorizedSurahs(updated);
    localStorage.setItem('quranku_juz_amma_memorized', JSON.stringify(updated));
  };

  const getArabicFontClass = () => {
    switch (arabicSize) {
      case 'huge':
        return 'text-4xl sm:text-5xl leading-[3.4] sm:leading-[3.8]';
      case 'large':
        return 'text-3xl sm:text-4xl leading-[3.0] sm:leading-[3.4]';
      case 'normal':
      default:
        return 'text-2xl sm:text-3xl leading-[2.8] sm:leading-[3.1]';
    }
  };

  if (selectedSurah) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
        {/* Top bar with Memorization mode toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm z-10">
          <button
            onClick={() => setSelectedSurah(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Daftar Juz 'Amma
          </button>

          <div className="flex items-center gap-2">
            {/* Tajweed Toggle Button */}
            <button
              onClick={() => setEnableTajweed(!enableTajweed)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                enableTajweed
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Aktifkan/nonaktifkan tajwid berwarna"
            >
              <span
                className={`w-2 h-2 rounded-full ${enableTajweed ? 'bg-amber-300 animate-pulse' : 'bg-slate-400'}`}
              />
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tajwid: {enableTajweed ? 'Aktif' : 'Mati'}</span>
            </button>

            {/* Toggle Hide Translation for Memorization Testing */}
            <button
              onClick={() => setHideTranslation(!hideTranslation)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                hideTranslation
                  ? 'bg-amber-500 text-emerald-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Sembunyikan terjemahan untuk latihan hafalan"
            >
              {hideTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {hideTranslation ? 'Hafalan: On' : 'Mode Hafalan'}
            </button>

            <button
              onClick={() => toggleMemorized(selectedSurah.number)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                memorizedSurahs.includes(selectedSurah.number)
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {memorizedSurahs.includes(selectedSurah.number) ? 'Sudah Hafal' : 'Tandai Hafal'}
            </button>
          </div>
        </div>

        {/* Tajweed Legend Bar */}
        {enableTajweed && (
          <TajweedLegendBar onOpenGuide={() => setIsTajweedGuideOpen(true)} />
        )}

        {/* Surah Header */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white text-center shadow-xl border border-emerald-600/50">
          <div className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-2">
            Juz 30 • Surah ke-{selectedSurah.number}
          </div>
          <h1 className="text-3xl font-black">{selectedSurah.name}</h1>
          <p className="text-xs text-emerald-200">({selectedSurah.translation_name}) • {selectedSurah.total_ayahs} Ayat</p>
          <div className="font-arabic-center text-4xl text-amber-300 my-3">
            {selectedSurah.arabic_name}
          </div>
        </div>

        {/* Ayahs List */}
        <div className="space-y-4">
          {selectedSurah.ayahs?.map((ayah) => {
            const isCurrentPlaying = currentTrack?.url === ayah.audio_url && isPlaying;
            return (
              <div
                key={ayah.number_in_surah}
                className={`clay-card p-5 transition-all ${
                  isCurrentPlaying ? 'ring-2 ring-amber-400 bg-amber-50/20' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {ayah.number_in_surah}
                  </span>
                  <button
                    onClick={() =>
                      playTrack({
                        title: `${selectedSurah.name} : Ayat ${ayah.number_in_surah}`,
                        subtitle: 'Qari Mishary Rashid Alafasy',
                        url: ayah.audio_url,
                      })
                    }
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Putar
                  </button>
                </div>

                <div className="py-4 my-2">
                  <p
                    className={`font-arabic text-slate-900 ${getArabicFontClass()}`}
                    style={{ wordSpacing: '0.22em' }}
                  >
                    {renderTajweedText(ayah.arab, enableTajweed, (rule, word) => {
                      setActiveTajweed({ rule, word });
                    })}
                    <AyahEndMarker number={ayah.number_in_surah} size={arabicSize === 'huge' ? 'lg' : arabicSize === 'large' ? 'md' : 'sm'} />
                  </p>
                </div>

                {!hideTranslation && (
                  <div className="pt-3 mt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <p className="italic text-emerald-800 font-medium">{ayah.latin}</p>
                    <p>{ayah.translation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tajweed Guide Modal */}
        <TajweedGuideModal
          isOpen={isTajweedGuideOpen}
          onClose={() => setIsTajweedGuideOpen(false)}
        />

        {/* Interactive Tajweed Click Detail Card */}
        <TajweedDetailCard
          rule={activeTajweed?.rule || null}
          word={activeTajweed?.word || ''}
          onClose={() => setActiveTajweed(null)}
          onOpenFullGuide={() => {
            setActiveTajweed(null);
            setIsTajweedGuideOpen(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500 via-emerald-700 to-emerald-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/20 text-xs font-bold text-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            Mode Khusus Hafalan Juz 30
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Juz 'Amma (Surah 78 s/d 114)
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Kumpulan 37 surah-surah pendek untuk sholat, tadarus, dan latihan hafalan anak maupun dewasa dengan fitur penutup arti.
          </p>
        </div>

        {/* Hafalan Progress Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[200px]">
          <div className="text-xs text-emerald-200 font-semibold mb-1">Target Hafalan Anda</div>
          <div className="text-3xl font-black text-amber-300">
            {memorizedSurahs.length} <span className="text-sm font-normal text-emerald-100">/ 37 Surah</span>
          </div>
          <div className="w-full bg-emerald-950/40 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(memorizedSurahs.length / 37) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {surahs.map((surah) => {
          const isDone = memorizedSurahs.includes(surah.number);
          return (
            <div
              key={surah.number}
              onClick={() => openSurah(surah.number)}
              className={`clay-card p-5 cursor-pointer group flex items-center justify-between ${
                isDone ? 'border-l-4 border-l-emerald-500 bg-emerald-50/20' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-50 border border-amber-200 text-amber-900 group-hover:bg-amber-500 group-hover:text-white'
                  }`}
                >
                  {surah.number}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {surah.name}
                    </h3>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {surah.translation_name} • {surah.total_ayahs} Ayat
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-2">
                <div className="font-arabic text-xl font-bold text-emerald-800">
                  {surah.arabic_name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
