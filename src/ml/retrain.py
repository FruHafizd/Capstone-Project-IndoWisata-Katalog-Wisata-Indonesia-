import requests
import pandas as pd
import numpy as np
import pickle
import json
import os
import time
import keyboard
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

def retrain_model():
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
        with open(model_path, 'rb') as model_file:
            old_model = pickle.load(model_file)

        print("\n✅ Model berhasil dimuat.")

        visit_df_old = old_model["visit_df"]
        user_ids_old = old_model["user_ids"]
        places_old = old_model["places"]
        attribute_df_old = old_model["attribute_df"]

        # === Ambil data baru dari API ===
        visits_response = requests.get("http://localhost:3000/api/userVisits")
        users_response = requests.get("http://localhost:3000/api/users")

        visits_data = visits_response.json()["data"]
        users_data = users_response.json()["data"]["users"]

        # === Buat visit_df dari visits_data ===
        user_ids_new = list(visits_data.keys())
        all_places = set(places_old)

        for user_id, info in visits_data.items():
            all_places.update(info.get("visits", {}).keys())

        all_places = sorted(list(all_places))

        visit_matrix_new = []
        for user_id in user_ids_new:
            row = []
            for place in all_places:
                count = visits_data[user_id].get("visits", {}).get(place, 0)
                row.append(count)
            visit_matrix_new.append(row)

        visit_df_new = pd.DataFrame(visit_matrix_new, index=user_ids_new, columns=all_places).fillna(0)

        # === Samakan bentuk untuk perbandingan ===
        visit_df_old_sorted = visit_df_old.reindex(index=visit_df_new.index, columns=visit_df_new.columns).fillna(0)

        # === Cek apakah ada perubahan ===
        if visit_df_new.equals(visit_df_old_sorted):
            print("⛔ Tidak ada data baru. Model tidak diretrain.")
            return

        print("🔄 Melakukan retrain model karena ada data baru...")

        # Gabungkan data lama dan baru
        user_visits_dict = {}
        for user_id, info in visits_data.items():
            user_visits_dict[user_id] = info.get("visits", {})

        combined_user_ids = set(user_ids_old) | set(user_visits_dict.keys())
        combined_visit_matrix = []
        combined_user_ids_list = []

        for user_id in combined_user_ids:
            row = []
            for place in all_places:
                count_old = visit_df_old.loc[user_id][place] if user_id in visit_df_old.index and place in visit_df_old.columns else 0
                count_new = user_visits_dict.get(user_id, {}).get(place, 0)
                row.append(count_old + count_new)
            combined_visit_matrix.append(row)
            combined_user_ids_list.append(user_id)

        visit_df = pd.DataFrame(combined_visit_matrix, index=combined_user_ids_list, columns=all_places)

        # Siapkan user attributes baru
        user_attributes = {}
        for user_id, row in attribute_df_old.iterrows():
            user_attributes[user_id] = row.to_dict()

        for user in users_data:
            user_id = user.get("id", "")
            if user_id:
                user_attributes[user_id] = {
                    "age": user.get("age", 0),
                    "occupation": user.get("occupation", "Unknown"),
                    "marital_status": user.get("marital_status", "Unknown"),
                    "hobby": user.get("hobby", "Unknown")
                }

        attribute_df = pd.DataFrame.from_dict(user_attributes, orient='index').fillna('Unknown')
        attribute_df = pd.get_dummies(attribute_df)
        scaler = StandardScaler()
        scaled_attributes = scaler.fit_transform(attribute_df)

        # Hitung similarity
        user_similarity = cosine_similarity(visit_df)
        attribute_similarity = cosine_similarity(scaled_attributes)

        new_model = {
            "visit_df": visit_df,
            "user_similarity": user_similarity,
            "user_ids": combined_user_ids_list,
            "places": all_places,
            "attribute_df": attribute_df,
            "attribute_similarity": attribute_similarity
        }

        with open(model_path, 'wb') as model_file:
            pickle.dump(new_model, model_file)

        print("✅ Model berhasil diperbarui dan disimpan.")

    except Exception as e:
        print("❌ Terjadi error saat retrain:", e)

# === Loop retrain tiap 5 menit ===
print("🔁 Memulai retrain otomatis setiap 5 menit.")
print("⏹️ Tekan dan tahan tombol 'Delete' untuk menghentikan.\n")

while True:
    retrain_model()
    for _ in range(300):  # 300 detik = 5 menit
        if keyboard.is_pressed("delete"):
            print("\n⛔ Dihentikan oleh pengguna (Delete ditekan).")
            exit()
        time.sleep(1)
