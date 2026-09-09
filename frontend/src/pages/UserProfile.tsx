import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bookmark, PrayerLog } from '../types';
import { fetchApi } from '../utils/api';
import {
  User as UserIcon,
  Bookmark as BookmarkIcon,
  CheckCircle2,
  Calendar,
  Trash2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UserProfileProps {
  onOpenSurah: (surahNumber: number) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onOpenSurah }) => {
  const { user, role, logout } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [prayerLog, setPrayerLog] = useState<PrayerLog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserData = () => {
    if (!user) return;
    Promise.all([
      fetchApi<Bookmark[]>('/user/bookmarks'),
      fetchApi<PrayerLog>('/user/prayer-log'),
    ])
      .then(([bmData, logData]) => {
        setBookmarks(bmData);
        setPrayerLog(logData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handleDeleteBookmark = async (id: number) => {
    try {
      await fetchApi(`/user/bookmarks/${id}`, { method: 'DELETE' });
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      // ignore
    }
  };

  const handleTogglePrayer = async (prayer: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya') => {
    if (!prayerLog) return;
    const updated = {
      ...prayerLog,
      [prayer]: !prayerLog[prayer],
    };
    setPrayerLog(updated);

    try {
      await fetchApi('/user/prayer-log', {
        method: 'POST',
        body: JSON.stringify(updated),
      });

      // Check if all 5 completed
      if (
        updated.subuh &&
        updated.dzuhur &&
        updated.ashar &&
        updated.maghrib &&
        updated.isya
      ) {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      }
    } catch {
      // ignore
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Silakan Masuk Terlebih Dahulu</h2>
        <p className="text-xs text-slate-500">Anda perlu login untuk melihat bookmark dan checklist sholat harian.</p>
      </div>
    );
  }

  const completedCount = prayerLog
    ? [prayerLog.subuh, prayerLog.dzuhur, prayerLog.ashar, prayerLog.maghrib, prayerLog.isya].filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Profile Card */}
      <div className="clay-card p-6 sm:p-8 bg-gradient-to-br from-white via-emerald-50/40 to-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-100">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-16 h-16 rounded-full bg-emerald-100 p-1 border-2 border-emerald-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
        >
          Keluar dari Akun
        </button>
      </div>

      {/* Daily 5-time Prayer Tracker Checklist */}
      <div className="clay-card p-6 bg-white space-y-4 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Jurnal Ibadah Sholat Fardhu Hari Ini
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Checklist Sholat 5 Waktu
            </h3>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-emerald-700">{completedCount} / 5</span>
            <div className="text-[10px] text-slate-400 font-semibold">Tuntas</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 5) * 100}%` }}
          />
        </div>

        {/* 5 Sholat Checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          {[
            { id: 'subuh', label: 'Subuh' },
            { id: 'dzuhur', label: 'Dzuhur' },
            { id: 'ashar', label: 'Ashar' },
            { id: 'maghrib', label: 'Maghrib' },
            { id: 'isya', label: 'Isya' },
          ].map((item) => {
            const isDone = prayerLog ? (prayerLog as any)[item.id] : false;
            return (
              <button
                key={item.id}
                onClick={() => handleTogglePrayer(item.id as any)}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span>{item.label}</span>
                <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-amber-300' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="clay-card p-6 bg-white space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookmarkIcon className="w-4 h-4 text-emerald-600" />
          Penanda Bacaan Al-Qur'an ({bookmarks.length})
        </h3>

        {bookmarks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Belum ada ayat yang ditandai. Klik ikon bookmark saat membaca Al-Qur'an untuk menyimpan di sini.
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 flex items-center justify-between transition-all bg-slate-50/50"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Surah {bm.surah_name} : Ayat {bm.ayah_number}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Ditandai pada {new Date(bm.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSurah(bm.surah_number)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Baca
                  </button>
                  <button
                    onClick={() => handleDeleteBookmark(bm.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
