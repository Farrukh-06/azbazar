'use client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Star, Shield, Truck, ArrowLeft, Check } from 'lucide-react';
import { products } from '@/data';
import { useCart } from '@/lib/CartContext';
import { useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);
  if (!product) notFound();

  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/products" className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#C9A84C] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Məhsullara qayıt
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Image */}
        <div className="bg-white border border-gray-100 rounded-xl flex items-center justify-center h-80 lg:h-96 text-8xl">
          {product.image}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[#C9A84C] font-medium">{product.categoryAz}</span>
            {product.badge && (
              <span className={`badge-${product.badge}`}>
                {product.badge === 'local' ? 'Yerli' : product.badge === 'new' ? 'Yeni' : product.badge === 'sale' ? 'Endirim' : 'Populyar'}
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#0D1B2A] mb-2">{product.nameAz}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.rating} · {product.reviews} rəy</span>
          </div>

          <Link href={`/sellers/${product.sellerId}`} className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-5 hover:bg-amber-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#0D1B2A] flex items-center justify-center text-[#C9A84C] text-xs font-bold">
              {product.seller.substring(0, 2)}
            </div>
            <span className="text-sm font-medium text-gray-700">{product.seller}</span>
            <span className="text-xs text-[#C9A84C] ml-auto">Mağazaya bax →</span>
          </Link>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.descriptionAz}</p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-serif text-3xl font-bold text-[#0D1B2A]">₼{product.price}</span>
            {product.oldPrice && (
              <>
                <span className="text-lg text-gray-300 line-through">₼{product.oldPrice}</span>
                <span className="text-sm font-semibold text-green-600">₼{product.oldPrice - product.price} qənaət</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-gray-200 rounded-md">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-gray-500 hover:text-gray-800">−</button>
              <span className="px-4 py-2 text-sm font-semibold border-x border-gray-200">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 text-gray-500 hover:text-gray-800">+</button>
            </div>
            <span className="text-xs text-gray-400">{product.stock} ədəd stokda</span>
          </div>

          <button onClick={handleAdd}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold transition-all ${added ? 'bg-green-600 text-white' : 'btn-gold'}`}>
            {added ? <><Check className="w-4 h-4" /> Səbətə əlavə edildi!</> : <><ShoppingCart className="w-4 h-4" /> Səbətə əlavə et</>}
          </button>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <Shield className="w-4 h-4 text-[#C9A84C]" /> Etibarlı ödəniş
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <Truck className="w-4 h-4 text-[#C9A84C]" /> Sürətli çatdırılma
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="font-serif text-xl font-bold text-[#0D1B2A] mb-5">Oxşar məhsullar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
