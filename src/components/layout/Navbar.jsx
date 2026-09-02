import { Leaf, Search, Bell, Settings, ChevronRight } from 'lucide-react';

const NAV_TABS = [
  { id: 'overview',    label: 'Ana Sayfa'           },
  { id: 'analytics',  label: 'Tahminsel Analizler'  },
  { id: 'activity',   label: 'Aktivite Ekle'        },
  { id: 'leaderboard',label: 'Liderlik Tablosu'     },
];

const WEEKLY_USED  = 34.2;

export default function Navbar({
  activeTab,
  onTabChange,
  weeklyLimit,
  ecoScore,
  onOpenSettings,
  onOpenBudget,
}) {
  const pct = Math.min(100, Math.round((WEEKLY_USED / weeklyLimit) * 100));

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-8"
      style={{
        height: '64px',
        backgroundColor: 'rgba(10,15,13,0.92)',
        borderBottom: '1px solid #1E3A30',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* ── LEFT: Logo + Divider + Nav tabs ── */}
      <div className="flex items-center gap-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, backgroundColor: 'rgba(34,197,94,0.15)' }}
          >
            <Leaf size={17} color="#22C55E" />
          </div>
          <span className="text-sm font-bold" style={{ color: '#F0FDF4' }}>
            EcoTrack AI
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ backgroundColor: '#1E3A30' }} />

        {/* Nav tabs */}
        <nav className="flex items-center gap-1">
          {NAV_TABS.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="rounded-lg text-sm transition-all duration-150"
                style={{
                  padding: '6px 14px',
                  backgroundColor: isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
                  color: isActive ? '#22C55E' : '#71717A',
                  border: isActive ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent',
                  fontWeight: isActive ? '500' : '400',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#F0FDF4';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#71717A';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── RIGHT: Budget capsule + tools + avatar ── */}
      <div className="flex items-center gap-3">
        {/* Weekly Carbon Budget Capsule */}
        <div
          className="flex items-center gap-3 rounded-xl px-3.5 py-2"
          style={{ backgroundColor: '#111816', border: '1px solid #1E3A30' }}
        >
          {/* Text + bar */}
          <div>
            <p className="text-xs font-mono" style={{ color: '#86EFAC' }}>
              <span className="font-bold">{WEEKLY_USED}</span>
              <span style={{ color: '#4B6E5E' }}> / {weeklyLimit} kg CO₂e</span>
            </p>
            {/* Mini progress bar */}
            <div
              className="rounded-full mt-1 overflow-hidden"
              style={{ height: '3px', width: '120px', backgroundColor: '#1E3A30' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct > 85
                    ? '#EF4444'
                    : pct > 60
                      ? 'linear-gradient(90deg,#22C55E,#F59E0B)'
                      : 'linear-gradient(90deg,#22C55E,#14B8A6)',
                }}
              />
            </div>
          </div>

          {/* Edit budget button */}
          <button
            onClick={onOpenBudget}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all"
            style={{ color: '#14B8A6', backgroundColor: 'transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(20,184,166,0.1)';
              e.currentTarget.style.color = '#22C55E';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#14B8A6';
            }}
            title="Karbon Limitini Düzenle"
          >
            Düzenle
            <ChevronRight size={11} />
          </button>
        </div>

        {/* Search */}
        <button
          className="flex items-center gap-2 rounded-lg px-3 text-xs transition-colors"
          style={{
            height: '34px',
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
            color: '#4B6E5E',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
        >
          <Search size={13} />
          <span>⌘K</span>
        </button>

        {/* Notification Bell */}
        <button
          className="relative flex items-center justify-center rounded-lg transition-colors"
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
          title="Bildirimler"
        >
          <Bell size={15} color="#86EFAC" />
          {/* Amber dot */}
          <span
            className="absolute rounded-full"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#F59E0B',
              top: '7px',
              right: '7px',
              border: '1.5px solid #0A0F0D',
            }}
          />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
          title="Ayarlar"
        >
          <Settings size={15} color="#4B6E5E" />
        </button>

        {/* User avatar */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-all"
          style={{ backgroundColor: '#111816', border: '1px solid #1E3A30' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
        >
          <div
            className="flex items-center justify-center rounded-full text-xs font-bold"
            style={{
              width: '26px',
              height: '26px',
              backgroundColor: '#22C55E',
              color: '#0A0F0D',
            }}
          >
            AY
          </div>
          <span className="text-sm font-medium" style={{ color: '#F0FDF4' }}>
            Ayşe Kaya
          </span>
        </button>
      </div>
    </header>
  );
}
