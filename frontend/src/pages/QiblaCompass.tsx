import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QiblaInfo, City } from '../types';
import { fetchApi } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { Icon3DKaaba } from '../components/3d/Icons3D';
import {
  Compass,
  Navigation,
  MapPin,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  X,
  Search,
  Crosshair,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const QiblaCompass: React.FC = () => {
  const { activeCityId, setActiveCityId, activeCityName, setActiveCityName } = useSettings();

  // Qibla calculation data
  const [qibla, setQibla] = useState<QiblaInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSource, setLocationSource] = useState<'gps' | 'city'>('city');
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Compass Heading & Sensors
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [tilt, setTilt] = useState<{ pitch: number; roll: number }>({ pitch: 0, roll: 0 });
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [iosPermissionState, setIosPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [manualMode, setManualMode] = useState<boolean>(false);

  // City Picker Modal State
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [cities, setCities] = useState<City[]>([]);
  const [citySearch, setCitySearch] = useState<string>('');

  // Refs for smoothing and throttle
  const rawHeadingRef = useRef<number>(0);
  const smoothHeadingRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastAlignedRef = useRef<boolean>(false);
  const lastChimeTimeRef = useRef<number>(0);

  // Web Audio chime generator
  const playAlignmentChime = useCallback(() => {
    if (!soundEnabled) return;
    const now = Date.now();
    if (now - lastChimeTimeRef.current < 2500) return; // throttle 2.5s
    lastChimeTimeRef.current = now;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Dual harmonic bell sound (D5 + A5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6 harmonic

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.65);
      osc2.stop(ctx.currentTime + 0.65);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [soundEnabled]);

  // Fetch Qibla data for coordinates
  const loadQibla = useCallback((lat: number, lng: number) => {
    setLoading(true);
    fetchApi<QiblaInfo>(`/prayer/qibla?lat=${lat}&lng=${lng}`)
      .then((data) => {
        setQibla(data);
        setCurrentCoords({ lat, lng });
        setLoading(false);
      })
      .catch(() => {
        // Fallback default Jakarta
        setQibla({
          latitude: lat,
          longitude: lng,
          qibla_degree: 295.2,
          direction_compass: 'Barat Laut',
          distance_km: 7912,
        });
        setCurrentCoords({ lat, lng });
        setLoading(false);
      });
  }, []);

  // Fetch Cities list
  useEffect(() => {
    fetchApi<City[]>('/prayer/cities')
      .then((data) => {
        setCities(data);
        // Find active city coordinate
        const active = data.find((c) => c.id === activeCityId);
        if (active) {
          loadQibla(active.latitude, active.longitude);
        } else {
          loadQibla(-6.2088, 106.8456);
        }
      })
      .catch(() => {
        loadQibla(-6.2088, 106.8456);
      });
  }, [activeCityId, loadQibla]);

  // GPS Auto-detect handler
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Perangkat Anda tidak mendukung fitur lokasi (GPS).');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationSource('gps');
        setActiveCityName('Lokasi GPS Saya');
        loadQibla(latitude, longitude);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoError('Izin GPS ditolak. Silakan aktifkan izin lokasi di browser Anda atau pilih kota manual.');
        } else {
          setGeoError('Gagal mendeteksi lokasi GPS. Pastikan sinyal GPS aktif.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // City selection from modal
  const handleSelectCity = (city: City) => {
    setActiveCityId(city.id);
    setActiveCityName(`${city.name}, ${city.province}`);
    setLocationSource('city');
    setGeoError(null);
    loadQibla(city.latitude, city.longitude);
    setIsCityModalOpen(false);
  };

  // Check iOS permission requirements
  useEffect(() => {
    const isAppleMobile =
      typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    const isDeviceIOS =
      isAppleMobile &&
      typeof window !== 'undefined' &&
      typeof (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
        .DeviceOrientationEvent?.requestPermission === 'function';

    setIsIOS(isDeviceIOS);
  }, []);

  // Request iOS Sensor Permission
  const requestIOSPermission = async () => {
    try {
      const DOE = (
        window as unknown as {
          DeviceOrientationEvent?: { requestPermission?: () => Promise<'granted' | 'denied'> };
        }
      ).DeviceOrientationEvent;

      if (DOE?.requestPermission) {
        const res = await DOE.requestPermission();
        if (res === 'granted') {
          setIosPermissionState('granted');
          setHasSensor(true);
          setupSensors();
        } else {
          setIosPermissionState('denied');
        }
      }
    } catch (err) {
      console.error('Error requesting orientation permission:', err);
    }
  };

  // Smooth animation loop for silky compass movement
  useEffect(() => {
    const updateSmoothHeading = () => {
      let diff = (rawHeadingRef.current - smoothHeadingRef.current) % 360;
      if (diff < -180) diff += 360;
      if (diff > 180) diff -= 360;

      // Exponential damping factor
      smoothHeadingRef.current = (smoothHeadingRef.current + diff * 0.22 + 360) % 360;
      setCompassHeading(Math.round(smoothHeadingRef.current * 10) / 10);

      animFrameRef.current = requestAnimationFrame(updateSmoothHeading);
    };

    animFrameRef.current = requestAnimationFrame(updateSmoothHeading);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Setup Device Orientation Sensors
  const setupSensors = useCallback(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // 1. iOS native heading (already relative to true/magnetic north)
      const webkitHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === 'number' && !isNaN(webkitHeading)) {
        heading = webkitHeading;
      }
      // 2. Android & W3C standard absolute orientation
      else if (typeof e.alpha === 'number') {
        const beta = e.beta ?? 0;
        const gamma = e.gamma ?? 0;
        const alpha = e.alpha ?? 0;

        // W3C Euler angles projection to horizontal plane (tilt compensation)
        if (beta !== 0 || gamma !== 0) {
          const deg2rad = Math.PI / 180;
          const a = alpha * deg2rad;
          const b = beta * deg2rad;
          const g = gamma * deg2rad;

          const cA = Math.cos(a);
          const sA = Math.sin(a);
          const cB = Math.cos(b);
          const sB = Math.sin(b);
          const cG = Math.cos(g);
          const sG = Math.sin(g);

          // Vector pointing towards device top
          const rA = -cA * sB * sG - sA * cG;
          const rB = -sA * sB * sG + cA * cG;

          let comp = Math.atan2(rA, rB) * (180 / Math.PI);
          if (comp < 0) comp += 360;
          heading = comp;
        } else {
          // Lying completely flat fallback
          heading = (360 - alpha) % 360;
        }
      }

      if (heading !== null) {
        rawHeadingRef.current = heading;
        setHasSensor(true);
      }

      if (typeof e.beta === 'number' && typeof e.gamma === 'number') {
        setTilt({
          pitch: Math.round(e.beta),
          roll: Math.round(e.gamma),
        });
      }
    };

    // Listen to absolute orientation if available (Chrome Android)
    const win = window as any;
    const hasAbsolute = 'ondeviceorientationabsolute' in win;
    if (hasAbsolute) {
      win.addEventListener('deviceorientationabsolute', handleOrientation, true);
    } else if (win.DeviceOrientationEvent) {
      win.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (hasAbsolute) {
        win.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      }
      if (win.DeviceOrientationEvent) {
        win.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  useEffect(() => {
    if (!isIOS) {
      const cleanup = setupSensors();
      return cleanup;
    }
  }, [isIOS, setupSensors]);

  // Target Qibla Bearing and Alignment Calculation
  const qiblaAngle = qibla?.qibla_degree ?? 295.2;

  // Relative angle: difference between where phone points and Kaaba direction (-180 to +180)
  const relativeAngle = ((qiblaAngle - compassHeading + 180) % 360 + 360) % 360 - 180;
  const isAligned = Math.abs(relativeAngle) <= 3.5;

  // Device Tilt Detection (Spirit level)
  const isTooTilted = Math.abs(tilt.pitch) > 22 || Math.abs(tilt.roll) > 22;
  // Calculate bubble position in 48px circle (-20 to 20 px)
  const bubbleX = Math.max(-20, Math.min(20, (tilt.roll / 25) * 20));
  const bubbleY = Math.max(-20, Math.min(20, (tilt.pitch / 25) * 20));

  // Audio & Haptic triggers upon alignment
  useEffect(() => {
    if (isAligned && !lastAlignedRef.current) {
      playAlignmentChime();
      if (vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([45, 60, 45]);
        } catch {
          // ignore vibration errors
        }
      }
    }
    lastAlignedRef.current = isAligned;
  }, [isAligned, playAlignmentChime, vibrationEnabled]);

  // Cardinal direction helper for current heading
  const getHeadingLabel = (deg: number) => {
    const directions = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
    const idx = Math.round(deg / 45) % 8;
    return directions[idx];
  };

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.province.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 text-white shadow-2xl relative overflow-hidden border border-emerald-700/40">
        {/* Background Islamic Pattern Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-300 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-bold text-amber-300 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              Penentu Arah Ka'bah Al-Mukarramah
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
              Arah Kiblat Presisi
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Kompas digital otomatis dengan sensor orientasi 3D dan kalkulasi sudut geodesik bumi dari posisi Anda langsung ke Ka'bah di Makkah.
            </p>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-emerald-800/80 to-emerald-950/80 rounded-2xl border border-emerald-500/30 shadow-xl flex items-center justify-center">
            <Icon3DKaaba className="w-20 h-20 drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* Location Bar & Selector */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm border border-emerald-100">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <MapPin className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span>{locationSource === 'gps' ? 'Koordinat GPS Anda' : 'Kota Pilihan'}</span>
              {locationSource === 'gps' && (
                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  LIVE
                </span>
              )}
            </div>
            <div className="font-bold text-slate-800 text-sm sm:text-base truncate">
              {activeCityName}
            </div>
            {currentCoords && (
              <div className="text-[10px] text-slate-500 font-mono">
                {currentCoords.lat.toFixed(4)}°, {currentCoords.lng.toFixed(4)}°
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleUseGPS}
            disabled={geoLoading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200/80 disabled:opacity-50"
            title="Gunakan GPS Perangkat"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'Mencari GPS...' : 'GPS Saya'}</span>
          </button>

          <button
            onClick={() => setIsCityModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Pilih Kota</span>
          </button>
        </div>
      </div>

      {geoError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{geoError}</span>
        </div>
      )}

      {/* iOS Sensor Permission Request Banner */}
      {isIOS && iosPermissionState !== 'granted' && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-3 bg-white/20 rounded-xl shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">Aktifkan Sensor Kompas HP (iOS)</h4>
              <p className="text-xs text-amber-100">
                Safari di iPhone memerlukan izin untuk mengakses sensor giroskop & magnetometer kompas.
              </p>
            </div>
          </div>
          <button
            onClick={requestIOSPermission}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-amber-900 font-black text-xs shadow hover:bg-amber-50 active:scale-95 transition"
          >
            Izinkan Sensor Kompas
          </button>
        </div>
      )}

      {/* Main Interactive Compass Dial Card */}
      <div className={`clay-card p-6 sm:p-8 bg-white flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 border ${
        isAligned
          ? 'border-emerald-500 shadow-2xl ring-4 ring-emerald-500/20'
          : 'border-emerald-100'
      }`}>
        {/* Alignment Glow Aura when Facing Kaaba */}
        {isAligned && (
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-amber-400/5 to-transparent pointer-events-none animate-pulse" />
        )}

        {/* Top Status & Guidance Indicator */}
        <div className="w-full flex items-center justify-between mb-4 z-10">
          {/* Audio & Vibration Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
              title={soundEnabled ? 'Suara Bunyi Aktif' : 'Suara Bunyi Mati'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setManualMode(!manualMode)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                manualMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Ganti Mode Simulasi Manual"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mode</span>
              <span>{manualMode ? 'Manual' : 'Sensor'}</span>
            </button>
          </div>

          {/* Heading angle badge at 12 o'clock */}
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-full text-xs font-mono font-black shadow-md border border-slate-700">
            <Crosshair className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>
              {Math.round(compassHeading)}° {getHeadingLabel(compassHeading)}
            </span>
          </div>
        </div>

        {/* Dynamic Alignment Guidance Banner */}
        <div
          className={`w-full max-w-md py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-sm z-10 ${
            isAligned
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/30 shadow-lg scale-105'
              : 'bg-emerald-50 text-emerald-950 border border-emerald-200/80'
          }`}
        >
          {isAligned ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0 animate-bounce" />
              <span className="tracking-wide">ALHAMDULILLAH! Posisi Tepat Menghadap Ka'bah</span>
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 text-emerald-700 shrink-0 animate-spin-slow" />
              <span>
                {relativeAngle > 3.5
                  ? `Putar ${Math.abs(Math.round(relativeAngle))}° ke Kanan ↻`
                  : `Putar ${Math.abs(Math.round(relativeAngle))}° ke Kiri ↺`}
              </span>
            </>
          )}
        </div>

        {/* Level Warning if device is tilted */}
        {isTooTilted && hasSensor && !manualMode && (
          <div className="mt-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-semibold flex items-center gap-1.5 animate-pulse z-10">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Posisikan HP mendatar (layar menghadap langit) agar kompas akurat</span>
          </div>
        )}

        {/* ================= COMPASS DIAL CONTAINER ================= */}
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center my-6 select-none">
          {/* Top Sight Notch (Fixed forward direction of the device) */}
          <div className="absolute top-0 z-30 flex flex-col items-center -translate-y-1">
            <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[14px] border-t-amber-500 drop-shadow-md" />
            <div className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-950 -mt-1 shadow" />
          </div>

          {/* Outer Chrome Bezel Ring */}
          <div className="absolute inset-0 rounded-full border-[10px] border-slate-900 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center">
            {/* Inner Gold Accented Track */}
            <div className="absolute inset-2 rounded-full border border-amber-400/30" />
          </div>

          {/* ---------------- ROTATING COMPASS ROSE (Dial moves with -compassHeading) ---------------- */}
          <div
            className="absolute inset-3 rounded-full flex items-center justify-center transition-transform duration-150 ease-out"
            style={{ transform: `rotate(${-compassHeading}deg)` }}
          >
            {/* Compass Dial Face */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 shadow-inner" />

            {/* Geometric Concentric Rings */}
            <div className="absolute inset-6 rounded-full border border-emerald-500/20" />
            <div className="absolute inset-12 rounded-full border border-dashed border-emerald-400/20" />
            <div className="absolute inset-20 rounded-full border border-amber-400/15" />

            {/* Dial Degree Tick Marks (every 15 degrees) */}
            {[...Array(24)].map((_, i) => {
              const deg = i * 15;
              const isMajor = deg % 45 === 0;
              const isQuarter = deg % 90 === 0;
              return (
                <div
                  key={deg}
                  className="absolute inset-0 flex justify-center"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div
                    className={`w-0.5 rounded-full ${
                      isQuarter
                        ? 'h-4 bg-amber-300 shadow-sm'
                        : isMajor
                        ? 'h-3 bg-emerald-400/80'
                        : 'h-2 bg-slate-500/60'
                    }`}
                  />
                </div>
              );
            })}

            {/* Cardinal Points on Rotating Dial */}
            {/* UTARA (0°) */}
            <div className="absolute top-4 flex flex-col items-center">
              <span className="text-sm font-black text-rose-500 tracking-wider">U</span>
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-0.5 shadow-sm shadow-rose-500" />
            </div>

            {/* TIMUR (90°) */}
            <div className="absolute right-4 text-xs font-black text-emerald-200">T</div>

            {/* SELATAN (180°) */}
            <div className="absolute bottom-4 text-xs font-black text-emerald-200">S</div>

            {/* BARAT (270°) */}
            <div className="absolute left-4 text-xs font-black text-emerald-200">B</div>

            {/* Ordinal directions */}
            <div
              className="absolute text-[10px] font-bold text-slate-400"
              style={{ transform: 'rotate(45deg) translateY(-400%)' }}
            >
              TL
            </div>
            <div
              className="absolute text-[10px] font-bold text-slate-400"
              style={{ transform: 'rotate(135deg) translateY(-400%)' }}
            >
              TG
            </div>
            <div
              className="absolute text-[10px] font-bold text-slate-400"
              style={{ transform: 'rotate(225deg) translateY(-400%)' }}
            >
              BD
            </div>
            <div
              className="absolute text-[10px] font-bold text-slate-400"
              style={{ transform: 'rotate(315deg) translateY(-400%)' }}
            >
              BL
            </div>

            {/* ---------------- KA'BAH MARKER PIN ON DIAL (Fixed at qiblaAngle) ---------------- */}
            <div
              className="absolute inset-0 flex justify-center items-start pointer-events-none"
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              {/* Line pointing to Kaaba from center to edge */}
              <div className="w-0.5 h-1/2 bg-gradient-to-t from-transparent via-amber-400/60 to-amber-300 absolute top-0" />

              {/* Kaaba Marker Badge */}
              <div className="flex flex-col items-center -translate-y-2 relative z-20">
                <div
                  className={`p-1 rounded-xl shadow-lg border transition-all duration-300 ${
                    isAligned
                      ? 'bg-amber-400 border-white scale-125 shadow-amber-400/80 ring-4 ring-amber-300/50'
                      : 'bg-emerald-950/90 border-amber-400/80'
                  }`}
                >
                  <Icon3DKaaba className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="px-1.5 py-0.5 mt-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase shadow tracking-tight">
                  KIBLAT
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- CENTRAL ARROW POINTER (Aims towards Kaaba) ---------------- */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out pointer-events-none z-20"
            style={{ transform: `rotate(${relativeAngle}deg)` }}
          >
            {/* North-facing golden arrow needle */}
            <div className="relative flex flex-col items-center -translate-y-12">
              <div
                className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[28px] drop-shadow-md ${
                  isAligned
                    ? 'border-b-amber-300 scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]'
                    : 'border-b-emerald-400'
                }`}
              />
              <div
                className={`w-1.5 h-10 ${
                  isAligned
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500'
                    : 'bg-gradient-to-b from-emerald-400 to-emerald-700'
                } rounded-full`}
              />
            </div>
          </div>

          {/* ---------------- SPIRIT / BUBBLE LEVEL IN CENTER ---------------- */}
          <div
            className="absolute z-30 w-16 h-16 rounded-full bg-slate-950/80 border-2 border-emerald-400/40 shadow-xl flex items-center justify-center backdrop-blur-sm"
            title="Level Kemiringan HP (Pusatkan gelembung)"
          >
            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-emerald-500/30" />
            <div className="absolute h-full w-[1px] bg-emerald-500/30" />
            <div className="w-6 h-6 rounded-full border border-emerald-400/50" />

            {/* Bubble Dot */}
            <div
              className={`w-3.5 h-3.5 rounded-full transition-transform duration-75 ease-out shadow-sm ${
                isTooTilted ? 'bg-amber-400 shadow-amber-400/50' : 'bg-emerald-400 shadow-emerald-400/80'
              }`}
              style={{
                transform: `translate(${bubbleX}px, ${bubbleY}px)`,
              }}
            />
          </div>
        </div>

        {/* Sensor & Level Status Footer Info */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hasSensor && !manualMode ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>
              {manualMode
                ? 'Mode Simulasi'
                : hasSensor
                ? 'Sensor Kompas Aktif'
                : 'Sensor Menunggu Gerakan'}
            </span>
          </div>

          <span className="text-slate-300">•</span>

          <div className="flex items-center gap-1.5">
            <ShieldCheck
              className={`w-3.5 h-3.5 ${isTooTilted ? 'text-amber-500' : 'text-emerald-600'}`}
            />
            <span>
              Kemiringan: {Math.max(Math.abs(tilt.pitch), Math.abs(tilt.roll))}° (
              {isTooTilted ? 'Kurang Datar' : 'Ideal ✓'})
            </span>
          </div>
        </div>

        {/* Manual Calibration Slider (for Desktop & Testing) */}
        {manualMode && (
          <div className="w-full max-w-md pt-5 mt-4 border-t border-slate-100 flex flex-col gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
            <div className="flex items-center justify-between text-xs text-amber-950 font-semibold">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-amber-700" /> Putar Simulasi Arah HP:
              </span>
              <span className="font-mono font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                {Math.round(compassHeading)}°
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="360"
              value={Math.round(compassHeading)}
              onChange={(e) => {
                const val = Number(e.target.value);
                rawHeadingRef.current = val;
                smoothHeadingRef.current = val;
                setCompassHeading(val);
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => {
                  const target = (compassHeading - 15 + 360) % 360;
                  rawHeadingRef.current = target;
                  setCompassHeading(target);
                }}
                className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900 shadow-sm"
              >
                -15° Kiri
              </button>

              <button
                onClick={() => {
                  rawHeadingRef.current = qiblaAngle;
                  smoothHeadingRef.current = qiblaAngle;
                  setCompassHeading(qiblaAngle);
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Set Tepat ke Ka'bah ({qiblaAngle}°)
              </button>

              <button
                onClick={() => {
                  const target = (compassHeading + 15) % 360;
                  rawHeadingRef.current = target;
                  setCompassHeading(target);
                }}
                className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900 shadow-sm"
              >
                +15° Kanan
              </button>
            </div>
          </div>
        )}

        {/* Info Metric Cards */}
        {qibla && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl pt-6">
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex flex-col items-center text-center">
              <div className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">
                Derajat Kiblat
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 my-0.5">
                {qibla.qibla_degree}°
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                dari Arah Utara Sejati
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex flex-col items-center text-center">
              <div className="text-[10px] uppercase font-black text-amber-900 tracking-wider">
                Arah Mata Angin
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-950 my-0.5">
                {qibla.direction_compass}
              </div>
              <div className="text-[11px] text-amber-800 font-medium">
                Bidikan Lurus Ka'bah
              </div>
            </div>

            <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 flex flex-col items-center text-center">
              <div className="text-[10px] uppercase font-black text-teal-900 tracking-wider">
                Jarak ke Ka'bah
              </div>
              <div className="text-2xl sm:text-3xl font-black text-teal-950 my-0.5">
                {qibla.distance_km.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-teal-800 font-medium">
                Kilometer Garis Lurus
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guide & Tips Card */}
      <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Tips Mendapatkan Arah Kiblat Paling Akurat
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Posisikan HP Mendatar</strong> di atas telapak tangan atau lantai agar sensor kompas bekerja optimal tanpa distorsi medan magnet.
          </li>
          <li>
            <strong>Jauhkan dari Benda Logam & Elektronik Besar</strong> seperti laptop, speaker, besi cor tebal, atau casing HP bermagnet yang dapat mengacaukan sensor kompas.
          </li>
          <li>
            <strong>Kalibrasi Gerakan Angka 8 (Figure-8)</strong> jika jarum ragu-ragu: ayunkan HP Anda membentuk angka delapan di udara selama 3 detik.
          </li>
          <li>
            Jika menggunakan laptop/PC, gunakan <strong>Mode Manual</strong> untuk melihat sudut derajat dan arahkan kompas manual fisik Anda.
          </li>
        </ul>
      </div>

      {/* ================= MODAL PILIH KOTA ================= */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-base">Pilih Kota di Indonesia</h3>
                  <p className="text-xs text-emerald-200">Untuk kalkulasi presisi sudut Ka'bah</p>
                </div>
              </div>
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Box */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama kota atau provinsi..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* City List */}
            <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
              {filteredCities.length > 0 ? (
                filteredCities.map((c) => {
                  const isSelected = c.id === activeCityId && locationSource === 'city';
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCity(c)}
                      className={`w-full py-3 px-3.5 rounded-xl flex items-center justify-between transition text-left ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold">{c.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {c.province} • {c.timezone}
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Kota tidak ditemukan. Coba ketik nama yang berbeda.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
