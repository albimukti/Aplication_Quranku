import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useAudio } from '../context/AudioContext';
import { PrayerTimes } from '../types';
import { fetchApi } from '../utils/api';
import { AyahEndMarker } from '../components/AyahEndMarker';
import { renderTajweedText, TajweedRule } from '../utils/tajweed';
import { TajweedDetailCard } from '../components/TajweedDetailCard';
import {
  Icon3DQuran,
  Icon3DMosque,
  Icon3DKaaba,
  Icon3DCompass,
  Icon3DIqro,
  Icon3DZakat,
  Icon3DPrayer,
} from '../components/3d/Icons3D';
import {
  BookOpen,
  Volume2,
  Clock,
  MapPin,
  Heart,
  Bookmark,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Bell,
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenAdhanTest: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onOpenAdhanTest }) => {
  const { user, role, quickLogin } = useAuth();
  const { activeCityId, activeCityName } = useSettings();
  const { playTrack } = useAudio();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeTajweed, setActiveTajweed] = useState<{ rule: TajweedRule; word: string } | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchApi<PrayerTimes>(`/prayer/times?city=${activeCityId}`)
      .then((data) => setPrayerTimes(data))
      .catch(() => {});
  }, [activeCityId]);

  const quickFeatures = [
    {
      id: 'quran',
      title: "Al-Qur'an 30 Juz",
      desc: '114 Surah lengkap audio & tajwid',
      icon: Icon3DQuran,
      badge: 'Lengkap',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'juz-amma',
      title: "Juz 'Amma",
      desc: 'Hafalan surah pendek Juz 30',
      icon: Icon3DQuran,
      badge: 'Hafalan',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'iqro',
      title: "Iqro' Jilid 1-6",
      desc: 'Panduan membaca huruf hijaiyah',
      icon: Icon3DIqro,
      badge: 'Interaktif',
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'prayer',
      title: 'Jadwal Sholat',
      desc: 'Seluruh kota & alarm adzan',
      icon: Icon3DPrayer,
      badge: 'Kemenag RI',
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'qibla',
      title: 'Arah Kiblat 3D',
      desc: 'Kompas sudut derajat Ka\'bah',
      icon: Icon3DCompass,
      badge: 'GPS Otomatis',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'doa',
      title: 'Doa & Dzikir',
      desc: 'Doa sholat & dzikir pagi petang',
      icon: Icon3DMosque,
      badge: 'Shahih',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'zakat',
      title: 'Sedekah & Zakat',
      desc: 'Kalkulator maal, profesi & infaq',
      icon: Icon3DZakat,
      badge: 'Penyaluran',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'masjid',
      title: 'Masjid Terdekat',
      desc: 'Peta rute langsung Google Maps',
      icon: Icon3DMosque,
      badge: 'Peta Navigasi',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 sm:p-8 md:p-10 border border-emerald-600/40">
        {/* Background Decorative Rings */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-xs font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assalamu'alaikum Warahmatullahi Wabarakatuh</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Dekatkan Diri dengan <span className="text-amber-300 underline decoration-amber-400/50">Al-Qur'an</span> Setiap Hari
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed max-w-xl">
              Selamat datang di <b>Quranku</b>. Portal ibadah lengkap mulai dari membaca mushaf, menghafal Juz 'Amma, belajar Iqro', pengingat sholat seluruh Indonesia, hingga penyaluran sedekah dan zakat.
            </p>

            {/* Quick Action Buttons in Hero */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('quran')}
                className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm shadow-gold-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Mulai Baca Al-Qur'an
              </button>
              <button
                onClick={() => setActiveTab('iqro')}
                className="px-6 py-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-400/40 text-white font-semibold text-sm transition-all flex items-center gap-2"
              >
                <Icon3DIqro className="w-4 h-4" />
                Belajar Iqro' Jilid 1-6
              </button>
            </div>
          </div>

          {/* Right Card: Real-time Prayer Widget */}
          <div className="lg:col-span-5">
            <div className="bg-emerald-950/75 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-emerald-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {activeCityName}
                  </span>
                </div>
                <div className="text-sm font-mono font-bold text-amber-300 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                  {currentTime || '00:00:00'}
                </div>
              </div>

              {prayerTimes ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[11px] text-emerald-300 uppercase tracking-wider">Sholat Berikutnya</span>
                      <h4 className="text-2xl font-black text-amber-300">{prayerTimes.next_prayer}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-emerald-300 uppercase tracking-wider">Tersisa</span>
                      <p className="text-xs font-semibold text-emerald-200">{prayerTimes.remaining}</p>
                    </div>
                  </div>

                  {/* Prayer Schedule Mini Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                    <div className={`p-2 rounded-xl border ${prayerTimes.next_prayer === 'Subuh' ? 'bg-amber-400 text-emerald-950 font-bold border-amber-300' : 'bg-emerald-900/50 text-emerald-100 border-emerald-800/50'}`}>
                      <div className="text-[10px] opacity-80">Subuh</div>
                      <div className="font-bold">{prayerTimes.subuh}</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${prayerTimes.next_prayer === 'Dzuhur' ? 'bg-amber-400 text-emerald-950 font-bold border-amber-300' : 'bg-emerald-900/50 text-emerald-100 border-emerald-800/50'}`}>
                      <div className="text-[10px] opacity-80">Dzuhur</div>
                      <div className="font-bold">{prayerTimes.dzuhur}</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${prayerTimes.next_prayer === 'Ashar' ? 'bg-amber-400 text-emerald-950 font-bold border-amber-300' : 'bg-emerald-900/50 text-emerald-100 border-emerald-800/50'}`}>
                      <div className="text-[10px] opacity-80">Ashar</div>
                      <div className="font-bold">{prayerTimes.ashar}</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${prayerTimes.next_prayer === 'Maghrib' ? 'bg-amber-400 text-emerald-950 font-bold border-amber-300' : 'bg-emerald-900/50 text-emerald-100 border-emerald-800/50'}`}>
                      <div className="text-[10px] opacity-80">Maghrib</div>
                      <div className="font-bold">{prayerTimes.maghrib}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 text-[11px] text-emerald-300">
                    <button
                      onClick={() => setActiveTab('prayer')}
                      className="hover:text-amber-300 underline flex items-center gap-1"
                    >
                      Lihat Jadwal Lengkap (Isya, Dhuha, Imsak) <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={onOpenAdhanTest}
                      className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <Bell className="w-3 h-3" /> Uji Adzan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-emerald-200">
                  Memuat waktu sholat...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 8 Main Feature Cards with 3D Icons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Fitur Utama Quranku
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilih menu ibadah di bawah ini untuk memulai
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {quickFeatures.map((f) => {
            const Icon3D = f.icon;
            return (
              <div
                key={f.id}
                onClick={() => setActiveTab(f.id)}
                className="clay-card p-5 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Background glow hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/40 rounded-full blur-xl group-hover:scale-150 transition-transform pointer-events-none" />

                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform">
                    <Icon3D className="w-12 h-12" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                    <span>{f.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Ayat Inspiration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ayat of the Day */}
        <div className="lg:col-span-7 clay-card p-6 sm:p-7 bg-gradient-to-br from-white via-emerald-50/30 to-white border border-emerald-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              <Sparkles className="w-3 h-3" />
              Ayat Hari Ini
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              QS. Al-Insyirah [94: 5-6]
            </span>
          </div>

          <div className="text-right py-4 my-1">
            <p className="font-arabic text-2xl sm:text-3xl text-slate-900 leading-[3.0] sm:leading-[3.3]" style={{ wordSpacing: '0.22em' }}>
              {renderTajweedText('فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', true, (rule, word) =>
                setActiveTajweed({ rule, word })
              )}
              <AyahEndMarker number={5} size="sm" />
              {renderTajweedText('إِنَّ مَعَ الْعُسْرِ يُسْرًا', true, (rule, word) =>
                setActiveTajweed({ rule, word })
              )}
              <AyahEndMarker number={6} size="sm" />
            </p>
          </div>

          <div className="space-y-1 text-xs sm:text-sm text-slate-600">
            <p className="italic text-emerald-900 font-medium">
              "Fa inna ma'al-'usri yusraa, inna ma'al-'usri yusraa."
            </p>
            <p className="text-slate-700">
              "Maka sesungguhnya bersama kesulitan ada kemudahan, sesungguhnya bersama kesulitan ada kemudahan."
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() =>
                playTrack({
                  title: 'QS. Al-Insyirah (Ayat 5-6)',
                  subtitle: 'Mishary Rashid Alafasy',
                  url: 'https://everyayah.com/data/Alafasy_128kbps/094005.mp3',
                })
              }
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all"
            >
              <Volume2 className="w-4 h-4" />
              Dengarkan Murattal
            </button>
            <button
              onClick={() => setActiveTab('quran')}
              className="text-xs font-bold text-slate-500 hover:text-emerald-700"
            >
              Buka Surah Lengkap →
            </button>
          </div>
        </div>

        {/* Hadits & Charity Motivation */}
        <div className="lg:col-span-5 clay-card p-6 sm:p-7 bg-[#f4f8f5] text-slate-900 flex flex-col justify-between border border-emerald-200 shadow-[0_16px_30px_rgba(16,185,129,0.08)]">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-700 text-emerald-50 border border-emerald-600 shadow-sm">
              <Heart className="w-3.5 h-3.5 text-rose-200 fill-rose-200" />
              Keutamaan Sedekah Subuh
            </span>

            <h3 className="text-[2.4rem] leading-[1.02] font-black text-[#f7c74d] tracking-tight">
              Didoakan Dua <br />Malaikat <br />Setiap Pagi
            </h3>

            <p className="text-[15px] leading-relaxed text-slate-700 font-medium">
              "Tidak ada satu subuh pun yang dialami hamba-hamba Allah kecuali turun kepada mereka dua malaikat. Salah satu di antara keduanya berdoa: 'Ya Allah, berikanlah ganti bagi orang yang berinfak'..."
            </p>

            <p className="text-sm font-bold text-slate-600">
              — HR. Bukhari & Muslim
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-300/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-slate-600">Mulai donasi dari</div>
                <div className="text-[2.1rem] font-black text-slate-900 mt-1">Rp 10.000</div>
              </div>

              <button
                onClick={() => setActiveTab('zakat')}
                className="px-5 py-3 rounded-2xl bg-[#f4c75a] hover:bg-[#efbe42] text-slate-900 font-black text-base shadow-[0_12px_20px_rgba(244,199,90,0.25)] transition-all active:scale-95"
              >
                Salurkan Sedekah →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tajweed Click Detail Card */}
      <TajweedDetailCard
        rule={activeTajweed?.rule || null}
        word={activeTajweed?.word || ''}
        onClose={() => setActiveTajweed(null)}
        onOpenFullGuide={() => {
          setActiveTajweed(null);
          setActiveTab('quran');
        }}
      />
    </div>
  );
};
