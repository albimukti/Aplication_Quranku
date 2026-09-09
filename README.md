# Quranku.id - Aplikasi Islami Modern & Ramah Semua Usia

Aplikasi web Islami **Quranku** dibangun dengan arsitektur modern berkinerja tinggi:
- **Backend**: Golang (Framework Fiber v2), GORM, PostgreSQL & Redis (dengan fallback SQLite & Memory Cache)
- **Frontend**: React (Vite) + Tailwind CSS (Palet Hijau Zamrud & Putih Bersih, Ikon 3D Islami, dan Font Sizer Ramah Lansia)

---

## Fitur Utama

1. **Autentikasi Multi-Peran**: Admin, User, Viewer (Tamu) dengan tombol switch demo 1-klik.
2. **Dashboard Interaktif**: Jadwal sholat hari ini, countdown waktu sholat berikutnya, ayat & hadits harian.
3. **Bacaan Al-Qur'an 30 Juz (114 Surah)**: Teks Arab berharakat tajwid, transliterasi Latin, terjemahan Indonesia, pemutar audio per ayat (Mishary Rashid Alafasy), dan penanda bacaan (bookmark).
4. **Juz 'Amma Khusus (Juz 30)**: Mode hafalan khusus (fitur buka/tutup terjemahan) dan target hafalan harian.
5. **IQRO' Interaktif (Jilid 1 - 6)**: Kartu huruf hijaiyah besar dengan panduan posisi makhraj huruf dan pelafalan audio.
6. **Waktu Sholat Seluruh Indonesia**: Perhitungan akurat standar Kementerian Agama RI untuk 34+ provinsi dan ratusan kota.
7. **Alarm Pengingat Waktu Sholat**: Saklar alarm per waktu sholat dan tombol uji suara adzan merdu.
8. **Arah Kiblat Digital 3D**: Piringan kompas 3D dengan kalkulasi derajat sudut Ka'bah, jarak kilometer ke Makkah, dan indikator keselarasan.
9. **Kumpulan Doa Sholat & Harian**: Doa gerakan sholat, doa sehari-hari, dan dzikir pagi petang (Al-Ma'tsurat) dengan fitur salin teks.
10. **Sedekah, Zakat & Infaq**: Kalkulator zakat profesi/maal/fitrah otomatis, form penyaluran sedekah subuh & infaq, simulasi pembayaran QRIS/Transfer, dan cetak tanda terima sah.
11. **Masjid Terdekat Berbasis Google Maps**: Peta interaktif masjid sekitar dengan informasi daya tampung, fasilitas, dan tombol navigasi langsung ke Google Maps.

---

## Cara Menjalankan

### 1. Jalankan Backend (Golang Fiber)
```powershell
cd backend
.\quranku-backend.exe
# Atau: go run main.go
```
*API berjalan pada: `http://localhost:8080`*

### 2. Jalankan Frontend (Vite + React)
```powershell
cd frontend
npm run dev
```
*Aplikasi web dapat dibuka di: `http://localhost:5173`*

---

## Akun Demo Pengujian

- **Admin**: `admin@quranku.id` / `admin123`
- **User**: `user@quranku.id` / `user123`
- **Viewer**: Mode tamu tanpa login
*(Tersedia tombol pemilih peran 1-klik di pojok kanan atas bilah navigasi)*
