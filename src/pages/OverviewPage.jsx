import KpiGrid from '../components/dashboard/KpiGrid';
import EmissionTrendChart from '../components/dashboard/EmissionTrendChart';
import CategoryDonutChart from '../components/dashboard/CategoryDonutChart';
import AiMicroTaskCard from '../components/dashboard/AiMicroTaskCard';
import QuickLogger from '../components/dashboard/QuickLogger';

export default function OverviewPage({ onTaskComplete, onNavigateActivity, weeklyLimit = 56 }) {
  return (
    <div className="flex flex-col gap-6">
      {/* — Row 1: KPI Cards — */}
      <KpiGrid weeklyLimit={weeklyLimit} />

      {/* — Row 2: Charts (60/40) — */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 0.65fr' }}>
        <EmissionTrendChart />
        <CategoryDonutChart />
      </div>

      {/* — Row 3: AI Task + Quick Logger (50/50) — */}
      <div className="grid grid-cols-2 gap-4">
        <AiMicroTaskCard onComplete={onTaskComplete} />
        <QuickLogger onNavigateActivity={onNavigateActivity} />
      </div>
    </div>
  );
}