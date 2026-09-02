import AnalyticsKpiCards       from '../components/analytics/AnalyticsKpiCards';
import DetailedPredictionChart  from '../components/analytics/DetailedPredictionChart';
import WeeklyStackedBarChart    from '../components/analytics/WeeklyStackedBarChart';
import ClusterRadarCard         from '../components/analytics/ClusterRadarCard';
import AnomalyAlertBanner       from '../components/analytics/AnomalyAlertBanner';

export default function AnalyticsPage({ onNavigateCoach }) {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Row 1: KPI Cards ── */}
      <AnalyticsKpiCards />

      {/* ── Row 2: Full-width Prediction Chart ── */}
      <DetailedPredictionChart />

      {/* ── Row 3: Stacked Bar + Radar (60/40) ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 0.72fr' }}>
        <WeeklyStackedBarChart />
        <ClusterRadarCard />
      </div>

      {/* ── Row 4: Anomaly Banner ── */}
      <AnomalyAlertBanner onNavigate={onNavigateCoach} />
    </div>
  );
}
