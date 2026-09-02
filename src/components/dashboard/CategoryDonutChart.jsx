import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORIES = [
  { name: 'Ulaşım',   emoji: '🚗', value: 35, kg: 2.24, color: '#22C55E' },
  { name: 'Enerji',   emoji: '⚡', value: 30, kg: 1.92, color: '#F59E0B' },
  { name: 'Beslenme', emoji: '🥗', value: 20, kg: 1.28, color: '#14B8A6' },
  { name: 'Atık',     emoji: '♻️', value: 15, kg: 0.96, color: '#60A5FA' },
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, kg, color } = payload[0].payload;
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
    >
      <p style={{ color }} className="font-semibold">
        {name}
      </p>
      <p className="font-mono mt-1" style={{ color: '#F0FDF4' }}>
        {kg} kg CO₂e
      </p>
    </div>
  );
}

// Custom center label rendered via SVG
function CenterLabel({ cx, cy }) {
  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#22C55E"
        fontFamily="'JetBrains Mono', monospace"
        fontSize={22}
        fontWeight={800}
      >
        6.4 kg
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#4B6E5E"
        fontSize={12}
      >
        CO₂e Bugün
      </text>
    </g>
  );
}

export default function CategoryDonutChart() {
  return (
    <div
      className="rounded-2xl p-6 h-full transition-all"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#86EFAC' }}>
        Bugünkü Emisyon Dağılımı
      </h3>

      {/* Donut Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={CATEGORIES}
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {CATEGORIES.map((cat) => (
              <Cell
                key={cat.name}
                fill={cat.color}
                stroke="transparent"
              />
            ))}
            <CenterLabel cx={0} cy={0} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2.5 mt-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="rounded-full shrink-0"
                style={{ width: 10, height: 10, backgroundColor: cat.color }}
              />
              <span className="text-xs" style={{ color: '#86EFAC' }}>
                {cat.emoji} {cat.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs font-bold"
                style={{ color: cat.color }}
              >
                {cat.kg} kg
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: '#182420', color: '#4B6E5E' }}
              >
                %{cat.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
