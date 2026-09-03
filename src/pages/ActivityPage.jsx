import { useState, useCallback, useEffect } from 'react';
import CategoryTabs        from '../components/activity/CategoryTabs';
import DynamicActivityForm from '../components/activity/DynamicActivityForm';
import LiveEstimatePanel, { computeEmission } from '../components/activity/LiveEstimatePanel';
import RecentLogsTable     from '../components/activity/RecentLogsTable';
import {
  TRANSPORT_VEHICLES,
  ENERGY_TYPES,
  MEAL_TYPES,
  WASTE_TYPES,
  nowDateTimeLocal,
} from '../components/activity/activityConstants';
import {
  createActivity,
  getRecentActivities,
  getCategories,
} from '../services/api';

// ── Kategori adı → backend kategori_id map ────────────────────────
// Frontend string ID'lerini backend integer kategori_id'ye çevirir.
// activityConstants.js → leaderboardData.js seed datası ile eşleşir.
const VEHICLE_ID_MAP = {
  bus:        3,   // Ulaşım - Otobüs
  metro:      2,   // Ulaşım - Metro
  car:        1,   // Ulaşım - Araba
  motorcycle: 4,   // Ulaşım - Motosiklet
  bike:       5,   // Ulaşım - Bisiklet
  plane:      6,   // Ulaşım - Uçak
};

const ENERGY_ID_MAP = {
  electricity: 7,  // Enerji - Elektrik
  naturalgas:  8,  // Enerji - Doğalgaz
  coal:        9,  // Enerji - Kömür
};

const MEAL_ID_MAP = {
  red_meat:   10,  // Beslenme - Kırmızı Et
  white_meat: 11,  // Beslenme - Beyaz Et
  vegetarian: 12,  // Beslenme - Vejetaryen
  vegan:      13,  // Beslenme - Vegan
};

const WASTE_ID_MAP = {
  plastic: 14,  // Atık - Plastik Şişe
  paper:   15,  // Atık - Kağıt/Karton
  glass:   16,  // Atık - Cam
  organic: 17,  // Atık - Organik
};

// Formdaki seçimi backend kategori_id + tüketim değerine dönüştür
function resolveBackendPayload(category, formData) {
  if (category === 'transport') {
    return {
      kategoriId:    VEHICLE_ID_MAP[formData.vehicleId] ?? 1,
      tuketimDegeri: Number(formData.distance) || 0,
    };
  }
  if (category === 'energy') {
    return {
      kategoriId:    ENERGY_ID_MAP[formData.energyTypeId] ?? 7,
      tuketimDegeri: Number(formData.amount) || 0,
    };
  }
  if (category === 'food') {
    return {
      kategoriId:    MEAL_ID_MAP[formData.mealTypeId] ?? 12,
      tuketimDegeri: Number(formData.portions) || 1,
    };
  }
  if (category === 'waste') {
    // Atık: en yüksek miktarlı kalemi birincil olarak gönder
    const items = formData.wasteItems ?? {};
    const entry = Object.entries(items)
      .filter(([, v]) => Number(v) > 0)
      .sort(([, a], [, b]) => Number(b) - Number(a))[0];

    if (!entry) return { kategoriId: 14, tuketimDegeri: 0 };
    return {
      kategoriId:    WASTE_ID_MAP[entry[0]] ?? 14,
      tuketimDegeri: Number(entry[1]),
    };
  }
  return { kategoriId: 1, tuketimDegeri: 0 };
}

// ── Default boş form ─────────────────────────────────────────────
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

// ── Log satırı için özet metni ────────────────────────────────────
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

// ── Toast Bileşeni ────────────────────────────────────────────────
function SuccessToast({ visible, message }) {
  if (!visible) return null;
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-5 py-3 mb-2 text-sm font-medium transition-all"
      style={{
        backgroundColor: 'rgba(34,197,94,0.12)',
        border: '1px solid rgba(34,197,94,0.3)',
        color: '#22C55E',
      }}
    >
      <span>✅</span>
      <span>{message}</span>
    </div>
  );
}

function ErrorToast({ visible, message }) {
  if (!visible) return null;
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-5 py-3 mb-2 text-sm font-medium"
      style={{
        backgroundColor: 'rgba(239,68,68,0.10)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#EF4444',
      }}
    >
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

// ── Backend aktivite logunu tablo satırı formatına çevir ──────────
let tempId = 9000;
function backendLogToRow(item) {
  return {
    id:       item.aktiviteId ?? tempId++,
    datetime: item.aktiviteTarihi
                ? new Date(item.aktiviteTarihi).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })
                : '—',
    category: item.kategoriAdi ?? '—',
    detail:   `${item.tuketimDegeri} ${item.birimTipi}`,
    kg:       item.hesaplananKarbon ?? 0,
  };
}

// ── Ana Sayfa ─────────────────────────────────────────────────────
export default function ActivityPage({ onActivitySaved }) {
  const [category,  setCategory]  = useState('transport');
  const [formData,  setFormData]  = useState(defaultForm());
  const [logs,      setLogs]      = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toastOn,   setToastOn]   = useState(false);
  const [toastMsg,  setToastMsg]  = useState('');
  const [errorMsg,  setErrorMsg]  = useState('');

  // ── İlk yüklemede son aktiviteleri backend'den çek ───────────────
  useEffect(() => {
    setLogsLoading(true);
    getRecentActivities(1)
      .then(data => setLogs((data ?? []).map(backendLogToRow)))
      .catch(() => setLogs([]))   // API yoksa boş liste göster
      .finally(() => setLogsLoading(false));
  }, []);

  // Kategori değişince formu sıfırla
  function handleCategoryChange(cat) {
    setCategory(cat);
    setFormData(prev => ({
      ...defaultForm(),
      datetime: prev.datetime,
      note:     '',
    }));
  }

  // ── Kaydet: backend'e POST ────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const { kg } = computeEmission(category, formData);
    if (kg === 0) return;

    const { kategoriId, tuketimDegeri } = resolveBackendPayload(category, formData);

    setSaving(true);
    setErrorMsg('');

    try {
      // Backend'e aktivite gönder
      const result = await createActivity({
        kullaniciId:    1,
        kategoriId,
        tuketimDegeri,
        aktiviteTarihi: formData.datetime
          ? new Date(formData.datetime).toISOString()
          : new Date().toISOString(),
        not: formData.note || null,
      });

      const karbonMiktari = result?.karbonMiktari ?? kg;

      // Tablo için satır oluştur (backend yanıtından)
      const newLog = {
        id:       result?.aktiviteId ?? tempId++,
        datetime: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
        category: result?.kategoriAdi ?? buildDetail(category, formData),
        detail:   buildDetail(category, formData),
        kg:       karbonMiktari,
      };

      setLogs(prev => [newLog, ...prev]);
      setFormData(defaultForm());

      // Başarılı toast: hesaplanan karbon bilgisi dahil
      const toastText = `✅ ${result?.kategoriAdi ?? 'Aktivite'} kaydedildi! Hesaplanan: ${karbonMiktari.toFixed(2)} kg CO₂e`;
      setToastMsg(toastText);
      setToastOn(true);
      setTimeout(() => setToastOn(false), 4000);

      // Üst bileşene (App.jsx) bildir → EcoScore güncellenir
      onActivitySaved?.({ kg: karbonMiktari, category });

    } catch (err) {
      setErrorMsg(`Kayıt başarısız: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [category, formData, onActivitySaved]);

  // Yerel log silme (backend delete opsiyonel — cascade silme için)
  function handleDelete(id) {
    setLogs(prev => prev.filter(l => l.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Toastlar ── */}
      <SuccessToast visible={toastOn}         message={toastMsg} />
      <ErrorToast   visible={!!errorMsg}      message={errorMsg} />

      {/* ── Kategori Tab Barı ── */}
      <CategoryTabs activeCategory={category} onChange={handleCategoryChange} />

      {/* ── İki Kolon: Form (%60) + Canlı Panel (%40) ── */}
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

      {/* ── Son Aktiviteler Tablosu ── */}
      {logsLoading ? (
        <div
          className="rounded-2xl p-8 text-center text-sm"
          style={{ backgroundColor: '#111816', border: '1px solid #1E3A30', color: '#4B6E5E' }}
        >
          Son aktiviteler yükleniyor…
        </div>
      ) : (
        <RecentLogsTable logs={logs} onDelete={handleDelete} />
      )}
    </div>
  );
}
