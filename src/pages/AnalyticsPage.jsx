import { useState, useEffect, useCallback } from 'react';
import AnalyticsKpiCards       from '../components/analytics/AnalyticsKpiCards';
import DetailedPredictionChart  from '../components/analytics/DetailedPredictionChart';
import WeeklyStackedBarChart    from '../components/analytics/WeeklyStackedBarChart';
import ClusterRadarCard         from '../components/analytics/ClusterRadarCard';
import AnomalyAlertBanner       from '../components/analytics/AnomalyAlertBanner';
import AiForecastCard           from '../components/analytics/AiForecastCard';
import WhatIfSimulator          from '../components/analytics/WhatIfSimulator';
import { getCarbonForecast }    from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsPage({ onNavigateCoach }) {
  const { user } = useAuth();
  const userId = user?.kullaniciId || 1;
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = useCallback(async () => {
    try {
      const data = await getCarbonForecast(userId);
      if (data) {
        setForecast(data);
      }
    } catch (err) {
      console.warn('Tahmin verisi alınırken fallback devrede:', err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Üst Bilgi / Canlı Durum ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#F0FDF4' }}>
            Tahminsel Analizler ve Gelecek Projeksiyonları
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#4B6E5E' }}>
            TabNet Derin Öğrenme Modeli ve Fogg B=MAP Davranışsal Karar Destek Sistemi
          </p>
        </div>
        {loading ? (
          <span className="text-xs font-mono animate-pulse" style={{ color: '#86EFAC' }}>
            📡 Model tahminleri hesaplanıyor…
          </span>
        ) : (
          <span className="text-xs font-mono" style={{ color: '#14B8A6' }}>
            ● Python AI & .NET 8 Canlı Entegrasyon
          </span>
        )}
      </div>

      {/* ── Row 1: Yapay Zekâ Ay Sonu Projeksiyon Kartı ── */}
      <AiForecastCard forecast={forecast} />

      {/* ── Row 2: İstatistik KPI Kartları ── */}
      <AnalyticsKpiCards />

      {/* ── Row 3: İnteraktif Senaryo Simülatörü (What-If) ── */}
      <WhatIfSimulator initialWeekly={forecast?.haftalik_ortalama ?? 25.0} />

      {/* ── Row 4: Detaylı TabNet & Anormallik Grafiği ── */}
      <DetailedPredictionChart />

      {/* ── Row 5: Stacked Bar + Küme Radar (60/40) ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 0.72fr' }}>
        <WeeklyStackedBarChart />
        <ClusterRadarCard />
      </div>

      {/* ── Row 6: Anormallik Bildirim Bandı ── */}
      <AnomalyAlertBanner onNavigate={onNavigateCoach} />
    </div>
  );
}
