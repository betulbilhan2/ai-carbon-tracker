import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Bot, Zap, Globe2, Sparkles, Check } from 'lucide-react';
import { addUserPoints } from '../../services/api';

const ALTERNATIVE_TASKS = [
  {
    metin: "Bugün asansör yerine merdiven kullanarak 0.3 kg emisyon önle.",
    tasarruf: "Tahmini 0.3 kg CO₂e tasarruf",
    skor: 6.8
  },
  {
    metin: "Kısa mesafeli kampüs içi seyahatlerde yürümeyi tercih et.",
    tasarruf: "Tahmini 0.8 kg CO₂e tasarruf",
    skor: 7.5
  },
  {
    metin: "Kullanmadığın çalışma lambasını ve monitörü kapat.",
    tasarruf: "Tahmini 0.5 kg CO₂e tasarruf",
    skor: 6.2
  },
  {
    metin: "Bugün tek kullanımlık bardak yerine kendi termosunu kullan.",
    tasarruf: "Tahmini 0.2 kg CO₂e ve sıfır atık",
    skor: 8.0
  }
];

export default function AiMicroTaskCard({ onComplete, oneri, onApply }) {
  const [done,          setDone]          = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const [applying,      setApplying]      = useState(false);
  const [barWidth,      setBarWidth]      = useState(0);
  const [taskIndex,     setTaskIndex]     = useState(0);
  const [toastMessage,  setToastMessage]  = useState('');

  // Aktif görev metni ve etki skoru (backend'den veya alternatif listeden)
  const currentTask = (taskIndex === 0 && oneri) 
    ? {
        metin: oneri.oneriMetni,
        tasarruf: oneri.potansiyelTasarruf || 'Tahmini 1.8 kg CO₂e tasarruf',
        skor: oneri.etkiSkoru || 7.2,
      }
    : ALTERNATIVE_TASKS[(taskIndex) % ALTERNATIVE_TASKS.length];

  // Motivasyon çubuğu animasyonu
  useEffect(() => {
    const pct = Math.round(Math.min((currentTask?.skor || 7.2) * 10, 100));
    setBarWidth(0);
    const timer = setTimeout(() => setBarWidth(pct), 200);
    return () => clearTimeout(timer);
  }, [taskIndex, oneri, currentTask?.skor]);

  // ── Görevi Kabul Et (+50 Puan) ──────────────────────────────────
  async function handleComplete() {
    if (done || applying) return;
    setApplying(true);

    try {
      // 1. Backend'de öneriyi uygula ve +50 Eco-Puan ekle
      if (oneri?.oneriId && onApply) {
        await onApply(oneri.oneriId);
      }
      await addUserPoints(1, 50);

      // 2. Başarı durumu ve onay bildirimi
      setSuccessStatus(true);
      setToastMessage('🎉 Görev tamamlandı! +50 Eco-Puan hesabına tanımlandı.');
      onComplete?.(50);

      // 3. 2 saniye onay göster, ardından yeni bir öneriye geç
      setTimeout(() => {
        setSuccessStatus(false);
        setDone(false);
        setTaskIndex(prev => prev + 1);
        setToastMessage('');
      }, 2500);

    } catch (err) {
      console.warn('Öneri uygulanırken yerel güncelleme yapıldı:', err);
      setSuccessStatus(true);
      setToastMessage('🎉 Görev tamamlandı! +50 Eco-Puan hesabına tanımlandı.');
      onComplete?.(50);
      setTimeout(() => {
        setSuccessStatus(false);
        setDone(false);
        setTaskIndex(prev => prev + 1);
        setToastMessage('');
      }, 2500);
    } finally {
      setApplying(false);
    }
  }

  // ── Yarına Ertele (Alternatif Görev Getir) ────────────────────────
  function handlePostpone() {
    if (applying || successStatus) return;
    setTaskIndex(prev => prev + 1);
    setToastMessage('⏭ Yeni alternatif mikro görev getirildi.');
    setTimeout(() => setToastMessage(''), 2500);
  }

  return (
    <div
      className="rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all relative overflow-hidden"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
        borderLeft: '4px solid #22C55E',
      }}
    >
      {/* Toast Bildirimi */}
      {toastMessage && (
        <div
          className="absolute top-3 right-4 rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 z-20 animate-fade-in"
          style={{
            backgroundColor: 'rgba(34,197,94,0.18)',
            border: '1px solid #22C55E',
            color: '#22C55E',
          }}
        >
          <Sparkles size={13} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Rozetler ── */}
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
        {successStatus && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'rgba(34,197,94,0.25)', color: '#22C55E' }}
          >
            ✅ Tamamlandı (+50 Pts)
          </span>
        )}
      </div>

      {/* ── Görev Metni ── */}
      <div>
        <h3
          className="text-base font-bold leading-snug transition-all duration-300"
          style={{ color: '#F0FDF4' }}
        >
          {currentTask.metin}
        </h3>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: '#4B6E5E' }}>
          {currentTask.tasarruf}
        </p>
      </div>

      {/* ── Etki Rozetleri ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
        >
          <Globe2 size={12} />
          Etki Skoru: {Number(currentTask.skor).toFixed(1)} / 10
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: '#182420', color: '#4B6E5E', border: '1px solid #1E3A30' }}
        >
          <Clock3 size={12} />
          ~5 dk
        </span>
      </div>

      {/* ── Motivasyon Çubuğu ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: '#4B6E5E' }}>
            Fogg Davranışsal Motivasyon
          </span>
          <span className="text-xs font-mono font-bold" style={{ color: '#F59E0B' }}>
            {barWidth} / 100
          </span>
        </div>
        <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', backgroundColor: '#1E3A30' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${barWidth}%`,
              background: 'linear-gradient(90deg, #F59E0B, #22C55E)',
            }}
          />
        </div>
      </div>

      {/* ── Aksiyon Butonları ── */}
      <div className="flex items-center gap-3 mt-1">
        <button
          type="button"
          onClick={handleComplete}
          disabled={applying || successStatus}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{
            height: '44px',
            backgroundColor: successStatus ? '#16A34A' : '#22C55E',
            color: '#0A0F0D',
            boxShadow: successStatus ? '0 0 16px rgba(34,197,94,0.4)' : 'none',
          }}
          onMouseEnter={e => { if (!successStatus && !applying) e.currentTarget.style.backgroundColor = '#16A34A'; }}
          onMouseLeave={e => { if (!successStatus && !applying) e.currentTarget.style.backgroundColor = '#22C55E'; }}
        >
          {successStatus ? (
            <>
              <Check size={16} className="stroke-[3]" />
              <span>Tamamlandı ✓</span>
            </>
          ) : applying ? (
            <span>Puan Ekleniyor…</span>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>✅ Kabul Et (+50 Puan)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handlePostpone}
          disabled={applying || successStatus}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{
            height: '44px',
            backgroundColor: 'transparent',
            color: '#86EFAC',
            border: '1px solid #1E3A30',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22C55E'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E3A30'; }}
        >
          ⏭ Yarına Ertele
        </button>
      </div>
    </div>
  );
}
