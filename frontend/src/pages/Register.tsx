import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon3DQuran } from '../components/3d/Icons3D';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

interface RegisterProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onGoToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 animate-fade-in">
      <div className="clay-card p-8 bg-white border border-emerald-100 shadow-2xl relative overflow-hidden">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl border border-emerald-200 shadow-sm mb-2">
            <Icon3DQuran className="w-14 h-14" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Daftar Akun Baru
          </h2>
          <p className="text-xs text-slate-500">
            Bergabung dengan keluarga pembaca Al-Qur'an Indonesia
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Lengkap:</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ahmad Santoso"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Kata Sandi:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-emerald-glow flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <button
              onClick={onGoToLogin}
              className="text-emerald-700 font-bold hover:underline"
            >
              Masuk di Sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
