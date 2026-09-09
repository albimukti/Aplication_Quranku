import React, { useState, useEffect } from 'react';
import { Surah } from '../types';
import { fetchApi } from '../utils/api';
import { useAudio, AudioTrack } from '../context/AudioContext';
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
  Play,
  Pause,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const JuzAmma: React.FC = () => {
  const { arabicSize, setArabicSize } = useSettings();
  const {
    playPlaylist,
    currentTrack,
    isPlaying,
    togglePlay,
    registerSurahEndedHandler,
    autoNextSurah,
  } = useAudio();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [hideTranslation, setHideTranslation] = useState<boolean>(false);
  const [memorizedSurahs, setMemorizedSurahs] = useState<number[]>(() => {
    const saved = localStorage.getItem('quranku_juz_amma_memorized');
    return saved ? JSON.parse(saved) : [112, 113, 114];
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [readingLoading, setReadingLoading] = useState<boolean>(false);
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
    setReadingLoading(true);
    fetchApi<Surah>(`/quran/surah/${surahNumber}`)
      .then((data) => {
        setSelectedSurah(data);
        setReadingLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => setReadingLoading(false));
  };

  // Continuous Surah-to-Surah Auto-Play for Juz 'Amma (Surah 78 to 114)
  useEffect(() => {
    const unregister = registerSurahEndedHandler((endedSurahNum: number) => {
      if (endedSurahNum >= 78 && endedSurahNum < 114) {
        const nextSurahNum = endedSurahNum + 1;
        fetchApi<Surah>(`/quran/surah/${nextSurahNum}`)
          .then((nextSurah) => {
            if (nextSurah && nextSurah.ayahs && nextSurah.ayahs.length > 0) {
              // Update reader view if user is reading
              setSelectedSurah((prev) => {
                if (prev && prev.number === endedSurahNum) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return nextSurah;
                }
                return prev;
              });

              // Play next surah's playlist
              const nextTracks: AudioTrack[] = nextSurah.ayahs.map((a) => ({
                title: `Surah ${nextSurah.name}`,
                subtitle: `Ayat ${a.number_in_surah} dari ${nextSurah.total_ayahs} • Qari Mishary Rashid Alafasy`,
                url: a.audio_url,
                ayahNumber: a.number_in_surah,
                surahNumber: nextSurah.number,
                surahName: nextSurah.name,
                totalAyahs: nextSurah.total_ayahs,
              }));

              playPlaylist(nextTracks, 0);
            }
          })
          .catch((err) => console.warn('Failed to auto-advance in Juz Amma:', err));
      }
    });

    return unregister;
  }, [registerSurahEndedHandler, playPlaylist]);

  // Auto-scroll active playing ayah into view
  useEffect(() => {
    if (
      currentTrack?.surahNumber &&
      selectedSurah?.number &&
      currentTrack.surahNumber === selectedSurah.number &&
      currentTrack.ayahNumber
    ) {
      const el = document.getElementById(`juz-ayah-${currentTrack.ayahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTrack?.ayahNumber, currentTrack?.surahNumber, selectedSurah?.number]);

  // Handle Play Full Surah
  const handlePlayFullSurah = (surah: Surah, startAyahIndex: number = 0) => {
    if (!surah.ayahs || surah.ayahs.length === 0) return;

    const isCurrentSurah = currentTrack?.surahNumber === surah.number;

    if (isCurrentSurah && startAyahIndex === 0) {
      togglePlay();
      return;
    }

    const tracks: AudioTrack[] = surah.ayahs.map((a) => ({
      title: `Surah ${surah.name}`,
      subtitle: `Ayat ${a.number_in_surah} dari ${surah.total_ayahs} • Qari Mishary Rashid Alafasy`,
      url: a.audio_url,
      ayahNumber: a.number_in_surah,
      surahNumber: surah.number,
      surahName: surah.name,
      totalAyahs: surah.total_ayahs,
    }));

    playPlaylist(tracks, startAyahIndex);
  };

  // Play All Juz 'Amma from Surah 78 (An-Naba')
  const handlePlayJuzAmmaFromStart = () => {
    openSurah(78);
    fetchApi<Surah>('/quran/surah/78').then((surah78) => {
      if (surah78) {
        handlePlayFullSurah(surah78, 0);
      }
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
    const isThisSurahPlaying = currentTrack?.surahNumber === selectedSurah.number;
    const isThisSurahActive = isThisSurahPlaying && isPlaying;

    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20">
        {/* Top bar with Memorization mode and Putar Surah */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm z-10 sticky top-2 backdrop-blur-md bg-white/95">
          <button
            onClick={() => setSelectedSurah(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Daftar Juz 'Amma
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tajweed Toggle Button */}
            <button
              onClick={() => setEnableTajweed(!enableTajweed)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
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
              <span>Tajwid</span>
            </button>

            {/* Toggle Hide Translation for Memorization Testing */}
            <button
              onClick={() => setHideTranslation(!hideTranslation)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                hideTranslation
                  ? 'bg-amber-500 text-emerald-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Sembunyikan terjemahan untuk latihan hafalan"
            >
              {hideTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{hideTranslation ? 'Hafalan: On' : 'Mode Hafalan'}</span>
            </button>

            <button
              onClick={() => toggleMemorized(selectedSurah.number)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                memorizedSurahs.includes(selectedSurah.number)
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{memorizedSurahs.includes(selectedSurah.number) ? 'Sudah Hafal' : 'Tandai Hafal'}</span>
            </button>

            {/* FULL CONTINUOUS SURAH AUDIO PLAYER BUTTON */}
            <button
              onClick={() => handlePlayFullSurah(selectedSurah, 0)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 ${
                isThisSurahActive
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse'
                  : isThisSurahPlaying
                  ? 'bg-amber-500 text-emerald-950 ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-emerald-950 shadow-gold-glow hover:scale-105'
              }`}
              title="Putar surah secara bersambung dari ayat awal sampai akhir"
            >
              {isThisSurahActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Jeda Surah ({currentTrack?.ayahNumber || 1}/{selectedSurah.total_ayahs})</span>
                </>
              ) : isThisSurahPlaying ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Lanjutkan Surah</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Putar Surah</span>
                </>
              )}
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

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] text-emerald-100 backdrop-blur-sm border border-white/15 mt-1">
            <Radio className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>
              {autoNextSurah
                ? 'Mode Bersambung: Otomatis lanjut ke surah selanjutnya'
                : 'Mode Standar'}
            </span>
          </div>
        </div>

        {/* Ayahs List */}
        <div className="space-y-4">
          {readingLoading ? (
            <div className="text-center py-16 text-slate-500 font-semibold">
              Memuat ayat Juz 'Amma...
            </div>
          ) : (
            selectedSurah.ayahs?.map((ayah, index) => {
              const isCurrentPlaying =
                currentTrack?.surahNumber === selectedSurah.number &&
                currentTrack?.ayahNumber === ayah.number_in_surah &&
                isPlaying;

              const isCurrentPaused =
                currentTrack?.surahNumber === selectedSurah.number &&
                currentTrack?.ayahNumber === ayah.number_in_surah &&
                !isPlaying;

              return (
                <div
                  key={ayah.number_in_surah}
                  id={`juz-ayah-${ayah.number_in_surah}`}
                  className={`clay-card p-5 transition-all duration-300 ${
                    isCurrentPlaying
                      ? 'ring-4 ring-amber-400 bg-amber-50/30 border-amber-400 shadow-xl'
                      : isCurrentPaused
                      ? 'ring-2 ring-emerald-300 bg-emerald-50/20'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shadow-sm transition-all ${
                          isCurrentPlaying
                            ? 'bg-amber-400 text-emerald-950 scale-110'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ayah.number_in_surah}
                      </span>
                      {isCurrentPlaying && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black animate-pulse">
                          <Volume2 className="w-3 h-3" /> Sedang Diputar
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handlePlayFullSurah(selectedSurah, index)}
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        isCurrentPlaying
                          ? 'bg-amber-400 text-emerald-950 shadow-md'
                          : isCurrentPaused
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                      title="Putar ayat ini dan lanjutkan seterusnya"
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>{isCurrentPlaying ? 'Jeda' : 'Putar'}</span>
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
                      <AyahEndMarker
                        number={ayah.number_in_surah}
                        size={arabicSize === 'huge' ? 'lg' : arabicSize === 'large' ? 'md' : 'sm'}
                      />
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
            })
          )}
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
            Kumpulan 37 surah-surah pendek untuk sholat, tadarus, dan latihan hafalan dengan audio murottal bersambung dari ayat awal hingga akhir.
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

      {/* Play Continuous Juz 'Amma Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-700/50">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px] uppercase">
            <Radio className="w-3 h-3 animate-pulse" /> Murottal Bersambung Juz 30
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            Putar Juz 'Amma dari Surah Pertama (An-Naba')
          </h3>
          <p className="text-xs text-emerald-100">
            Audio akan diputar otomatis berurutan dari Surah 78 An-Naba' hingga Surah 114 An-Nas secara bersambung.
          </p>
        </div>

        <button
          onClick={handlePlayJuzAmmaFromStart}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm shadow-gold-glow flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Mulai Putar An-Naba'</span>
        </button>
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {surahs.map((surah) => {
          const isDone = memorizedSurahs.includes(surah.number);
          const isPlayingThisSurah = currentTrack?.surahNumber === surah.number && isPlaying;

          return (
            <div
              key={surah.number}
              onClick={() => openSurah(surah.number)}
              className={`clay-card p-5 cursor-pointer group flex items-center justify-between transition-all ${
                isPlayingThisSurah
                  ? 'ring-2 ring-amber-400 bg-amber-50/30'
                  : isDone
                  ? 'border-l-4 border-l-emerald-500 bg-emerald-50/20'
                  : 'hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm transition-all ${
                    isPlayingThisSurah
                      ? 'bg-amber-400 text-emerald-950 ring-2 ring-amber-300 animate-pulse'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-50 border border-amber-200 text-amber-900 group-hover:bg-amber-500 group-hover:text-white'
                  }`}
                >
                  {isPlayingThisSurah ? <Volume2 className="w-4 h-4" /> : surah.number}
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
