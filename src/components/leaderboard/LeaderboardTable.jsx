import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MOCK_DATA } from './leaderboardData';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

const RANK_ROW_STYLE = {
  1: { bg: 'rgba(234,179,8,0.06)',   border: 'rgba(234,179,8,0.15)'   },   // gold
  2: { bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)' },   // silver
  3: { bg: 'rgba(180,120,60,0.06)',  border: 'rgba(180,120,60,0.15)'  },   // bronze
};

function initials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

// Random but stable color per name (for avatars)
const AVATAR_COLORS = ['#22C55E', '#14B8A6', '#60A5FA', '#F59E0B', '#A78BFA', '#FB923C'];
function avatarColor(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function LeaderboardTable({ scope }) {
  const [expanded, setExpanded] = useState(false);
  const rows = MOCK_DATA[scope] ?? MOCK_DATA.university;

  // Top 10 + always show user row separately if outside top 10
  const top10   = rows.filter(r => !r.isUser).slice(0, 10);
  const userRow = rows.find(r => r.isUser);
  const visible = expanded ? top10 : top10.slice(0, 7);

  function renderRow(row, idx, forceUserStyle = false) {
    const isUser   = row.isUser || forceUserStyle;
    const rankStyle = RANK_ROW_STYLE[row.rank] ?? null;

    let rowBg     = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)';
    let rowBorder = 'transparent';
    if (isUser) { rowBg = 'rgba(34,197,94,0.06)'; rowBorder = '#22C55E33'; }
    else if (rankStyle) { rowBg = rankStyle.bg; rowBorder = rankStyle.border; }

    const weekly = row.weeklyChange;
    const weeklyColor  = weekly > 0 ? '#22C55E' : weekly < 0 ? '#EF4444' : '#4B6E5E';
    const weeklyPrefix = weekly > 0 ? '+' : '';

    const color = avatarColor(row.name);

    return (
      <tr
        key={`${scope}-${row.rank}`}
        style={{
          backgroundColor: rowBg,
          borderLeft: isUser ? '3px solid #22C55E' : '3px solid transparent',
          outline: rankStyle ? `1px solid ${rankStyle.border}` : 'none',
        }}
      >
        {/* Rank */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            {MEDAL[row.rank] && (
              <span className="text-lg">{MEDAL[row.rank]}</span>
            )}
            <span
              className="font-mono font-bold text-sm"
              style={{ color: isUser ? '#22C55E' : row.rank <= 3 ? '#F0FDF4' : '#4B6E5E' }}
            >
              #{row.rank}
            </span>
          </div>
        </td>

        {/* User */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold shrink-0"
              style={{ width: 32, height: 32, backgroundColor: color, color: '#0A0F0D' }}
            >
              {initials(row.name)}
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: isUser ? '#22C55E' : '#F0FDF4' }}
            >
              {row.name}
              {isUser && (
                <span
                  className="ml-2 text-xs rounded-full px-2 py-0.5 font-semibold"
                  style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
                >
                  Sen
                </span>
              )}
            </span>
          </div>
        </td>

        {/* Institution */}
        <td className="px-5 py-3.5 text-xs" style={{ color: '#4B6E5E' }}>
          {row.institution}
        </td>

        {/* Score */}
        <td className="px-5 py-3.5">
          <span className="font-mono font-bold text-sm" style={{ color: '#14B8A6' }}>
            {row.score.toLocaleString('tr-TR')}
          </span>
          <span className="text-xs ml-1" style={{ color: '#4B6E5E' }}>pts</span>
        </td>

        {/* Weekly change */}
        <td className="px-5 py-3.5">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ backgroundColor: `${weeklyColor}18`, color: weeklyColor }}
          >
            {weeklyPrefix}{weekly}
          </span>
        </td>

        {/* Badge */}
        <td className="px-5 py-3.5 text-lg">{row.badge}</td>
      </tr>
    );
  }

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
          En Yüksek Etki Puanına Sahip Kullanıcılar
        </h3>
        <span
          className="text-xs rounded-full px-3 py-0.5 font-mono"
          style={{ backgroundColor: '#182420', color: '#4B6E5E', border: '1px solid #1E3A30' }}
        >
          Top 10
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1E3A30' }}>
              {['Sıra', 'Kullanıcı', 'Üniversite / Kurum', 'Eco-Puan', 'Haftalık', 'Rozet'].map(h => (
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
            {visible.map((row, idx) => renderRow(row, idx))}

            {/* Divider + user row if outside top 10 */}
            {userRow && userRow.rank > 10 && (
              <>
                <tr>
                  <td colSpan={6}>
                    <div
                      className="flex items-center gap-3 px-5 py-2"
                      style={{ borderTop: '1px dashed #1E3A30' }}
                    >
                      <div className="flex-1 h-px" style={{ backgroundColor: '#1E3A30' }} />
                      <span className="text-xs" style={{ color: '#4B6E5E' }}>
                        ···  {userRow.rank - 10} sıra aşağıda  ···
                      </span>
                      <div className="flex-1 h-px" style={{ backgroundColor: '#1E3A30' }} />
                    </div>
                  </td>
                </tr>
                {renderRow(userRow, 0, true)}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4" style={{ borderTop: '1px solid #1E3A30' }}>
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: '#14B8A6' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#22C55E')}
          onMouseLeave={e => (e.currentTarget.style.color = '#14B8A6')}
        >
          <ChevronDown
            size={16}
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />
          {expanded ? 'Daha Az Göster' : 'Tüm Sıralamayı Gör'}
        </button>
      </div>
    </div>
  );
}
