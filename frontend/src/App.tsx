import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { AudioProvider } from './context/AudioContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioBar } from './components/AudioBar';
import { AdhanModal } from './components/AdhanModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { QuranReader } from './pages/QuranReader';
import { JuzAmma } from './pages/JuzAmma';
import { IqroLearning } from './pages/IqroLearning';
import { PrayerTimesPage } from './pages/PrayerTimes';
import { QiblaCompass } from './pages/QiblaCompass';
import { DoaCollection } from './pages/DoaCollection';
import { ZakatDonation } from './pages/ZakatDonation';
import { NearbyMosque } from './pages/NearbyMosque';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserProfile } from './pages/UserProfile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAdhanModalOpen, setIsAdhanModalOpen] = useState<boolean>(false);
  const { user, isLoading } = useAuth();

  // Selalu gulir ke bagian paling atas saat berpindah menu/tab
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainEl = document.getElementById('main-content');
      if (mainEl) mainEl.scrollTop = 0;
    };

    scrollToTop();
    // Jalankan juga setelah render DOM selesai
    const timer = setTimeout(scrollToTop, 10);
    return () => clearTimeout(timer);
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
          <div className="w-7 h-7 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        </div>
        <div className="text-sm font-bold text-emerald-800 tracking-wide">Memuat Quranku...</div>
      </div>
    );
  }

  // Wajibkan Login jika pengguna belum terautentikasi
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 flex flex-col justify-between relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
        {/* Background ambient decorative shapes */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Branding */}
        <header className="pt-6 pb-1 px-4 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-800/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-200 tracking-wide uppercase">
              Portal Al-Qur'an & Ibadah Digital Indonesia
            </span>
          </div>
        </header>

        {/* Center Auth Card */}
        <main className="flex-1 flex items-center justify-center px-4 py-2 z-10">
          {authMode === 'login' ? (
            <Login
              onSuccess={() => setActiveTab('dashboard')}
              onGoToRegister={() => setAuthMode('register')}
            />
          ) : (
            <Register
              onSuccess={() => setActiveTab('dashboard')}
              onGoToLogin={() => setAuthMode('login')}
            />
          )}
        </main>

        {/* Footer info */}
        <footer className="py-3 px-4 text-center z-10 text-[11px] text-emerald-300/60 font-medium">
          <p>© 2026 Quranku Digital • Mushaf Standar Indonesia & Waktu Sholat Akurat</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-500 selection:text-white">
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-4 lg:min-h-screen lg:p-4 lg:min-h-0">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAdhanTest={() => setIsAdhanModalOpen(true)}
        />

        <div className="flex-1 min-w-0 flex flex-col justify-between lg:pt-0">
          <main id="main-content" className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-5 pt-4 pb-8 lg:max-w-[calc(100vw-22rem)]">
            {activeTab === 'dashboard' && (
              <Dashboard
                setActiveTab={setActiveTab}
                onOpenAdhanTest={() => setIsAdhanModalOpen(true)}
              />
            )}
            {activeTab === 'quran' && <QuranReader />}
            {activeTab === 'juz-amma' && <JuzAmma />}
            {activeTab === 'iqro' && <IqroLearning />}
            {activeTab === 'prayer' && (
              <PrayerTimesPage onOpenAdhanTest={() => setIsAdhanModalOpen(true)} />
            )}
            {activeTab === 'qibla' && <QiblaCompass />}
            {activeTab === 'doa' && <DoaCollection />}
            {activeTab === 'zakat' && <ZakatDonation />}
            {activeTab === 'masjid' && <NearbyMosque />}
            {activeTab === 'admin' && <AdminDashboard />}
            {activeTab === 'profile' && (
              <UserProfile
                onOpenSurah={() => {
                  setActiveTab('quran');
                }}
              />
            )}
          </main>

          <Footer setActiveTab={setActiveTab} />
        </div>
      </div>

      <AudioBar />

      <AdhanModal
        isOpen={isAdhanModalOpen}
        onClose={() => setIsAdhanModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AudioProvider>
          <MainApp />
        </AudioProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

