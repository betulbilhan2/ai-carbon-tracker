import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

// ── Mock 30-day data ──────────────────────────────────────────────
const DATA = [
  { day: 'G1',  actual: 6.2,  predicted: 6.5  },
  { day: 'G2',  actual: 7.0,  predicted: 6.7  },
  { day: 'G3',  actual: 5.8,  predicted: 6.4  },
  { day: 'G4',  actual: 6.9,  predicted: 6.6  },
  { day: 'G5',  actual: 8.1,  predicted: 7.0  },
  { day: 'G6',  actual: 9.3,  predicted: 7.4  },
  { day: 'G7',  actual: 7.2,  predicted: 7.1  },
  { day: 'G8',  actual: 6.5,  predicted: 6.8  },
  { day: 'G9',  actual: 12.1, predicted: 7.2  }, // ← Anormallik
  { day: 'G10', actual: 7.9,  predicted: 7.3  },
  { day: 'G11', actual: 6.8,  predicted: 6.9  },
  { day: 'G12', actual: 7.3,  predicted: 7.0  },
  { day: 'G13', actual: 8.4,  predicted: 7.5  },
  { day: 'G14', actual: 6.9,  predicted: 7.1  },
  { day: 'G15', actual: 5.9,  predicted: 6.3  },
  { day: 'G16', actual: 7.1,  predicted: 6.8  },
  { day: 'G17', actual: 6.4,  predicted: 6.6  },
  { day: 'G18', actual: 8.8,  predicted: 7.6  },
  { day: 'G19', actual: 7.6,  predicted: 7.2  },
  { day: 'G20', actual: 6.3,  predicted: 6.7  },
  { day: 'G21', actual: 7.0,  predicted: 6.9  },
  { day: 'G22', actual: 9.1,  predicted: 7.8  },
  { day: 'G23', actual: 6.7,  predicted: 7.0  },
  { day: 'G24', actual: 7.5,  predicted: 7.2  },
  { day: 'G25', actual: 6.2,  predicted: 6.6  },
  { day: 'G26', actual: 8.0,  predicted: 7.4  },
  { day: 'G27', actual: 7.3,  predicted: 7.1  },
  { day: 'G28', actual: 6.8,  predicted: 6.9  },
  { day: 'G29', actual: 7.1,  predicted: 7.0  },
  { day: 'G30', actual: 6.4,  predicted: 6.8  },
];

const ANOMALY_DAY = 'G9';

// ── Custom Tooltip ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const actual    = payload.find(p => p.dataKey === 'actual');
  const predicted = payload.find(p => p.dataKey === 'predicted');
  const diff      = actual && predicted ? (actual.value - predicted.value).toFixed(1) : null;
  const isAnomaly = label === ANOMALY_DAY;

  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{
        backgroundColor: '#182420',
        border: `1px solid ${isAnomaly ? '#F59E0B' : '#1E3A30'}`,
        minWidth: 170,
      }}
    >
      <p className="font-semibold mb-2" style={{ color: isAnomaly ? '#F59E0B' : '#86EFAC' }}>
        {label} {isAnomaly ? '⚠️ Anormallik' : ''}
      </p>
      {actual && (
        <p style={{ color: '#22C55E' }}>
          ● Gerçekleşen:{' '}
          <span className="font-mono font-bold">{actual.value} kg</span>
        </p>
      )}
      {predicted && (
        <p className="mt-1" style={{ color: '#60A5FA' }}>
          ◌ Tahmin:{' '}
          <span className="font-mono font-bold">{predicted.value} kg</span>
        </p>
      )}
      {diff !== null && (
        <p className="mt-1" style={{ color: parseFloat(diff) > 1 ? '#EF4444' : '#86EFAC' }}>
          Δ Sapma:{' '}
          <span className="font-mono font-bold">
            {parseFloat(diff) > 0 ? '+' : ''}{diff} kg
          </span>
        </p>
      )}
    </div>
  );
}

// ── Anomaly SVG Label ─────────────────────────────────────────────
function AnomalyLabel({ viewBox }) {
  const { x } = viewBox ?? {};
  if (x == null) return null;
  return (
    <g>
      <rect x={x - 58} y={6} width={116} height={22} rx={6}
        fill="rgba(245,158,11,0.12)" stroke="#F59E0B" strokeWidth={1} />
      <text x={x} y={20} textAnchor="middle" fill="#F59E0B"
        fontSize={10} fontWeight={700}>
        ⚠️ Anormallik (+47%)
      </text>
    </g>
  );
}

// ── Anomaly Detail Panel ──────────────────────────────────────────
function AnomalyPanel({ onClose }) {
  return (
    <div
      className="rounded-xl p-5 flex items-start justify-between gap-4"
      style={{
        backgroundColor: '#182420',
        border: '1px solid #F59E0B',
        marginTop: 16,
      }}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold mb-3" style={{ color: '#F59E0B' }}>
          ⚠️ Müdahale &amp; Sapma Analiz Paneli — Gün 9
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Gerçekleşen', value: '12.1 kg', color: '#EF4444' },
            { label: 'TabNet Tahmini', value: '7.2 kg', color: '#60A5FA' },
            { label: 'Sapma', value: '+4.9 kg', color: '#F59E0B' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: '#111816', border: '1px solid #1E3A30' }}
            >
              <p className="text-xs mb-1" style={{ color: '#4B6E5E' }}>{label}</p>
              <p className="font-mono text-lg font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: '#4B6E5E' }}>
          Tek kullanımlık plastik tüketiminiz haftalık ortalamanın <strong style={{ color: '#F59E0B' }}>%47 üzerinde</strong>.
          TabNet Sequential Attention mekanizması bu günü müdahale noktası olarak işaretledi.
        </p>
      </div>
      <button
        onClick={onClose}
        className="rounded-lg flex items-center justify-center shrink-0 transition-colors"
        style={{ width: 28, height: 28, backgroundColor: '#111816', border: '1px solid #1E3A30' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#F59E0B')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
      >
        <X size={14} color="#4B6E5E" />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function DetailedPredictionChart() {
  const [panelOpen, setPanelOpen] = useState(false);

  function handleChartClick(data) {
    if (data?.activeLabel === ANOMALY_DAY) {
      setPanelOpen(prev => !prev);
    }
  }

  return (
    <div
      className="rounded-2xl p-6 transition-all"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#86EFAC' }}>
            Gerçekleşen vs. TabNet Tahmini — Günlük Emisyon (kg CO₂e)
          </h3>
          <p className="text-xs mt-1" style={{ color: '#4B6E5E' }}>
            Anormallik çizgisine tıklayarak sapma detaylarını görüntüleyebilirsiniz.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium shrink-0 transition-colors"
          style={{
            backgroundColor: '#182420',
            border: '1px solid #1E3A30',
            color: '#86EFAC',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
        >
          Son 30 Gün
          <ChevronDown size={12} color="#4B6E5E" />
        </button>
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={DATA}
          margin={{ top: 28, right: 8, left: -10, bottom: 0 }}
          onClick={handleChartClick}
          style={{ cursor: 'pointer' }}
        >
          <defs>
            <linearGradient id="gradActualDetail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#1E3A30" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="day"
            tick={{ fill: '#4B6E5E', fontSize: 10 }}
            axisLine={{ stroke: '#1E3A30' }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: '#4B6E5E', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}kg`}
            domain={[4, 14]}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#1E3A3055', strokeWidth: 1 }}
          />

          {/* Predicted line */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#60A5FA"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            activeDot={false}
          />

          {/* Actual area */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#22C55E"
            strokeWidth={2}
            fill="url(#gradActualDetail)"
            dot={false}
            activeDot={{ r: 5, fill: '#22C55E', strokeWidth: 0 }}
          />

          {/* Anomaly reference line */}
          <ReferenceLine
            x={ANOMALY_DAY}
            stroke="#F59E0B"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={<AnomalyLabel />}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* ── Legend ── */}
      <div className="flex items-center gap-5 mt-2 pl-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full" style={{ width: 9, height: 9, backgroundColor: '#22C55E' }} />
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

      {/* ── Collapsible Anomaly Panel ── */}
      {panelOpen && <AnomalyPanel onClose={() => setPanelOpen(false)} />}
    </div>
  );
}
