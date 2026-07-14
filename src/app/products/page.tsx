'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { getProducts, getCategories, Product, Category } from '@/lib/supabase';
import ProductCard from '@/components/ui/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
  const [selectedBadge, setSelectedBadge] = useState(searchParams.get('badge') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ search: search || undefined, category: selectedCat || undefined })
      .then(data => {
        let sorted = [...data];
        if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
        setProducts(sorted);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [search, selectedCat, selectedBadge, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Məhsullar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} məhsul tapıldı</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo-400 transition-colors">
          <SlidersHorizontal className="w-4 h-4" /> Filterlər
        </button>
      </div>

      <div className="flex gap-6">
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-56 flex-shrink-0`}>
          <div className="bg-white border border-gray-100 rounded-xl p-4 sticky top-24 shadow-sm">
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Axtarış</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Məhsul adı..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Kateqoriya</label>
              <div className="space-y-0.5">
                <button onClick={() => setSelectedCat('')} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!selectedCat ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'}`}>Hamısı</button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => setSelectedCat(c.slug === selectedCat ? '' : c.slug)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${selectedCat === c.slug ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'}`}>
                    <span>{c.icon}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Növ</label>
              <div className="space-y-0.5">
                {[{ v: '', l: 'Hamısı' }, { v: 'local', l: '🇦🇿 Yerli' }, { v: 'new', l: '✨ Yeni' }, { v: 'sale', l: '🏷 Endirim' }, { v: 'hot', l: '🔥 Populyar' }].map(b => (
                  <button key={b.v} onClick={() => setSelectedBadge(b.v === selectedBadge ? '' : b.v)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${selectedBadge === b.v ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'}`}>{b.l}</button>
                ))}
              </div>
            </div>
            {(selectedCat || selectedBadge || search) && (
              <button onClick={() => { setSelectedCat(''); setSelectedBadge(''); setSearch(''); }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1">
                <X className="w-3 h-3" /> Sıfırla
              </button>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
              <option value="newest">Ən yeni</option>
              <option value="price-asc">Qiymət: Azdan çoxa</option>
              <option value="price-desc">Qiymət: Çoxdan aza</option>
              <option value="rating">Reytinqə görə</option>
            </select>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-semibold">Məhsul tapılmadı</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" /></div>}><ProductsContent /></Suspense>;
}
