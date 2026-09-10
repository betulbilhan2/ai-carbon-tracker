import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AnomalyAlertBanner({ onNavigate, latestAiRecommendation: propAiRec }) {
  const { latestAiRecommendation: contextAiRec } = useAuth();
  const aiRec = propAiRec || contextAiRec;

  // Modelden gelen gerçek sapma skoru ve mesaj
  const deviationScore = Number(aiRec?.deviationScore ?? aiRec?.deviation_score ?? 0.154);
  const deviationPct = Math.max(1, Math.round(Math.abs(deviationScore) * 100));
  const message = aiRec?.message || 'Tüketim verileriniz doğrultusunda TabNet modeli tarafından kişiselleştirilmiş müdahale önerisi oluşturuldu.';

  return (
    <div
      className="rounded-2xl flex flex-col sm:flex-row items-start justify-between gap-5 p-5"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
        borderLeft: '4px solid #F59E0B',
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
        style={{ width: 40, height: 40, backgroundColor: 'rgba(245,158,11,0.15)' }}
      >
        <AlertTriangle size={20} color="#F59E0B" strokeWidth={1.8} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <p className="text-sm font-semibold" style={{ color: '#F59E0B' }}>
            Davranışsal Anormallik & Sapma Tespiti (TabNet Inference)
          </p>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            Sapma: %{deviationPct}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-[#A7F3D0]">
          Yaşam tarzı ve emisyon girdiğiniz veriler referans model kümesinin{' '}
          <strong style={{ color: '#F59E0B' }}>%{deviationPct} sapma aralığında</strong> olduğunu göstermektedir.
        </p>

        {/* Modelden gelen gerçek dinamik mesaj */}
        <div className="mt-2 p-3 rounded-xl bg-[#0A0F0D] border border-[#1E3A30] text-xs text-zinc-200 leading-relaxed italic flex items-start gap-2">
          <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <span>"{message}"</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={() => onNavigate?.('activity')}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shrink-0 self-center transition-all duration-200 cursor-pointer hover:bg-emerald-500/10"
        style={{
          backgroundColor: 'transparent',
          border: '1px solid #22C55E',
          color: '#22C55E',
        }}
        title="Dengeleyici aktivite kaydet"
      >
        <span>Müdahale Et / Aktivite Ekle</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
}
