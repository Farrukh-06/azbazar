'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package, ShoppingBag, TrendingUp, Loader2, X, Check } from 'lucide-react';
import { supabase, getOrdersBySellerUserId, addProduct, updateProduct, deleteProduct, getCategories, Order, Category } from '@/lib/supabase';

interface SellerProduct { id: number; name_az: string; price: number; old_price?: number; stock: number; image: string; badge?: string; status: string; sold_count: number; category_id: number; }

export default function SellerDashboard() {
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<'overview' | 'products' | 'orders' | 'add'>('overview');
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<SellerProduct | null>(null);
  const [form, setForm] = useState({ nameAz: '', price: '', oldPrice: '', stock: '', image: '', badge: '', categoryId: '', descriptionAz: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/seller/login'; return; }
      const { data: sellerData } = await supabase.from('sellers').select('*').eq('user_id', user.id).single();
      if (!sellerData) { window.location.href = '/seller'; return; }
      if (sellerData.status !== 'approved') { setLoading(false); setSeller(sellerData); return; }
      setSeller(sellerData);
      const [prods, ords, cats] = await Promise.all([
        supabase.from('products').select('*').eq('seller_id', sellerData.id).order('created_at', { ascending: false }).then(r => r.data || []),
        getOrdersBySellerUserId(sellerData.id),
        getCategories(),
      ]);
      setProducts(prods); setOrders(ords); setCategories(cats);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, { nameAz: form.nameAz, price: parseFloat(form.price), oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined, stock: parseInt(form.stock), image: form.image, badge: form.badge || undefined, descriptionAz: form.descriptionAz });
        setMsg('Məhsul yeniləndi!');
      } else {
        await addProduct({ sellerId: seller.id, categoryId: parseInt(form.categoryId) || 1, nameAz: form.nameAz, descriptionAz: form.descriptionAz, price: parseFloat(form.price), oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined, stock: parseInt(form.stock), image: form.image || '📦', badge: form.badge || undefined });
        setMsg('Məhsul əlavə edildi!');
      }
      const { data } = await supabase.from('products').select('*').eq('seller_id', seller.id).order('created_at', { ascending: false });
      setProducts(data || []); setEditProduct(null); setForm({ nameAz: '', price: '', oldPrice: '', stock: '', image: '', badge: '', categoryId: '', descriptionAz: '' }); setTab('products');
    } catch { setMsg('Xəta baş verdi'); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Silmək istədiyinizə əminsiniz?')) return;
    await deleteProduct(id);
    setProducts(p => p.filter(x => x.id !== id));
  };

  const startEdit = (p: SellerProduct) => {
    setEditProduct(p);
    setForm({ nameAz: p.name_az, price: String(p.price), oldPrice: String(p.old_price || ''), stock: String(p.stock), image: p.image, badge: p.badge || '', categoryId: String(p.category_id), descriptionAz: '' });
    setTab('add');
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  if (seller?.status === 'pending') return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">⏳</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Müraciətiniz gözləmədədir</h1>
      <p className="text-gray-400">Admin tərəfindən təsdiq gözlənilir. 24 saat ərzində bildiriş alacaqsınız.</p>
    </div>
  );

  const totalRevenue = orders.reduce((s, o) => s + Number(o.seller_receives || 0), 0);
  const totalCommission = orders.reduce((s, o) => s + Number(o.commission || 0), 0);

  const tabs = [{ id: 'overview', l: 'İcmal' }, { id: 'products', l: 'Məhsullar' }, { id: 'orders', l: 'Sifarişlər' }, { id: 'add', l: editProduct ? 'Redaktə' : '+ Məhsul əlavə et' }] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{seller?.shop_name}</h1><p className="text-sm text-gray-400">Satıcı Paneli</p></div>
        <div className="flex gap-2">
          {tabs.map(t => <button key={t.id} onClick={() => { setTab(t.id); if (t.id !== 'add') setEditProduct(null); }}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${tab === t.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}>{t.l}</button>)}
        </div>
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[{ icon: Package, l: 'Məhsullar', v: products.length, c: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: ShoppingBag, l: 'Sifarişlər', v: orders.length, c: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: TrendingUp, l: 'Gəlir (₼)', v: totalRevenue.toFixed(2), c: 'text-green-600', bg: 'bg-green-50' },
              { icon: TrendingUp, l: 'Komissiya (₼)', v: totalCommission.toFixed(2), c: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ icon: Icon, l, v, c, bg }) => (
              <div key={l} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${c}`} /></div>
                <div className="text-2xl font-bold text-gray-900">{v}</div>
                <div className="text-sm text-gray-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
            💡 Komissiya dərəcəniz: <strong>{seller?.commission_rate}%</strong> — Hər satışdan {seller?.commission_rate}% platforma payı çıxılır
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {products.length === 0 ? (
            <div className="text-center py-16"><Package className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-400">Hələ məhsul yoxdur</p><button onClick={() => setTab('add')} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">İlk məhsulu əlavə et</button></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Məhsul', 'Qiymət', 'Stok', 'Status', 'Əməliyyat'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center text-xl flex-shrink-0">
                        {p.image?.startsWith('http') ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : p.image}
                      </div>
                      <span className="font-medium text-gray-900 line-clamp-1">{p.name_az}</span>
                    </div></td>
                    <td className="px-4 py-3 font-semibold">₼{Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{p.status === 'active' ? 'Aktiv' : 'Deaktiv'}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="text-indigo-500 hover:text-indigo-700"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {orders.length === 0 ? <div className="text-center py-16 text-gray-400"><ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p>Hələ sifariş yoxdur</p></div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Sifariş', 'Müştəri', 'Məbləğ', 'Gəlir', 'Status', 'Tarix'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{o.order_number}</td>
                    <td className="px-4 py-3"><div className="font-medium">{o.customer_name}</div><div className="text-xs text-gray-400">{o.customer_phone}</div></td>
                    <td className="px-4 py-3 font-semibold">₼{Number(o.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">₼{Number(o.seller_receives || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium status-${o.status}`}>{o.status === 'pending' ? 'Gözləyir' : o.status === 'confirmed' ? 'Təsdiqləndi' : o.status === 'shipped' ? 'Yolda' : o.status === 'delivered' ? 'Çatdırıldı' : 'Ləğv'}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString('az')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'add' && (
        <div className="max-w-xl">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">{editProduct ? 'Məhsulu redaktə et' : 'Yeni məhsul əlavə et'}</h2>
              {editProduct && <button onClick={() => { setEditProduct(null); setForm({ nameAz: '', price: '', oldPrice: '', stock: '', image: '', badge: '', categoryId: '', descriptionAz: '' }); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
            {msg && <div className={`mb-4 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${msg.includes('Xəta') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}><Check className="w-4 h-4" />{msg}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              {[{ k: 'nameAz', l: 'Məhsul adı *', ph: 'Məhsulun adı' }, { k: 'price', l: 'Qiymət (₼) *', ph: '0.00', t: 'number' }, { k: 'oldPrice', l: 'Köhnə qiymət (₼)', ph: '0.00', t: 'number' }, { k: 'stock', l: 'Stok *', ph: '10', t: 'number' }, { k: 'image', l: 'Şəkil URL', ph: 'https://... və ya emoji' }].map(f => (
                <div key={f.k}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.l}</label>
                  <input type={f.t || 'text'} value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kateqoriya</label>
                <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                  <option value="">Seçin...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_az}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Badge</label>
                <select value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                  <option value="">Yoxdur</option>
                  <option value="new">✨ Yeni</option><option value="sale">🏷 Endirim</option>
                  <option value="local">🇦🇿 Yerli</option><option value="hot">🔥 Populyar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Təsvir</label>
                <textarea value={form.descriptionAz} onChange={e => setForm(p => ({ ...p, descriptionAz: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saxlanılır...</> : editProduct ? 'Yenilə' : 'Əlavə et'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
