'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { createOrder } from '@/lib/supabase';
import { Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', shippingAddress: '', city: '', notes: '', paymentMethod: 'cash_on_delivery' });
  const shippingCost = total >= 50 ? 0 : 5;
  const grandTotal = total + shippingCost;

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">🛒</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Səbətiniz boşdur</h1>
      <Link href="/products" className="inline-block mt-4 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg">Alış-verişə başla</Link>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.shippingAddress || !form.city) { setError('Bütün məcburi sahələri doldurun'); return; }
    setLoading(true); setError('');
    try {
      const order = await createOrder({ ...form, items: items as any });
      clearCart();
      router.push(`/orders/${order.order_number}`);
    } catch { setError('Sifariş zamanı xəta baş verdi. Yenidən cəhd edin.'); setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Sifarişi Tamamla</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">📦 Çatdırılma məlumatları</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ key: 'customerName', label: 'Ad Soyad *', ph: 'Adınız' }, { key: 'customerPhone', label: 'Telefon *', ph: '+994 XX XXX XX XX' }, { key: 'customerEmail', label: 'Email', ph: 'email@example.com' }, { key: 'city', label: 'Şəhər *', ph: 'Bakı' }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ünvan *</label>
                <input value={form.shippingAddress} onChange={e => setForm(p => ({ ...p, shippingAddress: e.target.value }))} placeholder="Küçə, bina, mənzil..." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Qeyd</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">💳 Ödəniş üsulu</h2>
            <div className="space-y-3">
              {[{ v: 'cash_on_delivery', l: '🚚 Çatdırılmada ödəniş', d: 'Məhsul çatanda ödəyin' }, { v: 'kapital_bank', l: '🏦 Kapital Bank', d: 'Onlayn kart ödənişi' }, { v: 'unibank', l: '🏦 UNIbank', d: 'Onlayn kart ödənişi' }].map(opt => (
                <label key={opt.v} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.paymentMethod === opt.v ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={opt.v} checked={form.paymentMethod === opt.v} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))} className="text-indigo-600" />
                  <div><div className="font-medium text-sm">{opt.l}</div><div className="text-xs text-gray-400">{opt.d}</div></div>
                </label>
              ))}
            </div>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Emal edilir...</> : 'Sifarişi Təsdiqlə'}
          </button>
        </form>
        <div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-24 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Sifariş xülasəsi</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center text-xl">
                    {(item.product as any).image?.startsWith('http') ? <img src={(item.product as any).image} className="w-full h-full object-cover" alt="" /> : (item.product as any).image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{(item.product as any).name_az || (item.product as any).nameAz}</p>
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">₼{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Məhsullar</span><span>₼{total.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Çatdırılma</span><span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Pulsuz' : `₼${shippingCost}`}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100"><span>Cəmi</span><span>₼{grandTotal.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-2 mt-4"><Shield className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" /><p className="text-xs text-gray-400">Ödənişiniz Kapital Bank tərəfindən qorunur</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
