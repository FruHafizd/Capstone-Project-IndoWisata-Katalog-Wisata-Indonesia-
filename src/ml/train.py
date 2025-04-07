import os
import json
import pickle
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

# Path ke dataset
base_path = os.path.dirname(__file__)
users_path = os.path.join(base_path, 'datasets', 'users.json')
visits_path = os.path.join(base_path, 'datasets', 'visits.json')

# Load data pengguna
with open(users_path, 'r', encoding='utf-8') as file:
    user_data = json.load(file).get("data", {}).get("users", [])

# Load data kunjungan
with open(visits_path, 'r', encoding='utf-8') as file:
    visit_data = json.load(file).get("data", {})

# Konversi data pengguna ke dalam dictionary
user_attributes = {}
for user in user_data:
    user_id = user.get("id", "")
    if user_id:
        user_attributes[user_id] = {
            "age": user.get("age", 0),
            "occupation": user.get("occupation", "Unknown"),
            "hobby": user.get("hobby", "Unknown")
        }

# Konversi data kunjungan ke DataFrame
users = []
places = set()

for user_id, user_info in visit_data.items():
    visits = user_info.get("visits", {})
    for place in visits:
        places.add(place)
    users.append((user_id, user_info.get("name", "Unknown"), visits))

places = sorted(list(places))

# Buat user-item matrix
user_visit_matrix = []
user_ids = []

for user_id, name, visits in users:
    row = [visits.get(place, 0) for place in places]
    user_visit_matrix.append(row)
    user_ids.append(user_id)

visit_df = pd.DataFrame(user_visit_matrix, index=user_ids, columns=places)

# Hitung kemiripan antar pengguna (Collaborative Filtering berdasarkan kunjungan)
if not visit_df.empty:
    user_similarity = cosine_similarity(visit_df)
else:
    user_similarity = np.array([])

# Proses atribut pengguna untuk Content-Based Filtering
attribute_df = pd.DataFrame.from_dict(user_attributes, orient='index').fillna('Unknown')
attribute_df = pd.get_dummies(attribute_df)  # Encode kategori
scaler = StandardScaler()
scaled_attributes = scaler.fit_transform(attribute_df)

# Hitung kemiripan berdasarkan atribut pengguna
if not attribute_df.empty:
    attribute_similarity = cosine_similarity(scaled_attributes)
else:
    attribute_similarity = np.array([])

# Simpan model dalam dictionary
hybrid_model = {
    "visit_df": visit_df,
    "user_similarity": user_similarity,
    "user_ids": user_ids,
    "places": places,
    "attribute_df": attribute_df,
    "attribute_similarity": attribute_similarity
}

# Simpan model ke model.pkl
model_path = os.path.join(base_path, 'model.pkl')
with open(model_path, 'wb') as model_file:
    pickle.dump(hybrid_model, model_file)

print("Model rekomendasi berhasil disimpan sebagai model.pkl")
