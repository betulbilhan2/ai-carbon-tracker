import { useState, useEffect } from 'react';
import { X, Bot, User, Leaf, Check, Sliders } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';

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
  weeklyLimit = 56,
  onSave,
  onClose,
  onNavigateCarbonProfile,
}) {
  const { user, updateUser, latestAiRecommendation } = useAuth();
  const recommendedLimit = Number(latestAiRecommendation?.expectedWeeklyKg ?? latestAiRecommendation?.expected_weekly_kg ?? 22);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [localLimit, setLocalLimit] = useState(weeklyLimit || 56);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    adSoyad: '',
    email: '',
    universite: '',
    bolum: '',
    sehir: '',
    birincilUlasim: 'Özel Araç',
    diyetTuru: 'Az Etli (Flexitarian)',
  });

  const [prefs, setPrefs] = useState({
    anomalyAlerts: true,
    dailySummary: true,
    microTaskNotifs: true,
    taskFreq: 'Günde 1 Kez',
  });

  // Sync initialTab and profile when opened or user changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLocalLimit(weeklyLimit || 56);
      if (user) {
        setFormData({
          adSoyad: user.ad_soyad || user.adSoyad || '',
          email: user.email || '',
          universite: user.universite || '',
          bolum: user.bolum || '',
          sehir: user.sehir || user.city || '',
          birincilUlasim: user.birincilUlasim || user.birincil_ulasim || 'Özel Araç',
          diyetTuru: user.diyetTuru || user.diyet_turu || 'Az Etli (Flexitarian)',
        });
      }
    }
  }, [isOpen, initialTab, user, weeklyLimit]);

  if (!isOpen) return null;

  async function handleSave() {
    setSaving(true);

    const updatedUser = {
      ...(user || {}),
      ...formData,
      ad_soyad: formData.adSoyad,
      adSoyad: formData.adSoyad,
      email: formData.email,
      universite: formData.universite,
      bolum: formData.bolum,
      sehir: formData.sehir,
      city: formData.sehir,
      birincil_ulasim: formData.birincilUlasim,
      birincilUlasim: formData.birincilUlasim,
      diyet_turu: formData.diyetTuru,
      diyetTuru: formData.diyetTuru,
      haftalik_hedef: localLimit,
      hedeflenenKarbonLimiti: localLimit,
    };

    // 1. Context ve localStorage anında güncelle
    localStorage.setItem('ecotrack_user', JSON.stringify(updatedUser));
    updateUser?.(updatedUser);

    // 2. Backend API çağrısı
    try {
      const res = await updateProfile({
        id: user?.kullaniciId || user?.kullanici_id || user?.id || 1,
        ...formData,
        ...updatedUser,
      });
      if (res?.token) {
        localStorage.setItem('ecotrack_token', res.token);
      }
    } catch (err) {
      console.warn('Profil güncelleme API hatası:', err);
    }

    // 3. Parent callback
    onSave?.({ weeklyLimit: localLimit, profile: formData, prefs });

    // 4. Toast gösterimi ve kapatma
    setToastMsg('Değişiklikler başarıyla kaydedildi.');
    setToastOn(true);
    setTimeout(() => {
      setToastOn(false);
      onClose();
    }, 600);
    setSaving(false);
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

        {/* ── Toast Alert ── */}
        {toastOn && (
          <div
            className="mx-6 mt-3 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in"
            style={{
              backgroundColor: 'rgba(34,197,94,0.15)',
              border: '1px solid #22C55E',
              color: '#86EFAC',
            }}
          >
            <Check size={14} color="#22C55E" />
            <span>{toastMsg}</span>
          </div>
        )}

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
          {/* TAB 1: Karbon Bütçesi */}
          {activeTab === 'budget' && (
            <div className="flex flex-col gap-5">
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

              {/* TabNet Tavsiyesi */}
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
                    <span className="font-mono font-bold" style={{ color: '#14B8A6' }}>{recommendedLimit} kg CO₂e</span>{' '}
                    olarak önerilmektedir. Düşük limit daha güçlü davranışsal tetikleyici sağlar.
                  </p>
                </div>
              </div>

              {/* Durum Özeti */}
              <div className="grid grid-cols-3 gap-3">
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
            </div>
          )}

          {/* TAB 2: Profil Bilgileri */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#4B6E5E]">Ad Soyad</label>
                  <input
                    type="text"
                    name="adSoyad"
                    value={formData.adSoyad}
                    onChange={e => setFormData(prev => ({ ...prev, adSoyad: e.target.value }))}
                    placeholder="Örn: Ayşe Kaya"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-[#182420] border border-[#1E3A30] text-[#F0FDF4] focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#4B6E5E]">E-posta</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="eposta@universite.edu.tr"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-[#182420] border border-[#1E3A30] text-[#F0FDF4] focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#4B6E5E]">Üniversite</label>
                  <input
                    type="text"
                    name="universite"
                    value={formData.universite}
                    onChange={e => setFormData(prev => ({ ...prev, universite: e.target.value }))}
                    placeholder="Örn: ODTÜ / Fırat Ü."
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-[#182420] border border-[#1E3A30] text-[#F0FDF4] focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#4B6E5E]">Bölüm</label>
                  <input
                    type="text"
                    name="bolum"
                    value={formData.bolum}
                    onChange={e => setFormData(prev => ({ ...prev, bolum: e.target.value }))}
                    placeholder="Örn: Bilgisayar Müh."
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-[#182420] border border-[#1E3A30] text-[#F0FDF4] focus:border-[#22C55E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#4B6E5E]">Şehir</label>
                <input
                  type="text"
                  name="sehir"
                  value={formData.sehir}
                  onChange={e => setFormData(prev => ({ ...prev, sehir: e.target.value }))}
                  placeholder="Örn: Elazığ, İstanbul, Ankara, İzmir..."
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors bg-[#182420] border border-[#1E3A30] text-[#F0FDF4] focus:border-[#22C55E]"
                />
              </div>

              {/* Karbon Profilim Yönlendirme Kartı */}
              <div
                className="mt-2 rounded-2xl p-4 flex flex-col gap-3"
                style={{
                  backgroundColor: '#182420',
                  border: '1px solid #1E3A30',
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#86EFAC' }}>
                    <Sliders size={15} color="#22C55E" />
                    <span>Yaşam Tarzı &amp; YZ Parametreleri</span>
                  </div>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#4B6E5E' }}>
                    TabNet derin öğrenme modelinin kullandığı 17 parametreli yaşam tarzı girdilerinizi (araç mesafesi, yakıt tipi, ısınma, diyet ve geri dönüşüm alışkanlıkları) Karbon Profilim sayfasından yönetebilirsiniz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    onNavigateCarbonProfile?.();
                  }}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'rgba(34,197,94,0.15)',
                    border: '1px solid #22C55E',
                    color: '#22C55E',
                    boxShadow: '0 0 16px rgba(34,197,94,0.1)',
                  }}
                >
                  <span>Yaşam Tarzı ve YZ Parametrelerini Düzenle</span>
                  <span className="text-sm font-extrabold">→</span>
                  <span className="font-normal opacity-75">(Karbon Profilim Sayfasına Git)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: YZ Tercihleri */}
          {activeTab === 'ai' && (
            <div className="flex flex-col gap-4">
              {/* Toggle 1: Anormallik Uyarıları */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3.5 bg-[#182420] border border-[#1E3A30]"
              >
                <div>
                  <p className="text-sm font-medium text-[#F0FDF4]">TabNet Anormallik Uyarıları</p>
                  <p className="text-xs mt-0.5 text-[#4B6E5E]">%30 sapmada bildir</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefs(prev => ({ ...prev, anomalyAlerts: !prev.anomalyAlerts }))}
                  className="relative rounded-full transition-all duration-200 shrink-0"
                  style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: prefs.anomalyAlerts ? '#22C55E' : '#1E3A30',
                    boxShadow: prefs.anomalyAlerts ? '0 0 10px rgba(34,197,94,0.3)' : 'none',
                  }}
                >
                  <span
                    className="absolute top-0.5 rounded-full transition-all duration-200"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#F0FDF4',
                      left: prefs.anomalyAlerts ? '22px' : '2px',
                    }}
                  />
                </button>
              </div>

              {/* Toggle 2: Günlük Özet */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3.5 bg-[#182420] border border-[#1E3A30]"
              >
                <div>
                  <p className="text-sm font-medium text-[#F0FDF4]">Günlük Özet Bildirimleri</p>
                  <p className="text-xs mt-0.5 text-[#4B6E5E]">Her gün saat 21:00'de günlük rapor</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefs(prev => ({ ...prev, dailySummary: !prev.dailySummary }))}
                  className="relative rounded-full transition-all duration-200 shrink-0"
                  style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: prefs.dailySummary ? '#22C55E' : '#1E3A30',
                    boxShadow: prefs.dailySummary ? '0 0 10px rgba(34,197,94,0.3)' : 'none',
                  }}
                >
                  <span
                    className="absolute top-0.5 rounded-full transition-all duration-200"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#F0FDF4',
                      left: prefs.dailySummary ? '22px' : '2px',
                    }}
                  />
                </button>
              </div>

              {/* Toggle 3: Mikro Görevler */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3.5 bg-[#182420] border border-[#1E3A30]"
              >
                <div>
                  <p className="text-sm font-medium text-[#F0FDF4]">Fogg B=MAP Mikro Görev Bildirimleri</p>
                  <p className="text-xs mt-0.5 text-[#4B6E5E]">Bağlamsal tetikleyici zamanında bildir</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefs(prev => ({ ...prev, microTaskNotifs: !prev.microTaskNotifs }))}
                  className="relative rounded-full transition-all duration-200 shrink-0"
                  style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: prefs.microTaskNotifs ? '#22C55E' : '#1E3A30',
                    boxShadow: prefs.microTaskNotifs ? '0 0 10px rgba(34,197,94,0.3)' : 'none',
                  }}
                >
                  <span
                    className="absolute top-0.5 rounded-full transition-all duration-200"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#F0FDF4',
                      left: prefs.microTaskNotifs ? '22px' : '2px',
                    }}
                  />
                </button>
              </div>

              {/* Frequency */}
              <div
                className="rounded-xl px-4 py-4 bg-[#182420] border border-[#1E3A30]"
              >
                <p className="text-sm font-medium mb-3 text-[#F0FDF4]">
                  Fogg B=MAP Mikro Görev Sıklığı
                </p>
                <div className="flex gap-2">
                  {['Günde 1 Kez', 'Günde 2 Kez', 'Günde 3 Kez'].map(opt => {
                    const isActive = prefs.taskFreq === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPrefs(prev => ({ ...prev, taskFreq: opt }))}
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
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid #1E3A30' }}
        >
          <button
            type="button"
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
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
            style={{
              backgroundColor: '#22C55E',
              color: '#0A0F0D',
              boxShadow: '0 0 16px rgba(34,197,94,0.25)',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = '#16A34A'; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = '#22C55E'; }}
          >
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}
