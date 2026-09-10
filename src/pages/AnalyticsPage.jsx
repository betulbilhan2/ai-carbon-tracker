import { useState, useEffect, useCallback } from 'react';
import AnalyticsKpiCards       from '../components/analytics/AnalyticsKpiCards';
import DetailedPredictionChart  from '../components/analytics/DetailedPredictionChart';
import WeeklyStackedBarChart    from '../components/analytics/WeeklyStackedBarChart';
import ClusterRadarCard         from '../components/analytics/ClusterRadarCard';
import AnomalyAlertBanner       from '../components/analytics/AnomalyAlertBanner';
import AiForecastCard           from '../components/analytics/AiForecastCard';
import WhatIfSimulator          from '../components/analytics/WhatIfSimulator';
import { getCarbonForecast, getDashboardSummary, getRecentActivities } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsPage({ onNavigateCoach }) {
  const { user, latestAiRecommendation } = useAuth();
  const userId = user?.kullaniciId || 1;
  const [forecast, setForecast] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. latestAiRecommendation null ise güvenli varsayılan şablon ata
  const aiData = latestAiRecommendation || {
    actualWeeklyKg: 25.4,
    expectedWeeklyKg: 22.0,
    deviationScore: 3.4,
    clusterId: 1,
    recommendationId: 1,
    simulatedSavingKgWeek: 3.2,
    message: "Tahmin motoru hazırlanıyor veya profil verileri analiz ediliyor."
  };

  const fetchData = useCallback(async () => {
    try {
      const [forecastRes, summaryRes, activitiesRes] = await Promise.allSettled([
        getCarbonForecast(userId),
        getDashboardSummary(userId),
        getRecentActivities(userId),
      ]);

      if (forecastRes.status === 'fulfilled' && forecastRes.value) {
        setForecast(forecastRes.value);
      }
      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value);
      }
      if (activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value)) {
        setActivities(activitiesRes.value);
      }
    } catch (err) {
      console.warn('Tahmin ve aktivite verileri alınırken fallback devrede:', err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Model haftalık ortalaması
  const effectiveWeekly = Number(aiData?.actualWeeklyKg ?? forecast?.haftalik_ortalama ?? 25.0);

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
            📡 Model tahminleri ve canlı veriler senkronize ediliyor…
          </span>
        ) : (
          <span className="text-xs font-mono" style={{ color: '#14B8A6' }}>
            ● TabNet Canlı Model & .NET 8 Entegrasyonu
          </span>
        )}
      </div>

      {/* ── 1. Üst Projeksiyon Kartı (aiData ile dinamik hesaplamalar) ── */}
      <AiForecastCard 
        forecast={forecast} 
        latestAiRecommendation={aiData} 
      />

      {/* ── 2. İstatistik KPI Kartları (Gerçek veriler) ── */}
      <AnalyticsKpiCards 
        summary={summary} 
        latestAiRecommendation={aiData} 
      />

      {/* ── 3. İnteraktif Senaryo Simülatörü (What-If: simulatedSavingKgWeek * 52) ── */}
      <WhatIfSimulator 
        initialWeekly={effectiveWeekly} 
        latestAiRecommendation={aiData} 
      />

      {/* ── 4. Gerçekleşen vs. TabNet Tahmini Grafiği (Gerçek aktiviteler + expectedWeeklyKg / 7) ── */}
      <DetailedPredictionChart 
        summary={summary} 
        activities={activities || []} 
        latestAiRecommendation={aiData} 
      />

      {/* ── 5. Stacked Bar + Küme Radar (60/40) ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 0.72fr' }}>
        <WeeklyStackedBarChart 
          summary={summary} 
          activities={activities || []} 
          latestAiRecommendation={aiData} 
        />
        <ClusterRadarCard latestAiRecommendation={aiData} />
      </div>

      {/* ── 6. Davranışsal Anormallik & Sapma Bildirim Bandı (Model message ve sapma skoru) ── */}
      <AnomalyAlertBanner 
        onNavigate={onNavigateCoach} 
        latestAiRecommendation={aiData} 
      />
    </div>
  );
}
