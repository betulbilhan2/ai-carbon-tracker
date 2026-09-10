import { Bot, TrendingUp, TrendingDown, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AiForecastCard({ forecast, latestAiRecommendation: propAiRec }) {
  const { latestAiRecommendation: contextAiRec } = useAuth();
  const aiRec = propAiRec || contextAiRec;

  // Model çıktılarından veya fallback'ten değerleri çek
  const expectedWeeklyKg = Number(aiRec?.expectedWeeklyKg ?? aiRec?.expected_weekly_kg ?? 22.0);
  const actualWeeklyKg = Number(aiRec?.actualWeeklyKg ?? aiRec?.actual_weekly_kg ?? 25.4);
  const deviationScore = Number(aiRec?.deviationScore ?? aiRec?.deviation_score ?? 0.154);

  // 1. Aylık Bütçe Hedefi: (latestAiRecommendation.expectedWeeklyKg * 4.345) kg CO2e
  const monthlyBudget = Number((expectedWeeklyKg * 4.345).toFixed(1));

  // 2. Tahmini Ay Sonu Toplam: (latestAiRecommendation.actualWeeklyKg * 4.345) kg CO2e
  const monthlyEstimate = Number((actualWeeklyKg * 4.345).toFixed(1));

  // 3. Öngörülen Bütçe Durumu: Doğrudan ekrandaki iki değerin farkı (monthlyEstimate - monthlyBudget)
  const diffKg = Number((monthlyEstimate - monthlyBudget).toFixed(1));
  const isOverLimit = diffKg > 0;

  const diffText = isOverLimit
    ? `+${diffKg} kg aşım`
    : `${Math.abs(diffKg)} kg tasarruf`;

  const trendText = isOverLimit ? 'Hafif Artış Eğiliminde ↗' : 'Bütçe İçi Kararlı ✓';
  const confidencePct = Math.round((forecast?.guven_skoru || 0.94) * 100);

  // 4. Açıklama metnini modelden gelen dinamik "message" içeriğine göre güncelle
  const modelMessage = aiRec?.message || (isOverLimit
    ? `Mevcut tüketim hızıyla ay sonu hedef limiti ${diffKg} kg aşabilirsiniz. Yaşam tarzı optimizasyonu ve toplu taşıma tercihleriyle dengeleyebilirsiniz.`
    : `Harika bir performans! TabNet modelinin projeksiyonuna göre ay sonunda karbon bütçenizin ${Math.abs(diffKg)} kg altında kalarak yeşil hedefi başarıyla tamamlayacaksınız.`);

  return (
    <div
      className="rounded-2xl p-6 transition-all relative overflow-hidden"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
        background: 'linear-gradient(135deg, #111816 0%, #13241d 100%)',
      }}
    >
      {/* Arka plan ışık efekti */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-40 rounded-full blur-3xl pointer-events-none opacity-25 transition-all"
        style={{ backgroundColor: isOverLimit ? '#F59E0B' : '#22C55E' }}
      />

      {/* Üst Bilgi */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg p-2"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
          >
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#F0FDF4' }}>
              Yapay Zekâ Ay Sonu Karbon Projeksiyonu
            </h3>
            <p className="text-xs font-mono font-medium" style={{ color: '#22C55E' }}>
              TabNet Canlı Model
            </p>
          </div>
        </div>

        {/* Model Doğruluk Rozeti */}
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: 'rgba(20,184,166,0.12)',
            border: '1px solid rgba(20,184,166,0.3)',
            color: '#14B8A6',
          }}
        >
          <ShieldCheck size={13} />
          <span>Model Güveni: %{confidencePct}</span>
        </div>
      </div>

      {/* 4 Ana Metrik Kartı */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-2">
        {/* Metrik 1: Tahmini Ay Sonu Toplam */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#4B6E5E' }}>Tahmini Ay Sonu Toplam</p>
          <p className="font-mono text-2xl font-extrabold" style={{ color: isOverLimit ? '#F59E0B' : '#22C55E' }}>
            {monthlyEstimate} <span className="text-xs font-normal text-zinc-400">kg CO₂e</span>
          </p>
          <p className="text-[10px] mt-0.5 text-zinc-500">
            Haftalık ~{actualWeeklyKg.toFixed(1)} kg tüketim baz alındı
          </p>
        </div>

        {/* Metrik 2: Aylık Bütçe Hedefi */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#4B6E5E' }}>Aylık Bütçe Hedefi</p>
          <p className="font-mono text-2xl font-extrabold" style={{ color: '#60A5FA' }}>
            {monthlyBudget} <span className="text-xs font-normal text-zinc-400">kg CO₂e</span>
          </p>
          <p className="text-[10px] mt-0.5 text-zinc-500">
            Haftalık {expectedWeeklyKg.toFixed(1)} kg TabNet hedef kotası
          </p>
        </div>

        {/* Metrik 3: Öngörülen Bütçe Durumu */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#4B6E5E' }}>Öngörülen Bütçe Durumu</p>
          <p className="font-mono text-xl font-extrabold" style={{ color: isOverLimit ? '#EF4444' : '#22C55E' }}>
            {diffText}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: isOverLimit ? '#F59E0B' : '#86EFAC' }}>
            {isOverLimit ? 'Limit aşım riski var' : 'Hedef bütçe korunuyor ✓'}
          </p>
        </div>

        {/* Metrik 4: Trend Yönü */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#4B6E5E' }}>Trend Yönü</p>
          <div className="flex items-center gap-1.5 mt-1">
            {isOverLimit ? (
              <TrendingUp size={18} color="#F59E0B" />
            ) : (
              <TrendingDown size={18} color="#22C55E" />
            )}
            <span 
              className="text-xs font-bold truncate" 
              style={{ color: isOverLimit ? '#F59E0B' : '#22C55E' }}
            >
              {trendText}
            </span>
          </div>
          <p className="text-[10px] mt-0.5 text-zinc-500">
            {isOverLimit ? 'Tüketim ivmesi artışta' : 'Dengeli tüketim deseni'}
          </p>
        </div>
      </div>

      {/* YZ Dinamik Öneri Mesajı */}
      <div 
        className="mt-3 text-xs leading-relaxed flex items-start gap-2.5 p-3 rounded-xl bg-black/30 border border-[#1E3A30]" 
        style={{ color: isOverLimit ? '#FDE68A' : '#86EFAC' }}
      >
        {isOverLimit ? (
          <Sparkles size={16} className="shrink-0 text-amber-400 mt-0.5" />
        ) : (
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400 mt-0.5" />
        )}
        <span className="italic leading-normal">
          "{modelMessage}"
        </span>
      </div>
    </div>
  );
}
