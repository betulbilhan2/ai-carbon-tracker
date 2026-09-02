from fastapi import FastAPI
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

tabnet_model = TabNetRegressor()
tabnet_model.load_model('02_models/tabnet/tabnet_model_v1.zip')

with open('03_recommendation_pool/oneri_havuzu_v1.json', 'r', encoding='utf-8') as f:
    oneri_havuzu = json.load(f)

onerici = oneri_motoru.OneriMotoru(oneri_havuzu, tabnet_model, scaler, features, num_cols)
print("Sistem başarıyla ayağa kalktı! 🚀")

@app.get("/")
def home():
    return {"status": "TerkenTech API aktif ve çalışıyor 🌿"}

@app.post("/api/v1/recommendation")
def get_recommendation(user_data: dict):
    actual_weekly_kg = motor_hesap.calculate_actual_weekly_kg(user_data)
    expected_weekly_kg = 180.0
    deviation_score = round(actual_weekly_kg - expected_weekly_kg, 2)
    
    test_kullanici = pd.DataFrame([user_data])
    for col in features:
        if col not in test_kullanici.columns:
            test_kullanici[col] = 0
            
    mevcut_tahmin, secilen_oneriler = onerici.onerileri_sec_ve_simule_et(test_kullanici)
    
    en_iyi_oneri = secilen_oneriler[0] if secilen_oneriler else {
        "recommendation_id": 0,
        "simulated_saving_kg_week": 0.0,
        "mesaj": "Genel karbon azaltım ipuçlarını inceleyebilirsin."
    }
    
    ham_mesaj = en_iyi_oneri.get("mesaj", "")
    parlatilmis_mesaj = f"Harika bir ilerleme kaydediyorsun! 😊 Küçük bir öneri: {ham_mesaj}"
    
    response = {
        "actual_weekly_kg": float(actual_weekly_kg),
        "expected_weekly_kg": float(expected_weekly_kg),
        "deviation_score": float(deviation_score),
        "cluster_id": 1,
        "recommendation_id": int(en_iyi_oneri.get("recommendation_id", 0)),
        "simulated_saving_kg_week": float(en_iyi_oneri.get("simulated_saving_kg_week", 0.0)),
        "message": str(parlatilmis_mesaj)
    }
    
    return response