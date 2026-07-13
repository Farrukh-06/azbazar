import Link from 'next/link';
import { categories } from '@/data';

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#0D1B2A]">Kateqoriyalar</h1>
        <p className="text-gray-400 mt-1">Bütün məhsul kateqoriyaları</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
          <Link key={cat.id} href={`/products?category=${cat.id}`}
            className="card p-6 text-center hover:border-[#C9A84C]/40 transition-colors block group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{cat.nameAz}</h3>
            <p className="text-sm text-[#C9A84C] font-medium">{cat.count} məhsul</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
