import pandas as pd
import numpy as np

class OneriMotoru:
    def __init__(self, havuz_verisi, model, scaler, features, num_cols):
        self.havuz = havuz_verisi
        self.model = model
        self.scaler = scaler
        self.features = features
        self.num_cols = num_cols

    def _kosul_saglandi_mi(self, user_val, kural):
        if kural["kosul"] == "buyuk":
            return user_val > kural["sinir_deger"]
        elif kural["kosul"] == "kucuk":
            return user_val < kural["sinir_deger"]
        elif kural["kosul"] == "esittir":
            return user_val == kural["sinir_deger"]
        return False

    def _predict_co2(self, user_df):
        df_scaled = user_df.copy()
        df_scaled[self.num_cols] = self.scaler.transform(df_scaled[self.num_cols])
        # TabNet dizisi
        X_input = df_scaled[self.features].values
        return self.model.predict(X_input)[0][0]

    def onerileri_sec_ve_simule_et(self, user_df_raw):
        """
        Kullanıcının 1 satırlık işlenmemiş (ama encode edilmiş) pandas DataFrame'ini alır.
        Kuralları tarar, uygun olanları bulur ve etki büyüklüğünü (CO2 tasarrufu) hesaplar.
        """
        mevcut_tahmin = self._predict_co2(user_df_raw)
        secilen_kurallar = []
        hedef_kontrol_sozlugu = {}

        # 1. Tüm kuralları tara
        for kural in self.havuz:
            sutun = kural["hedef_sutun"]
            if sutun in user_df_raw.columns:
                user_val = user_df_raw.iloc[0][sutun]
                if self._kosul_saglandi_mi(user_val, kural):
                    # 2. Pipeline v4 Kuralı: Aynı sütun için en spesifik olanı (sınır değeri daha sıkı olanı) tut.
                    if sutun not in hedef_kontrol_sozlugu:
                        hedef_kontrol_sozlugu[sutun] = kural
                    else:
                        mevcut_sinir = hedef_kontrol_sozlugu[sutun]["sinir_deger"]
                        yeni_sinir = kural["sinir_deger"]
                        # 'buyuk' koşulunda sınır değeri büyük olan daha spesifiktir (örn >6, >3'ü ezer)
                        if kural["kosul"] == "buyuk" and yeni_sinir > mevcut_sinir:
                            hedef_kontrol_sozlugu[sutun] = kural
                        # 'kucuk' koşulunda sınır değeri küçük olan daha spesifiktir
                        elif kural["kosul"] == "kucuk" and yeni_sinir < mevcut_sinir:
                            hedef_kontrol_sozlugu[sutun] = kural

        # 3. Sadece kazanan (en spesifik) kurallar için simülasyon (What-if) yap
        for sutun, kural in hedef_kontrol_sozlugu.items():
            sim_df = user_df_raw.copy()
            sim_df.at[0, sutun] = kural["simulasyon_hedefi"]
            
            simulasyon_tahmini = self._predict_co2(sim_df)
            tasarruf = mevcut_tahmin - simulasyon_tahmini
            
            sonuc = {
                "recommendation_id": kural["id"],
                "kategori": kural["kategori"],
                "mesaj": kural["mesaj"],
                "simulated_saving_kg_annual": float(tasarruf),
                "simulated_saving_kg_week": float(tasarruf / 52) # Pipeline: yıllık / 52
            }
            secilen_kurallar.append(sonuc)

        # Yüksek tasarruf sağlayana göre sırala
        secilen_kurallar = sorted(secilen_kurallar, key=lambda x: x['simulated_saving_kg_week'], reverse=True)
        return mevcut_tahmin, secilen_kurallar
