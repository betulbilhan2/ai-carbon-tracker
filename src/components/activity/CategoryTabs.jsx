import { CATEGORIES } from './activityConstants';

export default function CategoryTabs({ activeCategory, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {CATEGORIES.map(({ id, emoji, label }) => {
        const isActive = activeCategory === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150"
            style={{
              backgroundColor: isActive ? '#22C55E' : '#111816',
              color: isActive ? '#0A0F0D' : '#86EFAC',
              border: `1px solid ${isActive ? '#22C55E' : '#1E3A30'}`,
              boxShadow: isActive ? '0 0 16px rgba(34,197,94,0.25)' : 'none',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#22C55E';
                e.currentTarget.style.color = '#F0FDF4';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#1E3A30';
                e.currentTarget.style.color = '#86EFAC';
              }
            }}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
