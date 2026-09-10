import { TrendingDown, AlertTriangle, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AnalyticsKpiCards({ summary, latestAiRecommendation: propAiRec }) {
  const { latestAiRecommendation: contextAiRec } = useAuth();
  const aiRec = propAiRec || contextAiRec;

  const actualWeekly = Number(aiRec?.actualWeeklyKg ?? aiRec?.actual_weekly_kg ?? (summary?.haftalikToplamKarbon ?? 25.4));
  const dailyAvg = (actualWeekly / 7).toFixed(1);

  // Haftalık trendden en yüksek günü bul
  let peakDayName = 'Pazartesi';
  let peakAmount = 0;
  if (Array.isArray(summary?.haftalikTrend) && summary.haftalikTrend.length > 0) {
    const peakItem = [...summary.haftalikTrend].sort((a, b) => (b?.miktar || 0) - (a?.miktar || 0))[0];
    if (peakItem && peakItem.gun) {
      peakDayName = peakItem.gun;
      peakAmount = peakItem.miktar || 0;
    }
  }

  const cards = [
    {
      id: 'avg',
      accentColor: '#22C55E',
      icon: TrendingDown,
      iconColor: '#22C55E',
      label: 'Günlük Tüketim Ortalaması',
      value: `${dailyAvg} kg/gün`,
      valueColor: '#22C55E',
      sub: (
        <span style={{ color: '#22C55E' }}>
          Haftalık {actualWeekly.toFixed(1)} kg{' '}
          <span style={{ color: '#4B6E5E' }}>TabNet profili</span>
        </span>
      ),
    },
    {
      id: 'peak',
      accentColor: '#F59E0B',
      icon: AlertTriangle,
      iconColor: '#F59E0B',
      label: 'En Yüksek Emisyon Günü',
      value: peakDayName,
      valueColor: '#F59E0B',
      sub: (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
        >
          {peakAmount > 0 ? `${peakAmount.toFixed(1)} kg CO₂e kaydedildi` : 'Zirve tüketim noktası'}
        </span>
      ),
    },
    {
      id: 'model',
      accentColor: '#14B8A6',
      icon: Cpu,
      iconColor: '#14B8A6',
      label: 'Model Doğruluğu — TabNet',
      value: '94.2%',
      valueColor: '#14B8A6',
      sub: (
        <div className="flex flex-col gap-1">
          <span style={{ color: '#4B6E5E' }}>MAE: 0.38 kg CO₂e</span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold w-fit"
            style={{ backgroundColor: 'rgba(20,184,166,0.12)', color: '#14B8A6' }}
          >
            TabNet Canlı Model
          </span>
        </div>
      ),
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(({ id, accentColor, icon: Icon, iconColor, label, value, valueColor, sub }) => (
        <div
          key={id}
          className="rounded-2xl p-6 transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          style={{
            backgroundColor: '#111816',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
            borderLeft: `4px solid ${accentColor}`,
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: '#4B6E5E' }}>
              {label}
            </p>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 32,
                height: 32,
                backgroundColor: `${accentColor}18`,
              }}
            >
              <Icon size={16} color={iconColor} strokeWidth={1.8} />
            </div>
          </div>

          {/* Value */}
          <p
            className="font-mono text-3xl font-extrabold leading-none mb-2"
            style={{ color: valueColor }}
          >
            {value}
          </p>

          {/* Sub */}
          <div className="text-xs">{sub}</div>
        </div>
      ))}
    </div>
  );
}
