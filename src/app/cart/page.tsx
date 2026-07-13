'use client';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [ordered, setOrdered] = useState(false);

  if (ordered) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="font-serif text-2xl font-bold text-[#0D1B2A] mb-2">Sifarişiniz qəbul edildi!</h1>
      <p className="text-gray-500 mb-6">Tezliklə sizinlə əlaqə saxlayacağıq. Kapital Bank ilə ödəniş qəbul edildi.</p>
      <Link href="/" className="btn-gold inline-block">Ana səhifəyə qayıt</Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h1 className="font-serif text-2xl font-bold text-[#0D1B2A] mb-2">Səbətiniz boşdur</h1>
      <p className="text-gray-400 mb-6">Məhsulları səbətə əlavə edin</p>
      <Link href="/products" className="btn-gold inline-block">Alış-verişə başla</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/products" className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#C9A84C] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Alış-verişə davam et
      </Link>
      <h1 className="font-serif text-2xl font-bold text-[#0D1B2A] mb-6">Səbət ({items.length} məhsul)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.product.id} className="bg-white border border-gray-100 rounded-lg p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 border border-gray-100">
                {item.product.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#C9A84C] mb-0.5">{item.product.seller}</p>
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.product.nameAz}</h3>
                <p className="font-bold text-[#0D1B2A] mt-1">₼{item.product.price}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded text-sm">
                    <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                    <span className="px-3 py-1 border-x border-gray-200 font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                  </div>
                  <span className="text-xs text-gray-400">= ₼{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => removeItem(item.product.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white border border-gray-100 rounded-lg p-5 sticky top-28">
            <h2 className="font-semibold text-gray-900 mb-4">Sifariş xülasəsi</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-500">
                <span>Məhsullar</span>
                <span>₼{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Çatdırılma</span>
                <span className="text-green-600">{total >= 50 ? 'Pulsuz' : '₼5.00'}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>Cəmi</span>
                <span>₼{(total >= 50 ? total : total + 5).toFixed(2)}</span>
              </div>
            </div>
            {total < 50 && <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 mb-3">₼{(50 - total).toFixed(2)} əlavə alışda pulsuz çatdırılma</p>}
            <button onClick={() => { clearCart(); setOrdered(true); }} className="btn-gold w-full mb-2">Sifarişi tamamla</button>
            <div className="flex gap-1.5 justify-center mt-3">
              {['Kapital Bank', 'UNIbank', 'ABB'].map(b => (
                <span key={b} className="text-[9px] border border-gray-100 rounded px-1.5 py-0.5 text-gray-400">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
