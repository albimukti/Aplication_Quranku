import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, X, Volume2 } from 'lucide-react';

export const AudioBar: React.FC = () => {
  const { currentTrack, isPlaying, progress, togglePlay, stopTrack } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 max-w-4xl mx-auto z-50 animate-bounce-short">
      <div className="glass-card-emerald rounded-2xl p-3.5 md:p-4 shadow-2xl flex flex-col gap-2 border border-emerald-400/40">
        {/* Progress bar */}
        <div className="w-full bg-emerald-950/60 rounded-full h-1.5 overflow-hidden cursor-pointer">
          <div
            className="bg-gradient-to-r from-amber-400 to-emerald-300 h-full rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/80 flex items-center justify-center flex-shrink-0 text-amber-300 shadow-inner">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate drop-shadow-sm">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-emerald-200 truncate">
                {currentTrack.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-emerald-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={stopTrack}
              className="w-8 h-8 rounded-full bg-emerald-800/80 text-emerald-200 hover:text-white hover:bg-emerald-700/90 flex items-center justify-center transition-all"
              title="Tutup Audio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
