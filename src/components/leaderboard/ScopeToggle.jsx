import { SCOPE_LABELS } from './leaderboardData';

const SCOPES = Object.keys(SCOPE_LABELS);

export default function ScopeToggle({ activeScope, onChange }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-2xl p-1.5"
      style={{ backgroundColor: '#111816', border: '1px solid #1E3A30' }}
    >
      {SCOPES.map(scope => {
        const isActive = activeScope === scope;
        return (
          <button
            key={scope}
            onClick={() => onChange(scope)}
            className="rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-150"
            style={{
              backgroundColor: isActive ? '#22C55E' : 'transparent',
              color: isActive ? '#0A0F0D' : '#4B6E5E',
              boxShadow: isActive ? '0 0 14px rgba(34,197,94,0.30)' : 'none',
            }}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.color = '#86EFAC';
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.color = '#4B6E5E';
            }}
          >
            {SCOPE_LABELS[scope]}
          </button>
        );
      })}
    </div>
  );
}
