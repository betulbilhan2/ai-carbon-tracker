import { Trash2, Pencil } from 'lucide-react';

// ── Category display helpers ──────────────────────────────────────
const CATEGORY_META = {
  transport: { emoji: '🚗', label: 'Ulaşım',      color: '#22C55E' },
  energy:    { emoji: '⚡', label: 'Enerji',       color: '#F59E0B' },
  food:      { emoji: '🥗', label: 'Beslenme',     color: '#14B8A6' },
  waste:     { emoji: '♻️', label: 'Sıfır Atık',  color: '#60A5FA' },
};

// ── Mock initial data (ER model compatible) ───────────────────────
export const INITIAL_LOGS = [
  {
    id: 1,
    datetime: '2026-09-01T14:30',
    category: 'transport',
    detail: 'Araba · 47 km',
    kg: 6.82,
  },
  {
    id: 2,
    datetime: '2026-09-01T08:15',
    category: 'food',
    detail: 'Kırmızı Etli · 2 porsiyon',
    kg: 13.22,
  },
  {
    id: 3,
    datetime: '2026-08-31T19:45',
    category: 'energy',
    detail: 'Elektrik · 24 kWh',
    kg: 11.54,
  },
  {
    id: 4,
    datetime: '2026-08-31T10:00',
    category: 'transport',
    detail: 'Metro · 18 km',
    kg: 0.36,
  },
  {
    id: 5,
    datetime: '2026-08-30T17:20',
    category: 'waste',
    detail: 'Plastik Şişe × 3, Cam × 2',
    kg: 0.27,
  },
];

// ── Format datetime for display ───────────────────────────────────
function formatDT(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Component ─────────────────────────────────────────────────────
export default function RecentLogsTable({ logs, onDelete }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1E3A30' }}>
        <h3 className="text-sm font-semibold" style={{ color: '#86EFAC' }}>
          Son Eklenen Aktiviteler{' '}
          <span className="font-mono" style={{ color: '#4B6E5E' }}>
            (Veritabanı Kayıtları)
          </span>
        </h3>
        <span
          className="rounded-full px-3 py-0.5 text-xs font-mono font-semibold"
          style={{ backgroundColor: '#182420', color: '#4B6E5E', border: '1px solid #1E3A30' }}
        >
          {logs.length} kayıt
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1E3A30' }}>
              {['Tarih / Saat', 'Kategori', 'Aktivite Detayı', 'CO₂e (kg)', 'İşlemler'].map(h => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold"
                  style={{ color: '#4B6E5E' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: '#4B6E5E' }}>
                  Henüz kayıt yok. İlk aktiviteni eklemek için formu kullan.
                </td>
              </tr>
            )}
            {logs.map((log, idx) => {
              const meta = CATEGORY_META[log.category] ?? { emoji: '📋', label: log.category, color: '#86EFAC' };
              const isEven = idx % 2 === 0;
              return (
                <tr
                  key={log.id}
                  style={{ backgroundColor: isEven ? 'transparent' : 'rgba(255,255,255,0.015)' }}
                >
                  {/* Datetime */}
                  <td className="px-5 py-3.5 text-xs font-mono" style={{ color: '#4B6E5E', whiteSpace: 'nowrap' }}>
                    {formatDT(log.datetime)}
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                    >
                      {meta.emoji} {meta.label}
                    </span>
                  </td>

                  {/* Detail */}
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#86EFAC' }}>
                    {log.detail}
                  </td>

                  {/* CO2e */}
                  <td className="px-5 py-3.5">
                    <span
                      className="font-mono font-bold text-sm"
                      style={{ color: log.kg > 10 ? '#EF4444' : log.kg > 5 ? '#F59E0B' : '#22C55E' }}
                    >
                      {log.kg.toFixed(2)}
                    </span>
                    <span className="text-xs ml-1" style={{ color: '#4B6E5E' }}>kg</span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        className="flex items-center justify-center rounded-lg transition-colors"
                        style={{ width: 28, height: 28, backgroundColor: '#182420', border: '1px solid #1E3A30' }}
                        title="Düzenle"
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
                      >
                        <Pencil size={12} color="#4B6E5E" />
                      </button>
                      <button
                        onClick={() => onDelete(log.id)}
                        className="flex items-center justify-center rounded-lg transition-colors"
                        style={{ width: 28, height: 28, backgroundColor: '#182420', border: '1px solid #1E3A30' }}
                        title="Sil"
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#EF4444')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
                      >
                        <Trash2 size={12} color="#4B6E5E" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
