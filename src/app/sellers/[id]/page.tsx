'use client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, CheckCircle, Calendar, Package, ArrowLeft } from 'lucide-react';
import { sellers, products } from '@/data';
import ProductCard from '@/components/ui/ProductCard';

export default function SellerPage({ params }: { params: { id: string } }) {
  const seller = sellers.find(s => s.id === params.id);
  if (!seller) notFound();
  const sellerProducts = products.filter(p => p.sellerId === params.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/sellers" className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#C9A84C] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Satıcılara qayıt
      </Link>

      {/* Seller header */}
      <div className="bg-[#0D1B2A] rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-[#1B2E45] border-2 border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] font-serif font-bold text-2xl flex-shrink-0">
          {seller.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif text-2xl font-bold text-white">{seller.name}</h1>
            {seller.verified && <CheckCircle className="w-5 h-5 text-blue-400" />}
          </div>
          <p className="text-white/50 text-sm mb-3">{seller.descriptionAz}</p>
          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {seller.rating} ({seller.reviews} rəy)</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#C9A84C]" /> {seller.location}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#C9A84C]" /> {seller.joined}</span>
            <span className="flex items-center gap-1"><Package className="w-3 h-3 text-[#C9A84C]" /> {seller.products} məhsul</span>
          </div>
        </div>
        <div className="text-center">
          <div className="font-serif text-3xl font-bold text-[#C9A84C]">{seller.rating}</div>
          <div className="flex justify-center mt-1">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.floor(seller.rating) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />)}</div>
          <div className="text-xs text-white/30 mt-0.5">{seller.reviews} rəy</div>
        </div>
      </div>

      <h2 className="font-serif text-xl font-bold text-[#0D1B2A] mb-5">Məhsullar ({sellerProducts.length})</h2>
      {sellerProducts.length === 0 ? (
        <p className="text-gray-400 text-center py-12">Bu satıcının hələ məhsulu yoxdur.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sellerProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
