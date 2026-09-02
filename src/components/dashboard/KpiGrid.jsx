import { Flame, Star, TreePine } from 'lucide-react';

// ── Sub-components ──────────────────────────────────────────────

function KpiCard({ accentColor, children }) {
  return (
    <div
      className="rounded-2xl p-6 transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.12)]"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }) {
  return (
    <p className="text-xs font-medium mb-1" style={{ color: '#4B6E5E' }}>
      {children}
    </p>
  );
}

function CardValue({ value, color }) {
  return (
    <p
      className="font-mono text-4xl font-extrabold leading-none"
      style={{ color }}
    >
      {value}
    </p>
  );
}

// ── Card 1: Haftalık Emisyon ────────────────────────────────────
function WeeklyEmissionCard({ weeklyLimit = 56 }) {
  const used = 34.2;
  const limit = weeklyLimit;
  const pct = Math.round((used / limit) * 100);

  return (
    <KpiCard accentColor="#22C55E">
      <CardLabel>Bu Haftaki Karbon Ayak İzin</CardLabel>
      <div className="flex items-end gap-2 mt-1">
        <CardValue value={`${used} kg`} color="#22C55E" />
      </div>
      <p className="text-xs mt-1" style={{ color: '#4B6E5E' }}>
        CO₂e · Haftalık Limit: {limit} kg
      </p>
      {/* Mini progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1" style={{ color: '#4B6E5E' }}>
          <span>{pct}% kullanıldı</span>
          <span>{(limit - used).toFixed(1)} kg kaldı</span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: '6px', backgroundColor: '#1E3A30' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: pct > 85
                ? '#EF4444'
                : pct > 60
                  ? 'linear-gradient(90deg,#22C55E,#F59E0B)'
                  : 'linear-gradient(90deg,#22C55E,#14B8A6)',
            }}
          />
        </div>
      </div>
    </KpiCard>
  );
}

// ── Card 2: Günlük Seri ────────────────────────────────────────
function StreakCard() {
  const streak = 12;
  const record = 21;
  // true = logged, false = missed (last 7 days)
  const days = [true, true, true, false, true, true, true];

  return (
    <KpiCard accentColor="#F59E0B">
      <CardLabel>Günlük Seri</CardLabel>
      <div className="flex items-center gap-2 mt-1">
        <Flame size={28} color="#F59E0B" />
        <CardValue value={`${streak} Gün`} color="#F59E0B" />
      </div>
      <p className="text-xs mt-1" style={{ color: '#4B6E5E' }}>
        Rekor: {record} gün
      </p>
      {/* 7-day dot indicators */}
      <div className="flex items-center gap-1.5 mt-3">
        {days.map((logged, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: logged ? '#22C55E' : '#1E3A30',
              boxShadow: logged ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
            }}
          />
        ))}
        <span className="text-xs ml-1" style={{ color: '#4B6E5E' }}>
          son 7 gün
        </span>
      </div>
    </KpiCard>
  );
}

// ── Card 3: Eco-Score ──────────────────────────────────────────
function EcoScoreCard() {
  return (
    <KpiCard accentColor="#14B8A6">
      <CardLabel>Eco-Score</CardLabel>
      <div className="flex items-end gap-2 mt-1">
        <CardValue value="847 pts" color="#14B8A6" />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Star size={13} color="#F59E0B" fill="#F59E0B" />
        <p className="text-xs" style={{ color: '#4B6E5E' }}>
          Bu hafta <span style={{ color: '#22C55E' }}>+124 puan</span> kazandın 🎉
        </p>
      </div>
      {/* Rank badge */}
      <div className="mt-3">
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(20,184,166,0.15)', color: '#14B8A6' }}
        >
          🏫 #14 Üniversitende
        </span>
      </div>
    </KpiCard>
  );
}

// ── Card 4: Toplam Tasarruf ────────────────────────────────────
function SavingsCard() {
  return (
    <KpiCard accentColor="#60A5FA">
      <CardLabel>Toplam Tasarruf</CardLabel>
      <div className="flex items-end gap-2 mt-1">
        <CardValue value="18.4 kg" color="#60A5FA" />
      </div>
      <p className="text-xs mt-1" style={{ color: '#4B6E5E' }}>
        CO₂e — Bu ay tasarruf edildi
      </p>
      <div className="flex items-center gap-1.5 mt-3">
        <TreePine size={14} color="#22C55E" />
        <p className="text-xs" style={{ color: '#4B6E5E' }}>
          = <span style={{ color: '#22C55E' }}>2.3 ağacın</span> günlük emişi 🌳
        </p>
      </div>
    </KpiCard>
  );
}

// ── Main Export ────────────────────────────────────────────────
export default function KpiGrid({ weeklyLimit = 56 }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <WeeklyEmissionCard weeklyLimit={weeklyLimit} />
      <StreakCard />
      <EcoScoreCard />
      <SavingsCard />
    </div>
  );
}
