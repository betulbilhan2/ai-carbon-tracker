import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const DATA = [
  { day: 'Pzt', transport: 3.2, energy: 2.1, food: 1.3, waste: 0.8 },
  { day: 'Sal', transport: 2.5, energy: 2.8, food: 1.1, waste: 0.6 },
  { day: 'Çar', transport: 3.8, energy: 1.9, food: 1.5, waste: 0.9 },
  { day: 'Per', transport: 1.2, energy: 3.1, food: 1.0, waste: 0.7 },
  { day: 'Cum', transport: 4.1, energy: 2.4, food: 1.8, waste: 1.0 },
  { day: 'Cmt', transport: 5.3, energy: 2.2, food: 1.6, waste: 1.3 },
  { day: 'Paz', transport: 2.9, energy: 1.7, food: 1.2, waste: 0.8 },
];

const SERIES = [
  { key: 'transport', label: '🚗 Ulaşım',   color: '#22C55E' },
  { key: 'energy',    label: '⚡ Enerji',    color: '#F59E0B' },
  { key: 'food',      label: '🥗 Beslenme',  color: '#14B8A6' },
  { key: 'waste',     label: '♻️ Atık',      color: '#60A5FA' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0);
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{ backgroundColor: '#182420', border: '1px solid #1E3A30', minWidth: 160 }}
    >
      <p className="font-semibold mb-2" style={{ color: '#86EFAC' }}>{label}</p>
      {payload.map(p => {
        const series = SERIES.find(s => s.key === p.dataKey);
        return (
          <p key={p.dataKey} className="mt-0.5" style={{ color: series?.color ?? '#F0FDF4' }}>
            {series?.label ?? p.dataKey}:{' '}
            <span className="font-mono font-bold">{p.value} kg</span>
          </p>
        );
      })}
      <p className="mt-2 pt-2 font-mono font-bold" style={{ color: '#F0FDF4', borderTop: '1px solid #1E3A30' }}>
        Toplam: {total.toFixed(1)} kg
      </p>
    </div>
  );
}

export default function WeeklyStackedBarChart() {
  return (
    <div
      className="rounded-2xl p-6 transition-all"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <h3 className="text-sm font-semibold mb-5" style={{ color: '#86EFAC' }}>
        Haftalık Kategorik Emisyon Kırılımı{' '}
        <span style={{ color: '#4B6E5E', fontWeight: 400 }}>(kg CO₂e)</span>
      </h3>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={DATA}
          margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
          barSize={24}
        >
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          {SERIES.map(({ key, color }, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="weekly"
              fill={color}
              radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pl-2">
        {SERIES.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <div className="rounded-sm" style={{ width: 10, height: 10, backgroundColor: color }} />
            <span className="text-xs" style={{ color: '#4B6E5E' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
