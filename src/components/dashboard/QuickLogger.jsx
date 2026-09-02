import { useState } from 'react';
import { Bus, Zap, Leaf, Recycle, Pencil } from 'lucide-react';

const CATEGORIES = [
  { id: 'transport', icon: Bus,     emoji: '🚌', label: 'Ulaşım',      color: '#22C55E' },
  { id: 'energy',    icon: Zap,     emoji: '⚡', label: 'Enerji',      color: '#F59E0B' },
  { id: 'food',      icon: Leaf,    emoji: '🥦', label: 'Beslenme',    color: '#14B8A6' },
  { id: 'waste',     icon: Recycle, emoji: '♻️', label: 'Sıfır Atık', color: '#60A5FA' },
];

export default function QuickLogger({ onNavigateActivity }) {
  const [active, setActive] = useState(null);

  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#86EFAC' }}>
        Hızlı Aktivite Ekle
      </h3>

      {/* 2×2 Category Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(({ id, icon: Icon, emoji, label, color }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => {
                setActive(id);
                // navigate to activity tab if provided
                if (onNavigateActivity) onNavigateActivity();
              }}
              className="flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-200"
              style={{
                height: '96px',
                backgroundColor: isActive ? `${color}18` : '#182420',
                border: `1px solid ${isActive ? color : '#1E3A30'}`,
                boxShadow: isActive ? `0 0 16px ${color}22` : 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.backgroundColor = `${color}0D`;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#1E3A30';
                  e.currentTarget.style.backgroundColor = '#182420';
                }
              }}
            >
              <span className="text-2xl">{emoji}</span>
              <span
                className="text-xs font-semibold"
                style={{ color: isActive ? color : '#86EFAC' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Last Activity Summary */}
      <div
        className="flex items-center justify-between mt-5 rounded-xl px-4 py-3"
        style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: '#4B6E5E' }}>
            Son Aktivite
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#86EFAC' }}>
            🚗 Arabayla 47 km —{' '}
            <span className="font-mono font-bold" style={{ color: '#22C55E' }}>
              6.8 kg CO₂e
            </span>
            <span style={{ color: '#4B6E5E' }}>, bugün 14:30</span>
          </p>
        </div>
        <button
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{ width: 32, height: 32, backgroundColor: '#0A0F0D', border: '1px solid #1E3A30' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
          title="Düzenle"
        >
          <Pencil size={13} color="#4B6E5E" />
        </button>
      </div>
    </div>
  );
}
