import React, { useState } from 'react';
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
  const [isAdhanModalOpen, setIsAdhanModalOpen] = useState<boolean>(false);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-semibold text-emerald-700">Memuat aplikasi...</div>
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
          <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-5 pt-4 pb-8 lg:max-w-[calc(100vw-22rem)]">
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
            {activeTab === 'login' && (
              <Login
                onSuccess={() => setActiveTab('dashboard')}
                onGoToRegister={() => setActiveTab('register')}
              />
            )}
            {activeTab === 'register' && (
              <Register
                onSuccess={() => setActiveTab('dashboard')}
                onGoToLogin={() => setActiveTab('login')}
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
