# 🌿 EcoTrack: Yapay Zekâ Destekli Bireysel Karbon Ayak İzi ve Karar Destek Platformu
### *TerkenTech Sürdürülebilirlik & Derin Öğrenme Çözümü*

![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![.NET 8](https://img.shields.io/badge/Backend-.NET%208.0%20Web%20API-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Python FastAPI](https://img.shields.io/badge/AI%20Microservice-FastAPI%20%7C%20Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PyTorch TabNet](https://img.shields.io/badge/Deep%20Learning-PyTorch%20TabNet-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Render](https://img.shields.io/badge/Deployment-Render%20Cloud-46E3B7?style=for-the-badge&logo=render&logoColor=white)

---

## 📌 1. Proje Özeti ve Vizyon
Klasik karbon ayak izi uygulamaları çoğunlukla geçmiş tüketimleri pasif biçimde raporlayan statik hesaplayıcılardan ibarettir. **EcoTrack**, yalnızca hesaplama yapan bir araç olmanın ötesine geçerek bireylerin tüketim alışkanlıklarını uzun vadede dönüştürmeyi amaçlayan **yapay zekâ destekli bütünleşik bir karar destek platformudur.**

Sistem; kullanıcının ulaşım, evsel enerji, beslenme ve atık yönetimi verilerini çok boyutlu analiz eder. Kalbinde yer alan **TabNet derin öğrenme modeli**, **K-Means yaşam tarzı kümeleme algoritması**, **davranışsal anormallik tespiti motoru** ve **Fogg Davranış Modeli ($B=MAP$)** temelli mikro öneri sistemiyle kullanıcılara en doğru zamanda, uygulanabilir ve kişiselleştirilmiş hedefler sunar.

---

## 🎯 2. Çözülen Problem: Tutum-Davranış Boşluğu (Attitude-Behavior Gap)
Türkiye İstatistik Kurumu (TÜİK) 2024 verilerine göre Türkiye genelinde oluşan katı atık miktarı **120 milyon tona**, kişi başı günlük belediye atığı **1,09 kg** seviyesine ve yıllık kişi başı sera gazı salımı **6,8 ton $CO_2$e** düzeyine ulaşmıştır. Toplumda iklim krizine yönelik farkındalık yüksek olmasına rağmen, bu durum günlük pratiklere yansımamakta; literatürde **Tutum-Davranış Boşluğu (ABG)** olarak adlandırılan uyumsuzluk katsayısı **0,517** gibi yüksek bir seviyede seyretmektedir.

Bunun temel sebepleri:
1. Sürdürülebilir tercihlerin bireylere getirdiği yüksek zihinsel yük ve zaman maliyeti,
2. Hangi eylemin ne kadarlık bir emisyon tasarrufu sağladığını gösteren dinamik karar destek sistemlerinin eksikliği,
3. Bireyi suçlayıcı veya genel geçer tavsiyelerin eyleme geçme eşiğini aşamamasıdır.

### 🧠 Kuramsal Temel: Fogg Davranış Modeli ($B = MAP$)
Stanford Üniversitesi'nden Dr. B.J. Fogg'un geliştirdiği davranış modeline göre bir davranışın tetiklenmesi için üç unsurun aynı anda kesişmesi gerekir:

$$\text{Davranış (Behavior)} = \text{Motivasyon (Motivation)} \times \text{Yetenek / Kolaylık (Ability)} \times \text{Tetikleyici (Prompt)}$$

EcoTrack, motivasyonun değişken bir faktör olduğu gerçeğinden hareketle **kullanıcının zihinsel yükünü azaltmayı (Ability'yi artırmayı)** hedefler. Geliştirilen yapay zekâ katmanı, kullanıcının en çok emisyon ürettiği alanı (örneğin elektrik veya kırmızı et) tespit ederek tam eşik anında **Bağlamsal Tetikleyiciler (Contextual Prompts)** ve **Motivasyonel Görüşme** ilkelerine dayalı tek adımlık mikro görevler sunar.

---

## ⚙️ 3. Temel Fonksiyonlar ve Sistem Yetenekleri
* **Çok Boyutlu Deterministik Hesaplama Motoru:** IPCC ve ulusal emisyon faktörlerine dayalı katsayılarla ulaşım, enerji, gıda ve atık kategorilerinde sıfır hata payıyla anlık karbon ayak izi hesaplama.
* **TabNet Derin Öğrenme Tabanlı Tahmin:** 17 farklı sosyo-demografik ve tüketim parametresini işleyerek kullanıcının referans karbon ayak izini tahmin eden ardışık dikkat (sequential attention) mimarisi.
* **K-Means Yaşam Tarzı Segmentasyonu:** Kullanıcıları karbon tüketim desenlerine göre kümelere ayıran ve benzer profillerle normatif kıyaslama sunan profil motoru.
* **Zaman Serisi Anormallik Tespiti:** Günlük tüketimlerdeki ani sıçramaları (örneğin aşırı tek kullanımlık plastik veya beklenmedik elektrik tüketimi) dinamik eşik formülleriyle tespit edip arayüzde işaretleyen denetim mekanizması.
* **Akıllı Ay Sonu Projeksiyonu:** Ağırlıklı hareketli ortalama ($WMA$) algoritmalarıyla ay sonu emisyon toplamını ve haftalık bütçe limit aşımını dinamik hesaplayan analitik motor.
* **Kapsam Bazlı Liderlik Tablosu & Oyunlaştırma:** Şehir (örn. Elazığ), üniversite (örn. Fırat Üniversitesi) ve Türkiye geneli filtreleme, Eco-Puan mekanizması ve seri (streak) rozetleri.

---

## 🏗️ 4. Sistem Mimarisi ve Veri Akışı
EcoTrack, kurumsal ölçeklenebilirlik prensiplerine uygun olarak **dağıtık mikroservis ve monorepo mimarisi** üzerinde tasarlanmıştır:

```text
┌─────────────────────────────────────────────────┐
│     React 18 + Vite + Tailwind CSS (SPA UI)     │
│  - Anlık Tüketim Dashboard & Karbon Kotası      │
│  - Tahminsel Analitikler & Anormallik Grafiği   │
│  - Karbon Profilim (17 Parametre Yaşam Tarzı)   │
│  - Kapsamlı Liderlik Tablosu & Rozet Sistemi    │
└───────────────┬─────────────────▲───────────────┘
                │                 │ REST API
                │                 │ JSON Yanıtı
                ▼                 │
┌─────────────────────────────────┴───────────────┐
│            .NET 8.0 Web API Katmanı             │
│  - Güvenli RESTful Endpoint & DTO Yönetimi      │
│  - Supabase Veritabanı CRUD & Auth Köprüsü      │
│  - Deterministik Emisyon Katsayı Motoru         │
└───────────────┬─────────────────▲───────────────┘
                │                 │ Model Girdisi (17)
                │                 │ Tahmin & Kümeler
                ▼                 │
┌─────────────────────────────────┴───────────────┐
│ Python FastAPI AI Mikroservisi (Render Cloud)   │
│ ├── PyTorch TabNet Regressor (Inference)        │
│ ├── Scikit-Learn K-Means Profil Kümeleri        │
│ ├── Anomaly Detection & Weighted Projections    │
│ └── Fogg B=MAP Kural & Dinamik Görev Motoru     │
└─────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │      Supabase PostgreSQL      │
        │  - Kullanıcılar & Aktiviteler │
        │  - Eco-Score & Dinamik Seri   │
        └───────────────────────────────┘
```

---

## 🔬 5. Yapay Zekâ ve Ar-Ge Süreci (Jupyter Pipeline)
Model geliştirme, optimizasyon ve kural havuzu oluşturma süreçleri repoda yer alan Ar-Ge notebook'ları üzerinden yürütülmüştür:

| Dosya | Aşama | Yürütülen Mühendislik Adımları |
|---|---|---|
| **NB01.ipynb** | Keşifçi Veri Analizi (EDA) | Kaggle Personal Carbon Footprint Behavior veri seti temizliği, aykırı değer analizi, dağılım grafikleri. |
| **NB02.ipynb** | Özellik Mühendisliği (Feature Engineering) | 17 değişkenin tespiti, Ordinal/One-Hot kodlama standartları, `01_processed/feature_metadata.json` oluşturulması. |
| **NB03.ipynb** | Model Kıyaslama (Benchmark) | XGBoost, Random Forest ve TabNet modellerinin $R^2$, MAE ve RMSE metrikleri üzerinden kıyaslanması. |
| **NB04.ipynb** | TabNet Derin Öğrenme Eğitimi | PyTorch `TabNetRegressor` eğitimi, sequential attention hiperparametre optimizasyonu, model ağırlıklarının dışa aktarımı. |
| **NB5.ipynb** | K-Means Kümeleme & Öneri Havuzu | Tüketim davranışlarına göre kümeleme analizi, normatif kıyas grupları ve `03_recommendation_pool` kural matrisleri. |

---

## 📂 6. Depo Dosya Hiyerarşisi

```text
ai-carbon-tracker/
├── 01_processed/             # Öznitelik şemaları ve ölçekleyici metaverileri
├── 02_models/                # Eğitilmiş PyTorch TabNet model ağırlıkları (.zip)
├── 03_recommendation_pool/   # Kategori bazlı davranışsal mikro-görev kütüphanesi
├── EcoTrack.AI/              # Yerel Python FastAPI yapay zekâ mikroservisi
│   ├── main.py               # FastAPI uygulama rotaları ve model yükleyici
│   └── requirements.txt      # AI servisi Python kütüphane bağımlılıkları
├── EcoTrack.API/             # .NET 8.0 Web API backend çözümü
│   ├── Controllers/          # RESTful kontrolcüler (Aktiviteler, Profil, Analiz)
│   ├── Models/               # DTO ve veri sözleşmesi sınıfları
│   └── Program.cs            # Uygulama başlangıcı ve servis yapılandırması
├── public/                   # Statik varlıklar ve ikon setleri
├── src/                      # React SPA kaynak kodları
│   ├── components/           # UI kartları, grafikler, bildirimler ve ayarlar
│   ├── context/              # Global state yönetimi (AuthContext, ThemeContext)
│   ├── pages/                # Dashboard, Predictor, Analytics, Leaderboard
│   └── App.jsx               # Ana yönlendirme ve layout omurgası
├── app.py                    # Render bulut sunucusu canlı AI mikroservisi
├── main.py                   # Dinamik ay sonu projeksiyon ve trend motoru
├── hesaplama_motoru.py       # Kategori bazlı deterministik emisyon hesaplama motoru
├── oneri_motoru.py           # Fogg davranış modeli kural tabanlı öneri seçicisi
├── NB01.ipynb - NB5.ipynb    # Uçtan uca veri analitiği ve model eğitim notebook'ları
├── start.bat                 # Tüm servisleri yerelde tek tıkla başlatan betik
└── README.md                 # Proje tanıtım ve teknik dokümantasyon dosyası
```

---

## 🚀 7. Kurulum ve Çalıştırma

### Ön Koşullar
* Node.js (v18.x veya üzeri)
* .NET 8.0 SDK
* Python (3.10 veya 3.11)
* Git

### A) Tek Tıkla Başlatma (Windows)
Depoyu yerel bilgisayarınıza klonladıktan sonra kök dizindeki `start.bat` dosyasını çalıştırmanız yeterlidir. Betik şu servisleri bağımsız pencerelerde eş zamanlı olarak başlatır:
* FastAPI AI Servisi -> `http://localhost:8000`
* .NET 8 API Backend -> `http://localhost:5000`
* React Vite Frontend -> `http://localhost:5173`

```cmd
git clone https://github.com/KULLANICI_ADI/ai-carbon-tracker.git
cd ai-carbon-tracker
start.bat
```

### B) Manuel Kurulum Adımları

#### 1. Yapay Zekâ Mikroservisi:
```bash
cd EcoTrack.AI
python -m venv venv
# Windows için: .\venv\Scripts\activate
# macOS/Linux için: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. .NET 8.0 Backend API:
```bash
cd EcoTrack.API
dotnet restore
dotnet run
```

#### 3. React Frontend:
```bash
npm install
npm run dev
```
Uygulama tarayıcınızda `http://localhost:5173` adresinde hazır hale gelecektir.

---

## 📡 8. Canlı API ve Veri Sözleşmesi (Data Contract)
Canlı ortamda Render üzerinde barındırılan yapay zekâ çıkarım servisi aşağıdaki veri şeması üzerinden iletişim kurar:

**Endpoint:** `POST https://ai-carbon-tracker.onrender.com/predict`

**İstek Gövdesi (Request Body - 17 Parametre):**
```json
{
  "Diet": "omnivore",
  "How_Often_Shower": "daily",
  "Heating_Energy_Source": "natural gas",
  "Transport": "public",
  "Vehicle_Type": "none",
  "Social_Activity": "sometimes",
  "Monthly_Grocery_Bill": 250,
  "Vehicle_Monthly_Distance_Km": 0,
  "Waste_Bag_Size": "medium",
  "Waste_Bag_Weekly_Count": 3,
  "How_Long_TV_PC_Daily_Hour": 4,
  "How_Many_New_Clothes_Monthly": 2,
  "How_Long_Internet_Daily_Hour": 5,
  "Energy_Efficiency": "Yes",
  "Recycling_Metal": "No",
  "Recycling_Paper": "Yes",
  "Recycling_Plastic": "Yes"
}
```

**Model Yanıtı (Response Body):**
```json
{
  "predicted_monthly_co2_kg": 184.6,
  "user_cluster": 2,
  "cluster_name": "Şehirli Orta Segment Tüketici",
  "simulated_saving_kg_week": 8.4,
  "anomaly_threshold_daily_kg": 9.2
}
```

---

## 📈 9. Beklenen Sosyo-Ekonomik ve Ekolojik Etki

| Etki Alanı | Mevcut Durum | EcoTrack Hedefi | Sağlanacak Katkı |
|---|---|---|---|
| **Kişi Başı Günlük Atık** | 1,09 kg | 0,92 kg | Kaynağında %15 atık azaltımı (Kişi başı yıllık ~60 kg önleme). |
| **Hanehalkı Kaynak Tüketimi** | Standart | %10 - %12 Tasarruf | Zamanında dijital dürtmelerle su ve elektrik faturalarında düşüş. |
| **Bireysel Karbon Salımı** | 6,8 ton / yıl | %10 Azalma | Yıllık kişi başı ortalama 680 kg $CO_2$e emisyon engellemesi. |
| **Yerel Yönetim Bütçesi** | 4.614 TL/ton bertaraf | Tasarruf | 10.000 kişilik pilot bölgede yıllık 2.5 - 3 Milyon TL belediye tasarrufu. |

---

## 🔮 10. Gelecek Yol Haritası ve Yaygınlaştırma
* **Akıllı Şehir & Belediye Entegrasyonları (B2G):** Vatandaşların tamamladıkları sıfır atık ve karbon azaltım görevleri karşılığında su faturalarında indirim veya toplu taşıma kartı bakiyesi kazanabileceği belediye API entegrasyonları.
* **Kurumsal Sürdürülebilirlik & CSRD Uyumu (B2B):** Avrupa Birliği Yeşil Mutabakatı ve CSRD standartları gereği şirketlerin ölçmek zorunda olduğu çalışan kaynaklı Kapsam 3 (Scope 3) emisyonlarının anonim toplanıp raporlanabileceği kurumsal SaaS modülü.
* **Bağlamsal Bandit (Contextual Bandit) Adaptasyonu:** Kullanıcıların finansal mı yoksa ekolojik bildirimlere mi daha duyarlı olduğunu zaman içinde pekiştirmeli olarak öğrenen dinamik algoritma geçişi.

---

## 👥 11. Takım Yetkinliği ve Görev Dağılımı
Bu proje, **TerkenTech** ekibi tarafından disiplinler arası bir mühendislik yaklaşımıyla geliştirilmiştir:

* **İrem Tüfekçi (Takım Kaptanı):** Fırat Üniversitesi Yazılım Mühendisliği 3. Sınıf  
  *Sorumluluk Alanları:* Veri setlerinin derlenmesi, veri ön işleme pipeline'ı, makine öğrenmesi ve PyTorch TabNet derin öğrenme modelinin eğitimi, hiperparametre optimizasyonu ve AI modelinin sisteme entegrasyonu.
* **Betül Bilhan:** Fırat Üniversitesi Yazılım Mühendisliği 3. Sınıf  
  *Sorumluluk Alanları:* Sistem analizi ve gereksinimlerin belirlenmesi, kullanıcı deneyimi (UX) ve ekran mimarisi tasarımları, teknik diyagram modellemeleri, veri tabanları tespiti ve makine öğrenmesi eğitim süreçleri.
* **Şuğra Keleş:** Fırat Üniversitesi Yazılım Mühendisliği 2. Sınıf  
  *Sorumluluk Alanları:* Kullanıcı arayüzünün (React 18, Vite, Tailwind CSS) uçtan uca geliştirilmesi, .NET 8.0 Web API ve Supabase canlı veri akış entegrasyonu, literatür taraması ve projenin bilimsel/teknik dayanaklarının sentezlenmesi.

---

## 📄 12. Lisans
Bu proje [MIT Lisansı](LICENSE) kapsamında lisanslanmıştır. Sürdürülebilir ve yaşanabilir bir dünya için açık kaynak olarak geliştirilmektedir.
