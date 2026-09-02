import { useState, useEffect } from 'react';
import { X, Bot, User, Leaf } from 'lucide-react';

// ── Inner tab components ──────────────────────────────────────────

function BudgetTab({ weeklyLimit, onLimitChange }) {
  const [localLimit, setLocalLimit] = useState(weeklyLimit);

  // Sync if parent changes
  useEffect(() => { setLocalLimit(weeklyLimit); }, [weeklyLimit]);

  return (
    <div className="flex flex-col gap-5">
      {/* Slider + number input */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: '#86EFAC' }}>
            Haftalık Karbon Limiti
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={20}
              max={120}
              value={localLimit}
              onChange={e => setLocalLimit(Math.max(20, Math.min(120, Number(e.target.value))))}
              className="font-mono font-bold text-right w-16 rounded-lg px-2 py-1 text-sm outline-none"
              style={{
                backgroundColor: '#182420',
                border: '1px solid #1E3A30',
                color: '#22C55E',
              }}
              onFocus={e => (e.target.style.borderColor = '#22C55E')}
              onBlur={e => (e.target.style.borderColor = '#1E3A30')}
            />
            <span className="text-sm" style={{ color: '#4B6E5E' }}>kg CO₂e</span>
          </div>
        </div>

        <input
          type="range"
          min={20}
          max={120}
          step={1}
          value={localLimit}
          onChange={e => setLocalLimit(Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{ accentColor: '#22C55E' }}
        />
        <div className="flex justify-between text-xs mt-1.5" style={{ color: '#4B6E5E' }}>
          <span>20 kg</span>
          <span>70 kg (ortalama)</span>
          <span>120 kg</span>
        </div>
      </div>

      {/* TabNet advice box */}
      <div
        className="flex gap-3 rounded-xl px-4 py-3.5"
        style={{ backgroundColor: '#182420', border: '1px solid #14B8A6' }}
      >
        <Bot size={16} color="#14B8A6" className="shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: '#14B8A6' }}>
            TabNet Model Tavsiyesi
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#4B6E5E' }}>
            Benzer profildeki kullanıcıların verilerine göre haftalık ideal eşiğiniz{' '}
            <span className="font-mono font-bold" style={{ color: '#14B8A6' }}>48 kg CO₂e</span>{' '}
            olarak önerilmektedir. Düşük limit daha güçlü davranışsal tetikleyici sağlar.
          </p>
        </div>
      </div>

      {/* Current state summary */}
      <div
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Mevcut Limit',  value: `${weeklyLimit} kg`, color: '#4B6E5E' },
          { label: 'Yeni Limit',    value: `${localLimit} kg`,  color: '#22C55E' },
          { label: 'Değişim',       value: `${localLimit > weeklyLimit ? '+' : ''}${localLimit - weeklyLimit} kg`, color: localLimit < weeklyLimit ? '#22C55E' : '#F59E0B' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: '#0A0F0D', border: '1px solid #1E3A30' }}
          >
            <p className="text-xs mb-1" style={{ color: '#4B6E5E' }}>{label}</p>
            <p className="font-mono font-bold text-sm" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Store local change for save */}
      <input type="hidden" value={localLimit} id="budget-local-limit" />
      {/* We expose via data attr for parent to read */}
      <div id="budget-value-store" data-value={localLimit} className="hidden" />
    </div>
  );
}

function ProfileTab({ profile, onProfileChange }) {
  function setField(key, val) {
    onProfileChange({ ...profile, [key]: val });
  }

  const inputStyle = {
    backgroundColor: '#182420',
    border: '1px solid #1E3A30',
    color: '#F0FDF4',
    colorScheme: 'dark',
  };

  function Input({ label, field, placeholder }) {
    return (
      <div>
        <p className="text-xs font-medium mb-1.5" style={{ color: '#4B6E5E' }}>{label}</p>
        <input
          type="text"
          value={profile[field] ?? ''}
          onChange={e => setField(field, e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = '#22C55E')}
          onBlur={e => (e.target.style.borderColor = '#1E3A30')}
        />
      </div>
    );
  }

  function Select({ label, field, options }) {
    return (
      <div>
        <p className="text-xs font-medium mb-1.5" style={{ color: '#4B6E5E' }}>{label}</p>
        <select
          value={profile[field] ?? options[0].value}
          onChange={e => setField(field, e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Ad Soyad"     field="name"        placeholder="Ayşe Kaya"              />
        <Input label="E-posta"      field="email"       placeholder="ayse@metu.edu.tr"        />
        <Input label="Üniversite"   field="university"  placeholder="ODTÜ"                   />
        <Input label="Bölüm"        field="department"  placeholder="Bilgisayar Müh."         />
      </div>
      <Select
        label="Birincil Ulaşım Türü"
        field="transport"
        options={[
          { value: 'car',     label: '🚗 Özel Araç'    },
          { value: 'metro',   label: '🚇 Metro / Raylı' },
          { value: 'bus',     label: '🚌 Otobüs'        },
          { value: 'bike',    label: '🚲 Bisiklet'      },
          { value: 'walking', label: '🚶 Yürüyüş'       },
        ]}
      />
      <Select
        label="Diyet Türü"
        field="diet"
        options={[
          { value: 'omnivore',   label: '🥩 Her Şey (Omnivore)'  },
          { value: 'reducetarian', label: '🥗 Az Etli (Flexitarian)' },
          { value: 'vegetarian', label: '🥦 Vejetaryen'           },
          { value: 'vegan',      label: '🌱 Vegan'                },
        ]}
      />
    </div>
  );
}

function AiTab({ prefs, onPrefsChange }) {
  function toggle(key) {
    onPrefsChange({ ...prefs, [key]: !prefs[key] });
  }
  function setField(key, val) {
    onPrefsChange({ ...prefs, [key]: val });
  }

  function ToggleRow({ label, desc, field }) {
    const on = prefs[field] ?? false;
    return (
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3.5"
        style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: '#F0FDF4' }}>{label}</p>
          {desc && <p className="text-xs mt-0.5" style={{ color: '#4B6E5E' }}>{desc}</p>}
        </div>
        <button
          onClick={() => toggle(field)}
          className="relative rounded-full transition-all duration-200 shrink-0"
          style={{
            width: '44px',
            height: '24px',
            backgroundColor: on ? '#22C55E' : '#1E3A30',
            boxShadow: on ? '0 0 10px rgba(34,197,94,0.3)' : 'none',
          }}
        >
          <span
            className="absolute top-0.5 rounded-full transition-all duration-200"
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#F0FDF4',
              left: on ? '22px' : '2px',
            }}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ToggleRow
        label="TabNet Anormallik Uyarıları"
        desc="%30 sapmada bildir"
        field="anomalyAlerts"
      />
      <ToggleRow
        label="Günlük Özet Bildirimleri"
        desc="Her gün saat 21:00'de günlük rapor"
        field="dailySummary"
      />
      <ToggleRow
        label="Fogg B=MAP Mikro Görev Bildirimleri"
        desc="Bağlamsal tetikleyici zamanında bildir"
        field="microTaskNotifs"
      />

      {/* Micro-task frequency */}
      <div
        className="rounded-xl px-4 py-4"
        style={{ backgroundColor: '#182420', border: '1px solid #1E3A30' }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: '#F0FDF4' }}>
          Fogg B=MAP Mikro Görev Sıklığı
        </p>
        <div className="flex gap-2">
          {['Günde 1 Kez', 'Günde 2 Kez', 'Günde 3 Kez'].map(opt => {
            const isActive = (prefs.taskFreq ?? 'Günde 1 Kez') === opt;
            return (
              <button
                key={opt}
                onClick={() => setField('taskFreq', opt)}
                className="flex-1 rounded-lg py-2 text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(34,197,94,0.12)' : '#111816',
                  border: `1px solid ${isActive ? '#22C55E' : '#1E3A30'}`,
                  color: isActive ? '#22C55E' : '#4B6E5E',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tabs config ───────────────────────────────────────────────────
const TABS = [
  { id: 'budget',  icon: Leaf,  label: 'Karbon Bütçesi'    },
  { id: 'profile', icon: User,  label: 'Profil Bilgileri'   },
  { id: 'ai',      icon: Bot,   label: 'YZ Tercihleri'      },
];

// ── Main Modal ────────────────────────────────────────────────────
export default function SettingsModal({
  isOpen,
  initialTab = 'budget',
  weeklyLimit,
  onSave,
  onClose,
}) {
  const [activeTab,  setActiveTab]  = useState(initialTab);
  const [localLimit, setLocalLimit] = useState(weeklyLimit);
  const [profile,    setProfile]    = useState({
    name:        'Ayşe Kaya',
    email:       'ayse@metu.edu.tr',
    university:  'ODTÜ',
    department:  'Bilgisayar Mühendisliği',
    transport:   'car',
    diet:        'reducetarian',
  });
  const [prefs, setPrefs] = useState({
    anomalyAlerts:   true,
    dailySummary:    true,
    microTaskNotifs: true,
    taskFreq:        'Günde 1 Kez',
  });

  // Sync initialTab when opened
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  // Sync weeklyLimit from parent
  useEffect(() => { setLocalLimit(weeklyLimit); }, [weeklyLimit]);

  if (!isOpen) return null;

  function handleSave() {
    // Read the localLimit from BudgetTab's hidden div
    const store = document.getElementById('budget-value-store');
    const savedLimit = store ? Number(store.dataset.value) : localLimit;
    onSave({ weeklyLimit: savedLimit, profile, prefs });
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: '560px',
          backgroundColor: '#111816',
          border: '1px solid #1E3A30',
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
          maxHeight: '90vh',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #1E3A30' }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#F0FDF4' }}>
              Sistem ve Profil Ayarları
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#4B6E5E' }}>
              EcoTrack AI · v1.0 · TerkenTech
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: 32, height: 32,
              backgroundColor: '#182420',
              border: '1px solid #1E3A30',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#EF4444')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
          >
            <X size={14} color="#4B6E5E" />
          </button>
        </div>

        {/* ── Inner tab bar ── */}
        <div
          className="flex gap-1 px-6 py-3"
          style={{ borderBottom: '1px solid #1E3A30' }}
        >
          {TABS.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
                  color: isActive ? '#22C55E' : '#4B6E5E',
                  border: isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'budget'  && (
            <BudgetTab weeklyLimit={localLimit} onLimitChange={setLocalLimit} />
          )}
          {activeTab === 'profile' && (
            <ProfileTab profile={profile} onProfileChange={setProfile} />
          )}
          {activeTab === 'ai'      && (
            <AiTab prefs={prefs} onPrefsChange={setPrefs} />
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid #1E3A30' }}
        >
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #1E3A30',
              color: '#86EFAC',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#86EFAC')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all"
            style={{
              backgroundColor: '#22C55E',
              color: '#0A0F0D',
              boxShadow: '0 0 16px rgba(34,197,94,0.25)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#16A34A')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#22C55E')}
          >
            Değişiklikleri Kaydet ✓
          </button>
        </div>
      </div>
    </div>
  );
}
