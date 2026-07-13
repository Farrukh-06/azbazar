'use client';
import { useState } from 'react';
import { CheckCircle, Store, TrendingUp, Users, Shield } from 'lucide-react';

export default function SellerPage() {
  const [form, setForm] = useState({ name: '', store: '', phone: '', category: '', trendyol: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.store || !form.phone) return;
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="font-serif text-2xl font-bold text-[#0D1B2A] mb-2">Müraciətiniz qəbul edildi!</h1>
      <p className="text-gray-500 mb-2">24 saat ərzində sizinlə əlaqə saxlayacağıq.</p>
      <p className="text-sm text-[#C9A84C] font-medium">İlk ay 7.5% komissiya sizdən ötrü hazırdır 🎉</p>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div className="bg-[#0D1B2A] px-4 py-14 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-px bg-[#C9A84C]" />
          <span className="text-[10px] tracking-widest text-[#C9A84C] uppercase font-semibold">Təsisçi Satıcı Proqramı</span>
          <div className="w-6 h-px bg-[#C9A84C]" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">AzBazar-da Satıcı Ol</h1>
        <p className="text-white/50 max-w-md mx-auto text-sm">Sədərək satıcısı, sənətkar, kiçik biznes — hamısı üçün. İlk ay cəmi 7.5% komissiya.</p>
      </div>

      {/* Benefits */}
      <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-4 -mt-6">
        {[
          { icon: Store, title: 'Öz mağazanız', desc: 'Şəxsi satıcı səhifəsi' },
          { icon: TrendingUp, title: '7.5% ilk ay', desc: 'Sonra 15% komissiya' },
          { icon: Users, title: 'Geniş müştəri', desc: 'Bütün Azərbaycan' },
          { icon: Shield, title: 'Zəmanət', desc: 'Etibarlı ödəniş' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-lg p-4 text-center shadow-sm">
            <Icon className="w-6 h-6 text-[#C9A84C] mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 pb-16">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-[#0D1B2A] mb-5">Müraciət formu</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Ad Soyad *', placeholder: 'Adınız' },
              { key: 'store', label: 'Mağaza adı *', placeholder: 'Mağazanızın adı' },
              { key: 'phone', label: 'Telefon *', placeholder: '+994 XX XXX XX XX' },
              { key: 'trendyol', label: 'Trendyol mağaza linki (varsa)', placeholder: 'https://trendyol.com/...' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                <input
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kateqoriya</label>
              <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C]">
                <option value="">Seçin...</option>
                <option>Keramika / Əl işi</option>
                <option>Məişət Texnikası</option>
                <option>Toxuculuq / Xalça</option>
                <option>Ağac İşi</option>
                <option>Zərgərlik</option>
                <option>Mətbəx</option>
                <option>Digər</option>
              </select>
            </div>
            <button type="submit" className="btn-gold w-full mt-2">Müraciət et</button>
            <p className="text-xs text-gray-400 text-center">24 saat ərzində əlaqə saxlayacağıq</p>
          </form>
        </div>
      </div>
    </div>
  );
}
