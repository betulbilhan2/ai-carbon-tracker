"""
EcoTrack AI — FastAPI Mikroservis
TerkenTech | Teknofest Sıfır Atık ve Döngüsel Ekonomi
Port: 8000

Bu servis Fogg B=MAP Davranış Değiştirme Modeli'ni kullanarak
bağlamsal karbon azaltma önerileri ve dinamik etki skorları üretir.
"""

from __future__ import annotations

import math
from typing import Optional

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─────────────────────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="EcoTrack AI Service",
    description="Fogg B=MAP tabanlı bağlamsal karbon azaltma öneri motoru",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Veri Modelleri
# ─────────────────────────────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    kullanici_id:    int
    kategori_id:     int
    kategori_adi:    str
    tuketim_degeri:  float
    karbon_miktari:  float
    gunluk_seri:     int = 0


class RecommendResponse(BaseModel):
    oneri_metni:         str
    etki_skoru:          float = Field(..., ge=0.0, le=10.0)
    potansiyel_tasarruf: str
    model_surumu:        str = "v1.0-contextual"


# ─────────────────────────────────────────────────────────────────────────────
# Kategori Meta Verisi
# Kategori ID → (taban etki skoru, birim, alternatif emisyon katsayısı)
# ─────────────────────────────────────────────────────────────────────────────

KATEGORI_META: dict[int, dict] = {
    # Ulaşım
    1:  {"grup": "ulasim",    "ad": "Araba",       "birim": "km",       "kat": 0.145, "alt_kat": 0.020, "alt_ad": "Metro",     "taban": 8.0},
    2:  {"grup": "ulasim",    "ad": "Metro",        "birim": "km",       "kat": 0.020, "alt_kat": 0.000, "alt_ad": "Bisiklet",  "taban": 2.0},
    3:  {"grup": "ulasim",    "ad": "Otobüs",       "birim": "km",       "kat": 0.089, "alt_kat": 0.020, "alt_ad": "Metro",     "taban": 4.0},
    4:  {"grup": "ulasim",    "ad": "Motosiklet",   "birim": "km",       "kat": 0.103, "alt_kat": 0.020, "alt_ad": "Metro",     "taban": 6.5},
    5:  {"grup": "ulasim",    "ad": "Bisiklet",     "birim": "km",       "kat": 0.000, "alt_kat": 0.000, "alt_ad": None,        "taban": 0.5},
    6:  {"grup": "ulasim",    "ad": "Uçak",         "birim": "km",       "kat": 0.255, "alt_kat": 0.089, "alt_ad": "Otobüs",   "taban": 9.0},
    # Enerji
    7:  {"grup": "enerji",    "ad": "Elektrik",     "birim": "kWh",      "kat": 0.481, "alt_kat": None,  "alt_ad": None,        "taban": 6.0},
    8:  {"grup": "enerji",    "ad": "Doğalgaz",     "birim": "m³",       "kat": 2.040, "alt_kat": None,  "alt_ad": None,        "taban": 6.5},
    9:  {"grup": "enerji",    "ad": "Kömür",        "birim": "kg",       "kat": 2.860, "alt_kat": None,  "alt_ad": None,        "taban": 9.2},
    # Beslenme
    10: {"grup": "beslenme",  "ad": "Kırmızı Et",  "birim": "porsiyon", "kat": 6.610, "alt_kat": 1.500, "alt_ad": "Vejetaryen","taban": 7.5},
    11: {"grup": "beslenme",  "ad": "Beyaz Et",    "birim": "porsiyon", "kat": 3.190, "alt_kat": 1.500, "alt_ad": "Vejetaryen","taban": 5.5},
    12: {"grup": "beslenme",  "ad": "Vejetaryen",  "birim": "porsiyon", "kat": 1.500, "alt_kat": 0.900, "alt_ad": "Vegan",     "taban": 2.5},
    13: {"grup": "beslenme",  "ad": "Vegan",       "birim": "porsiyon", "kat": 0.900, "alt_kat": None,  "alt_ad": None,        "taban": 1.0},
    # Atık
    14: {"grup": "atik",      "ad": "Plastik Şişe","birim": "adet",     "kat": 0.083, "alt_kat": 0.000, "alt_ad": "Matara",    "taban": 7.0},
    15: {"grup": "atik",      "ad": "Kağıt/Karton","birim": "kg",       "kat": 0.021, "alt_kat": 0.000, "alt_ad": "Geri dönüşüm","taban":4.0},
    16: {"grup": "atik",      "ad": "Cam",         "birim": "adet",     "kat": 0.011, "alt_kat": 0.000, "alt_ad": "Geri dönüşüm","taban":3.0},
    17: {"grup": "atik",      "ad": "Organik",     "birim": "kg",       "kat": 0.390, "alt_kat": 0.000, "alt_ad": "Kompost",   "taban": 6.0},
}

# ─────────────────────────────────────────────────────────────────────────────
# Fogg B=MAP Davranış Değiştirme Motoru
#
# B = MAP formülü:
#   B (Behavior) gerçekleşir ancak ve ancak:
#   M (Motivation)  > eşik değeri
#   A (Ability)     > eşik değeri  (kolay yapılabilirlik)
#   P (Prompt)      tetiklenir     (tetikleyici mesaj)
#
# Dinamik Etki Skoru Algoritması:
#   1. Taban skor (kategoriye özgü)
#   2. Tüketim şiddet çarpanı: sigmoid(karbon_miktari) → yüksek karbon = yüksek aciliyet
#   3. Günlük seri bonusu: seri yüksekse motivasyon yüksek → skor biraz artar
#   4. Normalize → [0, 10] aralığında clamp
# ─────────────────────────────────────────────────────────────────────────────

def sigmoid(x: float) -> float:
    """Sigmoid fonksiyonu — karbon miktarını 0-1 aralığına sıkıştırır."""
    return 1.0 / (1.0 + math.exp(-x))


def hesapla_etki_skoru(
    karbon_miktari: float,
    kategori_id: int,
    gunluk_seri: int,
) -> float:
    """
    Fogg B=MAP tabanlı dinamik etki skoru hesabı.

    - Taban skor: kategoriye özgü önem ağırlığı
    - Şiddet çarpanı: karbon miktarının sigmoid'i (yüksek emisyon → yüksek aciliyet)
    - Seri bonusu: düzenli kullanıcılarda motivasyon yüksek → küçük bonus
    """
    meta       = KATEGORI_META.get(kategori_id, {})
    taban      = float(meta.get("taban", 5.0))

    # Karbon yoğunluğu çarpanı — 5 kg'ı dönüm noktası kabul et
    yogunluk_carpan = sigmoid((karbon_miktari - 5.0) / 3.0)  # 0 .. 1

    # Seri motivasyon bonusu (max 0.5 puan)
    seri_bonusu = min(gunluk_seri / 30.0, 1.0) * 0.5

    # Ham skor
    ham_skor = taban + yogunluk_carpan * 2.0 + seri_bonusu

    # Normalize ve clamp [0, 10]
    etki = max(0.0, min(10.0, round(ham_skor, 2)))
    return etki


def uret_oneri(req: RecommendRequest) -> tuple[str, str]:
    """
    Fogg B=MAP Prompt (P) katmanı: kişiselleştirilmiş mikrogörev metni.

    Döner: (oneri_metni, potansiyel_tasarruf)
    """
    kid    = req.kategori_id
    meta   = KATEGORI_META.get(kid, {})
    grup   = meta.get("grup", "genel")
    tuketim = req.tuketim_degeri
    karbon  = req.karbon_miktari
    seri    = req.gunluk_seri
    alt_ad  = meta.get("alt_ad")
    alt_kat = meta.get("alt_kat")

    # ── Ulaşım Grubu ──────────────────────────────────────────────
    if grup == "ulasim":
        if kid == 1:  # Araba
            tasarruf_kg  = round((0.145 - 0.020) * tuketim, 2)
            tasarruf_yuz = round((0.145 - 0.020) / 0.145 * 100)
            oneri = (
                f"Bugünkü {tuketim:.0f} km'lik araba yolculuğun {karbon:.2f} kg CO₂e üretti. "
                f"Aynı mesafeyi metro ile katsaydın yalnızca {round(0.020 * tuketim, 2):.2f} kg CO₂e "
                f"harcardın — %{tasarruf_yuz} daha az. "
                f"Yarın metro uygulamasını aç ve en yakın durağı bul. (Fogg: Tetikleyici 🚇)"
            )
            potansiyel = f"Haftalık 5 gün dönüşüm → aylık ~{round(tasarruf_kg * 20, 1)} kg CO₂e tasarruf"

        elif kid == 6:  # Uçak
            otobüs_kg = round(0.089 * tuketim, 2)
            tasarruf  = round(karbon - otobüs_kg, 2)
            oneri = (
                f"Bu uçuş için {karbon:.2f} kg CO₂e salındı. "
                f"Aynı güzergah için tren veya otobüs tercih etseydin yalnızca {otobüs_kg:.2f} kg CO₂e "
                f"olurdu — %{round(tasarruf / karbon * 100):.0f} azalma. "
                f"Bir sonraki seyahatin için yerleşik ulaşım seçeneklerini karşılaştır."
            )
            potansiyel = f"Her uçuş yerine kara yolu → {tasarruf:.1f} kg CO₂e tasarruf (bu sefer)"

        elif kid == 5:  # Bisiklet
            oneri = (
                f"Harika! Bisiklet kullanarak {tuketim:.0f} km yolculuk yaptın ve sıfır emisyon ürettin. "
                f"Bu alışkanlığı sürdür; bir hafta boyunca her gün bisiklet kullan ve 14 Günlük Seri rozetine ulaş!"
            )
            potansiyel = "Sıfır emisyon — bu tempoda aylık ~35 kg CO₂e kaçınma"

        else:  # Otobüs, Motosiklet
            alt_kg   = round((alt_kat or 0.020) * tuketim, 2) if alt_kat is not None else 0
            tasarruf = round(karbon - alt_kg, 2) if alt_kg else 0
            oneri = (
                f"{meta['ad']} ile {tuketim:.0f} km yolculuğun {karbon:.2f} kg CO₂e üretti. "
                f"{'Mümkün olduğunda ' + (alt_ad or 'metro') + ' tercih ederek ' + str(tasarruf) + ' kg CO₂e tasarruf edebilirsin.' if tasarruf > 0 else 'Bu zaten çevre dostu bir seçim!'}"
            )
            potansiyel = f"Alternatif araç ile ~{round(tasarruf * 20, 1)} kg CO₂e/ay tasarruf" if tasarruf > 0 else "Mevcut alışkanlıkları koru"

    # ── Enerji Grubu ───────────────────────────────────────────────
    elif grup == "enerji":
        if kid == 7:  # Elektrik
            tasarruf_kwh = round(tuketim * 0.10, 1)  # %10 azaltma hedefi
            oneri = (
                f"{tuketim:.1f} kWh elektrik tüketimin {karbon:.2f} kg CO₂e'ye karşılık geliyor. "
                f"Kullanılmayan cihazları tamamen kapat ve LED ampule geç. "
                f"Bu ay %10 tasarruf hedefle → yaklaşık {tasarruf_kwh:.1f} kWh ve "
                f"{round(tasarruf_kwh * 0.481, 2):.2f} kg CO₂e tasarruf. (Fogg: Tetikleyici 💡)"
            )
            potansiyel = f"Aylık %10 azaltma → ~{round(tasarruf_kwh * 0.481 * 4, 1)} kg CO₂e tasarruf"

        elif kid == 8:  # Doğalgaz
            tasarruf = round(tuketim * 0.07 * 2.040, 2)  # termostat 1°C ↓ = %7
            oneri = (
                f"{tuketim:.1f} m³ doğalgaz {karbon:.2f} kg CO₂e üretti. "
                f"Termostatı 1°C düşürmek ısıtma tüketimini %5-7 azaltır. "
                f"Bu küçük değişiklik ayda ~{tasarruf:.2f} kg CO₂e tasarruf sağlar. (Fogg: Küçük adım)"
            )
            potansiyel = f"Termostat 1°C azaltma → aylık ~{round(tasarruf * 4, 1)} kg CO₂e tasarruf"

        else:  # Kömür
            oneri = (
                f"{tuketim:.1f} kg kömür yakımı {karbon:.2f} kg CO₂e'ye neden oldu — "
                f"bu yüksek emisyonlu bir enerji kaynağı. "
                f"Doğalgaza geçiş bu miktarı %40 azaltır; güneş paneli uzun vadede sıfıra indirir. "
                f"Yerel YEKA (Yenilenebilir Enerji Kaynakları Alanı) desteklerini araştır."
            )
            potansiyel = f"Doğalgaza geçiş → ~{round(karbon * 0.40, 2)} kg CO₂e azalma (bu kullanım)"

    # ── Beslenme Grubu ─────────────────────────────────────────────
    elif grup == "beslenme":
        if kid == 10:  # Kırmızı Et
            tasarruf = round((6.610 - 1.500) * tuketim, 2)
            oneri = (
                f"{tuketim:.0f} porsiyon kırmızı et {karbon:.2f} kg CO₂e üretti. "
                f"Aynı öğünü vejetaryen seçseydın {round(1.500 * tuketim, 2):.2f} kg CO₂e olurdu — "
                f"{tasarruf:.2f} kg tasarruf. "
                f"Haftada 2 öğün 'Sıfır Et Günü' dene! (Fogg: Küçük alışkanlık 🥗)"
            )
            potansiyel = f"Haftada 2 vejetaryen öğün → aylık ~{round(tasarruf * 8, 1)} kg CO₂e tasarruf"

        elif kid == 11:  # Beyaz Et
            tasarruf = round((3.190 - 1.500) * tuketim, 2)
            oneri = (
                f"{tuketim:.0f} porsiyon beyaz et {karbon:.2f} kg CO₂e üretti. "
                f"Haftada 1-2 öğünü vejetaryen ile değiştirerek {round(tasarruf * 4, 1):.1f} kg CO₂e/ay tasarruf edebilirsin."
            )
            potansiyel = f"Haftada 2 öğün vejetaryen → aylık ~{round(tasarruf * 4, 1)} kg CO₂e tasarruf"

        elif kid in (12, 13):  # Vejetaryen / Vegan
            oneri = (
                f"{'Vegan' if kid == 13 else 'Vejetaryen'} beslenme tercihini sürdürüyorsun — bu harika bir karbon kararı! "
                f"{karbon:.2f} kg CO₂e, kırmızı et seçeneğine kıyasla "
                f"~{round((6.610 - (0.900 if kid == 13 else 1.500)) * tuketim, 2):.2f} kg daha az. "
                f"Bu örüntüyü arkadaşlarınla paylaş ve birlikte fark yarat! 🌱"
            )
            potansiyel = "Mevcut sağlıklı beslenme alışkanlıklarını koru ve başkalarına ilham ver"

        else:
            oneri = f"{tuketim:.0f} porsiyon {meta.get('ad','')} {karbon:.2f} kg CO₂e üretti."
            potansiyel = "Bitki bazlı alternatifleri dene"

    # ── Atık Grubu ─────────────────────────────────────────────────
    elif grup == "atik":
        if kid == 14:  # Plastik Şişe
            oneri = (
                f"Bugün {tuketim:.0f} adet tek kullanımlık plastik şişe {karbon:.2f} kg CO₂e üretti. "
                f"Yanına yeniden kullanılabilir paslanmaz çelik matara alarak bu emisyonu tamamen sıfırlayabilirsin. "
                f"Mataranı yarın için hazırla — tek seferlik yatırım, yıllık ~{round(tuketim * 0.083 * 365, 1):.1f} kg CO₂e kaçınma! "
                f"(Fogg: Tetikleyici 🧴→💧)"
            )
            potansiyel = f"Günlük matara kullanımı → yıllık ~{round(tuketim * 0.083 * 365, 1)} kg CO₂e tasarruf"

        elif kid == 17:  # Organik Atık
            oneri = (
                f"{tuketim:.1f} kg organik atık çöpe giderse {karbon:.2f} kg CO₂e sera gazı üretir. "
                f"Kompost kutusu kurarak bu atığı toprağa dönüştür; hem emisyon sıfırla hem de balkon bahçeni gübre. "
                f"Üniversite bahçesinde kompost noktası var mı araştır! (Fogg: Kolay yetenek)"
            )
            potansiyel = f"Kompostlama → {karbon:.2f} kg CO₂e azalma + ücretsiz gübre"

        else:
            geri_don = f"Geri dönüşüm kutusu" if alt_ad else "geri dönüşüm"
            oneri = (
                f"{tuketim:.1f} {meta.get('birim','adet')} {meta.get('ad','')} atığın {karbon:.2f} kg CO₂e üretti. "
                f"{geri_don} kullanarak bu emisyonu minimize edebilirsin. "
                f"En yakın geri dönüşüm noktasını haritada işaretle."
            )
            potansiyel = f"Geri dönüşüm ile ~{round(karbon * 0.7, 2)} kg CO₂e azalma"

    # ── Genel Yedek ────────────────────────────────────────────────
    else:
        oneri = (
            f"{req.kategori_adi} aktiviten {karbon:.2f} kg CO₂e üretti. "
            f"Günlük küçük değişiklikler büyük fark yaratır. "
            f"Bu haftaki en yüksek emisyon kaynağını tespit et ve bir alternatif dene."
        )
        potansiyel = "Aylık ~10-20 kg CO₂e potansiyel tasarruf"

    return oneri, potansiyel


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint'ler
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Monitoring"])
async def health_check():
    """Servis sağlık kontrolü."""
    return {"status": "AI service running", "model_surumu": "v1.0-contextual"}


@app.post("/api/recommend", response_model=RecommendResponse, tags=["AI"])
async def recommend(req: RecommendRequest) -> RecommendResponse:
    """
    Fogg B=MAP tabanlı bağlamsal karbon azaltma önerisi üret.

    - Dinamik etki skoru: tüketim miktarı + kategori ağırlığı + seri bonusu
    - Kişiselleştirilmiş mikrogörev metni: kategoriye özel somut eylem adımı
    """
    etki_skoru = hesapla_etki_skoru(
        karbon_miktari = req.karbon_miktari,
        kategori_id    = req.kategori_id,
        gunluk_seri    = req.gunluk_seri,
    )

    oneri_metni, potansiyel_tasarruf = uret_oneri(req)

    return RecommendResponse(
        oneri_metni         = oneri_metni,
        etki_skoru          = etki_skoru,
        potansiyel_tasarruf = potansiyel_tasarruf,
        model_surumu        = "v1.0-contextual",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Çalıştırma
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
