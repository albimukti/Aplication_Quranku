import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface AudioTrack {
  title: string;
  subtitle: string;
  url: string;
  ayahNumber?: number;
  surahNumber?: number;
  surahName?: string;
  totalAyahs?: number;
}

export type RepeatMode = 'off' | 'ayah' | 'surah';

interface AudioContextType {
  currentTrack: AudioTrack | null;
  playlist: AudioTrack[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number; // 0 to 100
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  repeatMode: RepeatMode;
  autoNextSurah: boolean;
  setVolume: (val: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setAutoNextSurah: (val: boolean) => void;
  playTrack: (track: AudioTrack) => void;
  playPlaylist: (tracks: AudioTrack[], startIndex?: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  stopTrack: () => void;
  seekTo: (percent: number) => void;
  playAdhanTest: (variant?: 'makkah' | 'mishary') => void;
  registerSurahEndedHandler: (handler: (surahNumber: number) => void) => () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [autoNextSurah, setAutoNextSurah] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<AudioTrack[]>([]);
  const currentIndexRef = useRef<number>(0);
  const repeatModeRef = useRef<RepeatMode>('off');
  const autoNextSurahRef = useRef<boolean>(true);
  const surahEndedHandlerRef = useRef<((surahNumber: number) => void) | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    autoNextSurahRef.current = autoNextSurah;
  }, [autoNextSurah]);

  const playTrackAtIndex = useCallback((list: AudioTrack[], index: number) => {
    if (!audioRef.current || index < 0 || index >= list.length) return;

    const track = list[index];
    currentIndexRef.current = index;
    setCurrentIndex(index);
    setCurrentTrack(track);

    audioRef.current.src = track.url;
    audioRef.current.currentTime = 0;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Playback error / interaction needed:', err);
        setIsPlaying(false);
      });
  }, []);

  const nextTrack = useCallback(() => {
    const list = playlistRef.current;
    const idx = currentIndexRef.current;

    if (list.length > 0 && idx < list.length - 1) {
      playTrackAtIndex(list, idx + 1);
    } else if (list.length > 0 && idx === list.length - 1) {
      // Last ayah in current playlist reached
      const currentSurahNum = list[idx]?.surahNumber;
      if (autoNextSurahRef.current && currentSurahNum && surahEndedHandlerRef.current) {
        surahEndedHandlerRef.current(currentSurahNum);
      } else if (repeatModeRef.current === 'surah') {
        playTrackAtIndex(list, 0);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    }
  }, [playTrackAtIndex]);

  const prevTrack = useCallback(() => {
    const list = playlistRef.current;
    const idx = currentIndexRef.current;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If played for more than 3 seconds, restart current track
      audioRef.current.currentTime = 0;
    } else if (list.length > 0 && idx > 0) {
      playTrackAtIndex(list, idx - 1);
    } else if (list.length > 0) {
      // Restart first track
      playTrackAtIndex(list, 0);
    }
  }, [playTrackAtIndex]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 1.0;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      // Repeat single ayah mode
      if (repeatModeRef.current === 'ayah') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
        return;
      }

      const list = playlistRef.current;
      const idx = currentIndexRef.current;

      if (list.length > 0 && idx < list.length - 1) {
        // Automatically play next ayah
        playTrackAtIndex(list, idx + 1);
      } else if (list.length > 0 && idx === list.length - 1) {
        // Last ayah of the surah finished
        if (repeatModeRef.current === 'surah') {
          playTrackAtIndex(list, 0);
        } else if (autoNextSurahRef.current) {
          const currentSurahNum = list[idx]?.surahNumber;
          if (currentSurahNum && surahEndedHandlerRef.current) {
            // Automatically advance to the next surah!
            surahEndedHandlerRef.current(currentSurahNum);
          } else {
            setIsPlaying(false);
            setProgress(0);
          }
        } else {
          setIsPlaying(false);
          setProgress(0);
        }
      } else {
        setIsPlaying(false);
        setProgress(0);
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
  }, [playTrackAtIndex]);

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const playTrack = (track: AudioTrack) => {
    setPlaylist([track]);
    playlistRef.current = [track];
    playTrackAtIndex([track], 0);
  };

  const playPlaylist = (tracks: AudioTrack[], startIndex: number = 0) => {
    if (!tracks || tracks.length === 0) return;
    setPlaylist(tracks);
    playlistRef.current = tracks;
    playTrackAtIndex(tracks, Math.max(0, Math.min(startIndex, tracks.length - 1)));
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
      setPlaylist([]);
      playlistRef.current = [];
    }
  };

  const seekTo = (percent: number) => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      const clamped = Math.max(0, Math.min(100, percent));
      const targetTime = (clamped / 100) * audioRef.current.duration;
      audioRef.current.currentTime = targetTime;
      setProgress(clamped);
      setCurrentTime(targetTime);
    }
  };

  const registerSurahEndedHandler = (handler: (surahNumber: number) => void) => {
    surahEndedHandlerRef.current = handler;
    return () => {
      if (surahEndedHandlerRef.current === handler) {
        surahEndedHandlerRef.current = null;
      }
    };
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
        playlist,
        currentIndex,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        repeatMode,
        autoNextSurah,
        setVolume,
        setRepeatMode,
        setAutoNextSurah,
        playTrack,
        playPlaylist,
        nextTrack,
        prevTrack,
        pauseTrack,
        togglePlay,
        stopTrack,
        seekTo,
        playAdhanTest,
        registerSurahEndedHandler,
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
