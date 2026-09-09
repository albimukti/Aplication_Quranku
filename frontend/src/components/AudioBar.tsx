import React from 'react';
import { useAudio } from '../context/AudioContext';
import {
  Play,
  Pause,
  X,
  Volume2,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Radio,
} from 'lucide-react';

const formatSeconds = (sec: number) => {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const AudioBar: React.FC = () => {
  const {
    currentTrack,
    playlist,
    currentIndex,
    isPlaying,
    progress,
    currentTime,
    duration,
    togglePlay,
    stopTrack,
    nextTrack,
    prevTrack,
    seekTo,
    repeatMode,
    setRepeatMode,
    autoNextSurah,
    setAutoNextSurah,
  } = useAudio();

  if (!currentTrack) return null;

  const hasMultipleTracks = playlist.length > 1;

  const cycleRepeatMode = () => {
    if (repeatMode === 'off') setRepeatMode('surah');
    else if (repeatMode === 'surah') setRepeatMode('ayah');
    else setRepeatMode('off');
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    seekTo(percent);
  };

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-6 sm:right-6 md:left-8 md:right-8 max-w-4xl mx-auto z-50 animate-bounce-short">
      <div className="glass-card-emerald rounded-3xl p-3.5 sm:p-4 shadow-2xl flex flex-col gap-2.5 border border-emerald-400/40 backdrop-blur-xl">
        {/* Clickable Progress bar with timestamps */}
        <div className="space-y-1">
          <div
            onClick={handleProgressBarClick}
            className="w-full bg-emerald-950/70 hover:bg-emerald-950 rounded-full h-2 overflow-hidden cursor-pointer relative group transition-all"
            title="Klik untuk geser durasi audio"
          >
            <div
              className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-300 h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-emerald-200/80 font-mono px-0.5">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center flex-shrink-0 text-amber-300 shadow-inner border border-emerald-500/40">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-sm">
                  {currentTrack.title}
                </h4>
                {hasMultipleTracks && (
                  <span className="hidden sm:inline bg-amber-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-sm">
                    {currentIndex + 1}/{playlist.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200 truncate">
                {currentTrack.subtitle}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Auto-Next Surah Mode Badge */}
            {currentTrack.surahNumber && (
              <button
                onClick={() => setAutoNextSurah(!autoNextSurah)}
                className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${
                  autoNextSurah
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    : 'bg-emerald-900/40 text-emerald-300/60 border-emerald-700/40'
                }`}
                title={
                  autoNextSurah
                    ? 'Lanjut Otomatis ke Surah Selanjutnya: Aktif'
                    : 'Lanjut Otomatis: Nonaktif'
                }
              >
                <Radio className={`w-3 h-3 ${autoNextSurah ? 'animate-pulse' : ''}`} />
                <span>Auto Surah</span>
              </button>
            )}

            {/* Repeat Mode Button */}
            <button
              onClick={cycleRepeatMode}
              className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                repeatMode !== 'off'
                  ? 'bg-amber-400 text-emerald-950 shadow-sm'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/60'
              }`}
              title={
                repeatMode === 'ayah'
                  ? 'Ulangi Ayat Ini Terus-menerus'
                  : repeatMode === 'surah'
                  ? 'Ulangi Surah Ini dari Awal'
                  : 'Ulangi: Mati'
              }
            >
              {repeatMode === 'ayah' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>

            {/* Prev Track / Ayah */}
            <button
              onClick={prevTrack}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-xl transition-all"
              title="Ayat Sebelumnya"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-400 text-emerald-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track / Ayah */}
            <button
              onClick={nextTrack}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-xl transition-all"
              title="Ayat Berikutnya"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Close / Stop */}
            <button
              onClick={stopTrack}
              className="w-8 h-8 rounded-xl bg-emerald-900/60 text-emerald-300 hover:text-white hover:bg-rose-600/80 flex items-center justify-center transition-all ml-1"
              title="Tutup Pemutar Audio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
