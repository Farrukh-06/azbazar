import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0D1B2A] text-white/60 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="font-serif text-xl font-bold text-white mb-1">Az<span className="text-[#C9A84C]">Bazar</span></div>
          <div className="w-8 h-px bg-[#C9A84C] mb-3 opacity-60" />
          <p className="text-xs leading-relaxed">Azərbaycanın yerli e-ticarət platformu. Sədərək sənətkarları, əl işi məmulatlar, məişət texnikası.</p>
        </div>
        <div>
          <h4 className="text-[10px] tracking-widest text-[#C9A84C] uppercase font-semibold mb-4">Platforma</h4>
          {['Haqqımızda', 'Necə işləyir', 'Satıcı ol', 'Blog'].map(l => (
            <div key={l}><Link href="#" className="block text-xs text-white/50 hover:text-white mb-2.5 transition-colors">{l}</Link></div>
          ))}
        </div>
        <div>
          <h4 className="text-[10px] tracking-widest text-[#C9A84C] uppercase font-semibold mb-4">Yardım</h4>
          {['Çatdırılma', 'Geri qaytarma', 'Ödəniş', 'Əlaqə'].map(l => (
            <div key={l}><Link href="#" className="block text-xs text-white/50 hover:text-white mb-2.5 transition-colors">{l}</Link></div>
          ))}
        </div>
        <div>
          <h4 className="text-[10px] tracking-widest text-[#C9A84C] uppercase font-semibold mb-4">Əlaqə</h4>
          <div className="text-xs space-y-2.5">
            <div>info@azbazar.az</div>
            <div>+994 12 XXX XX XX</div>
            <div>Bakı, Azərbaycan</div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/30">© 2025 AzBazar. Bütün hüquqlar qorunur.</p>
          <div className="flex gap-2">
            {['Kapital Bank', 'UNIbank', 'ABB'].map(b => (
              <span key={b} className="text-[10px] border border-white/10 rounded px-2 py-1 text-white/40">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
