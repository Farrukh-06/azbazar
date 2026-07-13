'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Loader2, Clock } from 'lucide-react';
import { supabase, Order } from '@/lib/supabase';

export default function OrderSuccessPage({ params }: { params: { orderNumber: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('orders').select('*, order_items(*)').eq('order_number', params.orderNumber).single()
      .then(({ data }) => { setOrder(data); setLoading(false); });
  }, [params.orderNumber]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (!order) return <div className="text-center py-20"><p className="text-gray-400">Sifariş tapılmadı</p></div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sifarişiniz qəbul edildi!</h1>
        <p className="text-gray-400 mb-6">Tezliklə sizinlə əlaqə saxlayacağıq</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Sifariş nömrəsi</span><span className="font-bold text-indigo-600">{order.order_number}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Ad</span><span className="font-medium">{order.customer_name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Telefon</span><span className="font-medium">{order.customer_phone}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Şəhər</span><span className="font-medium">{order.city}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Ödəniş</span><span className="font-medium">{order.payment_method === 'cash_on_delivery' ? 'Çatdırılmada' : order.payment_method}</span></div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold"><span>Cəmi</span><span className="text-indigo-600">₼{Number(order.total).toFixed(2)}</span></div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 rounded-lg px-4 py-3 text-sm mb-6">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Bakı daxili 24 saat, regionlara 2-3 iş günü ərzində çatdırılacaq</span>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">Ana Səhifə</Link>
          <Link href="/products" className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm">Davam et</Link>
        </div>
      </div>
    </div>
  );
}
