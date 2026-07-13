'use client';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/lib/CartContext';

export interface AnyProduct {
  id: string; nameAz: string; price: number; oldPrice?: number;
  image: string; seller: string; sellerId: string; rating: number;
  reviews: number; badge?: string; category?: string; categoryAz?: string;
}

const badgeLabel: Record<string, string> = { local: '🇦🇿 Yerli', new: '✨ Yeni', sale: '🏷 Endirim', hot: '🔥 Populyar' };

export default function ProductCard({ product }: { product: AnyProduct }) {
  const { addItem } = useCart();
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className="card group overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 h-44 flex items-center justify-center text-6xl border-b border-gray-100">
          {product.image}
          {product.badge && <span className={`absolute top-2 left-2 badge-${product.badge}`}>{badgeLabel[product.badge] || product.badge}</span>}
          {discount > 0 && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">−{discount}%</span>}
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <p className="text-xs text-[#6B46C1] mb-0.5 font-medium">{product.seller}</p>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2 hover:text-[#6B46C1] transition-colors">{product.nameAz}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-400">{product.rating} ({product.reviews})</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-gray-900">₼{product.price}</span>
            {product.oldPrice && <span className="text-xs text-gray-400 line-through ml-1.5">₼{product.oldPrice}</span>}
          </div>
          <button onClick={() => addItem(product as any)}
            className="bg-[#6B46C1] text-white p-2 rounded-lg hover:bg-[#553C9A] transition-colors"
            aria-label="Səbətə əlavə et">
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
