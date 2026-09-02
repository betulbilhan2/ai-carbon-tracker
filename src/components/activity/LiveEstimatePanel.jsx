import { Bot, ArrowRight, Leaf } from 'lucide-react';
import {
  TRANSPORT_VEHICLES,
  ENERGY_TYPES,
  MEAL_TYPES,
  WASTE_TYPES,
} from './activityConstants';

// ── Compute emission from current form ───────────────────────────
export function computeEmission(category, formData) {
  if (category === 'transport') {
    const vehicle = TRANSPORT_VEHICLES.find(v => v.id === (formData.vehicleId ?? 'car'));
    const dist    = formData.distance ?? 0;
    return { kg: +(vehicle.factor * dist).toFixed(2), factor: vehicle.factor, unit: 'km', vehicle };
  }
  if (category === 'energy') {
    const type   = ENERGY_TYPES.find(t => t.id === (formData.energyTypeId ?? 'electricity'));
    const amount = formData.amount ?? 0;
    return { kg: +(type.factor * amount).toFixed(2), factor: type.factor, unit: type.unit, type };
  }
  if (category === 'food') {
    const meal     = MEAL_TYPES.find(m => m.id === (formData.mealTypeId ?? 'vegetarian'));
    const portions = formData.portions ?? 1;
    return { kg: +(meal.factor * portions).toFixed(2), factor: meal.factor, unit: 'porsiyon', meal };
  }
  if (category === 'waste') {
    const items = formData.wasteItems ?? {};
    let total = 0;
    WASTE_TYPES.forEach(w => { total += w.factor * (items[w.id] ?? 0); });
    return { kg: +total.toFixed(2) };
  }
  return { kg: 0 };
}

// ── Alternative comparison ────────────────────────────────────────
function getAlternative(category, formData) {
  if (category !== 'transport') return null;
  const vehicle = TRANSPORT_VEHICLES.find(v => v.id === (formData.vehicleId ?? 'car'));
  if (!vehicle?.altId) return null;
  const alt     = TRANSPORT_VEHICLES.find(v => v.id === vehicle.altId);
  const dist    = formData.distance ?? 0;
  const altKg   = +(alt.factor * dist).toFixed(2);
  const save    = +((vehicle.factor - alt.factor) * dist).toFixed(2);
  return save > 0 ? { label: alt.label, emoji: alt.emoji, altKg, save } : null;
}

// ── AI advice per category ────────────────────────────────────────
const AI_TIPS = {
  transport: (fd) => {
    const dist = fd.distance ?? 0;
    const weekly = +(dist * 2 * 0.145 - dist * 2 * 0.02).toFixed(1);
    return `Bu güzergahı haftada 2 gün metroya çevirmek aylık ≈ ${(weekly * 4).toFixed(0)} kg CO₂e tasarrufu sağlar.`;
  },
  energy: (fd) => {
    const amt   = fd.amount ?? 0;
    const saved = +(amt * 0.481 * 0.15).toFixed(1);
    return `LED aydınlatmaya geçmek ve %15 enerji verimliliği sağlamak bu aktivitede ≈ ${saved} kg CO₂e tasarrufu yaratır.`;
  },
  food: () =>
    'Haftada 2 öğünü vejetaryen yaparak yıllık ≈ 180 kg CO₂e tasarrufu sağlayabilirsin.',
  waste: () =>
    'Geri dönüşüm kutularını doğru kullanmak ve organik atıkları kompostlamak emisyonunu %40 azaltabilir.',
};

// ── Main Component ────────────────────────────────────────────────
export default function LiveEstimatePanel({ category, formData, onSave, saving }) {
  const { kg } = computeEmission(category, formData);
  const alt    = getAlternative(category, formData);

  // Detail label
  let detailLabel = '';
  if (category === 'transport') {
    const v = TRANSPORT_VEHICLES.find(x => x.id === (formData.vehicleId ?? 'car'));
    detailLabel = `${v?.label} · ${formData.distance ?? 0} km · (${v?.factor} kg/km emisyon katsayısı)`;
  } else if (category === 'energy') {
    const t = ENERGY_TYPES.find(x => x.id === (formData.energyTypeId ?? 'electricity'));
    detailLabel = `${t?.label} · ${formData.amount ?? 0} ${t?.unit} · (${t?.factor} kg CO₂e/${t?.unit})`;
  } else if (category === 'food') {
    const m = MEAL_TYPES.find(x => x.id === (formData.mealTypeId ?? 'vegetarian'));
    detailLabel = `${m?.label} · ${formData.portions ?? 1} porsiyon · (${m?.factor} kg CO₂e/porsiyon)`;
  } else if (category === 'waste') {
    const items = formData.wasteItems ?? {};
    const total = Object.values(items).reduce((s, v) => s + v, 0);
    detailLabel = `${total} kalem atık kaydedildi`;
  }

  const aiTip = AI_TIPS[category]?.(formData) ?? '';

  return (
    <div className="flex flex-col gap-4">
      {/* ── Live Estimate Card ── */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          backgroundColor: '#111816',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
        }}
      >
        <h3 className="text-sm font-semibold" style={{ color: '#86EFAC' }}>
          Anlık Karbon Hesabı &amp; Karşılaştırma
        </h3>

        {/* Big value */}
        <div>
          <p className="text-xs mb-1" style={{ color: '#4B6E5E' }}>Tahmini Emisyon</p>
          <p
            className="font-mono font-extrabold leading-none transition-all duration-300"
            style={{ fontSize: 40, color: kg > 10 ? '#EF4444' : kg > 5 ? '#F59E0B' : '#22C55E' }}
          >
            ≈ {kg.toFixed(1)} kg
          </p>
          <p className="text-xs mt-1" style={{ color: '#4B6E5E' }}>CO₂e</p>
        </div>

        {/* Factor detail */}
        {detailLabel && (
          <p className="text-xs" style={{ color: '#4B6E5E' }}>
            Seçilen: <span style={{ color: '#86EFAC' }}>{detailLabel}</span>
          </p>
        )}

        {/* Alternative comparison */}
        {alt && (
          <div
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
          >
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#4B6E5E' }}>
                {alt.emoji} {alt.label} kullansaydın:
              </p>
              <p className="font-mono text-sm font-bold" style={{ color: '#60A5FA' }}>
                {alt.altKg.toFixed(1)} kg CO₂e
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
            >
              −{alt.save.toFixed(1)} kg
            </span>
          </div>
        )}
      </div>

      {/* ── AI Suggestion Box ── */}
      <div
        className="rounded-2xl px-5 py-4 flex gap-3"
        style={{
          backgroundColor: '#111816',
          border: '1px solid #14B8A6',
          boxShadow: '0 0 16px rgba(20,184,166,0.08)',
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 32, height: 32, backgroundColor: 'rgba(20,184,166,0.12)', marginTop: 2 }}
        >
          <Bot size={16} color="#14B8A6" />
        </div>
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: '#14B8A6' }}>
            TabNet Tavsiyesi
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#4B6E5E' }}>
            {aiTip}
          </p>
        </div>
      </div>

      {/* ── Save Button ── */}
      <button
        onClick={onSave}
        disabled={saving || kg === 0}
        className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200"
        style={{
          height: 52,
          backgroundColor: saving || kg === 0 ? '#1E3A30' : '#22C55E',
          color: saving || kg === 0 ? '#4B6E5E' : '#0A0F0D',
          cursor: saving || kg === 0 ? 'not-allowed' : 'pointer',
          boxShadow: saving || kg === 0 ? 'none' : '0 0 20px rgba(34,197,94,0.25)',
        }}
        onMouseEnter={e => {
          if (!saving && kg > 0) e.currentTarget.style.backgroundColor = '#16A34A';
        }}
        onMouseLeave={e => {
          if (!saving && kg > 0) e.currentTarget.style.backgroundColor = '#22C55E';
        }}
      >
        <Leaf size={16} />
        {saving ? 'Kaydediliyor...' : kg === 0 ? 'Lütfen değer girin' : 'Aktiviteyi Kaydet 🌱'}
      </button>
    </div>
  );
}
