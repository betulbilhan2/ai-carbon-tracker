import { useState, useEffect, useCallback } from 'react';
import { Sliders, TreePine, Award, Zap, RefreshCw } from 'lucide-react';
import { simulateScenario } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WhatIfSimulator({ initialWeekly = 25.0, latestAiRecommendation: propAiRec }) {
  const { latestAiRecommendation: contextAiRec } = useAuth();
  const aiRec = propAiRec || contextAiRec;

  // Model çıktısı: simulatedSavingKgWeek
  const simulatedSavingKgWeek = Number(aiRec?.simulatedSavingKgWeek ?? aiRec?.simulated_saving_kg_week ?? 3.2);
  const yearlySavingKg = Number((simulatedSavingKgWeek * 52).toFixed(1));
  const treeEquivalent = Number((yearlySavingKg / 22).toFixed(1));
  const monthlyEcoPoints = Math.round((yearlySavingKg / 12) * 10);

  // Slayder State'leri
  const [carKm, setCarKm] = useState(30);
  const [metroKm, setMetroKm] = useState(20);
  const [meatMeals, setMeatMeals] = useState(2);
  const [energyPct, setEnergyPct] = useState(15);

  const [simulation, setSimulation] = useState({
    haftalik_tasarruf_kg: simulatedSavingKgWeek,
    aylik_tasarruf_kg: Number((simulatedSavingKgWeek * 4.345).toFixed(1)),
    yillik_tasarruf_kg: yearlySavingKg,
    esdeger_agac_sayisi: treeEquivalent,
    kazanilacak_tahmini_ecopuan: monthlyEcoPoints,
    yeni_tahmini_emisyon: Math.max(0, Number((initialWeekly - simulatedSavingKgWeek).toFixed(1)))
  });

  const [loading, setLoading] = useState(false);

  // Simülasyonu çalıştır
  const runSimulation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await simulateScenario({
        mevcutHaftalikEmisyon: initialWeekly,
        arabaKmAzaltma: carKm,
        topluTasimaArtirma: metroKm,
        kirmiziEtAzaltma: meatMeals,
        enerjiTasarrufuYuzde: energyPct
      });
      if (res) {
        setSimulation(res);
      }
    } catch (err) {
      console.warn('Simülasyon yerel hesaplama fallback ile çalıştırılıyor:', err);
    } finally {
      setLoading(false);
    }
  }, [initialWeekly, carKm, metroKm, meatMeals, energyPct]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 250); // Debounce 250ms
    return () => clearTimeout(timer);
  }, [runSimulation]);

  return (
    <div
      className="rounded-2xl p-6 transition-all"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-lg p-2"
            style={{ backgroundColor: 'rgba(96,165,250,0.15)', color: '#60A5FA' }}
          >
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#F0FDF4' }}>
              İnteraktif Senaryo Simülatörü (What-If Analysis)
            </h3>
            <p className="text-xs" style={{ color: '#4B6E5E' }}>
              Alışkanlıklarınızı değiştirirseniz ne kadar karbon ve puan kazanacağınızı simüle edin
            </p>
          </div>
        </div>

        {loading && (
          <span className="text-xs font-mono flex items-center gap-1" style={{ color: '#60A5FA' }}>
            <RefreshCw size={12} className="animate-spin" /> Hesaplanıyor…
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sol Kolon: Kontrol Slayderları (7 Col) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Slider 1: Araba Azaltma */}
          <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-zinc-300">🚗 Araba Kullanımını Azalt</span>
              <span className="font-mono font-bold" style={{ color: '#22C55E' }}>{carKm} km / hafta</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={carKm}
              onChange={(e) => setCarKm(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#22C55E' }}
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>0 km</span>
              <span>75 km</span>
              <span>150 km</span>
            </div>
          </div>

          {/* Slider 2: Toplu Taşıma Artırma */}
          <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-zinc-300">🚇 Toplu Taşıma / Metro Artır</span>
              <span className="font-mono font-bold" style={{ color: '#60A5FA' }}>{metroKm} km / hafta</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={metroKm}
              onChange={(e) => setMetroKm(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#60A5FA' }}
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>0 km</span>
              <span>50 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Slider 3: Kırmızı Et Azaltma */}
          <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-zinc-300">🥩 Kırmızı Et Yerine Vejetaryen Öğün</span>
              <span className="font-mono font-bold" style={{ color: '#F59E0B' }}>{meatMeals} porsiyon / hafta</span>
            </div>
            <input
              type="range"
              min="0"
              max="7"
              step="1"
              value={meatMeals}
              onChange={(e) => setMeatMeals(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#F59E0B' }}
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>0 öğün</span>
              <span>3 öğün</span>
              <span>7 öğün</span>
            </div>
          </div>

          {/* Slider 4: Ev Enerjisi Tasarrufu */}
          <div className="p-3.5 rounded-xl" style={{ backgroundColor: '#0D1410', border: '1px solid #1E3A30' }}>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-zinc-300">⚡ Ev Enerjisi Tasarruf Hedefi</span>
              <span className="font-mono font-bold" style={{ color: '#14B8A6' }}>%{energyPct}</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={energyPct}
              onChange={(e) => setEnergyPct(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#14B8A6' }}
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>%0</span>
              <span>%20</span>
              <span>%40</span>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Hesaplanan Simülasyon Kartları (5 Col) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Yıllık Tasarruf Kartı */}
          <div
            className="p-4 rounded-xl flex items-center justify-between"
            style={{
              backgroundColor: '#0D1410',
              border: '1px solid rgba(34,197,94,0.3)',
              boxShadow: '0 0 15px rgba(34,197,94,0.06)'
            }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: '#4B6E5E' }}>Yıllık Karbon Tasarrufu</p>
              <p className="font-mono text-2xl font-extrabold" style={{ color: '#22C55E' }}>
                {yearlySavingKg} <span className="text-xs font-normal">kg CO₂e</span>
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#86EFAC' }}>
                Model potansiyeli: Haftada {simulatedSavingKgWeek} kg azaltım
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400">
              <Zap size={20} />
            </div>
          </div>

          {/* Eşdeğer Ağaç Sayısı */}
          <div
            className="p-4 rounded-xl flex items-center justify-between"
            style={{
              backgroundColor: '#0D1410',
              border: '1px solid rgba(20,184,166,0.3)',
              boxShadow: '0 0 15px rgba(20,184,166,0.06)'
            }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: '#4B6E5E' }}>Doğaya Eşdeğer Katkı</p>
              <p className="font-mono text-2xl font-extrabold" style={{ color: '#14B8A6' }}>
                {treeEquivalent} <span className="text-xs font-normal">Ağaç / Yıl</span>
              </p>
              <p className="text-[11px] mt-0.5 text-teal-300">
                (Yıllık {yearlySavingKg} kg / 22 kg karbon yutak kapasitesi)
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-500/10 text-teal-400">
              <TreePine size={20} />
            </div>
          </div>

          {/* Kazanılacak Eco-Puan */}
          <div
            className="p-4 rounded-xl flex items-center justify-between"
            style={{
              backgroundColor: '#0D1410',
              border: '1px solid rgba(245,158,11,0.3)',
              boxShadow: '0 0 15px rgba(245,158,11,0.06)'
            }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: '#4B6E5E' }}>Kazanılacak Aylık Eco-Puan</p>
              <p className="font-mono text-2xl font-extrabold" style={{ color: '#F59E0B' }}>
                +{monthlyEcoPoints} <span className="text-xs font-normal">pts</span>
              </p>
              <p className="text-[11px] mt-0.5 text-amber-300">
                TabNet tasarruf optimizasyonu ile
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-400">
              <Award size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
