import React, { useState, useEffect } from 'react';
import { QiblaInfo } from '../types';
import { fetchApi } from '../utils/api';
import { Icon3DKaaba, Icon3DCompass } from '../components/3d/Icons3D';
import {
  Compass,
  Navigation,
  MapPin,
  RotateCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const QiblaCompass: React.FC = () => {
  const [qibla, setQibla] = useState<QiblaInfo | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Qibla data for Jakarta default or GPS
  const loadQibla = (lat: number, lng: number) => {
    fetchApi<QiblaInfo>(`/prayer/qibla?lat=${lat}&lng=${lng}`)
      .then((data) => {
        setQibla(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    // Default to Jakarta coordinates
    loadQibla(-6.2088, 106.8456);

    // Try auto-detecting user geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadQibla(pos.coords.latitude, pos.coords.longitude);
        },
        () => {}
      );
    }

    // Try device orientation if supported on mobile
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setCompassHeading(e.alpha);
        setIsCalibrated(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const qiblaAngle = qibla?.qibla_degree || 295.2;
  // Calculate relative angle between phone heading and Kaaba
  const relativeAngle = (qiblaAngle - compassHeading + 360) % 360;
  const isAligned = Math.abs(relativeAngle) < 4 || Math.abs(relativeAngle - 360) < 4;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 text-xs font-bold text-amber-300">
            <Compass className="w-3.5 h-3.5" />
            Penentu Arah Ka'bah Al-Musyarrafah
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Arah Kiblat
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Arahkan sajadah Anda dengan presisi sudut derajat Ka'bah di Makkah Al-Mukarramah berdasarkan koordinat lintang & bujur perangkat Anda.
          </p>
        </div>

        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
          <Icon3DKaaba className="w-20 h-20" />
        </div>
      </div>

      {/* Main Compass Visualizer Card */}
      <div className="clay-card p-6 sm:p-8 bg-white flex flex-col items-center justify-center relative overflow-hidden text-center space-y-6">
        {/* Alignment status alert */}
        <div className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
          isAligned
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 animate-pulse'
            : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
        }`}>
          {isAligned ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>MASYA ALLAH! Posisi Menghadap Tepat ke Arah Ka'bah</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Putar perangkat Anda hingga jarum emas mengarah ke puncak</span>
            </>
          )}
        </div>

        {/* 3D Interactive Compass Dial */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-4">
          {/* Outer Emerald Glow Ring */}
          <div className="absolute inset-0 rounded-full border-8 border-emerald-100 shadow-2xl bg-gradient-to-b from-emerald-50/60 to-white" />

          {/* Degree ticks */}
          <div className="absolute inset-3 rounded-full border-2 border-dashed border-emerald-300/80" />

          {/* Cardinal Directions */}
          <div className="absolute top-4 text-xs font-black text-rose-600 tracking-wider">U (UTARA)</div>
          <div className="absolute right-4 text-xs font-black text-slate-400">T</div>
          <div className="absolute bottom-4 text-xs font-black text-slate-400">S</div>
          <div className="absolute left-4 text-xs font-black text-slate-400">B</div>

          {/* Rotating Compass Needle Container */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${qiblaAngle - compassHeading}deg)` }}
          >
            {/* Kaaba Icon at the Target Angle */}
            <div className="absolute -top-3 flex flex-col items-center">
              <div className="p-1 bg-amber-100 rounded-full border border-amber-300 shadow-md">
                <Icon3DKaaba className="w-9 h-9 animate-bounce" />
              </div>
              <span className="text-[10px] font-black text-amber-900 bg-amber-300 px-1.5 py-0.5 rounded shadow mt-0.5">
                KA'BAH
              </span>
            </div>

            {/* Needle pointer */}
            <div className="w-3 h-48 bg-gradient-to-t from-slate-400 via-amber-400 to-rose-600 rounded-full shadow-lg relative flex items-center justify-center">
              {/* Gold center pivot */}
              <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-emerald-950 shadow flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-950" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Metric Cards */}
        {qibla && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-2">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Sudut Derajat</div>
              <div className="text-2xl font-black text-emerald-950">{qibla.qibla_degree}°</div>
              <div className="text-[10px] text-slate-500">dari Arah Utara Sejati</div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80">
              <div className="text-[10px] uppercase font-bold text-amber-800">Arah Mata Angin</div>
              <div className="text-2xl font-black text-amber-950">{qibla.direction_compass}</div>
              <div className="text-[10px] text-slate-500">Menghadap Kiblat</div>
            </div>

            <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200/80">
              <div className="text-[10px] uppercase font-bold text-teal-800">Jarak ke Makkah</div>
              <div className="text-2xl font-black text-teal-950">
                {qibla.distance_km.toLocaleString('id-ID')} km
              </div>
              <div className="text-[10px] text-slate-500">Garis Lurus Bumi</div>
            </div>
          </div>
        )}

        {/* Manual Calibration Slider (for Desktop & testing) */}
        <div className="w-full max-w-md pt-4 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Putar Manual Arah Perangkat:
            </span>
            <span className="font-mono font-bold text-emerald-800">{Math.round(compassHeading)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={compassHeading}
            onChange={(e) => setCompassHeading(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
