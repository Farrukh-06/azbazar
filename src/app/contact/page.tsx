'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-bold text-[#0D1B2A]">Əlaqə</h1>
        <p className="text-gray-400 mt-2">Sualınız var? Bizimlə əlaqə saxlayın</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="space-y-4 mb-8">
            {[
              { icon: Mail, label: 'Email', value: 'info@azbazar.az' },
              { icon: Phone, label: 'Telefon', value: '+994 12 XXX XX XX' },
              { icon: MapPin, label: 'Ünvan', value: 'Bakı, Azərbaycan' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-[#0D1B2A] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">{label}</div>
                  <div className="text-sm font-medium text-gray-900">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Mesajınız göndərildi!</h3>
              <p className="text-sm text-gray-400">Tezliklə cavab verəcəyik.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-semibold text-gray-900 mb-4">Mesaj göndər</h2>
              {[
                { key: 'name', label: 'Ad *', placeholder: 'Adınız' },
                { key: 'email', label: 'Email', placeholder: 'email@example.com', type: 'email' },
                { key: 'subject', label: 'Mövzu', placeholder: 'Mövzu' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input type={f.type || 'text'} value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C]" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mesaj *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Mesajınızı yazın..." rows={4}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] resize-none" />
              </div>
              <button type="submit" className="btn-gold w-full">Göndər</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
