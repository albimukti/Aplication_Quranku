import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Icon3DQuran } from './3d/Icons3D';
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Bell,
  Compass,
  BookOpen,
  MapPin,
  HeartHandshake,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAdhanTest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAdhanTest }) => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'quran', label: "Al-Qur'an", icon: BookOpen },
    { id: 'juz-amma', label: "Juz 'Amma", icon: BookOpen },
    { id: 'iqro', label: "Iqro' (1-6)", icon: BookOpen },
    { id: 'prayer', label: 'Jadwal Sholat', icon: Clock },
    { id: 'qibla', label: 'Arah Kiblat', icon: Compass },
    { id: 'doa', label: 'Doa & Dzikir', icon: HeartHandshake },
    { id: 'zakat', label: 'Sedekah & Zakat', icon: HeartHandshake },
    { id: 'masjid', label: 'Masjid Terdekat', icon: MapPin },
  ];

  if (role === 'Admin') {
    navItems.push({ id: 'admin', label: 'Panel Admin', icon: ShieldCheck });
  }

  const showAdzanButton = activeTab === 'prayer';

  const roleBadgeColor = {
    Admin: 'bg-rose-100 text-rose-800 border-rose-200',
    User: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }[role];

  return (
    <aside className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-emerald-100 bg-white/90 backdrop-blur-md shadow-sm lg:shadow-md rounded-none lg:rounded-3xl z-40 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:self-start lg:sticky lg:top-4">
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white text-xs py-2 px-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="hidden sm:inline bg-emerald-900/60 px-2 py-0.5 rounded text-[10px] font-medium text-emerald-200 border border-emerald-600/40">
            Quranku Digital
          </span>
          <span className="text-[10px] text-emerald-100 truncate">
            Aplikasi Islami
          </span>
        </div>
      </div>

      <div className="p-4 lg:p-4">
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none pb-4 border-b border-emerald-100"
        >
          <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl border border-emerald-200 group-hover:scale-105 transition-all">
            <Icon3DQuran className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-emerald-900 group-hover:text-emerald-700 transition-colors">
                QURANKU
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${roleBadgeColor}`}>
                {role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Cahaya Petunjuk & Ibadah Harian
            </p>
          </div>
        </div>

        <nav className="mt-5 hidden lg:block space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-5 hidden lg:block">
          {user ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-800 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-2 text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <UserIcon className="w-4 h-4" />
              Masuk / Daftar
            </button>
          )}
        </div>

        <div className="flex lg:hidden items-center justify-between gap-2 mt-5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {user ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-6 h-6 rounded-full"
              />
              <span>{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              Masuk
            </button>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white px-4 py-4 space-y-3 shadow-inner">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      )}
    </aside>
  );
};
