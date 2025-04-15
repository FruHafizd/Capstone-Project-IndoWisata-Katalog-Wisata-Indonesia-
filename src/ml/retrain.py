import requests
import pandas as pd
import numpy as np
import pickle
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
            row = [visits_data[user_id].get("visits", {}).get(place, 0) for place in all_places]
            visit_matrix_new.append(row)

        visit_df_new = pd.DataFrame(visit_matrix_new, index=user_ids_new, columns=all_places).fillna(0)

        # === Gabungkan visit_df_old dan visit_df_new (overwrite jika ada user sama) ===
        visit_df_combined = visit_df_old.copy()
        visit_df_combined = visit_df_combined.reindex(columns=all_places).fillna(0)
        visit_df_new = visit_df_new.reindex(columns=all_places).fillna(0)
        visit_df_combined.update(visit_df_new)

        # === Cek perubahan data kunjungan ===
        visit_df_old_sorted = visit_df_old.reindex(index=visit_df_combined.index, columns=visit_df_combined.columns).fillna(0)
        visit_df_changed = not visit_df_combined.sort_index(axis=1).equals(visit_df_old_sorted.sort_index(axis=1))

        if visit_df_changed:
            print("➕ Perubahan pada data kunjungan (userVisits) ditemukan:")
            print("Data Kunjungan Lama:\n", visit_df_old_sorted)
            print("Data Kunjungan Baru:\n", visit_df_combined)
        else:
            print("⛔ Tidak ada perubahan signifikan pada data kunjungan (userVisits). Model tidak diretrain.")

        # === Siapkan attribute_df dari /api/users ===
        user_attributes_new = {}
        for user in users_data:
            user_id = user.get("id", "")
            if user_id:
                user_attributes_new[user_id] = {
                    "age": user.get("age", 0),
                    "occupation": user.get("occupation", "Unknown"),
                    "marital_status": user.get("marital_status", "Unknown"),
                    "hobby": user.get("hobby", "Unknown")
                }

        attribute_df_new = pd.DataFrame.from_dict(user_attributes_new, orient='index').fillna('Unknown')
        attribute_df_encoded_new = pd.get_dummies(attribute_df_new)

        # === Samakan struktur dengan attribute_df_old ===
        attribute_df_encoded_new = attribute_df_encoded_new.reindex(columns=attribute_df_old.columns, fill_value=0)
        attribute_df_encoded_old = attribute_df_old.reindex(index=attribute_df_encoded_new.index, fill_value=0)

        # === Cek perubahan data atribut user ===
        attribute_df_changed = not attribute_df_encoded_new.sort_index(axis=1).equals(attribute_df_encoded_old.sort_index(axis=1))

        if attribute_df_changed:
            print("📊 Terdeteksi perubahan pada atribut user.")
        else:
            print("⛔ Tidak ada perubahan pada atribut user (user data). Model tidak diretrain.")

        if not visit_df_changed and not attribute_df_changed:
            print("⛔ Tidak ada data baru yang relevan. Model tidak diretrain.")
            print("=" * 100)
            return

        print("🔄 Melakukan retrain model...")

        # === Final attribute_df (encoded) ===
        attribute_df = attribute_df_encoded_new.sort_index()

        # === Hitung similarity ===
        scaler = StandardScaler()
        scaled_attributes = scaler.fit_transform(attribute_df)
        attribute_similarity = cosine_similarity(scaled_attributes)
        user_similarity = cosine_similarity(visit_df_combined)

        # === Simpan model baru ===
        new_model = {
            "visit_df": visit_df_combined,
            "user_similarity": user_similarity,
            "user_ids": list(visit_df_combined.index),
            "places": all_places,
            "attribute_df": attribute_df,
            "attribute_similarity": attribute_similarity
        }

        with open(model_path, 'wb') as model_file:
            pickle.dump(new_model, model_file)

        print("✅ Model berhasil diperbarui dan disimpan.")
        print("=" * 100)
    except Exception as e:
        print("❌ Terjadi error saat retrain:", e)

# === Loop retrain tiap 5 detik ===
print("🔁 Memulai retrain otomatis setiap 5 detik.")
print("⏹️ Tekan dan tahan tombol 'Delete' untuk menghentikan.\n")

while True:
    print("⏳ Memanggil retrain_model() pada:", time.strftime('%Y-%m-%d %H:%M:%S'))
    retrain_model()
    for _ in range(5):  # 300 detik = 5 menit
        if keyboard.is_pressed("delete"):
            print("\n⛔ Dihentikan oleh pengguna (Delete ditekan).")
            exit()
        time.sleep(1)
