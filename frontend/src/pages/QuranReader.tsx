import React, { useState, useEffect } from 'react';
import { Surah, JuzInfo, Ayah } from '../types';
import { fetchApi } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { AyahEndMarker } from '../components/AyahEndMarker';
import { renderTajweedText, TajweedRule } from '../utils/tajweed';
import { TajweedGuideModal } from '../components/TajweedGuideModal';
import { TajweedLegendBar } from '../components/TajweedLegendBar';
import { TajweedDetailCard } from '../components/TajweedDetailCard';
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Bookmark as BookmarkIcon,
  Volume2,
  ChevronLeft,
  Sliders,
  Check,
  Share2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuranReader: React.FC = () => {
  const { arabicSize, setArabicSize } = useSettings();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { user } = useAuth();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [juzList, setJuzList] = useState<JuzInfo[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<'surah' | 'juz'>('surah');
  const [loading, setLoading] = useState<boolean>(true);
  const [readingLoading, setReadingLoading] = useState<boolean>(false);
  const [bookmarkedAyah, setBookmarkedAyah] = useState<number | null>(null);
  const [enableTajweed, setEnableTajweed] = useState<boolean>(true);
  const [isTajweedGuideOpen, setIsTajweedGuideOpen] = useState<boolean>(false);
  const [activeTajweed, setActiveTajweed] = useState<{ rule: TajweedRule; word: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetchApi<Surah[]>('/quran/surahs'),
      fetchApi<JuzInfo[]>('/quran/juz'),
    ])
      .then(([surahData, juzData]) => {
        setSurahs(surahData);
        setJuzList(juzData);
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

  const handleBookmark = async (surahNumber: number, surahName: string, ayahNumber: number) => {
    setBookmarkedAyah(ayahNumber);
    if (user) {
      try {
        await fetchApi('/user/bookmarks', {
          method: 'POST',
          body: JSON.stringify({
            surah_number: surahNumber,
            surah_name: surahName,
            ayah_number: ayahNumber,
            notes: 'Ayat terakhir dibaca',
          }),
        });
      } catch {
        // save to localStorage fallback
      }
    }
    localStorage.setItem('quranku_last_read', JSON.stringify({ surahNumber, surahName, ayahNumber }));
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setBookmarkedAyah(null), 2500);
  };

  const filteredSurahs = surahs.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.translation_name.toLowerCase().includes(q) ||
      s.arabic_name.includes(q) ||
      s.number.toString() === q
    );
  });

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
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
        {/* Navigation & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm z-10">
          <button
            onClick={() => setSelectedSurah(null)}
            className="flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Daftar Surah
          </button>

          {/* Quick Font Sizer for elderly and all ages */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Ukuran Huruf:
            </span>
            <button
              onClick={() => setArabicSize('normal')}
              className={`px-2 py-0.5 rounded font-bold ${arabicSize === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
            >
              Standar
            </button>
            <button
              onClick={() => setArabicSize('large')}
              className={`px-2 py-0.5 rounded font-bold ${arabicSize === 'large' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
            >
              Besar
            </button>
            <button
              onClick={() => setArabicSize('huge')}
              className={`px-2 py-0.5 rounded font-bold ${arabicSize === 'huge' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
            >
              Lansia (A++)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Tajweed Toggle Button */}
            <button
              onClick={() => setEnableTajweed(!enableTajweed)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                enableTajweed
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Aktifkan/nonaktifkan tajwid berwarna"
            >
              <span
                className={`w-2 h-2 rounded-full ${enableTajweed ? 'bg-amber-300 animate-pulse' : 'bg-slate-400'}`}
              />
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tajwid: {enableTajweed ? 'Aktif' : 'Mati'}</span>
            </button>

            <button
              onClick={() => {
                if (selectedSurah.ayahs && selectedSurah.ayahs.length > 0) {
                  playTrack({
                    title: `Surah ${selectedSurah.name}`,
                    subtitle: `Ayat 1 - Qari Mishary Rashid Alafasy`,
                    url: selectedSurah.ayahs[0].audio_url,
                  });
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-emerald-950 font-bold text-xs shadow-gold-glow hover:scale-105 active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              Putar Surah
            </button>
          </div>
        </div>

        {/* Tajweed Legend Bar */}
        {enableTajweed && (
          <TajweedLegendBar onOpenGuide={() => setIsTajweedGuideOpen(true)} />
        )}

        {/* Surah Header Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white text-center shadow-xl border border-emerald-600/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs text-amber-300 font-semibold mb-3">
            <span>Surah ke-{selectedSurah.number}</span> • <span>{selectedSurah.revelation_type}</span> • <span>{selectedSurah.total_ayahs} Ayat</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-1">{selectedSurah.name}</h1>
          <p className="text-sm text-emerald-200 mb-4">({selectedSurah.translation_name})</p>

          <div className="font-arabic-center text-4xl sm:text-5xl text-amber-300 my-4 drop-shadow-md">
            {selectedSurah.arabic_name}
          </div>

          {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
            <div className="pt-4 border-t border-emerald-600/40 max-w-md mx-auto">
              <p className="font-arabic-center text-2xl sm:text-3xl text-emerald-100">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="text-[11px] text-emerald-200/80 mt-1 italic">
                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
              </p>
            </div>
          )}
        </div>

        {/* Ayahs List */}
        <div className="space-y-4">
          {readingLoading ? (
            <div className="text-center py-16 text-slate-500 font-semibold">
              Memuat ayat Al-Qur'an...
            </div>
          ) : (
            selectedSurah.ayahs?.map((ayah) => {
              const isCurrentPlaying = currentTrack?.url === ayah.audio_url && isPlaying;
              return (
                <div
                  key={ayah.number_in_surah}
                  id={`ayah-${ayah.number_in_surah}`}
                  className={`clay-card p-5 sm:p-6 transition-all ${
                    isCurrentPlaying
                      ? 'ring-2 ring-amber-400 bg-amber-50/20 border-amber-300'
                      : 'bg-white'
                  }`}
                >
                  {/* Ayah Header Strip */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center border border-emerald-200 shadow-sm">
                        {ayah.number_in_surah}
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        Ayat {ayah.number_in_surah}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Play Ayah Audio */}
                      <button
                        onClick={() =>
                          playTrack({
                            title: `Surah ${selectedSurah.name} : Ayat ${ayah.number_in_surah}`,
                            subtitle: 'Qari Mishary Rashid Alafasy',
                            url: ayah.audio_url,
                            ayahNumber: ayah.number_in_surah,
                          })
                        }
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          isCurrentPlaying
                            ? 'bg-amber-400 text-emerald-950 shadow-md'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                        title="Putar Audio Ayat"
                      >
                        {isCurrentPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Audio</span>
                      </button>

                      {/* Bookmark Button */}
                      <button
                        onClick={() =>
                          handleBookmark(selectedSurah.number, selectedSurah.name, ayah.number_in_surah)
                        }
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        title="Tandai Terakhir Dibaca"
                      >
                        {bookmarkedAyah === ayah.number_in_surah ? (
                          <Check className="w-4 h-4 text-emerald-600 animate-bounce" />
                        ) : (
                          <BookmarkIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text */}
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

                  {/* Latin & Translation */}
                  <div className="pt-4 mt-4 border-t border-slate-100/80 space-y-1.5">
                    <p className="text-xs sm:text-sm text-emerald-800 font-medium italic leading-relaxed">
                      {ayah.latin}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {ayah.translation}
                    </p>
                  </div>
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
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-emerald-600" />
            Bacaan Al-Qur'an 30 Juz
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pilih surah dari 114 surah mushaf Al-Qur'an lengkap dengan audio murattal & terjemahan
          </p>
        </div>

        {/* View Switcher: Surah vs Juz */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start">
          <button
            onClick={() => setActiveView('surah')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'surah' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Surah (114)
          </button>
          <button
            onClick={() => setActiveView('juz')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'juz' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Juz (1 - 30)
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama surah (contoh: Yasin, Al-Mulk, Al-Fatihah, Pembukaan)..."
          className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Surahs View */}
      {activeView === 'surah' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => (
            <div
              key={surah.number}
              onClick={() => openSurah(surah.number)}
              className="clay-card p-4 sm:p-5 cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  {surah.number}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {surah.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {surah.translation_name} • {surah.total_ayahs} Ayat
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-2">
                <div className="font-arabic text-xl font-bold text-emerald-800 group-hover:text-emerald-600 transition-colors">
                  {surah.arabic_name}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {surah.revelation_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Juz View */}
      {activeView === 'juz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {juzList.map((juz) => (
            <div
              key={juz.juz_number}
              onClick={() => openSurah(juz.start_surah)}
              className="clay-card p-5 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  JUZ {juz.juz_number}
                </span>
                <span className="text-xs text-emerald-600 font-semibold group-hover:underline">
                  Buka Bacaan →
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {juz.name}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Mulai Surah ke-{juz.start_surah} Ayat {juz.start_ayah} s/d Surah {juz.end_surah} Ayat {juz.end_ayah}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
