'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Truck, RefreshCw, Headphones, Star, Loader2 } from 'lucide-react';
import { getProducts, getCategories, getSellers, Product, Category, Seller } from '@/lib/supabase';
import ProductCard from '@/components/ui/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ featured: true }),
      getCategories(),
      getSellers(),
    ]).then(([prods, cats, sels]) => {
      setProducts(prods.slice(0, 8));
      setCategories(cats.slice(0, 8));
      setSellers(sels.slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 px-4 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-5">
              <span className="text-xs font-semibold text-white tracking-wide">🇦🇿 Azərbaycanın Yerli Platformu</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Azərbaycanın<br />
              <span className="text-yellow-300">#1 Yerli</span> Bazarı
            </h1>
            <p className="text-white/70 text-base mb-8 max-w-md leading-relaxed">
              Sədərək sənətkarları, əl işi məmulatlar, keramika, xalça və məişət texnikası — hamısı bir yerdə.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/products" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                Alış-verişə başla
              </Link>
              <Link href="/seller" className="border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                Satıcı ol →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            {[{ v: '1,000+', l: 'Məhsul' }, { v: '6+', l: 'Satıcı' }, { v: '500+', l: 'Müştəri' }, { v: '4.9 ★', l: 'Reytinq' }].map(s => (
              <div key={s.l} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-yellow-300">{s.v}</div>
                <div className="text-xs text-white/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Kateqoriyalar</h2>
          <Link href="/categories" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">Hamısına bax <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {loading ? [...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />) :
            categories.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="bg-white border border-gray-100 hover:border-indigo-300 hover:shadow-sm rounded-xl p-3 text-center transition-all cursor-pointer group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="text-xs font-semibold text-gray-700 leading-tight">{cat.name}</div>
              </Link>
            ))}
        </div>
      </section>

      {/* Promo */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs tracking-widest text-indigo-200 uppercase font-semibold mb-1">Təsisçi Satıcı Proqramı</div>
            <h3 className="text-xl font-bold text-white">İlk ay cəmi 7.5% komissiya</h3>
            <p className="text-white/60 text-sm mt-1">Sədərək satıcıları üçün xüsusi. Yalnız ilk 50 yer.</p>
          </div>
          <Link href="/seller" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
            İndi qoşul
          </Link>
        </div>
      </div>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Seçilmiş Məhsullar</h2>
          <Link href="/products" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">Hamısına bax <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Sellers */}
      {sellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Seçilmiş Satıcılar</h2>
            <Link href="/sellers" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">Hamısına bax <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sellers.map(s => (
              <Link key={s.id} href={`/sellers/${s.id}`}
                className="bg-white border border-gray-100 hover:border-indigo-300 rounded-xl p-4 flex items-center gap-3 transition-all">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {s.shop_name.substring(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{s.shop_name}</div>
                  <div className="text-xs text-gray-400">{s.location}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-gray-500">{s.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-gray-100 rounded-xl overflow-hidden divide-x divide-y lg:divide-y-0 divide-gray-100">
          {[
            { icon: Shield, title: 'Etibarlı ödəniş', desc: 'Kapital Bank · UNIbank' },
            { icon: Truck, title: 'Sürətli çatdırılma', desc: 'Bakı 24 saat · Region 2–3 gün' },
            { icon: RefreshCw, title: '14 gün qaytarma', desc: 'Problemsiz, sualasız' },
            { icon: Headphones, title: 'Azərbaycanca dəstək', desc: 'Hər zaman sizinlə' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white p-5 text-center">
              <Icon className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-800 mb-1">{title}</div>
              <div className="text-xs text-gray-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
