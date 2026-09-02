import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function AnomalyAlertBanner({ onNavigate }) {
  return (
    <div
      className="rounded-2xl flex items-start justify-between gap-5 p-5"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
        borderLeft: '4px solid #F59E0B',
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
        style={{ width: 40, height: 40, backgroundColor: 'rgba(245,158,11,0.15)' }}
      >
        <AlertTriangle size={20} color="#F59E0B" strokeWidth={1.8} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm font-semibold mb-1.5" style={{ color: '#F59E0B' }}>
          ⚠️ Davranışsal Anormallik Tespit Edildi (TabNet Inference)
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#4B6E5E' }}>
          Tek kullanımlık plastik tüketiminiz haftalık ortalamanın{' '}
          <strong style={{ color: '#F59E0B' }}>%47 üzerinde</strong>.
          TabNet modeli bu davranışı bir müdahale noktası olarak işaretledi.
          Kişiselleştirilmiş müdahale öneriniz hazır.
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shrink-0 self-center transition-all duration-200"
        style={{
          backgroundColor: 'transparent',
          border: '1px solid #F59E0B',
          color: '#F59E0B',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.12)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        Koça Git / Müdahale Et
        <ArrowRight size={13} />
      </button>
    </div>
  );
}
