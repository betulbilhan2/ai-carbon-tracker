import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Bot, Zap, Globe2 } from 'lucide-react';

export default function AiMicroTaskCard({ onComplete }) {
  const [done, setDone]               = useState(false);
  const [postponed, setPostponed]     = useState(false);
  const [barWidth, setBarWidth]       = useState(0);

  // Animate motivation bar on mount
  useEffect(() => {
    const timer = setTimeout(() => setBarWidth(72), 300);
    return () => clearTimeout(timer);
  }, []);

  function handleComplete() {
    if (done || postponed) return;
    setDone(true);
    onComplete?.();
  }

  function handlePostpone() {
    if (done || postponed) return;
    setPostponed(true);
  }

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 transition-all"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
        borderLeft: '4px solid #22C55E',
      }}
    >
      {/* ── Badge Row ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
        >
          <Bot size={12} />
          YZ Mikro Görev
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(96,165,250,0.12)', color: '#60A5FA' }}
        >
          <Zap size={12} />
          Fogg B=MAP
        </span>
        {done && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
          >
            ✅ Tamamlandı!
          </span>
        )}
        {postponed && !done && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
          >
            ⏭ Ertelendi
          </span>
        )}
      </div>

      {/* ── Task Text ── */}
      <div>
        <h3
          className="text-lg font-bold leading-snug"
          style={{ color: done ? '#4B6E5E' : '#F0FDF4', textDecoration: done ? 'line-through' : 'none' }}
        >
          Bugün öğle yemeğini vejetaryen seç.
        </h3>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: '#4B6E5E' }}>
          Bu küçük değişiklik tahmini{' '}
          <span style={{ color: '#22C55E' }}>1.8 kg CO₂e</span> tasarrufu sağlar.
          Motivasyonel görüşme yaklaşımıyla tüketim örüntülerine özel üretildi.
        </p>
      </div>

      {/* ── Impact & Duration Badges ── */}
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
        >
          <Globe2 size={12} />
          Tahmini Etki: −1.8 kg CO₂e
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: '#182420', color: '#4B6E5E', border: '1px solid #1E3A30' }}
        >
          <Clock3 size={12} />
          ~5 dk
        </span>
      </div>

      {/* ── Motivation Bar ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: '#4B6E5E' }}>
            Motivasyon Skoru
          </span>
          <span className="text-xs font-mono font-bold" style={{ color: '#F59E0B' }}>
            {barWidth} / 100
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: '6px', backgroundColor: '#1E3A30' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${barWidth}%`,
              background: 'linear-gradient(90deg, #F59E0B, #22C55E)',
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleComplete}
          disabled={done || postponed}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            height: '44px',
            backgroundColor: done ? '#1E3A30' : '#22C55E',
            color: done ? '#4B6E5E' : '#0A0F0D',
            cursor: done || postponed ? 'not-allowed' : 'pointer',
            opacity: postponed ? 0.5 : 1,
          }}
          onMouseEnter={e => {
            if (!done && !postponed) e.currentTarget.style.backgroundColor = '#16A34A';
          }}
          onMouseLeave={e => {
            if (!done && !postponed) e.currentTarget.style.backgroundColor = '#22C55E';
          }}
        >
          <CheckCircle2 size={16} />
          {done ? 'Tamamlandı!' : '✅ Yaptım! (+50 Puan)'}
        </button>

        <button
          onClick={handlePostpone}
          disabled={done || postponed}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            height: '44px',
            backgroundColor: 'transparent',
            color: postponed ? '#4B6E5E' : '#86EFAC',
            border: `1px solid ${postponed ? '#1E3A30' : '#1E3A30'}`,
            cursor: done || postponed ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => {
            if (!done && !postponed) e.currentTarget.style.borderColor = '#22C55E';
          }}
          onMouseLeave={e => {
            if (!done && !postponed) e.currentTarget.style.borderColor = '#1E3A30';
          }}
        >
          ⏭ Yarına Ertele
        </button>
      </div>
    </div>
  );
}
