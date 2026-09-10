import { useState, useMemo } from 'react';
import { Lock, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_BADGES = [
  {
    id: 'first_step',
    emoji: '🌱',
    name: 'İlk Adım',
    description: 'İlk aktivite kaydedildi.',
    status: 'earned',
    points: 50,
    glowColor: '#22C55E',
  },
  {
    id: 'planet_friend',
    emoji: '🌍',
    name: 'Gezegen Dostu',
    description: '10 kg CO₂e tasarruf sağlandı.',
    status: 'earned',
    points: 120,
    glowColor: '#14B8A6',
  },
  {
    id: 'waste_warrior',
    emoji: '♻️',
    name: 'Atık Savaşçısı',
    description: 'Sıfır tek kullanımlık plastik.',
    status: 'earned',
    points: 90,
    glowColor: '#22C55E',
  },
  {
    id: 'streak_14',
    emoji: '🔥',
    name: '14 Günlük Seri',
    description: 'Her gün aktivite kaydet.',
    status: 'progress',
    points: 150,
    progress: { current: 12, total: 14 },
    glowColor: '#F59E0B',
  },
  {
    id: 'green_commuter',
    emoji: '🚲',
    name: 'Yeşil Komuter',
    description: '50 km bisiklet / toplu taşıma kullan.',
    status: 'locked',
    points: 100,
    glowColor: '#4B6E5E',
  },
  {
    id: 'summit_club',
    emoji: '🏆',
    name: 'Zirve Kulübü',
    description: 'Üniversite sıralamasında 1. sıraya (Zirveye) yerleş.',
    status: 'locked',
    points: 250,
    glowColor: '#4B6E5E',
  },
];

function BadgeCard({ badge, onSelect }) {
  const { emoji, name, description, status, progress, glowColor, points } = badge;

  const isEarned   = status === 'earned';
  const isProgress = status === 'progress';
  const isLocked   = status === 'locked';

  const pct = isProgress && progress ? Math.min(100, Math.round(((progress.current || 4) / 14) * 100)) : 0;

  return (
    <div
      onClick={() => onSelect(badge)}
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.99] select-none group"
      style={{
        backgroundColor: isLocked ? '#0D1410' : '#111816',
        boxShadow: isEarned
          ? `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px ${glowColor}44, 0 0 18px ${glowColor}18`
          : isProgress
            ? `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #F59E0B44, 0 0 14px #F59E0B10`
            : '0 0 0 1px #1E3A30',
        opacity: isLocked ? 0.65 : 1,
        filter: isLocked ? 'grayscale(0.6)' : 'none',
      }}
    >
      {/* Emoji + Status tag */}
      <div className="flex items-start justify-between">
        <span className="text-3xl group-hover:scale-110 transition-transform">{isLocked ? '🔒' : emoji}</span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: isEarned
              ? 'rgba(34,197,94,0.15)'
              : isProgress
                ? 'rgba(245,158,11,0.15)'
                : '#1E3A30',
            color: isEarned
              ? '#22C55E'
              : isProgress
                ? '#F59E0B'
                : '#4B6E5E',
          }}
        >
          {isEarned ? 'Kazanıldı ✓' : isProgress ? 'Devam Ediyor' : 'Kilitli'}
        </span>
      </div>

      {/* Name + description */}
      <div>
        <div className="flex items-center justify-between">
          <p
            className="text-sm font-semibold"
            style={{ color: isLocked ? '#86EFAC' : '#F0FDF4' }}
          >
            {name}
          </p>
          <span className="text-[11px] font-mono font-bold" style={{ color: '#14B8A6' }}>
            +{points} pts
          </span>
        </div>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#4B6E5E' }}>
          {description}
        </p>
      </div>

      {/* Progress bar (only for in-progress badges) */}
      {isProgress && progress && (
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#4B6E5E' }}>
            <span>{progress.current || 4} / 14 Gün</span>
            <span style={{ color: '#F59E0B' }}>{pct}%</span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '5px', backgroundColor: '#1E3A30' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #F59E0B, #22C55E)',
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Lock hint */}
      {isLocked && (
        <div className="flex items-center gap-1.5">
          <Lock size={11} color="#4B6E5E" />
          <span className="text-xs" style={{ color: '#4B6E5E' }}>Detay için tıkla</span>
        </div>
      )}
    </div>
  );
}

export default function BadgeShowcase() {
  const { user } = useAuth();
  const [selectedToast, setSelectedToast] = useState(null);

  const streakVal = Number(user?.currentStreak || user?.streak || user?.gunlukSeri || 4);

  const badges = useMemo(() => {
    return INITIAL_BADGES.map(b => {
      if (b.id === 'streak_14') {
        const isComplete = streakVal >= 14;
        return {
          ...b,
          status: isComplete ? 'earned' : 'progress',
          progress: { current: streakVal, total: 14 },
        };
      }
      return b;
    });
  }, [streakVal]);

  const earned = badges.filter(b => b.status === 'earned').length;
  const total  = badges.length;

  const handleBadgeClick = (badge) => {
    setSelectedToast(badge);
    setTimeout(() => {
      setSelectedToast(prev => (prev?.id === badge.id ? null : prev));
    }, 4000);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden relative flex flex-col"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1E3A30' }}>
        <h3 className="text-sm font-semibold" style={{ color: '#86EFAC' }}>
          Sürdürülebilirlik Rozetlerin
        </h3>
        <span
          className="text-xs rounded-full px-3 py-0.5 font-mono font-semibold"
          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          {earned} / {total} Kazanıldı
        </span>
      </div>

      {/* Badge Toast Notification */}
      {selectedToast && (
        <div
          className="mx-5 mt-4 p-3 rounded-xl flex items-center gap-3 animate-fade-in text-xs"
          style={{
            backgroundColor: selectedToast.status === 'earned' ? 'rgba(34,197,94,0.12)' : selectedToast.status === 'progress' ? 'rgba(245,158,11,0.12)' : 'rgba(20,184,166,0.12)',
            border: `1px solid ${selectedToast.status === 'earned' ? '#22C55E' : selectedToast.status === 'progress' ? '#F59E0B' : '#14B8A6'}`,
            color: '#F0FDF4',
          }}
        >
          <span className="text-2xl">{selectedToast.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#86EFAC]">{selectedToast.name}</span>
              <span className="font-mono text-[10px] text-[#14B8A6] font-semibold">+{selectedToast.points} pts</span>
              <span
                className="text-[10px] px-1.5 py-0.2 rounded"
                style={{
                  backgroundColor: selectedToast.status === 'earned' ? '#22C55E22' : '#1E3A30',
                  color: selectedToast.status === 'earned' ? '#22C55E' : '#4B6E5E',
                }}
              >
                {selectedToast.status === 'earned' ? 'Kazanıldı ✓' : selectedToast.status === 'progress' ? 'Devam Ediyor' : 'Kilitli'}
              </span>
            </div>
            <p className="text-[11px] text-[#86EFAC]/80 mt-0.5 leading-snug">
              {selectedToast.description}
            </p>
          </div>
        </div>
      )}

      {/* Badge grid */}
      <div className="p-5 grid grid-cols-2 gap-3">
        {badges.map(b => (
          <BadgeCard key={b.id} badge={b} onSelect={handleBadgeClick} />
        ))}
      </div>
    </div>
  );
}
