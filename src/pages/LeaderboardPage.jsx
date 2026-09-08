import { useState, useEffect, useCallback } from 'react';
import ScopeToggle      from '../components/leaderboard/ScopeToggle';
import UserRankBanner   from '../components/leaderboard/UserRankBanner';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import BadgeShowcase    from '../components/leaderboard/BadgeShowcase';
import { getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState('university');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.kullaniciId ?? user?.kullanici_id;
  const currentUserName = (user?.ad_soyad || user?.adSoyad || '').trim().toLowerCase();
  const currentUserEmail = (user?.email || user?.eposta || '').trim().toLowerCase();

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard(currentUserId);
      if (Array.isArray(data) && data.length > 0) {
        setLeaderboardData(data);
      }
    } catch (err) {
      console.warn('Liderlik tablosu canlı verisi alınamadı, yerel veriler kullanılacak:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Canlı listede aktif kullanıcının bilgilerini tespit et
  const currentUser = leaderboardData.find(u =>
    (currentUserId && u.kullaniciId === currentUserId) ||
    (currentUserEmail && u.eposta && u.eposta.toLowerCase() === currentUserEmail) ||
    (currentUserName && u.adSoyad && u.adSoyad.trim().toLowerCase() === currentUserName) ||
    u.aktifKullaniciMi
  );

  const totalCount = leaderboardData.length > 0
    ? (currentUser ? leaderboardData.length : leaderboardData.length + 1)
    : null;

  const userRank = currentUser?.siraNo ?? (leaderboardData.length > 0 ? leaderboardData.length + 1 : null);
  const userScore = currentUser?.ecoPuan ?? (user?.ecoScore ?? user?.ecoPuan ?? 100);

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
        userRank={userRank}
        userScore={userScore}
        totalUsers={totalCount}
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
