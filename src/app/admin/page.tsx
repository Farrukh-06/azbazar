'use client';
import { useEffect, useState } from 'react';
import { Package, Users, ShoppingBag, TrendingUp, Check, X, Loader2 } from 'lucide-react';
import { getAllOrders, getAllSellersAdmin, updateSellerStatus, updateOrderStatus, Order, Seller, supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [tab, setTab] = useState<'dashboard' | 'sellers' | 'orders' | 'products'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [authed, setAuthed] = useState(false);

  const ADMIN_KEY = 'azbazar2025';

  useEffect(() => {
    if (!authed) return;
    Promise.all([getAllOrders(), getAllSellersAdmin(),
      supabase.from('products').select('*, seller:sellers(shop_name)').order('created_at', { ascending: false }).then(r => r.data || [])
    ]).then(([ords, sels, prods]) => { setOrders(ords); setSellers(sels); setProducts(prods); setLoading(false); });
  }, [authed]);

  if (!authed) return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-center">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="text-xl font-bold text-gray-900 mb-4">Admin Girişi</h1>
        <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="Admin şifrəsi" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 mb-3" onKeyDown={e => { if (e.key === 'Enter' && adminKey === ADMIN_KEY) setAuthed(true); }} />
        <button onClick={() => { if (adminKey === ADMIN_KEY) setAuthed(true); }} className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">Daxil ol</button>
        <p className="text-xs text-gray-400 mt-3">Demo şifrəsi: azbazar2025</p>
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalCommission = orders.reduce((s, o) => s + Number(o.commission || 0), 0);
  const pendingSellers = sellers.filter(s => s.status === 'pending');

  const handleApproveSeller = async (id: number, status: 'approved' | 'rejected') => {
    await updateSellerStatus(id, status);
    setSellers(s => s.map(x => x.id === id ? { ...x, status } : x));
  };

  const handleOrderStatus = async (id: number, status: any) => {
    await updateOrderStatus(id, status);
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
  };

  const tabs = [{ id: 'dashboard', l: 'Dashboard' }, { id: 'sellers', l: `Satıcılar ${pendingSellers.length > 0 ? `(${pendingSellers.length}⚠️)` : ''}` }, { id: 'orders', l: 'Sifarişlər' }, { id: 'products', l: 'Məhsullar' }] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1><p className="text-xs text-gray-400">AzBazar idarəetmə paneli</p></div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${tab === t.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}>{t.l}</button>)}
        </div>
      </div>

      {tab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[{ icon: Package, l: 'Məhsullar', v: products.length, c: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Users, l: 'Satıcılar', v: sellers.length, c: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: ShoppingBag, l: 'Sifarişlər', v: orders.length, c: 'text-green-600', bg: 'bg-green-50' },
              { icon: TrendingUp, l: 'Komissiya (₼)', v: totalCommission.toFixed(2), c: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ icon: Icon, l, v, c, bg }) => (
              <div key={l} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${c}`} /></div>
                <div className="text-2xl font-bold text-gray-900">{v}</div>
                <div className="text-sm text-gray-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
          {pendingSellers.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="font-semibold text-amber-800 mb-2">⚠️ Gözləyən satıcı müraciətləri ({pendingSellers.length})</div>
              <div className="space-y-2">
                {pendingSellers.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <div><span className="font-medium text-sm">{s.shop_name}</span><span className="text-xs text-gray-400 ml-2">{s.phone}</span></div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveSeller(s.id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-600"><Check className="w-3 h-3 inline" /> Təsdiqlə</button>
                      <button onClick={() => handleApproveSeller(s.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600"><X className="w-3 h-3 inline" /> Rədd et</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Son sifarişlər</h2>
            <div className="space-y-2">
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                  <span className="font-mono text-xs font-semibold text-indigo-600">{o.order_number}</span>
                  <span className="text-gray-600">{o.customer_name}</span>
                  <span className="font-semibold">₼{Number(o.total).toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium status-${o.status}`}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'sellers' && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Mağaza', 'Telefon', 'Kateqoriya', 'Komissiya', 'Status', 'Əməliyyat'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sellers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="font-medium">{s.shop_name}</div><div className="text-xs text-gray-400">{s.location}</div></td>
                  <td className="px-4 py-3 text-gray-500">{s.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{s.category}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-600">{s.commission_rate}%</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === 'approved' ? 'bg-green-50 text-green-600' : s.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>{s.status === 'approved' ? '✓ Təsdiqləndi' : s.status === 'pending' ? '⏳ Gözləyir' : '✗ Rədd edildi'}</span></td>
                  <td className="px-4 py-3">
                    {s.status === 'pending' && <div className="flex gap-1">
                      <button onClick={() => handleApproveSeller(s.id, 'approved')} className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">Təsdiqlə</button>
                      <button onClick={() => handleApproveSeller(s.id, 'rejected')} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Rədd et</button>
                    </div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Sifariş', 'Müştəri', 'Cəmi', 'Komissiya', 'Status', 'Yenilə'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{o.order_number}</td>
                  <td className="px-4 py-3"><div className="font-medium">{o.customer_name}</div><div className="text-xs text-gray-400">{o.customer_phone}</div></td>
                  <td className="px-4 py-3 font-semibold">₼{Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-indigo-600 font-semibold">₼{Number(o.commission || 0).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium status-${o.status}`}>{o.status}</span></td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => handleOrderStatus(o.id, e.target.value)}
                      className="border border-gray-200 rounded text-xs px-2 py-1 focus:outline-none focus:border-indigo-400">
                      {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'products' && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Məhsul', 'Satıcı', 'Qiymət', 'Stok', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center text-lg flex-shrink-0">
                      {p.image?.startsWith('http') ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : p.image}
                    </div>
                    <span className="font-medium line-clamp-1">{p.name_az}</span>
                  </div></td>
                  <td className="px-4 py-3 text-gray-500">{p.seller?.shop_name}</td>
                  <td className="px-4 py-3 font-semibold">₼{Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{p.stock}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
