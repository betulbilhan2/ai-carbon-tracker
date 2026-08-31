# TerkenTech — Yapay Zeka Pipeline'ı: Kesinleşmiş Roadmap (v3)
### (Colab + Paylaşımlı Drive + 2 Kişilik Ekip için)

v2'deki dış eleştiri sonrası netleşen matematiksel tanımlar, terminoloji düzeltmeleri ve
API sözleşmesi taslağıyla güncellenmiş sürüm. Öneri havuzunun gerçek şeması henüz elimizde
olmadığı için Notebook 1 şimdilik başlatılmıyor; havuz şeması geldiğinde bu doküman tekrar
güncellenip kodlamaya geçilecek.

---

## 0. Kesinleşen Mimari Kararlar (Özet Tablo)

| Konu | Karar |
|---|---|
| TabNet'in hedefi | `CarbonEmission` — anket verisinden **"profil özelliklerine dayalı beklenen karbon ayak izi"** tahmini (dikkat: "kişisel baseline" değil — model kullanıcıyı geçmişte gözlemlemiyor, sadece benzer profildeki gözlemlerden genelleme yapıyor) |
| Anlık/günlük hesaplama | ML değil, deterministik formül (lookup tablolar) |
| K-Means'in konumu | TabNet'ten bağımsız, paralel katman |
| Öneri üretimi | Havuzdan seçim (V1: kural tabanlı, V2: bandit) |
| LLM'in rolü | Sadece seçilen öneriyi doğal dile çevirme — öneri seçmez, karbon hesabı yapmaz, cluster belirlemez |
| "Anomali" terimi | **Kullanılmıyor.** Yerine `deviation_score` (beklenenden yüzdesel sapma) — istatistiksel anomali iddiası yapmıyoruz, sadece "müdahale eşiği" tanımlıyoruz |
| Longitudinal tahmin | Kapsam dışı; rapora yumuşatılmış V2 notu olarak yazılacak |

---

## 1. Yeni Netleşen Matematiksel Tanımlar

### `actual_kg` ve `expected_kg` birim uyumu

TabNet'in ürettiği `CarbonEmission` muhtemelen **yıllık toplam** bir değer (veri setindeki
karışık periyotlu girdilerden — aylık market faturası, haftalık atık torbası sayısı vb. —
tek bir yıllık toplama indirgenmiş olması bekleniyor; Notebook 1'de doğrulanacak). Uygulama
ise günlük/haftalık aktivite logluyor. Bu yüzden doğrudan çıkarma **yapılamaz**, birim
uyumsuzluğu olur.

**Kesinleşen formül:**

```
expected_weekly_kg = predicted_annual_kg / 52

actual_weekly_kg   = son 7 günün hesaplama motoru çıktılarının toplamı

deviation_score    = (actual_weekly_kg - expected_weekly_kg) / expected_weekly_kg
```

- Neden haftalık: tek günlük karşılaştırma gürültülü olur (ör. bir günlük uçak yolculuğu
  o günü anlamsız şekilde "yüksek sapma" gösterir).
- Neden oran (fark değil): farklı büyüklükteki profiller arasında karşılaştırılabilir kılar
  (%20 sapma her kullanıcı için aynı anlama gelir, "2 kg fark" gelmez).
- `deviation_score > eşik` → "müdahale noktası" (intervention trigger) tetiklenir; bu bir
  istatistiksel anomali tespiti değil, basit bir eşik kuralıdır — raporda ve kodda böyle
  adlandırılacak.

---

## 2. K-Means — Kesinleşen Feature Seti

Body Type ve Sex **çıkarıldı** (demografik, davranışsal değil — davranış segmentasyonunda
demografiye göre kümelemek hem amaca aykırı hem etik açıdan riskli).

| Tip | Feature'lar | İşlem |
|---|---|---|
| Nominal kategorik | Diet, Transport, Vehicle Type, Heating Energy Source, Cooking_With, Social Activity | One-hot encode |
| Ordinal kategorik | Energy efficiency, Waste Bag Size, Frequency of Traveling by Air | Sıralı encode (Low/Medium/High → 0/1/2) |
| Sayısal | Monthly Grocery Bill, Vehicle Monthly Distance Km, Waste Bag Weekly Count, How Long TV PC Daily Hour, How Many New Clothes Monthly, How Long Internet Daily Hour, How Often Shower | StandardScaler (K-Means mesafe tabanlı; ölçeklenmezse büyük sayılı kolon kümelemeye domine eder) |
| İkili | Recycling | 0/1 |

Küme sayısı elbow/silhouette ile veriden belirlenecek, sabit sayı varsayılmayacak. Küme
etiketleri (ör. "ulaşım-ağırlıklı") **modelin çıktısı değil**, kümeler oluştuktan sonra
profil analiziyle insan tarafından verilen yorumlar olacak — bu ayrım kod yorumlarında
netleştirilecek.

---

## 3. TabNet Gerekçelendirmesi — Düzeltme

Feature importance analizi **"model neye bakıyor"** sorusuna cevap verir, **"TabNet neden
gerekli"** sorusuna değil. Bu ikisi karıştırılmayacak. "Neden TabNet" sorusunun tek geçerli
kanıtı: **baseline karşılaştırmalı performans metriği.**

```
Mean/Median baseline  → MAE = ?
Random Forest         → MAE = ?
TabNet                → MAE = ?
```

Random Forest yeterli bir karşılaştırma noktası; projeyi gereksiz yere XGBoost/LightGBM
gibi ek modellere genişletmeye gerek yok. Feature importance ayrı, tamamlayıcı bir analiz
olarak kalacak (yorumlanabilirlik iddiasını desteklemek için), performans kanıtı yerine
geçmeyecek.

---

## 4. Öneri Havuzu — Beklenen Şema (arkadaşınızdan gelene kadar taslak)

Havuzun gerçek içeriği elimize geçince bu bölüm güncellenecek. Şimdilik AI ekibi olarak
ihtiyaç duyduğumuz minimum alanlar:

```json
{
  "recommendation_id": "R17",
  "category": "transport",          // hesaplama motorunun kategorileriyle eşleşmeli: transport/energy/diet/waste
  "action": "Toplu taşıma kullan",
  "eligible_clusters": [2, 4],       // hangi K-Means kümelerine uygun
  "min_deviation_score": 0.15,       // hangi sapma seviyesinden itibaren tetiklenir
  "priority": "medium"
}
```

Havuz dosyası gelince gerçek alan adları/eksik alanlar buna göre netleştirilecek. LLM'e
sadece `recommendation_id` verilecek, LLM öneri aramayacak/üretmeyecek.

---

## 5. Mobil ↔ AI API Sözleşmesi (taslak)

Mobil ekiple **erken paylaşılması gereken** kontrat — kesin alan adları Notebook 2'deki
feature listesiyle netleşecek ama yapı şimdiden bu şekilde sabitlenmeli:

```json
// İstek (Mobil → AI)
{
  "user_id": "string",
  "transport": "car",
  "vehicle_type": "petrol",
  "vehicle_distance_km_week": 140,
  "diet": "mixed",
  "monthly_grocery_bill": 300,
  "heating_energy_source": "natural gas",
  "energy_efficiency": "yes",
  "waste_bag_size": "medium",
  "waste_bag_weekly_count": 3,
  "recycling": true,
  "air_travel_frequency": "rarely"
}
```

```json
// Yanıt (AI → Mobil)
{
  "actual_weekly_kg": 5.2,
  "expected_weekly_kg": 3.8,
  "deviation_score": 0.37,
  "cluster_id": 2,
  "recommendation_id": "R17",
  "message": "Bu hafta işe giderken toplu taşımayı denemeye ne dersin?"
}
```

---

## 6. Veri Rolleri (değişmedi, referans için)

| Dosya | Rolü |
|---|---|
| `carbon_emission.csv` + `carbon_emission (1).csv` | TabNet eğitim verisi |
| `Food_Production.csv` | Hesaplama motoru — beslenme lookup |
| `MY2022_Fuel_Consumption_Ratings.csv` | Hesaplama motoru — ulaşım lookup |
| `countries.csv` | Dashboard karşılaştırma (ML'e girmiyor) |
| `acorn_details.csv` | V2'de olası segmentasyon referansı (ML'e girmiyor) |
| `Remote Work Impact...` | ML'e girmiyor, literatür desteği olarak kullanılabilir |
| `test.csv` (EV verisi) | Öneri havuzu zenginleştirme (ML'e girmiyor) |

---

## 7. Paylaşımlı Google Drive Klasör Yapısı

```
TerkenTech_SifirAtik/
├── 00_raw_data/
├── 01_processed/
│   ├── tabnet_train.parquet / tabnet_val.parquet / tabnet_test.parquet
│   ├── feature_metadata.json
│   └── lookup_tables/
│       ├── food_emission_lookup.parquet
│       ├── fuel_emission_lookup.parquet
│       └── country_baseline.parquet
├── 02_models/
│   ├── tabnet/  (tabnet_model_v1.zip, tabnet_metrics_v1.json — baseline karşılaştırmalı)
│   └── kmeans/  (kmeans_model_v1.pkl, cluster_profiles_v1.csv)
├── 03_recommendation_pool/
│   └── oneri_havuzu_v1.json   ← arkadaşınızdan gelince buraya
├── 04_outputs/
│   ├── rule_based_recommendations_v1.json
│   └── final_recommendation_output_sample.json
└── 05_docs/
    ├── deney_log.csv
    ├── README.md            (veri sözleşmesi + API kontratı)
    └── config.py
```

---

## 8. Notebook Planı (7 Aşama) — Güncellenmiş İş Bölümü

**Not:** Notebook 4/5/6 de Notebook 1'in çıktısına bağlı olduğu için, iş bölümü sıralı değil
**Notebook 1 bitince paralel** ilerleyecek şekilde düzeltildi.

```
                    Notebook 1 (Veri keşfi/ayrıştırma)
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        Kişi A: 02 → 03              Kişi B: 04 → 05 → 06
     (feature eng. + TabNet)      (hesaplama motoru + kümeleme + öneri seçimi)
                └─────────────┬─────────────┘
                              ▼
                    Notebook 07 (birlikte — LLM + entegrasyon)
```

| # | Notebook | Girdi | İş | Çıktı | Kim |
|---|---|---|---|---|---|
| 1 | `01_veri_kesif_ve_ayirma.ipynb` | 8 CSV | Şema/eksik veri kontrolü, carbon_emission ikilisinin birleştirilmesi, lookup tabloları oluşturma | `tabnet_*.parquet`, `lookup_tables/*` | Ortak (başlangıç) |
| 2 | `02_tabnet_feature_engineering.ipynb` | Notebook 1 çıktısı | Encode/ölçekleme (**sadece train'e fit**), rastgele train/val/test | `feature_metadata.json`, işlenmiş veri | Kişi A |
| 3 | `03_tabnet_egitim_ve_baseline.ipynb` | İşlenmiş veri | Mean/Median → Random Forest → TabNet, MAE/RMSE/R² karşılaştırması, feature importance (ayrı analiz) | `tabnet_model_v1.zip`, karşılaştırmalı metrikler | Kişi A |
| 4 | `04_hesaplama_motoru.ipynb` | Lookup tablolar | Deterministik `actual_weekly_kg` hesaplayıcı, birim testleri | `hesaplama_motoru.py` | Kişi B |
| 5 | `05_kullanici_kumeleme.ipynb` | Notebook 1 çıktısı (Bölüm 2'deki feature seti) | K-Means, elbow/silhouette, küme profillerinin insan yorumuyla etiketlenmesi | `kmeans_model_v1.pkl`, `cluster_profiles_v1.csv` | Kişi B |
| 6 | `06_oneri_secimi_kural_tabanli.ipynb` | Öneri havuzu (**bekleniyor**), cluster + deviation_score | Kural tabanlı seçim mantığı + functional test seti (ör. "transport deviation yüksekse transport önerisi gelmeli mi" kontrolü) | `rule_based_recommendations_v1.json` | Kişi B |
| 7 | `07_llm_mesajlastirma_ve_entegrasyon.ipynb` | Seçilen öneri | LLM mesajlaştırma, uçtan uca test, API çıktı örneği | `final_recommendation_output_sample.json` | Kişi A + B |

**Notebook 6, öneri havuzu gelene kadar başlatılamaz** — Kişi B bu süre zarfında 4 ve 5'i
tamamlayabilir.

---

## 9. Rapora Eklenecek V2 Vizyon Notu (düzeltilmiş)

> "Sistem şu an kesitsel (cross-sectional) anket verisiyle profil özelliklerine dayalı bir
> beklenen karbon ayak izi referansı sunmaktadır. Uygulama canlıya çıkıp kullanıcı bazında
> yeterli boylamsal (longitudinal) veri biriktikten sonra, akıllı sayaç tarzı sürekli veri
> kaynaklarıyla entegre edilerek gerçek zamanlı ardışık tahmine geçiş planlanmaktadır.
> `acorn_details.csv`, V2'de daha ayrıntılı kullanıcı segmentasyonu için olası bir referans
> kaynağı olarak değerlendirilmektedir."

(Önceki taslaktaki "ACORN bu entegrasyona hazırlık amacıyla dahil edilmiştir" ifadesi
kaldırıldı — ACORN'un longitudinal altyapıyla doğrudan bağlantısı olmadığı için jüri önünde
savunulamayan bir iddiaydı.)

---

## 10. Sıradaki Adım

**Notebook 1 şimdilik beklemede** — öneri havuzunun gerçek şeması arkadaşınızdan gelince:
1. Bölüm 4'teki taslak şema gerçek dosyayla karşılaştırılıp netleştirilecek,
2. Bu doküman güncellenecek,
3. Notebook 1'den itibaren kodlamaya başlanacak.

Bu arada Kişi A ve Kişi B, Notebook 1'e bağlı olmayan hazırlıkları şimdiden yapabilir:
`requirements.txt` ve GitHub reposunun kurulması, `config.py`'nin yazılması, Drive klasör
yapısının oluşturulup CSV'lerin yüklenmesi.
