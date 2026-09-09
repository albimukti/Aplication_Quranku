import React, { useState, useEffect } from 'react';
import { PrayerTimes as PrayerTimesType, City } from '../types';
import { fetchApi } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { Icon3DPrayer } from '../components/3d/Icons3D';
import {
  Clock,
  MapPin,
  Calendar,
  Bell,
  BellOff,
  Navigation,
  Volume2,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface PrayerTimesProps {
  onOpenAdhanTest: () => void;
}

export const PrayerTimesPage: React.FC<PrayerTimesProps> = ({ onOpenAdhanTest }) => {
  const { activeCityId, setActiveCityId, activeCityName, setActiveCityName, alarms, toggleAlarm } = useSettings();

  const [cities, setCities] = useState<City[]>([]);
  const [prayerData, setPrayerData] = useState<PrayerTimesType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [citySearch, setCitySearch] = useState<string>('');

  useEffect(() => {
    fetchApi<City[]>('/prayer/cities').then((data) => {
      setCities(data);
    });
  }, []);

  const loadPrayers = (cityId: string, date: string) => {
    setLoading(true);
    fetchApi<PrayerTimesType>(`/prayer/times?city=${cityId}&date=${date}`)
      .then((data) => {
        setPrayerData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadPrayers(activeCityId, selectedDate);
  }, [activeCityId, selectedDate]);

  const handleCitySelect = (city: City) => {
    setActiveCityId(city.id);
    setActiveCityName(city.name);
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung geolokasi');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchApi<PrayerTimesType>(`/prayer/times?lat=${latitude}&lng=${longitude}&date=${selectedDate}`)
          .then((data) => {
            setPrayerData(data);
            setActiveCityName('Lokasi GPS Saya');
            setGeoLoading(false);
          })
          .catch(() => setGeoLoading(false));
      },
      () => {
        alert('Gagal mendapatkan koordinat GPS. Pastikan izin lokasi diberikan.');
        setGeoLoading(false);
      }
    );
  };

  const prayerItems = prayerData
    ? [
        { name: 'Imsak', time: prayerData.imsak, alarmKey: null, desc: 'Waktu menahan diri sebelum fajar' },
        { name: 'Subuh', time: prayerData.subuh, alarmKey: 'subuh' as const, desc: 'Fajar shodiq terbit di timur' },
        { name: 'Terbit', time: prayerData.terbit, alarmKey: null, desc: 'Matahari mulai meninggi' },
        { name: 'Dhuha', time: prayerData.dhuha, alarmKey: null, desc: 'Waktu sholat sunnah dhuha' },
        { name: 'Dzuhur', time: prayerData.dzuhur, alarmKey: 'dzuhur' as const, desc: 'Matahari tergelincir dari zenit' },
        { name: 'Ashar', time: prayerData.ashar, alarmKey: 'ashar' as const, desc: 'Bayangan sama panjang dengan benda' },
        { name: 'Maghrib', time: prayerData.maghrib, alarmKey: 'maghrib' as const, desc: 'Matahari tenggelam sempurna' },
        { name: 'Isya', time: prayerData.isya, alarmKey: 'isya' as const, desc: 'Hilangnya mega merah di barat' },
      ]
    : [];

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.province.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 text-xs font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Standar Kementerian Agama Republik Indonesia
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Jadwal Sholat Seluruh Indonesia
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Perhitungan astronomis akurat untuk 34+ provinsi dan ratusan kota se-Indonesia, dilengkapi alarm adzan otomatis.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
            <Icon3DPrayer className="w-20 h-20" />
          </div>
          <button
            onClick={onOpenAdhanTest}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs shadow-gold-glow flex items-center gap-1.5 transition-all"
          >
            <Bell className="w-4 h-4" /> Uji Suara Adzan
          </button>
        </div>
      </div>

      {/* City & Date Filter Bar */}
      <div className="clay-card p-5 bg-white space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* City Selection Dropdown with Search */}
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Pilih Kota / Kabupaten:
            </label>
            <div className="flex gap-2">
              <select
                value={activeCityId}
                onChange={(e) => {
                  const c = cities.find((x) => x.id === e.target.value);
                  if (c) handleCitySelect(c);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.province}) - {c.timezone}
                  </option>
                ))}
              </select>

              <button
                onClick={handleUseGeolocation}
                disabled={geoLoading}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1 flex-shrink-0 transition-all"
                title="Gunakan GPS Lokasi Saya"
              >
                <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">GPS</span>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Tanggal Jadwal:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Active City & Next Prayer Highlight Card */}
      {prayerData && (
        <div className="p-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-600/40">
          <div>
            <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
              {prayerData.city} • {prayerData.timezone}
            </span>
            <h3 className="text-2xl font-black mt-1">
              Sholat Selanjutnya: <span className="text-amber-400">{prayerData.next_prayer}</span>
            </h3>
            <p className="text-xs text-emerald-200 mt-1">
              Waktu sholat berikutnya tiba dalam kurun waktu <b>{prayerData.remaining}</b>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdhanTest}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs shadow-gold-glow flex items-center gap-2 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              Putar Suara Adzan
            </button>
          </div>
        </div>
      )}

      {/* Timetable Grid with Alarm Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {prayerItems.map((item) => {
          const isNext = prayerData?.next_prayer === item.name;
          const isAlarmActive = item.alarmKey ? alarms[item.alarmKey] : false;

          return (
            <div
              key={item.name}
              className={`clay-card p-5 relative overflow-hidden transition-all ${
                isNext
                  ? 'ring-2 ring-amber-400 bg-amber-50/20 border-amber-300 scale-102'
                  : 'bg-white'
              }`}
            >
              {isNext && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  Berikutnya
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-800">{item.name}</span>

                {item.alarmKey && (
                  <button
                    onClick={() => item.alarmKey && toggleAlarm(item.alarmKey)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      isAlarmActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                    }`}
                    title={isAlarmActive ? 'Alarm Aktif' : 'Alarm Mati'}
                  >
                    {isAlarmActive ? <Bell className="w-4 h-4 text-emerald-600" /> : <BellOff className="w-4 h-4" />}
                  </button>
                )}
              </div>

              <div className="text-3xl font-black text-emerald-950 my-1 font-mono">
                {item.time}
              </div>

              <p className="text-[11px] text-slate-500 mt-2">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
