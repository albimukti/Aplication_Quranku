export type Role = 'Admin' | 'User';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
}

export interface Ayah {
  number: number;
  number_in_surah: number;
  juz: number;
  page?: number;
  arab: string;
  latin: string;
  translation: string;
  audio_url: string;
}

export interface Surah {
  number: number;
  name: string;
  arabic_name: string;
  translation_name: string;
  revelation_type: string;
  total_ayahs: number;
  ayahs?: Ayah[];
}

export interface JuzInfo {
  juz_number: number;
  start_surah: number;
  start_ayah: number;
  end_surah: number;
  end_ayah: number;
  name: string;
}

export interface IqroLetter {
  arab: string;
  latin: string;
  makhraj: string;
  audio_example?: string;
}

export interface IqroLesson {
  page: number;
  title: string;
  guidance: string;
  letters: IqroLetter[];
}

export interface IqroLevel {
  level: number;
  title: string;
  description: string;
  lessons: IqroLesson[];
}

export interface PrayerTimes {
  date: string;
  city: string;
  timezone: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  next_prayer: string;
  remaining: string;
}

export interface City {
  id: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface QiblaInfo {
  latitude: number;
  longitude: number;
  qibla_degree: number;
  direction_compass: string;
  distance_km: number;
}

export interface DoaItem {
  id: number;
  category: 'sholat' | 'harian' | 'dzikir';
  title: string;
  arab: string;
  latin: string;
  translation: string;
  riwayat: string;
  audio_url?: string;
}

export interface Donation {
  id: number;
  receipt_number: string;
  user_id?: number;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  type: 'zakat_fitrah' | 'zakat_maal' | 'zakat_penghasilan' | 'sedekah' | 'infaq';
  program_title: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface Mosque {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  capacity: string;
  facilities: string[];
  image_url: string;
  distance_km: number;
  google_maps_url: string;
}

export interface Bookmark {
  id: number;
  user_id: number;
  surah_number: number;
  surah_name: string;
  ayah_number: number;
  notes?: string;
  created_at: string;
}

export interface PrayerLog {
  id: number;
  user_id: number;
  date: string;
  subuh: boolean;
  dzuhur: boolean;
  ashar: boolean;
  maghrib: boolean;
  isya: boolean;
}
