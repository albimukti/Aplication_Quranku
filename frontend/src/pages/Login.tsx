import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon3DQuran } from '../components/3d/Icons3D';
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles, User } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onGoToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa username/email dan kata sandi.');
      setLoading(false);
    }
  };

  const handleDemoUserLogin = async () => {
    setError('');
    setEmail('user@quranku.id');
    setPassword('P@ssw0rd');
    setLoading(true);

    try {
      await login('user@quranku.id', 'P@ssw0rd');
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan akun demo pengguna.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-2 sm:py-4 animate-fade-in">
      <div className="clay-card p-6 sm:p-7 bg-white/95 backdrop-blur-md border border-emerald-100 shadow-2xl relative overflow-hidden rounded-3xl">
        {/* Decorative ambient background accents */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Logo and title */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl border border-emerald-200 shadow-sm mb-2 hover:scale-105 transition-transform">
            <Icon3DQuran className="w-14 h-14" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Masuk ke Quranku
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Silakan masuk untuk membaca Al-Qur'an, menandai ayat, dan memantau ibadah harian Anda
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-shake">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email / Username:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: user@quranku.id atau nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Kata Sandi:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi Anda"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Sedang Masuk...' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* Quick Demo Login Option (User Only) */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDemoUserLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Masuk Cepat: Akun Demo Pengguna</span>
            <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-900 font-semibold">(1-Klik)</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-slate-400">
            <User className="w-3 h-3 text-emerald-600" />
            <span>Kredensial demo: <b>user@quranku.id</b> / <b>P@ssw0rd</b></span>
          </div>
        </div>

        <div className="pt-5 mt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Belum memiliki akun?{' '}
            <button
              onClick={onGoToRegister}
              className="text-emerald-700 font-bold hover:underline hover:text-emerald-800 ml-1 cursor-pointer"
            >
              Daftar Akun Baru
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

