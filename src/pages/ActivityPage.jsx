import { useState, useCallback } from 'react';
import CategoryTabs        from '../components/activity/CategoryTabs';
import DynamicActivityForm from '../components/activity/DynamicActivityForm';
import LiveEstimatePanel, { computeEmission } from '../components/activity/LiveEstimatePanel';
import RecentLogsTable, { INITIAL_LOGS }      from '../components/activity/RecentLogsTable';
import {
  TRANSPORT_VEHICLES,
  ENERGY_TYPES,
  MEAL_TYPES,
  WASTE_TYPES,
  nowDateTimeLocal,
} from '../components/activity/activityConstants';

// ── Build a fresh empty form for a category ───────────────────────
function defaultForm() {
  return {
    vehicleId:    'car',
    distance:     10,
    energyTypeId: 'electricity',
    amount:       10,
    mealTypeId:   'vegetarian',
    portions:     1,
    wasteItems:   {},
    datetime:     nowDateTimeLocal(),
    note:         '',
  };
}

// ── Build detail label for log table ─────────────────────────────
function buildDetail(category, formData) {
  if (category === 'transport') {
    const v = TRANSPORT_VEHICLES.find(x => x.id === formData.vehicleId);
    return `${v?.label ?? '?'} · ${formData.distance} km`;
  }
  if (category === 'energy') {
    const t = ENERGY_TYPES.find(x => x.id === formData.energyTypeId);
    return `${t?.label ?? '?'} · ${formData.amount} ${t?.unit ?? ''}`;
  }
  if (category === 'food') {
    const m = MEAL_TYPES.find(x => x.id === formData.mealTypeId);
    return `${m?.label ?? '?'} · ${formData.portions} porsiyon`;
  }
  if (category === 'waste') {
    const items  = formData.wasteItems ?? {};
    const pieces = WASTE_TYPES
      .filter(w => (items[w.id] ?? 0) > 0)
      .map(w => `${w.label} × ${items[w.id]}`)
      .join(', ');
    return pieces || 'Atık seçilmedi';
  }
  return '';
}

// ── Success Toast ─────────────────────────────────────────────────
function SuccessToast({ visible }) {
  if (!visible) return null;
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-5 py-3 mb-6 text-sm font-medium transition-all"
      style={{
        backgroundColor: 'rgba(34,197,94,0.12)',
        border: '1px solid rgba(34,197,94,0.3)',
        color: '#22C55E',
      }}
    >
      <span>✅</span>
      <span>Aktivite başarıyla kaydedildi! Tablo ve KPI'lar güncellendi.</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
let nextId = 100;

export default function ActivityPage({ onActivitySaved }) {
  const [category, setCategory] = useState('transport');
  const [formData, setFormData] = useState(defaultForm());
  const [logs,     setLogs]     = useState(INITIAL_LOGS);
  const [saving,   setSaving]   = useState(false);
  const [toastOn,  setToastOn]  = useState(false);

  // Switch category → reset form but keep datetime/note
  function handleCategoryChange(cat) {
    setCategory(cat);
    setFormData(prev => ({
      ...defaultForm(),
      datetime: prev.datetime,
      note:     '',
    }));
  }

  const handleSave = useCallback(() => {
    const { kg } = computeEmission(category, formData);
    if (kg === 0) return;

    setSaving(true);

    // Simulate async DB write
    setTimeout(() => {
      const newLog = {
        id:       nextId++,
        datetime: formData.datetime,
        category,
        detail:   buildDetail(category, formData),
        kg,
      };

      setLogs(prev => [newLog, ...prev]);
      setFormData(defaultForm());
      setSaving(false);
      setToastOn(true);

      // Propagate up to App for global KPI update
      onActivitySaved?.({ kg, category });

      setTimeout(() => setToastOn(false), 3500);
    }, 600);
  }, [category, formData, onActivitySaved]);

  function handleDelete(id) {
    setLogs(prev => prev.filter(l => l.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Toast ── */}
      <SuccessToast visible={toastOn} />

      {/* ── Category Tab Bar ── */}
      <CategoryTabs activeCategory={category} onChange={handleCategoryChange} />

      {/* ── Two-column: Form (60%) + Live Panel (40%) ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 0.65fr', alignItems: 'start' }}>
        <DynamicActivityForm
          category={category}
          formData={formData}
          setFormData={setFormData}
        />
        <LiveEstimatePanel
          category={category}
          formData={formData}
          onSave={handleSave}
          saving={saving}
        />
      </div>

      {/* ── Recent Logs Table ── */}
      <RecentLogsTable logs={logs} onDelete={handleDelete} />
    </div>
  );
}
