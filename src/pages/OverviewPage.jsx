import { useState, useEffect, useCallback } from 'react';
import KpiGrid            from '../components/dashboard/KpiGrid';
import EmissionTrendChart from '../components/dashboard/EmissionTrendChart';
import CategoryDonutChart from '../components/dashboard/CategoryDonutChart';
import AiMicroTaskCard    from '../components/dashboard/AiMicroTaskCard';
import QuickLogger        from '../components/dashboard/QuickLogger';
import { getDashboardSummary, applyRecommendation } from '../services/api';

export default function OverviewPage({ 
  onTaskComplete, 
  onNavigateActivity, 
  onNavigateLeaderboard,
  weeklyLimit = 56,
  ecoScore
}) {
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  // Dashboard özetini backend'den çek
  const fetchSummary = useCallback(async () => {
    try {
      const data = await getDashboardSummary(1);
      setSummary(data);
    } catch {
      // API geçici olarak ulaşılamazsa null kalır, bileşenler varsayılan değerleri kullanır
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // "Kabul Et" butonuna basıldığında öneriyi backend'de uygula
  async function handleApplyRecommendation(oneriId) {
    try {
      await applyRecommendation(oneriId, 1);
      await fetchSummary(); // Güncel istatistikleri ve yeni öneriyi getir
      onTaskComplete?.(50);
    } catch (err) {
      console.error('Öneri uygulanırken hata:', err);
    }
  }

  const effectiveLimit = summary?.haftalikLimit ?? weeklyLimit;
  const haftalikKarbon = summary?.haftalikToplamKarbon ?? 0;
  const butceYuzdesi   = summary?.butceYuzdesi ?? Math.round((haftalikKarbon / (effectiveLimit || 1)) * 100);
  const currentScore   = ecoScore ?? summary?.ecoPuan ?? 847;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Yükleme Durumu ── */}
      {loading && (
        <div
          className="rounded-2xl px-5 py-3 text-xs flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.15)',
            color: '#86EFAC',
          }}
        >
          <span>📡 Supabase ve .NET API'den canlı analitik veriler senkronize ediliyor…</span>
          <span className="animate-pulse">● Canlı</span>
        </div>
      )}

      {/* ── Satır 1: Canlı KPI Kartları ── */}
      <KpiGrid
        weeklyLimit={effectiveLimit}
        haftalikKarbon={haftalikKarbon}
        butceYuzdesi={butceYuzdesi}
        gunlukSeri={summary?.gunlukSeri               ?? 0}
        ecoPuan={currentScore}
        aktifRozet={summary?.aktifRozet               ?? 'İlk Adım'}
        toplamTasarruf={summary?.toplamTasarruf        ?? 0}
        onNavigateLeaderboard={onNavigateLeaderboard}
      />

      {/* ── Satır 2: Dinamik Grafikler (%60 / %40) ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 0.65fr' }}>
        <EmissionTrendChart trendData={summary?.haftalikTrend ?? []} />
        <CategoryDonutChart
          categoriesData={summary?.kategoriDagilimi ?? []}
          bugunkuKarbon={summary?.bugunkuKarbon ?? 0}
        />
      </div>

      {/* ── Satır 3: AI Görev + Hızlı Logger ── */}
      <div className="grid grid-cols-2 gap-4">
        <AiMicroTaskCard
          onComplete={onTaskComplete}
          oneri={summary?.gununOnerisi ?? null}
          onApply={handleApplyRecommendation}
        />
        <QuickLogger onNavigateActivity={onNavigateActivity} />
      </div>

    </div>
  );
}