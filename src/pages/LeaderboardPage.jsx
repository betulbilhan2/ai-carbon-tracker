import { useState, useEffect, useCallback, useMemo } from 'react';
import ScopeToggle      from '../components/leaderboard/ScopeToggle';
import UserRankBanner   from '../components/leaderboard/UserRankBanner';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import BadgeShowcase    from '../components/leaderboard/BadgeShowcase';
import { ALL_USERS }    from '../components/leaderboard/leaderboardData';
import { getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState('university');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.kullaniciId ?? user?.kullanici_id ?? 9999;
  const currentUserName = (user?.ad_soyad || user?.adSoyad || 'Kullanıcı').trim();
  const currentUserUniv = (user?.universite || user?.Universite || user?.university || 'FÜ').trim();
  const currentUserCity = (user?.sehir || user?.Sehir || user?.city || 'Elazığ').trim();
  const currentUserDept = (user?.bolum || user?.Bolum || user?.department || 'Yazılım Müh.').trim();
  const userScore = Number(user?.ecoScore ?? user?.ecoPuan ?? 100);

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

  // ── Tüm Kullanıcılar Havuzunu Hazırla (Canlı Veritabanı + Seed) ──
  const allUsers = useMemo(() => {
    const list = [...ALL_USERS];

    // Canlı veritabanı kullanıcılarını ekle/güncelle
    if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
      leaderboardData.forEach(item => {
        const idx = list.findIndex(u =>
          (item.kullaniciId && u.id === item.kullaniciId) ||
          (item.adSoyad && u.name.toLowerCase() === item.adSoyad.toLowerCase())
        );
        const mapped = {
          id: item.kullaniciId,
          kullaniciId: item.kullaniciId,
          name: item.adSoyad,
          university: item.universite?.split('·')[0]?.trim() || item.universite || 'FÜ',
          department: item.universite?.split('·')[1]?.trim() || 'Mühendislik',
          city: item.sehir || (item.universite?.toLowerCase().includes('fırat') ? 'Elazığ' : 'Ankara'),
          score: item.ecoPuan,
          weeklyChange: item.haftalikDegisim ?? +18,
          badge: item.rozetEmoji || '🌱',
        };
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...mapped };
        } else {
          list.push(mapped);
        }
      });
    }

    // Aktif kullanıcının güncel verilerini enjekte et
    const activeUserIndex = list.findIndex(u =>
      (currentUserId && (u.id === currentUserId || u.kullaniciId === currentUserId)) ||
      u.name.toLowerCase() === currentUserName.toLowerCase()
    );

    const activeUserObj = {
      id: currentUserId,
      kullaniciId: currentUserId,
      name: currentUserName,
      university: currentUserUniv,
      department: currentUserDept,
      city: currentUserCity,
      score: userScore,
      weeklyChange: +124,
      badge: '🌍',
      isUser: true,
    };

    if (activeUserIndex !== -1) {
      list[activeUserIndex] = { ...list[activeUserIndex], ...activeUserObj };
    } else {
      list.push(activeUserObj);
    }

    return list;
  }, [leaderboardData, currentUserId, currentUserName, currentUserUniv, currentUserDept, currentUserCity, userScore]);

  // ── Kapsama Göre Dinamik Filtreleme ──
  const filteredUsers = useMemo(() => {
    let result = [];
    const targetUniv = currentUserUniv.toLowerCase();
    const targetCity = currentUserCity.toLowerCase();
    const isFu = targetUniv.includes('fırat') || targetUniv.includes('fü');
    const isElazig = targetCity === 'elazığ' || targetCity === 'elazig';

    if (scope === 'university') {
      // 1. "Üniversitem (FÜ)" seçildiğinde: Yalnızca kullanıcının üniversitesine ait kullanıcılar
      result = allUsers.filter(u => {
        const uUniv = (u.university || '').toLowerCase();
        if (isFu) {
          return uUniv.includes('fırat') || uUniv.includes('fü');
        }
        return uUniv.includes(targetUniv) || targetUniv.includes(uUniv);
      });
    } else if (scope === 'city') {
      // 2. "Şehrim (Elazığ)" seçildiğinde: Yalnızca kullanıcının şehrine veya üniversitesine ait kullanıcılar
      result = allUsers.filter(u => {
        const uCity = (u.city || '').toLowerCase();
        const uUniv = (u.university || '').toLowerCase();
        if (isElazig) {
          return uCity === 'elazığ' || uCity === 'elazig' || uUniv.includes('fırat') || uUniv.includes('fü');
        }
        return uCity === targetCity || uUniv.includes(targetUniv);
      });
    } else {
      // 3. "Türkiye Geneli" seçildiğinde: Tüm kullanıcılar
      result = [...allUsers];
    }

    // Aktif kullanıcının listede yer aldığından emin ol
    if (!result.some(u => u.isUser || u.id === currentUserId)) {
      result.push({
        id: currentUserId,
        kullaniciId: currentUserId,
        name: currentUserName,
        university: currentUserUniv,
        department: currentUserDept,
        city: currentUserCity,
        score: userScore,
        weeklyChange: +124,
        badge: '🌍',
        isUser: true,
      });
    }

    // Puan sırasına göre azalan sırala
    result.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Sıralama numarasını ve kurum alanını hesapla
    return result.map((u, idx) => ({
      ...u,
      rank: idx + 1,
      institution: u.institution || `${u.university} · ${u.department}`,
    }));
  }, [allUsers, scope, currentUserUniv, currentUserCity, currentUserDept, currentUserId, currentUserName, userScore]);

  // Aktif kullanıcının sırası ve toplam kullanıcı sayısı
  const userIndex = filteredUsers.findIndex(u => u.isUser || u.id === currentUserId || u.kullaniciId === currentUserId);
  const userRank = userIndex !== -1 ? userIndex + 1 : 1;
  const totalCount = filteredUsers.length;

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
          rows={filteredUsers}
          totalCount={totalCount}
        />
        <BadgeShowcase />
      </div>
    </div>
  );
}
