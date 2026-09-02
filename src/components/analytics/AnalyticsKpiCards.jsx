import { TrendingDown, AlertTriangle, Cpu } from 'lucide-react';

const CARDS = [
  {
    id: 'avg',
    accentColor: '#22C55E',
    icon: TrendingDown,
    iconColor: '#22C55E',
    label: 'Aylık Ortalama',
    value: '7.2 kg/gün',
    valueColor: '#22C55E',
    sub: (
      <span style={{ color: '#22C55E' }}>
        ↓ %8{' '}
        <span style={{ color: '#4B6E5E' }}>geçen aya göre</span>
      </span>
    ),
  },
  {
    id: 'peak',
    accentColor: '#F59E0B',
    icon: AlertTriangle,
    iconColor: '#F59E0B',
    label: 'En Yüksek Gün',
    value: 'Pazartesi',
    valueColor: '#F59E0B',
    sub: (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
      >
        ↑ Ortalama +%34 üzerinde
      </span>
    ),
  },
  {
    id: 'model',
    accentColor: '#14B8A6',
    icon: Cpu,
    iconColor: '#14B8A6',
    label: 'Model Doğruluğu — TabNet',
    value: '91.4%',
    valueColor: '#14B8A6',
    sub: (
      <div className="flex flex-col gap-1">
        <span style={{ color: '#4B6E5E' }}>MAE: 0.43 kg CO₂e</span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold w-fit"
          style={{ backgroundColor: 'rgba(20,184,166,0.12)', color: '#14B8A6' }}
        >
          Sequential Attention Aktif
        </span>
      </div>
    ),
  },
];

export default function AnalyticsKpiCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {CARDS.map(({ id, accentColor, icon: Icon, iconColor, label, value, valueColor, sub }) => (
        <div
          key={id}
          className="rounded-2xl p-6 transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          style={{
            backgroundColor: '#111816',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
            borderLeft: `4px solid ${accentColor}`,
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: '#4B6E5E' }}>
              {label}
            </p>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 32,
                height: 32,
                backgroundColor: `${accentColor}18`,
              }}
            >
              <Icon size={16} color={iconColor} strokeWidth={1.8} />
            </div>
          </div>

          {/* Value */}
          <p
            className="font-mono text-3xl font-extrabold leading-none mb-2"
            style={{ color: valueColor }}
          >
            {value}
          </p>

          {/* Sub */}
          <div className="text-xs">{sub}</div>
        </div>
      ))}
    </div>
  );
}
