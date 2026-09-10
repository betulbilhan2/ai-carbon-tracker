import { useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';

const CLUSTER_CONFIG = {
  0: {
    name: 'Yeşil Öncü',
    desc: 'Yüksek çevre bilinci, toplu taşıma ve bisiklet önceliği, düşük beslenme emisyonu ve sıfır atık odaklı.',
    averages: { transport: 85, energy: 80, food: 88, waste: 85, overall: 85 },
    totalPeers: '1.420',
  },
  1: {
    name: 'Çevreci Komuter',
    desc: 'Toplu taşıma ve aktif geri dönüşüm alışkanlığı güçlü; beslenme ve ev enerjisinde optimizasyon potansiyeli var.',
    averages: { transport: 75, energy: 70, food: 60, waste: 75, overall: 70 },
    totalPeers: '1.240',
  },
  2: {
    name: 'Dengeli Şehirli',
    desc: 'Ortalama kentsel tüketim profili; ulaşım ve beslenme adımlarıyla hızlı karbon tasarrufu sağlayabilir.',
    averages: { transport: 60, energy: 65, food: 55, waste: 60, overall: 60 },
    totalPeers: '980',
  },
  3: {
    name: 'Yüksek Tüketim Profili',
    desc: 'Özel araç kullanımı ve yüksek enerji sarfiyatı belirgin; Fogg B=MAP mikro görevlerle tasarruf potansiyeli en yüksek küme.',
    averages: { transport: 45, energy: 52, food: 48, waste: 45, overall: 48 },
    totalPeers: '620',
  },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
    >
      <p className="font-semibold mb-1.5" style={{ color: '#86EFAC' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.dataKey === 'user' ? '#22C55E' : '#60A5FA' }}>
          {p.dataKey === 'user' ? '● Sen' : '◌ Küme Ort.'}: {' '}
          <span className="font-mono font-bold">{p.value} puan</span>
        </p>
      ))}
    </div>
  );
}

export default function ClusterRadarCard({ latestAiRecommendation }) {
  // Model çıktısındaki küme ID'si
  const clusterId = Number(latestAiRecommendation?.clusterId ?? latestAiRecommendation?.cluster_id ?? 1);
  const currentCluster = CLUSTER_CONFIG[clusterId] || CLUSTER_CONFIG[1];

  // Kullanıcının 17 yaşam tarzı parametresine göre dinamik eksen skorlarını hesapla
  const { radarData, userScores, overallScore } = useMemo(() => {
    let profile = null;
    try {
      const saved = localStorage.getItem('user_carbon_profile');
      if (saved) profile = JSON.parse(saved);
    } catch {}

    // 1. Ulaşım: Araç km 0 ise 100, 1500+ km ise 40 puan
    const carKm = Number(profile?.vehicle_distance_km_month ?? 150);
    let transportScore;
    if (carKm <= 0) {
      transportScore = 100;
    } else if (carKm >= 1500) {
      transportScore = 40;
    } else {
      transportScore = Math.round(100 - (carKm / 1500) * 60);
    }

    // 2. Beslenme: Vegan/Vejetaryen ise 95, Omnivore ise 60 puan
    const diet = (profile?.diet || 'omnivore').toLowerCase();
    let foodScore = 60;
    if (diet === 'vegan' || diet === 'vegetarian' || diet === 'vejetaryen') {
      foodScore = 95;
    } else if (diet === 'pescatarian') {
      foodScore = 78;
    } else {
      foodScore = 60;
    }

    // 3. Enerji: Verimlilik 'high' ise 90, 'low' ise 50 puan
    const eff = (profile?.energy_efficiency || 'medium').toLowerCase();
    let energyScore = 72;
    if (eff === 'high') {
      energyScore = 90;
    } else if (eff === 'low') {
      energyScore = 50;
    } else {
      energyScore = 72;
    }

    // 4. Atık: Seçili geri dönüşüm sayısına göre (+20 puan/kalem) ve çöp poşeti azlığına göre 40-100 arası
    const recObj = profile?.recycling || { paper: true, plastic: true, glass: false, metal: false };
    const recCount = Object.values(recObj).filter(Boolean).length;
    const bagCount = Number(profile?.waste_bag_weekly_count ?? 3);
    let bagBonus = 0;
    if (bagCount <= 1) bagBonus = 20;
    else if (bagCount === 2) bagBonus = 15;
    else if (bagCount === 3) bagBonus = 10;
    else bagBonus = 0;

    const rawWaste = 20 + (recCount * 20) + bagBonus;
    const wasteScore = Math.min(100, Math.max(40, rawWaste));

    // 5. Genel Skor: Bu 4 kategorinin ortalaması
    const avg = Math.round((transportScore + energyScore + foodScore + wasteScore) / 4);

    const data = [
      { axis: 'Ulaşım',     user: transportScore, cluster: currentCluster.averages.transport },
      { axis: 'Enerji',     user: energyScore,    cluster: currentCluster.averages.energy },
      { axis: 'Beslenme',   user: foodScore,      cluster: currentCluster.averages.food },
      { axis: 'Atık',       user: wasteScore,     cluster: currentCluster.averages.waste },
      { axis: 'Genel Skor', user: avg,            cluster: currentCluster.averages.overall },
    ];

    return {
      radarData: data,
      userScores: { transport: transportScore, energy: energyScore, food: foodScore, waste: wasteScore },
      overallScore: avg,
    };
  }, [currentCluster]);

  const isBetterThanCluster = overallScore >= currentCluster.averages.overall;

  return (
    <div
      className="rounded-2xl p-6 h-full transition-all flex flex-col justify-between"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      <div>
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#86EFAC' }}>
            Davranışsal Kullanıcı Kümesi (K-Means)
          </h3>
          {/* Cluster badge */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'rgba(20,184,166,0.15)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.25)' }}
          >
            <span className="font-mono">⬡</span>
            Küme {clusterId} — {currentCluster.name}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed mb-4" style={{ color: '#4B6E5E' }}>
          {currentCluster.desc}
        </p>

        {/* Radar Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
            <PolarGrid stroke="#1E3A30" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: '#4B6E5E', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#1E3A30', fontSize: 9 }}
              tickCount={4}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Cluster average — behind user */}
            <Radar
              name="cluster"
              dataKey="cluster"
              stroke="#60A5FA"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill="#60A5FA"
              fillOpacity={0.05}
            />
            {/* User profile */}
            <Radar
              name="user"
              dataKey="user"
              stroke="#22C55E"
              strokeWidth={2}
              fill="#22C55E"
              fillOpacity={0.12}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-2 justify-center">
          <div className="flex items-center gap-2">
            <div className="rounded-full" style={{ width: 9, height: 9, backgroundColor: '#22C55E' }} />
            <span className="text-xs" style={{ color: '#4B6E5E' }}>Senin Profilin ({overallScore} pts)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="2">
              <line x1="0" y1="1" x2="16" y2="1" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4 2" />
            </svg>
            <span className="text-xs" style={{ color: '#4B6E5E' }}>Küme Ort. ({currentCluster.averages.overall} pts)</span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="mt-4 rounded-xl px-4 py-3 text-xs"
        style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
      >
        <span style={{ color: '#4B6E5E' }}>
          Bu kümedeki{' '}
          <span className="font-mono font-bold" style={{ color: '#86EFAC' }}>{currentCluster.totalPeers}</span>{' '}
          kullanıcıdan senin profil skorun{' '}
          <span style={{ color: isBetterThanCluster ? '#22C55E' : '#F59E0B' }}>
            {isBetterThanCluster ? 'daha yüksek' : 'gelişim aşamasında'}
          </span>. {isBetterThanCluster ? '🎉' : '↗'}
        </span>
      </div>
    </div>
  );
}
