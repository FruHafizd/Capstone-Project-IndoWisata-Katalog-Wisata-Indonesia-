import json
import pandas as pd
from sklearn.neighbors import NearestNeighbors

# Load data dari visits.json
with open("src/ml/datasets/visits.json", "r") as f:
    raw_data = json.load(f)["data"]

# Ubah ke user-item matrix
data = {}
for user_id, user_info in raw_data.items():
    data[user_id] = user_info["visits"]

df = pd.DataFrame.from_dict(data, orient='index').fillna(0)

# Fit KNN model
knn = NearestNeighbors(metric='cosine', algorithm='brute')
knn.fit(df)

# Fungsi rekomendasi berdasarkan user_id
def recommend_for_new_user(new_user_visits: dict, n_neighbors=3, n_recommendations=5):
    # Buat DataFrame dari user baru
    new_user_df = pd.DataFrame([new_user_visits])

    # Reindex agar kolomnya sama dengan df, isi yang kosong dengan 0
    new_user_df = new_user_df.reindex(columns=df.columns, fill_value=0)

    # Cari user terdekat
    distances, indices = knn.kneighbors(new_user_df, n_neighbors=n_neighbors)

    visited_places = set(new_user_visits.keys())
    recommendation_scores = {}

    for user in [df.index[i] for i in indices[0]]:
        for place, count in df.loc[user].items():
            if place not in visited_places and count > 0:
                recommendation_scores[place] = recommendation_scores.get(place, 0) + count

    sorted_recommendations = sorted(recommendation_scores.items(), key=lambda x: x[1], reverse=True)
    return [place for place, _ in sorted_recommendations[:n_recommendations]]

'''
# Contoh penggunaan
new_user = {
    "Depot Dunia Kuliner": 2,
    "Pucak Teaching Farm": 5,
    "Air Terjun Curug Sawer sukabumi": 3
}

recs = recommend_for_new_user(new_user)
print("Rekomendasi untuk user baru:", recs)
'''

import joblib

# Simpan KNN model dan user-item matrix (df) sekaligus
joblib.dump((knn, df), "src/ml/modelbcf.pkl")
