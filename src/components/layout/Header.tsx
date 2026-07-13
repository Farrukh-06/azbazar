'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu, X, Store, LayoutDashboard, LogOut } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { getSession, setSession } from '@/lib/store';

export default function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [session, setSessionState] = useState<any>(null);
  const router = useRouter();

  useEffect(() => { setSessionState(getSession()); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    setSession(null);
    setSessionState(null);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Ana Səhifə' },
    { href: '/categories', label: 'Kateqoriyalar' },
    { href: '/sellers', label: 'Satıcılar' },
    { href: '/products?badge=sale', label: 'Endirimlər' },
    { href: '/contact', label: 'Əlaqə' },
  ];

  return (
    <>
      <div className="bg-gradient-to-r from-[#6B46C1] to-[#3B82F6] text-white text-center text-xs py-2 px-4">
        🎉 Yeni satıcılar üçün ilk ay 7.5% komissiya — <Link href="/seller" className="underline font-semibold">İndi qoşul</Link>
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <div className="text-2xl font-bold leading-none">
              <span className="text-[#6B46C1]">Az</span><span className="text-[#3B82F6]">Bazar</span>
            </div>
            <div className="text-[9px] tracking-widest text-gray-400 font-medium uppercase">marketplace</div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Məhsul, kateqoriya axtar..."
                className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6B46C1] bg-gray-50" />
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-5 text-sm text-gray-600">
            {navLinks.map(l => <Link key={l.href} href={l.href} className="hover:text-[#6B46C1] transition-colors">{l.label}</Link>)}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link href="/cart" className="relative p-2 hover:text-[#6B46C1] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#6B46C1] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>}
            </Link>

            {session?.type === 'seller' ? (
              <div className="flex items-center gap-2">
                <Link href="/seller/dashboard" className="flex items-center gap-1.5 text-sm text-[#6B46C1] font-medium hover:underline">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></button>
              </div>
            ) : session?.type === 'admin' ? (
              <div className="flex items-center gap-2">
                <Link href="/admin" className="text-sm font-semibold text-[#6B46C1]">Admin Panel</Link>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500"><LogOut className="w-4 h-4" /></button>
              </div>
            ) : (
              <Link href="/seller" className="hidden md:flex items-center gap-1.5 btn-primary text-sm py-2 px-4">
                <Store className="w-3.5 h-3.5" /> Satıcı ol
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Axtar..."
                className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none" />
            </form>
            {navLinks.map(l => <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-sm text-gray-700 py-1 border-b border-gray-50">{l.label}</Link>)}
          </div>
        )}
      </header>
    </>
  );
}
