import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { Donation, User } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Heart,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'donations' | 'users'>('donations');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    Promise.all([
      fetchApi<any>('/admin/stats'),
      fetchApi<Donation[]>('/admin/donations'),
      fetchApi<User[]>('/admin/users'),
    ])
      .then(([statsData, donationsData, usersData]) => {
        setStats(statsData);
        setDonations(donationsData);
        setUsers(usersData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'verified' | 'rejected') => {
    try {
      await fetchApi(`/admin/donations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadData();
      if (status === 'verified') {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      }
    } catch {
      alert('Gagal memperbarui status donasi');
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus akun ${name}?`)) return;

    try {
      await fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
      loadData();
    } catch {
      alert('Gagal menghapus akun');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Admin Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-900/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-950/80 border border-rose-600/40 text-xs font-bold text-rose-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            Panel Khusus Administrator
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Dashboard Manajemen Quranku
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Pantau arus dana infaq, zakat maal & fitrah, verifikasi penerimaan sedekah, serta pantau pertumbuhan pengguna platform.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="clay-card p-5 bg-white border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Dana Terkumpul</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-2">
              Rp {stats.total_funds.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              Zakat: Rp {stats.total_amount_zakat.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="clay-card p-5 bg-white border border-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Infaq & Sedekah</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-950 mt-2">
              Rp {(stats.total_amount_infaq + stats.total_amount_sedekah).toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              {stats.total_donations} Transaksi
            </div>
          </div>

          <div className="clay-card p-5 bg-white border border-sky-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Pengguna</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {stats.total_users} Akun
            </div>
            <div className="text-[11px] text-sky-700 font-semibold mt-1">
              Admin & User
            </div>
          </div>

          <div className="clay-card p-5 bg-white border border-rose-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Perlu Verifikasi</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-950 mt-2">
              {stats.pending_donations} Menunggu
            </div>
            <div className="text-[11px] text-rose-700 font-semibold mt-1">
              Konfirmasi manual
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'donations' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kelola Donasi & Zakat ({donations.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manajemen Pengguna ({users.length})
        </button>
      </div>

      {/* DONATIONS TABLE */}
      {activeTab === 'donations' && (
        <div className="clay-card bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5">No Invoice</th>
                  <th className="p-3.5">Donatur</th>
                  <th className="p-3.5">Program</th>
                  <th className="p-3.5">Nominal</th>
                  <th className="p-3.5">Metode</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-mono font-bold text-slate-700">{d.receipt_number}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{d.donor_name}</div>
                      <div className="text-[10px] text-slate-400">{d.donor_email || '-'}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-800">{d.program_title}</td>
                    <td className="p-3.5 font-black text-slate-900">
                      Rp {d.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5">{d.payment_method}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {d.status === 'verified' ? 'Terverifikasi' : d.status === 'pending' ? 'Pending' : 'Ditolak'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(d.id, 'verified')}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          title="Verifikasi"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(d.id, 'rejected')}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                          title="Tolak"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TABLE */}
      {activeTab === 'users' && (
        <div className="clay-card bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Pengguna</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Peran (Role)</th>
                  <th className="p-3.5">Terdaftar Sejak</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-7 h-7 rounded-full bg-slate-100"
                        />
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'Admin'
                          ? 'bg-rose-100 text-rose-800'
                          : u.role === 'User'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-3.5 text-center">
                      {u.id !== currentUser?.id ? (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                          title="Hapus akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Anda</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
