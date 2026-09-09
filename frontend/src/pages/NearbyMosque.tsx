import React, { useState, useEffect } from 'react';
import { Mosque } from '../types';
import { fetchApi } from '../utils/api';
import { Icon3DMosque } from '../components/3d/Icons3D';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Users,
  Compass,
  CheckCircle,
  Building,
  RefreshCw,
  Search,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const INDONESIA_CITIES = [
  { name: 'Lokasi GPS Anda Saat Ini', lat: -6.2088, lng: 106.8456, isGps: true },
  { name: 'Jakarta Pusat & Sekitarnya', lat: -6.1754, lng: 106.8272 },
  { name: 'Jakarta Selatan (Kebayoran/Tebet)', lat: -6.2615, lng: 106.8106 },
  { name: 'Bandung (Jawa Barat)', lat: -6.9175, lng: 107.6191 },
  { name: 'Surabaya (Jawa Timur)', lat: -7.2575, lng: 112.7521 },
  { name: 'Semarang (Jawa Tengah)', lat: -6.9667, lng: 110.4167 },
  { name: 'Yogyakarta (DIY)', lat: -7.7956, lng: 110.3695 },
  { name: 'Surakarta / Solo', lat: -7.5755, lng: 110.8243 },
  { name: 'Medan (Sumatera Utara)', lat: 3.5952, lng: 98.6722 },
  { name: 'Makassar (Sulawesi Selatan)', lat: -5.1477, lng: 119.4327 },
  { name: 'Depok (Jawa Barat)', lat: -6.4025, lng: 106.7942 },
  { name: 'Tangerang / BSD', lat: -6.1783, lng: 106.6319 },
  { name: 'Bekasi (Jawa Barat)', lat: -6.2383, lng: 106.9756 },
  { name: 'Bogor (Kota Hujan)', lat: -6.5971, lng: 106.806 },
];

export const NearbyMosque: React.FC = () => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.2088,
    lng: 106.8456,
  });
  const [locationName, setLocationName] = useState<string>('Pusat Kota / Default GPS');
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [detectingGps, setDetectingGps] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string>('Mendeteksi GPS...');

  const loadMosques = (lat: number, lng: number) => {
    setLoading(true);
    fetchApi<Mosque[]>(`/masjid/nearby?lat=${lat}&lng=${lng}`)
      .then((data) => {
        setMosques(data);
        if (data.length > 0) setSelectedMosque(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      setDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(c);
          setLocationName(`GPS Akurat: ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`);
          setGpsStatus('GPS Aktif & Sesuai');
          loadMosques(c.lat, c.lng);
          setDetectingGps(false);
        },
        (err) => {
          console.warn('Geolocation initial check:', err.message);
          setGpsStatus('Default Lokasi (Izin GPS belum aktif)');
          loadMosques(userCoords.lat, userCoords.lng);
          setDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      loadMosques(userCoords.lat, userCoords.lng);
    }
  }, []);

  const handleRefreshGps = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung fitur GPS / Geolokasi.');
      return;
    }
    setDetectingGps(true);
    setGpsStatus('Mengakses satelit GPS presisi tinggi...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(c);
        setLocationName(`GPS Real-Time: ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`);
        setGpsStatus(`Lokasi Akurat Ditemukan (Akurasi ±${Math.round(pos.coords.accuracy || 10)} meter)`);
        loadMosques(c.lat, c.lng);
        setDetectingGps(false);
      },
      (err) => {
        console.warn('GPS refresh error:', err);
        setDetectingGps(false);
        let msg = 'Gagal mengakses GPS.';
        if (err.code === 1) {
          msg = 'Izin lokasi ditolak browser. Mohon izinkan akses lokasi pada ikon gembok di address bar.';
        } else if (err.code === 2) {
          msg = 'Posisi tidak tersedia. Pastikan GPS perangkat aktif.';
        } else if (err.code === 3) {
          msg = 'Waktu pencarian GPS habis (timeout). Mencoba kembali dengan lokasi default.';
        }
        setGpsStatus(msg);
        alert(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleCityChange = (city: (typeof INDONESIA_CITIES)[0]) => {
    if (city.isGps) {
      handleRefreshGps();
    } else {
      setUserCoords({ lat: city.lat, lng: city.lng });
      setLocationName(city.name);
      setGpsStatus(`Lokasi diatur ke: ${city.name}`);
      loadMosques(city.lat, city.lng);
    }
  };

  const formatDistance = (distKm: number) => {
    if (distKm < 1) {
      return `${Math.round(distKm * 1000)} meter`;
    }
    return `${distKm.toFixed(1)} km`;
  };

  const directGoogleMapsUrl = `https://www.google.com/maps/search/masjid+terdekat/@${userCoords.lat},${userCoords.lng},15z`;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 text-xs font-bold text-amber-300 border border-emerald-500/30">
            <MapPin className="w-3.5 h-3.5" />
            Navigasi Real-Time Rumah Ibadah & Tempat Sholat
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Masjid Terdekat di Sekitar Anda
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Mendeteksi masjid & musholla terdekat langsung dari satelit GPS koordinat posisi Anda saat ini. Dilengkapi rute instan Google Maps, estimasi jarak jalan kaki/berkendara, dan fasilitas jamaah.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 flex-shrink-0 z-10 w-full sm:w-auto">
          <button
            onClick={handleRefreshGps}
            disabled={detectingGps}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs shadow-gold-glow flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-75"
          >
            <Navigation className={`w-4 h-4 ${detectingGps ? 'animate-spin' : ''}`} />
            {detectingGps ? 'Mencari Satelit GPS...' : 'Perbarui Lokasi GPS Sekarang'}
          </button>

          <a
            href={directGoogleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            Buka Pencarian di Google Maps App
          </a>
        </div>
      </div>

      {/* GPS Status & City Switcher Bar */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-200">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Posisi Terpilih:</span>
              <span className="text-emerald-700 truncate">{locationName}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{gpsStatus}</p>
          </div>
        </div>

        {/* Quick City Dropdown Fallback */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <label className="text-xs font-semibold text-slate-500 flex-shrink-0">
            Pilih Kota / Area:
          </label>
          <select
            onChange={(e) => {
              const selected = INDONESIA_CITIES.find((c) => c.name === e.target.value);
              if (selected) handleCityChange(selected);
            }}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {INDONESIA_CITIES.map((c, idx) => (
              <option key={idx} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Map Preview & Mosque Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Mosque Cards List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
            <span>Daftar Masjid Terdekat ({mosques.length} ditemukan)</span>
            <span className="text-emerald-700">Urut jarak terdekat (0-5 km)</span>
          </div>

          {loading ? (
            <div className="clay-card p-10 text-center space-y-3 bg-white">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-800">
                Mencari masjid & musholla terdekat dari koordinat Anda...
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Menghubungkan ke OpenStreetMap & Google Maps untuk data radius 5 km
              </p>
            </div>
          ) : mosques.length === 0 ? (
            <div className="clay-card p-8 text-center space-y-3 bg-white">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                Tidak ada masjid terdata dalam radius langsung
              </h4>
              <p className="text-xs text-slate-500">
                Gunakan tombol di bawah untuk mencari langsung di peta Google Maps.
              </p>
              <a
                href={directGoogleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                <ExternalLink className="w-4 h-4" /> Buka Google Maps Terdekat
              </a>
            </div>
          ) : (
            mosques.map((mosque) => {
              const isSelected = selectedMosque?.id === mosque.id;
              return (
                <div
                  key={mosque.id}
                  onClick={() => setSelectedMosque(mosque)}
                  className={`clay-card p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-emerald-600 bg-emerald-50/30 border-emerald-400 shadow-md'
                      : 'bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Building className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                          <span>{mosque.name}</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {mosque.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="inline-block px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-emerald-950 font-black text-xs shadow-sm">
                        {formatDistance(mosque.distance_km)}
                      </span>
                    </div>
                  </div>

                  {/* Facilities Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Users className="w-3 h-3" /> {mosque.capacity}
                    </span>
                    {mosque.facilities.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Direct Google Maps Action Button */}
                  <div className="mt-4 flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-slate-400">
                      {mosque.city}
                    </span>
                    <a
                      href={mosque.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Petunjuk Arah Google Maps
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Map & Details Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="clay-card p-5 bg-white space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Pratinjau Peta Interaktif
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                OpenStreetMap Real-Time
              </span>
            </h3>

            {/* Embedded OpenStreetMap / Location Frame */}
            <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner bg-slate-100">
              <iframe
                title="Peta Lokasi Masjid"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedMosque?.longitude || userCoords.lng) - 0.02}%2C${(selectedMosque?.latitude || userCoords.lat) - 0.02}%2C${(selectedMosque?.longitude || userCoords.lng) + 0.02}%2C${(selectedMosque?.latitude || userCoords.lat) + 0.02}&amp;layer=mapnik&amp;marker=${selectedMosque?.latitude || userCoords.lat}%2C${selectedMosque?.longitude || userCoords.lng}`}
              />
            </div>

            {selectedMosque && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900 truncate">
                    {selectedMosque.name}
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md flex-shrink-0">
                    {formatDistance(selectedMosque.distance_km)} dari Anda
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {selectedMosque.address}
                </p>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold">Fasilitas Jamaah:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedMosque.facilities.map((f, idx) => (
                      <span
                        key={idx}
                        className="bg-white px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 border border-emerald-200/60"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={selectedMosque.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-emerald-glow transition-all active:scale-95"
                >
                  <Navigation className="w-4 h-4 text-amber-300" />
                  Buka Rute Langsung ke Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
