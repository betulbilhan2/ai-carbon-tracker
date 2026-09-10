import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const SERIES = [
  { key: 'transport', label: '🚗 Ulaşım',   color: '#22C55E' },
  { key: 'energy',    label: '⚡ Enerji',    color: '#F59E0B' },
  { key: 'food',      label: '🥗 Beslenme',  color: '#14B8A6' },
  { key: 'waste',     label: '♻️ Atık',      color: '#60A5FA' },
];

function resolveCategory(act) {
  const catId = Number(act?.kategoriId ?? act?.kategori_id ?? 0);
  const catName = String(act?.kategoriAdi ?? act?.category ?? '').toLowerCase();

  if (
    (catId >= 1 && catId <= 6) ||
    catName.includes('ulaşım') ||
    catName.includes('ulasim') ||
    catName.includes('transport') ||
    catName.includes('araba') ||
    catName.includes('metro') ||
    catName.includes('otobüs') ||
    catName.includes('bisiklet') ||
    catName.includes('uçak')
  ) {
    return 'transport';
  }
  if (
    (catId >= 7 && catId <= 9) ||
    catName.includes('enerji') ||
    catName.includes('energy') ||
    catName.includes('elektrik') ||
    catName.includes('doğalgaz') ||
    catName.includes('dogalgaz') ||
    catName.includes('kömür') ||
    catName.includes('komur')
  ) {
    return 'energy';
  }
  if (
    (catId >= 10 && catId <= 13) ||
    catName.includes('beslenme') ||
    catName.includes('food') ||
    catName.includes('et') ||
    catName.includes('vejetaryen') ||
    catName.includes('vegan')
  ) {
    return 'food';
  }
  if (
    (catId >= 14 && catId <= 17) ||
    catName.includes('atık') ||
    catName.includes('atik') ||
    catName.includes('waste') ||
    catName.includes('plastik') ||
    catName.includes('kağıt') ||
    catName.includes('kagit') ||
    catName.includes('cam') ||
    catName.includes('organik')
  ) {
    return 'waste';
  }
  return 'transport';
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{ backgroundColor: '#182420', border: '1px solid #1E3A30', minWidth: 160 }}
    >
      <p className="font-semibold mb-2" style={{ color: '#86EFAC' }}>{label}</p>
      {payload.map(p => {
        const series = SERIES.find(s => s.key === p.dataKey);
        return (
          <p key={p.dataKey} className="mt-0.5" style={{ color: series?.color ?? '#F0FDF4' }}>
            {series?.label ?? p.dataKey}:{' '}
            <span className="font-mono font-bold">{Number(p.value || 0).toFixed(1)} kg</span>
          </p>
        );
      })}
      <p className="mt-2 pt-2 font-mono font-bold" style={{ color: '#F0FDF4', borderTop: '1px solid #1E3A30' }}>
        Toplam: {total.toFixed(1)} kg
      </p>
    </div>
  );
}

export default function WeeklyStackedBarChart({ activities = [], summary, latestAiRecommendation }) {
  // Veritabanı aktivitelerini veya profil tabanlı dağılımı hesapla
  const { chartData, isProfileBased, totalWeeklyKg } = useMemo(() => {
    const weekData = DAYS.map(day => ({
      day,
      transport: 0,
      energy: 0,
      food: 0,
      waste: 0,
    }));

    let realCount = 0;
    if (Array.isArray(activities) && activities.length > 0) {
      const now = new Date();
      activities.forEach(act => {
        const dateStr = act?.aktiviteTarihi || act?.datetime || act?.tarih;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return;

        // Son 14 gün içindeki aktiviteleri haftanın ilgili gününe dağıt
        const diffDays = Math.abs(now - d) / (1000 * 60 * 60 * 24);
        if (diffDays <= 14) {
          const dayShort = d.toLocaleDateString('tr-TR', { weekday: 'short' });
          const dayIdx = DAYS.findIndex(day => dayShort.toLowerCase().startsWith(day.toLowerCase()) || day.toLowerCase().startsWith(dayShort.toLowerCase()));
          const cat = resolveCategory(act);
          const kg = Number(act?.hesaplananKarbon ?? act?.kg ?? act?.karbonMiktari ?? 0);
          if (kg > 0 && dayIdx >= 0 && dayIdx < 7) {
            weekData[dayIdx][cat] = Number((weekData[dayIdx][cat] + kg).toFixed(1));
            realCount++;
          }
        }
      });
    }

    // Gerçek aktiviteler varsa onları göster
    if (realCount > 0) {
      const total = weekData.reduce((acc, d) => acc + d.transport + d.energy + d.food + d.waste, 0);
      return {
        chartData: weekData,
        isProfileBased: false,
        totalWeeklyKg: Number(total.toFixed(1)),
      };
    }

    // Aktivite yoksa: Karbon profilindeki 17 parametreden gelen ağırlıkları haftaya dağıt
    const profile = (() => {
      try {
        const saved = localStorage.getItem('user_carbon_profile');
        if (saved) return JSON.parse(saved);
      } catch {}
      return null;
    })();

    // 1. Ulaşım ağırlığı
    const carKmMonth = Number(profile?.vehicle_distance_km_month ?? 150);
    const weeklyKm = carKmMonth / 4.345;
    const vType = profile?.vehicle_type || 'petrol';
    const transFactor = vType === 'diesel' ? 0.165 : vType === 'hybrid' ? 0.08 : vType === 'electric' ? 0.04 : 0.145;
    const flightWeekly = profile?.frequency_of_traveling_by_air === 'frequently' ? 6.0 : profile?.frequency_of_traveling_by_air === 'sometimes' ? 3.0 : 1.0;
    const rawTransport = Math.max(2.0, (weeklyKm * transFactor) + flightWeekly);

    // 2. Enerji ağırlığı
    const heating = profile?.heating_energy_source || 'natural_gas';
    const heatBase = heating === 'coal' ? 10.0 : heating === 'electricity' ? 7.5 : 5.5;
    const eff = profile?.energy_efficiency || 'medium';
    const effFactor = eff === 'high' ? 0.75 : eff === 'low' ? 1.3 : 1.0;
    const tvPc = Number(profile?.tv_pc_daily_hour ?? 4) * 0.2;
    const rawEnergy = Math.max(2.0, (heatBase * effFactor) + tvPc);

    // 3. Beslenme ağırlığı
    const diet = profile?.diet || 'omnivore';
    const dietBase = diet === 'vegan' ? 2.5 : diet === 'vegetarian' ? 4.0 : diet === 'pescatarian' ? 6.0 : 9.5;
    const groceryFactor = Math.min(1.4, Math.max(0.7, Number(profile?.monthly_grocery_bill ?? 250) / 250));
    const rawFood = dietBase * groceryFactor;

    // 4. Atık ağırlığı
    const bags = Number(profile?.waste_bag_weekly_count ?? 3);
    const bagSize = profile?.waste_bag_size === 'large' ? 1.4 : profile?.waste_bag_size === 'small' ? 0.6 : 1.0;
    const recObj = profile?.recycling || { paper: true, plastic: true };
    const recCount = Object.values(recObj).filter(Boolean).length;
    const recDiscount = Math.max(0.5, 1 - (recCount * 0.12));
    const clothes = Number(profile?.new_clothes_monthly ?? 2) * 0.5;
    const rawWaste = Math.max(1.0, (bags * bagSize * 1.2 * recDiscount) + clothes);

    // Model haftalık hedefi ile kalibre et
    const targetTotal = Number(latestAiRecommendation?.actualWeeklyKg ?? 25.4);
    const rawSum = rawTransport + rawEnergy + rawFood + rawWaste;
    const scale = targetTotal > 0 && rawSum > 0 ? targetTotal / rawSum : 1.0;

    const weeklyTransport = rawTransport * scale;
    const weeklyEnergy    = rawEnergy * scale;
    const weeklyFood      = rawFood * scale;
    const weeklyWaste     = rawWaste * scale;

    const DAY_WEIGHTS = {
      transport: [0.17, 0.18, 0.17, 0.16, 0.18, 0.08, 0.06],
      energy:    [0.13, 0.13, 0.13, 0.14, 0.14, 0.17, 0.16],
      food:      [0.13, 0.13, 0.13, 0.13, 0.14, 0.18, 0.16],
      waste:     [0.12, 0.16, 0.12, 0.18, 0.14, 0.14, 0.14],
    };

    const profileData = DAYS.map((day, i) => ({
      day,
      transport: Number((weeklyTransport * DAY_WEIGHTS.transport[i]).toFixed(1)),
      energy:    Number((weeklyEnergy * DAY_WEIGHTS.energy[i]).toFixed(1)),
      food:      Number((weeklyFood * DAY_WEIGHTS.food[i]).toFixed(1)),
      waste:     Number((weeklyWaste * DAY_WEIGHTS.waste[i]).toFixed(1)),
    }));

    return {
      chartData: profileData,
      isProfileBased: true,
      totalWeeklyKg: targetTotal,
    };
  }, [activities, latestAiRecommendation]);

  return (
    <div
      className="rounded-2xl p-6 transition-all"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-sm font-semibold" style={{ color: '#86EFAC' }}>
            Haftalık Kategorik Emisyon Kırılımı{' '}
            <span style={{ color: '#4B6E5E', fontWeight: 400 }}>(kg CO₂e)</span>
          </h3>
          {isProfileBased ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{
                backgroundColor: 'rgba(96,165,250,0.12)',
                border: '1px solid rgba(96,165,250,0.3)',
                color: '#60A5FA',
              }}
              title="Henüz bu haftaya ait aktivite kaydı bulunmadığından Karbon Profili 17 parametresine göre dağıtılmıştır."
            >
              <span>⚡</span> (Profil Tabanlı Dağılım)
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{
                backgroundColor: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#22C55E',
              }}
            >
              <span>●</span> Gerçek Aktivite Kayıtları
            </span>
          )}
        </div>

        <span className="text-xs font-mono text-zinc-400">
          Haftalık Toplam: <strong className="text-emerald-400 font-bold">{totalWeeklyKg} kg</strong>
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
          barSize={24}
        >
          <CartesianGrid stroke="#1E3A30" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#4B6E5E', fontSize: 11 }}
            axisLine={{ stroke: '#1E3A30' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#4B6E5E', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}kg`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          {SERIES.map(({ key, color }, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="weekly"
              fill={color}
              radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pl-2">
        {SERIES.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <div className="rounded-sm" style={{ width: 10, height: 10, backgroundColor: color }} />
            <span className="text-xs" style={{ color: '#4B6E5E' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
