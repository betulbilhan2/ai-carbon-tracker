import { Leaf, ChevronRight, Home, BarChart2, PlusCircle, Trophy, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview',   icon: Home,       label: 'Ana Sayfa' },
  { id: 'analytics',  icon: BarChart2,   label: 'Tahminsel Analizler' },
  { id: 'activity',   icon: PlusCircle,  label: 'Aktivite Ekle' },
  { id: 'leaderboard',icon: Trophy,      label: 'Liderlik Tablosu' },
  { id: 'settings',   icon: Settings,    label: 'Ayarlar' },
];

const WEEKLY_USED = 34.2;
const WEEKLY_LIMIT = 56;
const BUDGET_PCT = Math.round((WEEKLY_USED / WEEKLY_LIMIT) * 100);

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col"
      style={{
        width: '240px',
        backgroundColor: '#0D1410',
        borderRight: '1px solid #1E3A30',
        zIndex: 40,
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 36, height: 36, backgroundColor: 'rgba(34,197,94,0.15)' }}
        >
          <Leaf size={20} color="#22C55E" />
        </div>
        <span className="text-base font-bold" style={{ color: '#F0FDF4' }}>
          EcoTrack AI
        </span>
      </div>

      {/* ── User Profile ── */}
      <div
        className="mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-3"
        style={{ backgroundColor: '#182420' }}
      >
        <div
          className="flex items-center justify-center rounded-full text-xs font-bold shrink-0"
          style={{
            width: 36,
            height: 36,
            backgroundColor: '#22C55E',
            color: '#0A0F0D',
          }}
        >
          AY
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#F0FDF4' }}>
            Ayşe Kaya
          </p>
          <p className="text-xs truncate" style={{ color: '#4B6E5E' }}>
            Öğrenci · ODTÜ
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 text-left relative overflow-hidden"
              style={{
                height: '48px',
                paddingLeft: '12px',
                paddingRight: '12px',
                backgroundColor: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                color: isActive ? '#22C55E' : '#4B6E5E',
                borderLeft: isActive ? '3px solid #22C55E' : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = '#86EFAC';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#4B6E5E';
                }
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Carbon Budget Bar ── */}
      <div
        className="mx-3 mb-4 rounded-xl p-4"
        style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: '#86EFAC' }}>
            Bu Hafta
          </p>
          <p className="text-xs font-mono" style={{ color: '#4B6E5E' }}>
            {BUDGET_PCT}%
          </p>
        </div>
        <p className="text-xs mb-2" style={{ color: '#F0FDF4' }}>
          <span className="font-mono font-bold">{WEEKLY_USED}</span>
          <span style={{ color: '#4B6E5E' }}> / {WEEKLY_LIMIT} kg CO₂e</span>
        </p>
        {/* Progress Bar */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: '6px', backgroundColor: '#1E3A30' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${BUDGET_PCT}%`,
              background: 'linear-gradient(90deg, #22C55E, #14B8A6)',
            }}
          />
        </div>
        <button
          className="mt-3 flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: '#14B8A6' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.color = '#14B8A6')}
        >
          Limiti Düzenle
          <ChevronRight size={12} />
        </button>
      </div>
    </aside>
  );
}
