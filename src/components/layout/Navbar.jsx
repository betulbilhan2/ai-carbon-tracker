import { useState, useEffect, useRef } from 'react';
import { Leaf, Search, Bell, Settings, ChevronRight, X } from 'lucide-react';

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const pct = Math.min(100, Math.round((WEEKLY_USED / weeklyLimit) * 100));

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

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
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex items-center justify-center rounded-lg transition-colors cursor-pointer"
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
          title="Hızlı Arama ve Komut Paleti (Ctrl + K)"
        >
          <Search size={15} color="#4B6E5E" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(v => !v)}
            className="relative flex items-center justify-center rounded-lg transition-colors cursor-pointer"
            style={{
              width: '34px',
              height: '34px',
              backgroundColor: notificationsOpen ? 'rgba(34,197,94,0.15)' : '#111816',
              border: `1px solid ${notificationsOpen ? '#22C55E' : '#1E3A30'}`,
            }}
            onMouseEnter={e => { if (!notificationsOpen) e.currentTarget.style.borderColor = '#22C55E'; }}
            onMouseLeave={e => { if (!notificationsOpen) e.currentTarget.style.borderColor = '#1E3A30'; }}
            title="Bildirimler"
          >
            <Bell size={15} color={notificationsOpen ? '#22C55E' : '#86EFAC'} />
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

          {/* Mini Dropdown Menu */}
          {notificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl p-4 shadow-2xl z-50 animate-fade-in"
              style={{
                backgroundColor: '#111816',
                border: '1px solid #1E3A30',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(34,197,94,0.1)',
              }}
            >
              <div className="flex items-center justify-between pb-2.5 mb-2.5" style={{ borderBottom: '1px solid #1E3A30' }}>
                <p className="text-xs font-bold" style={{ color: '#F0FDF4' }}>
                  Bildirimler & Hatırlatmalar
                </p>
                <span className="text-[10px] font-mono rounded px-1.5 py-0.5" style={{ backgroundColor: '#182420', color: '#22C55E' }}>
                  3 Yeni
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Notification 1 */}
                <div className="p-2.5 rounded-xl transition-colors" style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}>
                  <div className="flex items-start gap-2">
                    <span className="text-base">🎯</span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Haftalık Bütçe Durumu</p>
                      <p className="text-[11px] mt-0.5" style={{ color: '#4B6E5E' }}>
                        Hedefine yaklaşmaktasın: Kotanın %31'ini kullandın.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notification 2 */}
                <div className="p-2.5 rounded-xl transition-colors" style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}>
                  <div className="flex items-start gap-2">
                    <span className="text-base">🔥</span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Rozet Başarısı</p>
                      <p className="text-[11px] mt-0.5" style={{ color: '#4B6E5E' }}>
                        Harika seri! '14 Günlük Seri' rozetini başarıyla koruyorsun!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notification 3 */}
                <div className="p-2.5 rounded-xl transition-colors" style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}>
                  <div className="flex items-start gap-2">
                    <span className="text-base">🤖</span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Yapay Zekâ Önerisi</p>
                      <p className="text-[11px] mt-0.5" style={{ color: '#4B6E5E' }}>
                        Bugün toplu taşıma kullanarak 1.8 kg CO₂e tasarruf sağlayabilirsin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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

      {/* ── Quick Search Modal (Ctrl + K) ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-5 shadow-2xl animate-fade-in"
            style={{
              backgroundColor: '#111816',
              border: '1px solid #1E3A30',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(34,197,94,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E3A30]">
              <Search size={18} color="#22C55E" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Sayfa ara veya işlem seç (örn: Aktivite Ekle, Analizler)..."
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-[#4B6E5E] outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-[#4B6E5E] hover:text-zinc-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Links List */}
            <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto">
              {NAV_TABS.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onTabChange(tab.id);
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors"
                  style={{
                    backgroundColor: activeTab === tab.id ? 'rgba(34,197,94,0.12)' : '#182420',
                    color: activeTab === tab.id ? '#22C55E' : '#86EFAC',
                    border: `1px solid ${activeTab === tab.id ? '#22C55E' : '#1E3A30'}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
                  onMouseLeave={e => {
                    if (activeTab !== tab.id) e.currentTarget.style.borderColor = '#1E3A30';
                  }}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] font-mono text-[#4B6E5E]">Git →</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  onOpenBudget?.();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors"
                style={{ backgroundColor: '#182420', color: '#14B8A6', border: '1px solid #1E3A30' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#14B8A6')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
              >
                <span>🎯 Karbon Limiti / Hedef Bütçesini Düzenle</span>
                <span className="text-[11px] font-mono text-[#4B6E5E]">Aç →</span>
              </button>
            </div>

            {/* Footer tips */}
            <div className="mt-4 pt-3 border-t border-[#1E3A30] flex items-center justify-between text-[11px] text-[#4B6E5E]">
              <span>Kapatmak için <kbd className="px-1.5 py-0.5 rounded bg-[#182420] border border-[#1E3A30] text-zinc-300">ESC</kbd></span>
              <span>Açmak için <kbd className="px-1.5 py-0.5 rounded bg-[#182420] border border-[#1E3A30] text-zinc-300">Ctrl + K</kbd></span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
