import { useState } from 'react';
import { ChevronDown, X, AlertTriangle, Sparkles } from 'lucide-react';
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
        minWidth: '180px',
        boxShadow: isAnomaly ? '0 0 16px rgba(245,158,11,0.2)' : 'none',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold" style={{ color: '#86EFAC' }}>{label}</span>
        {isAnomaly && (
          <span
            className="rounded px-1.5 py-0.5 text-xs font-bold"
            style={{ backgroundColor: '#F59E0B22', color: '#F59E0B' }}
          >
            ⚠️ Anormallik
          </span>
        )}
      </div>

      {actual && (
        <p style={{ color: '#22C55E' }}>
          ● Gerçekleşen:&nbsp;
          <span className="font-mono font-bold">{actual.value} kg</span>
        </p>
      )}
      {predicted && (
        <p className="mt-1" style={{ color: '#60A5FA' }}>
          ◌ TabNet Tahmini:&nbsp;
          <span className="font-mono font-bold">{predicted.value} kg</span>
        </p>
      )}
      {diff !== null && (
        <p className="mt-1" style={{ color: '#4B6E5E' }}>
          Δ Sapma:&nbsp;
          <span
            className="font-mono font-bold"
            style={{ color: Number(diff) > 2 ? '#EF4444' : Number(diff) > 0 ? '#F59E0B' : '#86EFAC' }}
          >
            {Number(diff) > 0 ? `+${diff}` : diff} kg
          </span>
        </p>
      )}
    </div>
  );
}

// ── Anomaly Reference Line Label ──────────────────────────────────
function AnomalyLabel({ viewBox, onClick }) {
  const { x } = viewBox;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect
        x={x - 46}
        y={8}
        width={92}
        height={22}
        rx={6}
        fill="#F59E0B22"
        stroke="#F59E0B"
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={23}
        textAnchor="middle"
        fill="#F59E0B"
        fontSize={10}
        fontWeight="bold"
      >
        ⚠️ Anormallik (G9)
      </text>
    </g>
  );
}

// ── Anomaly Detail Toast/Panel ────────────────────────────────────
function AnomalyPanel({ onClose }) {
  return (
    <div
      className="mt-4 rounded-xl p-4 flex items-start justify-between gap-4 animate-fade-in"
      style={{
        backgroundColor: '#182420',
        border: '1px solid #F59E0B',
        boxShadow: '0 0 20px rgba(245,158,11,0.12)',
      }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} color="#F59E0B" />
          <p className="text-sm font-bold" style={{ color: '#F59E0B' }}>
            Tespit Edilen Anormallik: 9. Günde %47 Plastik Tüketim Aşımı
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 my-3">
          {[
            { label: 'Gerçekleşen', value: '12.1 kg CO₂e', color: '#EF4444' },
            { label: 'TabNet Tahmini', value: '7.2 kg CO₂e', color: '#60A5FA' },
            { label: 'Net Sapma', value: '+4.9 kg CO₂e', color: '#F59E0B' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-2.5 text-center"
              style={{ backgroundColor: '#111816', border: '1px solid #1E3A30' }}
            >
              <p className="text-[11px] mb-0.5" style={{ color: '#4B6E5E' }}>{label}</p>
              <p className="font-mono text-sm font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs leading-relaxed" style={{ color: '#86EFAC' }}>
          TabNet Sequential Attention mekanizması 9. günde standart tüketimin <strong>%47 üzerinde plastik atık</strong> kaydedildiğini tespit etti. 
          Bu anormalliği sıfırlamak için aşağıdaki <em>"Müdahale Et / Sıfır Atık Ekle"</em> butonunu kullanabilirsiniz.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        style={{ width: 28, height: 28, backgroundColor: '#111816', border: '1px solid #1E3A30' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#F59E0B')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
        title="Kapat"
      >
        <X size={14} color="#86EFAC" />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function DetailedPredictionChart() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('30d'); // '30d' | '7d'
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Filtrelenmiş veri
  const filteredData = timeRange === '7d' ? DATA.slice(-7) : DATA;

  function handleChartClick(data) {
    if (data?.activeLabel === ANOMALY_DAY) {
      setPanelOpen(true);
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
            Anormallik çizgisine (G9) tıklayarak sapma detaylarını ve müdahale önerisini görüntüleyin.
          </p>
        </div>

        {/* ── Dropdown Filter (Son 7 Gün / Son 30 Gün) ── */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium shrink-0 transition-colors cursor-pointer"
            style={{
              backgroundColor: '#182420',
              border: `1px solid ${dropdownOpen ? '#22C55E' : '#1E3A30'}`,
              color: '#86EFAC',
            }}
            onMouseEnter={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = '#22C55E'; }}
            onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = '#1E3A30'; }}
          >
            <span>{timeRange === '7d' ? 'Son 7 Gün' : 'Son 30 Gün'}</span>
            <ChevronDown size={13} color="#4B6E5E" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-1.5 w-36 rounded-xl p-1 shadow-xl z-20"
              style={{ backgroundColor: '#111816', border: '1px solid #1E3A30' }}
            >
              <button
                type="button"
                onClick={() => {
                  setTimeRange('7d');
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer"
                style={{
                  backgroundColor: timeRange === '7d' ? 'rgba(34,197,94,0.15)' : 'transparent',
                  color: timeRange === '7d' ? '#22C55E' : '#86EFAC',
                }}
              >
                Son 7 Gün
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeRange('30d');
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer"
                style={{
                  backgroundColor: timeRange === '30d' ? 'rgba(34,197,94,0.15)' : 'transparent',
                  color: timeRange === '30d' ? '#22C55E' : '#86EFAC',
                }}
              >
                Son 30 Gün
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={filteredData}
          margin={{ top: 28, right: 8, left: -10, bottom: 0 }}
          onClick={handleChartClick}
          style={{ cursor: 'pointer' }}
        >
          <defs>
            <linearGradient id="gradActualDetail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#1E3A30" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="day"
            tick={{ fill: '#4B6E5E', fontSize: 10 }}
            axisLine={{ stroke: '#1E3A30' }}
            tickLine={false}
            interval={timeRange === '7d' ? 0 : 2}
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

          {/* Anomaly reference line (Sadece 30 günlük aralıkta veya aralıkta varsa görünür) */}
          {(timeRange === '30d' || filteredData.some(d => d.day === ANOMALY_DAY)) && (
            <ReferenceLine
              x={ANOMALY_DAY}
              stroke="#F59E0B"
              strokeDasharray="4 3"
              strokeWidth={1.8}
              label={<AnomalyLabel onClick={() => setPanelOpen(true)} />}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* ── Legend ── */}
      <div className="flex items-center gap-5 mt-3 pl-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full" style={{ width: 9, height: 9, backgroundColor: '#22C55E' }} />
          <span className="text-xs" style={{ color: '#4B6E5E' }}>Gerçekleşen Emisyon</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="2">
            <line x1="0" y1="1" x2="16" y2="1" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <span className="text-xs" style={{ color: '#4B6E5E' }}>TabNet Model Tahmini</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPanelOpen(true)}>
          <svg width="16" height="2">
            <line x1="0" y1="1" x2="16" y2="1" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: '#F59E0B' }}>⚠️ Anormallik (Tıklayın)</span>
        </div>
      </div>

      {/* ── Collapsible Anomaly Panel (Açılan bilgi penceresi) ── */}
      {panelOpen && <AnomalyPanel onClose={() => setPanelOpen(false)} />}
    </div>
  );
}
