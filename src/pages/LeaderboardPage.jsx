import { useState, useEffect, useCallback } from 'react';
import ScopeToggle      from '../components/leaderboard/ScopeToggle';
import UserRankBanner   from '../components/leaderboard/UserRankBanner';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import BadgeShowcase    from '../components/leaderboard/BadgeShowcase';
import { getLeaderboard } from '../services/api';

export default function LeaderboardPage() {
  const [scope, setScope] = useState('university');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard();
      if (Array.isArray(data) && data.length > 0) {
        setLeaderboardData(data);
      }
    } catch (err) {
      console.warn('Liderlik tablosu canlı verisi alınamadı, yerel veriler kullanılacak:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Canlı listede Ayşe Kaya'nın (aktif kullanıcının) bilgilerini tespit et
  const currentUser = leaderboardData.find(u => u.aktifKullaniciMi);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Scope Toggle ── */}
      <div className="flex items-center justify-between">
        <ScopeToggle activeScope={scope} onChange={setScope} />
        {loading ? (
          <span className="text-xs font-mono animate-pulse" style={{ color: '#86EFAC' }}>
            📡 Sıralama güncelleniyor…
          </span>
        ) : (
          <span className="text-xs font-mono" style={{ color: '#4B6E5E' }}>
            ● Supabase Canlı Veritabanı
          </span>
        )}
      </div>

      {/* ── User rank banner (full width) ── */}
      <UserRankBanner
        scope={scope}
        userRank={currentUser?.siraNo}
        userScore={currentUser?.ecoPuan}
        totalUsers={leaderboardData.length > 0 ? leaderboardData.length : null}
      />

      {/* ── Two-column: Table (65%) + Badges (35%) ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 0.55fr', alignItems: 'start' }}>
        <LeaderboardTable
          scope={scope}
          liveData={leaderboardData.length > 0 ? leaderboardData : null}
        />
        <BadgeShowcase />
      </div>
    </div>
  );
}
