import math
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="EcoTrack AI — Recommendation Microservice",
    version="1.0-contextual",
    description="Fogg B=MAP davranışsal modelleme motoru ve bağlamsal karbon azaltım öneri servisi."
)

# ── CORS Yapılandırması ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic Modelleri ──────────────────────────────────────────
class RecommendationRequest(BaseModel):
    kullanici_id: int = Field(..., description="Kullanıcı kimliği")
    kategori_id: int = Field(..., description="Aktivite kategorisi ID'si")
    kategori_adi: str = Field(..., description="Kategori adı veya açıklaması")
    tuketim_degeri: float = Field(..., description="Aktivite tüketim değeri (km, kWh, porsiyon, adet)")
    karbon_miktari: float = Field(..., description="Hesaplanan karbon emisyonu (kg CO2e)")
    gunluk_seri: int = Field(default=1, description="Kullanıcının devam eden günlük serisi")

class RecommendationResponse(BaseModel):
    oneri_metni: str
    etki_skoru: float
    potansiyel_tasarruf: str
    model_surumu: str = "v1.0-contextual"

# ── Fogg B=MAP ve Bağlamsal Öneri Motoru ─────────────────────────
@app.get("/health")
def health_check():
    return {"status": "AI service running", "service": "EcoTrack.AI", "version": "1.0-contextual"}

@app.post("/api/recommend", response_model=RecommendationResponse)
def generate_recommendation(req: RecommendationRequest):
    """
    Kullanıcının aktivitesine, karbon miktarına ve serisine göre Fogg B=MAP 
    dinamik etki skoru ve kişiselleştirilmiş mikrogörev üretir.
    """
    kid = req.kategori_id
    tuketim = max(0.01, req.tuketim_degeri)
    karbon = max(0.01, req.karbon_miktari)
    seri = max(1, req.gunluk_seri)

    # 1. Taban Etki Skoru (Fogg Motivasyon & Yetenek Katsayısı)
    # Karbon emisyonu arttıkça potansiyel tasarruf fırsatı (etki skoru) artar; seri ise kullanıcı motivasyonunu çarpar.
    # Sigmoid benzeri logaritmik normalize edilmiş etki puanı (5.0 - 9.8 aralığında)
    base_impact = 5.0 + 3.5 * (1.0 / (1.0 + math.exp(-0.25 * (karbon - 2.0))))
    streak_bonus = min(1.0, math.log(seri + 1) * 0.25)
    etki_skoru = round(min(9.9, max(3.0, base_impact + streak_bonus)), 2)

    # 2. Kategoriye ve Tüketim Değerine Özel Bağlamsal Öneri
    if kid in [1, 3, 4]:  # Ulaşım: Araba, Otobüs, Motosiklet
        metro_tasarruf = round(karbon * 0.82, 2)
        oneri_metni = (
            f"Bugün katettiğin {tuketim:.1f} km mesafeyi yarın metro veya raylı sistem ile katederek "
            f"yaklaşık {metro_tasarruf:.2f} kg CO₂e tasarruf sağlayabilirsin."
        )
        potansiyel_tasarruf = f"Günde ~{metro_tasarruf:.2f} kg CO₂e tasarruf fırsatı"

    elif kid == 6:  # Ulaşım: Uçak
        oneri_metni = (
            f"Katedilen {tuketim:.0f} km uçuş mesafesi yüksek emisyon üretti. Kısa mesafeli seyahatlerde "
            f"yüksek hızlı tren (YHT) alternatifini değerlendirerek emisyonu %85 azaltabilirsin."
        )
        potansiyel_tasarruf = f"Seyahat başına ~{round(karbon * 0.85, 1)} kg CO₂e tasarruf"

    elif kid == 7:  # Enerji: Elektrik
        tasarruf_kwh = round(tuketim * 0.20, 1)
        oneri_metni = (
            f"Günde {tuketim:.1f} kWh tüketim gerçekleşti. Kullanılmayan cihazları prizden çekerek veya akıllı priz "
            f"kullanarak günlük ~{tasarruf_kwh} kWh (%20) tasarruf sağlayabilirsin."
        )
        potansiyel_tasarruf = f"Aylık ~{round(tasarruf_kwh * 30 * 0.481, 1)} kg CO₂e tasarruf"

    elif kid in [8, 9]:  # Enerji: Doğalgaz / Kömür
        oneri_metni = (
            f"Isıtma tüketiminde termostatı 1°C düşürmek haftalık karbon ayak izini %7 oranında azaltır. "
            f"Evin yalıtımını kontrol etmeyi unutma."
        )
        potansiyel_tasarruf = f"Haftalık ~{round(karbon * 0.07, 2)} kg CO₂e tasarruf"

    elif kid == 10:  # Beslenme: Kırmızı Et
        tasarruf_et = round(tuketim * 5.11, 2)
        oneri_metni = (
            f"Tüketilen {tuketim:.0f} porsiyon kırmızı et yerine haftanın 1 günü bakliyat/vejetaryen alternatifi "
            f"seçerek tek bir öğünde {tasarruf_et:.2f} kg CO₂e tasarruf edebilirsin."
        )
        potansiyel_tasarruf = f"Öğün başına ~{tasarruf_et:.2f} kg CO₂e tasarruf"

    elif kid in [11, 12, 13]:  # Beslenme: Beyaz et, Vejetaryen, Vegan
        oneri_metni = (
            f"Düşük karbonlu beslenme tercihin için tebrikler! Mevsimsel ve yerel gıdalar tercih ederek "
            f"lojistik kaynaklı karbonu da sıfırlayabilirsin."
        )
        potansiyel_tasarruf = "Sürdürülebilir beslenme dengesi korundu"

    elif kid == 14:  # Atık: Plastik
        oneri_metni = (
            f"Kullandığın {tuketim:.0f} adet tek kullanımlık plastik yerine yeniden doldurulabilir paslanmaz çelik "
            f"matara kullanarak plastik atık zincirini kırabilirsin."
        )
        potansiyel_tasarruf = f"Yıllık ~{round(tuketim * 365 * 0.083, 1)} kg CO₂e ve sıfır atık katkısı"

    elif kid in [15, 16, 17]:  # Atık: Kağıt, Cam, Organik
        oneri_metni = (
            f"Atıklarını kaynağında ayrıştırarak döngüsel ekonomiye kazandırdın. "
            f"Organik atıkları kompost kutusuna aktarmayı sürdür."
        )
        potansiyel_tasarruf = "Döngüsel geri kazanım katkısı"

    else:
        oneri_metni = (
            f"{req.kategori_adi} alanındaki tüketimini takip etmek harika bir adım. "
            f"Günlük küçük optimizasyonlarla sürdürülebilirlik hedefine bir adım daha yaklaşabilirsin."
        )
        potansiyel_tasarruf = f"Günlük ~{round(karbon * 0.10, 2)} kg CO₂e potansiyel tasarruf"

    return RecommendationResponse(
        oneri_metni=oneri_metni,
        etki_skoru=etki_skoru,
        potansiyel_tasarruf=potansiyel_tasarruf,
        model_surumu="v1.0-contextual"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
