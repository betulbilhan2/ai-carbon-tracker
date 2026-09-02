import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';

const RADAR_DATA = [
  { axis: 'Ulaşım',      user: 68, cluster: 55 },
  { axis: 'Enerji',      user: 72, cluster: 70 },
  { axis: 'Beslenme',    user: 45, cluster: 60 },
  { axis: 'Atık',        user: 80, cluster: 65 },
  { axis: 'Genel Skor',  user: 74, cluster: 62 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
    >
      <p className="font-semibold mb-1.5" style={{ color: '#86EFAC' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.dataKey === 'user' ? '#22C55E' : '#60A5FA' }}>
          {p.dataKey === 'user' ? '● Sen' : '◌ Küme Ort.'}: {' '}
          <span className="font-mono font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function ClusterRadarCard() {
  return (
    <div
      className="rounded-2xl p-6 h-full transition-all"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#86EFAC' }}>
          Davranışsal Kullanıcı Kümesi (K-Means)
        </h3>
        {/* Cluster badge */}
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(20,184,166,0.15)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.25)' }}
        >
          <span className="font-mono">⬡</span>
          Küme 3 — Çevreci Komuter
        </span>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed mb-4" style={{ color: '#4B6E5E' }}>
        Benzer tüketim profiline göre{' '}
        <span style={{ color: '#86EFAC' }}>yüksek ulaşım optimizasyonu</span>,{' '}
        düşük beslenme emisyonu. Toplu taşıma teşviklerine yüksek yanıt.
      </p>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius={80}>
          <PolarGrid stroke="#1E3A30" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#4B6E5E', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#1E3A30', fontSize: 9 }}
            tickCount={4}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Cluster average — behind user */}
          <Radar
            name="cluster"
            dataKey="cluster"
            stroke="#60A5FA"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="#60A5FA"
            fillOpacity={0.05}
          />
          {/* User profile */}
          <Radar
            name="user"
            dataKey="user"
            stroke="#22C55E"
            strokeWidth={2}
            fill="#22C55E"
            fillOpacity={0.12}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 justify-center">
        <div className="flex items-center gap-2">
          <div className="rounded-full" style={{ width: 9, height: 9, backgroundColor: '#22C55E' }} />
          <span className="text-xs" style={{ color: '#4B6E5E' }}>Senin Profilin</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="2">
            <line x1="0" y1="1" x2="16" y2="1" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <span className="text-xs" style={{ color: '#4B6E5E' }}>Küme Ortalaması</span>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="mt-4 rounded-xl px-4 py-3 text-xs"
        style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
      >
        <span style={{ color: '#4B6E5E' }}>
          Bu kümedeki{' '}
          <span className="font-mono font-bold" style={{ color: '#86EFAC' }}>1.240</span>{' '}
          kullanıcıdan senin Eco-Skor'un{' '}
          <span style={{ color: '#22C55E' }}>daha yüksek</span>. 🎉
        </span>
      </div>
    </div>
  );
}
