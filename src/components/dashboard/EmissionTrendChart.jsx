import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Line,
  ComposedChart,
  Legend,
} from 'recharts';

// ── Static mock data ────────────────────────────────────────────
const RAW_DATA = [
  { day: 'Pzt 1',  actual: 5.8,  predicted: 6.1 },
  { day: 'Sal 2',  actual: 7.2,  predicted: 6.8 },
  { day: 'Çar 3',  actual: 6.4,  predicted: 6.5 },
  { day: 'Per 4',  actual: 5.1,  predicted: 6.2 },
  { day: 'Cum 5',  actual: 8.3,  predicted: 7.0 },
  { day: 'Cmt 6',  actual: 9.1,  predicted: 7.5 },
  { day: 'Paz 7',  actual: 6.9,  predicted: 7.2 },
  { day: 'Pzt 8',  actual: 6.2,  predicted: 6.8 },
  { day: 'Sal 9',  actual: 11.4, predicted: 6.9 }, // ← Anormallik
  { day: 'Çar 10', actual: 7.8,  predicted: 7.1 },
  { day: 'Per 11', actual: 6.5,  predicted: 6.9 },
  { day: 'Cum 12', actual: 7.0,  predicted: 7.0 },
  { day: 'Cmt 13', actual: 8.2,  predicted: 7.3 },
  { day: 'Paz 14', actual: 6.8,  predicted: 7.0 },
];

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
          ◌ Tahmin:&nbsp;
          <span className="font-mono font-bold">{predicted.value} kg</span>
        </p>
      )}
      {actual && predicted && (
        <p className="mt-1" style={{ color: '#4B6E5E' }}>
          Δ Fark:&nbsp;
          <span
            className="font-mono font-bold"
            style={{
              color:
                actual.value - predicted.value > 1
                  ? '#EF4444'
                  : '#86EFAC',
            }}
          >
            {(actual.value - predicted.value).toFixed(1)} kg
          </span>
        </p>
      )}
    </div>
  );
}

// ── Anomaly Reference Label ──────────────────────────────────────
function AnomalyLabel({ viewBox }) {
  const { x } = viewBox;
  return (
    <g>
      <rect
        x={x - 44}
        y={4}
        width={88}
        height={22}
        rx={6}
        fill="#F59E0B22"
        stroke="#F59E0B"
        strokeWidth={1}
      />
      <text
        x={x}
        y={19}
        textAnchor="middle"
        fill="#F59E0B"
        fontSize={10}
        fontWeight="600"
      >
        ⚠️ Anormallik
      </text>
    </g>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function EmissionTrendChart() {
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
        <h3 className="text-sm font-semibold" style={{ color: '#86EFAC' }}>
          Haftalık Emisyon Trendi
        </h3>
        <span
          className="text-xs font-medium rounded-full px-3 py-1"
          style={{ backgroundColor: '#182420', color: '#4B6E5E', border: '1px solid #1E3A30' }}
        >
          Son 14 Gün
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={RAW_DATA} margin={{ top: 20, right: 8, left: -10, bottom: 0 }}>
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

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1E3A30', strokeWidth: 1 }} />

          {/* Predicted area (behind actual) */}
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#60A5FA"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            fill="url(#gradPredicted)"
            dot={false}
            activeDot={false}
          />

          {/* Actual area */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#22C55E"
            strokeWidth={2}
            fill="url(#gradActual)"
            dot={false}
            activeDot={{ r: 5, fill: '#22C55E', strokeWidth: 0 }}
          />

          {/* Anomaly Reference Line */}
          <ReferenceLine
            x="Sal 9"
            stroke="#F59E0B"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={<AnomalyLabel />}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 pl-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full" style={{ width: 10, height: 10, backgroundColor: '#22C55E' }} />
          <span className="text-xs" style={{ color: '#4B6E5E' }}>Gerçekleşen</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="2">
            <line x1="0" y1="1" x2="16" y2="1" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <span className="text-xs" style={{ color: '#4B6E5E' }}>TabNet Tahmini</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="2">
            <line x1="0" y1="1" x2="16" y2="1" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <span className="text-xs" style={{ color: '#4B6E5E' }}>Anormallik</span>
        </div>
      </div>
    </div>
  );
}
