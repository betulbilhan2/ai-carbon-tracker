import { useAuth } from '../../context/AuthContext';

export default function ScopeToggle({ activeScope, onChange }) {
  const { user } = useAuth();
  const univName = user?.universite || 'Kampüsüm';
  const cityName = user?.sehir || 'Şehrim';

  const scopes = [
    { id: 'university', label: `🏛️ Üniversitem (${univName})` },
    { id: 'city',       label: `🏙️ Şehrim (${cityName})` },
    { id: 'national',   label: '🇹🇷 Türkiye Geneli' },
  ];

  return (
    <div
      className="inline-flex items-center gap-2 rounded-2xl p-1.5"
      style={{ backgroundColor: '#111816', border: '1px solid #1E3A30' }}
    >
      {scopes.map(({ id, label }) => {
        const isActive = activeScope === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer"
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
            {label}
          </button>
        );
      })}
    </div>
  );
}
