import { USER_RANK_BY_SCOPE } from './leaderboardData';

export default function UserRankBanner({ scope = 'university', userRank = null, userScore = null, totalUsers = null }) {
  const scopeMeta = USER_RANK_BY_SCOPE[scope] ?? { rank: 2, total: 5 };

  // Üniversite kapsamında canlı veri varsa onu kullan, diğer kapsamlarda (Şehir, TR) kapsam istatistiğini göster
  const currentRank  = (scope === 'university' && userRank) ? userRank : scopeMeta.rank;
  const currentScore = userScore ?? 510;
  const totalCount   = (scope === 'university' && totalUsers) ? totalUsers : scopeMeta.total;

  const nextTierThreshold = Math.ceil((currentScore + 50) / 100) * 100;
  const ptsLeft = Math.max(0, nextTierThreshold - currentScore);
  const progressPct = Math.min(100, Math.round(((currentScore % 100) / 100) * 100) || 82);

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(34,197,94,0.25), 0 0 32px rgba(34,197,94,0.07)',
        background: 'linear-gradient(135deg, #111816 0%, #132018 100%)',
      }}
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-6">

        {/* Rank number */}
        <div className="shrink-0 text-center" style={{ minWidth: 64 }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#4B6E5E' }}>Sıran</p>
          <p
            className="font-mono font-extrabold leading-none"
            style={{ fontSize: 44, color: '#22C55E' }}
          >
            #{currentRank}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#4B6E5E' }}>
            / {totalCount.toLocaleString('tr-TR')}
          </p>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch" style={{ backgroundColor: '#1E3A30' }} />

        {/* User info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="flex items-center justify-center rounded-full font-bold text-base shrink-0"
            style={{
              width: 52,
              height: 52,
              backgroundColor: '#22C55E',
              color: '#0A0F0D',
              boxShadow: '0 0 16px rgba(34,197,94,0.3)',
            }}
          >
            AY
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base truncate" style={{ color: '#F0FDF4' }}>
              Ayşe Kaya
            </p>
            <p className="text-xs truncate" style={{ color: '#4B6E5E' }}>
              ODTÜ · Bilgisayar Mühendisliği
            </p>
          </div>
        </div>

        {/* Score & weekly */}
        <div className="shrink-0 text-right">
          <p
            className="font-mono text-2xl font-extrabold"
            style={{ color: '#14B8A6' }}
          >
            {currentScore.toLocaleString('tr-TR')} pts
          </p>
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold mt-1"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
          >
            ↑ Canlı Sıralama
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium" style={{ color: '#4B6E5E' }}>
            Bir sonraki başarı rozetine kalan etki puanı
          </p>
          <p className="text-xs font-mono" style={{ color: '#22C55E' }}>
            {ptsLeft} puan kaldı
          </p>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: '7px', backgroundColor: '#1E3A30' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #22C55E, #14B8A6)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5" style={{ color: '#4B6E5E' }}>
          <span>{currentScore} pts</span>
          <span>Hedef: {nextTierThreshold} pts</span>
        </div>
      </div>
    </div>
  );
}
