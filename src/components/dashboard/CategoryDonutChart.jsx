import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, kg, color, yuzde } = payload[0].payload;
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
    >
      <p style={{ color }} className="font-semibold">
        {name}
      </p>
      <p className="font-mono mt-1" style={{ color: '#F0FDF4' }}>
        {kg} kg CO₂e (%{yuzde})
      </p>
    </div>
  );
}

// Custom center label rendered via SVG
function CenterLabel({ cx, cy, totalKg }) {
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
        {totalKg.toFixed(1)} kg
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#4B6E5E"
        fontSize={12}
      >
        CO₂e Toplam
      </text>
    </g>
  );
}

export default function CategoryDonutChart({ categoriesData = [], bugunkuKarbon = 0 }) {
  // Backend'den gelen kategori dağılımını recharts formatına uyarla
  const rawList = categoriesData.length > 0 ? categoriesData : [];

  const chartData = rawList.map(item => ({
    name: item.kategori,
    emoji: item.emoji || '🌱',
    value: item.yuzde > 0 ? item.yuzde : 0.001, // Recharts render için sıfırdan büyük küçük bir değer
    yuzde: item.yuzde,
    kg: item.miktar,
    color: item.renk || '#22C55E'
  }));

  const totalEmissions = rawList.reduce((acc, curr) => acc + (curr.miktar || 0), 0);
  const hasData = totalEmissions > 0;

  return (
    <div
      className="rounded-2xl p-6 h-full transition-all flex flex-col justify-between"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: '#86EFAC' }}>
          Emisyon Kategori Kırılımı
        </h3>
        <span
          className="text-xs font-medium rounded-full px-2.5 py-0.5"
          style={{ backgroundColor: '#182420', color: '#4B6E5E', border: '1px solid #1E3A30' }}
        >
          {hasData ? `${totalEmissions.toFixed(1)} kg Toplam` : 'Henüz Veri Yok'}
        </span>
      </div>

      {/* Donut Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={hasData ? chartData : [{ name: 'Veri Yok', value: 100, color: '#1E3A30', kg: 0, yuzde: 0 }]}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={hasData ? 3 : 0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {hasData ? (
                chartData.map((cat) => (
                  <Cell
                    key={cat.name}
                    fill={cat.color}
                    stroke="transparent"
                  />
                ))
              ) : (
                <Cell fill="#182420" stroke="#1E3A30" strokeDasharray="3 3" />
              )}
              <CenterLabel cx={0} cy={0} totalKg={totalEmissions} />
            </Pie>
            {hasData && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 mt-4">
        {hasData ? (
          chartData.map((cat) => (
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
                  className="rounded-full px-2 py-0.5 text-xs font-mono"
                  style={{ backgroundColor: '#182420', color: '#4B6E5E' }}
                >
                  %{cat.yuzde}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-center py-2" style={{ color: '#4B6E5E' }}>
            Aktivite ekledikçe kategori kırılım grafiği burada belirecektir.
          </p>
        )}
      </div>
    </div>
  );
}
