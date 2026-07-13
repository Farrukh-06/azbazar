import Link from 'next/link';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import { sellers } from '@/data';

export default function SellersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#0D1B2A]">Satıcılar</h1>
        <p className="text-gray-400 mt-1">Doğrulanmış yerli satıcılar və Sədərək ustası</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sellers.map(s => (
          <Link key={s.id} href={`/sellers/${s.id}`}
            className="card p-5 block hover:border-[#C9A84C]/40 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#0D1B2A] border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-serif font-bold text-lg flex-shrink-0">
                {s.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  {s.verified && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-gray-500">{s.rating} · {s.reviews} rəy</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" /> {s.location}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{s.descriptionAz}</p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="text-xs text-gray-400">{s.products} məhsul</div>
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">{s.category}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
