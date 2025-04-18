import os
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.neighbors import NearestNeighbors

# === SET PATH ===
base_path = os.getcwd()  # atau ubah ke path spesifik
users_path = os.path.join(base_path, 'src', 'ml','datasets', 'users.json')
visits_path = os.path.join(base_path, 'src', 'ml', 'datasets', 'visits.json')

# === 1. LOAD DATA JSON ===
with open(users_path, "r") as f:
    user_data = json.load(f)["data"]["users"]

with open(visits_path, "r") as f:
    visit_data = json.load(f)["data"]

# === 2. PREPROCESSING USER FEATURES ===
df_users = pd.DataFrame(user_data)

user_ids = df_users["id"].values
user_names = df_users["name"].values

feature_cols = ["age", "occupation", "marital_status", "hobby"]
df_features = df_users[feature_cols].copy()

encoder = OneHotEncoder(handle_unknown='ignore')
encoded = encoder.fit_transform(df_features[["occupation", "marital_status", "hobby"]]).toarray()

features_matrix = np.hstack([df_features["age"].values.reshape(-1, 1), encoded])

# === 3. FIT KNN MODEL ===
knn = NearestNeighbors(n_neighbors=5, metric="euclidean")
knn.fit(features_matrix)

# Bungkus model dan info penting ke dalam satu dict
model_bundle = {
    "knn": knn,
    "encoder": encoder,
    "user_ids": user_ids,
    "visit_data": visit_data
}

# === 4. FUNGSI REKOMENDASI ===
def recommend_places_for_new_user(new_user, top_k=5):
    new_user_df = pd.DataFrame([new_user])
    new_encoded = encoder.transform(new_user_df[["occupation", "marital_status", "hobby"]]).toarray()
    new_features = np.hstack([new_user_df["age"].values.reshape(-1, 1), new_encoded])
    
    distances, indices = knn.kneighbors(new_features)

    recommended_places = {}
    for idx in indices[0]:
        similar_user_id = user_ids[idx]
        visits = visit_data.get(similar_user_id, {}).get("visits", {})
        for place, count in visits.items():
            recommended_places[place] = recommended_places.get(place, 0) + count

    sorted_places = sorted(recommended_places.items(), key=lambda x: x[1], reverse=True)
    return [place for place, _ in sorted_places[:top_k]]

'''
# === 5. CONTOH PENGGUNAAN ===
new_user_input = {
    "age": 24,
    "occupation": "Lainnya",
    "marital_status": "Belum Menikah",
    "hobby": "bermain catur"
}

recommendations = recommend_places_for_new_user(new_user_input)
print("Rekomendasi wisata untuk user baru:", recommendations)
'''

import os
import joblib

# Buat path ke folder dan file
model_dir = os.path.join("src", "ml")
model_path = os.path.join(model_dir, "modelcf.pkl")

# Pastikan foldernya ada, kalau belum maka buat dulu
os.makedirs(model_dir, exist_ok=True)

# Simpan model
joblib.dump(model_bundle, model_path)
print(f"Model berhasil disimpan di: {model_path}")

