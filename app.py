from fastapi import FastAPI, HTTPException
import pandas as pd
import numpy as np
import json
import joblib
import os
import pytorch_tabnet
from pytorch_tabnet.tab_model import TabNetRegressor

import hesaplama_motoru
import oneri_motoru

app = FastAPI(title="TerkenTech Carbon Footprint API")

print("Modeller ve motorlar yükleniyor...")
motor_hesap = hesaplama_motoru.HesaplamaMotoru()

scaler = joblib.load('02_models/tabnet/standard_scaler.pkl')

with open('01_processed/feature_metadata.json', 'r', encoding='utf-8') as f:
    metadata = json.load(f)

features = metadata['model_features']
num_cols = metadata['numerical_columns']
categorical_mapping = metadata['categorical_mapping']

tabnet_model = TabNetRegressor()
tabnet_model.load_model('02_models/tabnet/tabnet_model_v1.zip')

with open('03_recommendation_pool/oneri_havuzu_v1.json', 'r', encoding='utf-8') as f:
    oneri_havuzu = json.load(f)

def encode_request(user_data, categorical_mapping):
    row = {}
    row["Monthly Grocery Bill"] = user_data["monthly_grocery_bill"]
    row["Vehicle Monthly Distance Km"] = user_data["vehicle_distance_km_month"]
    row["Waste Bag Weekly Count"] = user_data["waste_bag_weekly_count"]
    row["How Long TV PC Daily Hour"] = user_data["tv_pc_daily_hour"]
    row["How Many New Clothes Monthly"] = user_data["new_clothes_monthly"]
    row["How Long Internet Daily Hour"] = user_data["internet_daily_hour"]
    row["Diet"] = categorical_mapping["diet"][user_data["diet"]]
    row["How Often Shower"] = categorical_mapping["how_often_shower"][user_data["how_often_shower"]]
    row["Heating Energy Source"] = categorical_mapping["heating_energy_source"][user_data["heating_energy_source"]]
    row["Transport"] = categorical_mapping["transport"][user_data["transport"]]
    row["Vehicle Type"] = categorical_mapping["vehicle_type"][user_data["vehicle_type"]]
    row["Social Activity"] = categorical_mapping["social_activity"][user_data["social_activity"]]
    row["Frequency of Traveling by Air"] = categorical_mapping["frequency_of_traveling_by_air"][user_data["frequency_of_traveling_by_air"]]
    row["Waste Bag Size"] = categorical_mapping["waste_bag_size"][user_data["waste_bag_size"]]
    row["Energy efficiency"] = categorical_mapping["energy_efficiency"][user_data["energy_efficiency"]]
    rec = user_data["recycling"]
    row["Recycling"] = (1 if rec.get("paper") else 0) + (2 if rec.get("plastic") else 0) + (4 if rec.get("glass") else 0) + (8 if rec.get("metal") else 0)
    row["Cooking_With"] = user_data["cooking_with"]
    return row

onerici = oneri_motoru.OneriMotoru(oneri_havuzu, tabnet_model, scaler, features, num_cols)
print("Sistem başarıyla ayağa kalktı! 🚀")

@app.get("/")
def home():
    return {"status": "TerkenTech API aktif ve çalışıyor 🌿"}

@app.post("/api/v1/recommendation")
def get_recommendation(user_data: dict):
    try:
        # 1. Gerçek emisyon hesaplama (Genişletilmiş motor)
        actual_weekly_kg = motor_hesap.calculate_actual_weekly_kg(user_data)

        # 2. Model tahmini ve encode işlemleri
        encoded_row = encode_request(user_data, categorical_mapping)
        test_kullanici = pd.DataFrame([encoded_row])[features]

        mevcut_tahmin, secilen_oneriler = onerici.onerileri_sec_ve_simule_et(test_kullanici)

        print(f"DEBUG - Modelden gelen ham mevcut_tahmin: {mevcut_tahmin}")

        # Ham expected değer (Yıllık tahmini haftalığa çevirme)
        raw_expected = float(mevcut_tahmin / 52) if mevcut_tahmin else 180.0

        # DİNAMİK BEKLENTİ FORMÜLÜ: Yüksek tüketimde tabanı esnetme
        dinamik_taban = 120.0 + max(0.0, (actual_weekly_kg - 200.0) * 0.25)
        expected_weekly_kg = round(max(raw_expected, dinamik_taban), 2)

        # Sapma skoru ve yüzde hesaplaması
        deviation_score = round(actual_weekly_kg - expected_weekly_kg, 2)

        if expected_weekly_kg > 0:
            percentage_deviation = round((abs(deviation_score) / expected_weekly_kg) * 100, 1)
        else:
            percentage_deviation = 0.0

        # 3. Öneri seçimi
        if secilen_oneriler:
            en_iyi_oneri = secilen_oneriler[0]
        else:
            en_iyi_oneri = {
                "recommendation_id": 0,
                "simulated_saving_kg_week": 0.0,
                "mesaj": "Genel karbon azaltım ipuçlarını inceleyebilirsin."
            }

        ham_mesaj = en_iyi_oneri.get("mesaj", "")
        
        if deviation_score > 0:
            parlatilmis_mesaj = f"Hedeflenen ortalamanın üzerindesin (%{percentage_deviation} sapma). İyileştirme önerisi: {ham_mesaj}"
        else:
            parlatilmis_mesaj = f"Harika bir ilerleme kaydediyorsun! 😊 Küçük bir öneri: {ham_mesaj}"

        response = {
            "actual_weekly_kg": float(round(actual_weekly_kg, 2)),
            "expected_weekly_kg": float(expected_weekly_kg),
            "deviation_score": float(deviation_score),
            "cluster_id": 1,
            "recommendation_id": int(en_iyi_oneri.get("recommendation_id", 0)),
            "simulated_saving_kg_week": float(en_iyi_oneri.get("simulated_saving_kg_week", 0.0)),
            "message": str(parlatilmis_mesaj)
        }
        return response

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"İşlem sırasında hata oluştu: {str(e)}")
