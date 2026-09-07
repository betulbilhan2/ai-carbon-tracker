import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Line,
  ComposedChart,
} from 'recharts';

// ── Custom Tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const actual    = payload.find(p => p.dataKey === 'actual');
  const predicted = payload.find(p => p.dataKey === 'predicted');
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{
        backgroundColor: '#182420',
        border: '1px solid #1E3A30',
        minWidth: '160px',
      }}
    >
      <p className="font-semibold mb-2" style={{ color: '#86EFAC' }}>
        {label}
      </p>
      {actual && (
        <p style={{ color: '#22C55E' }}>
          ● Gerçekleşen:&nbsp;
          <span className="font-mono font-bold">{actual.value} kg</span>
        </p>
      )}
      {predicted && (
        <p className="mt-1" style={{ color: '#60A5FA' }}>
          ◌ Günlük Hedef:&nbsp;
          <span className="font-mono font-bold">{predicted.value} kg</span>
        </p>
      )}
      {actual && predicted && (
        <p className="mt-1" style={{ color: '#4B6E5E' }}>
          Δ Durum:&nbsp;
          <span
            className="font-mono font-bold"
            style={{
              color:
                actual.value > predicted.value
                  ? '#EF4444'
                  : '#86EFAC',
            }}
          >
            {actual.value > predicted.value ? `+${(actual.value - predicted.value).toFixed(1)} kg aşım` : 'Hedef altında ✓'}
          </span>
        </p>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function EmissionTrendChart({ trendData }) {
  // Backend'den gelen haftalikTrend dizisini recharts formatına dönüştür
  const chartData = (trendData && trendData.length > 0)
    ? trendData.map(item => ({
        day: `${item.gun} (${item.tarih})`,
        actual: Number(item.miktar ?? 0),
        predicted: Number(item.tahmin ?? 8.0),
      }))
    : [
        { day: 'Pzt', actual: 0, predicted: 8.0 },
        { day: 'Sal', actual: 0, predicted: 8.0 },
        { day: 'Çar', actual: 0, predicted: 8.0 },
        { day: 'Per', actual: 0, predicted: 8.0 },
        { day: 'Cum', actual: 0, predicted: 8.0 },
        { day: 'Cmt', actual: 0, predicted: 8.0 },
        { day: 'Paz', actual: 0, predicted: 8.0 },
      ];

  const totalActual = chartData.reduce((acc, curr) => acc + curr.actual, 0);

  return (
    <div
      className="rounded-2xl p-6 transition-all"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#86EFAC' }}>
            Haftalık Emisyon Trendi
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#4B6E5E' }}>
            Toplam: <span className="font-mono font-bold" style={{ color: '#22C55E' }}>{totalActual.toFixed(2)} kg CO₂e</span>
          </p>
        </div>
        <span
          className="text-xs font-medium rounded-full px-3 py-1"
          style={{ backgroundColor: '#182420', color: '#4B6E5E', border: '1px solid #1E3A30' }}
        >
          Son 7 Gün (Canlı)
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#1E3A30" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="day"
            tick={{ fill: '#4B6E5E', fontSize: 11 }}
            axisLine={{ stroke: '#1E3A30' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#4B6E5E', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}kg`}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Gerçekleşen: Green Area + Line */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#22C55E"
            strokeWidth={2.5}
            fill="url(#gradActual)"
            dot={{ fill: '#22C55E', r: 4, strokeWidth: 0 }}
            activeDot={{ fill: '#86EFAC', r: 6, stroke: '#22C55E', strokeWidth: 2 }}
          />

          {/* Hedef / Tahmin: Blue dashed line */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#60A5FA"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs" style={{ color: '#4B6E5E' }}>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 rounded-full inline-block" style={{ backgroundColor: '#22C55E' }} />
          <span>Gerçekleşen Emisyon (kg)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 rounded-full inline-block border-t border-dashed" style={{ borderColor: '#60A5FA' }} />
          <span>Günlük Hedef Sınırı</span>
        </div>
      </div>
    </div>
  );
}
