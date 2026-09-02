import { Search, Bell, ChevronDown } from 'lucide-react';

const PAGE_TITLES = {
  overview:    'Ana Sayfa',
  analytics:   'Tahminsel Analizler',
  activity:    'Aktivite Ekle',
  leaderboard: 'Liderlik Tablosu',
  settings:    'Ayarlar',
};

export default function Header({ activeTab }) {
  const title = PAGE_TITLES[activeTab] ?? 'Ana Sayfa';

  return (
    <header
      className="fixed top-0 right-0 flex items-center justify-between px-8"
      style={{
        left: '240px',
        height: '64px',
        backgroundColor: '#0A0F0D',
        borderBottom: '1px solid #1E3A30',
        zIndex: 30,
      }}
    >
      {/* Left – Page Title */}
      <h1 className="text-xl font-bold" style={{ color: '#F0FDF4' }}>
        {title}
      </h1>

      {/* Right – Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-lg px-3"
          style={{
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
            height: '36px',
            width: '200px',
          }}
        >
          <Search size={14} color="#4B6E5E" />
          <span className="text-sm" style={{ color: '#4B6E5E' }}>
            ⌘K Ara...
          </span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative flex items-center justify-center rounded-lg transition-colors"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
        >
          <Bell size={16} color="#86EFAC" />
          {/* Amber dot */}
          <span
            className="absolute rounded-full"
            style={{
              width: '7px',
              height: '7px',
              backgroundColor: '#F59E0B',
              top: '7px',
              right: '7px',
              border: '1.5px solid #0A0F0D',
            }}
          />
        </button>

        {/* Date Range Pill */}
        <button
          className="flex items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors"
          style={{
            height: '36px',
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
            color: '#86EFAC',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
        >
          Bu Hafta
          <ChevronDown size={14} color="#4B6E5E" />
        </button>

        {/* Avatar */}
        <div
          className="flex items-center justify-center rounded-full text-xs font-bold cursor-pointer transition-all"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#22C55E',
            color: '#0A0F0D',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 0 2px #22C55E44')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
          AY
        </div>
      </div>
    </header>
  );
}
