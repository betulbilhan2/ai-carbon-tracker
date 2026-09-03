import { useState, useEffect, useCallback } from 'react';
import KpiGrid            from '../components/dashboard/KpiGrid';
import EmissionTrendChart from '../components/dashboard/EmissionTrendChart';
import CategoryDonutChart from '../components/dashboard/CategoryDonutChart';
import AiMicroTaskCard    from '../components/dashboard/AiMicroTaskCard';
import QuickLogger        from '../components/dashboard/QuickLogger';
import { getDashboardSummary, applyRecommendation } from '../services/api';

export default function OverviewPage({ onTaskComplete, onNavigateActivity, weeklyLimit = 56 }) {
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  // Dashboard özetini backend'den çek
  const fetchSummary = useCallback(async () => {
    try {
      const data = await getDashboardSummary(1);
      setSummary(data);
    } catch {
      // API mevcut değilse null bırak — bileşenler varsayılan değerleriyle çalışır
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
    await applyRecommendation(oneriId, 1);
    // Özeti yenile — yeni öneri veya güncel puan gelsin
    fetchSummary();
    onTaskComplete?.();
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Yükleme İndikatörü (yalnızca ilk yüklemede) ── */}
      {loading && (
        <div
          className="rounded-2xl px-5 py-3 text-sm"
          style={{
            backgroundColor: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.15)',
            color: '#4B6E5E',
          }}
        >
          📡 Dashboard verisi yükleniyor…
        </div>
      )}

      {/* ── Satır 1: KPI Kartları (canlı veri) ── */}
      <KpiGrid
        weeklyLimit={weeklyLimit}
        haftalikKarbon={summary?.haftalikToplamKarbon ?? 0}
        butceYuzdesi={summary?.butceYuzdesi           ?? 0}
        gunlukSeri={summary?.gunlukSeri               ?? 0}
        ecoPuan={summary?.ecoPuan                     ?? 0}
        aktifRozet={summary?.aktifRozet               ?? 'İlk Adım'}
        toplamTasarruf={summary?.toplamTasarruf        ?? 0}
      />

      {/* ── Satır 2: Grafikler (%60/%40) ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 0.65fr' }}>
        <EmissionTrendChart />
        <CategoryDonutChart />
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