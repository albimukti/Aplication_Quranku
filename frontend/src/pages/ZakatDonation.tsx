import React, { useState } from 'react';
import { fetchApi } from '../utils/api';
import { Donation } from '../types';
import { useAuth } from '../context/AuthContext';
import { Icon3DZakat } from '../components/3d/Icons3D';
import {
  Heart,
  Calculator,
  QrCode,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
  FileText,
  X,
  Coins,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Format numeric string into clean Indonesian Rupiah format with dots (e.g. "8.000.000")
// Returns empty string if empty so user can freely backspace / erase without stuck 0
const formatRupiah = (val: string | number): string => {
  if (val === '' || val === null || val === undefined) return '';
  const digits = val.toString().replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return isNaN(num) ? '' : num.toLocaleString('id-ID');
};

// Extracts integer value from formatted string
const parseRupiah = (val: string): number => {
  if (!val) return 0;
  const digits = val.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

export const ZakatDonation: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'calculator' | 'donate'>('calculator');
  const [calcType, setCalcType] = useState<'penghasilan' | 'maal' | 'fitrah'>('penghasilan');

  // Calculator form states as string to allow clean backspace and no stuck 0
  const [incomeStr, setIncomeStr] = useState<string>('8.000.000');
  const [otherIncomeStr, setOtherIncomeStr] = useState<string>('');
  const [debtStr, setDebtStr] = useState<string>('1.000.000');
  const [savingsStr, setSavingsStr] = useState<string>('50.000.000');
  const [goldWeightStr, setGoldWeightStr] = useState<string>('85');
  const [personsStr, setPersonsStr] = useState<string>('4');
  const [calcResult, setCalcResult] = useState<any>(null);

  // Donation form states
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [donorEmail, setDonorEmail] = useState<string>(user?.email || '');
  const [programTitle, setProgramTitle] = useState<string>('Sedekah Subuh Berkah');
  const [donationType, setDonationType] = useState<string>('sedekah');
  const [customAmountStr, setCustomAmountStr] = useState<string>('50.000');
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');
  const [notes, setNotes] = useState<string>('Semoga berkah & mendatangkan kelapangan rezeki');
  const [receipt, setReceipt] = useState<Donation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [donationError, setDonationError] = useState<string | null>(null);

  // Helper to handle currency input change
  const handleCurrencyInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setter('');
    } else {
      const num = parseInt(raw, 10);
      setter(num.toLocaleString('id-ID'));
    }
  };

  const handleCalculate = async () => {
    try {
      const res = await fetchApi<any>('/donation/calculate-zakat', {
        method: 'POST',
        body: JSON.stringify({
          type: calcType,
          income: parseRupiah(incomeStr),
          other_income: parseRupiah(otherIncomeStr),
          debt: parseRupiah(debtStr),
          gold_weight_gram: parseFloat(goldWeightStr) || 0,
          savings_amount: parseRupiah(savingsStr),
          total_persons: parseInt(personsStr, 10) || 1,
          gold_price_per_gram: 1350000,
          rice_price_per_kg: 16000,
        }),
      });
      setCalcResult(res);
      if (res.zakat_amount > 0) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
    } catch {
      // fallback calculation
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonationError(null);
    const amount = parseRupiah(customAmountStr);

    if (amount < 5000) {
      setDonationError('Nominal donasi minimal adalah Rp 5.000');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetchApi<Donation>('/donation/create', {
        method: 'POST',
        body: JSON.stringify({
          donor_name: donorName || 'Hamba Allah',
          donor_email: donorEmail,
          program_title: programTitle,
          type: donationType,
          amount,
          payment_method: paymentMethod,
          notes,
        }),
      });

      setReceipt(res);
      setIsSubmitting(false);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    } catch {
      setIsSubmitting(false);
    }
  };

  const currentDonationAmount = parseRupiah(customAmountStr);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 text-xs font-bold text-amber-300">
            <Heart className="w-3.5 h-3.5" />
            Sucikan Harta & Lipatgandakan Berkah
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Sedekah, Zakat & Infaq
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Hitung kewajiban zakat maal, penghasilan, dan fitrah secara otomatis sesuai standar nisab syariah, serta salurkan sedekah dan infaq dengan input nominal mudah & terformat rapi.
          </p>
        </div>

        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
          <Icon3DZakat className="w-20 h-20" />
        </div>
      </div>

      {/* Main Switcher */}
      <div className="flex items-center justify-center p-1.5 bg-white rounded-2xl border border-emerald-100 shadow-sm max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'calculator'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Kalkulator Zakat
        </button>
        <button
          onClick={() => setActiveTab('donate')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'donate'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          Form Salurkan Donasi
        </button>
      </div>

      {/* TAB 1: KALKULATOR ZAKAT */}
      {activeTab === 'calculator' && (
        <div className="clay-card p-6 sm:p-8 bg-white space-y-6">
          {/* Sub-types: Penghasilan, Maal, Fitrah */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
            {[
              { id: 'penghasilan', label: 'Zakat Penghasilan (Profesi)' },
              { id: 'maal', label: 'Zakat Maal (Tabungan & Emas)' },
              { id: 'fitrah', label: 'Zakat Fitrah' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setCalcType(t.id as any);
                  setCalcResult(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  calcType === t.id
                    ? 'bg-amber-400 text-emerald-950 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form Fields according to type */}
          {calcType === 'penghasilan' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pendapatan Bulanan (Gaji):</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={incomeStr}
                    onChange={handleCurrencyInputChange(setIncomeStr)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pendapatan Lain / Bonus:</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otherIncomeStr}
                    onChange={handleCurrencyInputChange(setOtherIncomeStr)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hutang / Cicilan Pokok Bulanan:</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={debtStr}
                    onChange={handleCurrencyInputChange(setDebtStr)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {calcType === 'maal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Total Tabungan / Deposito (Rp):</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={savingsStr}
                    onChange={handleCurrencyInputChange(setSavingsStr)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Emas Yang Dimiliki (Gram):</label>
                <input
                  type="number"
                  step="any"
                  value={goldWeightStr}
                  onChange={(e) => setGoldWeightStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>
          )}

          {calcType === 'fitrah' && (
            <div className="space-y-1.5 max-w-sm">
              <label className="text-xs font-bold text-slate-700">Jumlah Anggota Keluarga (Jiwa):</label>
              <input
                type="number"
                min="1"
                value={personsStr}
                onChange={(e) => setPersonsStr(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Standar zakat fitrah adalah 2.5 kg beras per jiwa (estimasi harga beras premium Rp 16.000 / kg).
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleCalculate}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Calculator className="w-4 h-4" /> Hitung Zakat Sekarang
            </button>
          </div>

          {/* Results Box */}
          {calcResult && (
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Hasil Perhitungan Kewajiban Zakat
                  </span>
                  <h3 className="text-3xl font-black text-emerald-950 mt-1">
                    Rp {calcResult.zakat_amount.toLocaleString('id-ID')}
                  </h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  calcResult.is_obligated ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {calcResult.is_obligated ? 'Wajib Zakat' : 'Belum Mencapai Nisab'}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {calcResult.explanation}
              </p>

              {calcResult.zakat_amount > 0 && (
                <button
                  onClick={() => {
                    setCustomAmountStr(calcResult.zakat_amount.toLocaleString('id-ID'));
                    setDonationType(calcType === 'fitrah' ? 'zakat_fitrah' : calcType === 'maal' ? 'zakat_maal' : 'zakat_penghasilan');
                    setProgramTitle(`Zakat ${calcType.toUpperCase()}`);
                    setActiveTab('donate');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs shadow-gold-glow flex items-center gap-1.5 transition-all"
                >
                  Bayar Zakat Ini Sekarang →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORM SALURKAN SEDEKAH / ZAKAT */}
      {activeTab === 'donate' && (
        <form onSubmit={handleDonate} className="clay-card p-6 sm:p-8 bg-white space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nama Lengkap Donatur:</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Contoh: H. Ahmad Santoso"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Donatur (Untuk Tanda Terima):</label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="email@anda.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Program Kebaikan:</label>
              <select
                value={programTitle}
                onChange={(e) => setProgramTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="Sedekah Subuh Berkah">Sedekah Subuh Berkah</option>
                <option value="Infaq Operasional & Al-Qur'an Masjid">Infaq Operasional & Al-Qur'an Masjid</option>
                <option value="Zakat Penghasilan / Profesi">Zakat Penghasilan / Profesi</option>
                <option value="Zakat Maal Tabungan">Zakat Maal Tabungan</option>
                <option value="Zakat Fitrah">Zakat Fitrah</option>
                <option value="Santunan Anak Yatim & Dhuafa">Santunan Anak Yatim & Dhuafa</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Metode Pembayaran:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="QRIS">QRIS (Gopay, OVO, ShopeePay, Dana, LinkAja)</option>
                <option value="Transfer Bank BSI">Bank Syariah Indonesia (BSI)</option>
                <option value="Transfer Mandiri">Bank Mandiri</option>
                <option value="Transfer BCA">Bank Central Asia (BCA)</option>
              </select>
            </div>
          </div>

          {/* Quick Amount Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Pilih Nominal Donasi:</label>
              {customAmountStr && (
                <button
                  type="button"
                  onClick={() => setCustomAmountStr('')}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline"
                >
                  Hapus / Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[10000, 25000, 50000, 100000, 250000].map((amt) => {
                const isSelected = currentDonationAmount === amt;
                return (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setCustomAmountStr(amt.toLocaleString('id-ID'))}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    Rp {amt.toLocaleString('id-ID')}
                  </button>
                );
              })}
            </div>

            {/* Manual Numeric Input Field with Clean Backspace & Dots */}
            <div className="relative mt-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-700">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={customAmountStr}
                onChange={handleCurrencyInputChange(setCustomAmountStr)}
                placeholder="Ketik nominal manual bebas (contoh: 75.000)..."
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
              />
              {customAmountStr && (
                <button
                  type="button"
                  onClick={() => setCustomAmountStr('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-all"
                  title="Hapus nominal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              * Bebas ketik nominal berapa saja, angka dapat dihapus dan diedit secara fleksibel.
            </p>
          </div>

          {donationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {donationError}
            </div>
          )}

          {/* Doa / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Doa atau Harapan Khusus:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm shadow-emerald-glow flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {isSubmitting
              ? 'Memproses Donasi...'
              : `Konfirmasi Pembayaran (Rp ${currentDonationAmount.toLocaleString('id-ID')})`}
          </button>
        </form>
      )}

      {/* RECEIPT MODAL WITH QRIS SIMULATION */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 relative text-center space-y-4">
            <button
              onClick={() => setReceipt(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Tanda Terima Donasi Sah
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Alhamdulillah, Donasi Berhasil!
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                No: {receipt.receipt_number}
              </p>
            </div>

            {/* Simulated QR Code / Bank Info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Donatur:</span>
                <span className="font-bold text-slate-800">{receipt.donor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Program:</span>
                <span className="font-bold text-slate-800">{receipt.program_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah:</span>
                <span className="font-bold text-emerald-700 text-sm">
                  Rp {receipt.amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode:</span>
                <span className="font-bold text-slate-800">{receipt.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                  Terverifikasi
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Cetak Bukti
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
