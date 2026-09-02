import { Lock } from 'lucide-react';

const BADGES = [
  {
    id: 'first_step',
    emoji: '🌱',
    name: 'İlk Adım',
    description: 'İlk aktivite kaydedildi.',
    status: 'earned',
    glowColor: '#22C55E',
  },
  {
    id: 'planet_friend',
    emoji: '🌍',
    name: 'Gezegen Dostu',
    description: '10 kg CO₂e tasarruf sağlandı.',
    status: 'earned',
    glowColor: '#14B8A6',
  },
  {
    id: 'waste_warrior',
    emoji: '♻️',
    name: 'Atık Savaşçısı',
    description: 'Sıfır tek kullanımlık plastik.',
    status: 'earned',
    glowColor: '#22C55E',
  },
  {
    id: 'streak_14',
    emoji: '🔥',
    name: '14 Günlük Seri',
    description: 'Her gün aktivite kaydet.',
    status: 'progress',
    progress: { current: 12, total: 14 },
    glowColor: '#F59E0B',
  },
  {
    id: 'green_commuter',
    emoji: '🚲',
    name: 'Yeşil Komuter',
    description: '50 km bisiklet / toplu taşıma kullan.',
    status: 'locked',
    glowColor: '#4B6E5E',
  },
  {
    id: 'summit_club',
    emoji: '🏆',
    name: 'Zirve Kulübü',
    description: 'Üniversite sıralamasında ilk 10\'a gir.',
    status: 'locked',
    glowColor: '#4B6E5E',
  },
];

function BadgeCard({ badge }) {
  const { emoji, name, description, status, progress, glowColor } = badge;

  const isEarned   = status === 'earned';
  const isProgress = status === 'progress';
  const isLocked   = status === 'locked';

  const pct = isProgress && progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200"
      style={{
        backgroundColor: isLocked ? '#0D1410' : '#111816',
        boxShadow: isEarned
          ? `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px ${glowColor}44, 0 0 18px ${glowColor}18`
          : isProgress
            ? `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #F59E0B44, 0 0 14px #F59E0B10`
            : '0 0 0 1px #1E3A30',
        opacity: isLocked ? 0.5 : 1,
        filter: isLocked ? 'grayscale(0.7)' : 'none',
      }}
    >
      {/* Emoji + Status tag */}
      <div className="flex items-start justify-between">
        <span className="text-3xl">{isLocked ? '🔒' : emoji}</span>
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
        <p
          className="text-sm font-semibold"
          style={{ color: isLocked ? '#4B6E5E' : '#F0FDF4' }}
        >
          {name}
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#4B6E5E' }}>
          {description}
        </p>
      </div>

      {/* Progress bar (only for in-progress badges) */}
      {isProgress && progress && (
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#4B6E5E' }}>
            <span>{progress.current} / {progress.total} Gün</span>
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
          <span className="text-xs" style={{ color: '#4B6E5E' }}>Koşulları tamamla</span>
        </div>
      )}
    </div>
  );
}

export default function BadgeShowcase() {
  const earned   = BADGES.filter(b => b.status === 'earned').length;
  const total    = BADGES.length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
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

      {/* Badge grid */}
      <div className="p-5 grid grid-cols-2 gap-3">
        {BADGES.map(b => <BadgeCard key={b.id} badge={b} />)}
      </div>
    </div>
  );
}
