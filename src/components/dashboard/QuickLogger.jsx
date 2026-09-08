import { useState } from 'react';
import { Bus, Zap, Leaf, Recycle, PlusCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'transport', icon: Bus,     emoji: '🚌', label: 'Ulaşım',      color: '#22C55E' },
  { id: 'energy',    icon: Zap,     emoji: '⚡', label: 'Enerji',      color: '#F59E0B' },
  { id: 'food',      icon: Leaf,    emoji: '🥦', label: 'Beslenme',    color: '#14B8A6' },
  { id: 'waste',     icon: Recycle, emoji: '♻️', label: 'Sıfır Atık', color: '#60A5FA' },
];

export default function QuickLogger({ onNavigateActivity }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      className="rounded-2xl p-6 h-full flex flex-col justify-between"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#86EFAC' }}>
            Hızlı Aktivite Ekle
          </h3>
          <p className="text-xs" style={{ color: '#4B6E5E' }}>
            Kategori seçip doğrudan kayıt formuna gidin
          </p>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-mono"
          style={{ backgroundColor: '#182420', color: '#4B6E5E', border: '1px solid #1E3A30' }}
        >
          4 Kategori
        </span>
      </div>

      {/* 2×2 Category Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(({ id, emoji, label, color }) => {
          const isHovered = hovered === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (onNavigateActivity) onNavigateActivity(id);
              }}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
              style={{
                height: '96px',
                backgroundColor: isHovered ? `${color}18` : '#182420',
                border: `1px solid ${isHovered ? color : '#1E3A30'}`,
                boxShadow: isHovered ? `0 0 16px ${color}28` : 'none',
              }}
            >
              <span className="text-3xl transition-transform duration-200" style={{ transform: isHovered ? 'scale(1.15)' : 'scale(1)' }}>
                {emoji}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold" style={{ color: isHovered ? color : '#F0FDF4' }}>
                  {label}
                </span>
                <PlusCircle size={11} color={color} className="opacity-70" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
