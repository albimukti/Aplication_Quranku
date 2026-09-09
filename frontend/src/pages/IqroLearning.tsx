import React, { useState, useEffect } from 'react';
import { IqroLevel } from '../types';
import { fetchApi } from '../utils/api';
import { Icon3DIqro } from '../components/3d/Icons3D';
import {
  BookOpen,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const IqroLearning: React.FC = () => {
  const [levels, setLevels] = useState<IqroLevel[]>([]);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  useEffect(() => {
    fetchApi<IqroLevel[]>('/iqro/levels')
      .then((data) => {
        setLevels(data);
      })
      .catch(() => {});
  }, []);

  const currentLevelData = levels.find((l) => l.level === activeLevel);
  const currentLesson = currentLevelData?.lessons[currentPageIndex];

  // Speech pronunciation helper using Web Speech API or friendly sound
  const speakArabic = (text: string, latin: string) => {
    setSelectedLetter(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(latin);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleLevelChange = (lvl: number) => {
    setActiveLevel(lvl);
    setCurrentPageIndex(0);
    setSelectedLetter(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/20 text-xs font-bold text-amber-100">
            <Icon3DIqro className="w-4 h-4" />
            Metode Cepat Belajar Membaca Al-Qur'an
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            IQRO' Interaktif (Jilid 1 - 6)
          </h1>
          <p className="text-xs sm:text-sm text-amber-50 max-w-lg">
            Panduan belajar membaca huruf hijaiyah dari nol hingga mahir bertajwid. Sentuh atau klik kartu huruf untuk mendengarkan pelafalan makhraj yang benar.
          </p>
        </div>

        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
          <Icon3DIqro className="w-20 h-20" />
        </div>
      </div>

      {/* Jilid Selector (1 - 6) */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[1, 2, 3, 4, 5, 6].map((lvl) => (
          <button
            key={lvl}
            onClick={() => handleLevelChange(lvl)}
            className={`px-5 py-3 rounded-2xl font-black text-sm flex-shrink-0 transition-all flex items-center gap-2 ${
              activeLevel === lvl
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105 border border-emerald-400'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            <span>Jilid {lvl}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Board */}
      {currentLesson ? (
        <div className="space-y-5">
          {/* Lesson Header & Page Navigation */}
          <div className="clay-card p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {currentLevelData?.title} • Halaman {currentLesson.page} dari {currentLevelData?.lessons.length}
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {currentLesson.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                💡 <span className="font-semibold text-slate-700">Panduan Ustadz:</span> {currentLesson.guidance}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-slate-600 px-2">
                Hal {currentLesson.page}
              </span>
              <button
                disabled={currentPageIndex >= (currentLevelData?.lessons.length || 1) - 1}
                onClick={() => {
                  setCurrentPageIndex((prev) => prev + 1);
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Large Flashcards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {currentLesson.letters.map((item, idx) => {
              const isSelected = selectedLetter === item.arab;
              return (
                <div
                  key={idx}
                  onClick={() => speakArabic(item.arab, item.latin)}
                  className={`clay-card p-6 cursor-pointer text-center group transition-all select-none relative overflow-hidden ${
                    isSelected
                      ? 'ring-4 ring-amber-400 bg-amber-50/40 border-amber-300 scale-102'
                      : 'bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {item.latin}
                    </span>
                    <Volume2 className="w-4 h-4 group-hover:text-emerald-600 transition-colors" />
                  </div>

                  {/* Big Arabic Letter */}
                  <div className="font-arabic text-5xl sm:text-6xl text-slate-900 my-4 group-hover:scale-110 transition-transform drop-shadow-sm font-bold">
                    {item.arab}
                  </div>

                  {/* Makhraj note */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 line-clamp-2">
                    {item.makhraj}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Pronunciation Guide Box */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Kunci Sukses Membaca Iqro'
                </h4>
                <p className="text-xs text-emerald-800">
                  Keluarkan suara dengan tegas dan jelas tanpa diseret, pisahkan bunyi tiap huruf hingga lidah terbiasa.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          Memuat jilid Iqro'...
        </div>
      )}
    </div>
  );
};
