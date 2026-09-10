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
| Ordinal kategorik | Energy efficiency, Waste Bag Size, Frequency of Traveling by Air, How Often Shower | Sıralı encode (0/1/2/3) |
| Sayısal | Monthly Grocery Bill, Vehicle Monthly Distance Km, Waste Bag Weekly Count, How Long TV PC Daily Hour, How Many New Clothes Monthly, How Long Internet Daily Hour | StandardScaler (K-Means mesafe tabanlı; ölçeklenmezse büyük sayılı kolon kümelemeye domine eder) |
| Çok bileşenli (bitmask) | Recycling | **DÜZELTME (v3→v4):** Bu sütun binary değil, veride 0-15 arası 16 farklı değer alıyor (kağıt/plastik/cam/metal'in 4 bitlik toplamı olduğu varsayılıyor). K-Means'e vermeden önce 4 ayrı binary alt-özelliğe ayrıştırılacak (`recycles_paper`, `recycles_plastic`, `recycles_glass`, `recycles_metal`); tek bir "0/1" sütunu olarak **kullanılmayacak**, çünkü bu 16 seviyeli bilgiyi 2 seviyeye indirger ve kümelemeyi bozar. Notebook 1'de bitmask çözme fonksiyonu yazılacak ve doğrulanacak. |

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

**Zaman kutusu notu (v3→v4 eklendi):** Veri seti boyutu (~10 bin satır, 19 özellik)
göz önüne alındığında, tablo verisi literatüründeki genel bulgu (Grinsztajn ve ark. 2022
gibi çalışmalar) küçük/orta ölçekli veri setlerinde ağaç tabanlı modellerin (Random Forest)
derin öğrenme tabanlı tablo modellerini (TabNet dahil) genelde geçtiği yönünde. Bu yüzden
TabNet denemesine **1 günlük bir zaman kutusu** konacak: Random Forest'ı MAE/RMSE/R²'de
belirgin farkla geçemezse (örn. ilk denemede yakın çıkarsa), TabNet'te ısrar edilmeyecek
ve Random Forest nihai model olarak kullanılacak. Bu, jüri sunumunda "neden TabNet
kullanmadık" sorusuna da hazır, kanıta dayalı bir cevap sağlar.

---

## 4. Öneri Havuzu — GERÇEK Şema (v3→v4: havuz teslim edildi, bu bölüm tamamen güncellendi)

Bölüm 4'ün eski taslağı (recommendation_id/category/eligible_clusters/min_deviation_score)
**gerçek teslim edilen havuzla uyuşmuyordu** — cluster/deviation_score tabanlı bir seçim
mimarisi varsayıyordu. Gerçek havuz farklı ve daha basit bir mantıkla çalışıyor: her kural
doğrudan tek bir sütuna, bir eşik koşuluna ve bir "simülasyon hedefine" bağlı.

```json
{
  "id": 45,
  "kategori": "🗑️ Atık Yönetimi",
  "hedef_sutun": "Waste Bag Weekly Count",   // TabNet'in eğitim sütun adlarıyla birebir eşleşiyor
  "kosul": "buyuk",                          // "buyuk" | "kucuk" | "esittir"
  "sinir_deger": 6,                          // kosul + sinir_deger => kural tetiklenir mi?
  "simulasyon_hedefi": 5,                    // öneri uygulanırsa bu sütun bu değere çekilip
                                              // TabNet'e tekrar sorulacak (what-if)
  "mesaj": "...",                            // kullanıcıya gösterilecek son mesaj (LLM opsiyonel parlatabilir)
  "not": ""                                  // kategorik kurallarda varsayım notu
}
```

**Bunun mimariye etkileri:**

1. **K-Means cluster'ları ve `deviation_score`, öneri SEÇİMİNDE artık zorunlu girdi değil.**
   Öneri seçimi doğrudan kullanıcının 19 sütunluk anlık verisiyle çalışıyor: her kuralın
   `kosul`+`sinir_deger`'i kontrol edilip tetiklenenler arasından seçim yapılıyor.
   Cluster/deviation_score, öneri seçimine **paralel, tamamlayıcı bir sinyal** olarak
   kalabilir (örn. "aynı öneriyi öneren birden fazla kural varsa, kullanıcının kümesine
   göre önceliklendir") ama artık **zorunlu bir alan değil**.
2. **"Etki büyüklüğü" artık `min_deviation_score` ile değil, TabNet'in what-if farkıyla
   hesaplanıyor:** `sinir_deger` koşulunu sağlayan her kural için, `hedef_sutun` kullanıcının
   satırında `simulasyon_hedefi` ile değiştirilip TabNet'e tekrar sorulacak; `mevcut_tahmin -
   simulasyon_tahmini` farkı, o önerinin somut "X kg CO2 azaltır" etkisini verecek.
3. **Sürekli sütunlarda birden fazla eşik aynı anda tetiklenebilir** (ör. 3000 km/ay kullanan
   biri hem "buyuk 300" hem "buyuk 700" hem "buyuk 1500" kurallarını tetikler). Notebook 6'da
   seçim mantığı, aynı `hedef_sutun` için **sadece en spesifik (en sıkı sağlanan) eşiği**
   seçecek şekilde yazılacak — aksi halde kullanıcıya aynı sütun için tekrarlı öneri gider.
4. LLM'e hâlâ sadece seçilmiş kuralın `id`'si (+ mesajı) verilecek; LLM öneri aramayacak/
   üretmeyecek — bu karar değişmedi.

Havuz `03_recommendation_pool/oneri_havuzu_v1.json` altına bu şemayla konacak.

---

## 5. Mobil ↔ AI API Sözleşmesi (taslak)

Mobil ekiple **erken paylaşılması gereken** kontrat — kesin alan adları Notebook 2'deki
feature listesiyle netleşecek ama yapı şimdiden bu şekilde sabitlenmeli:

**DÜZELTME (v3→v4): aşağıdaki 3 alan hatalıydı, düzeltildi:**
- `vehicle_distance_km_week` → TabNet `Vehicle Monthly Distance Km` üzerinde eğitildi
  (aylık), mobil ise haftalık gönderiyordu. Alan adı `vehicle_distance_km_month` olarak
  değişti; mobil haftalık veriyi kendi tarafında `×4.345` ile aylığa çevirip gönderecek
  (dönüşüm AI tarafında değil, kaynağa en yakın yerde yapılmalı ki hangi sayının "ham",
  hangisinin "türetilmiş" olduğu net kalsın).
- `energy_efficiency: "yes"` → gerçek sütun 3 seviyeli (Düşük/Orta/Yüksek), boolean değil.
  `"low" | "medium" | "high"` olarak değişti.
- `recycling: true` → gerçek sütun binary değil, 4 bileşenli çoklu seçim. Tek boolean yerine
  bir obje olarak değişti: `"recycling": {"paper": true, "plastic": true, "glass": false, "metal": false}`.

```json
// İstek (Mobil → AI)
{
  "user_id": "string",
  "transport": "car",
  "vehicle_type": "petrol",
  "vehicle_distance_km_month": 600,
  "diet": "mixed",
  "monthly_grocery_bill": 300,
  "heating_energy_source": "natural gas",
  "energy_efficiency": "medium",
  "waste_bag_size": "medium",
  "waste_bag_weekly_count": 3,
  "recycling": {"paper": true, "plastic": true, "glass": false, "metal": false},
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
  "recommendation_id": 45,
  "simulated_saving_kg_week": 0.9,
  "message": "Bu hafta işe giderken toplu taşımayı denemeye ne dersin?"
}
```

**Yeni gereklilik (v3→v4 eklendi) — kategori encoding mapping artifact'i:**
Mobilden gelen `"vehicle_type": "petrol"` gibi okunabilir string'lerin, TabNet'in eğitildiği
tam sayı koduna (0/1/2/3...) çevrilmesi gerekiyor. Bu çeviri, kodun içine gömülü/varsayılan
bir sözlük olarak **değil**, Notebook 2'de üretilip `feature_metadata.json` içine
kaydedilen, versiyonlanmış bir mapping olarak tutulacak (örn.
`{"vehicle_type": {"none": 0, "petrol": 1, "diesel": 2, ...}}`). Model her yeniden
eğitildiğinde bu mapping de birlikte güncellenip commit'lenecek — aksi halde eğitim ile
üretim (serving) arasında sessiz bir kayma (skew) riski oluşur.

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
