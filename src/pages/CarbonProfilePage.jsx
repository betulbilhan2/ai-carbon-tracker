import { useState, useEffect } from 'react';
import { 
  Car, 
  Utensils, 
  Zap, 
  Recycle, 
  Sliders, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingDown, 
  Scale, 
  Activity, 
  Loader2,
  Plane,
  Clock,
  Tv,
  Wifi,
  Trash2,
  Shirt,
  ShoppingBag,
  Flame,
  Droplets,
  HelpCircle
} from 'lucide-react';
import { getAiRecommendation } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Kesin veri sözleşmesi (Varsayılan değerler)
const DEFAULT_PROFILE = {
  monthly_grocery_bill: 250,
  vehicle_distance_km_month: 150,
  waste_bag_weekly_count: 3,
  tv_pc_daily_hour: 4,
  new_clothes_monthly: 2,
  internet_daily_hour: 3,
  diet: 'omnivore',
  how_often_shower: 'daily',
  heating_energy_source: 'natural_gas',
  transport: 'public',
  vehicle_type: 'petrol',
  social_activity: 'sometimes',
  frequency_of_traveling_by_air: 'rarely',
  waste_bag_size: 'medium',
  energy_efficiency: 'medium',
  recycling: {
    paper: true,
    plastic: true,
    glass: false,
    metal: false,
  },
  cooking_with: 2,
};

const DIET_OPTIONS = [
  { id: 'omnivore', label: 'Hepçil', desc: 'Et & Sebze (Karışık)', icon: '🥩🥦' },
  { id: 'pescatarian', label: 'Balık Ağırlıklı', desc: 'Deniz Ürünleri & Sebze', icon: '🐟🥗' },
  { id: 'vegetarian', label: 'Vejetaryen', desc: 'Et Tüketmez (Süt/Yumurta var)', icon: '🧀🥗' },
  { id: 'vegan', label: 'Vegan', desc: 'Tamamen Bitkisel Beslenme', icon: '🌱🥑' },
];

export default function CarbonProfilePage({ onProfileSaved }) {
  const { latestAiRecommendation, saveAiRecommendation } = useAuth();

  // 1. Durum Yönetimi — localStorage'dan oku veya DEFAULT_PROFILE yükle
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('user_carbon_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          recycling: {
            ...DEFAULT_PROFILE.recycling,
            ...(parsed.recycling || {}),
          },
          cooking_with: 2, // Her zaman kesin integer 2
        };
      } catch (err) {
        console.warn('Yerel profil verisi çözümlenemedi:', err);
      }
    }
    return DEFAULT_PROFILE;
  });

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [aiResult, setAiResult] = useState(latestAiRecommendation || null);

  useEffect(() => {
    if (latestAiRecommendation) {
      setAiResult(latestAiRecommendation);
    }
  }, [latestAiRecommendation]);

  // Form elemanı değişim işleyicileri
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumberChange = (field, value) => {
    const num = Math.max(0, parseFloat(value) || 0);
    handleChange(field, num);
  };

  const handleRecyclingChange = (key) => {
    setFormData(prev => ({
      ...prev,
      recycling: {
        ...prev.recycling,
        [key]: !prev.recycling[key],
      },
    }));
  };

  // 2. Kaydet ve YZ Analizini Yenile
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setToastMessage(null);

    // Backend ile kesin uyumlu payload
    const payload = {
      monthly_grocery_bill: Number(formData.monthly_grocery_bill),
      vehicle_distance_km_month: Number(formData.vehicle_distance_km_month),
      waste_bag_weekly_count: parseInt(formData.waste_bag_weekly_count, 10) || 0,
      tv_pc_daily_hour: Number(formData.tv_pc_daily_hour),
      new_clothes_monthly: parseInt(formData.new_clothes_monthly, 10) || 0,
      internet_daily_hour: Number(formData.internet_daily_hour),
      diet: formData.diet,
      how_often_shower: formData.how_often_shower,
      heating_energy_source: formData.heating_energy_source,
      transport: formData.transport,
      vehicle_type: formData.vehicle_type,
      social_activity: formData.social_activity,
      frequency_of_traveling_by_air: formData.frequency_of_traveling_by_air,
      waste_bag_size: formData.waste_bag_size,
      energy_efficiency: formData.energy_efficiency,
      recycling: {
        paper: Boolean(formData.recycling.paper),
        plastic: Boolean(formData.recycling.plastic),
        glass: Boolean(formData.recycling.glass),
        metal: Boolean(formData.recycling.metal),
      },
      cooking_with: 2,
    };

    try {
      // Form verilerini localStorage'a kaydet
      localStorage.setItem('user_carbon_profile', JSON.stringify(payload));

      // API İsteği At: POST /api/analytics/recommendation
      const response = await getAiRecommendation(payload);

      if (response) {
        setAiResult(response);
        saveAiRecommendation?.(response);
        onProfileSaved?.(response);
      }

      setToastMessage({
        type: 'success',
        text: 'Karbon profiliniz kaydedildi ve YZ önerileriniz güncellendi!',
      });
    } catch (err) {
      console.error('YZ Öneri API hatası:', err);
      setToastMessage({
        type: 'error',
        text: `Profil kaydedildi ancak YZ servisi yanıt veremedi (${err.message || 'Bağlantı hatası'}).`,
      });
    } finally {
      setLoading(false);
      // 4 saniye sonra toast'ı kaldır
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-12">
      {/* ── ÜST BAŞLIK ALANI ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/30 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sliders size={22} />
            </div>
            <h1 className="text-2xl font-bold text-[#F0FDF4] tracking-tight">
              Karbon Profilim
            </h1>
          </div>
          <p className="text-sm text-[#71717A] mt-1.5">
            Yapay zekâ destekli analiz motoru için 17 yaşam tarzı parametrenizi güncelleyin ve kişiselleştirilmiş optimizasyonlar alın.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <Sparkles size={13} />
            TabNet Derin Öğrenme Modeli
          </span>
        </div>
      </div>

      {/* ── BİLDİRİM TOAST ALANI ── */}
      {toastMessage && (
        <div
          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm font-medium transition-all shadow-lg animate-in fade-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 shadow-emerald-950/30'
              : 'bg-red-950/80 border-red-500/40 text-red-300 shadow-red-950/30'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── GÜNCEL YZ ANALİZ & ÖNERİ KARTI (Varsa göster) ── */}
      {aiResult && (
        <div
          className="rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: '#111816',
            border: '1px solid rgba(34,197,94,0.3)',
            boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 20px -2px rgba(34,197,94,0.1)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {aiResult.source === 'render-ai' ? '● Canlı Render YZ Servisi' : '● Analitik Karbon Motoru'}
                </span>
                {aiResult.clusterId && (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                    Küme #{aiResult.clusterId}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-[#F0FDF4] flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400 shrink-0" />
                YZ Davranışsal Karbon Önerisi
              </h3>

              <p className="text-sm leading-relaxed text-[#A7F3D0] bg-emerald-950/30 p-4 rounded-xl border border-emerald-800/30 italic">
                "{aiResult.message || 'Mevcut tüketim alışkanlıklarınız doğrultusunda optimizasyon hesaplandı.'}"
              </p>
            </div>

            {/* KPI Metrikleri */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:w-auto shrink-0">
              <div className="bg-[#0A0F0D] p-3.5 rounded-xl border border-[#1E3A30] min-w-[120px]">
                <span className="text-[11px] text-[#71717A] flex items-center gap-1 mb-1">
                  <Scale size={12} /> Gerçekleşen
                </span>
                <p className="text-base font-bold font-mono text-[#F0FDF4]">
                  {aiResult.actualWeeklyKg ?? aiResult.actual_weekly_kg ?? 25.4}{' '}
                  <span className="text-xs font-normal text-zinc-400">kg/hf</span>
                </p>
              </div>

              <div className="bg-[#0A0F0D] p-3.5 rounded-xl border border-[#1E3A30] min-w-[120px]">
                <span className="text-[11px] text-[#71717A] flex items-center gap-1 mb-1">
                  <Activity size={12} /> Model Beklentisi
                </span>
                <p className="text-base font-bold font-mono text-emerald-400">
                  {aiResult.expectedWeeklyKg ?? aiResult.expected_weekly_kg ?? 22.0}{' '}
                  <span className="text-xs font-normal text-zinc-400">kg/hf</span>
                </p>
              </div>

              <div className="bg-[#0A0F0D] p-3.5 rounded-xl border border-[#1E3A30] min-w-[120px] col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[#71717A] flex items-center gap-1 mb-1">
                  <TrendingDown size={12} className="text-emerald-400" /> Tasarruf Potansiyeli
                </span>
                <p className="text-base font-bold font-mono text-emerald-300">
                  +{aiResult.simulatedSavingKgWeek ?? aiResult.simulated_saving_kg_week ?? 3.2}{' '}
                  <span className="text-xs font-normal text-zinc-400">kg/hf</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4 KARTLIK FORM ALANI ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ═══════════════════════════════════════════════════════════════
            KART 1: Ulaşım & Seyahat
        ═══════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1E3A30]">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Car size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F0FDF4]">Ulaşım & Seyahat</h2>
              <p className="text-xs text-[#71717A]">Günlük hareketlilik ve uçuş tercihleri</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {/* Genel Ulaşım */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Genel Ulaşım Tercihi
              </label>
              <select
                value={formData.transport}
                onChange={(e) => handleChange('transport', e.target.value)}
                className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl px-3.5 py-2.5 text-[#F0FDF4] focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="public">Toplu Taşıma (Otobüs, Metro, Tramvay)</option>
                <option value="private">Özel Araç</option>
                <option value="walk_bicycle">Yürüyüş / Bisiklet (Sıfır Emisyon)</option>
              </select>
            </div>

            {/* Araç Yakıt Tipi */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Araç Yakıt Tipi
              </label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => handleChange('vehicle_type', e.target.value)}
                className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl px-3.5 py-2.5 text-[#F0FDF4] focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="none">Araç Yok</option>
                <option value="petrol">Benzin</option>
                <option value="diesel">Dizel</option>
                <option value="hybrid">Hibrit</option>
                <option value="electric">Elektrikli (EV)</option>
                <option value="lpg">LPG</option>
              </select>
            </div>

            {/* Aylık Araç Mesafesi (Slider) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-[#A7F3D0]">
                  Aylık Araç Mesafesi
                </label>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-[#0A0F0D] px-2.5 py-1 rounded-lg border border-[#1E3A30]">
                  {formData.vehicle_distance_km_month} km/ay
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="25"
                value={formData.vehicle_distance_km_month}
                onChange={(e) => handleNumberChange('vehicle_distance_km_month', e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-[#0A0F0D] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[#71717A] mt-1 font-mono">
                <span>0 km</span>
                <span>1500 km</span>
                <span>3000 km</span>
              </div>
            </div>

            {/* Uçuş Sıklığı */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Uçuş Sıklığı
              </label>
              <select
                value={formData.frequency_of_traveling_by_air}
                onChange={(e) => handleChange('frequency_of_traveling_by_air', e.target.value)}
                className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl px-3.5 py-2.5 text-[#F0FDF4] focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="never">Hiç (Uçuş Yapmam)</option>
                <option value="rarely">Nadiren (Yılda 1-2 kez)</option>
                <option value="frequently">Sık (Yılda 3-8 kez)</option>
                <option value="very_frequently">Çok Sık (Ayda birkaç kez)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            KART 2: Beslenme & Alışveriş
        ═══════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1E3A30]">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
              <Utensils size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F0FDF4]">Beslenme & Alışveriş</h2>
              <p className="text-xs text-[#71717A]">Diyet alışkanlıkları ve tüketim giderleri</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {/* Diyet Türü: 4 Şık Buton Kartı */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-2">
                Diyet Türü
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIET_OPTIONS.map((opt) => {
                  const isSelected = formData.diet === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleChange('diet', opt.id)}
                      className={`p-3 rounded-xl text-left border transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                          : 'bg-[#0A0F0D] border-[#1E3A30] text-[#71717A] hover:border-emerald-800/60 hover:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{opt.icon}</span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[#F0FDF4]">{opt.label}</span>
                      <span className="text-[10px] leading-tight text-[#71717A]">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aylık Market Harcaması */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Aylık Market / Gıda Harcaması (TL)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">
                  ₺
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.monthly_grocery_bill}
                  onChange={(e) => handleNumberChange('monthly_grocery_bill', e.target.value)}
                  className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl pl-8 pr-3.5 py-2.5 text-[#F0FDF4] font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="250"
                />
              </div>
            </div>

            {/* Aylık Yeni Giysi Alımı */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Aylık Yeni Giysi Alımı (Adet)
              </label>
              <div className="relative">
                <Shirt size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={formData.new_clothes_monthly}
                  onChange={(e) => handleNumberChange('new_clothes_monthly', e.target.value)}
                  className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl pl-9 pr-3.5 py-2.5 text-[#F0FDF4] font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            KART 3: Ev & Enerji Alışkanlıkları
        ═══════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1E3A30]">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F0FDF4]">Ev & Enerji Alışkanlıkları</h2>
              <p className="text-xs text-[#71717A]">Isınma, su ve elektrik tüketim düzeni</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {/* Isınma Kaynağı */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Isınma Kaynağı
              </label>
              <select
                value={formData.heating_energy_source}
                onChange={(e) => handleChange('heating_energy_source', e.target.value)}
                className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl px-3.5 py-2.5 text-[#F0FDF4] focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="natural_gas">Doğalgaz (Kombi / Merkezi)</option>
                <option value="electricity">Elektrik (Klima / Isıtıcı)</option>
                <option value="coal">Kömür</option>
                <option value="wood">Odun / Şömine</option>
              </select>
            </div>

            {/* Duş Sıklığı */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Duş Sıklığı
              </label>
              <select
                value={formData.how_often_shower}
                onChange={(e) => handleChange('how_often_shower', e.target.value)}
                className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl px-3.5 py-2.5 text-[#F0FDF4] focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="daily">Günde 1 Kez</option>
                <option value="twice_a_day">Günde 2 Kez</option>
                <option value="less_frequently">Daha Seyrek (2-3 günde bir)</option>
              </select>
            </div>

            {/* Günlük TV / PC Saati (Slider) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-[#A7F3D0] flex items-center gap-1.5">
                  <Tv size={13} /> Günlük TV / PC Kullanımı
                </label>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-[#0A0F0D] px-2.5 py-1 rounded-lg border border-[#1E3A30]">
                  {formData.tv_pc_daily_hour} saat/gün
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="0.5"
                value={formData.tv_pc_daily_hour}
                onChange={(e) => handleNumberChange('tv_pc_daily_hour', e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-[#0A0F0D] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[#71717A] mt-1 font-mono">
                <span>0s</span>
                <span>8s</span>
                <span>16s</span>
              </div>
            </div>

            {/* Günlük İnternet Saati (Slider) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-[#A7F3D0] flex items-center gap-1.5">
                  <Wifi size={13} /> Günlük Aktif İnternet
                </label>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-[#0A0F0D] px-2.5 py-1 rounded-lg border border-[#1E3A30]">
                  {formData.internet_daily_hour} saat/gün
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="0.5"
                value={formData.internet_daily_hour}
                onChange={(e) => handleNumberChange('internet_daily_hour', e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-[#0A0F0D] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[#71717A] mt-1 font-mono">
                <span>0s</span>
                <span>8s</span>
                <span>16s</span>
              </div>
            </div>

            {/* Enerji Verimliliği */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Ev İçi Enerji Verimliliği
              </label>
              <select
                value={formData.energy_efficiency}
                onChange={(e) => handleChange('energy_efficiency', e.target.value)}
                className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl px-3.5 py-2.5 text-[#F0FDF4] focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="low">Düşük (Tasarruf önceliği yok)</option>
                <option value="medium">Orta (LED lambalar, standart tasarruf)</option>
                <option value="high">Yüksek (A+++ cihazlar, akıllı termostat)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            KART 4: Atık & Geri Dönüşüm
        ═══════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1E3A30]">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Recycle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F0FDF4]">Atık & Geri Dönüşüm</h2>
              <p className="text-xs text-[#71717A]">Atık üretimi ve geri kazanım alışkanlıkları</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {/* Çöp Torbası Boyutu */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Çöp Torbası Boyutu
              </label>
              <select
                value={formData.waste_bag_size}
                onChange={(e) => handleChange('waste_bag_size', e.target.value)}
                className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl px-3.5 py-2.5 text-[#F0FDF4] focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="small">Küçük (15-20 Litre)</option>
                <option value="medium">Orta (30-40 Litre)</option>
                <option value="large">Büyük (50-70 Litre)</option>
                <option value="extra_large">Ekstra Büyük (80+ Litre)</option>
              </select>
            </div>

            {/* Haftalık Çöp Poşeti Sayısı */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Haftalık Çöp Poşeti Sayısı (Adet)
              </label>
              <div className="relative">
                <Trash2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={formData.waste_bag_weekly_count}
                  onChange={(e) => handleNumberChange('waste_bag_weekly_count', e.target.value)}
                  className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl pl-9 pr-3.5 py-2.5 text-[#F0FDF4] font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="3"
                />
              </div>
            </div>

            {/* Sosyal Aktivite Sıklığı */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-1.5">
                Sosyal Aktivite / Dışarı Çıkma Sıklığı
              </label>
              <select
                value={formData.social_activity}
                onChange={(e) => handleChange('social_activity', e.target.value)}
                className="w-full bg-[#0A0F0D] border border-[#1E3A30] rounded-xl px-3.5 py-2.5 text-[#F0FDF4] focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="never">Nadiren (Ev merkezli yaşam)</option>
                <option value="sometimes">Bazen (Haftada 1-2 kez)</option>
                <option value="often">Sık Sık (Haftada 3+ kez)</option>
              </select>
            </div>

            {/* Geri Dönüşüm Ayrıştırması: 4 Checkbox/Switch */}
            <div>
              <label className="block text-xs font-medium text-[#A7F3D0] mb-2">
                Düzenli Ayrıştırılan Geri Dönüşüm Türleri
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'paper', label: 'Kağıt / Karton', icon: '📦' },
                  { key: 'plastic', label: 'Plastik', icon: '🧴' },
                  { key: 'glass', label: 'Cam', icon: '🍾' },
                  { key: 'metal', label: 'Metal / Teneke', icon: '🥫' },
                ].map(({ key, label, icon }) => {
                  const isChecked = Boolean(formData.recycling[key]);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleRecyclingChange(key)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-300'
                          : 'bg-[#0A0F0D] border-[#1E3A30] text-[#71717A] hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span>{label}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-black'
                            : 'border-[#1E3A30] bg-transparent'
                        }`}
                      >
                        {isChecked && <CheckCircle2 size={12} className="stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ALT ALAN: Kaydet ve YZ Analizini Yenile Butonu
        ═══════════════════════════════════════════════════════════════ */}
        <div className="col-span-1 md:col-span-2 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111816] p-5 rounded-2xl border border-[#1E3A30]">
          <div className="text-xs text-[#71717A] flex items-center gap-2 text-center sm:text-left">
            <Sparkles size={16} className="text-emerald-400 shrink-0 hidden sm:block" />
            <span>
              Girilen 17 parametre, Python tabanlı TabNet yapay zekâ modeline gönderilerek kümeniz ve karbon ayak izinize özel optimizasyonlar üretilir.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shrink-0 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-emerald-900/30"
            style={{
              backgroundColor: '#22C55E',
              color: '#0A0F0D',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>YZ Modeli Hesaplanıyor...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Alışkanlıklarımı Kaydet ve YZ Analizini Yenile</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
