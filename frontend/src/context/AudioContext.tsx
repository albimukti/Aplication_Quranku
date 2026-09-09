import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface AudioTrack {
  title: string;
  subtitle: string;
  url: string;
  ayahNumber?: number;
}

interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  progress: number; // 0 to 100
  volume: number; // 0 to 1
  setVolume: (val: number) => void;
  playTrack: (track: AudioTrack) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  stopTrack: () => void;
  playAdhanTest: (variant?: 'makkah' | 'mishary') => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 1.0;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };

    const onError = (e: Event) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, []);

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const playTrack = (track: AudioTrack) => {
    if (!audioRef.current) return;

    if (currentTrack?.url === track.url) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.ended || audioRef.current.currentTime >= audioRef.current.duration) {
          audioRef.current.currentTime = 0;
        }
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback error:', err);
            setIsPlaying(false);
          });
      }
      return;
    }

    setCurrentTrack(track);
    audioRef.current.src = track.url;
    audioRef.current.currentTime = 0;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn('Autoplay error / user interaction required:', err);
        setIsPlaying(false);
      });
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      setCurrentTrack(null);
    }
  };

  const playAdhanTest = (variant: 'makkah' | 'mishary' = 'makkah') => {
    const track: AudioTrack =
      variant === 'mishary'
        ? {
            title: 'Adzan Syaikh Mishary Rashid Alafasy',
            subtitle: 'Simulasi Alarm Pengingat Waktu Sholat',
            url: '/audio/adhan_mishary.mp3',
          }
        : {
            title: 'Adzan Merdu Makkah Al-Mukarramah',
            subtitle: 'Simulasi Alarm Pengingat Waktu Sholat',
            url: '/audio/adhan.mp3',
          };
    playTrack(track);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        volume,
        setVolume,
        playTrack,
        pauseTrack,
        togglePlay,
        stopTrack,
        playAdhanTest,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};
