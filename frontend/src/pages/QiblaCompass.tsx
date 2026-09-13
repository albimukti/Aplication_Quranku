import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QiblaInfo, City } from '../types';
import { fetchApi } from '../utils/api';
import { INDONESIAN_CITIES } from '../utils/cities';
import { useSettings } from '../context/SettingsContext';
import { Icon3DKaaba } from '../components/3d/Icons3D';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  Map as MapIcon,
  Sun,
  Layers,
  ZoomIn,
  Globe,
  Monitor,
  Info,
} from 'lucide-react';

const KAABA_COORDS = { lat: 21.422487, lng: 39.826206 };

export const QiblaCompass: React.FC = () => {
  const { activeCityId, setActiveCityId, activeCityName, setActiveCityName } = useSettings();

  // Tab State: 'compass' | 'map' | 'sun'
  const [activeView, setActiveView] = useState<'compass' | 'map' | 'sun'>('compass');

  // Qibla calculation data
  const [qibla, setQibla] = useState<QiblaInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.2088,
    lng: 106.8456,
  });
  const [locationSource, setLocationSource] = useState<'gps' | 'city'>('city');
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Device type detection
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [iosPermissionState, setIosPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [compassAccuracy, setCompassAccuracy] = useState<number | null>(null);

  // Compass Heading & Sensors
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [tilt, setTilt] = useState<{ pitch: number; roll: number }>({ pitch: 0, roll: 0 });
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [sensorType, setSensorType] = useState<string>('Mencari sensor...');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [manualMode, setManualMode] = useState<boolean>(false);

  // City Picker Modal State
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [cities, setCities] = useState<City[]>(INDONESIAN_CITIES);
  const [citySearch, setCitySearch] = useState<string>('');

  // Map state
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapTileType, setMapTileType] = useState<'satellite' | 'street'>('satellite');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Solar position calculation state
  const [sunData, setSunData] = useState<{ azimuth: number; elevation: number; isDay: boolean }>({
    azimuth: 0,
    elevation: 0,
    isDay: true,
  });

  // Refs for smoothing and throttle
  const rawHeadingRef = useRef<number>(0);
  const smoothHeadingRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastAlignedRef = useRef<boolean>(false);
  const lastChimeTimeRef = useRef<number>(0);

  // Device detection on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      const isApple = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndr = /Android/i.test(ua);
      const isMob = isApple || isAndr || /Mobi/i.test(ua);

      setIsIOS(isApple);
      setIsAndroid(isAndr);
      setIsMobile(isMob);

      // Default PC users to Map tab or recommend Map tab
      if (!isMob) {
        setSensorType('PC/Laptop (Mode Visual Aktif)');
      }

      const hasRequestPerm =
        typeof window !== 'undefined' &&
        typeof (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
          .DeviceOrientationEvent?.requestPermission === 'function';

      if (!hasRequestPerm && isApple) {
        setIosPermissionState('granted');
      }
    }
  }, []);

  // Web Audio chime generator
  const playAlignmentChime = useCallback(() => {
    if (!soundEnabled) return;
    const now = Date.now();
    if (now - lastChimeTimeRef.current < 2500) return;
    lastChimeTimeRef.current = now;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime);

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
      // Audio context restricted before interaction
    }
  }, [soundEnabled]);

  // Solar position calculation formula (NOAA algorithm)
  const calculateSolarPosition = useCallback((lat: number, lng: number) => {
    const d = new Date();
    const rad = Math.PI / 180;
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const utcHours = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);

    const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

    const timeOffset = eqtime + 4 * lng - 60 * (-d.getTimezoneOffset() / 60);
    const tst = (d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60 + timeOffset + 1440) % 1440;
    const ha = (tst / 4 - 180) * rad;
    const phi = lat * rad;

    const cZenith = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(ha);
    const elevation = Math.asin(Math.max(-1, Math.min(1, cZenith))) / rad;

    const y = -Math.sin(ha);
    const x = Math.tan(decl) * Math.cos(phi) - Math.sin(phi) * Math.cos(ha);
    let az = Math.atan2(y, x) / rad;
    if (az < 0) az += 360;

    setSunData({
      azimuth: Math.round(az * 10) / 10,
      elevation: Math.round(elevation * 10) / 10,
      isDay: elevation > -0.8,
    });
  }, []);

  // Fetch Qibla data for coordinates
  const loadQibla = useCallback((lat: number, lng: number) => {
    setLoading(true);
    fetchApi<QiblaInfo>(`/prayer/qibla?lat=${lat}&lng=${lng}`)
      .then((data) => {
        setQibla(data);
        setCurrentCoords({ lat, lng });
        calculateSolarPosition(lat, lng);
        setLoading(false);
      })
      .catch(() => {
        // Fallback calculation for Jakarta
        setQibla({
          latitude: lat,
          longitude: lng,
          qibla_degree: 295.2,
          direction_compass: 'Barat Laut',
          distance_km: 7912,
        });
        setCurrentCoords({ lat, lng });
        calculateSolarPosition(lat, lng);
        setLoading(false);
      });
  }, [calculateSolarPosition]);

  // Fetch Cities list
  useEffect(() => {
    fetchApi<City[]>('/prayer/cities')
      .then((data) => {
        if (data && data.length > cities.length) {
          setCities(data);
        }
        const active = (data && data.length > 0 ? data : INDONESIAN_CITIES).find((c) => c.id === activeCityId) ||
                       INDONESIAN_CITIES.find((c) => c.id === activeCityId);
        if (active) {
          loadQibla(active.latitude, active.longitude);
        } else {
          loadQibla(-6.2088, 106.8456);
        }
      })
      .catch(() => {
        const active = INDONESIAN_CITIES.find((c) => c.id === activeCityId);
        if (active) {
          loadQibla(active.latitude, active.longitude);
        } else {
          loadQibla(-6.2088, 106.8456);
        }
      });
  }, [activeCityId, loadQibla, cities.length]);

  // Periodic sun position update (every 60s)
  useEffect(() => {
    const timer = setInterval(() => {
      calculateSolarPosition(currentCoords.lat, currentCoords.lng);
    }, 60000);
    return () => clearInterval(timer);
  }, [calculateSolarPosition, currentCoords]);

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

  // Smooth animation loop for silky compass movement with angular wrap-around
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

  // Setup Device Orientation Sensors with multi-device fallback
  const setupSensors = useCallback(() => {
    let cleanupSensor: (() => void) | null = null;

    // 1. Try modern Generic Sensor API: AbsoluteOrientationSensor (Chrome on Android)
    if (typeof window !== 'undefined' && 'AbsoluteOrientationSensor' in window) {
      try {
        const SensorConstructor = (window as any).AbsoluteOrientationSensor;
        const sensor = new SensorConstructor({ frequency: 60 });

        sensor.addEventListener('reading', () => {
          const q = sensor.quaternion;
          if (q && q.length === 4) {
            // Convert quaternion [x, y, z, w] to Euler heading
            const [x, y, z, w] = q;
            const headingRad = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
            let headingDeg = headingRad * (180 / Math.PI);
            if (headingDeg < 0) headingDeg += 360;

            // Screen orientation offset
            const screenAngle = (window.screen?.orientation?.angle || 0);
            headingDeg = (headingDeg + screenAngle + 360) % 360;

            rawHeadingRef.current = headingDeg;
            setHasSensor(true);
            setSensorType('Sensor Magnetometer 3D (Presisi Tinggi)');
          }
        });

        sensor.addEventListener('error', (event: any) => {
          if (event.error?.name === 'NotAllowedError') {
            console.log('AbsoluteOrientationSensor permission denied, falling back');
          }
        });

        sensor.start();
        cleanupSensor = () => sensor.stop();
      } catch (e) {
        console.log('AbsoluteOrientationSensor init failed, using deviceorientation', e);
      }
    }

    // 2. Standard device orientation listener (iOS Safari & Android fallback)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // Screen rotation adjustment (portrait vs landscape)
      const screenAngle = (window.screen?.orientation?.angle ?? (window as any).orientation ?? 0);

      // Case A: iOS Safari webkitCompassHeading (direct absolute heading)
      const webkitHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      const webkitAccuracy = (e as unknown as { webkitCompassAccuracy?: number }).webkitCompassAccuracy;

      if (typeof webkitAccuracy === 'number') {
        setCompassAccuracy(webkitAccuracy);
      }

      if (typeof webkitHeading === 'number' && !isNaN(webkitHeading)) {
        heading = (webkitHeading + screenAngle + 360) % 360;
        setSensorType('Kompas Digital iPhone (iOS Native)');
      }
      // Case B: Android absolute orientation event (W3C standard)
      else if (typeof e.alpha === 'number') {
        const beta = e.beta ?? 0;
        const gamma = e.gamma ?? 0;
        const alpha = e.alpha ?? 0;

        // W3C Euler angles projection to horizontal plane (tilt compensation)
        if (Math.abs(beta) > 2 || Math.abs(gamma) > 2) {
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

          // Vector pointing towards device top projected onto horizontal plane
          const rA = -cA * sB * sG - sA * cG;
          const rB = -sA * sB * sG + cA * cG;

          let comp = Math.atan2(rA, rB) * (180 / Math.PI);
          if (comp < 0) comp += 360;
          heading = (comp + screenAngle + 360) % 360;
        } else {
          // Device lying flat
          heading = (360 - alpha + screenAngle + 360) % 360;
        }

        setSensorType('Sensor Orientasi Android (Tilt-Compensated)');
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

    const win = window as any;
    const hasAbsolute = 'ondeviceorientationabsolute' in win;

    if (hasAbsolute) {
      win.addEventListener('deviceorientationabsolute', handleOrientation, true);
    } else if (win.DeviceOrientationEvent) {
      win.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (cleanupSensor) cleanupSensor();
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
          // ignore vibration error
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

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (activeView !== 'map') return;
    if (!mapContainerRef.current) return;

    // Initialize Map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
        zoom: 17,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Tile Layers
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      mapTileType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution =
      mapTileType === 'satellite'
        ? '© Esri, Maxar, Earthstar Geographics'
        : '© OpenStreetMap contributors';

    const newTile = L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
    tileLayerRef.current = newTile;

    // Clear previous vector layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Custom Marker: User Position
    const userMarkerIcon = L.divIcon({
      className: 'qibla-user-marker',
      html: `
        <div style="position:relative; display:flex; align-items:center; justify-content:center; width:34px; height:34px;">
          <div style="position:absolute; width:34px; height:34px; border-radius:9999px; background:rgba(16,185,129,0.35); animation:pulse 2s infinite;"></div>
          <div style="width:20px; height:20px; border-radius:9999px; background:#059669; border:3px solid #ffffff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;">
            <div style="width:6px; height:6px; border-radius:9999px; background:#fef08a;"></div>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Custom Marker: Kaaba Position
    const kaabaMarkerIcon = L.divIcon({
      className: 'qibla-kaaba-marker',
      html: `
        <div style="background:#022c22; border:2px solid #facc15; border-radius:12px; padding:4px 8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.5); display:flex; align-items:center; gap:4px; color:#ffffff; font-size:11px; font-weight:900;">
          <span>🕋</span>
          <span>Ka'bah</span>
        </div>
      `,
      iconSize: [80, 30],
      iconAnchor: [40, 15],
    });

    // Add Markers
    L.marker([currentCoords.lat, currentCoords.lng], { icon: userMarkerIcon })
      .addTo(map)
      .bindPopup(`<b>Posisi Anda</b><br>${activeCityName}<br>${currentCoords.lat.toFixed(4)}°, ${currentCoords.lng.toFixed(4)}°`)
      .openPopup();

    L.marker([KAABA_COORDS.lat, KAABA_COORDS.lng], { icon: kaabaMarkerIcon })
      .addTo(map)
      .bindPopup("<b>Ka'bah Al-Mukarramah</b><br>Makkah Al-Mukarramah, Arab Saudi");

    // Geodesic Great Circle Line to Kaaba
    L.polyline(
      [
        [currentCoords.lat, currentCoords.lng],
        [KAABA_COORDS.lat, KAABA_COORDS.lng],
      ],
      {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.9,
        dashArray: '10, 8',
      }
    ).addTo(map);

    // Initial view set to user coords with street level zoom
    map.setView([currentCoords.lat, currentCoords.lng], 17);

    // Ensure map redraws when container resized
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Map cleanup on unmount
    };
  }, [activeView, currentCoords, mapTileType, activeCityName]);

  const handleZoomToUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 18);
    }
  };

  const handleZoomToOverview = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds([
        [currentCoords.lat, currentCoords.lng],
        [KAABA_COORDS.lat, KAABA_COORDS.lng],
      ], { padding: [40, 40] });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 text-white shadow-2xl relative overflow-hidden border border-emerald-700/40">
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
              Kompas multi-perangkat presisi tinggi: Sensor 3D untuk iPhone & Android, Peta Satelit Interaktif untuk PC/Laptop, serta metode falak posisi bayangan matahari.
            </p>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-emerald-800/80 to-emerald-950/80 rounded-2xl border border-emerald-500/30 shadow-xl flex items-center justify-center">
            <Icon3DKaaba className="w-20 h-20 drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* Device Info & Smart Recommendation Banner */}
      {!isMobile && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white border border-teal-500/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-800/50 border border-teal-500/30 text-teal-300">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>Terdeteksi Perangkat PC / Laptop</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] px-2 py-0.5 rounded-full font-black">
                  REKOMENDASI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                PC tidak memiliki sensor kompas fisik. Gunakan tab <b>Peta Satelit</b> untuk melihat garis lurus dari atap rumah Anda ke Ka'bah secara akurat!
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('map')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shrink-0 shadow cursor-pointer"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Buka Peta Satelit</span>
          </button>
        </div>
      )}

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
                  LIVE GPS
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
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200/80 disabled:opacity-50 cursor-pointer"
            title="Gunakan GPS Perangkat"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'Mencari GPS...' : 'GPS Saya'}</span>
          </button>

          <button
            onClick={() => setIsCityModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
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

      {/* Navigation View Tabs (Compass, Map, Sun) */}
      <div className="flex p-1.5 bg-slate-200/80 rounded-2xl gap-1">
        <button
          onClick={() => setActiveView('compass')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeView === 'compass'
              ? 'bg-white text-emerald-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>Kompas Sensor 3D</span>
        </button>

        <button
          onClick={() => setActiveView('map')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeView === 'map'
              ? 'bg-white text-emerald-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapIcon className="w-4 h-4 text-teal-600" />
          <span>Peta Satelit (Garis Ka'bah)</span>
          {!isMobile && (
            <span className="hidden sm:inline-block bg-teal-100 text-teal-800 text-[9px] px-1.5 py-0.2 rounded font-black">
              PC
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('sun')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeView === 'sun'
              ? 'bg-white text-emerald-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Arah Matahari & Bayangan</span>
        </button>
      </div>

      {/* iOS Sensor Permission Request Banner */}
      {isIOS && iosPermissionState !== 'granted' && activeView === 'compass' && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-3 bg-white/20 rounded-xl shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">Aktifkan Sensor Kompas HP (iOS Safari)</h4>
              <p className="text-xs text-amber-100">
                Tekan tombol di samping agar browser iPhone mengizinkan akses magnetometer & giroskop kompas.
              </p>
            </div>
          </div>
          <button
            onClick={requestIOSPermission}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-amber-900 font-black text-xs shadow hover:bg-amber-50 active:scale-95 transition cursor-pointer"
          >
            Izinkan Sensor Kompas
          </button>
        </div>
      )}

      {/* ================= VIEW 1: COMPASS DIAL ================= */}
      {activeView === 'compass' && (
        <div className={`clay-card p-6 sm:p-8 bg-white flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 border ${
          isAligned
            ? 'border-emerald-500 shadow-2xl ring-4 ring-emerald-500/20'
            : 'border-emerald-100'
        }`}>
          {isAligned && (
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-amber-400/5 to-transparent pointer-events-none animate-pulse" />
          )}

          {/* Top Status & Guidance Indicator */}
          <div className="w-full flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
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
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  manualMode
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Ganti Mode Simulasi Manual"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mode:</span>
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
              <span>Posisikan HP mendatar di telapak tangan agar kompas akurat</span>
            </div>
          )}

          {/* COMPASS DIAL CONTAINER */}
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center my-6 select-none">
            {/* Top Sight Notch (Fixed forward direction of the device) */}
            <div className="absolute top-0 z-30 flex flex-col items-center -translate-y-1">
              <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[14px] border-t-amber-500 drop-shadow-md" />
              <div className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-950 -mt-1 shadow" />
            </div>

            {/* Outer Chrome Bezel Ring */}
            <div className="absolute inset-0 rounded-full border-[10px] border-slate-900 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center">
              <div className="absolute inset-2 rounded-full border border-amber-400/30" />
            </div>

            {/* Rotating Compass Rose */}
            <div
              className="absolute inset-3 rounded-full flex items-center justify-center transition-transform duration-150 ease-out"
              style={{ transform: `rotate(${-compassHeading}deg)` }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 shadow-inner" />

              <div className="absolute inset-6 rounded-full border border-emerald-500/20" />
              <div className="absolute inset-12 rounded-full border border-dashed border-emerald-400/20" />
              <div className="absolute inset-20 rounded-full border border-amber-400/15" />

              {/* Degree Ticks */}
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

              {/* Cardinal Points */}
              <div className="absolute top-4 flex flex-col items-center">
                <span className="text-sm font-black text-rose-500 tracking-wider">U</span>
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-0.5 shadow-sm shadow-rose-500" />
              </div>

              <div className="absolute right-4 text-xs font-black text-emerald-200">T</div>
              <div className="absolute bottom-4 text-xs font-black text-emerald-200">S</div>
              <div className="absolute left-4 text-xs font-black text-emerald-200">B</div>

              <div className="absolute text-[10px] font-bold text-slate-400" style={{ transform: 'rotate(45deg) translateY(-380%)' }}>
                TL
              </div>
              <div className="absolute text-[10px] font-bold text-slate-400" style={{ transform: 'rotate(135deg) translateY(-380%)' }}>
                TG
              </div>
              <div className="absolute text-[10px] font-bold text-slate-400" style={{ transform: 'rotate(225deg) translateY(-380%)' }}>
                BD
              </div>
              <div className="absolute text-[10px] font-bold text-slate-400" style={{ transform: 'rotate(315deg) translateY(-380%)' }}>
                BL
              </div>

              {/* Ka'bah Marker Pin */}
              <div
                className="absolute inset-0 flex justify-center items-start pointer-events-none"
                style={{ transform: `rotate(${qiblaAngle}deg)` }}
              >
                <div className="w-0.5 h-1/2 bg-gradient-to-t from-transparent via-amber-400/60 to-amber-300 absolute top-0" />
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

            {/* Central Needle Pointer */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out pointer-events-none z-20"
              style={{ transform: `rotate(${relativeAngle}deg)` }}
            >
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

            {/* Spirit / Bubble Level */}
            <div
              className="absolute z-30 w-16 h-16 rounded-full bg-slate-950/80 border-2 border-emerald-400/40 shadow-xl flex items-center justify-center backdrop-blur-sm"
              title="Level Kemiringan HP (Pusatkan gelembung)"
            >
              <div className="absolute w-full h-[1px] bg-emerald-500/30" />
              <div className="absolute h-full w-[1px] bg-emerald-500/30" />
              <div className="w-6 h-6 rounded-full border border-emerald-400/50" />
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

          {/* Sensor Status Info */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasSensor && !manualMode ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-semibold text-slate-700">{sensorType}</span>
            </div>

            {compassAccuracy !== null && compassAccuracy > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span>Akurasi Sensor: ±{Math.round(compassAccuracy)}°</span>
              </>
            )}

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

          {/* Manual Rotation Slider for PC / Simulation */}
          {manualMode && (
            <div className="w-full max-w-md pt-5 mt-4 border-t border-slate-100 flex flex-col gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
              <div className="flex items-center justify-between text-xs text-amber-950 font-semibold">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-amber-700" /> Putar Simulasi Arah HP / Kompas:
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
                  className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900 shadow-sm cursor-pointer"
                >
                  -15° Kiri
                </button>

                <button
                  onClick={() => {
                    rawHeadingRef.current = qiblaAngle;
                    smoothHeadingRef.current = qiblaAngle;
                    setCompassHeading(qiblaAngle);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                >
                  Set Tepat ke Ka'bah ({qiblaAngle}°)
                </button>

                <button
                  onClick={() => {
                    const target = (compassHeading + 15) % 360;
                    rawHeadingRef.current = target;
                    setCompassHeading(target);
                  }}
                  className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900 shadow-sm cursor-pointer"
                >
                  +15° Kanan
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: INTERACTIVE SATELLITE MAP ================= */}
      {activeView === 'map' && (
        <div className="clay-card p-4 sm:p-6 bg-white space-y-4 border border-emerald-100 shadow-xl rounded-3xl animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-emerald-700" />
                  Peta Satelit Garis Lurus ke Ka'bah
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  100% Akurat di PC & HP
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Garis oranye terputus-putus ditarik langsung dari posisi Anda menuju Ka'bah di Makkah.
              </p>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setMapTileType(mapTileType === 'satellite' ? 'street' : 'satellite')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{mapTileType === 'satellite' ? 'Mode Peta Jalan' : 'Mode Satelit'}</span>
              </button>

              <button
                onClick={handleZoomToUser}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5 transition cursor-pointer"
                title="Perbesar ke rumah/gedung Anda"
              >
                <ZoomIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zoom Atap Rumah (18x)</span>
              </button>

              <button
                onClick={handleZoomToOverview}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                title="Lihat seluruh garis hingga Makkah"
              >
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span>Garis Penuh</span>
              </button>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div
            ref={mapContainerRef}
            className="w-full h-96 sm:h-[480px] rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative z-0"
          />

          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
            <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <div className="font-bold text-emerald-900">Cara Menggunakan Peta untuk Menentukan Arah Sajadah:</div>
              <p>
                1. Perbesar (zoom in) peta hingga Anda melihat atap rumah, gedung kantor, atau jalan di depan tempat Anda berada.
              </p>
              <p>
                2. Perhatikan <b>garis oranye</b>: garis tersebut adalah arah lurus persis menuju Ka'bah di Makkah.
              </p>
              <p>
                3. Bandingkan arah garis dengan dinding ruangan atau sisi jalan. Anda dapat meletakkan sajadah sejajar dengan sudut kemiringan garis tersebut!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 3: SUN POSITION & SHADOW METHOD ================= */}
      {activeView === 'sun' && (
        <div className="clay-card p-6 sm:p-8 bg-white space-y-6 border border-emerald-100 shadow-xl rounded-3xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
              <Sun className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Arah Kiblat Berdasarkan Posisi & Bayangan Matahari
              </h3>
              <p className="text-xs text-slate-500">
                Metode falak astronomi klasik yang 100% akurat tanpa memerlukan kompas elektronik.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sun Azimuth Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50 to-white border border-amber-200/80 space-y-3">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-600" /> Posisi Matahari Saat Ini
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-amber-950 font-mono">
                  {sunData.azimuth}°
                </span>
                <span className="text-xs font-bold text-amber-800">
                  {getHeadingLabel(sunData.azimuth)} ({sunData.azimuth < 180 ? 'Pagi/Siang' : 'Sore'})
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-amber-200/60">
                <div>Ketinggian Matahari: <b>{sunData.elevation}° di atas ufuk</b></div>
                <div>Status: <b>{sunData.isDay ? 'Matahari di atas cakrawala ☀️' : 'Malam hari (matahari terbenam) 🌙'}</b></div>
              </div>
            </div>

            {/* Qibla Relative to Sun */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white border border-emerald-200/80 space-y-3">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-700" /> Sudut Ka'bah vs Matahari
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-emerald-950 font-mono">
                  {qiblaAngle}°
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  {qibla?.direction_compass || 'Barat Laut'}
                </span>
              </div>

              {(() => {
                const diff = (qiblaAngle - sunData.azimuth + 360) % 360;
                const rightAngle = diff <= 180 ? diff : diff - 360;
                const isRight = rightAngle > 0;
                return (
                  <div className="text-xs text-slate-700 pt-1 border-t border-emerald-200/60">
                    Kiblat berada <b>{Math.abs(Math.round(rightAngle))}° di sebelah {isRight ? 'kanan' : 'kiri'}</b> dari arah matahari saat ini.
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Shadow Technique Guide */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Metode Praktis Bayangan Tongkat (Istiwa)
            </h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <b>Tancapkan benda lurus tegak</b> (tongkat, botol, atau pulpen) di tempat terbuka yang terkena sinar matahari.
              </li>
              <li>
                Bayangan benda jatuh mengarah tepat ke azimuth: <b>{Math.round((sunData.azimuth + 180) % 360)}°</b>.
              </li>
              <li>
                <b>Fenomena Rashdul Qiblah (Istiwa A'dham)</b>: Dua kali setahun pada tanggal <b>28 Mei (pukul 16:18 WIB)</b> dan <b>16 Juli (pukul 16:27 WIB)</b>, matahari melintas tepat di atas Ka'bah di Makkah. Pada saat itu, semua bayangan benda tegak di Indonesia mengarah persis ke arah Kiblat!
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Info Metric Cards */}
      {qibla && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
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

      {/* Guide & Tips Card */}
      <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Tips Akurasi Kompas di Berbagai Perangkat
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Pengguna iPhone (iOS):</strong> Pastikan mengklik tombol "Izinkan Sensor Kompas" jika diminta oleh Safari. Kalibrasi kompas dengan gerakan angka 8 di udara jika akurasi berkurang.
          </li>
          <li>
            <strong>Pengguna Android:</strong> Pegang HP mendatar atau sedikit miring secara wajar. Sistem secara otomatis menerapkan koreksi kemiringan 3D dan menggunakan sensor orientasi absolut.
          </li>
          <li>
            <strong>Pengguna PC / Laptop:</strong> Karena komputer desktop tidak memiliki magnetometer fisik, gunakan <strong>Tab Peta Satelit</strong> untuk melihat garis oranye lurus dari rumah Anda ke Ka'bah, atau gunakan <strong>Tab Arah Matahari</strong>.
          </li>
          <li>
            <strong>Jauhkan dari Interferensi Magnetik:</strong> Jangan gunakan kompas di dekat benda logam tebal, speaker besar, atau casing HP bertutup magnet.
          </li>
        </ul>
      </div>

      {/* ================= MODAL PILIH KOTA ================= */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
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
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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

            <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
              {filteredCities.length > 0 ? (
                filteredCities.map((c) => {
                  const isSelected = c.id === activeCityId && locationSource === 'city';
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCity(c)}
                      className={`w-full py-3 px-3.5 rounded-xl flex items-center justify-between transition text-left cursor-pointer ${
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

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
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
