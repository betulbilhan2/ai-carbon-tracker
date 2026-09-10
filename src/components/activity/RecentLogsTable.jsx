import { Trash2 } from 'lucide-react';
import { formatTurkishDateTime } from './activityConstants';

// ── Category display helpers ──────────────────────────────────────
const CATEGORY_META = {
  transport: { emoji: '🚗', label: 'Ulaşım',      color: '#22C55E' },
  energy:    { emoji: '⚡', label: 'Enerji',       color: '#F59E0B' },
  food:      { emoji: '🥗', label: 'Beslenme',     color: '#14B8A6' },
  waste:     { emoji: '♻️', label: 'Sıfır Atık',  color: '#60A5FA' },
};

// ── Format datetime for display (Türkiye Standardı DD.MM.YYYY HH:mm) ──
function formatDT(str) {
  return formatTurkishDateTime(str);
}

// ── Component ─────────────────────────────────────────────────────
export default function RecentLogsTable({ logs = [], onDelete }) {
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
              const rowId = log.aktivite_id ?? log.id ?? log.aktiviteId;

              return (
                <tr
                  key={rowId ?? idx}
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
                      {Number(log.kg || 0).toFixed(2)}
                    </span>
                    <span className="text-xs ml-1" style={{ color: '#4B6E5E' }}>kg</span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const silinecekId = log.aktivite_id ?? log.id ?? log.aktiviteId;
                          console.log("Butona basildi, id:", silinecekId, log);
                          if (onDelete && silinecekId) {
                            onDelete(silinecekId);
                          } else {
                            console.error("onDelete fonksiyonu veya id bulunamadı!", { onDelete, silinecekId });
                          }
                        }}
                        className="flex items-center justify-center rounded-lg transition-colors cursor-pointer group"
                        style={{ width: 28, height: 28, backgroundColor: '#182420', border: '1px solid #1E3A30' }}
                        title="Sil"
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#EF4444')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
                      >
                        <Trash2 size={13} className="pointer-events-none text-zinc-400 group-hover:text-red-500 transition-colors" />
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
