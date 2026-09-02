import { Minus, Plus } from 'lucide-react';
import {
  TRANSPORT_VEHICLES,
  ENERGY_TYPES,
  MEAL_TYPES,
  WASTE_TYPES,
  nowDateTimeLocal,
} from './activityConstants';

// ── Shared sub-components ─────────────────────────────────────────

function FormCard({ children }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{
        backgroundColor: '#111816',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px #1E3A30',
      }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <p className="text-xs font-semibold mb-2" style={{ color: '#4B6E5E' }}>
      {children}
    </p>
  );
}

function NumberInput({ value, onChange, min = 0, max = 9999, unit }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        className="font-mono text-3xl font-extrabold w-32 bg-transparent outline-none border-b-2 text-right"
        style={{ color: '#22C55E', borderColor: '#1E3A30' }}
        onFocus={e => (e.target.style.borderColor = '#22C55E')}
        onBlur={e => (e.target.style.borderColor = '#1E3A30')}
      />
      <span className="text-base font-semibold" style={{ color: '#4B6E5E' }}>{unit}</span>
    </div>
  );
}

function RangeSlider({ value, onChange, min = 0, max, step = 1 }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-green-500 h-1.5 rounded-full cursor-pointer"
      style={{ accentColor: '#22C55E' }}
    />
  );
}

function DateTimeField({ value, onChange }) {
  return (
    <div>
      <FieldLabel>Tarih &amp; Saat</FieldLabel>
      <input
        type="datetime-local"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
        style={{
          backgroundColor: '#182420',
          border: '1px solid #1E3A30',
          color: '#86EFAC',
          colorScheme: 'dark',
        }}
        onFocus={e => (e.target.style.borderColor = '#22C55E')}
        onBlur={e => (e.target.style.borderColor = '#1E3A30')}
      />
    </div>
  );
}

function NoteField({ value, onChange }) {
  return (
    <div>
      <FieldLabel>Açıklama / Not (İsteğe Bağlı)</FieldLabel>
      <textarea
        rows={2}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Örn: İş toplantısı dönüşü, otobüs doluştu..."
        className="w-full rounded-xl px-4 py-2.5 text-sm resize-none outline-none transition-colors"
        style={{
          backgroundColor: '#182420',
          border: '1px solid #1E3A30',
          color: '#86EFAC',
          colorScheme: 'dark',
        }}
        onFocus={e => (e.target.style.borderColor = '#22C55E')}
        onBlur={e => (e.target.style.borderColor = '#1E3A30')}
      />
    </div>
  );
}

// ── Transport Form ────────────────────────────────────────────────
function TransportForm({ formData, setFormData }) {
  const { vehicleId = 'car', distance = 10, datetime, note } = formData;

  function setField(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }));
  }

  return (
    <FormCard>
      <div>
        <FieldLabel>Taşıt Türü</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          {TRANSPORT_VEHICLES.map(v => {
            const active = vehicleId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setField('vehicleId', v.id)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 transition-all duration-150"
                style={{
                  backgroundColor: active ? 'rgba(34,197,94,0.12)' : '#182420',
                  border: `1px solid ${active ? '#22C55E' : '#1E3A30'}`,
                  boxShadow: active ? '0 0 12px rgba(34,197,94,0.18)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.borderColor = '#22C55E88';
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.borderColor = '#1E3A30';
                }}
              >
                <span className="text-xl">{v.emoji}</span>
                <span className="text-xs font-medium" style={{ color: active ? '#22C55E' : '#86EFAC' }}>
                  {v.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between mb-2">
          <FieldLabel>Mesafe</FieldLabel>
          <span className="text-xs font-mono" style={{ color: '#4B6E5E' }}>{distance} km</span>
        </div>
        <NumberInput value={distance} onChange={v => setField('distance', v)} min={0} max={5000} unit="km" />
        <div className="mt-3">
          <RangeSlider value={distance} onChange={v => setField('distance', v)} min={0} max={500} step={1} />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#1E3A30' }}>
            <span>0</span><span>250</span><span>500 km</span>
          </div>
        </div>
      </div>

      <DateTimeField value={datetime} onChange={v => setField('datetime', v)} />
      <NoteField value={note} onChange={v => setField('note', v)} />
    </FormCard>
  );
}

// ── Energy Form ───────────────────────────────────────────────────
function EnergyForm({ formData, setFormData }) {
  const { energyTypeId = 'electricity', amount = 10, datetime, note } = formData;

  function setField(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }));
  }

  const currentType = ENERGY_TYPES.find(t => t.id === energyTypeId) ?? ENERGY_TYPES[0];

  return (
    <FormCard>
      <div>
        <FieldLabel>Enerji Türü</FieldLabel>
        <div className="flex gap-2">
          {ENERGY_TYPES.map(t => {
            const active = energyTypeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setField('energyTypeId', t.id)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? 'rgba(245,158,11,0.12)' : '#182420',
                  border: `1px solid ${active ? '#F59E0B' : '#1E3A30'}`,
                  color: active ? '#F59E0B' : '#86EFAC',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between mb-2">
          <FieldLabel>Tüketim Miktarı</FieldLabel>
          <span className="text-xs font-mono" style={{ color: '#4B6E5E' }}>
            {amount} {currentType.unit}
          </span>
        </div>
        <NumberInput
          value={amount}
          onChange={v => setField('amount', v)}
          min={0}
          max={10000}
          unit={currentType.unit}
        />
        <div className="mt-3">
          <RangeSlider value={amount} onChange={v => setField('amount', v)} min={0} max={500} step={1} />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#1E3A30' }}>
            <span>0</span><span>250</span><span>500 {currentType.unit}</span>
          </div>
        </div>
      </div>

      <DateTimeField value={datetime} onChange={v => setField('datetime', v)} />
      <NoteField value={note} onChange={v => setField('note', v)} />
    </FormCard>
  );
}

// ── Food Form ─────────────────────────────────────────────────────
function FoodForm({ formData, setFormData }) {
  const { mealTypeId = 'vegetarian', portions = 1, datetime, note } = formData;

  function setField(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }));
  }

  return (
    <FormCard>
      <div>
        <FieldLabel>Öğün Türü</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {MEAL_TYPES.map(m => {
            const active = mealTypeId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setField('mealTypeId', m.id)}
                className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? 'rgba(20,184,166,0.12)' : '#182420',
                  border: `1px solid ${active ? '#14B8A6' : '#1E3A30'}`,
                  color: active ? '#14B8A6' : '#86EFAC',
                }}
              >
                <span className="text-lg">{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel>Porsiyon Sayısı</FieldLabel>
        <NumberInput
          value={portions}
          onChange={v => setField('portions', Math.max(1, v))}
          min={1}
          max={10}
          unit="porsiyon"
        />
        <div className="mt-3">
          <RangeSlider value={portions} onChange={v => setField('portions', v)} min={1} max={10} step={1} />
        </div>
      </div>

      <DateTimeField value={datetime} onChange={v => setField('datetime', v)} />
      <NoteField value={note} onChange={v => setField('note', v)} />
    </FormCard>
  );
}

// ── Waste Form ────────────────────────────────────────────────────
function WasteForm({ formData, setFormData }) {
  const { wasteItems = {}, datetime, note } = formData;

  function setField(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }));
  }

  function adjustItem(wasteId, delta) {
    setFormData(prev => {
      const current = prev.wasteItems ?? {};
      const newVal = Math.max(0, (current[wasteId] ?? 0) + delta);
      return { ...prev, wasteItems: { ...current, [wasteId]: newVal } };
    });
  }

  return (
    <FormCard>
      <div>
        <FieldLabel>Atık Türü &amp; Miktar</FieldLabel>
        <div className="flex flex-col gap-2">
          {WASTE_TYPES.map(w => {
            const qty = wasteItems[w.id] ?? 0;
            return (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{w.emoji}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#86EFAC' }}>{w.label}</p>
                    <p className="text-xs" style={{ color: '#4B6E5E' }}>
                      {w.factor} kg CO₂e / {w.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustItem(w.id, -1)}
                    disabled={qty === 0}
                    className="flex items-center justify-center rounded-lg transition-colors"
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: '#111816',
                      border: '1px solid #1E3A30',
                      color: qty === 0 ? '#1E3A30' : '#86EFAC',
                      cursor: qty === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className="font-mono font-bold w-6 text-center"
                    style={{ color: qty > 0 ? '#22C55E' : '#4B6E5E' }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => adjustItem(w.id, +1)}
                    className="flex items-center justify-center rounded-lg transition-colors"
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: '#111816',
                      border: '1px solid #1E3A30',
                      color: '#86EFAC',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
                  >
                    <Plus size={14} />
                  </button>
                  <span className="text-xs w-8 text-right" style={{ color: '#4B6E5E' }}>{w.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DateTimeField value={datetime} onChange={v => setField('datetime', v)} />
      <NoteField value={note} onChange={v => setField('note', v)} />
    </FormCard>
  );
}

// ── Main Export ───────────────────────────────────────────────────
export default function DynamicActivityForm({ category, formData, setFormData }) {
  const props = { formData, setFormData };
  if (category === 'transport') return <TransportForm {...props} />;
  if (category === 'energy')    return <EnergyForm    {...props} />;
  if (category === 'food')      return <FoodForm      {...props} />;
  if (category === 'waste')     return <WasteForm     {...props} />;
  return null;
}
