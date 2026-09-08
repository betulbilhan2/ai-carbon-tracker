import { Bot, TrendingUp, TrendingDown, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AiForecastCard({ forecast }) {
  if (!forecast) return null;

  // Bütçe aşımı kontrolü (Fark 0'dan büyükse bütçe aşılır, küçükse bütçe içi kalınır)
  const isOverLimit = forecast.limit_asimi_bekleniyor_mu || (forecast.fark_kg > 0);
  const confidencePct = Math.round((forecast.guven_skoru || 0.91) * 100);

  // Trend metni belirleme (bütçe altındaysa kesinlikle yeşil pozitif metin göster)
  const trendText = isOverLimit 
    ? (forecast.trend_durumu?.includes('Artış') ? forecast.trend_durumu : 'Hafif Artış Eğiliminde ↗')
    : (forecast.trend_durumu?.includes('Kararlı') || forecast.trend_durumu?.includes('Düşüş') 
        ? forecast.trend_durumu 
        : 'Bütçe İçi Kararlı ✓');

  const diffText = forecast.fark_kg > 0 
    ? `+${forecast.fark_kg} kg aşım` 
    : `${Math.abs(forecast.fark_kg)} kg tasarruf`;

  return (
    <div
      className="rounded-2xl p-6 transition-all relative overflow-hidden"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
        background: 'linear-gradient(135deg, #111816 0%, #13241d 100%)',
      }}
    >
      {/* Background soft glow */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-40 rounded-full blur-3xl pointer-events-none opacity-25 transition-all"
        style={{ backgroundColor: isOverLimit ? '#F59E0B' : '#22C55E' }}
      />

      {/* Header */}
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
            <p className="text-xs font-mono" style={{ color: '#4B6E5E' }}>
              {forecast.model_tipi || 'TabNet Regresyon v1.0'}
            </p>
          </div>
        </div>

        {/* Model Accuracy Badge */}
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

      {/* Main Metric Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-2">
        {/* Metric 1 */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#4B6E5E' }}>Tahmini Ay Sonu Toplam</p>
          <p className="font-mono text-2xl font-extrabold" style={{ color: isOverLimit ? '#F59E0B' : '#22C55E' }}>
            {forecast.tahmini_aylik_emisyon} <span className="text-xs font-normal text-zinc-400">kg CO₂e</span>
          </p>
          <p className="text-[10px] mt-0.5 text-zinc-500">
            Günlük ortalama ~{(forecast.tahmini_aylik_emisyon / 30).toFixed(1)} kg baz alındı
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#4B6E5E' }}>Aylık Bütçe Hedefi</p>
          <p className="font-mono text-2xl font-extrabold" style={{ color: '#60A5FA' }}>
            {forecast.hedef_aylik_limit} <span className="text-xs font-normal text-zinc-400">kg CO₂e</span>
          </p>
          <p className="text-[10px] mt-0.5 text-zinc-500">
            Haftalık {forecast.haftalik_ortalama ? Math.round(forecast.hedef_aylik_limit / 4.28) : 56} kg hedef kotası
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#4B6E5E' }}>Öngörülen Bütçe Durumu</p>
          <p className="font-mono text-xl font-extrabold" style={{ color: isOverLimit ? '#EF4444' : '#22C55E' }}>
            {diffText}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: isOverLimit ? '#F59E0B' : '#86EFAC' }}>
            {isOverLimit ? 'Limit aşım riski var' : 'Hedef bütçe korunuyor ✓'}
          </p>
        </div>

        {/* Metric 4 */}
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

      {/* AI Recommendation Message */}
      <div className="mt-3 text-xs leading-relaxed flex items-center gap-2" style={{ color: isOverLimit ? '#F59E0B' : '#86EFAC' }}>
        {isOverLimit ? <Sparkles size={14} className="shrink-0" /> : <CheckCircle2 size={14} className="shrink-0" />}
        <span>
          {isOverLimit 
            ? `Mevcut tüketim hızıyla ay sonu hedef limiti ${forecast.fark_kg} kg aşabilirsiniz. Aşağıdaki senaryo simülatörünü kullanarak tasarruf hedefleri belirleyin.`
            : `Harika bir performans! TabNet modelinin projeksiyonuna göre ay sonunda karbon bütçenizin ${Math.abs(forecast.fark_kg)} kg altında kalarak yeşil hedefi başarıyla tamamlayacaksınız.`}
        </span>
      </div>
    </div>
  );
}
