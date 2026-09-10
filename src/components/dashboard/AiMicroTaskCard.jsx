import { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, Clock3, Bot, Zap, Globe2, Sparkles, Check, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addUserPoints } from '../../services/api';

const CATEGORY_TASKS = {
  Enerji: [
    {
      id: 4,
      title: "Çalışma alanından ayrılırken bekleme (standby) modundaki elektronik cihazların prizlerini kapat.",
      category: "Enerji",
      etkiSkoru: "7.8 / 10",
      sure: "~2 dk",
      motivasyon: 85,
      puan: 50,
      badge: "⚡",
      triggerReason: "En Yüksek Emisyon: Enerji",
    },
    {
      id: 6,
      title: "Oda aydınlatmasında akkor flamanlı ampuller yerine tasarruflu LED ampul kullan ve gün ışığından azami yararlan.",
      category: "Enerji",
      etkiSkoru: "7.2 / 10",
      sure: "~5 dk",
      motivasyon: 76,
      puan: 50,
      badge: "💡",
      triggerReason: "En Yüksek Emisyon: Enerji",
    },
  ],
  Beslenme: [
    {
      id: 3,
      title: "Öğle yemeğinde kırmızı et yerine bitkisel protein veya sebze ağırlıklı bir vejetaryen menü tercih et.",
      category: "Beslenme",
      etkiSkoru: "8.4 / 10",
      sure: "~30 dk",
      motivasyon: 80,
      puan: 50,
      badge: "🥗",
      triggerReason: "En Yüksek Emisyon: Beslenme",
    },
    {
      id: 7,
      title: "Haftalık beslenme planına 1 gün 'Meatless' (Etsiz Gün) ekleyerek tahıl ve baklagil ağırlıklı beslen.",
      category: "Beslenme",
      etkiSkoru: "8.0 / 10",
      sure: "~1 gün",
      motivasyon: 75,
      puan: 50,
      badge: "🥦",
      triggerReason: "En Yüksek Emisyon: Beslenme",
    },
  ],
  "Sıfır Atık": [
    {
      id: 1,
      title: "Kullandığın 2 adet tek kullanımlık plastik yerine paslanmaz çelik matara kullanarak plastik atık zincirini kırabilirsin.",
      category: "Sıfır Atık",
      etkiSkoru: "7.5 / 10",
      sure: "~5 dk",
      motivasyon: 88,
      puan: 50,
      badge: "🧴",
      triggerReason: "En Yüksek Emisyon: Sıfır Atık",
    },
    {
      id: 5,
      title: "Kampüsteki geri dönüşüm istasyonunu kullanarak kağıt ve karton atıklarını doğru kutuya ayrıştır.",
      category: "Sıfır Atık",
      etkiSkoru: "7.0 / 10",
      sure: "~3 dk",
      motivasyon: 70,
      puan: 50,
      badge: "♻️",
      triggerReason: "En Yüksek Emisyon: Sıfır Atık",
    },
  ],
  Ulaşım: [
    {
      id: 2,
      title: "Bugün kampüs içinde 2 km'lik kısa mesafeyi araç yerine yürüyerek veya bisikletle tamamla.",
      category: "Ulaşım",
      etkiSkoru: "8.2 / 10",
      sure: "~15 dk",
      motivasyon: 82,
      puan: 50,
      badge: "🚲",
      triggerReason: "En Yüksek Emisyon: Ulaşım",
    },
    {
      id: 8,
      title: "Bireysel araç yolculuğu yerine kampüs ring hattı veya metro gibi toplu taşıma araçlarını tercih et.",
      category: "Ulaşım",
      etkiSkoru: "8.6 / 10",
      sure: "~20 dk",
      motivasyon: 78,
      puan: 50,
      badge: "🚌",
      triggerReason: "En Yüksek Emisyon: Ulaşım",
    },
  ],
};

function detectHighestCategory(kategoriDagilimi) {
  if (Array.isArray(kategoriDagilimi) && kategoriDagilimi.length > 0) {
    let maxVal = -1;
    let maxCat = '';
    kategoriDagilimi.forEach(item => {
      const val = Number(item.miktar ?? item.kg ?? item.yuzde ?? 0);
      if (val > maxVal) {
        maxVal = val;
        maxCat = item.kategori || item.kategoriAdi || item.name || '';
      }
    });

    const c = maxCat.toLowerCase();
    if (c.includes('enerji') || c.includes('energy') || c.includes('elektrik')) return 'Enerji';
    if (c.includes('beslenme') || c.includes('food') || c.includes('diyet')) return 'Beslenme';
    if (c.includes('atık') || c.includes('atik') || c.includes('waste')) return 'Sıfır Atık';
    if (c.includes('ulaşım') || c.includes('ulasim') || c.includes('transport')) return 'Ulaşım';
  }

  // Profil verisine göre en yüksek emisyonu tespit et
  try {
    const saved = localStorage.getItem('user_carbon_profile');
    if (saved) {
      const p = JSON.parse(saved);
      const eScore = (p.heating_energy_source === 'coal' ? 12 : 7) + (Number(p.tv_pc_daily_hour || 4) * 0.5);
      const fScore = p.diet === 'omnivore' ? 10 : 5;
      const tScore = (Number(p.vehicle_distance_km_month || 150) / 15);
      const wScore = Number(p.waste_bag_weekly_count || 3) * 2;
      const maxScore = Math.max(eScore, fScore, tScore, wScore);
      if (maxScore === eScore) return 'Enerji';
      if (maxScore === fScore) return 'Beslenme';
      if (maxScore === wScore) return 'Sıfır Atık';
      return 'Ulaşım';
    }
  } catch {}

  return 'Enerji';
}

export default function AiMicroTaskCard({ onComplete, oneri, onApply, kategoriDagilimi = [], summary = null }) {
  const { user, updateUser } = useAuth();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [successStatus, setSuccessStatus] = useState(false);
  const [applying, setApplying] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const highestCategory = useMemo(() => detectHighestCategory(kategoriDagilimi), [kategoriDagilimi]);

  const tasksPool = useMemo(() => {
    const primary = CATEGORY_TASKS[highestCategory] || CATEGORY_TASKS['Enerji'];
    const others = Object.entries(CATEGORY_TASKS)
      .filter(([cat]) => cat !== highestCategory)
      .flatMap(([, tasks]) => tasks);
    return [...primary, ...others];
  }, [highestCategory]);

  const task = tasksPool[currentTaskIndex % tasksPool.length];

  // Motivasyon çubuğu animasyonu
  useEffect(() => {
    setBarWidth(0);
    const timer = setTimeout(() => setBarWidth(task.motivasyon), 150);
    return () => clearTimeout(timer);
  }, [currentTaskIndex, task.motivasyon]);

  async function handleComplete() {
    if (applying || successStatus) return;
    setApplying(true);

    const currentPoints = Number(user?.ecoScore ?? user?.ecoPuan ?? 100);
    const newPoints = currentPoints + 50;
    const curStreak = Number(user?.currentStreak ?? user?.streak ?? 1);
    const newStreak = curStreak + 1;

    // 1. AuthContext ve localStorage senkronize güncelle
    updateUser?.({
      eco_puan: newPoints,
      ecoPuan: newPoints,
      ecoScore: newPoints,
      currentStreak: newStreak,
      streak: newStreak,
      gunlukSeri: newStreak,
      gunluk_seri: newStreak,
    });

    // 2. Parent callback (App.jsx & OverviewPage)
    onComplete?.(50);

    // 3. Backend API çağrısı
    try {
      const uid = user?.kullaniciId || user?.kullanici_id || user?.id || 1;
      await addUserPoints(uid, 50);
      if (oneri?.oneriId && onApply) {
        await onApply(oneri.oneriId);
      }
    } catch (err) {
      console.warn('Backend puan ekleme bildirimi:', err);
    }

    // 4. Başarı durumu ve Toast
    setToastMessage(`Tebrikler! +50 Puan kazandınız. Yeni güncel puanınız: ${newPoints}`);
    setSuccessStatus(true);

    // 5. Yeni göreve kaydır ve butonu tekrar aktif et
    setTimeout(() => {
      setSuccessStatus(false);
      setApplying(false);
      setCurrentTaskIndex(prev => (prev + 1) % tasksPool.length);
      setToastMessage('');
    }, 1200);
  }

  function handlePostpone() {
    if (applying || successStatus) return;
    setCurrentTaskIndex(prev => (prev + 1) % tasksPool.length);
    setToastMessage('⏭ Yeni mikro görev getirildi.');
    setTimeout(() => setToastMessage(''), 1500);
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
          className="absolute top-3 right-4 rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 z-20 animate-fade-in"
          style={{
            backgroundColor: 'rgba(34,197,94,0.18)',
            border: '1px solid #22C55E',
            color: '#86EFAC',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Sparkles size={13} color="#22C55E" />
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
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
        >
          <Tag size={11} />
          {task.category}
        </span>
        {task.triggerReason && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#86EFAC', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            🎯 {task.triggerReason}
          </span>
        )}
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
          {task.title}
        </h3>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: '#4B6E5E' }}>
          Görev #{task.id} / {tasksPool.length} · Davranışsal mikro müdahale ve anlık alışkanlık tetikleyicisi
        </p>
      </div>

      {/* ── Etki Rozetleri ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
        >
          <Globe2 size={12} />
          Etki Skoru: {task.etkiSkoru}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: '#182420', color: '#4B6E5E', border: '1px solid #1E3A30' }}
        >
          <Clock3 size={12} />
          {task.sure}
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
          className="flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
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
          className="flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
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
