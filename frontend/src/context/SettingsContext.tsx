import React, { createContext, useContext, useState, useEffect } from 'react';

export type ArabicSize = 'normal' | 'large' | 'huge';

interface AlarmSettings {
  subuh: boolean;
  dzuhur: boolean;
  ashar: boolean;
  maghrib: boolean;
  isya: boolean;
}

interface SettingsContextType {
  arabicSize: ArabicSize;
  setArabicSize: (size: ArabicSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  activeCityId: string;
  setActiveCityId: (cityId: string) => void;
  activeCityName: string;
  setActiveCityName: (name: string) => void;
  alarms: AlarmSettings;
  toggleAlarm: (prayer: keyof AlarmSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [arabicSize, setArabicSize] = useState<ArabicSize>(() => {
    return (localStorage.getItem('quranku_arabic_size') as ArabicSize) || 'large';
  });

  const [activeCityId, setActiveCityId] = useState<string>(() => {
    return localStorage.getItem('quranku_city_id') || 'jkt';
  });

  const [activeCityName, setActiveCityName] = useState<string>(() => {
    return localStorage.getItem('quranku_city_name') || 'DKI Jakarta';
  });

  const [alarms, setAlarms] = useState<AlarmSettings>(() => {
    const saved = localStorage.getItem('quranku_alarms');
    return saved
      ? JSON.parse(saved)
      : { subuh: true, dzuhur: true, ashar: true, maghrib: true, isya: true };
  });

  useEffect(() => {
    localStorage.setItem('quranku_arabic_size', arabicSize);
  }, [arabicSize]);

  useEffect(() => {
    localStorage.setItem('quranku_city_id', activeCityId);
    localStorage.setItem('quranku_city_name', activeCityName);
  }, [activeCityId, activeCityName]);

  useEffect(() => {
    localStorage.setItem('quranku_alarms', JSON.stringify(alarms));
  }, [alarms]);

  const increaseFontSize = () => {
    if (arabicSize === 'normal') setArabicSize('large');
    else if (arabicSize === 'large') setArabicSize('huge');
  };

  const decreaseFontSize = () => {
    if (arabicSize === 'huge') setArabicSize('large');
    else if (arabicSize === 'large') setArabicSize('normal');
  };

  const toggleAlarm = (prayer: keyof AlarmSettings) => {
    setAlarms((prev) => ({
      ...prev,
      [prayer]: !prev[prayer],
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        arabicSize,
        setArabicSize,
        increaseFontSize,
        decreaseFontSize,
        activeCityId,
        setActiveCityId,
        activeCityName,
        setActiveCityName,
        alarms,
        toggleAlarm,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
