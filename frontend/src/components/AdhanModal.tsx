import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { Icon3DMosque } from './3d/Icons3D';
import { Bell, Volume2, VolumeX, X, Play, Square, Music2 } from 'lucide-react';

interface AdhanModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName?: string;
}

export const AdhanModal: React.FC<AdhanModalProps> = ({
  isOpen,
  onClose,
  prayerName = 'Waktu Sholat',
}) => {
  const { playAdhanTest, stopTrack, isPlaying, currentTrack, volume, setVolume } = useAudio();
  const [selectedMuadzin, setSelectedMuadzin] = useState<'makkah' | 'mishary'>('makkah');

  // Auto-play when opened
  useEffect(() => {
    if (isOpen) {
      playAdhanTest(selectedMuadzin);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMuadzinChange = (muadzin: 'makkah' | 'mishary') => {
    setSelectedMuadzin(muadzin);
    playAdhanTest(muadzin);
  };

  const isAdhanPlaying = isPlaying && currentTrack?.url?.includes('adhan');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-emerald-100 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={() => {
            stopTrack();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Mosque and Pulsing Rings */}
        <div className="flex justify-center mb-4 relative">
          {isAdhanPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-emerald-400/20 animate-ping" />
            </div>
          )}
          <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-200/70 shadow-clay relative z-10">
            <Icon3DMosque className="w-20 h-20" />
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2 shadow-sm">
          <Bell className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
          Simulasi Alarm Pengingat Sholat
        </span>

        <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
          {prayerName === 'Waktu Sholat' ? 'Panggilan Sholat Telah Tiba' : `Waktu Sholat ${prayerName}`}
        </h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed max-w-sm mx-auto">
          Dengarkan lantunan suara adzan merdu pengingat waktu sholat fardhu.
        </p>

        {/* Muadzin Selection */}
        <div className="mb-5 text-left bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Pilih Qari / Muadzin:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleMuadzinChange('makkah')}
              className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center gap-2 ${
                selectedMuadzin === 'makkah'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Music2 className="w-4 h-4 flex-shrink-0" />
              <div className="truncate">
                <div>Adzan Makkah</div>
                <div className="text-[10px] opacity-80">Al-Mukarramah</div>
              </div>
            </button>
            <button
              onClick={() => handleMuadzinChange('mishary')}
              className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center gap-2 ${
                selectedMuadzin === 'mishary'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Music2 className="w-4 h-4 flex-shrink-0" />
              <div className="truncate">
                <div>Mishary Rashid</div>
                <div className="text-[10px] opacity-80">Al-Afasy (Merdu)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Playing Status & Wave Equalizer */}
        <div className="mb-5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-1 h-5 w-6">
              <span className={`w-1 bg-emerald-600 rounded-full transition-all ${isAdhanPlaying ? 'h-5 animate-pulse' : 'h-1.5'}`} />
              <span className={`w-1 bg-emerald-500 rounded-full transition-all ${isAdhanPlaying ? 'h-3 animate-pulse delay-75' : 'h-1.5'}`} />
              <span className={`w-1 bg-emerald-700 rounded-full transition-all ${isAdhanPlaying ? 'h-4 animate-pulse delay-150' : 'h-1.5'}`} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-emerald-900">
                {isAdhanPlaying ? 'Sedang Mengumandangkan Adzan...' : 'Suara Adzan Berhenti / Dijeda'}
              </div>
              <div className="text-[10px] text-emerald-700">
                {selectedMuadzin === 'makkah' ? 'Masjidil Haram Makkah' : 'Syaikh Mishary Rashid Alafasy'}
              </div>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 1)}
              className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg"
              title={volume === 0 ? 'Aktifkan Suara' : 'Bisukan'}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1.5 accent-emerald-600 bg-emerald-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => playAdhanTest(selectedMuadzin)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-emerald-glow flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isAdhanPlaying ? (
              <>
                <Volume2 className="w-4 h-4 animate-pulse" /> Putar Ulang Adzan
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Putar Suara Adzan
              </>
            )}
          </button>
          <button
            onClick={() => {
              stopTrack();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Square className="w-3.5 h-3.5" /> Matikan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
